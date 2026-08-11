#!/usr/bin/env python3
"""
Sync reply-watcher dispositions -> HubSpot warm pipeline.

This is the bridge that keeps HubSpot as the system of record without anyone
re-typing anything. reply-watcher stays the triage front-end (reads SmartLead,
classifies, drafts); this script pushes the outcome into HubSpot as a
contact + deal + follow-up task, on CA's cadence.

Run modes:
  # one lead, explicit (works today once HUBSPOT_TOKEN is armed):
  python scripts/sync_replies_to_hubspot.py upsert \
      --email x@firm.com --name "Jane Doe" --company "Firm" \
      --classification positive_interested --amount 2500 --next "Send lookbook"

  # batch from a manifest (data/outbound/warm_pipeline_seed.json):
  python scripts/sync_replies_to_hubspot.py sync-manifest

Cadence: a positive reply lands in "Replied — Awaiting Them" with a follow-up
task +3 business days out. Re-engagement advances the stage. HOT/quote signals
go to "Pricing — Ball with CA". Silence past +14 days -> a human decides
nurture vs drop (surfaced by the daily brief, never auto-sent).

NOTE: never sends email. Drafts + CRM state only — the house rule holds.
"""
import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hubspot_warm as hw  # noqa: E402

HERE = hw.HERE
MANIFEST = os.path.join(HERE, "data", "outbound", "warm_pipeline_seed.json")
OWNER_ID = "92776612"  # Ryan

# reply-watcher classification -> (native stage id, days until first follow-up task)
CLASSIFICATION_STAGE = {
    "positive_interested": ("appointmentscheduled", 3),
    "positive_soft": ("appointmentscheduled", 4),
    "positive_referral": ("qualifiedtobuy", 2),
    "neutral_question": ("presentationscheduled", 1),  # usually a pricing ask -> ball w/ CA
    "hot": ("presentationscheduled", 1),
    "negative_notnow": ("appointmentscheduled", 30),   # nurture: long recycle
}


def _due_ms(days):
    return int((datetime.now(timezone.utc) + timedelta(days=days)).replace(
        hour=13, minute=0, second=0, microsecond=0).timestamp() * 1000)


def upsert_lead(email, name, company, classification, amount, next_action):
    if not hw._token():
        print("HUBSPOT_TOKEN not armed — skipping (see plans/warm-pipeline-spec.md)")
        return
    stage, days = CLASSIFICATION_STAGE.get(classification,
                                           ("appointmentscheduled", 3))
    first, _, last = (name or "").partition(" ")
    cid = hw.upsert_contact(email, firstname=first, lastname=last, company=company)
    deal_name = f"{company or name} — {classification}"
    deal_id = hw.create_deal(
        deal_name, stage, amount or 0,
        description=f"Auto-synced from reply-watcher ({classification}). "
                    f"Next: {next_action}. Amount is an ESTIMATE.",
        contact_id=cid)
    hw.create_task(
        f"Follow up: {name or company} — {next_action}",
        _due_ms(days), deal_id,
        body=f"reply-watcher classification: {classification}.",
        priority="HIGH" if stage == hw.BALL_WITH_CA else "MEDIUM",
        owner_id=OWNER_ID)
    print(f"synced {email} -> deal {deal_id} ({hw.STAGE_LABEL.get(stage, stage)})")


def sync_manifest():
    if not os.path.exists(MANIFEST):
        print(f"no manifest at {MANIFEST}")
        return
    for row in json.load(open(MANIFEST)):
        upsert_lead(row["email"], row.get("name", ""), row.get("company", ""),
                    row.get("classification", "positive_interested"),
                    row.get("amount", 0), row.get("next", "Follow up"))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    u = sub.add_parser("upsert")
    u.add_argument("--email", required=True)
    u.add_argument("--name", default="")
    u.add_argument("--company", default="")
    u.add_argument("--classification", default="positive_interested")
    u.add_argument("--amount", type=float, default=0)
    u.add_argument("--next", dest="next_action", default="Follow up")
    sub.add_parser("sync-manifest")
    a = ap.parse_args()
    if a.cmd == "upsert":
        upsert_lead(a.email, a.name, a.company, a.classification, a.amount, a.next_action)
    else:
        sync_manifest()


if __name__ == "__main__":
    main()
