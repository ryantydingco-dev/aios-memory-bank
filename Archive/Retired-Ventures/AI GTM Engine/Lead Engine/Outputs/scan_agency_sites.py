#!/usr/bin/env python3
"""
Website buying-signal scanner for the agency Smartlead list (Hermes v2 spec, Tier 2/3 signals).
Fetches each lead's site (homepage, up to ~250KB), extracts AR-relevant signals + a short
evidence snippet per signal. Outputs agency_site_signals_2026-06-09.csv keyed by company.
"""
import csv, re, ssl, sys, time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

SRC = "agencies_SMARTLEAD_2026-06-09.csv"
OUT = "agency_site_signals_2026-06-09.csv"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

# signal -> (regex, weight)  [Hermes v2: tiered, evidence-cited]
SIGNALS = {
    "PAID_MEDIA":        (re.compile(r"\b(paid media|media buying|ppc|paid search|paid social|ad spend|google ads|meta ads|programmatic)\b"), 3),
    "RETAINER":          (re.compile(r"\b(retainer|monthly retainers?|ongoing partnership|monthly plans?|subscription)\b"), 2),
    "ENTERPRISE_CLIENTS":(re.compile(r"\b(fortune ?(500|100|1000)|enterprise client|national brands?|franchise|b2b clients)\b"), 2),
    "HIRING":            (re.compile(r"\b(we'?re hiring|join (our|the) team|careers?|open positions?|now hiring)\b"), 2),
    "NET_TERMS":         (re.compile(r"\b(net ?30|net ?60|payment terms|invoice)\b"), 3),
    "PROJECT_HIGH_TICKET":(re.compile(r"\b(case stud(y|ies)|six.figure|enterprise project|rfp)\b"), 1),
    "ESTABLISHED":       (re.compile(r"\b(since (19[7-9]\d|200\d|201[0-5])|founded in (19[7-9]\d|200\d|201[0-5])|\d{2}\+? years)\b"), 1),
    "VIDEO_PRODUCTION":  (re.compile(r"\b(video production|commercial production|post.production)\b"), 1),
}
TAG = re.compile(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>")

def fetch(url):
    if not url:
        return None
    if not url.startswith("http"):
        url = "https://" + url
    for attempt in (url, url.replace("https://", "https://www.", 1)):
        try:
            req = urllib.request.Request(attempt, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=8, context=CTX) as r:
                raw = r.read(250_000)
            return raw.decode("utf-8", errors="replace")
        except Exception:
            continue
    return None

def scan(row):
    site = (row.get("website") or "").strip()
    html = fetch(site)
    out = {"company": row.get("company",""), "website": site, "fetch_ok": bool(html),
           "signals": "", "signal_score": 0, "evidence": ""}
    if not html:
        return out
    text = TAG.sub(" ", html)
    text = re.sub(r"\s+", " ", text).lower()
    hits, score, ev = [], 0, []
    for name, (rx, w) in SIGNALS.items():
        m = rx.search(text)
        if m:
            hits.append(name); score += w
            s = max(0, m.start() - 40)
            snippet = text[s:m.end() + 50].strip()
            ev.append(f"{name}: …{snippet}…")
    out["signals"] = ";".join(hits)
    out["signal_score"] = score
    out["evidence"] = " | ".join(ev[:4])[:600]
    return out

def main():
    with open(SRC, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    print(f"scanning {len(rows)} sites…", flush=True)
    results, done = [], 0
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=30) as ex:
        futs = {ex.submit(scan, r): r for r in rows}
        for fut in as_completed(futs):
            results.append(fut.result())
            done += 1
            if done % 200 == 0:
                print(f"  {done}/{len(rows)} ({time.time()-t0:.0f}s)", flush=True)
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["company","website","fetch_ok","signals","signal_score","evidence"])
        w.writeheader(); w.writerows(results)
    ok = sum(1 for x in results if x["fetch_ok"])
    sig = sum(1 for x in results if x["signals"])
    print(f"done in {time.time()-t0:.0f}s -> {OUT}")
    print(f"fetched: {ok}/{len(results)}   with >=1 signal: {sig}")

if __name__ == "__main__":
    main()
