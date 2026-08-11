#!/usr/bin/env python3
import re, json, sys, time, urllib.request, urllib.error, html, os
from datetime import date

BASE = "https://www.tradefairdates.com"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
D = os.path.dirname(os.path.abspath(__file__))
LO, HI = date(2026, 11, 1), date(2027, 6, 30)

MONTHS = {m.lower(): i+1 for i, m in enumerate(
    ["January","February","March","April","May","June","July","August","September","October","November","December"])}

def get(url, tries=3):
    for t in range(tries):
        try:
            r = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
            return urllib.request.urlopen(r, timeout=30).read().decode("utf-8", "replace")
        except Exception as e:
            if t == tries-1:
                return ""
            time.sleep(1.5)
    return ""

def parse_dates(s):
    """'20. - 23. August 2026' | '30. November 2026 - 02. December 2026' | '05. March 2027'"""
    s = re.sub(r"\s+", " ", s).strip()
    years = re.findall(r"\b(20\d\d)\b", s)
    if not years:
        return None
    # tokens: day. Month year
    parts = re.split(r"\s*-\s*", s)
    first = parts[0]
    dm = re.search(r"(\d{1,2})\.", first)
    if not dm:
        return None
    day = int(dm.group(1))
    mo = re.search(r"([A-Za-z]+)", first)
    if mo and mo.group(1).lower() in MONTHS:
        month = MONTHS[mo.group(1).lower()]
    else:
        # month lives in the second part
        mo2 = re.search(r"([A-Za-z]+)", parts[-1]) if len(parts) > 1 else None
        if not mo2 or mo2.group(1).lower() not in MONTHS:
            return None
        month = MONTHS[mo2.group(1).lower()]
    yr = re.search(r"\b(20\d\d)\b", first)
    year = int(yr.group(1)) if yr else int(years[-1])
    try:
        return date(year, month, day)
    except ValueError:
        return None

TILE = re.compile(r'<div class="messeninfoTile.*?(?=<div class="messeninfoTile|<div id="paginationContainer|</body)', re.S)

def strip(t):
    return html.unescape(re.sub(r"<[^>]+>", " ", t or "")).strip()

def parse_page(h):
    out = []
    for m in TILE.finditer(h):
        t = m.group(0)
        tm = re.search(r'<div class="time">(.*?)</div>', t, re.S)
        nm = re.search(r'class="title">(.*?)</a>', t, re.S)
        lk = re.search(r'href="(/[^"]*-M\d+/[^"]*)"', t)
        ct = re.search(r'class="messeTerminOrt">(.*?)</span>', t, re.S)
        ld = re.search(r'class="messeTerminLand">(.*?)</span>', t, re.S)
        vn = re.search(r'class="messeTerminZentrum">(.*?)</span>', t, re.S)
        ds = re.search(r'<div class="description">(.*?)</div>', t, re.S)
        sec = re.search(r'class="moodPicture tilebg"', t)
        secalt = re.search(r'alt="([^"]*)"\s+class="moodPicture', t)
        zt = re.search(r'class="zutritt">(.*?)</p>', t, re.S)
        if not (tm and nm):
            continue
        d = parse_dates(strip(tm.group(1)))
        if not d:
            continue
        land = strip(ld.group(1)) if ld else ""
        if "USA" not in land.upper():
            continue
        out.append({
            "name": strip(nm.group(1)),
            "start": d.isoformat(),
            "city": strip(ct.group(1)) if ct else "",
            "venue": strip(vn.group(1)) if vn else "",
            "industry": strip(secalt.group(1)) if secalt else "",
            "desc": strip(ds.group(1)) if ds else "",
            "access": strip(zt.group(1)) if zt else "",
            "tfd": BASE + lk.group(1) if lk else "",
        })
    return out

def main():
    urls = [l.strip() for l in open(os.path.join(D, "tfd_us_city_urls.txt")) if l.strip()]
    seen = {}
    outf = os.path.join(D, "tfd_raw.jsonl")
    fh = open(outf, "a")
    for i, u in enumerate(urls):
        stem = u.replace("-S1-", "-S{}-")
        empties = 0
        for pg in range(1, 12):
            h = get(BASE + stem.format(pg))
            if not h:
                break
            evs = parse_page(h)
            if not evs:
                empties += 1
                if empties >= 2:
                    break
                continue
            empties = 0
            maxd = max(e["start"] for e in evs)
            for e in evs:
                d = date.fromisoformat(e["start"])
                if LO <= d <= HI:
                    k = (e["name"].lower(), e["start"])
                    if k not in seen:
                        seen[k] = e
                        fh.write(json.dumps(e) + "\n")
            fh.flush()
            if maxd > HI.isoformat():
                break
        print(f"[{i+1}/{len(urls)}] {u.split('-X')[0]} -> total {len(seen)}", flush=True)
    fh.close()
    print("DONE", len(seen))

if __name__ == "__main__":
    main()
