#!/usr/bin/env python3
"""Build the signal-based cold call target list from SmartLead engagement.

Pulls per-lead email stats from every ACTIVE campaign, aggregates engagement,
drops repliers/bounces/unsubs, and tiers the rest:

    tier1  clicked, or 3+ opens        -> reveal mobile, call first
    tier2  opened 1-2 times            -> call after tier1
    tier3  no opens yet                -> email keeps working them; no dial

Joins company/title back in from the outbound lead CSVs (match on email), and
flags leads whose mobile is already on file in the existing coldcall lists.

Output: outputs/coldcalls/<today>/call_targets_engaged.csv
Usage:  python3 scripts/ca_call_targets.py
"""

import csv
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://server.smartlead.ai/api/v1"


def api_key():
    if os.environ.get("SMARTLEAD_API_KEY"):
        return os.environ["SMARTLEAD_API_KEY"].strip()
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            m = re.match(r"\s*SMARTLEAD_API_KEY\s*=\s*[\"']?([^\"'\s]+)", line)
            if m:
                return m.group(1)
    sys.exit("SMARTLEAD_API_KEY not found (env or .env)")


def get(path, **params):
    params["api_key"] = KEY
    url = f"{API}{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ca-aios collector)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


KEY = api_key()


def active_campaigns():
    return [c for c in get("/campaigns") if c.get("status") == "ACTIVE"]


def campaign_stats(cid):
    """All per-send stat rows for a campaign, paginated."""
    rows, offset, limit = [], 0, 100
    while True:
        page = get(f"/campaigns/{cid}/statistics", offset=offset, limit=limit)
        data = page.get("data", [])
        rows.extend(data)
        total = int(page.get("total_stats") or 0)
        offset += limit
        if offset >= total or not data:
            return rows
        time.sleep(0.4)  # stay under 10 req/2s


def load_lead_context():
    """email -> {company, ...} from the outbound lead CSVs; email -> mobile from coldcall lists."""
    outdir = ROOT / "pillars/2-customer-acquisition/outbound"
    ctx, mobiles = {}, {}
    for f in sorted(outdir.glob("*.csv")):
        try:
            rows = list(csv.DictReader(open(f)))
        except Exception:
            continue
        if not rows:
            continue
        cols = {c.lower().strip(): c for c in rows[0].keys()}
        email_c = next((cols[k] for k in cols if "email" in k), None)
        mobile_c = next((cols[k] for k in cols if "mobile" in k or "phone" in k), None)
        comp_c = next((cols[k] for k in cols if "company" in k or "organization" in k), None)
        name_c = next((cols[k] for k in cols if "name" in k and "company" not in k), None)
        for r in rows:
            em = (r.get(email_c) or "").strip().lower() if email_c else ""
            if em and em not in ctx:
                ctx[em] = {
                    "company": (r.get(comp_c) or "").strip() if comp_c else "",
                    "source_file": f.name,
                }
            # mobile lists key on name+company (no email col) — index those too
            if mobile_c and (r.get(mobile_c) or "").strip():
                key = em or ((r.get(name_c) or "") + "|" + (r.get(comp_c) or "")).lower()
                mobiles[key] = r[mobile_c].strip()
    return ctx, mobiles


def main():
    ctx, mobiles = load_lead_context()
    leads = {}
    for c in active_campaigns():
        cid, cname = c["id"], c["name"]
        print(f"pulling {cname} ({cid}) ...", flush=True)
        for r in campaign_stats(cid):
            em = (r.get("lead_email") or "").strip().lower()
            if not em:
                continue
            L = leads.setdefault(em, {
                "name": r.get("lead_name") or "", "email": em, "campaign": cname,
                "opens": 0, "clicks": 0, "sends": 0,
                "replied": False, "bounced": False, "unsub": False,
            })
            L["sends"] += 1
            L["opens"] += r.get("open_count") or 0
            L["clicks"] += r.get("click_count") or 0
            L["replied"] |= bool(r.get("reply_time"))
            L["bounced"] |= bool(r.get("is_bounced"))
            L["unsub"] |= bool(r.get("is_unsubscribed"))

    out_rows = []
    for L in leads.values():
        if L["replied"] or L["bounced"] or L["unsub"]:
            continue
        if L["clicks"] > 0 or L["opens"] >= 3:
            tier = "tier1"
        elif L["opens"] >= 1:
            tier = "tier2"
        else:
            tier = "tier3"
        c = ctx.get(L["email"], {})
        name_key = (L["name"] + "|" + c.get("company", "")).lower()
        out_rows.append({
            "tier": tier, "name": L["name"], "email": L["email"],
            "company": c.get("company", "") or L["email"].split("@")[1],
            "campaign": L["campaign"], "sends": L["sends"],
            "opens": L["opens"], "clicks": L["clicks"],
            "mobile_on_file": mobiles.get(L["email"], "") or mobiles.get(name_key, ""),
            "source_file": c.get("source_file", ""),
        })
    order = {"tier1": 0, "tier2": 1, "tier3": 2}
    out_rows.sort(key=lambda r: (order[r["tier"]], -r["clicks"], -r["opens"]))

    out_dir = ROOT / "outputs" / "coldcalls" / date.today().isoformat()
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / "call_targets_engaged.csv"
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(out_rows[0].keys()))
        w.writeheader()
        w.writerows(out_rows)

    from collections import Counter
    tiers = Counter(r["tier"] for r in out_rows)
    have_mobile = sum(1 for r in out_rows if r["tier"] != "tier3" and r["mobile_on_file"])
    summary = {
        "leads_seen": len(leads), "callable_non_repliers": len(out_rows),
        **tiers,
        "tier1+2_with_mobile_on_file": have_mobile,
        "tier1+2_needing_mobile_reveal": tiers["tier1"] + tiers["tier2"] - have_mobile,
    }
    print(json.dumps(summary, indent=2))
    print(f"-> {out}")


if __name__ == "__main__":
    main()
