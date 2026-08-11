#!/usr/bin/env python3
"""Swag batch-1 proxy-ranker. Reads AI Ark people_search dumps, applies the same precision
filter as swag_pool_filter, then scores each clean candidate on FREE firmographic proxies
(size sweet-spot, title decision-power, revenue band) and selects top ~250 with segment quotas.
No buy-signal data (AI Ark metric filters broken) — those get layered in week 1 via Explorium."""
import json, glob, re, csv
from collections import Counter, defaultdict

TOOL_DIR = "/Users/ryantydingco/.claude/projects/-Users-ryantydingco-Documents-Creative-Alternatives-AIOS/dd06337c-903b-434b-a194-646c8fa630d5/tool-results"
OUT_DIR = "/Users/ryantydingco/Documents/Creative-Alternatives-AIOS/pillars/2-customer-acquisition/outbound"
OUT_TOP = OUT_DIR + "/swag_batch1_ranked_top250.csv"
OUT_ALL = OUT_DIR + "/swag_candidate_pool_ranked.csv"

IND_OK = ["law practice", "legal services", "legal", "accounting", "accountant", "cpa",
          "real estate", "financial services", "finance", "investment", "insurance", "wealth"]
IND_BLOCK = ["lawn", "software", "education", "staffing"]
TITLE_PATS = [r"\boffice manager\b", r"\bmarketing manager\b", r"\boperations manager\b",
              r"\bdirector of people\b", r"\bhead of people\b", r"\bpeople operations\b",
              r"\bhr manager\b", r"\bhuman resources manager\b", r"\bexecutive assistant\b"]
TITLE_RE = re.compile("|".join(TITLE_PATS), re.I)
STATES_OK = {"new york", "new jersey", "connecticut"}

# segment normalization for quotas
def segment(ind):
    if "law" in ind or "legal" in ind: return "law"
    if "account" in ind or "cpa" in ind: return "accounting"
    if "real estate" in ind: return "real estate"
    if "insur" in ind: return "insurance"
    if "financ" in ind or "invest" in ind or "wealth" in ind: return "financial"
    return "other"

QUOTA = {"financial": 80, "law": 70, "accounting": 55, "real estate": 45, "insurance": 5, "other": 2}
TARGET = 250

def load_records():
    recs = []
    for fp in glob.glob(TOOL_DIR + "/*.json") + glob.glob(TOOL_DIR + "/*.txt"):
        try: raw = open(fp).read()
        except Exception: continue
        try: d = json.loads(raw)
        except Exception: d = raw
        blobs = []
        if isinstance(d, list):
            for part in d:
                if isinstance(part, dict) and part.get("type") == "text": blobs.append(part.get("text", ""))
                elif isinstance(part, str): blobs.append(part)
        elif isinstance(d, dict): blobs.append(json.dumps(d))
        elif isinstance(d, str): blobs.append(d)
        for b in blobs:
            try: obj = json.loads(b)
            except Exception: continue
            if isinstance(obj, dict) and isinstance(obj.get("content"), list):
                recs.extend(obj["content"])
    return recs

def row(rec):
    prof = rec.get("profile", {}) or {}
    comp = rec.get("company", {}) or {}
    summ = comp.get("summary", {}) or {}
    link = rec.get("link", {}) or {}
    loc = (comp.get("location", {}) or {}).get("headquarter", {}) or {}
    fin = (comp.get("financial", {}) or {}).get("revenue", {}) or {}
    ann = fin.get("annual", {}) or {}
    rng = (summ.get("staff", {}) or {}).get("range", {}) or {}
    return {
        "id": rec.get("id", ""), "full_name": prof.get("full_name", ""),
        "title": prof.get("title") or prof.get("headline") or "",
        "company": summ.get("name", ""), "primary_industry": (summ.get("industry") or "").lower(),
        "domain": (link.get("domain") or (comp.get("link", {}) or {}).get("domain") or ""),
        "linkedin": link.get("linkedin", ""), "hq_state": (loc.get("state") or "").lower(),
        "emp_start": rng.get("start"), "emp_end": rng.get("end"),
        "founded": summ.get("founded_year"), "rev_end": ann.get("end"),
    }

def ind_ok(ind):
    if not ind: return False
    if any(b in ind for b in IND_BLOCK): return False
    return any(tok in ind for tok in IND_OK)

def emp_overlap(s, e):
    s = s if isinstance(s, int) else 0
    e = e if isinstance(e, int) else 10**9
    return s <= 500 and e >= 25

def size_score(s, e):
    if not isinstance(e, int): return 1, "size?"
    if e <= 50: return 1, "11-50"
    if e <= 200: return 3, "51-200"      # sweet spot: needs recurring swag, office-mgr/HR is buyer
    if e <= 500: return 2, "201-500"
    return 1, "500+"

def title_score(t):
    tl = (t or "").lower()
    if re.search(r"office manager", tl): return 3, "office mgr"
    if re.search(r"hr manager|human resources manager|director of people|head of people|people operations", tl): return 3, "people/HR"
    if re.search(r"operations manager", tl): return 2, "ops mgr"
    if re.search(r"marketing manager", tl): return 2, "marketing mgr"
    if re.search(r"executive assistant", tl): return 1, "exec asst"
    return 1, "?"

def rev_score(r):
    return (1, ">=10M") if isinstance(r, int) and r >= 10_000_000 else (0, "")

def main():
    by_id = {}
    for rec in load_records():
        r = row(rec)
        if r["id"]: by_id[r["id"]] = r
    # filter
    keep = []
    for r in by_id.values():
        if not ind_ok(r["primary_industry"]): continue
        if not TITLE_RE.search(r["title"]): continue
        if r["hq_state"] and r["hq_state"] not in STATES_OK: continue
        if not emp_overlap(r["emp_start"], r["emp_end"]): continue
        keep.append(r)
    # dedupe to one contact per company
    seen, deduped = set(), []
    for r in keep:
        k = (r["company"] or r["domain"]).lower()
        if k in seen: continue
        seen.add(k); deduped.append(r)
    # score
    for r in deduped:
        ss, sb = size_score(r["emp_start"], r["emp_end"])
        ts, tb = title_score(r["title"])
        rs, rb = rev_score(r["rev_end"])
        r["size_bucket"] = sb; r["segment"] = segment(r["primary_industry"])
        r["score"] = ss + ts + rs
        r["why"] = f"size:{sb}(+{ss}) title:{tb}(+{ts})" + (f" rev:{rb}(+{rs})" if rs else "")
    deduped.sort(key=lambda x: (-x["score"], x["segment"]))
    # write full ranked pool
    cols = ["score", "segment", "size_bucket", "full_name", "title", "company",
            "primary_industry", "domain", "linkedin", "hq_state", "why", "id"]
    with open(OUT_ALL, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader()
        for r in deduped: w.writerow(r)
    # segment-quota selection
    bucket = defaultdict(list)
    for r in deduped: bucket[r["segment"]].append(r)
    selected = []
    for seg, q in QUOTA.items():
        selected.extend(bucket.get(seg, [])[:q])
    selected.sort(key=lambda x: -x["score"])
    if len(selected) > TARGET: selected = selected[:TARGET]
    with open(OUT_TOP, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader()
        for r in selected: w.writerow(r)

    print(f"clean_pool={len(deduped)}  selected_top={len(selected)}")
    print("\nSelected mix by segment:")
    for k, v in Counter(r["segment"] for r in selected).most_common(): print(f"  {v:>4}  {k}")
    print("\nSelected mix by title:")
    for k, v in Counter(title_score(r["title"])[1] for r in selected).most_common(): print(f"  {v:>4}  {k}")
    print("\nSelected mix by size bucket:")
    for k, v in Counter(r["size_bucket"] for r in selected).most_common(): print(f"  {v:>4}  {k}")
    print("\nScore distribution (selected):")
    for k, v in sorted(Counter(r["score"] for r in selected).items(), reverse=True): print(f"  score {k}: {v}")
    print("\nTop 12:")
    for r in selected[:12]:
        print(f"  [{r['score']}] {r['full_name'][:20]:<20} | {r['title'][:24]:<24} | {r['company'][:24]:<24} | {r['segment']}")
    print(f"\nWROTE: {OUT_TOP}\nWROTE: {OUT_ALL}")

if __name__ == "__main__":
    main()
