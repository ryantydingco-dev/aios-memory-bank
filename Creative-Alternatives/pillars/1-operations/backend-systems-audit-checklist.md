# Backend Systems Audit Checklist — Creative Alternatives

> Working checklist for Ryan acting as backend systems operations. Goal: expose the gaps between QuickBooks, email, spreadsheets, purchase orders, printers/decorators, proofs, shipping, invoicing, and payments so CA can remove manual chaos and create room for revenue growth.

## The job of this audit

We are not starting by "automating everything." We are finding the exact places where information gets lost, retyped, delayed, or held in someone's head.

The backend should eventually answer five questions instantly:

1. What orders are open right now?
2. What is each order waiting on?
3. Which customer/vendor/printer needs a follow-up today?
4. What money is owed to CA or by CA?
5. Which accounts are due for reorder or at risk of going quiet?

## Known evidence from current workspace

- QuickBooks is intended to be the source of truth for customers, orders, invoices, AR, and recent revenue.
- QuickBooks appears to have strong 2025-2026 data, but not the full 27-year customer history.
- The current local database only stores SmartLead outreach snapshots; QuickBooks is not yet flowing into `data/data.db`.
- The operations workflow map is still mostly `[CONFIRM]`.
- CA has known AR/reconciliation pain:
  - about $671k owed in the 2026-06-26 export
  - about $378k past due
  - about $63k 90+ days late
  - one known 8-hour manual payment-to-invoice reconciliation session
- QuickBooks product exports show item-level COGS as $0, which means margin visibility is incomplete or tracked somewhere else.
- Key suppliers/vendors from expense exports include Sanmar, Viking Solutions, S&S Activewear, alphabroder, Diamond Graphics, Pennant Sportswear, Hit Promotional, UPS, and others.
- Printer/decorator PO process is not yet mapped.
- Email/spreadsheet/order-tracking reality is not yet mapped.

## Audit method

Do this with **one real recent order** first. Then repeat with 5-10 orders:

- 2 normal/easy jobs
- 2 rushed or messy jobs
- 2 large-dollar jobs
- 1 job with a printer/vendor issue
- 1 job with payment/AR confusion
- 1 web-store/company-store job if available

For every order, collect screenshots/exports where possible and record where the same data appears in more than one place.

## System inventory checklist

### 1. QuickBooks

Capture:

- [ ] Which QuickBooks product/version is used.
- [ ] Who has access and what permission level.
- [ ] Whether estimates are used.
- [ ] Whether sales receipts are used.
- [ ] Whether invoices are created before, during, or after delivery.
- [ ] Whether purchase orders are created in QuickBooks.
- [ ] Whether bills/vendor expenses are attached to customer jobs.
- [ ] Whether customer payments are matched to invoices manually or automatically.
- [ ] Whether deposits/partial payments are tracked.
- [ ] Whether classes/projects/custom fields are used.
- [ ] Whether item/product costs are tracked anywhere in QuickBooks.
- [ ] Which reports Maclaine actually uses weekly.

Gap signals:

- Customer, invoice, payment, and vendor data do not connect cleanly.
- Payments sit unapplied.
- Invoices do not have clear due dates/terms.
- Product revenue exists without product cost.
- Printer/vendor cost is not linked back to customer/order.
- No consistent order/job ID ties everything together.

### 2. Email

Capture:

- [ ] Which inboxes receive customer requests.
- [ ] Which inboxes receive printer/vendor confirmations.
- [ ] Which inboxes receive proof approvals.
- [ ] Whether Kenny's personal/AOL email still handles orders. `[CONFIRM]`
- [ ] Whether Maclaine has access to the same order threads.
- [ ] Whether there is a shared inbox.
- [ ] Whether labels/folders/tags are used.
- [ ] Whether order status is tracked from email or memory.
- [ ] How customer approvals are preserved.
- [ ] How attachments/artwork are saved.

Gap signals:

- Customer requirements live only in an email thread.
- Vendor confirmations live in a different inbox than the customer request.
- Proof approval is buried in email and not copied to an order tracker.
- Someone has to search email to answer "where is this order?"
- No standard subject line/order ID convention.

### 3. Spreadsheets

Capture:

- [ ] List every spreadsheet used for customers, orders, pricing, inventory, products, vendors, or reorders.
- [ ] Owner of each spreadsheet.
- [ ] Last updated date.
- [ ] Whether it duplicates QuickBooks data.
- [ ] Whether formulas are trusted.
- [ ] Whether anyone else knows how to use it.
- [ ] Which spreadsheet is mission-critical.

Gap signals:

- Spreadsheet is the real source of truth but QuickBooks says something different.
- Pricing/margins live in sheets with no audit trail.
- Same customer/order appears under multiple names.
- Columns are free-text where status should be standardized.

### 4. Purchase orders and printers/decorators

Capture for each printer/decorator/vendor:

- [ ] Vendor name.
- [ ] What they produce/decorate.
- [ ] How orders are sent: portal, email, phone, text, PDF, QuickBooks PO.
- [ ] Whether a PO number is required.
- [ ] Who creates the PO.
- [ ] Whether the customer order number appears on the PO.
- [ ] Required info: product, SKU, color, size breakdown, quantity, decoration method, artwork file, proof, due date, ship-to, billing terms.
- [ ] Whether vendor confirms receipt.
- [ ] Whether vendor confirms price.
- [ ] Whether vendor confirms production date.
- [ ] Whether vendor confirms ship date/tracking.
- [ ] Whether vendor invoices are matched back to customer order.
- [ ] Whether late/missing confirmations are tracked.

Gap signals:

- PO exists in email but not QuickBooks.
- Printer cost is known only after the fact.
- No one knows whether the printer accepted the order.
- There is no due-date escalation.
- Artwork/version confusion causes rework.
- Vendor invoice cannot be tied to customer invoice.

### 5. Proofs and artwork

Capture:

- [ ] Where artwork files live.
- [ ] Naming convention for files.
- [ ] Who creates digital proofs.
- [ ] Where proofs are stored.
- [ ] How proof approval is requested.
- [ ] How approval is recorded.
- [ ] Whether approved proof is attached to the order/PO.
- [ ] What happens when a customer changes artwork after approval.

Gap signals:

- Approved file is not clearly marked.
- Multiple versions with no version control.
- Printer gets a different file than customer approved.
- Approval is in email only.
- No proof aging list.

### 6. Shipping and delivery

Capture:

- [ ] Does product ship to CA, customer, printer, or split destinations?
- [ ] Who creates labels.
- [ ] Who receives tracking numbers.
- [ ] Where tracking is stored.
- [ ] Who notifies the customer.
- [ ] What happens if shipment is late or short.
- [ ] How delivery satisfaction is confirmed before invoicing.

Gap signals:

- Tracking lives only in a vendor email.
- Customer asks for status and someone has to manually search.
- Invoice waits because delivery confirmation is unclear.
- Split shipments are not visible.

### 7. Invoicing, AR, and payments

Capture:

- [ ] When invoice is created.
- [ ] Who creates it.
- [ ] Payment terms used.
- [ ] Whether deposits are used for first-time or large orders.
- [ ] How customers pay.
- [ ] How payments are matched to invoices.
- [ ] Who follows up on overdue invoices.
- [ ] Whether statements are sent.
- [ ] Whether AR is reviewed daily, weekly, or ad hoc.
- [ ] Whether bad debt is marked separately from slow-paying good customers.

Gap signals:

- Payment matching is manual and takes hours.
- Open invoices remain unresolved after payment.
- High-value customers are overdue but no one wants to send a generic reminder.
- No AR owner or cadence.
- No tiered follow-up based on relationship value.

### 8. Reorders and account follow-up

Capture:

- [ ] How CA knows when a customer should reorder.
- [ ] Whether reorder timing is seasonal, annual, event-based, or random.
- [ ] Whether prior products/quantities are easy to retrieve.
- [ ] Whether reorder reminders exist.
- [ ] Who owns the follow-up.
- [ ] Which customers should always get personal treatment from Kenny/Maclaine.

Gap signals:

- Reorders depend on memory.
- Seasonal customers are contacted too late.
- Customer asks for "same as last year" and the prior order is hard to reconstruct.
- Dormant customer list exists but is not prioritized by value.

## Required order record

Every open order should eventually have one canonical record with these fields:

| Field | Required? | Current source | Gap? |
|---|---:|---|---|
| Internal order/job ID | Yes | `[CONFIRM]` | |
| Customer name | Yes | QuickBooks / email | |
| Contact person + email/phone | Yes | QuickBooks / email | |
| Request date | Yes | email / call notes | |
| Needed-by date | Yes | email / quote | |
| Products/SKUs | Yes | quote / vendor portal | |
| Quantity + size/color breakdown | Yes | quote / spreadsheet | |
| Artwork/proof file link | Yes | file storage / email | |
| Proof status | Yes | email / tracker | |
| Customer approval date | Yes | email | |
| Supplier/printer/decorator | Yes | Kenny / PO | |
| PO number | Yes | QuickBooks / vendor email | |
| Vendor cost | Yes | bill / estimate / spreadsheet | |
| Customer price | Yes | quote / invoice | |
| Expected margin | Yes | `[CONFIRM]` | |
| Production status | Yes | vendor email / portal | |
| Ship-to address | Yes | customer / QB | |
| Tracking number | Yes | vendor / UPS | |
| Invoice number | Yes | QuickBooks | |
| Payment status | Yes | QuickBooks | |
| Reorder date/trigger | Nice-to-have | QuickBooks / memory | |

If a field has no reliable source, that is a backend systems gap.

## Gap log template

Use this every time you see friction:

| Gap | Where it happens | Current workaround | Impact | Frequency | Owner | Fix idea |
|---|---|---|---|---|---|---|
| Example: PO confirmation not tracked | Vendor ordering | Search email manually | Late jobs + status confusion | Weekly `[CONFIRM]` | `[CONFIRM]` | Order tracker with confirmation flag |

Impact tags:

- **Cash leak**: affects AR, payment, collections, margin, or vendor cost.
- **Revenue leak**: missed reorder, slow quote, no follow-up.
- **Customer risk**: late order, wrong proof, poor status visibility.
- **Manual time**: repeated searching, copying, retyping, reconciling.
- **Founder dependency**: only Kenny knows the answer.

## First gap hypotheses

These are not proven yet, but they are the highest-probability places to inspect first:

1. **No single order/job ID across systems.**
   - QuickBooks, email, proofs, printer POs, vendor invoices, and shipping may not share one identifier.

2. **QuickBooks is financial truth, not operational truth yet.**
   - It records customers/invoices/payments, but may not show production status, proof status, PO confirmation, or reorder triggers.

3. **Printer/decorator workflow is under-mapped.**
   - Current docs name suppliers but do not show how POs, confirmations, art, expected dates, and vendor invoices are tracked.

4. **Email is likely acting as the hidden order system.**
   - If approvals, vendor confirmations, and customer changes live only in email, status visibility will stay messy.

5. **Spreadsheets may be shadow systems.**
   - If pricing, order status, product costs, or vendor instructions live in spreadsheets, we need to decide whether they stay, get cleaned, or get replaced.

6. **Payment matching and AR follow-up are immediate cash/time problems.**
   - Existing evidence already shows a large AR balance and an 8-hour reconciliation pain point.

7. **Margin visibility is incomplete.**
   - Product-level COGS is missing in QuickBooks exports, so CA may not know job/product/customer profitability without manual reconstruction.

8. **Reorder timing is not systematized.**
   - Existing customer revenue is the fastest revenue lever, but the backend needs a reorder-due list and cadence.

## 30-day backend ops checklist

### Week 1 — Map reality

- [ ] Pick 5-10 representative orders.
- [ ] Walk each order from customer request to payment.
- [ ] Fill the required order record table for each.
- [ ] Inventory every spreadsheet, inbox, portal, and file location involved.
- [ ] Identify where the same data is entered more than once.
- [ ] Identify the first place status becomes unclear.

### Week 2 — Stabilize money flow

- [ ] Export fresh AR aging from QuickBooks.
- [ ] Build or run the AR worklist.
- [ ] Export one month of invoices and payments/deposits.
- [ ] Run payment-to-invoice reconciliation.
- [ ] Create a weekly AR review cadence.
- [ ] Decide payment terms/deposit rules to confirm with Kenny.

### Week 3 — Stabilize order/PO visibility

- [ ] Create a simple open-order tracker.
- [ ] Add PO confirmation status.
- [ ] Add proof status.
- [ ] Add vendor expected ship date.
- [ ] Add customer needed-by date.
- [ ] Add invoice/payment status.
- [ ] Review tracker with Maclaine/Kenny twice that week.

### Week 4 — Automate the first repeatable loop

- [ ] Choose one loop to automate first:
  - AR daily worklist
  - reconciliation exception report
  - open-order status brief
  - printer PO follow-up list
  - proof approval chaser
- [ ] Build v1 as read-only/manual-assist.
- [ ] Measure time saved.
- [ ] Record incorrect suggestions and edge cases.
- [ ] Decide whether the loop graduates to daily use.

## Questions Ryan needs answered first

Answer these before we build anything that touches live operations:

1. What are the exact inboxes where orders come in?
2. What are the exact inboxes where printer/vendor confirmations come in?
3. Does CA use QuickBooks estimates, invoices only, purchase orders, bills, or all of those?
4. Are purchase orders created in QuickBooks, a spreadsheet, vendor portals, PDFs, or email?
5. What is the current "open orders" list? If Kenny or Maclaine asks "what jobs are active," where do they look?
6. Which spreadsheets are used weekly, and what does each one track?
7. Where do art files and approved proofs live?
8. Who sends POs to printers/decorators, and how do they know the printer accepted the job?
9. Who checks vendor invoices against the customer order before QuickBooks/payment?
10. Who owns AR follow-up today, and how often does it happen?
11. What are the top 5 printer/decorator/vendor relationships that must not be disrupted?
12. What parts of quoting or supplier choice must remain Kenny-only?

## Recommended first move

Start with a **Backend Reality Walkthrough**:

1. Pick one recent order that involved a printer/decorator.
2. Open the customer email thread.
3. Open the QuickBooks customer/invoice/payment records.
4. Open the PO/vendor email/portal.
5. Open the proof/artwork files.
6. Open shipping/tracking.
7. Fill the required order record table.
8. Mark every blank field as a systems gap.

That one walkthrough will tell us whether the first build should be AR/reconciliation, open-order tracking, printer PO follow-up, or proof chasing.

