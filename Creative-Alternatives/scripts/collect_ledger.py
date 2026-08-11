"""
AIOS Client Workspace — Sales Ledger Collector

Loads Kenny's 1999-2026 per-invoice ledger (Excel) into the database.
Source file: context/import/1999thru2026xlsx.xlsx (Sales sheet).
Full reload on every run — the file is the source of truth.

Requires: openpyxl (pip install openpyxl). No API keys.

Tables created: sales_ledger
"""

import datetime
from datetime import timezone
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
LEDGER_PATH = WORKSPACE_ROOT / "context" / "import" / "1999thru2026xlsx.xlsx"


def _num(v):
    """Best-effort float conversion; returns None for non-numeric."""
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def collect():
    """Read every invoice row from the ledger workbook."""
    if not LEDGER_PATH.exists():
        return {
            "source": "ledger", "status": "skipped",
            "reason": f"Ledger file not found at {LEDGER_PATH.name}",
        }
    try:
        import openpyxl
    except ImportError:
        return {
            "source": "ledger", "status": "skipped",
            "reason": "Missing openpyxl — run: pip install openpyxl",
        }

    try:
        wb = openpyxl.load_workbook(str(LEDGER_PATH), data_only=True, read_only=True)
        ws = wb["Sales"]
        rows = []
        skipped = 0
        for r in ws.iter_rows(min_row=2, max_col=8, values_only=True):
            d, inv, mfg, cost, cust, retail, profit, mu_or_type = r
            # Real order rows have a datetime in the Date column;
            # summary rows ("4 Sales") and blanks do not.
            if not isinstance(d, datetime.datetime):
                continue
            # A handful of rows have typo years (2028, 2029, 5013)
            if d.year < 1999 or d.year > datetime.date.today().year + 1:
                skipped += 1
                continue
            rows.append({
                "order_date": d.strftime("%Y-%m-%d"),
                "year": d.year,
                "month": d.month,
                "invoice": str(inv) if inv is not None else None,
                "manufacturer": str(mfg).strip() if mfg else None,
                "customer": str(cust).strip() if cust else None,
                "cost": _num(cost),
                "retail": _num(retail),
                "profit": _num(profit),
                # Early years this column is MU %, later years a category
                # (Camp / School / Squash...). Stored as text either way.
                "category": str(mu_or_type).strip() if mu_or_type is not None else None,
            })
        wb.close()
        return {
            "source": "ledger", "status": "success",
            "data": {"rows": rows, "typo_rows_skipped": skipped},
        }
    except Exception as e:
        return {"source": "ledger", "status": "error", "reason": str(e)}


def write(conn, result, date):
    """Full reload of the sales_ledger table. Returns records written."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sales_ledger (
            date TEXT NOT NULL,          -- order date (drives freshness)
            year INTEGER,
            month INTEGER,
            invoice TEXT,
            manufacturer TEXT,
            customer TEXT,
            cost REAL,
            retail REAL,
            profit REAL,
            category TEXT,
            collected_at TEXT
        )
    """)
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_ledger_customer ON sales_ledger(customer)"
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_ledger_year ON sales_ledger(year)"
    )

    if result.get("status") != "success":
        conn.commit()
        return 0

    collected_at = datetime.datetime.now(timezone.utc).isoformat()
    conn.execute("DELETE FROM sales_ledger")
    records = 0
    for row in result["data"]["rows"]:
        conn.execute(
            "INSERT INTO sales_ledger (date, year, month, invoice, manufacturer, "
            "customer, cost, retail, profit, category, collected_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (row["order_date"], row["year"], row["month"], row["invoice"],
             row["manufacturer"], row["customer"], row["cost"], row["retail"],
             row["profit"], row["category"], collected_at)
        )
        records += 1
    conn.commit()
    return records


if __name__ == "__main__":
    result = collect()
    if result["status"] == "success":
        rows = result["data"]["rows"]
        total = sum(r["retail"] or 0 for r in rows)
        print(f"Ledger rows: {len(rows):,}  ({result['data']['typo_rows_skipped']} typo rows skipped)")
        print(f"Lifetime retail: ${total:,.0f}")
        print(f"First: {rows[0]['order_date']}  Last: {rows[-1]['order_date']}")
    else:
        print(f"{result['status']}: {result.get('reason', '')}")
