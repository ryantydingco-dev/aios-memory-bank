"""
CA Triggers Scout — DISCOVERY of companies hitting a merch-need trigger, via free Google News.

Complements ca_openings (new locations) and ca_signals (enrich a known list). This one DISCOVERS new
companies from the trigger news itself: rebrand, milestone anniversary, funding round, franchise
expansion, company-hosted event, new office. Config in config/ca_triggers.yaml. National by default;
--state/--region to scope. Same discover→enrich→AI-Ark-contact→themed-mockup pattern.

    find    --trigger rebrand [--state SC | --region southeast]   Google News → candidates   [FREE]
    enrich  --run <run>   (reuse ca_openings.py enrich --run <run>)     Places domain + email  [owned]
    build   --run <run>   (reuse ca_openings.py build)                   themed opener
"""

import argparse
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ca_openings import _cities, _google_news, _read, _write, _parse, OUT, NOISE  # noqa: E402

import yaml  # noqa: E402
ROOT = Path(__file__).resolve().parent.parent


def _trigger(name):
    cfg = yaml.safe_load((ROOT / "config" / "ca_triggers.yaml").read_text())
    t = cfg["triggers"].get(name)
    if not t:
        print(f"unknown trigger '{name}'. Options: {', '.join(cfg['triggers'])}", file=sys.stderr); sys.exit(1)
    return t


def cmd_find(args):
    t = _trigger(args.trigger)
    allow = re.compile(t["allow"], re.I)
    # geo optional: if a state/region is given, scope per-city; else one national query
    if args.state or args.region:
        cities, states = _cities(args.state, args.region)
        scope = args.region or states[0]
        queries = [(f'"{c}" ({t["terms"]})', c, st) for c, st in cities]
    else:
        scope = "US"
        queries = [(f'({t["terms"]})', "", "US")]
    print(f"[{args.trigger}] {len(queries)} query(ies), scope {scope} (last {args.days}d)…")
    seen, cands = set(), []
    kept = dropped = 0
    for q, city, st in queries:
        for item in _google_news(q, args.days):
            h = item["headline"]; key = h.lower()
            if key in seen:
                continue
            seen.add(key)
            if NOISE.search(h) or not allow.search(h):
                dropped += 1; continue
            name, pcity = _parse(h)
            cands.append({"company_name": name, "city": pcity or re.sub(r"\s+[A-Z]{2}$", "", city),
                          "state": st, "searched_city": city, "opening_date": item["date"],
                          "headline": h, "vertical": args.trigger, "source": "google-news",
                          "needs_review": not bool(name)})
            kept += 1
        time.sleep(0.4)
    cands.sort(key=lambda c: c.get("opening_date", ""), reverse=True)
    d = OUT / f"triggers-{args.trigger}-{scope}-{time.strftime('%Y-%m-%d')}"
    _write(d / "openings.json", cands)  # openings shape → reuse ca_openings enrich/build
    print(f"find: {kept} {args.trigger} candidates ({dropped} filtered) → {d/'openings.json'}")
    print("  Next: Claude refines company/city, then `ca_openings.py enrich --run <this>` → build.")
    for c in cands[:12]:
        print(f"    • {c['opening_date']}  {c['headline'][:74]}")
    return 0


def main():
    p = argparse.ArgumentParser(description="Discover companies by merch-need trigger (news).")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("find"); f.add_argument("--trigger", required=True)
    f.add_argument("--state"); f.add_argument("--region"); f.add_argument("--days", type=int, default=90)
    f.set_defaults(func=cmd_find)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
