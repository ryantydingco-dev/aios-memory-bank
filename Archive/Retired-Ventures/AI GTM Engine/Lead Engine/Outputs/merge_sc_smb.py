#!/usr/bin/env python3
"""
Clean the Vibe-pulled sc_smb_decisionmakers list and add the NET-NEW contacts to the
outreach pool — deduped against the SC-trades, pro-services, and Hermes-150 lists so
nobody gets double-touched.
NOTE: this is a GENERAL SMB list (not AR-pain-targeted), so it's a secondary pool —
run it through the upgraded Hermes signal model before prioritizing.
"""
import csv, os, re

GTM = "/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine"
SRC = f"{GTM}/sc_smb_decisionmakers_2026-06-02.csv"
OUT = "sc_smb_general_ADDON_2026-06-08_CLEAN.csv"

def norm_co(s):
    s = (s or "").lower().strip()
    s = re.sub(r"[^a-z0-9 ]", "", s)
    for suf in [" llc"," inc"," co"," corp"," ltd"," pllc"," lp"," group"," company"]:
        if s.endswith(suf): s = s[:-len(suf)]
    return s.strip()

# ---- exclusion sets from lists already in the outreach pool ----
excl_co, excl_em = set(), set()
def load(path, co_cols, em_cols):
    if not os.path.exists(path): return
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            for c in co_cols:
                if row.get(c): excl_co.add(norm_co(row[c]))
            for e in em_cols:
                if row.get(e): excl_em.add(row[e].strip().lower())

load("sc_trades_ar_callist_2026-06-08_CLEAN.csv", ["company"], ["email"])
load("ar_recovery_proservices_batch1_2026-06-08_CLEAN.csv", ["company"], ["email"])
load("invoice_chase_TOP_150_call_first_2026-06-08.csv", ["company"], ["email"])

def li(u):
    u=(u or "").strip()
    return "" if not u else (u if u.startswith("http") else "https://www."+u.lstrip("/"))
def stt(v):
    s=(v or "").strip()
    return "SC" if s.lower().startswith("south carolina") else s

rows, seen_co, seen_em = [], set(), set()
drop_dupe = drop_existing = 0
with open(SRC, newline="", encoding="utf-8", errors="replace") as f:
    for r in csv.DictReader(f):
        company = (r.get("prospect_company_name") or "").strip()
        nco = norm_co(company)
        email = (r.get("contact_professions_email") or "").strip().lower()
        phone = (r.get("contact_mobile_phone") or "").strip()
        if not email and not phone:
            continue
        if (nco and nco in excl_co) or (email and email in excl_em):
            drop_existing += 1; continue
        if (nco and nco in seen_co) or (email and email in seen_em):
            drop_dupe += 1; continue
        if nco: seen_co.add(nco)
        if email: seen_em.add(email)
        rows.append({
            "first_name": (r.get("prospect_first_name") or "").strip(),
            "last_name": (r.get("prospect_last_name") or "").strip(),
            "full_name": (r.get("prospect_full_name") or "").strip(),
            "title": (r.get("prospect_job_title") or "").strip(),
            "company": company,
            "email": email,
            "email_status": (r.get("contact_professional_email_status") or "").strip(),
            "best_phone": phone,
            "mobile_phone": phone,
            "website": (r.get("prospect_company_website") or "").strip(),
            "linkedin_url": li(r.get("prospect_linkedin")),
            "city": (r.get("prospect_city") or "").strip(),
            "state": stt(r.get("prospect_region_name")),
            "segment": "sc-smb-general",
            "ar_fit": "UNSCORED - run Hermes",
            "outreach_status": "not started",
            "next_action": "",
            "notes": "general SMB pull - verify AR fit before prioritizing",
        })

cols = ["first_name","last_name","full_name","title","company","email","email_status",
        "best_phone","mobile_phone","website","linkedin_url","city","state","segment",
        "ar_fit","outreach_status","next_action","notes"]
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)

from collections import Counter
sc = sum(1 for x in rows if x["state"] == "SC")
print(f"wrote {len(rows)} NET-NEW -> {OUT}")
print(f"  in SC: {sc}   out-of-SC: {len(rows)-sc}")
print(f"  with email: {sum(1 for x in rows if x['email'])}   with phone: {sum(1 for x in rows if x['best_phone'])}")
print(f"  dropped (already in outreach pool): {drop_existing}   in-file dupes: {drop_dupe}")
print("  top states:", dict(Counter(x['state'] for x in rows).most_common(5)))
