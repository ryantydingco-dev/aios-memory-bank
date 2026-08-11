"""
vidIQ Muse Hunt — Icahn-method muse finder using vidIQ's outlier engine.

Runs vidiq_outliers across idea-congruent keyword lanes with the Icahn filter
baked in (long-form, >=100k views, <100k subs), keeps only on-topic titles,
dedupes, ranks by views:subs ratio (+ vidIQ breakoutScore), and writes a clean
shortlist. All numbers are real vidIQ data.

  python3 scripts/vidiq_muse_hunt.py
  python3 scripts/vidiq_muse_hunt.py "keyword one" "keyword two"
"""

import sys, re, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from vidiq import rpc

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "pillars" / "4-youtube-build" / "muse-candidates.md"
RAW = ROOT / "data" / "vidiq_outliers_raw.json"

KEYWORDS = [
    "AI runs my business",
    "run my business with AI",
    "I automated my business with AI",
    "AI for small business",
    "started a business with AI",
    "AI automation agency",
    "took over my family business",
]

ICAHN = {"contentType": "long", "minViews": 100000,
         "maxSubscribers": 100000, "sort": "breakoutScore", "limit": 20}

AI_RE = re.compile(r"\bai\b", re.I)
SUBSTR = ["business", "entrepreneur", "startup", "compan", "automat", "agency",
          "agent", "founder", "family", "store", "shop", "brand", "ecommerce",
          "hustle", "revenue", "customer", "franchise", "saas", "artificial"]


def relevant(title):
    t = title.lower()
    return bool(AI_RE.search(title)) or any(s in t for s in SUBSTR)


def outliers(keyword):
    res = rpc("tools/call",
              {"name": "vidiq_outliers", "arguments": {"keyword": keyword, **ICAHN}},
              _id=3)
    r = (res or {}).get("result", {})
    content = r.get("content")
    txt = "".join(c.get("text", "") for c in content if isinstance(c, dict)) \
        if isinstance(content, list) else json.dumps(r)
    try:
        return json.loads(txt)
    except json.JSONDecodeError:
        return {}


def main():
    kws = sys.argv[1:] or KEYWORDS
    seen, raw, credits = {}, [], 0

    for kw in kws:
        print(f"  outliers: {kw!r}", flush=True)
        data = outliers(kw)
        vids = data.get("videos", [])
        credits += (data.get("_credits") or {}).get("used", 0)
        print(f"    {len(vids)} results", flush=True)
        raw.append({"keyword": kw, "videos": vids})
        for v in vids:
            vid = v.get("videoId")
            subs = v.get("subscriberCount") or 0
            if not vid or vid in seen or subs <= 0:
                continue
            if not relevant(v.get("videoTitle") or ""):
                continue
            v["_kw"] = kw
            v["_ratio"] = (v.get("viewCount") or 0) / subs
            seen[vid] = v

    RAW.parent.mkdir(parents=True, exist_ok=True)
    RAW.write_text(json.dumps(raw, indent=2))

    rows = sorted(seen.values(), key=lambda v: v["_ratio"], reverse=True)

    def row(v):
        m = (v.get("videoDuration", 0)) // 60
        title = (v["videoTitle"][:72]).replace("|", "/")
        return (f"| {title} | {v['channelTitle'][:22]} | {v.get('subscriberCount',0):,} | "
                f"{v.get('viewCount',0):,} | {v['_ratio']:.0f}:1 | {v.get('breakoutScore',0):.0f} | "
                f"{m}m | https://youtube.com/watch?v={v['videoId']} |")

    md = ["# Muse Candidates — vidIQ Outliers (Icahn filter)\n",
          "Real vidIQ data. Filter: long-form, ≥100k views, <100k subs, on-topic title. "
          "Ranked by views:subs ratio (the Icahn metric); breakout = vidIQ overperformance score.\n",
          f"Lanes searched: {', '.join(kws)}. vidIQ credits used: {credits}.\n",
          "\n| Title | Channel | Subs | Views | Ratio | Breakout | Len | Link |",
          "|-------|---------|------|-------|-------|----------|-----|------|"]
    md += [row(v) for v in rows[:40]]
    md += ["\n> Packaging (Icahn filter #4) still needs an eyeball — open the links and judge "
           "the thumbnail/title. Weak packaging at a high ratio = the biggest opening."]
    OUT.write_text("\n".join(md))

    print(f"\n=== Top muse candidates (relevance-filtered, by views:subs ratio) ===")
    for i, v in enumerate(rows[:15], 1):
        print(f"{i:>2}. [{v['_ratio']:>4.0f}:1] breakout {v.get('breakoutScore',0):>5.0f} | "
              f"{v.get('viewCount',0):>9,}v / {v.get('subscriberCount',0):>6,} subs | "
              f"{v['videoTitle'][:58]}")
        print(f"     {v['channelTitle']} — https://youtube.com/watch?v={v['videoId']}")
    print(f"\nCredits used: {credits}. Wrote {OUT}")


if __name__ == "__main__":
    main()
