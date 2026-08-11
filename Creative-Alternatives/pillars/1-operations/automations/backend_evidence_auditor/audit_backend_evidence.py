#!/usr/bin/env python3
"""Audit backend evidence coverage for Creative Alternatives operations work."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path
import re


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_EVIDENCE_DIR = WORKSPACE_ROOT / "context/import/backend-audit"
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"
BASE_IMPORT_DIR = WORKSPACE_ROOT / "context/import"


@dataclass(frozen=True)
class Requirement:
    category: str
    requirement: str
    patterns: tuple[str, ...]
    why_it_matters: str
    next_step: str
    required_for: str = "Backend audit"


QUICKBOOKS_REQUIREMENTS = [
    Requirement(
        "QuickBooks starter",
        "A/R Aging Summary",
        ("qb_ar_aging", "ar_aging", "a-r aging", "ar aging"),
        "AR worklist and collections priority.",
        "Export A/R Aging Summary from QuickBooks.",
        "AR action worklist",
    ),
    Requirement(
        "QuickBooks starter",
        "Expenses by Vendor Summary",
        ("qb_expenses_by_vendor", "expenses_by_vendor", "vendor_summary"),
        "Vendor/printer exposure and workflow mapping.",
        "Export Expenses by Vendor Summary from QuickBooks.",
        "PO/printer tracker",
    ),
    Requirement(
        "QuickBooks starter",
        "Sales by Customer Summary",
        ("qb_sales_by_customer_total", "sales_by_customer"),
        "Customer value, reorders, and relationship handling.",
        "Export Sales by Customer Summary from QuickBooks.",
        "AR/reorder work",
    ),
    Requirement(
        "QuickBooks starter",
        "Sales by Product/Service Summary",
        ("qb_sales_by_product", "sales_by_product", "product_service"),
        "Product mix and margin visibility gaps.",
        "Export Sales by Product/Service Summary from QuickBooks.",
        "Margin and vendor-cost mapping",
    ),
    Requirement(
        "QuickBooks starter",
        "Customer Contact List",
        ("qb_customer_contacts", "customer_contacts", "contact_list"),
        "Contact coverage and outreach readiness.",
        "Export Customer Contact List from QuickBooks.",
        "AR/reorder work",
    ),
]


NEXT_EXPORT_REQUIREMENTS = [
    Requirement(
        "QuickBooks needed next",
        "Invoice Detail",
        ("invoice_detail", "invoice-detail", "invoices_detail", "invoice detail"),
        "Required for payment matching and AR worklist accuracy.",
        "Export invoice detail for one representative month plus current open invoices.",
        "AR/reconciliation",
    ),
    Requirement(
        "QuickBooks needed next",
        "Payments Received / Deposits Detail",
        ("payments_detail", "payment_detail", "deposits_detail", "payments-deposits", "payments received"),
        "Required for payment-to-invoice reconciliation.",
        "Export payments/deposits detail for the same month as invoice detail.",
        "Reconciliation",
    ),
    Requirement(
        "QuickBooks needed next",
        "Open Invoices",
        ("open_invoices", "open-invoices", "open invoice"),
        "Required for daily AR action list.",
        "Export current open invoices.",
        "AR action worklist",
    ),
    Requirement(
        "QuickBooks needed next",
        "Open Purchase Orders",
        ("open_purchase_orders", "open-purchase-orders", "purchase_orders", "po_export"),
        "Required to decide whether QuickBooks can anchor PO tracking.",
        "Export open purchase orders if QuickBooks POs are used.",
        "PO/printer tracker",
    ),
    Requirement(
        "QuickBooks needed next",
        "Unpaid Bills / Vendor Bills",
        ("unpaid_bills", "vendor_bills", "bill_detail", "bills_unpaid"),
        "Required for vendor cost and margin matching.",
        "Export unpaid bills/vendor bills if vendor bills are entered.",
        "Margin/reconciliation",
    ),
    Requirement(
        "QuickBooks needed next",
        "Estimates / Quotes",
        ("estimates", "quotes", "quote_export", "estimate_detail"),
        "Required to understand quote-to-order trigger.",
        "Export estimates/quotes for one representative month if estimates are used.",
        "Quote/order mapping",
    ),
]


ORDER_ARTIFACTS = [
    Requirement("Order packet", "Customer request", ("request", "intake", "customer-email", "customer_request"), "Shows what the customer asked for.", "Save original customer request thread or intake note."),
    Requirement("Order packet", "Quote / estimate", ("quote", "estimate"), "Shows what was promised.", "Save quote email, estimate, or pricing note."),
    Requirement("Order packet", "Customer approval", ("approval", "approved", "customer-yes"), "Proves the customer approved the order/proof.", "Save approval thread or confirmation."),
    Requirement("Order packet", "PO / vendor order", ("po", "purchase-order", "purchase_order", "vendor-order"), "Connects customer order to vendor/printer order.", "Save PO, vendor portal order, or order email."),
    Requirement("Order packet", "Vendor/printer confirmation", ("vendor-confirmation", "printer-confirmation", "confirmed", "confirmation"), "Shows vendor accepted the order.", "Save vendor/printer confirmation."),
    Requirement("Order packet", "Proof / artwork", ("proof", "artwork", "art-file", "final-art"), "Identifies final approved proof/art.", "Save approved proof and art file location."),
    Requirement("Order packet", "Shipping / tracking", ("tracking", "shipment", "shipping", "delivery"), "Answers where the order is.", "Save tracking or delivery evidence."),
    Requirement("Order packet", "Invoice / payment", ("invoice", "payment", "paid", "deposit"), "Shows invoice/payment status.", "Save invoice and payment status evidence."),
]


GLOBAL_EVIDENCE_REQUIREMENTS = [
    Requirement(
        "PO/printer evidence",
        "Sample PO or vendor order",
        ("po", "purchase-order", "purchase_order", "vendor-order", "vendor_order"),
        "Minimum evidence for PO/printer tracker.",
        "Collect one sample PO or vendor order.",
        "PO/printer tracker",
    ),
    Requirement(
        "PO/printer evidence",
        "Sample vendor confirmation/tracking/invoice flow",
        ("vendor-confirmation", "printer-confirmation", "tracking", "vendor-invoice", "vendor_invoice"),
        "Minimum flow evidence for PO/printer tracker.",
        "Collect confirmation, tracking, and vendor invoice evidence from one order.",
        "PO/printer tracker",
    ),
    Requirement(
        "Spreadsheet evidence",
        "Weekly business spreadsheets",
        ("spreadsheets/", "business-spreadsheet", "open-order-spreadsheet", "pricing-sheet", ".xlsx", ".xls"),
        "Finds shadow systems outside QuickBooks.",
        "List or export weekly spreadsheets used for open orders, pricing, costs, vendors, proofs, shipping, AR, and reorders.",
        "System inventory",
    ),
    Requirement(
        "Relationship rules",
        "Kenny/Maclaine personal handling rules",
        ("relationship", "personal-handling", "do-not-disrupt", "kenny-notes"),
        "Prevents automation from damaging important customers/vendors.",
        "Record which customers/vendors need personal handling.",
        "All automations",
    ),
]


def clean(value: object) -> str:
    return str(value or "").strip()


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def evidence_files(evidence_dir: Path, include_base_imports: bool) -> list[Path]:
    roots = [(evidence_dir, False)]
    if include_base_imports:
        roots.append((BASE_IMPORT_DIR, True))
    seen: set[Path] = set()
    files: list[Path] = []
    for root, base_import_only in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if base_import_only and not path.name.lower().startswith("qb_"):
                continue
            if path.name.lower() in {"readme.md", ".ds_store"}:
                continue
            if path in seen:
                continue
            seen.add(path)
            files.append(path)
    return sorted(files)


def haystack(path: Path) -> str:
    pieces = [path.name, str(path.parent), path.suffix]
    return " ".join(pieces).lower().replace("_", "-")


def matches(path: Path, patterns: tuple[str, ...]) -> bool:
    text = haystack(path)
    normalized = text.replace("_", "-")
    for pattern in patterns:
        p = pattern.lower().replace("_", "-")
        if p.startswith("."):
            if path.suffix.lower() == p:
                return True
            continue
        if len(p) <= 3:
            if re.search(rf"(^|[\/\-_ \.]){re.escape(p)}($|[\/\-_ \.])", normalized):
                return True
            continue
        if p in normalized:
            return True
    return False


def requirement_status(req: Requirement, files: list[Path]) -> tuple[str, list[Path]]:
    found = [path for path in files if matches(path, req.patterns)]
    return ("Present" if found else "Missing", found)


def order_number(path: Path) -> int | None:
    text = str(path).lower()
    match = re.search(r"order[-_\s]?0?([1-5])\b", text)
    if match:
        return int(match.group(1))
    match = re.search(r"\b0?([1-5])[-_\s](?:customer|quote|po|proof|tracking|invoice)", text)
    if match:
        return int(match.group(1))
    return None


def order_files(files: list[Path], order_idx: int) -> list[Path]:
    return [path for path in files if order_number(path) == order_idx]


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def inventory_rows(files: list[Path]) -> list[dict[str, object]]:
    requirements = QUICKBOOKS_REQUIREMENTS + NEXT_EXPORT_REQUIREMENTS + GLOBAL_EVIDENCE_REQUIREMENTS
    rows: list[dict[str, object]] = []
    for req in requirements:
        status, found = requirement_status(req, files)
        rows.append(
            {
                "category": req.category,
                "requirement": req.requirement,
                "status": status,
                "matched_files": "; ".join(relative(path) for path in found),
                "required_for": req.required_for,
                "why_it_matters": req.why_it_matters,
                "next_step": "" if status == "Present" else req.next_step,
            }
        )
    return rows


def order_coverage_rows(files: list[Path]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for idx in range(1, 6):
        files_for_order = order_files(files, idx)
        for req in ORDER_ARTIFACTS:
            found = [path for path in files_for_order if matches(path, req.patterns)]
            rows.append(
                {
                    "order_slot": f"order-{idx:02d}",
                    "artifact": req.requirement,
                    "status": "Present" if found else "Missing",
                    "matched_files": "; ".join(relative(path) for path in found),
                    "next_step": "" if found else req.next_step,
                }
            )
    return rows


def write_missing_report(path: Path, inventory: list[dict[str, object]], order_rows: list[dict[str, object]]) -> None:
    missing_inventory = [row for row in inventory if row["status"] == "Missing"]
    missing_orders = [row for row in order_rows if row["status"] == "Missing"]
    lines = [
        "# Missing Backend Evidence Report",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        "Use this as the collection checklist before trusting the first backend automation.",
        "",
        "## Missing Global Evidence",
        "",
    ]
    if missing_inventory:
        for row in missing_inventory:
            lines.append(f"- [ ] **{row['requirement']}** ({row['required_for']}): {row['next_step']}")
    else:
        lines.append("- [x] No global evidence gaps found.")

    lines.extend(["", "## Missing Order Packet Evidence", ""])
    for idx in range(1, 6):
        order_missing = [row for row in missing_orders if row["order_slot"] == f"order-{idx:02d}"]
        lines.append(f"### Order {idx}")
        if order_missing:
            for row in order_missing:
                lines.append(f"- [ ] {row['artifact']}: {row['next_step']}")
        else:
            lines.append("- [x] All required order artifacts found.")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_summary(
    path: Path,
    evidence_dir: Path,
    files: list[Path],
    inventory: list[dict[str, object]],
    order_rows: list[dict[str, object]],
) -> None:
    present_global = sum(1 for row in inventory if row["status"] == "Present")
    total_global = len(inventory)
    present_order = sum(1 for row in order_rows if row["status"] == "Present")
    total_order = len(order_rows)
    missing_global = [row for row in inventory if row["status"] == "Missing"]
    lines = [
        "# Backend Evidence Summary",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        f"- Evidence folder: `{evidence_dir}`",
        f"- Files scanned: **{len(files)}**",
        f"- Global evidence present: **{present_global}/{total_global}**",
        f"- Order-packet evidence present: **{present_order}/{total_order}**",
        "",
        "## Automation Readiness",
        "",
        "- **PO/printer tracker:** not ready until at least one PO/vendor order, vendor confirmation/tracking/invoice flow, and five order packets are collected.",
        "- **Payment reconciliation:** not ready until invoice detail and payments/deposits detail for the same representative month are collected.",
        "- **AR worklist:** partially supported by A/R aging, but not ready for external action until open invoice detail, AR owner/cadence, and A-tier relationship rules are collected.",
        "",
        "## Highest-Priority Missing Items",
        "",
    ]
    for row in missing_global[:10]:
        lines.append(f"- {row['requirement']}: {row['next_step']}")
    if not missing_global:
        lines.append("- No missing global items detected.")
    lines.extend(["", "## Files Scanned", ""])
    for path_item in files:
        lines.append(f"- `{relative(path_item)}`")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def audit(evidence_dir: Path, output_dir: Path, include_base_imports: bool) -> None:
    files = evidence_files(evidence_dir, include_base_imports)
    inventory = inventory_rows(files)
    order_rows = order_coverage_rows(files)
    output_dir.mkdir(parents=True, exist_ok=True)
    write_csv(
        output_dir / "evidence-inventory.csv",
        inventory,
        ["category", "requirement", "status", "matched_files", "required_for", "why_it_matters", "next_step"],
    )
    write_csv(
        output_dir / "order-packet-coverage.csv",
        order_rows,
        ["order_slot", "artifact", "status", "matched_files", "next_step"],
    )
    write_missing_report(output_dir / "missing-evidence-report.md", inventory, order_rows)
    write_summary(output_dir / "backend-evidence-summary.md", evidence_dir, files, inventory, order_rows)


def parse_args() -> argparse.Namespace:
    today = date.today().isoformat()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--evidence-dir",
        type=Path,
        default=DEFAULT_EVIDENCE_DIR,
        help="Folder containing collected backend evidence.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_ROOT / f"backend-evidence-audit-{today}",
        help="Folder where evidence audit outputs should be written.",
    )
    parser.add_argument(
        "--no-base-imports",
        action="store_true",
        help="Do not count existing context/import QuickBooks starter exports.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    evidence_dir = args.evidence_dir
    output_dir = args.output_dir
    if not evidence_dir.is_absolute():
        evidence_dir = WORKSPACE_ROOT / evidence_dir
    if not output_dir.is_absolute():
        output_dir = WORKSPACE_ROOT / output_dir
    audit(evidence_dir, output_dir, include_base_imports=not args.no_base_imports)
    print(f"Wrote backend evidence audit to {output_dir}")


if __name__ == "__main__":
    main()
