#!/usr/bin/env python3
"""Create or refresh a dated backend answer intake CSV from the reusable template."""

from __future__ import annotations

import argparse
import csv
from datetime import date
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_TEMPLATE = WORKSPACE_ROOT / "pillars/1-operations/templates/backend-answer-intake-template.csv"
DEFAULT_EVIDENCE_ROOT = WORKSPACE_ROOT / "context/import/backend-audit"

PRESERVE_FIELDS = {"answer", "status", "owner", "evidence_path", "source_system"}


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    if not path.exists():
        return [], []
    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader.fieldnames or []), list(reader)


def write_csv(path: Path, rows: list[dict[str, str]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def apply_session_date(row: dict[str, str], session_date: str) -> dict[str, str]:
    return {key: str(value or "").replace("SESSION_DATE", session_date) for key, value in row.items()}


def merge_existing(
    template_rows: list[dict[str, str]],
    existing_rows: list[dict[str, str]],
    session_date: str,
) -> list[dict[str, str]]:
    existing_by_id = {str(row.get("question_id", "")).strip(): row for row in existing_rows}
    merged: list[dict[str, str]] = []
    for template_row in template_rows:
        row = apply_session_date(template_row, session_date)
        question_id = str(row.get("question_id", "")).strip()
        existing = existing_by_id.get(question_id)
        if existing:
            for field in PRESERVE_FIELDS:
                existing_value = str(existing.get(field, "")).strip()
                if existing_value:
                    row[field] = existing_value.replace("SESSION_DATE", session_date)
        merged.append(row)
    return merged


def create_intake(session_date: str, evidence_root: Path, template_path: Path) -> Path:
    fields, template_rows = read_csv(template_path)
    if not fields or not template_rows:
        raise SystemExit(f"No template rows found at {template_path}")

    session_dir = evidence_root / session_date
    target_path = session_dir / "backend-answer-intake.csv"
    _, existing_rows = read_csv(target_path)

    rows = merge_existing(template_rows, existing_rows, session_date)
    write_csv(target_path, rows, fields)
    return target_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat(), help="Session date in YYYY-MM-DD format.")
    parser.add_argument(
        "--evidence-root",
        type=Path,
        default=DEFAULT_EVIDENCE_ROOT,
        help="Root folder containing dated backend audit evidence folders.",
    )
    parser.add_argument(
        "--template",
        type=Path,
        default=DEFAULT_TEMPLATE,
        help="Reusable backend answer intake template.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    evidence_root = args.evidence_root if args.evidence_root.is_absolute() else WORKSPACE_ROOT / args.evidence_root
    template_path = args.template if args.template.is_absolute() else WORKSPACE_ROOT / args.template
    target = create_intake(args.date, evidence_root, template_path)
    print(f"Wrote {relative(target)}")


if __name__ == "__main__":
    main()
