#!/usr/bin/env python3
import json, re, os, urllib.parse, threading, queue, html
import probe as P

D = os.path.dirname(os.path.abspath(__file__))
PATHS = ["/exhibitor-list", "/exhibitors", "/exhibitor-directory", "/exhibitors/exhibitor-list",
         "/floor-plan", "/exhibit/exhibitor-list", "/attend/exhibitor-list", "/exhibitor-search",
         "/en/exhibitors.html", "/exhibitors.html", "/exhibitor-list.html", "/who-is-exhibiting",
         "/expo/exhibitor-list", "/exhibit-hall", "/exhibitors/directory"]

NEG = re.compile(r"(?i)(page not found|404 error|<title>[^<]*404)")

def slug(site, name):
    s = re.sub(r"^https?://", "", site).split("/")[0]
    s = re.sub(r"^www\.", "", s).split(".")[0]
    return re.sub(r"[^a-z0-9]", "", s.lower())

def second(rec):
    site = rec["official"] or rec["site"]
    if not site:
        return None
    if not site.startswith("http"):
        site = "https://" + site
    pr = urllib.parse.urlparse(site)
    root = f"{pr.scheme}://{pr.netloc}"
    # 1. mapyourshow subdomain guess
    sg = slug(site, rec["name"])
    if sg and len(sg) >= 3:
        for host in (f"https://{sg}.mapyourshow.com/8_0/explore/exhibitor-gallery.cfm",):
            u, h, c = P.fetch(host, timeout=10)
            if h and c == 200 and "mapyourshow" in u:
                return {"platform": "mapyourshow", "directory_url": u}
    # 2. path guesses on own domain
    bases = [root]
    if pr.path and pr.path not in ("/", ""):
        bases.insert(0, root + pr.path.rstrip("/"))
    for b in bases:
        for p in PATHS:
            u, h, c = P.fetch(b + p, timeout=10)
            if not h or c != 200:
                continue
            if NEG.search(h[:4000]):
                continue
            plat, hit = P.detect(h)
            if plat:
                return {"platform": plat, "directory_url": html.unescape(hit)}
            if re.search(r"(?i)exhibitor", h):
                return {"platform": "custom", "directory_url": u}
    return None

def main():
    rows = [json.loads(l) for l in open(os.path.join(D, "probed.jsonl"))]
    todo = [r for r in rows if r["platform"] in ("unknown",) or (r["platform"] == "locked" and not r["directory_url"])]
    print("todo", len(todo), flush=True)
    q = queue.Queue()
    for r in todo: q.put(r)
    res = {}
    lock = threading.Lock(); cnt = [0]
    def worker():
        while True:
            try: r = q.get_nowait()
            except queue.Empty: return
            try: out = second(r)
            except Exception: out = None
            with lock:
                cnt[0] += 1
                if out: res[r["key"]] = out
                if cnt[0] % 40 == 0: print(cnt[0], "/", len(todo), "hits", len(res), flush=True)
    ths = [threading.Thread(target=worker, daemon=True) for _ in range(24)]
    [t.start() for t in ths]; [t.join() for t in ths]
    for r in rows:
        if r["key"] in res:
            r.update(res[r["key"]])
    with open(os.path.join(D, "probed.jsonl"), "w") as f:
        for r in rows: f.write(json.dumps(r) + "\n")
    print("upgraded", len(res))

if __name__ == "__main__":
    main()
