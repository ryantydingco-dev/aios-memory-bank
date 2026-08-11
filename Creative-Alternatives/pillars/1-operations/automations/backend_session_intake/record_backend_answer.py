#!/usr/bin/env python3
"""Record or inspect one backend intake answer in the dated session CSV."""

from __future__ import annotations

import argparse
import csv
from datetime import date
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_EVIDENCE_ROOT = WORKSPACE_ROOT / "context/import/backend-audit"

FIELDS = [
    "question_id",
    "area",
    "workflow_stage",
    "question",
    "answer",
    "status",
    "owner",
    "evidence_path",
    "source_system",
    "gap_if_unclear",
    "automation_implication",
]

OPEN_STATUSES = {"", "unknown", "needs evidence", "blocked", "[confirm]", "todo", "to do"}


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def clean(value: object) -> str:
    return str(value or "").strip()


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        raise SystemExit(f"Intake file not found: {path}")
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in FIELDS})


def default_intake_path(session_date: str, evidence_root: Path) -> Path:
    return evidence_root / session_date / "backend-answer-intake.csv"


def normalize_question_id(question_id: str) -> str:
    q = clean(question_id).upper()
    if q.startswith("Q"):
        number = q[1:]
    else:
        number = q
    if not number.isdigit():
        raise SystemExit(f"Question id must look like Q001 or 1, got: {question_id}")
    return f"Q{int(number):03d}"


def find_row(rows: list[dict[str, str]], question_id: str) -> dict[str, str]:
    normalized = normalize_question_id(question_id)
    for row in rows:
        if clean(row.get("question_id")).upper() == normalized:
            return row
    raise SystemExit(f"Question id not found in intake: {normalized}")


def row_is_open(row: dict[str, str]) -> bool:
    status = clean(row.get("status")).lower()
    answer = clean(row.get("answer"))
    return not answer or status in OPEN_STATUSES


def print_row(row: dict[str, str]) -> None:
    print(f"{clean(row.get('question_id'))} — {clean(row.get('area'))} / {clean(row.get('workflow_stage'))}")
    print(f"Question: {clean(row.get('question'))}")
    print(f"Status: {clean(row.get('status')) or 'Unknown'}")
    print(f"Owner: {clean(row.get('owner'))}")
    print(f"Answer: {clean(row.get('answer')) or '-'}")
    print(f"Source system: {clean(row.get('source_system')) or '-'}")
    print(f"Evidence path: {clean(row.get('evidence_path')) or '-'}")
    print(f"Gap if unclear: {clean(row.get('gap_if_unclear'))}")
    print(f"Automation implication: {clean(row.get('automation_implication'))}")


def list_open(rows: list[dict[str, str]], limit: int | None) -> None:
    open_rows = [row for row in rows if row_is_open(row)]
    for idx, row in enumerate(open_rows, start=1):
        if limit is not None and idx > limit:
            break
        print(
            f"{clean(row.get('question_id'))}: "
            f"{clean(row.get('area'))} — {clean(row.get('question'))}"
        )
    print(f"Open questions: {len(open_rows)} / {len(rows)}")


def update_row(row: dict[str, str], args: argparse.Namespace) -> None:
    if args.answer is not None:
        if args.append and clean(row.get("answer")):
            row["answer"] = f"{clean(row.get('answer'))}\n{clean(args.answer)}"
        else:
            row["answer"] = clean(args.answer)
        if not args.status:
            row["status"] = "Answered"
    if args.status:
        row["status"] = clean(args.status)
    if args.owner:
        row["owner"] = clean(args.owner)
    if args.source_system:
        row["source_system"] = clean(args.source_system)
    if args.evidence_path:
        row["evidence_path"] = clean(args.evidence_path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat(), help="Session date in YYYY-MM-DD format.")
    parser.add_argument("--intake", default="", help="Path to a specific backend-answer-intake.csv file.")
    parser.add_argument("--question", "-q", default="", help="Question id, e.g. Q001 or 1.")
    parser.add_argument("--answer", default=None, help="Answer text to record.")
    parser.add_argument("--status", default="", help="Status to set, e.g. Answered, Needs evidence, Unknown, Blocked.")
    parser.add_argument("--owner", default="", help="Owner to set.")
    parser.add_argument("--source-system", default="", help="Source system/tool/inbox/file to set.")
    parser.add_argument("--evidence-path", default="", help="Evidence path to set.")
    parser.add_argument("--append", action="store_true", help="Append answer text instead of replacing the existing answer.")
    parser.add_argument("--show", action="store_true", help="Show one question row without updating it.")
    parser.add_argument("--list-open", action="store_true", help="List open questions.")
    parser.add_argument("--limit", type=int, default=10, help="Limit for --list-open. Use 0 for no limit.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    evidence_root = DEFAULT_EVIDENCE_ROOT
    intake_path = Path(args.intake).resolve() if args.intake else default_intake_path(args.date, evidence_root)
    rows = read_csv(intake_path)

    if args.list_open:
        list_open(rows, None if args.limit == 0 else args.limit)
        return

    if not args.question:
        raise SystemExit("Pass --question Q###, or use --list-open.")

    row = find_row(rows, args.question)
    if args.show and args.answer is None and not any([args.status, args.owner, args.source_system, args.evidence_path]):
        print_row(row)
        return

    update_row(row, args)
    write_csv(intake_path, rows)
    print(f"Updated {normalize_question_id(args.question)} in {relative(intake_path)}")
    print_row(row)


if __name__ == "__main__":
    main()
