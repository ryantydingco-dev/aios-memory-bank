# Backend Automation Build Plan — 2026-07-05

> Drafted from Ryan-provided system answers. This is the first build plan based on actual backend behavior, not assumptions. Version one stays read-only/draft-only for anything touching customers, vendors, money, or QuickBooks.

## Confirmed Source-Of-Truth Map

| Area | Current source | Confirmed behavior | Automation implication |
|---|---|---|---|
| Accounting | QuickBooks Online | CA uses invoices, purchase orders, and bills. Estimates, sales receipts, classes, projects, and custom fields are not confirmed. | Use QuickBooks Online exports/API read-only first. Do not assume project/job costing exists. |
| Order creation | QuickBooks Online | After customer approval, the first QuickBooks object is usually a purchase order for the merchandise/vendor source. | The PO can become the operational anchor, but it needs a customer/order context outside QuickBooks. |
| Vendor/job costs | QuickBooks Online | Vendor/printer costs are not tied to customer jobs/orders in QuickBooks. | Margin and vendor-cost automation needs a separate order ledger or job ID layer. |
| Bill/payment pain | QuickBooks Online + vendor statements | Bills paid on the spot or outside normal terms were not always marked paid in QuickBooks, forcing manual reconstruction and vendor calls. | First money-side automation should be a paid/unpaid vendor bill exception report, not writeback. |
| Order intake | Email, phone, text, website, repeat threads | New orders arrive through all channels. Before finalization, they live in email/text. | AIOS needs an intake/watch layer, but humans still decide when something becomes an order. |
| Email | Creative Alternatives email + AOL | Three active email addresses are involved: two CA addresses and one AOL address. Maclaine has access to all emails. | Start with read-only IMAP/search ingestion. No auto-sending. |
| Active order tracking | Google Sheets | Finalized orders are tracked in Google Sheets. Print shops update completion/tracking there. | Google Sheets is a core operating system, not a side artifact. Preserve it while building overlays. |
| PO sending | QuickBooks Online | Maclaine or Kenny sends POs through QuickBooks. | PO tracker should compare QuickBooks POs against email confirmations and sheet status. |
| Vendor confirmations | Kenny email | Vendor/printer confirmations arrive in Kenny's email. | Confirmation detection starts with Kenny inbox read-only ingestion. |
| Proofs/artwork | Artist, QuickBooks PO attachment, Kenny desktop | Artist creates proof, final proof is attached to PO in QuickBooks, Kenny may save locally. Kenny approves artwork. | Proof automation should check for final-proof evidence attached to the PO, not replace approval. |
| Shipping/tracking | Google Sheets + Kenny email | Print shops add tracking to sheets when on top of it; other vendors email tracking to Kenny. | Tracking monitor needs Sheets + email. |
| Invoicing | Maclaine cadence | Maclaine sends invoices every 15 days when due. | Daily brief can flag "ready to invoice"; human sends/approves. |
| Customer payments | QuickBooks link, ACH/card, checks | Most pay through QuickBooks link; checks are handled by Kenny. | Check payments remain human-reviewed. |
| Open orders | Diamond, Viking, random vendor sheets | Active open orders are spread across three sheets. | Build a unified open-order view without breaking underlying sheets. |
| Historical orders | Main order sheet since 1999 | This is the most important spreadsheet to preserve. | Treat as protected source data and use it for reorder mining later. |
| Reorders | Not actively tracked | No active reorder flag/list exists today. | Reorder engine is valuable but should come after active-order/bill controls. |
| Pricing rules | Desktop PDFs/Word docs | Three print shops send annual pricing docs saved on desktops. | Pricing docs should be collected into AIOS as reference files before any pricing automation. |
| Guardrails | Human approval | Automation should not touch anything without approval. All customers require personal handling from Kenny. | V1 outputs are dashboards, exception lists, and drafts only. |

## Recommended Build Sequence

### 1. Open-Order Command Center

**Why first:** CA already runs finalized orders through Google Sheets, but the truth is split across Diamond, Viking, random vendor, and the historical master sheet.

**Inputs needed:**

- Read access to the Diamond sheet.
- Read access to the Viking sheet.
- Read access to the random vendor sheet.
- Read access or export of the historical master sheet.
- Column headers from each sheet.

**V1 output:**

- Unified order list.
- Status by order: missing PO, waiting vendor/printer, waiting proof, waiting tracking, ready to invoice, invoiced, paid/closed.
- Owner and next action.
- Exception list for rows missing customer, vendor, PO, due date, tracking, or invoice status.

**Human rule:** AIOS reports and drafts next actions only. It does not edit the source sheets in v1 unless explicitly approved.

### 2. PO/Printer Confirmation Tracker

**Why second:** POs go out through QuickBooks, confirmations come back to Kenny email, and printers update Google Sheets. That is the biggest handoff gap.

**Inputs needed:**

- QuickBooks PO export or read-only API access.
- Kenny email read-only access.
- The three active Google Sheets.
- One complete printer/decorator order packet.

**V1 output:**

- POs sent but not confirmed.
- Confirmed jobs missing due date/tracking.
- Jobs with tracking in email but missing in the sheet.
- Jobs with final proof missing or unclear.
- Follow-up draft rows marked `Needs approval`.

**Human rule:** No vendor follow-up is sent automatically.

### 3. Vendor Bill Paid/Unpaid Control

**Why third:** This directly targets the 8-hour reconstruction problem.

**Inputs needed:**

- QuickBooks bills export.
- QuickBooks paid bills/payment export.
- Vendor statements for vendors with disputed/unclear balances.
- Rule for bills paid on the spot.

**V1 output:**

- Bills marked unpaid in QuickBooks but likely paid.
- Bills paid outside normal terms that need QuickBooks status review.
- Vendors needing statement reconciliation.
- Missing bill/payment reference list.

**Human rule:** AIOS never marks a bill paid. It produces a review queue for Kenny/Maclaine.

### 4. Read-Only Email Intake Index

**Why fourth:** Orders start in email/text before they become real orders. AIOS needs visibility without changing how Kenny sells.

**Inputs needed:**

- AOL read-only IMAP/app password or approved email export.
- Read-only access to both Creative Alternatives inboxes.
- Known vendor/customer sender list.
- Search examples for orders, proofs, confirmations, tracking, invoices.

**V1 output:**

- Potential order requests not yet in sheets.
- Vendor confirmations not tied to an open PO.
- Tracking emails not copied into a sheet.
- Proof approval emails not tied to a PO.

**Human rule:** No auto-labeling or auto-sending in v1.

### 5. Reorder Opportunity List

**Why later:** The 1999 master order sheet is a goldmine, but active-order and payment controls come first.

**Inputs needed:**

- Historical master sheet export/read access.
- Customer names and historical order dates.
- Product/category fields if available.
- Seasonal/customer rules from Kenny.

**V1 output:**

- Customers likely due for reorder.
- Last order/date/product.
- Suggested relationship-safe next step.
- Kenny-personal-handling flag.

**Human rule:** Every outreach is drafted for approval.

## Integration Strategy

### QuickBooks Online

Start with exports. Move to the QuickBooks Online API after fields and workflows are confirmed.

V1 needs read-only:

- purchase orders
- bills
- invoices
- payments/deposits
- open invoices
- unpaid bills

No writes in v1.

### AOL / Creative Alternatives Email

Use read-only IMAP first. Because there are no shared labels/folders, AIOS should search and index by sender, subject, dates, attachments, PO numbers, tracking numbers, and vendor names.

Do not auto-send, delete, move, or label messages in v1.

### Google Sheets

Treat the existing sheets as live operating sources. AIOS should read them first and generate a consolidated command center.

V1 should not rewrite the 1999 master sheet.

### Vendor APIs

Use vendor APIs only after the internal order ledger is stable.

Priority:

1. S&S Activewear API if credentials are available.
2. SanMar web services/API access.
3. Other vendor APIs or PromoStandards where available.
4. Email/CSV fallback for vendors without usable APIs.

Do not start with vendor order submission. Start with inventory/status/tracking lookups and exception flags.

## Minimum Evidence Needed Before First Real Build

1. Pick one recent printer/decorator order as `order-01`.
2. Save original customer request.
3. Save quote/estimate or order details.
4. Save customer/proof approval.
5. Save QuickBooks PO.
6. Save vendor/printer confirmation from Kenny email.
7. Save final proof/artwork evidence.
8. Save Google Sheet row/status for that order.
9. Save tracking/delivery evidence.
10. Save invoice/payment status.

Save these under:

`context/import/backend-audit/2026-07-05/orders/order-01/`

## First Build Decision

The current best first build is:

**Open-Order Command Center + PO/Printer Confirmation Tracker**

Reason: It uses the systems CA already trusts, reduces status confusion, does not touch customers/vendors/money, and creates the order ledger needed for every later automation.

The first money-side follow-up should be:

**Vendor Bill Paid/Unpaid Control**

Reason: It attacks the 8-hour bill status reconstruction issue without writing back to QuickBooks.

## Open Questions

- Which specific recent order should become `order-01`?
- What are the exact column headers in the Diamond, Viking, random vendor, Todd, and historical master sheets?
- Are the Google Sheets owned by CA, Kenny, Maclaine, or the print shops?
- Can AIOS get read-only Google Sheets access?
- Can AIOS get QuickBooks Online read-only access, or will v1 rely on CSV exports?
- Can AIOS get AOL/CA email read-only access through IMAP/app passwords?
- Which vendors/printers are safe to monitor automatically but never contact automatically?
- Which pricing PDFs/Word docs should be copied into `context/import/` first?

## Build-In-Public Angle

Episode angle: "The family business did not have one broken system. It had five working systems that did not talk to each other."

Proof moment:

- Show QuickBooks as accounting truth.
- Show Google Sheets as production truth.
- Show email as confirmation truth.
- Show desktop pricing docs as vendor rule truth.
- Then show AIOS as the first layer that reads across all of them without disrupting Kenny.
