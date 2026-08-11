"""Local inbound KPI warehouse and source-to-revenue report.

The importer stores stable IDs and acquisition/financial facts, not contact PII. It
accepts canonical CSV exports from HubSpot, ad platforms, and QuickBooks matching,
then produces an acquisition-cohort report by niche and source.

Usage:
    .venv/bin/python scripts/ca_inbound_metrics.py init
    .venv/bin/python scripts/ca_inbound_metrics.py templates
    .venv/bin/python scripts/ca_inbound_metrics.py ingest --kind inquiries --file export.csv
    .venv/bin/python scripts/ca_inbound_metrics.py report --start 2026-07-01 --end 2026-07-31
"""

from __future__ import annotations

import argparse
import csv
import sqlite3
import sys
from collections import defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DB = ROOT / "data" / "data.db"
DEFAULT_TEMPLATE_DIR = ROOT / "outputs" / "inbound" / "templates"
DEFAULT_REPORT_DIR = ROOT / "outputs" / "inbound" / "reports"

SCHEMAS: dict[str, dict[str, Any]] = {
    "inquiries": {
        "table": "inbound_inquiries",
        "key": "inquiry_id",
        "required": {"inquiry_id", "inquiry_date", "niche", "qualification_status"},
        "columns": [
            "inquiry_id",
            "inquiry_date",
            "niche",
            "service_interest",
            "offer",
            "first_touch_source",
            "latest_touch_source",
            "latest_touch_medium",
            "latest_touch_campaign",
            "landing_page",
            "qualification_status",
            "no_fit_reason",
            "priority_score",
            "owner",
            "response_due",
            "first_response_at",
            "company_id",
            "quickbooks_customer_id",
        ],
        "date_columns": {"inquiry_date", "response_due", "first_response_at"},
        "float_columns": {"priority_score"},
        "int_columns": set(),
    },
    "deals": {
        "table": "inbound_deals",
        "key": "deal_id",
        "required": {"deal_id", "inquiry_id", "created_date", "stage"},
        "columns": [
            "deal_id",
            "inquiry_id",
            "created_date",
            "stage",
            "quote_value",
            "closed_date",
            "won",
            "new_customer",
            "closed_revenue",
            "delivery_burden",
            "quickbooks_customer_id",
            "quickbooks_order_invoice_id",
        ],
        "date_columns": {"created_date", "closed_date"},
        "float_columns": {"quote_value", "closed_revenue"},
        "int_columns": {"won", "new_customer"},
    },
    "spend": {
        "table": "inbound_spend",
        "key": "spend_key",
        "required": {"date", "channel", "campaign", "niche", "spend"},
        "columns": ["date", "channel", "campaign", "niche", "spend", "clicks", "impressions"],
        "date_columns": {"date"},
        "float_columns": {"spend"},
        "int_columns": {"clicks", "impressions"},
    },
}

ALIASES = {
    "ca_inquiry_id": "inquiry_id",
    "ca_inquiry_date": "inquiry_date",
    "ca_niche": "niche",
    "ca_service_interest": "service_interest",
    "ca_offer": "offer",
    "ca_first_touch_source": "first_touch_source",
    "ca_latest_touch_source": "latest_touch_source",
    "ca_latest_touch_medium": "latest_touch_medium",
    "ca_latest_touch_campaign": "latest_touch_campaign",
    "ca_landing_page": "landing_page",
    "ca_qualification_status": "qualification_status",
    "ca_no_fit_reason": "no_fit_reason",
    "ca_priority_score": "priority_score",
    "ca_response_due": "response_due",
    "ca_quickbooks_customer_id": "quickbooks_customer_id",
    "ca_quote_value": "quote_value",
    "ca_closed_revenue": "closed_revenue",
    "ca_delivery_burden": "delivery_burden",
    "ca_quickbooks_order_invoice_id": "quickbooks_order_invoice_id",
    "hs_object_id": "deal_id",
    "dealstage": "stage",
    "createdate": "created_date",
    "closedate": "closed_date",
}


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS inbound_inquiries (
            inquiry_id TEXT PRIMARY KEY,
            inquiry_date TEXT NOT NULL,
            niche TEXT NOT NULL,
            service_interest TEXT,
            offer TEXT,
            first_touch_source TEXT,
            latest_touch_source TEXT,
            latest_touch_medium TEXT,
            latest_touch_campaign TEXT,
            landing_page TEXT,
            qualification_status TEXT NOT NULL,
            no_fit_reason TEXT,
            priority_score REAL,
            owner TEXT,
            response_due TEXT,
            first_response_at TEXT,
            company_id TEXT,
            quickbooks_customer_id TEXT,
            imported_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inbound_deals (
            deal_id TEXT PRIMARY KEY,
            inquiry_id TEXT NOT NULL,
            created_date TEXT NOT NULL,
            stage TEXT NOT NULL,
            quote_value REAL,
            closed_date TEXT,
            won INTEGER NOT NULL DEFAULT 0 CHECK (won IN (0, 1)),
            new_customer INTEGER NOT NULL DEFAULT 0 CHECK (new_customer IN (0, 1)),
            closed_revenue REAL,
            delivery_burden TEXT,
            quickbooks_customer_id TEXT,
            quickbooks_order_invoice_id TEXT,
            imported_at TEXT NOT NULL,
            FOREIGN KEY (inquiry_id) REFERENCES inbound_inquiries(inquiry_id)
        );

        CREATE TABLE IF NOT EXISTS inbound_spend (
            spend_key TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            channel TEXT NOT NULL,
            campaign TEXT NOT NULL,
            niche TEXT NOT NULL,
            spend REAL NOT NULL DEFAULT 0,
            clicks INTEGER NOT NULL DEFAULT 0,
            impressions INTEGER NOT NULL DEFAULT 0,
            imported_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inbound_import_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            imported_at TEXT NOT NULL,
            kind TEXT NOT NULL,
            source_file TEXT NOT NULL,
            rows_seen INTEGER NOT NULL,
            rows_written INTEGER NOT NULL,
            rows_rejected INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_inbound_inquiry_date ON inbound_inquiries(inquiry_date);
        CREATE INDEX IF NOT EXISTS idx_inbound_inquiry_niche ON inbound_inquiries(niche);
        CREATE INDEX IF NOT EXISTS idx_inbound_deal_inquiry ON inbound_deals(inquiry_id);
        CREATE INDEX IF NOT EXISTS idx_inbound_spend_date ON inbound_spend(date);
        """
    )
    conn.commit()


def normalize_header(value: str) -> str:
    key = value.lstrip("\ufeff").strip().lower().replace(" ", "_").replace("-", "_")
    return ALIASES.get(key, key)


def parse_date(value: str, field: str) -> str:
    text = value.strip()
    if not text:
        return ""
    candidate = text.replace("Z", "+00:00")
    try:
        if "T" in candidate or " " in candidate:
            datetime.fromisoformat(candidate)
        else:
            date.fromisoformat(candidate[:10])
    except ValueError as error:
        raise ValueError(f"{field} must use ISO date or datetime: {text!r}") from error
    return text


def parse_bool(value: str, field: str) -> int:
    text = value.strip().lower()
    if text in {"1", "true", "yes", "y", "won", "closed won"}:
        return 1
    if text in {"", "0", "false", "no", "n", "lost", "closed lost"}:
        return 0
    raise ValueError(f"{field} must be true/false or 1/0: {value!r}")


def parse_float(value: str, field: str) -> float | None:
    text = value.strip().replace("$", "").replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError as error:
        raise ValueError(f"{field} must be numeric: {value!r}") from error


def parse_int(value: str, field: str) -> int:
    if field in {"won", "new_customer"}:
        return parse_bool(value, field)
    number = parse_float(value, field)
    return int(number or 0)


def normalize_row(kind: str, raw: dict[str, str], row_number: int) -> dict[str, Any]:
    spec = SCHEMAS[kind]
    mapped = {normalize_header(key): (value or "").strip() for key, value in raw.items() if key}
    missing = sorted(field for field in spec["required"] if not mapped.get(field))
    if missing:
        raise ValueError(f"row {row_number}: missing {', '.join(missing)}")

    row: dict[str, Any] = {}
    for column in spec["columns"]:
        value = mapped.get(column, "")
        if column in spec["date_columns"]:
            row[column] = parse_date(value, column)
        elif column in spec["float_columns"]:
            row[column] = parse_float(value, column)
        elif column in spec["int_columns"]:
            row[column] = parse_int(value, column)
        else:
            row[column] = value[:2000]

    if kind == "spend":
        row["spend_key"] = "|".join(
            [row["date"][:10], row["channel"].lower(), row["campaign"], row["niche"].lower()]
        )
    row["imported_at"] = datetime.now(timezone.utc).isoformat()
    return row


def upsert(conn: sqlite3.Connection, table: str, key: str, row: dict[str, Any]) -> None:
    columns = list(row)
    updates = [column for column in columns if column != key]
    placeholders = ",".join("?" for _ in columns)
    sql = (
        f"INSERT INTO {table} ({','.join(columns)}) VALUES ({placeholders}) "
        f"ON CONFLICT({key}) DO UPDATE SET "
        + ",".join(f"{column}=excluded.{column}" for column in updates)
    )
    conn.execute(sql, [row[column] for column in columns])


def ingest_csv(conn: sqlite3.Connection, kind: str, path: Path, strict: bool = True) -> tuple[int, int, list[str]]:
    spec = SCHEMAS[kind]
    seen = 0
    written = 0
    errors: list[str] = []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError("CSV has no header row")
        for row_number, raw in enumerate(reader, start=2):
            seen += 1
            try:
                row = normalize_row(kind, raw, row_number)
                upsert(conn, spec["table"], spec["key"], row)
                written += 1
            except ValueError as error:
                errors.append(str(error))
                if strict:
                    conn.rollback()
                    raise

    conn.execute(
        """INSERT INTO inbound_import_log
           (imported_at, kind, source_file, rows_seen, rows_written, rows_rejected)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            datetime.now(timezone.utc).isoformat(),
            kind,
            str(path),
            seen,
            written,
            len(errors),
        ),
    )
    conn.commit()
    return seen, written, errors


def write_templates(output: Path) -> int:
    output.mkdir(parents=True, exist_ok=True)
    for kind, spec in SCHEMAS.items():
        with (output / f"{kind}-template.csv").open("w", newline="") as handle:
            writer = csv.writer(handle)
            writer.writerow(spec["columns"])
    return len(SCHEMAS)


def safe_div(numerator: float, denominator: float) -> float | None:
    return numerator / denominator if denominator else None


def money(value: float | None) -> str:
    return "-" if value is None else f"${value:,.0f}"


def percent(value: float | None) -> str:
    return "-" if value is None else f"{value * 100:.1f}%"


def calculate_metrics(inquiries: list[dict[str, Any]], deals: list[dict[str, Any]], spend: float) -> dict[str, Any]:
    inquiry_ids = {row["inquiry_id"] for row in inquiries}
    relevant_deals = [row for row in deals if row["inquiry_id"] in inquiry_ids]
    qualified = sum(1 for row in inquiries if row["qualification_status"] == "qualified")
    quote_deals = [
        row
        for row in relevant_deals
        if (row.get("quote_value") or 0) > 0 or "quote" in (row.get("stage") or "").lower()
    ]
    won_deals = [row for row in relevant_deals if row.get("won") == 1]
    new_customers = sum(1 for row in won_deals if row.get("new_customer") == 1)
    revenue = sum(float(row.get("closed_revenue") or 0) for row in won_deals)
    quote_value = sum(float(row.get("quote_value") or 0) for row in quote_deals)
    return {
        "inquiries": len(inquiries),
        "qualified": qualified,
        "quotes": len(quote_deals),
        "quote_value": quote_value,
        "wins": len(won_deals),
        "new_customers": new_customers,
        "revenue": revenue,
        "spend": spend,
        "qualified_rate": safe_div(qualified, len(inquiries)),
        "quote_rate": safe_div(len(quote_deals), qualified),
        "win_rate": safe_div(len(won_deals), len(quote_deals)),
        "cost_per_lead": safe_div(spend, len(inquiries)),
        "cost_per_qualified": safe_div(spend, qualified),
        "cac": safe_div(spend, new_customers),
    }


def rows_between(conn: sqlite3.Connection, table: str, column: str, start: str, end: str) -> list[dict[str, Any]]:
    rows = conn.execute(
        f"SELECT * FROM {table} WHERE substr({column}, 1, 10) BETWEEN ? AND ?",
        (start, end),
    ).fetchall()
    return [dict(row) for row in rows]


def generate_report(conn: sqlite3.Connection, start: str, end: str) -> str:
    inquiries = rows_between(conn, "inbound_inquiries", "inquiry_date", start, end)
    deals = [dict(row) for row in conn.execute("SELECT * FROM inbound_deals").fetchall()]
    spend_rows = rows_between(conn, "inbound_spend", "date", start, end)
    total_spend = sum(float(row.get("spend") or 0) for row in spend_rows)
    totals = calculate_metrics(inquiries, deals, total_spend)

    spend_by_niche: dict[str, float] = defaultdict(float)
    for row in spend_rows:
        spend_by_niche[row["niche"] or "unknown"] += float(row.get("spend") or 0)
    inquiries_by_niche: dict[str, list[dict[str, Any]]] = defaultdict(list)
    inquiries_by_source: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in inquiries:
        inquiries_by_niche[row.get("niche") or "unknown"].append(row)
        inquiries_by_source[row.get("latest_touch_source") or "unknown"].append(row)

    spend_by_source: dict[str, float] = defaultdict(float)
    for row in spend_rows:
        spend_by_source[row.get("channel") or "unknown"] += float(row.get("spend") or 0)

    overdue = sum(
        1
        for row in inquiries
        if row.get("response_due")
        and row["response_due"][:10] <= end
        and not row.get("first_response_at")
    )
    unknown_source = sum(1 for row in inquiries if not row.get("latest_touch_source"))
    unknown_niche = sum(1 for row in inquiries if not row.get("niche") or row.get("niche") == "other")
    won_deals = [row for row in deals if row.get("inquiry_id") in {x["inquiry_id"] for x in inquiries} and row.get("won") == 1]
    unmatched_wins = sum(
        1
        for row in won_deals
        if not row.get("quickbooks_customer_id") or not row.get("quickbooks_order_invoice_id")
    )

    lines = [
        "# Inbound Performance Report",
        "",
        f"**Acquisition cohort:** {start} through {end}",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "## Executive Scorecard",
        "",
        "| Metric | Value |",
        "|---|---:|",
        f"| Inquiries | {totals['inquiries']:,} |",
        f"| Qualified leads | {totals['qualified']:,} |",
        f"| Qualified rate | {percent(totals['qualified_rate'])} |",
        f"| Quotes | {totals['quotes']:,} |",
        f"| Quote value | {money(totals['quote_value'])} |",
        f"| Wins | {totals['wins']:,} |",
        f"| New customers | {totals['new_customers']:,} |",
        f"| Reconciled closed revenue | {money(totals['revenue'])} |",
        f"| Tracked spend | {money(totals['spend'])} |",
        f"| Cost per qualified lead | {money(totals['cost_per_qualified'])} |",
        f"| New-customer CAC | {money(totals['cac'])} |",
        "",
        "## By Niche",
        "",
        "| Niche | Leads | Qualified | Quotes | Wins | Revenue | Spend | CPQL |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for niche, niche_rows in sorted(inquiries_by_niche.items()):
        metrics = calculate_metrics(niche_rows, deals, spend_by_niche.get(niche, 0))
        lines.append(
            f"| {niche} | {metrics['inquiries']} | {metrics['qualified']} | {metrics['quotes']} | "
            f"{metrics['wins']} | {money(metrics['revenue'])} | {money(metrics['spend'])} | "
            f"{money(metrics['cost_per_qualified'])} |"
        )
    if not inquiries_by_niche:
        lines.append("| No cohort data | 0 | 0 | 0 | 0 | - | - | - |")

    lines.extend(
        [
            "",
            "## By Latest Source",
            "",
            "| Source | Leads | Qualified | Quotes | Wins | Revenue |",
            "|---|---:|---:|---:|---:|---:|",
        ]
    )
    for source, source_rows in sorted(inquiries_by_source.items()):
        metrics = calculate_metrics(source_rows, deals, spend_by_source.get(source, 0))
        lines.append(
            f"| {source} | {metrics['inquiries']} | {metrics['qualified']} | {metrics['quotes']} | "
            f"{metrics['wins']} | {money(metrics['revenue'])} |"
        )
    if not inquiries_by_source:
        lines.append("| No cohort data | 0 | 0 | 0 | 0 | - |")

    no_fit: dict[str, int] = defaultdict(int)
    for row in inquiries:
        if row.get("qualification_status") == "no_fit":
            no_fit[row.get("no_fit_reason") or "unspecified"] += 1
    lines.extend(["", "## Data And Follow-Up QA", ""])
    lines.append(f"- Overdue inquiries without first response: **{overdue}**")
    lines.append(f"- Unknown latest source: **{unknown_source}** ({percent(safe_div(unknown_source, len(inquiries)))})")
    lines.append(f"- Unknown/other niche: **{unknown_niche}** ({percent(safe_div(unknown_niche, len(inquiries)))})")
    lines.append(f"- Won deals missing a QuickBooks customer or order/invoice key: **{unmatched_wins}**")
    if no_fit:
        lines.extend(["", "### No-Fit Reasons", ""])
        for reason, count in sorted(no_fit.items(), key=lambda item: (-item[1], item[0])):
            lines.append(f"- {reason}: {count}")

    lines.extend(
        [
            "",
            "## Decision Rule",
            "",
            "Scale, revise, pause, or consolidate using qualified pipeline, customer revenue, and delivery burden. "
            "Traffic and raw submissions are diagnostic, not the final outcome.",
            "",
        ]
    )
    return "\n".join(lines)


def default_period() -> tuple[str, str]:
    today = date.today()
    return today.replace(day=1).isoformat(), today.isoformat()


def cmd_init(args: argparse.Namespace) -> int:
    conn = connect(Path(args.db))
    init_schema(conn)
    conn.close()
    print(f"inbound tables ready: {args.db}")
    return 0


def cmd_templates(args: argparse.Namespace) -> int:
    count = write_templates(Path(args.output))
    print(f"wrote {count} templates to {args.output}")
    return 0


def cmd_ingest(args: argparse.Namespace) -> int:
    conn = connect(Path(args.db))
    init_schema(conn)
    try:
        seen, written, errors = ingest_csv(conn, args.kind, Path(args.file), strict=not args.allow_rejects)
    except (OSError, ValueError, sqlite3.IntegrityError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        conn.close()
        return 1
    conn.close()
    print(f"{args.kind}: {written}/{seen} rows written; {len(errors)} rejected")
    for error in errors:
        print(f"REJECTED: {error}", file=sys.stderr)
    return 2 if errors else 0


def cmd_report(args: argparse.Namespace) -> int:
    start, end = args.start, args.end
    try:
        date.fromisoformat(start)
        date.fromisoformat(end)
    except ValueError:
        print("ERROR: --start and --end must be YYYY-MM-DD", file=sys.stderr)
        return 1
    if start > end:
        print("ERROR: --start must not be after --end", file=sys.stderr)
        return 1
    conn = connect(Path(args.db))
    init_schema(conn)
    report = generate_report(conn, start, end)
    conn.close()
    if args.dry_run:
        print(report)
        return 0
    output = Path(args.output) if args.output else DEFAULT_REPORT_DIR / f"{end}-inbound-report.md"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(report)
    print(f"report saved: {output}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    start, end = default_period()
    parser = argparse.ArgumentParser(description="CA inbound KPI warehouse and cohort reporting")
    parser.add_argument("--db", default=str(DEFAULT_DB))
    sub = parser.add_subparsers(dest="command", required=True)

    init = sub.add_parser("init")
    init.set_defaults(func=cmd_init)

    templates = sub.add_parser("templates")
    templates.add_argument("--output", default=str(DEFAULT_TEMPLATE_DIR))
    templates.set_defaults(func=cmd_templates)

    ingest = sub.add_parser("ingest")
    ingest.add_argument("--kind", choices=SCHEMAS, required=True)
    ingest.add_argument("--file", required=True)
    ingest.add_argument("--allow-rejects", action="store_true")
    ingest.set_defaults(func=cmd_ingest)

    report = sub.add_parser("report")
    report.add_argument("--start", default=start)
    report.add_argument("--end", default=end)
    report.add_argument("--output")
    report.add_argument("--dry-run", action="store_true")
    report.set_defaults(func=cmd_report)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
