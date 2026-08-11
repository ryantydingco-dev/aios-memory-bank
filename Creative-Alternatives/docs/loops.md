# Loop Engine

> Self-improving agent loops: measure a real metric → verify last cycle's
> experiment → decide ONE move → record → ping Telegram. Built 2026-07-19,
> inspired by the loop-engineering episode (outputs/research/loop-engineering-video/).

## What it is

Seven loops in `loops/`, each judged on ONE objective metric from `data/data.db`.
Unlike the collectors (which report), loops LEARN: every run reads its own
experiment journal, grades the previous cycle's prediction, and makes the next move.

| Loop | Cadence | Judge metric |
|------|---------|--------------|
| outbound-copy | weekly Mon | reply/interested rate per SmartLead campaign |
| ar-chase | weekly Mon | overdue A/R $ (total + 91d bucket) |
| quote-conversion | weekly Mon | quotes → orders in 30d (outputs/quotes/ vs ledger) |
| vendor-ops | weekly Mon | past-due-not-shipped production orders |
| deliverability | weekly Mon | bounce + open rates per campaign |
| reactivation | monthly 1st Mon | win-back count + revenue (lapsed customers) |
| margin | monthly 1st Mon | gross margin % YTD vs LY |

## Anatomy

```
loops/<name>/LOOP.md       charter: metric, cadence, allowed actions, guardrails
loops/<name>/memory.md     experiment journal (append-only; verdict format in
                           .claude/commands/loop-run.md)
loops/<name>/metrics.jsonl objective snapshots (the judge's scorecard)
```

## How runs happen

- **Scheduled:** `com.aios.ca-loops` launchd job, Mondays 08:30 →
  `scripts/ca_loop_cron.sh` → asks `loop_metrics.py due` which loops run today
  → fresh `collect.py` → headless `claude --print "/loop-run <name>"` per loop.
- **Manual:** `/loop-run <name>` in any session.
- Telegram ping ends every cycle (`loop_metrics.py notify "<text>"`).

## Key commands

```bash
.venv/bin/python scripts/loop_metrics.py snapshot <loop>   # compute + append
.venv/bin/python scripts/loop_metrics.py report <loop>     # latest + delta
.venv/bin/python scripts/loop_metrics.py due               # loops due today
```

## Hard rules

1. **Drafts only.** Nothing customer/vendor/money-facing sends without
   Ryan/Kenny. SmartLead = cold email ONLY; A/R chases + reactivation go from
   personal email accounts.
2. **One experiment per cycle**, with a written prediction — else nothing is
   attributable. "HOLD" is a valid cycle.
3. A run that doesn't append to memory.md didn't happen.
4. No paid enrichment (AI Ark reveals) from inside a loop.

## Gotchas

- Launchd needs Full Disk Access for `/bin/zsh` and the venv python, or runs
  fail silently (see scripts/install_launchd.sh notes).
- qb_ar_aging columns contain NULLs — use COALESCE in ad-hoc SQL.
- Dealthreads campaigns report 0% opens (tracking off) — never flag on opens.
- Parked loops (README): seo-inbound (needs GSC access), partner-gp, content.

## History

| Date | Change |
|------|--------|
| 2026-07-19 | Built: 7 loops, judge script, cron, first cycles run (Construction GCs paused, Swag Handled launched, AR drafts, fall win-back segment) |
