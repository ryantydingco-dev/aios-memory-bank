"""
CA Openings Scout — GENERALIZED new-opening trigger lead-gen for ANY industry.

Every company opening a location needs branded gear. This is the gym scout generalized: one engine,
many verticals via config/ca_openings.yaml (gyms, restaurants, breweries, medical, retail, salon_spa…).
Signal = "new / opening / grand opening", detected FREE via geo-scoped Google News RSS (per-city).
Geo from config/ca_gym_regions.yaml. Same discover→enrich→AI-Ark-contact→themed-mockup pattern.

    find     --vertical restaurants --state SC   (or --region southeast)   Google News → candidates  [FREE]
    enrich   --run <run>                          Places domain + Firecrawl email                     [owned]
    build    --run <run>                          → leads.json with the vertical's themed opener
  (owner/manager contact: AI Ark MCP in-session, like ca_tradeshow_contacts; target_title per vertical)

The find regex is a FIRST PASS — Claude refines names/cities + drops noise/out-of-state in-session.
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import timezone
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
UA = "Mozilla/5.0 (compatible; CreativeAlternatives-OpeningsScout/1.0)"
OPENING_TERMS = '("grand opening" OR "now open" OR "ribbon cutting" OR opens OR "coming soon" OR "opening soon" OR debuts)'
# Shared cross-vertical noise (sports/entertainment/obituary/college/events/articles).
NOISE = re.compile(r"\b(closes|closing|shuts|lawsuit|arrested|robbery|death|dies|obituary|for sale|franchise cost|"
                   r"franchise fee|profit in 20|wwe|royal rumble|smackdown|wrestl|\bmlb\b|\bnba\b|\bnfl\b|\bmls\b|"
                   r"ncaa|championship|season opener|opens season|tournament|semifinal|\btri\b|\bmeet\b|invitational|"
                   r"university athletics|college athletics|athletics opens|\btour\b|setlist|concert|indicted|fraud|"
                   r"charges|rankings|public offering|\bexercises\b|primed for|things to do|guide to|best \d)\b", re.I)


def _read(p): return json.loads(Path(p).read_text())
def _write(p, o): Path(p).parent.mkdir(parents=True, exist_ok=True); Path(p).write_text(json.dumps(o, indent=2))

def _vertical(name):
    cfg = yaml.safe_load((ROOT / "config" / "ca_openings.yaml").read_text())
    key = name or cfg.get("default_vertical", "gyms")
    v = cfg["verticals"].get(key)
    if v:
        return key, v
    # also accept trigger verticals (ca_triggers.yaml) so shared enrich/build work for trigger runs
    tpath = ROOT / "config" / "ca_triggers.yaml"
    if tpath.exists():
        t = (yaml.safe_load(tpath.read_text()).get("triggers") or {}).get(key)
        if t:
            return key, t
    # generic fallback — never hard-fail enrich/build
    return key, {"label": key, "mockup_theme": "branded merch for the occasion",
                 "target_title": "marketing OR owner", "allow": ".", "terms": ""}

def _cities(state, region):
    cfg = yaml.safe_load((ROOT / "config" / "ca_gym_regions.yaml").read_text())
    if region:
        states = cfg["regions"].get(region.lower(), [])
        if not states:
            print(f"unknown region '{region}'. Options: {', '.join(cfg['regions'])}", file=sys.stderr); sys.exit(1)
    else:
        states = [(state or cfg.get("default_state", "SC")).upper()]
    return [(c, st) for st in states for c in cfg["states"].get(st, {}).get("cities", [])], states

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
    city = ""
    mc = re.search(r"\bin\s+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){0,2})", title)
    if mc:
        city = mc.group(1).strip(" .,-")
    name = ""
    m = re.match(r"^(?:New\s+)?(.+?)\s+(?:Announces|Celebrates|Opens|Debuts|Launches|Brings|to Open|Set to|Coming)\b", title)
    if m:
        name = m.group(1)
    else:
        m2 = re.search(r"(?:Grand Opening|Ribbon Cutting)(?:\s+(?:at|of|for|Weekend at))?\s+(.+?)(?:\s+in\s+|\s*[-|–—]|$)", title, re.I)
        if m2:
            name = m2.group(1)
    return re.sub(r"\s+", " ", (name or "")).strip(" .,-"), city


def cmd_find(args):
    vname, v = _vertical(args.vertical)
    allow = re.compile(v["allow"], re.I)
    block = re.compile(v.get("block", "a^"), re.I)
    cities, states = _cities(args.state, args.region)
    scope = (args.region or states[0])
    print(f"[{vname}] searching {len(cities)} cities across {', '.join(states)} (last {args.days}d)…")
    seen, cands = set(), []
    kept = dropped = 0
    for city, st in cities:
        q = f'"{city}" ({v["terms"]}) {OPENING_TERMS}'
        for item in _google_news(q, args.days):
            h = item["headline"]; key = h.lower()
            if key in seen:
                continue
            seen.add(key)
            if block.search(h) or NOISE.search(h) or not allow.search(h):
                dropped += 1; continue
            name, pcity = _parse(h)
            cands.append({"company_name": name, "city": pcity or re.sub(r"\s+[A-Z]{2}$", "", city),
                          "state": st, "searched_city": city, "opening_date": item["date"],
                          "headline": h, "vertical": vname, "source": "google-news", "needs_review": not bool(name)})
            kept += 1
        time.sleep(0.4)
    cands.sort(key=lambda c: c.get("opening_date", ""), reverse=True)
    d = OUT / f"openings-{vname}-{scope}-{time.strftime('%Y-%m-%d')}"
    _write(d / "openings.json", cands)
    print(f"find: {kept} {vname} candidates ({dropped} filtered) across {len(cities)} cities → {d/'openings.json'}")
    print("  Next: Claude refines company_name/city + drops non-openings/out-of-state, then enrich.")
    for c in cands[:12]:
        print(f"    • [{c['state']}/{c['searched_city']:14}] {c['opening_date']}  {c['headline'][:62]}")
    return 0


def cmd_enrich(args):
    sys.path.insert(0, str(ROOT / "scripts"))
    import ca_lead_waterfall as wf
    fc = os.getenv("FIRECRAWL_API_KEY", "").strip(); pl = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
    d = OUT / args.run
    rows = _read(d / "openings.json")
    if args.max:
        rows = rows[: args.max]
    session = requests.Session()
    dom = eml = 0
    for r in rows:
        if not r.get("company_name"):
            continue
        if not r.get("domain") and pl:
            res = wf._places_lookup(r["company_name"], r.get("city", ""), pl, session)
            r["domain"] = res.get("domain", ""); r["phone"] = res.get("phone", ""); time.sleep(0.15)
        if not r.get("domain"):
            continue
        dom += 1
        r.setdefault("email", ""); r.setdefault("email_status", "")
        if fc and not r["email"]:
            for path in ("/contact", "/about", ""):
                md = wf._fc_scrape(f"https://{r['domain']}{path}", fc, session)
                em = wf._emails_in(md, r["domain"])
                if em:
                    r["email"], r["email_status"] = em[0], "published"; eml += 1; break
                time.sleep(0.2)
    _write(d / "openings.json", rows)
    print(f"enrich: {dom}/{len(rows)} resolved a domain; {eml} got an email → {d/'openings.json'}")
    print("  Owner/manager contact: AI Ark people_search(domain + vertical target_title) in-session.")
    return 0


def cmd_build(args):
    d = OUT / args.run
    rows = _read(d / "openings.json")
    _, v = _vertical(rows[0].get("vertical") if rows else None)
    theme = v["mockup_theme"]; title = v.get("target_title", "Owner")
    leads = []
    for r in rows:
        if not r.get("company_name"):
            continue
        opener = (f"congrats on opening {r['company_name']}" + (f" in {r['city']}" if r.get("city") else "")
                  + f" — mock up your logo on {theme}")
        leads.append({
            "company_name": r["company_name"], "company_domain": r.get("domain", ""),
            "email": r.get("email", ""), "email_status": r.get("email_status", ""), "phone": r.get("phone", ""),
            "title": title.split(" OR ")[0].title(), "industry": v["label"],
            "buy_now_score": 25, "band": "priority",
            "top_signal": f"new-{r.get('vertical','opening')}-opening", "top_signal_detail": opener,
            "top_signal_date": r.get("opening_date", ""), "city": r.get("city", ""),
            "mockup_theme": theme, "summary": r.get("headline", ""),
        })
    _write(d / "leads.json", leads)
    print(f"build: {len(leads)} {rows[0].get('vertical','') if rows else ''} leads → {d/'leads.json'}  (feed to /ca-outbound)")
    return 0


def main():
    p = argparse.ArgumentParser(description="Generalized new-opening trigger scout for any industry.")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("find"); f.add_argument("--vertical"); f.add_argument("--state"); f.add_argument("--region")
    f.add_argument("--days", type=int, default=90); f.set_defaults(func=cmd_find)
    for nm, fn in (("enrich", cmd_enrich), ("build", cmd_build)):
        sp = sub.add_parser(nm); sp.add_argument("--run", required=True)
        if nm == "enrich":
            sp.add_argument("--max", type=int, default=0)
        sp.set_defaults(func=fn)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
