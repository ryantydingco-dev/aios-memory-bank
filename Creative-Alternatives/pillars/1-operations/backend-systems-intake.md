# Backend Systems Intake — Creative Alternatives

> Use this before building deeper automations. The goal is to turn Ryan/Kenny/Maclaine's operational reality into a source-of-truth map, a gap register, and a ranked automation backlog.

## Outcome

At the end of this intake, we should know:

1. Which system owns each piece of operational data.
2. Where QuickBooks, email, spreadsheets, POs, printers, proofs, shipping, invoices, and payments disagree.
3. Which gaps cost cash, time, customer trust, or revenue opportunities.
4. Which automation should be built first.

## Ground rules

- Do not automate from memory. Trace real orders.
- QuickBooks is the financial source of truth unless proven otherwise.
- The open-order tracker is the operational source of truth until a better one exists.
- Human approval is required for customer-facing, vendor-facing, money-facing, or public actions.
- If Kenny's judgment is the current system, document the judgment before replacing anything around it.

## Meeting 1: Maclaine backend reality

Target time: 60 minutes.

### What we need to answer

| Area | Question | Evidence to capture | Gap if unclear |
|---|---|---|---|
| QuickBooks | What transaction types are used: estimates, invoices, sales receipts, POs, bills, projects? | Screenshot or report export | We cannot know where orders actually live |
| QuickBooks | When a customer says yes, what gets created first? | One recent order example | Order intake trigger is unclear |
| QuickBooks | Are vendor costs tied to customer jobs? | Sample bill/expense/invoice flow | Margin and reconciliation will stay manual |
| Payments | How are customer payments matched to invoices? | One paid invoice and payment example | Reconciliation exception report cannot be trusted |
| AR | Who follows up on unpaid invoices, and how often? | Current AR process or notes | Cash worklist has no owner |
| Email | Which inboxes receive customer orders, approvals, and vendor confirmations? | Inbox/folder/label screenshot | Email remains hidden order system |
| Spreadsheets | Which spreadsheets are opened weekly? | Links/files/screenshots | Shadow systems remain unmapped |
| Proofs | Where is approval recorded? | One approved proof thread/file | Printer may receive wrong or unapproved art |

### Maclaine output

- Fill the dated session intake, e.g. `context/import/backend-audit/2026-07-05/backend-answer-intake.csv`.
- Run `automations/backend_answer_compiler/compile_backend_answers.py`.
- Fill `templates/system-inventory-template.csv`.
- Add any found gaps to `templates/backend-gap-register-template.csv`.
- Mark one 8-hour reconciliation example as a baseline if still representative.

## Meeting 2: Kenny relationship and judgment map

Target time: 45-60 minutes.

### What we need to answer

| Area | Question | Evidence to capture | Gap if unclear |
|---|---|---|---|
| Quote judgment | How does Kenny decide price and supplier? | One recent quote example | Quote automation will be unsafe |
| Vendor trust | Which vendors/printers are relationship-sensitive? | Top vendor list with Kenny notes | Automation may disrupt good relationships |
| Risk | What makes a job likely to go wrong? | 2-3 messy job examples | Ops alerts will miss real risk |
| Customers | Which customers always need personal handling? | A-tier customer list | AR/reorder outreach tone may be wrong |
| Boundaries | What should Ryan not change without asking? | Written do-not-change list | Trust risk |

### Kenny output

- Fill relationship fields in `templates/vendor-master-template.csv`.
- Add do-not-automate rules to `context/operators-code.md`.
- Tag top customers/vendors that need personal handling.

## Meeting 3: Five-order walkthrough

Target time: 90 minutes.

Pick five orders:

- one normal apparel order
- one rush order
- one high-dollar customer order
- one printer/decorator order
- one order with invoice, payment, or AR confusion

For each order, capture:

| Step | What to find | Pass/fail test |
|---|---|---|
| Intake | Original customer request | Can we find what the customer asked for in under 2 minutes? |
| Quote | Quote/price sent | Can we see what was promised and by whom? |
| Approval | Customer yes/proof approval | Can we prove the customer approved it? |
| PO/vendor | PO or vendor order | Does it reference the same customer/job/order? |
| Production | Vendor confirmation/status | Can we tell whether the vendor accepted the job? |
| Shipping | Tracking/delivery info | Can we answer "where is it?" without searching multiple places? |
| Invoice | Customer invoice | Does invoice match quote/order reality? |
| Payment | Payment/application status | Can we tell whether it is paid and matched correctly? |

Use `backend-reality-walkthrough.md` for the detailed worksheet.

## Source-of-truth map

Fill this for each data type.

| Data | Current source | Backup source | Owner | Reliability | Notes |
|---|---|---|---|---|---|
| Customer contact | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Customer request | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Quote | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Open order status | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| PO/vendor order | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Vendor confirmation | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Approved proof | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Tracking | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Customer invoice | QuickBooks `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Customer payment | QuickBooks `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Vendor cost | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |
| Reorder trigger | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | |

Reliability values:

- Trusted
- Mostly trusted
- Manual/fragile
- Unknown
- Conflicting

## Gap scoring rubric

Score each gap 1-5.

| Score | Cash risk | Customer risk | Manual time | Frequency | Ease |
|---:|---|---|---|---|---|
| 1 | No cash impact | Internal annoyance only | Minutes/month | Rare | Hard |
| 3 | Could delay payment or margin clarity | Could cause status confusion | Hours/month | Monthly | Moderate |
| 5 | Direct collections/revenue/margin risk | Could hurt relationship or delivery promise | Hours/week | Weekly/daily | Easy |

Priority formula:

`(cash risk + customer risk + manual time + frequency) x ease`

Do the highest priority gap that is safe, visible, and human-approved.

## Automation decision tree

Use this after the three meetings:

1. If AR ownership/cadence is weak and past-due dollars remain high, build the **AR action worklist** first.
2. If payments are being manually matched for hours, build the **payment-to-invoice reconciliation exception report** first.
3. If nobody can answer open-order status quickly, build the **open-order daily brief** first.
4. If printer confirmations are scattered or late, build the **PO/printer confirmation tracker** first.
5. If reorder timing is memory-based, build the **reorder-due rescue list** after the cash/time fire is stable.
6. Do not build quote automation until Kenny's pricing and supplier-choice rules are documented.

## First automation backlog fields

Use `templates/automation-backlog-template.csv`.

Required fields:

- automation_name
- problem
- workflow_area
- current_owner
- current_systems
- baseline_time_or_cash_pain
- required_inputs
- output
- human_approval_required
- risk_level
- evidence_needed
- first_build_shape
- success_metric
- priority_score
- status

## Current best guess before live answers

The first build is most likely one of:

1. AR action worklist.
2. Payment-to-invoice reconciliation exception report.
3. PO/printer confirmation tracker.
4. Open-order daily brief.

The answer depends on whether the team's biggest live pain is cash collection, payment matching, late vendor uncertainty, or not knowing what is stuck.
