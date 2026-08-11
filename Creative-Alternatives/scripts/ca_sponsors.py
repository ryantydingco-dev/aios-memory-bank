"""
CA Sponsorship Scout — find companies that just became a SPONSOR of an event/team/charity.

A sponsor needs branded giveaways + booth/activation gear on a deadline (the event date), and almost
nobody in promo targets them. Geo-scoped Google News RSS finds LOCAL companies sponsoring LOCAL events
(the right size for CA — not the mega-corp league deals). Same discover→enrich→AI-Ark→mockup pattern.

    find    --state SC (or --region southeast)   Google News sponsorship announcements → candidates  [FREE]
    enrich  --run <run>                           Places domain + Firecrawl email                     [owned]
    build   --run <run>                           → leads.json, opener pitches event-activation swag

Reuses ca_openings helpers (geo cities, news fetch). Claude refines company/event in-session.
"""

import argparse
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ca_openings import _cities, _google_news, _read, _write, OUT  # noqa: E402

SPONSOR_TERMS = ('("title sponsor" OR "presenting sponsor" OR "official sponsor" OR "proud sponsor" OR '
                 '"announces sponsorship" OR "signs sponsorship" OR "named sponsor" OR "sponsor of")')
EVENT_TERMS = ('(gala OR tournament OR festival OR marathon OR "5k" OR "10k" OR charity OR "golf classic" OR '
               'expo OR conference OR fair OR race OR fundraiser OR "food festival" OR "wine festival" OR '
               '"music festival" OR "little league" OR "youth sports" OR classic OR benefit)')
# Mega-corp / national-league sponsorships (agency-locked, not CA's lane) + generic noise.
NOISE = re.compile(r"\b(nfl|nba|mlb|nhl|nascar|pga tour|olympic|super bowl|world cup|stadium naming|"
                   r"naming rights|coca-cola|pepsi|nike|adidas|anheuser|budweiser|verizon|at&t|"
                   r"lawsuit|arrested|dies|obituary|ends sponsorship|drops sponsorship|pulls sponsorship)\b", re.I)


def _parse(title):
    company = event = ""
    # "<Company> named/becomes/announced ... sponsor" | "<Company> to sponsor"
    m = re.match(r"^(.+?)\s+(?:named|becomes|announced|announces|signs|is (?:the|now)|to sponsor|joins as|steps up as)\b", title)
    if m:
        company = m.group(1)
    # event after "sponsor of/for <Event>"
    me = re.search(r"sponsor (?:of|for)\s+(?:the\s+)?(.+?)(?:\s*[-|–—]|$)", title, re.I)
    if me:
        event = me.group(1)
    return re.sub(r"\s+", " ", company).strip(" .,-"), re.sub(r"\s+", " ", event).strip(" .,-")


def cmd_find(args):
    cities, states = _cities(args.state, args.region)
    scope = args.region or states[0]
    print(f"[sponsors] searching {len(cities)} cities across {', '.join(states)} (last {args.days}d)…")
    seen, cands = set(), []
    kept = dropped = 0
    for city, st in cities:
        q = f'"{city}" {SPONSOR_TERMS} {EVENT_TERMS}'
        for item in _google_news(q, args.days):
            h = item["headline"]; key = h.lower()
            if key in seen:
                continue
            seen.add(key)
            if NOISE.search(h) or "sponsor" not in h.lower():
                dropped += 1; continue
            company, event = _parse(h)
            cands.append({"company_name": company, "event": event, "city": re.sub(r"\s+[A-Z]{2}$", "", city),
                          "state": st, "searched_city": city, "opening_date": item["date"],
                          "headline": h, "vertical": "sponsor", "source": "google-news",
                          "needs_review": not bool(company)})
            kept += 1
        time.sleep(0.4)
    cands.sort(key=lambda c: c.get("opening_date", ""), reverse=True)
    d = OUT / f"sponsors-{scope}-{time.strftime('%Y-%m-%d')}"
    _write(d / "openings.json", cands)  # same shape → reuse ca_openings enrich/build
    print(f"find: {kept} sponsorship candidates ({dropped} filtered) → {d/'openings.json'}")
    print("  Next: Claude refines company/event, then `ca_openings.py enrich --run <this>` (shared enrich).")
    for c in cands[:12]:
        print(f"    • [{c['state']}/{c['searched_city']:14}] {c['opening_date']}  {c['headline'][:62]}")
    return 0


def main():
    p = argparse.ArgumentParser(description="Sponsorship trigger scout — companies sponsoring events need activation swag.")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("find"); f.add_argument("--state"); f.add_argument("--region")
    f.add_argument("--days", type=int, default=120); f.set_defaults(func=cmd_find)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
