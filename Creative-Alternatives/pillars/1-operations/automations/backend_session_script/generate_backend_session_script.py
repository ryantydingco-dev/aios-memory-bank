#!/usr/bin/env python3
"""Generate a live backend session facilitation script from open backend questions."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path
import shlex


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"


@dataclass(frozen=True)
class Paths:
    run_date: str
    output_dir: Path
    unanswered_csv: Path
    next_actions_csv: Path
    dashboard_path: Path


SECTION_ORDER = [
    ("QuickBooks + payments", {"QuickBooks", "Payments"}),
    ("Email + open order truth", {"Email", "Open orders"}),
    ("POs, vendors, and proofs", {"Purchase orders", "Proofs"}),
    ("Spreadsheets + first build decision", {"Spreadsheets", "Decision"}),
    ("Live order packet", {"Order evidence"}),
]


def clean(value: object) -> str:
    return str(value or "").strip()


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def capture_command(run_date: str, question_id: str, answer_placeholder: str = "<answer>") -> str:
    return " ".join(
        [
            "python3",
            "pillars/1-operations/automations/backend_session_intake/record_backend_answer.py",
            "--date",
            shlex.quote(run_date),
            "--question",
            shlex.quote(question_id),
            "--answer",
            shlex.quote(answer_placeholder),
        ]
    )


def source_command(run_date: str, question_id: str, source_system: str = "<system/inbox/file>") -> str:
    return capture_command(run_date, question_id, "<answer>") + " --source-system " + shlex.quote(source_system)


def group_questions(rows: list[dict[str, str]]) -> list[tuple[str, list[dict[str, str]]]]:
    used: set[str] = set()
    grouped: list[tuple[str, list[dict[str, str]]]] = []
    for title, areas in SECTION_ORDER:
        section_rows = [row for row in rows if clean(row.get("area")) in areas]
        if section_rows:
            grouped.append((title, section_rows))
            used.update(clean(row.get("question_id")) for row in section_rows)
    remaining = [row for row in rows if clean(row.get("question_id")) not in used]
    if remaining:
        grouped.append(("Other open questions", remaining))
    return grouped


def build_capture_rows(run_date: str, questions: list[dict[str, str]]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for row in questions:
        qid = clean(row.get("question_id"))
        rows.append(
            {
                "question_id": qid,
                "area": clean(row.get("area")),
                "workflow_stage": clean(row.get("workflow_stage")),
                "owner": clean(row.get("owner")),
                "question": clean(row.get("question")),
                "evidence_path": clean(row.get("evidence_path")),
                "record_command": source_command(run_date, qid),
                "done_when": "Answer, status, source_system, and evidence_path are filled in the session intake.",
            }
        )
    return rows


def write_commands(path: Path, run_date: str, questions: list[dict[str, str]]) -> None:
    lines = [
        "# Backend Answer Capture Commands",
        "",
        f"Generated: {run_date}",
        "",
        "Use these during the live session. Replace `<answer>` and `<system/inbox/file>` before running.",
        "",
    ]
    for row in questions:
        qid = clean(row.get("question_id"))
        question = clean(row.get("question"))
        lines.extend(
            [
                f"## {qid}",
                "",
                question,
                "",
                "```bash",
                source_command(run_date, qid),
                "```",
                "",
            ]
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def write_script(path: Path, paths: Paths, questions: list[dict[str, str]], actions: list[dict[str, str]], commands_path: Path, capture_csv: Path) -> None:
    grouped = group_questions(questions)
    lines = [
        "# Backend Live Session Script",
        "",
        f"- Session date: {paths.run_date}",
        f"- Readiness dashboard: `{relative(paths.dashboard_path)}`",
        f"- Capture commands: `{relative(commands_path)}`",
        f"- Capture CSV: `{relative(capture_csv)}`",
        "",
        "## Opening",
        "",
        "Say this plainly:",
        "",
        "> We are not replacing Kenny's judgment. We are mapping where information gets lost between QuickBooks, email, spreadsheets, POs, printers, proofs, shipping, invoices, and payments. Anything customer-facing, vendor-facing, or money-facing stays human-approved.",
        "",
        "## Session Rules",
        "",
        "- Ask from one real order whenever possible.",
        "- If the answer is \"Kenny knows,\" record that as the current system dependency.",
        "- For every answer, capture the system, inbox, spreadsheet, report, or file that proves it.",
        "- If evidence is missing, mark the answer `Needs evidence` rather than guessing.",
        "",
        "## First 10 Minutes",
        "",
        "Open these:",
        "",
        f"- `context/import/backend-audit/{paths.run_date}/backend-answer-intake.csv`",
        f"- `{relative(paths.dashboard_path)}`",
        "- `pillars/1-operations/backend-reality-walkthrough.md`",
        "- `pillars/1-operations/quickbooks-export-sop.md`",
        "",
        "Run this to see the open queue:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py --date {paths.run_date} --list-open",
        "```",
        "",
        "If this cannot happen live, send:",
        "",
        "`pillars/1-operations/backend-async-request-pack.md`",
        "",
        "## Priority Script",
        "",
    ]

    for section_title, section_rows in grouped:
        lines.extend([f"### {section_title}", ""])
        for row in section_rows:
            qid = clean(row.get("question_id"))
            question = clean(row.get("question"))
            owner = clean(row.get("owner")) or "[CONFIRM]"
            evidence_path = clean(row.get("evidence_path"))
            lines.extend(
                [
                    f"**{qid} — {owner}**",
                    "",
                    f"Ask: {question}",
                    "",
                    f"Why it matters: {clean(row.get('automation_implication'))}",
                    "",
                    "Record:",
                    "",
                    "```bash",
                    source_command(paths.run_date, qid),
                    "```",
                    "",
                ]
            )
            if evidence_path:
                lines.extend([f"Evidence path: `{evidence_path}`", ""])

    lines.extend(
        [
            "## Evidence Collection Checklist",
            "",
            "Before ending the session, confirm these are collected or explicitly marked missing:",
            "",
        ]
    )
    for action in actions[:10]:
        lines.append(f"- [ ] {clean(action.get('action'))}")

    lines.extend(
        [
            "",
            "## Close The Session",
            "",
            "Run the full refresh:",
            "",
            "```bash",
            f"python3 pillars/1-operations/automations/backend_ops_runner/run_backend_ops_checks.py --date {paths.run_date}",
            "```",
            "",
            "Then open:",
            "",
            f"- `outputs/operations/backend-ops-run-{paths.run_date}/backend-ops-run-summary.md`",
            f"- `outputs/operations/backend-readiness-dashboard-{paths.run_date}/backend-readiness-dashboard.md`",
            "",
            "## Do Not Ship Yet",
            "",
            "- No QuickBooks writes.",
            "- No customer/vendor-facing sends.",
            "- No collections messages.",
            "- No production workflow changes until Kenny/Maclaine approve the source-of-truth map.",
            "",
        ]
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat(), help="Session/report date in YYYY-MM-DD format.")
    parser.add_argument(
        "--output-dir",
        default="",
        help="Output folder. Defaults to outputs/operations/backend-session-script-YYYY-MM-DD.",
    )
    return parser.parse_args()


def paths_from_args(args: argparse.Namespace) -> Paths:
    run_date = args.date
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_ROOT / f"backend-session-script-{run_date}"
    if not output_dir.is_absolute():
        output_dir = WORKSPACE_ROOT / output_dir
    return Paths(
        run_date=run_date,
        output_dir=output_dir,
        unanswered_csv=DEFAULT_OUTPUT_ROOT / f"backend-answer-summary-{run_date}/unanswered-backend-questions.csv",
        next_actions_csv=DEFAULT_OUTPUT_ROOT / f"backend-readiness-dashboard-{run_date}/backend-next-actions.csv",
        dashboard_path=DEFAULT_OUTPUT_ROOT / f"backend-readiness-dashboard-{run_date}/backend-readiness-dashboard.md",
    )


def main() -> None:
    args = parse_args()
    paths = paths_from_args(args)
    questions = read_csv(paths.unanswered_csv)
    actions = read_csv(paths.next_actions_csv)
    capture_rows = build_capture_rows(paths.run_date, questions)

    script_path = paths.output_dir / "backend-live-session-script.md"
    commands_path = paths.output_dir / "backend-answer-capture-commands.md"
    capture_csv = paths.output_dir / "backend-question-capture-sheet.csv"

    write_csv(
        capture_csv,
        capture_rows,
        ["question_id", "area", "workflow_stage", "owner", "question", "evidence_path", "record_command", "done_when"],
    )
    write_commands(commands_path, paths.run_date, questions)
    write_script(script_path, paths, questions, actions, commands_path, capture_csv)

    print(f"Wrote {relative(script_path)}")
    print(f"Wrote {relative(commands_path)}")
    print(f"Wrote {relative(capture_csv)}")


if __name__ == "__main__":
    main()
