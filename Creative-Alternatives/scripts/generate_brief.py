"""
AIOS Client Workspace — Daily Brief Generator

Composes the morning brief from data.db. Template-based (no LLM, $0/month).
Every section degrades gracefully if its table is missing — same philosophy
as generate_metrics.py.

Outputs:
    outputs/daily-brief/YYYY-MM-DD.md   (markdown archive / email body)
    stdout: Slack Block Kit JSON        (default) or markdown (--format text)

Usage:
    python scripts/generate_brief.py                # Block Kit JSON to stdout
    python scripts/generate_brief.py --format text  # markdown to stdout
"""

import argparse
import json
import sqlite3
from datetime import datetime, date, timedelta
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "data.db"
ARCHIVE_DIR = WORKSPACE_ROOT / "outputs" / "daily-brief"


def q1(conn, sql, params=()):
    try:
        row = conn.execute(sql, params).fetchone()
        return dict(row) if row else None
    except Exception:
        return None


def qa(conn, sql, params=()):
    try:
        return [dict(r) for r in conn.execute(sql, params).fetchall()]
    except Exception:
        return []


def table_exists(conn, name):
    return conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,)
    ).fetchone() is not None


def money(v):
    return "n/a" if v is None else "${:,.0f}".format(v)


def days_old(datestr):
    try:
        return (date.today() - datetime.strptime(datestr, "%Y-%m-%d").date()).days
    except Exception:
        return None


AR_SNAPSHOT_PATH = WORKSPACE_ROOT / "data" / "qbo_ar_live.json"
AR_SNAPSHOT_MAX_AGE_DAYS = 3


def load_ar_snapshot():
    """Live A/R pulled from QuickBooks via the Claude connector (data/qbo_ar_live.json).

    Refreshed by a Claude session/scheduled task on the brief host — the launchd
    Python jobs can't call the connector themselves. Returns None if missing or
    older than AR_SNAPSHOT_MAX_AGE_DAYS so the brief falls back to the CSV table.
    """
    try:
        snap = json.loads(AR_SNAPSHOT_PATH.read_text())
        staleness = days_old(snap.get("as_of") or "")
        if staleness is None or staleness > AR_SNAPSHOT_MAX_AGE_DAYS:
            return None
        return snap
    except Exception:
        return None


# --- Section builders: each returns a list of markdown lines (or []) ---

def sec_ar(conn):
    snap = load_ar_snapshot()
    if snap:
        lines = ["*💰 Money owed to us (live from QuickBooks, {})*".format(snap["as_of"]),
                 "• Open invoices: *{}* across {} customers".format(
                     money(snap.get("total_receivables")), snap.get("customer_count", "?")),
                 "• OVERDUE: *{}* ({}% — {} customers; of which 91+ days: {})".format(
                     money(snap.get("total_overdue")), snap.get("overdue_percent", "?"),
                     snap.get("overdue_customer_count", "?"),
                     money((snap.get("buckets") or {}).get("d91_plus")))]
        return lines
    if not table_exists(conn, "qb_ar_aging"):
        return []
    ar = q1(conn, """
        SELECT date, SUM(total) AS total, SUM(current) AS current,
               SUM(COALESCE(d1_30,0)+COALESCE(d31_60,0)+COALESCE(d61_90,0)+COALESCE(d91_plus,0)) AS overdue,
               SUM(d91_plus) AS d91
        FROM qb_ar_aging GROUP BY date
    """)
    if not ar or not ar.get("total"):
        return []
    lines = ["*💰 Money owed to us (A/R as of {})*".format(ar["date"]),
             "• Open invoices: *{}*".format(money(ar["total"])),
             "• OVERDUE: *{}*  (of which 91+ days: {})".format(money(ar["overdue"]), money(ar["d91"]))]
    staleness = days_old(ar["date"])
    if staleness is not None and staleness > 14:
        lines.append("⚠️ _A/R data is {} days old — re-export the aging report from QuickBooks into context/import/_".format(staleness))
    return lines


def sec_chase(conn):
    snap = load_ar_snapshot()
    if snap and snap.get("top_overdue"):
        lines = ["*📞 Chase list — top overdue (live)*"]
        for r in snap["top_overdue"][:5]:
            c = q1(conn, "SELECT email, phone FROM qb_customers WHERE customer = ?",
                   (r["customer"],)) or {}
            contact = r.get("email") or c.get("phone") or c.get("email") or "no contact on file"
            lines.append("• *{}* — {} overdue ({} total) — {}".format(
                r["customer"], money(r["overdue"]), money(r["total"]), contact))
        return lines
    if not table_exists(conn, "qb_ar_aging"):
        return []
    rows = qa(conn, """
        SELECT a.customer, a.total,
               COALESCE(a.d1_30,0)+COALESCE(a.d31_60,0)+COALESCE(a.d61_90,0)+COALESCE(a.d91_plus,0) AS overdue,
               COALESCE(a.d91_plus,0) AS d91, c.email, c.phone
        FROM qb_ar_aging a LEFT JOIN qb_customers c ON c.customer = a.customer
        WHERE COALESCE(a.d1_30,0)+COALESCE(a.d31_60,0)+COALESCE(a.d61_90,0)+COALESCE(a.d91_plus,0) > 0
        ORDER BY overdue DESC LIMIT 5
    """)
    if not rows:
        return []
    lines = ["*📞 Chase list — top overdue*"]
    for r in rows:
        contact = r.get("phone") or r.get("email") or "no contact on file"
        tag = "  🔴 91+ days" if (r.get("d91") or 0) > 0 else ""
        lines.append("• *{}* — {} overdue ({} total){} — {}".format(
            r["customer"], money(r["overdue"]), money(r["total"]), tag, contact))
    return lines


def load_open_orders(conn):
    """Normalize the three shared production sheets (Viking, Diamond,
    Random Vendors) into one order list with a common shape."""
    orders = []
    if table_exists(conn, "viking_open_orders"):
        for r in qa(conn, "SELECT * FROM viking_open_orders"):
            status = (r.get("status") or "").strip()
            orders.append({
                "src": "Viking", "company": r.get("company"),
                "desc": r.get("description"),
                "due": r.get("ship_by"), "due_raw": r.get("ship_by_raw"),
                "status": status or None,
                "done": status.lower().startswith(("complete", "shipped", "picked", "delivered")),
                "ship_method": r.get("ship_method"),
                "rush": r.get("rush_note"), "hard": r.get("must_ship_bold"),
                "collected_at": r.get("collected_at"),
            })
    if table_exists(conn, "diamond_open_orders"):
        for r in qa(conn, "SELECT * FROM diamond_open_orders"):
            orders.append({
                "src": "Diamond", "company": r.get("company"),
                "desc": r.get("description"),
                "due": r.get("ship_to"), "due_raw": r.get("ship_to_raw"),
                "status": r.get("art_status"),   # no status column; art stage is the signal
                "done": bool(r.get("tracking")),  # tracking number = shipped
                "rush": r.get("rush_note"), "hard": r.get("must_ship_bold"),
                "collected_at": r.get("collected_at"),
            })
    if table_exists(conn, "vendor_open_orders"):
        for r in qa(conn, "SELECT * FROM vendor_open_orders"):
            status = (r.get("status") or "").strip()
            orders.append({
                "src": "Vendors", "company": r.get("customer"),
                "desc": "{} (via {})".format(r.get("description") or "?",
                                             r.get("vendor") or "?"),
                "due": r.get("in_hand"), "due_raw": r.get("in_hand_raw"),
                "status": status or r.get("art_status"),
                "done": (status.lower().startswith(("shipped", "complete", "delivered", "picked"))
                         or bool(r.get("tracking"))),
                "rush": r.get("rush_note"), "hard": r.get("must_ship_bold"),
                "collected_at": r.get("collected_at"),
            })
    return orders


def sec_viking_messenger(conn):
    """Kenny's call list: Viking MESSENGER deliveries whose ship date has
    arrived (today or earlier) but the sheet doesn't say Complete/Delivered.
    A messenger run that quietly slips is a customer standing at an empty
    door — Kenny calls Viking to confirm it actually went out."""
    rows = load_open_orders(conn)
    today = date.today().isoformat()
    flagged = [r for r in rows
               if r["src"] == "Viking"
               and "messenger" in (r.get("ship_method") or "").lower()
               and not r["done"]
               and r.get("due") and r["due"] <= today]
    if not flagged:
        return []
    lines = ["*📞 Kenny — call Viking* — messenger delivery due, sheet not marked Complete:"]
    for r in sorted(flagged, key=lambda r: r["due"]):
        due = "{}/{}".format(int(r["due"][5:7]), int(r["due"][8:10]))
        lines.append("• *{}* — {} — due {} — status: {}".format(
            r.get("company") or "?", r.get("desc") or "?", due,
            r.get("status") or "blank"))
    lines.append("_Confirm with Viking these went out; have them mark the sheet Complete._")
    return lines


def sec_orders(conn):
    """Orders going out today / tomorrow / this week across all three
    shared production sheets (Viking, Diamond, Random Vendors)."""
    rows = load_open_orders(conn)
    if not rows:
        return []
    today = date.today()
    tomorrow = today + timedelta(days=1)
    week_end = today + timedelta(days=6 - today.weekday())  # Sunday of this week

    def mmdd(iso):
        return "{}/{}".format(int(iso[5:7]), int(iso[8:10]))

    def label(r, due_prefix=None):
        desc = (r.get("desc") or "?")
        if len(desc) > 55:
            desc = desc[:52] + "…"
        hard = "‼️ " if r.get("hard") else ""
        rush = " 🔥 _{}_".format(r["rush"]) if r.get("rush") else ""
        due = " — {} {}".format(due_prefix, mmdd(r["due"])) if due_prefix and r.get("due") else ""
        status = " — {}".format(r["status"]) if r.get("status") else ""
        return "• {}*{}* — {} `[{}]`{}{}{}".format(
            hard, r.get("company") or "?", desc, r["src"], due, status, rush)

    def group(rows_, cap, due_prefix=None):
        out = [label(r, due_prefix) for r in
               sorted(rows_, key=lambda r: (not r.get("hard"), r.get("due") or "9999"))[:cap]]
        if len(rows_) > cap:
            out.append("• …plus {} more".format(len(rows_) - cap))
        return out

    open_rows = [r for r in rows if not r["done"]]
    counts = {}
    for r in rows:
        counts[r["src"]] = counts.get(r["src"], 0) + 1
    done = len(rows) - len(open_rows)

    lines = ["*📦 Orders & production* — {} on the boards ({}){}".format(
        len(rows),
        " · ".join("{} {}".format(s, n) for s, n in
                   (("Viking", counts.get("Viking", 0)),
                    ("Diamond", counts.get("Diamond", 0)),
                    ("Vendor POs", counts.get("Vendors", 0))) if n),
        " · {} already shipped/complete".format(done) if done else "")]

    dated = [r for r in open_rows if r.get("due")]
    late = [r for r in dated if r["due"] < today.isoformat()]
    due_today = [r for r in dated if r["due"] == today.isoformat()]
    due_tomorrow = [r for r in dated if r["due"] == tomorrow.isoformat()]
    this_week = [r for r in dated
                 if tomorrow.isoformat() < r["due"] <= week_end.isoformat()]

    if due_today:
        lines.append("*🚚 Going out TODAY ({})*".format(len(due_today)))
        lines += group(due_today, 8)
    else:
        lines.append("🚚 Nothing due out today.")
    if due_tomorrow:
        lines.append("*⏭️ Tomorrow ({})*".format(len(due_tomorrow)))
        lines += group(due_tomorrow, 6)
    if this_week:
        lines.append("*📅 Later this week ({})*".format(len(this_week)))
        lines += group(this_week, 8, due_prefix="due")
    if late:
        lines.append("*⚠️ PAST DUE, not marked shipped ({})*".format(len(late)))
        lines += group(late, 6, due_prefix="was due")

    # Unreadable dates — nudge to fix the sheet, don't silently drop
    odd = [r for r in open_rows if not r.get("due") and r.get("due_raw")]
    if odd:
        lines.append("• ❓ Date unreadable on the sheet: " + "; ".join(
            "{} (\"{}\")".format(r.get("company") or "?", r["due_raw"]) for r in odd[:3]))

    staleness = min((days_old((r.get("collected_at") or "")[:10])
                     for r in rows if r.get("collected_at")), default=None)
    if staleness is not None and staleness > 1:
        lines.append("⚠️ _Sheet data is {} days old — the pull from Google Sheets may be failing_".format(staleness))
    missing = [s for s in ("Viking", "Diamond", "Vendors") if s not in counts]
    if missing:
        lines.append("⚠️ _No data from: {} — that sheet's pull may be failing_".format(", ".join(missing)))
    return lines


def sec_pulse(conn):
    lines = []
    if table_exists(conn, "qb_pnl_by_year"):
        pnl = qa(conn, """
            SELECT year, amount FROM qb_pnl_by_year
            WHERE line_item = 'Net Income' ORDER BY year DESC LIMIT 2
        """)
        if pnl:
            parts = ["{}: {}".format(r["year"], money(r["amount"])) for r in pnl]
            lines.append("*📈 Net income (QBO):* " + "  |  ".join(parts))
    if table_exists(conn, "sales_ledger"):
        ytd = q1(conn, """
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
                "*📒 Ledger pace:* {} entered through {} vs {} same period last year ({:+.0f}%) "
                "_— reflects ledger entry, QBO is source of truth_".format(
                    money(ytd["this_ytd"]), ytd["cutoff_date"], money(ytd["prior_ytd"]), delta))
    return lines


def sec_outreach(conn):
    if not table_exists(conn, "smartlead_daily"):
        return []
    row = q1(conn, "SELECT * FROM smartlead_daily ORDER BY date DESC LIMIT 1")
    if not row:
        return []
    rate = row.get("reply_rate")
    return ["*📧 Outreach (SmartLead, {}):* {} sent | {} replies ({}%) | {} interested".format(
        row.get("date"), row.get("emails_sent"), row.get("replies"),
        "n/a" if rate is None else "{:.1f}".format(float(rate)), row.get("leads_interested"))]


def sec_attention(conn):
    items = []
    # (a) biggest single overdue account
    if table_exists(conn, "qb_ar_aging"):
        top = q1(conn, """
            SELECT customer,
                   COALESCE(d1_30,0)+COALESCE(d31_60,0)+COALESCE(d61_90,0)+COALESCE(d91_plus,0) AS overdue
            FROM qb_ar_aging ORDER BY overdue DESC LIMIT 1
        """)
        if top and (top.get("overdue") or 0) > 0:
            items.append("Call *{}* — {} overdue is the single biggest recoverable amount".format(
                top["customer"], money(top["overdue"])))
    # (b) stalest source
    stale = q1(conn, """
        SELECT source, MAX(collected_at) AS last_ok FROM collection_log
        WHERE status = 'success' GROUP BY source ORDER BY last_ok ASC LIMIT 1
    """)
    if stale and stale.get("last_ok"):
        d = days_old(stale["last_ok"][:10])
        if d is not None and d > 14:
            items.append("Data source *{}* hasn't refreshed in {} days — run /update-data or re-export".format(
                stale["source"], d))
    # (c) collectors that errored on the latest run
    errs = qa(conn, """
        SELECT source, reason FROM collection_log
        WHERE status IN ('error','exception')
          AND collected_at >= (SELECT MAX(collected_at) FROM collection_log
                               WHERE status='success')
        LIMIT 3
    """)
    for e in errs:
        items.append("Collector *{}* errored on the last run".format(e["source"]))
    if not items:
        return []
    return ["*🎯 Needs attention*"] + ["• " + i for i in items[:3]]


def build(conn):
    today = date.today().strftime("%A, %B %-d, %Y")
    sections = [
        ["☀️ *Creative Alternatives Daily Brief* — {}".format(today)],
        sec_ar(conn),
        sec_chase(conn),
        sec_viking_messenger(conn),
        sec_orders(conn),
        sec_pulse(conn),
        sec_outreach(conn),
        sec_attention(conn),
        ["_Reply here, or open Claude and run /prime for the full picture._"],
    ]
    return [s for s in sections if s]


def to_blocks(sections):
    blocks = []
    for s in sections:
        text = "\n".join(s)
        if len(text) > 2900:  # Slack section block limit is 3000 chars
            text = text[:2870] + "\n_…section truncated_"
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": text}})
        blocks.append({"type": "divider"})
    if blocks and blocks[-1]["type"] == "divider":
        blocks.pop()
    return {"text": "Creative Alternatives Daily Brief", "blocks": blocks}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--format", choices=["blocks", "text"], default="blocks")
    args = parser.parse_args()

    if not DB_PATH.exists():
        raise SystemExit("Database not found — run: python scripts/collect.py")

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    sections = build(conn)
    conn.close()

    md = "\n\n".join("\n".join(s) for s in sections)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    archive = ARCHIVE_DIR / "{}.md".format(date.today().isoformat())
    archive.write_text(md)

    if args.format == "text":
        print(md)
    else:
        print(json.dumps(to_blocks(sections), indent=2))


if __name__ == "__main__":
    main()
