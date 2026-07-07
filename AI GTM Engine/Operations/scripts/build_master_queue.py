#!/usr/bin/env python3
"""Merge the standardized UK/US/CA batches into ONE ordered master pull-list.

Output: a single CSV (all leads, one ranked queue) + a readable markdown of the
live (FRESH/RECENT) leads to Loom now. Sort: Buying Signal Tier -> total_score
-> freshest signal. Re-run any time the standardized batches refresh.

Usage: python3 build_master_queue.py [YYYY-MM-DD]
"""
import csv
import datetime as dt
import glob
import os
import sys

HAND = "/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa/sway_handoff"
DATE = sys.argv[1] if len(sys.argv) > 1 else "2026-06-01"
ANCHOR = dt.date.fromisoformat(DATE)
RANK = {"HIGH": 4, "MEDIUM_HIGH": 3, "MEDIUM": 2, "LOW": 1, "": 0}

CSV_COLS = ["rank", "batch", "intent_confidence", "primary_signal_refined", "signal_date",
            "signal_timeframe", "recency_tier", "signal_date_basis", "fit_score", "behavioral_score",
            "total_score", "first_name", "last_name", "title", "company_name", "seniority",
            "company_size", "industry", "city", "state", "country", "email", "linkedin_url",
            "linkedin_provider_id", "company_website", "company_revenue", "confirmed_pain_evidence",
            "firm_intent_signals", "personalized_opener", "reasoning", "source_url"]


def days_old(r):
    sd = r.get("signal_date")
    if not sd:
        return 10 ** 6
    try:
        return (ANCHOR - dt.date.fromisoformat(sd)).days
    except ValueError:
        return 10 ** 6


def main():
    files = sorted(glob.glob(os.path.join(HAND, f"Oloxa_*_ENRICHED_standardized_{DATE}.csv")))
    rows = []
    for p in files:
        region = os.path.basename(p).split("_")[1]  # UK / US / CA
        for r in csv.DictReader(open(p, encoding="utf-8-sig")):
            r["batch"] = region
            rows.append(r)
    rows.sort(key=lambda r: (RANK.get(r.get("intent_confidence", ""), 0),
                             int(r.get("total_score") or 0), -days_old(r)), reverse=True)
    for i, r in enumerate(rows, 1):
        r["rank"] = i

    out_csv = os.path.join(HAND, f"Oloxa_MASTER_QUEUE_{DATE}.csv")
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_COLS, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    # ---- readable markdown: the live (FRESH/RECENT) leads to Loom now ----
    from collections import Counter
    live = [r for r in rows if r.get("recency_tier") in ("FRESH", "RECENT")]
    by_batch = Counter(r["batch"] for r in rows)
    by_tier = Counter(r.get("intent_confidence", "") for r in rows)
    md = [f"# Oloxa Master Pull List — {DATE}", "",
          f"One ordered queue across all batches: **{len(rows)} leads** "
          f"({by_batch.get('UK',0)} GB · {by_batch.get('US',0)} US · {by_batch.get('CA',0)} CA). "
          f"Sorted by Buying Signal Tier → score → freshest.",
          "", f"**Buying Signal Tier:** {by_tier.get('HIGH',0)} HIGH · {by_tier.get('MEDIUM_HIGH',0)} MEDIUM_HIGH · "
          f"{by_tier.get('MEDIUM',0)} MEDIUM · {by_tier.get('LOW',0)} LOW.",
          "", f"Full pullable file: `{os.path.basename(out_csv)}` (all {len(rows)} leads, every column).", "",
          f"## 🔴 Live signals to Loom now — {len(live)} leads (FRESH ≤30d / RECENT ≤90d)", "",
          "| # | Lead | Company | Region | Signal | Tier | Score | When | Date basis |",
          "|---|------|---------|--------|--------|------|-------|------|-----------|"]
    for r in live:
        name = f"{r.get('first_name','')} {r.get('last_name','')}".strip()
        md.append(f"| {r['rank']} | {name} | {r.get('company_name','')} | {r.get('country','')} | "
                  f"{r.get('primary_signal_refined','')} | {r.get('intent_confidence','')} | "
                  f"{r.get('total_score','')} | {r.get('signal_timeframe','')} | {r.get('signal_date_basis','')} |")
    md += ["", f"_The remaining {len(rows)-len(live)} leads (aging / stale / no-signal) are in the CSV below the live set "
           f"— work them after the live queue or re-verify their trigger first._"]
    out_md = os.path.join(HAND, f"Oloxa Master Pull List - {DATE}.md")
    with open(out_md, "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    print(f"wrote {out_csv} ({len(rows)} leads)")
    print(f"wrote {out_md} (live={len(live)})")
    print(f"tiers: {dict(by_tier)} | batches: {dict(by_batch)} | live FRESH/RECENT: {len(live)}")


if __name__ == "__main__":
    main()
