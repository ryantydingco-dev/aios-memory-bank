"""
CA SmartLead Auto-Segmentation — the hot list routes itself.

Given /ca-signals ranked.json (firms + band + top_signal) and the lead list, this maps every lead to a
SmartLead campaign by its firm's buy-now band, writes the signal into the lead's custom fields (so the
opener uses it), and — with --apply — adds/promotes leads into the right campaign automatically. Hot
bands (priority/act-48h) go to the "hot" campaign; the rest sit in "base" until a signal fires.

No CRM: the source of truth is a SPREADSHEET (CSV) this script maintains — open it in Sheets/Numbers/Excel.
(Airtable is a drop-in later: set AIRTABLE_PAT + AIRTABLE_BASE_ID in .env.)

SAFETY:
  - DRY-RUN by default — prints the routing plan + writes the CSV, changes NOTHING in SmartLead.
  - --apply required to write to SmartLead. It only does LEAD-level ops (add lead, pause lead for a
    promotion move). It NEVER starts/stops/pauses a CAMPAIGN.
  - Routing a lead into an ACTIVE campaign means it WILL be emailed on schedule. Keep the hot campaign
    paused in SmartLead if you want to review first.

Usage:
    python scripts/ca_smartlead_segment.py --ranked outputs/ca-outbound/<run>/ranked.json \
        --leads outputs/ca-outbound/<run>/leads.json --segment law            # dry-run + CSV
    python scripts/ca_smartlead_segment.py --ranked ... --leads ... --segment law --apply   # execute
"""

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

try:
    import requests
    import yaml
except ImportError:
    raise ImportError("Missing deps — run: .venv/bin/pip install requests python-dotenv pyyaml")

API = "https://server.smartlead.ai/api/v1"
TRACKER = ROOT / "outputs" / "ca-outbound" / "signal-tracker.csv"   # the spreadsheet
STATE = ROOT / "data" / "ca_segment_state.json"                     # prior band per email (for promotions)
TRACKER_COLS = ["firm", "first_name", "last_name", "email", "band", "buy_now_score", "top_signal",
                "signal_detail", "signal_date", "target_campaign_id", "target_campaign", "action", "applied", "updated"]


def _norm_firm(n):
    import re
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", (n or "").lower())).strip()

def _read_json(p):
    return json.loads(Path(p).read_text())

def _api_key():
    k = os.getenv("SMARTLEAD_API_KEY", "").strip()
    if not k:
        print("missing SMARTLEAD_API_KEY", file=sys.stderr); sys.exit(1)
    return k


# ---------- SmartLead REST (lead-level only; never touches campaign status) ----------

def _campaign_name(cid, key, cache):
    if cid in cache:
        return cache[cid]
    try:
        r = requests.get(f"{API}/campaigns/{cid}?api_key={key}", timeout=20)
        cache[cid] = r.json().get("name", str(cid)) if r.ok else str(cid)
    except requests.RequestException:
        cache[cid] = str(cid)
    return cache[cid]

def _add_leads(cid, leads, key):
    """POST up to 100 leads with custom_fields to a campaign. Returns (ok, msg)."""
    body = {"lead_list": leads, "settings": {"ignore_global_block_list": False,
            "ignore_unsubscribe_list": False, "ignore_duplicate_leads_in_other_campaign": False}}
    try:
        r = requests.post(f"{API}/campaigns/{cid}/leads?api_key={key}", json=body, timeout=60)
        return (r.ok, r.text[:200])
    except requests.RequestException as e:
        return (False, str(e))

def _find_lead_id(email, key):
    try:
        r = requests.get(f"{API}/leads/?api_key={key}&email={email}", timeout=20)
        if r.ok:
            d = r.json()
            return d.get("id") or (d[0].get("id") if isinstance(d, list) and d else None)
    except requests.RequestException:
        pass
    return None

def _pause_lead(cid, lead_id, key):
    """Pause a lead in a campaign (reversible) — used to move a promoted lead out of 'base'."""
    try:
        r = requests.post(f"{API}/campaigns/{cid}/leads/{lead_id}/pause?api_key={key}", timeout=20)
        return r.ok
    except requests.RequestException:
        return False


# ---------- planning ----------

def _signal_opener(sig_type, detail):
    """A short situation_line seed from the signal, for the personalization sub-agent / merge field."""
    d = (detail or "").strip()
    seeds = {
        "active-hiring": f"Saw you're hiring in New York — {d[:80]}. New hires usually mean a welcome-kit scramble.",
        "merger": f"Saw the news about the merger — {d[:80]}. A combination usually means reordering everything with a logo on it.",
        "new-leader": f"Congrats on the new leadership move — {d[:80]}. New marketing leaders usually re-look at their swag vendor early.",
        "award": f"Congrats on the recognition — {d[:80]}. Firms usually mark a ranking with something branded.",
        "new-office": f"Saw you're opening/expanding an office — {d[:80]}. New space usually needs branded everything.",
        "event-sponsor": f"Saw you're sponsoring/exhibiting — {d[:80]}. Booths need branded giveaways on a deadline.",
        "funding": f"Saw the funding news — {d[:80]}. New capital usually means launch events and branded materials.",
    }
    return seeds.get(sig_type, "")


def main():
    ap = argparse.ArgumentParser(description="Route a lead list into SmartLead campaigns by buy-now band. Dry-run unless --apply.")
    ap.add_argument("--ranked", required=True, help="ranked.json from /ca-signals")
    ap.add_argument("--leads", required=True, help="leads.json (people with firm+email)")
    ap.add_argument("--segment", default="law", choices=["law", "financial"])
    ap.add_argument("--apply", action="store_true", help="ACTUALLY write to SmartLead (default: dry-run)")
    ap.add_argument("--limit", type=int, default=0, help="cap leads processed (0 = all)")
    args = ap.parse_args()

    cfg = yaml.safe_load((ROOT / "config" / "ca_outbound.yaml").read_text())
    seg = cfg["segmentation"]
    hot_bands = set(seg.get("hot_bands", ["act-48h", "priority"]))
    seg_cfg = seg[args.segment]
    hot_id, base_id = seg_cfg["hot_campaign_id"], seg_cfg["base_campaign_id"]

    ranked = {_norm_firm(r["firm"]): r for r in _read_json(args.ranked)}
    leads = _read_json(args.leads)
    if args.limit:
        leads = leads[: args.limit]
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    key = _api_key()
    name_cache = {}

    rows, to_add_hot, to_add_base, to_promote = [], [], [], []
    for p in leads:
        email = (p.get("email") or "").lower()
        if not email:
            continue
        firm = ranked.get(_norm_firm(p.get("company_name", "")), {})
        band = firm.get("band", "nurture")
        score = firm.get("buy_now_score", 0)
        top_sig = firm.get("top_signal", "")
        detail = firm.get("top_signal_detail", "")
        sig_date = firm.get("top_signal_date", "")
        is_hot = band in hot_bands
        target_id = hot_id if is_hot else base_id
        target_nm = _campaign_name(target_id, key, name_cache)

        prior_band = state.get(email, {}).get("band")
        prior_hot = prior_band in hot_bands if prior_band else None
        if prior_band is None:
            action = "add"
        elif is_hot and prior_hot is False:
            action = "promote"    # base -> hot (a signal fired since last run)
        elif not is_hot and prior_hot is True:
            action = "demote"     # hot -> base (signal decayed) — informational; we don't yank live sends
        else:
            action = "keep"

        lead_obj = {"email": email, "first_name": p.get("first_name", ""), "last_name": p.get("last_name", ""),
                    "company_name": p.get("company_name", ""),
                    "custom_fields": {"buy_now_score": str(score), "buy_signal": top_sig, "band": band,
                                      "signal_opener": _signal_opener(top_sig, detail)}}
        if action in ("add", "promote"):
            (to_add_hot if is_hot else to_add_base).append((lead_obj, p))
            if action == "promote":
                to_promote.append((email, p))

        rows.append({"firm": p.get("company_name", ""), "first_name": p.get("first_name", ""),
                     "last_name": p.get("last_name", ""), "email": email, "band": band,
                     "buy_now_score": score, "top_signal": top_sig, "signal_detail": (detail or "")[:120],
                     "signal_date": sig_date, "target_campaign_id": target_id, "target_campaign": target_nm,
                     "action": action, "applied": "no", "updated": time.strftime("%Y-%m-%d %H:%M")})

    # summary
    from collections import Counter
    bands = Counter(r["band"] for r in rows)
    acts = Counter(r["action"] for r in rows)
    print(f"segment={args.segment}  hot→{_campaign_name(hot_id,key,name_cache)}({hot_id})  base→{_campaign_name(base_id,key,name_cache)}({base_id})")
    print(f"  {len(rows)} leads | bands: " + ", ".join(f"{k}={v}" for k, v in bands.items()))
    print(f"  actions: " + ", ".join(f"{k}={v}" for k, v in acts.items()))
    print(f"  → hot adds: {len(to_add_hot)}, base adds: {len(to_add_base)}, promotions(base→hot): {len(to_promote)}")

    if args.apply:
        print("APPLYING to SmartLead (lead-level only; campaign status untouched)…")
        # promotions: pause in base first (reversible), then they get added to hot below
        for email, _ in to_promote:
            lid = _find_lead_id(email, key)
            if lid:
                _pause_lead(base_id, lid, key)
        for batch_leads, cid, label in ((to_add_hot, hot_id, "hot"), (to_add_base, base_id, "base")):
            objs = [o for o, _ in batch_leads]
            for i in range(0, len(objs), 100):
                ok, msg = _add_leads(cid, objs[i:i+100], key)
                print(f"  {label} batch {i//100+1}: {'ok' if ok else 'FAIL '+msg}")
                time.sleep(0.5)
        for r in rows:
            if r["action"] in ("add", "promote"):
                r["applied"] = "yes"
        # persist band state for next run's promotion detection
        for r in rows:
            state[r["email"]] = {"band": r["band"], "ts": r["updated"]}
        STATE.parent.mkdir(parents=True, exist_ok=True)
        STATE.write_text(json.dumps(state, indent=2))
    else:
        print("DRY-RUN — nothing sent to SmartLead. Re-run with --apply to route for real.")

    # always write the spreadsheet
    TRACKER.parent.mkdir(parents=True, exist_ok=True)
    with open(TRACKER, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=TRACKER_COLS)
        w.writeheader()
        w.writerows(rows)
    print(f"📊 spreadsheet → {TRACKER}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
