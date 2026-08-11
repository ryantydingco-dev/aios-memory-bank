"""
CA Signal Enrichment — compute the INTENT axis for a lead list so outbound hits the buying window.

Your /ca-leads list is the Fit axis (right firms). This scores the Intent axis (buying RIGHT NOW)
and ranks the list hot-first. All detection uses free sources + owned tools — no new intent tool,
no per-lead credit burn.

Signals + detection (ranked for law/financial, per 2026-07-07 verified research):
    active-hiring   free public ATS JSON APIs (Greenhouse/Lever/Ashby/SmartRecruiters/Workday) + Firecrawl fingerprint
    merger/rebrand  Google News RSS per firm  (highest order value, on a deadline)
    new-leader      Google News RSS  (new CMO/BD head re-tools vendors in first 90 days)
    event-sponsor   (later) Firecrawl on published sponsor rosters
    award           Google News RSS
    new-office      Google News RSS
    funding         (later) SEC EDGAR Form D — FINANCIAL segment only

Score = Σ weight × e^(-λ·days_old) over fresh signals; λ from each signal's half-life.
Output: ranked leads with top_signal + signal_date + buy_now_score, feeding /ca-outbound
(whose opener uses the signal, e.g. "saw you're hiring three associates — here's a welcome-kit mockup").

Subcommands:
    ats-scan   --in leads.json --out signals.json     detect hiring via free ATS feeds
    news-scan  --in leads.json --out signals.json     Google News RSS per firm -> classified signals
    score      --in signals.json --out ranked.json    exponential-decay buy-now score + routing band
    run        --in leads.json  --out ranked.json      chain all of the above
"""

import argparse
import json
import math
import os
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
except ImportError:
    raise ImportError("Missing 'requests' — run: .venv/bin/pip install requests python-dotenv")

STATE_DIR = ROOT / "data"
UA = "CreativeAlternatives-SignalBot/1.0 (ryan@creativealternatives.com)"

# (points, half_life_days) — from the verified weight table.
SIGNAL_WEIGHTS = {
    "active-hiring": (25, 10),
    "merger":        (22, 90),
    "new-leader":    (12, 90),
    "event-sponsor": (15, 45),
    "award":         (10, 45),
    "new-office":    (8, 60),
    "funding":       (10, 90),
}
ROUTING_BANDS = [(31, "act-48h"), (21, "priority"), (11, "personalized"), (0, "nurture")]

# Roles that imply onboarding-kit volume (any hire needs a kit, but these signal scaling / classes).
ONBOARDING_ROLE_RE = re.compile(
    r"associate|paralegal|analyst|recruit|talent|human resources|\bhr\b|office manager|"
    r"administrator|coordinator|counsel|attorney|clerk|staff", re.I)
NY_RE = re.compile(r"\bnew york\b|\bnyc\b|\bny\b|manhattan|brooklyn|\bn\.?y\.?\b", re.I)


def _read(p): return json.loads(Path(p).read_text())
def _write(p, o): Path(p).parent.mkdir(parents=True, exist_ok=True); Path(p).write_text(json.dumps(o, indent=2))
def _now(): return datetime.now(timezone.utc)
def _norm_firm(n): return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", (n or "").lower())).strip()

def _days_old(iso_or_dt):
    try:
        dt = iso_or_dt if isinstance(iso_or_dt, datetime) else datetime.fromisoformat(str(iso_or_dt).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return max(0.0, (_now() - dt).total_seconds() / 86400)
    except (ValueError, TypeError):
        return 999.0


# ---------- unique-firm helper ----------

def _firms_from_leads(leads):
    firms = {}
    for p in leads:
        norm = _norm_firm(p.get("company_name", ""))
        dom = (p.get("company_domain") or "").lower()
        if not norm:
            continue
        firms.setdefault(norm, {"firm": p.get("company_name", ""), "domain": dom})
        if dom and not firms[norm]["domain"]:
            firms[norm]["domain"] = dom
    return firms


# ---------- stage A: hiring via free ATS feeds ----------

ATS_HOST_TELLS = [
    ("greenhouse", re.compile(r"(?:boards|job-boards)\.greenhouse\.io/(?:embed/job_board\?for=)?([a-z0-9_-]+)", re.I)),
    ("greenhouse", re.compile(r"greenhouse\.io/embed/job_board/js\?for=([a-z0-9_-]+)", re.I)),
    ("lever",      re.compile(r"jobs\.lever\.co/([a-z0-9_-]+)", re.I)),
    ("ashby",      re.compile(r"jobs\.ashbyhq\.com/([a-z0-9_-]+)", re.I)),
    ("smartrecruiters", re.compile(r"jobs\.smartrecruiters\.com/([a-z0-9_-]+)", re.I)),
    ("workday",    re.compile(r"([a-z0-9_-]+)\.(wd\d+)\.myworkdayjobs\.com/([a-z0-9_-]+)", re.I)),
    ("recruitee",  re.compile(r"([a-z0-9_-]+)\.recruitee\.com", re.I)),
    ("workable",   re.compile(r"apply\.workable\.com/([a-z0-9_-]+)", re.I)),
]

def _firecrawl_scrape(url, key):
    try:
        r = requests.post("https://api.firecrawl.dev/v1/scrape",
                          headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                          json={"url": url, "formats": ["markdown", "links"], "onlyMainContent": False}, timeout=40)
        if not r.ok:
            return "", []
        data = r.json().get("data", {}) or {}
        return data.get("markdown", "") or "", data.get("links", []) or []
    except requests.RequestException:
        return "", []

def _fingerprint_ats(domain, key):
    """Return (ats, token, extra) by scraping the firm's careers/homepage via Firecrawl."""
    for path in ("/careers", "/careers/", "/about/careers", "/jobs", ""):
        md, links = _firecrawl_scrape(f"https://{domain}{path}", key)
        blob = md + " " + " ".join(links if isinstance(links, list) else [])
        for ats, rx in ATS_HOST_TELLS:
            m = rx.search(blob)
            if m:
                return ats, m.group(1), m.groups()
        if md:  # page loaded but no ATS tell — stop probing extra paths
            break
    return "", "", ()

def _fetch_jobs(ats, token, extra):
    """Return list of {title, location, posted} from the ATS free feed."""
    try:
        if ats == "greenhouse":
            r = requests.get(f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=false", timeout=25)
            return [{"title": j.get("title", ""), "location": (j.get("location") or {}).get("name", ""),
                     "posted": j.get("first_published") or j.get("updated_at", "")} for j in r.json().get("jobs", [])]
        if ats == "lever":
            r = requests.get(f"https://api.lever.co/v0/postings/{token}?mode=json", timeout=25)
            data = r.json()
            if not isinstance(data, list):
                return []
            return [{"title": j.get("text", ""), "location": (j.get("categories") or {}).get("location", ""),
                     "posted": datetime.fromtimestamp((j.get("createdAt") or 0) / 1000, timezone.utc).isoformat() if j.get("createdAt") else ""}
                    for j in data if isinstance(j, dict)]
        if ats == "ashby":
            r = requests.get(f"https://api.ashbyhq.com/posting-api/job-board/{token}", timeout=25)
            return [{"title": j.get("title", ""), "location": j.get("locationName", ""),
                     "posted": j.get("publishedAt", "")} for j in r.json().get("jobs", [])]
        if ats == "smartrecruiters":
            r = requests.get(f"https://api.smartrecruiters.com/v1/companies/{token}/postings?limit=100", timeout=25)
            return [{"title": j.get("name", ""), "location": (j.get("location") or {}).get("city", ""),
                     "posted": j.get("releasedDate", "")} for j in r.json().get("content", [])]
        if ats == "workday":
            tenant, wd, site = extra
            url = f"https://{tenant}.{wd}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs"
            r = requests.post(url, json={"appliedFacets": {}, "limit": 20, "offset": 0, "searchText": ""}, timeout=25)
            return [{"title": j.get("title", ""), "location": j.get("locationsText", ""), "posted": ""}
                    for j in r.json().get("jobPostings", [])]
    except (requests.RequestException, ValueError, KeyError):
        return []
    return []

def cmd_ats_scan(args):
    key = os.getenv("FIRECRAWL_API_KEY", "").strip()
    if not key:
        print("missing FIRECRAWL_API_KEY", file=sys.stderr); return 1
    leads = _read(args.infile)
    firms = _firms_from_leads(leads)
    state_path = STATE_DIR / "signal_ats_state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    signals = {}
    scanned = hits = 0
    for norm, meta in list(firms.items())[: args.max_firms]:
        dom = meta["domain"]
        if not dom:
            continue
        scanned += 1
        ats, token, extra = _fingerprint_ats(dom, key)
        if not ats:
            continue
        jobs = _fetch_jobs(ats, token, extra)
        ny_roles = [j for j in jobs if NY_RE.search(j.get("location", "")) and ONBOARDING_ROLE_RE.search(j.get("title", ""))]
        if not ny_roles:
            continue
        # freshest posted date among NY onboarding roles = signal recency
        dates = [j["posted"] for j in ny_roles if j.get("posted")]
        signal_date = min(dates) if False else (max(dates) if dates else _now().isoformat())
        prior = state.get(norm, {})
        prior_ids = set(prior.get("titles", []))
        cur_ids = [j["title"] for j in ny_roles]
        new_roles = [t for t in cur_ids if t not in prior_ids]
        signals.setdefault(norm, {"firm": meta["firm"], "domain": dom, "signals": []})
        signals[norm]["signals"].append({
            "type": "active-hiring", "signal_date": signal_date,
            "detail": f"{len(ny_roles)} NY onboarding-implying roles open via {ats}"
                      + (f"; {len(new_roles)} new since last scan" if prior else ""),
            "count": len(ny_roles), "new_count": len(new_roles), "ats": ats,
            "boost_new": bool(new_roles) and bool(prior),
        })
        state[norm] = {"titles": cur_ids, "ts": _now().isoformat(), "ats": ats}
        hits += 1
        time.sleep(0.3)
    _write(state_path, state)
    _merge_signals(args.outfile, signals)
    print(f"ats-scan: {hits}/{scanned} firms with a live NY hiring signal → {args.outfile}")
    return 0


# ---------- stage B: news signals via Google News RSS ----------

NEWS_TERMS = ('(merger OR merges OR combines OR combination OR rebrands OR renamed OR '
              '"opens office" OR "new office" OR relocates OR "named partner" OR "chief marketing" OR '
              '"business development" OR appoints OR elects OR "wins award" OR "best law" OR ranked OR sponsors)')
NEWS_CLASSIFY = [
    ("merger",     re.compile(r"merger|merges|combine|combination|rebrand|renamed", re.I)),
    ("new-leader", re.compile(r"chief marketing|\bcmo\b|marketing director|business development|appoints|elects|names?\s+\w+\s+as|joins as|named partner|managing partner", re.I)),
    ("award",      re.compile(r"award|best law|ranked|recognized|chambers|super lawyers|best lawyers|named to", re.I)),
    ("event-sponsor", re.compile(r"sponsor|exhibit|booth|to speak at|hosts|gala", re.I)),
    ("new-office", re.compile(r"opens office|new office|relocat|expands to|moves to", re.I)),
]

def _google_news(query, window_days):
    url = (f"https://news.google.com/rss/search?q={quote(query + f' when:{window_days}d')}"
           "&hl=en-US&gl=US&ceid=US:en")
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=25)
        items = re.findall(r"<item>(.*?)</item>", r.text, re.S)
        out = []
        for it in items:
            t = re.search(r"<title>(.*?)</title>", it, re.S)
            d = re.search(r"<pubDate>(.*?)</pubDate>", it, re.S)
            title = re.sub(r"<!\[CDATA\[|\]\]>", "", t.group(1)).strip() if t else ""
            try:
                pub = parsedate_to_datetime(d.group(1)).astimezone(timezone.utc).isoformat() if d else ""
            except (TypeError, ValueError):
                pub = ""
            if title:
                out.append({"title": title, "date": pub})
        return out
    except requests.RequestException:
        return []

def _classify(title):
    for typ, rx in NEWS_CLASSIFY:
        if rx.search(title):
            return typ
    return None

def cmd_news_scan(args):
    leads = _read(args.infile)
    firms = _firms_from_leads(leads)
    signals = {}
    scanned = hits = 0
    for norm, meta in list(firms.items())[: args.max_firms]:
        firm = meta["firm"]
        # strip legal suffixes for a cleaner news query
        q = '"' + re.sub(r"\b(llp|llc|pllc|p\.?c\.?|pa|attorneys?|at law)\b.*$", "", firm, flags=re.I).strip() + '" ' + NEWS_TERMS
        scanned += 1
        items = _google_news(q, args.window_days)
        best = {}
        for it in items:
            typ = _classify(it["title"])
            if not typ:
                continue
            # keep the freshest item per signal type; dedup same event
            if typ not in best or (it["date"] and it["date"] > best[typ]["signal_date"]):
                best[typ] = {"type": typ, "signal_date": it["date"] or _now().isoformat(), "detail": it["title"][:140]}
        if best:
            signals.setdefault(norm, {"firm": firm, "domain": meta["domain"], "signals": []})
            signals[norm]["signals"].extend(best.values())
            hits += 1
        time.sleep(0.4)  # be gentle with Google News
    _merge_signals(args.outfile, signals)
    print(f"news-scan: {hits}/{scanned} firms with a news signal → {args.outfile}")
    return 0


def _merge_signals(path, new):
    """Accumulate signals from multiple scan stages into one file, deduping identical (type,date)."""
    cur = _read(path) if Path(path).exists() else {}
    for norm, rec in new.items():
        if norm not in cur:
            cur[norm] = rec
        else:
            seen = {(s["type"], s.get("signal_date", "")) for s in cur[norm]["signals"]}
            for s in rec["signals"]:
                if (s["type"], s.get("signal_date", "")) not in seen:
                    cur[norm]["signals"].append(s)
    _write(path, cur)


# ---------- stage C: score + rank ----------

def cmd_score(args):
    data = _read(args.infile)
    segment = args.segment  # "law" or "financial" — funding only counts for financial
    ranked = []
    for norm, rec in data.items():
        total = 0.0
        contribs = []
        # dedup by type: keep the highest single contribution per signal type
        best_by_type = {}
        for s in rec.get("signals", []):
            typ = s["type"]
            if typ == "funding" and segment != "financial":
                continue
            if typ not in SIGNAL_WEIGHTS:
                continue
            pts, half = SIGNAL_WEIGHTS[typ]
            if not s.get("signal_date"):
                continue  # zero anything without a fresh date stamp
            lam = math.log(2) / half
            val = pts * math.exp(-lam * _days_old(s["signal_date"]))
            if s.get("boost_new"):
                val *= 1.3
            if typ not in best_by_type or val > best_by_type[typ][0]:
                best_by_type[typ] = (val, s)
        for typ, (val, s) in best_by_type.items():
            total += val
            contribs.append({"type": typ, "points": round(val, 1), "date": s.get("signal_date", ""), "detail": s.get("detail", "")})
        contribs.sort(key=lambda c: -c["points"])
        band = next(name for thresh, name in ROUTING_BANDS if total >= thresh)
        ranked.append({
            "firm": rec["firm"], "domain": rec.get("domain", ""),
            "buy_now_score": round(total, 1), "band": band,
            "top_signal": contribs[0]["type"] if contribs else "",
            "top_signal_detail": contribs[0]["detail"] if contribs else "",
            "top_signal_date": contribs[0]["date"] if contribs else "",
            "signals": contribs,
        })
    ranked.sort(key=lambda r: -r["buy_now_score"])
    _write(args.outfile, ranked)
    bands = {}
    for r in ranked:
        bands[r["band"]] = bands.get(r["band"], 0) + 1
    print(f"score: {len(ranked)} firms scored → {args.outfile}")
    print(f"  bands: " + ", ".join(f"{k}={v}" for k, v in sorted(bands.items())))
    hot = [r for r in ranked if r["band"] in ("act-48h", "priority")][:5]
    for r in hot:
        print(f"  🔥 {r['buy_now_score']:>5} [{r['band']}] {r['firm'][:34]:34} {r['top_signal']}: {r['top_signal_detail'][:50]}")
    return 0


def cmd_run(args):
    d = ROOT / "outputs" / "ca-outbound" / (args.run or time.strftime("%Y-%m-%d") + "-signals")
    sig = d / "signals.json"
    if sig.exists():
        sig.unlink()
    cmd_ats_scan(argparse.Namespace(infile=args.infile, outfile=str(sig), max_firms=args.max_firms))
    cmd_news_scan(argparse.Namespace(infile=args.infile, outfile=str(sig), max_firms=args.max_firms, window_days=args.window_days))
    cmd_score(argparse.Namespace(infile=str(sig), outfile=args.outfile or str(d / "ranked.json"), segment=args.segment))
    print(f"→ feed the ranked list to /ca-outbound; the opener uses top_signal + top_signal_detail.")
    return 0


def main():
    p = argparse.ArgumentParser(description="CA signal enrichment — rank a lead list by buy-now signals (free sources).")
    sub = p.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("ats-scan"); a.add_argument("--in", dest="infile", required=True)
    a.add_argument("--out", dest="outfile", required=True); a.add_argument("--max-firms", type=int, default=200)
    a.set_defaults(func=cmd_ats_scan)

    n = sub.add_parser("news-scan"); n.add_argument("--in", dest="infile", required=True)
    n.add_argument("--out", dest="outfile", required=True); n.add_argument("--max-firms", type=int, default=200)
    n.add_argument("--window-days", type=int, default=30); n.set_defaults(func=cmd_news_scan)

    s = sub.add_parser("score"); s.add_argument("--in", dest="infile", required=True)
    s.add_argument("--out", dest="outfile", required=True); s.add_argument("--segment", default="law")
    s.set_defaults(func=cmd_score)

    r = sub.add_parser("run"); r.add_argument("--in", dest="infile", required=True)
    r.add_argument("--out", dest="outfile", default=None); r.add_argument("--run", default=None)
    r.add_argument("--segment", default="law"); r.add_argument("--max-firms", type=int, default=200)
    r.add_argument("--window-days", type=int, default=30); r.set_defaults(func=cmd_run)

    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
