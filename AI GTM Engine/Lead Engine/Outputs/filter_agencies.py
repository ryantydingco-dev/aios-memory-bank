#!/usr/bin/env python3
"""Pull the likely AGENCIES out of the existing 1,000 pro-services list (no new credits).
Heuristic keyword match on company + website + title."""
import csv

SRC = "ar_recovery_proservices_batch1_CLEAN.csv"
OUT = "agencies_from_proservices_2026-06-09.csv"

KW = ["market", "advertis", "agency", "agencies", "creative", " media", "digital",
      "brand", "seo", "design", "studio", "public relation", "content", "social",
      "communications", "growth partner", "inbound", "demand gen", "web "]

rows = []
with open(SRC, newline="", encoding="utf-8", errors="replace") as f:
    for r in csv.DictReader(f):
        blob = f"{r.get('company','')} {r.get('website','')} {r.get('title','')}".lower()
        if any(k in blob for k in KW):
            rows.append(r)

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)

mob = sum(1 for x in rows if (x.get("mobile_phone") or "").strip())
em  = sum(1 for x in rows if (x.get("email") or "").strip())
li  = sum(1 for x in rows if (x.get("linkedin_url") or "").strip())
print(f"agencies pulled from the 1,000 pro-services list: {len(rows)} -> {OUT}")
print(f"  with email: {em}   with mobile: {mob}   with LinkedIn: {li}")
print("  sample:")
for x in rows[:8]:
    print(f"    - {x.get('first_name',''):10} | {x.get('company','')[:34]:34} | {x.get('city','')}, {x.get('state','')}")
