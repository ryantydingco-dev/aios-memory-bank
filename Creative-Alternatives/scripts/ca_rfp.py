"""
CA RFP Scout — the hottest signal there is: public solicitations for exactly what CA sells.

Governments, schools, universities, and agencies POST solicitations for "promotional products",
"branded apparel", "uniforms", "spirit wear", "awards/trophies", "screen printing". That's a buyer with
an approved budget and a deadline. Source = SAM.gov Opportunities API (federal). The mockup wedge is an
unfair advantage on a bid: everyone else submits a boring PDF; you attach their logo on the product.

    find  --days N [--state SC]     SAM.gov solicitations matching promo keywords → hot RFP leads

REQUIRES a FREE key (1-min signup): get an api.data.gov / SAM.gov key at https://open.gsa.gov/api/get-opportunities-public-api/
then add to .env:  SAM_API_KEY=xxxxx
(State/education/nonprofit portals beyond SAM.gov are the next source — most are Firecrawl-scrapable HTML.)
"""

import argparse
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ca_openings import _write, OUT  # noqa: E402

from dotenv import load_dotenv  # noqa: E402
ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")
import requests  # noqa: E402

API = "https://api.sam.gov/opportunities/v2/search"
# Title keywords that indicate a promo/apparel/awards buy (SAM v2 searches one title term per call).
KEYWORDS = ["promotional products", "promotional items", "branded apparel", "logo apparel", "uniforms",
            "spirit wear", "screen printing", "embroidery", "awards and trophies", "trophies", "lapel pins",
            "tradeshow", "give-aways", "branded merchandise", "custom apparel"]
PTYPES = "o,k,p,r"  # Solicitation, Combined, Presolicitation, Sources Sought


def cmd_find(args):
    key = os.getenv("SAM_API_KEY", "").strip()
    if not key:
        print("NO SAM_API_KEY. Get a FREE key (1 min): https://open.gsa.gov/api/get-opportunities-public-api/\n"
              "then add SAM_API_KEY=xxxxx to .env. (Federal RFPs; state/edu portals are the next source.)",
              file=sys.stderr)
        return 2
    to = datetime.now(timezone.utc)
    frm = to - timedelta(days=args.days)
    fmt = lambda d: d.strftime("%m/%d/%Y")
    session = requests.Session()
    seen, leads = set(), []
    for kw in KEYWORDS:
        params = {"api_key": key, "limit": 50, "postedFrom": fmt(frm), "postedTo": fmt(to),
                  "ptype": PTYPES, "title": kw}
        try:
            r = session.get(API, params=params, timeout=30)
            if not r.ok:
                print(f"  {kw}: HTTP {r.status_code} {r.text[:120]}", file=sys.stderr); continue
            rows = r.json().get("opportunitiesData", []) or []
        except (requests.RequestException, ValueError) as e:
            print(f"  {kw}: {e}", file=sys.stderr); continue
        for o in rows:
            sol = o.get("solicitationNumber") or o.get("noticeId") or o.get("title")
            if sol in seen:
                continue
            pop = (o.get("placeOfPerformance") or {}).get("state", {})
            state = pop.get("code") or pop.get("name", "") if isinstance(pop, dict) else ""
            if args.state and state and args.state.upper() != str(state).upper():
                continue
            seen.add(sol)
            leads.append({
                "company_name": o.get("fullParentPathName", "").split(".")[-1] or o.get("organizationName", ""),
                "rfp_title": o.get("title", ""), "solicitation": sol, "keyword": kw,
                "naics": o.get("naicsCode", ""), "state": state,
                "posted": o.get("postedDate", ""), "deadline": o.get("responseDeadLine", ""),
                "link": o.get("uiLink", ""), "type": o.get("type", ""),
                "vertical": "rfp", "top_signal": "open-rfp",
                "top_signal_detail": f"open solicitation for {kw} — {o.get('title','')[:70]}",
            })
        time.sleep(0.3)
    leads.sort(key=lambda x: x.get("deadline", ""))
    d = OUT / f"rfp-{(args.state or 'US')}-{time.strftime('%Y-%m-%d')}"
    _write(d / "rfps.json", leads)
    print(f"find: {len(leads)} open promo/apparel/uniform RFPs → {d/'rfps.json'}")
    for l in leads[:15]:
        print(f"    • [{l['state'] or '--'}] deadline {l['deadline'][:10]}  {l['rfp_title'][:56]}  ({l['keyword']})")
    print("  → follow the solicitation's authorized submission and communication instructions; do not contact"
          " other agency staff during an active procurement unless the notice expressly permits it.")
    return 0


def main():
    p = argparse.ArgumentParser(description="RFP scout — public solicitations for promo/apparel/uniforms (SAM.gov).")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("find"); f.add_argument("--days", type=int, default=30); f.add_argument("--state")
    f.set_defaults(func=cmd_find)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
