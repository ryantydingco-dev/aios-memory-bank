#!/usr/bin/env python3
"""Validate QuickBooks export presence and CSV headers for backend automation."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path
import re


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_EVIDENCE_ROOT = WORKSPACE_ROOT / "context/import/backend-audit"
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"
EXCEL_SUFFIXES = {".xlsx", ".xls"}


@dataclass(frozen=True)
class ColumnGroup:
    name: str
    aliases: tuple[str, ...]
    required: bool = True


@dataclass(frozen=True)
class ExportSpec:
    report: str
    filename: str
    purpose: str
    groups: tuple[ColumnGroup, ...]


EXPORT_SPECS = [
    ExportSpec(
        report="Invoice Detail",
        filename="qb_invoice_detail.csv",
        purpose="AR worklist and payment matching.",
        groups=(
            ColumnGroup("customer", ("customer", "customer name", "name", "customer full name")),
            ColumnGroup("invoice number", ("invoice number", "invoice no", "invoice num", "invoice #", "doc number", "transaction no", "num")),
            ColumnGroup("invoice date", ("invoice date", "date", "transaction date")),
            ColumnGroup("due date", ("due date",)),
            ColumnGroup("amount", ("amount", "invoice amount", "total", "original amount")),
            ColumnGroup("balance", ("balance", "open balance", "amount open", "remaining balance")),
            ColumnGroup("status", ("status", "paid status", "open status")),
            ColumnGroup("memo/job/order reference", ("memo", "job", "project", "order", "customer job", "custom field", "reference"), required=False),
        ),
    ),
    ExportSpec(
        report="Payments Received / Deposits Detail",
        filename="qb_payments_deposits_detail.csv",
        purpose="Payment-to-invoice reconciliation.",
        groups=(
            ColumnGroup("customer/source", ("customer", "received from", "name", "source", "payer")),
            ColumnGroup("payment date", ("payment date", "date", "deposit date", "transaction date")),
            ColumnGroup("amount", ("amount", "payment", "payment amount", "deposit amount", "total")),
            ColumnGroup("reference/check/ACH note", ("reference no", "ref no", "check no", "check number", "payment method", "memo", "ach"), required=False),
            ColumnGroup("linked invoice", ("invoice", "invoice no", "invoice number", "linked transaction", "applied to", "applied transaction"), required=False),
        ),
    ),
    ExportSpec(
        report="Open Invoices",
        filename="qb_open_invoices.csv",
        purpose="Daily AR action list.",
        groups=(
            ColumnGroup("customer", ("customer", "customer name", "name")),
            ColumnGroup("invoice number", ("invoice number", "invoice no", "invoice num", "invoice #", "doc number", "transaction no", "num")),
            ColumnGroup("date", ("date", "invoice date", "transaction date")),
            ColumnGroup("due date", ("due date",)),
            ColumnGroup("amount", ("amount", "invoice amount", "total", "original amount")),
            ColumnGroup("balance", ("balance", "open balance", "amount open", "remaining balance")),
            ColumnGroup("aging bucket", ("aging bucket", "aging", "age", "days past due", "past due")),
        ),
    ),
    ExportSpec(
        report="Open Purchase Orders",
        filename="qb_open_purchase_orders.csv",
        purpose="PO/printer tracker.",
        groups=(
            ColumnGroup("PO number", ("po number", "po no", "purchase order number", "purchase order no", "purchase order #", "num")),
            ColumnGroup("vendor", ("vendor", "vendor name", "supplier", "name")),
            ColumnGroup("customer/job reference", ("customer job", "customer", "job", "project", "memo", "reference", "customer name")),
            ColumnGroup("amount", ("amount", "total", "po amount", "purchase order amount")),
            ColumnGroup("date", ("date", "po date", "purchase order date", "transaction date")),
            ColumnGroup("status", ("status", "open status", "po status")),
        ),
    ),
    ExportSpec(
        report="Unpaid Bills / Vendor Bills",
        filename="qb_unpaid_bills_vendor_bills.csv",
        purpose="Vendor cost and margin matching.",
        groups=(
            ColumnGroup("vendor", ("vendor", "vendor name", "supplier", "name")),
            ColumnGroup("bill number", ("bill number", "bill no", "bill #", "reference no", "ref no", "doc number", "num")),
            ColumnGroup("date", ("date", "bill date", "transaction date")),
            ColumnGroup("amount", ("amount", "bill amount", "total", "open balance")),
            ColumnGroup("status", ("status", "paid status", "open status")),
            ColumnGroup("linked customer/job", ("customer job", "customer", "job", "project", "memo", "reference", "customer name"), required=False),
        ),
    ),
    ExportSpec(
        report="Estimates / Quotes",
        filename="qb_estimates_quotes.csv",
        purpose="Quote-to-order mapping.",
        groups=(
            ColumnGroup("estimate number", ("estimate number", "estimate no", "estimate #", "quote number", "quote no", "quote #", "doc number", "num")),
            ColumnGroup("customer", ("customer", "customer name", "name")),
            ColumnGroup("date", ("date", "estimate date", "quote date", "transaction date")),
            ColumnGroup("amount", ("amount", "estimate amount", "quote amount", "total")),
            ColumnGroup("status", ("status", "estimate status", "quote status")),
            ColumnGroup("converted invoice", ("converted invoice", "invoice", "invoice number", "linked transaction", "accepted", "converted"), required=False),
        ),
    ),
]


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def normalize_header(value: object) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def alias_matches_header(alias: str, header: str) -> bool:
    alias_norm = normalize_header(alias)
    if not alias_norm or not header:
        return False
    if alias_norm == header:
        return True
    if len(alias_norm) <= 3:
        return False
    return alias_norm in header or (len(header) > 3 and header in alias_norm)


def group_found(group: ColumnGroup, headers: list[str]) -> bool:
    normalized_headers = [normalize_header(header) for header in headers]
    return any(
        alias_matches_header(alias, header)
        for alias in group.aliases
        for header in normalized_headers
    )


def find_export_file(quickbooks_dir: Path, filename: str) -> Path | None:
    expected = quickbooks_dir / filename
    if expected.exists():
        return expected

    stem = expected.stem.lower()
    for suffix in [".csv", ".xlsx", ".xls"]:
        alternate = quickbooks_dir / f"{stem}{suffix}"
        if alternate.exists():
            return alternate

    likely = sorted(
        path
        for path in quickbooks_dir.glob("*")
        if path.is_file()
        and path.suffix.lower() in {".csv", ".xlsx", ".xls"}
        and stem.replace("qb_", "") in path.stem.lower().replace("-", "_").replace(" ", "_")
    )
    return likely[0] if likely else None


def read_csv_headers(path: Path) -> tuple[list[str], int, str]:
    for encoding in ("utf-8-sig", "latin-1"):
        try:
            with path.open(newline="", encoding=encoding) as f:
                reader = csv.reader(f)
                rows = list(reader)
            break
        except UnicodeDecodeError:
            continue
    else:
        return [], 0, "Could not decode CSV."

    if not rows:
        return [], 0, "CSV is empty."

    header_idx = 0
    while header_idx < len(rows) and not any(cell.strip() for cell in rows[header_idx]):
        header_idx += 1

    if header_idx >= len(rows):
        return [], 0, "CSV has no non-empty header row."

    headers = [cell.strip() for cell in rows[header_idx]]
    row_count = sum(1 for row in rows[header_idx + 1 :] if any(cell.strip() for cell in row))
    return headers, row_count, ""


def validate_export(spec: ExportSpec, quickbooks_dir: Path) -> dict[str, object]:
    located = find_export_file(quickbooks_dir, spec.filename)
    if not located:
        return {
            "report": spec.report,
            "expected_filename": spec.filename,
            "located_file": "",
            "status": "Missing",
            "row_count": "",
            "found_groups": "",
            "missing_required_groups": required_group_names(spec),
            "missing_recommended_groups": recommended_group_names(spec),
            "found_headers": "",
            "next_step": f"Export {spec.report} from QuickBooks and save it as {spec.filename}.",
        }

    suffix = located.suffix.lower()
    if suffix in EXCEL_SUFFIXES:
        return {
            "report": spec.report,
            "expected_filename": spec.filename,
            "located_file": relative(located),
            "status": "Present - unvalidated extension",
            "row_count": "",
            "found_groups": "",
            "missing_required_groups": required_group_names(spec),
            "missing_recommended_groups": recommended_group_names(spec),
            "found_headers": "",
            "next_step": f"Export or save {spec.report} as CSV named {spec.filename} so headers can be validated.",
        }

    if suffix != ".csv":
        return {
            "report": spec.report,
            "expected_filename": spec.filename,
            "located_file": relative(located),
            "status": "Present - unsupported file type",
            "row_count": "",
            "found_groups": "",
            "missing_required_groups": required_group_names(spec),
            "missing_recommended_groups": recommended_group_names(spec),
            "found_headers": "",
            "next_step": f"Replace with a CSV export named {spec.filename}.",
        }

    headers, row_count, warning = read_csv_headers(located)
    if warning:
        return {
            "report": spec.report,
            "expected_filename": spec.filename,
            "located_file": relative(located),
            "status": "Present - unreadable CSV",
            "row_count": row_count,
            "found_groups": "",
            "missing_required_groups": required_group_names(spec),
            "missing_recommended_groups": recommended_group_names(spec),
            "found_headers": ", ".join(headers),
            "next_step": warning,
        }

    found_groups = [group.name for group in spec.groups if group_found(group, headers)]
    missing_required = [
        group.name
        for group in spec.groups
        if group.required and not group_found(group, headers)
    ]
    missing_recommended = [
        group.name
        for group in spec.groups
        if not group.required and not group_found(group, headers)
    ]

    if row_count == 0:
        status = "Present - no data rows"
        next_step = "Re-export with data rows included, or note why this report is intentionally empty."
    elif missing_required:
        status = "Present - missing required columns"
        next_step = "Customize the QuickBooks report columns and re-export."
    else:
        status = "Present - valid"
        next_step = "Ready for downstream audit use."

    return {
        "report": spec.report,
        "expected_filename": spec.filename,
        "located_file": relative(located),
        "status": status,
        "row_count": row_count,
        "found_groups": "; ".join(found_groups),
        "missing_required_groups": "; ".join(missing_required),
        "missing_recommended_groups": "; ".join(missing_recommended),
        "found_headers": ", ".join(headers),
        "next_step": next_step,
    }


def required_group_names(spec: ExportSpec) -> str:
    return "; ".join(group.name for group in spec.groups if group.required)


def recommended_group_names(spec: ExportSpec) -> str:
    return "; ".join(group.name for group in spec.groups if not group.required)


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    fields = [
        "report",
        "expected_filename",
        "located_file",
        "status",
        "row_count",
        "found_groups",
        "missing_required_groups",
        "missing_recommended_groups",
        "found_headers",
        "next_step",
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def report_status(rows: list[dict[str, object]]) -> str:
    statuses = [str(row["status"]) for row in rows]
    if any(status == "Missing" for status in statuses):
        return "Not ready - missing exports"
    if any(status == "Present - missing required columns" for status in statuses):
        return "Not ready - required columns missing"
    if any(status in {"Present - unreadable CSV", "Present - unsupported file type", "Present - no data rows"} for status in statuses):
        return "Needs manual review"
    if any(status == "Present - unvalidated extension" for status in statuses):
        return "Present but needs CSV validation"
    return "Ready for downstream audit use"


def write_markdown(path: Path, rows: list[dict[str, object]], quickbooks_dir: Path, csv_path: Path) -> None:
    status_counts: dict[str, int] = {}
    for row in rows:
        status = str(row["status"])
        status_counts[status] = status_counts.get(status, 0) + 1

    lines = [
        "# QuickBooks Export Validation",
        "",
        f"- Input folder: `{relative(quickbooks_dir)}`",
        f"- Detail CSV: `{relative(csv_path)}`",
        f"- Overall status: **{report_status(rows)}**",
        "",
        "## Summary",
        "",
    ]
    for status in sorted(status_counts):
        lines.append(f"- {status}: {status_counts[status]}")

    lines.extend(
        [
            "",
            "## Export Checklist",
            "",
            "| Report | Expected file | Status | Rows | Missing required groups | Next step |",
            "|---|---|---|---:|---|---|",
        ]
    )

    for row in rows:
        lines.append(
            "| {report} | `{expected_filename}` | {status} | {row_count} | {missing_required_groups} | {next_step} |".format(
                report=row["report"],
                expected_filename=row["expected_filename"],
                status=row["status"],
                row_count=row["row_count"],
                missing_required_groups=row["missing_required_groups"] or "-",
                next_step=row["next_step"],
            )
        )

    lines.extend(
        [
            "",
            "## Guardrails",
            "",
            "- This validator only reads exported files.",
            "- It does not connect to or write into QuickBooks.",
            "- Customer, vendor, and money-facing decisions still require human approval.",
            "- Excel files are marked present but unvalidated; CSV is required for automated header checks.",
            "",
        ]
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def default_quickbooks_dir() -> Path:
    today_dir = DEFAULT_EVIDENCE_ROOT / date.today().isoformat() / "quickbooks"
    if today_dir.exists():
        return today_dir

    dated_dirs = sorted(
        path / "quickbooks"
        for path in DEFAULT_EVIDENCE_ROOT.glob("????-??-??")
        if (path / "quickbooks").exists()
    )
    if dated_dirs:
        return dated_dirs[-1]
    return today_dir


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--quickbooks-dir",
        default=str(default_quickbooks_dir()),
        help="Folder containing QuickBooks exports.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_ROOT / f"quickbooks-export-validation-{date.today().isoformat()}"),
        help="Folder to write validation outputs.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    quickbooks_dir = Path(args.quickbooks_dir).resolve()
    output_dir = Path(args.output_dir).resolve()

    rows = [validate_export(spec, quickbooks_dir) for spec in EXPORT_SPECS]

    csv_path = output_dir / "quickbooks-export-validation.csv"
    report_path = output_dir / "quickbooks-export-validation.md"

    write_csv(csv_path, rows)
    write_markdown(report_path, rows, quickbooks_dir, csv_path)

    print(f"Wrote {relative(report_path)}")
    print(f"Wrote {relative(csv_path)}")
    print(report_status(rows))


if __name__ == "__main__":
    main()
