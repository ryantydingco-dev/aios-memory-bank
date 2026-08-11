# Backend Next Session Runbook — Creative Alternatives

> Purpose: give Ryan a concrete 90-minute session plan to turn backend chaos into evidence, gaps, and the first automation decision.

## Before the session

Open:

- `outputs/backend-systems-intake-2026-07-05/Creative-Alternatives-Backend-Systems-Intake.xlsx`
- `context/import/backend-audit/2026-07-05/backend-answer-intake.csv`
- `pillars/1-operations/backend-artifact-request-pack.md`
- `pillars/1-operations/backend-reality-walkthrough.md`
- `pillars/1-operations/backend-first-automation-specs.md`

Create a dated evidence folder:

`context/import/backend-audit/YYYY-MM-DD/`

Create or refresh the session intake:

```bash
python3 pillars/1-operations/automations/backend_session_intake/create_backend_session_intake.py \
  --date 2026-07-05
```

## 0-10 minutes: align on the rules

Say this plainly:

> We are not replacing Kenny's judgment. We are finding where information gets lost between QuickBooks, email, spreadsheets, POs, printers, proofs, shipping, invoices, and payments. Anything customer-facing, vendor-facing, or money-facing stays human-approved.

Confirm:

- QuickBooks is the financial source of truth unless proven otherwise.
- The open-order tracker is temporary operational truth until a better source exists.
- If the answer is "Kenny knows," that is valid, but it gets logged as a system dependency.

## 10-25 minutes: answer Ryan Questions

Use the `Ryan Questions` tab and/or fill:

`context/import/backend-audit/2026-07-05/backend-answer-intake.csv`

Minimum answers needed:

1. QuickBooks version.
2. QuickBooks transaction types used.
3. What gets created first when a customer says yes.
4. Where new orders come in.
5. Whether there is one active open-order list.
6. How POs are sent.
7. Where vendor confirmations arrive.
8. Where approved proofs live.
9. Which spreadsheets run the business weekly.

Mark each row:

- `Answered`
- `Needs evidence`
- `Unknown`
- `Blocked`

Or record answers by question ID as they come in:

```bash
python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py \
  --date 2026-07-05 \
  --question Q001 \
  --answer "QuickBooks Online" \
  --source-system "QuickBooks Online"
```

After the session, run:

```bash
python3 pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py \
  --input context/import/backend-audit/2026-07-05/backend-answer-intake.csv \
  --output-dir outputs/operations/backend-answer-summary-2026-07-05
```

Review:

- `outputs/operations/backend-answer-summary-2026-07-05/backend-answer-summary.md`
- `outputs/operations/backend-answer-summary-2026-07-05/gap-register-from-answers.csv`
- `outputs/operations/backend-answer-summary-2026-07-05/first-automation-readiness.csv`

## 25-45 minutes: export or request QuickBooks evidence

Use `backend-artifact-request-pack.md`.

Must-have exports:

- A/R Aging Summary
- Open invoice detail
- invoice detail for one representative month
- payments/deposits detail for the same month
- expenses by vendor
- customer contact list
- open purchase orders, if QuickBooks POs are used
- unpaid bills/vendor bills, if vendor bills are used

If a report cannot be exported, write that in the workbook. Do not silently skip it.

## 45-75 minutes: trace one live order

Use `Five Orders` tab and `backend-reality-walkthrough.md`.

Pick one order with printer/decorator involvement if possible.

For each step, ask:

- Where is the evidence?
- Who owns it?
- Can Maclaine access it?
- Does it connect to the same customer/order/job ID?
- What happens if the owner is unavailable?

Mark `Pass`, `Fail`, or `Unknown` for:

- customer request
- quote
- approval/proof
- PO/vendor order
- production confirmation
- shipping/tracking
- invoice
- payment

Every `Fail` becomes a gap.

## 75-85 minutes: score gaps

Use `Gap Register`.

Score each gap 1-5:

- cash risk
- customer risk
- manual time
- frequency
- ease

The workbook calculates priority:

`(cash risk + customer risk + manual time + frequency) x ease`

## 85-90 minutes: choose the likely first automation

Use `backend-first-automation-specs.md`.

Choose the first build only if the inputs are available:

- AR action worklist
- payment-to-invoice reconciliation exception report
- PO/printer confirmation tracker
- open-order daily brief
- reorder-due rescue list

If no inputs are available, the next action is not "build." It is "collect missing evidence."

## After the session

Save:

- updated intake workbook
- exported QuickBooks reports
- one-order packet evidence
- any screenshots
- notes from Kenny/Maclaine

Then update:

- `pillars/1-operations/ops-discovery.md`
- `pillars/1-operations/backend-initial-gap-map.md`
- `pillars/1-operations/backend-ops-sop.md` if the source-of-truth map changed
- generated source-map and gap-register rows from `outputs/operations/backend-answer-summary-2026-07-05/`

## Session output

The session is successful if we leave with:

- at least 10 of 15 Ryan Questions answered
- at least 1 real order traced
- at least 3 real gaps scored
- one first automation selected or a clear evidence request blocking the selection
