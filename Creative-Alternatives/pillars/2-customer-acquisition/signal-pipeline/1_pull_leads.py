"""Step 1: pull all leads from a SmartLead campaign and derive each firm's domain.
Usage:  export SMARTLEAD_API_KEY=...  export CAMPAIGN_ID=3562940  python3 1_pull_leads.py
"""
import json, urllib.request, os, sys, time

KEY = os.environ.get("SMARTLEAD_API_KEY") or sys.exit("set SMARTLEAD_API_KEY")
CID = os.environ.get("CAMPAIGN_ID") or sys.exit("set CAMPAIGN_ID")
BASE = "https://server.smartlead.ai/api/v1"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
FREE = {"gmail.com", "yahoo.com", "aol.com", "hotmail.com", "outlook.com", "icloud.com", "comcast.net", "msn.com", "me.com"}
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"); os.makedirs(DATA, exist_ok=True)

def get(off, lim=100):
    req = urllib.request.Request(f"{BASE}/campaigns/{CID}/leads?api_key={KEY}&offset={off}&limit={lim}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

total = int(get(0, 1).get("total_leads", 0) or 0)
leads, off = [], 0
while off < total:
    rows = get(off, 100).get("data", [])
    if not rows:
        break
    for it in rows:
        L = it.get("lead", it)
        email = (L.get("email") or "").strip()
        dom = email.split("@")[1].lower() if "@" in email else ""
        leads.append({"lead_id": L.get("id"), "first_name": L.get("first_name"),
                      "company": L.get("company_name"), "email": email,
                      "domain": "" if dom in FREE else dom})
    off += 100
    time.sleep(0.6)

json.dump(leads, open(f"{DATA}/leads.json", "w"), indent=1)
wd = sum(1 for x in leads if x["domain"])
print(f"campaign {CID}: pulled {len(leads)} leads | with usable domain {wd} -> {DATA}/leads.json")
print("next: python3 2_dedupe_split.py")
