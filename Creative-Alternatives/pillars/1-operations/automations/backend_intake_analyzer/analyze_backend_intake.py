#!/usr/bin/env python3
"""
Analyze Creative Alternatives backend intake CSVs and recommend the first safe automation.

This is intentionally conservative:
- no customer/vendor/money-facing actions
- no QuickBooks writes
- missing evidence is surfaced as a blocker, not guessed around
"""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
import re
from typing import Iterable


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]


WORD_SCORE = {
    "critical": 5,
    "high": 5,
    "medium": 3,
    "med": 3,
    "low": 1,
    "easy": 5,
    "hard": 1,
    "unknown": 2,
    "[confirm]": 2,
    "": 0,
}


@dataclass
class Candidate:
    key: str
    name: str
    output_path: str
    keywords: list[str]
    required_evidence: list[str]
    score: float = 0
    matched_gaps: list[str] = field(default_factory=list)
    missing_evidence: list[str] = field(default_factory=list)

    @property
    def readiness(self) -> str:
        if not self.missing_evidence:
            return "Ready for v1"
        if self.score >= 20 and len(self.missing_evidence) <= 2:
            return "High-priority, needs evidence"
        return "Needs evidence"


CANDIDATES = [
    Candidate(
        key="ar_worklist",
        name="AR action worklist",
        output_path="outputs/operations/ar-worklist-YYYY-MM-DD/",
        keywords=[
            "ar",
            "accounts receivable",
            "open invoice",
            "past due",
            "overdue",
            "collections",
            "cash",
            "payment visibility",
        ],
        required_evidence=[
            "A/R Aging Summary",
            "Open invoice detail",
            "Customer relationship notes for A-tier accounts",
            "Current AR owner/cadence",
        ],
    ),
    Candidate(
        key="reconciliation",
        name="Payment-to-invoice reconciliation exception report",
        output_path="outputs/operations/reconciliation-YYYY-MM-DD/",
        keywords=[
            "reconciliation",
            "payment matching",
            "payment-to-invoice",
            "deposit",
            "unapplied",
            "partial payment",
            "duplicate",
            "8-hour",
        ],
        required_evidence=[
            "Invoice detail for one representative month",
            "Payments/deposits detail for the same month",
            "Examples of known matching issues",
        ],
    ),
    Candidate(
        key="po_printer_tracker",
        name="PO/printer confirmation tracker",
        output_path="outputs/operations/po-printer-tracker-YYYY-MM-DD/",
        keywords=[
            "po",
            "purchase order",
            "printer",
            "vendor",
            "supplier",
            "decorator",
            "confirmation",
            "tracking",
            "vendor invoice",
            "art handoff",
        ],
        required_evidence=[
            "Five printer/decorator order packets",
            "Sample PO or vendor order",
            "Sample vendor confirmation/tracking/invoice flow",
            "Top vendor/printer relationship rules",
        ],
    ),
    Candidate(
        key="open_order_brief",
        name="Open-order daily brief",
        output_path="outputs/operations/open-order-brief-YYYY-MM-DD.md",
        keywords=[
            "open order",
            "order tracking",
            "job id",
            "status",
            "stuck",
            "active order",
            "next action",
            "workflow map",
        ],
        required_evidence=[
            "Current open-order source",
            "Five active orders with next action and owner",
            "Agreed status vocabulary",
            "Proof/PO/shipping status sources",
        ],
    ),
    Candidate(
        key="reorder_rescue",
        name="Reorder-due rescue list",
        output_path="outputs/operations/reorder-rescue-YYYY-MM-DD/",
        keywords=[
            "reorder",
            "repeat customer",
            "seasonal",
            "dormant",
            "same as last year",
            "customer follow-up",
        ],
        required_evidence=[
            "Sales by customer history",
            "Customer contact list",
            "Prior order detail or seasonality notes",
            "Personal-handling customer rules",
        ],
    ),
]


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def find_first(input_dir: Path, names: Iterable[str]) -> Path | None:
    for name in names:
        p = input_dir / name
        if p.exists():
            return p
    return None


def normalize(text: object) -> str:
    return str(text or "").strip()


def word_score(value: object) -> float:
    text = normalize(value).lower()
    if text in WORD_SCORE:
        return WORD_SCORE[text]
    match = re.search(r"\d+(?:\.\d+)?", text)
    if match:
        return float(match.group(0))
    if "[confirm]" in text:
        return 2
    return 0


def gap_score(row: dict[str, str]) -> float:
    explicit = word_score(row.get("priority_score"))
    if explicit:
        return explicit

    numeric_parts = [
        word_score(row.get("cash_risk") or row.get("revenue_or_cash_risk")),
        word_score(row.get("customer_risk")),
        word_score(row.get("manual_time")),
        word_score(row.get("frequency")),
    ]
    ease = word_score(row.get("ease") or row.get("ease_to_fix"))
    if any(numeric_parts) and ease:
        return sum(numeric_parts) * ease

    priority = word_score(row.get("priority"))
    if priority and ease:
        return priority * ease
    if priority:
        return priority
    return 1


def gap_text(row: dict[str, str]) -> str:
    fields = [
        "gap_id",
        "gap_title",
        "workflow_area",
        "where_it_happens",
        "current_workaround",
        "impact_tag",
        "impact_description",
        "fix_idea",
        "next_step",
        "notes",
    ]
    return " ".join(normalize(row.get(f)) for f in fields).lower()


def keyword_in_text(keyword: str, text: str) -> bool:
    if len(keyword) <= 3:
        return re.search(rf"\b{re.escape(keyword)}\b", text) is not None
    return keyword in text


def match_candidates(row: dict[str, str], candidates: list[Candidate]) -> list[Candidate]:
    text = gap_text(row)
    matches = []
    for candidate in candidates:
        if any(keyword_in_text(keyword, text) for keyword in candidate.keywords):
            matches.append(candidate)
    return matches


def evidence_files(root: Path, input_dir: Path) -> set[str]:
    files = set()
    search_dirs = [
        input_dir,
        root / "context/import",
        root / "context/import/backend-audit",
    ]
    for directory in search_dirs:
        if directory.exists():
            for p in directory.rglob("*"):
                if p.is_file():
                    files.add(p.name.lower())
                    files.add(str(p.relative_to(root)).lower() if p.is_relative_to(root) else str(p).lower())
    return files


def evidence_present(label: str, files: set[str]) -> bool:
    text = label.lower()
    checks = {
        "a/r aging summary": ["qb_ar_aging", "ar_aging", "a-r aging", "ar aging"],
        "open invoice detail": ["open_invoice", "open-invoice", "invoice_detail", "invoice-detail"],
        "customer relationship notes for a-tier accounts": ["relationship", "a-tier", "customer_notes", "customer-notes"],
        "current ar owner/cadence": ["ar_owner", "collections", "cadence"],
        "invoice detail for one representative month": ["invoice_detail", "invoice-detail"],
        "payments/deposits detail for the same month": ["payment", "deposit"],
        "examples of known matching issues": ["payment-match", "reconciliation", "matching_issue"],
        "five printer/decorator order packets": ["order-01", "five_orders", "five-orders", "printer"],
        "sample po or vendor order": ["po_", "purchase_order", "purchase-order", "vendor_order"],
        "sample vendor confirmation/tracking/invoice flow": ["vendor-confirmation", "tracking", "vendor_invoice"],
        "top vendor/printer relationship rules": ["vendor-master", "vendor_relationship", "relationship"],
        "current open-order source": ["open-order", "open_order"],
        "five active orders with next action and owner": ["open-order", "five_orders", "five-orders"],
        "agreed status vocabulary": ["status", "vocabulary", "backend-ops-sop"],
        "proof/po/shipping status sources": ["proof", "po_", "shipping", "tracking"],
        "sales by customer history": ["qb_sales_by_customer", "sales_by_customer"],
        "customer contact list": ["qb_customer_contacts", "customer_contacts"],
        "prior order detail or seasonality notes": ["prior_order", "seasonality", "reorder"],
        "personal-handling customer rules": ["personal", "relationship", "a-tier"],
    }
    patterns = checks.get(text, [text.replace(" ", "_"), text.replace(" ", "-")])
    return any(any(pattern in f for f in files) for pattern in patterns)


def reset_candidates() -> list[Candidate]:
    return [
        Candidate(
            key=c.key,
            name=c.name,
            output_path=c.output_path,
            keywords=list(c.keywords),
            required_evidence=list(c.required_evidence),
        )
        for c in CANDIDATES
    ]


def analyze(input_dir: Path, output_dir: Path) -> None:
    candidates = reset_candidates()
    candidate_by_key = {c.key: c for c in candidates}

    gap_path = find_first(
        input_dir,
        [
            "backend-gap-register.csv",
            "backend-gap-register-starter.csv",
            "backend-gap-register-template.csv",
        ],
    )
    backlog_path = find_first(
        input_dir,
        [
            "automation-backlog.csv",
            "automation-backlog-template.csv",
        ],
    )

    gap_rows = read_csv(gap_path) if gap_path else []
    scored_gaps: list[dict[str, str]] = []
    for idx, row in enumerate(gap_rows, start=1):
        title = normalize(row.get("gap_title") or row.get("Gap") or row.get("gap"))
        if not title:
            continue
        score = gap_score(row)
        matched = match_candidates(row, candidates)
        if not matched:
            text = gap_text(row)
            if "quickbooks" in text or "data layer" in text:
                matched = [candidate_by_key["open_order_brief"]]
        for candidate in matched:
            candidate.score += score
            candidate.matched_gaps.append(normalize(row.get("gap_id") or f"GAP-{idx:03d}"))
        scored_gaps.append(
            {
                "gap_id": normalize(row.get("gap_id") or f"GAP-{idx:03d}"),
                "gap_title": title,
                "workflow_area": normalize(row.get("workflow_area")),
                "score": f"{score:.1f}",
                "matched_automations": "; ".join(c.name for c in matched) if matched else "",
                "status": normalize(row.get("status")),
                "next_step": normalize(row.get("next_step")),
            }
        )

    if backlog_path:
        for row in read_csv(backlog_path):
            name = normalize(row.get("automation_name")).lower()
            impact = word_score(row.get("impact_score") or row.get("priority_score") or row.get("priority"))
            if not name:
                continue
            for candidate in candidates:
                if candidate.name.lower() == name or candidate.key.replace("_", " ") in name:
                    candidate.score += impact

    files = evidence_files(WORKSPACE_ROOT, input_dir)
    for candidate in candidates:
        candidate.missing_evidence = [
            item for item in candidate.required_evidence if not evidence_present(item, files)
        ]

    ranked = sorted(candidates, key=lambda c: (c.score, -len(c.missing_evidence)), reverse=True)
    build_ready = next((c for c in ranked if c.score > 0 and not c.missing_evidence), None)
    evidence_lead = ranked[0] if ranked and ranked[0].score > 0 else None

    output_dir.mkdir(parents=True, exist_ok=True)
    write_gap_scores(output_dir / "backend-gap-scores.csv", scored_gaps)
    write_recommendations(output_dir / "backend-automation-recommendation.csv", ranked)
    write_missing_evidence(output_dir / "missing-evidence-checklist.md", ranked)
    write_report(
        output_dir / "backend-intake-analysis.md",
        input_dir=input_dir,
        gap_path=gap_path,
        backlog_path=backlog_path,
        scored_gaps=scored_gaps,
        ranked=ranked,
        build_ready=build_ready,
        evidence_lead=evidence_lead,
    )


def write_gap_scores(path: Path, rows: list[dict[str, str]]) -> None:
    fields = [
        "gap_id",
        "gap_title",
        "workflow_area",
        "score",
        "matched_automations",
        "status",
        "next_step",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_recommendations(path: Path, candidates: list[Candidate]) -> None:
    fields = [
        "rank",
        "automation",
        "score",
        "readiness",
        "matched_gaps",
        "missing_evidence_count",
        "missing_evidence",
        "target_output",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for idx, candidate in enumerate(candidates, start=1):
            writer.writerow(
                {
                    "rank": idx,
                    "automation": candidate.name,
                    "score": f"{candidate.score:.1f}",
                    "readiness": candidate.readiness,
                    "matched_gaps": "; ".join(candidate.matched_gaps),
                    "missing_evidence_count": len(candidate.missing_evidence),
                    "missing_evidence": "; ".join(candidate.missing_evidence),
                    "target_output": candidate.output_path,
                }
            )


def write_missing_evidence(path: Path, candidates: list[Candidate]) -> None:
    lines = [
        "# Missing Evidence Checklist",
        "",
        "Use this to unblock the first backend automation. Missing evidence means the build may be useful internally, but should not drive customer/vendor/money-facing action yet.",
        "",
    ]
    for candidate in candidates:
        lines.append(f"## {candidate.name}")
        if candidate.missing_evidence:
            for item in candidate.missing_evidence:
                lines.append(f"- [ ] {item}")
        else:
            lines.append("- [x] Minimum evidence found")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_report(
    path: Path,
    input_dir: Path,
    gap_path: Path | None,
    backlog_path: Path | None,
    scored_gaps: list[dict[str, str]],
    ranked: list[Candidate],
    build_ready: Candidate | None,
    evidence_lead: Candidate | None,
) -> None:
    lines = [
        "# Backend Intake Analysis",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        "## Inputs",
        "",
        f"- Input folder: `{input_dir}`",
        f"- Gap register: `{gap_path}`" if gap_path else "- Gap register: missing",
        f"- Automation backlog: `{backlog_path}`" if backlog_path else "- Automation backlog: missing",
        "",
        "## Recommendation",
        "",
    ]
    if build_ready:
        lines.extend(
            [
                f"Build-ready recommendation: **{build_ready.name}**",
                "",
                f"- Evidence score: **{build_ready.score:.1f}**",
                f"- Readiness: **{build_ready.readiness}**",
                f"- Target output: `{build_ready.output_path}`",
                f"- Matched gaps: {', '.join(build_ready.matched_gaps) or 'none'}",
                "",
            ]
        )
    elif evidence_lead:
        lines.extend(
            [
                "No build-ready automation yet.",
                "",
                f"Highest-scoring lead: **{evidence_lead.name}**",
                "",
                f"- Evidence score: **{evidence_lead.score:.1f}**",
                f"- Readiness: **{evidence_lead.readiness}**",
                f"- Target output: `{evidence_lead.output_path}`",
                f"- Matched gaps: {', '.join(evidence_lead.matched_gaps) or 'none'}",
                "",
                "Missing evidence before this can be trusted:",
                "",
            ]
        )
        for item in evidence_lead.missing_evidence:
            lines.append(f"- {item}")
        lines.append("")
    else:
        lines.extend(
            [
                "No automation recommendation yet.",
                "",
                "Reason: no scored gaps or automation backlog items were found. Fill the intake workbook or export the Gap Register tab to CSV, then rerun.",
                "",
            ]
        )

    lines.extend(
        [
            "## Ranked Automations",
            "",
            "| Rank | Automation | Score | Readiness | Missing Evidence |",
            "|---:|---|---:|---|---|",
        ]
    )
    for idx, candidate in enumerate(ranked, start=1):
        missing = ", ".join(candidate.missing_evidence) if candidate.missing_evidence else "None"
        lines.append(
            f"| {idx} | {candidate.name} | {candidate.score:.1f} | {candidate.readiness} | {missing} |"
        )

    lines.extend(
        [
            "",
            "## Top Scored Gaps",
            "",
            "| Gap | Score | Automation Match | Next Step |",
            "|---|---:|---|---|",
        ]
    )
    for row in sorted(scored_gaps, key=lambda r: float(r["score"]), reverse=True)[:10]:
        lines.append(
            f"| {row['gap_id']} — {row['gap_title']} | {row['score']} | {row['matched_automations']} | {row['next_step']} |"
        )

    lines.extend(
        [
            "",
            "## Guardrails",
            "",
            "- No customer/vendor/money-facing action from this report without Ryan/Kenny/Maclaine approval.",
            "- No QuickBooks writes in v1.",
            "- Treat missing evidence as a blocker for external action, not as permission to guess.",
            "- If the recommendation conflicts with Kenny's relationship judgment, Kenny wins and the gap map gets updated.",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def default_input_dir() -> Path:
    candidates = sorted((WORKSPACE_ROOT / "outputs/operations").glob("backend-audit-*"))
    if candidates:
        return candidates[-1]
    return WORKSPACE_ROOT / "pillars/1-operations/templates"


def parse_args() -> argparse.Namespace:
    today = date.today().isoformat()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=default_input_dir(),
        help="Folder containing exported intake CSVs or generated backend audit starter CSVs.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=WORKSPACE_ROOT / f"outputs/operations/backend-intake-analysis-{today}",
        help="Folder where analysis outputs should be written.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_dir = args.input_dir
    output_dir = args.output_dir
    if not input_dir.is_absolute():
        input_dir = WORKSPACE_ROOT / input_dir
    if not output_dir.is_absolute():
        output_dir = WORKSPACE_ROOT / output_dir
    analyze(input_dir=input_dir, output_dir=output_dir)
    print(f"Wrote backend intake analysis to {output_dir}")


if __name__ == "__main__":
    main()
