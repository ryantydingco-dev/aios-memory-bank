#!/usr/bin/env python3
"""Join bulk-revealed emails (id,email,status) to the nationwide pool -> generic cold-email list.
No salutation column (these have no buy-signal) -> smartlead_load picks the GENERIC sequence.
Usage: python3 build_pool_email_list.py <emails.csv> <out.csv>
"""
import csv, sys
from collections import Counter
emails_csv, out_csv = sys.argv[1], sys.argv[2]
pool={r["id"]:r for r in csv.DictReader(open("swag_nationwide_pool.csv"))}
OK={"VALID"}; RISKY={"CATCH_ALL","RISKY","UNKNOWN","ACCEPT_ALL"}
stat=Counter(); rows=[]
for e in csv.DictReader(open(emails_csv)):
    st=(e.get("status") or "").upper(); stat[st or "NONE"]+=1
    addr=e.get("email")
    if not addr or st not in OK|RISKY: continue
    p=pool.get(e["id"])
    if not p: continue
    fn=(p["full_name"].split() or [""])[0]
    rows.append({"First Name":fn,"Full Name":p["full_name"],"Title":p["title"],"Company":p["company"],
                 "Email":addr,"Email Status":st,"Segment":p["segment"],"LinkedIn URL":p.get("linkedin","")})
with open(out_csv,"w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=["First Name","Full Name","Title","Company","Email","Email Status","Segment","LinkedIn URL"]); w.writeheader(); w.writerows(rows)
print("email status:",dict(stat))
print(f"pool cold-email rows (VALID+risky): {len(rows)} | VALID={sum(1 for r in rows if r['Email Status']=='VALID')}")
print("by segment:",dict(Counter(r["Segment"] for r in rows)))
