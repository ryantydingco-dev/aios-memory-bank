#!/usr/bin/env python3
"""Import a markdown/text async backend response into the session intake CSV."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path
import re


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

QUESTION_HEADING_RE = re.compile(r"^\s*#{1,6}\s*(Q\d{1,3})\b\s*(.*)$", re.IGNORECASE)
INLINE_Q_RE = re.compile(r"^\s*(?:[-*]\s*)?(Q\d{1,3})\s*[:\-—]\s*(.+)$", re.IGNORECASE)
FIELD_RE = re.compile(r"^\s*(Answer|Status|Source system|Source|Evidence path|Evidence)\s*:\s*(.*)$", re.IGNORECASE)


@dataclass
class ParsedAnswer:
    question_id: str
    answer: str = ""
    status: str = ""
    source_system: str = ""
    evidence_path: str = ""


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def clean(value: object) -> str:
    return str(value or "").strip()


def normalize_question_id(value: str) -> str:
    text = clean(value).upper()
    if text.startswith("Q"):
        text = text[1:]
    if not text.isdigit():
        raise ValueError(f"Invalid question id: {value}")
    return f"Q{int(text):03d}"


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


def default_intake_path(run_date: str) -> Path:
    return DEFAULT_EVIDENCE_ROOT / run_date / "backend-answer-intake.csv"


def default_response_path(run_date: str) -> Path:
    return DEFAULT_EVIDENCE_ROOT / run_date / "async-response.md"


def flush_section(question_id: str | None, lines: list[str], parsed: dict[str, ParsedAnswer]) -> None:
    if not question_id:
        return
    item = parse_section(question_id, lines)
    if item.answer or item.status or item.source_system or item.evidence_path:
        parsed[item.question_id] = item


def parse_section(question_id: str, lines: list[str]) -> ParsedAnswer:
    item = ParsedAnswer(question_id=normalize_question_id(question_id))
    answer_lines: list[str] = []
    active_field = ""

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            if active_field == "answer" and answer_lines:
                answer_lines.append("")
            continue
        if line.strip().lower().startswith("question:"):
            continue
        field_match = FIELD_RE.match(line)
        if field_match:
            field = field_match.group(1).strip().lower()
            value = field_match.group(2).strip()
            if field == "answer":
                active_field = "answer"
                if value:
                    answer_lines.append(value)
            elif field == "status":
                item.status = value
                active_field = ""
            elif field in {"source system", "source"}:
                item.source_system = value
                active_field = ""
            elif field in {"evidence path", "evidence"}:
                item.evidence_path = value
                active_field = ""
            continue
        if active_field == "answer":
            answer_lines.append(line.strip())
        elif line.strip() not in {"---", "```"}:
            answer_lines.append(line.strip())

    item.answer = "\n".join(answer_lines).strip()
    return item


def parse_response(path: Path) -> dict[str, ParsedAnswer]:
    text = path.read_text(encoding="utf-8")
    parsed: dict[str, ParsedAnswer] = {}
    current_qid: str | None = None
    current_lines: list[str] = []

    for raw in text.splitlines():
        heading = QUESTION_HEADING_RE.match(raw)
        inline = INLINE_Q_RE.match(raw)
        if heading:
            flush_section(current_qid, current_lines, parsed)
            current_qid = heading.group(1)
            current_lines = [heading.group(2).strip()] if heading.group(2).strip() else []
            continue
        if inline and current_qid is None:
            qid = normalize_question_id(inline.group(1))
            parsed[qid] = ParsedAnswer(question_id=qid, answer=inline.group(2).strip(), status="Answered")
            continue
        if current_qid:
            current_lines.append(raw)

    flush_section(current_qid, current_lines, parsed)
    return parsed


def apply_answers(rows: list[dict[str, str]], answers: dict[str, ParsedAnswer], overwrite: bool) -> tuple[int, list[str]]:
    by_id = {clean(row.get("question_id")).upper(): row for row in rows}
    updated = 0
    missing: list[str] = []
    for qid, answer in answers.items():
        row = by_id.get(qid)
        if not row:
            missing.append(qid)
            continue
        if answer.answer and (overwrite or not clean(row.get("answer"))):
            row["answer"] = answer.answer
        if answer.status and (overwrite or clean(row.get("status")).lower() in {"", "unknown"}):
            row["status"] = answer.status
        elif answer.answer and not answer.status and (overwrite or clean(row.get("status")).lower() in {"", "unknown"}):
            row["status"] = "Answered"
        if answer.source_system and (overwrite or not clean(row.get("source_system"))):
            row["source_system"] = answer.source_system
        if answer.evidence_path and (overwrite or not clean(row.get("evidence_path"))):
            row["evidence_path"] = answer.evidence_path
        updated += 1
    return updated, missing


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat(), help="Session date in YYYY-MM-DD format.")
    parser.add_argument("--response", default="", help="Markdown/text response file. Defaults to async-response.md in the evidence folder.")
    parser.add_argument("--intake", default="", help="Session backend-answer-intake.csv path.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing answers/source/evidence fields.")
    parser.add_argument("--dry-run", action="store_true", help="Parse and report without writing to the intake CSV.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    response_path = Path(args.response).resolve() if args.response else default_response_path(args.date)
    intake_path = Path(args.intake).resolve() if args.intake else default_intake_path(args.date)
    if not response_path.exists():
        raise SystemExit(f"Response file not found: {response_path}")

    answers = parse_response(response_path)
    rows = read_csv(intake_path)
    updated, missing = apply_answers(rows, answers, overwrite=args.overwrite)

    print(f"Parsed {len(answers)} answer sections from {relative(response_path)}")
    print(f"Matched {updated} questions in {relative(intake_path)}")
    if missing:
        print("Missing question ids: " + ", ".join(missing))
    if not args.dry_run:
        write_csv(intake_path, rows)
        print(f"Updated {relative(intake_path)}")
    else:
        print("Dry run only; intake not modified.")


if __name__ == "__main__":
    main()
