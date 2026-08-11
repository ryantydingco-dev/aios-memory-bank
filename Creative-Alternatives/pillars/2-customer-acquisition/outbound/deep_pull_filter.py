#!/usr/bin/env python3
"""Deep-pull precision filter for ONE segment.
Usage: python3 deep_pull_filter.py <segment> <outcsv> <excludejson> <toolresults_dir>
  <toolresults_dir> = dir holding mcp-ai-ark-people_search-*.txt (cross-segment files are
  harmless: only this segment's industries are kept). Applies strict-title + primary-industry
  rules, US-only, size 25-500, dedup by company, excludes ids/companies already in <excludejson>."""
import json, re, csv, sys, glob

SEG_DEFS = {
 "law":         (["law practice","legal services","legal"], ["lawn"]),
 "accounting":  (["accounting","accountant","cpa"], []),
 "real_estate": (["real estate"], ["software","lawn"]),
 "financial":   (["financial services","finance","investment","wealth","banking","capital markets"], ["software"]),
 "agency":      (["advertising","marketing","public relations","design"], ["software","lawn"]),
 "insurance":   (["insurance"], ["software"]),
 "ae":          (["architecture","civil engineering","mechanical engineering","environmental engineering","industrial engineering","structural engineering"], ["software"]),
 "consulting":  (["consulting","management consulting","business consulting"], ["it services","information technology"]),
 "medical":     (["dental","veterinary","medical practices","medical","health care"], ["device","equipment","manufactur","software"]),
}
GLOBAL_BLOCK = ["staffing","recreational"]
TITLE_RE = re.compile(r"\boffice manager\b|\bmarketing manager\b|\boperations manager\b|"
                      r"\bdirector of people\b|\bhead of people\b|\bpeople operations\b|"
                      r"\bhr manager\b|\bhuman resources manager\b|\bexecutive assistant\b", re.I)

def parse(fp):
    try: d=json.loads(open(fp).read())
    except: return []
    obj=None
    if isinstance(d,list):
        for p in d:
            if isinstance(p,dict) and p.get("type")=="text":
                try: obj=json.loads(p["text"]); break
                except: pass
    elif isinstance(d,dict): obj=d
    return obj.get("content",[]) if isinstance(obj,dict) else []

def main():
    seg,outcsv,excl,tdir = sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]
    inc,blk = SEG_DEFS[seg]; blk = blk+GLOBAL_BLOCK
    ex=json.load(open(excl)); ex_ids=set(ex["ids"]); ex_co=set(ex["companies"])
    paths=glob.glob(tdir.rstrip('/')+"/mcp-ai-ark-people_search-*.txt")
    byid={}
    for fp in paths:
        for rec in parse(fp):
            if rec.get("id"): byid[rec["id"]]=rec
    seen=set(); rows=[]
    for rid,rec in byid.items():
        if rid in ex_ids: continue
        prof=rec.get("profile",{}) or {}; comp=rec.get("company",{}) or {}; summ=comp.get("summary",{}) or {}
        title=prof.get("title") or prof.get("headline") or ""
        if not TITLE_RE.search(title): continue
        ind=(summ.get("industry") or "").lower()
        if any(b in ind for b in blk): continue
        if not any(i in ind for i in inc): continue
        loc=(comp.get("location",{}) or {}).get("headquarter",{}) or {}
        country=loc.get("country") or ""
        if country and country!="United States": continue
        rng=(summ.get("staff",{}) or {}).get("range",{}) or {}
        s,e=rng.get("start"),rng.get("end"); s=s if isinstance(s,int) else 0; e=e if isinstance(e,int) else 10**9
        if not (s<=500 and e>=25): continue
        co=(summ.get("name") or "").strip(); link=rec.get("link",{}) or {}
        domain=link.get("domain") or (comp.get("link",{}) or {}).get("domain") or ""
        key=(co or domain).strip().lower()
        if not key or key in seen or key in ex_co: continue
        seen.add(key)
        rows.append({"id":rid,"full_name":prof.get("full_name",""),"title":title,"company":co,"segment":seg,
                     "primary_industry":ind,"domain":domain,"linkedin":link.get("linkedin",""),
                     "hq_state":(loc.get("state") or "")})
    with open(outcsv,"w",newline="") as f:
        w=csv.DictWriter(f,fieldnames=["id","full_name","title","company","segment","primary_industry","domain","linkedin","hq_state"])
        w.writeheader(); w.writerows(rows)
    print(f"{seg}: files={len(paths)} raw_unique={len(byid)} -> CLEAN={len(rows)} -> {outcsv}")

if __name__=="__main__": main()
