"""
CA Trade-Show Scout — signal-FIRST discovery: find companies exhibiting at upcoming trade shows.

An exhibitor with a booth is a guaranteed BULK swag buyer (booth giveaways) on a HARD deadline (the
show date), and the mockup wedge is at its strongest (show-themed fun item). This scrapes public
exhibitor directories, scores each exhibitor by how close the show is to the buy-now window, and emits
a /ca-outbound-ready lead list whose opener pitches a show-themed mockup.

Downstream: exhibitors.json → (reuse) ca_lead_waterfall resolve-domains + harvest for emails →
/ca-outbound personalizes: "Saw {company} is exhibiting at {show} — here's a mockup of {themed item}."

Sources (all owned/free): Firecrawl scrape of the public exhibitor gallery (MapYourShow/RainFocus/
generic). For messy/paginated platforms the robust fallback is the Apify all-in-one exhibitor actor
(~$5/1k, 30 platforms) — set APIFY path via --via apify.

Subcommands:
    shows                          list configured shows + weeks-to-show
    exhibitors --show <key>        scrape the exhibitor directory -> exhibitors.json
    score      --show <key>        weeks-to-show score + show-themed opener -> leads.json (feeds /ca-outbound)
    run        --show <key>        exhibitors + score
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

try:
    import requests
    import yaml
except ImportError:
    raise ImportError("Missing deps — run: .venv/bin/pip install requests python-dotenv pyyaml")

OUT = ROOT / "outputs" / "ca-outbound"
GENERIC_SOCIAL = re.compile(r"(linkedin|twitter|x\.com|facebook|instagram|youtube|mapyourshow|rainfocus|"
                            r"swapcard|google|apple|cloudflare|gstatic|cdn|\.png|\.jpg|\.svg)", re.I)
# Show-organizer booths / facilities that aren't real exhibitors (e.g. "AVIXA Lounge", "Press Room").
BOOTH_NOISE = re.compile(r"\b(lounge|tv studio|theater|theatre|pavilion|registration|info(rmation)? desk|"
                         r"press room|media room|welcome center|central station|help desk|show office|"
                         r"first aid|lost and found|coat check|networking|café|cafe|food court)\b", re.I)

def _is_booth_noise(name):
    return bool(BOOTH_NOISE.search(name or ""))

# Role-mailbox fallback for trade-show enrich (preferred order) when no person email is published.
GENERIC_PREF = ["marketing", "events", "event", "info", "hello", "contact", "sales"]

def _generic_email(text, domain):
    found = {e.lower() for e in re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text or "")
             if e.lower().endswith("@" + domain)}
    for role in GENERIC_PREF:
        for e in found:
            if e.split("@")[0] == role:
                return e
    return ""


def _cfg():
    return yaml.safe_load((ROOT / "config" / "ca_tradeshows.yaml").read_text())

def _show(cfg, key):
    s = cfg["shows"].get(key)
    if not s:
        print(f"unknown show '{key}'. Options: {', '.join(cfg['shows'])}", file=sys.stderr); sys.exit(1)
    return s

def _weeks_out(date_iso):
    try:
        d = datetime.fromisoformat(date_iso).replace(tzinfo=timezone.utc)
        return (d - datetime.now(timezone.utc)).total_seconds() / (86400 * 7)
    except ValueError:
        return 999.0

def _domain(url):
    try:
        net = urlparse(url if "://" in url else "https://" + url).netloc.lower()
        return net[4:] if net.startswith("www.") else net
    except ValueError:
        return ""


# ---------- scrape exhibitor directory ----------

def _firecrawl(url, key, wait=3000):
    try:
        r = requests.post("https://api.firecrawl.dev/v1/scrape",
                          headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                          json={"url": url, "formats": ["markdown", "links"], "onlyMainContent": True, "waitFor": wait},
                          timeout=60)
        if not r.ok:
            return "", []
        d = r.json().get("data", {}) or {}
        return d.get("markdown", "") or "", d.get("links", []) or []
    except requests.RequestException:
        return "", []

def _extract_mapyourshow(md):
    """MapYourShow: exhibitors are markdown links to exhibitor-details.cfm?exhid=N with the company as anchor text."""
    out, seen = [], set()
    for name, exhid in re.findall(r"\[([^\]]+)\]\([^)]*exhibitor-details\.cfm\?exhid=(\d+)\)", md):
        name = re.sub(r"\s+", " ", name).strip()
        if (not name or name.upper() in ("DOWNLOAD", "DETAILS", "MORE") or len(name) < 2
                or exhid in seen or _is_booth_noise(name)):
            continue
        seen.add(exhid)
        out.append({"company": name, "exhibitor_id": exhid, "website": "", "domain": ""})
    return out

def _extract_directory(md, links):
    """Generic exhibitor-directory extractor for a2z (eBooth.aspx), smallworldlabs/A2Z (/co/ slugs),
    and similar: company name from the anchor text of an exhibitor-detail link, or derived from a /co/ slug."""
    out, seen = [], set()
    STOP = {"DOWNLOAD", "DETAILS", "MORE", "VIEW", "PROFILE", "MAP", "BOOTH", "BACK", "NEXT"}
    for name, url in re.findall(
            r"\[([^\]]+)\]\(([^)]*(?:eBooth\.aspx|exhibitor-details\.cfm|/co/|/company/|/exhibitor/)[^)]*)\)", md):
        name = re.sub(r"\s+", " ", name).strip()
        key = name.lower()
        if not name or len(name) < 2 or key in seen or name.upper() in STOP or _is_booth_noise(name):
            continue
        seen.add(key)
        out.append({"company": name, "website": "", "domain": "", "exhibitor_id": ""})
    for url in (links or []):
        m = re.search(r"/(?:co|company|exhibitor)/([a-z0-9][a-z0-9\-]{2,})/?(?:[?#].*)?$", url, re.I)
        if not m:
            continue
        name = m.group(1).replace("-", " ").strip().title()
        key = name.lower()
        if key in seen or _is_booth_noise(name):
            continue
        seen.add(key)
        out.append({"company": name, "website": "", "domain": "", "exhibitor_id": ""})
    return out

def _extract_generic(md, links, show_host):
    """Generic: exhibitor names from bolded/linked text; candidate domains from external links."""
    out, seen = [], set()
    # external company links (not the show platform / social / assets)
    for l in links:
        dom = _domain(l)
        if dom and dom != show_host and not GENERIC_SOCIAL.search(l) and dom not in seen and "." in dom:
            seen.add(dom)
            out.append({"company": dom.split(".")[0].replace("-", " ").title(), "website": l, "domain": dom, "exhibitor_id": ""})
    return out

def _apify_exhibitors(cfg, show):
    """Robust full-coverage path via Apify all-in-one exhibitor actor (30 platforms, handles pagination)."""
    token = os.getenv("APIFY_API_TOKEN", "").strip()
    if not token:
        print("missing APIFY_API_TOKEN", file=sys.stderr); return None
    ap = cfg.get("apify", {})
    actor = ap.get("actor", "skython~exhibitor-list-scraper").replace("/", "~")
    # input template is configurable because actor schemas differ; default = startUrls
    body = json.loads(json.dumps(ap.get("input", {"startUrls": [{"url": "__URL__"}]})).replace("__URL__", show["exhibitor_url"]))
    try:
        r = requests.post(f"https://api.apify.com/v2/acts/{actor}/run-sync-get-dataset-items?token={token}",
                          json=body, timeout=ap.get("timeout", 300))
        if not r.ok:
            print(f"  apify actor error {r.status_code}: {r.text[:200]}", file=sys.stderr); return None
        rows = r.json()
    except (requests.RequestException, ValueError) as e:
        print(f"  apify error: {e}", file=sys.stderr); return None
    out, seen = [], set()
    for x in rows if isinstance(rows, list) else []:
        # field names vary by platform; MapYourShow via this actor uses __company_name / _company_website etc.
        name = (x.get("__company_name") or x.get("company_name") or x.get("company") or
                x.get("companyName") or x.get("name") or x.get("exhibitorName") or "").strip()
        web = (x.get("_company_website") or x.get("company_website") or x.get("website") or x.get("url") or "")
        booth = x.get("_hall_stands") or x.get("booth") or x.get("boothNumber", "")
        if not name or name.lower() in seen or _is_booth_noise(name):
            continue
        seen.add(name.lower())
        out.append({"company": name, "booth": booth, "website": web, "domain": _domain(web),
                    "phone": x.get("_company_phone", ""), "summary": x.get("company_description", ""),
                    "exhibitor_id": str(x.get("id", ""))})
    return out

def cmd_exhibitors(args):
    cfg = _cfg(); show = _show(cfg, args.show)
    via = getattr(args, "via", "firecrawl")
    d = OUT / f"tradeshow-{args.show}"
    d.mkdir(parents=True, exist_ok=True)

    if via == "apify":
        exhibitors = _apify_exhibitors(cfg, show)
        if exhibitors is None:
            print("  apify path failed — falling back to firecrawl", file=sys.stderr)
            via = "firecrawl"
    if via != "apify":
        key = os.getenv("FIRECRAWL_API_KEY", "").strip()
        if not key:
            print("missing FIRECRAWL_API_KEY", file=sys.stderr); return 1
        url = show["exhibitor_url"]; platform = show.get("platform", "generic")
        if platform == "mapyourshow":
            # merge the gallery AND the flat exhibitor-list (flat returns ~2.6x more), dedup by exhid
            md_g, _ = _firecrawl(url, key)
            exhibitors = _extract_mapyourshow(md_g)
            flat = re.sub(r"explore/exhibitor-gallery\.cfm.*$", "exhibitor/exhibitor-list.cfm", url)
            md_f, _ = _firecrawl(flat, key)
            known = {e["exhibitor_id"] for e in exhibitors}
            exhibitors += [e for e in _extract_mapyourshow(md_f) if e["exhibitor_id"] not in known]
        elif platform == "directory":
            md, links = _firecrawl(url, key)
            exhibitors = _extract_directory(md, links)
        else:
            md, links = _firecrawl(url, key)
            exhibitors = _extract_generic(md, links, _domain(url))

    (d / "exhibitors.json").write_text(json.dumps(exhibitors, indent=2))
    with_dom = sum(1 for e in exhibitors if e.get("domain"))
    print(f"exhibitors: {len(exhibitors)} companies from {show['name']} (via {via}, {with_dom} w/ domain) → {d/'exhibitors.json'}")
    if len(exhibitors) < 10:
        print("  ⚠ low yield — JS-paginated or gated platform. Try --via apify (owned, ~$5/1k, full coverage), "
              "or verify the exhibitor_url is public.", file=sys.stderr)
    elif via == "firecrawl" and show.get("platform") == "mapyourshow":
        print("  (Firecrawl gets the flat-list pages ~free; for 100% coverage of a huge show use --via apify.)")
    return 0


# ---------- enrich: company -> domain + contact email (reuses ca_lead_waterfall helpers) ----------

def cmd_enrich(args):
    sys.path.insert(0, str(ROOT / "scripts"))
    import ca_lead_waterfall as wf   # reuse Places + Firecrawl + email helpers (DRY, already tested)
    fc = os.getenv("FIRECRAWL_API_KEY", "").strip()
    pl = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
    d = OUT / f"tradeshow-{args.show}"
    exhibitors = json.loads((d / "exhibitors.json").read_text())
    if args.max:
        exhibitors = exhibitors[: args.max]
    session = requests.Session()
    got_dom = got_email = 0
    for e in exhibitors:
        # 1) domain via Google Places (owned) if the listing didn't include one
        if not e.get("domain") and pl:
            res = wf._places_lookup(e["company"], "", pl, session)
            e["domain"] = res.get("domain", "")
            e["phone"] = res.get("phone", "")
            time.sleep(0.15)
        dom = e.get("domain", "")
        if not dom:
            continue
        got_dom += 1
        # 2) published contact email + firm pattern via Firecrawl (owned) — /contact then homepage
        e.setdefault("email", ""); e.setdefault("email_status", ""); e.setdefault("firm_pattern", "")
        if fc:
            person_email, generic = "", ""
            for path in ("/contact", "/contact-us", "/about", ""):
                md = wf._fc_scrape(f"https://{dom}{path}", fc, session)
                persons = wf._emails_in(md, dom)   # person-like emails (generics excluded)
                if persons and not person_email:
                    person_email = persons[0]
                if not generic:
                    generic = _generic_email(md, dom)   # marketing@/events@/info@ fallback
                if person_email:
                    break
                time.sleep(0.2)
            if person_email:
                e["email"], e["email_status"] = person_email, "published"; got_email += 1
            elif generic:
                e["email"], e["email_status"] = generic, "generic"; got_email += 1
    (d / "exhibitors.json").write_text(json.dumps(exhibitors, indent=2))
    print(f"enrich: {got_dom}/{len(exhibitors)} resolved a domain; {got_email} got a published contact email → {d/'exhibitors.json'}")
    print("  (event-marketing-specific contact: run AI Ark people_search on the domain + title in /ca-outbound; "
          "published emails here are the free first pass.)")
    return 0


# ---------- score by buy-now window + themed opener ----------

def _score(weeks, sc):
    if weeks < 0 or weeks > 52:
        return 0.0, "past-or-far"
    lo, hi, rush, nur = sc["peak_weeks_lo"], sc["peak_weeks_hi"], sc["rush_weeks"], sc["nurture_weeks"]
    if lo <= weeks <= hi:
        return 30.0, "priority"          # peak buy-now window
    if rush <= weeks < lo:
        return 22.0, "priority"          # inside deadline, still orderable
    if 0 <= weeks < rush:
        return 14.0, "rush"              # rush pricing — "we can still hit your deadline"
    if hi < weeks <= nur:
        return 12.0, "personalized"      # early — warm now, close later
    return 6.0, "nurture"                # >nurture_weeks out

def cmd_score(args):
    cfg = _cfg(); show = _show(cfg, args.show); sc = cfg["scoring"]
    d = OUT / f"tradeshow-{args.show}"
    exhibitors = json.loads((d / "exhibitors.json").read_text())
    weeks = _weeks_out(show["date"])
    pts, band = _score(weeks, sc)
    theme = show.get("mockup_theme", "a show-themed branded item")
    leads = []
    for e in exhibitors:
        detail = (f"exhibiting at {show['name']} ({show['city']}, {show['date']}, ~{weeks:.0f} wks out) — "
                  f"mock up {theme}")
        leads.append({
            "company_name": e["company"], "company_domain": e.get("domain", ""),
            "email": e.get("email", ""), "email_status": e.get("email_status", ""),
            "firm_pattern": e.get("firm_pattern", ""), "phone": e.get("phone", ""),
            "title": "Event Marketing Manager",  # target role for booth swag
            "industry": "Trade Show Exhibitor",
            "buy_now_score": pts, "band": band,
            "top_signal": "trade-show-exhibitor", "top_signal_detail": detail,
            "top_signal_date": datetime.now(timezone.utc).isoformat(),
            "show": show["name"], "show_date": show["date"], "weeks_out": round(weeks, 1),
            "mockup_theme": theme,
            "summary": f"{e['company']} has a booth at {show['name']} — needs branded booth giveaways.",
        })
    leads.sort(key=lambda x: -x["buy_now_score"])
    (d / "leads.json").write_text(json.dumps(leads, indent=2))
    print(f"score: {show['name']} is ~{weeks:.0f} weeks out → band '{band}' ({pts} pts) for {len(leads)} exhibitors")
    print(f"  → {d/'leads.json'}  (feed to resolve-domains + harvest for emails, then /ca-outbound)")
    print(f"  opener theme: {theme}")
    return 0

def cmd_shows(args):
    cfg = _cfg()
    print("Configured trade shows:")
    for k, s in cfg["shows"].items():
        w = _weeks_out(s["date"])
        pts, band = _score(w, cfg["scoring"])
        when = f"{w:.0f}w out" if w >= 0 else "PAST"
        print(f"  {k:20} {s['name'][:32]:32} {s['date']}  {when:8} [{band}]")
    return 0

def cmd_run(args):
    if cmd_exhibitors(args) != 0:
        return 1
    if getattr(args, "enrich", False):
        cmd_enrich(args)
    return cmd_score(args)


def main():
    p = argparse.ArgumentParser(description="Trade-show exhibitor discovery — find bulk booth-swag buyers on a deadline.")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("shows").set_defaults(func=cmd_shows)

    ex = sub.add_parser("exhibitors"); ex.add_argument("--show", required=True)
    ex.add_argument("--via", choices=["firecrawl", "apify"], default="firecrawl")
    ex.set_defaults(func=cmd_exhibitors)

    en = sub.add_parser("enrich"); en.add_argument("--show", required=True)
    en.add_argument("--max", type=int, default=0); en.set_defaults(func=cmd_enrich)

    sc = sub.add_parser("score"); sc.add_argument("--show", required=True); sc.set_defaults(func=cmd_score)

    ru = sub.add_parser("run"); ru.add_argument("--show", required=True)
    ru.add_argument("--via", choices=["firecrawl", "apify"], default="firecrawl")
    ru.add_argument("--enrich", action="store_true", help="resolve domains + published emails before scoring")
    ru.add_argument("--max", type=int, default=0)
    ru.set_defaults(func=cmd_run)

    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
