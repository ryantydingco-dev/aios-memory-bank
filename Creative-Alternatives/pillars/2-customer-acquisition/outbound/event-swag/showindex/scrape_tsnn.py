#!/usr/bin/env python3
import re, json, os, html, urllib.parse
import scrape_tfd as s
from datetime import date

D = os.path.dirname(os.path.abspath(__file__))
B = "https://thetradeshowcalendar.com/tsnn/index.php"
MON = {m: i+1 for i, m in enumerate(["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"])}
ROW = re.compile(r"<tr class=\"(?:odd|even) row\">(.*?)</tr>", re.S)

def txt(x):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x or ""))).strip()

def parse(h):
    out = []
    for m in ROW.finditer(re.sub(r"\s+", " ", h)):
        r = m.group(1)
        nm = re.search(r"class='r-Name'>.*?<a href='([^']*)'[^>]*>(.*?)</a>", r)
        if not nm:
            nm2 = re.search(r"class='r-Name'><div class='r-content'>(.*?)</div>", r)
            if not nm2: continue
            url, name = "", txt(nm2.group(1))
        else:
            url, name = nm.group(1), txt(nm.group(2))
        dt = re.search(r"class='r-Dates'><div class='r-content'>(.*?)</div>", r)
        loc = re.search(r"class='r-VenLoc'><div class='r-content'>(.*?)</div>", r)
        ae = re.search(r"class='r-AttExhNSF'><div class='r-content'>(.*?)(?:</td>|</div>)", r)
        if not (dt and loc): continue
        ds = re.findall(r"([A-Z]{3})/(\d{1,2})/(\d{4})", dt.group(1))
        if not ds: continue
        mo, dd, yy = ds[0]
        try: start = date(int(yy), MON[mo], int(dd))
        except Exception: continue
        L = txt(loc.group(1))
        if "United States" not in L: continue
        pieces = [p.strip() for p in L.split(",")]
        city = pieces[0] if pieces else ""
        st = pieces[1] if len(pieces) > 2 else ""
        exh = ""
        if ae:
            em = re.search(r"Exhibitors:\s*([\d,]+)", txt(ae.group(1)))
            if em: exh = em.group(1).replace(",", "")
        out.append({"name": name, "start": start.isoformat(), "city": city, "state": st,
                    "site": re.sub(r"^https?://", "", url).strip("/"), "exh": exh, "src": "tsnn"})
    return out

def main():
    seen = {}
    fh = open(os.path.join(D, "tsnn_raw.jsonl"), "w")
    for yr, mo in [(2026,11),(2026,12),(2027,1),(2027,2),(2027,3),(2027,4),(2027,5),(2027,6)]:
        pos = 0
        while True:
            q = {"BNR":"","vShow":"search","vSort":"du","vPos":str(pos),"vRpP":"30","vOrg":"",
                 "vMo":str(mo),"vCity":"","vState":"","vCtry":"United States","vRgn":"","vInd":"",
                 "vYr":str(yr),"vAtt":"","vExh":"","vNSF":""}
            h = s.get(B + "?" + urllib.parse.urlencode(q))
            rows = parse(h)
            n = 0
            for e in rows:
                d = date.fromisoformat(e["start"])
                if not (s.LO <= d <= s.HI): continue
                k = (e["name"].lower(), e["start"])
                if k in seen: continue
                seen[k] = e; fh.write(json.dumps(e)+"\n"); n += 1
            fh.flush()
            print(yr, mo, "pos", pos, "rows", len(rows), "new", n, "tot", len(seen), flush=True)
            if len(rows) < 30: break
            pos += 30
            if pos > 900: break
    fh.close()
    print("DONE", len(seen))

if __name__ == "__main__":
    main()
