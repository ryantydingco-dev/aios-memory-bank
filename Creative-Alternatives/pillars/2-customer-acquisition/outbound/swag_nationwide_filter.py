#!/usr/bin/env python3
"""Nationwide Swag pool filter. Processes ONLY new people_search dumps (post-snapshot),
applies primary-industry + strict-title precision filter (US-wide), dedupes by company,
and EXCLUDES anyone already in the batch-1 pool. Appends/refreshes swag_nationwide_pool.csv."""
import json, glob, re, csv, os

TOOL_DIR = "/Users/ryantydingco/.claude/projects/-Users-ryantydingco-Documents-Creative-Alternatives-AIOS/dd06337c-903b-434b-a194-646c8fa630d5/tool-results"
SCRATCH = "/private/tmp/claude-501/-Users-ryantydingco-Documents-Creative-Alternatives-AIOS/dd06337c-903b-434b-a194-646c8fa630d5/scratchpad"
OUTDIR = "/Users/ryantydingco/Documents/Creative-Alternatives-AIOS/pillars/2-customer-acquisition/outbound"
OUT = OUTDIR + "/swag_nationwide_pool.csv"
SNAP = SCRATCH + "/pre_nationwide_files.txt"
B1 = OUTDIR + "/swag_candidate_pool_ranked.csv"   # batch-1 384 (ids + companies to exclude)

IND_OK = ["law practice","legal services","legal","accounting","accountant","cpa","real estate",
          "financial services","finance","investment","insurance","wealth","advertising","marketing"]
IND_BLOCK = ["lawn","software","education","staffing","construction","recreational","manufacturing"]
TITLE_PATS = [r"\boffice manager\b", r"\bmarketing manager\b", r"\boperations manager\b",
              r"\bdirector of people\b", r"\bhead of people\b", r"\bpeople operations\b",
              r"\bhr manager\b", r"\bhuman resources manager\b", r"\bexecutive assistant\b"]
TITLE_RE = re.compile("|".join(TITLE_PATS), re.I)

def segment(ind):
    if "law" in ind or "legal" in ind: return "law"
    if "account" in ind or "cpa" in ind: return "accounting"
    if "real estate" in ind: return "real estate"
    if "insur" in ind: return "insurance"
    if "advertis" in ind or "marketing" in ind: return "agency"
    if "financ" in ind or "invest" in ind or "wealth" in ind: return "financial"
    return "other"

def ind_ok(ind):
    if not ind: return False
    if any(b in ind for b in IND_BLOCK): return False
    return any(t in ind for t in IND_OK)

def parse(fp):
    try: raw=open(fp).read()
    except: return None
    try: d=json.loads(raw)
    except: d=raw
    blobs=[]
    if isinstance(d,list):
        for p in d:
            if isinstance(p,dict) and p.get("type")=="text": blobs.append(p.get("text",""))
            elif isinstance(p,str): blobs.append(p)
    elif isinstance(d,dict): blobs.append(json.dumps(d))
    elif isinstance(d,str): blobs.append(d)
    recs=[]
    for b in blobs:
        try: o=json.loads(b)
        except: continue
        if isinstance(o,dict) and isinstance(o.get("content"),list): recs+=o["content"]
    return recs

def row(rec):
    prof=rec.get("profile",{}) or {}; comp=rec.get("company",{}) or {}
    summ=comp.get("summary",{}) or {}; link=rec.get("link",{}) or {}
    loc=(comp.get("location",{}) or {}).get("headquarter",{}) or {}
    rng=(summ.get("staff",{}) or {}).get("range",{}) or {}
    return {"id":rec.get("id",""),"full_name":prof.get("full_name",""),
            "title":prof.get("title") or prof.get("headline") or "",
            "company":summ.get("name",""),"primary_industry":(summ.get("industry") or "").lower(),
            "domain":(link.get("domain") or (comp.get("link",{}) or {}).get("domain") or ""),
            "linkedin":link.get("linkedin",""),"hq_country":(loc.get("country") or ""),
            "hq_state":(loc.get("state") or ""),"emp_start":rng.get("start"),"emp_end":rng.get("end")}

def emp_ok(s,e):
    s=s if isinstance(s,int) else 0; e=e if isinstance(e,int) else 10**9
    return s<=500 and e>=25

# new files only
snap=set(l.strip() for l in open(SNAP)) if os.path.exists(SNAP) else set()
allf=[os.path.basename(f) for f in glob.glob(TOOL_DIR+"/mcp-ai-ark-people_search-*.txt")]
newf=[TOOL_DIR+"/"+f for f in allf if f not in snap]

# batch-1 exclusions
b1_ids=set(); b1_co=set()
if os.path.exists(B1):
    for r in csv.DictReader(open(B1)):
        b1_ids.add(r.get("id",""))
        b1_co.add((r.get("company","") or "").strip().lower())

recs=[]
for fp in newf:
    rr=parse(fp)
    if rr: recs+=rr
byid={}
for r in recs:
    rr=row(r)
    if rr["id"]: byid[rr["id"]]=rr

keep=[]
for r in byid.values():
    if r["id"] in b1_ids: continue
    if not ind_ok(r["primary_industry"]): continue
    if not TITLE_RE.search(r["title"]): continue
    if r["hq_country"] and r["hq_country"]!="United States": continue
    if not emp_ok(r["emp_start"],r["emp_end"]): continue
    keep.append(r)

seen=set(); dedup=[]
for r in keep:
    k=(r["company"] or r["domain"]).strip().lower()
    if not k or k in seen or k in b1_co: continue
    seen.add(k); dedup.append(r)
    r["segment"]=segment(r["primary_industry"])

cols=["id","full_name","title","company","segment","primary_industry","domain","linkedin","hq_state","emp_start","emp_end"]
with open(OUT,"w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=cols,extrasaction="ignore"); w.writeheader()
    for r in dedup: w.writerow(r)

from collections import Counter
print(f"new_files={len(newf)}  raw={len(recs)}  unique_people={len(byid)}  passed={len(keep)}  after_company_dedupe(excl batch1)={len(dedup)}")
print("by segment:", dict(Counter(r["segment"] for r in dedup)))
print("WROTE", OUT)
