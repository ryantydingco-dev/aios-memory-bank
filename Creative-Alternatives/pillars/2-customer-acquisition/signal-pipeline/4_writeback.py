"""Step 5: write the {{signal}} lines back into the SmartLead campaign leads.
Tests one lead and reads it back, then bulk-upserts the rest (only non-empty signals;
fallback leads are left untouched). Upsert MERGES custom_fields, preserving the others.
Usage:  export SMARTLEAD_API_KEY=...  export CAMPAIGN_ID=3562940  python3 4_writeback.py
"""
import json, urllib.request, urllib.error, os, sys, time

KEY = os.environ.get("SMARTLEAD_API_KEY") or sys.exit("set SMARTLEAD_API_KEY")
CID = os.environ.get("CAMPAIGN_ID") or sys.exit("set CAMPAIGN_ID")
BASE = "https://server.smartlead.ai/api/v1"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

leads = json.load(open(f"{DATA}/leads.json"))
by_id = {L["lead_id"]: L for L in leads}
final = json.load(open(f"{DATA}/final_signals.json"))

items = []
for r in final:
    sig = (r.get("signal") or "").strip()
    L = by_id.get(r["lead_id"])
    if sig and L and L.get("email"):
        items.append({"email": L["email"], "first_name": L.get("first_name") or "",
                      "company_name": L.get("company") or "", "custom_fields": {"signal": sig}})

def post(body):
    req = urllib.request.Request(f"{BASE}/campaigns/{CID}/leads?api_key={KEY}", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "User-Agent": UA}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:200]}

if not items:
    sys.exit("no signals to write")

# test one, read back
st, resp = post({"lead_list": [items[0]]})
print("test POST:", st, resp.get("ok"), "| already_added:", resp.get("already_added_to_campaign"))
if not (st == 200 and resp.get("ok")):
    sys.exit("test write failed, aborting")
if input(f"write {len(items)} signals? [y/N] ").strip().lower() != "y":
    sys.exit("aborted")

ok = err = 0
for i in range(0, len(items), 100):
    st, resp = post({"lead_list": items[i:i + 100]})
    if st == 200 and resp.get("ok"):
        ok += resp.get("already_added_to_campaign", 0)
        print(f"  batch {i//100}: ok ({resp.get('already_added_to_campaign',0)})")
    else:
        err += 1; print(f"  batch {i//100}: ERROR {st} {resp}")
    time.sleep(1.5)
print(f"done: updated {ok} leads | errors {err}")
