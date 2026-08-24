#!/usr/bin/env python3
"""Log an outreach outcome to Oloxa_Outcome_Tracker.csv without hand-editing.

Finds the lead's queued row by --id (email or company::name); if none exists,
appends a new row. Updates only the flags you pass. Stamps date_sent on --sent.

This is the feedback path that turns the weekly learning loop from pipeline
analysis into REAL market learning. Pass --date so runs stay reproducible
(scripts here can't call the clock); omit only for a quick manual log.

Examples:
  python3 log_outcome.py --id rmeunier@bellevuecapitalgroup.com --sent --channel LinkedIn --date 2026-06-01
  python3 log_outcome.py --id rmeunier@bellevuecapitalgroup.com --replied --sentiment positive
  python3 log_outcome.py --id rmeunier@bellevuecapitalgroup.com --meeting --note "booked Tues 10am"
"""
import argparse
import csv
import os

FIELDS = ["date_sent", "lead_id", "name", "company", "market", "segment",
          "signal", "channel", "opener_variant", "sent", "replied",
          "reply_sentiment", "objection_tag", "meeting_booked",
          "next_action", "notes"]

DEFAULT_TRACKER = ("/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/"
                   "Lead Engine/Outputs/Oloxa_Outcome_Tracker.csv")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True, help="lead_id: email, or company::name")
    ap.add_argument("--tracker", default=DEFAULT_TRACKER)
    ap.add_argument("--channel", default=None)
    ap.add_argument("--date", default=None, help="date_sent (YYYY-MM-DD) when using --sent")
    ap.add_argument("--sent", action="store_true")
    ap.add_argument("--replied", action="store_true")
    ap.add_argument("--sentiment", choices=["positive", "neutral", "negative"])
    ap.add_argument("--objection", default=None, help="objection_tag")
    ap.add_argument("--meeting", action="store_true")
    ap.add_argument("--next", dest="next_action", default=None)
    ap.add_argument("--note", default=None)
    args = ap.parse_args()

    rows = []
    if os.path.exists(args.tracker) and os.path.getsize(args.tracker) > 0:
        with open(args.tracker, newline="", encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))

    lid = args.id.strip().lower()
    # Prefer a queued row on the same channel, else any row for this id.
    target = None
    for r in rows:
        if r.get("lead_id", "").strip().lower() == lid:
            if args.channel and r.get("channel") == args.channel:
                target = r
                break
            target = target or r
    if target is None:
        target = {k: "" for k in FIELDS}
        target["lead_id"] = lid
        target["next_action"] = "QUEUED"
        rows.append(target)

    if args.channel:
        target["channel"] = args.channel
    if args.sent:
        target["sent"] = "true"
        if args.date:
            target["date_sent"] = args.date
        if target.get("next_action") in ("", "QUEUED"):
            target["next_action"] = "AWAITING_REPLY"
    if args.replied:
        target["replied"] = "true"
        target["next_action"] = "REPLIED"
    if args.sentiment:
        target["reply_sentiment"] = args.sentiment
    if args.objection:
        target["objection_tag"] = args.objection
    if args.meeting:
        target["meeting_booked"] = "true"
        target["next_action"] = "MEETING_BOOKED"
    if args.next_action:
        target["next_action"] = args.next_action
    if args.note:
        prev = target.get("notes", "")
        target["notes"] = (prev + " | " if prev else "") + args.note

    with open(args.tracker, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in FIELDS})

    flags = [k for k in ("sent", "replied", "meeting_booked")
             if str(target.get(k, "")).lower() == "true"]
    print(f"Logged {lid}: {', '.join(flags) or 'updated'} "
          f"(channel={target.get('channel') or '-'}, next={target.get('next_action')})")


if __name__ == "__main__":
    main()
