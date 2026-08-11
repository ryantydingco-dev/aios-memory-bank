# reactivation — experiment journal

Newest entries at the bottom. Format defined in `.claude/commands/loop-run.md`.

## Baseline knowledge (pre-loop)

- Ledger shows 564 active customers in 2025 vs 183 so far in 2026 — a large lapsed pool (partly timing: ledger entry lags, and fall orders haven't happened yet). First cycle must separate "seasonally not-yet-ordered" from "actually lapsed".
- `scripts/ca_reactivation.py` already builds dormant-candidate lists.

## 2026-07-19 — cycle 1
**Metric:** 471 lapsed customers; 22 win-backs YTD worth $55,061. First snapshot — no delta.
**Verdicts:** n/a (first cycle).
**This cycle:** Built the "fall win-back" segment — 9 lapsed accounts with Aug–Dec buying history, ~$310k combined 2025 revenue (Driftwood $85.6k/18yrs flagged for a Kenny CALL, not email) → `outputs/reactivation/2026-07-19-fall-winback-segment.md` with 3 sample Maclaine-voice drafts. Experiment design: touched segment vs untouched lapsed pool.
**Prediction:** if approved and touched by early Aug: ≥3 win-backs / ~$40k+ in orders by the October cycle.
**Revert:** n/a — drafts.
**Needs approval:** Kenny reviews the 9-account list (who lapsed for a reason?); Maclaine owns the sends.
