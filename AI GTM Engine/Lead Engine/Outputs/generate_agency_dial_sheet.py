#!/usr/bin/env python3
"""Agency dial kit (case-study-led, free map) from the 468 agencies in the pro-services list:
one-screen Markdown sheet (script + LinkedIn DM up top) + CSV dial log."""
import csv

SRC = "agencies_from_proservices_2026-06-09.csv"
MD  = "DIAL SHEET — Agencies (test block + LinkedIn).md"
OUT = "dial_log_AGENCIES_2026-06-09.csv"

rows = []
with open(SRC, newline="", encoding="utf-8", errors="replace") as f:
    for r in csv.DictReader(f):
        if (r.get("mobile_phone") or "").strip():
            rows.append(r)

cols = ["company","first_name","title","dial_phone","city","state","email","linkedin_url",
        "outcome","notes","callback_date","map_booked"]
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader()
    for r in rows:
        w.writerow({"company": r.get("company",""), "first_name": r.get("first_name",""),
            "title": r.get("title",""), "dial_phone": (r.get("mobile_phone") or "").split(",")[0].strip(),
            "city": r.get("city",""), "state": r.get("state",""), "email": r.get("email",""),
            "linkedin_url": r.get("linkedin_url",""), "outcome":"", "notes":"", "callback_date":"", "map_booked":""})

SCRIPT = """# ☎️ AGENCY DIAL + LINKEDIN — AR Recovery (Wed)

**Why this list:** agencies = strongest VERIFIED late-payment pain — AND the $650K case study IS an agency. LinkedIn is the A-channel (DM all 468), phone is the test block. Goal: book a FREE AR map.

---

## THE SCRIPT — lead with the $650K

**Phone opener:**
> Hey [first], this is Ryan — quick one, tell me to buzz off if it's not relevant. We just found **$650K in unpaid invoices for a creative agency, Creative Alternatives, and pulled half of it back in 30 days** — most had just been sitting because chasing it wasn't anyone's job. I'm reaching out to a few agency owners because it's almost always the same story. When a client drags an invoice 30–60 days, who's chasing it at [company] — you?

**Pivot:**
> Right. I set it up so reminders go out in your brand voice, automatically, until they pay — so you're not the one nagging clients and you still get paid faster. No pitch — I'll just **map what you've got stuck, free**, and show you the number. Want me to put that together for [company]?

**Objection — "clients pay eventually":**
> Sure — but how much is sitting past 30 right now, and how many hours did you or the team burn chasing last month? That's what the free map shows. For Creative Alternatives it was $650K they'd half-written-off.

**If they ask "how?":**
> They'd given up chasing it — all collectable, just nobody's job. We made the follow-up automatic; half back in 30 days, all of it by 90.

**LinkedIn DM (send to all 468):**
> Hey [first], appreciate the connect. Random one — we just recovered $650K in overdue invoices for a creative agency (half in 30 days), and I'm reaching out to a few agency owners because the same money's usually sitting in their AR. When a client drags an invoice, who chases it at [company] — you, or does it just sit?

**Disposition key:** `NA` · `VM` · `GK` · `CONN` · `NI` · `CB` · ⭐`MAP`

---

## THE LIST (call top-down; DM all on LinkedIn)

| Company | Name | Phone | City/State |
|---|---|---|---|
"""
lines = [f"| {r.get('company','')[:34]} | {r.get('first_name','')} | {(r.get('mobile_phone') or '').split(',')[0].strip()} | {r.get('city','')}, {r.get('state','')} |" for r in rows[:60]]
with open(MD, "w", encoding="utf-8") as f:
    f.write(SCRIPT + "\n".join(lines) + f"\n\n*(showing 60 of {len(rows)} callable agencies — full set + LinkedIn URLs in {OUT})*\n")

print(f"callable agencies: {len(rows)} -> {MD} + {OUT}")
