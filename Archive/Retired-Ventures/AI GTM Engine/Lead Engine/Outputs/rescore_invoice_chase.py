#!/usr/bin/env python3
"""
Re-score the Hermes invoice-chase TOP-150 with a TIERED buying-signal model.
Fixes vs the original (additive tag-count):
  - drops OWNER_DECISION_MAKER from the signal score (it's a FIT attribute, fires 100%)
  - weights signals by directness (Tier 1 strong > Tier 3 keyword)
  - applies a segment multiplier (insurance/third-party-payer trades weighted hardest, MSP down)
  - re-derives fit by segment
  - routes channel by contact data (phone -> call, email-only -> email/Sendr)
NOTE: this re-weights EXISTING evidence. The big lift (hiring/lien/review signals)
comes when Hermes re-enriches per the new spec — see the .md spec.
"""
import csv

SRC = "invoice_chase_TOP_150_call_first_2026-06-08.csv"
OUT = "invoice_chase_TOP_150_RESCORED_2026-06-08.csv"

# Intent weights (OWNER_DECISION_MAKER intentionally excluded -> it's fit, not intent)
W = {
    "THIRD_PARTY_PAYER": 3,   # insurance/gov/PM slow-pay = worst stuck AR
    "ADMIN_AR_PAIN":     3,   # most direct "they feel it" signal
    "INVOICE_BILLING":   2,
    "TOOL_STACK":        2,   # billing software present = easy delivery + has AR
    "HIGH_TICKET_PROJECTS": 1,
    "RECURRING_RENEWALS":   1,
    "GROWTH_VOLUME":        1,
}
SEG_MULT = {  # AR-pain intensity by segment
    "Restoration/Roofing/Trades": 1.25,
    "Agency/Marketing/Creative":  1.00,
    "Consulting/Professional Services": 0.90,
    "pro-services": 0.90,
    "MSP/IT Services": 0.60,   # recurring auto-billed -> less AR pain
}
SEG_FIT = {
    "Restoration/Roofing/Trades": 5,
    "Agency/Marketing/Creative":  4,
    "Consulting/Professional Services": 4,
    "pro-services": 4,
    "MSP/IT Services": 2,
}

def topsig(tags):
    present = [(W[t], t) for t in tags if t in W]
    return max(present)[1] if present else ""

rows = []
with open(SRC, newline="", encoding="utf-8", errors="replace") as f:
    for r in csv.DictReader(f):
        tags = {t.strip() for t in (r.get("buying_signal_tags") or "").split(";") if t.strip()}
        seg = (r.get("ar_segment") or "").strip()
        intent_raw = sum(W.get(t, 0) for t in tags)
        intent_adj = intent_raw * SEG_MULT.get(seg, 1.0)
        intent = round(min(5.0, intent_adj / 2.0), 1)          # ~10 raw -> 5
        try:
            fit = SEG_FIT.get(seg, int(float(r.get("fit_score_0_5") or 4)))
        except ValueError:
            fit = 4
        total = round(fit + intent, 1)
        phone = (r.get("best_phone") or "").strip()
        if phone and total >= 7.5:
            ch = "CALL_FIRST"
        elif phone:
            ch = "CALL"
        else:
            ch = "EMAIL_SENDR"
        rows.append({
            "new_total_0_10": total,
            "intent_0_5": intent,
            "fit_0_5": fit,
            "channel": ch,
            "top_signal": topsig(tags),
            "ar_segment": seg,
            "buying_signal_tags": r.get("buying_signal_tags", ""),
            "first_name": r.get("first_name", ""),
            "full_name": r.get("full_name", ""),
            "title": r.get("title", ""),
            "company": r.get("company", ""),
            "best_phone": phone,
            "email": r.get("email", ""),
            "email_status": r.get("email_status", ""),
            "city": r.get("city", ""),
            "state": r.get("state", ""),
            "website": r.get("website", ""),
            "linkedin_url": r.get("linkedin_url", ""),
            "likely_pain_hypothesis": r.get("likely_pain_hypothesis", ""),
            "call_opener": r.get("call_opener", ""),
            "outreach_status": "not started",
            "next_action": "",
        })

rows.sort(key=lambda x: (x["new_total_0_10"], 1 if x["best_phone"] else 0), reverse=True)
for i, x in enumerate(rows, 1):
    x["rank"] = i

cols = ["rank","new_total_0_10","intent_0_5","fit_0_5","channel","top_signal","ar_segment",
        "buying_signal_tags","first_name","full_name","title","company","best_phone","email",
        "email_status","city","state","website","linkedin_url","likely_pain_hypothesis",
        "call_opener","outreach_status","next_action"]
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)

from collections import Counter
print(f"wrote {len(rows)} -> {OUT}")
print("new_total band:", dict(sorted(Counter(x["new_total_0_10"] for x in rows).items(), reverse=True)))
print("channel:", dict(Counter(x["channel"] for x in rows)))
print("call-first (phone + high score):", sum(1 for x in rows if x["channel"] == "CALL_FIRST"))
print("\nTOP 8 after re-score:")
for x in rows[:8]:
    print(f"  {x['rank']:>2}. {x['new_total_0_10']:>4} [{x['channel']:<11}] {x['top_signal']:<18} {x['company'][:30]:<30} {x['best_phone']}")
