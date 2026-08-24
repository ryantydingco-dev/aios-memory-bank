# Signal Taxonomy

Use this taxonomy to classify why a lead may care now.

## Signal Priority
Not all signals are equal for meetings. Current priority:
1. PAIN — rare but strongest
2. HIRING — budget/capacity strain
3. CLOSING — active deal flow
4. VOLUME — enough deal flow for ROI
5. COMPLEXITY — multi-lender/product/document stack
6. SPEED_PROMISE — public positioning creates operational pressure
7. MOVE — useful but weaker alone

## Signal Labels

### PAIN
Direct public language about documents, conditions, underwriting friction, paperwork, process, client follow-up, or admin drag.

Why it matters:
- highest relevance
- easiest personalization
- strongest reply hook

Outreach angle:
"Saw you mention [exact pain]. That’s the intake layer Oloxa helps automate: docs sorted/renamed, missing items flagged, borrower nudges sent automatically."

### HIRING
Hiring processors, admins, loan coordinators, ops, analysts, broker support, or roles that imply capacity strain.

Why it matters:
- they are spending to solve capacity
- software can be framed as leverage, not replacement

Outreach angle:
"Saw you’re hiring for [role]. Usually that means the team is trying to keep borrowers/docs/checklists moving without slowing brokers down."

### CLOSING
Recent deals, funded loans, completions, refinances, exits, bridges, or deal announcements.

Why it matters:
- every closing implies document intake and lender packaging work
- very specific opener anchor

Outreach angle:
"Saw the [deal]. Deals like that usually come with borrower docs, lender checklists, missing items, and file naming chaos before submission."

### VOLUME
Record month/quarter, top producer, many active deals, large lender panel, many finance products.

Why it matters:
- pain compounds with volume
- 7+ hours saved per deal is easier to justify

Outreach angle:
"At that volume, even small document/follow-up friction compounds fast."

### COMPLEXITY
Multiple lenders, financing products, borrower types, industries, or deal stages.

Why it matters:
- more checklist variation
- more package-management pain

Outreach angle:
"The multi-lender checklist shuffle is where Oloxa tends to help most."

### SPEED_PROMISE
Company promises speed, fast approval, quick funding, streamlined process, or rapid turnaround.

Why it matters:
- speed positioning is only credible if intake is clean

Outreach angle:
"If speed is part of the promise, borrower doc intake becomes the hidden bottleneck."

### MOVE
New role, new firm, new office, expansion, market move.

Why it matters:
- indicates change, but weaker without deal/doc signal

Outreach angle:
Use only if combined with a stronger signal or clear fit.

## Strength Rules
- HIGH: recent 0–90 day evidence + strong ICP fit + clear pain implication.
- MEDIUM: good fit + weaker/older signal.
- LOW: generic fit, old signal, or only MOVE.

## Recency & Datable Signals (HARD RULE)
A "why now" must never be built on stale PR. **Datable signals** — anniversaries, awards, funding/closing announcements, hiring/job ads, promotions, milestones ("X years", "record quarter") — decay and must be timestamped.

- Every datable signal must carry an **explicit date or date-source** (`signal_date` + `signal_date_source`). **Never invent a date.** If you can't source one, the signal is `UNDATED`.
- Recency tiers and what they do to the score / confidence:
  - `FRESH` ≤30d → ×1.0, no cap
  - `RECENT` 31–90d → ×0.7, no cap
  - `AGING` 91–365d → ×0.4, cap **MEDIUM**
  - `STALE` >365d → ×0.2, cap **LOW**, route to WATCHLIST
  - `UNDATED` (datable, no date) → ×0.4, cap **LOW**, route to NEEDS_RESEARCH — *treat as stale until a date is confirmed*
- If the **opener anchor** (the primary evidence the touch is built on) is itself undated, cap confidence at LOW even when a secondary signal is dated — you cannot imply a fresh trigger that isn't there.
- Structural signals are **not** recency-penalised: a 200-lender panel, a whole-of-market model, or a stated workflow PAIN is true regardless of when observed (tier `N/A`).
- An anniversary/award states *when it happened* — a 10-year anniversary off a 2015 founding is a **2025** event, not a fresh 2026 trigger. An award with no year is `UNDATED`, not HIGH.

### Verify-stage enforcement (battlecards)
When verifying a signal: if it is datable and you cannot timestamp it, set `signal_verified = NO`, `signal_recency = UNDATED`, `confidence = LOW`, and write the `why_now` as a hypothesis to confirm — never as asserted fact. The CSV exporter raises `recency_flag` as a backstop if an undated/unverified signal still carries HIGH/MEDIUM confidence.

Enforced in code: `Operations/scripts/recency_guardrail.py` (generator) and `battlecards_to_csv.py` (verify backstop). Full spec: [Recency Guardrail](Recency%20Guardrail.md).

## Important Lesson From Existing Data
MOVE is abundant but not enough by itself. CLOSING/HIRING/VOLUME/PAIN should lead daily prioritization. And volume is not recency: a batch can be 100% "HIGH confidence" and still be built entirely on undated posts — that is exactly the failure the recency guardrail exists to catch.
