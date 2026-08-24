# Recency Guardrail

**Purpose:** stop the lead engine from building a "why now" on stale or undated PR. A datable signal we cannot timestamp must be treated as stale and down-ranked — never promoted to HIGH confidence.

This is the canonical spec. It is enforced in code by `Operations/scripts/recency_guardrail.py` (shared module), wired into `generate_oloxa_daily_batch.py` (generation) and `battlecards_to_csv.py` (verify backstop). Related: [Signal Taxonomy](Signal%20Taxonomy.md), [Lead Scoring Rubric](../Lead%20Engine/Lead%20Scoring%20Rubric.md), [CSV Schema](../Lead%20Engine/CSV%20Schema.md).

## Why this exists
On 2026-05-31 the Bailey Moore / Moorgate Finance record was flagged: it presented a "10-year anniversary" and an "NACFB Asset & Leasing Finance Broker of the Year" award as a current *why now*, with no dates.

- Moorgate Finance Ltd (Companies House **09250316**) was incorporated in **2015**, so the 10-year anniversary is a **2025** milestone — already passed, not a fresh 2026 trigger.
- The NACFB award is real but was won **September 2025** (NACFB Commercial Broker Awards 2025, 4+ Brokers category) — stated with no year, so it read as fresh.

Audit showed this was **systemic**: across the Initial (20) and Monday (20) batches, almost every closing/award/anniversary/hire was undated, yet records were marked HIGH confidence. The recency policy already existed in the Rubric and Taxonomy but was enforced **nowhere in code**. This guardrail closes that gap.

## Datable vs structural signals
- **Datable (must carry a date):** anniversary, award, funding/closing announcement, hiring/job ad, promotion, milestone ("X years", "record month/quarter"), new office/expansion, launch. Signal labels `CLOSING`, `HIRING`, `MOVE` are always datable; `VOLUME` / `PAIN` / `COMPLEXITY` / `SPEED_PROMISE` are datable only when the text cites an event/period.
- **Structural (not recency-penalised, tier `N/A`):** lender-panel size, whole-of-market model, multi-lender complexity, a standing workflow PAIN. True regardless of when observed.

## The rule
1. Every datable signal must carry an explicit **date** and **date-source** (the exact phrase it came from). A date with no source is not allowed.
2. **Never fabricate a date.** If it can't be sourced from the evidence, the signal is `UNDATED`.
3. Down-rank by recency tier (multiplier applied to the score; cap applied to confidence):

   | Tier | Age | Score × | Confidence cap | Action |
   |------|-----|---------|----------------|--------|
   | `FRESH` | ≤30 days | 1.0 | — | READY_FOR_* |
   | `RECENT` | 31–90 days | 0.7 | — | READY_FOR_* |
   | `AGING` | 91–365 days | 0.4 | MEDIUM | soften "this week" framing |
   | `STALE` | >365 days | 0.2 | LOW | WATCHLIST |
   | `UNDATED` | datable, no date | 0.4 | LOW | NEEDS_RESEARCH |
   | `N/A` | structural | 1.0 | — | — |

4. If the **opener anchor** (the primary evidence the touch is built on) is undated, cap confidence at LOW *even if a secondary signal is dated* — never imply a fresh trigger that isn't there.
5. Relative dates ("5 months ago", "in the last 4 months", "Q4 2025") are anchored to the run date and count. Soft claims ("this week", "recently", "just funded") are **not** dates — they are unverifiable freshness claims and do not lift a record off `UNDATED`.
6. Low-precision dates (a bare year, e.g. "won in 2025") can never be `FRESH`/`RECENT` — capped at `AGING`.

## Date extraction (sourceable forms)
`recency_guardrail.extract_dates()` recognises: ISO `2025-09-19`; `19 Sep 2025`; `Sep 2025`; `Q3 2025`; `5 months ago` / `in the last 4 months`; bare `2025` (low precision). Everything else is undated.

## Enforcement points
- **Generation** — `generate_oloxa_daily_batch.py` calls `assess()` per lead, multiplies the score, caps confidence, overrides the next action, and writes `signal_date` / `signal_date_source` / `signal_recency_tier` / `recency_flag` columns.
- **Verify (battlecards)** — the dynamic workflow must set `signal_verified=NO` / `confidence=LOW` on any datable signal it can't timestamp and write `why_now` as a hypothesis. `battlecards_to_csv.py` raises `recency_flag` as a backstop if an undated/unverified signal still carries HIGH/MEDIUM confidence.
- **Remediation** — `apply_recency_guardrail.py` re-scores existing output CSVs in place (with `.bak` backups) and emits a remediation report.

## Anti-fabrication principle
The fix for an undated signal is **never** to guess a plausible date — that just re-commits the original sin. It is to mark it `UNDATED`, down-rank it, and send a human to re-verify. The guardrail makes "I don't know when this happened" a first-class, visible state instead of a silent HIGH.
