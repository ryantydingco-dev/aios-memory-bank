# Backend First Automation Specs — Creative Alternatives

> Use this after the backend systems intake. It turns the evidence into a build decision. Version one is always human-in-the-loop and read-only unless Kenny/Maclaine explicitly approve otherwise.

## Decision matrix

| If the evidence shows... | Build first | Why |
|---|---|---|
| Past-due AR is high, AR owner/cadence is unclear, and open invoice detail is available | AR action worklist | fastest cash visibility and trust-building win |
| Payment matching is still taking hours and invoice/payment exports are available | Payment-to-invoice reconciliation exception report | directly attacks the known 8-hour manual pain |
| POs/vendor confirmations are scattered and five printer/decorator packets show missing status | PO/printer confirmation tracker | prevents late jobs and vendor-status confusion |
| No one can answer "what is active and stuck?" within minutes | Open-order daily brief | creates operational visibility before deeper automation |
| Reorders depend mostly on memory, but backend cash/order chaos is stable | Reorder-due rescue list | protects repeat revenue after the back office stops leaking time |

## Shared rules for every first build

- No QuickBooks writes in v1.
- No customer/vendor sends in v1.
- Every recommendation must include the source file/report it came from.
- Any uncertain match or recommendation must be flagged, not guessed.
- Human approval is required for customer, vendor, money, and public-facing actions.
- The output must be useful to Maclaine without Ryan explaining every line.

## Spec 1: AR action worklist

### Problem

Creative Alternatives has meaningful open AR and past-due balances. The team needs a short, relationship-safe worklist instead of a giant aging report.

### Inputs

- `context/import/qb_ar_aging.csv`
- open invoice detail export `[NEEDED]`
- customer sales/value export
- customer relationship notes from Kenny/Maclaine
- last-contact notes if they exist

### Output

`outputs/operations/ar-worklist-YYYY-MM-DD/`

Files:

- `ar-worklist.md`
- `ar-worklist.csv`
- `ar-message-drafts.md`
- `ar-exceptions.csv`

### Worklist columns

- customer
- invoice number
- invoice date
- due date
- aging bucket
- amount open
- customer tier
- relationship risk
- recommended channel
- recommended tone
- source report
- next action owner
- draft status
- notes

### Logic

Prioritize by:

`amount open x aging severity x customer value adjustment`

Then apply relationship guardrails:

- A-tier and 60+ days: phone-first or personal email, no generic collections language.
- A-tier 90+: Kenny/Maclaine personal handling.
- B-tier 30+: friendly reminder with statement.
- C-tier 60+: firmer standardized reminder, still human-approved in v1.

### Acceptance criteria

- Produces a top 10 action list.
- Flags accounts needing personal handling.
- Does not invent invoice details.
- Every row cites a source export.
- Drafts are clearly marked `Needs human approval`.
- Maclaine can mark each row as approved, sent, paid, disputed, or hold.

### Not in v1

- Auto-send reminders.
- QuickBooks updates.
- Late-fee logic.
- Bad-debt decisions.

## Spec 2: Payment-to-invoice reconciliation exception report

### Problem

Kenny/Maclaine spent about 8 hours manually matching payments/deposits to open invoices. The system should do the easy matching and leave only exceptions for human review.

### Inputs

- invoice detail export for one representative month
- payments/deposits detail export for the same month
- current open invoice export
- any bank/deposit reference notes safe to use

### Output

`outputs/operations/reconciliation-YYYY-MM-DD/`

Files:

- `reconciliation-summary.md`
- `matched-payments.csv`
- `reconciliation-exceptions.csv`
- `review-checklist.md`

### Matching logic

Start conservative:

1. exact invoice reference match
2. exact customer + amount match
3. customer + amount + near-date match
4. one payment to multiple invoices for same customer
5. partial payment match
6. unmatched payment or invoice goes to exceptions

Every match gets a confidence value:

- High: exact reference or exact customer/amount/link.
- Medium: likely customer/amount/date match.
- Low: plausible but needs human review.
- Exception: do not apply without review.

### Acceptance criteria

- Separates high-confidence matches from exceptions.
- Handles partial payments and one-payment-to-many-invoices cases.
- Never forces uncertain matches.
- Summarizes total invoiced, total matched, total unmatched, and exception count.
- Saves time against the 8-hour baseline.

### Not in v1

- QuickBooks writeback.
- Bank account changes.
- Automatic deposit categorization.
- Vendor bill payment.

## Spec 3: PO/printer confirmation tracker

### Problem

After an order is approved, vendor/printer status may be scattered across email, portals, PDFs, or memory. The team needs to know whether a PO was sent, confirmed, priced, scheduled, shipped, and invoiced.

### Inputs

- five printer/decorator order packets
- top vendor/printer map
- sample PO/vendor order
- vendor confirmation emails/screenshots
- approved proof/art file link
- tracking/invoice examples

### Output

`outputs/operations/po-printer-tracker-YYYY-MM-DD/`

Files:

- `po-printer-tracker.csv`
- `po-follow-up-list.md`
- `vendor-workflow-map.md`
- `po-exceptions.csv`

### Tracker columns

- internal job ID
- customer
- vendor/printer
- PO/order number
- sent date
- sent method
- confirmed yes/no
- price confirmed yes/no
- production date
- promised ship date
- tracking number
- vendor invoice received
- vendor invoice matches PO
- approved proof link
- next follow-up
- owner
- status
- notes

### Acceptance criteria

- Every tracked order has a next follow-up owner/date.
- Any missing confirmation is visible.
- Any missing final proof link is visible.
- Top vendors are marked `do not disrupt`, `review with Kenny`, or `safe to systematize`.
- No vendor-facing message is sent automatically.

### Not in v1

- Portal automation.
- Supplier choice automation.
- Automated vendor emails.
- Price negotiation.

## Spec 4: Open-order daily brief

### Problem

If active orders live across email, QuickBooks, spreadsheets, vendor portals, and memory, the team needs one daily view of what is active and stuck.

### Inputs

- open-order tracker
- five live order walkthroughs
- proof status
- PO/vendor status
- shipping/tracking status
- invoice/payment status

### Output

`outputs/operations/open-order-brief-YYYY-MM-DD.md`

Sections:

- top 5 stuck orders
- orders needing customer approval
- POs needing vendor/printer confirmation
- orders at shipping/tracking risk
- orders ready to invoice
- AR/payment issues blocking closure
- questions for Kenny/Maclaine

### Acceptance criteria

- Brief fits on one screen.
- Every action has owner, next step, and due date.
- Stuck reasons use a controlled status vocabulary.
- Anything unknown is marked as a gap.
- No customer/vendor-facing action is sent automatically.

### Not in v1

- Full project management replacement.
- Automated email parsing.
- QuickBooks writeback.
- Vendor portal scraping.

## Spec 5: Reorder-due rescue list

### Problem

Repeat customers may not be followed up before their buying window, especially if reorder timing lives in memory.

### Inputs

- sales by customer history
- customer contact list
- prior product/order detail if available
- seasonality notes
- Kenny/Maclaine personal-handling rules

### Output

`outputs/operations/reorder-rescue-YYYY-MM-DD/`

Files:

- `reorder-rescue-list.csv`
- `reorder-call-list.md`
- `reorder-email-drafts.md`
- `reorder-exceptions.csv`

### Acceptance criteria

- Ranks customers by prior value and likely reorder timing.
- Marks A-tier accounts for personal call.
- Drafts are warm and relationship-first.
- Missing contacts are flagged.
- Every row ties to prior purchase evidence.

### Not in v1

- Auto-send.
- Automated discounts.
- Product recommendations without prior order evidence.

## First build recommendation rule

After the intake workbook is filled:

1. Count the highest-priority gaps in `Gap Register`.
2. Identify which spec addresses the most high-priority/easy gaps.
3. Confirm the required inputs for that spec exist.
4. If two builds tie, choose the one with the clearest baseline:
   - cash recovered
   - hours saved
   - stuck orders reduced
   - late confirmations reduced
5. Build only one first. Measure it. Then expand.

## Output quality bar

The first automation is not done until:

- it runs on real Creative Alternatives exports or order packets
- the output is saved under `outputs/operations/`
- a human can review it without extra explanation
- every external action remains approval-only
- the baseline improvement is measured
- the story angle is logged for build-in-public

