# Backend Artifact Request Pack — Creative Alternatives

> Give this to Ryan/Maclaine/Kenny before the backend walkthrough. Purpose: collect the minimum evidence needed to find the real gaps between QuickBooks, email, spreadsheets, purchase orders, printers, proofs, shipping, invoices, and payments.

## Collection rules

- Do not send customer, vendor, or money-facing messages from this process.
- Redact or mask sensitive customer/bank details if files are used for filming or sharing.
- Keep the real internal versions complete enough to reconcile workflow reality.
- If something cannot be exported, capture a screenshot or short screen recording.
- If something only exists in someone's head, write "team memory" as the source.

## Folder structure

Put evidence under:

`context/import/backend-audit/YYYY-MM-DD/`

Recommended subfolders:

- `quickbooks/`
- `email-threads/`
- `purchase-orders/`
- `proofs-artwork/`
- `shipping-tracking/`
- `spreadsheets/`
- `screenshots/`
- `notes/`

Use filenames that do not require opening the file to understand it:

`2026-07-05_qb_ar_aging.csv`

`2026-07-05_order-01_vendor-confirmation.pdf`

`2026-07-05_order-03_payment-match-screenshot.png`

## QuickBooks exports

### Already available in workspace

These have current starter versions in `context/import/`:

| Report | Current file | Used for |
|---|---|---|
| A/R Aging Summary | `qb_ar_aging.csv` | AR worklist, collections priority, cash risk |
| Expenses by Vendor Summary | `qb_expenses_by_vendor.csv` | vendor/printer exposure, relationship mapping |
| Sales by Customer Summary | `qb_sales_by_customer_total.csv` | customer value, reorders, A/B/C handling |
| Sales by Product/Service Summary | `qb_sales_by_product.csv` | product mix, missing COGS/margin visibility |
| Customer Contact List | `qb_customer_contacts.csv` | contact coverage and outreach readiness |

### Needed next

Export these before building the first real automation:

| Export | Date range | Required fields | Why it matters |
|---|---|---|---|
| Invoice Detail | one recent representative month plus current open invoices | customer, invoice number, invoice date, due date, amount, balance, status, memo/job/order reference | required for payment matching and AR worklist accuracy |
| Payments Received / Deposits Detail | same month as invoice detail | customer/source, payment date, amount, reference/check/ACH note, deposit account if safe, linked invoice if available | required for reconciliation exception report |
| Open Invoices | current day | customer, invoice number, date, due date, amount, balance, aging bucket | required for daily AR action list |
| Open Purchase Orders | current day, if QuickBooks POs are used | PO number, vendor, customer/job reference, amount, date, status | required to decide if QuickBooks can anchor PO tracking |
| Unpaid Bills / Vendor Bills | current day, if vendor bills are entered | vendor, bill number, date, amount, linked customer/job if any, status | required for vendor cost and margin matching |
| Estimates / Quotes | one recent representative month, if estimates are used | estimate number, customer, date, amount, status, converted invoice if any | required to understand quote-to-order trigger |

If QuickBooks cannot export one of these, mark it as a gap in the intake workbook.

## Five live order packets

Collect five recent/active orders:

1. Normal apparel order.
2. Rush order.
3. High-dollar customer order.
4. Printer/decorator order.
5. Order with invoice, payment, or AR confusion.

For each order, create one mini-packet:

| Artifact | What to capture | Pass/fail test |
|---|---|---|
| Customer request | original email/thread, call note, text, or intake source | Can we find what the customer asked for in under 2 minutes? |
| Quote/estimate | quote email, QuickBooks estimate, spreadsheet quote, or notes | Can we see what was promised and by whom? |
| Customer approval | written approval, proof approval, or order confirmation | Can we prove the customer said yes? |
| Purchase order/vendor order | QuickBooks PO, vendor portal order, PDF, email, or text | Does it reference the same customer/job/order? |
| Vendor/printer confirmation | confirmation email, portal screenshot, production date, ship date | Can we tell whether the vendor accepted the job? |
| Proof/artwork | approved proof, file location, art version, approval evidence | Can we identify the final approved proof? |
| Shipping/tracking | tracking email, UPS/FedEx/portal screenshot, delivery note | Can we answer "where is it?" without hunting? |
| Invoice/payment | invoice, payment status, payment/deposit match | Can we tell whether it is paid and matched correctly? |

## Email evidence

For the five orders, capture:

- customer request thread
- customer approval thread
- vendor/printer order thread
- vendor/printer confirmation thread
- proof approval thread
- shipping/tracking thread
- any payment/reminder thread

For each thread, note:

- Which inbox owns it.
- Whether Maclaine can access it.
- Whether Kenny needs to personally handle it.
- Whether there is a shared label/folder/status marker.
- Whether the subject line contains a customer/order/job ID.

## Purchase order and vendor/printer evidence

For the top 10 vendors/printers from the QuickBooks expense export, collect:

| Vendor/printer | Needed answer |
|---|---|
| Sanmar | order method, PO requirement, confirmation method, tracking method, invoice method, relationship owner |
| Viking Solutions - V | confirm what this vendor is and whether it is production-related |
| S & S | order method, PO requirement, confirmation method, tracking method, invoice method, relationship owner |
| alphabroder | order method, PO requirement, confirmation method, tracking method, invoice method, relationship owner |
| Diamond Graphics | decoration workflow, art handoff, proof approval, confirmation, tracking, invoice method |
| Pennant Sportswear | confirm vendor type and ordering workflow |
| UPS | where tracking is stored and who gets notifications |
| Irmo Trophy | decoration workflow, art handoff, proof approval, confirmation, tracking, invoice method |
| Hit Promotional Products | order method, PO requirement, confirmation method, tracking method, invoice method |
| Any local printer/decorator Kenny relies on | relationship rules and do-not-disrupt notes |

## Spreadsheet evidence

Collect or list every spreadsheet used weekly for:

- open orders
- quotes/pricing
- product costs
- vendor/printer tracking
- artwork/proof status
- shipping/tracking
- customer lists
- reorders
- AR/payment notes
- inventory or web stores

For each spreadsheet, capture:

- link/path
- owner
- who updates it
- how often it is updated
- what fields it tracks
- whether it duplicates QuickBooks
- whether formulas are trusted
- whether it is still actively used

## Proof/artwork evidence

For each of the five order packets:

- original art location
- proof file location
- approved proof location
- naming convention
- who created the proof
- how approval was captured
- how final art was sent to printer/decorator

If the final approved proof cannot be identified quickly, that is a high-priority gap.

## Shipping/tracking evidence

For each of the five order packets:

- who receives tracking
- where tracking is stored
- who tells the customer
- whether delivery triggers invoicing
- whether split shipments are tracked

If tracking only exists in a vendor email, mark it as a gap.

## First-build minimum evidence

### AR action worklist

Minimum needed:

- fresh A/R Aging Summary
- open invoice detail
- customer relationship notes for A-tier accounts
- current AR owner and follow-up cadence

### Payment-to-invoice reconciliation exception report

Minimum needed:

- invoice detail for one representative month
- payments/deposits detail for the same month
- explanation of the 8-hour manual matching pain
- examples of partial payment, multiple-invoice payment, unapplied payment, or duplicate issue if available

### PO/printer confirmation tracker

Minimum needed:

- five printer/decorator order packets
- top vendor/printer relationship rules
- sample PO/vendor order
- sample confirmation/tracking/invoice flow

### Open-order daily brief

Minimum needed:

- current open-order source
- five active orders with next action and owner
- status vocabulary agreed by Ryan/Maclaine
- proof/PO/shipping status sources

## What to do after collecting

1. Put evidence in `context/import/backend-audit/YYYY-MM-DD/`.
2. Fill `outputs/backend-systems-intake-2026-07-05/Creative-Alternatives-Backend-Systems-Intake.xlsx`.
3. Add every failure/conflict to the `Gap Register` tab.
4. Score each gap.
5. Pick the highest-priority safe automation.

