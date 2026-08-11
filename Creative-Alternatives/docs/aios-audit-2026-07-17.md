# AIOS Workspace Audit — 2026-07-17

> Full audit of every script, skill, slash command, config, scheduled job, and pipeline in the workspace, run during the Fable 5 sprint. Three parallel auditors (automation layer · Claude-config · business pipelines). This doc records **what was fixed in code** and **what still needs a human** (the items that touch customers, money, or machine-level permissions — not safe to auto-apply).

---

## Fixed in this pass (committed)

| # | Was | Fix |
|---|-----|-----|
| Dependency manifest | No `requirements.txt` — a new machine (or Kenny) couldn't rebuild the venv | Added `requirements.txt` (6 pinned deps derived from actual imports) |
| Hardcoded plists | `config/com.aios.data-collect.plist` + `daily-brief.plist` hardcoded `/Users/kennyscher/Documents/Creative Alternatives AIOS` (wrong user AND space-vs-hyphen path) — ran on no current machine | Deleted both; added `scripts/install_launchd.sh` that templates paths from the repo's real location and installs on whichever machine runs it |
| Leaked API key | SmartLead key passed as URL param; on any network error the full URL (key included) was written to `logs/ca-metrics.log` in plaintext | `collect_smartlead.py` now scrubs the key from exception strings; also scrubbed the 2 existing occurrences in the local log |
| `collect.py` exit code | Exited `1` when all collectors *skipped* (fresh machine, no creds) — a clean run looked like a failure to any wrapper | Now exits `1` only on real errors; all-skipped = `0` |
| `config.py` dead param | `get_env(key, required=True)` never honored `required`; callers passed `required=False` expecting behavior that didn't exist | Documented as no-op, default flipped to `False` to match reality |
| Slack truncation | `generate_brief.py` silently sliced sections to 2900 chars — a heavy orders day dropped lines with no marker | Now appends `…section truncated` when it clips |
| Stale docs | `data-access.md` missing 2 live tables; `CLAUDE.md` mis-stated installed modules + advertised 3 broken commands; `business-info.md` showed the misleading $166,919 A/R; `task-audit.md` → dead `overview.md`; `HISTORY.md` → phantom `daily_brief.sh` | All corrected |

---

## Needs a human — operational (touches customers/money; not auto-applied)

**1. 71 replies queued, triage job has NEVER succeeded (highest priority).**
`com.aios.ca-reply-triage` is loaded but every run exits 127 — `/bin/zsh: can't open input file: .../ca_reply_triage_cron.sh`. The script exists and is executable; the cause is macOS Full Disk Access (below). Meanwhile the poller keeps filling `queue/inbox/` (71 `.json`, oldest Jul 1, newest today). One reply landed **today** ([REDACTED EMAIL], 1:15 PM). **These are live prospect replies aging unprocessed.**
→ Grant FDA (item 4), then `launchctl unload/load` the job and confirm one clean run drains the queue. Until then, triage the 71 by hand via `/mockup-inbox`.

**2. Stale HOT board — real deals aging.**
`pillars/2-customer-acquisition/reply-watcher/tasks.md` has 7 open deals, several `[NEEDS PRICE]` owned by Kenny, untouched since the Jul 3 seed — including a HOT ~60-each retreat order (Miller Johnson) and camp deals back to Mar/Apr. No file activity since. **Money is sitting on an untended board.**
→ Reconcile into the active queue/cockpit; close or re-own each `[NEEDS PRICE]` with Kenny.

**3. Two reply pipelines, one is dead but still being written to.**
The `reply-watcher/` agent-loop (`fetch_smartlead_replies.py`, not scheduled anywhere) last scanned Jul 3 and logged one run, while the live pipeline is `queue/inbox/` + `/mockup-inbox`. Drafts are still landing in `reply-watcher/drafts/` (e.g. today's `asmith-brunini-com.md`) with no matching reply file and no state update — so a draft here can be silently missed for dispatch.
→ Pick one canonical drafts location; archive the reply-watcher loop or repoint it at the queue.

## Needs a human — machine-level (I can't grant these)

**4. Full Disk Access — the single root cause behind items 1 and the dead data-collect on Kenny's Mac.**
launchd-spawned processes can't read `~/Documents` until the *interpreter* is granted FDA. On Kenny's Mac, `data/collect.log` shows `PermissionError: .../.venv/pyvenv.cfg` → data collection dies before running. On this Mac, `/bin/zsh` lacks FDA so the reply-triage shell job can't read its script.
→ System Settings → Privacy & Security → Full Disk Access → add **this repo's `.venv/bin/python`** and **`/bin/zsh`**. (The new `install_launchd.sh` prints this reminder.)

**5. A/R data is 21 days stale.**
`qb_ar_aging` is as-of 2026-06-26 while every other QB table is current — past `/prime`'s own 2-week staleness flag. Every A/R figure in the revenue plan and daily brief rides on it.
→ Re-export the QBO A/R aging CSV into `context/import/` and run `/update-data` (or pull via the live QBO connector).

## Deferred decisions (documented, not urgent)

- **Content-OS commands** (`/content-os`, `/capture`, `/schedule`) reference `scripts/content_os.py`, `content_db.py`, `writer.py`, `generate_pipeline.py`, and a `content/` dir — none of which exist. The commands are broken. Either install the Content-OS module or retire the three commands. (CLAUDE.md now flags them as needing install so they don't look live.)
- **Orphan configs:** `ca_hubspot_outbound.yaml` (nothing reads it — the outbound CRM layer was authored, never wired) and `planners_fleet.json` (referenced only as a human note in `ca_outbound.yaml:54`). Wire them or move them out of `config/` so they aren't mistaken for live.
- **One-brief-host rule:** the Slack/email/markdown brief (`daily_brief.py`) should run on exactly one machine. Decide which, install via `install_launchd.sh daily-brief` there, and don't install it on the other.
- **`signal_ats_state.json` empty** — verify `ca_signal_enrich.py`'s ATS path actually runs weekly, or remove the state file.
