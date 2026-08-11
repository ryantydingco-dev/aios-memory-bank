#!/usr/bin/env python3
import json, re, os, sys, urllib.request, urllib.error, urllib.parse, ssl, threading, queue, html

D = os.path.dirname(os.path.abspath(__file__))
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE

SIG = [
    (re.compile(r"https?://([a-z0-9][a-z0-9\-]*)\.mapyourshow\.com[^\"'\s<>]*", re.I), "mapyourshow"),
    (re.compile(r"https?://([a-z0-9][a-z0-9\-]*)\.smallworldlabs\.com[^\"'\s<>]*", re.I), "smallworldlabs"),
    (re.compile(r"https?://[^\"'\s<>]*a2zinc\.net[^\"'\s<>]*", re.I), "a2z"),
    (re.compile(r"https?://[^\"'\s<>]*expocad[^\"'\s<>]*", re.I), "expocad"),
    (re.compile(r"https?://[^\"'\s<>]*\.map(your)?show[^\"'\s<>]*", re.I), "mapyourshow"),
]
EXH_LINK = re.compile(r"""<a[^>]+href=["']([^"'#]+)["'][^>]*>(.{0,120}?)</a>""", re.I | re.S)
EXH_TXT = re.compile(r"(?i)(exhibitor list|exhibitor directory|exhibitor search|list of exhibitors|"
                     r"who.s exhibiting|exhibiting companies|browse exhibitors|floor ?plan|"
                     r"interactive (floor ?plan|map)|exhibitor gallery|search exhibitors|find exhibitors|exhibitors)")
EXH_HREF = re.compile(r"(?i)(exhibitor[-_a-z0-9]*list|exhibitor[-_a-z0-9]*director|exhibitor[-_a-z0-9]*search|"
                      r"exhibitor[-_a-z0-9]*gallery|/exhibitors?/?$|/exhibitors?[-/]|floorplan|floor-plan|"
                      r"who-is-exhibiting|exhibiting-companies)")

def fetch(url, timeout=14):
    try:
        r = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9",
                                                 "Accept": "text/html,application/xhtml+xml"})
        with urllib.request.urlopen(r, timeout=timeout, context=CTX) as f:
            return f.geturl(), f.read(700000).decode("utf-8", "replace"), f.status
    except urllib.error.HTTPError as e:
        try: body = e.read(300000).decode("utf-8", "replace")
        except Exception: body = ""
        return url, body, e.code
    except Exception:
        return url, "", 0

def detect(h):
    for rx, name in SIG:
        m = rx.search(h)
        if m:
            return name, m.group(0)
    return "", ""

def probe(site):
    if not site:
        return {"platform": "unknown", "directory_url": "", "official": ""}
    base = site if site.startswith("http") else "https://" + site
    url, h, code = fetch(base)
    if not h:
        url2, h, code = fetch(base.replace("https://", "http://"))
        if h: url = url2
    official = url if h else base
    if not h:
        return {"platform": "unknown", "directory_url": "", "official": base}
    plat, hit = detect(h)
    if plat:
        return {"platform": plat, "directory_url": html.unescape(hit), "official": official}
    # find candidate exhibitor-directory link
    cands = []
    for m in EXH_LINK.finditer(h):
        href, label = m.group(1), re.sub(r"<[^>]+>", " ", m.group(2))
        score = 0
        if EXH_TXT.search(label): score += 2
        if EXH_HREF.search(href): score += 3
        if re.search(r"(?i)exhibitor", href): score += 1
        if score >= 3:
            cands.append((score, urllib.parse.urljoin(url, html.unescape(href))))
    cands.sort(reverse=True)
    seen = set(); ordered = []
    for sc, u in cands:
        if u in seen: continue
        seen.add(u); ordered.append(u)
    for u in ordered[:2]:
        u2, h2, c2 = fetch(u)
        if not h2:
            continue
        p2, hit2 = detect(h2)
        if p2:
            return {"platform": p2, "directory_url": html.unescape(hit2), "official": official}
        if c2 == 200:
            low = h2.lower()
            if re.search(r"(?i)(login|sign in to view|members only)", low[:4000]) and "exhibitor" not in low[:2000]:
                return {"platform": "locked", "directory_url": u2, "official": official}
            return {"platform": "custom", "directory_url": u2, "official": official}
    if code in (403, 503) or "cf-browser-verification" in h or "cloudflare" in h.lower()[:6000]:
        return {"platform": "locked", "directory_url": "", "official": official}
    return {"platform": "unknown", "directory_url": "", "official": official}

def main():
    rows = json.load(open(os.path.join(D, "merged.json")))
    outp = os.path.join(D, "probed.jsonl")
    done = set()
    if os.path.exists(outp):
        for l in open(outp):
            try: done.add(json.loads(l)["key"])
            except Exception: pass
    todo = [r for r in rows if (r["name"] + "|" + r["start"]) not in done]
    print("todo", len(todo), "done", len(done), flush=True)
    q = queue.Queue()
    for r in todo: q.put(r)
    lock = threading.Lock()
    fh = open(outp, "a")
    cnt = [0]
    def worker():
        while True:
            try: r = q.get_nowait()
            except queue.Empty: return
            try: res = probe(r["site"])
            except Exception: res = {"platform": "unknown", "directory_url": "", "official": ""}
            o = dict(r); o.update(res); o["key"] = r["name"] + "|" + r["start"]
            with lock:
                fh.write(json.dumps(o) + "\n"); fh.flush()
                cnt[0] += 1
                if cnt[0] % 50 == 0:
                    print(cnt[0], "/", len(todo), flush=True)
            q.task_done()
    ths = [threading.Thread(target=worker, daemon=True) for _ in range(20)]
    [t.start() for t in ths]
    [t.join() for t in ths]
    fh.close()
    print("DONE", cnt[0])

if __name__ == "__main__":
    main()
