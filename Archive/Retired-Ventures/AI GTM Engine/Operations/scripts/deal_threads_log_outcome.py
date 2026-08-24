#!/usr/bin/env python3
"""Log Deal Threads outbound outcomes without hand-editing the tracker CSV."""

from __future__ import annotations

import argparse
import csv
import datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_TRACKER = ROOT / "Lead Engine" / "Outputs" / "DealThreads_Outcome_Tracker.csv"

FIELDS = [
    "date_created",
    "date_sent",
    "lead_id",
    "company",
    "buyer_name",
    "buyer_role",
    "website",
    "form_url",
    "segment",
    "channel",
    "opener_variant",
    "sent",
    "sent_count",
    "replied",
    "reply_sentiment",
    "objection_tag",
    "meeting_booked",
    "teardown_requested",
    "teardown_sent",
    "install_call_booked",
    "next_action",
    "notes",
]


def load_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists() or path.stat().st_size == 0:
        return []
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_rows(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in FIELDS})


def truthy(value: str) -> bool:
    return str(value).strip().lower() in {"true", "1", "yes", "y"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", required=True, help="lead_id, usually company::buyer")
    parser.add_argument("--tracker", default=str(DEFAULT_TRACKER))
    parser.add_argument("--channel", default="")
    parser.add_argument("--date", default=dt.date.today().isoformat())
    parser.add_argument("--sent", action="store_true")
    parser.add_argument("--replied", action="store_true")
    parser.add_argument("--sentiment", choices=["positive", "neutral", "negative"], default="")
    parser.add_argument("--objection", default="")
    parser.add_argument("--meeting", action="store_true")
    parser.add_argument("--teardown-requested", action="store_true")
    parser.add_argument("--teardown-sent", action="store_true")
    parser.add_argument("--install-call", action="store_true")
    parser.add_argument("--next", dest="next_action", default="")
    parser.add_argument("--note", default="")
    args = parser.parse_args()

    tracker = Path(args.tracker)
    rows = load_rows(tracker)
    lid = args.id.strip().lower()

    target = None
    for row in rows:
        if row.get("lead_id", "").strip().lower() == lid:
            target = row
            break
    if target is None:
        target = {field: "" for field in FIELDS}
        target["date_created"] = args.date
        target["lead_id"] = lid
        target["next_action"] = "QUEUED"
        rows.append(target)

    if args.channel:
        target["channel"] = args.channel
    if args.sent:
        target["sent"] = "true"
        target["date_sent"] = target.get("date_sent") or args.date
        target["sent_count"] = str(int(target.get("sent_count") or "0") + 1)
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
    if args.teardown_requested:
        target["teardown_requested"] = "true"
        target["next_action"] = "BUILD_TEARDOWN"
    if args.teardown_sent:
        target["teardown_sent"] = "true"
        target["next_action"] = "ASK_INSTALL_MAPPING"
    if args.install_call:
        target["install_call_booked"] = "true"
        target["next_action"] = "INSTALL_CALL_BOOKED"
    if args.next_action:
        target["next_action"] = args.next_action
    if args.note:
        prev = target.get("notes", "")
        target["notes"] = (prev + " | " if prev else "") + args.note

    write_rows(tracker, rows)

    flags = []
    for field in ["sent", "replied", "meeting_booked", "teardown_requested", "teardown_sent", "install_call_booked"]:
        if truthy(target.get(field, "")):
            flags.append(field)
    print(f"Logged {lid}: {', '.join(flags) or 'updated'}; next={target.get('next_action') or '-'}")


if __name__ == "__main__":
    main()
