# Partner Attribution — how a payout becomes computable

> The plumbing behind the economics doc's promise that every incentive pays on
> **collected gross profit**. Built 2026-07-18. If it can't be computed here, it
> can't be promised to a partner.

## The chain

```
Partner intro
   ▼
HubSpot deal tagged partner_source = "<partner name>"      ← [NEEDS RYAN: create property]
   ▼
Customer + all name variants added to config/ca_partner_registry.yaml
   (attributed_customers — the B&H "&/and" lesson: add EVERY spelling)
   ▼
Orders land in Kenny's ledger as always (profit per order = the GP source)
   ▼
Monthly: .venv/bin/python scripts/ca_partner_gp_reconcile.py
   - joins attributed customers → ledger orders → GP
   - checks qb_ar_aging: customer has open A/R → order is PENDING, not payable
   - applies the partner's model terms (share %, caps) from the registry
   ▼
outputs/partnerships/statements/<period>-<partner>.md   (DRAFT)
   ▼
Ryan/Kenny review → approve → pay. terms_approved:false = statement blocks payout.
```

## What exists now
- **`config/ca_partner_registry.yaml`** — the single source of truth for partner status, model, terms, and attributed customers. Templates seeded for Event Engine (Model B) and Burgess & Hayward (Model C).
- **`scripts/ca_partner_gp_reconcile.py`** — the monthly statement generator. Verified end-to-end on B&H's real 2025 orders ($940 GP → $94 draft payout at Model B terms, correctly watermarked "terms not approved").

## The one thing that needs Ryan (account-config change, not done automatically)
- **Create a `partner_source` property in HubSpot** (contact + deal), single-line text, filled at deal creation for any partner-introduced lead. `config/ca_hubspot_outbound.yaml` (currently unwired, per the audit) is the natural home for the definition. Say the word and I'll add it via the HubSpot connector.

## Rules encoded
1. One customer attributes to at most one partner; pre-existing CA customers are excluded in writing before intro #1 (registry field `excluded_customers`).
2. "Collected" is enforced by the A/R join — open balance = pending, no payout.
3. Caps from the economics doc apply in-script (Model B $2K/account/yr etc.).
4. Model C (wholesale) partners get margin-reconciliation statements, not payouts.
5. Refresh data before approving any statement: `/update-data` (ledger + A/R).

## Known limits (v1, honest)
- Ledger GP is Kenny's per-order economics, not a job-cost accounting system — the economics doc's "final job-cost reconciliation" still applies to large orders before payout.
- A/R is a customer-level check, not invoice-level matching; a customer with ANY open balance holds ALL their period orders as pending (conservative by design).
- Ledger entry lag (flagged in the revenue plan) delays statements — another reason the ledger catch-up matters.
