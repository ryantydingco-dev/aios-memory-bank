# Loop: vendor-ops

**Judge metric:** past-due-not-shipped order count across the three production sheets (Viking · Diamond · Random Vendors). Secondary: per-vendor on-time %. Source: `viking_open_orders` / `diamond_open_orders` / `vendor_open_orders` in `data/data.db` (logic mirrors `generate_metrics.py`).
**Cadence:** weekly, Mondays.
**Stop condition:** none — production runs forever. This is pillar-1 (Operations) territory: the loop that directly removes Kenny's pain.

## What a run does

1. `loop_metrics.py report vendor-ops` — past-due count + delta, the past-due list.
2. Read `memory.md`: which orders were flagged last week, which vendors were chased, did the orders ship?
3. **Verify**: did last week's flagged orders ship? Track per-vendor: how many times has each vendor appeared past-due? (Wow Line, NC Custom etc. — repeat offenders become routing data.)
4. Produce this week's **vendor chase list** to `outputs/vendor-ops/` — ordered by customer impact (in-hand date proximity, rush notes, repeat-customer risk), with a drafted chase note per vendor (email or call script — Kenny/Trish usually call).
5. When a vendor hits 3+ past-due appearances across cycles, log a **routing recommendation** ("shift X category to vendor Y") as a hypothesis for Kenny — never act on it directly.
6. Append memory entry + prediction; Telegram ping with past-due delta and the top 3 chases.

## Guardrails

- **Vendor relationships are Kenny's.** The loop produces chase lists and draft notes; Kenny/Trish decide contact and channel. Never contact a vendor directly.
- Customer-facing delay notifications are out of scope here (that's a human call every time).
- Data is only as fresh as the last sheet pull — check `collected_at` before crying wolf.
