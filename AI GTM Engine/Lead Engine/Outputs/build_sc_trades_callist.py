#!/usr/bin/env python3
"""
Turn the AI Ark SC-trades export into a Salesfinity-ready cold-call list.
- best_phone = mobile, fallback to company primary phone (so max of the list is callable)
- dedupe within file + against existing SC lists (no double-dialing)
- sort: mobile-phone first, then company-phone, then email-only
- pipeline columns appended
Usage: python3 build_sc_trades_callist.py <raw_aiark_export.csv> <output_clean.csv>
"""
import csv, sys, os, re, glob

RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Downloads/Contact Export-Jun 08.csv")
OUT = sys.argv[2] if len(sys.argv) > 2 else "sc_trades_ar_callist_2026-06-08_CLEAN.csv"
GTM = "/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine"

def norm_co(s):
    s = (s or "").lower().strip()
    s = re.sub(r"[^a-z0-9 ]", "", s)
    for suf in [" llc", " inc", " co", " corp", " ltd", " pllc", " lp", " group", " company"]:
        if s.endswith(suf):
            s = s[: -len(suf)]
    return s.strip()

# ---- build exclusion sets from existing SC lists ----
excl_co, excl_email = set(), set()
def load_excl(path, co_cols, em_cols):
    if not os.path.exists(path):
        return
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            for c in co_cols:
                if row.get(c):
                    excl_co.add(norm_co(row[c]))
            for e in em_cols:
                if row.get(e):
                    excl_email.add(row[e].strip().lower())

load_excl(f"{GTM}/sc_smb_decisionmakers_2026-06-02.csv", ["prospect_company_name"], ["contact_professions_email"])
load_excl(f"{GTM}/construction_outreach_ready.csv", ["company"], ["email"])

def li(u):
    u = (u or "").strip()
    return "" if not u else (u if u.startswith("http") else "https://www." + u.lstrip("/"))

def st(v):
    s = (v or "").strip()
    return "SC" if s.lower().startswith("south carolina") else s

rows, seen_co, seen_em = [], set(), set()
dropped_dupe = dropped_existing = 0
with open(RAW, newline="", encoding="utf-8", errors="replace") as f:
    for r in csv.DictReader(f):
        company = (r.get("Company Name") or r.get("Org") or "").strip()
        nco = norm_co(company)
        email = (r.get("Email Business") or "").strip().lower()
        mobile = (r.get("Mobile Phone") or "").strip()
        co_phone = (r.get("Company Primary Phone") or "").strip()
        best = mobile or co_phone
        # skip totally uncontactable
        if not best and not email:
            continue
        # dedupe vs existing SC lists
        if (nco and nco in excl_co) or (email and email in excl_email):
            dropped_existing += 1
            continue
        # dedupe within file
        if (nco and nco in seen_co) or (email and email in seen_em):
            dropped_dupe += 1
            continue
        if nco: seen_co.add(nco)
        if email: seen_em.add(email)
        rows.append({
            "first_name": (r.get("First Name") or "").strip(),
            "last_name": (r.get("Last Name") or "").strip(),
            "full_name": (r.get("Full Name") or "").strip(),
            "title": (r.get("Title") or "").strip(),
            "company": company,
            "industry": (r.get("Company Industry") or "").strip(),
            "best_phone": best,
            "phone_type": "mobile" if mobile else ("company" if co_phone else ""),
            "mobile_phone": mobile,
            "company_phone": co_phone,
            "email": email,
            "email_status": (r.get("Domain Settings") or "").strip(),
            "website": (r.get("Company Website") or "").strip(),
            "linkedin_url": li(r.get("LinkedIn")),
            "city": (r.get("City") or "").strip(),
            "state": st(r.get("State")),
            "revenue": (r.get("Company Annual Revenue") or "").strip(),
            "founded": (r.get("Company Founding Year") or "").strip(),
            "segment": "sc-local-trades",
            "outreach_status": "not started",
            "next_action": "",
            "notes": "",
        })

# sort: mobile first, then company phone, then email-only
rank = {"mobile": 0, "company": 1, "": 2}
rows.sort(key=lambda x: (rank.get(x["phone_type"], 2), x["company"].lower()))

cols = ["first_name","last_name","full_name","title","company","industry","best_phone","phone_type",
        "mobile_phone","company_phone","email","email_status","website","linkedin_url","city","state",
        "revenue","founded","segment","outreach_status","next_action","notes"]
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)

callable_ = sum(1 for x in rows if x["best_phone"])
mobile_ = sum(1 for x in rows if x["phone_type"] == "mobile")
emailable = sum(1 for x in rows if x["email"])
print(f"wrote {len(rows)} rows -> {OUT}")
print(f"  callable (any phone): {callable_}   of those mobile: {mobile_}")
print(f"  emailable: {emailable}")
print(f"  dropped as dupes-in-file: {dropped_dupe}   dropped (already in your SC lists): {dropped_existing}")
