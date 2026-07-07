#!/usr/bin/env python3
"""Convert an Oloxa battlecard workflow JSON result into a Smartlead/HubSpot-ready CSV.

Usage:
    python3 battlecards_to_csv.py <input_json> <output_csv>

Reads the JSON returned by the 'oloxa-outbound-battlecards' dynamic workflow
({date, count, cards:[...]}) and flattens each card into one CSV row with all
channel drafts. Drafts only - nothing is sent.
"""
import csv
import html
import json
import re
import sys

FIELDS = [
    "rank", "assigned_to", "market", "signal", "signal_verified",
    "signal_recency", "confidence", "qa_pass", "name", "title", "company",
    "email", "linkedin_url", "pain_hypothesis", "why_now",
    "recommended_sequence", "linkedin_connect_note", "linkedin_dm",
    "email_subject", "email_body", "cold_call_opener", "voicemail", "sms",
    "follow_up_1", "follow_up_2", "top_objection", "objection_response",
    "evidence", "red_flags", "qa_violations",
]

# Verify-stage recency guardrail. The dynamic workflow should already set
# signal_verified=NO / confidence=LOW on undated signals, but this is the
# backstop at the CSV layer: never let an undated/unverified signal carry
# HIGH/MEDIUM confidence into a send-ready battlecard.
_UNDATED_RECENCY = re.compile(r"undated|unverif|unknown|stale|older|cannot|could ?not|no date|n/?a", re.I)


def recency_flag(verified, recency, confidence):
    v = str(verified).strip().lower()
    rec = str(recency or "").strip()
    conf = str(confidence or "").strip().upper()
    if v in ("", "false", "no", "n", "0"):
        return "UNVERIFIED SIGNAL: signal_verified is not YES — hold; do not present a 'why now' as fact"
    if (not rec or _UNDATED_RECENCY.search(rec)) and conf in ("HIGH", "MEDIUM"):
        return (f"CONFIDENCE TOO HIGH FOR RECENCY: '{rec or 'blank'}' recency with {conf} "
                f"confidence — cap at LOW and re-verify the trigger date before sending")
    return ""


def row_from_card(card):
    r = card.get("research", {}) or {}
    b = card.get("battlecard", {}) or {}
    obj = b.get("top_objection", {}) or {}
    return {
        "rank": card.get("rank", ""),
        "assigned_to": card.get("assigned_to", ""),
        "market": card.get("market", ""),
        "signal": card.get("signal", ""),
        "signal_verified": r.get("signal_verified", ""),
        "signal_recency": r.get("signal_recency", ""),
        "recency_flag": recency_flag(
            r.get("signal_verified", ""),
            r.get("signal_recency", ""),
            b.get("confidence", r.get("confidence", "")),
        ),
        "confidence": b.get("confidence", r.get("confidence", "")),
        "qa_pass": card.get("qa_pass", ""),
        "name": card.get("name", ""),
        "title": card.get("title", ""),
        "company": card.get("company", ""),
        "email": card.get("email", ""),
        "linkedin_url": card.get("linkedin_url", ""),
        "pain_hypothesis": r.get("pain_hypothesis", ""),
        "why_now": r.get("why_now", ""),
        "recommended_sequence": b.get("recommended_sequence", ""),
        "linkedin_connect_note": b.get("linkedin_connect_note", ""),
        "linkedin_dm": b.get("linkedin_dm", ""),
        "email_subject": b.get("email_subject", ""),
        "email_body": b.get("email_body", ""),
        "cold_call_opener": b.get("cold_call_opener", ""),
        "voicemail": b.get("voicemail", ""),
        "sms": b.get("sms", ""),
        "follow_up_1": b.get("follow_up_1", ""),
        "follow_up_2": b.get("follow_up_2", ""),
        "top_objection": obj.get("objection", ""),
        "objection_response": obj.get("response", ""),
        "evidence": " | ".join(r.get("evidence", []) or []),
        "red_flags": " | ".join(r.get("red_flags", []) or []),
        "qa_violations": " | ".join(card.get("qa_violations", []) or []),
    }


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        data = json.load(f)
    # Accept either the raw workflow return ({date,count,cards}) or the task
    # envelope that wraps it ({summary,agentCount,logs,result:{...cards}}).
    if "cards" not in data and isinstance(data.get("result"), dict):
        data = data["result"]
    cards = data.get("cards", [])
    with open(sys.argv[2], "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, quoting=csv.QUOTE_ALL)
        w.writeheader()
        for c in cards:
            row = {
                k: (html.unescape(v) if isinstance(v, str) else v)
                for k, v in row_from_card(c).items()
            }
            w.writerow(row)
    print(f"Wrote {len(cards)} battlecards to {sys.argv[2]}")


if __name__ == "__main__":
    main()
