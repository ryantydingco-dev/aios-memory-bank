#!/usr/bin/env python3
"""Create/update the CA creative-agency partner pilot as a Smartlead DRAFT.

Never activates the campaign. Smartlead's verification must be launched from the
campaign UI; the public API currently does not expose that operation.
"""

import csv
import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://server.smartlead.ai/api/v1"
CAMPAIGN_NAME = "CA Partner Pilot — Creative Agencies — Tier 1 — V1 [DRAFT]"
SOURCE = ROOT / "outputs/partnerships/scale-3000-2026-07-17/partner-agencies/campaign-batch-001-100-review.csv"
UPLOAD = SOURCE.with_name("smartlead-upload-100.csv")
STATE = SOURCE.with_name("smartlead-draft-state.json")


def api(method, path, key, payload=None, params=None):
    query = {"api_key": key, **(params or {})}
    for attempt in range(5):
        r = requests.request(method, BASE + path, params=query, json=payload, timeout=60)
        if r.status_code == 429 or r.status_code >= 500:
            time.sleep(2 ** attempt); continue
        if not r.ok:
            raise RuntimeError(f"{method} {path} -> {r.status_code}: {r.text[:500]}")
        if not r.text.strip(): return {}
        return r.json()
    raise RuntimeError(f"Retries exhausted: {method} {path}")


def list_all_accounts(key):
    out=[]
    for offset in range(0,1000,100):
        data=api("GET","/email-accounts/",key,params={"offset":offset,"limit":100})
        batch=data if isinstance(data,list) else data.get("data") or data.get("email_accounts") or []
        if not batch: break
        out.extend(batch)
        if len(batch)<100: break
    return out


def choose_senders(accounts, count=6):
    candidates=[]
    for a in accounts:
        warm=a.get("warmup_details") or {}
        if not a.get("is_smtp_success") or not a.get("is_imap_success") or warm.get("is_warmup_blocked"): continue
        if "ryan" not in (a.get("from_name") or "").lower(): continue
        email=a.get("from_email") or a.get("email") or ""
        domain=email.rsplit("@",1)[-1].lower() if "@" in email else ""
        if not domain: continue
        candidates.append((a.get("daily_sent_count") or 0,domain,a))
    candidates.sort(key=lambda x:(x[0],x[1]))
    selected=[]; domains=set()
    for _,domain,a in candidates:
        if domain in domains: continue
        selected.append(a); domains.add(domain)
        if len(selected)==count: break
    if len(selected)<count: raise RuntimeError(f"Only {len(selected)} healthy Ryan sender domains available")
    return selected


def prepare_leads():
    rows=list(csv.DictReader(SOURCE.open()))
    if len(rows)!=100: raise RuntimeError(f"Expected 100 source rows, got {len(rows)}")
    out=[]
    for r in rows:
        out.append({
            "email":r["email"].strip().lower(),
            "first_name":r["first_name"].strip(),
            "last_name":r["last_name"].strip(),
            "company_name":r["company_name"].strip(),
            "company_domain":r["company_domain"].strip(),
            "title":r["canonical_title"].strip(),
            "linkedin_url":r["linkedin_url"].strip(),
            "situation_line":r["personalized_opener"].strip(),
            "partner_subsegment":r["partner_subsegment"].strip(),
            "partner_signal":r["primary_signal"].strip(),
        })
    fields=list(out[0])
    with UPLOAD.open("w",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(out)
    return out


def sequences():
    return {"sequences":[
        {"seq_number":1,"seq_delay_details":{"delay_in_days":0},"seq_variants":[{
            "variant_label":"A","subject":"when clients ask for merch",
            "email_body":"Hi {{first_name}},\n\n{{situation_line}}\n\nQuick reason for reaching out: agencies get asked for apparel, launch kits, event gear, and client gifts, but sourcing and production can turn into a second job.\n\nCreative Alternatives can work behind the scenes as the merchandise desk: curated options, quotes, proofs, production, and delivery. Your team keeps the client relationship.\n\nWould it be useful to compare notes on the kinds of requests you currently turn down or outsource?\n\nRyan\nCreative Alternatives"
        }]},
        {"seq_number":2,"seq_delay_details":{"delay_in_days":4},"seq_variants":[{
            "variant_label":"A","subject":"",
            "email_body":"Hi {{first_name}},\n\nThe model is intentionally simple: you send one real client brief, we return a short product direction and production path, and you decide whether Creative Alternatives is visible or stays behind your brand.\n\nNo expectation to move existing work. I would rather test one odd or annoying request and see whether we make your team look better.\n\nAnything like that crossing your desk this quarter?\n\nRyan"
        }]},
        {"seq_number":3,"seq_delay_details":{"delay_in_days":5},"seq_variants":[{
            "variant_label":"A","subject":"",
            "email_body":"Hi {{first_name}},\n\nFor clarity, the useful part is not another product catalog. We handle the work between the brief and delivery: narrowing the options, checking decoration details, coordinating proofs, and staying on top of production.\n\nIf a client asks for merchandise and your team wants to keep the relationship, we can stay in the background.\n\nWorth a short fit conversation, or should I close this out?\n\nRyan"
        }]},
        {"seq_number":4,"seq_delay_details":{"delay_in_days":6},"seq_variants":[{
            "variant_label":"A","subject":"",
            "email_body":"Hi {{first_name}},\n\nLast note from me. If a client ever asks for launch kits, event merchandise, apparel, gifts, or a company store and your team would rather not become the production department, send me the messy brief.\n\nIf that overlap is not part of {{company_name}}'s work, no problem and I will leave it here.\n\nRyan"
        }]},
    ]}


def main():
    load_dotenv(ROOT/".env")
    key=os.getenv("SMARTLEAD_API_KEY","").strip()
    if not key: raise SystemExit("SMARTLEAD_API_KEY missing")
    leads=prepare_leads()
    campaigns=api("GET","/campaigns/",key)
    items=campaigns if isinstance(campaigns,list) else campaigns.get("campaigns") or campaigns.get("data") or []
    existing=next((c for c in items if c.get("name")==CAMPAIGN_NAME and c.get("status")=="DRAFTED"),None)
    if existing:
        campaign_id=existing["id"]
        print(f"Using existing draft campaign #{campaign_id}")
    else:
        created=api("POST","/campaigns/create",key,{"name":CAMPAIGN_NAME})
        campaign_id=created.get("id") or created.get("campaign_id") or (created.get("campaign") or {}).get("id")
        if not campaign_id: raise RuntimeError(f"Campaign ID missing: {created}")
        print(f"Created draft campaign #{campaign_id}")

    api("POST",f"/campaigns/{campaign_id}/sequences",key,sequences())
    accounts=choose_senders(list_all_accounts(key),6)
    api("POST",f"/campaigns/{campaign_id}/email-accounts",key,{"email_account_ids":[a["id"] for a in accounts]})
    payload=[]
    for r in leads:
        payload.append({
            "email":r["email"],"first_name":r["first_name"],"last_name":r["last_name"],"company_name":r["company_name"],
            "custom_fields":{k:v for k,v in r.items() if k not in {"email","first_name","last_name","company_name"} and v},
        })
    uploaded=api("POST",f"/campaigns/{campaign_id}/leads",key,{"lead_list":payload,"settings":{
        "ignore_global_block_list":False,
        "ignore_unsubscribe_list":False,
        "ignore_duplicate_leads_in_other_campaign":False,
    }})
    api("POST",f"/campaigns/{campaign_id}/settings",key,{
        "track_settings":["DONT_TRACK_EMAIL_OPEN","DONT_TRACK_LINK_CLICK"],
        "stop_lead_settings":"REPLY_TO_AN_EMAIL",
        "send_as_plain_text":True,
        "enable_ai_esp_matching":True,
        "follow_up_percentage":100,
        "unsubscribe_text":"",
    })
    api("POST",f"/campaigns/{campaign_id}/schedule",key,{
        "timezone":"America/New_York","days_of_the_week":[1,2,3,4,5],
        "start_hour":"11:00","end_hour":"17:00","min_time_btw_emails":20,
        "max_new_leads_per_day":25,
    })
    state={
        "campaign_id":campaign_id,"campaign_name":CAMPAIGN_NAME,"status":"DRAFTED",
        "campaign_url":f"https://app.smartlead.ai/app/email-campaign/{campaign_id}",
        "source_csv":str(SOURCE.relative_to(ROOT)),"upload_csv":str(UPLOAD.relative_to(ROOT)),
        "requested_leads":len(leads),"upload_response":uploaded,
        "sender_account_count":len(accounts),"sender_domain_count":len({(a.get('from_email') or a.get('email')).rsplit('@',1)[-1] for a in accounts}),
        "verification":"PENDING_UI_LAUNCH","activated":False,
    }
    STATE.write_text(json.dumps(state,indent=2))
    print(json.dumps(state,indent=2))


if __name__=="__main__": main()
