# Loop: margin

**Judge metric:** blended gross margin % (ledger `profit/retail`) for the current year, vs prior year. Secondary: count/value of orders under 20% margin, margin by vendor. Source: `sales_ledger` in `data/data.db`.
**Cadence:** monthly, first Monday.
**Stop condition:** none. Baseline: 2026 = 32.4%, 2025 = 31.9%. Every point of margin on ~$2.5M ≈ $25k/yr.

## What a run does

1. `loop_metrics.py report margin` — YTD margin vs LY, low-margin orders (>$500 retail, <20% margin), thinnest vendors.
2. Read `memory.md`: which low-margin patterns were flagged last month, what pricing hypotheses are open?
3. **Verify**: did flagged patterns recur? Did any pricing change move the category's margin?
4. Produce the monthly **margin memo** to `outputs/margin/`:
   - New low-margin orders since last cycle, grouped by cause hypothesis (underpriced quote, vendor cost creep, rush concession, relationship discount).
   - Vendor cost creep: vendors whose margin trend is falling across 2+ cycles.
   - ONE pricing hypothesis for Kenny (e.g. "screen-print tees under 50 units are consistently sub-20% — floor at $X").
5. Feed confirmed pricing floors into the quoting engine spec (`pillars/1-operations/quoting-automation-spec.md`) so quotes inherit them.
6. Append memory entry + prediction; Telegram ping with margin delta + the memo.

## Guardrails

- **Pricing is Kenny's domain.** Some low-margin orders are deliberate (relationship pricing, loss-leaders on big accounts). The loop asks "was this intentional?" — it never labels Kenny's pricing wrong.
- No customer-facing price changes ever come from this loop directly; changes flow through Kenny → quoting spec.
