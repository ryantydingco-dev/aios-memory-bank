#!/usr/bin/env python3
"""Local, human-in-the-loop operator for the Deal Threads revenue pipeline.

This script reads and writes a local CSV. It does not send email, place calls,
touch LinkedIn, create calendar events, or connect to an external service.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_TRACKER = ROOT / "Revenue Pipeline.csv"
DEFAULT_TZ = "America/New_York"

FIELDS = [
    "lead_id",
    "company",
    "contact_name",
    "contact_role",
    "specialty",
    "target_client",
    "email",
    "phone",
    "linkedin_url",
    "source_channel",
    "reply_intent",
    "reply_excerpt",
    "verified_observation",
    "sample_opportunity",
    "first_install_hypothesis",
    "initial_reply_at",
    "human_response_at",
    "sample_sent_at",
    "times_proposed_at",
    "meeting_times",
    "warm_call_at",
    "warm_call_outcome",
    "linkedin_continuity_at",
    "pipeline_math_booked_at",
    "meeting_at",
    "pipeline_math_held_at",
    "proposal_sent_at",
    "proposal_value",
    "install_verbal_yes_at",
    "install_paid_at",
    "install_kickoff_at",
    "stage",
    "next_action",
    "next_action_due",
    "owner",
    "last_touch_at",
    "nurture_until",
    "lost_reason",
    "notes",
]

CHANNELS = {"email", "linkedin", "call", "referral", "other"}
TERMINAL_STAGES = {"install_kickoff", "nurture", "closed_lost", "do_not_contact"}
STAGES = {
    "interested_reply",
    "human_response_sent",
    "sample_sent",
    "meeting_times_proposed",
    "warm_followup",
    "pipeline_math_booked",
    "pipeline_math_held",
    "proposal_sent",
    "install_verbal_yes",
    "install_paid",
    "install_kickoff",
    "nurture",
    "closed_lost",
    "do_not_contact",
}

EVENTS = {
    "interested-reply",
    "human-response-sent",
    "sample-sent",
    "times-proposed",
    "warm-call-attempted",
    "linkedin-continuity",
    "pipeline-math-booked",
    "pipeline-math-held",
    "proposal-sent",
    "install-verbal-yes",
    "install-paid",
    "install-kickoff",
    "nurture",
    "closed-lost",
    "do-not-contact",
}


def now_in(tz_name: str) -> dt.datetime:
    return dt.datetime.now(ZoneInfo(tz_name)).replace(microsecond=0)


def parse_time(value: str, tz_name: str) -> dt.datetime | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"invalid ISO timestamp {value!r}") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=ZoneInfo(tz_name))
    return parsed.astimezone(ZoneInfo(tz_name))


def iso(value: dt.datetime) -> str:
    return value.replace(microsecond=0).isoformat()


def load_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            return []
        return [{field: (row.get(field) or "").strip() for field in FIELDS} for row in reader]


def load_header(path: Path) -> list[str]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return next(csv.reader(handle), [])


def write_rows(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in FIELDS})


def append_note(row: dict[str, str], at: dt.datetime, note: str) -> None:
    if not note:
        return
    entry = f"{at.date().isoformat()}: {note.strip()}"
    row["notes"] = f"{row['notes']} | {entry}" if row.get("notes") else entry


def due_after(at: dt.datetime, minutes: int) -> str:
    return iso(at + dt.timedelta(minutes=minutes))


def apply_event(
    row: dict[str, str],
    event: str,
    at: dt.datetime,
    args: argparse.Namespace,
) -> None:
    """Apply a real-world milestone after the human performed it."""
    if event == "interested-reply":
        row["initial_reply_at"] = row["initial_reply_at"] or iso(at)
        row["reply_intent"] = args.intent or row["reply_intent"] or "interested"
        row["stage"] = "interested_reply"
        row["next_action"] = "send_human_response"
        row["next_action_due"] = due_after(at, 15)
    elif event == "human-response-sent":
        row["human_response_at"] = iso(at)
        row["stage"] = "human_response_sent"
        row["next_action"] = "build_tailored_answer_or_sample"
        row["next_action_due"] = due_after(at, 120)
    elif event == "sample-sent":
        row["sample_sent_at"] = iso(at)
        row["stage"] = "sample_sent"
        row["next_action"] = "propose_two_meeting_times"
        row["next_action_due"] = iso(at)
    elif event == "times-proposed":
        row["times_proposed_at"] = iso(at)
        if args.meeting_times:
            row["meeting_times"] = args.meeting_times
        row["stage"] = "meeting_times_proposed"
        row["next_action"] = "attempt_warm_call_and_linkedin_continuity"
        row["next_action_due"] = due_after(at, 30)
    elif event == "warm-call-attempted":
        row["warm_call_at"] = iso(at)
        row["warm_call_outcome"] = args.outcome or row["warm_call_outcome"] or "attempted"
        row["stage"] = "warm_followup"
        row["next_action"] = (
            "add_linkedin_continuity"
            if not row["linkedin_continuity_at"]
            else "confirm_pipeline_math_time"
        )
        row["next_action_due"] = due_after(at, 60 if not row["linkedin_continuity_at"] else 1440)
    elif event == "linkedin-continuity":
        row["linkedin_continuity_at"] = iso(at)
        if row["pipeline_math_booked_at"]:
            row["next_action"] = "prepare_pipeline_math_call"
            row["next_action_due"] = row["meeting_at"] or row["pipeline_math_booked_at"]
        else:
            row["stage"] = "warm_followup"
            row["next_action"] = "confirm_pipeline_math_time"
            row["next_action_due"] = due_after(at, 1440)
    elif event == "pipeline-math-booked":
        row["pipeline_math_booked_at"] = iso(at)
        if args.meeting_at:
            meeting_at = parse_time(args.meeting_at, args.timezone)
            row["meeting_at"] = iso(meeting_at) if meeting_at else ""
        row["stage"] = "pipeline_math_booked"
        row["next_action"] = "prepare_pipeline_math_call"
        row["next_action_due"] = row["meeting_at"] or due_after(at, 1440)
    elif event == "pipeline-math-held":
        row["pipeline_math_held_at"] = iso(at)
        row["stage"] = "pipeline_math_held"
        row["next_action"] = "send_proposal_or_decision_recap"
        row["next_action_due"] = due_after(at, 1440)
    elif event == "proposal-sent":
        row["proposal_sent_at"] = iso(at)
        if args.proposal_value:
            row["proposal_value"] = args.proposal_value
        row["stage"] = "proposal_sent"
        row["next_action"] = "follow_up_on_agreed_decision_date"
        row["next_action_due"] = args.due or due_after(at, 2880)
    elif event == "install-verbal-yes":
        row["install_verbal_yes_at"] = iso(at)
        if args.proposal_value:
            row["proposal_value"] = args.proposal_value
        row["stage"] = "install_verbal_yes"
        row["next_action"] = "collect_payment_and_schedule_kickoff"
        row["next_action_due"] = args.due or due_after(at, 1440)
    elif event == "install-paid":
        row["install_paid_at"] = iso(at)
        if args.proposal_value:
            row["proposal_value"] = args.proposal_value
        row["stage"] = "install_paid"
        row["next_action"] = "schedule_install_kickoff"
        row["next_action_due"] = args.due or due_after(at, 1440)
    elif event == "install-kickoff":
        row["install_kickoff_at"] = iso(at)
        row["stage"] = "install_kickoff"
        row["next_action"] = "run_install_plan"
        row["next_action_due"] = args.due
    elif event == "nurture":
        row["stage"] = "nurture"
        row["nurture_until"] = args.due or row["nurture_until"]
        row["next_action"] = "revisit_on_nurture_date_or_trigger"
        row["next_action_due"] = row["nurture_until"]
    elif event == "closed-lost":
        row["stage"] = "closed_lost"
        row["lost_reason"] = args.outcome or args.note or row["lost_reason"] or "unspecified"
        row["next_action"] = ""
        row["next_action_due"] = ""
    elif event == "do-not-contact":
        row["stage"] = "do_not_contact"
        row["next_action"] = ""
        row["next_action_due"] = ""

    row["last_touch_at"] = iso(at)
    append_note(row, at, args.note)


def command_log(args: argparse.Namespace) -> int:
    path = Path(args.tracker)
    rows = load_rows(path)
    lead_id = args.id.strip().lower()
    row = next((item for item in rows if item["lead_id"].lower() == lead_id), None)
    if row is None:
        row = {field: "" for field in FIELDS}
        row["lead_id"] = lead_id
        rows.append(row)

    updates = {
        "company": args.company,
        "contact_name": args.contact,
        "contact_role": args.role,
        "specialty": args.specialty,
        "target_client": args.target_client,
        "email": args.email,
        "phone": args.phone,
        "linkedin_url": args.linkedin_url,
        "source_channel": args.channel,
        "reply_excerpt": args.reply_excerpt,
        "verified_observation": args.verified_observation,
        "sample_opportunity": args.sample_opportunity,
        "first_install_hypothesis": args.first_install_hypothesis,
        "meeting_times": args.meeting_times,
        "owner": args.owner,
    }
    for field, value in updates.items():
        if value:
            row[field] = value.strip()
    if not row["owner"]:
        row["owner"] = "Ryan"

    at = parse_time(args.at, args.timezone) if args.at else now_in(args.timezone)
    assert at is not None
    apply_event(row, args.event, at, args)
    write_rows(path, rows)
    print(
        f"Logged {args.event} for {lead_id}; "
        f"stage={row['stage']}; next={row['next_action'] or '-'}; "
        f"due={row['next_action_due'] or '-'}"
    )
    return 0


def validation_errors(rows: list[dict[str, str]], tz_name: str) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    time_fields = [
        "initial_reply_at",
        "human_response_at",
        "sample_sent_at",
        "times_proposed_at",
        "warm_call_at",
        "linkedin_continuity_at",
        "pipeline_math_booked_at",
        "meeting_at",
        "pipeline_math_held_at",
        "proposal_sent_at",
        "install_verbal_yes_at",
        "install_paid_at",
        "install_kickoff_at",
        "next_action_due",
        "last_touch_at",
        "nurture_until",
    ]
    for line, row in enumerate(rows, start=2):
        label = row.get("lead_id") or f"line {line}"
        if not row.get("lead_id"):
            errors.append(f"line {line}: lead_id is required")
        elif row["lead_id"].lower() in seen:
            errors.append(f"{label}: duplicate lead_id")
        else:
            seen.add(row["lead_id"].lower())
        if not row.get("company"):
            errors.append(f"{label}: company is required")
        if not row.get("contact_name"):
            errors.append(f"{label}: contact_name is required")
        if not row.get("specialty"):
            errors.append(f"{label}: specialty is required (stay within staffing/recruiting)")
        if row.get("initial_reply_at") and not row.get("reply_excerpt"):
            errors.append(f"{label}: interested reply needs reply_excerpt")
        if row.get("sample_sent_at"):
            for field in [
                "target_client",
                "verified_observation",
                "sample_opportunity",
                "first_install_hypothesis",
            ]:
                if not row.get(field):
                    errors.append(f"{label}: sent sample needs {field}")
        if row.get("source_channel") and row["source_channel"].lower() not in CHANNELS:
            errors.append(f"{label}: invalid source_channel {row['source_channel']!r}")
        if row.get("stage") and row["stage"] not in STAGES:
            errors.append(f"{label}: invalid stage {row['stage']!r}")
        if row.get("stage") not in TERMINAL_STAGES and row.get("stage") != "install_kickoff":
            if not row.get("next_action"):
                errors.append(f"{label}: active opportunity needs next_action")
            if not row.get("next_action_due"):
                errors.append(f"{label}: active opportunity needs next_action_due")
        for field in time_fields:
            if row.get(field):
                try:
                    parse_time(row[field], tz_name)
                except ValueError as exc:
                    errors.append(f"{label}: {field}: {exc}")
        if row.get("times_proposed_at") and "|" not in row.get("meeting_times", ""):
            errors.append(f"{label}: meeting_times must contain two options separated by ' | '")
        if row.get("proposal_value"):
            try:
                if float(row["proposal_value"]) < 0:
                    raise ValueError
            except ValueError:
                errors.append(f"{label}: proposal_value must be a non-negative number")
    return errors


def command_validate(args: argparse.Namespace) -> int:
    path = Path(args.tracker)
    if not path.exists():
        print(f"INVALID: tracker does not exist: {path}")
        return 1
    header = load_header(path)
    if header != FIELDS:
        missing = [field for field in FIELDS if field not in header]
        extra = [field for field in header if field not in FIELDS]
        print("INVALID: tracker header does not match the canonical schema")
        if missing:
            print(f"- missing fields: {', '.join(missing)}")
        if extra:
            print(f"- unexpected fields: {', '.join(extra)}")
        if not missing and not extra:
            print("- fields are out of order")
        return 1
    rows = load_rows(path)
    errors = validation_errors(rows, args.timezone)
    if errors:
        print(f"INVALID: {len(errors)} issue(s)")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"VALID: {len(rows)} opportunity row(s); schema and operating fields pass")
    return 0


def account_tasks(row: dict[str, str], now: dt.datetime, tz_name: str) -> list[tuple[int, str]]:
    if row.get("stage") in TERMINAL_STAGES:
        return []
    tasks: list[tuple[int, str]] = []
    lead = f"{row.get('company') or row['lead_id']} — {row.get('contact_name') or 'contact'}"

    due = parse_time(row.get("next_action_due", ""), tz_name)
    if due and due <= now:
        tasks.append((0, f"OVERDUE: {lead}: {row.get('next_action') or 'resolve next step'} (due {due.isoformat()})"))

    if row.get("initial_reply_at") and not row.get("human_response_at"):
        tasks.append((0, f"NOW: {lead}: generate the work card, review it, and send a human response"))
        return tasks
    if row.get("human_response_at") and not row.get("sample_sent_at"):
        tasks.append((1, f"NOW: {lead}: use the work card to finish and send the tailored answer/sample"))
    if row.get("sample_sent_at") and not row.get("times_proposed_at"):
        tasks.append((0, f"NOW: {lead}: propose two concrete meeting times"))
    if row.get("times_proposed_at") and not row.get("warm_call_at"):
        if row.get("phone"):
            tasks.append((1, f"NOW: {lead}: attempt one contextual warm call"))
        else:
            tasks.append((2, f"DOCUMENT: {lead}: no warm call until a valid number is available"))
    if row.get("human_response_at") and not row.get("linkedin_continuity_at"):
        if row.get("linkedin_url"):
            tasks.append((2, f"TODAY: {lead}: add one non-pitchy LinkedIn continuity touch"))
        else:
            tasks.append((3, f"DOCUMENT: {lead}: LinkedIn URL unavailable; keep continuity in email"))
    if row.get("pipeline_math_booked_at") and not row.get("pipeline_math_held_at"):
        tasks.append((2, f"PREP: {lead}: prepare Pipeline Math inputs and first-install hypothesis"))
    if row.get("pipeline_math_held_at") and not row.get("proposal_sent_at"):
        tasks.append((0, f"NOW: {lead}: send proposal or explicit no-fit recap within 24 hours"))
    if row.get("proposal_sent_at") and not row.get("install_verbal_yes_at"):
        tasks.append((2, f"FOLLOW-UP: {lead}: act on the agreed proposal decision date"))
    if row.get("install_verbal_yes_at") and not row.get("install_paid_at"):
        tasks.append((1, f"NOW: {lead}: collect payment and schedule kickoff"))
    if row.get("install_paid_at") and not row.get("install_kickoff_at"):
        tasks.append((1, f"NOW: {lead}: confirm owners, inputs, and kickoff"))
    if not tasks and row.get("stage"):
        tasks.append((3, f"REVIEW: {lead}: {row.get('next_action') or 'set the next action'}"))
    return tasks


def command_board(args: argparse.Namespace) -> int:
    path = Path(args.tracker)
    rows = load_rows(path)
    now = parse_time(args.now, args.timezone) if args.now else now_in(args.timezone)
    assert now is not None
    tasks: list[tuple[int, str]] = []
    for row in rows:
        tasks.extend(account_tasks(row, now, args.timezone))
    tasks.sort(key=lambda item: (item[0], item[1]))

    print(f"# Deal Threads Revenue Board — {now.date().isoformat()}")
    print()
    print(f"Active opportunities: {sum(1 for row in rows if row.get('stage') not in TERMINAL_STAGES)}")
    print(f"Tasks: {len(tasks)}")
    print()
    if not tasks:
        print("No active tasks. Log existing interested replies before doing new prospecting.")
    else:
        for _, task in tasks:
            print(f"- {task}")
    return 0


def first_name(value: str) -> str:
    return (value or "").strip().split()[0] if (value or "").strip() else "there"


def split_meeting_times(value: str) -> tuple[str, str]:
    options = [part.strip() for part in (value or "").split("|") if part.strip()]
    first = options[0] if options else "[ADD TIME OPTION 1 + TIMEZONE]"
    second = options[1] if len(options) > 1 else "[ADD TIME OPTION 2 + TIMEZONE]"
    return first, second


def response_draft(row: dict[str, str]) -> str:
    first = first_name(row.get("contact_name", ""))
    company = row.get("company") or "[Firm]"
    specialty = row.get("specialty") or "[specialty]"
    target_client = row.get("target_client") or "[target client]"
    install = row.get("first_install_hypothesis") or "[first installed workflow]"
    option_one, option_two = split_meeting_times(row.get("meeting_times", ""))
    intent = (row.get("reply_intent") or "interested").strip().lower().replace("-", "_").replace(" ", "_")

    if intent in {"question", "specific_question", "curious"}:
        opening = (
            f"{first} — short answer: [WRITE A DIRECT 1–3 SENTENCE ANSWER TO THEIR QUESTION HERE].\n\n"
            f"For {company}, I’d tailor that around {specialty} and the {target_client} companies you want to win. "
            f"The first workflow I’d test is {install}, with a human approval step before anything customer-facing."
        )
    elif intent in {"send_info", "send_information", "info"}:
        opening = (
            f"{first} — happy to. I don’t want to send you a generic deck.\n\n"
            f"I made the example about {company}, its {specialty} focus, and the {target_client} companies you want to win. "
            f"It shows where {install} could fit while keeping the relationship work human."
        )
    elif intent in {"pricing", "price", "cost"}:
        opening = (
            f"{first} — the price depends on the first workflow we install and how much of the data and task-routing layer "
            "is in scope. I don’t want to give you a fake range without mapping the current motion.\n\n"
            f"For {company}, the working first-install hypothesis is {install}. The Pipeline Math call is where we test "
            "the economics and put a real scope and number against it."
        )
    elif intent in {"bad_timing", "not_now", "timing"}:
        opening = (
            f"{first} — understood. I’ll keep this useful and low-pressure.\n\n"
            f"I made the short example about {company} and {specialty} so you have something concrete when timing improves. "
            f"The first workflow I’d test is {install}."
        )
    else:
        opening = (
            f"{first} — absolutely.\n\n"
            f"Based on {company}’s focus on {specialty}, I made the example around how you identify and work the "
            f"companies you want to win — {target_client} — before the need becomes a crowded req.\n\n"
            f"The first workflow I’d test is {install}, with the judgment, relationship, and close staying human."
        )

    return (
        f"{opening}\n\n"
        "I can walk you through the example and run the pipeline math in 20 minutes. "
        f"Would {option_one} or {option_two} work?"
    )


def readiness_line(label: str, ready: bool, detail: str) -> str:
    status = "READY" if ready else "BLOCKED"
    return f"- **{label}: {status}.** {detail}"


def render_packet(row: dict[str, str]) -> str:
    company = row.get("company") or "[Firm]"
    contact = row.get("contact_name") or "[Contact]"
    first = first_name(contact)
    specialty = row.get("specialty") or "[specialty]"
    target_client = row.get("target_client") or "[target client]"
    reply_excerpt = row.get("reply_excerpt") or "[MISSING — paste the prospect’s exact question or interest]"
    observation = row.get("verified_observation") or "[MISSING — add one verified account-specific observation]"
    opportunity = row.get("sample_opportunity") or "[MISSING — add one verified or explicitly illustrative client-side opportunity]"
    install = row.get("first_install_hypothesis") or "[MISSING — define the smallest first installed workflow]"
    option_one, option_two = split_meeting_times(row.get("meeting_times", ""))
    topic = f"{company}’s {specialty} client pipeline"
    has_two_times = "|" in row.get("meeting_times", "")
    response_needs_direct_answer = (row.get("reply_intent") or "").strip().lower().replace("-", "_").replace(" ", "_") in {
        "question",
        "specific_question",
        "curious",
    }
    response_ready = bool(row.get("reply_excerpt")) and has_two_times
    sample_ready = all(
        row.get(field)
        for field in [
            "target_client",
            "verified_observation",
            "sample_opportunity",
            "first_install_hypothesis",
        ]
    )
    call_ready = bool(row.get("phone"))
    linkedin_ready = bool(row.get("linkedin_url"))

    sections = [
        f"# {company} — Interested Reply Work Card",
        "",
        "Human review required. This card does not send anything.",
        "",
        "## Opportunity context",
        "",
        f"- Contact: {contact} — {row.get('contact_role') or '[role unknown]'}",
        f"- Staffing/recruiting specialty: {specialty}",
        f"- Target client: {target_client}",
        f"- Source channel: {row.get('source_channel') or '[unknown]'}",
        f"- Reply intent: {row.get('reply_intent') or 'interested'}",
        f"- Prospect’s words: “{reply_excerpt}”",
        f"- Verified observation: {observation}",
        f"- Sample opportunity: {opportunity}",
        f"- First-install hypothesis: {install}",
        "",
        "## Readiness gate",
        "",
        readiness_line(
            "Human response",
            response_ready,
            "Prospect’s words and two concrete times are present."
            if response_ready
            else "Needs the prospect’s words and two concrete times.",
        ),
        readiness_line(
            "Direct answer",
            not response_needs_direct_answer,
            "No direct-answer placeholder is required for this reply intent."
            if not response_needs_direct_answer
            else "Replace the direct-answer placeholder before sending.",
        ),
        readiness_line(
            "Tailored sample",
            sample_ready,
            "All required account-specific fields are present."
            if sample_ready
            else "Needs target client, verified observation, sample opportunity, and first-install hypothesis.",
        ),
        readiness_line(
            "Warm call",
            call_ready,
            "A number is recorded; verify it is a valid business/direct number before calling."
            if call_ready
            else "No valid business/direct number is recorded.",
        ),
        readiness_line(
            "LinkedIn continuity",
            linkedin_ready,
            "A profile URL is recorded; keep the real conversation in email unless they prefer LinkedIn."
            if linkedin_ready
            else "No verified LinkedIn profile URL is recorded.",
        ),
        "",
        "## Human-response draft",
        "",
        "```text",
        response_draft(row),
        "```",
        "",
        "Before sending: answer their exact question, remove every bracketed placeholder, verify both times, and read it aloud once.",
        "",
        "## Tailored sample draft",
        "",
        f"# {company} — Revenue AIOS working sample",
        "",
        "### What I heard",
        reply_excerpt,
        "",
        "### Account-specific observation",
        observation,
        "",
        "### Target client and one opportunity",
        f"Target client: {target_client}",
        "",
        opportunity,
        "",
        "### First workflow to test",
        install,
        "",
        "`Trigger -> required context -> AI-assisted output -> human approval -> action/task -> recorded outcome`",
        "",
        "### What remains human",
        "Judgment, relationship ownership, approval of customer-facing work, the sales call, and the close.",
        "",
        "### What to validate on the Pipeline Math call",
        "1. Current qualified client conversations per month.",
        "2. Conversation-to-new-client conversion rate.",
        "3. Average 12-month gross revenue per new client.",
        "4. Which step actually constrains growth.",
        "5. The 30-day acceptance test for the first install.",
        "",
        "## Warm-call card",
        "",
    ]
    if row.get("phone"):
        sections.extend(
            [
                f"Number on record: {row['phone']}",
                "",
                "```text",
                f"Hi {first}, Ryan here. Thanks for replying to my email about {topic}.",
                "",
                f"I sent over the {company}-specific example. I had one question that changes what I’d recommend: "
                "is the client-growth constraint account selection, enough relevant conversations, or consistent follow-up?",
                "",
                "Did I catch you with two minutes, or is later better?",
                "```",
                "",
                "Voicemail:",
                "",
                "```text",
                f"{first}, Ryan here. Thanks for replying to my email about {topic}. I sent the tailored example and "
                f"two times for a short Pipeline Math call: {option_one} or {option_two}. No need to call back — "
                "replying to the email is easiest.",
                "```",
            ]
        )
    else:
        sections.append("BLOCKED: no valid business/direct number is recorded. Do not invent or guess one.")

    sections.extend(["", "## LinkedIn continuity", ""])
    if row.get("linkedin_url"):
        sections.extend(
            [
                f"Profile on record: {row['linkedin_url']}",
                "",
                "```text",
                f"{first} — good speaking over email about {topic}. Connecting here so you can put a face to the name. "
                "I’ll keep the actual detail in our email thread.",
                "```",
            ]
        )
    else:
        sections.append("BLOCKED: no verified LinkedIn URL is recorded. Keep continuity in the existing email thread.")

    sections.extend(
        [
            "",
            "## Next milestone logging",
            "",
            "Run only after the human action actually happened:",
            "",
            "```bash",
            f"python3 scripts/revenue_pipeline_ops.py log --id {row['lead_id']!r} --event human-response-sent",
            f"python3 scripts/revenue_pipeline_ops.py log --id {row['lead_id']!r} --event sample-sent",
            f"python3 scripts/revenue_pipeline_ops.py log --id {row['lead_id']!r} --event times-proposed "
            f"--meeting-times {row.get('meeting_times', '')!r}",
            f"python3 scripts/revenue_pipeline_ops.py log --id {row['lead_id']!r} --event warm-call-attempted "
            "--outcome 'connected|voicemail|no-answer|not-called'",
            f"python3 scripts/revenue_pipeline_ops.py log --id {row['lead_id']!r} --event linkedin-continuity",
            "```",
        ]
    )
    return "\n".join(sections) + "\n"


def command_packet(args: argparse.Namespace) -> int:
    rows = load_rows(Path(args.tracker))
    lead_id = args.id.strip().lower()
    row = next((item for item in rows if item["lead_id"].lower() == lead_id), None)
    if row is None:
        print(f"ERROR: no opportunity found for {lead_id}", file=sys.stderr)
        return 1
    packet = render_packet(row)
    if args.output:
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(packet, encoding="utf-8")
        print(f"Wrote work card: {output}")
    else:
        print(packet, end="")
    return 0


def in_window(value: str, start: dt.datetime, tz_name: str) -> bool:
    parsed = parse_time(value, tz_name)
    return bool(parsed and parsed >= start)


def percentage(numerator: int, denominator: int) -> str:
    return "—" if denominator == 0 else f"{(100 * numerator / denominator):.1f}%"


def median_response_minutes(rows: list[dict[str, str]], tz_name: str) -> str:
    samples: list[float] = []
    for row in rows:
        reply = parse_time(row.get("initial_reply_at", ""), tz_name)
        response = parse_time(row.get("human_response_at", ""), tz_name)
        if reply and response and response >= reply:
            samples.append((response - reply).total_seconds() / 60)
    return "—" if not samples else f"{statistics.median(samples):.0f}"


def command_scoreboard(args: argparse.Namespace) -> int:
    rows = load_rows(Path(args.tracker))
    now = parse_time(args.now, args.timezone) if args.now else now_in(args.timezone)
    assert now is not None
    start = now - dt.timedelta(days=args.days)
    cohort_rows = [row for row in rows if in_window(row.get("initial_reply_at", ""), start, args.timezone)]

    metric_fields = {
        "interested": "initial_reply_at",
        "responded": "human_response_at",
        "sample": "sample_sent_at",
        "times": "times_proposed_at",
        "warm_call": "warm_call_at",
        "linkedin": "linkedin_continuity_at",
        "booked": "pipeline_math_booked_at",
        "held": "pipeline_math_held_at",
        "proposal": "proposal_sent_at",
        "verbal_yes": "install_verbal_yes_at",
        "paid": "install_paid_at",
    }

    def happened_in_window(row: dict[str, str], metric: str) -> bool:
        return in_window(row.get(metric_fields[metric], ""), start, args.timezone)

    def cohort_has(row: dict[str, str], metric: str) -> bool:
        return bool(row.get(metric_fields[metric]))

    event_rows = [
        row
        for row in rows
        if any(happened_in_window(row, metric) for metric in metric_fields)
    ]
    totals = {
        name: sum(1 for row in cohort_rows if cohort_has(row, name))
        for name in metric_fields
    }
    proposal_value = sum(
        float(row.get("proposal_value") or 0)
        for row in rows
        if happened_in_window(row, "proposal")
    )
    paid_value = sum(
        float(row.get("proposal_value") or 0)
        for row in rows
        if happened_in_window(row, "paid")
    )

    print(f"# Deal Threads Single-Channel Scoreboard — last {args.days} days")
    print()
    print(f"Window: {start.date().isoformat()} through {now.date().isoformat()}")
    print(f"Median reply-to-human-response for new replies: {median_response_minutes(cohort_rows, args.timezone)} minutes")
    print()
    print("Milestones completed during the window:")
    print()
    print("| Channel | Interested | Responded | Sample | Two times | Warm call | LinkedIn | Calls booked | Calls held | Proposals | Paid installs |")
    print("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
    by_channel: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in event_rows:
        by_channel[row.get("source_channel") or "unknown"].append(row)
    for channel in sorted(by_channel):
        group = by_channel[channel]
        counts = [sum(1 for row in group if happened_in_window(row, name)) for name in [
            "interested", "responded", "sample", "times", "warm_call", "linkedin",
            "booked", "held", "proposal", "paid",
        ]]
        print(f"| {channel} | " + " | ".join(str(value) for value in counts) + " |")
    if not by_channel:
        print("| — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |")

    print()
    print("## New-reply cohort funnel")
    print()
    print("These rates follow the replies that entered during this window through their current state.")
    print()
    print(f"- Interested replies: {totals['interested']}")
    print(f"- Human response rate: {percentage(totals['responded'], totals['interested'])}")
    print(f"- Tailored sample rate: {percentage(totals['sample'], totals['interested'])}")
    print(f"- Two-times rate: {percentage(totals['times'], totals['interested'])}")
    print(f"- Pipeline Math booking rate: {percentage(totals['booked'], totals['interested'])}")
    print(f"- Held-to-proposal rate: {percentage(totals['proposal'], totals['held'])}")
    print(f"- Proposal-to-paid rate: {percentage(totals['paid'], totals['proposal'])}")
    print(f"- Proposal value: ${proposal_value:,.0f}")
    print(f"- Paid install value: ${paid_value:,.0f}")

    stalls = Counter()
    for row in rows:
        if row.get("stage") not in TERMINAL_STAGES:
            stalls[row.get("next_action") or "missing_next_action"] += 1
    print()
    print("## Current stalls")
    print()
    if not stalls:
        print("- None.")
    else:
        for action, count in stalls.most_common():
            print(f"- {action}: {count}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tracker", default=str(DEFAULT_TRACKER))
    parser.add_argument("--timezone", default=DEFAULT_TZ)
    subparsers = parser.add_subparsers(dest="command", required=True)

    log_parser = subparsers.add_parser("log", help="record a completed human milestone")
    log_parser.add_argument("--id", required=True)
    log_parser.add_argument("--event", choices=sorted(EVENTS), required=True)
    log_parser.add_argument("--at", default="")
    log_parser.add_argument("--company", default="")
    log_parser.add_argument("--contact", default="")
    log_parser.add_argument("--role", default="")
    log_parser.add_argument("--specialty", default="")
    log_parser.add_argument("--target-client", default="")
    log_parser.add_argument("--email", default="")
    log_parser.add_argument("--phone", default="")
    log_parser.add_argument("--linkedin-url", default="")
    log_parser.add_argument("--channel", choices=sorted(CHANNELS), default="")
    log_parser.add_argument("--intent", default="")
    log_parser.add_argument("--reply-excerpt", default="")
    log_parser.add_argument("--verified-observation", default="")
    log_parser.add_argument("--sample-opportunity", default="")
    log_parser.add_argument("--first-install-hypothesis", default="")
    log_parser.add_argument("--meeting-times", default="")
    log_parser.add_argument("--meeting-at", default="")
    log_parser.add_argument("--proposal-value", default="")
    log_parser.add_argument("--owner", default="")
    log_parser.add_argument("--outcome", default="")
    log_parser.add_argument("--due", default="")
    log_parser.add_argument("--note", default="")
    log_parser.set_defaults(func=command_log)

    validate_parser = subparsers.add_parser("validate", help="validate tracker schema and operating fields")
    validate_parser.set_defaults(func=command_validate)

    board_parser = subparsers.add_parser("board", help="print the prioritized daily task board")
    board_parser.add_argument("--now", default="")
    board_parser.set_defaults(func=command_board)

    packet_parser = subparsers.add_parser("packet", help="render a human-reviewed account work card")
    packet_parser.add_argument("--id", required=True)
    packet_parser.add_argument("--output", default="")
    packet_parser.set_defaults(func=command_packet)

    scoreboard_parser = subparsers.add_parser("scoreboard", help="print one cross-channel funnel scoreboard")
    scoreboard_parser.add_argument("--days", type=int, default=7)
    scoreboard_parser.add_argument("--now", default="")
    scoreboard_parser.set_defaults(func=command_scoreboard)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "scoreboard" and args.days <= 0:
        parser.error("--days must be positive")
    try:
        return args.func(args)
    except (OSError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
