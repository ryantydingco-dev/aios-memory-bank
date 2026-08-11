#!/usr/bin/env python3
"""Parse AI Ark people_search persisted tool-results -> clean Swag batch-1 candidate pool.
Filters: company PRIMARY industry in target set + strict title match + HQ in NY/NJ/CT + size overlap 25-500.
Reveals NO emails (free). Output: candidate pool CSV + stats + reject sample for QA."""
import json, glob, re, csv, sys

TOOL_DIR = "/Users/ryantydingco/.claude/projects/-Users-ryantydingco-Documents-Creative-Alternatives-AIOS/dd06337c-903b-434b-a194-646c8fa630d5/tool-results"
OUT = "/Users/ryantydingco/Documents/Creative-Alternatives-AIOS/pillars/2-customer-acquisition/outbound/swag_candidate_pool.csv"

# PRIMARY-industry whitelist (AI Ark single industry string, lowercase). Curated to professional-services ICP.
IND_OK = ["law practice", "legal services", "legal", "accounting", "accountant", "cpa",
          "real estate", "financial services", "finance", "investment", "insurance", "wealth"]
IND_BLOCK = ["lawn", "software", "education", "staffing"]  # guard against substring false-hits

TITLE_PATS = [r"\boffice manager\b", r"\bmarketing manager\b", r"\boperations manager\b",
              r"\bdirector of people\b", r"\bhead of people\b", r"\bpeople operations\b",
              r"\bhr manager\b", r"\bhuman resources manager\b", r"\bexecutive assistant\b"]
TITLE_RE = re.compile("|".join(TITLE_PATS), re.I)
STATES_OK = {"new york", "new jersey", "connecticut"}

def emp_overlap(rng):
    if not rng: return True  # unknown -> keep (API already size-filtered)
    s, e = rng.get("start"), rng.get("end")
    s = s if isinstance(s, int) else 0
    e = e if isinstance(e, int) else 10**9
    return s <= 500 and e >= 25

def load_records():
    recs, seen_files = [], 0
    files = glob.glob(TOOL_DIR + "/*.json") + glob.glob(TOOL_DIR + "/*.txt")
    for fp in files:
        try:
            raw = open(fp).read()
        except Exception:
            continue
        try:
            d = json.loads(raw)
        except Exception:
            d = raw  # may itself be a raw json string handled below
        # tool result is a list of {type:text, text: <json string>}, or a dict, or a raw string
        blobs = []
        if isinstance(d, list):
            for part in d:
                if isinstance(part, dict) and part.get("type") == "text":
                    blobs.append(part.get("text", ""))
                elif isinstance(part, str):
                    blobs.append(part)
        elif isinstance(d, dict):
            blobs.append(json.dumps(d))
        elif isinstance(d, str):
            blobs.append(d)
        for b in blobs:
            try:
                obj = json.loads(b)
            except Exception:
                continue
            if isinstance(obj, dict) and isinstance(obj.get("content"), list):
                recs.extend(obj["content"]); seen_files += 1
    return recs, seen_files

def row(rec):
    prof = rec.get("profile", {}) or {}
    comp = rec.get("company", {}) or {}
    summ = comp.get("summary", {}) or {}
    link = rec.get("link", {}) or {}
    loc = (comp.get("location", {}) or {}).get("headquarter", {}) or {}
    title = prof.get("title") or prof.get("headline") or ""
    return {
        "id": rec.get("id", ""),
        "full_name": prof.get("full_name", ""),
        "title": title,
        "company": summ.get("name", ""),
        "primary_industry": (summ.get("industry") or "").lower(),
        "domain": (link.get("domain") or (comp.get("link", {}) or {}).get("domain") or ""),
        "linkedin": link.get("linkedin", ""),
        "hq_state": (loc.get("state") or "").lower(),
        "emp_range": (summ.get("staff", {}) or {}).get("range", {}),
    }

def ind_ok(ind):
    if not ind: return False
    if any(b in ind for b in IND_BLOCK): return False
    return any(tok in ind for tok in IND_OK)

def main():
    recs, nfiles = load_records()
    # dedupe by person id
    by_id = {}
    for r in recs:
        rr = row(r)
        if rr["id"]: by_id[rr["id"]] = rr
    rows = list(by_id.values())

    keep, rej = [], []
    for r in rows:
        reasons = []
        if not ind_ok(r["primary_industry"]): reasons.append("industry:" + (r["primary_industry"] or "none"))
        if not TITLE_RE.search(r["title"] or ""): reasons.append("title")
        if r["hq_state"] and r["hq_state"] not in STATES_OK: reasons.append("state:" + r["hq_state"])
        if not emp_overlap(r["emp_range"]): reasons.append("size")
        if reasons: rej.append((r, reasons))
        else: keep.append(r)

    # dedupe keepers to one contact per company (prefer first seen)
    by_co, deduped = {}, []
    for r in keep:
        k = (r["company"] or r["domain"]).lower()
        if k and k in by_co:
            continue
        by_co[k] = True; deduped.append(r)

    with open(OUT, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Person ID", "Full Name", "Title", "Company", "Primary Industry", "Domain", "LinkedIn URL", "HQ State"])
        for r in deduped:
            w.writerow([r["id"], r["full_name"], r["title"], r["company"], r["primary_industry"], r["domain"], r["linkedin"], r["hq_state"]])

    print(f"files_parsed={nfiles}  raw_records={len(recs)}  unique_people={len(rows)}")
    print(f"passed_filter={len(keep)}  after_company_dedupe={len(deduped)}  rejected={len(rej)}")
    from collections import Counter
    print("\nKEEP by primary industry:")
    for k, v in Counter(r["primary_industry"] for r in deduped).most_common(15):
        print(f"  {v:>4}  {k}")
    print("\nKEEP by title (normalized hit):")
    def norm(t):
        m = TITLE_RE.search(t or ""); return m.group(0).lower() if m else "?"
    for k, v in Counter(norm(r["title"]) for r in deduped).most_common():
        print(f"  {v:>4}  {k}")
    print("\nSAMPLE KEEPERS (first 12):")
    for r in deduped[:12]:
        print(f"  - {r['full_name'][:22]:<22} | {r['title'][:28]:<28} | {r['company'][:26]:<26} | {r['primary_industry']}")
    print("\nSAMPLE REJECTS (first 10, with reason):")
    for r, reasons in rej[:10]:
        print(f"  - {r['full_name'][:20]:<20} | {r['title'][:24]:<24} | {r['company'][:20]:<20} | {','.join(reasons)}")
    print(f"\nWROTE: {OUT}")

if __name__ == "__main__":
    main()
