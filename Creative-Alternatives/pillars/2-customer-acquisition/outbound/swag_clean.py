#!/usr/bin/env python3
"""Clean company + people names in a Swag outbound CSV, in place.
- Company: strip trailing legal/entity suffixes (LLP, LLC, P.C., Inc., Co., Ltd, etc.) -> 'Tobin Lucks LLP' => 'Tobin Lucks'.
- People: drop parentheticals + post-comma credentials (SHRM-CP, PMP, JD, CPA...) and re-derive first name.
- Fix the embedded company name inside any Salutation / Signal Line text.
Usage: python3 swag_clean.py <file.csv> [<file.csv> ...]
"""
import re, csv, sys

LEGAL = (r"(?:L\.?L\.?L\.?P|L\.?L\.?P|L\.?L\.?C|P\.?L\.?L\.?C|P\.?L\.?C|P\.?C|P\.?A|A\.?P\.?C|"
         r"L\.?P|S\.?C|LLP|LLC|PLLC|PC|PA|LP|SC|APC|PLC|INC|INCORPORATED|CORP|CORPORATION|"
         r"CO|COMPANY|LTD|LIMITED|GMBH|N\.?A)")
SUFFIX_RE = re.compile(r"[\s,]+" + LEGAL + r"\.?\s*$", re.I)

def clean_company(name):
    if not name: return name
    n = name.strip()
    prev = None
    while prev != n and n:
        prev = n
        n = SUFFIX_RE.sub("", n).strip()
        n = re.sub(r"[\s,]*&\s*$", "", n).strip()   # dangling '&' (e.g. '& Company' -> '&')
        n = re.sub(r"[\s,]+$", "", n).strip()
    return n or name.strip()

CRED = {"SHRM","SCP","CP","PMP","JD","ESQ","CPA","CPAS","PHR","SPHR","MBA","MPIA","PCM",
        "MSHRD","CIPD","CFP","CFA","CEBS","SHRMCP","SHRMSCP","PSM","PHRCA"}
def _is_cred(tok):
    parts = tok.strip(".,").upper().replace("-", " ").split()
    return bool(parts) and all(p in CRED for p in parts)
def clean_person(name):
    if not name: return name, ""
    n = re.sub(r"\([^)]*\)", " ", name)   # drop parentheticals
    n = n.split(",")[0]                    # drop post-comma credentials
    toks = [t for t in n.split() if not _is_cred(t)]
    full = " ".join(toks).strip() or name.split(",")[0].strip()
    first = toks[0] if toks else (full.split()[0] if full.split() else "")
    return full, first

def col(fields, *names):
    for n in names:
        if n in fields: return n
    return None

def process(path):
    rows = list(csv.DictReader(open(path)))
    if not rows: return path, 0
    f = rows[0].keys()
    ccol = col(f, "Company", "company")
    ncol = col(f, "Full Name", "full_name")
    fcol = col(f, "First Name", "first_name")
    pcols = [c for c in ("Salutation", "Signal Line", "salutation") if c in f]
    changed = 0
    for r in rows:
        raw_co = r.get(ccol, "") if ccol else ""
        clean_co = clean_company(raw_co) if ccol else ""
        if ccol and clean_co != raw_co:
            r[ccol] = clean_co; changed += 1
        if ncol:
            full, first = clean_person(r.get(ncol, ""))
            r[ncol] = full
            if fcol: r[fcol] = first
        elif fcol:
            full, first = clean_person(r.get(fcol, "")); r[fcol] = first
        for pc in pcols:
            if raw_co and clean_co and raw_co != clean_co and raw_co in r.get(pc, ""):
                r[pc] = r[pc].replace(raw_co, clean_co)
    with open(path, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(f)); w.writeheader(); w.writerows(rows)
    return path, changed

if __name__ == "__main__":
    for p in sys.argv[1:]:
        try:
            path, n = process(p); print(f"cleaned {path}: {n} company names changed")
        except Exception as e:
            print(f"ERR {p}: {e}")
