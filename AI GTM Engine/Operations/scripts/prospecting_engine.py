#!/usr/bin/env python3
"""Prospecting Engine — finds LAYUPS for the Dealthreads AI Contact Form offer.

ICP (locked): founder-led B2B, ~10-40 ppl, $8k+ deals, a real "Request a Demo" form,
sales-led, no RevOps stack. Beachhead = boring vertical SaaS + B2B running paid ads to a form.

Pipeline:
  1. SOURCE   candidate company domains by searching the beachhead verticals (Firecrawl).
  2. SCORE    each 0-4 on stacked buying signals — ALL detected, never guessed:
                +1 hiring sales/RevOps now   (Greenhouse/Lever/Ashby public APIs)
                +1 recently funded (2025-26)  (Firecrawl search, evidence stored)
                +1 running paid ads           (ad/conversion pixels in their site HTML)
                +1 chat/Drift-Qualified tool  (chat widget in their site HTML)
  3. QUALIFY  hard gate = has a demo/contact-sales form (no form -> SKIP).
  4. RANK     qualified + score>=2 -> HOT (1:1 teardown tier); score 1 -> WARM; 0 -> COOL.

Output: ranked CSV + JSON. Then feed the HOT tier to buyer_profile_enricher + teardown_page.

Env (aios-starter-kit/.env): FIRECRAWL_API_KEY, ANTHROPIC_API_KEY (ANTHROPIC optional here).

Usage:
  python3 prospecting_engine.py --verticals "freight,construction" --per-query 6 --out targets
"""
import argparse
import json
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buyer_profile_enricher as bpe  # reuse fc_search, _post, FIRECRAWL

# vertical -> search queries biased toward SMALL/founder-led players (not category giants)
VERTICALS = {
    "freight": ["freight broker software for small brokerages", "new TMS startup for freight brokers", "niche 3PL software startup"],
    "construction": ["construction management software for small contractors", "construction software startup", "subcontractor bidding software for small builders"],
    "fieldservice": ["field service software for small business", "HVAC software startup for contractors", "scheduling software for small service businesses"],
    "manufacturing": ["manufacturing software startup for small manufacturers", "shop floor software for small manufacturers", "niche MES software for SMB"],
    "healthcareops": ["practice management software for small clinics", "behavioral health EHR startup", "medical billing software for small practices"],
    "legalops": ["legal software for small law firms", "case management software startup for attorneys", "legal billing software for solo firms"],
}

AGGREGATORS = ("g2.com", "capterra.", "getapp.", "softwareadvice", "trustradius", "wikipedia.",
               "reddit.com", "youtube.com", "linkedin.com", "facebook.com", "twitter.com", "x.com",
               "medium.com", "forbes.com", "gartner.com", "techcrunch.com", "crunchbase.com",
               "glassdoor.", "indeed.", "producthunt.", "github.com", "apple.com", "play.google",
               "instagram.", "pinterest.", "quora.", "g2crowd", "trustpilot", "yelp.",
               "ycombinator", "ventures.", "vccafe", "coverage.com", "constructioncoverage",
               "builtin.", "clutch.co", "goodfirms", "softwarefinder", "selecthub", "wikiwand",
               ".gov", ".edu", "investopedia", "nerdwallet", "businessinsider",
               # CDN / infra / asset hosts
               "website-files.com", "fbcdn.net", "cloudfront.net", "amazonaws.com", "ctfassets.net",
               "cloudflare", "akamai", "googleapis", "gstatic", "wp.com", "imgix", "fastly",
               "jsdelivr", "unpkg", "squarespace-cdn", "shopifycdn", "vimeocdn", "ytimg", "cdn.",
               "wistia.com", "vimeo.com", "typeform.com", "calendly.com", "hubspot.com",
               # research firms / publishers / consultancies
               "fortunebusinessinsights", "mckinsey", "mordorintelligence", "grandviewresearch",
               "statista", "marketsandmarkets", "prnewswire", "businesswire", "prweb", "hbr.org",
               "deloitte", "accenture", "bcg.com", "idc.com", "techradar", "pcmag", "zapier.com",
               "financesonline", "fitsmallbusiness", "selectsoftware", "datacenter")

DEMO_FORM = re.compile(r"request a demo|book a demo|get a demo|schedule a demo|talk to sales|contact sales|request a quote|get started free|book a call|request pricing", re.I)
ADS_PIXEL = re.compile(r"fbq\(|connect\.facebook\.net|googleadservices|googleads\.g\.doubleclick|gtag\('config',\s*'aw-|aw-\d{9}|_linkedin_partner_id|snap\.licdn\.com|bat\.bing\.com|static\.ads-twitter", re.I)
CHAT_TOOL = re.compile(r"js\.driftt\.com|drift\.com/|qualified\.com|q\.qualified|widget\.intercom\.io|js\.intercomcdn|js\.hs-scripts\.com.*conversations|tidio|crisp\.chat|js\.chilipiper", re.I)
SALES_ROLE = re.compile(r"\b(sdr|bdr|sales development|account executive|\bae\b|revops|revenue operations|sales operations|sales ops|demand gen|head of sales|vp,? sales|gtm|growth marketer|sales engineer)\b", re.I)


def reg_domain(url):
    m = re.match(r"https?://([^/]+)", url or "")
    if not m:
        return ""
    host = m.group(1).lower().lstrip("www.")
    parts = host.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def source_candidates(verticals, per_query):
    seen, out = set(), []
    for v in verticals:
        for q in VERTICALS.get(v, [v + " software"]):
            for r in bpe.fc_search(q, per_query):
                d = reg_domain(r.get("url", ""))
                if not d or d in seen or any(a in d for a in AGGREGATORS):
                    continue
                seen.add(d)
                out.append({"domain": d, "vertical": v, "found_via": q})
    return out


# listicle/directory queries — these pages ENUMERATE small/niche vendors and link to them
LISTICLE_Q = {
    "freight": ["best TMS software for small freight brokers", "best freight broker software for small business"],
    "construction": ["best construction management software for small contractors", "best construction software for small business"],
    "fieldservice": ["best field service software for small business", "best HVAC software for small contractors"],
    "manufacturing": ["best manufacturing software for small manufacturers", "best ERP for small manufacturing business"],
    "healthcareops": ["best practice management software for small practices", "best EHR for small medical practices"],
    "legalops": ["best legal practice management software for small firms", "best case management software for small law firms"],
}


def source_by_directory(verticals, max_lists=3, max_links=14):
    """Find listicle/'best X software for small business' pages and harvest the vendor links
    they point to. Listicles enumerate the SMALL players that generic search buries."""
    seen, out = set(), []
    for v in verticals:
        for q in LISTICLE_Q.get(v, ["best " + v + " software for small business"]):
            lists = bpe.fc_search(q, max_lists)
            for lst in lists:
                lst_url = lst.get("url", "")
                lst_dom = reg_domain(lst_url)
                md = bpe.fc_scrape(lst_url)
                if not md:
                    continue
                links = re.findall(r"\((https?://[^)\s]+)\)", md)
                added = 0
                for link in links:
                    d = reg_domain(link)
                    if (not d or d in seen or d == lst_dom or any(a in d for a in AGGREGATORS)):
                        continue
                    seen.add(d)
                    out.append({"domain": d, "vertical": v, "found_via": f"list:{q[:40]}"})
                    added += 1
                    if added >= max_links:
                        break
    return out


def scrape(domain):
    """Returns (markdown, rawHtml). Markdown is JS-RENDERED (catches 'Request a Demo' CTAs that
    raw HTML misses); rawHtml carries the <script> tags needed to detect ad/chat pixels."""
    try:
        r = bpe._post("https://api.firecrawl.dev/v1/scrape",
                      {"Authorization": f"Bearer {bpe.FIRECRAWL}"},
                      {"url": "https://" + domain, "formats": ["markdown", "rawHtml"]}, timeout=70)
        data = r.get("data") or {}
        return (data.get("markdown") or "")[:120000], (data.get("rawHtml") or "")[:300000]
    except Exception as e:  # noqa: BLE001
        print(f"  [scrape] {domain}: {repr(e)[:70]}", file=sys.stderr)
        return "", ""


def ats_hiring(stem):
    """Best-effort: try Greenhouse/Lever/Ashby boards under the company slug for sales/RevOps roles."""
    endpoints = [
        ("greenhouse", f"https://boards-api.greenhouse.io/v1/boards/{stem}/jobs?content=false", "jobs", "title"),
        ("lever", f"https://api.lever.co/v0/postings/{stem}?mode=json", None, "text"),
        ("ashby", f"https://api.ashbyhq.com/posting-api/job-board/{stem}?includeCompensation=false", "jobs", "title"),
    ]
    for _name, url, key, field in endpoints:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=12) as resp:
                if resp.status != 200:
                    continue
                data = json.loads(resp.read().decode("utf-8", "replace") or "[]")
        except Exception:  # noqa: BLE001
            continue
        jobs = data.get(key, []) if key else (data if isinstance(data, list) else [])
        titles = [j.get(field, "") for j in jobs if isinstance(j, dict)]
        hits = [t for t in titles if SALES_ROLE.search(t or "")]
        if hits:
            return hits[:4]
    return []


DB_DOMAINS = ("tracxn", "growjo", "pitchbook", "cbinsights", "crunchbase", "owler", "zoominfo",
              "leadiq", "rocketreach", "apollo.io", "dnb.com", "6sense", "latka", "getlatka", "datanyze")
RAISE = re.compile(r"(rais|secur|clos|land|bag|nab|announc)\w*\s+(a\s+|an\s+|its\s+|\$)?\$?\d[\d.,]*\s*(m|k|b|million|billion)?|series\s+[a-d]\b|seed (round|funding)|pre-seed", re.I)


def _raise_millions(blob):
    """Parse the $ amount of a raise into millions; None if not found."""
    m = re.search(r"\$\s?(\d+(?:\.\d+)?)\s*(b|bn|billion|m|mm|million|k|thousand)?", blob, re.I)
    if not m:
        return None
    n = float(m.group(1))
    unit = (m.group(2) or "m").lower()
    if unit.startswith("b"):
        return n * 1000
    if unit.startswith("k") or unit.startswith("thous"):
        return n / 1000
    return n


def funded_recent(stem):
    """STRICT: needs a real raise phrase + recent year, from a NON-database source. Also flags
    big=True for large rounds ($25M+ or Series C+) — those aren't 10-40-person founder-led layups."""
    hits = bpe.fc_search(f'"{stem}" raises OR raised OR secures funding 2025 OR 2026', 4)
    for h in hits:
        url = (h.get("url") or "").lower()
        if any(db in url for db in DB_DOMAINS):
            continue
        blob = (h.get("title", "") + " " + h.get("snippet", "")).strip()
        if ("2025" in blob or "2026" in blob) and RAISE.search(blob):
            amt = _raise_millions(blob)
            ser = re.search(r"series\s+([a-e])", blob, re.I)
            big = bool((amt and amt >= 25) or (ser and ser.group(1).lower() >= "c"))
            return {"evidence": h.get("title", "")[:90], "url": h.get("url", ""),
                    "amount_m": amt, "big": big}
    return None


def strip_text(html):
    html = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", " ", html, flags=re.I)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


SIZE_PROMPT = """From this company homepage text, judge the company's size for a "small founder-led" filter.
Return STRICT JSON: {"emp_estimate":"", "big_or_public": true|false, "founder_led_smb": true|false}
- big_or_public = true if it reads as an ESTABLISHED or SCALED company, not a small startup. Signals:
  "trusted by thousands / 10,000+ firms", many customer logos, multiple offices, enterprise/Fortune
  customers, publicly traded, IR pages, 100+ employees, years of awards, "the leading/#1 platform".
- founder_led_smb = true only if it plausibly reads as a small/early founder-led company (~under ~60 employees).
When the signals point to scale, prefer big_or_public=true. No prose."""


def size_gate(text):
    if not bpe.ANTHROPIC or not text:
        return {}
    try:
        r = bpe._post("https://api.anthropic.com/v1/messages",
                      {"x-api-key": bpe.ANTHROPIC, "anthropic-version": "2023-06-01"},
                      {"model": bpe.MODEL, "max_tokens": 150,
                       "messages": [{"role": "user", "content": SIZE_PROMPT + "\n\nHOMEPAGE:\n" + text[:3500]}]},
                      timeout=40)
        t = "".join(b.get("text", "") for b in r.get("content", []))
        m = re.search(r"\{.*\}", t, re.S)
        return json.loads(m.group(0)) if m else {}
    except Exception:  # noqa: BLE001
        return {}


def score(cand):
    domain = cand["domain"]
    stem = domain.split(".")[0]
    md, html = scrape(domain)
    has_form = bool(DEMO_FORM.search(md) or DEMO_FORM.search(html))  # md = rendered, catches JS CTAs
    runs_ads = bool(ADS_PIXEL.search(html))
    chat = bool(CHAT_TOOL.search(html))
    # size gate only on form-qualified candidates (saves LLM calls); giants get demoted
    size = size_gate(md or strip_text(html)) if has_form else {}
    big_size = bool(size.get("big_or_public"))
    hiring = ats_hiring(stem) if (has_form and not big_size) else []
    funded = funded_recent(stem) if (has_form and not big_size) else None
    big = big_size or bool((funded or {}).get("big"))  # big raise ($25M+/Series C+) = not a layup

    signals = []
    if hiring:
        signals.append("hiring-sales")
    if funded:
        signals.append("funded-recent")
    if runs_ads:
        signals.append("runs-ads")
    if chat:
        signals.append("chat-tool")
    sig_score = len(signals)

    if not md and not html:
        tier = "UNREACHABLE"
    elif not has_form:
        tier = "SKIP (no demo form)"
    elif big:
        tier = "SKIP (too big)"
    elif sig_score >= 2:
        tier = "HOT (1:1 teardown)"
    elif sig_score == 1:
        tier = "WARM (cold email)"
    else:
        tier = "COOL (qualified, no signal yet)"

    return {**cand, "has_demo_form": has_form, "emp_estimate": size.get("emp_estimate", ""),
            "signal_score": sig_score, "signals": signals, "runs_ads": runs_ads, "chat_tool": chat,
            "hiring_roles": hiring, "funded": funded, "tier": tier}


TIER_RANK = {"HOT (1:1 teardown)": 3, "WARM (cold email)": 2, "COOL (qualified, no signal yet)": 1,
             "SKIP (no demo form)": 0, "SKIP (too big)": 0, "UNREACHABLE": -1}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--verticals", default="freight,construction",
                    help="comma list from: " + ",".join(VERTICALS))
    ap.add_argument("--per-query", type=int, default=6)
    ap.add_argument("--source", default="directory", choices=["directory", "search"],
                    help="directory = harvest small vendors from listicles (better yield); search = generic")
    ap.add_argument("--limit", type=int, default=0, help="cap candidates scored (0=all)")
    ap.add_argument("--infile", default="", help="score a provided list instead of searching: "
                    "a file of domains (one per line) or a CSV with a 'domain' column (e.g. AI ARK export)")
    ap.add_argument("--out", default="targets")
    args = ap.parse_args()

    if args.infile:
        cands = []
        for ln in open(args.infile):
            ln = ln.strip().strip('"')
            if not ln or ln.lower() in ("domain", "website", "url"):
                continue
            d = reg_domain(ln if ln.startswith("http") else "https://" + ln.split(",")[0])
            if d:
                cands.append({"domain": d, "vertical": "provided", "found_via": "infile"})
        print(f"[source] {len(cands)} domains from {args.infile}")
    else:
        vs = [v.strip() for v in args.verticals.split(",") if v.strip()]
        print(f"[source] mode={args.source} verticals={vs} …")
        cands = source_by_directory(vs) if args.source == "directory" else source_candidates(vs, args.per_query)
    if args.limit:
        cands = cands[:args.limit]
    print(f"[source] {len(cands)} unique candidate domains\n[score] scoring (signals are detected, never guessed)…")

    rows = []
    for i, c in enumerate(cands, 1):
        r = score(c)
        rows.append(r)
        print(f"  {i:2}. {r['domain']:30} {('★'*r['signal_score']):4} {r['tier']:24} {','.join(r['signals'])}")
        json.dump(rows, open(f"{args.out}.json", "w"), indent=2)

    rows.sort(key=lambda r: (TIER_RANK.get(r["tier"], 0), r["signal_score"]), reverse=True)
    # CSV
    cols = ["domain", "vertical", "tier", "signal_score", "signals", "emp_estimate", "has_demo_form",
            "runs_ads", "chat_tool", "hiring_roles", "funded_evidence", "found_via"]
    lines = [",".join(cols)]
    for r in rows:
        lines.append(",".join('"' + str(x).replace('"', "'") + '"' for x in [
            r["domain"], r["vertical"], r["tier"], r["signal_score"], "|".join(r["signals"]),
            r.get("emp_estimate", ""), r["has_demo_form"], r["runs_ads"], r["chat_tool"],
            "|".join(r["hiring_roles"]), (r["funded"] or {}).get("evidence", ""), r["found_via"]]))
    open(f"{args.out}.csv", "w").write("\n".join(lines))

    hot = [r for r in rows if r["tier"].startswith("HOT")]
    warm = [r for r in rows if r["tier"].startswith("WARM")]
    print(f"\n=== RESULTS ===  HOT(1:1): {len(hot)}  ·  WARM(email): {len(warm)}  ·  total scored: {len(rows)}")
    print(f"  → {args.out}.csv / {args.out}.json")
    if hot:
        print("\nHOTTEST LAYUPS (1:1 teardown tier):")
        for r in hot:
            ev = (r["funded"] or {}).get("evidence", "")
            print(f"  ★{r['signal_score']} {r['domain']:28} [{','.join(r['signals'])}]"
                  + (f"  hiring:{r['hiring_roles'][0][:30]}" if r["hiring_roles"] else "")
                  + (f"  funded:{ev[:40]}" if ev else ""))


if __name__ == "__main__":
    main()
