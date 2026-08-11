#!/usr/bin/env python3
"""Compile backend intake answers into gaps, source map, and automation readiness."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path
import re


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_TEMPLATE = WORKSPACE_ROOT / "pillars/1-operations/templates/backend-answer-intake-template.csv"
DEFAULT_EVIDENCE_ROOT = WORKSPACE_ROOT / "context/import/backend-audit"
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"


KNOWN_OPEN_STATUSES = {"", "unknown", "needs evidence", "blocked", "[confirm]", "todo", "to do"}
ANSWERED_STATUSES = {"answered", "complete", "done", "confirmed"}


@dataclass(frozen=True)
class Candidate:
    name: str
    trigger_terms: tuple[str, ...]
    required_questions: tuple[str, ...]
    why: str


CANDIDATES = [
    Candidate(
        name="AR action worklist",
        trigger_terms=("ar", "collections", "past due", "open invoice", "cash", "owed"),
        required_questions=("Q001", "Q002", "Q014", "Q016", "Q024"),
        why="Best when past-due invoices and collection follow-up are the immediate cash bottleneck.",
    ),
    Candidate(
        name="Payment-to-invoice reconciliation exception report",
        trigger_terms=("payment", "matching", "reconciliation", "deposit", "invoice matching"),
        required_questions=("Q001", "Q002", "Q005", "Q024"),
        why="Best when payments/deposits are taking hours to match to invoices.",
    ),
    Candidate(
        name="PO/printer confirmation tracker",
        trigger_terms=("po", "printer", "vendor", "confirmation", "purchase order", "decorator"),
        required_questions=("Q010", "Q011", "Q012", "Q013", "Q021", "Q022"),
        why="Best when vendor/printer acceptance, production dates, and tracking are scattered.",
    ),
    Candidate(
        name="Open-order daily brief",
        trigger_terms=("open order", "stuck", "status", "active order", "where is", "tracking"),
        required_questions=("Q006", "Q009", "Q014", "Q017", "Q018", "Q020", "Q023"),
        why="Best when the team cannot quickly answer what is active, blocked, or due next.",
    ),
    Candidate(
        name="Reorder-due rescue list",
        trigger_terms=("reorder", "repeat", "seasonal", "same as last year", "dormant"),
        required_questions=("Q001", "Q002", "Q015", "Q016"),
        why="Best after the core cash/order-status fire is stable and repeat revenue needs a cadence.",
    ),
]


def clean(value: object) -> str:
    return str(value or "").strip()


def slug(value: object) -> str:
    text = clean(value).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


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


def is_answered(row: dict[str, str]) -> bool:
    answer = clean(row.get("answer"))
    status = clean(row.get("status")).lower()
    if status in ANSWERED_STATUSES and answer:
        return True
    if status in KNOWN_OPEN_STATUSES:
        return False
    if answer and status not in {"unknown", "needs evidence", "blocked"}:
        return True
    return False


def status_bucket(row: dict[str, str]) -> str:
    status = clean(row.get("status")).lower()
    if is_answered(row):
        return "Answered"
    if status == "blocked":
        return "Blocked"
    if status == "needs evidence":
        return "Needs evidence"
    return "Unknown"


def unanswered_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    out = []
    for row in rows:
        if is_answered(row):
            continue
        out.append(
            {
                "question_id": clean(row.get("question_id")),
                "area": clean(row.get("area")),
                "workflow_stage": clean(row.get("workflow_stage")),
                "status": status_bucket(row),
                "owner": clean(row.get("owner")),
                "question": clean(row.get("question")),
                "evidence_path": clean(row.get("evidence_path")),
                "gap_if_unclear": clean(row.get("gap_if_unclear")),
                "automation_implication": clean(row.get("automation_implication")),
                "next_step": next_step_for_question(row),
            }
        )
    return out


def next_step_for_question(row: dict[str, str]) -> str:
    evidence = clean(row.get("evidence_path"))
    if evidence:
        return f"Answer this and attach supporting evidence under `{evidence}`."
    return "Answer this during the next backend session and add evidence if available."


def source_map_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    seen: set[str] = set()
    out: list[dict[str, object]] = []
    for row in rows:
        stage = clean(row.get("workflow_stage"))
        if not stage or stage in seen:
            continue
        seen.add(stage)
        area_rows = [r for r in rows if clean(r.get("workflow_stage")) == stage]
        answered = [r for r in area_rows if is_answered(r)]
        if answered:
            current_tool = "; ".join(sorted({clean(r.get("source_system")) for r in answered if clean(r.get("source_system"))})) or "[CONFIRM]"
            evidence = "; ".join(clean(r.get("evidence_path")) for r in answered if clean(r.get("evidence_path")))
            reliability = "Needs evidence" if any(clean(r.get("status")).lower() == "needs evidence" for r in answered) else "Partially mapped"
            next_action = "Validate against one real order packet."
        else:
            current_tool = ""
            evidence = ""
            reliability = "Unknown"
            next_action = "Answer source-of-truth question and attach evidence."
        out.append(
            {
                "system_area": clean(area_rows[0].get("area")),
                "data_or_workflow": stage,
                "current_tool": current_tool,
                "current_source_of_truth": current_tool or "Unknown",
                "backup_source": "",
                "owner": "; ".join(sorted({clean(r.get("owner")) for r in area_rows if clean(r.get("owner"))})),
                "users": "",
                "how_updated": "",
                "update_frequency": "",
                "reliability": reliability,
                "known_conflicts": "; ".join(clean(r.get("gap_if_unclear")) for r in area_rows if not is_answered(r)),
                "evidence_link_or_file": evidence,
                "next_action": next_action,
                "notes": "; ".join(clean(r.get("automation_implication")) for r in area_rows if clean(r.get("automation_implication"))),
            }
        )
    return out


def impact_tag(area: str, stage: str) -> str:
    text = f"{area} {stage}".lower()
    tags = []
    if any(term in text for term in ["payment", "invoice", "quickbooks", "vendor costs", "reconciliation"]):
        tags.append("Cash risk")
    if any(term in text for term in ["email", "order", "po", "proof", "shipping", "vendor", "printer"]):
        tags.append("Customer risk")
    tags.append("Manual time")
    return "; ".join(dict.fromkeys(tags))


def gap_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    out: list[dict[str, object]] = []
    for idx, row in enumerate((r for r in rows if not is_answered(r)), start=1):
        qid = clean(row.get("question_id")) or f"Q{idx:03d}"
        area = clean(row.get("area"))
        stage = clean(row.get("workflow_stage"))
        out.append(
            {
                "gap_id": f"GAP-{qid.replace('Q', '').zfill(3)}",
                "gap_title": clean(row.get("gap_if_unclear")) or f"Unanswered: {clean(row.get('question'))}",
                "workflow_area": area,
                "where_it_happens": stage,
                "current_workaround": "Unknown / person-dependent [CONFIRM]",
                "impact_tag": impact_tag(area, stage),
                "impact_description": clean(row.get("automation_implication")),
                "frequency": "[CONFIRM]",
                "owner": clean(row.get("owner")),
                "current_systems_involved": clean(row.get("source_system")) or "[CONFIRM]",
                "evidence_link_or_example": clean(row.get("evidence_path")),
                "revenue_or_cash_risk": "[CONFIRM]",
                "time_cost_estimate": "[CONFIRM]",
                "fix_idea": fix_idea(row),
                "priority": "High" if area in {"QuickBooks", "Payments", "Purchase orders", "Open orders"} else "Medium",
                "ease": "[CONFIRM]",
                "next_step": next_step_for_question(row),
                "status": status_bucket(row),
            }
        )
    return out


def fix_idea(row: dict[str, str]) -> str:
    area = clean(row.get("area")).lower()
    stage = clean(row.get("workflow_stage")).lower()
    if "quickbooks" in area or "payment" in area:
        return "Validate QuickBooks export and map the field into the audit packet."
    if "email" in area:
        return "Save thread evidence and define shared inbox/label or order packet rule."
    if "purchase" in area or "po" in stage or "vendor" in stage:
        return "Map PO/vendor confirmation path and add it to the PO tracker."
    if "proof" in area:
        return "Add approved-proof location and version status to the order packet."
    if "spreadsheet" in area:
        return "Inventory spreadsheet and decide keep, clean, replace, or ignore."
    if "order evidence" in area:
        return "Collect missing live order packet evidence."
    return "Answer and validate with evidence."


def candidate_readiness(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    by_id = {clean(row.get("question_id")): row for row in rows}
    free_text = " ".join(clean(row.get("answer")).lower() for row in rows)
    out: list[dict[str, object]] = []
    for candidate in CANDIDATES:
        missing = [qid for qid in candidate.required_questions if not is_answered(by_id.get(qid, {}))]
        trigger_hits = [term for term in candidate.trigger_terms if term in free_text]
        if not missing and trigger_hits:
            readiness = "Ready to scope"
        elif not missing:
            readiness = "Inputs present, needs priority confirmation"
        elif trigger_hits:
            readiness = "Likely priority, missing inputs"
        else:
            readiness = "Needs answers"
        out.append(
            {
                "automation_name": candidate.name,
                "readiness": readiness,
                "missing_question_ids": "; ".join(missing),
                "trigger_terms_found": "; ".join(trigger_hits),
                "why": candidate.why,
                "next_step": "Collect missing answers/evidence." if missing else "Confirm this is the first build and write the build brief.",
            }
        )
    return out


def completion_metrics(rows: list[dict[str, str]]) -> dict[str, int]:
    total = len(rows)
    answered = sum(1 for row in rows if is_answered(row))
    evidence_missing = sum(1 for row in rows if not clean(row.get("evidence_path")) and not is_answered(row))
    return {
        "total_questions": total,
        "answered": answered,
        "open": total - answered,
        "unanswered_without_evidence_path": evidence_missing,
    }


def write_markdown(
    path: Path,
    input_path: Path,
    rows: list[dict[str, str]],
    unanswered: list[dict[str, object]],
    candidates: list[dict[str, object]],
    source_csv: Path,
    gap_csv: Path,
    unanswered_csv: Path,
    candidate_csv: Path,
) -> None:
    metrics = completion_metrics(rows)
    lines = [
        "# Backend Answer Summary",
        "",
        f"- Input file: `{relative(input_path)}`",
        f"- Questions answered: **{metrics['answered']} / {metrics['total_questions']}**",
        f"- Open questions: **{metrics['open']}**",
        f"- Source map CSV: `{relative(source_csv)}`",
        f"- Gap register CSV: `{relative(gap_csv)}`",
        f"- Unanswered questions CSV: `{relative(unanswered_csv)}`",
        f"- Automation readiness CSV: `{relative(candidate_csv)}`",
        "",
        "## Operator Readout",
        "",
    ]
    if metrics["answered"] == 0:
        lines.append("No backend answers have been captured yet. Use the intake CSV during the next Ryan/Maclaine/Kenny session.")
    elif metrics["open"]:
        lines.append("Some backend answers are captured, but the source-of-truth map is not complete enough to declare the backend mapped.")
    else:
        lines.append("All intake questions have answers. Validate them against real order packets before treating the map as operational truth.")

    lines.extend(
        [
            "",
            "## Highest Priority Open Questions",
            "",
            "| Question ID | Area | Status | Question | Next step |",
            "|---|---|---|---|---|",
        ]
    )
    for row in unanswered[:10]:
        lines.append(
            "| {question_id} | {area} | {status} | {question} | {next_step} |".format(
                question_id=row["question_id"],
                area=row["area"],
                status=row["status"],
                question=row["question"],
                next_step=row["next_step"],
            )
        )
    if not unanswered:
        lines.append("| - | - | - | No open questions in the intake file. | Validate with live evidence. |")

    lines.extend(
        [
            "",
            "## First Automation Readiness",
            "",
            "| Candidate | Readiness | Missing question IDs | Next step |",
            "|---|---|---|---|",
        ]
    )
    for row in candidates:
        lines.append(
            "| {automation_name} | {readiness} | {missing} | {next_step} |".format(
                automation_name=row["automation_name"],
                readiness=row["readiness"],
                missing=row["missing_question_ids"] or "-",
                next_step=row["next_step"],
            )
        )

    lines.extend(
        [
            "",
            "## How To Use This",
            "",
            "1. Fill `answer`, `status`, `source_system`, and `evidence_path` in the intake CSV.",
            "2. Rerun the compiler.",
            "3. Copy confirmed rows from the generated source map and gap register into the operating workbook or command center.",
            "4. Pick the first automation only after the required questions and evidence are present.",
            "",
            "## Guardrails",
            "",
            "- Do not automate from an answer alone; validate against at least one real order packet.",
            "- Customer, vendor, money, and public-facing actions still require human approval.",
            "- If Kenny's judgment conflicts with the generated recommendation, update the evidence and let Kenny's relationship context win.",
            "",
        ]
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def default_input_path() -> Path:
    today_session = DEFAULT_EVIDENCE_ROOT / date.today().isoformat() / "backend-answer-intake.csv"
    if today_session.exists():
        return today_session
    dated_sessions = sorted(DEFAULT_EVIDENCE_ROOT.glob("????-??-??/backend-answer-intake.csv"))
    if dated_sessions:
        return dated_sessions[-1]
    return DEFAULT_TEMPLATE


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        default=str(default_input_path()),
        help="Filled backend answer intake CSV.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_ROOT / f"backend-answer-summary-{date.today().isoformat()}"),
        help="Folder to write compiled outputs.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_path = Path(args.input).resolve()
    output_dir = Path(args.output_dir).resolve()
    rows = read_csv(input_path)

    unanswered = unanswered_rows(rows)
    sources = source_map_rows(rows)
    gaps = gap_rows(rows)
    candidates = candidate_readiness(rows)

    source_csv = output_dir / "system-source-map-from-answers.csv"
    gap_csv = output_dir / "gap-register-from-answers.csv"
    unanswered_csv = output_dir / "unanswered-backend-questions.csv"
    candidate_csv = output_dir / "first-automation-readiness.csv"
    report_path = output_dir / "backend-answer-summary.md"

    write_csv(
        source_csv,
        sources,
        [
            "system_area",
            "data_or_workflow",
            "current_tool",
            "current_source_of_truth",
            "backup_source",
            "owner",
            "users",
            "how_updated",
            "update_frequency",
            "reliability",
            "known_conflicts",
            "evidence_link_or_file",
            "next_action",
            "notes",
        ],
    )
    write_csv(
        gap_csv,
        gaps,
        [
            "gap_id",
            "gap_title",
            "workflow_area",
            "where_it_happens",
            "current_workaround",
            "impact_tag",
            "impact_description",
            "frequency",
            "owner",
            "current_systems_involved",
            "evidence_link_or_example",
            "revenue_or_cash_risk",
            "time_cost_estimate",
            "fix_idea",
            "priority",
            "ease",
            "next_step",
            "status",
        ],
    )
    write_csv(
        unanswered_csv,
        unanswered,
        [
            "question_id",
            "area",
            "workflow_stage",
            "status",
            "owner",
            "question",
            "evidence_path",
            "gap_if_unclear",
            "automation_implication",
            "next_step",
        ],
    )
    write_csv(
        candidate_csv,
        candidates,
        [
            "automation_name",
            "readiness",
            "missing_question_ids",
            "trigger_terms_found",
            "why",
            "next_step",
        ],
    )
    write_markdown(report_path, input_path, rows, unanswered, candidates, source_csv, gap_csv, unanswered_csv, candidate_csv)

    metrics = completion_metrics(rows)
    print(f"Wrote {relative(report_path)}")
    print(f"Wrote {relative(unanswered_csv)}")
    print(f"Wrote {relative(gap_csv)}")
    print(f"Answered {metrics['answered']} / {metrics['total_questions']} questions")


if __name__ == "__main__":
    main()
