"""
AIOS Client Workspace — Key Metrics Generator

Reads the database and generates a human-readable key-metrics.md file.
This file is loaded by /prime so Claude always has fresh data.

Automatically discovers which tables exist and generates sections for each.

Usage:
    python scripts/generate_metrics.py
"""

import sqlite3
from datetime import datetime
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "data.db"
OUTPUT_PATH = WORKSPACE_ROOT / "context" / "group" / "key-metrics.md"


# --- Formatting helpers ---

def fmt_number(value, prefix="", suffix=""):
    """Format a number with commas. Returns 'No data' if None."""
    if value is None:
        return "No data"
    if isinstance(value, float):
        return f"{prefix}{value:,.0f}{suffix}"
    return f"{prefix}{value:,}{suffix}"


def fmt_pct(value):
    """Format a percentage to 1 decimal place."""
    if value is None:
        return "No data"
    return f"{value:.1f}%"


def query_one(conn, sql):
    """Query helper — returns first row as dict or None."""
    try:
        row = conn.execute(sql).fetchone()
        return dict(row) if row else None
    except Exception:
        return None


def query_all(conn, sql):
    """Query helper — returns all rows as list of dicts."""
    try:
        return [dict(r) for r in conn.execute(sql).fetchall()]
    except Exception:
        return []


def table_exists(conn, name):
    """Check if a table exists."""
    r = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)
    ).fetchone()
    return r is not None


# ============================================================
# SECTION GENERATORS
# ============================================================


def section_smartlead(conn):
    """SmartLead outreach metrics."""
    if not table_exists(conn, "smartlead_daily"):
        return []
    lines = ["## Outreach (SmartLead)"]
    row = query_one(conn, "SELECT * FROM smartlead_daily ORDER BY date DESC LIMIT 1")
    if row:
        lines.append("| Metric | Value | As Of |")
        lines.append("|--------|-------|-------|")
        lines.append(f"| Emails Sent (total) | {fmt_number(row.get('emails_sent'))} | {row['date']} |")
        lines.append(f"| Unique Leads Contacted | {fmt_number(row.get('unique_sent'))} | {row['date']} |")
        lines.append(f"| Total Leads in Pipeline | {fmt_number(row.get('total_leads'))} | {row['date']} |")
        lines.append(f"| Opens | {fmt_number(row.get('opens'))} | {row['date']} |")
        lines.append(f"| Open Rate | {fmt_pct(row.get('open_rate'))} | {row['date']} |")
        lines.append(f"| Replies | {fmt_number(row.get('replies'))} | {row['date']} |")
        lines.append(f"| Reply Rate | {fmt_pct(row.get('reply_rate'))} | {row['date']} |")
        lines.append(f"| Bounces | {fmt_number(row.get('bounces'))} | {row['date']} |")
        lines.append(f"| Bounce Rate | {fmt_pct(row.get('bounce_rate'))} | {row['date']} |")
        lines.append(f"| Interested Leads | {fmt_number(row.get('leads_interested'))} | {row['date']} |")
        lines.append(f"| Active Campaigns | {fmt_number(row.get('active_campaigns'))} | {row['date']} |")
    lines.append("")

    # Per-campaign breakdown
    if table_exists(conn, "smartlead_campaigns"):
        camps = query_all(conn, """
            SELECT * FROM smartlead_campaigns
            WHERE date = (SELECT MAX(date) FROM smartlead_campaigns)
            ORDER BY emails_sent DESC
        """)
        if camps:
            lines.append("### Campaign Breakdown")
            lines.append("| Campaign | Status | Sent | Replies | Reply % | Leads |")
            lines.append("|----------|--------|------|---------|---------|-------|")
            for c in camps:
                reply_pct = (c['replies'] / c['unique_sent'] * 100) if c.get('unique_sent', 0) > 0 else 0
                lines.append(
                    f"| {c['campaign_name']} | {c['campaign_status']} | "
                    f"{fmt_number(c['emails_sent'])} | {c['replies']} | "
                    f"{fmt_pct(reply_pct)} | {fmt_number(c['total_leads'])} |"
                )
            lines.append("")

    return lines


def section_ca_financials(conn):
    """Creative Alternatives financials from QuickBooks exports."""
    if not table_exists(conn, "qb_ar_aging"):
        return []
    lines = ["## Financials (QuickBooks exports)",
             "> From CSV exports in `context/import/` — refresh by re-exporting from QBO.",
             ""]

    ar = query_one(conn, """
        SELECT date, SUM(total) AS total, SUM(current) AS current,
               SUM(d1_30) AS d1_30, SUM(d31_60) AS d31_60,
               SUM(d61_90) AS d61_90, SUM(d91_plus) AS d91_plus
        FROM qb_ar_aging GROUP BY date
    """)
    if ar and ar.get("total"):
        overdue = sum(ar.get(k) or 0 for k in ("d1_30", "d31_60", "d61_90", "d91_plus"))
        lines.append("| Metric | Value | As Of |")
        lines.append("|--------|-------|-------|")
        lines.append(f"| Open A/R (total) | {fmt_number(ar['total'], '$')} | {ar['date']} |")
        lines.append(f"| — not yet due | {fmt_number(ar.get('current'), '$')} | {ar['date']} |")
        lines.append(f"| — OVERDUE | {fmt_number(overdue, '$')} | {ar['date']} |")
        lines.append(f"| — overdue 91+ days | {fmt_number(ar.get('d91_plus'), '$')} | {ar['date']} |")
        lines.append("")

        debtors = query_all(conn, """
            SELECT customer, total,
                   COALESCE(d1_30,0)+COALESCE(d31_60,0)+COALESCE(d61_90,0)+COALESCE(d91_plus,0) AS overdue
            FROM qb_ar_aging ORDER BY overdue DESC LIMIT 5
        """)
        if debtors and (debtors[0].get("overdue") or 0) > 0:
            lines.append("### Top overdue balances (chase these first)")
            lines.append("| Customer | Overdue | Total Owed |")
            lines.append("|----------|---------|------------|")
            for r in debtors:
                if (r.get("overdue") or 0) <= 0:
                    continue
                lines.append(f"| {r['customer']} | {fmt_number(r['overdue'], '$')} | {fmt_number(r['total'], '$')} |")
            lines.append("")

    if table_exists(conn, "qb_pnl_by_year"):
        pnl = query_all(conn, """
            SELECT year, amount FROM qb_pnl_by_year
            WHERE line_item = 'Net Income' ORDER BY year DESC LIMIT 3
        """)
        if pnl:
            lines.append("### Net income by year (QBO)")
            lines.append("| Year | Net Income |")
            lines.append("|------|-----------|")
            for r in pnl:
                lines.append(f"| {r['year']} | {fmt_number(r['amount'], '$')} |")
            lines.append("")
    return lines


def section_sales_ledger(conn):
    """Kenny's 1999-2026 per-invoice ledger."""
    if not table_exists(conn, "sales_ledger"):
        return []
    lines = ["## Sales Ledger (1999–present, Kenny's records)"]

    life = query_one(conn, """
        SELECT COUNT(*) AS orders, SUM(retail) AS retail, SUM(profit) AS profit,
               MAX(date) AS last_order
        FROM sales_ledger
    """)
    if life and life.get("orders"):
        margin = (life["profit"] / life["retail"] * 100) if life.get("retail") else None
        lines.append("| Metric | Value |")
        lines.append("|--------|-------|")
        lines.append(f"| Lifetime orders | {fmt_number(life['orders'])} |")
        lines.append(f"| Lifetime sales | {fmt_number(life['retail'], '$')} |")
        lines.append(f"| Lifetime profit | {fmt_number(life['profit'], '$')} ({fmt_pct(margin)}) |")
        lines.append(f"| Ledger current through | {life['last_order']} |")
        lines.append("")

    years = query_all(conn, """
        SELECT year, COUNT(*) AS orders, SUM(retail) AS retail, SUM(profit) AS profit,
               COUNT(DISTINCT customer) AS customers
        FROM sales_ledger GROUP BY year ORDER BY year DESC LIMIT 4
    """)
    if years:
        lines.append("### Recent years")
        lines.append("| Year | Orders | Sales | Profit | Margin | Customers |")
        lines.append("|------|--------|-------|--------|--------|-----------|")
        for r in years:
            m = (r["profit"] / r["retail"] * 100) if r.get("retail") else None
            lines.append(
                f"| {r['year']} | {fmt_number(r['orders'])} | {fmt_number(r['retail'], '$')} | "
                f"{fmt_number(r['profit'], '$')} | {fmt_pct(m)} | {fmt_number(r['customers'])} |")
        lines.append("")

    # Year-to-date vs same period last year. Cutoff = the ledger's last
    # entry that isn't future-dated (Kenny books some orders ahead for
    # fall delivery, and data entry can lag by weeks).
    ytd = query_one(conn, """
        WITH cutoff AS (SELECT MAX(date) AS d,
                               CAST(strftime('%Y', MAX(date)) AS INT) AS y
                        FROM sales_ledger WHERE date <= date('now'))
        SELECT
          (SELECT SUM(retail) FROM sales_ledger, cutoff
            WHERE year = cutoff.y AND date <= cutoff.d) AS this_ytd,
          (SELECT SUM(retail) FROM sales_ledger, cutoff
            WHERE year = cutoff.y - 1
              AND strftime('%m-%d', date) <= strftime('%m-%d', cutoff.d)) AS prior_ytd,
          (SELECT d FROM cutoff) AS cutoff_date
    """)
    if ytd and ytd.get("this_ytd") and ytd.get("prior_ytd"):
        delta = (ytd["this_ytd"] / ytd["prior_ytd"] - 1) * 100
        lines.append(
            f"**Pace (ledger only):** {fmt_number(ytd['this_ytd'], '$')} entered through "
            f"{ytd['cutoff_date']} vs {fmt_number(ytd['prior_ytd'], '$')} same period last year "
            f"({delta:+.1f}%). Caveat: reflects what's been ENTERED in the ledger — "
            f"QuickBooks is the source of truth for current-year revenue.")
        lines.append("")
    return lines


def section_production_orders(conn):
    """Open orders across the three shared production sheets:
    Viking, Diamond (contract printers) and Random Vendors (promo POs)."""
    today = datetime.now().strftime("%Y-%m-%d")

    # (label, table, due column, done predicate)
    sources = [
        ("Viking", "viking_open_orders", "ship_by",
         lambda r: (r.get("status") or "").strip().lower()
                   .startswith(("complete", "shipped", "picked"))),
        ("Diamond", "diamond_open_orders", "ship_to",
         lambda r: bool(r.get("tracking"))),
        ("Random Vendors", "vendor_open_orders", "in_hand",
         lambda r: ((r.get("status") or "").strip().lower()
                    .startswith(("shipped", "complete", "delivered", "picked"))
                    or bool(r.get("tracking")))),
    ]

    def status_of(r):
        return (r.get("status") or r.get("art_status") or "").strip()

    per_source = []
    late_all = []
    for label, table, due_col, is_done in sources:
        if not table_exists(conn, table):
            continue
        rows = query_all(conn, f"SELECT * FROM {table}")
        if not rows:
            continue
        done = sum(1 for r in rows if is_done(r))
        late = [r for r in rows if r.get(due_col) and r[due_col] < today
                and not is_done(r)]
        per_source.append((label, len(rows), done, len(late)))
        for r in late:
            late_all.append((label, r, r[due_col]))

    if not per_source:
        return []

    lines = ["## Production — open orders (Viking · Diamond · Random Vendors)"]
    lines.append("> From the three shared schedule sheets (OPEN tabs), pulled at collection time.")
    lines.append("")
    lines.append("| Sheet | Open orders | Shipped/complete | Past due, not shipped |")
    lines.append("|-------|-------------|------------------|-----------------------|")
    for label, total, done, n_late in per_source:
        lines.append(f"| {label} | {total} | {done} | {n_late} |")
    lines.append("")
    if late_all:
        late_all.sort(key=lambda t: t[2])
        lines.append("### Past due (chase the vendor/printer)")
        lines.append("| Sheet | Company | Order | Was due | Status |")
        lines.append("|-------|---------|-------|---------|--------|")
        for label, r, due in late_all[:10]:
            company = r.get("company") or r.get("customer") or "?"
            lines.append(f"| {label} | {company} | {r.get('description') or '?'} | "
                         f"{due} | {status_of(r) or 'no status'} |")
        lines.append("")
    return lines


# ============================================================
# MAIN GENERATOR
# ============================================================

SECTIONS = [
    section_ca_financials,
    section_sales_ledger,
    section_production_orders,
    section_smartlead,
]


def generate(conn):
    """Generate the key-metrics markdown content."""
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [
        "# Key Metrics",
        "",
        f"> Auto-generated from database. Last updated: {today}",
        f"> Source: `data/data.db` | Regenerate: `python scripts/generate_metrics.py`",
        "",
    ]

    # Run all registered section generators
    for section_fn in SECTIONS:
        try:
            section_lines = section_fn(conn)
            if section_lines:
                lines.extend(section_lines)
        except Exception as e:
            lines.append(f"<!-- Error in {section_fn.__name__}: {e} -->")
            lines.append("")

    # Data freshness table (auto-discovers all tables)
    lines.append("## Data Freshness")
    lines.append("| Source | Latest Record | Status |")
    lines.append("|--------|---------------|--------|")

    tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' "
        "AND name != 'collection_log' AND name NOT LIKE 'sqlite_%' "
        "ORDER BY name"
    ).fetchall()

    for t in tables:
        name = t["name"]
        try:
            row = conn.execute(f"SELECT MAX(date) as d FROM {name}").fetchone()
            if row and row["d"]:
                lines.append(f"| {name} | {row['d']} | Connected |")
            else:
                lines.append(f"| {name} | — | Empty |")
        except Exception:
            lines.append(f"| {name} | — | No date column |")

    lines.append("")
    return "\n".join(lines)


def main():
    """Generate key-metrics.md from the database."""
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        print("Run collection first: python scripts/collect.py")
        return

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row

    content = generate(conn)
    conn.close()

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(content)
    print(f"Key metrics written to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
