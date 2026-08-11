# Loop: outbound-copy

**Judge metric:** positive-reply rate (interested leads / sent) per ACTIVE campaign, with raw reply rate as the secondary signal. Source: `smartlead_campaigns` in `data/data.db` (collected daily).
**Cadence:** weekly, Mondays.
**Stop condition:** none — runs as long as cold outbound runs. A single campaign exits the loop when it completes or is killed.

## What a run does

1. `loop_metrics.py report outbound-copy` — read latest snapshot + delta vs last week.
2. Read `memory.md`: what experiments were proposed last run, which were approved/launched, what did each predict?
3. **Verify last week's experiments**: for each launched change, did the judged metric move the predicted direction? Record verdict (worked / failed / too early).
4. Decide this week's move, ONE of:
   - Propose a copy experiment on an underperforming ACTIVE campaign (subject line, opener angle, CTA) — write the exact revised copy as a SmartLead-ready draft.
   - Recommend killing a campaign whose reply rate has stayed <0.7% after 2,000+ sends.
   - Recommend which DRAFTED campaign to launch next, based on which verticals' reply patterns look most like the winners (summer camps 10.1%, squash clubs 5.2% — niche + seasonal beats generic corporate).
5. Append the memory entry: snapshot summary, verdicts, this week's experiment + prediction, revert path.
6. Telegram ping Ryan with a 5-line summary and what needs approval.

## Guardrails

- **Never edits a live SmartLead campaign and never sends.** All changes are proposals; Ryan applies them (or approves applying them) himself.
- Copy follows the `ca-brand-voice` + spam-word rules; suppression list rules apply (existing customers stay suppressed).
- One experiment per campaign per week — otherwise you can't attribute the metric move.
- New-list proposals route to the `/ca-outbound` pipeline; this loop never pulls or reveals leads (credits are real money).
