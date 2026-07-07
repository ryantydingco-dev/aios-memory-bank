#!/usr/bin/env python3
"""Re-emit the older *curated* Oloxa UK/US/CA handoff files to the shared schema.

The daily generator (generate_oloxa_daily_batch.py) now produces this schema
natively; this script is for the pre-existing `*_HOT_*_ENRICHED.csv` handoff files.
All transforms live in sway_schema.py so the two never drift. Originals untouched.

Recency is recovered by joining to `signal_post_age` in the source segments
(US/UK) and per-region *_Priority/*_Smartlead files (CA); when that's empty it
falls back to a best-effort *past* date mined from the curated text.
"""
from __future__ import annotations

import csv
import datetime as dt
import glob
import os

import recency_guardrail as RG
import sway_schema as SS

BASE = "/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa"
HANDOFF = os.path.join(BASE, "sway_handoff")
SEGMENTS = os.path.join(BASE, "smartlead_segments")
ANCHOR = dt.date(2026, 6, 1)

REGIONS = [
    ("UK", "Oloxa_HOT_UK_ENRICHED.csv"),
    ("US", "Oloxa_HOT_US_ENRICHED.csv"),
    ("CA", "Oloxa_HOT_CA_ENRICHED.csv"),
]


def load_source_index():
    """email/linkedin -> {behavioral_score, signal_post_age} from the source files,
    preferring rows that actually carry a post age."""
    idx = {}
    files = (sorted(glob.glob(os.path.join(SEGMENTS, "*.csv")))
             + sorted(glob.glob(os.path.join(BASE, "Oloxa_*_Priority.csv")))
             + sorted(glob.glob(os.path.join(BASE, "Oloxa_*_Smartlead.csv"))))
    for p in files:
        with open(p, encoding="utf-8-sig", errors="replace") as f:
            for r in csv.DictReader(f):
                rec = {"behavioral_score": r.get("behavioral_score", ""),
                       "signal_post_age": r.get("signal_post_age", "")}
                for key in ((r.get("email") or "").strip().lower(),
                            (r.get("linkedin_url") or "").strip().lower()):
                    if not key:
                        continue
                    if key not in idx or (not idx[key]["signal_post_age"] and rec["signal_post_age"]):
                        idx[key] = rec
    return idx


def text_recency(text):
    """Best-effort PAST date mined from curated text (CA fallback). Future-dated
    mentions (forecasts) are rejected."""
    dates = [t for t in RG.extract_dates(text, ANCHOR) if (ANCHOR - t[0]).days >= 0]
    best = RG.freshest(dates, ANCHOR)
    if not best:
        return "", "", "", ""
    d, phrase, prec = best
    days = (ANCHOR - d).days
    tier = "FRESH" if days <= 30 else "RECENT" if days <= 90 else "AGING" if days <= 365 else "STALE"
    if prec == "year" and tier in ("FRESH", "RECENT"):
        tier = "AGING"
    return d.isoformat(), phrase, tier, "text_estimate"


def _num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def transform(region, fname, src_idx):
    rows = list(csv.DictReader(open(os.path.join(HANDOFF, fname), encoding="utf-8-sig", errors="replace")))
    out, stats = [], {"joined": 0, "no_join": 0, "derived_behavioral": 0}
    for r in rows:
        src = src_idx.get((r.get("email") or "").strip().lower()) \
            or src_idx.get((r.get("linkedin_url") or "").strip().lower()) or {}
        stats["joined" if src else "no_join"] += 1

        signal = (r.get("primary_signal_refined") or "").strip().upper() or "NONE"
        if signal not in SS.VALID_SIGNALS:
            signal = "NONE"

        sdate = stf = tier = ""
        basis = "none"
        if signal != "NONE":
            sdate, stf, tier, basis = SS.recency_from_age(src.get("signal_post_age", ""), ANCHOR)
            if not tier:
                sdate, stf, tier, basis = text_recency(
                    f"{r.get('confirmed_pain_evidence','')}\n{r.get('firm_intent_signals','')}")
                if not tier:
                    tier, basis = "UNDATED", "none_found"

        fit = SS.scale(r.get("fit_score"))
        bn = _num(r.get("behavioral_score"))
        if bn is None or bn <= 0:
            bn = _num(src.get("behavioral_score"))
        if bn is None or bn <= 0:
            bn = SS.SIGNAL_STRENGTH.get(signal, 2)
            stats["derived_behavioral"] += 1
        beh = SS.scale(bn)
        total = fit + beh
        conf = SS.refine_confidence(r.get("intent_confidence"), signal, tier)

        out.append({
            "intent_confidence": conf, "primary_signal_refined": signal,
            "signal_date": sdate, "signal_timeframe": stf, "recency_tier": tier, "signal_date_basis": basis,
            "fit_score": fit, "behavioral_score": beh, "total_score": total,
            "first_name": r.get("first_name", ""), "last_name": r.get("last_name", ""),
            "title": r.get("title", ""), "company_name": r.get("company_name", ""),
            "seniority": r.get("seniority", ""), "company_size": r.get("company_size", ""),
            "industry": r.get("industry", ""), "city": r.get("city", ""), "state": r.get("state", ""),
            "country": SS.country_code(r.get("country")), "email": r.get("email", ""),
            "linkedin_url": r.get("linkedin_url", ""), "linkedin_provider_id": "",
            "company_website": r.get("company_website", ""), "company_revenue": r.get("company_revenue", ""),
            "confirmed_pain_evidence": r.get("confirmed_pain_evidence", ""),
            "firm_intent_signals": r.get("firm_intent_signals", ""),
            "personalized_opener": r.get("personalized_opener", ""), "reasoning": r.get("reasoning", ""),
            "source_url": r.get("linkedin_url", ""),
            "_days": (ANCHOR - dt.date.fromisoformat(sdate)).days if sdate else 10 ** 6,
        })

    out.sort(key=lambda x: (SS.tier_rank(x["intent_confidence"]), x["total_score"], -x["_days"]), reverse=True)
    for i, r in enumerate(out, 1):
        r["rank"] = i
        r.pop("_days", None)

    outpath = os.path.join(HANDOFF, f"Oloxa_{region}_ENRICHED_standardized_{ANCHOR.isoformat()}.csv")
    with open(outpath, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=SS.OUT_COLS, extrasaction="ignore")
        w.writeheader()
        w.writerows(out)
    return outpath, out, stats


def main():
    src_idx = load_source_index()
    from collections import Counter
    for region, fname in REGIONS:
        path, rows, stats = transform(region, fname, src_idx)
        print(f"\n== {region} -> {os.path.basename(path)} ({len(rows)} rows) ==")
        print(f"   join: {stats['joined']} matched, {stats['no_join']} no-join, {stats['derived_behavioral']} behavioral derived")
        print(f"   confidence: {dict(Counter(r['intent_confidence'] for r in rows))}")
        print(f"   recency_tier: {dict(Counter(r['recency_tier'] or 'NONE' for r in rows))}")
        print(f"   basis: {dict(Counter(r['signal_date_basis'] for r in rows))}")


if __name__ == "__main__":
    main()
