#!/usr/bin/env python3
"""Apply the recency guardrail to existing Oloxa lead CSVs.

For each row it runs recency_guardrail.assess(), then:
  - down-ranks the score (total_score = total_score_raw x recency multiplier),
  - caps intent_confidence (recomputed from the down-ranked score, then capped),
  - overrides recommended_next_action for undated/stale signals,
  - adds columns: total_score_raw, signal_recency_tier, signal_date,
    signal_date_source, recency_flag,
  - annotates reasoning with the recency note.

The Bailey Moore record is special-cased with its real, *sourced* dates — the one
worked example we have verified (NACFB Asset & Leasing Finance Broker of the Year
won Sep 2025; 10-year anniversary 2025 from 2015 incorporation, Companies House
09250316). Every other undated record is down-ranked and flagged, never given a
fabricated date.

Usage:
  python3 apply_recency_guardrail.py --anchor 2026-05-31 [--commit] f1.csv f2.csv
Dry run (default): writes <file>.remediated.csv + a remediation report, leaves
originals untouched. With --commit: backs up to <file>.bak and replaces in place.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import os

from recency_guardrail import assess, cap_confidence, intent_confidence

NEW_COLS = ["total_score_raw", "signal_recency_tier", "signal_date", "signal_date_source", "recency_flag"]

# Sourced, verified correction for the one record we have real dates for.
BAILEY_EMAIL = "b.moore@moorgatefinance.co.uk"
BAILEY_FIRM_SIGNALS = (
    "Moorgate Finance 80+ lender panel (structural)\n"
    "NACFB Asset & Leasing Finance Broker of the Year won Sep 2025 (NACFB Commercial "
    "Broker Awards 2025, 4+ Brokers category) — aging, not a fresh trigger\n"
    "Bailey closed £1.32M across motorsport, construction, brewery, haulage — date "
    "UNVERIFIED ('a busy few weeks', no post date); do not present as fresh\n"
    "Firm 10-year anniversary 2025 (Moorgate Finance Ltd, Companies House 09250316, "
    "incorporated 2015) — milestone already passed\n"
    "Job ad 'expanding our sales team' 5 months ago; Bailey recruited SDR/telesales "
    "8 months ago — both aging"
)


def insert_after(fields, anchor, newcols):
    fields = [f for f in fields if f not in newcols]
    if anchor in fields:
        i = fields.index(anchor) + 1
        return fields[:i] + newcols + fields[i:]
    return fields + newcols


def out_fieldnames(fields):
    f = insert_after(fields, "total_score", ["total_score_raw", "signal_recency_tier", "signal_date", "signal_date_source"])
    f = insert_after(f, "reasoning", ["recency_flag"])
    return f


def remediate_row(row, anchor):
    if (row.get("email") or "").strip().lower() == BAILEY_EMAIL:
        row["firm_intent_signals"] = BAILEY_FIRM_SIGNALS
    label = row.get("primary_signal_refined", "")
    evidence = row.get("confirmed_pain_evidence", "")
    firm = row.get("firm_intent_signals", "")
    g = assess(label, evidence, firm, anchor)
    # Prefer total_score_raw so re-runs are idempotent (never double-down-rank).
    try:
        raw = int(float(row.get("total_score_raw") or row.get("total_score") or 0))
    except ValueError:
        raw = 0
    new_score = round(raw * g["multiplier"]) if g["datable"] else raw
    new_conf = cap_confidence(intent_confidence(new_score), g["confidence_cap"])
    new_action = g["action_override"] or row.get("recommended_next_action", "")

    before = {
        "score": row.get("total_score", ""),
        "conf": row.get("intent_confidence", ""),
        "action": row.get("recommended_next_action", ""),
    }
    row["total_score"] = str(new_score)
    row["total_score_raw"] = str(raw)
    row["signal_recency_tier"] = g["recency_tier"]
    row["signal_date"] = g["signal_date"]
    row["signal_date_source"] = g["date_source"]
    row["recency_flag"] = g["flag"]
    row["intent_confidence"] = new_conf
    row["recommended_next_action"] = new_action
    if g["flag"] and row.get("reasoning") is not None:
        row["reasoning"] = (row.get("reasoning", "").rstrip() + f"  [RECENCY: {g['flag']}]").strip()
    after = {"score": str(new_score), "conf": new_conf, "action": new_action}
    return g, before, after


def process(path, anchor, commit):
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fields = reader.fieldnames or []
    of = out_fieldnames(fields)
    audit = []
    for row in rows:
        for c in NEW_COLS:
            row.setdefault(c, "")
        g, before, after = remediate_row(row, anchor)
        name = (f"{row.get('first_name','')} {row.get('last_name','')}".strip()
                or row.get("name", "") or row.get("company_name", ""))
        audit.append((row.get("rank", ""), name, row.get("primary_signal_refined", ""), g, before, after))

    out_path = path if commit else path.replace(".csv", ".remediated.csv")
    if commit:
        bak = path + ".bak"
        if not os.path.exists(bak):
            # Preserve the pristine original once; rows are already in memory.
            with open(bak, "w", newline="", encoding="utf-8") as b, open(path, encoding="utf-8") as src:
                b.write(src.read())
    tmp = out_path + ".tmp"
    with open(tmp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=of, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in of})
    os.replace(tmp, out_path)
    return out_path, audit


def summarize(audit):
    from collections import Counter
    tiers = Counter(g["recency_tier"] for _, _, _, g, _, _ in audit)
    conf_down = sum(1 for *_, b, a in audit if b["conf"] != a["conf"])
    act_change = sum(1 for *_, b, a in audit if b["action"] != a["action"])
    return tiers, conf_down, act_change


def report_md(results, anchor):
    lines = [f"# Recency Remediation Report — {anchor.isoformat()}", "",
             "Applied the recency guardrail (`recency_guardrail.py`) to existing Oloxa lead CSVs. "
             "Datable signals that cannot be timestamped are down-ranked and capped at LOW confidence; "
             "no dates were fabricated. Bailey Moore is corrected with sourced dates (NACFB award Sep 2025; "
             "10-yr anniversary 2025 from 2015 incorporation, Companies House 09250316).", ""]
    for path, audit in results:
        tiers, conf_down, act_change = summarize(audit)
        lines += [f"## {os.path.basename(path)}", "",
                  f"- Rows: **{len(audit)}** · confidence changed: **{conf_down}** · next-action changed: **{act_change}**",
                  f"- Recency tiers: " + ", ".join(f"`{k}` {v}" for k, v in tiers.most_common()), "",
                  "| # | Lead | Signal | Score | Conf | Action | Tier | Date source | Flag |",
                  "|---|------|--------|-------|------|--------|------|-------------|------|"]
        for rank, name, label, g, b, a in audit:
            score = f"{b['score']}→{a['score']}" if b['score'] != a['score'] else a['score']
            conf = f"{b['conf']}→**{a['conf']}**" if b['conf'] != a['conf'] else a['conf']
            action = f"{b['action']}→**{a['action']}**" if b['action'] != a['action'] else a['action']
            flag = (g["flag"][:80] + "…") if len(g["flag"]) > 80 else g["flag"]
            lines.append(f"| {rank} | {name} | {label} | {score} | {conf} | {action} | "
                         f"`{g['recency_tier']}` | {g['date_source'] or '—'} | {flag} |")
        lines.append("")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anchor", default=dt.date.today().isoformat())
    ap.add_argument("--commit", action="store_true")
    ap.add_argument("files", nargs="+")
    args = ap.parse_args()
    anchor = dt.date.fromisoformat(args.anchor)
    results = []
    for path in args.files:
        out_path, audit = process(path, anchor, args.commit)
        results.append((out_path, audit))
        print(f"{'committed' if args.commit else 'wrote'} {out_path}")
    report_dir = os.path.dirname(os.path.abspath(args.files[0]))
    suffix = "" if args.commit else " (dry-run)"
    report_path = os.path.join(report_dir, f"Recency Remediation Report - {anchor.isoformat()}{suffix}.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md(results, anchor))
    print(f"report -> {report_path}")


if __name__ == "__main__":
    main()
