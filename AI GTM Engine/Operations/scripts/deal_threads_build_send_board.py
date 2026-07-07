#!/usr/bin/env python3
"""Build a daily Deal Threads outbound send board from a target CSV.

This is intentionally deterministic and human-in-the-loop. It does not send.
It ranks targets, writes copy-paste LinkedIn/email touches, creates a daily
queue CSV, and pre-seeds the outcome tracker so logging is one command.

Usage:
  python3 Operations/scripts/deal_threads_build_send_board.py \
    --targets "Lead Engine/DealThreads_Targets_Template.csv" \
    --limit 10
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_TARGETS = ROOT / "Lead Engine" / "DealThreads_Targets_Template.csv"
DEFAULT_OUTPUTS = ROOT / "Lead Engine" / "Outputs"
DEFAULT_TRACKER = DEFAULT_OUTPUTS / "DealThreads_Outcome_Tracker.csv"

TRACKER_FIELDS = [
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

QUEUE_FIELDS = [
    "rank",
    "lead_id",
    "company",
    "buyer_name",
    "buyer_role",
    "website",
    "form_url",
    "segment",
    "fit_score",
    "score",
    "channel",
    "linkedin_connect_note",
    "linkedin_dm",
    "email_subject",
    "email_body",
    "follow_up_1",
    "follow_up_2",
    "follow_up_3",
    "call_opener",
    "reason",
]

STATUS_SKIP = {
    "sent",
    "replied",
    "teardown requested",
    "teardown sent",
    "call booked",
    "closed",
    "passed",
    "lost",
    "won",
}


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def norm_key(key: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", key.lower()).strip("_")


def load_targets(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = []
        for row in csv.DictReader(f):
            rows.append({norm_key(k): clean(v) for k, v in row.items()})
        return rows


def intish(value: str, default: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def lead_id(row: dict[str, str]) -> str:
    company = clean(row.get("company")).lower()
    buyer = clean(row.get("buyer_name") or "buyer").lower()
    return f"{company}::{buyer}"


def first_name(row: dict[str, str]) -> str:
    name = clean(row.get("buyer_name"))
    return name.split()[0] if name else "there"


def has_named_buyer(row: dict[str, str]) -> bool:
    return bool(clean(row.get("buyer_name")))


def possessive(name: str) -> str:
    value = clean(name) or "your company"
    return f"{value}'" if value.endswith("s") else f"{value}'s"


def has_high_deal_value(value: str) -> bool:
    v = value.lower()
    return "high" in v or "25" in v or "50" in v or "8k" in v or "$" in v or "usd" in v


def score_target(row: dict[str, str]) -> tuple[int, list[str]]:
    reasons: list[str] = []
    score = intish(row.get("fit_score")) * 20
    if score:
        reasons.append(f"fit {row.get('fit_score')}/5")
    if row.get("form_url"):
        score += 15
        reasons.append("visible form")
    if row.get("weak_form_observation"):
        score += 15
        reasons.append("specific weak-form observation")
    if row.get("sales_research_hypothesis"):
        score += 10
        reasons.append("manual research gap identified")
    if row.get("reason_now"):
        score += 10
        reasons.append("reason now")
    if "teardown first" in row.get("teardown_priority", "").lower():
        score += 20
        reasons.append("teardown first")
    if has_high_deal_value(row.get("deal_value_guess", "")):
        score += 10
        reasons.append("high-value sale")
    if "hubspot" in row.get("crm_guess", "").lower():
        score += 5
        reasons.append("likely HubSpot")
    if row.get("linkedin_url"):
        score += 5
        reasons.append("reachable on LinkedIn")
    return score, reasons


def form_observation(row: dict[str, str]) -> str:
    obs = row.get("weak_form_observation", "")
    if obs:
        return obs
    return "the form captures basic contact details, but not the project context sales needs next"


def missing_context(row: dict[str, str]) -> str:
    hyp = row.get("sales_research_hypothesis", "")
    if hyp:
        hyp = re.sub(
            r"^(sales|the rep|reps?)\s+(probably\s+)?(research(es|ing)?|asks?|looks up|checks|needs to know)\s+",
            "",
            hyp,
            flags=re.I,
        )
        hyp = re.sub(r"\s+before\s+replying\.?$", "", hyp, flags=re.I)
        hyp = re.sub(r"\s+before\s+the\s+first\s+reply\.?$", "", hyp, flags=re.I)
        return hyp.rstrip(".")
    return "company fit, project scope, urgency, buying context, technical constraints, and what to say first"


def channel(row: dict[str, str]) -> str:
    if row.get("linkedin_url") or row.get("buyer_name"):
        return "LinkedIn"
    return "Email"


def connect_note(row: dict[str, str]) -> str:
    first = first_name(row)
    company = row.get("company", "your company")
    company_possessive = possessive(company)
    if has_named_buyer(row):
        note = (
            f"{first} - looked at {company_possessive} quote/contact intake while researching high-ticket project handoffs. "
            "It captures the lead, but sales may still need to build the project profile manually. Worth connecting."
        )
    else:
        note = (
            f"Looked at {company_possessive} quote/contact intake while researching high-ticket project handoffs. "
            "It captures the lead, but sales may still need to build the project profile manually. Worth connecting."
        )
    return note[:280]


def linkedin_dm(row: dict[str, str]) -> str:
    first = first_name(row)
    company = row.get("company", "your company")
    company_possessive = possessive(company)
    greeting = f"Appreciate the connect, {first}." if has_named_buyer(row) else "Appreciate the connect."
    return (
        f"{greeting}\n\n"
        f"I looked at {company_possessive} quote/contact intake. One thing stood out: {form_observation(row)}\n\n"
        f"That probably still leaves sales figuring out {missing_context(row)} before the first reply.\n\n"
        "Want me to send a quick intake teardown?"
    )


def email_subject(row: dict[str, str]) -> str:
    company = row.get("company", "your form")
    return f"{company} form teardown"


def email_body(row: dict[str, str]) -> str:
    first = first_name(row)
    company = row.get("company", "your company")
    form_url = row.get("form_url", "your quote/contact form")
    greeting = f"Hey {first}," if has_named_buyer(row) else "Hi,"
    return (
        f"{greeting}\n\n"
        f"I looked at {company}'s form here: {form_url}\n\n"
        f"One thing stood out: {form_observation(row)}\n\n"
        f"That probably still leaves sales figuring out {missing_context(row)} before the first reply.\n\n"
        "That is the gap Deal Threads is built around: turning a form fill into a project-ready buyer profile before callback.\n\n"
        "Want me to send over the quick intake teardown?\n\n"
        "Ryan"
    )


def follow_up_1(row: dict[str, str]) -> str:
    return (
        "One specific thing I noticed:\n\n"
        f"{form_observation(row)}\n\n"
        "That is usually the gap between \"we got a lead\" and \"sales or engineering knows what is worth a callback.\"\n\n"
        "Still worth sending the teardown?"
    )


def follow_up_2(row: dict[str, str]) -> str:
    return (
        "The project profile I would want sales to see after this form:\n\n"
        "- process or problem\n"
        "- timeline\n"
        "- equipment or site context\n"
        "- technical constraints\n"
        "- unknowns to confirm\n"
        "- recommended opener\n\n"
        "That is the before/after I can map in the intake teardown. Want me to send it?"
    )


def follow_up_3(row: dict[str, str]) -> str:
    return "Should I close the loop here, or would it still be useful if I sent the form teardown later?"


def call_opener(row: dict[str, str]) -> str:
    company = row.get("company", "your site")
    company_possessive = possessive(company)
    return (
        f"Hey, this is Ryan. I was looking at {company_possessive} quote/contact intake and had one specific thought: "
        "it captures the lead, but it may still leave sales doing the project-profile research manually. "
        "I was calling to see if it would be useful if I sent the quick intake teardown."
    )


def queue_row(rank: int, row: dict[str, str], score: int, reasons: list[str]) -> dict[str, str]:
    return {
        "rank": str(rank),
        "lead_id": lead_id(row),
        "company": row.get("company", ""),
        "buyer_name": row.get("buyer_name", ""),
        "buyer_role": row.get("buyer_role", ""),
        "website": row.get("website", ""),
        "form_url": row.get("form_url", ""),
        "segment": row.get("segment", ""),
        "fit_score": row.get("fit_score", ""),
        "score": str(score),
        "channel": channel(row),
        "linkedin_connect_note": connect_note(row),
        "linkedin_dm": linkedin_dm(row),
        "email_subject": email_subject(row),
        "email_body": email_body(row),
        "follow_up_1": follow_up_1(row),
        "follow_up_2": follow_up_2(row),
        "follow_up_3": follow_up_3(row),
        "call_opener": call_opener(row),
        "reason": "; ".join(reasons),
    }


def seed_tracker(path: Path, queue: list[dict[str, str]], date: str) -> int:
    existing: dict[str, dict[str, str]] = {}
    if path.exists() and path.stat().st_size > 0:
        with path.open(newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                existing[row.get("lead_id", "")] = row

    seeded = 0
    for row in queue:
        if row["lead_id"] in existing:
            continue
        existing[row["lead_id"]] = {
            "date_created": date,
            "date_sent": "",
            "lead_id": row["lead_id"],
            "company": row["company"],
            "buyer_name": row["buyer_name"],
            "buyer_role": row["buyer_role"],
            "website": row["website"],
            "form_url": row["form_url"],
            "segment": row["segment"],
            "channel": row["channel"],
            "opener_variant": "dead_form_teardown",
            "sent": "",
            "sent_count": "0",
            "replied": "",
            "reply_sentiment": "",
            "objection_tag": "",
            "meeting_booked": "",
            "teardown_requested": "",
            "teardown_sent": "",
            "install_call_booked": "",
            "next_action": "QUEUED",
            "notes": "seeded by deal_threads_build_send_board.py",
        }
        seeded += 1

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=TRACKER_FIELDS)
        writer.writeheader()
        for row in existing.values():
            writer.writerow({field: row.get(field, "") for field in TRACKER_FIELDS})
    return seeded


def markdown_block(row: dict[str, str], date: str, tracker: Path) -> str:
    log = (
        f"python3 'Operations/scripts/deal_threads_log_outcome.py' "
        f"--tracker '{tracker}' --id '{row['lead_id']}' --sent --channel {row['channel']} --date {date}"
    )
    return f"""### {row['rank']}. {row['company']} - {row['buyer_name'] or row['buyer_role'] or 'buyer'}

**Why this target:** {row['reason']}  
**Form:** {row['form_url'] or row['website']}  
**Channel:** {row['channel']}  
**Score:** {row['score']}

**LinkedIn connect**
```text
{row['linkedin_connect_note']}
```

**LinkedIn DM**
```text
{row['linkedin_dm']}
```

**Email subject:** `{row['email_subject']}`

**Email body**
```text
{row['email_body']}
```

**Follow-up 1**
```text
{row['follow_up_1']}
```

**Follow-up 2**
```text
{row['follow_up_2']}
```

**Follow-up 3**
```text
{row['follow_up_3']}
```

**Call opener**
```text
{row['call_opener']}
```

**Log after sending**
```bash
{log}
```

---
"""


def write_queue_csv(path: Path, queue: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=QUEUE_FIELDS)
        writer.writeheader()
        for row in queue:
            writer.writerow({field: row.get(field, "") for field in QUEUE_FIELDS})


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--targets", default=str(DEFAULT_TARGETS))
    parser.add_argument("--outputs", default=str(DEFAULT_OUTPUTS))
    parser.add_argument("--tracker", default=str(DEFAULT_TRACKER))
    parser.add_argument("--date", default=dt.date.today().isoformat())
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--include-sent", action="store_true")
    args = parser.parse_args()

    targets_path = Path(args.targets)
    outputs = Path(args.outputs)
    tracker = Path(args.tracker)
    outputs.mkdir(parents=True, exist_ok=True)

    rows = load_targets(targets_path)
    candidates = []
    for row in rows:
        if not row.get("company"):
            continue
        status = row.get("outreach_status", "").lower()
        if not args.include_sent and status in STATUS_SKIP:
            continue
        if row.get("teardown_priority", "").lower() == "avoid":
            continue
        score, reasons = score_target(row)
        if score <= 0:
            continue
        candidates.append((score, reasons, row))

    candidates.sort(key=lambda item: item[0], reverse=True)
    selected = candidates[: args.limit]
    queue = [queue_row(i, row, score, reasons) for i, (score, reasons, row) in enumerate(selected, 1)]

    seeded = seed_tracker(tracker, queue, args.date)

    queue_path = outputs / f"DealThreads_Daily_Outbound_Queue_{args.date}.csv"
    write_queue_csv(queue_path, queue)

    board_path = outputs / f"Deal Threads Send Board - {args.date}.md"
    lines = [
        f"# Deal Threads Send Board - {args.date}",
        "",
        f"Targets source: `{targets_path}`",
        f"Queue CSV: `{queue_path}`",
        f"Outcome tracker: `{tracker}`",
        "",
        "Rule: review the account, send manually, then run the log command.",
        "",
        "## Today's Queue",
        "",
    ]
    if not queue:
        lines.append("No eligible targets found. Add target rows or use `--include-sent` if you intentionally want to resend.")
    for row in queue:
        lines.append(markdown_block(row, args.date, tracker))

    board_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {board_path}")
    print(f"Wrote {queue_path}")
    print(f"Seeded {seeded} tracker rows in {tracker}")
    print(f"Selected {len(queue)} targets from {len(rows)} rows")


if __name__ == "__main__":
    main()
