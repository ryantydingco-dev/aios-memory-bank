#!/usr/bin/env python3
"""Refresh the LinkedIn engine target queue from Smartlead engagement + enriched CSVs.

Priority: (1) campaign repliers, (2) multi-openers, (3) fresh enriched contacts w/
linkedin URLs. Appends new TARGETs to state.json; never touches existing states.
Run from this directory: python3 build_targets.py
"""
import json, csv, glob, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
STATE = os.path.join(HERE, "state.json")
CONFIG = os.path.join(HERE, "config.json")
CAMPAIGNS = [3777819, 3726017, 3719973]
ENRICHED_GLOB = os.path.join(REPO, "pillars", "2-customer-acquisition", "outbound",
                             "event-swag", "enriched_*.csv")

def api_key():
    env = os.path.join(REPO, ".env")
    for line in open(env):
        if line.startswith("SMARTLEAD_API_KEY="):
            return line.strip().split("=", 1)[1]
    sys.exit("SMARTLEAD_API_KEY not found")

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return json.load(urllib.request.urlopen(req))

def main():
    key = api_key()
    state = json.load(open(STATE)) if os.path.exists(STATE) else {"prospects": {}}
    prospects = state["prospects"]
    added = {"replier": 0, "opener": 0, "cold": 0}

    # 1+2: engagement from Smartlead lead statistics per campaign
    for cid in CAMPAIGNS:
        offset = 0
        while True:
            try:
                d = get(f"https://server.smartlead.ai/api/v1/campaigns/{cid}/"
                        f"leads?api_key={key}&offset={offset}&limit=100")
            except Exception as e:
                print(f"campaign {cid} fetch failed at {offset}: {e}"); break
            batch = d.get("data", [])
            if not batch:
                break
            for item in batch:
                l = item.get("lead", item)
                email = (l.get("email") or "").lower()
                if not email or email in prospects:
                    continue
                replied = bool(item.get("reply_count") or l.get("reply_count"))
                opens = int(item.get("open_count") or l.get("open_count") or 0)
                tier = "replier" if replied else ("opener" if opens >= 2 else None)
                if tier:
                    prospects[email] = {
                        "state": "TARGET", "tier": tier, "campaign": cid,
                        "first_name": l.get("first_name"), "last_name": l.get("last_name"),
                        "company": l.get("company_name"),
                        "linkedin": (l.get("linkedin_profile") or ""),
                        "show": (l.get("custom_fields") or {}).get("show_name", ""),
                        "history": []}
                    added[tier] += 1
            offset += 100
            if offset >= int(d.get("total_leads", 0)):
                break

    # 3: cold contacts from enriched CSVs that have a linkedin URL
    for path in sorted(glob.glob(ENRICHED_GLOB)):
        show = os.path.basename(path).replace("enriched_", "").replace(".csv", "").upper()
        for row in csv.DictReader(open(path)):
            li = (row.get("linkedin") or "").strip()
            k = li.lower() or None
            if not li or (k in prospects):
                continue
            full = (row.get("full_name") or "").split()
            prospects[k] = {
                "state": "TARGET", "tier": "cold",
                "first_name": full[0] if full else "", "last_name": " ".join(full[1:]),
                "company": row.get("company"), "linkedin": li, "show": show,
                "history": []}
            added["cold"] += 1

    state["prospects"] = prospects
    json.dump(state, open(STATE, "w"), indent=1)
    counts = {}
    for p in prospects.values():
        counts[p["state"]] = counts.get(p["state"], 0) + 1
    print(f"added: {added} | states: {counts} | total: {len(prospects)}")

if __name__ == "__main__":
    main()
