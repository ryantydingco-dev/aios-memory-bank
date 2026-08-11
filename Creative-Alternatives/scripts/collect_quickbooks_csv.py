"""
AIOS Client Workspace — QuickBooks CSV Exports Collector

Loads the QuickBooks Online report exports sitting in context/import/ into
the database. No API keys — refresh the data by re-exporting from QBO
(Reports -> export CSV) into context/import/ with the same filenames.

Files read (any that exist):
    qb_ar_aging.csv                  -> qb_ar_aging        (as-of date parsed from file)
    qb_profit_and_loss_by_year.csv   -> qb_pnl_by_year     (long format: line_item/year/amount)
    qb_sales_by_customer_by_year.csv -> qb_sales_by_customer_by_year
    qb_expenses_by_vendor.csv        -> qb_expenses_by_vendor
    qb_sales_by_product.csv          -> qb_sales_by_product
    qb_customer_contacts.csv         -> qb_customers

Tables are fully reloaded on every run — the exports are the source of truth.
"""

import csv
import re
from datetime import datetime, timezone
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
IMPORT_DIR = WORKSPACE_ROOT / "context" / "import"


def _num(s):
    """Parse a QBO-formatted number: '1,028.80', '-240,331.64', '0.08%', '' -> float/None."""
    if s is None:
        return None
    s = str(s).strip().replace(",", "").replace("$", "").replace("%", "")
    if s in ("", "-", "—"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _read_csv(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        return list(csv.reader(f))


def _parse_as_of(rows):
    """Find a line like 'As of Jun 26, 2026' in the report header."""
    for row in rows[:5]:
        for cell in row:
            m = re.search(r"As of (\w+ \d{1,2}, \d{4})", str(cell))
            if m:
                try:
                    return datetime.strptime(m.group(1), "%b %d, %Y").strftime("%Y-%m-%d")
                except ValueError:
                    pass
    return None


def collect():
    """Parse whichever QBO export files are present."""
    found = {name: IMPORT_DIR / f"{name}.csv" for name in [
        "qb_ar_aging", "qb_profit_and_loss_by_year",
        "qb_sales_by_customer_by_year", "qb_expenses_by_vendor",
        "qb_sales_by_product", "qb_customer_contacts",
    ]}
    present = {k: p for k, p in found.items() if p.exists()}
    if not present:
        return {
            "source": "quickbooks_csv", "status": "skipped",
            "reason": "No qb_*.csv exports found in context/import/",
        }

    data = {}
    try:
        if "qb_ar_aging" in present:
            rows = _read_csv(present["qb_ar_aging"])
            as_of = _parse_as_of(rows) or ""
            entries = []
            in_data = False
            for row in rows:
                if row and row[0].strip() == "" and len(row) >= 7 and "CURRENT" in ",".join(row).upper():
                    in_data = True
                    continue
                if not in_data or not row or not row[0].strip():
                    continue
                if row[0].strip().upper().startswith("TOTAL"):
                    continue
                entries.append({
                    "customer": row[0].strip(),
                    "current": _num(row[1]), "d1_30": _num(row[2]),
                    "d31_60": _num(row[3]), "d61_90": _num(row[4]),
                    "d91_plus": _num(row[5]), "total": _num(row[6]),
                })
            data["ar_aging"] = {"as_of": as_of, "rows": entries}

        def wide_to_long(name):
            rows = _read_csv(present[name])
            header, start = None, None
            for i, row in enumerate(rows):
                if row and row[0].strip() == "" and any(re.fullmatch(r"\d{4}", c.strip()) for c in row[1:]):
                    header, start = row, i + 1
                    break
            out = []
            if header is None:
                return out
            years = [(j, c.strip()) for j, c in enumerate(header) if re.fullmatch(r"\d{4}", c.strip())]
            for row in rows[start:]:
                if not row or not row[0].strip():
                    continue
                label = row[0].strip()
                if label.upper().startswith("TOTAL"):
                    continue
                for j, year in years:
                    v = _num(row[j]) if j < len(row) else None
                    if v is not None:
                        out.append({"label": label, "year": int(year), "amount": v})
            return out

        if "qb_profit_and_loss_by_year" in present:
            data["pnl_by_year"] = wide_to_long("qb_profit_and_loss_by_year")
        if "qb_sales_by_customer_by_year" in present:
            data["sales_by_customer_by_year"] = wide_to_long("qb_sales_by_customer_by_year")

        if "qb_expenses_by_vendor" in present:
            rows = _read_csv(present["qb_expenses_by_vendor"])
            entries = []
            for row in rows:
                if len(row) >= 2 and row[0].strip() and _num(row[1]) is not None:
                    if row[0].strip().upper().startswith("TOTAL"):
                        continue
                    entries.append({"vendor": row[0].strip(), "total": _num(row[1])})
            data["expenses_by_vendor"] = entries

        if "qb_sales_by_product" in present:
            rows = _read_csv(present["qb_sales_by_product"])
            entries = []
            start = None
            for i, row in enumerate(rows):
                if row and "Quantity" in ",".join(row):
                    start = i + 1
                    break
            if start:
                for row in rows[start:]:
                    if not row or not row[0].strip():
                        continue
                    if row[0].strip().upper().startswith("TOTAL"):
                        continue
                    entries.append({
                        "product": row[0].strip(),
                        "quantity": _num(row[1]) if len(row) > 1 else None,
                        "amount": _num(row[2]) if len(row) > 2 else None,
                        "pct_of_sales": _num(row[3]) if len(row) > 3 else None,
                        "avg_price": _num(row[4]) if len(row) > 4 else None,
                    })
            data["sales_by_product"] = entries

        if "qb_customer_contacts" in present:
            rows = _read_csv(present["qb_customer_contacts"])
            entries = []
            start = None
            for i, row in enumerate(rows):
                if row and row[0].strip() == "Customer full name":
                    start = i + 1
                    break
            if start:
                for row in rows[start:]:
                    if not row or not row[0].strip():
                        continue
                    entries.append({
                        "customer": row[0].strip(),
                        "phone": row[1].strip() if len(row) > 1 else None,
                        "email": row[2].strip() if len(row) > 2 else None,
                    })
            data["customers"] = entries

        return {"source": "quickbooks_csv", "status": "success", "data": data}
    except Exception as e:
        return {"source": "quickbooks_csv", "status": "error", "reason": str(e)}


def write(conn, result, date):
    """Full reload of all qb_* tables. Returns records written."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS qb_ar_aging (
            date TEXT NOT NULL,            -- the report's as-of date
            customer TEXT NOT NULL,
            current REAL, d1_30 REAL, d31_60 REAL,
            d61_90 REAL, d91_plus REAL, total REAL,
            collected_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS qb_pnl_by_year (
            date TEXT NOT NULL,            -- refresh date of the export
            line_item TEXT NOT NULL,
            year INTEGER NOT NULL,
            amount REAL,
            collected_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS qb_sales_by_customer_by_year (
            date TEXT NOT NULL,
            customer TEXT NOT NULL,
            year INTEGER NOT NULL,
            amount REAL,
            collected_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS qb_expenses_by_vendor (
            date TEXT NOT NULL,
            vendor TEXT NOT NULL,
            total REAL,
            collected_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS qb_sales_by_product (
            date TEXT NOT NULL,
            product TEXT NOT NULL,
            quantity REAL, amount REAL, pct_of_sales REAL, avg_price REAL,
            collected_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS qb_customers (
            date TEXT NOT NULL,
            customer TEXT NOT NULL,
            phone TEXT, email TEXT,
            collected_at TEXT
        )
    """)

    if result.get("status") != "success":
        conn.commit()
        return 0

    d = result["data"]
    collected_at = datetime.now(timezone.utc).isoformat()
    records = 0

    if "ar_aging" in d:
        conn.execute("DELETE FROM qb_ar_aging")
        as_of = d["ar_aging"]["as_of"] or date
        for r in d["ar_aging"]["rows"]:
            conn.execute(
                "INSERT INTO qb_ar_aging (date, customer, current, d1_30, d31_60, "
                "d61_90, d91_plus, total, collected_at) VALUES (?,?,?,?,?,?,?,?,?)",
                (as_of, r["customer"], r["current"], r["d1_30"], r["d31_60"],
                 r["d61_90"], r["d91_plus"], r["total"], collected_at))
            records += 1

    if "pnl_by_year" in d:
        conn.execute("DELETE FROM qb_pnl_by_year")
        for r in d["pnl_by_year"]:
            conn.execute(
                "INSERT INTO qb_pnl_by_year (date, line_item, year, amount, collected_at) "
                "VALUES (?,?,?,?,?)",
                (date, r["label"], r["year"], r["amount"], collected_at))
            records += 1

    if "sales_by_customer_by_year" in d:
        conn.execute("DELETE FROM qb_sales_by_customer_by_year")
        for r in d["sales_by_customer_by_year"]:
            conn.execute(
                "INSERT INTO qb_sales_by_customer_by_year (date, customer, year, amount, collected_at) "
                "VALUES (?,?,?,?,?)",
                (date, r["label"], r["year"], r["amount"], collected_at))
            records += 1

    if "expenses_by_vendor" in d:
        conn.execute("DELETE FROM qb_expenses_by_vendor")
        for r in d["expenses_by_vendor"]:
            conn.execute(
                "INSERT INTO qb_expenses_by_vendor (date, vendor, total, collected_at) "
                "VALUES (?,?,?,?)",
                (date, r["vendor"], r["total"], collected_at))
            records += 1

    if "sales_by_product" in d:
        conn.execute("DELETE FROM qb_sales_by_product")
        for r in d["sales_by_product"]:
            conn.execute(
                "INSERT INTO qb_sales_by_product (date, product, quantity, amount, "
                "pct_of_sales, avg_price, collected_at) VALUES (?,?,?,?,?,?,?)",
                (date, r["product"], r["quantity"], r["amount"],
                 r["pct_of_sales"], r["avg_price"], collected_at))
            records += 1

    if "customers" in d:
        conn.execute("DELETE FROM qb_customers")
        for r in d["customers"]:
            conn.execute(
                "INSERT INTO qb_customers (date, customer, phone, email, collected_at) "
                "VALUES (?,?,?,?,?)",
                (date, r["customer"], r["phone"], r["email"], collected_at))
            records += 1

    conn.commit()
    return records


if __name__ == "__main__":
    result = collect()
    if result["status"] == "success":
        for k, v in result["data"].items():
            n = len(v["rows"]) if isinstance(v, dict) else len(v)
            print(f"{k}: {n} rows")
    else:
        print(f"{result['status']}: {result.get('reason', '')}")
