#!/usr/bin/env python3
"""Generate a backend operations audit packet from QuickBooks CSV exports."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
IMPORT_DIR = WORKSPACE_ROOT / "context" / "import"
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs" / "operations"


def money(value: object) -> float:
    if value is None:
        return 0.0
    text = str(value).strip()
    if not text:
        return 0.0
    text = text.replace("$", "").replace(",", "").replace("%", "")
    negative = text.startswith("(") and text.endswith(")")
    text = text.strip("()")
    try:
        amount = float(text)
    except ValueError:
        return 0.0
    return -amount if negative else amount


def fmt_money(value: float) -> str:
    return f"${value:,.2f}"


def fmt_pct(value: float) -> str:
    return f"{value:.1f}%"


def read_rows(path: Path) -> list[list[str]]:
    with path.open(newline="", errors="replace") as handle:
        return list(csv.reader(handle))


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def find_header(rows: list[list[str]], required: Iterable[str]) -> int:
    required_set = {item.lower() for item in required}
    for idx, row in enumerate(rows):
        values = {cell.strip().lower() for cell in row}
        if required_set.issubset(values):
            return idx
    raise ValueError(f"Could not find header with required columns: {required}")


@dataclass
class ArSummary:
    rows: list[dict[str, object]]
    totals: dict[str, float]


@dataclass
class TotalReport:
    rows: list[dict[str, object]]
    total: float


@dataclass
class ProductReport:
    rows: list[dict[str, object]]
    total_amount: float
    total_cogs: float


def parse_ar_aging(path: Path) -> ArSummary:
    rows = read_rows(path)
    header_idx = find_header(rows, ["CURRENT", "1 - 30", "31 - 60", "61 - 90", "91 AND OVER", "Total"])
    header = rows[header_idx]
    idx = {name: header.index(name) for name in ["CURRENT", "1 - 30", "31 - 60", "61 - 90", "91 AND OVER", "Total"]}
    parsed: list[dict[str, object]] = []
    totals = {key: 0.0 for key in ["current", "1_30", "31_60", "61_90", "91_over", "total"]}

    for raw in rows[header_idx + 1 :]:
        if not raw or not any(cell.strip() for cell in raw):
            continue
        name = raw[0].strip()
        if not name:
            continue
        current = money(raw[idx["CURRENT"]] if len(raw) > idx["CURRENT"] else "")
        bucket_1_30 = money(raw[idx["1 - 30"]] if len(raw) > idx["1 - 30"] else "")
        bucket_31_60 = money(raw[idx["31 - 60"]] if len(raw) > idx["31 - 60"] else "")
        bucket_61_90 = money(raw[idx["61 - 90"]] if len(raw) > idx["61 - 90"] else "")
        bucket_91 = money(raw[idx["91 AND OVER"]] if len(raw) > idx["91 AND OVER"] else "")
        total = money(raw[idx["Total"]] if len(raw) > idx["Total"] else "")
        if name.upper() == "TOTAL":
            totals = {
                "current": current,
                "1_30": bucket_1_30,
                "31_60": bucket_31_60,
                "61_90": bucket_61_90,
                "91_over": bucket_91,
                "total": total,
            }
            break
        if is_subtotal_name(name):
            continue
        overdue = bucket_1_30 + bucket_31_60 + bucket_61_90 + bucket_91
        parsed.append(
            {
                "customer": name,
                "current": current,
                "1_30": bucket_1_30,
                "31_60": bucket_31_60,
                "61_90": bucket_61_90,
                "91_over": bucket_91,
                "total": total,
                "overdue": overdue,
                "overdue_pct": (overdue / total * 100.0) if total else 0.0,
            }
        )
    return ArSummary(rows=parsed, totals=totals)


def is_subtotal_name(name: str) -> bool:
    return name.strip().lower().startswith("total for ")


def parse_two_column_total_report(path: Path, name_field: str, value_field: str) -> TotalReport:
    rows = read_rows(path)
    header_idx = find_header(rows, ["Total"])
    parsed: list[dict[str, object]] = []
    total = 0.0
    for raw in rows[header_idx + 1 :]:
        if not raw or not any(cell.strip() for cell in raw):
            continue
        name = raw[0].strip() if len(raw) > 0 else ""
        if not name:
            continue
        if name.upper() == "TOTAL":
            total = money(raw[1] if len(raw) > 1 else "")
            break
        if is_subtotal_name(name):
            continue
        value = money(raw[1] if len(raw) > 1 else "")
        parsed.append({name_field: name, value_field: value})
    return TotalReport(rows=parsed, total=total)


def parse_products(path: Path) -> ProductReport:
    rows = read_rows(path)
    header_idx = find_header(rows, ["Quantity", "Amount", "COGS"])
    header = rows[header_idx]
    idx = {name: header.index(name) for name in ["Quantity", "Amount", "COGS"]}
    parsed: list[dict[str, object]] = []
    total_amount = 0.0
    total_cogs = 0.0
    for raw in rows[header_idx + 1 :]:
        if not raw or not any(cell.strip() for cell in raw):
            continue
        product = raw[0].strip() if len(raw) > 0 else ""
        if not product:
            continue
        if product.upper() == "TOTAL":
            total_amount = money(raw[idx["Amount"]] if len(raw) > idx["Amount"] else "")
            total_cogs = money(raw[idx["COGS"]] if len(raw) > idx["COGS"] else "")
            break
        if is_subtotal_name(product):
            continue
        parsed.append(
            {
                "product": product,
                "quantity": money(raw[idx["Quantity"]] if len(raw) > idx["Quantity"] else ""),
                "amount": money(raw[idx["Amount"]] if len(raw) > idx["Amount"] else ""),
                "cogs": money(raw[idx["COGS"]] if len(raw) > idx["COGS"] else ""),
            }
        )
    return ProductReport(rows=parsed, total_amount=total_amount, total_cogs=total_cogs)


def parse_contacts(path: Path) -> dict[str, int]:
    rows = read_rows(path)
    header_idx = find_header(rows, ["Customer full name", "Phone numbers", "Email"])
    header = rows[header_idx]
    name_i = header.index("Customer full name")
    phone_i = header.index("Phone numbers")
    email_i = header.index("Email")
    total = email = phone = both = neither = 0
    for raw in rows[header_idx + 1 :]:
        if not raw or not any(cell.strip() for cell in raw):
            continue
        name = raw[name_i].strip() if len(raw) > name_i else ""
        if not name:
            continue
        has_email = bool(raw[email_i].strip()) if len(raw) > email_i else False
        has_phone = bool(raw[phone_i].strip()) if len(raw) > phone_i else False
        total += 1
        email += 1 if has_email else 0
        phone += 1 if has_phone else 0
        both += 1 if has_email and has_phone else 0
        neither += 1 if not has_email and not has_phone else 0
    return {"total": total, "email": email, "phone": phone, "both": both, "neither": neither}


def top(rows: list[dict[str, object]], key: str, limit: int = 10) -> list[dict[str, object]]:
    return sorted(rows, key=lambda row: float(row.get(key, 0.0)), reverse=True)[:limit]


def aging_bucket(row: dict[str, object]) -> str:
    if float(row.get("91_over", 0.0)) > 0:
        return "91+"
    if float(row.get("61_90", 0.0)) > 0:
        return "61-90"
    if float(row.get("31_60", 0.0)) > 0:
        return "31-60"
    if float(row.get("1_30", 0.0)) > 0:
        return "1-30"
    return "Current"


def customer_tier(customer: str, sales_by_customer: dict[str, float], overdue: float) -> str:
    sales = sales_by_customer.get(customer, 0.0)
    if sales >= 50000 or overdue >= 10000:
        return "A"
    if sales >= 10000 or overdue >= 2500:
        return "B"
    return "C"


def relationship_risk(customer: str, tier: str) -> str:
    lowered = customer.lower()
    relationship_markers = ["camp", "squash", "ymca", "yale", "ussra", "heights casino", "farm & forge"]
    if tier == "A" or any(marker in lowered for marker in relationship_markers):
        return "High"
    if tier == "B":
        return "Medium"
    return "Low"


def recommended_ar_channel(tier: str, risk: str, bucket: str) -> str:
    if risk == "High" or bucket in {"91+", "61-90"}:
        return "Phone first + personal email"
    if tier == "B":
        return "Personal email"
    return "Email"


def recommended_ar_tone(tier: str, risk: str, bucket: str) -> str:
    if risk == "High":
        return "Relationship-first check-in; assume good faith"
    if bucket in {"91+", "61-90"}:
        return "Firm but warm; include statement"
    if tier == "B":
        return "Friendly reminder"
    return "Standard reminder"


def vendor_type(name: str) -> str:
    lowered = name.lower()
    if any(token in lowered for token in ["sanmar", "s & s", "alphabroder", "hit promotional", "momentec", "allcasion", "aakron", "promo"]):
        return "Product supplier / wholesaler"
    if any(token in lowered for token in ["print", "graphics", "trophy", "diamond", "irmo"]):
        return "Printer / decorator"
    if any(token in lowered for token in ["ups", "freight", "shipping"]):
        return "Shipping / logistics"
    if any(token in lowered for token in ["irs", "internal revenue", "wells fargo", "chase", "quickbooks"]):
        return "Finance / admin"
    if any(token in lowered for token in ["delta", "travel"]):
        return "Travel / non-production"
    return "Review"


def vendor_do_not_disrupt(index: int, spend: float, vtype: str) -> str:
    if index <= 10 and vtype in {"Product supplier / wholesaler", "Printer / decorator"}:
        return "Yes - map relationship before changing workflow"
    if spend >= 25000 and vtype in {"Product supplier / wholesaler", "Printer / decorator"}:
        return "Review with Kenny"
    return "No"


def build_ar_action_starter(ar_priority: list[dict[str, object]], top_customers: list[dict[str, object]]) -> list[dict[str, object]]:
    sales_by_customer = {str(row["customer"]): float(row["sales"]) for row in top_customers}
    rows: list[dict[str, object]] = []
    for index, row in enumerate(ar_priority[:25], start=1):
        customer = str(row["customer"])
        overdue = float(row["overdue"])
        bucket = aging_bucket(row)
        tier = customer_tier(customer, sales_by_customer, overdue)
        risk = relationship_risk(customer, tier)
        rows.append(
            {
                "action_id": f"AR-{date.today().strftime('%Y')}-{index:04d}",
                "customer_name": customer,
                "invoice_number": "[export detail needed]",
                "invoice_date": "",
                "due_date": "",
                "aging_bucket": bucket,
                "amount_open": f"{float(row['total']):.2f}",
                "customer_tier": tier,
                "relationship_risk": risk,
                "recommended_channel": recommended_ar_channel(tier, risk, bucket),
                "recommended_tone": recommended_ar_tone(tier, risk, bucket),
                "draft_status": "Needs human-approved draft",
                "approved_by": "",
                "sent_date": "",
                "last_contact_date": "",
                "next_follow_up_date": "",
                "current_outcome": "Open",
                "payment_received_date": "",
                "amount_collected": "",
                "notes": "Generated from customer-level AR aging summary; export invoice detail before sending.",
            }
        )
    return rows


def build_vendor_master_starter(top_vendors: list[dict[str, object]]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for index, row in enumerate(top_vendors[:30], start=1):
        name = str(row["vendor"])
        spend = float(row["spend"])
        vtype = vendor_type(name)
        rows.append(
            {
                "vendor_name": name,
                "export_spend": f"{spend:.2f}",
                "vendor_type": vtype,
                "primary_contact": "",
                "email": "",
                "phone": "",
                "portal_url": "",
                "login_owner": "",
                "products_or_services": "",
                "decoration_methods": "",
                "typical_turnaround": "",
                "payment_terms": "",
                "po_required": "[CONFIRM]",
                "preferred_order_method": "[CONFIRM]",
                "confirmation_method": "[CONFIRM]",
                "tracking_method": "[CONFIRM]",
                "invoice_method": "[CONFIRM]",
                "known_strengths": "",
                "known_risks": "",
                "relationship_owner": "[CONFIRM]",
                "do_not_disrupt": vendor_do_not_disrupt(index, spend, vtype),
                "notes": "Generated from QuickBooks expenses by vendor; map PO workflow before changing.",
            }
        )
    return rows


def build_gap_register_starter() -> list[dict[str, object]]:
    return [
        {
            "gap_id": "G-001",
            "gap_title": "QuickBooks data is not yet flowing into local ops database",
            "workflow_area": "Data layer",
            "where_it_happens": "Reporting / automations",
            "current_workaround": "Manual CSV exports",
            "impact_tag": "Manual time; Systems gap",
            "impact_description": "Ops reporting and automations cannot refresh without manual exports.",
            "frequency": "Weekly or as-needed",
            "owner": "Ryan [CONFIRM]",
            "current_systems_involved": "QuickBooks; data/data.db",
            "evidence_link_or_example": "data/data.db currently only has SmartLead tables",
            "revenue_or_cash_risk": "Medium",
            "time_cost_estimate": "[CONFIRM]",
            "fix_idea": "Build read-only QuickBooks collectors after export-assisted v1",
            "priority": "High",
            "ease": "Medium",
            "next_step": "Confirm QuickBooks MCP production access and read-only permissions",
            "status": "Open",
        },
        {
            "gap_id": "G-002",
            "gap_title": "AR follow-up and payment visibility are cash bottlenecks",
            "workflow_area": "AR / payments",
            "where_it_happens": "Open invoices and payment matching",
            "current_workaround": "Manual review and reconciliation",
            "impact_tag": "Cash leak; Manual time",
            "impact_description": "Large past-due balance and known 8-hour reconciliation pain.",
            "frequency": "Weekly [CONFIRM]",
            "owner": "Maclaine [CONFIRM]",
            "current_systems_involved": "QuickBooks; email",
            "evidence_link_or_example": "AR export: $377,981.08 past due; $62,695.03 at 91+",
            "revenue_or_cash_risk": "High",
            "time_cost_estimate": "8 hours in one known reconciliation session",
            "fix_idea": "AR action tracker + reconciliation exception report",
            "priority": "High",
            "ease": "High",
            "next_step": "Review generated ar-action-tracker-starter.csv",
            "status": "Open",
        },
        {
            "gap_id": "G-003",
            "gap_title": "Item/job margin visibility is incomplete",
            "workflow_area": "Pricing / margin",
            "where_it_happens": "Product/service reporting and vendor cost matching",
            "current_workaround": "Unknown; possibly spreadsheets or memory",
            "impact_tag": "Cash leak; Founder dependency",
            "impact_description": "Positive-revenue product lines show zero COGS, making profitability hard to see.",
            "frequency": "Every quote/job [CONFIRM]",
            "owner": "Kenny/Maclaine [CONFIRM]",
            "current_systems_involved": "QuickBooks; spreadsheets [CONFIRM]",
            "evidence_link_or_example": "Product export: 130 positive-revenue lines with zero COGS",
            "revenue_or_cash_risk": "High",
            "time_cost_estimate": "[CONFIRM]",
            "fix_idea": "Add vendor cost and expected margin to open-order tracker",
            "priority": "High",
            "ease": "Medium",
            "next_step": "Ask where vendor/product costs are currently tracked",
            "status": "Open",
        },
        {
            "gap_id": "G-004",
            "gap_title": "Purchase-order/printer workflow is under-mapped",
            "workflow_area": "POs / printers",
            "where_it_happens": "Vendor order handoff and confirmation",
            "current_workaround": "Email/portal/memory [CONFIRM]",
            "impact_tag": "Customer risk; Manual time",
            "impact_description": "PO creation, vendor confirmation, art handoff, and invoice matching are not documented.",
            "frequency": "Every printer/decorator order [CONFIRM]",
            "owner": "Kenny/Maclaine [CONFIRM]",
            "current_systems_involved": "Email; QuickBooks; vendor portals; spreadsheets [CONFIRM]",
            "evidence_link_or_example": "Ops discovery PO/printer steps still [CONFIRM]",
            "revenue_or_cash_risk": "High",
            "time_cost_estimate": "[CONFIRM]",
            "fix_idea": "Printer PO tracker with confirmation and follow-up fields",
            "priority": "High",
            "ease": "Medium",
            "next_step": "Run backend-reality-walkthrough.md on one recent printer order",
            "status": "Open",
        },
        {
            "gap_id": "G-005",
            "gap_title": "No proven single order/job ID across systems",
            "workflow_area": "Order tracking",
            "where_it_happens": "Email, QuickBooks, PO, proof, shipping, payment",
            "current_workaround": "Search by customer/name/date [CONFIRM]",
            "impact_tag": "Manual time; Customer risk",
            "impact_description": "Status and reconciliation become fragile if every system uses different identifiers.",
            "frequency": "Every order [CONFIRM]",
            "owner": "Ryan/Maclaine [CONFIRM]",
            "current_systems_involved": "Email; QuickBooks; vendor portals; file storage",
            "evidence_link_or_example": "Required order record field still [CONFIRM]",
            "revenue_or_cash_risk": "Medium",
            "time_cost_estimate": "[CONFIRM]",
            "fix_idea": "Create CA-YYYY-#### internal job ID convention",
            "priority": "High",
            "ease": "High",
            "next_step": "Check 5 live orders for shared IDs",
            "status": "Needs validation",
        },
    ]


def build_open_order_starter() -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    order_types = [
        "normal apparel order",
        "rush order",
        "high-dollar customer order",
        "printer/decorator order",
        "payment or invoice confusion order",
    ]
    for index, order_type in enumerate(order_types, start=1):
        rows.append(
            {
                "internal_job_id": f"CA-{date.today().strftime('%Y')}-{index:04d}",
                "customer_name": "",
                "customer_contact": "",
                "request_source": "",
                "request_date": "",
                "needed_by_date": "",
                "order_owner": "",
                "current_status": "Needs walkthrough",
                "next_action": f"Pick one {order_type} and run backend-reality-walkthrough.md",
                "next_action_owner": "Ryan/Maclaine [CONFIRM]",
                "next_action_due": "",
                "products_summary": "",
                "quantity_summary": "",
                "artwork_status": "",
                "proof_status": "",
                "proof_approved_date": "",
                "supplier_or_printer": "",
                "po_number": "",
                "po_sent_date": "",
                "po_confirmed": "",
                "production_status": "",
                "expected_ship_date": "",
                "tracking_number": "",
                "ship_to": "",
                "invoice_number": "",
                "invoice_status": "",
                "payment_status": "",
                "estimated_revenue": "",
                "estimated_vendor_cost": "",
                "estimated_margin": "",
                "source_links": "",
                "notes": "Starter row; replace with a real live order.",
            }
        )
    return rows


def write_action_board(
    output_dir: Path,
    ar_actions: list[dict[str, object]],
    vendor_rows: list[dict[str, object]],
    gap_rows: list[dict[str, object]],
    total_ar: float,
    overdue_total: float,
    overdue_pct: float,
) -> Path:
    lines: list[str] = [
        "# Backend Action Board - Creative Alternatives",
        "",
        f"> Generated {date.today().isoformat()}. Open this first during the backend ops check-in.",
        "",
        "## Today at a Glance",
        "",
        f"- Open AR in export: **{fmt_money(total_ar)}**.",
        f"- Past-due AR: **{fmt_money(overdue_total)}** ({fmt_pct(overdue_pct)}).",
        f"- First operating question: **where is the active open-order list today?**",
        f"- First live workflow to map: **one recent printer/decorator order**.",
        "",
        "## Top AR Actions",
        "",
        "| Customer | Amount Open | Bucket | Tier | Risk | Recommended Next Step |",
        "| --- | ---: | --- | --- | --- | --- |",
    ]
    for row in ar_actions[:10]:
        lines.append(
            "| "
            + " | ".join(
                [
                    str(row["customer_name"]),
                    fmt_money(float(row["amount_open"])),
                    str(row["aging_bucket"]),
                    str(row["customer_tier"]),
                    str(row["relationship_risk"]),
                    str(row["recommended_channel"]),
                ]
            )
            + " |"
        )

    lines.extend(
        [
            "",
            "Guardrail: export invoice detail and approve tone before sending anything.",
            "",
            "## Vendor / Printer Workflows to Map",
            "",
            "| Vendor | Spend | Type | Do Not Disrupt | Map This Next |",
            "| --- | ---: | --- | --- | --- |",
        ]
    )
    mapped_count = 0
    for row in vendor_rows:
        if str(row.get("vendor_type")) in {"Product supplier / wholesaler", "Printer / decorator", "Review"}:
            lines.append(
                "| "
                + " | ".join(
                    [
                        str(row["vendor_name"]),
                        fmt_money(float(row["export_spend"])),
                        str(row["vendor_type"]),
                        str(row["do_not_disrupt"]),
                        "PO method, confirmation, tracking, invoice matching",
                    ]
                )
                + " |"
            )
            mapped_count += 1
        if mapped_count >= 10:
            break

    lines.extend(
        [
            "",
            "## Blocking Gaps",
            "",
            "| Gap | Priority | Next Step |",
            "| --- | --- | --- |",
        ]
    )
    for row in gap_rows:
        lines.append(f"| {row['gap_title']} | {row['priority']} | {row['next_step']} |")

    lines.extend(
        [
            "",
            "## Live Orders to Add Today",
            "",
            "Add five real orders into `open-order-tracker-starter.csv`:",
            "",
            "1. One normal apparel order.",
            "2. One rush order.",
            "3. One high-dollar customer order.",
            "4. One printer/decorator order.",
            "5. One order with payment or invoice confusion.",
            "",
            "## Questions to Ask Today",
            "",
            "1. Does QuickBooks currently use estimates, POs, bills, projects, or invoices only?",
            "2. Where is the active open-order list today?",
            "3. Where do printer/vendor confirmations arrive?",
            "4. Where are vendor costs captured before customer invoicing?",
            "5. Where do approved proofs live?",
            "6. Who owns AR follow-up today?",
            "7. Which top vendors/printers require Kenny's personal relationship handling?",
            "",
        ]
    )

    path = output_dir / "backend-action-board.md"
    path.write_text("\n".join(lines))
    return path


def add_table(lines: list[str], headers: list[str], rows: list[list[str]]) -> None:
    lines.append("| " + " | ".join(headers) + " |")
    lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    lines.append("")


def generate_report(output_dir: Path) -> Path:
    ar = parse_ar_aging(IMPORT_DIR / "qb_ar_aging.csv")
    vendors = parse_two_column_total_report(IMPORT_DIR / "qb_expenses_by_vendor.csv", "vendor", "spend")
    customers = parse_two_column_total_report(IMPORT_DIR / "qb_sales_by_customer_total.csv", "customer", "sales")
    products = parse_products(IMPORT_DIR / "qb_sales_by_product.csv")
    contacts = parse_contacts(IMPORT_DIR / "qb_customer_contacts.csv")

    output_dir.mkdir(parents=True, exist_ok=True)

    ar_priority = top([row for row in ar.rows if float(row["overdue"]) > 0], "overdue", 50)
    top_vendors = top(vendors.rows, "spend", 50)
    top_customers = top(customers.rows, "sales", 50)
    top_products = top(products.rows, "amount", 50)
    ar_action_starter = build_ar_action_starter(ar_priority, top_customers)
    vendor_master_starter = build_vendor_master_starter(top_vendors)
    gap_register_starter = build_gap_register_starter()
    open_order_starter = build_open_order_starter()

    write_csv(output_dir / "ar-priority-list.csv", ar_priority, ["customer", "overdue", "91_over", "total", "overdue_pct"])
    write_csv(output_dir / "top-vendors.csv", top_vendors, ["vendor", "spend"])
    write_csv(output_dir / "top-customers.csv", top_customers, ["customer", "sales"])
    write_csv(output_dir / "top-products.csv", top_products, ["product", "quantity", "amount", "cogs"])
    write_csv(
        output_dir / "ar-action-tracker-starter.csv",
        ar_action_starter,
        [
            "action_id",
            "customer_name",
            "invoice_number",
            "invoice_date",
            "due_date",
            "aging_bucket",
            "amount_open",
            "customer_tier",
            "relationship_risk",
            "recommended_channel",
            "recommended_tone",
            "draft_status",
            "approved_by",
            "sent_date",
            "last_contact_date",
            "next_follow_up_date",
            "current_outcome",
            "payment_received_date",
            "amount_collected",
            "notes",
        ],
    )
    write_csv(
        output_dir / "vendor-master-starter.csv",
        vendor_master_starter,
        [
            "vendor_name",
            "export_spend",
            "vendor_type",
            "primary_contact",
            "email",
            "phone",
            "portal_url",
            "login_owner",
            "products_or_services",
            "decoration_methods",
            "typical_turnaround",
            "payment_terms",
            "po_required",
            "preferred_order_method",
            "confirmation_method",
            "tracking_method",
            "invoice_method",
            "known_strengths",
            "known_risks",
            "relationship_owner",
            "do_not_disrupt",
            "notes",
        ],
    )
    write_csv(
        output_dir / "backend-gap-register-starter.csv",
        gap_register_starter,
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
        output_dir / "open-order-tracker-starter.csv",
        open_order_starter,
        [
            "internal_job_id",
            "customer_name",
            "customer_contact",
            "request_source",
            "request_date",
            "needed_by_date",
            "order_owner",
            "current_status",
            "next_action",
            "next_action_owner",
            "next_action_due",
            "products_summary",
            "quantity_summary",
            "artwork_status",
            "proof_status",
            "proof_approved_date",
            "supplier_or_printer",
            "po_number",
            "po_sent_date",
            "po_confirmed",
            "production_status",
            "expected_ship_date",
            "tracking_number",
            "ship_to",
            "invoice_number",
            "invoice_status",
            "payment_status",
            "estimated_revenue",
            "estimated_vendor_cost",
            "estimated_margin",
            "source_links",
            "notes",
        ],
    )

    overdue_total = ar.totals["1_30"] + ar.totals["31_60"] + ar.totals["61_90"] + ar.totals["91_over"]
    total_ar = ar.totals["total"]
    overdue_pct = (overdue_total / total_ar * 100.0) if total_ar else 0.0
    vendor_total = vendors.total
    customer_total = customers.total
    product_total = products.total_amount
    cogs_zero_amount = sum(float(row["amount"]) for row in products.rows if float(row["amount"]) > 0 and float(row["cogs"]) == 0)
    cogs_zero_count = sum(1 for row in products.rows if float(row["amount"]) > 0 and float(row["cogs"]) == 0)
    top_vendor_concentration = sum(float(row["spend"]) for row in top_vendors[:10]) / vendor_total * 100.0 if vendor_total else 0.0
    top_customer_concentration = sum(float(row["sales"]) for row in top_customers[:10]) / customer_total * 100.0 if customer_total else 0.0
    write_action_board(output_dir, ar_action_starter, vendor_master_starter, gap_register_starter, total_ar, overdue_total, overdue_pct)

    lines: list[str] = [
        "# Backend Audit Packet - Creative Alternatives",
        "",
        f"> Generated {date.today().isoformat()} from QuickBooks exports in `context/import/`.",
        "",
        "## Executive Summary",
        "",
        f"- Total AR in export: **{fmt_money(total_ar)}**.",
        f"- Past-due AR: **{fmt_money(overdue_total)}** ({fmt_pct(overdue_pct)} of AR).",
        f"- 91+ day AR: **{fmt_money(ar.totals['91_over'])}**.",
        f"- Vendor spend in export: **{fmt_money(vendor_total)}** across {len(vendors.rows):,} named vendors.",
        f"- Top 10 vendors represent **{fmt_pct(top_vendor_concentration)}** of named vendor spend.",
        f"- Customer sales in export: **{fmt_money(customer_total)}** across {len(customers.rows):,} customers with sales rows.",
        f"- Top 10 customers represent **{fmt_pct(top_customer_concentration)}** of customer sales.",
        f"- Product/service revenue in export: **{fmt_money(product_total)}**.",
        f"- Product lines with positive revenue and zero COGS: **{cogs_zero_count:,}**, representing **{fmt_money(cogs_zero_amount)}**.",
        f"- Contact rows: **{contacts['total']:,}**; email present for **{fmt_pct(contacts['email'] / contacts['total'] * 100.0 if contacts['total'] else 0.0)}**, phone present for **{fmt_pct(contacts['phone'] / contacts['total'] * 100.0 if contacts['total'] else 0.0)}**.",
        "",
        "## AR Priority List",
        "",
        "These are the largest overdue balances from the current aging export. Treat relationship-heavy accounts with a human-approved tone.",
        "",
    ]

    add_table(
        lines,
        ["Customer", "Overdue", "91+", "Total", "Overdue %"],
        [
            [
                str(row["customer"]),
                fmt_money(float(row["overdue"])),
                fmt_money(float(row["91_over"])),
                fmt_money(float(row["total"])),
                fmt_pct(float(row["overdue_pct"])),
            ]
            for row in ar_priority[:15]
        ],
    )

    lines.extend(["## Top Vendors / Printers / Suppliers", ""])
    add_table(
        lines,
        ["Vendor", "Spend"],
        [[str(row["vendor"]), fmt_money(float(row["spend"]))] for row in top_vendors[:20]],
    )

    lines.extend(["## Top Customers", ""])
    add_table(
        lines,
        ["Customer", "Sales"],
        [[str(row["customer"]), fmt_money(float(row["sales"]))] for row in top_customers[:20]],
    )

    lines.extend(["## Top Products / Services", ""])
    add_table(
        lines,
        ["Product", "Quantity", "Revenue", "COGS"],
        [
            [
                str(row["product"]),
                f"{float(row['quantity']):,.0f}",
                fmt_money(float(row["amount"])),
                fmt_money(float(row["cogs"])),
            ]
            for row in top_products[:20]
        ],
    )

    lines.extend(
        [
            "## Backend Gap Signals From Data",
            "",
            "- **AR is a cash and workflow gap.** More than half of AR is past due in this export, so follow-up needs a cadence and owner.",
            "- **Payment reconciliation needs an exception workflow.** The documented 8-hour manual payment-to-invoice matching problem should become a recurring exception report.",
            "- **Vendor/printer management needs structure.** Vendor spend is concentrated enough that top vendor workflows should be mapped first.",
            "- **Margin visibility is incomplete.** Positive-revenue product lines show zero COGS, so job/product/customer profitability likely needs a separate cost capture process.",
            "- **Customer concentration matters.** Top customers deserve relationship-safe AR, reorder, and fulfillment handling.",
            "- **Contact quality affects revenue recovery.** Email/phone gaps will limit reorders and AR follow-up until cleaned or enriched.",
            "",
            "## Recommended Next Operating Actions",
            "",
            "1. Run `backend-reality-walkthrough.md` on one recent printer/decorator order.",
            "2. Open `ar-action-tracker-starter.csv`, assign an owner, and export invoice detail before sending any reminders.",
            "3. Open `vendor-master-starter.csv` and map how each top vendor receives POs and confirmations.",
            "4. Start the `templates/open-order-tracker-template.csv` with 5-10 live jobs.",
            "5. Ask Maclaine where item/vendor costs are tracked if QuickBooks COGS is zero.",
            "6. Decide whether the first automation loop is AR worklist, reconciliation exceptions, PO follow-up, or open-order brief.",
            "",
            "## Files Generated",
            "",
            "- `ar-priority-list.csv`",
            "- `ar-action-tracker-starter.csv`",
            "- `top-vendors.csv`",
            "- `vendor-master-starter.csv`",
            "- `top-customers.csv`",
            "- `top-products.csv`",
            "- `backend-gap-register-starter.csv`",
            "- `open-order-tracker-starter.csv`",
            "- `backend-action-board.md`",
            "",
        ]
    )

    report_path = output_dir / "backend-audit-report.md"
    report_path.write_text("\n".join(lines))
    return report_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate backend audit packet from QuickBooks exports.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_ROOT / f"backend-audit-{date.today().isoformat()}",
        help="Directory to write report and CSVs.",
    )
    args = parser.parse_args()
    report = generate_report(args.output_dir)
    print(f"Wrote {report}")


if __name__ == "__main__":
    main()
