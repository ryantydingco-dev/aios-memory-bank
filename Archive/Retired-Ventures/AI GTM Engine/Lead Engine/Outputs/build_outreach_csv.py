#!/usr/bin/env python3
"""
Turn a Vibe Prospecting 'full' export into a clean, send-ready outreach CSV.
- one clean professional email + mobile phone per row
- https LinkedIn URLs
- dedupe by email + business_id
- sort valid-email rows first (protect Smartlead domain rep during warmup)
- pipeline columns appended (outreach_status / next_action / notes)

Usage:
    python3 build_outreach_csv.py <raw_full_export.csv> <output_clean.csv>
"""
import csv, sys

RAW = sys.argv[1] if len(sys.argv) > 1 else "ar_recovery_proservices_batch1_2026-06-08_full.csv"
OUT = sys.argv[2] if len(sys.argv) > 2 else "ar_recovery_proservices_batch1_CLEAN.csv"

OUT_COLS = [
    "first_name", "last_name", "full_name", "title",
    "company", "website", "email", "email_status", "mobile_phone",
    "linkedin_url", "company_linkedin", "city", "state",
    "segment", "outreach_status", "next_action", "notes",
]

def li(url: str) -> str:
    url = (url or "").strip()
    if not url:
        return ""
    if url.startswith("http"):
        return url
    return "https://www." + url.lstrip("/")

rows, seen_email, seen_biz = [], set(), set()
with open(RAW, newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        email = (r.get("contact_professions_email") or "").strip().lower()
        biz = (r.get("business_id") or "").strip()
        if not email:
            continue
        if email in seen_email or (biz and biz in seen_biz):
            continue
        seen_email.add(email)
        if biz:
            seen_biz.add(biz)
        rows.append({
            "first_name": (r.get("prospect_first_name") or "").strip(),
            "last_name": (r.get("prospect_last_name") or "").strip(),
            "full_name": (r.get("prospect_full_name") or "").strip(),
            "title": (r.get("prospect_job_title") or "").strip(),
            "company": (r.get("prospect_company_name") or "").strip(),
            "website": (r.get("prospect_company_website") or "").strip(),
            "email": email,
            "email_status": (r.get("contact_professional_email_status") or "").strip(),
            "mobile_phone": (r.get("contact_mobile_phone") or "").strip(),
            "linkedin_url": li(r.get("prospect_linkedin")),
            "company_linkedin": li(r.get("prospect_company_linkedin")),
            "city": (r.get("prospect_city") or "").strip(),
            "state": (r.get("prospect_region_name") or "").strip(),
            "segment": "pro-services",
            "outreach_status": "not started",
            "next_action": "",
            "notes": "",
        })

# valid emails first, then catch-all; tie-break by company
rows.sort(key=lambda x: (0 if x["email_status"] == "valid" else 1, x["company"].lower()))

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=OUT_COLS)
    w.writeheader()
    w.writerows(rows)

valid = sum(1 for x in rows if x["email_status"] == "valid")
phones = sum(1 for x in rows if x["mobile_phone"])
print(f"wrote {len(rows)} rows -> {OUT}")
print(f"  valid emails: {valid}   catch-all: {len(rows)-valid}")
print(f"  with mobile phone: {phones}")
