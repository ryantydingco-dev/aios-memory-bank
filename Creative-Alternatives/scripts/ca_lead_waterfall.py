"""
CA Lead Waterfall — self-source a large B2B lead list cheaply, so AI Ark is only ever a gap-filler.

Waterfall order (each stage is a subcommand; `run` chains them):
    registry-ny-law   FREE   NY Attorney Registrations (Socrata) -> real attorneys + firm + phone + address
    resolve-domains   ~free  unique firm -> website domain + main phone via Google Places (owned key)
    permute           FREE   name + domain -> candidate work emails (pattern-aware, firm-cached)
    verify            cheap  ZeroBounce / MillionVerifier -> keep valid, flag catch-all (pluggable)
    build             FREE   merge/dedupe -> outputs/ca-outbound/<run>/leads.json for /ca-outbound

Owned keys used (from .env): GOOGLE_PLACES_API_KEY, ZEROBOUNCE_API_KEY (or MILLIONVERIFIER_API_KEY).
Nothing here sends email or costs AI Ark credits. See plans/self-sourcing-leads-playbook-2026-07-07.md.

Examples:
    python scripts/ca_lead_waterfall.py registry-ny-law --counties "New York,Kings,Queens,Bronx,Richmond,Nassau,Westchester" --limit 2000 --out out/registry.json
    python scripts/ca_lead_waterfall.py resolve-domains --in out/registry.json --out out/firms.json --max-firms 200
    python scripts/ca_lead_waterfall.py permute --in out/registry.json --firms out/firms.json --out out/candidates.json
    python scripts/ca_lead_waterfall.py verify --in out/candidates.json --out out/verified.json
    python scripts/ca_lead_waterfall.py build --in out/verified.json --run 2026-07-07-ny-law
    # or one shot:
    python scripts/ca_lead_waterfall.py run --icp ny-law --limit 2000
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

try:
    import requests
except ImportError:
    raise ImportError("Missing 'requests' — run: .venv/bin/pip install requests python-dotenv")

SOCRATA_NY_ATTORNEY = "https://data.ny.gov/resource/eqw2-r5nb.json"
NY_METRO_COUNTIES = ["New York", "Kings", "Queens", "Bronx", "Richmond", "Nassau", "Suffolk", "Westchester"]

# Email formats in rough order of B2B prevalence; {f}=first initial, {l}=last initial.
EMAIL_FORMATS = [
    "{first}.{last}", "{f}{last}", "{first}", "{first}{last}",
    "{f}.{last}", "{first}_{last}", "{last}{f}", "{first}{l}",
]

# Firm names that are really solos / non-firms — skip domain resolution + email permutation.
SKIP_FIRM_RE = re.compile(r"^(self|sole|solo|n/?a|none|retired|unemployed|not employed|private)\b", re.I)

# Generic mailbox local-parts — not a person, useless for pattern inference.
GENERIC_LOCALS = {
    "info", "contact", "admin", "hello", "office", "mail", "email", "support", "inquiries",
    "inquiry", "general", "reception", "firm", "law", "attorneys", "attorney", "team", "hr",
    "careers", "jobs", "marketing", "media", "press", "privacy", "webmaster", "postmaster",
    "noreply", "no-reply", "sales", "billing", "accounting", "help", "service", "intake", "newbusiness",
}

# Email local-part format templates, tried in prevalence order for pattern inference.
FORMAT_TEMPLATES = [
    "{first}.{last}", "{f}{last}", "{first}", "{first}{last}", "{f}.{last}",
    "{first}_{last}", "{last}{f}", "{first}{l}", "{last}.{first}", "{last}",
]


# ---------- helpers ----------

def _slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())

def _norm_firm(name: str) -> str:
    n = re.sub(r"[^a-z0-9 ]", " ", (name or "").lower())
    n = re.sub(r"\b(llp|llc|pllc|pc|pa|esq|law|firm|offices?|attorneys?|associates?|group|the)\b", " ", n)
    return re.sub(r"\s+", " ", n).strip()

def _domain_from_url(url: str) -> str:
    if not url:
        return ""
    try:
        net = urlparse(url if "://" in url else "https://" + url).netloc.lower()
        return net[4:] if net.startswith("www.") else net
    except ValueError:
        return ""

def _write(path, obj):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(obj, indent=2))

def _read(path):
    return json.loads(Path(path).read_text())


# ---------- stage 1: NY attorney registry (FREE) ----------

def cmd_registry_ny_law(args):
    counties = [c.strip() for c in (args.counties or ",".join(NY_METRO_COUNTIES)).split(",") if c.strip()]
    where = "status='Currently registered'"
    if counties:
        quoted = ",".join("'" + c.replace("'", "''") + "'" for c in counties)
        where += f" AND county in({quoted})"
    people, offset, page = [], 0, 1000
    session = requests.Session()
    while len(people) < args.limit:
        params = {"$where": where, "$limit": min(page, args.limit - len(people)),
                  "$offset": offset, "$order": "registration_number"}
        r = session.get(SOCRATA_NY_ATTORNEY, params=params, timeout=30)
        r.raise_for_status()
        rows = r.json()
        if not rows:
            break
        for x in rows:
            people.append({
                "lead_id": x.get("registration_number"),
                "first_name": (x.get("first_name") or "").title(),
                "last_name": (x.get("last_name") or "").title(),
                "company_name": (x.get("company_name") or "").title().strip(),
                "title": "Attorney",
                "phone": x.get("phone_number", ""),
                "city": (x.get("city") or "").title(),
                "county": x.get("county", ""),
                "state": x.get("state", ""),
                "zip": x.get("zip", ""),
                "year_admitted": x.get("year_admitted", ""),
                "summary": f"Attorney at {(x.get('company_name') or 'a NY law firm').title()} in {(x.get('city') or '').title()}, {x.get('county','')} County.",
            })
        offset += len(rows)
        time.sleep(0.2)
    # keep only people with a real firm name (drop blanks/solos) for the email path;
    # they still carry a registry phone for the call path.
    _write(args.outfile, people)
    firms = {_norm_firm(p["company_name"]) for p in people if p["company_name"] and not SKIP_FIRM_RE.match(p["company_name"])}
    print(f"registry: {len(people)} attorneys ({len(firms)} unique firms) across {len(counties)} counties → {args.outfile}")
    return 0


# ---------- stage 2: firm -> domain via Google Places (owned) ----------

def _places_lookup(firm, city, key, session):
    body = {"textQuery": f"{firm}, {city} NY", "maxResultCount": 1}
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.websiteUri,places.nationalPhoneNumber,places.formattedAddress",
    }
    try:
        r = session.post("https://places.googleapis.com/v1/places:searchText",
                         json=body, headers=headers, timeout=20)
        if not r.ok:
            return {"error": f"{r.status_code}: {r.text[:160]}"}
        places = r.json().get("places", [])
        if not places:
            return {}
        p = places[0]
        return {"website": p.get("websiteUri", ""), "domain": _domain_from_url(p.get("websiteUri", "")),
                "phone": p.get("nationalPhoneNumber", ""), "matched_name": p.get("displayName", {}).get("text", "")}
    except requests.RequestException as e:
        return {"error": str(e)}

def cmd_resolve_domains(args):
    key = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
    if not key:
        print("missing GOOGLE_PLACES_API_KEY", file=sys.stderr); return 1
    people = _read(args.infile)
    # unique firm -> a representative city (first seen)
    firms = {}
    for p in people:
        fn = p.get("company_name", "")
        if not fn or SKIP_FIRM_RE.match(fn):
            continue
        norm = _norm_firm(fn)
        firms.setdefault(norm, {"firm": fn, "city": p.get("city", "")})
    firm_list = list(firms.items())[: args.max_firms]
    session = requests.Session()
    resolved, hits, errs = {}, 0, 0
    for i, (norm, meta) in enumerate(firm_list, 1):
        res = _places_lookup(meta["firm"], meta["city"], key, session)
        if res.get("error"):
            errs += 1
            if errs <= 3:
                print(f"  places error ({meta['firm']}): {res['error']}", file=sys.stderr)
        resolved[norm] = {**meta, **{k: res.get(k, "") for k in ("website", "domain", "phone", "matched_name")}}
        if res.get("domain"):
            hits += 1
        if args.dry_run and i >= 3:
            print(f"[dry-run] resolved {i} firms, stopping")
            break
        time.sleep(0.15)
    _write(args.outfile, resolved)
    print(f"resolve-domains: {hits}/{len(firm_list)} firms got a domain ({errs} errors) → {args.outfile}")
    return 0


# ---------- stage 2.5: harvest real published emails via Firecrawl (owned) ----------

def _fc_headers(key):
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

def _fc_map(domain, key, session):
    """Return candidate URLs on the firm site (bio/team pages surface first with search)."""
    try:
        r = session.post("https://api.firecrawl.dev/v1/map", headers=_fc_headers(key),
                         json={"url": domain, "search": "attorney people team lawyer partner", "limit": 40}, timeout=40)
        if not r.ok:
            return []
        return [u for u in (r.json().get("links") or []) if isinstance(u, str)]
    except requests.RequestException:
        return []

def _fc_scrape(url, key, session):
    try:
        r = session.post("https://api.firecrawl.dev/v1/scrape", headers=_fc_headers(key),
                         json={"url": url, "formats": ["markdown"], "onlyMainContent": True}, timeout=40)
        if not r.ok:
            return ""
        return (r.json().get("data") or {}).get("markdown", "") or ""
    except requests.RequestException:
        return ""

def _emails_in(text, domain):
    """Person-like emails at the firm domain (generics excluded), lowercased."""
    found = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text or "")
    out = []
    for e in found:
        e = e.lower()
        local, _, dom = e.partition("@")
        if dom == domain and local not in GENERIC_LOCALS and e not in out:
            out.append(e)
    return out

def _infer_format(first, last, local):
    """Which FORMAT_TEMPLATE produced `local` for this name, or None."""
    f, l = _slug(first), _slug(last)
    if not f or not l or not local:
        return None
    fi, li = f[0], l[0]
    for fmt in FORMAT_TEMPLATES:
        if fmt.format(first=f, last=l, f=fi, l=li) == local:
            return fmt
    return None

def _url_matches_person(url, first, last):
    slug = re.sub(r"[^a-z]", "", url.lower())
    return _slug(last) and _slug(last) in slug and (_slug(first)[:3] in slug or len(_slug(first)) <= 2)

def cmd_harvest(args):
    key = os.getenv("FIRECRAWL_API_KEY", "").strip()
    if not key:
        print("missing FIRECRAWL_API_KEY", file=sys.stderr); return 1
    people = _read(args.infile)
    firms = _read(args.firms) if args.firms and Path(args.firms).exists() else {}
    session = requests.Session()

    by_firm = {}
    for p in people:
        p.setdefault("email", ""); p.setdefault("email_status", "")
        norm = _norm_firm(p.get("company_name", ""))
        if norm and firms.get(norm, {}).get("domain"):
            by_firm.setdefault(norm, []).append(p)

    firm_items = list(by_firm.items())[: args.max_firms]
    credits = 0
    published = pattern_filled = firms_with_pattern = 0
    for norm, members in firm_items:
        domain = firms[norm]["domain"]
        links = _fc_map(domain, key, session); credits += 1
        # rank links: prefer those whose slug matches one of our attorneys' names
        def rank(u):
            return any(_url_matches_person(u, m.get("first_name"), m.get("last_name")) for m in members)
        bio_links = [u for u in links if rank(u)] or [u for u in links if re.search(r"/(people|attorney|lawyer|team|professional|our-team|bio|profile)s?/", u, re.I)]
        bio_links = bio_links[: args.max_pages_per_firm]

        votes = {}
        for u in bio_links:
            md = _fc_scrape(u, key, session); credits += 1
            emails = _emails_in(md, domain)
            if not emails:
                continue
            # attribute the email on THIS bio page to the attorney the URL points to
            owner = next((m for m in members if _url_matches_person(u, m.get("first_name"), m.get("last_name"))), None)
            for e in emails:
                local = e.split("@")[0]
                if owner and not owner.get("email"):
                    fmt = _infer_format(owner.get("first_name"), owner.get("last_name"), local)
                    owner["email"], owner["email_status"] = e, "published"; published += 1
                    if fmt:
                        votes[fmt] = votes.get(fmt, 0) + 1
                else:
                    # unattributed: still vote if it maps to any member's name
                    for m in members:
                        fmt = _infer_format(m.get("first_name"), m.get("last_name"), local)
                        if fmt:
                            votes[fmt] = votes.get(fmt, 0) + 1
                            if not m.get("email"):
                                m["email"], m["email_status"] = e, "published"; published += 1
                            break
            time.sleep(0.2)

        firm_pattern = max(votes, key=votes.get) if votes else ""
        if firm_pattern:
            firms_with_pattern += 1
            for m in members:
                m["firm_pattern"] = firm_pattern
                if not m.get("email"):
                    f, l = _slug(m.get("first_name")), _slug(m.get("last_name"))
                    if f and l:
                        local = firm_pattern.format(first=f, last=l, f=f[0], l=l[0])
                        m["email"], m["email_status"] = f"{local}@{domain}", "pattern"; pattern_filled += 1
        if args.dry_run and (published + pattern_filled) > 0:
            print(f"[dry-run] processed {norm}: pattern={firm_pattern or 'none'}, credits so far {credits}")
            break
    _write(args.outfile, people)
    print(f"harvest: {published} published + {pattern_filled} pattern-filled emails across "
          f"{firms_with_pattern}/{len(firm_items)} firms (~{credits} Firecrawl credits) → {args.outfile}")
    return 0


# ---------- stage 3: permute candidate emails (FREE) ----------

def _permutations(first, last, domain, formats):
    f, l = _slug(first), _slug(last)
    if not f or not l or not domain:
        return []
    fi, li = f[0], l[0]
    out = []
    for fmt in formats:
        local = fmt.format(first=f, last=l, f=fi, l=li)
        addr = f"{local}@{domain}"
        if addr not in out:
            out.append(addr)
    return out

def cmd_permute(args):
    """Fill the GAPS harvest left: people at a domain with no published/pattern email yet.
    Prefers the firm's harvested pattern, then falls back to the top formats for verification."""
    people = _read(args.infile)
    firms = _read(args.firms) if args.firms and Path(args.firms).exists() else {}
    formats = FORMAT_TEMPLATES[: args.formats]
    out, gaps = [], 0
    for p in people:
        p = dict(p)
        norm = _norm_firm(p.get("company_name", ""))
        firm = firms.get(norm, {})
        domain = p.get("company_domain") or firm.get("domain", "")
        p["company_domain"] = domain
        p["phone"] = firm.get("phone") or p.get("phone", "")
        p.setdefault("email", ""); p.setdefault("email_status", "")
        p["candidates"] = []
        # already solved by harvest (published or pattern) → leave it, no verification needed
        if p.get("email") and p.get("email_status") in ("published", "pattern"):
            out.append(p); continue
        if domain:
            fmts = ([p["firm_pattern"]] + formats) if p.get("firm_pattern") else formats
            p["candidates"] = _permutations(p.get("first_name", ""), p.get("last_name", ""), domain, fmts)
            if p["candidates"]:
                gaps += 1
        out.append(p)
    _write(args.outfile, out)
    solved = sum(1 for p in out if p.get("email_status") in ("published", "pattern"))
    cand = sum(len(p["candidates"]) for p in out)
    print(f"permute: {solved} already solved by harvest; {gaps} gap leads → {cand} candidates to verify → {args.outfile}")
    return 0


# ---------- stage 4: verify (pluggable: ZeroBounce | MillionVerifier) ----------

def _verifier():
    """Return (name, fn(list[email]) -> {email: status}) for whichever key is valid, else (None, None)."""
    zb = os.getenv("ZEROBOUNCE_API_KEY", "").strip()
    mv = os.getenv("MILLIONVERIFIER_API_KEY", "").strip()
    if zb:
        try:
            c = requests.get(f"https://api.zerobounce.net/v2/getcredits?api_key={zb}", timeout=15).json()
            if int(c.get("Credits", -1)) > 0:
                return "zerobounce", lambda emails: _zb_batch(emails, zb)
        except (requests.RequestException, ValueError):
            pass
    if mv:
        return "millionverifier", lambda emails: _mv_each(emails, mv)
    return None, None

def _zb_batch(emails, key):
    result = {}
    for i in range(0, len(emails), 100):
        chunk = emails[i:i + 100]
        body = {"api_key": key, "email_batch": [{"email_address": e, "ip_address": ""} for e in chunk]}
        try:
            r = requests.post("https://api.zerobounce.net/v2/validatebatch", json=body, timeout=60)
            for row in r.json().get("email_batch", []):
                result[row.get("address", "")] = row.get("status", "unknown")
        except requests.RequestException:
            for e in chunk:
                result[e] = "error"
        time.sleep(0.3)
    return result

def _mv_each(emails, key):
    result = {}
    for e in emails:
        try:
            r = requests.get("https://api.millionverifier.com/api/v3/",
                             params={"api": key, "email": e}, timeout=20).json()
            # MV result: good / risky / bad -> map to zerobounce-ish
            q = r.get("result", "unknown")
            result[e] = {"good": "valid", "risky": "catch-all", "bad": "invalid"}.get(q, q)
        except requests.RequestException:
            result[e] = "error"
        time.sleep(0.1)
    return result

def cmd_verify(args):
    name, verify_fn = _verifier()
    people = _read(args.infile)
    if not verify_fn:
        # No working verifier. KEEP harvested published/pattern emails (they need no verification);
        # only the permuted gap candidates are held back as unverified.
        kept = 0
        for p in people:
            if p.get("email") and p.get("email_status") in ("published", "pattern"):
                kept += 1
                continue
            p["email"] = ""
            p["email_status"] = "UNVERIFIED_NO_VERIFIER"
        _write(args.outfile, people)
        print(f"verify: no verifier set — kept {kept} harvested (published/pattern) emails as email-ready; "
              "held back permuted-gap candidates. Set a verifier (SmartLead's own, ZeroBounce, or MillionVerifier) "
              "to recover the gaps.", file=sys.stderr)
        return 0
    print(f"verify: using {name}")
    # Harvest-solved leads (published/pattern) need no SMTP verification — skip them.
    solved = [p for p in people if p.get("email") and p.get("email_status") in ("published", "pattern")]
    todo = [p for p in people if p not in solved]
    if solved:
        print(f"verify: skipping {len(solved)} leads already solved by harvest")
    # Per-firm pattern detection: verify all candidates for the FIRST lead at each firm,
    # learn the winning format, then verify only that format for the firm's other leads.
    by_firm = {}
    for p in todo:
        by_firm.setdefault(_norm_firm(p.get("company_name", "")), []).append(p)

    valid_count = 0
    for firm, members in by_firm.items():
        members = [m for m in members if m.get("candidates")]
        if not members:
            continue
        # 1) probe with the first member's full candidate set
        probe = members[0]
        statuses = verify_fn(probe["candidates"])
        pattern_local = None
        for addr in probe["candidates"]:
            st = statuses.get(addr, "unknown")
            if st == "valid":
                probe["email"], probe["email_status"] = addr, "valid"
                pattern_local = addr.split("@")[0]
                valid_count += 1
                break
        else:
            # no valid in probe; keep best catch-all if any, else mark none
            ca = next((a for a in probe["candidates"] if statuses.get(a) == "catch-all"), "")
            probe["email"], probe["email_status"] = (ca, "catch-all") if ca else ("", "no-valid")
        # 2) apply learned pattern (or fall back to full probe) to the rest
        for m in members[1:]:
            if pattern_local:
                # rebuild the same local-part style for this person
                guess = _apply_pattern(pattern_local, probe, m)
                st = verify_fn([guess]).get(guess, "unknown") if guess else "unknown"
                if st == "valid":
                    m["email"], m["email_status"] = guess, "valid"; valid_count += 1
                elif st == "catch-all":
                    m["email"], m["email_status"] = guess, "catch-all"
                else:
                    m["email"], m["email_status"] = "", "no-valid"
            else:
                st_map = verify_fn(m["candidates"])
                v = next((a for a in m["candidates"] if st_map.get(a) == "valid"), "")
                m["email"], m["email_status"] = (v, "valid") if v else ("", "no-valid")
                if v:
                    valid_count += 1
        time.sleep(0.1)
    _write(args.outfile, people)
    print(f"verify: {valid_count} valid emails found → {args.outfile}")
    return 0

def _apply_pattern(sample_local, sample_person, target):
    """Given the winning local-part for one person at a firm, produce the same format for another."""
    sf, sl = _slug(sample_person.get("first_name")), _slug(sample_person.get("last_name"))
    tf, tl = _slug(target.get("first_name")), _slug(target.get("last_name"))
    if not tf or not tl:
        return ""
    local = sample_local
    # substitute the sample's name tokens with the target's (longest first to avoid partial hits)
    if sf and sf in local:
        local = local.replace(sf, tf)
    elif sf:
        local = local.replace(sf[0], tf[0], 1)
    if sl and sl in local:
        local = local.replace(sl, tl)
    domain = sample_person.get("company_domain", "")
    return f"{local}@{domain}" if domain else ""


# ---------- stage 5: build /ca-outbound-compatible list ----------

def cmd_build(args):
    people = _read(args.infile)
    run = args.run or time.strftime("%Y-%m-%d") + "-list"
    out = ROOT / "outputs" / "ca-outbound" / run / "leads.json"
    # published = real scraped email (best); pattern = firm-pattern-derived (high confidence);
    # valid = SMTP-verified permutation. catch-all only if the operator opts in.
    keep_status = {"published", "pattern", "valid"}
    if args.include_catch_all:
        keep_status.add("catch-all")
    leads, seen = [], set()
    for p in people:
        email = (p.get("email") or "").lower()
        if not email or p.get("email_status") not in keep_status or email in seen:
            continue
        seen.add(email)
        leads.append({
            "lead_id": p.get("lead_id"), "first_name": p.get("first_name"), "last_name": p.get("last_name"),
            "email": email, "company_name": p.get("company_name"), "company_domain": p.get("company_domain"),
            "title": p.get("title", ""), "phone": p.get("phone", ""), "industry": "Legal",
            "summary": p.get("summary", ""), "email_status": p.get("email_status"),
        })
    _write(out, leads)
    # also drop a phone-only call list for the registry leads that never got an email
    calls = [{"first_name": p.get("first_name"), "last_name": p.get("last_name"),
              "company_name": p.get("company_name"), "phone": p.get("phone", ""), "city": p.get("city", "")}
             for p in people if p.get("phone") and (p.get("email_status") not in keep_status)]
    _write(out.parent / "call-list.json", calls)
    print(f"build: {len(leads)} email-ready leads → {out}")
    print(f"       {len(calls)} phone-only leads → {out.parent / 'call-list.json'}")
    print(f"→ feed the email list to /ca-outbound (it can skip AI Ark and use this directly).")
    return 0


# ---------- orchestrator ----------

def cmd_run(args):
    run = time.strftime("%Y-%m-%d") + f"-{args.icp}"
    d = ROOT / "outputs" / "ca-outbound" / run
    d.mkdir(parents=True, exist_ok=True)
    reg, firms = d / "registry.json", d / "firms.json"
    harv, cand, ver = d / "harvested.json", d / "candidates.json", d / "verified.json"
    print(f"=== waterfall run: {args.icp} (limit {args.limit}) ===")
    if args.icp == "ny-law":
        rc = cmd_registry_ny_law(argparse.Namespace(counties=args.counties, limit=args.limit, outfile=str(reg)))
        if rc: return rc
    else:
        print(f"icp '{args.icp}' not wired yet (only ny-law). Use registry-ny-law or add a Maps discover stage.", file=sys.stderr)
        return 1
    cmd_resolve_domains(argparse.Namespace(infile=str(reg), outfile=str(firms), max_firms=args.max_firms, dry_run=False))
    cmd_harvest(argparse.Namespace(infile=str(reg), firms=str(firms), outfile=str(harv),
                                   max_firms=args.max_firms, max_pages_per_firm=args.max_pages_per_firm, dry_run=False))
    cmd_permute(argparse.Namespace(infile=str(harv), firms=str(firms), outfile=str(cand), formats=args.formats))
    cmd_verify(argparse.Namespace(infile=str(cand), outfile=str(ver)))
    cmd_build(argparse.Namespace(infile=str(ver), run=run, include_catch_all=False))
    return 0


def main():
    p = argparse.ArgumentParser(description="CA lead waterfall — self-source leads cheaply; AI Ark is gap-filler only.")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("registry-ny-law"); r.add_argument("--counties", default=None)
    r.add_argument("--limit", type=int, default=1000); r.add_argument("--out", dest="outfile", required=True)
    r.set_defaults(func=cmd_registry_ny_law)

    d = sub.add_parser("resolve-domains"); d.add_argument("--in", dest="infile", required=True)
    d.add_argument("--out", dest="outfile", required=True); d.add_argument("--max-firms", type=int, default=200)
    d.add_argument("--dry-run", action="store_true"); d.set_defaults(func=cmd_resolve_domains)

    h = sub.add_parser("harvest"); h.add_argument("--in", dest="infile", required=True)
    h.add_argument("--firms", required=True); h.add_argument("--out", dest="outfile", required=True)
    h.add_argument("--max-firms", type=int, default=200); h.add_argument("--max-pages-per-firm", type=int, default=6)
    h.add_argument("--dry-run", action="store_true"); h.set_defaults(func=cmd_harvest)

    pm = sub.add_parser("permute"); pm.add_argument("--in", dest="infile", required=True)
    pm.add_argument("--firms", default=None); pm.add_argument("--out", dest="outfile", required=True)
    pm.add_argument("--formats", type=int, default=4); pm.set_defaults(func=cmd_permute)

    v = sub.add_parser("verify"); v.add_argument("--in", dest="infile", required=True)
    v.add_argument("--out", dest="outfile", required=True); v.set_defaults(func=cmd_verify)

    b = sub.add_parser("build"); b.add_argument("--in", dest="infile", required=True)
    b.add_argument("--run", default=None); b.add_argument("--include-catch-all", action="store_true")
    b.set_defaults(func=cmd_build)

    ru = sub.add_parser("run"); ru.add_argument("--icp", default="ny-law"); ru.add_argument("--counties", default=None)
    ru.add_argument("--limit", type=int, default=1000); ru.add_argument("--max-firms", type=int, default=200)
    ru.add_argument("--max-pages-per-firm", type=int, default=6)
    ru.add_argument("--formats", type=int, default=4); ru.set_defaults(func=cmd_run)

    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
