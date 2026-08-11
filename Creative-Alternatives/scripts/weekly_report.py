"""
AIOS Client Workspace — Weekly Performance Report Generator

Generates a weekly outreach performance report with week-over-week comparisons.
Pulls data from SmartLead daily snapshots in the database.

Usage:
    python scripts/weekly_report.py              # Generate and save report
    python scripts/weekly_report.py --dry-run    # Preview without saving
    python scripts/weekly_report.py --telegram   # Save + send via Telegram
"""

import argparse
import os
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "data.db"
OUTPUT_DIR = WORKSPACE_ROOT / "outputs" / "weekly-reports"

load_dotenv(WORKSPACE_ROOT / ".env")


def get_week_data(conn, end_date):
    """Get the most recent daily snapshot on or before end_date."""
    row = conn.execute(
        "SELECT * FROM smartlead_daily WHERE date <= ? ORDER BY date DESC LIMIT 1",
        (end_date,)
    ).fetchone()
    return dict(row) if row else None


def get_campaign_data(conn, date):
    """Get per-campaign data for a specific date."""
    rows = conn.execute(
        "SELECT * FROM smartlead_campaigns WHERE date = ? ORDER BY emails_sent DESC",
        (date,)
    ).fetchall()
    return [dict(r) for r in rows]


def fmt_change(current, previous):
    """Format a week-over-week change as +X or -X."""
    if current is None or previous is None:
        return "—"
    diff = current - previous
    if diff > 0:
        return f"+{diff:,}"
    elif diff < 0:
        return f"{diff:,}"
    return "0"


def fmt_pct_change(current, previous):
    """Format a percentage point change."""
    if current is None or previous is None:
        return "—"
    diff = current - previous
    if diff > 0:
        return f"+{diff:.1f}pp"
    elif diff < 0:
        return f"{diff:.1f}pp"
    return "0pp"


def generate_report(conn, report_date=None):
    """Generate the weekly report as markdown."""
    today = report_date or datetime.now().strftime("%Y-%m-%d")
    week_ago = (datetime.strptime(today, "%Y-%m-%d") - timedelta(days=7)).strftime("%Y-%m-%d")

    client_name = os.getenv("CLIENT_NAME", "Client")

    # Get this week's and last week's data
    this_week = get_week_data(conn, today)
    last_week = get_week_data(conn, week_ago)

    if not this_week:
        return f"# Weekly Report — {today}\n\nNo data available yet. Run `python scripts/collect.py` first.\n"

    # Get campaign breakdown
    campaigns = get_campaign_data(conn, this_week["date"])

    lines = []
    lines.append(f"# Weekly Outreach Report — {client_name}")
    lines.append(f"")
    lines.append(f"**Period:** Week ending {today}")
    lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"")

    # --- Executive Summary ---
    lines.append("## Executive Summary")
    lines.append("")

    new_sends = int(this_week.get("emails_sent", 0)) - int(last_week.get("emails_sent", 0)) if last_week else this_week.get("emails_sent", 0)
    new_replies = int(this_week.get("replies", 0)) - int(last_week.get("replies", 0)) if last_week else this_week.get("replies", 0)
    new_interested = int(this_week.get("leads_interested", 0)) - int(last_week.get("leads_interested", 0)) if last_week else this_week.get("leads_interested", 0)

    lines.append(f"This week: **{new_sends:,} new emails sent**, **{new_replies} new replies**, **{new_interested} new interested leads**.")
    lines.append("")

    # --- Outreach Metrics ---
    lines.append("## Outreach Metrics")
    lines.append("")
    lines.append("| Metric | Current | Change (WoW) |")
    lines.append("|--------|---------|-------------|")

    tw = this_week
    lw = last_week or {}

    lines.append(f"| Emails Sent | {int(tw.get('emails_sent', 0)):,} | {fmt_change(tw.get('emails_sent'), lw.get('emails_sent'))} |")
    lines.append(f"| Unique Leads | {int(tw.get('unique_sent', 0)):,} | {fmt_change(tw.get('unique_sent'), lw.get('unique_sent'))} |")
    lines.append(f"| Opens | {int(tw.get('opens', 0)):,} | {fmt_change(tw.get('opens'), lw.get('opens'))} |")
    lines.append(f"| Open Rate | {tw.get('open_rate', 0):.1f}% | {fmt_pct_change(tw.get('open_rate'), lw.get('open_rate'))} |")
    lines.append(f"| Replies | {int(tw.get('replies', 0)):,} | {fmt_change(tw.get('replies'), lw.get('replies'))} |")
    lines.append(f"| Reply Rate | {tw.get('reply_rate', 0):.1f}% | {fmt_pct_change(tw.get('reply_rate'), lw.get('reply_rate'))} |")
    lines.append(f"| Bounces | {int(tw.get('bounces', 0)):,} | {fmt_change(tw.get('bounces'), lw.get('bounces'))} |")
    lines.append(f"| Bounce Rate | {tw.get('bounce_rate', 0):.1f}% | {fmt_pct_change(tw.get('bounce_rate'), lw.get('bounce_rate'))} |")
    lines.append(f"| Interested Leads | {int(tw.get('leads_interested', 0)):,} | {fmt_change(tw.get('leads_interested'), lw.get('leads_interested'))} |")
    lines.append(f"| Total Pipeline | {int(tw.get('total_leads', 0)):,} | {fmt_change(tw.get('total_leads'), lw.get('total_leads'))} |")
    lines.append(f"| Active Campaigns | {int(tw.get('active_campaigns', 0)):,} | — |")
    lines.append("")

    # --- Campaign Performance ---
    if campaigns:
        lines.append("## Campaign Performance")
        lines.append("")
        lines.append("| Campaign | Status | Sent | Replies | Reply % | Leads |")
        lines.append("|----------|--------|------|---------|---------|-------|")
        for c in campaigns:
            reply_pct = (c['replies'] / c['unique_sent'] * 100) if c.get('unique_sent', 0) > 0 else 0
            lines.append(
                f"| {c['campaign_name']} | {c['campaign_status']} | "
                f"{int(c['emails_sent']):,} | {c['replies']} | "
                f"{reply_pct:.1f}% | {int(c['total_leads']):,} |"
            )
        lines.append("")

    # --- Pipeline Status ---
    lines.append("## Pipeline Status")
    lines.append("")
    lines.append(f"| Status | Count |")
    lines.append(f"|--------|-------|")
    lines.append(f"| Interested | {int(tw.get('leads_interested', 0)):,} |")
    lines.append(f"| In Progress | {int(tw.get('leads_in_progress', 0)):,} |")
    lines.append(f"| Not Started | {int(tw.get('leads_not_started', 0)):,} |")
    lines.append(f"| Completed | {int(tw.get('leads_completed', 0)):,} |")
    lines.append(f"| Blocked | {int(tw.get('leads_blocked', 0)):,} |")
    lines.append("")

    # --- Footer ---
    lines.append("---")
    lines.append("")
    lines.append(f"*Report generated by AIOS | Managed by Vantage AI*")
    lines.append("")

    return "\n".join(lines)


def send_telegram(text):
    """Send report summary to Telegram if configured."""
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    if not bot_token or not chat_id:
        print("Telegram not configured — skipping delivery")
        return False

    try:
        import requests
        # Send a truncated version (Telegram has a 4096 char limit)
        if len(text) > 4000:
            text = text[:3990] + "\n\n..."
        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10
        )
        resp.raise_for_status()
        print("Report sent to Telegram")
        return True
    except Exception as e:
        print(f"Telegram delivery failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Generate weekly outreach report")
    parser.add_argument("--dry-run", action="store_true", help="Preview without saving")
    parser.add_argument("--telegram", action="store_true", help="Also send via Telegram")
    parser.add_argument("--date", type=str, default=None, help="Report date (YYYY-MM-DD)")
    args = parser.parse_args()

    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        print("Run collection first: python scripts/collect.py")
        return

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row

    report = generate_report(conn, args.date)
    conn.close()

    if args.dry_run:
        print(report)
        return

    # Save report
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    today = args.date or datetime.now().strftime("%Y-%m-%d")
    filepath = OUTPUT_DIR / f"{today}-weekly-report.md"
    filepath.write_text(report)
    print(f"Report saved to: {filepath}")

    # Telegram delivery
    if args.telegram:
        send_telegram(report)

    # Print to stdout as well (for email copy-paste)
    print("\n" + report)


if __name__ == "__main__":
    main()
