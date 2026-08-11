#!/usr/bin/env python3
"""Validate the local Creative Alternatives operating framework.

This is intentionally local and read-only. It checks required documents, CSV
schemas, identifiers, score ranges, and the one-selected-segment rule. It does
not access or modify any external service.
"""

from __future__ import annotations

import argparse
import csv
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

REQUIRED_FILES = [
    "operating-system/README.md",
    "operating-system/source-of-truth-map.md",
    "plans/first-30-days-unified-operating-plan.md",
    "pillars/2-customer-acquisition/account-based-outbound-engine.md",
    "pillars/3-online-presence/inbound/30-day-channel-validation-plan.md",
    "pillars/3-online-presence/linkedin-content-engine.md",
    "pillars/1-operations/backend-modernization-roadmap.md",
    "operating-system/templates/segment-decision-note.md",
    "operating-system/templates/operations-pilot-charter.md",
    "operating-system/templates/weekly-operating-review.md",
    "operating-system/templates/inbound-channel-weekly-review.md",
]

CSV_SCHEMAS = {
    "operating-system/trackers/30-day-execution.csv": [
        "task_id",
        "week",
        "workstream",
        "outcome",
        "deliverable",
        "owner",
        "due_date",
        "status",
        "approval_gate",
        "evidence_link",
        "next_action",
    ],
    "operating-system/trackers/outbound/segment-decision-scorecard.csv": [
        "segment_id",
        "segment",
        "merch_necessity_0_5",
        "proof_proximity_0_5",
        "buyer_clarity_0_5",
        "timing_0_5",
        "reachable_accounts_0_5",
        "fulfillment_fit_0_5",
        "multichannel_reach_0_5",
        "weighted_score",
        "evidence",
        "unknowns",
        "decision_status",
        "owner",
        "decision_date",
    ],
    "operating-system/trackers/outbound/account-plan-template.csv": [
        "account_id",
        "company",
        "segment",
        "fit_tier",
        "trigger_or_event",
        "why_now",
        "primary_contact",
        "primary_role",
        "secondary_contact",
        "existing_customer_check",
        "prior_touch_check",
        "active_service_issue_check",
        "email_status",
        "linkedin_status",
        "phone_status",
        "last_touch_date",
        "next_touch_date",
        "next_action",
        "owner",
        "do_not_contact",
        "outcome",
        "notes",
    ],
    "operating-system/trackers/outbound/touch-ledger-template.csv": [
        "event_id",
        "account_id",
        "contact_id",
        "occurred_at",
        "channel",
        "direction",
        "activity_type",
        "campaign_or_sequence",
        "outcome",
        "owner",
        "next_action",
        "next_action_due",
        "suppression_event",
        "notes",
    ],
    "operating-system/trackers/outbound/weekly-scorecard.csv": [
        "week_start",
        "selected_segment",
        "accounts_researched",
        "accounts_approved",
        "unique_accounts_touched",
        "email_delivered",
        "positive_replies",
        "linkedin_accepts",
        "linkedin_replies",
        "dials",
        "live_conversations",
        "meetings",
        "quote_requests",
        "closed_won",
        "attributed_revenue",
        "median_first_response_hours",
        "opt_outs",
        "bounces",
        "notes",
    ],
    "operating-system/trackers/content/event-capture.csv": [
        "event_id",
        "date",
        "source_workstream",
        "event_type",
        "fact_or_artifact",
        "proof_location",
        "public_permission",
        "status",
        "suggested_voice",
        "buyer_relevance",
        "story_tension",
        "next_step",
        "owner",
    ],
    "operating-system/trackers/content/editorial-board.csv": [
        "content_id",
        "week_of",
        "voice",
        "purpose",
        "source_event_id",
        "hook",
        "proof_asset",
        "format",
        "cta",
        "audience",
        "approval_owner",
        "draft_due",
        "publish_target",
        "status",
        "result",
    ],
    "operating-system/trackers/content/weekly-scorecard.csv": [
        "week_start",
        "ryan_posts_approved",
        "kenny_posts_approved",
        "maclaine_posts_approved",
        "human_minutes",
        "captured_events",
        "proof_assets_cleared",
        "inbound_dms",
        "quote_requests",
        "content_assisted_replies",
        "profile_views",
        "learnings",
    ],
    "operating-system/trackers/inbound/channel-test.csv": [
        "test_id",
        "week",
        "channel",
        "asset_or_placement",
        "audience",
        "offer",
        "destination_url",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "owner",
        "status",
        "approval_gate",
        "publish_or_launch_date",
        "sessions",
        "cta_clicks",
        "form_submissions",
        "qualified_inquiries",
        "quote_requests",
        "opportunities",
        "customers",
        "attributed_revenue",
        "attributed_gross_profit",
        "human_minutes",
        "decision",
        "evidence_link",
        "notes",
    ],
    "operating-system/trackers/inbound/weekly-scorecard.csv": [
        "week_start",
        "landing_page_sessions",
        "linkedin_sessions",
        "organic_search_sessions",
        "association_sessions",
        "cta_clicks",
        "form_submissions",
        "qualified_inquiries",
        "quote_requests",
        "opportunities",
        "customers",
        "attributed_revenue",
        "attributed_gross_profit",
        "median_first_response_hours",
        "invalid_leads",
        "human_minutes",
        "decision",
        "learning",
    ],
    "operating-system/trackers/operations/automation-backlog.csv": [
        "candidate_id",
        "automation_candidate",
        "primary_outcome",
        "version",
        "response_time_impact_0_5",
        "order_quality_impact_0_5",
        "margin_impact_0_5",
        "capacity_impact_0_5",
        "evidence_strength_0_5",
        "implementation_effort_1_5",
        "risk_level",
        "dependencies",
        "next_30_day_stage",
        "status",
        "notes",
    ],
}

SEGMENT_SCORE_FIELDS = [
    "merch_necessity_0_5",
    "proof_proximity_0_5",
    "buyer_clarity_0_5",
    "timing_0_5",
    "reachable_accounts_0_5",
    "fulfillment_fit_0_5",
    "multichannel_reach_0_5",
]
SEGMENT_WEIGHTS = [0.25, 0.20, 0.15, 0.15, 0.10, 0.10, 0.05]
DECISION_STATUSES = {"candidate", "selected", "parked", "rejected"}
OPERATION_SCORE_FIELDS = [
    "response_time_impact_0_5",
    "order_quality_impact_0_5",
    "margin_impact_0_5",
    "capacity_impact_0_5",
    "evidence_strength_0_5",
]


def read_csv(relative_path: str) -> tuple[list[str], list[dict[str, str]]]:
    path = ROOT / relative_path
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        return list(reader.fieldnames or []), list(reader)


def check_unique(rows: list[dict[str, str]], field: str, label: str, errors: list[str]) -> None:
    values = [row.get(field, "").strip() for row in rows if row.get(field, "").strip()]
    duplicates = sorted({value for value in values if values.count(value) > 1})
    if duplicates:
        errors.append(f"{label}: duplicate {field}: {', '.join(duplicates)}")


def parse_score(value: str, field: str, row_id: str, low: int, high: int, errors: list[str]) -> float | None:
    value = value.strip()
    if not value:
        return None
    try:
        score = float(value)
    except ValueError:
        errors.append(f"{row_id}: {field} must be numeric or blank")
        return None
    if not low <= score <= high:
        errors.append(f"{row_id}: {field} must be between {low} and {high}")
    return score


def validate(strict: bool = False) -> list[str]:
    errors: list[str] = []

    for relative_path in REQUIRED_FILES:
        path = ROOT / relative_path
        if not path.is_file() or not path.read_text(encoding="utf-8").strip():
            errors.append(f"missing or empty required file: {relative_path}")

    csv_rows: dict[str, list[dict[str, str]]] = {}
    for relative_path, expected_header in CSV_SCHEMAS.items():
        path = ROOT / relative_path
        if not path.is_file():
            errors.append(f"missing tracker: {relative_path}")
            continue
        header, rows = read_csv(relative_path)
        csv_rows[relative_path] = rows
        if header != expected_header:
            errors.append(
                f"{relative_path}: schema mismatch\n"
                f"  expected: {','.join(expected_header)}\n"
                f"  actual:   {','.join(header)}"
            )

    segment_path = "operating-system/trackers/outbound/segment-decision-scorecard.csv"
    segment_rows = csv_rows.get(segment_path, [])
    check_unique(segment_rows, "segment_id", segment_path, errors)
    selected = [row for row in segment_rows if row.get("decision_status", "").strip() == "selected"]
    if len(selected) > 1:
        errors.append(f"{segment_path}: exactly zero or one segment may be selected; found {len(selected)}")
    if strict and len(selected) != 1:
        errors.append(f"{segment_path}: strict mode requires exactly one selected segment")

    for row in segment_rows:
        row_id = row.get("segment_id", "<missing-segment-id>").strip()
        status = row.get("decision_status", "").strip()
        if status not in DECISION_STATUSES:
            errors.append(f"{row_id}: invalid decision_status {status!r}")
        scores = [
            parse_score(row.get(field, ""), field, row_id, 0, 5, errors)
            for field in SEGMENT_SCORE_FIELDS
        ]
        weighted_value = row.get("weighted_score", "").strip()
        if all(score is not None for score in scores):
            calculated = sum(score * weight for score, weight in zip(scores, SEGMENT_WEIGHTS))
            if weighted_value:
                try:
                    recorded = float(weighted_value)
                    if not math.isclose(recorded, calculated, abs_tol=0.01):
                        errors.append(
                            f"{row_id}: weighted_score {recorded:.2f} does not match calculated {calculated:.2f}"
                        )
                except ValueError:
                    errors.append(f"{row_id}: weighted_score must be numeric or blank")
            if status == "selected":
                required = ["evidence", "unknowns", "owner", "decision_date"]
                missing = [field for field in required if not row.get(field, "").strip()]
                if missing:
                    errors.append(f"{row_id}: selected segment missing {', '.join(missing)}")
        elif weighted_value:
            errors.append(f"{row_id}: weighted_score must stay blank until all component scores are complete")

    operation_path = "operating-system/trackers/operations/automation-backlog.csv"
    operation_rows = csv_rows.get(operation_path, [])
    check_unique(operation_rows, "candidate_id", operation_path, errors)
    for row in operation_rows:
        row_id = row.get("candidate_id", "<missing-candidate-id>").strip()
        for field in OPERATION_SCORE_FIELDS:
            parse_score(row.get(field, ""), field, row_id, 0, 5, errors)
        parse_score(row.get("implementation_effort_1_5", ""), "implementation_effort_1_5", row_id, 1, 5, errors)

    execution_path = "operating-system/trackers/30-day-execution.csv"
    execution_rows = csv_rows.get(execution_path, [])
    check_unique(execution_rows, "task_id", execution_path, errors)
    for row in execution_rows:
        evidence_link = row.get("evidence_link", "").strip()
        if evidence_link and not (ROOT / evidence_link).exists():
            errors.append(f"{row.get('task_id', '<missing-task-id>')}: evidence_link not found: {evidence_link}")

    inbound_path = "operating-system/trackers/inbound/channel-test.csv"
    inbound_rows = csv_rows.get(inbound_path, [])
    check_unique(inbound_rows, "test_id", inbound_path, errors)
    for row in inbound_rows:
        evidence_link = row.get("evidence_link", "").strip()
        if evidence_link and not (ROOT / evidence_link).exists():
            errors.append(f"{row.get('test_id', '<missing-test-id>')}: evidence_link not found: {evidence_link}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--strict",
        action="store_true",
        help="also require exactly one selected outbound segment",
    )
    args = parser.parse_args()
    errors = validate(strict=args.strict)
    if errors:
        print("Operating framework validation FAILED:")
        for error in errors:
            print(f"- {error}")
        return 1
    mode = "strict" if args.strict else "setup"
    print(f"Operating framework validation passed ({mode} mode).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
