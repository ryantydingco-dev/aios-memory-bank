#!/usr/bin/env python3
"""Buyer Profile Enricher — the core engine for the AI Contact Form offer (IdeaBrowser #7856).

Turns a single inbound lead (company domain, optional name/email/form-answers) into a
full BUYER PROFILE — the thing a "Contact Us" form throws away: company size, funding,
what they do, tech-stack hints, decision-makers, ICP-fit read, and a rep call-prep brief.

This is BOTH:
  - the free "contact-form teardown" lead magnet (run on a prospect's own site), AND
  - the core of the paid product (run on each real inbound lead).

Data path = FREE/cheap (no Apollo dependency — that key is dead):
  Firecrawl scrape of the company site + Firecrawl search for funding/size signals
  → Claude assembles the structured profile. ~pennies/lead.

Env (aios-starter-kit/.env): FIRECRAWL_API_KEY, ANTHROPIC_API_KEY.

Usage:
  python3 buyer_profile_enricher.py --domain hightouch.com \
      [--name "Jane Doe"] [--email jane@hightouch.com] \
      [--form "interested in enterprise plan, ~50 seats, Q3 timeline"] \
      [--icp "mid-market B2B SaaS, $10k+ ACV, sales-led"] \
      --out profile.json [--md profile.md]
"""
import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error

FIRECRAWL = os.environ.get("FIRECRAWL_API_KEY", "")
ANTHROPIC = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-sonnet-4-6"


def _post(url, headers, body, timeout=90):
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={**headers, "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace") or "{}")


def fc_scrape(url):
    if not FIRECRAWL:
        return ""
    try:
        u = url if url.startswith("http") else "https://" + url
        r = _post("https://api.firecrawl.dev/v1/scrape",
                  {"Authorization": f"Bearer {FIRECRAWL}"},
                  {"url": u, "formats": ["markdown"]}, timeout=70)
        return ((r.get("data") or {}).get("markdown") or "")[:12000]
    except Exception as e:  # noqa: BLE001
        print(f"  [scrape] {repr(e)[:90]}", file=sys.stderr)
        return ""


def _company_from(site_md, domain):
    """Best-effort company name for the person search: first H1/title in the scrape, else domain stem."""
    if site_md:
        m = re.search(r"^#\s+(.+)$", site_md, re.M)
        if m:
            return re.split(r"[|\-–—:]", m.group(1).strip())[0].strip()[:60]
    return re.sub(r"\.(com|io|ai|co|net|org|app|dev).*$", "", domain, flags=re.I).split(".")[-1].capitalize()


def fc_search(query, limit=4):
    if not FIRECRAWL:
        return []
    try:
        r = _post("https://api.firecrawl.dev/v1/search",
                  {"Authorization": f"Bearer {FIRECRAWL}"},
                  {"query": query, "limit": limit}, timeout=45)
        return [{"title": x.get("title", ""), "url": x.get("url", ""),
                 "snippet": (x.get("description") or x.get("snippet") or "")[:400]}
                for x in (r.get("data") or [])]
    except Exception as e:  # noqa: BLE001
        print(f"  [search] {repr(e)[:90]}", file=sys.stderr)
        return []


PROFILE_PROMPT = """You build a B2B BUYER PROFILE from raw research about a company that just submitted an inbound lead. The point: a contact form returns name+email; you return what the sales rep actually needs before calling back.

Use ONLY the provided research. If a field isn't supported, say "unknown" — DO NOT invent (a fabricated profile destroys trust; this gets shown to the prospect). Cite nothing you can't see in the inputs.

Return STRICT JSON:
{
 "company": "", "domain": "", "what_they_do": "",
 "company_size": "", "funding": "", "industry": "", "hq": "",
 "tech_stack_hints": [], "likely_decision_makers": [],
 "icp_fit": {"verdict":"strong|medium|weak|unknown","why":""},
 "intent_signals": "",            // from form answers if provided, else "form captured none"
 "rep_brief": "",                  // 2-3 sentences: what the rep should know + lead with on the callback
 "data_gaps": []                   // what a form/this enrichment still couldn't determine
}
No prose outside the JSON."""


# --- person-level enrichment ------------------------------------------------
# A contact form gives you the lead's NAME + work email. That turns
# person-identification from "hard" (cold outbound) into "very doable": a
# targeted "<name> <company> LinkedIn" search is exactly how a human SDR finds
# the title. Free (Firecrawl search) and — for the inbound case — reliable.
PERSON_PROMPT = """You identify WHO a person is professionally. They just filled out a contact form; you have their name and company. From the search results, determine their role.

Use ONLY the provided search results. If the title/seniority can't be confirmed, say "unknown" — DO NOT guess (a fabricated title gets shown to the prospect and destroys trust). Only return a linkedin_url that actually appears in the results.

Return STRICT JSON:
{
 "full_name": "",
 "title": "",
 "seniority": "ic|manager|director|vp|c-level|founder-owner|unknown",
 "linkedin_url": "",
 "role_in_buying": "economic-buyer|champion|influencer|end-user|unknown",
 "person_confidence": "high|medium|low|none",
 "person_notes": ""
}
No prose outside the JSON."""


def _name_from_email(email):
    """Fallback: derive a probable name from a work email local-part."""
    if not email or "@" not in email:
        return ""
    local = email.split("@", 1)[0]
    if any(g in local.lower() for g in ("info", "sales", "hello", "team", "admin", "contact", "support")):
        return ""  # role inbox, not a person
    parts = re.split(r"[._\-]+", local)
    parts = [p for p in parts if p and not p.isdigit()]
    return " ".join(p.capitalize() for p in parts) if parts else ""


def enrich_person(name, email, company, domain):
    """name (+company) -> person profile via free Firecrawl search. Honest: 'none' if no name."""
    name = name or _name_from_email(email)
    if not name:
        return {"full_name": "", "seniority": "unknown", "person_confidence": "none",
                "person_notes": "form gave no usable name (role inbox or blank) — person can't be identified"}
    label = company or domain or ""
    hits, seen = [], set()
    for q in (f"{name} {label} LinkedIn", f"{name} {label} title"):
        for x in fc_search(q, 4):
            u = x.get("url", "")
            if u in seen:
                continue
            seen.add(u)
            hits.append(x)
    if not ANTHROPIC or not hits:
        return {"full_name": name, "seniority": "unknown",
                "person_confidence": "low" if hits else "none",
                "person_notes": "no public profile surfaced for this name+company" if not hits else "search hits found but not assessed"}
    inputs = {"form_name": name, "company": label, "lead_email": email or "unknown", "search_results": hits}
    try:
        r = _post("https://api.anthropic.com/v1/messages",
                  {"x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01"},
                  {"model": MODEL, "max_tokens": 700,
                   "messages": [{"role": "user", "content": PERSON_PROMPT + "\n\nSEARCH RESULTS:\n" + json.dumps(inputs, indent=2)}]},
                  timeout=60)
    except Exception as e:  # noqa: BLE001
        print(f"  [person] {repr(e)[:90]}", file=sys.stderr)
        return {"full_name": name, "seniority": "unknown", "person_confidence": "low", "person_notes": "enrichment error"}
    text = "".join(b.get("text", "") for b in r.get("content", []))
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return {"full_name": name, "seniority": "unknown", "person_confidence": "low", "person_notes": "no JSON from person model"}
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return {"full_name": name, "seniority": "unknown", "person_confidence": "low", "person_notes": "person JSON parse failed"}


def enrich(domain, name, email, form, icp):
    site = fc_scrape(domain)
    fund = fc_search(f"{domain} funding round valuation employees headcount", 4)
    news = fc_search(f"{domain} company what they do product customers", 3)
    person = enrich_person(name, email, _company_from(site, domain), domain)
    inputs = {
        "domain": domain, "lead_name": name or "unknown",
        "lead_email": email or "unknown", "form_answers": form or "none",
        "our_icp_definition": icp or "B2B, high-ACV, sales-led, inbound traffic",
        "company_site_markdown": site[:9000],
        "funding_search": fund, "company_search": news,
        "person_lookup": person,
    }
    if not ANTHROPIC:
        print("  [llm] ANTHROPIC_API_KEY missing — returning raw research only", file=sys.stderr)
        return {"company": domain, "_raw_only": True, "research": inputs}
    try:
        r = _post("https://api.anthropic.com/v1/messages",
                  {"x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01"},
                  {"model": MODEL, "max_tokens": 2000,
                   "messages": [{"role": "user", "content": PROFILE_PROMPT + "\n\nRESEARCH:\n" + json.dumps(inputs, indent=2)}]},
                  timeout=120)
    except urllib.error.HTTPError as e:
        print(f"  [llm] HTTP {e.code}: {e.read().decode('utf-8','replace')[:200]}", file=sys.stderr)
        return {"company": domain, "error": "llm_failed"}
    text = "".join(b.get("text", "") for b in r.get("content", []))
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        print(f"  [llm] no JSON. head: {text[:200]}", file=sys.stderr)
        return {"company": domain, "error": "no_json"}
    try:
        prof = json.loads(m.group(0))
        prof["domain"] = domain
        prof["person"] = person
        return prof
    except json.JSONDecodeError as e:
        print(f"  [llm] parse fail: {e}", file=sys.stderr)
        return {"company": domain, "error": "parse_failed", "person": person}


def _dm_str(d):
    """Normalize a decision-maker entry (string OR {name,title,role,email}) to one line."""
    if isinstance(d, str):
        return d
    if isinstance(d, dict):
        bits = [d.get("name", "")]
        if d.get("title"):
            bits.append(f"— {d['title']}")
        if d.get("email"):
            bits.append(f"({d['email']})")
        return " ".join(b for b in bits if b).strip() or "—"
    return str(d)


def to_md(p, name, email, form):
    L = [f"# Buyer Profile — {p.get('company', p.get('domain'))}\n"]
    L.append("> What your contact form captured vs. what your rep could have known before calling back.\n")
    L.append("## What the form gave you")
    L.append(f"- Name: {name or '—'}")
    L.append(f"- Email: {email or '—'}")
    L.append(f"- Message: {form or '—'}\n")
    pr = p.get("person") or {}
    if pr.get("full_name") or pr.get("title"):
        conf = pr.get("person_confidence", "?")
        L.append("## Who actually filled out the form")
        line = f"- **{pr.get('full_name','?')}**"
        if pr.get("title"):
            line += f" — {pr.get('title')}"
        if pr.get("seniority") and pr.get("seniority") != "unknown":
            line += f"  ·  _{pr.get('seniority')}_"
        L.append(line)
        if pr.get("role_in_buying") and pr["role_in_buying"] != "unknown":
            L.append(f"- **Role in the deal:** {pr['role_in_buying']}")
        if pr.get("linkedin_url"):
            L.append(f"- **LinkedIn:** {pr['linkedin_url']}")
        if pr.get("person_notes"):
            L.append(f"- {pr['person_notes']}")
        L.append(f"- _person-match confidence: {conf}_\n")
    L.append("## What the buyer profile adds (auto-built)")
    L.append(f"- **Company:** {p.get('company','?')} — {p.get('what_they_do','?')}")
    L.append(f"- **Size:** {p.get('company_size','?')}  ·  **HQ:** {p.get('hq','?')}  ·  **Industry:** {p.get('industry','?')}")
    L.append(f"- **Funding:** {p.get('funding','?')}")
    ts = p.get("tech_stack_hints") or []
    if ts:
        L.append(f"- **Tech stack hints:** {', '.join(ts)}")
    dm = p.get("likely_decision_makers") or []
    if dm:
        L.append(f"- **Likely decision-makers:** {', '.join(_dm_str(d) for d in dm)}")
    fit = p.get("icp_fit") or {}
    L.append(f"- **ICP fit:** {fit.get('verdict','?')} — {fit.get('why','')}")
    L.append(f"- **Intent signal:** {p.get('intent_signals','—')}")
    L.append(f"\n## Rep call-prep brief\n{p.get('rep_brief','—')}")
    gaps = p.get("data_gaps") or []
    if gaps:
        L.append(f"\n_Still unknown (be honest with the prospect): {', '.join(gaps)}_")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain", required=True)
    ap.add_argument("--name", default="")
    ap.add_argument("--email", default="")
    ap.add_argument("--form", default="", help="what the lead typed into the form")
    ap.add_argument("--icp", default="")
    ap.add_argument("--out", default="buyer_profile.json")
    ap.add_argument("--md", default="")
    args = ap.parse_args()
    print(f"[enricher] {args.domain} …")
    prof = enrich(args.domain, args.name, args.email, args.form, args.icp)
    json.dump(prof, open(args.out, "w"), indent=2)
    print(f"  → {args.out}")
    if args.md:
        open(args.md, "w").write(to_md(prof, args.name, args.email, args.form))
        print(f"  → {args.md}")
    fit = (prof.get("icp_fit") or {}).get("verdict", "?")
    print(f"  company={prof.get('company','?')} size={prof.get('company_size','?')} fit={fit}")


if __name__ == "__main__":
    main()
