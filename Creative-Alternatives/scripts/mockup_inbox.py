#!/usr/bin/env python3
"""
Mockup Inbox — polls Smartlead for new replies on the Swag campaigns and queues them
for the agentic mockup pipeline (see .claude/commands/mockup-inbox.md).

Usage:
  python3 scripts/mockup_inbox.py poll          # fetch new replies -> queue/inbox/*.json
  python3 scripts/mockup_inbox.py list          # show queue status
  python3 scripts/mockup_inbox.py mark <stats_id> <done|skipped>

Design: this script only POLLS and QUEUES (pure API, cron-safe). Classification,
mockup generation, lookbook, drafting, and SENDING are done by Claude in the
/mockup-inbox runbook — with Ryan approving every send. Nothing here sends email.
"""
import json, os, re, sys, subprocess, urllib.request, urllib.parse
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # repo root
QUEUE = os.path.join(HERE, "queue")
INBOX = os.path.join(QUEUE, "inbox")
STATE = os.path.join(QUEUE, "state.json")
UA = {"User-Agent": "Mozilla/5.0"}
BASE = "https://server.smartlead.ai/api/v1"

CAMPAIGN_NAME_FILTER = re.compile(r"^Swag", re.I)   # only the Swag verticals
CAMPAIGN_STATUSES = {"ACTIVE", "COMPLETED", "PAUSED"}  # drafted campaigns have no sends


def api_key():
    if os.environ.get("SMARTLEAD_API_KEY"):
        return os.environ["SMARTLEAD_API_KEY"]
    for env in (os.path.join(HERE, ".env"), os.path.expanduser("~/Documents/AIOS/.env")):
        if os.path.exists(env):
            for line in open(env):
                if "SMARTLEAD" in line and "=" in line:
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("No SMARTLEAD key found (env SMARTLEAD_API_KEY or .env)")


def get(path, **params):
    params["api_key"] = KEY
    url = f"{BASE}{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=UA)
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


def load_state():
    if os.path.exists(STATE):
        return json.load(open(STATE))
    return {"seen_stats_ids": []}


def save_state(st):
    os.makedirs(QUEUE, exist_ok=True)
    json.dump(st, open(STATE, "w"), indent=1)


def fetch_lead_id(email):
    try:
        d = get("/leads/", email=email)
        return d.get("id")
    except Exception:
        return None


def fetch_reply_text(campaign_id, lead_id):
    """Best-effort: pull the lead's message history and return the latest inbound reply."""
    try:
        d = get(f"/campaigns/{campaign_id}/leads/{lead_id}/message-history")
        hist = d.get("history") or []
        replies = [h for h in hist if h.get("type") == "REPLY"]
        if replies:
            h = replies[-1]
            body = re.sub(r"<[^>]+>", " ", h.get("email_body") or "")
            return {"reply_text": re.sub(r"\s+", " ", body).strip()[:2000],
                    "reply_message_id": h.get("message_id"),
                    "reply_time": h.get("time")}
    except Exception as e:
        return {"reply_text": None, "error": str(e)}
    return {"reply_text": None}


def poll():
    st = load_state()
    seen = set(st["seen_stats_ids"])
    os.makedirs(INBOX, exist_ok=True)
    campaigns = get("/campaigns")
    new_items = 0
    for c in campaigns:
        if not CAMPAIGN_NAME_FILTER.search(c.get("name") or ""):
            continue
        if (c.get("status") or "").upper() not in CAMPAIGN_STATUSES:
            continue
        offset, limit = 0, 100
        while True:
            stats = get(f"/campaigns/{c['id']}/statistics", offset=offset, limit=limit)
            rows = stats.get("data") or []
            for r in rows:
                if not r.get("reply_time") or r.get("stats_id") in seen:
                    continue
                if r.get("is_bounced") or r.get("is_unsubscribed"):
                    seen.add(r["stats_id"]); continue
                lead_id = fetch_lead_id(r["lead_email"])
                extra = fetch_reply_text(c["id"], lead_id) if lead_id else {}
                item = {
                    "stats_id": r["stats_id"],
                    "campaign_id": c["id"],
                    "campaign_name": c["name"],
                    "lead_email": r["lead_email"],
                    "lead_name": r.get("lead_name"),
                    "lead_id": lead_id,
                    "lead_category": r.get("lead_category"),
                    "seq_number": r.get("sequence_number"),
                    "email_subject": r.get("email_subject"),
                    "reply_time": r.get("reply_time"),
                    "queued_at": datetime.now(timezone.utc).isoformat(),
                    "status": "new",
                    **extra,
                }
                fn = os.path.join(INBOX, f"{r['stats_id']}.json")
                json.dump(item, open(fn, "w"), indent=1)
                seen.add(r["stats_id"])
                new_items += 1
                print(f"QUEUED  {c['name']}  {r['lead_email']}  ({r.get('lead_name')})")
            if len(rows) < limit:
                break
            offset += limit
    st["seen_stats_ids"] = sorted(seen)
    st["last_poll"] = datetime.now(timezone.utc).isoformat()
    save_state(st)
    print(f"poll complete: {new_items} new repl{'y' if new_items==1 else 'ies'} queued")
    return new_items


def list_queue():
    if not os.path.isdir(INBOX):
        print("queue empty"); return
    items = [json.load(open(os.path.join(INBOX, f))) for f in sorted(os.listdir(INBOX)) if f.endswith(".json")]
    if not items:
        print("queue empty"); return
    for it in items:
        print(f"[{it['status']:>7}] {it['stats_id'][:8]}  {it['campaign_name']}  "
              f"{it['lead_email']}  reply: {(it.get('reply_text') or '(fetch in runbook)')[:80]}")


def mark(stats_id, status):
    for f in os.listdir(INBOX):
        if f.startswith(stats_id):
            p = os.path.join(INBOX, f)
            it = json.load(open(p)); it["status"] = status
            json.dump(it, open(p, "w"), indent=1)
            print(f"marked {stats_id} -> {status}"); return
    sys.exit(f"no queue item matching {stats_id}")


if __name__ == "__main__":
    KEY = api_key()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "poll"
    if cmd == "poll":
        poll()
    elif cmd == "list":
        list_queue()
    elif cmd == "mark" and len(sys.argv) >= 4:
        mark(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
