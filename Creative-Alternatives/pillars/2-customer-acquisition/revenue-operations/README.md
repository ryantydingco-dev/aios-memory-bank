# Revenue Operations — draft operating system

> Status: **local draft only**. No QuickBooks or Mailchimp connection, no customer-data
> import, no audience change, and no message send is authorized by this system.

This folder is the operating layer that joins CA's two revenue motions:

1. **Existing customers:** QuickBooks eventually supplies customer and order truth;
   permissioned contacts can receive timely, useful Mailchimp campaigns.
2. **New customers:** signal-based, human-approved outreach sells an outcome (a smooth
   onboarding, an on-time event, better recognition, thoughtful gifting, or a managed
   merchandise program), not a product catalog.

It extends the existing offer structure instead of replacing it:

- The **core promo-distribution offer** gains five packaged use cases for HR/People,
  event/marketing, recruiting, local offices, and trade-show exhibitors.
- The proven **camp/club Store Engine** remains the primary wedge for organizations
  with a recurring member or parent audience.

## The system

| Component | Canonical file | Job |
|---|---|---|
| Data contract | `quickbooks-data-contract.md` | Defines customer/order fields, cleaning, permissions, derived dates, and source ownership |
| Existing-customer motion | `customer-segmentation-and-campaigns.md` | Four segments, prioritization, 90-day Mailchimp calendar, suppression and follow-up rules |
| Campaign copy | `mailchimp-email-templates.md` | Four Mailchimp-ready drafts; all require consent and human approval |
| New-customer motion | `new-customer-offer-and-outreach.md` | Outcome packages, buyer map, signals, qualification, cadence, and handoff |
| Cadence and metrics | `operating-cadence.md` | Single tracker contract, daily/weekly/monthly rhythm, attribution, stage crosswalk |
| Activation gates | `implementation-checklist.md` | What is ready locally and what requires data, consent, account access, or approval |
| Workbook | `templates/creative-alternatives-revenue-ops.xlsx` | Local operating console: dictionary, import layouts, calendar, tracker, dashboard |
| Validator/views | `../../../scripts/ca_revenue_ops.py` | Read-only workbook validation plus daily and weekly Markdown views |

## Source-of-truth hierarchy

1. **QuickBooks:** eventual truth for customer identity, invoices/orders, revenue, and
   last-order facts. The older ledger remains analytics history; reconcile differences
   to QuickBooks rather than silently overwriting them.
2. **Revenue tracker:** local operating view for lead source, pipeline, next action,
   probability, loss reason, and campaign attribution. It does not change QuickBooks.
3. **Mailchimp:** campaign membership, send status, clicks, replies, and unsubscribes
   after connection is approved. It is not a customer/order database.
4. **HubSpot:** the existing warm-pipeline spec names HubSpot as the downstream pipeline
   system. This local workbook is a consolidation draft, not an authorized migration.
   Before activation, Ryan must choose one entry point and a sync/export rule so nobody
   double-enters deals.

## Non-negotiable operating rules

- A contact is never uploaded or sent to without a documented permission status.
- `unknown`, `transactional_only`, `unsubscribed`, and `do_not_contact` are suppressed.
- Mailchimp is for permissioned existing-customer marketing, not cold acquisition.
- Every external message, quote, delivery promise, price, incentive, and proof claim is
  approved by Ryan/Kenny/Maclaine before use.
- Campaigns lead with a buyer moment and a useful outcome. Product examples support the
  plan; they do not become a catalog dump.
- Open and click behavior may guide review, but replies, quote requests, orders, and
  reconciled revenue are the decision metrics.
- No customer names or financial details enter public/build-in-public content without
  explicit approval.

## First live pilot after approval

Use a **25-contact permissioned pilot** from one segment, not the whole customer base.
Recommended first cohort: seasonal/reorder candidates whose expected need is 6–10 weeks
away and whose past order context is verified. Review every row, send one approved
message, log replies/quotes/orders, reconcile wins to QuickBooks, then decide whether to
scale.

## Build-in-public angle

Story: *"We turned 27 years of order memory into a calendar that tells a family business
who needs help before the scramble — without letting AI contact a single customer on its
own."* Use only anonymized screens and approved figures.
