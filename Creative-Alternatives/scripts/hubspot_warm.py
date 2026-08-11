#!/usr/bin/env python3
"""
HubSpot warm-pipeline helpers for Creative Alternatives.

Two jobs:
  1. chase_lines()  -> the "Warm leads — chase today" block for the daily brief
                        (imported by ca_daily_brief.py).
  2. upsert helpers -> used by sync_replies_to_hubspot.py to push reply-watcher
                        dispositions into HubSpot (contact + deal + follow-up task).

All HubSpot access is via a PRIVATE APP TOKEN in .env as HUBSPOT_TOKEN.
The chat MCP connector is OAuth and cannot be used by cron — so the launchd
jobs need this token. If it's missing, everything degrades gracefully:
chase_lines() returns a one-line "provision token" note and the upserts no-op.

Provision once (see plans/warm-pipeline-spec.md):
  HubSpot → Settings → Integrations → Private Apps → Create
  Scopes: crm.objects.deals (r/w), crm.objects.contacts (r/w), crm.objects.tasks (r/w)
  Copy the token into .env:  HUBSPOT_TOKEN=pat-na1-....
"""
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://api.hubapi.com"
PIPELINE = "default"  # CA's warm pipeline lives on the default Sales Pipeline

# native HubSpot stage id -> CA stage label (see the rename recipe in the spec).
# If you rename the stages in HubSpot, these ids stay the same, so this still works.
STAGE_LABEL = {
    "appointmentscheduled": "Replied — Awaiting Them",
    "qualifiedtobuy": "Re-engaged",
    "presentationscheduled": "Pricing — Ball with CA",
    "decisionmakerboughtin": "Verbal Yes / Proofing",
    "contractsent": "Contract Sent",
    "closedwon": "Won — Invoiced",
    "closedlost": "Lost",
}
OPEN_STAGES = ["appointmentscheduled", "qualifiedtobuy",
               "presentationscheduled", "decisionmakerboughtin", "contractsent"]
BALL_WITH_CA = "presentationscheduled"  # "Pricing — Ball with CA": we owe them a quote


def env(k):
    v = os.getenv(k, "").strip()
    if v:
        return v
    envfile = os.path.join(HERE, ".env")
    if os.path.exists(envfile):
        for line in open(envfile):
            if line.startswith(f"{k}="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


def _token():
    return env("HUBSPOT_TOKEN") or env("HUBSPOT_PRIVATE_APP_TOKEN")


def _api(path, method="GET", body=None):
    tok = _token()
    if not tok:
        raise RuntimeError("no HUBSPOT_TOKEN")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, method=method,
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def _now_ms():
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def _end_of_today_ms():
    now = datetime.now(timezone.utc)
    return int(now.replace(hour=23, minute=59, second=59).timestamp() * 1000)


# ---------------------------------------------------------------- brief block
def chase_lines():
    """Return a list of markdown lines for the daily brief. Never raises."""
    if not _token():
        return ["⏳ Warm pipeline: set HUBSPOT_TOKEN in .env to arm the chase list "
                "(see plans/warm-pipeline-spec.md)."]
    try:
        deals = _search_open_deals()
        due = _search_due_tasks()
    except Exception as e:
        print(f"hubspot warm fetch failed: {e}", file=sys.stderr)
        return ["⚠️ Warm pipeline unreachable this morning"]

    lines = []
    total = sum(d["amount"] for d in deals)
    lines.append(f"⏳ Warm pipeline: {len(deals)} open deals, ${total:,.0f} est.")

    # chase today / overdue (task-driven)
    if due:
        lines.append(f"📞 Chase today ({len(due)}):")
        for t in due[:12]:
            tag = "⚠️overdue " if t["overdue"] else ""
            lines.append(f"   • {tag}{t['subject']}")

    # deals where the ball is with CA (Kenny owes a quote)
    ball = [d for d in deals if d["stage"] == BALL_WITH_CA]
    if ball:
        lines.append(f"💵 Kenny owes a quote ({len(ball)}): " +
                     ", ".join(d["name"].split(" — ")[0] for d in ball[:8]))
    return lines


def _search_open_deals():
    body = {
        "filterGroups": [{"filters": [
            {"propertyName": "pipeline", "operator": "EQ", "value": PIPELINE},
            {"propertyName": "dealstage", "operator": "IN", "values": OPEN_STAGES},
        ]}],
        "properties": ["dealname", "dealstage", "amount"],
        "limit": 100,
    }
    out = []
    for d in _api("/crm/v3/objects/deals/search", "POST", body).get("results", []):
        p = d.get("properties", {})
        out.append({
            "id": d["id"],
            "name": p.get("dealname", ""),
            "stage": p.get("dealstage", ""),
            "amount": float(p.get("amount") or 0),
        })
    return out


def _search_due_tasks():
    body = {
        "filterGroups": [{"filters": [
            {"propertyName": "hs_task_status", "operator": "EQ", "value": "NOT_STARTED"},
            {"propertyName": "hs_timestamp", "operator": "LTE", "value": str(_end_of_today_ms())},
        ]}],
        "properties": ["hs_task_subject", "hs_timestamp"],
        "sorts": [{"propertyName": "hs_timestamp", "direction": "ASCENDING"}],
        "limit": 50,
    }
    now = _now_ms()
    out = []
    for t in _api("/crm/v3/objects/tasks/search", "POST", body).get("results", []):
        p = t.get("properties", {})
        ts = int(p.get("hs_timestamp") or 0)
        out.append({"subject": p.get("hs_task_subject", ""), "overdue": ts < now})
    return out


# ---------------------------------------------------------------- upserts (sync)
def find_contact_id(email):
    body = {"filterGroups": [{"filters": [
        {"propertyName": "email", "operator": "EQ", "value": email}]}],
        "properties": ["email"], "limit": 1}
    res = _api("/crm/v3/objects/contacts/search", "POST", body).get("results", [])
    return res[0]["id"] if res else None


def upsert_contact(email, firstname="", lastname="", company="", jobtitle=""):
    props = {k: v for k, v in dict(
        email=email, firstname=firstname, lastname=lastname,
        company=company, jobtitle=jobtitle).items() if v}
    cid = find_contact_id(email)
    if cid:
        _api(f"/crm/v3/objects/contacts/{cid}", "PATCH", {"properties": props})
        return cid
    return _api("/crm/v3/objects/contacts", "POST", {"properties": props})["id"]


def create_deal(name, stage, amount, description="", contact_id=None, closedate=None):
    props = {"dealname": name, "pipeline": PIPELINE, "dealstage": stage,
             "amount": str(amount), "description": description}
    if closedate:
        props["closedate"] = closedate
    payload = {"properties": props}
    if contact_id:
        payload["associations"] = [{
            "to": {"id": contact_id},
            "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 3}],
        }]
    return _api("/crm/v3/objects/deals", "POST", payload)["id"]


def create_task(subject, due_ms, deal_id, body="", priority="MEDIUM", owner_id=None):
    props = {"hs_task_subject": subject, "hs_task_body": body,
             "hs_timestamp": str(due_ms), "hs_task_status": "NOT_STARTED",
             "hs_task_priority": priority}
    if owner_id:
        props["hubspot_owner_id"] = str(owner_id)
    payload = {"properties": props, "associations": [{
        "to": {"id": deal_id},
        "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 216}],
    }]}
    return _api("/crm/v3/objects/tasks", "POST", payload)["id"]


if __name__ == "__main__":
    for ln in chase_lines():
        print(ln)
