#!/usr/bin/env python3
"""
Merge website signals into the agency Smartlead list:
- per-lead signal tags + score + evidence
- evidence-based signal_line (observation) + pain_line (AR insight tied to top signal)
- tier: A = deep-research slice (high signal + multi-channel reachable), B = signal, C = no signal
Outputs: agencies_SMARTLEAD_v2_2026-06-09.csv (full) + deep_research_slice.csv (Tier A)
"""
import csv

LEADS = "agencies_SMARTLEAD_2026-06-09.csv"
SIGS  = "agency_site_signals_2026-06-09.csv"
OUT   = "agencies_SMARTLEAD_v2_2026-06-09.csv"
SLICE = "deep_research_slice.csv"

sig = {}
with open(SIGS, newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        sig[r["company"]] = r

PRIORITY = ["PAID_MEDIA", "NET_TERMS", "RETAINER", "ENTERPRISE_CLIENTS", "HIRING",
            "PROJECT_HIGH_TICKET", "ESTABLISHED", "VIDEO_PRODUCTION"]

def lines(row, tags):
    co = row["company"]; city = (row.get("city") or "").strip().title()
    loc = f" out of {city}" if city else ""
    top = next((t for t in PRIORITY if t in tags), "")
    if top == "PAID_MEDIA":
        sl = f"saw {co} runs paid media for clients{loc}"
        pl = "Fronting ad spend while clients pay net-45 means you're basically their bank — that's where the stuck money piles up."
    elif top == "NET_TERMS":
        sl = f"saw {co} bills clients on terms{loc}"
        pl = "Terms work great until the invoices start sliding past due — then someone's got to chase, and it's usually you."
    elif top == "RETAINER":
        sl = f"saw {co} works on monthly retainers{loc}"
        pl = "Retainers are great until the monthly invoices start sliding — and then it compounds every month."
    elif top == "ENTERPRISE_CLIENTS":
        sl = f"saw {co} works with bigger brands{loc}"
        pl = "Big logos are great on the site and brutal on the books — net-60 is their love language."
    elif top == "HIRING":
        sl = f"saw {co} is growing the team{loc}"
        pl = "Payroll lands on the 1st whether clients have paid or not — growth makes the late invoices hurt more, not less."
    elif top:
        sl = f"saw {co}'s client work{loc}"
        pl = "Client work on invoice means somebody's always 30 days late — and chasing them is nobody's favorite job."
    else:
        return row.get("signal_line",""), "Most agencies have five figures sitting in late invoices without realizing it.", ""
    return sl, pl, top

rows, slice_rows = [], []
with open(LEADS, newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        s = sig.get(r["company"], {})
        tags = [t for t in (s.get("signals") or "").split(";") if t]
        score = int(s.get("signal_score") or 0)
        sl, pl, top = lines(r, tags)
        r2 = {**r,
              "signals": ";".join(tags), "signal_score": score, "top_signal": top,
              "evidence": (s.get("evidence") or "")[:300],
              "signal_line": sl, "pain_line": pl}
        multi = bool((r.get("best_phone") or "").strip()) and r.get("email_status") == "SMTP_VALID"
        if score >= 4 and multi:
            r2["tier"] = "A"
            slice_rows.append(r2)
        elif score >= 1:
            r2["tier"] = "B"
        else:
            r2["tier"] = "C"
        rows.append(r2)

rows.sort(key=lambda x: (-int(x["signal_score"]), x["tier"], x["company"].lower()))
slice_rows.sort(key=lambda x: -int(x["signal_score"]))

cols = ["tier","signal_score","top_signal","signals","first_name","last_name","company","title",
        "email","email_status","best_phone","signal_line","pain_line","evidence",
        "website","linkedin_url","city","state","industry"]
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader(); w.writerows(rows)
with open(SLICE, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader(); w.writerows(slice_rows)

from collections import Counter
print(f"full v2 list: {len(rows)} -> {OUT}")
print("tiers:", dict(Counter(x['tier'] for x in rows)))
print(f"deep-research slice (Tier A): {len(slice_rows)} -> {SLICE}")
print("top-signal mix:", dict(Counter(x['top_signal'] for x in rows if x['top_signal']).most_common()))
