# Next Automations To Build

## Priority 1 — Daily Batch Generator
Status: first version created.

Script:
`AI GTM Engine/Operations/scripts/generate_oloxa_daily_batch.py`

Purpose:
- reads HOT/WARM Oloxa AI Arc/Smartlead exports
- excludes Oloxa contacts already present in HubSpot
- ranks remaining leads by signal/fit/market priority
- assigns Ryan/Sway 10 each
- creates HubSpot-ready CSV

Monday backup CSV generated:
`AI GTM Engine/Lead Engine/Outputs/Oloxa_Daily_Top_20_Monday.csv`

Monday backup markdown:
`AI GTM Engine/Lead Engine/Outputs/Oloxa Daily Top 20 - Monday Backup Batch.md`

Important:
Do not push the Monday backup batch into HubSpot until the current initial Top 20 is completed or you intentionally want a second batch. Too many open tasks creates fake productivity and CRM clutter.

## Priority 2 — One-Command HubSpot Push
Existing script:
`AI GTM Engine/Operations/scripts/hubspot_oloxa_sync.py`

Use when ready to push a generated CSV:

```bash
set -a; source /Users/ryantydingco/Documents/AIOS/dealthread-agents/.env; set +a
python3 '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Operations/scripts/hubspot_oloxa_sync.py' \
  --csv '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/Oloxa_Daily_Top_20_Monday.csv' \
  --create-tasks
```

## Priority 3 — Daily Telegram Briefing  ✅ BUILT (2026-05-31)
Live launchd job `com.aios.oloxa-daily` (7:15am daily). Chain:
1. `aios-starter-kit/scripts/run-oloxa-daily.sh` (loads kit + dealthread .env)
2. `generate_oloxa_daily_batch.py` → fresh dated Top 20 from HOT/WARM, excludes existing HubSpot
3. `oloxa_daily_brief.py` → composes the brief (enriches from same-day battlecards if present)
4. `telegram_send.py` → pushes to Telegram (stdlib Bot API; reads creds from kit .env)

Controls:
- Change time: edit `StartCalendarInterval` in `~/Library/LaunchAgents/com.aios.oloxa-daily.plist`, then `launchctl unload/load -w`.
- Disable: `launchctl unload ~/Library/LaunchAgents/com.aios.oloxa-daily.plist`.
- Test now: `bash aios-starter-kit/scripts/run-oloxa-daily.sh`.
- Logs: `aios-starter-kit/logs/oloxa-daily.*.log`.

Verified working 2026-05-31: generator read 467 candidate rows from HOT/WARM, excluded 20
already in HubSpot, wrote a fresh Top 20. (If those source exports ever go stale, repoint
`SOURCE_FILES` in `generate_oloxa_daily_batch.py`.)

Not yet wired (enhancements):
- Hot replies count (needs the reply-monitor / HubSpot pull) — currently shows a reminder, not a number.
- Auto-running the full battlecard workflow nightly (held off: ~2M tokens/run + `claude` not on the headless PATH). Battlecards stay on-demand; the brief enriches if a same-day file exists.

Desired output (now produced):
```text
Oloxa GTM - <date>
✅ N send  ⚠️ N review  ⏸️ N hold
Hot replies: -
Ryan (10): ...
Sway (10): ...
Content: 1 post | Comments: 5-10 ICP targets
```

## Priority 4 — Outcome Pull / Weekly Review  🔧 IN PROGRESS (2026-05-31)
Machine built; outcome-learning gated until replies exist (reply-monitor = 0/0 this cycle).
- `Operations/scripts/gtm_learning_facts.py` — deterministic (no-LLM) facts from battlecards CSV + outcome tracker. Honesty safeguard: never invents outcomes.
- `Lead Engine/Outputs/Oloxa_Outcome_Tracker.csv` — seeded (header per Outcome Tracker Schema) for post-launch logging.
- `oloxa-gtm-learning-loop` workflow launched → produced PRE-LAUNCH learning on the 20 real battlecards.
- Real facts 2026-05-31: 20 leads SEND 6/REVIEW 12/HOLD 2; CLOSING 3/6/0, HIRING 1/2/1, PAIN 0/3/0, VOLUME 1/1/0; UK 3/7/1 vs US 3/5/1; outcomes 0/0/0.
- Provisional: PAIN (taxonomy #1) made 0 send-ready cards — bottleneck is signal RE-VERIFIABILITY (LinkedIn 999), not signal type; CLOSING most reliable; UK≈US so far.

DONE this session: read synthesis → wrote `Experiments/Weekly GTM Review - 2026-05-31.md` → patched `Strategy/Oloxa GTM Brain.md` (Learnings Log) + `ICP Map.md` (UK-cleaner flagged UNVALIDATED). Weekly runner `aios-starter-kit/scripts/run-oloxa-learning.sh` + `com.aios.oloxa-learning.plist` (Sun 18:00) WRITTEN.

✅ **VERIFIED + LOADED (2026-05-31):** ran end-to-end — facts → `claude -p` synthesis (synth=yes) → review written → Telegram sent, exit 0 in ~28s. `com.aios.oloxa-learning` is `launchctl load -w`-ed and registered (Sun 18:00). Runner is resilient (deterministic facts always run; claude enriches best-effort; falls back to a facts-only review if claude is down).
⚠️ **Filename clobber caveat:** the runner writes `Weekly GTM Review - <date>.md` (single `claude -p`, ~48 lines). The richer 3-agent workflow version (~76 lines) is today's artifact of record. If you run the workflow AND the cron the same day, the cron overwrites — back up first, or run the workflow version after. For routine weeks the cron's single-agent review is fine.

NOTE on timing: until outreach is sent + logged to `Oloxa_Outcome_Tracker.csv`, every weekly run re-analyzes the same 20 cards (no new outcomes). Real value starts once the tracker has data — consider running it manually until then.

## Batch One — Send + Logging Path  ✅ BUILT (2026-05-31)
The execution surface that turns drafts into sent touches + real outcome data.
- `Operations/scripts/build_send_board.py` — deterministic; reads battlecards CSV, selects SEND-tier (gate-then-rank classifier), orders CLOSING-first/US-leaning, writes `Lead Engine/Outputs/Batch One Send Board - <date>.md` (copy-paste per-channel drafts + per-lead log command) AND pre-seeds the outcome tracker with queued rows.
- `Operations/scripts/log_outcome.py` — one-line logging CLI; no hand-editing CSV. `--sent/--replied/--sentiment/--objection/--meeting/--note`, finds the queued row by `--id` (email or company::name).
- Verified end-to-end 2026-05-31: full lifecycle log (sent→replied→meeting) flips `gtm_learning_facts.py` `has_outcomes` to true → weekly loop becomes REAL outcome learning. Tracker reset to clean queued state after test.

**Batch one queue (6 SEND leads, in launch order):** Robert Meunier, Michael Bucaro, Matthew Beal, Grant McIntyre (CLOSING) → Linzi Crellin (VOLUME) → Chris Solinski (HIRING).

**To ship:** open the Send Board, `export SC="…/Operations/scripts"`, then per lead: send the copy → run its log command. ⚠️ Verify Smartlead sender/domain before any EMAIL send (open Oloxa loop); LinkedIn connect/DM are manual (no API).

## Priority 5 — Reply Router
Build after we have replies:
- classify reply category
- suggest response
- update HubSpot status
- recommend next action

## Inbound Content Factory  ✅ BUILT (2026-05-31)
The 4th GTM move. Turns the 5 content pillars into a week of graded, on-voice LinkedIn posts + comment targets.
- `oloxa-content-factory` workflow (draft per pillar → grade vs Content Grader → strip AI tells). Ran: 7 posts, avg 8.7/10.
- `Operations/scripts/content_to_md.py` → renders `Inbound/Oloxa Content Calendar - Week of <date>.md` (per-day post + short-form script + comment targets + scores; flags posts below 8.5).
- Weekly cron `com.aios.oloxa-content` (Sun 16:00) → `run-oloxa-content.sh` + `content_factory_prompt.md` (headless claude -p). LOADED. ⚠️ cron path not yet tested end-to-end on a real Sunday fire — check `logs/oloxa-content.run.log` after first run; for the richest output run the Workflow manually instead.
- DISTINCT from `com.aios.daily-content` (general trending topics) — no conflict.

## Current Rule
Automate only the parts that remove friction from daily execution.

Do not automate new dashboards or nice-to-have views until Ryan/Sway are consistently executing daily actions and logging outcomes.
