#!/usr/bin/env python3
"""Wednesday trades dial kit from the re-scored list: top CALL_FIRST leads ->
one-screen Markdown sheet (case-study-led script up top) + CSV dial log."""
import csv

SRC = "invoice_chase_TOP_150_RESCORED_2026-06-08.csv"
MD  = "DIAL SHEET — SC Trades TOP47 (Wed 2026-06-10).md"
OUT = "dial_log_SC_trades_TOP47_2026-06-10.csv"

rows = []
with open(SRC, newline="", encoding="utf-8", errors="replace") as f:
    for r in csv.DictReader(f):
        if r.get("channel") == "CALL_FIRST":
            rows.append(r)
rows.sort(key=lambda x: int(x["rank"]))

def first_phone(p): return (p or "").split(",")[0].strip()

HOOK = {
    "THIRD_PARTY_PAYER": "insurance/commercial/PM accounts that slow-pay",
    "ADMIN_AR_PAIN": "already feeling the chase",
    "INVOICE_BILLING": "invoicing volume",
    "TOOL_STACK": "billing software in place",
    "HIGH_TICKET_PROJECTS": "big commercial jobs = big AR",
    "RECURRING_RENEWALS": "recurring/contract billing",
    "GROWTH_VOLUME": "growing = AR scaling",
}

cols = ["rank","company","first_name","title","dial_phone","city","top_signal","hook",
        "call_opener","website","outcome","notes","callback_date","map_booked"]
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader()
    for r in rows:
        w.writerow({"rank": r["rank"], "company": r["company"], "first_name": r["first_name"],
            "title": r["title"], "dial_phone": first_phone(r["best_phone"]), "city": r["city"],
            "top_signal": r["top_signal"], "hook": HOOK.get(r["top_signal"], ""),
            "call_opener": r.get("call_opener",""), "website": r.get("website",""),
            "outcome":"", "notes":"", "callback_date":"", "map_booked":""})

SCRIPT = """# ☎️ DIAL SHEET — SC Trades, Top 47 (Wed)

**Dial top to bottom. Log outcomes in the .csv. Goal: book a FREE AR map (foot in the door → the $2K build).**
Windows: Tue–Thu 9:30–11:30a / 1:30–3:30p. These are insurance/commercial billers — worst stuck AR.

---

## THE SCRIPT — lead with the $650K

**Opener:**
> Hey [first name], this is Ryan — I'll be quick, tell me to buzz off if it's not relevant. Reason I'm calling: we just recovered **$650K in overdue invoices for a creative agency, Creative Alternatives — half of it in 30 days** — just by making the follow-up automatic. I'm reaching out to a few SC contractors because that same money's usually sitting on the commercial and insurance side. Quick one — when a carrier or GC drags a payment 60–90 days, who's chasing it for you: you, the office, or does it just sit?

**Pivot (after they answer):**
> That's the thing. I set it up so reminders go out automatically the day it's due, in your name, until they pay — you stop chasing, money comes in weeks faster. No pitch here — I'll literally just **map what you've got stuck, free**, and show you the number. Do something about it after or don't, your call. Want me to put that together?

**Objection — "we're fine / we get paid":**
> Sure — so how much is sitting past 60 right now on the commercial and carrier side? That's exactly what the free map shows. Residential cash-at-the-door is easy; it's the commercial/insurance accounts on terms that quietly pile up.

**If they ask "how'd you pull $650K?":**
> They'd basically given up chasing it — all collectable, just nobody's job. We made the follow-up automatic and relentless: half came back in 30 days, all of it by 90.

**Disposition key:** `NA` · `VM` · `GK` · `CONN` · `NI` · `CB` · ⭐`MAP` (free map booked)

---

## THE LIST

| # | Company | Name | Phone | City | Hook |
|---|---|---|---|---|---|
"""
lines = [f"| {r['rank']} | {r['company'][:34]} | {r['first_name']} | {first_phone(r['best_phone'])} | {r['city']} | {HOOK.get(r['top_signal'],'')} |" for r in rows]
with open(MD, "w", encoding="utf-8") as f:
    f.write(SCRIPT + "\n".join(lines) + "\n")

print(f"wrote {len(rows)} CALL_FIRST -> {MD} + {OUT}")
