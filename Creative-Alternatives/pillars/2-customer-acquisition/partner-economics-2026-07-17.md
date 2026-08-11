# Partner Economics — real numbers for Models A–G

> Companion to `partner-revenue-engine-2026-07-17.md`, which defined the incentive
> models but left every number blank. This fills them in from CA's actual ledger
> economics. Every figure below is computed from `data/data.db` (2022+ clean rows);
> nothing is aspirational. **All terms are recommendations until Kenny approves —
> checkboxes at the bottom.** Payouts are always on **collected gross profit** after
> customer payment + job-cost reconciliation, never top-line revenue.

---

## The base economics (what a referred customer is actually worth)

| Metric | Value | Source |
|---|---|---|
| Avg first order, new customer (2023+, n=801) | **$2,476** at 28.3% GM → **~$700 GP** | ledger |
| Avg year-1 value, new customer (2024 cohort, n=307) | $3,987 revenue → **$1,055 GP** | ledger |
| Avg active repeat account (2025, 2+ orders, n=213) | $8,283/yr revenue → **$2,795 GP/yr** | ledger |
| GP per order by vertical | Camp $726 · Teams $640 · School $579 · Event $551 · Pro-Svcs $510 · Health Club $390 | ledger |

**The affordability headline:** paying a partner 20% of first-order GP costs ~$140
on the average intro, against $1,055 of year-1 GP — a ~13% year-1 acquisition cost,
success-only, no upfront spend. Cold outbound pays for inboxes, data, and sends
before the first reply exists. Partner intros are strictly cheaper per customer at
any share below ~50% of first-order GP; the recommendations below stay far under that.

---

## Recommended terms per model

### Model A — Qualified introduction *(consultants, occasional referrers; HR-advisor lane default)*
- **20% of collected first-order GP.** Avg payout ≈ **$140**; camp-sized intro ≈ $145–200.
- Cap **$500 per introduction** (~3.5× the average — protects against a mega first order).
- Eligibility: intro → first paid order within **120 days**; no payout on tax, freight pass-through, refunds, credits, or unpaid invoices (as the engine doc requires).

### Model B — Recurring account share *(partners who create repeat programs; planner-lane default)*
- **10% of collected GP on attributable orders for 12 months** from first order; renewable annually only with continued involvement (the engine doc's condition — now with a number).
- Expected cost: avg new account ≈ **$105 year-1**; a strong $8K/yr account ≈ $280/yr.
- Cap **$2,000 per account per year**. Pre-existing CA customers excluded in writing before intro #1.

### Model C — White-label / reseller *(agencies; the B&H fix)*
The math that sets the ceiling: at CA's typical ~34% retail GM, a wholesale discount
of *d* leaves CA margin = (0.34 − d) / (1 − d). Holding the **28% floor** allows
**d ≈ 8%**. Accepting 25% GM *only against committed volume* allows **d ≈ 12%**.
- **Standard wholesale: 8% off CA retail** — no commitment required.
- **Committed wholesale: 12% off** — requires a signed **$50K+/yr volume commitment** (finance-approved exception to the floor, justified by guaranteed throughput).
- Partner sets client price, keeps the spread; CA never goes around them.
- **Burgess & Hayward context:** their 2025 pricing implies an effective ~22%+ discount (15.2% realized margin) — beyond even the committed tier. Formalizing at 12%-with-commitment *raises* CA's take while giving them something real (locked pricing, priority, white-label assets).

### Model D — Partner credit instead of cash
- **25% of first-order GP as CA merchandise credit** (avg ≈ $175 face). Real cost to CA ≈ 66% of face (the margin math) ≈ **$115** — the perceived-value arbitrage the engine doc wanted, quantified. 12-month expiry, tracked by finance.

### Model E — Client benefit *(trusted advisors who won't take cash)*
- Defined benefit to the referred client worth **up to 10% of expected first-order GP (~$70)**: art/design credit, shipping allowance, or upgraded item. Never the word "free" without the qualification attached.

### Model F — Co-marketing / lead exchange
- No cash changes hands. Each side funds its own production; unique landing page/UTM per campaign (attribution plumbing = task #10). Budget guardrail: CA's cost per campaign ≤ **$500** without separate approval.

### Model G — Milestone bonus *(high-potential partners)*
- **+$1,000 one-time** after **5 paid referred orders** each ≥25% GM, or $5K cumulative collected GP — whichever comes first. Stacks on A or B. (Meets the doc's rule: never volume-of-intros, only paid-and-profitable.)

---

## Per-lane defaults (what to open with)

| Lane | Open with | Fallback |
|---|---|---|
| Creative agencies | **C** (8% standard / 12% committed) | A |
| Event planners/producers | **B** (10% × 12mo) | E |
| HR/People advisors | **A** (20% first-order GP) | D |
| Existing de-facto partners | Per the sweep doc — B&H→C-committed · Event Engine→B on *net-new* only · Crown Trophy→C/D two-way | — |

## Sanity rails
- Every payout computes from QBO collected GP (task #10 builds the attribution) — if it can't be computed, it can't be promised.
- Camp-vertical referred work still carries the **28% floor** — a partner intro is not a discount coupon.
- Worst-case exposure per partner per year: A ≤ $500/intro · B ≤ $2K/account · G ≤ $1K — no open-ended promises anywhere.

## `[KENNY APPROVE]` — the six numbers that need his yes
- [ ] Model A: 20% of first-order GP, $500 cap, 120-day window
- [ ] Model B: 10% × 12 months, $2K/account/yr cap
- [ ] Model C: 8% standard / 12% @ $50K committed volume
- [ ] Model D: 25% of first-order GP as credit, 12-month expiry
- [ ] Model E: client benefit ≤ ~$70 defined value
- [ ] Model G: $1,000 after 5 paid ≥25%-GM orders
