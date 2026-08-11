# Loop: reactivation

**Judge metric:** win-back count and win-back revenue — customers who ordered this year after skipping last year. Secondary: lapsed-customer count (ordered last year, nothing yet this year). Source: `sales_ledger` in `data/data.db`.
**Cadence:** monthly, first Monday.
**Stop condition:** none — 27 years of customers means the lapsed pool refills forever.

## What a run does

1. `loop_metrics.py report reactivation` — lapsed count, win-backs since last run, win-back revenue.
2. Read `memory.md`: which lapsed segment was targeted last month, with what angle, and how many came back?
3. **Verify**: did last month's targeted segment produce win-backs vs the untouched pool? That's the experiment: touched vs not-touched.
4. Pick next month's segment (use `scripts/ca_reactivation.py` + seasonality — e.g. schools order in spring, camps in Jan–Apr) and draft the outreach angle: reorder nudge referencing their actual last order (product, quantity, price honored if possible). Drafts to `outputs/reactivation/`.
5. Append memory entry + prediction (expected win-backs).
6. Telegram ping with the segment, draft count, and last month's verdict.

## Guardrails

- **Drafts only; Maclaine/Kenny voice and approval** — these are warm relationships, not cold outbound. **Send channel: personal email accounts only — NEVER SmartLead** (Ryan, 2026-07-19: SmartLead is strictly cold email marketing).
- Kenny reviews the segment list first — he knows who lapsed for a reason (died, sold, fired us).
- Honest numbers: quote their real order history from the ledger, never invented details.
