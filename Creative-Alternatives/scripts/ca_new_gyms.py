"""
CA New-Gym Scout — find BRAND-NEW boutique gyms/studios that need merch (staff tees, member shaker
bottles, towels, grand-opening giveaways). Boutique only — commercial chains are filtered out.

Signal = "this studio is new / opening soon", detected FREE via Google News RSS (which reliably names
new boutique openings by city + date). Franchise "coming soon" pages are JS-gated and skipped.

Pipeline (mirrors the trade-show engine):
    find     Google News RSS across boutique-opening queries → candidate new gyms (name, city, date)  [FREE]
    enrich   resolve each gym's domain (Google Places) + a published/generic email (Firecrawl)         [owned]
    build    → outputs/ca-outbound/new-gyms-<date>/leads.json with a grand-opening themed mockup opener
  (owner/GM contact + email: AI Ark MCP people_search+email_finder in-session, like ca_tradeshow_contacts)

The `find` regex is a FIRST PASS — in the skill, Claude refines gym_name/city and confirms boutique-vs-
commercial from the headline (it parses "JETSET Pilates Announces Grand Opening in Buckhead" better than regex).
"""

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")
try:
    import requests
    import yaml
except ImportError:
    raise ImportError("Missing deps — run: .venv/bin/pip install requests python-dotenv pyyaml")

OUT = ROOT / "outputs" / "ca-outbound"
UA = "Mozilla/5.0 (compatible; CreativeAlternatives-GymScout/1.0)"

# Gym/studio + sports-center types (boutique + athletic facilities CA sells to), and opening verbs.
# Per-city queries are built at runtime: '"{city}" {GYM_TERMS} {OPENING_TERMS} when:{days}d'.
GYM_TERMS = ('(pilates OR reformer OR barre OR yoga OR "boutique fitness" OR "cycling studio" OR '
             '"spin studio" OR "boxing gym" OR kickboxing OR HIIT OR crossfit OR "rowing studio" OR '
             '"strength studio" OR "fitness studio" OR "training studio" OR "sports center" OR '
             '"sports complex" OR "athletic club" OR "athletic center" OR "martial arts" OR "jiu-jitsu" OR '
             'karate OR taekwondo OR gymnastics OR cheer OR "climbing gym" OR bouldering OR "dance studio" OR '
             'pickleball OR "tennis club" OR "swim school" OR F45 OR "Club Pilates" OR CycleBar OR StretchLab OR '
             '"Pure Barre" OR Orangetheory)')
OPENING_TERMS = '("grand opening" OR "now open" OR "ribbon cutting" OR opens OR "coming soon" OR "opening soon")'
# Commercial chains / non-boutique → drop.
COMMERCIAL = re.compile(r"\b(planet fitness|la fitness|crunch fitness|gold'?s gym|24 hour|ymca|ywca|esporta|"
                        r"eos fitness|life ?time|blink fitness|world gym|equinox|ufc gym|retro fitness|"
                        r"powerhouse|fitness connection|chuze|vasa|genesis health)\b", re.I)
# Must look like a boutique gym / sports facility to keep.
BOUTIQUE = re.compile(r"\b(boutique|pilates|reformer|barre|yoga studio|yoga club|hot yoga|cycling studio|cyclebar|spin studio|"
                      r"kickbox|crossfit|rowing studio|strength studio|wellness studio|recovery studio|"
                      r"lagree|megaformer|f45|orangetheory|stretchlab|pure barre|rumble boxing|solidcore|"
                      r"club pilates|fitness studio|workout studio|training studio|boxing studio|boxing gym|"
                      r"hiit|dance studio|martial arts|jiu.?jitsu|karate|taekwondo|gymnastics|cheer|"
                      r"climbing gym|bouldering|pickleball|tennis club|swim school|sports center|"
                      r"sports complex|athletic club|athletic center)\b", re.I)
# Headline noise that isn't a real new-location opening (sports/entertainment/college/non-gym false-positives).
NOISE = re.compile(r"\b(closes|closing|shuts|lawsuit|arrested|robbery|death|dies|franchise opportunit|for sale|"
                   r"franchise cost|franchise fee|profit in 20|expands to|acquires|merger|wwe|royal rumble|"
                   r"smackdown|wrestl|baysox|rumble ponies|\bmlb\b|\bnba\b|\bnfl\b|\bmls\b|obama|retirement|dodge|"
                   r"exhibition|comes home to|ncaa|championship|season opener|opens season|tournament|"
                   r"\btri\b|\bmeet\b|invitational|university athletics|college athletics|athletics opens|"
                   r"\btour\b|setlist|concert|fire facility|fireflies|indicted|fraud|charges|rankings|yoga day|yoga fest|yoga festival|sunset yoga|morning yoga|yoga mat|international yoga|public offering|\bexercises\b|primed for|returns for|welcomes|inspiring|saved my life|fundraiser|hosts second|obituary|semifinal|quarterfinal|copa sur|highway cleanup|results)\b", re.I)


def _read(p): return json.loads(Path(p).read_text())
def _write(p, o): Path(p).parent.mkdir(parents=True, exist_ok=True); Path(p).write_text(json.dumps(o, indent=2))

def _google_news(query, days):
    url = f"https://news.google.com/rss/search?q={quote(query + f' when:{days}d')}&hl=en-US&gl=US&ceid=US:en"
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=25)
        out = []
        for it in re.findall(r"<item>(.*?)</item>", r.text, re.S):
            t = re.search(r"<title>(.*?)</title>", it, re.S)
            d = re.search(r"<pubDate>(.*?)</pubDate>", it, re.S)
            title = re.sub(r"<!\[CDATA\[|\]\]>", "", t.group(1)).strip() if t else ""
            try:
                date = parsedate_to_datetime(d.group(1)).astimezone(timezone.utc).date().isoformat() if d else ""
            except (TypeError, ValueError):
                date = ""
            if title:
                out.append({"headline": title, "date": date})
        return out
    except requests.RequestException:
        return []

def _parse(title):
    """First-pass gym name + city from a headline. Claude refines this in the skill."""
    # city: after " in <City>" / " opens in <City>"
    city = ""
    mc = re.search(r"\bin\s+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){0,2})", title)
    if mc:
        city = mc.group(1).strip(" .,-")
    # name: text before an opening verb, or after "Grand Opening at/of"
    name = ""
    m = re.match(r"^(?:New\s+)?(.+?)\s+(?:Announces|Celebrates|Opens|Debuts|Launches|Brings|Hosts|to Open|Reaches|Marks|Set to)\b", title)
    if m:
        name = m.group(1)
    else:
        m2 = re.search(r"(?:Grand Opening|Ribbon Cutting)(?:\s+(?:at|of|for|Weekend at))?\s+(.+?)(?:\s+in\s+|\s*[-|–—]|$)", title, re.I)
        if m2:
            name = m2.group(1)
    name = re.sub(r"\s+", " ", (name or "")).strip(" .,-")
    return name, city


def _target_cities(args):
    """Resolve the list of (city, state) to search from --state / --region / config default."""
    cfg = yaml.safe_load((ROOT / "config" / "ca_gym_regions.yaml").read_text())
    states = []
    if args.region:
        states = cfg["regions"].get(args.region.lower(), [])
        if not states:
            print(f"unknown region '{args.region}'. Options: {', '.join(cfg['regions'])}", file=sys.stderr); sys.exit(1)
    elif args.state:
        states = [args.state.upper()]
    else:
        states = [cfg.get("default_state", "SC")]
    out = []
    for st in states:
        for c in cfg["states"].get(st, {}).get("cities", []):
            out.append((c, st))
    return out, states

def cmd_find(args):
    cities, states = _target_cities(args)
    print(f"searching {len(cities)} cities across {', '.join(states)} (last {args.days}d)…")
    seen, cands = set(), []
    kept = dropped = 0
    for city, st in cities:
        q = f'"{city}" {GYM_TERMS} {OPENING_TERMS}'
        for item in _google_news(q, args.days):
            h = item["headline"]
            key = h.lower()
            if key in seen:
                continue
            seen.add(key)
            if COMMERCIAL.search(h) or NOISE.search(h) or not BOUTIQUE.search(h):
                dropped += 1
                continue
            name, parsed_city = _parse(h)
            cands.append({"gym_name": name, "city": parsed_city or city.replace(" SC", "").replace(" NC", ""),
                          "state": st, "searched_city": city, "opening_date": item["date"],
                          "headline": h, "source": "google-news", "needs_review": not bool(name)})
            kept += 1
        time.sleep(0.4)
    cands.sort(key=lambda c: c.get("opening_date", ""), reverse=True)
    tag = states[0] if len(states) == 1 else (args.region or "multi")
    d = OUT / f"new-gyms-{tag}-{time.strftime('%Y-%m-%d')}"
    _write(d / "new_gyms.json", cands)
    print(f"find: {kept} candidates ({dropped} filtered) across {len(cities)} cities → {d/'new_gyms.json'}")
    print("  Next: have Claude refine gym_name/city + drop non-openings/out-of-state, then enrich.")
    for c in cands[:12]:
        print(f"    • [{c['state']}/{c['searched_city']:14}] {c['opening_date']}  {c['headline'][:64]}")
    return 0


def cmd_enrich(args):
    sys.path.insert(0, str(ROOT / "scripts"))
    import ca_lead_waterfall as wf
    import os
    fc = os.getenv("FIRECRAWL_API_KEY", "").strip(); pl = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
    d = OUT / args.run
    gyms = _read(d / "new_gyms.json")
    if args.max:
        gyms = gyms[: args.max]
    session = requests.Session()
    dom = eml = 0
    for g in gyms:
        if not g.get("gym_name"):
            continue
        if not g.get("domain") and pl:
            res = wf._places_lookup(g["gym_name"], g.get("city", ""), pl, session)
            g["domain"] = res.get("domain", ""); g["phone"] = res.get("phone", "")
            time.sleep(0.15)
        if not g.get("domain"):
            continue
        dom += 1
        g.setdefault("email", ""); g.setdefault("email_status", "")
        if fc and not g["email"]:
            for path in ("/contact", "/about", ""):
                md = wf._fc_scrape(f"https://{g['domain']}{path}", fc, session)
                persons = wf._emails_in(md, g["domain"])
                if persons:
                    g["email"], g["email_status"] = persons[0], "published"; eml += 1; break
                time.sleep(0.2)
    _write(d / "new_gyms.json", gyms)
    print(f"enrich: {dom}/{len(gyms)} resolved a domain; {eml} got an email → {d/'new_gyms.json'}")
    print("  Owner/GM contact: AI Ark people_search (domain + owner/GM/marketing title) in-session, like ca_tradeshow_contacts.")
    return 0


def cmd_build(args):
    d = OUT / args.run
    gyms = _read(d / "new_gyms.json")
    leads = []
    for g in gyms:
        if not g.get("gym_name"):
            continue
        opener = (f"congrats on opening {g['gym_name']}" + (f" in {g['city']}" if g.get("city") else "")
                  + " — mock up your logo on grand-opening swag (staff tees, member shaker bottles, launch-day giveaways)")
        leads.append({
            "company_name": g["gym_name"], "company_domain": g.get("domain", ""),
            "email": g.get("email", ""), "email_status": g.get("email_status", ""),
            "phone": g.get("phone", ""), "title": "Owner / Studio Manager", "industry": "Boutique Fitness",
            "buy_now_score": 25, "band": "priority",
            "top_signal": "new-gym-opening", "top_signal_detail": opener,
            "top_signal_date": g.get("opening_date", ""),
            "city": g.get("city", ""), "mockup_theme": "grand-opening gym swag (staff tees, shaker bottles, towels, launch giveaways)",
            "summary": g.get("headline", ""),
        })
    _write(d / "leads.json", leads)
    print(f"build: {len(leads)} new-gym leads → {d/'leads.json'}  (feed to /ca-outbound; opener uses top_signal_detail)")
    return 0


def main():
    p = argparse.ArgumentParser(description="Find brand-new boutique gyms that need merch (boutique only).")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("find"); f.add_argument("--days", type=int, default=90)
    f.add_argument("--state", help="e.g. SC (default from config)"); f.add_argument("--region", help="southeast | northeast")
    f.set_defaults(func=cmd_find)
    e = sub.add_parser("enrich"); e.add_argument("--run", required=True); e.add_argument("--max", type=int, default=0)
    e.set_defaults(func=cmd_enrich)
    b = sub.add_parser("build"); b.add_argument("--run", required=True); b.set_defaults(func=cmd_build)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
