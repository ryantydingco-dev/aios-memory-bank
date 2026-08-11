#!/usr/bin/env python3
"""Fetch new SmartLead replies into the reply-watcher folder.

Run from the project root:  python3 scripts/fetch_smartlead_replies.py

- Scans every non-DRAFTED campaign for leads whose latest reply_time is newer
  than this script's per-campaign watermark (state file below).
- Writes one markdown file per lead-with-new-reply into
  pillars/2-customer-acquisition/reply-watcher/replies/  (idempotent filenames).
- Read-only against SmartLead. Never sends, never mutates campaigns.

State: pillars/2-customer-acquisition/reply-watcher/.agent-state/fetch-state.json
  {"campaigns": {"<id>": {"watermark": "<iso>", "name": "..."}}}
On first sight of a campaign the watermark defaults to FIRST_RUN_BACKFILL below.
"""
import json, os, re, subprocess, sys, time, html
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WATCH = os.path.join(ROOT, "pillars", "2-customer-acquisition", "reply-watcher")
REPLIES = os.path.join(WATCH, "replies")
STATE_PATH = os.path.join(WATCH, ".agent-state", "fetch-state.json")
BASE = "https://server.smartlead.ai/api/v1"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# Replies before this are considered historical on a campaign's first scan
# (the two completed campaigns were fully scored on 2026-07-03).
FIRST_RUN_BACKFILL = "2026-07-01T00:00:00.000Z"


def api_key():
    for line in open(os.path.join(ROOT, ".env")):
        m = re.match(r"\s*SMARTLEAD_API_KEY\s*=\s*[\"']?([^\"'\s]+)", line)
        if m:
            return m.group(1)
    sys.exit("SMARTLEAD_API_KEY not found in .env")


KEY = api_key()


def get(path, params=""):
    url = f"{BASE}{path}?api_key={KEY}{params}"
    for attempt in range(4):
        r = subprocess.run(["curl", "-s", "-A", UA, "--max-time", "60", url],
                           capture_output=True, text=True)
        try:
            return json.loads(r.stdout)
        except Exception:
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"SmartLead API failed: {path}")


def strip_html(s):
    if not s:
        return ""
    s = re.sub(r"<(br|/p|/div)[^>]*>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = re.split(r"\nOn .{10,80} wrote:|\n>+ |\n-{5,}|\nFrom: ", s)[0]
    return re.sub(r"\n{3,}", "\n\n", s).strip()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def load_state():
    if os.path.exists(STATE_PATH):
        return json.load(open(STATE_PATH))
    return {"campaigns": {}}


def save_state(state):
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    json.dump(state, open(STATE_PATH, "w"), indent=1)


def fetch_stats(cid):
    rows, offset = [], 0
    while True:
        d = get(f"/campaigns/{cid}/statistics", f"&offset={offset}&limit=500")
        batch = d.get("data") or []
        rows += batch
        offset += len(batch)
        if not batch or offset >= int(d.get("total_stats") or 0):
            return rows
        time.sleep(0.3)


def lead_id_map(cid):
    ids, offset = {}, 0
    while True:
        d = get(f"/campaigns/{cid}/leads", f"&offset={offset}&limit=100")
        batch = d.get("data") or []
        for item in batch:
            lead = item.get("lead") or {}
            if lead.get("email"):
                ids[lead["email"]] = lead.get("id")
        offset += len(batch)
        if not batch or offset >= int(d.get("total_leads") or 0):
            return ids
        time.sleep(0.2)


def main():
    os.makedirs(REPLIES, exist_ok=True)
    state = load_state()
    campaigns = get("/campaigns")
    new_files = 0
    for c in campaigns:
        if c.get("status") == "DRAFTED":
            continue
        cid = str(c["id"])
        cstate = state["campaigns"].setdefault(
            cid, {"watermark": FIRST_RUN_BACKFILL, "name": c.get("name")})
        watermark = cstate["watermark"]
        stats = fetch_stats(cid)
        # newest reply_time per lead
        newest = {}
        names = {}
        for r in stats:
            rt = r.get("reply_time")
            if rt:
                e = r["lead_email"]
                newest[e] = max(newest.get(e, ""), rt)
                names[e] = r.get("lead_name") or ""
        fresh = {e: t for e, t in newest.items() if t > watermark}
        if fresh:
            ids = lead_id_map(cid)
            for e, t in sorted(fresh.items()):
                lid = ids.get(e)
                body = "<lead id not found>"
                if lid:
                    h = get(f"/campaigns/{cid}/leads/{lid}/message-history")
                    msgs = h.get("history") or []
                    parts = []
                    for m in msgs:
                        typ = (m.get("type") or "").upper()
                        stamp = m.get("time") or ""
                        txt = strip_html(m.get("email_body"))
                        parts.append(f"### {typ} — {stamp}\n\n{txt}")
                    body = "\n\n".join(parts)
                    time.sleep(0.3)
                fname = f"{t[:10]}-{slug(e)}.md"
                path = os.path.join(REPLIES, fname)
                if not os.path.exists(path):
                    with open(path, "w") as f:
                        f.write(f"# Reply — {names.get(e, '')} <{e}>\n\n"
                                f"- Campaign: {c.get('name')} (id {cid})\n"
                                f"- Latest reply: {t}\n\n"
                                f"## Full thread (oldest first)\n\n{body}\n")
                    new_files += 1
            cstate["watermark"] = max(fresh.values())
        print(f"{c.get('name')}: {len(newest)} repliers total, "
              f"{len(fresh)} new since {watermark[:10]}", flush=True)
    save_state(state)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"\n{new_files} new reply file(s) written to {REPLIES} at {stamp}")


if __name__ == "__main__":
    main()
