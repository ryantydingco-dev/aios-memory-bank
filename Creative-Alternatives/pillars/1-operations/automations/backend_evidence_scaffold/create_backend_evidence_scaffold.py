#!/usr/bin/env python3
"""Create a dated backend audit evidence scaffold."""

from __future__ import annotations

import argparse
import csv
from datetime import date
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_ROOT = WORKSPACE_ROOT / "context/import/backend-audit"


SUBFOLDERS = [
    "quickbooks",
    "email-threads",
    "purchase-orders",
    "proofs-artwork",
    "shipping-tracking",
    "spreadsheets",
    "screenshots",
    "notes",
    "relationship-rules",
]


ORDER_ARTIFACTS = [
    ("customer_request", "Original customer request thread, call note, text, or intake source"),
    ("quote_or_estimate", "Quote email, QuickBooks estimate, spreadsheet quote, or pricing notes"),
    ("customer_approval", "Written customer approval, proof approval, or order confirmation"),
    ("po_or_vendor_order", "QuickBooks PO, vendor portal order, PDF, email, or text"),
    ("vendor_confirmation", "Vendor/printer confirmation, production date, ship date, or portal screenshot"),
    ("proof_or_artwork", "Approved proof, art file location, final art, or version notes"),
    ("shipping_or_tracking", "Tracking email, UPS/FedEx/portal screenshot, or delivery note"),
    ("invoice_or_payment", "Invoice, payment status, deposit match, or AR note"),
]


QUICKBOOKS_EXPORTS = [
    ("qb_invoice_detail.csv", "Invoice detail for one representative month plus current open invoices"),
    ("qb_payments_deposits_detail.csv", "Payments/deposits detail for the same month as invoice detail"),
    ("qb_open_invoices.csv", "Current open invoices"),
    ("qb_open_purchase_orders.csv", "Open purchase orders, if QuickBooks POs are used"),
    ("qb_unpaid_bills_vendor_bills.csv", "Unpaid bills/vendor bills, if vendor bills are entered"),
    ("qb_estimates_quotes.csv", "Estimates/quotes for one representative month, if estimates are used"),
]


def write_csv(path: Path, rows: list[dict[str, str]], fields: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def create_order_checklist(order_dir: Path, order_idx: int) -> None:
    lines = [
        f"# Order {order_idx:02d} Evidence Checklist",
        "",
        "Use this folder for one real order packet. Redact public/filming copies, but keep internal evidence complete enough to audit the workflow.",
        "",
        "## Required artifacts",
        "",
    ]
    for slug, description in ORDER_ARTIFACTS:
        lines.append(f"- [ ] `{slug}` — {description}")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- Customer:",
            "- Internal job/order ID:",
            "- Order type:",
            "- Owner:",
            "- What broke or felt manual:",
            "- Follow-up needed:",
            "",
        ]
    )
    (order_dir / "README.md").write_text("\n".join(lines), encoding="utf-8")


def create_manifest(root: Path) -> None:
    rows: list[dict[str, str]] = []
    for file_name, description in QUICKBOOKS_EXPORTS:
        rows.append(
            {
                "evidence_type": "quickbooks_export",
                "expected_path": f"quickbooks/{file_name}",
                "description": description,
                "status": "missing",
                "owner": "Maclaine [CONFIRM]",
                "notes": "",
            }
        )
    for order_idx in range(1, 6):
        for slug, description in ORDER_ARTIFACTS:
            rows.append(
                {
                    "evidence_type": "order_packet",
                    "expected_path": f"orders/order-{order_idx:02d}/{slug}",
                    "description": description,
                    "status": "missing",
                    "owner": "Ryan/Maclaine [CONFIRM]",
                    "notes": "",
                }
            )
    rows.extend(
        [
            {
                "evidence_type": "spreadsheet_inventory",
                "expected_path": "spreadsheets/",
                "description": "Weekly business spreadsheets or links/exports",
                "status": "missing",
                "owner": "Maclaine/Kenny [CONFIRM]",
                "notes": "",
            },
            {
                "evidence_type": "relationship_rules",
                "expected_path": "relationship-rules/personal-handling-rules.md",
                "description": "Customers/vendors requiring Kenny or Maclaine personal handling",
                "status": "missing",
                "owner": "Kenny/Maclaine [CONFIRM]",
                "notes": "",
            },
        ]
    )
    write_csv(root / "MANIFEST.csv", rows, ["evidence_type", "expected_path", "description", "status", "owner", "notes"])


def create_session_notes(root: Path, session_date: str) -> None:
    lines = [
        f"# Backend Audit Session Notes — {session_date}",
        "",
        "## Attendees",
        "",
        "- Ryan:",
        "- Maclaine:",
        "- Kenny:",
        "",
        "## QuickBooks answers",
        "",
        "- QuickBooks version:",
        "- Transaction types used:",
        "- First thing created when customer approves:",
        "- Are POs used in QuickBooks?",
        "- Are bills/vendor costs linked to customer jobs?",
        "",
        "## Email/order intake answers",
        "",
        "- Where new orders come in:",
        "- Shared inbox/labels/folders:",
        "- Kenny personal inbox dependencies:",
        "",
        "## PO/printer answers",
        "",
        "- How POs are sent:",
        "- Where confirmations arrive:",
        "- Where tracking arrives:",
        "- Where vendor invoices arrive:",
        "",
        "## Spreadsheets",
        "",
        "- Weekly sheets:",
        "- Owner:",
        "- What duplicates QuickBooks:",
        "",
        "## Relationship rules",
        "",
        "- Customers needing personal handling:",
        "- Vendors/printers needing personal handling:",
        "- Do-not-automate rules:",
        "",
        "## Gaps found",
        "",
        "- ",
        "",
        "## First automation leaning",
        "",
        "- ",
        "",
    ]
    (root / "session-notes.md").write_text("\n".join(lines), encoding="utf-8")


def create_root_readme(root: Path, session_date: str) -> None:
    lines = [
        f"# Backend Audit Evidence — {session_date}",
        "",
        "Drop live backend evidence here before running the auditor.",
        "",
        "## Recommended flow",
        "",
        "Fast path:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/backend_ops_runner/run_backend_ops_checks.py --date {session_date}",
        "```",
        "",
        "Detailed path:",
        "",
        "1. Add QuickBooks exports to `quickbooks/`.",
        "2. Add five real order packets to `orders/order-01/` through `orders/order-05/`.",
        "3. Add weekly spreadsheet exports or links to `spreadsheets/`.",
        "4. Add customer/vendor personal-handling rules to `relationship-rules/`.",
        "5. Create or refresh the session answer intake:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/backend_session_intake/create_backend_session_intake.py --date {session_date}",
        "```",
        "",
        "6. Fill `backend-answer-intake.csv` in this evidence folder.",
        "",
        "Or record answers by question ID:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py --date {session_date} --question Q001 --answer \"QuickBooks Online\" --source-system \"QuickBooks Online\"",
        "```",
        "",
        "7. Update `MANIFEST.csv` statuses if useful.",
        "8. Run the backend answer compiler:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py --input context/import/backend-audit/{session_date}/backend-answer-intake.csv",
        "```",
        "",
        "9. Run the QuickBooks export validator:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/quickbooks_export_validator/validate_quickbooks_exports.py --quickbooks-dir context/import/backend-audit/{session_date}/quickbooks",
        "```",
        "",
        "10. Run the email thread auditor:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/email_thread_auditor/audit_email_threads.py --evidence-dir context/import/backend-audit/{session_date}",
        "```",
        "",
        "11. Run the evidence auditor:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py --evidence-dir context/import/backend-audit/{session_date}",
        "```",
        "",
        "12. Regenerate the readiness dashboard:",
        "",
        "```bash",
        f"python3 pillars/1-operations/automations/backend_readiness_dashboard/generate_backend_readiness_dashboard.py --date {session_date}",
        "```",
        "",
        "## Guardrails",
        "",
        "- No customer/vendor/money-facing action from this folder without human approval.",
        "- Redact footage/public examples.",
        "- Keep internal evidence complete enough to audit the actual workflow.",
        "",
    ]
    (root / "README.md").write_text("\n".join(lines), encoding="utf-8")


def create_scaffold(session_date: str, root_dir: Path) -> Path:
    root = root_dir / session_date
    root.mkdir(parents=True, exist_ok=True)
    for folder in SUBFOLDERS:
        (root / folder).mkdir(parents=True, exist_ok=True)
    orders_root = root / "orders"
    for order_idx in range(1, 6):
        order_dir = orders_root / f"order-{order_idx:02d}"
        order_dir.mkdir(parents=True, exist_ok=True)
        create_order_checklist(order_dir, order_idx)
    create_manifest(root)
    create_session_notes(root, session_date)
    create_root_readme(root, session_date)
    return root


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat(), help="Session date in YYYY-MM-DD format.")
    parser.add_argument(
        "--root-dir",
        type=Path,
        default=DEFAULT_ROOT,
        help="Root evidence directory where the dated folder should be created.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root_dir = args.root_dir
    if not root_dir.is_absolute():
        root_dir = WORKSPACE_ROOT / root_dir
    root = create_scaffold(args.date, root_dir)
    print(f"Created backend evidence scaffold at {root}")


if __name__ == "__main__":
    main()
