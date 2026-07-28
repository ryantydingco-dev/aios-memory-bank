# Measurement and Attribution SOP

## Purpose

Create one evidence chain from action to money. The sprint workbook is the operating source of truth until the HubSpot and originated-ledger workflows are repaired.

## Funnel Definitions

| Stage | Definition |
|---|---|
| Drafted | Internal asset exists; no external action occurred |
| Approved | Named human approved the exact action |
| Sent/Attempted | A human actually sent or called |
| Engaged | Human replied or completed a substantive conversation |
| Meeting booked | Calendar event exists |
| Meeting held | Conversation occurred |
| Quote/proposal sent | Exact commercial offer delivered |
| Booked order/trial | Customer accepted and commitment exists |
| Invoiced revenue | Invoice exists with ID and amount |
| Cash collected | Payment is received and linked to the invoice |
| MRR | Signed recurring agreement plus first recurring payment |

## Mandatory Fields For Every Opportunity

- Business
- Account
- Source campaign or motion
- Source date
- Human owner
- Current stage
- Last action date
- Next action and due date
- Approval status and approver
- Estimated opportunity value, clearly labeled
- Quote/proposal amount
- Booked value
- Invoice ID and invoiced value
- Payment date and cash collected
- Fulfillment hours
- Lost reason
- Proof permission status

## Daily Scorecard

Track separately for CA and Dealthreads:

- Human follow-up attempts
- Substantive conversations
- Mockups/sample packages approved
- Mockups/sample packages delivered
- Meetings booked and held
- Quotes/proposals delivered
- Orders/trials booked
- Invoiced revenue
- Cash collected
- Fulfillment hours
- Same-day fulfillment misses

## Revenue Rules

- Pipeline estimates never count as revenue.
- A reply never counts as positive until classified by a human or verified ruleset.
- OOO, bounce, spam filter, wrong contact, and unsubscribe are not demand.
- Booked value, invoice value, and cash collected are three different numbers.
- CA order values are gross sales unless job-level profit is available.
- Do not infer margin from blended company margin for customer-facing claims.
- Dealthreads MRR begins only after a signed recurring scope and first recurring payment.

## Friday Review

1. Reconcile every order/trial with an invoice or payment record.
2. Review all open opportunities missing a next date.
3. Calculate stage conversion rates using human positives, not raw replies.
4. Compare actual revenue and cash against scenario ranges.
5. Record why each loss happened.
6. Choose one next experiment; do not change multiple campaign levers at once.
7. Update the durable HubSpot/originated ledger only after the sprint workbook reconciles.

## Source Freshness

- SmartLead database snapshot: 2026-07-17.
- QBO A/R live snapshot: 2026-07-13; must refresh before collections.
- QuickBooks customer/year export: collected into the database on 2026-07-17, underlying export may be older; live-check high-value rows.
- Dealthreads campaign launched 2026-07-16; conversion evidence is early.

