#!/usr/bin/env python3
"""Generate next Oloxa daily Top 20 from existing AI Arc/Smartlead CSVs.

This script is intentionally simple and auditable. It does not scrape new data.
It turns the existing HOT/WARM universe into a HubSpot-ready daily CSV while
excluding contacts already synced to HubSpot when HUBSPOT_TOKEN is available.

Usage:
  set -a; source /Users/ryantydingco/Documents/AIOS/dealthread-agents/.env; set +a
  python3 generate_oloxa_daily_batch.py --limit 20 --out /tmp/Oloxa_Daily_Top_20_Monday.csv
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import urllib.error
import urllib.request

import recency_guardrail as RG
import sway_schema as SS

BASE = "https://api.hubapi.com"
TOKEN = os.environ.get("HUBSPOT_TOKEN", "")
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
SOURCE_FILES = [
    "/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa/smartlead_segments/Oloxa_HOT.csv",
    "/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa/smartlead_segments/Oloxa_WARM.csv",
]
# Output = the shared standardized schema (sway_schema.OUT_COLS) + Ryan's
# operational extras, so every daily batch is born in Sway's format.
OUT_COLUMNS = SS.OUT_COLS + ["assigned_to", "recommended_channel", "recommended_next_action", "source_file"]

COMMERCIAL_KEYWORDS = re.compile(r"commercial|business|sba|asset|equipment|development|bridge|bridging|construction|portfolio|private|hard money|lender|finance broker|funding", re.I)
WEAK_KEYWORDS = re.compile(r"residential|realtor|real estate agent|insurance|consumer|reverse mortgage", re.I)


def api(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(BASE + path, data=data, headers=HEADERS, method=method)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, json.loads(r.read() or b"{}")


def hubspot_existing_keys():
    """Return emails/source keys already present in HubSpot Oloxa records."""
    emails, keys = set(), set()
    if not TOKEN:
        return emails, keys
    after = None
    while True:
        body = {
            "filterGroups": [{"filters": [{"propertyName": "oloxa_source_file", "operator": "HAS_PROPERTY"}]}],
            "limit": 100,
            "properties": ["email", "oloxa_source_key"],
        }
        if after:
            body["after"] = after
        try:
            _code, resp = api("POST", "/crm/v3/objects/contacts/search", body)
        except Exception as e:
            print(f"WARN: could not read existing HubSpot Oloxa contacts: {e}")
            return emails, keys
        for x in resp.get("results", []):
            p = x.get("properties", {}) or {}
            if p.get("email"):
                emails.add(p["email"].strip().lower())
            if p.get("oloxa_source_key"):
                keys.add(p["oloxa_source_key"].strip().lower())
        after = ((resp.get("paging") or {}).get("next") or {}).get("after")
        if not after:
            break
    return emails, keys


def signal_label(row):
    text = " ".join([row.get("signals", ""), row.get("signal_post_signal", ""), row.get("signal_post_quote", "")]).upper()
    for label in ["PAIN", "HIRING", "CLOSING", "VOLUME", "COMPLEXITY", "SPEED_PROMISE", "MOVE"]:
        if label in text:
            return label
    # soft fallback from text content
    q = row.get("signal_post_quote", "")
    if re.search(r"hiring|join our team|we're hiring|vacancy", q, re.I): return "HIRING"
    if re.search(r"closed|funded|completion|completed|deal", q, re.I): return "CLOSING"
    if re.search(r"growth|record|volume|busy", q, re.I): return "VOLUME"
    return "MOVE" if text else "UNKNOWN"


def priority_score(row):
    try: base = int(float(row.get("total_score") or 0))
    except Exception: base = 0
    title = row.get("title", "")
    company = row.get("company_name", "")
    quote = row.get("signal_post_quote", "")
    score = base
    if row.get("behavioral_tier") == "HOT": score += 20
    if row.get("market") == "UK": score += 8
    if signal_label(row) in ["PAIN", "HIRING", "CLOSING", "VOLUME"]: score += 10
    if COMMERCIAL_KEYWORDS.search(" ".join([title, company, quote])): score += 8
    if WEAK_KEYWORDS.search(" ".join([title, company])) and not COMMERCIAL_KEYWORDS.search(" ".join([title, company, quote])): score -= 15
    return score


def _days_old(sdate, anchor):
    if not sdate:
        return 10 ** 6
    try:
        return (anchor - dt.date.fromisoformat(sdate)).days
    except ValueError:
        return 10 ** 6


def recency(row, signal, anchor):
    """(signal_date, signal_timeframe, recency_tier, basis). Prefers the LinkedIn
    post age; falls back to a best-effort *past* date mined from the text."""
    if signal == "NONE":
        return "", "", "", "none"
    sdate, tf, tier, basis = SS.recency_from_age(row.get("signal_post_age", ""), anchor)
    if tier:
        return sdate, tf, tier, basis
    text = f"{row.get('signal_post_quote','')}\n{row.get('signals','')}"
    dates = [t for t in RG.extract_dates(text, anchor) if (anchor - t[0]).days >= 0]
    best = RG.freshest(dates, anchor)
    if best:
        d, phrase, prec = best
        days = (anchor - d).days
        tier = "FRESH" if days <= 30 else "RECENT" if days <= 90 else "AGING" if days <= 365 else "STALE"
        if prec == "year" and tier in ("FRESH", "RECENT"):
            tier = "AGING"
        return d.isoformat(), phrase, tier, "text_estimate"
    return "", "", "UNDATED", "none_found"


def channel(row, signal):
    if row.get("linkedin_url") and signal in ["PAIN", "HIRING", "CLOSING", "VOLUME"]:
        return "LinkedIn"
    if row.get("email"):
        return "Email"
    return "LinkedIn"


def next_action(ch):
    return "READY_FOR_LINKEDIN" if ch == "LinkedIn" else "READY_FOR_EMAIL"


def opener(row, signal):
    first = row.get("first_name") or "there"
    quote = (row.get("signal_post_quote") or "").strip()
    short_quote = re.sub(r"\s+", " ", quote)[:180]
    if signal == "HIRING":
        return f"Hey {first} — noticed the team/growth signal around {row.get('company_name')}. Usually as volume grows, borrower doc follow-up and file prep become the quiet capacity sink before lender submission. Worth me sending a quick example of how Oloxa handles that?"
    if signal == "CLOSING":
        return f"Hey {first} — saw the recent deal activity from {row.get('company_name')}. On commercial/development finance deals, I imagine getting the borrower file clean before lender submission is half the battle. Worth comparing notes?"
    if signal == "PAIN":
        return f"Hey {first} — saw a workflow signal that made me think Oloxa may be relevant for {row.get('company_name')}. We help turn messy borrower docs into cleaner lender-ready packages with fewer follow-ups. Worth me sending a quick example?"
    if short_quote:
        return f"Hey {first} — noticed this from {row.get('company_name')}: “{short_quote}.” It made me think about the doc intake/checklist side before lender submission. Worth me sending a quick example of what we’re building with Oloxa?"
    return f"Hey {first} — looks like {row.get('company_name')} sits right in the commercial finance workflow we’re studying. Oloxa helps sort borrower docs, flag what’s missing, and prep cleaner lender packages. Worth comparing notes?"


def reasoning(row, signal, score):
    parts = [f"{row.get('behavioral_tier')} lead", f"signal={signal}", f"priority_score={score}"]
    if row.get("market") == "UK": parts.append("UK boosted due to closest fit to current proof/use case")
    if COMMERCIAL_KEYWORDS.search(" ".join([row.get("title", ""), row.get("company_name", ""), row.get("signal_post_quote", "")])):
        parts.append("commercial/debt/finance language present")
    return "; ".join(parts)


def load_rows():
    rows = []
    for path in SOURCE_FILES:
        if not os.path.exists(path):
            continue
        with open(path, newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                row["source_file"] = path
                rows.append(row)
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--out", default="")
    args = ap.parse_args()
    rows = load_rows()
    existing_emails, existing_keys = hubspot_existing_keys()
    seen = set()
    candidates = []
    anchor = dt.date.today()
    for row in rows:
        email = (row.get("email") or "").strip().lower()
        key = (email or row.get("linkedin_url") or f"{row.get('company_name')}::{row.get('first_name')}::{row.get('last_name')}").lower().strip()
        if key in seen or email in existing_emails or key in existing_keys:
            continue
        seen.add(key)
        sel_score = priority_score(row)  # quality bias for selection / tie-break only
        signal = signal_label(row)
        if signal == "UNKNOWN" or signal not in SS.VALID_SIGNALS:
            signal = "NONE"
        ch = channel(row, signal)
        evidence = row.get("signal_post_quote", "")
        firm_signals = row.get("signals") or row.get("signal_post_signal", "")
        # Recency-PURE score: fit 0-50 + behavioral 0-50 = total 0-100. Recency is
        # NOT folded into the score — it rides in the date fields + the Buying Signal
        # Tier (a stale/undated signal can't be HIGH). See sway_schema.py.
        fit = SS.scale(row.get("fit_score"))
        try:
            beh_src = float(row.get("behavioral_score"))
        except (TypeError, ValueError):
            beh_src = 0.0
        if beh_src <= 0:  # never behaviorally scored -> derive from signal type
            beh_src = SS.SIGNAL_STRENGTH.get(signal, 2)
        beh = SS.scale(beh_src)
        total = fit + beh
        sdate, stf, tier, basis = recency(row, signal, anchor)
        conf = SS.refine_confidence(SS.base_tier_from_total(total), signal, tier)
        action = "NEEDS_RESEARCH" if (signal == "NONE" or tier in ("UNDATED", "")) else next_action(ch)
        out = {
            "intent_confidence": conf,
            "primary_signal_refined": signal,
            "signal_date": sdate, "signal_timeframe": stf, "recency_tier": tier, "signal_date_basis": basis,
            "fit_score": fit, "behavioral_score": beh, "total_score": total,
            "first_name": row.get("first_name", ""), "last_name": row.get("last_name", ""),
            "title": row.get("title", ""), "company_name": row.get("company_name", ""),
            "seniority": row.get("seniority", ""), "company_size": row.get("company_size", ""),
            "industry": row.get("industry", ""), "city": row.get("city", ""), "state": row.get("state", ""),
            "country": SS.country_code(row.get("country") or row.get("market")),
            "email": row.get("email", ""), "linkedin_url": row.get("linkedin_url", ""),
            "linkedin_provider_id": "", "company_website": row.get("company_website", ""),
            "company_revenue": row.get("company_revenue", ""),
            "confirmed_pain_evidence": evidence, "firm_intent_signals": firm_signals,
            "personalized_opener": opener(row, signal),
            "reasoning": reasoning(row, signal, total),
            "source_url": row.get("linkedin_url", ""),
            "recommended_channel": ch,
            "recommended_next_action": action,
            "source_file": row.get("source_file", ""),
            "_tier": SS.tier_rank(conf), "_total": total, "_days": _days_old(sdate, anchor), "_sel": sel_score,
        }
        candidates.append(out)
    # Order the queue like the master pull-list: tier -> total -> freshest -> quality.
    candidates.sort(key=lambda x: (x["_tier"], x["_total"], -x["_days"], x["_sel"]), reverse=True)
    top = candidates[:args.limit]
    for i, row in enumerate(top, 1):
        row["rank"] = str(i)
        row["assigned_to"] = "Ryan" if i % 2 == 1 else "Sway"
        for k in ("_tier", "_total", "_days", "_sel"):
            row.pop(k, None)
    out_path = args.out or f"/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/Oloxa_Daily_Top_20_{dt.date.today().isoformat()}.csv"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=OUT_COLUMNS)
        w.writeheader(); w.writerows([{k: r.get(k, "") for k in OUT_COLUMNS} for r in top])
    print(json.dumps({"source_rows": len(rows), "excluded_existing_hubspot_emails": len(existing_emails), "generated": len(top), "out": out_path}, indent=2))

if __name__ == "__main__":
    main()
