#!/usr/bin/env python3
"""Standardize + fit-score Sway's raw UK ICP list into the shared schema.

This is the HONEST 'base' enrichment: it does NOT invent buying signals. It maps
the raw list to sway_schema, ICP-fit-scores from tier+title, recovers real signals
for the few that overlap our scraped universe, and flags the rest signal-pending
(NEEDS_SIGNAL_SCRAPE). The buying-signal + date layer is added once a LinkedIn
activity scrape (AI Arc/Apify) runs — this also emits a scrape-ready URL list.
"""
from __future__ import annotations

import csv
import datetime as dt
import glob
import os
import re

import sway_schema as SS
import generate_oloxa_daily_batch as G  # reuse signal_label + opener

OLOXA = "/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa"
SRC = os.path.join(OLOXA, "sway_inbound", "sway-uk-leads-full-ICP-194_for-enrichment_2026-05-29.csv")
OUT_DIR = os.path.join(OLOXA, "sway_handoff")
ANCHOR = dt.date.today()
DATE = ANCHOR.isoformat()

EXTRA_COLS = ["icp_tier", "status", "company_domain", "enrichment_status", "dedup_note"]
COMMERCIAL = re.compile(r"commercial|business|sba|asset|equipment|develop|bridg|construction|portfolio|private|lend|finance|broker|fund|capital|invoice|factor|mortgage", re.I)
WEAK = re.compile(r"residential|realtor|estate agent|insurance|consumer|reverse mortgage|recruit", re.I)


def norm_li(u):
    u = (u or "").strip().lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^[a-z]{2}\.", "", u)  # uk.linkedin -> linkedin
    u = re.sub(r"^www\.", "", u)
    return u.rstrip("/")


def split_name(n):
    parts = (n or "").strip().split()
    return (parts[0], " ".join(parts[1:])) if parts else ("", "")


def fit_raw(tier, title, industry):
    base = {"primary": 11, "adjacent": 9, "jobs": 7}.get((tier or "").strip().lower(), 8)
    blob = f"{title} {industry}"
    if WEAK.search(blob) and not COMMERCIAL.search(blob):
        return max(1, base - 3)
    if COMMERCIAL.search(blob) and (tier or "").strip().lower() == "primary":
        return 12
    return base


def universe_signal_index():
    """normalized linkedin -> source signal row (only rows carrying a post age)."""
    idx = {}
    files = (glob.glob(os.path.join(OLOXA, "smartlead_segments", "*.csv"))
             + glob.glob(os.path.join(OLOXA, "Oloxa_*_Priority.csv"))
             + glob.glob(os.path.join(OLOXA, "Oloxa_*_Smartlead.csv")))
    for p in files:
        for r in csv.DictReader(open(p, encoding="utf-8-sig", errors="replace")):
            li = norm_li(r.get("linkedin_url"))
            if li and (r.get("signal_post_age") or "").strip():
                idx.setdefault(li, r)
    return idx


def main():
    rows = list(csv.DictReader(open(SRC, encoding="utf-8-sig", errors="replace")))
    uni = universe_signal_index()
    seen_li, seen_email = {}, {}
    out = []
    recovered = 0
    for i, r in enumerate(rows):
        first, last = split_name(r.get("Outreach Target Name") or r.get("Director Name"))
        title = r.get("Outreach Target Title") or r.get("Job Title") or ""
        company = r.get("Company Name", "")
        industry = r.get("Industry", "")
        li = r.get("LinkedIn Profile URL", "")
        email = (r.get("Email") or "").strip()
        nli = norm_li(li)

        # dedup note (we keep every row per request; just flag)
        notes = []
        if (r.get("Status") or "").strip().lower().startswith("auto-closed"):
            notes.append("duplicate (status)")
        if nli and nli in seen_li:
            notes.append(f"repeat linkedin (row {seen_li[nli]})")
        if email and email.lower() in seen_email:
            notes.append(f"repeat email (row {seen_email[email.lower()]})")
        if nli:
            seen_li.setdefault(nli, i + 1)
        if email:
            seen_email.setdefault(email.lower(), i + 1)

        src = uni.get(nli)
        if src:  # recover a real signal
            recovered += 1
            norm = {"first_name": first, "company_name": company,
                    "signals": src.get("signals", ""), "signal_post_signal": src.get("signal_post_signal", ""),
                    "signal_post_quote": src.get("signal_post_quote", "")}
            signal = G.signal_label(norm)
            if signal == "UNKNOWN" or signal not in SS.VALID_SIGNALS:
                signal = "NONE"
            sdate, stf, tier, basis = SS.recency_from_age(src.get("signal_post_age", ""), ANCHOR)
            if not tier:
                tier, basis = "UNDATED", "none_found"
            try:
                beh_src = float(src.get("behavioral_score") or 0)
            except ValueError:
                beh_src = 0.0
            beh = SS.scale(beh_src if beh_src > 0 else SS.SIGNAL_STRENGTH.get(signal, 2))
            evidence = src.get("signal_post_quote", "")
            firm = src.get("signals", "")
            opener = G.opener(norm, signal)
            estatus = "signal_recovered"
        else:  # signal-pending: fit only, no fabricated signal
            signal, sdate, stf, tier, basis = "NONE", "", "", "", "none"
            beh = SS.scale(SS.SIGNAL_STRENGTH["NONE"])
            evidence, firm = "", ""
            opener = G.opener({"first_name": first, "company_name": company, "signal_post_quote": ""}, "NONE")
            estatus = "signal_pending (needs LinkedIn scrape)"

        fit = SS.scale(fit_raw(r.get("ICP Tier"), title, industry))
        total = fit + beh
        conf = SS.refine_confidence(SS.base_tier_from_total(total), signal, tier)

        out.append({
            "intent_confidence": conf, "primary_signal_refined": signal,
            "signal_date": sdate, "signal_timeframe": stf, "recency_tier": tier, "signal_date_basis": basis,
            "fit_score": fit, "behavioral_score": beh, "total_score": total,
            "first_name": first, "last_name": last, "title": title, "company_name": company,
            "seniority": "", "company_size": "", "industry": industry, "city": "", "state": "",
            "country": "GB", "email": email, "linkedin_url": li, "linkedin_provider_id": "",
            "company_website": r.get("Website", ""), "company_revenue": "",
            "confirmed_pain_evidence": evidence, "firm_intent_signals": firm,
            "personalized_opener": opener, "reasoning": f"ICP {r.get('ICP Tier','')}; {estatus}",
            "source_url": li,
            "icp_tier": r.get("ICP Tier", ""), "status": r.get("Status", ""),
            "company_domain": r.get("Company Domain", ""), "enrichment_status": estatus,
            "dedup_note": "; ".join(notes),
            "_tier": SS.tier_rank(conf), "_total": total,
        })

    out.sort(key=lambda x: (x["_tier"], x["_total"]), reverse=True)
    for i, r in enumerate(out, 1):
        r["rank"] = i
        for k in ("_tier", "_total"):
            r.pop(k, None)

    cols = ["rank"] + SS.OUT_COLS[1:] + EXTRA_COLS
    base_path = os.path.join(OUT_DIR, f"Oloxa_UK_SwayICP194_standardized_base_{DATE}.csv")
    with open(base_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(out)

    # scrape-ready input for the AI Arc/Apify LinkedIn-activity scrape
    scrape_path = os.path.join(OUT_DIR, f"Oloxa_UK_SwayICP194_scrape_input_{DATE}.csv")
    with open(scrape_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["linkedin_url", "first_name", "last_name", "company_name", "company_domain", "email"])
        for r in out:
            if r["enrichment_status"].startswith("signal_pending") and r["linkedin_url"]:
                w.writerow([r["linkedin_url"], r["first_name"], r["last_name"], r["company_name"],
                            r["company_domain"], r["email"]])

    from collections import Counter
    print(f"rows: {len(out)} | recovered signals: {recovered} | signal_pending: {sum(1 for r in out if r['enrichment_status'].startswith('signal_pending'))}")
    print(f"fit_score dist: {dict(Counter(r['fit_score'] for r in out))}")
    print(f"confidence: {dict(Counter(r['intent_confidence'] for r in out))}")
    print(f"with_email: {sum(1 for r in out if r['email'])} | dedup_flagged: {sum(1 for r in out if r['dedup_note'])}")
    print(f"base -> {base_path}")
    print(f"scrape_input -> {scrape_path} ({sum(1 for r in out if r['enrichment_status'].startswith('signal_pending') and r['linkedin_url'])} urls)")


if __name__ == "__main__":
    main()
