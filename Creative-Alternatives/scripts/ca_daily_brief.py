#!/usr/bin/env python3
"""
CA Daily Outbound Brief — ONE Telegram message each morning with everything Ryan
needs to know or do. The point: Ryan never has to remember the machine's state.

Aggregates (all read-only, cron-safe):
  - SmartLead campaigns: ACTIVE (sending) + DRAFTED (waiting for his click)
  - Mockup queue: replies waiting for the mockup treatment (queue/inbox/*.json)
  - Touch ledger: total contacts protected
  - Cockpit todos: data/outbound/cockpit_todos.json — the ONLY human to-do list.
    Sessions/Claude add items; Ryan (or a session) removes them when done.

Scheduled: com.aios.ca-daily-brief (launchd, 7:35am daily).
Manual run: .venv/bin/python scripts/ca_daily_brief.py
"""
import csv
import glob
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODOS = os.path.join(HERE, "data", "outbound", "cockpit_todos.json")
LEDGER = os.path.join(HERE, "data", "outbound", "contacted.csv")
QUEUE = os.path.join(HERE, "queue", "inbox")
UA = {"User-Agent": "Mozilla/5.0", "Content-Type": "application/json"}


def env(k):
    v = os.getenv(k, "").strip()
    if v:
        return v
    envfile = os.path.join(HERE, ".env")
    if os.path.exists(envfile):
        for line in open(envfile):
            if line.startswith(f"{k}="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


def smartlead_campaigns():
    key = env("SMARTLEAD_API_KEY")
    if not key:
        return None, None
    try:
        req = urllib.request.Request(
            f"https://server.smartlead.ai/api/v1/campaigns?api_key={key}", headers=UA)
        data = json.loads(urllib.request.urlopen(req, timeout=30).read())
        active = []
        for c in data:
            if c.get("status") != "ACTIVE":
                continue
            label = c["name"]
            try:
                a = json.loads(urllib.request.urlopen(urllib.request.Request(
                    f"https://server.smartlead.ai/api/v1/campaigns/{c['id']}/analytics?api_key={key}",
                    headers=UA), timeout=30).read())
                interested = (a.get("campaign_lead_stats") or {}).get("interested", 0)
                label = (f"{c['name']}: {a.get('sent_count','?')} sent, "
                         f"{a.get('reply_count','?')} replies, {interested} interested")
            except Exception:
                pass
            active.append(label)
        drafted = [c["name"] for c in data if c.get("status") == "DRAFTED"]
        return active, drafted
    except Exception as e:
        print(f"smartlead fetch failed: {e}", file=sys.stderr)
        return None, None


def build_brief():
    lines = ["📊 CA Outbound — daily brief", ""]

    active, drafted = smartlead_campaigns()
    if active is not None:
        lines.append(f"▶️ Sending: {len(active)} campaigns" +
                     (f" — {', '.join(active[:4])}" if active else ""))
        if drafted:
            lines.append(f"📝 Drafts waiting for your Start click: {len(drafted)}")
    else:
        lines.append("⚠️ SmartLead unreachable this morning")

    pending = len(glob.glob(os.path.join(QUEUE, "*.json")))
    if pending:
        lines.append(f"🔥 {pending} replies in the mockup queue — run /mockup-inbox (same-hour rule)")

    # Warm pipeline (HubSpot): interested leads replied-to but silent, chased on cadence.
    try:
        from hubspot_warm import chase_lines
        warm = chase_lines()
        if warm:
            lines.append("")
            lines.extend(warm)
    except Exception as e:
        print(f"warm-pipeline section skipped: {e}", file=sys.stderr)

    if os.path.exists(LEDGER):
        n = sum(1 for _ in open(LEDGER)) - 1
        lines.append(f"🛡 Ledger: {max(n,0):,} contacts protected from double-touch")

    todos = []
    if os.path.exists(TODOS):
        todos = json.load(open(TODOS))
    if todos:
        lines.append("")
        lines.append("Needs YOU (nothing else does):")
        for i, t in enumerate(todos, 1):
            lines.append(f"{i}. {t['item']}")
    else:
        lines.append("")
        lines.append("✅ Nothing needs you today — the machine is running.")

    return "\n".join(lines)


def send(text):
    token = env("TELEGRAM_BOT_TOKEN")
    chat = env("TELEGRAM_GROUP_ID") or env("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print("no telegram creds; printing instead:\n" + text)
        return
    payload = json.dumps({"chat_id": chat, "text": text}).encode()  # plain text — Markdown chokes on _ in filenames
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage", data=payload, headers=UA, method="POST")
    r = json.loads(urllib.request.urlopen(req, timeout=30).read())
    print("telegram:", "sent ✓" if r.get("ok") else r)


if __name__ == "__main__":
    brief = build_brief()
    if "--dry" in sys.argv:
        print(brief)
    else:
        send(brief)
