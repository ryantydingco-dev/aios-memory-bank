# System: Slack Daily Brief

> Every morning at 7:00 AM, `#daily-brief` in the Creative Alternatives Slack (created by Maclaine)
> receives an auto-generated business brief; a copy is emailed to Kenny. Built 2026-07-12.

## What it does

Collects fresh data → composes a brief from `data.db` → posts to Slack (webhook) and emails Kenny (SMTP).
Content: A/R headline + overdue chase list (with contact info), open orders across the three shared
production sheets (Viking, Diamond, Random Vendors — going out today/tomorrow/this week, past-due and
rush flags), net income, ledger pace, outreach stats (Ryan's Mac only), rule-based "needs attention"
items. Template-based — no LLM, $0/month.

## Architecture

```
launchd com.aios.daily-brief (7:00 AM)
  └─ .venv/bin/python scripts/daily_brief.py
       ├─ scripts/collect.py            # refresh data.db (all collectors)
       ├─ scripts/generate_brief.py     # data.db -> Block Kit JSON + outputs/daily-brief/YYYY-MM-DD.md
       └─ scripts/post_brief.py         # -> Slack webhook + SMTP email mirror
```

- **Credentials** (in `.env`, never committed): `SLACK_WEBHOOK_URL`, `SMTP_USER`,
  `SMTP_APP_PASSWORD` (Gmail app password), `BRIEF_EMAIL_TO` (Kenny's address)
- Missing credentials = logged skip, exit 0. Real delivery failure = exit 1 (visible in log).
- **Archive:** every brief saved to `outputs/daily-brief/` (committed — useful history)
- **Log:** `data/brief.log`

## How to modify

- **Add/remove a section:** edit `scripts/generate_brief.py` — each `sec_*()` returns markdown
  lines or `[]`; register in `build()`. Same pattern as `generate_metrics.py`.
- **Change the schedule:** edit Hour/Minute in `config/com.aios.daily-brief.plist`, then
  `cp` to `~/Library/LaunchAgents/` and `launchctl unload` + `load` it.
- **Test without posting:** `.venv/bin/python scripts/generate_brief.py --format text`
  or full dry-run: `generate_brief.py > /tmp/p.json && post_brief.py /tmp/p.json --dry-run`

## Troubleshooting

| Symptom | Fix |
|---|---|
| Nothing posts at 7 AM | Check `data/brief.log`. If "Operation not permitted": macOS Full Disk Access not granted to `/Library/Developer/CommandLineTools/usr/bin/python3` (System Settings → Privacy & Security). Mac must be awake at 7. |
| Slack 404/410 | Webhook was revoked — create a new one (api.slack.com/apps → AIOS Daily Brief → Incoming Webhooks) and update `.env` |
| Email fails auth | Regenerate the Gmail app password; check `SMTP_USER` matches the account that made it |
| Brief shows stale A/R warning | Ask Claude to refresh the live snapshot (`data/qbo_ar_live.json`), or re-export the QBO reports as CSV into `context/import/` (same qb_*.csv names) and run `/update-data` |
| Empty/thin brief | `data/data.db` missing or empty on this machine — run `/update-data` |

## Roadmap (the brief grows with the AIOS)

The goal: everyone sees the state of every part of the business each morning. Add sections
as the underlying data lands — each is one `sec_*()` function in `generate_brief.py`:

- ~~**Orders/ops status**~~ ✅ All three shared order sheets tracked as of 2026-07-13: Viking (`collect_viking_orders.py`), Diamond (`collect_diamond_orders.py`), and Random Vendors promo POs (`collect_vendor_orders.py`). One unified `sec_orders()` section: going out today / tomorrow / later this week / past due, with rush + hard-date flags. Remaining decorators (TSF, LISP) untracked — add if sheets surface in the ops audit
- ~~**Live A/R from QuickBooks**~~ ✅ Added 2026-07-13: `sec_ar()`/`sec_chase()` prefer `data/qbo_ar_live.json` when it's ≤3 days old (falls back to the CSV-era `qb_ar_aging` table with the stale warning otherwise). The snapshot is written by a Claude session using the QuickBooks connector — launchd Python jobs can't call the connector (it's OAuth'd to Claude), so the refresh is a Claude task on the brief host: pull A/R aging summary + top-5 contacts, write the JSON. Snapshot is machine-local (`data/` is gitignored) — it must be refreshed on whichever machine hosts the 7 AM brief.
- **Pipeline/outreach** — SmartLead is in; HubSpot/lead-gen numbers when connected
- **Online presence** — when Pillar 3 starts (site/social metrics)
- **Week-over-week deltas** — automatic once 7+ days of snapshots accumulate in data.db
- Email mirror to Kenny — deferred 2026-07-12 (Slack-only for now); code already present

## History

| Date | Change |
|------|--------|
| 2026-07-12 | Built (plan: plans/2026-07-12-slack-daily-brief.md). Went LIVE same evening, Slack-only (email mirror deferred). |
| 2026-07-12 | Added 🏭 open-orders section: Viking production schedule (shared Google Sheet, link-share download — no API key). Late/due-soon/rush/no-status flags; also in key-metrics.md for /prime. |
| 2026-07-13 | Orders section now covers all three shared sheets — Viking, Diamond (`collect_diamond_orders.py`), Random Vendors (`collect_vendor_orders.py`). Unified 📦 section: today / tomorrow / later this week / past due, per-sheet counts, unreadable-date + missing-sheet warnings. key-metrics.md production section unified too. |
