#!/usr/bin/env python3
"""Validate a CA Salesfinity research CSV without contacting external systems."""
from __future__ import annotations

import csv
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

REQUIRED_COLUMNS = [
    "first_name", "last_name", "title", "company", "website", "phone",
    "phone_source_url", "timezone", "lane", "offer", "research_tier",
    "research_score", "trigger_type", "reason_to_call", "merch_hypothesis",
    "suggested_opener", "call_goal", "fit_source_url", "trigger_source_url",
    "research_date", "suppression_checked", "dnc_status", "call_ready",
    "hold_reason",
]

GENERIC_REASONS = (
    "may need swag",
    "might need swag",
    "could use swag",
    "has employees",
    "they run events",
    "promotional products",
)


def valid_url(value: str) -> bool:
    parsed = urlparse(value.strip())
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def normalized_phone(value: str) -> str:
    return "".join(ch for ch in value if ch.isdigit())


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate_list.py <salesfinity-list.csv>", file=sys.stderr)
        return 2

    path = Path(sys.argv[1])
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames or []
        missing_columns = [name for name in REQUIRED_COLUMNS if name not in fields]
        if missing_columns:
            print("missing columns: " + ", ".join(missing_columns))
            return 1
        rows = list(reader)

    errors: list[str] = []
    seen_people: Counter[tuple[str, str, str]] = Counter()
    seen_phones: Counter[str] = Counter()

    for line, row in enumerate(rows, start=2):
        ready = row["call_ready"].strip().lower() == "yes"
        person_key = (
            row["first_name"].strip().lower(),
            row["last_name"].strip().lower(),
            row["company"].strip().lower(),
        )
        phone_key = normalized_phone(row["phone"])
        seen_people[person_key] += 1
        if phone_key:
            seen_phones[phone_key] += 1

        if not ready:
            if not row["hold_reason"].strip():
                errors.append(f"line {line}: held row needs hold_reason")
            continue

        required_ready = [name for name in REQUIRED_COLUMNS if name != "hold_reason"]
        blank = [name for name in required_ready if not row[name].strip()]
        if blank:
            errors.append(f"line {line}: call-ready row missing {', '.join(blank)}")

        if row["research_tier"].strip().upper() not in {"A", "B"}:
            errors.append(f"line {line}: call-ready research_tier must be A or B")
        try:
            score = int(row["research_score"])
            if score < 7 or score > 10:
                errors.append(f"line {line}: call-ready research_score must be 7-10")
        except ValueError:
            errors.append(f"line {line}: research_score must be an integer")

        for field in ("phone_source_url", "fit_source_url", "trigger_source_url"):
            if row[field].strip() and not valid_url(row[field]):
                errors.append(f"line {line}: invalid {field}")

        reason = row["reason_to_call"].strip().lower()
        if len(reason) < 50:
            errors.append(f"line {line}: reason_to_call is too thin")
        if any(phrase in reason for phrase in GENERIC_REASONS):
            errors.append(f"line {line}: reason_to_call contains generic rationale")
        opener_words = len(row["suggested_opener"].split())
        if opener_words < 20 or opener_words > 55:
            errors.append(f"line {line}: suggested_opener should be 20-55 words")
        if row["suppression_checked"].strip().lower() != "yes":
            errors.append(f"line {line}: call-ready row must be suppression_checked=yes")
        if row["dnc_status"].strip().lower() not in {"cleared", "business-number-reviewed"}:
            errors.append(f"line {line}: unresolved dnc_status must be held")
        if len(phone_key) < 10:
            errors.append(f"line {line}: phone is missing or too short")

    for key, count in seen_people.items():
        if count > 1 and any(key):
            errors.append(f"duplicate person/company ({count}x): {' '.join(key)}")
    for phone, count in seen_phones.items():
        if count > 1:
            errors.append(f"duplicate phone ({count}x): {phone}")

    if errors:
        print(f"FAIL: {len(errors)} error(s) across {len(rows)} row(s)")
        for error in errors:
            print("- " + error)
        return 1

    ready_count = sum(row["call_ready"].strip().lower() == "yes" for row in rows)
    print(f"PASS: {len(rows)} row(s), {ready_count} call-ready, 0 validation errors")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

