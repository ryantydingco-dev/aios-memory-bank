# CSV Schema

Default columns for Oloxa outreach-ready leads.

```csv
rank,intent_confidence,primary_signal_refined,total_score,total_score_raw,signal_recency_tier,signal_date,signal_date_source,fit_score,behavioral_score,first_name,last_name,title,company_name,seniority,company_size,industry,city,state,country,email,linkedin_url,company_website,company_revenue,confirmed_pain_evidence,firm_intent_signals,personalized_opener,reasoning,recency_flag,recommended_next_action,assigned_to,source_url
```

## Recency columns (added by the recency guardrail)
- `signal_date` — explicit date of the datable signal (ISO `YYYY-MM-DD`, or anchored from a relative phrase like "5 months ago"). Blank = no date could be sourced.
- `signal_date_source` — the exact phrase the date came from (e.g. `Sep 2025`, `5 months ago`, `Q4 2025`). This is the audit trail; a date with no source is not allowed.
- `signal_recency_tier` — `FRESH` (≤30d) · `RECENT` (≤90d) · `AGING` (≤365d) · `STALE` (>365d) · `UNDATED` (datable but no date) · `N/A` (structural, non-datable).
- `total_score_raw` — pre-guardrail score. `total_score` is `total_score_raw` × the recency multiplier.
- `recency_flag` — human-readable guardrail note when a signal is undated/stale; blank when clean.

## Rules
- Do not invent emails.
- If email is guessed, label separately.
- Evidence must be concise but auditable.
- Personalized opener must reference a real signal.
- Every lead needs a recommended next action.
- **Datable signals must carry a date or date-source.** Any anniversary, award, funding/closing announcement, hiring/job ad, promotion, or milestone needs `signal_date` + `signal_date_source`. **Never fabricate a date** — if it can't be sourced, leave it blank and let the guardrail mark it `UNDATED`.
- **Undated or stale datable signals are down-ranked and capped at LOW confidence.** A "why now" / opener may not be built on an `UNDATED` or `STALE` signal; route those to `NEEDS_RESEARCH` (re-verify the date) or `WATCHLIST` (timing cold), not `READY_FOR_*`.
- `intent_confidence` means "how strong **and how recent**" — a signal with no confirmable date cannot be `HIGH`.

See [Recency Guardrail](../Signals/Recency%20Guardrail.md) for the full spec and `Operations/scripts/recency_guardrail.py` for the enforcement.
