# Hermes — Invoice-Chase AR Buying-Signal Spec (v2)

Last updated: 2026-06-08
Purpose: how Hermes should score & rank prospects for the DealThreads **AR / invoice-chase** offer. Replaces the additive tag-count model (which inflated scores — `OWNER_DECISION_MAKER` fired on 100%, `RECURRING_RENEWALS` on 94%, so nothing ranked). Goal: surface firms with **active accounts-receivable pain**, not firms that merely *look like* they bill.

## Core principle
Separate **FIT** (who they are) from **INTENT** (are they in AR pain *now*).
`total_0_10 = fit_0_5 + intent_0_5`. Weight intent by evidence **directness**, not tag count. **One Tier-1 signal beats three Tier-3 keyword hits.**

## Never count as a buying signal
`OWNER_DECISION_MAKER`, segment, company size, geo — these are **FIT** (already guaranteed by the search filters). They must never touch the intent score.

## Signal tiers + weights (intent)

**Tier 1 — active AR pain (weight 3 each):**
- `HIRING_AR_ROLE` — open job post for *billing coordinator / AR clerk / collections / bookkeeper / office manager / controller*. Source: Indeed, LinkedIn Jobs, careers page. **Highest intent — budget is already moving to chase invoices.**
- `MECHANICS_LIEN` — filed mechanics lien / payment-dispute / collections suit (public record). Source: county recorder, lien-filing services, court records. **For trades/construction — undeniable "fighting to get paid."**
- `BILLING_COMPLAINT` — Google/Yelp/BBB review mentioning slow invoicing, billing errors, "took forever to pay/get paid," disputes.
- `FACTORING_FINANCING` — uses invoice factoring / AR financing / "we finance receivables."
- `ADMIN_AR_PAIN` — explicit owner/site statement about chasing payments, overdue, collections.

**Tier 2 — structural AR exposure (weight 2 each):**
- `THIRD_PARTY_PAYER` — insurance (restoration/roofing/medical), government, property management, GC subcontracting. **Slow third parties = worst stuck AR. Strongest Tier-2.** Pairs with a segment multiplier.
- `NET_TERMS_BILLING` — "Net 30/60," progress billing, deposit + balance, "financing available."
- `HIGH_TICKET_COMMERCIAL` — *verified* large commercial projects (not just the keyword "commercial").
- `BILLING_TOOL` — QuickBooks / Xero / Jobber / ServiceTitan / Stripe detected (easy delivery + confirms they invoice). Source: BuiltWith / Wappalyzer.

**Tier 3 — context (weight 1 each):**
- `RECURRING_CONTRACTS` — real retainers / SLAs / maintenance contracts (renewal-invoicing pain).
- `GROWTH_PROOF` — *real* growth: hiring velocity, new locations, funding — not the keyword "growth."

## Segment multipliers (AR-pain intensity)
| Segment | ×mult | Fit |
| --- | --- | --- |
| Restoration / Roofing (insurance-billed) | **1.25** | 5 |
| Construction / Trades | 1.15 | 5 |
| Agencies / Marketing (slow clients, deposits) | 1.00 | 4 |
| Consulting / Professional services | 0.90 | 4 |
| MSP / IT (recurring auto-billed → low AR pain) | **0.60** | 2 |

## Scoring formula
```
intent_raw = Σ(tier weights of present signals)      # fit attributes excluded
intent_adj = intent_raw × segment_multiplier
intent_0_5 = min(5, intent_adj / 2)
fit_0_5    = segment_fit, adjusted down for thin/missing data
total_0_10 = fit_0_5 + intent_0_5
```

## Channel routing (stop blanket-labeling "call first")
- `best_phone` present AND `total ≥ 7.5` → **CALL_FIRST**
- `best_phone` present → **CALL**
- email only → **EMAIL / SENDR** (personalized video)

## Output requirements (per lead)
- `total_0_10`, `intent_0_5`, `fit_0_5`, `channel`, `top_signal`, `ar_segment`, `buying_signal_tags`
- **`evidence_proof`** — CITE the specific evidence, not a generic hypothesis:
  - `"Hiring 'Billing Coordinator' (Indeed, posted 6d ago)"`
  - `"2 mechanics liens filed 2025 (Greenville County)"`
  - `"Google review: 'waited 4 months for an invoice'"`
  This drives the opener AND validates the score.
- `call_opener` — must reference the proof.

## Data sources (with cost gates — get Ryan's approval before any paid run)
- Job postings → Indeed / LinkedIn Jobs (hiring signal)
- Public records → county recorder / lien services (mechanics liens)
- Reviews → Google / Yelp / BBB (billing complaints)
- Tech detect → BuiltWith / Wappalyzer (billing stack)
- News / funding (growth)

Website-keyword inference stays **Tier-3 only** — it's weak, and it was what inflated the old scores.

## The 80/20
If you wire in ONE thing first: **`HIRING_AR_ROLE` + `MECHANICS_LIEN`.** Highest-intent, most-actionable AR signals in existence, and both are currently absent. A contractor who just filed a lien or is hiring someone to chase invoices is the closest thing to a pre-sold buyer.

## Apply to
Re-enrich + re-score: the TOP-150 (`invoice_chase_TOP_150_RESCORED_2026-06-08.csv` is the interim re-weight) and the new `sc_smb_general_ADDON_2026-06-08_CLEAN.csv` (currently UNSCORED).
