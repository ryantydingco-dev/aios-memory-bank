# Loop: ar-chase

**Judge metric:** total overdue A/R dollars, and the 91+ day bucket. Source: `qb_ar_aging` in `data/data.db` (refreshed from QBO exports; prefer live QBO pulls when the connector is available).
**Cadence:** weekly, Mondays.
**Stop condition:** none — but an individual customer exits the chase once paid or once Kenny flags them "do not chase" (relationship call).

## What a run does

1. `loop_metrics.py report ar-chase` — latest overdue totals + delta, top overdue customers.
2. Read `memory.md`: who was chased last week, with what tone, and did their balance move?
3. **Verify**: for each chase drafted+sent last cycle, did the customer's overdue balance drop? Record verdict per customer. Learn which tone/timing works per customer (gentle vs firm — repeat late payers get firmer).
4. Produce this week's chase list (top 5 by overdue $, minus anyone paid, minus "do not chase") and **draft** the reminder emails to `outputs/ar-chase/` — matched to payment history and relationship (camps are core relationship accounts; default gentle unless history says otherwise).
5. Append memory entry + prediction (expected $ collected).
6. Telegram ping: overdue delta since last week + drafts awaiting approval.

## Guardrails

- **Send channel: personal email (Kenny's account, or Ryan's Gmail in Ryan's voice) — NEVER SmartLead.** SmartLead is strictly cold outbound (Ryan, 2026-07-19).
- Chases are routine bookkeeping notes — Ryan authorized sending them without per-email ceremony (2026-07-19). The loop still stages them as drafts in the sending account; camps and any relationship-sensitive account stay gated on Kenny.
- Never threatens, never mentions collections, never contacts a customer more than once per 2 weeks.
- Seasonal awareness: camps pay after their season closes — flag, don't hound, mid-season camp balances.
