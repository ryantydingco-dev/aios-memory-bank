# Plan: Slack Daily Brief for Creative Alternatives

**Created:** 2026-07-12
**Status:** LIVE (Slack-only) — first brief posted to #daily-brief 2026-07-12 evening.
- Email mirror to Kenny: **DEFERRED by Ryan (2026-07-12)** — Slack is the single channel for now. The SMTP code stays in post_brief.py (skips gracefully); revisit after the AOL→Gmail migration if Kenny wants an inbox copy.
- Remaining: macOS Full Disk Access grant for unattended 7 AM runs; confirm three consecutive automated morning posts.
- **Evolution intent (Ryan):** the brief is v1 and will be iterated as the AIOS grows — goal is that everyone sees the state of every part of the business. Roadmap: add sections per pillar as data lands (orders/ops status once the ops audit maps the workflow; outreach/pipeline from SmartLead + HubSpot; marketing/online presence once Pillar 3 starts; week-over-week deltas after 7+ days of snapshots).
**Request:** Deliver an automated morning business brief to a Slack channel shared by Kenny, Maclaine, and Ryan — Slack chosen over Telegram (CommandOS module's channel) as the team's communication layer.

---

## Overview

### What This Plan Accomplishes

Every morning at 7:00 AM, a `#daily-brief` Slack channel receives an automatically generated business brief: open A/R and the overdue chase list, yesterday's data freshness, sales pace, and the top 3 things needing attention. No one logs into QuickBooks or opens a dashboard — the numbers come to the team.

### Why This Matters

- Directly serves AIOS priority #1 (efficiency/visibility) and the **Away-From-Desk Autonomy** KPI: Kenny sees the business without touching a computer beyond his phone.
- Puts the **$377,981 of overdue A/R** in front of the team every single day until it shrinks.
- Establishes the team communication layer (Slack) that the Phase-2 interactive Q&A bot will plug into — answering "who owes us money?" from the same channel.
- This is the Slack-native replacement for the CommandOS (Telegram) + Daily Brief modules: borrow the modules' design, adapt the delivery channel.

---

## Current State

### Relevant Existing Structure

- `data/data.db` — SQLite warehouse (DataOS, installed 2026-07-12): `qb_ar_aging`, `qb_customers`, `sales_ledger`, `qb_pnl_by_year`, `smartlead_daily` (Ryan's Mac), `collection_log`
- `scripts/collect.py` — collection orchestrator; regenerates `context/group/key-metrics.md`
- `scripts/generate_metrics.py` — section-based markdown generator (pattern to reuse)
- `config/com.aios.data-collect.plist` — launchd job at 6:00 AM (**currently blocked by macOS privacy** — background jobs can't read ~/Documents until Python gets Full Disk Access)
- `.env` / `.env.example` — env template already has `SLACK_BOT_TOKEN` / `SLACK_APP_TOKEN` placeholders (Phase 2); no webhook entry yet
- `reference/data-access.md` — table schemas and the invoice-chase SQL this brief will use

### Gaps or Problems Being Addressed

- No Slack workspace exists yet (team currently coordinates ad hoc; Kenny on AOL email)
- No delivery mechanism for daily numbers; key-metrics.md only helps whoever opens Claude
- The 6 AM launchd job is installed but non-functional until Full Disk Access is granted
- No `SLACK_WEBHOOK_URL` credential

---

## Proposed Changes

### Summary of Changes

- Create free Slack workspace + `#daily-brief` channel + incoming webhook (user steps, guided)
- Build `scripts/generate_brief.py` — composes the brief from `data.db` (template-based, $0/month, no LLM required for v1)
- Build `scripts/post_brief.py` — posts the brief to Slack via webhook
- Add `com.aios.daily-brief.plist` launchd job at 7:00 AM (runs collect → generate → post)
- Fix the macOS Full Disk Access blocker (one-time user step, unblocks BOTH launchd jobs)
- Wire into workspace docs: CLAUDE.md, HISTORY.md, docs/_index.md (new system doc), .env.example

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `scripts/generate_brief.py` | Query data.db and compose the Slack-formatted brief (Block Kit JSON + plain-text fallback) |
| `scripts/post_brief.py` | POST the brief to `SLACK_WEBHOOK_URL`; exit non-zero on failure so the log shows it |
| `scripts/daily_brief.sh` | One-shot wrapper: collect → generate metrics → post brief (what launchd calls) |
| `config/com.aios.daily-brief.plist` | launchd schedule, 7:00 AM daily |
| `docs/slack-daily-brief.md` | System doc (from `docs/_templates/doc-system-template.md`): architecture, how to modify sections, troubleshooting |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `.env.example` | Add `SLACK_WEBHOOK_URL=` under the Notifications section with a comment |
| `.env` | User adds the real webhook URL (never committed) |
| `CLAUDE.md` | Add daily-brief to the Data section + note the Slack channel as the team communication layer |
| `docs/_index.md` | Register `docs/slack-daily-brief.md` |
| `HISTORY.md` | Entry when implemented |
| `context/people.md` / `context/strategy.md` | One-line note: team communication = Slack (decided 2026-07-12, Telegram rejected) |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **Slack over Telegram** — user decision 2026-07-12. Free plan is sufficient (webhooks unlimited; 90-day history limit acceptable for a daily brief).
2. **Incoming webhook, not a bot token, for v1** — 5-minute setup, no OAuth scopes, no admin complexity. The bot token comes in Phase 2 with the Q&A bot.
3. **Template-based brief (no LLM) for v1** — the numbers ARE the brief; SQL + f-strings produce it for $0/month with zero API keys. An LLM-narrated version (à la the Daily Brief module's Gemini call) can be layered on later once an Anthropic/Gemini key is set up.
4. **Runs on Kenny's Mac** — it now has the full warehouse; the Mac stays home/on. SmartLead numbers appear only if Ryan's Mac has pushed... (note: data.db is per-machine and gitignored — SmartLead section will simply be absent on Kenny's Mac; acceptable for v1, revisit in Phase 2).
5. **7:00 AM post, 6:00 AM collect** — collection job already exists at 6; brief wrapper re-runs collect anyway (idempotent) so the brief never posts stale data even if the 6 AM run was missed.
6. **Brief content prioritizes A/R** — the named #1 pain: headline = total A/R + overdue; then top-5 chase list with days-overdue; then pace, net income, freshness; then "3 things needing attention" (rule-based: largest new overdue, stalest data source, biggest week-over-week change).

### Alternatives Considered

- **Claude Tag (official Claude in Slack)** — rejected: requires Team/Enterprise Claude plan and runs cloud-side; cannot read the local SQLite warehouse.
- **CommandOS module as-is (Telegram)** — rejected by user preference.
- **Email delivery (Kenny's AOL)** — viable fallback, but Slack chosen as the forward-looking channel; can add an email mirror later if Kenny prefers.
- **Cron instead of launchd** — same macOS privacy wall, worse logging; launchd is the Mac-native choice and one job already exists.

### Open Questions — RESOLVED 2026-07-12

1. ~~Who creates the Slack workspace?~~ ✅ Already exists — **Maclaine created it**. Step 1 becomes: verify `#daily-brief` channel exists and all three members are in.
2. **Full Disk Access grant** — do during implementation (Step 6).
3. ~~Email mirror?~~ ✅ **YES — the brief also goes to Kenny's AOL inbox** (v1 scope, new Step 4b below). Interim sender: SMTP via a Gmail app password (Ryan's Gmail until Google Workspace exists — see the separate AOL→Gmail migration project). `SMTP_USER` / `SMTP_APP_PASSWORD` / `BRIEF_EMAIL_TO` added to `.env`. Missing creds = graceful skip, same as the webhook.

---

## Step-by-Step Tasks

### Step 1: Slack workspace + channel (user-guided, ~10 min)

Walk the user through, in the browser:

**Actions:**
- Create workspace at slack.com/create → name "Creative Alternatives" → invite Maclaine + Kenny
- Create channel `#daily-brief`
- Note: free plan is fine; skip all upgrade prompts

**Files affected:** none

---

### Step 2: Incoming webhook (user-guided, ~5 min)

**Actions:**
- Go to api.slack.com/apps → Create New App → From scratch → name "AIOS Daily Brief", pick the workspace
- In the app: Incoming Webhooks → toggle ON → Add New Webhook to Workspace → channel `#daily-brief` → Allow
- Copy the webhook URL (`https://hooks.slack.com/services/...`)
- User pastes it into `.env` as `SLACK_WEBHOOK_URL=...` (Claude must not display the URL back; treat as a secret)
- Add `SLACK_WEBHOOK_URL=` placeholder + comment to `.env.example`

**Files affected:** `.env`, `.env.example`

---

### Step 3: Build `scripts/generate_brief.py`

Compose the brief from data.db. Follow `generate_metrics.py` conventions (same query helpers, graceful `table_exists` degradation — every section optional).

**Spec:**
- Output: writes `outputs/daily-brief/YYYY-MM-DD.md` (archive) and prints Slack Block Kit JSON to stdout (or `--format text` for plain mrkdwn)
- Sections, in order:
  1. **Header** — "☀️ Creative Alternatives Daily Brief — {date}"
  2. **A/R headline** — total open, total overdue, 91+ bucket (from `qb_ar_aging`); flag if the as-of date is >14 days old: "⚠️ A/R data is from {date} — re-export from QuickBooks"
  3. **Chase list** — top 5 overdue with amounts + days bucket, joined to `qb_customers` for email/phone
  4. **Business pulse** — QBO net income by year (latest 2), ledger pace line (reuse the guarded logic from `generate_metrics.py` — cutoff at last non-future entry, with the "QBO is source of truth" caveat)
  5. **Outreach** — SmartLead latest row if table exists (it won't on Kenny's Mac v1 — section silently absent)
  6. **3 things needing attention** — rule-based: (a) largest overdue account not already flagged yesterday, (b) stalest data source from `collection_log`, (c) any collector that errored in the last run
  7. **Footer** — "Reply here or open Claude and run /prime for details"
- Slack text limits: keep blocks under 3,000 chars each; chase list as a single `section` block with mrkdwn table-ish lines (Slack has no real tables)

**Files affected:** `scripts/generate_brief.py`, `outputs/daily-brief/` (new dir, gitignore the dated files? No — keep them committed; they're small and useful history)

---

### Step 4: Build `scripts/post_brief.py`

**Spec:**
- Loads `SLACK_WEBHOOK_URL` via `scripts/config.py` pattern (`get_env`)
- If missing → print "skipped: SLACK_WEBHOOK_URL not set" and exit 0 (graceful degradation, same philosophy as collectors)
- POSTs the Block Kit payload from `generate_brief.py`; on non-200, print response and exit 1
- `--dry-run` flag: print payload, don't post

**Files affected:** `scripts/post_brief.py`

---

### Step 4b: Email mirror to Kenny (AOL)

**Spec:**
- `scripts/post_brief.py` gains an email path: after (or instead of) the Slack post, send the plain-text/HTML brief via SMTP (`smtplib`, TLS) using `SMTP_USER`/`SMTP_APP_PASSWORD` from `.env`, to `BRIEF_EMAIL_TO` (Kenny's AOL address)
- Subject: "☀️ CA Daily Brief — {date}"
- Missing SMTP creds → logged skip, exit 0
- The user (not Claude) generates and pastes the Gmail app password into `.env`

**Files affected:** `scripts/post_brief.py`, `.env.example`

---

### Step 5: Build `scripts/daily_brief.sh` + launchd job

**Spec:**
```bash
#!/bin/bash
cd "/Users/kennyscher/Documents/Creative Alternatives AIOS"
.venv/bin/python scripts/collect.py
.venv/bin/python scripts/generate_brief.py > /tmp/brief_payload.json
.venv/bin/python scripts/post_brief.py /tmp/brief_payload.json
```
- `config/com.aios.daily-brief.plist`: same shape as the existing data-collect plist, Hour=7 Minute=0, logs to `data/brief.log`
- `cp` to `~/Library/LaunchAgents/` + `launchctl load`

**Files affected:** `scripts/daily_brief.sh`, `config/com.aios.daily-brief.plist`

---

### Step 6: Unblock macOS (one-time user step)

launchd jobs can't read ~/Documents without Full Disk Access. Guide the user:

**Actions:**
- System Settings → Privacy & Security → Full Disk Access → "+"
- Press ⌘⇧G in the file picker, paste `/Library/Developer/CommandLineTools/usr/bin/python3`, Add, toggle ON
- Verify: `launchctl start com.aios.daily-brief` then read `data/brief.log` — must show a successful collect + post (or webhook skip if Step 2 pending)
- This also un-breaks the existing 6 AM data-collect job

**Files affected:** none (system setting)

---

### Step 7: Test end to end

**Actions:**
- `.venv/bin/python scripts/generate_brief.py --format text` → review content with the user
- `scripts/daily_brief.sh` manually → confirm the message lands in `#daily-brief`
- `launchctl start com.aios.daily-brief` → confirm the scheduled path works too
- Check the message renders well on a phone (ask Ryan to check the Slack mobile app)

---

### Step 8: Documentation + commit

**Actions:**
- Write `docs/slack-daily-brief.md` from the system template (architecture, how to add/remove sections, how to change the schedule, troubleshooting: webhook 404 = regenerate webhook; empty brief = run /update-data; no post = check FDA grant + `data/brief.log`)
- Register in `docs/_index.md`; update CLAUDE.md Data section + communication note; add the Slack decision to `context/strategy.md`; HISTORY.md entry
- `/commit` and `git push`

---

## Connections & Dependencies

### Files That Reference This Area

- `CLAUDE.md` (Data section, Commands list), `reference/data-access.md` (automation note), `.claude/commands/update-data.md` (collection pipeline)

### Updates Needed for Consistency

- `.env.example` gains `SLACK_WEBHOOK_URL`; Ryan's Mac can add the same key later to post from his side (only one machine should have the 7 AM job — Kenny's, per Design Decision 4)

### Impact on Existing Workflows

- Extends (doesn't change) the DataOS pipeline; `/update-data` unaffected
- Phase 2 (Q&A bot: Slack Bolt + Socket Mode + Claude Agent SDK, using `SLACK_BOT_TOKEN`/`SLACK_APP_TOKEN`) will be a separate plan — this plan's webhook and channel are its foundation

---

## Validation Checklist

- [ ] `#daily-brief` channel exists with all three members
- [ ] `generate_brief.py` runs clean and its text output is accurate vs. key-metrics.md
- [ ] `post_brief.py --dry-run` produces valid Block Kit JSON; real run lands in Slack
- [ ] Message renders correctly on Slack mobile
- [ ] `launchctl start com.aios.daily-brief` completes with a successful `data/brief.log`
- [ ] Full Disk Access granted; the 6 AM data-collect job also now runs (check `data/collect.log` next morning)
- [ ] Missing `SLACK_WEBHOOK_URL` degrades gracefully (exit 0, logged skip)
- [ ] docs/_index.md, CLAUDE.md, HISTORY.md updated; committed and pushed

---

## Success Criteria

1. For three consecutive mornings, the brief posts to `#daily-brief` at 7:00 AM without human action
2. The brief's A/R numbers match QuickBooks' aging report
3. Kenny can read it on his phone and knows who to call about money owed — without opening QuickBooks
4. Total recurring cost: $0/month

---

## Notes

- **v2 ideas:** LLM-narrated summary paragraph (needs Anthropic/Gemini key); week-over-week deltas once 7+ days of snapshots accumulate; email mirror to Kenny's AOL; per-person @mentions when an account crosses 60 days overdue
- **Phase 2 (separate plan):** interactive Q&A bot in `#ask-the-ai` — Slack Bolt (Socket Mode) + Claude Agent SDK reading data.db; ~2-4 hr build; needs `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `ANTHROPIC_API_KEY`
- **A/R data freshness depends on QBO CSV re-exports** until a live QuickBooks API collector is built — the brief's staleness warning (Step 3, section 2) keeps this honest
