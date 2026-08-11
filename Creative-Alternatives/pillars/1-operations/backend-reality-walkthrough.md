# Backend Reality Walkthrough — One-Order Audit

> Use this with one real Creative Alternatives order. The goal is to find the first backend gap with evidence, not to redesign the company in one sitting.

## Setup

Pick one recent order that involved:

- a customer request
- a quote or invoice
- a printer/decorator/vendor
- artwork/proof approval
- shipping or delivery
- payment or open AR

Open these side by side:

- Customer email/thread/text/call notes
- QuickBooks customer record
- QuickBooks estimate/invoice/payment records
- Purchase order or vendor order record
- Printer/decorator email or portal
- Artwork/proof file location
- Shipping/tracking record
- Any spreadsheet used

## Session rules

- Do not solve while mapping. First capture what actually happens.
- If Kenny says "I just know," write that down as a founder-knowledge dependency.
- If Maclaine says "I have to search," write down what she searches and how long it takes.
- If a field is blank or uncertain, mark `[GAP]`.
- Anything customer/vendor/money-facing remains human-approved.

## Order identity

| Field | Answer |
|---|---|
| Internal job/order ID | |
| Customer | |
| Customer contact | |
| Order owner | |
| Request date | |
| Needed-by date | |
| Invoice number | |
| PO number(s) | |
| Vendor/printer/decorator | |
| Current status | |
| Next action | |

## 1. Customer request

Questions:

1. Where did the request come in?
2. Who saw it first?
3. What information was included?
4. What information had to be chased?
5. Was the request copied into any other tool?
6. Is there a standard order/job ID in the email subject?

Evidence to capture:

- Link/screenshot to original request.
- Missing information.
- Any duplicate retyping.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 2. Quote and pricing

Questions:

1. Was an estimate/quote created in QuickBooks?
2. Was a separate quote document/email created?
3. How were product costs/prices determined?
4. Did Kenny make a judgment call?
5. Is expected margin visible before the customer says yes?
6. Where is final quoted price stored?

Evidence to capture:

- Quote/estimate/invoice link.
- Pricing source.
- Any spreadsheet used.
- Margin visibility or lack of it.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 3. Customer approval / order intake

Questions:

1. How did the customer approve the order?
2. Was there a deposit, PO, written approval, or verbal yes?
3. Where is the approval saved?
4. Who moved the job into production?
5. What triggers vendor/printer ordering?

Evidence to capture:

- Approval email or note.
- Deposit/payment status.
- Any handoff message.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 4. Purchase order / printer-decorator handoff

Questions:

1. Who selected the vendor/printer/decorator?
2. Why that vendor?
3. How was the PO/order sent?
4. Was there a formal PO number?
5. Did the vendor confirm receipt?
6. Did the vendor confirm price?
7. Did the vendor confirm ship/production date?
8. Where are vendor confirmation and cost stored?
9. Is the vendor invoice tied back to this customer job?

Evidence to capture:

- PO or order email/PDF/portal screenshot.
- Vendor confirmation.
- Vendor cost.
- Expected date.
- Missing confirmation.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 5. Artwork and proof

Questions:

1. Where did artwork come from?
2. Where is the working file stored?
3. Who created the proof?
4. How was the proof sent to the customer?
5. How did the customer approve it?
6. Was the approved proof sent to the vendor/printer?
7. How do we know the vendor got the correct version?

Evidence to capture:

- Artwork file path/link.
- Proof file path/link.
- Approval evidence.
- Version naming.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 6. Production tracking

Questions:

1. Where is production status tracked?
2. Who checks whether the job is on schedule?
3. What happens if the vendor goes quiet?
4. Is there a follow-up date?
5. Does anyone get alerted before the needed-by date is at risk?

Evidence to capture:

- Tracker, email, portal, or memory.
- Current status.
- Next follow-up.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 7. Shipping and delivery

Questions:

1. Did the order ship to CA, the customer, or multiple addresses?
2. Who received the tracking number?
3. Where is tracking stored?
4. Was the customer notified?
5. Was delivery confirmed?
6. Did delivery confirmation trigger invoicing?

Evidence to capture:

- Tracking number.
- Delivery confirmation.
- Customer notification.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 8. Invoice, payment, and AR

Questions:

1. When was the invoice created?
2. What terms are on the invoice?
3. Has payment been received?
4. Was payment matched automatically or manually?
5. If still open, who follows up and when?
6. If payment was received, is the invoice marked paid?
7. Did vendor cost get matched before/after invoicing?

Evidence to capture:

- Invoice.
- Payment/deposit.
- Open balance.
- Vendor cost/bill.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## 9. Reorder and follow-up

Questions:

1. Is this customer likely to reorder?
2. When should they be contacted again?
3. Is that date stored anywhere?
4. Who owns the follow-up?
5. Can we easily retrieve "same as last year" details?

Evidence to capture:

- Prior order history.
- Reorder date/season.
- Follow-up owner.

Gap notes:

| Gap | Evidence | Impact |
|---|---|---|
| | | |

## End-of-session summary

| Question | Answer |
|---|---|
| Where did status become unclear first? | |
| What had to be searched manually? | |
| What was retyped between systems? | |
| What only Kenny knew? | |
| What only Maclaine knew? | |
| What could cause a late/wrong order? | |
| What could delay invoicing/payment? | |
| What could prevent a reorder? | |

## Score the gaps

Use 1-5 for each.

| Gap | Cash risk | Customer risk | Manual time | Frequency | Ease to fix | Priority |
|---|---:|---:|---:|---:|---:|---:|
| | | | | | | |

Priority formula:

`priority = (cash risk + customer risk + manual time + frequency) x ease to fix`

## Immediate next actions

1. Add each validated gap to `templates/backend-gap-register-template.csv`.
2. Add this order to `templates/open-order-tracker-template.csv`.
3. Add vendor/printer details to `templates/vendor-master-template.csv`.
4. If PO visibility is the first gap, start using `templates/printer-po-tracker-template.csv`.
5. If AR/payment visibility is the first gap, start using `templates/ar-action-tracker-template.csv`.

