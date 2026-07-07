#!/usr/bin/env python3
"""
Turn the AI Ark 2,388-agency export into:
  1. agencies_SMARTLEAD_2026-06-09.csv  — valid-email leads w/ generated signal_line (campaign-ready)
  2. agencies_CALLLIST_2026-06-09.csv   — mobile-first call list
Dedupes against every list already in the outreach pool.
"""
import csv, os, re, glob

RAW = sorted(glob.glob(os.path.expanduser("~/Downloads/Contact Export-Jun 09.csv")), key=os.path.getmtime)[-1]
SL_OUT = "agencies_SMARTLEAD_2026-06-09.csv"
CL_OUT = "agencies_CALLLIST_2026-06-09.csv"

def norm_co(s):
    s = (s or "").lower().strip()
    s = re.sub(r"[^a-z0-9 ]", "", s)
    for suf in [" llc"," inc"," co"," corp"," ltd"," agency"," group"," company"," studio"," studios"]:
        if s.endswith(suf): s = s[:-len(suf)]
    return s.strip()

# ---- exclusion sets ----
excl_co, excl_em = set(), set()
def load(path, co_cols, em_cols):
    if not os.path.exists(path): return
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            for c in co_cols:
                if row.get(c): excl_co.add(norm_co(row[c]))
            for e in em_cols:
                if row.get(e): excl_em.add(row[e].strip().lower())

load("agencies_from_proservices_2026-06-09.csv", ["company"], ["email"])
load("ar_recovery_proservices_batch1_CLEAN.csv", ["company"], ["email"])
load("invoice_chase_TOP_150_call_first_2026-06-08.csv", ["company"], ["email"])
load("sc_trades_ar_callist_2026-06-08_CLEAN.csv", ["company"], ["email"])
load("sc_smb_general_ADDON_2026-06-08_CLEAN.csv", ["company"], ["email"])

# ---- signal line generation ----
DESC = {
    "advertising services": "runs ads and creative for clients",
    "public relations and communications services": "handles PR and comms for clients",
    "design services": "does design work for clients",
    "printing services": "runs print and production for clients",
    "marketing services": "runs marketing for clients",
    "graphic design": "does brand and design work for clients",
    "software development": "builds and ships work for clients",
    "it services and it consulting": "runs IT projects for clients",
    "media production": "produces media for clients",
    "photography": "shoots for clients",
    "events services": "produces events for clients",
}
def signal_line(r):
    co = (r.get("Company Name") or r.get("Org") or "").strip()
    ind = (r.get("Company Industry") or "").strip().lower()
    city = (r.get("City") or "").strip().title()
    desc = DESC.get(ind, "does client work on invoice")
    if city:
        return f"saw {co} {desc} out of {city}"
    return f"saw {co} {desc}"

def li(u):
    u = (u or "").strip()
    return "" if not u else (u if u.startswith("http") else "https://www." + u.lstrip("/"))

sl_rows, cl_rows, seen_co, seen_em = [], [], set(), set()
drop_existing = drop_dupe = 0
with open(RAW, newline="", encoding="utf-8", errors="replace") as f:
    for r in csv.DictReader(f):
        company = (r.get("Company Name") or r.get("Org") or "").strip()
        nco = norm_co(company)
        email = (r.get("Email Business") or "").strip().lower()
        status = (r.get("Domain Settings") or "").strip()
        mobile = (r.get("Mobile Phone") or "").strip().split(",")[0].strip()
        co_phone = (r.get("Company Primary Phone") or "").strip().split(",")[0].strip()
        best = mobile or co_phone
        if not email and not best:
            continue
        if (nco and nco in excl_co) or (email and email in excl_em):
            drop_existing += 1; continue
        if (nco and nco in seen_co) or (email and email in seen_em):
            drop_dupe += 1; continue
        if nco: seen_co.add(nco)
        if email: seen_em.add(email)
        base = {
            "first_name": (r.get("First Name") or "").strip(),
            "last_name": (r.get("Last Name") or "").strip(),
            "company": company,
            "title": (r.get("Title") or "").strip(),
            "email": email,
            "email_status": status,
            "best_phone": best,
            "phone_type": "mobile" if mobile else ("company" if co_phone else ""),
            "website": (r.get("Company Website") or "").strip(),
            "linkedin_url": li(r.get("LinkedIn")),
            "city": (r.get("City") or "").strip(),
            "state": (r.get("State") or "").strip(),
            "industry": (r.get("Company Industry") or "").strip(),
            "signal_line": signal_line(r),
        }
        if email:
            sl_rows.append(base)
        if best:
            cl_rows.append({**base, "outcome": "", "notes": "", "callback_date": "", "map_booked": ""})

# Smartlead: SMTP_VALID first, then catch-all
sl_rows.sort(key=lambda x: (0 if x["email_status"] == "SMTP_VALID" else 1, x["company"].lower()))
# Call list: mobiles first
cl_rows.sort(key=lambda x: (0 if x["phone_type"] == "mobile" else 1, x["company"].lower()))

sl_cols = ["first_name","last_name","company","title","email","email_status","signal_line",
           "website","linkedin_url","city","state","industry","best_phone"]
with open(SL_OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=sl_cols, extrasaction="ignore"); w.writeheader(); w.writerows(sl_rows)

cl_cols = ["company","first_name","title","best_phone","phone_type","city","state","email",
           "linkedin_url","signal_line","outcome","notes","callback_date","map_booked"]
with open(CL_OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cl_cols, extrasaction="ignore"); w.writeheader(); w.writerows(cl_rows)

valid = sum(1 for x in sl_rows if x["email_status"] == "SMTP_VALID")
mob = sum(1 for x in cl_rows if x["phone_type"] == "mobile")
print(f"SMARTLEAD list: {len(sl_rows)} -> {SL_OUT}  (SMTP_VALID: {valid}, catch-all: {len(sl_rows)-valid})")
print(f"CALL list:      {len(cl_rows)} -> {CL_OUT}  (mobiles: {mob})")
print(f"dropped — already in pool: {drop_existing}, in-file dupes: {drop_dupe}")
print("\nsample signal lines:")
for x in sl_rows[:6]:
    print(f"  - {x['signal_line']}")
