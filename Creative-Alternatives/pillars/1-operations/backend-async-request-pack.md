# Backend Async Request Pack — Creative Alternatives

> Purpose: send this to Maclaine/Kenny when a live session is hard to schedule. It asks for the minimum answers and evidence needed to unblock the first backend automation decision.

## Copy/Paste Message

Subject: Quick backend mapping request for CA ops

Hey — I’m mapping the backend workflow so we can find where info gets lost between QuickBooks, email, spreadsheets, POs, printers, proofs, shipping, invoices, and payments.

I’m not trying to change how Kenny sells or how relationships are handled. I’m trying to identify the annoying/manual parts we can clean up safely.

Can you send me the answers/files below? Rough answers are fine. If something only lives in someone’s head, just say that.

If it is easier, fill this response template:

`context/import/backend-audit/2026-07-05/async-response-template.md`

## Part 1 — Five Answers

1. **QuickBooks version:** Are we using QuickBooks Online, QuickBooks Desktop, or something else?
2. **Transaction types:** Which of these do we actually use: estimates, invoices, sales receipts, purchase orders, bills, projects/classes/custom fields?
3. **Order trigger:** When a customer approves an order, what is the first thing created or updated in QuickBooks?
4. **Vendor/printer costs:** Are vendor/printer costs tied to customer jobs in QuickBooks, or tracked somewhere else?
5. **Payment matching pain:** What made the recent invoice/payment matching take around 8 hours?

## Part 2 — QuickBooks Exports

Please export CSV if possible and put them in:

`context/import/backend-audit/2026-07-05/quickbooks/`

Needed files:

- `qb_invoice_detail.csv`
- `qb_payments_deposits_detail.csv`
- `qb_open_invoices.csv`
- `qb_open_purchase_orders.csv`
- `qb_unpaid_bills_vendor_bills.csv`
- `qb_estimates_quotes.csv`

If one of these reports does not exist or CA does not use that feature, write that down instead of forcing it.

## Part 3 — One Real Order Packet

Pick one recent order, ideally one that involved a printer/decorator.

Put evidence in:

`context/import/backend-audit/2026-07-05/orders/order-01/`

Minimum artifacts:

- original customer request
- quote or estimate
- customer approval or proof approval
- PO or vendor order
- vendor/printer confirmation
- approved proof or artwork location
- shipping/tracking or delivery evidence
- invoice/payment status

Screenshots, PDFs, forwarded emails, copied email text, or short notes are all fine.

## Part 4 — Relationship Rules

Add a short note in:

`context/import/backend-audit/2026-07-05/relationship-rules/`

Include:

- customers that should always get personal handling
- vendors/printers Kenny does not want disrupted
- anything we should never automate without approval

## What I’ll Do After

After this comes in, I’ll run:

```bash
python3 pillars/1-operations/automations/backend_session_intake/import_async_response.py --date 2026-07-05
python3 pillars/1-operations/automations/backend_ops_runner/run_backend_ops_checks.py --date 2026-07-05
```

Then I’ll report back with:

- what’s mapped
- what’s still missing
- the biggest backend gaps
- the first safe automation to build

## Guardrails

- No QuickBooks writes.
- No customer/vendor-facing messages.
- No money-facing action.
- Kenny/Maclaine approve anything before it touches a customer, vendor, or cash.
