# Loop: quote-conversion

**Judge metric:** quotes issued → orders landed within 30 days (conversion %), from `outputs/quotes/*.md` matched against `sales_ledger`. Secondary: quote volume.
**Cadence:** weekly, Mondays.
**Stop condition:** none — runs alongside the quoting engine (pillar 1, phase 2a).

## What a run does

1. `loop_metrics.py report quote-conversion` — quotes last 30d, matched conversions, rate.
2. Read `memory.md`: which open quotes were flagged for follow-up last week, what changed?
3. **Verify**: did followed-up quotes convert at a higher rate than un-followed ones? (This is the loop's core experiment.)
4. For every quote 3+ days old with no matching order: draft a short follow-up to `outputs/quote-followups/` — reply-voice rules apply (short, plain, no forced call).
5. If a pattern shows in the losses (price band, product category, vendor lead time), log it as a hypothesis for the quoting engine spec (`pillars/1-operations/quoting-automation-spec.md`) rather than acting directly.
6. Append memory entry + prediction; Telegram ping with conversion rate + follow-ups awaiting approval.

## Guardrails

- **Drafts only.** Follow-ups send only after Ryan/Kenny approval.
- Max one follow-up per quote per week, two total — then it's Kenny's call.
- Name-match against the ledger is fuzzy; when unsure whether a quote converted, mark `[CONFIRM]` and ask, don't guess.
