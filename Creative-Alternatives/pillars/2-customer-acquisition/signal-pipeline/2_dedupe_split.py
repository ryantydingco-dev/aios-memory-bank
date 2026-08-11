"""Step 2: dedupe leads by domain (research each firm once) and split into tiny per-batch
input files the workflow agents read. Prints the DIR + COUNT to set in signals_workflow.js.
Usage:  python3 2_dedupe_split.py
"""
import json, os

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
leads = json.load(open(f"{DATA}/leads.json"))

uniq, dmap = {}, {}
for L in leads:
    key = L["domain"] if L["domain"] else "name:" + (L["company"] or "").lower().strip()
    dmap.setdefault(key, []).append(L["lead_id"])
    if key not in uniq:
        uniq[key] = {"company": L["company"], "domain": L["domain"]}

firms = list(uniq.values())
indir = f"{DATA}/in"; os.makedirs(indir, exist_ok=True)
for f in os.listdir(indir):
    if f.startswith("b_"):
        os.remove(os.path.join(indir, f))

BATCH = 10
n = 0
for i in range(0, len(firms), BATCH):
    json.dump(firms[i:i + BATCH], open(f"{indir}/b_{n:03d}.json", "w"))
    n += 1
json.dump(dmap, open(f"{DATA}/domain_map.json", "w"))

print(f"{len(leads)} leads -> {len(firms)} unique firms -> {n} batches of {BATCH}")
print("\n>>> set these two lines at the top of signals_workflow.js, then launch it:")
print(f"    const dir = '{indir}'")
print(f"    const count = {n}")
print("    Workflow({ scriptPath: '<abs path>/signals_workflow.js' })")
