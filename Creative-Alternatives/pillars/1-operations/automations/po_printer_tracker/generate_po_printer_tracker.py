#!/usr/bin/env python3
"""Generate a review-only PO/printer tracker packet for Creative Alternatives."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_INPUT_DIR = WORKSPACE_ROOT / "outputs/operations/backend-audit-2026-07-05"
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"


TRACKER_FIELDS = [
    "internal_job_id",
    "customer_name",
    "vendor_or_printer",
    "po_number",
    "po_created_by",
    "po_sent_via",
    "po_sent_date",
    "po_confirmed",
    "confirmation_date",
    "vendor_contact",
    "product_skus",
    "decoration_method",
    "artwork_file_link",
    "approved_proof_link",
    "size_color_breakdown",
    "ship_to",
    "customer_needed_by",
    "requested_in_hand_date",
    "vendor_promised_ship_date",
    "vendor_promised_delivery_date",
    "vendor_price_confirmed",
    "vendor_cost",
    "billing_terms",
    "vendor_invoice_received",
    "vendor_invoice_number",
    "vendor_invoice_matches_po",
    "tracking_number",
    "current_status",
    "next_follow_up",
    "next_follow_up_owner",
    "notes",
]


EXCEPTION_FIELDS = [
    "internal_job_id",
    "customer_name",
    "exception_type",
    "severity",
    "detail",
    "recommended_next_step",
    "owner",
]


@dataclass
class SourcePaths:
    input_dir: Path
    open_orders: Path
    vendors: Path


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


def clean(value: object) -> str:
    return str(value or "").strip()


def money(value: object) -> float:
    text = clean(value).replace("$", "").replace(",", "")
    try:
        return float(text)
    except ValueError:
        return 0.0


def is_placeholder_order(row: dict[str, str]) -> bool:
    notes = clean(row.get("notes")).lower()
    status = clean(row.get("current_status")).lower()
    return "starter row" in notes or status == "needs walkthrough"


def vendor_needs_mapping(vendor: dict[str, str]) -> bool:
    values = [
        "po_required",
        "preferred_order_method",
        "confirmation_method",
        "tracking_method",
        "invoice_method",
        "relationship_owner",
    ]
    return any("[CONFIRM]" in clean(vendor.get(field)) or not clean(vendor.get(field)) for field in values)


def likely_production_vendor(vendor: dict[str, str]) -> bool:
    vendor_type = clean(vendor.get("vendor_type")).lower()
    name = clean(vendor.get("vendor_name")).lower()
    excluded_terms = [
        "irs",
        "internal revenue",
        "payroll",
        "blue cross",
        "insurance",
        "airlines",
        "chase",
        "tax",
        "bank",
        "credit card",
    ]
    if any(term in vendor_type for term in ["finance", "travel", "shipping"]):
        return False
    if any(term in name for term in excluded_terms):
        return False
    if any(term in vendor_type for term in ["product supplier", "printer", "decorator", "review"]):
        if "review" in vendor_type and money(vendor.get("export_spend")) < 25000:
            return False
        return True
    if any(term in name for term in ["print", "graphics", "sportswear", "promo", "sanmar", "broder"]):
        return True
    return False


def build_tracker_rows(open_orders: list[dict[str, str]]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for order in open_orders:
        row = {field: "" for field in TRACKER_FIELDS}
        row.update(
            {
                "internal_job_id": clean(order.get("internal_job_id")),
                "customer_name": clean(order.get("customer_name")),
                "vendor_or_printer": clean(order.get("supplier_or_printer")),
                "po_number": clean(order.get("po_number")),
                "po_sent_date": clean(order.get("po_sent_date")),
                "po_confirmed": clean(order.get("po_confirmed")),
                "artwork_file_link": clean(order.get("source_links")),
                "customer_needed_by": clean(order.get("needed_by_date")),
                "requested_in_hand_date": clean(order.get("needed_by_date")),
                "vendor_promised_ship_date": clean(order.get("expected_ship_date")),
                "tracking_number": clean(order.get("tracking_number")),
                "current_status": "Needs walkthrough" if is_placeholder_order(order) else "Needs PO review",
                "next_follow_up": clean(order.get("next_action"))
                or "Run backend-reality-walkthrough.md and attach PO/vendor evidence",
                "next_follow_up_owner": clean(order.get("next_action_owner")) or clean(order.get("order_owner")),
                "notes": clean(order.get("notes")),
            }
        )
        if not row["next_follow_up_owner"]:
            row["next_follow_up_owner"] = "Ryan/Maclaine [CONFIRM]"
        rows.append(row)
    if not rows:
        rows.append(
            {
                **{field: "" for field in TRACKER_FIELDS},
                "internal_job_id": "CA-YYYY-0001",
                "current_status": "Needs walkthrough",
                "next_follow_up": "Add a real printer/decorator order packet",
                "next_follow_up_owner": "Ryan/Maclaine [CONFIRM]",
                "notes": "Generated placeholder because no open-order tracker rows were found.",
            }
        )
    return rows


def build_exceptions(tracker_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    exceptions: list[dict[str, object]] = []
    for row in tracker_rows:
        job_id = clean(row.get("internal_job_id"))
        customer = clean(row.get("customer_name"))
        owner = clean(row.get("next_follow_up_owner")) or "Ryan/Maclaine [CONFIRM]"
        if clean(row.get("current_status")) == "Needs walkthrough":
            exceptions.append(
                {
                    "internal_job_id": job_id,
                    "customer_name": customer,
                    "exception_type": "Missing live order packet",
                    "severity": "High",
                    "detail": "Starter row or incomplete order record; replace with a real order before using operationally.",
                    "recommended_next_step": "Collect customer request, PO/vendor order, confirmation, proof, tracking, invoice, and payment evidence.",
                    "owner": owner,
                }
            )
            continue
        required = [
            ("vendor_or_printer", "Missing vendor/printer"),
            ("po_number", "Missing PO/order number"),
            ("po_sent_date", "Missing PO sent date"),
            ("po_confirmed", "Missing vendor confirmation"),
            ("approved_proof_link", "Missing approved proof link"),
            ("tracking_number", "Missing tracking number"),
        ]
        for field, label in required:
            if not clean(row.get(field)):
                exceptions.append(
                    {
                        "internal_job_id": job_id,
                        "customer_name": customer,
                        "exception_type": label,
                        "severity": "Medium",
                        "detail": f"`{field}` is blank in the PO/printer tracker.",
                        "recommended_next_step": "Update the tracker from PO/vendor/proof/shipping evidence.",
                        "owner": owner,
                    }
                )
    return exceptions


def build_vendor_rows(vendors: list[dict[str, str]]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for vendor in vendors:
        if not likely_production_vendor(vendor):
            continue
        rows.append(
            {
                "vendor_name": clean(vendor.get("vendor_name")),
                "export_spend": clean(vendor.get("export_spend")),
                "vendor_type": clean(vendor.get("vendor_type")),
                "do_not_disrupt": clean(vendor.get("do_not_disrupt")),
                "relationship_owner": clean(vendor.get("relationship_owner")),
                "po_required": clean(vendor.get("po_required")),
                "preferred_order_method": clean(vendor.get("preferred_order_method")),
                "confirmation_method": clean(vendor.get("confirmation_method")),
                "tracking_method": clean(vendor.get("tracking_method")),
                "invoice_method": clean(vendor.get("invoice_method")),
                "mapping_status": "Needs workflow map" if vendor_needs_mapping(vendor) else "Mapped",
                "next_step": "Ask Kenny/Maclaine: PO method, confirmation, art handoff, tracking, invoice matching.",
            }
        )
    return rows


def write_follow_up_list(path: Path, tracker_rows: list[dict[str, object]], exceptions: list[dict[str, object]]) -> None:
    lines = [
        "# PO / Printer Follow-Up List",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        "Review-only. Do not send vendor-facing messages from this file without Kenny/Maclaine approval.",
        "",
        "## Immediate Follow-Ups",
        "",
    ]
    if exceptions:
        for item in exceptions[:15]:
            lines.append(
                f"- **{item['severity']}** — {item['internal_job_id'] or '[no job id]'}: {item['exception_type']}. "
                f"Next: {item['recommended_next_step']} Owner: {item['owner']}"
            )
    else:
        lines.append("- No PO/printer exceptions found in the current tracker.")
    lines.extend(
        [
            "",
            "## Tracker Rows",
            "",
            "| Job ID | Customer | Vendor/Printer | Status | Next Follow-Up | Owner |",
            "|---|---|---|---|---|---|",
        ]
    )
    for row in tracker_rows:
        lines.append(
            "| {job} | {customer} | {vendor} | {status} | {next_step} | {owner} |".format(
                job=clean(row.get("internal_job_id")) or "[CONFIRM]",
                customer=clean(row.get("customer_name")) or "[CONFIRM]",
                vendor=clean(row.get("vendor_or_printer")) or "[CONFIRM]",
                status=clean(row.get("current_status")) or "[CONFIRM]",
                next_step=clean(row.get("next_follow_up")) or "[CONFIRM]",
                owner=clean(row.get("next_follow_up_owner")) or "[CONFIRM]",
            )
        )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_vendor_workflow_map(path: Path, vendor_rows: list[dict[str, object]]) -> None:
    lines = [
        "# Vendor / Printer Workflow Map",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        "Use this with Kenny/Maclaine before changing any vendor workflow.",
        "",
        "| Vendor | Spend | Type | Do Not Disrupt | Mapping Status | Next Step |",
        "|---|---:|---|---|---|---|",
    ]
    for row in vendor_rows[:25]:
        lines.append(
            "| {vendor} | {spend} | {vendor_type} | {dnd} | {status} | {next_step} |".format(
                vendor=clean(row.get("vendor_name")) or "[CONFIRM]",
                spend=clean(row.get("export_spend")) or "[CONFIRM]",
                vendor_type=clean(row.get("vendor_type")) or "[CONFIRM]",
                dnd=clean(row.get("do_not_disrupt")) or "[CONFIRM]",
                status=clean(row.get("mapping_status")) or "[CONFIRM]",
                next_step=clean(row.get("next_step")) or "[CONFIRM]",
            )
        )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_readme(path: Path, sources: SourcePaths, tracker_rows: list[dict[str, object]], exceptions: list[dict[str, object]]) -> None:
    lines = [
        "# PO / Printer Tracker Packet",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        "## Sources",
        "",
        f"- Open orders: `{sources.open_orders}`",
        f"- Vendors: `{sources.vendors}`",
        "",
        "## Outputs",
        "",
        "- `po-printer-tracker.csv`",
        "- `po-follow-up-list.md`",
        "- `vendor-workflow-map.md`",
        "- `po-exceptions.csv`",
        "",
        "## Current State",
        "",
        f"- Tracker rows: **{len(tracker_rows)}**",
        f"- Exceptions: **{len(exceptions)}**",
        "",
        "## Guardrails",
        "",
        "- Review-only.",
        "- No vendor-facing or customer-facing messages are sent.",
        "- No QuickBooks writes.",
        "- Starter rows must be replaced with real order packets before this becomes an operating tracker.",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def resolve_sources(input_dir: Path) -> SourcePaths:
    return SourcePaths(
        input_dir=input_dir,
        open_orders=input_dir / "open-order-tracker-starter.csv",
        vendors=input_dir / "vendor-master-starter.csv",
    )


def generate(input_dir: Path, output_dir: Path) -> None:
    sources = resolve_sources(input_dir)
    open_orders = read_csv(sources.open_orders)
    vendors = read_csv(sources.vendors)
    tracker_rows = build_tracker_rows(open_orders)
    exceptions = build_exceptions(tracker_rows)
    vendor_rows = build_vendor_rows(vendors)

    output_dir.mkdir(parents=True, exist_ok=True)
    write_csv(output_dir / "po-printer-tracker.csv", tracker_rows, TRACKER_FIELDS)
    write_csv(output_dir / "po-exceptions.csv", exceptions, EXCEPTION_FIELDS)
    write_follow_up_list(output_dir / "po-follow-up-list.md", tracker_rows, exceptions)
    write_vendor_workflow_map(output_dir / "vendor-workflow-map.md", vendor_rows)
    write_readme(output_dir / "README.md", sources, tracker_rows, exceptions)


def parse_args() -> argparse.Namespace:
    today = date.today().isoformat()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=DEFAULT_INPUT_DIR,
        help="Folder containing open-order-tracker-starter.csv and vendor-master-starter.csv.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_ROOT / f"po-printer-tracker-{today}",
        help="Output folder for the generated PO/printer tracker packet.",
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
    generate(input_dir=input_dir, output_dir=output_dir)
    print(f"Wrote PO/printer tracker packet to {output_dir}")


if __name__ == "__main__":
    main()
