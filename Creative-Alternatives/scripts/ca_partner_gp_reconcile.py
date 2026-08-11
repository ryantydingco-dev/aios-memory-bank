"""
Partner GP reconciliation — makes the "collected gross profit" payout promise
computable instead of a manual argument.

Reads config/ca_partner_registry.yaml (who is a partner, on what terms, which
ledger customers are attributed to them), joins the sales ledger for GP and the
A/R aging table for collection status, and writes a monthly statement per
partner to outputs/partnerships/statements/.

DRAFT-ONLY guardrails:
- Statements are review documents. Nothing is paid until Ryan/Kenny approve.
- Orders whose customer shows open A/R are listed as PENDING (not payable) —
  "collected" means collected.
- Partners with terms_approved: false get a statement watermarked
  "TERMS NOT APPROVED — no payout".

Usage:
    .venv/bin/python scripts/ca_partner_gp_reconcile.py               # current month
    .venv/bin/python scripts/ca_partner_gp_reconcile.py --period 2026-07
"""

import argparse
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "data.db"
REGISTRY = ROOT / "config" / "ca_partner_registry.yaml"
OUT_DIR = ROOT / "outputs" / "partnerships" / "statements"


def load_registry():
    with open(REGISTRY) as f:
        data = yaml.safe_load(f) or {}
    return [p for p in (data.get("partners") or [])
            if p.get("status") in ("pilot", "active")]


def open_ar_customers(conn):
    """Customers with any open A/R balance — their orders are PENDING, not payable."""
    rows = conn.execute(
        "SELECT customer FROM qb_ar_aging WHERE COALESCE(total,0) > 0").fetchall()
    return {r[0].lower().strip() for r in rows}


def orders_for(conn, customers, period_start, period_end):
    if not customers:
        return []
    q = ",".join("?" * len(customers))
    return conn.execute(
        f"""SELECT date, customer, invoice, retail, profit
            FROM sales_ledger
            WHERE customer IN ({q}) AND date >= ? AND date <= ?
              AND retail > 0 ORDER BY date""",
        (*customers, period_start, period_end)).fetchall()


def compute_statement(partner, orders, ar_set):
    model = partner.get("model", "A")
    terms = partner.get("terms") or {}
    share = terms.get("gp_share", 0.0)
    cap = terms.get("annual_cap_per_account")

    payable, pending, by_account = [], [], {}
    for o in orders:
        gp = o["profit"] or 0.0
        entry = {"date": o["date"], "customer": o["customer"],
                 "invoice": o["invoice"], "retail": o["retail"], "gp": gp}
        if o["customer"].lower().strip() in ar_set:
            pending.append(entry)
        else:
            payable.append(entry)
            by_account.setdefault(o["customer"], 0.0)
            by_account[o["customer"]] += gp * share

    if cap:
        for acct in by_account:
            by_account[acct] = min(by_account[acct], cap)

    return {
        "model": model, "share": share,
        "payable": payable, "pending": pending,
        "payout_by_account": by_account,
        "payout_total": round(sum(by_account.values()), 2),
        "gp_payable": round(sum(e["gp"] for e in payable), 2),
        "gp_pending": round(sum(e["gp"] for e in pending), 2),
    }


def render(partner, st, period):
    approved = partner.get("terms_approved", False)
    L = [f"# Partner statement — {partner['name']} — {period}", ""]
    L.append(f"> Generated {datetime.now(timezone.utc):%Y-%m-%d %H:%M UTC} by ca_partner_gp_reconcile.py. "
             "DRAFT — review before any payout.")
    if not approved:
        L.append("> **⚠ TERMS NOT APPROVED — informational only, no payout.**")
    L.append("")
    L.append(f"Model **{st['model']}** · GP share **{st['share']*100:.0f}%** · "
             f"status {partner.get('status')}")
    L.append("")
    L.append(f"| | GP | Notes |")
    L.append(f"|---|---:|---|")
    L.append(f"| Collected (payable basis) | ${st['gp_payable']:,.2f} | no open A/R on these accounts |")
    L.append(f"| Pending collection | ${st['gp_pending']:,.2f} | customer has open A/R — NOT payable yet |")
    L.append("")
    if st["payout_by_account"]:
        L.append("## Payout by account (capped)")
        for acct, amt in sorted(st["payout_by_account"].items(), key=lambda x: -x[1]):
            L.append(f"- {acct}: **${amt:,.2f}**")
        L.append("")
        L.append(f"**Draft payout total: ${st['payout_total']:,.2f}**"
                 + ("" if approved else " — *blocked: terms not approved*"))
    else:
        L.append("_No payable attributed orders this period._")
    L.append("")
    if st["pending"]:
        L.append("## Pending orders (awaiting collection)")
        for e in st["pending"][:15]:
            L.append(f"- {e['date']} · {e['customer']} · inv {e['invoice']} · GP ${e['gp']:,.0f}")
    L.append("")
    L.append("---")
    L.append("_Basis: sales_ledger GP (Kenny's per-order economics) × A/R check from "
             "qb_ar_aging. Refresh both via /update-data before approving. Job-cost "
             "reconciliation per the economics doc still applies to large orders._")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--period", help="YYYY-MM (default: current month)")
    args = ap.parse_args()
    now = datetime.now(timezone.utc)
    period = args.period or f"{now:%Y-%m}"
    y, m = period.split("-")
    start = f"{y}-{m}-01"
    end = f"{y}-{m}-31"

    partners = load_registry()
    if not partners:
        print("No pilot/active partners in config/ca_partner_registry.yaml — nothing to reconcile.")
        return

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    ar_set = open_ar_customers(conn)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for p in partners:
        orders = orders_for(conn, p.get("attributed_customers") or [], start, end)
        st = compute_statement(p, orders, ar_set)
        safe = "".join(c if c.isalnum() else "-" for c in p["name"].lower()).strip("-")
        path = OUT_DIR / f"{period}-{safe}.md"
        path.write_text(render(p, st, period))
        print(f"{p['name']}: payable GP ${st['gp_payable']:,.0f} · pending ${st['gp_pending']:,.0f} "
              f"· draft payout ${st['payout_total']:,.2f} → {path}")
    conn.close()


if __name__ == "__main__":
    main()
