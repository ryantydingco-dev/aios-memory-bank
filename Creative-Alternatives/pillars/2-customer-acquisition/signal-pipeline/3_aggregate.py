"""Step 4: parse the workflow output, join signals back to leads by DOMAIN, clean
em-dashes/semicolons/entities, write data/final_signals.json, and print stats.
Usage:  python3 3_aggregate.py <path-to-workflow-output-file>
(The workflow's task output file is a wrapper object; the result is under ["result"].)
"""
import json, html, re, os, sys

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
OUTPUT = sys.argv[1] if len(sys.argv) > 1 else sys.exit("pass the workflow output file path")

def clean(s):
    s = re.sub(r'\s*[—–]\s*', ', ', s)  # em/en dash -> comma
    s = re.sub(r'\s*;\s*', ', ', s)               # semicolon -> comma
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s+,', ',', s)
    s = re.sub(r',\s*,', ',', s)
    return s

raw = json.load(open(OUTPUT, errors="replace"))
raw = raw.get("result", raw)                       # unwrap the task wrapper
results = raw.get("results", [])
dmap = json.load(open(f"{DATA}/domain_map.json"))
leads = json.load(open(f"{DATA}/leads.json"))

def keyfor(company, domain):
    d = (domain or "").strip().lower()
    return d if d else "name:" + (company or "").lower().strip()

sigmap, flags, researched = {}, [], set()
for r in results:
    comp = html.unescape(r.get("company", "") or "")
    dom = (r.get("domain", "") or "").strip().lower()
    trg = html.unescape(r.get("trigger", "") or "")
    key = keyfor(comp, dom)
    researched.add(key)
    if "collision" in trg.lower():
        flags.append(comp)
    if r.get("has_trigger") and (r.get("signal") or "").strip():
        sigmap[key] = clean(r["signal"])

final, with_sig = [], 0
for L in leads:
    sig = sigmap.get(keyfor(L["company"], L["domain"]), "")
    if sig:
        with_sig += 1
    final.append({"lead_id": L["lead_id"], "company": L["company"], "domain": L["domain"], "signal": sig})

json.dump(final, open(f"{DATA}/final_signals.json", "w"), indent=1)
missing = [k for k in dmap if k not in researched]
print(f"unique firms {len(dmap)} | researched {len(researched)} | missing {len(missing)} | firms-with-signal {len(sigmap)}")
print(f"leads {len(leads)} | with signal {with_sig} | fallback {len(leads)-with_sig}")
print(f"name-collision abstains {len(flags)} -> {DATA}/final_signals.json")
print("next: python3 4_writeback.py")
