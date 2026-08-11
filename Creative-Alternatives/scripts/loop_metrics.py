#!/usr/bin/env python3
"""Objective judge for the agent loops in loops/.

Each loop is scored on one metric computed from data/data.db (or outputs/).
Snapshots append to loops/<name>/metrics.jsonl so every run can compare
"what we changed" against "what the metric did".

Usage:
  loop_metrics.py snapshot <loop>   # compute + append today's snapshot
  loop_metrics.py report <loop>     # print latest snapshot + delta vs previous
  loop_metrics.py due               # list loops due to run today (by cadence)
  loop_metrics.py notify "<text>"   # send a Telegram ping (reads .env)
"""

import json
import re
import sqlite3
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "data.db"
LOOPS = ROOT / "loops"

# cadence: "weekly" runs Mondays; "monthly" runs the first Monday of the month
CADENCE = {
    "outbound-copy": "weekly",
    "ar-chase": "weekly",
    "quote-conversion": "weekly",
    "vendor-ops": "weekly",
    "deliverability": "weekly",
    "reactivation": "monthly",
    "margin": "monthly",
}


def q(sql, params=()):
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    try:
        return [dict(r) for r in con.execute(sql, params)]
    finally:
        con.close()


# ---------------------------------------------------------------- snapshots

def snap_outbound_copy():
    latest = q("SELECT MAX(date) d FROM smartlead_campaigns")[0]["d"]
    rows = q(
        """SELECT campaign_name, campaign_status, emails_sent, replies,
                  leads_interested, total_leads
           FROM smartlead_campaigns WHERE date = ?
           ORDER BY emails_sent DESC""",
        (latest,),
    )
    camps = []
    for r in rows:
        sent = r["emails_sent"] or 0
        camps.append({
            "name": r["campaign_name"],
            "status": r["campaign_status"],
            "sent": sent,
            "replies": r["replies"] or 0,
            "reply_rate": round(100.0 * (r["replies"] or 0) / sent, 2) if sent else 0.0,
            "interested": r["leads_interested"] or 0,
            "leads": r["total_leads"] or 0,
        })
    active = [c for c in camps if c["status"] == "ACTIVE"]
    tot_sent = sum(c["sent"] for c in active)
    tot_rep = sum(c["replies"] for c in active)
    return {
        "data_date": latest,
        "active_reply_rate": round(100.0 * tot_rep / tot_sent, 2) if tot_sent else 0.0,
        "active_interested": sum(c["interested"] for c in active),
        "campaigns": camps,
    }


def snap_ar_chase():
    latest = q("SELECT MAX(date) d FROM qb_ar_aging")[0]["d"]
    rows = q(
        """SELECT customer, current, d1_30, d31_60, d61_90, d91_plus, total
           FROM qb_ar_aging WHERE date = ?""",
        (latest,),
    )
    overdue = lambda r: (r["d1_30"] or 0) + (r["d31_60"] or 0) + (r["d61_90"] or 0) + (r["d91_plus"] or 0)
    top = sorted(rows, key=overdue, reverse=True)[:10]
    return {
        "data_date": latest,
        "total_ar": round(sum(r["total"] or 0 for r in rows), 2),
        "total_overdue": round(sum(overdue(r) for r in rows), 2),
        "overdue_91plus": round(sum(r["d91_plus"] or 0 for r in rows), 2),
        "top_overdue": [
            {"customer": r["customer"], "overdue": round(overdue(r), 2), "total": round(r["total"] or 0, 2)}
            for r in top if overdue(r) > 0
        ],
    }


def snap_reactivation():
    year = date.today().year
    lapsed = q(
        """SELECT COUNT(DISTINCT customer) n FROM sales_ledger
           WHERE year = ? AND customer NOT IN
             (SELECT DISTINCT customer FROM sales_ledger WHERE year = ?)""",
        (year - 1, year),
    )[0]["n"]
    # win-backs: ordered this year, skipped last year, existed before that
    wins = q(
        """SELECT customer, SUM(retail) rev FROM sales_ledger
           WHERE year = ? AND customer IN
             (SELECT DISTINCT customer FROM sales_ledger WHERE year < ?)
             AND customer NOT IN
             (SELECT DISTINCT customer FROM sales_ledger WHERE year = ?)
           GROUP BY customer""",
        (year, year - 1, year - 1),
    )
    return {
        "data_date": str(date.today()),
        "lapsed_customers": lapsed,
        "winback_count": len(wins),
        "winback_revenue": round(sum(w["rev"] or 0 for w in wins), 2),
        "winbacks": [{"customer": w["customer"], "revenue": round(w["rev"] or 0, 2)} for w in
                     sorted(wins, key=lambda w: -(w["rev"] or 0))[:10]],
    }


def snap_quote_conversion():
    qdir = ROOT / "outputs" / "quotes"
    cutoff = datetime.now() - timedelta(days=30)
    quotes = []
    for f in sorted(qdir.glob("*.md")):
        m = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)\.md", f.name)
        if not m:
            continue
        qdate = datetime.strptime(m.group(1), "%Y-%m-%d")
        if qdate < cutoff:
            continue
        slug = m.group(2).replace("-", " ")
        hit = q(
            """SELECT COUNT(*) n FROM sales_ledger
               WHERE LOWER(customer) LIKE ? AND date >= ?""",
            (f"%{slug.split()[0].lower()}%", m.group(1)),
        )[0]["n"]
        quotes.append({"date": m.group(1), "customer": slug, "order_matched": hit > 0})
    n = len(quotes)
    won = sum(1 for x in quotes if x["order_matched"])
    return {
        "data_date": str(date.today()),
        "quotes_30d": n,
        "converted_30d": won,
        "conversion_rate": round(100.0 * won / n, 1) if n else 0.0,
        "quotes": quotes,
    }


def snap_vendor_ops():
    # Mirrors generate_metrics.py section_production_orders (due cols + done predicates)
    today = str(date.today())

    def done_viking(r):
        return (r.get("status") or "").strip().lower().startswith(("complete", "shipped", "picked"))

    def done_diamond(r):
        return bool(r.get("tracking"))

    def done_vendor(r):
        return ((r.get("status") or "").strip().lower()
                .startswith(("shipped", "complete", "delivered", "picked"))
                or bool(r.get("tracking")))

    sheets = {
        "viking": ("viking_open_orders", "ship_by", "company", None, done_viking),
        "diamond": ("diamond_open_orders", "ship_to", "company", None, done_diamond),
        "vendors": ("vendor_open_orders", "in_hand", "customer", "vendor", done_vendor),
    }
    out, past_due = {}, []
    for key, (table, due_col, cust_col, vend_col, is_done) in sheets.items():
        rows = q(f"SELECT * FROM {table}")
        pd = [r for r in rows if r.get(due_col) and r[due_col] < today and not is_done(r)]
        out[key] = {"open": len(rows), "past_due": len(pd)}
        past_due += [{"sheet": key, "vendor": r.get(vend_col) if vend_col else key,
                      "customer": r.get(cust_col), "due": r[due_col],
                      "status": (r.get("status") or r.get("art_status") or "").strip(),
                      "description": (r.get("description") or "")[:60]} for r in pd]
    return {
        "data_date": today,
        "open_orders": sum(s["open"] for s in out.values()),
        "past_due_not_shipped": len(past_due),
        "by_sheet": out,
        "past_due": sorted(past_due, key=lambda r: r["due"])[:20],
    }


def snap_deliverability():
    latest = q("SELECT MAX(date) d FROM smartlead_campaigns")[0]["d"]
    rows = q(
        """SELECT campaign_name, campaign_status, emails_sent, unique_opens, unique_sent, bounces
           FROM smartlead_campaigns WHERE date = ? AND emails_sent > 0""",
        (latest,),
    )
    camps = []
    for r in rows:
        sent = r["emails_sent"] or 0
        usent = r["unique_sent"] or sent
        camps.append({
            "name": r["campaign_name"],
            "status": r["campaign_status"],
            "sent": sent,
            "bounce_rate": round(100.0 * (r["bounces"] or 0) / sent, 2) if sent else 0.0,
            "open_rate": round(100.0 * (r["unique_opens"] or 0) / usent, 1) if usent else 0.0,
        })
    tot_sent = sum(c["sent"] for c in camps)
    tot_bounce = sum((r["bounces"] or 0) for r in rows)
    return {
        "data_date": latest,
        "overall_bounce_rate": round(100.0 * tot_bounce / tot_sent, 2) if tot_sent else 0.0,
        "flagged": [c for c in camps if c["bounce_rate"] > 2.0 or
                    (c["status"] == "ACTIVE" and c["open_rate"] < 25.0)],
        "campaigns": camps,
    }


def snap_margin():
    year = date.today().year
    def yr(y):
        r = q("SELECT SUM(retail) rev, SUM(profit) prof, COUNT(*) n FROM sales_ledger WHERE year = ?", (y,))[0]
        rev = r["rev"] or 0
        return {"revenue": round(rev, 0), "profit": round(r["prof"] or 0, 0), "orders": r["n"],
                "margin_pct": round(100.0 * (r["prof"] or 0) / rev, 1) if rev else 0.0}
    low = q(
        """SELECT customer, manufacturer, retail, profit,
                  ROUND(100.0*profit/retail,1) margin_pct, date
           FROM sales_ledger WHERE year = ? AND retail > 500 AND 100.0*profit/retail < 20
           ORDER BY retail DESC LIMIT 15""",
        (year,),
    )
    by_vendor = q(
        """SELECT manufacturer, ROUND(SUM(retail),0) rev, ROUND(100.0*SUM(profit)/SUM(retail),1) margin_pct
           FROM sales_ledger WHERE year = ? GROUP BY manufacturer
           HAVING SUM(retail) > 5000 ORDER BY 3 ASC LIMIT 10""",
        (year,),
    )
    return {
        "data_date": str(date.today()),
        "this_year": yr(year),
        "last_year": yr(year - 1),
        "margin_pct": yr(year)["margin_pct"],
        "low_margin_orders": low,
        "thinnest_vendors": by_vendor,
    }


SNAPSHOTS = {
    "outbound-copy": snap_outbound_copy,
    "ar-chase": snap_ar_chase,
    "reactivation": snap_reactivation,
    "quote-conversion": snap_quote_conversion,
    "vendor-ops": snap_vendor_ops,
    "deliverability": snap_deliverability,
    "margin": snap_margin,
}

# ---------------------------------------------------------------- commands

def jsonl_path(loop):
    return LOOPS / loop / "metrics.jsonl"


def load_snaps(loop):
    p = jsonl_path(loop)
    if not p.exists():
        return []
    return [json.loads(line) for line in p.read_text().splitlines() if line.strip()]


def cmd_snapshot(loop):
    snap = SNAPSHOTS[loop]()
    snap["taken_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    p = jsonl_path(loop)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("a") as f:
        f.write(json.dumps(snap) + "\n")
    print(json.dumps(snap, indent=2))


def cmd_report(loop):
    snaps = load_snaps(loop)
    if not snaps:
        print(f"No snapshots yet for {loop}. Run: loop_metrics.py snapshot {loop}")
        return
    out = {"latest": snaps[-1]}
    if len(snaps) > 1:
        out["previous"] = snaps[-2]
        # top-level numeric deltas
        deltas = {}
        for k, v in snaps[-1].items():
            pv = snaps[-2].get(k)
            if isinstance(v, (int, float)) and isinstance(pv, (int, float)):
                deltas[k] = round(v - pv, 2)
        out["delta"] = deltas
    print(json.dumps(out, indent=2))


def cmd_due():
    today = date.today()
    if today.weekday() != 0:
        return  # loops run Mondays only
    for loop, cad in CADENCE.items():
        if cad == "monthly" and today.day > 7:
            continue
        print(loop)


def cmd_notify(text):
    sys.path.insert(0, str(ROOT / "scripts"))
    from config import get_env  # loads .env
    import requests
    token, chat = get_env("TELEGRAM_BOT_TOKEN"), get_env("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print("Telegram not configured")
        return
    requests.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={"chat_id": chat, "text": text[:4000], "parse_mode": "Markdown"},
        timeout=15,
    )
    print("sent")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "due":
        cmd_due()
    elif cmd == "notify":
        cmd_notify(sys.argv[2])
    elif cmd in ("snapshot", "report"):
        loop = sys.argv[2]
        if loop not in SNAPSHOTS:
            sys.exit(f"Unknown loop: {loop} (known: {', '.join(SNAPSHOTS)})")
        (cmd_snapshot if cmd == "snapshot" else cmd_report)(loop)
    else:
        sys.exit(f"Unknown command: {cmd}")


if __name__ == "__main__":
    main()
