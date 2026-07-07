#!/usr/bin/env python3
"""Compute REAL GTM facts deterministically (no LLM) for the weekly learning loop.

Honesty safeguard: this script only counts what is actually on disk. It emits a
JSON facts blob the learning workflow interprets. It NEVER invents outcomes.

Sources (all optional; absent => reported as zero/empty):
  - Battlecards CSV:    Oloxa_Battlecards_<date>.csv   (pre-launch signal/quality facts)
  - Outcome Tracker:    Oloxa_Outcome_Tracker.csv       (real sends/replies/meetings)

Usage:
  python3 gtm_learning_facts.py --outputs "<Outputs dir>" [--date YYYY-MM-DD]
"""
import argparse
import csv
import glob
import json
import os
from collections import Counter, defaultdict

REFRAME_KW = [
    "direct lender", "not a broker", "balance-sheet", "single-lender",
    "single-source", "single source", "lender-side", "residential retail",
    "off-profile", "does not apply",
]


def action_of(r):
    conf = (r.get("confidence") or "").upper()
    verified = (r.get("signal_verified") or "").strip().lower() in ("true", "1", "yes", "y")
    rec = (r.get("signal_recency") or "").lower()
    flags = (r.get("red_flags") or "").lower()
    if conf == "LOW" or not verified:
        return "HOLD"
    if any(k in flags for k in REFRAME_KW):
        return "REVIEW"
    if conf == "MEDIUM" and ("unverif" in rec or rec == "older"):
        return "REVIEW"
    return "SEND"


def latest(outputs, pattern, date=None):
    if date:
        p = os.path.join(outputs, pattern.replace("*", date))
        if os.path.exists(p):
            return p
    cands = sorted(glob.glob(os.path.join(outputs, pattern)))
    return cands[-1] if cands else None


def pct(n, d):
    return round(100.0 * n / d, 1) if d else 0.0


def battlecard_facts(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    n = len(rows)
    by_action = Counter(action_of(r) for r in rows)
    sig_action = defaultdict(Counter)
    seg_action = defaultdict(Counter)
    recency = Counter()
    verified_no = []
    qa_fixed = 0
    qa_examples = []
    objections = []
    for r in rows:
        act = action_of(r)
        sig_action[(r.get("signal") or "?")][act] += 1
        seg_action[(r.get("market") or "?")][act] += 1
        recency[(r.get("signal_recency") or "?")] += 1
        if (r.get("signal_verified") or "").strip().lower() not in ("true", "1", "yes", "y"):
            verified_no.append({"name": r.get("name"), "company": r.get("company"), "signal": r.get("signal")})
        viol = (r.get("qa_violations") or "").strip()
        if viol:
            qa_fixed += 1
            if len(qa_examples) < 6:
                qa_examples.append({"name": r.get("name"), "fix": viol[:240]})
        obj = (r.get("top_objection") or "").strip()
        if obj:
            objections.append({"company": r.get("company"), "signal": r.get("signal"), "objection": obj[:200]})
    return {
        "file": os.path.basename(path),
        "n_leads": n,
        "by_action": dict(by_action),
        "send_rate_pct": pct(by_action.get("SEND", 0), n),
        "signal_to_action": {k: dict(v) for k, v in sig_action.items()},
        "segment_to_action": {k: dict(v) for k, v in seg_action.items()},
        "recency_distribution": dict(recency),
        "unverified_signals": verified_no,
        "qa_fixes_applied": qa_fixed,
        "qa_fix_examples": qa_examples,
        "predicted_objections": objections,
    }


def outcome_facts(path):
    if not path or not os.path.exists(path):
        return {"file": None, "rows": 0, "sent": 0, "replied": 0, "positive": 0, "meetings": 0,
                "has_outcomes": False, "by_signal": {}, "by_segment": {}, "by_channel": {}, "objection_tags": {}}
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = [r for r in csv.DictReader(f) if any((v or "").strip() for v in r.values())]

    def b(r, k):
        return (r.get(k) or "").strip().lower() in ("true", "1", "yes", "y")

    sent = sum(1 for r in rows if b(r, "sent"))
    replied = sum(1 for r in rows if b(r, "replied"))
    positive = sum(1 for r in rows if (r.get("reply_sentiment") or "").lower() == "positive")
    meetings = sum(1 for r in rows if b(r, "meeting_booked"))

    def grp(key):
        d = defaultdict(lambda: {"sent": 0, "replied": 0, "meetings": 0})
        for r in rows:
            g = (r.get(key) or "?")
            if b(r, "sent"):
                d[g]["sent"] += 1
            if b(r, "replied"):
                d[g]["replied"] += 1
            if b(r, "meeting_booked"):
                d[g]["meetings"] += 1
        return {k: v for k, v in d.items()}

    return {
        "file": os.path.basename(path),
        "rows": len(rows), "sent": sent, "replied": replied, "positive": positive, "meetings": meetings,
        "has_outcomes": sent > 0,
        "reply_rate_pct": pct(replied, sent), "meeting_rate_pct": pct(meetings, sent),
        "by_signal": grp("signal"), "by_segment": grp("segment"), "by_channel": grp("channel"),
        "objection_tags": dict(Counter((r.get("objection_tag") or "").strip() for r in rows if (r.get("objection_tag") or "").strip())),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outputs", required=True)
    ap.add_argument("--date", default=None)
    args = ap.parse_args()
    bc = latest(args.outputs, "Oloxa_Battlecards_*.csv", args.date)
    oc = os.path.join(args.outputs, "Oloxa_Outcome_Tracker.csv")
    facts = {
        "generated_for_date": args.date or "latest",
        "battlecards": battlecard_facts(bc) if bc else {"file": None, "n_leads": 0},
        "outcomes": outcome_facts(oc),
    }
    print(json.dumps(facts, indent=2))


if __name__ == "__main__":
    main()
