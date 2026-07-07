---
name: oloxa-recency-guardrail
description: "The Oloxa lead engine enforces a recency guardrail — datable signals without a sourced date are treated as stale, down-ranked, and capped at LOW; never fabricate dates."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4b67e6ea-75b4-412d-bb95-ab9a1383e301
---

The Oloxa lead-gen pipeline now has a code-enforced recency guardrail (added 2026-05-31, after the Bailey Moore / Moorgate Finance record presented a 2015→2025 anniversary and an undated NACFB award as a fresh "why now"). Any **datable** signal — anniversary, award, funding/closing announcement, hiring/job ad, promotion, milestone — must carry an explicit date or date-source. If it can't be timestamped it is `UNDATED` → ×0.4 score, confidence capped **LOW**, routed to **NEEDS_RESEARCH**. Structural signals (lender-panel size, whole-of-market model, a standing workflow PAIN) are tier `N/A` and not penalised.

**Why:** A "why now" built on stale PR kills credibility on send. The 2026-05-31 audit found the pattern systemic — the Monday batch was 20/20 undated yet every lead was marked HIGH. The recency policy already lived in the Lead Scoring Rubric + Signal Taxonomy but was enforced nowhere in code; this closes that gap.

**How to apply:**
- Shared logic: `AI GTM Engine/Operations/scripts/recency_guardrail.py` (`assess()`/`extract_dates()` do sentence-level date attachment — a signal is "dated" only if the sentence describing *that event* carries a date). Used by `apply_recency_guardrail.py` (the internal Initial/Monday remediation, which DOES down-rank the score) and as the text-date fallback in `sway_schema.py` / the generator. `battlecards_to_csv.py` raises `recency_flag` as a verify backstop.
- **UPDATE 2026-06-01:** the daily generator switched to the **recency-pure** Sway handoff schema — recency now rides in `signal_date`/`signal_timeframe` + the Buying Signal Tier (capped for stale/undated), NOT folded into `total_score`. The "down-rank the score" behavior now lives only in `apply_recency_guardrail.py` for Ryan's internal CSVs. See [[oloxa-sway-handoff-schema]].
- Re-score existing CSVs: `apply_recency_guardrail.py --anchor <YYYY-MM-DD> [--commit] <csv...>` — writes `.bak`, emits a remediation report, idempotent via `total_score_raw`.
- Spec: `AI GTM Engine/Signals/Recency Guardrail.md`. New CSV columns: `signal_date`, `signal_date_source`, `signal_recency_tier`, `total_score_raw`, `recency_flag`.
- **Never fabricate a date** to "fix" an undated signal — mark it `UNDATED`, down-rank, send a human to re-verify. Bailey is the only record corrected with *sourced* dates (Companies House 09250316 → 2015 founding; NACFB award Sep 2025).

Related: [[oloxa-battlecard-workflow]]
