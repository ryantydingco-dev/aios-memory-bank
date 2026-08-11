"""
Icahn Muse Finder — pulls REAL YouTube stats via Apify and applies the Icahn filter.

The Icahn filter (from the CGE Video Idea Finder skill):
  - video views >= 100,000
  - channel subs  < 100,000
  - views:subs ratio >= 5:1
  - long-form (Shorts removed)
  - (packaging quality = filter #4 — judged by eye, not here)

Finds proven, low-risk video IDEAS a brand-new channel can model. Every number
comes straight from YouTube via Apify — nothing is invented.

Usage:
  python3 scripts/icahn_muse_finder.py                 # default keyword set
  python3 scripts/icahn_muse_finder.py "keyword one" "keyword two"
"""

import json, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = ROOT / ".env"
OUT_MD = ROOT / "pillars" / "4-youtube-build" / "muse-candidates.md"
RAW = ROOT / "data" / "muse_scrape_raw.json"

# --- Icahn filter thresholds ---
MIN_VIEWS = 100_000
MAX_SUBS = 100_000
MIN_RATIO = 5.0
MIN_DURATION_SEC = 180      # removes Shorts; long-form-ish
PER_CHANNEL_CAP = 2

ACTOR = "streamers~youtube-scraper"
MAX_RESULTS = 30

DEFAULT_KEYWORDS = [
    "I let AI run my business",
    "I automated my business with AI",
    "using AI in my small business",
    "AI automation agency",
    "I built a business with AI",
    "took over my family business",
    "I replaced my employees with AI",
]


def get_token():
    for line in ENV.read_text().splitlines():
        if line.startswith("APIFY_API_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("APIFY_API_TOKEN not found in .env")


def scrape(keyword, token):
    url = (f"https://api.apify.com/v2/acts/{ACTOR}/run-sync-get-dataset-items"
           f"?token={token}&format=json")
    body = json.dumps({
        "searchKeywords": keyword,
        "maxResults": MAX_RESULTS,
        "maxResultsShorts": 0,
        "maxResultStreams": 0,
    }).encode()
    req = urllib.request.Request(url, data=body,
                                headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)


def dur_to_sec(d):
    parts = [int(x) for x in str(d or "").split(":") if x.strip().isdigit()]
    if len(parts) == 3: return parts[0]*3600 + parts[1]*60 + parts[2]
    if len(parts) == 2: return parts[0]*60 + parts[1]
    if len(parts) == 1: return parts[0]
    return 0


def to_int(x):
    try: return int(x)
    except (TypeError, ValueError): return 0


def main():
    kws = sys.argv[1:] or DEFAULT_KEYWORDS
    token = get_token()
    all_items, raw = {}, []

    for kw in kws:
        print(f"  scraping: {kw!r} ...", flush=True)
        try:
            items = scrape(kw, token)
        except Exception as e:
            print(f"    ! failed: {e}", flush=True)
            continue
        if not isinstance(items, list):
            print(f"    ! unexpected response: {str(items)[:200]}", flush=True)
            continue
        print(f"    got {len(items)} results", flush=True)
        for it in items:
            vid = it.get("id")
            if vid and vid not in all_items:
                it["_kw"] = kw
                all_items[vid] = it
        raw.extend(items)

    RAW.parent.mkdir(parents=True, exist_ok=True)
    RAW.write_text(json.dumps(raw, indent=2))

    recs = []
    for it in all_items.values():
        subs = to_int(it.get("numberOfSubscribers"))
        if subs <= 0:
            continue
        views = to_int(it.get("viewCount"))
        recs.append({
            "title": it.get("title", ""),
            "channel": it.get("channelName", ""),
            "subs": subs, "views": views, "ratio": views / subs,
            "dur": dur_to_sec(it.get("duration")),
            "url": it.get("url", ""), "date": (it.get("date") or "")[:10],
            "kw": it.get("_kw", ""),
        })

    def passes(r):
        return (r["views"] >= MIN_VIEWS and 0 < r["subs"] < MAX_SUBS
                and r["ratio"] >= MIN_RATIO and r["dur"] >= MIN_DURATION_SEC)

    winners = [r for r in recs if passes(r)]
    near = [r for r in recs if not passes(r) and r["dur"] >= MIN_DURATION_SEC
            and r["views"] >= 150_000 and r["ratio"] >= 2.5 and r["subs"] < 400_000]

    winners.sort(key=lambda r: (r["ratio"], r["views"]), reverse=True)
    near.sort(key=lambda r: (r["ratio"], r["views"]), reverse=True)

    def cap(rows):
        seen, out = {}, []
        for r in rows:
            seen[r["channel"]] = seen.get(r["channel"], 0) + 1
            if seen[r["channel"]] <= PER_CHANNEL_CAP:
                out.append(r)
        return out

    winners, near = cap(winners), cap(near)

    print(f"\n=== {len(winners)} ICAHN-PASS candidates "
          f"(>={MIN_VIEWS:,}v, <{MAX_SUBS:,} subs, >={MIN_RATIO:.0f}:1, long-form) ===\n")
    for i, r in enumerate(winners[:20], 1):
        print(f"{i:>2}. [{r['ratio']:.0f}:1] {r['views']:,}v / {r['subs']:,} subs "
              f"({r['dur']//60}m) {r['date']}")
        print(f"     {r['title']}")
        print(f"     {r['channel']} — {r['url']}")

    def table(rows):
        out = ["| # | Ratio | Views | Subs | Len | Title | Channel | Link |",
               "|---|-------|-------|------|-----|-------|---------|------|"]
        for i, r in enumerate(rows, 1):
            t = r["title"].replace("|", "\\|")
            out.append(f"| {i} | **{r['ratio']:.0f}:1** | {r['views']:,} | "
                       f"{r['subs']:,} | {r['dur']//60}m | {t} | {r['channel']} | "
                       f"[link]({r['url']}) |")
        return "\n".join(out)

    md = [
        "# Muse Candidates — Icahn Filter Results\n",
        f"Real YouTube stats via Apify. Keywords searched: {', '.join(kws)}.\n",
        f"Filter: views ≥ {MIN_VIEWS:,}, subs < {MAX_SUBS:,}, "
        f"ratio ≥ {MIN_RATIO:.0f}:1, length ≥ {MIN_DURATION_SEC//60}min.\n",
        f"\n## ✅ Pass ({len(winners)})\n", table(winners),
        "\n\n## ⚠️ Near-miss (strong views, softer ratio/subs — context)\n",
        table(near[:15]),
        "\n\n> Packaging quality (Icahn filter #4) still needs an eyeball — open the "
        "links and judge the thumbnail/title. Weak packaging at high views = bigger opening.\n",
    ]
    OUT_MD.write_text("\n".join(md))
    print(f"\nWrote {OUT_MD}")
    print(f"Raw saved: {RAW}")


if __name__ == "__main__":
    main()
