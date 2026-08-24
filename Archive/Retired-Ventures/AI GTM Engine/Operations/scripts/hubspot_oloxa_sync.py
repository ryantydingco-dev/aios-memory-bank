#!/usr/bin/env python3
"""HubSpot sync for Oloxa GTM Engine.

Creates Oloxa-specific HubSpot properties, upserts companies/contacts from a
GTM CSV, and creates daily follow-up tasks. Designed to be idempotent enough for
re-runs: contacts search by email first, then by oloxa_source_key; companies
search by domain.

Usage:
  set -a; source /Users/ryantydingco/Documents/AIOS/dealthread-agents/.env; set +a
  python3 hubspot_oloxa_sync.py --csv /path/to/Oloxa_Daily_Top_20_Initial.csv --dry-run
  python3 hubspot_oloxa_sync.py --csv /path/to/Oloxa_Daily_Top_20_Initial.csv --create-tasks
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.hubapi.com"
TOKEN = os.environ.get("HUBSPOT_TOKEN", "")
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

CONTACT_PROPS = [
    ("oloxa_assigned_to", "Oloxa Assigned To", "string", "text"),
    ("oloxa_market", "Oloxa Market", "string", "text"),
    ("oloxa_segment", "Oloxa Segment", "string", "text"),
    ("oloxa_primary_signal", "Oloxa Primary Signal", "string", "text"),
    ("oloxa_signal_evidence", "Oloxa Signal Evidence", "string", "textarea"),
    ("oloxa_fit_score", "Oloxa Fit Score", "number", "number"),
    ("oloxa_behavioral_score", "Oloxa Behavioral Score", "number", "number"),
    ("oloxa_total_score", "Oloxa Total Score", "number", "number"),
    ("oloxa_intent_confidence", "Oloxa Intent Confidence", "string", "text"),
    ("oloxa_recommended_channel", "Oloxa Recommended Channel", "string", "text"),
    ("oloxa_next_action_type", "Oloxa Next Action Type", "string", "text"),
    ("oloxa_outreach_status", "Oloxa Outreach Status", "string", "text"),
    ("oloxa_reply_category", "Oloxa Reply Category", "string", "text"),
    ("oloxa_objection_tag", "Oloxa Objection Tag", "string", "text"),
    ("oloxa_last_touch_date", "Oloxa Last Touch Date", "date", "date"),
    ("oloxa_next_follow_up_date", "Oloxa Next Follow-Up Date", "date", "date"),
    ("oloxa_source_file", "Oloxa Source File", "string", "text"),
    ("oloxa_source_key", "Oloxa Source Key", "string", "text"),
    ("oloxa_linkedin_url", "Oloxa LinkedIn URL", "string", "text"),
    ("oloxa_personalized_opener", "Oloxa Personalized Opener", "string", "textarea"),
    ("oloxa_reasoning", "Oloxa Reasoning", "string", "textarea"),
    ("oloxa_warmed_by_content", "Oloxa Warmed By Content", "string", "text"),
    ("oloxa_content_interaction_url", "Oloxa Content Interaction URL", "string", "text"),
]

COMPANY_PROPS = [
    ("oloxa_company_segment", "Oloxa Company Segment", "string", "text"),
    ("oloxa_market", "Oloxa Market", "string", "text"),
    ("oloxa_lender_product_complexity", "Oloxa Lender/Product Complexity", "string", "textarea"),
    ("oloxa_document_workflow_clue", "Oloxa Document Workflow Clue", "string", "textarea"),
    ("oloxa_current_priority", "Oloxa Current Priority", "string", "text"),
]


def api(method: str, path: str, body=None, retries=4):
    if not TOKEN:
        raise SystemExit("HUBSPOT_TOKEN is not set. Source your .env first.")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            return r.status, json.loads(raw or b"{}")
    except urllib.error.HTTPError as e:
        raw = e.read()
        if e.code == 429 and retries > 0:
            time.sleep(2)
            return api(method, path, body, retries - 1)
        try:
            return e.code, json.loads(raw or b"{}")
        except Exception:
            return e.code, {"raw": raw.decode("utf-8", "replace")[:500]}


def ensure_properties(dry_run=False):
    for obj, props in [("contacts", CONTACT_PROPS), ("companies", COMPANY_PROPS)]:
        for name, label, typ, field in props:
            body = {"name": name, "label": label, "type": typ, "fieldType": field, "groupName": "contactinformation" if obj == "contacts" else "companyinformation"}
            if dry_run:
                print(f"DRY property {obj}.{name}")
                continue
            code, resp = api("POST", f"/crm/v3/properties/{obj}", body)
            if code in (200, 201):
                print(f"+ property created: {obj}.{name}")
            elif code == 409:
                print(f"= property exists:  {obj}.{name}")
            else:
                print(f"! property {obj}.{name}: HTTP {code} {resp}")


def domain_from_url(url: str) -> str:
    url = (url or "").strip()
    if not url:
        return ""
    if not re.match(r"^https?://", url):
        url = "https://" + url
    host = urllib.parse.urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


def clean_int(v):
    if v is None or v == "":
        return ""
    try:
        return str(int(float(str(v).strip())))
    except Exception:
        return ""


def search_object(obj: str, prop: str, value: str):
    if not value:
        return None
    code, resp = api("POST", f"/crm/v3/objects/{obj}/search", {
        "filterGroups": [{"filters": [{"propertyName": prop, "operator": "EQ", "value": value}]}],
        "limit": 1,
    })
    if code == 200 and resp.get("results"):
        return resp["results"][0].get("id")
    return None


def upsert_company(row, dry_run=False):
    domain = domain_from_url(row.get("company_website", ""))
    name = row.get("company_name") or "Unknown"
    props = {"name": name}
    if domain:
        props["domain"] = domain
    if row.get("city"):
        props["city"] = row["city"]
    if row.get("state"):
        props["state"] = row["state"]
    if row.get("country"):
        props["country"] = row["country"]
    if clean_int(row.get("company_size")):
        props["numberofemployees"] = clean_int(row.get("company_size"))
    props.update({
        "oloxa_company_segment": row.get("segment") or row.get("market") or "",
        "oloxa_market": row.get("market") or row.get("country") or "",
        "oloxa_lender_product_complexity": row.get("firm_intent_signals", "")[:5000],
        "oloxa_document_workflow_clue": row.get("confirmed_pain_evidence", "")[:5000],
        "oloxa_current_priority": "Tier 1",
    })
    existing = search_object("companies", "domain", domain) if domain and not dry_run else None
    if dry_run:
        print(f"DRY company {name} domain={domain}")
        return "dry", "DRY_COMPANY"
    if existing:
        code, resp = api("PATCH", f"/crm/v3/objects/companies/{existing}", {"properties": props})
        return ("updated" if code in (200, 201) else f"error {code}"), existing if code in (200, 201) else resp
    code, resp = api("POST", "/crm/v3/objects/companies", {"properties": props})
    return ("created" if code in (200, 201) else f"error {code}"), resp.get("id") if code in (200, 201) else resp


def source_key(row):
    return (row.get("email") or row.get("linkedin_url") or f"{row.get('company_name','')}::{row.get('first_name','')}::{row.get('last_name','')}").lower().strip()


def upsert_contact(row, dry_run=False):
    key = source_key(row)
    props = {
        "firstname": row.get("first_name", ""),
        "lastname": row.get("last_name", ""),
        "jobtitle": row.get("title", ""),
        "oloxa_assigned_to": row.get("assigned_to", ""),
        "oloxa_market": row.get("market") or row.get("country") or "",
        "oloxa_segment": row.get("segment") or "",
        "oloxa_primary_signal": row.get("primary_signal_refined", ""),
        "oloxa_signal_evidence": (row.get("confirmed_pain_evidence") or row.get("firm_intent_signals") or "")[:5000],
        "oloxa_fit_score": clean_int(row.get("fit_score")),
        "oloxa_behavioral_score": clean_int(row.get("behavioral_score")),
        "oloxa_total_score": clean_int(row.get("total_score")),
        "oloxa_intent_confidence": row.get("intent_confidence", ""),
        "oloxa_recommended_channel": row.get("recommended_channel", ""),
        "oloxa_next_action_type": row.get("recommended_next_action", ""),
        "oloxa_outreach_status": "NOT_STARTED",
        "oloxa_source_file": row.get("source_file", "AIOS Oloxa daily batch"),
        "oloxa_source_key": key,
        "oloxa_linkedin_url": row.get("linkedin_url", ""),
        "oloxa_personalized_opener": row.get("personalized_opener", "")[:5000],
        "oloxa_reasoning": row.get("reasoning", "")[:5000],
    }
    if row.get("email"):
        props["email"] = row["email"]
    if dry_run:
        print(f"DRY contact {row.get('first_name')} {row.get('last_name')} email={row.get('email')} assigned={row.get('assigned_to')}")
        return "dry", "DRY_CONTACT"
    existing = search_object("contacts", "email", row.get("email")) if row.get("email") else None
    if not existing:
        existing = search_object("contacts", "oloxa_source_key", key)
    if existing:
        code, resp = api("PATCH", f"/crm/v3/objects/contacts/{existing}", {"properties": props})
        return ("updated" if code in (200, 201) else f"error {code}"), existing if code in (200, 201) else resp
    code, resp = api("POST", "/crm/v3/objects/contacts", {"properties": props})
    return ("created" if code in (200, 201) else f"error {code}"), resp.get("id") if code in (200, 201) else resp


def associate(contact_id, company_id, dry_run=False):
    if dry_run or not contact_id or not company_id or "DRY" in str(contact_id) or "DRY" in str(company_id):
        return
    api("PUT", f"/crm/v4/objects/contacts/{contact_id}/associations/default/companies/{company_id}")


def tomorrow_midday_ms():
    d = dt.datetime.now().date()
    # HubSpot task timestamps are ms; set task due today at local noon by default.
    noon = dt.datetime.combine(d, dt.time(12, 0))
    return int(noon.timestamp() * 1000)


def create_task(row, contact_id, dry_run=False):
    subject = f"[{row.get('assigned_to','')}] Oloxa: {row.get('recommended_next_action','Next action')} — {row.get('first_name','')} {row.get('last_name','')} @ {row.get('company_name','')}"
    body = "\n".join([
        f"Signal: {row.get('primary_signal_refined','')}",
        f"Confidence: {row.get('intent_confidence','')}",
        f"Channel: {row.get('recommended_channel','')}",
        f"LinkedIn: {row.get('linkedin_url','')}",
        f"Email: {row.get('email','')}",
        "",
        "Evidence:", (row.get('confirmed_pain_evidence') or row.get('firm_intent_signals') or '')[:1500],
        "",
        "Suggested opener:", row.get('personalized_opener','')[:1500],
    ])
    payload = {"properties": {
        "hs_task_subject": subject[:255],
        "hs_task_body": body,
        "hs_task_status": "NOT_STARTED",
        "hs_task_priority": "HIGH",
        "hs_timestamp": tomorrow_midday_ms(),
    }}
    if contact_id and "DRY" not in str(contact_id):
        payload["associations"] = [{
            "to": {"id": contact_id},
            "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 204}]
        }]
    if dry_run:
        print(f"DRY task {subject}")
        return "dry", "DRY_TASK"
    code, resp = api("POST", "/crm/v3/objects/tasks", payload)
    return ("created" if code in (200, 201) else f"error {code}"), resp.get("id") if code in (200, 201) else resp


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--create-tasks", action="store_true")
    ap.add_argument("--ensure-properties-only", action="store_true")
    args = ap.parse_args()
    ensure_properties(args.dry_run)
    if args.ensure_properties_only:
        return
    with open(args.csv, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    print(f"Syncing {len(rows)} rows from {args.csv}")
    counts = {"contacts_created":0,"contacts_updated":0,"companies_created":0,"companies_updated":0,"tasks_created":0,"errors":0}
    for row in rows:
        cstat, company_id = upsert_company(row, args.dry_run)
        kstat, contact_id = upsert_contact(row, args.dry_run)
        if cstat == "created": counts["companies_created"] += 1
        elif cstat == "updated": counts["companies_updated"] += 1
        elif str(cstat).startswith("error"):
            counts["errors"] += 1; print("COMPANY ERROR", row.get("company_name"), cstat, company_id)
        if kstat == "created": counts["contacts_created"] += 1
        elif kstat == "updated": counts["contacts_updated"] += 1
        elif str(kstat).startswith("error"):
            counts["errors"] += 1; print("CONTACT ERROR", row.get("email"), kstat, contact_id)
        associate(contact_id, company_id, args.dry_run)
        if args.create_tasks:
            tstat, task_id = create_task(row, contact_id, args.dry_run)
            if tstat == "created": counts["tasks_created"] += 1
            elif str(tstat).startswith("error"):
                counts["errors"] += 1; print("TASK ERROR", row.get("email"), tstat, task_id)
        time.sleep(0.08)
    print(json.dumps(counts, indent=2))

if __name__ == "__main__":
    main()
