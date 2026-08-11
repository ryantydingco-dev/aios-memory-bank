"""
AIOS Client Workspace — SmartLead Collector

Fetches campaign analytics from SmartLead for all campaigns.
Tracks daily snapshots of emails sent, opens, replies, bounces,
and lead pipeline status across all campaigns.

Requires:
    SMARTLEAD_API_KEY — app.smartlead.ai > Settings > API Keys

Tables created: smartlead_daily, smartlead_campaigns
"""

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

try:
    import requests
except ImportError:
    raise ImportError("Missing 'requests' — run: pip install requests")

API_BASE = "https://server.smartlead.ai/api/v1"


def collect():
    """Collect analytics from all SmartLead campaigns."""
    api_key = os.getenv("SMARTLEAD_API_KEY", "").strip()
    if not api_key:
        return {
            "source": "smartlead", "status": "skipped",
            "reason": "Missing SMARTLEAD_API_KEY — get it from app.smartlead.ai > Settings > API Keys"
        }

    try:
        # Fetch all campaigns
        resp = requests.get(
            f"{API_BASE}/campaigns?api_key={api_key}", timeout=15
        )
        resp.raise_for_status()
        campaigns = resp.json()

        # Fetch analytics for each campaign
        campaign_data = []
        totals = {
            "emails_sent": 0,
            "unique_sent": 0,
            "opens": 0,
            "unique_opens": 0,
            "clicks": 0,
            "replies": 0,
            "bounces": 0,
            "unsubscribed": 0,
            "total_leads": 0,
            "leads_interested": 0,
            "leads_in_progress": 0,
            "leads_completed": 0,
            "leads_not_started": 0,
            "leads_blocked": 0,
            "active_campaigns": 0,
        }

        for camp in campaigns:
            cid = camp["id"]
            name = camp.get("name", f"campaign_{cid}")
            status = camp.get("status", "UNKNOWN")

            # Get analytics for this campaign
            r = requests.get(
                f"{API_BASE}/campaigns/{cid}/analytics?api_key={api_key}",
                timeout=15
            )
            r.raise_for_status()
            analytics = r.json()

            lead_stats = analytics.get("campaign_lead_stats", {})

            row = {
                "campaign_id": cid,
                "campaign_name": name,
                "campaign_status": status,
                "emails_sent": int(analytics.get("sent_count", 0)),
                "unique_sent": int(analytics.get("unique_sent_count", 0)),
                "opens": int(analytics.get("open_count", 0)),
                "unique_opens": int(analytics.get("unique_open_count", 0)),
                "clicks": int(analytics.get("click_count", 0)),
                "unique_clicks": int(analytics.get("unique_click_count", 0)),
                "replies": int(analytics.get("reply_count", 0)),
                "bounces": int(analytics.get("bounce_count", 0)),
                "unsubscribed": int(analytics.get("unsubscribed_count", 0)),
                "total_leads": int(lead_stats.get("total", 0)),
                "leads_interested": int(lead_stats.get("interested", 0)),
                "leads_in_progress": int(lead_stats.get("inprogress", 0)),
                "leads_completed": int(lead_stats.get("completed", 0)),
                "leads_not_started": int(lead_stats.get("notStarted", 0)),
                "leads_blocked": int(lead_stats.get("blocked", 0)),
                "leads_paused": int(lead_stats.get("paused", 0)),
                "leads_stopped": int(lead_stats.get("stopped", 0)),
                "sequence_count": int(analytics.get("sequence_count", 0)),
            }
            campaign_data.append(row)

            # Accumulate totals
            totals["emails_sent"] += row["emails_sent"]
            totals["unique_sent"] += row["unique_sent"]
            totals["opens"] += row["opens"]
            totals["unique_opens"] += row["unique_opens"]
            totals["clicks"] += row["clicks"]
            totals["replies"] += row["replies"]
            totals["bounces"] += row["bounces"]
            totals["unsubscribed"] += row["unsubscribed"]
            totals["total_leads"] += row["total_leads"]
            totals["leads_interested"] += row["leads_interested"]
            totals["leads_in_progress"] += row["leads_in_progress"]
            totals["leads_completed"] += row["leads_completed"]
            totals["leads_not_started"] += row["leads_not_started"]
            totals["leads_blocked"] += row["leads_blocked"]
            if status == "ACTIVE":
                totals["active_campaigns"] += 1

        # Calculate rates from totals
        if totals["unique_sent"] > 0:
            totals["open_rate"] = (totals["unique_opens"] / totals["unique_sent"]) * 100
            totals["reply_rate"] = (totals["replies"] / totals["unique_sent"]) * 100
            totals["bounce_rate"] = (totals["bounces"] / totals["unique_sent"]) * 100
        else:
            totals["open_rate"] = 0.0
            totals["reply_rate"] = 0.0
            totals["bounce_rate"] = 0.0

        return {
            "source": "smartlead",
            "status": "success",
            "data": {
                "campaigns": campaign_data,
                "totals": totals,
                "campaign_count": len(campaigns),
            }
        }

    except Exception as e:
        # requests exceptions embed the full URL — scrub the api_key before it reaches logs
        reason = str(e).replace(api_key, "***") if api_key else str(e)
        return {"source": "smartlead", "status": "error", "reason": reason}


def write(conn, result, date):
    """Write SmartLead data to database. Returns records written."""
    # Daily aggregate table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS smartlead_daily (
            date TEXT PRIMARY KEY,
            emails_sent INTEGER,
            unique_sent INTEGER,
            opens INTEGER,
            unique_opens INTEGER,
            clicks INTEGER,
            replies INTEGER,
            bounces INTEGER,
            unsubscribed INTEGER,
            open_rate REAL,
            reply_rate REAL,
            bounce_rate REAL,
            total_leads INTEGER,
            leads_interested INTEGER,
            leads_in_progress INTEGER,
            leads_completed INTEGER,
            leads_not_started INTEGER,
            leads_blocked INTEGER,
            active_campaigns INTEGER,
            campaign_count INTEGER,
            collected_at TEXT
        )
    """)

    # Per-campaign table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS smartlead_campaigns (
            date TEXT NOT NULL,
            campaign_id INTEGER NOT NULL,
            campaign_name TEXT,
            campaign_status TEXT,
            emails_sent INTEGER,
            unique_sent INTEGER,
            opens INTEGER,
            unique_opens INTEGER,
            clicks INTEGER,
            unique_clicks INTEGER,
            replies INTEGER,
            bounces INTEGER,
            unsubscribed INTEGER,
            total_leads INTEGER,
            leads_interested INTEGER,
            leads_in_progress INTEGER,
            leads_completed INTEGER,
            leads_not_started INTEGER,
            leads_blocked INTEGER,
            leads_paused INTEGER,
            leads_stopped INTEGER,
            sequence_count INTEGER,
            collected_at TEXT,
            PRIMARY KEY (date, campaign_id)
        )
    """)

    if result.get("status") != "success":
        conn.commit()
        return 0

    data = result["data"]
    totals = data["totals"]
    collected_at = datetime.now(timezone.utc).isoformat()
    records = 0

    # Write daily aggregate
    conn.execute(
        "INSERT OR REPLACE INTO smartlead_daily "
        "(date, emails_sent, unique_sent, opens, unique_opens, clicks, "
        "replies, bounces, unsubscribed, open_rate, reply_rate, bounce_rate, "
        "total_leads, leads_interested, leads_in_progress, leads_completed, "
        "leads_not_started, leads_blocked, active_campaigns, campaign_count, collected_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (date, totals["emails_sent"], totals["unique_sent"],
         totals["opens"], totals["unique_opens"], totals["clicks"],
         totals["replies"], totals["bounces"], totals["unsubscribed"],
         totals["open_rate"], totals["reply_rate"], totals["bounce_rate"],
         totals["total_leads"], totals["leads_interested"],
         totals["leads_in_progress"], totals["leads_completed"],
         totals["leads_not_started"], totals["leads_blocked"],
         totals["active_campaigns"], data["campaign_count"], collected_at)
    )
    records += 1

    # Write per-campaign data
    for camp in data["campaigns"]:
        conn.execute(
            "INSERT OR REPLACE INTO smartlead_campaigns "
            "(date, campaign_id, campaign_name, campaign_status, "
            "emails_sent, unique_sent, opens, unique_opens, clicks, unique_clicks, "
            "replies, bounces, unsubscribed, total_leads, leads_interested, "
            "leads_in_progress, leads_completed, leads_not_started, leads_blocked, "
            "leads_paused, leads_stopped, sequence_count, collected_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (date, camp["campaign_id"], camp["campaign_name"], camp["campaign_status"],
             camp["emails_sent"], camp["unique_sent"], camp["opens"], camp["unique_opens"],
             camp["clicks"], camp["unique_clicks"], camp["replies"], camp["bounces"],
             camp["unsubscribed"], camp["total_leads"], camp["leads_interested"],
             camp["leads_in_progress"], camp["leads_completed"], camp["leads_not_started"],
             camp["leads_blocked"], camp["leads_paused"], camp["leads_stopped"],
             camp["sequence_count"], collected_at)
        )
        records += 1

    conn.commit()
    return records


if __name__ == "__main__":
    result = collect()
    db_path = Path(__file__).resolve().parent.parent / "data" / "data.db"
    conn = sqlite3.connect(db_path)
    records = write(conn, result, datetime.now(timezone.utc).date().isoformat())
    conn.close()
    print(f"Persisted {records} record(s) to {db_path.name}")
    if result["status"] == "success":
        data = result["data"]
        totals = data["totals"]
        print(f"SmartLead — {data['campaign_count']} campaigns ({totals['active_campaigns']} active)")
        print(f"  Emails sent: {totals['emails_sent']} ({totals['unique_sent']} unique leads)")
        print(f"  Opens: {totals['opens']} ({totals['open_rate']:.1f}% open rate)")
        print(f"  Replies: {totals['replies']} ({totals['reply_rate']:.1f}% reply rate)")
        print(f"  Bounces: {totals['bounces']} ({totals['bounce_rate']:.1f}% bounce rate)")
        print(f"  Total leads: {totals['total_leads']}")
        print(f"  Interested: {totals['leads_interested']}")
    else:
        print(f"{result['status']}: {result.get('reason', '')}")
