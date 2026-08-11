#!/usr/bin/env python3
"""Generate a single backend readiness dashboard from operations audit outputs."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"


@dataclass(frozen=True)
class Paths:
    report_date: str
    output_dir: Path
    answer_unanswered: Path
    automation_readiness: Path
    quickbooks_validation: Path
    email_packet_coverage: Path
    order_packet_coverage: Path
    automation_recommendation: Path
    po_exceptions: Path


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def clean(value: object) -> str:
    return str(value or "").strip()


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


def status_counts(rows: list[dict[str, str]], field: str = "status") -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        status = clean(row.get(field)) or "Unknown"
        counts[status] = counts.get(status, 0) + 1
    return counts


def missing_count(rows: list[dict[str, str]], field: str = "status") -> int:
    return sum(1 for row in rows if "missing" in clean(row.get(field)).lower())


def first_row(rows: list[dict[str, str]]) -> dict[str, str]:
    return rows[0] if rows else {}


def top_unanswered_questions(rows: list[dict[str, str]], limit: int = 10) -> list[dict[str, str]]:
    priority_areas = ["QuickBooks", "Payments", "Email", "Purchase orders", "Open orders", "Order evidence", "Spreadsheets"]
    area_rank = {area: idx for idx, area in enumerate(priority_areas)}
    return sorted(
        rows,
        key=lambda row: (
            area_rank.get(clean(row.get("area")), len(priority_areas)),
            clean(row.get("question_id")),
        ),
    )[:limit]


def build_health_rows(paths: Paths) -> list[dict[str, object]]:
    unanswered = read_csv(paths.answer_unanswered)
    qb_rows = read_csv(paths.quickbooks_validation)
    email_rows = read_csv(paths.email_packet_coverage)
    order_rows = read_csv(paths.order_packet_coverage)
    po_rows = read_csv(paths.po_exceptions)
    automation_rows = read_csv(paths.automation_recommendation)
    readiness_rows = read_csv(paths.automation_readiness)

    order_present = sum(1 for row in order_rows if clean(row.get("status")).lower() == "present")
    email_ready = sum(1 for row in email_rows if clean(row.get("status")).lower() == "ready for walkthrough")
    qb_valid = sum(1 for row in qb_rows if clean(row.get("status")).lower() == "present - valid")
    high_po_exceptions = sum(1 for row in po_rows if clean(row.get("severity")).lower() == "high")
    build_ready = sum(1 for row in readiness_rows if "ready" in clean(row.get("readiness")).lower() and "needs" not in clean(row.get("readiness")).lower())

    lead = first_row(automation_rows)
    lead_name = clean(lead.get("automation")) or "None yet"
    lead_readiness = clean(lead.get("readiness")) or "Needs answers"

    return [
        {
            "area": "Backend answers",
            "status": "Not mapped" if unanswered else "Mapped enough for validation",
            "metric": f"{len(unanswered)} open questions",
            "evidence": relative(paths.answer_unanswered),
            "next_step": f"Answer the source-of-truth questions in context/import/backend-audit/{paths.report_date}/backend-answer-intake.csv.",
        },
        {
            "area": "QuickBooks exports",
            "status": "Not ready" if missing_count(qb_rows) else "CSV exports present",
            "metric": f"{qb_valid}/{len(qb_rows)} exports valid; {missing_count(qb_rows)} missing",
            "evidence": relative(paths.quickbooks_validation),
            "next_step": "Export missing QuickBooks reports and rerun the validator.",
        },
        {
            "area": "Email/order threads",
            "status": "Not ready" if email_ready == 0 else "At least one packet ready",
            "metric": f"{email_ready}/{len(email_rows)} order packets ready",
            "evidence": relative(paths.email_packet_coverage),
            "next_step": "Save customer request, approval, vendor/PO, tracking, and invoice/payment thread evidence.",
        },
        {
            "area": "Order packet evidence",
            "status": "Not ready" if order_present == 0 else "Evidence partially present",
            "metric": f"{order_present}/{len(order_rows)} required artifacts present",
            "evidence": relative(paths.order_packet_coverage),
            "next_step": "Collect one complete printer/decorator order packet first, then repeat for five orders.",
        },
        {
            "area": "PO/printer tracker",
            "status": "Needs evidence" if high_po_exceptions else "Review tracker rows",
            "metric": f"{high_po_exceptions} high-severity PO exceptions",
            "evidence": relative(paths.po_exceptions),
            "next_step": "Replace placeholder PO rows with real order packets and vendor confirmations.",
        },
        {
            "area": "First automation lead",
            "status": lead_readiness,
            "metric": lead_name,
            "evidence": relative(paths.automation_recommendation),
            "next_step": clean(lead.get("missing_evidence")) or "Confirm first automation priority after evidence collection.",
        },
        {
            "area": "Automation readiness",
            "status": "No candidate ready" if build_ready == 0 else "Candidate has enough answers to scope",
            "metric": f"{build_ready}/{len(readiness_rows)} candidates ready by answer gate",
            "evidence": relative(paths.automation_readiness),
            "next_step": "Use first-automation-readiness.csv as the decision gate after intake answers are filled.",
        },
    ]


def build_action_rows(paths: Paths) -> list[dict[str, object]]:
    unanswered = top_unanswered_questions(read_csv(paths.answer_unanswered), limit=8)
    qb_rows = read_csv(paths.quickbooks_validation)
    email_rows = read_csv(paths.email_packet_coverage)
    order_rows = read_csv(paths.order_packet_coverage)
    po_rows = read_csv(paths.po_exceptions)
    lead = first_row(read_csv(paths.automation_recommendation))

    actions: list[dict[str, object]] = []

    for idx, row in enumerate(unanswered[:5], start=1):
        actions.append(
            {
                "priority": idx,
                "owner": clean(row.get("owner")) or "Ryan/Maclaine [CONFIRM]",
                "action": f"Answer {clean(row.get('question_id'))}: {clean(row.get('question'))}",
                "source_report": relative(paths.answer_unanswered),
                "evidence_needed": clean(row.get("evidence_path")) or "Plain-English answer plus screenshot/export if available.",
                "done_when": "Answer, status, source_system, and evidence_path are filled in the intake CSV.",
                "blocks": "Source-of-truth map; first automation selection",
            }
        )

    missing_qb = [row for row in qb_rows if "missing" in clean(row.get("status")).lower()]
    if missing_qb:
        actions.append(
            {
                "priority": len(actions) + 1,
                "owner": "Maclaine/Ryan [CONFIRM]",
                "action": "Export the six next QuickBooks reports into the dated quickbooks evidence folder.",
                "source_report": relative(paths.quickbooks_validation),
                "evidence_needed": "; ".join(clean(row.get("expected_filename")) for row in missing_qb),
                "done_when": "QuickBooks validator reports each required CSV as present and valid or intentionally not used.",
                "blocks": "AR worklist; reconciliation; PO/margin mapping",
            }
        )

    if email_rows and all(clean(row.get("files_scanned")) in {"", "0"} for row in email_rows):
        actions.append(
            {
                "priority": len(actions) + 1,
                "owner": "Ryan/Maclaine [CONFIRM]",
                "action": "Save one real customer/order email thread into order-01.",
                "source_report": relative(paths.email_packet_coverage),
                "evidence_needed": "Customer request, approval, proof/artwork, vendor/PO, tracking, invoice/payment clues.",
                "done_when": "Email thread auditor marks at least one order packet ready for walkthrough.",
                "blocks": "Open-order daily brief; PO/printer tracker; source-of-truth map",
            }
        )

    if order_rows and missing_count(order_rows):
        actions.append(
            {
                "priority": len(actions) + 1,
                "owner": "Ryan/Maclaine [CONFIRM]",
                "action": "Build one complete live order packet, preferably a printer/decorator order.",
                "source_report": relative(paths.order_packet_coverage),
                "evidence_needed": "Request, quote, approval, PO/vendor order, vendor confirmation, proof, tracking, invoice/payment.",
                "done_when": "Evidence auditor shows order-01 has all required artifacts present.",
                "blocks": "Gap validation; PO/printer tracker trust; first automation scope",
            }
        )

    high_po = [row for row in po_rows if clean(row.get("severity")).lower() == "high"]
    if high_po:
        actions.append(
            {
                "priority": len(actions) + 1,
                "owner": "Ryan/Maclaine [CONFIRM]",
                "action": "Replace placeholder PO/printer tracker rows with real order evidence.",
                "source_report": relative(paths.po_exceptions),
                "evidence_needed": "At least one real PO/vendor order plus confirmation/tracking/invoice flow.",
                "done_when": "PO exceptions no longer show `Missing live order packet` for the walkthrough order.",
                "blocks": clean(lead.get("automation")) or "PO/printer confirmation tracker",
            }
        )

    actions.append(
        {
            "priority": len(actions) + 1,
            "owner": "Kenny/Maclaine [CONFIRM]",
            "action": "Record customer/vendor personal-handling rules before drafting any follow-up automation.",
            "source_report": "context/import/backend-audit/2026-07-05/relationship-rules/",
            "evidence_needed": "Customers/vendors that require Kenny or Maclaine approval, relationship tone, or no automation.",
            "done_when": "Relationship-rules evidence exists and is reflected in tracker notes.",
            "blocks": "AR follow-up; reorder follow-up; vendor follow-up messages",
        }
    )

    return actions


def build_blocker_rows(paths: Paths) -> list[dict[str, object]]:
    health = build_health_rows(paths)
    blockers = []
    for row in health:
        status = clean(row.get("status")).lower()
        if any(term in status for term in ["not ready", "not mapped", "needs evidence", "no candidate"]):
            blockers.append(
                {
                    "blocker": row["area"],
                    "status": row["status"],
                    "metric": row["metric"],
                    "evidence": row["evidence"],
                    "required_to_clear": row["next_step"],
                }
            )
    return blockers


def overall_status(health: list[dict[str, object]]) -> str:
    statuses = " ".join(clean(row.get("status")).lower() for row in health)
    if "no candidate ready" in statuses or "not ready" in statuses or "not mapped" in statuses:
        return "Discovery active - not build-ready"
    if "needs evidence" in statuses:
        return "Needs evidence before build"
    return "Ready to scope first automation"


def write_markdown(
    path: Path,
    paths: Paths,
    health: list[dict[str, object]],
    actions: list[dict[str, object]],
    blockers: list[dict[str, object]],
    health_csv: Path,
    actions_csv: Path,
    blockers_csv: Path,
) -> None:
    lines = [
        "# Backend Readiness Dashboard",
        "",
        f"- Generated: {paths.report_date}",
        f"- Overall status: **{overall_status(health)}**",
        f"- Health CSV: `{relative(health_csv)}`",
        f"- Next actions CSV: `{relative(actions_csv)}`",
        f"- Blockers CSV: `{relative(blockers_csv)}`",
        "",
        "## Executive Readout",
        "",
        "Creative Alternatives has enough scaffolding to run the backend audit, but not enough live evidence yet to trust an automation. The current lead remains PO/printer confirmation tracking, with AR/reconciliation close behind, but all candidates are blocked by unanswered system questions and missing order/QuickBooks evidence.",
        "",
        "## System Health",
        "",
        "| Area | Status | Metric | Next step |",
        "|---|---|---|---|",
    ]
    for row in health:
        lines.append(
            "| {area} | {status} | {metric} | {next_step} |".format(
                area=row["area"],
                status=row["status"],
                metric=row["metric"],
                next_step=row["next_step"],
            )
        )

    lines.extend(
        [
            "",
            "## Next Actions",
            "",
            "| Priority | Owner | Action | Done when | Blocks |",
            "|---:|---|---|---|---|",
        ]
    )
    for row in actions[:12]:
        lines.append(
            "| {priority} | {owner} | {action} | {done_when} | {blocks} |".format(
                priority=row["priority"],
                owner=row["owner"],
                action=row["action"],
                done_when=row["done_when"],
                blocks=row["blocks"],
            )
        )

    lines.extend(
        [
            "",
            "## Active Blockers",
            "",
            "| Blocker | Status | Metric | Required to clear |",
            "|---|---|---|---|",
        ]
    )
    if blockers:
        for row in blockers:
            lines.append(
                "| {blocker} | {status} | {metric} | {required_to_clear} |".format(
                    blocker=row["blocker"],
                    status=row["status"],
                    metric=row["metric"],
                    required_to_clear=row["required_to_clear"],
                )
            )
    else:
        lines.append("| - | - | - | No active blockers detected by dashboard inputs. |")

    lines.extend(
        [
            "",
            "## Questions To Ask Next",
            "",
        ]
    )
    for idx, row in enumerate(top_unanswered_questions(read_csv(paths.answer_unanswered), limit=8), start=1):
        lines.append(f"{idx}. {clean(row.get('question'))}")

    lines.extend(
        [
            "",
            "## Guardrails",
            "",
            "- Do not send customer, vendor, money, or public-facing messages from these reports without approval.",
            "- Do not write back to QuickBooks in v1.",
            "- Treat missing evidence as a blocker, not permission to guess.",
            "- Kenny's relationship judgment overrides generated recommendations; update the evidence if that happens.",
            "",
        ]
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    today = date.today().isoformat()
    parser.add_argument("--date", default=today, help="Report date folder suffix, YYYY-MM-DD.")
    parser.add_argument(
        "--output-dir",
        default="",
        help="Folder to write dashboard outputs. Defaults to outputs/operations/backend-readiness-dashboard-YYYY-MM-DD.",
    )
    return parser.parse_args()


def paths_from_args(args: argparse.Namespace) -> Paths:
    report_date = args.date
    output_dir = Path(args.output_dir).resolve() if args.output_dir else DEFAULT_OUTPUT_ROOT / f"backend-readiness-dashboard-{report_date}"
    return Paths(
        report_date=report_date,
        output_dir=output_dir,
        answer_unanswered=DEFAULT_OUTPUT_ROOT / f"backend-answer-summary-{report_date}/unanswered-backend-questions.csv",
        automation_readiness=DEFAULT_OUTPUT_ROOT / f"backend-answer-summary-{report_date}/first-automation-readiness.csv",
        quickbooks_validation=DEFAULT_OUTPUT_ROOT / f"quickbooks-export-validation-{report_date}/quickbooks-export-validation.csv",
        email_packet_coverage=DEFAULT_OUTPUT_ROOT / f"email-thread-audit-{report_date}/email-thread-packet-coverage.csv",
        order_packet_coverage=DEFAULT_OUTPUT_ROOT / f"backend-evidence-audit-{report_date}/order-packet-coverage.csv",
        automation_recommendation=DEFAULT_OUTPUT_ROOT / f"backend-intake-analysis-{report_date}/backend-automation-recommendation.csv",
        po_exceptions=DEFAULT_OUTPUT_ROOT / f"po-printer-tracker-{report_date}/po-exceptions.csv",
    )


def main() -> None:
    args = parse_args()
    paths = paths_from_args(args)
    paths.output_dir.mkdir(parents=True, exist_ok=True)

    health = build_health_rows(paths)
    actions = build_action_rows(paths)
    blockers = build_blocker_rows(paths)

    health_csv = paths.output_dir / "backend-system-health.csv"
    actions_csv = paths.output_dir / "backend-next-actions.csv"
    blockers_csv = paths.output_dir / "backend-active-blockers.csv"
    report_path = paths.output_dir / "backend-readiness-dashboard.md"

    write_csv(health_csv, health, ["area", "status", "metric", "evidence", "next_step"])
    write_csv(actions_csv, actions, ["priority", "owner", "action", "source_report", "evidence_needed", "done_when", "blocks"])
    write_csv(blockers_csv, blockers, ["blocker", "status", "metric", "evidence", "required_to_clear"])
    write_markdown(report_path, paths, health, actions, blockers, health_csv, actions_csv, blockers_csv)

    print(f"Wrote {relative(report_path)}")
    print(f"Wrote {relative(actions_csv)}")
    print(f"Wrote {relative(blockers_csv)}")
    print(overall_status(health))


if __name__ == "__main__":
    main()
