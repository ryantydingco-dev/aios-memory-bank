#!/usr/bin/env python3
"""Mandate Signal Detector — free Clay-alternative for the Dealthreads Mandate Radar.

Finds companies that just (A) raised funding and/or (B) are posting exec
revenue-leadership roles → each = a potential retained-search MANDATE for a
GTM/sales-leadership recruiting firm (Dealthreads ICP, see 01c/06/09).

Two signal modules, scored together (a company with BOTH = A+ mandate):
  A. FUNDING  — Firecrawl /search over funding news for a vertical + window.
  B. HIRING   — Greenhouse + Lever public job APIs (free, no key) over a
                target-company list; precise exec-revenue title filter.

The precision layer (what beats Clay): an LLM relevance gate (Claude) that
kills funds/SPVs/wrong-stage/non-US/false-title hits before anything is emitted.
A wrong card disproves the engine, so the gate is the point.

Honest scope:
  - Emits COMPANY + MANDATE candidates. The decision-maker NAME still needs
    LinkedIn verification before any card is sent (same rule as 09).
  - Human-in-the-loop: outputs candidates for review, does not auto-send.

Env (from aios-starter-kit/.env): FIRECRAWL_API_KEY, ANTHROPIC_API_KEY.

Usage:
  python3 mandate_signal_detector.py --vertical "fintech" --days 14 \
      --boards stripe,ramp,brex --out mandate_radar.json [--md mandate_radar.md] [--dry-run]
"""
import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error

FIRECRAWL_KEY = os.environ.get("FIRECRAWL_API_KEY", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = "claude-sonnet-4-6"  # cheap+capable for the relevance gate

# Exec revenue-LEADERSHIP titles that = a real GTM search mandate.
# Must be LEADERSHIP — individual-contributor roles (Account Executive, SDR,
# Account Manager) are NOT mandates and were leaking in the first live test.
EXEC_INCLUDE = [
    "vp of sales", "vice president of sales", "vp, sales", "vp sales",
    "head of sales", "svp sales", "svp of sales", "senior vice president of sales",
    "chief revenue officer", "chief revenue", "vp of revenue", "vp, revenue",
    "head of revenue", "vp of marketing", "vp, marketing", "vp marketing",
    "chief marketing officer", "head of marketing", "head of go-to-market",
    "head of gtm", "vp gtm", "vp of gtm", "chief commercial officer",
    "chief sales officer", "director of sales", "sales director",
]
# Hard excludes — kill IC roles + the false positives the live probes caught
# (Account Executive, compliance CRO, EA-to-CRO, etc.).
EXEC_EXCLUDE = [
    "account executive", "account manager", "sdr", "bdr", "representative",
    "assistant", "compliance", "risk", "money laundering", "coordinator",
    "associate", "intern", "recruiter", "customer success", "enablement",
    "operations manager", "sales operations", "revenue operations", "specialist",
    "engineer", "analyst", "designer",
]
# "CRO"/"CMO"/"CCO" are ambiguous acronyms (caught a Compliance "CRO" in probe) —
# only count them as a word, never as a substring, and only if not excluded.
EXEC_ACRONYMS = ["cro", "cmo", "cco", "cso"]


def _http_json(url, method="GET", headers=None, body=None, timeout=40):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace") or "{}")


# ---------------- Module A: FUNDING (Firecrawl search → scrape → extract) ----------------
# Lesson from first live test: search returns LISTICLES/ROUNDUPS, not individual
# "[Company] raised $X" announcements. The real signal lives in the BODY of those
# pages → scrape the top results and let the LLM extract individual companies.
def _firecrawl_search(query, limit=8):
    try:
        resp = _http_json(
            "https://api.firecrawl.dev/v1/search", "POST",
            {"Authorization": f"Bearer {FIRECRAWL_KEY}", "Content-Type": "application/json"},
            {"query": query, "limit": limit},
        )
        return resp.get("data") or []
    except Exception as e:  # noqa: BLE001
        print(f"  [funding] search error: {repr(e)[:120]}", file=sys.stderr)
        return []


def _firecrawl_scrape(url):
    try:
        resp = _http_json(
            "https://api.firecrawl.dev/v1/scrape", "POST",
            {"Authorization": f"Bearer {FIRECRAWL_KEY}", "Content-Type": "application/json"},
            {"url": url, "formats": ["markdown"]}, timeout=70,
        )
        return ((resp.get("data") or {}).get("markdown") or "")
    except Exception as e:  # noqa: BLE001
        print(f"  [funding] scrape error {url[:50]}: {repr(e)[:90]}", file=sys.stderr)
        return ""


def funding_search(vertical, days, max_scrape=6):
    if not FIRECRAWL_KEY:
        print("  [funding] FIRECRAWL_API_KEY missing — skipping", file=sys.stderr)
        return []
    queries = [
        f"{vertical} startup raised Series A 2026 funding announcement",
        f"{vertical} Series B 2026 raises million led by",
        f"{vertical} funding rounds 2026 recently funded companies",
    ]
    seen, urls = set(), []
    for q in queries:
        for item in _firecrawl_search(q, limit=6):
            u = item.get("url", "")
            if u and u not in seen:
                seen.add(u)
                urls.append({"url": u, "title": item.get("title", "")})
    # Scrape the top pages (roundups + announcements) → bodies for LLM extraction.
    signals = []
    for entry in urls[:max_scrape]:
        body = _firecrawl_scrape(entry["url"])
        if len(body) > 200:
            signals.append({
                "signal_type": "FUNDING_PAGE",
                "title": entry["title"],
                "url": entry["url"],
                "body": body[:9000],  # cap per page to control gate payload
            })
    return signals


# ---------------- Module B: HIRING (Greenhouse + Lever, free) ----------------
def _title_is_exec_revenue(title):
    t = (title or "").lower()
    if any(x in t for x in EXEC_EXCLUDE):
        return False
    if any(k in t for k in EXEC_INCLUDE):
        return True
    # acronyms only as standalone words (avoids "microscope" / compliance-CRO leakage)
    words = set(re.findall(r"[a-z]+", t))
    return any(a in words for a in EXEC_ACRONYMS)


def hiring_scan(boards):
    hits = []
    for b in boards:
        b = b.strip()
        if not b:
            continue
        got = False
        # Greenhouse
        try:
            data = _http_json(f"https://boards-api.greenhouse.io/v1/boards/{b}/jobs")
            for j in data.get("jobs", []):
                if _title_is_exec_revenue(j.get("title", "")):
                    hits.append({
                        "signal_type": "HIRING", "company": b, "board": "greenhouse",
                        "title": j.get("title", ""),
                        "location": (j.get("location") or {}).get("name", ""),
                        "url": j.get("absolute_url", ""),
                    })
            got = True
        except Exception:
            pass
        # Lever (try if Greenhouse missed)
        if not got:
            try:
                data = _http_json(f"https://api.lever.co/v0/postings/{b}?mode=json")
                for j in (data if isinstance(data, list) else []):
                    if _title_is_exec_revenue(j.get("text", "")):
                        hits.append({
                            "signal_type": "HIRING", "company": b, "board": "lever",
                            "title": j.get("text", ""),
                            "location": (j.get("categories") or {}).get("location", ""),
                            "url": j.get("hostedUrl", ""),
                        })
            except Exception:
                pass
    return hits


# ---------------- Module C: HIRING DEPTH (the deep signal, free) ----------------
# Beyond "is hiring": HOW BADLY. Counts technical roles, roles STALE 45-365 days
# (the real hiring-pain signal — excludes evergreen >365d reqs that read as noise),
# hard-to-fill stack markers, and geo. Per-company; enriches a discovered company.
import datetime

TECH_KW = ["engineer", "developer", "software", "backend", "frontend", "full stack",
           "fullstack", "sre", "devops", "platform", "data ", "machine learning",
           " ml ", "ai ", "security", "infrastructure", "staff ", "principal ",
           "architect", "qa ", "embedded", "firmware", "robotics", "cloud"]
HARD_STACK = ["rust", "golang", "go ", "kubernetes", "scala", "elixir", "haskell",
              "c++", "embedded", "firmware", "robotics", "machine learning", "ml ",
              "ai/ml", "security clearance", "clearance", "fpga", "cuda", "distributed systems"]


def _age_days(iso, today):
    try:
        d = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00")).date()
        return (today - d).days
    except Exception:
        return None


def _is_tech(title):
    t = (title or "").lower()
    return any(k in t for k in TECH_KW)


def hiring_depth(slug, today=None):
    """Return depth metrics for one company slug across Greenhouse/Lever/Ashby, or None."""
    today = today or datetime.date.today()
    roles = []  # (title, age_days_or_None, location, text_for_stack)
    # Greenhouse (has first_published = true age)
    try:
        d = _http_json(f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true")
        for j in d.get("jobs", []):
            roles.append((j.get("title", ""), _age_days(j.get("first_published", ""), today),
                          (j.get("location") or {}).get("name", ""),
                          (j.get("title", "") + " " + (j.get("content", "") or ""))[:1500]))
        if roles:
            return _depth_metrics(slug, "greenhouse", roles)
    except Exception:
        pass
    # Ashby (publishedDate)
    try:
        d = _http_json(f"https://api.ashbyhq.com/posting-api/job-board/{slug}")
        for j in d.get("jobs", []):
            roles.append((j.get("title", ""), _age_days(j.get("publishedDate", ""), today),
                          j.get("location", ""), j.get("title", "")))
        if roles:
            return _depth_metrics(slug, "ashby", roles)
    except Exception:
        pass
    # Lever (createdAt = ms epoch)
    try:
        d = _http_json(f"https://api.lever.co/v0/postings/{slug}?mode=json")
        for j in (d if isinstance(d, list) else []):
            ms = j.get("createdAt")
            age = (today - datetime.date(1970, 1, 1) - datetime.timedelta(milliseconds=ms)).days if ms else None
            roles.append((j.get("text", ""), age,
                          (j.get("categories") or {}).get("location", ""), j.get("text", "")))
        if roles:
            return _depth_metrics(slug, "lever", roles)
    except Exception:
        pass
    return None


def _depth_metrics(slug, board, roles):
    tech = [r for r in roles if _is_tech(r[0])]
    # STALE = open 45-365 days. Exclude >365 (evergreen reqs that misread as ancient).
    stale = [r for r in tech if r[1] is not None and 45 <= r[1] <= 365]
    oldest_real = max((r[1] for r in stale), default=0)
    stack_hits = sorted({s for r in tech for s in HARD_STACK if s.strip() in r[3].lower()})
    locs = [r[2] for r in tech if r[2]]
    return {
        "slug": slug, "board": board,
        "total_roles": len(roles), "tech_roles": len(tech),
        "stale_tech_45_365": len(stale), "oldest_stale_days": oldest_real,
        "hard_stack": stack_hits[:8],
        "sample_stale_titles": [r[0] for r in sorted(stale, key=lambda x: -(x[1] or 0))[:4]],
        "locations_sample": list(dict.fromkeys(locs))[:6],
    }


def _depth_summary(m):
    """One-line human pain summary from depth metrics."""
    if not m:
        return ""
    bits = [f"{m['tech_roles']} technical roles open"]
    if m["stale_tech_45_365"]:
        bits.append(f"{m['stale_tech_45_365']} stuck open 45+ days (oldest {m['oldest_stale_days']}d)")
    if m["hard_stack"]:
        bits.append("hard-to-source stack: " + ", ".join(m["hard_stack"][:4]))
    return " · ".join(bits)


# ---------------- Precision layer: LLM relevance gate ----------------
GATE_PROMPT = """You are an extraction + relevance gate for a recruiting-firm mandate detector.

INPUT: raw signals. FUNDING_PAGE items contain the scraped BODY of a funding-news article or roundup — EXTRACT every individual operating company in it that recently raised funding. HIRING items are individual exec-role job posts.

GOAL: output individual companies that — because they just raised funding and/or are hiring revenue leadership — now plausibly need to hire a senior GTM/sales leader (VP Sales, CRO, Head of Revenue, CMO). Each = a "mandate" a sales-leadership search firm could pursue.

KILL (do not output) if: it's a VC fund / SPV / investment firm (not an operating company); not US-based/US-relevant; you can't name a specific real company; the round is pre-seed/angel (too early for a sales-leadership hire); or it's a non-revenue role.

DO NOT GUESS. If you don't actually know what a company does from the source, set what_they_do to "UNKNOWN — verify" and confidence to "low" rather than inventing ("likely payments infrastructure" is a guess — don't). A card a recruiter can't trust is worse than no card.
Prefer RECENT rounds. If a round date is clearly older than ~60 days, mark confidence "low" and note the date — freshness is the whole "why now."

For each real company you keep, extract: company, what_they_do (1 line), signal_summary (the round: stage + amount + investor if known, OR the hiring signal), mandate_role (the revenue-leadership search it implies), round_or_signal (e.g. "Series A, $25M, led by NEA"), source_url, confidence (high if a specific named round/role; medium if implied; low if vague).

Dedupe companies. Aim for the strongest 8-12 mandates, not every name.

Return STRICT JSON only: {"mandates":[{"company","what_they_do","signal_summary","mandate_role","round_or_signal","source_url","confidence"}]}
If none, {"mandates":[]}. No prose.

RAW SIGNALS:
"""


def relevance_gate(raw_signals):
    if not ANTHROPIC_KEY:
        print("  [gate] ANTHROPIC_API_KEY missing — returning raw (UNFILTERED, risky)", file=sys.stderr)
        return [{"company": s.get("company") or s.get("title", "")[:60],
                 "signal_summary": s.get("snippet") or s.get("title", ""),
                 "mandate_role": "VP Sales / CRO (unverified)",
                 "source_url": s.get("url", ""), "confidence": "low",
                 "relevant": True, "_ungated": True} for s in raw_signals]
    try:
        resp = _http_json(
            "https://api.anthropic.com/v1/messages", "POST",
            {"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01",
             "Content-Type": "application/json"},
            {"model": ANTHROPIC_MODEL, "max_tokens": 8000,
             "messages": [{"role": "user",
                           "content": GATE_PROMPT + json.dumps(raw_signals, indent=2)}]},
            timeout=180,
        )
    except urllib.error.HTTPError as e:
        print(f"  [gate] HTTP {e.code}: {e.read().decode('utf-8','replace')[:300]}", file=sys.stderr)
        return []
    except Exception as e:  # noqa: BLE001
        print(f"  [gate] request error: {repr(e)[:200]}", file=sys.stderr)
        return []
    text = "".join(b.get("text", "") for b in resp.get("content", []))
    if not text:
        print(f"  [gate] empty LLM text. stop_reason={resp.get('stop_reason')}, resp head={json.dumps(resp)[:300]}", file=sys.stderr)
        return []
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        print(f"  [gate] no JSON in LLM reply. head: {text[:300]}", file=sys.stderr)
        return []
    try:
        return json.loads(m.group(0)).get("mandates", [])
    except json.JSONDecodeError as e:
        print(f"  [gate] JSON parse failed ({e}). text head: {text[:300]}", file=sys.stderr)
        return []


# ---------------- Scoring: A+ if funding AND hiring overlap ----------------
def score_mandates(mandates, hiring_companies):
    hire_set = {h.lower() for h in hiring_companies}
    for m in mandates:
        co = (m.get("company") or "").lower()
        base = {"high": 3, "medium": 2, "low": 1}.get(m.get("confidence", "low"), 1)
        overlap = any(co and (co in h or h in co) for h in hire_set)
        m["mandate_grade"] = "A+ (raised AND hiring)" if overlap else ("A" if base >= 3 else "B")
        m["both_signals"] = overlap
    order = {"A+ (raised AND hiring)": 0, "A": 1, "B": 2}
    mandates.sort(key=lambda x: order.get(x.get("mandate_grade"), 3))
    return mandates


def to_md(mandates, vertical):
    L = [f"# Mandate Radar — {vertical} (auto-detected)\n",
         "> Generated by `mandate_signal_detector.py` (funding + hiring, free sources, LLM relevance-gated). "
         "⚠️ Verify each decision-maker on LinkedIn before sending — detector finds the company+mandate, not the verified person.\n",
         f"**{len(mandates)} mandate candidates**\n", "---\n"]
    for i, m in enumerate(mandates, 1):
        L.append(f"### {i}. {m.get('company')} — {m.get('mandate_grade','?')}")
        L.append(f"- **What they do:** {m.get('what_they_do','?')}")
        L.append(f"- **Signal:** {m.get('signal_summary') or m.get('round_or_signal','?')}")
        L.append(f"- **The mandate:** {m.get('mandate_role','?')}")
        L.append(f"- **Source:** {m.get('source_url','?')}  · confidence: {m.get('confidence','?')}")
        L.append("")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vertical", required=True, help='e.g. "fintech", "cybersecurity"')
    ap.add_argument("--days", type=int, default=14,
                    help="recency hint passed to the LLM gate (hard date-filtering is a v2 TODO — "
                         "currently the gate down-weights old rounds but does not exclude them)")
    ap.add_argument("--boards", default="", help="comma list of Greenhouse/Lever slugs to scan for HIRING")
    ap.add_argument("--out", default="mandate_radar.json")
    ap.add_argument("--md", default="")
    ap.add_argument("--dry-run", action="store_true", help="fetch raw signals, skip LLM gate")
    args = ap.parse_args()

    print(f"[detector] vertical={args.vertical} days={args.days} boards={args.boards or '(none)'}")
    funding = funding_search(args.vertical, args.days)
    print(f"  funding signals: {len(funding)}")
    boards = [b for b in args.boards.split(",") if b.strip()]
    hiring = hiring_scan(boards) if boards else []
    print(f"  hiring signals:  {len(hiring)}")

    raw = funding + hiring
    if args.dry_run:
        json.dump({"raw_signals": raw}, open(args.out, "w"), indent=2)
        print(f"  [dry-run] {len(raw)} raw signals → {args.out} (no LLM gate)")
        return

    mandates = relevance_gate(raw)
    print(f"  after relevance gate: {len(mandates)} real mandates (killed {len(raw)-len(mandates)} noise)")
    mandates = score_mandates(mandates, [h["company"] for h in hiring])
    aplus = sum(1 for m in mandates if m.get("both_signals"))
    print(f"  A+ (raised AND hiring): {aplus}")

    json.dump({"vertical": args.vertical, "count": len(mandates), "mandates": mandates},
              open(args.out, "w"), indent=2)
    print(f"  → {args.out}")
    if args.md:
        open(args.md, "w").write(to_md(mandates, args.vertical))
        print(f"  → {args.md}")


if __name__ == "__main__":
    main()
