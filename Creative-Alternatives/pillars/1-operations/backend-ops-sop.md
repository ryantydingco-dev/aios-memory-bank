# Backend Ops SOP — Creative Alternatives

> Purpose: create a simple operating cadence across QuickBooks, email, spreadsheets, purchase orders, printers/decorators, AR, and reorders. This is the human-run version before deeper automation.

## Non-negotiables

- Customer, vendor, money, and public-facing actions stay human-approved.
- QuickBooks is the financial source of truth.
- The open-order tracker is the operational source of truth until QuickBooks can carry true job status.
- Every active order needs one internal job ID.
- If something only lives in Kenny's or Maclaine's head, mark it as a system gap.
- Do not change top vendor/printer workflows until Kenny confirms the relationship rules.

## Core files

- Command center workbook: `outputs/backend-ops-command-center-2026-07-05/Creative-Alternatives-Backend-Ops-Command-Center.xlsx`
- Backend ops run summary: `outputs/operations/backend-ops-run-2026-07-05/backend-ops-run-summary.md`
- Backend readiness dashboard: `outputs/operations/backend-readiness-dashboard-2026-07-05/backend-readiness-dashboard.md`
- Backend live session script: `outputs/operations/backend-session-script-2026-07-05/backend-live-session-script.md`
- Systems intake workbook: `outputs/backend-systems-intake-2026-07-05/Creative-Alternatives-Backend-Systems-Intake.xlsx`
- Backend answer intake: `context/import/backend-audit/2026-07-05/backend-answer-intake.csv`
- Backend answer summary: `outputs/operations/backend-answer-summary-2026-07-05/backend-answer-summary.md`
- First Ryan questions: `pillars/1-operations/backend-questions-for-ryan-now.md`
- Async request pack: `pillars/1-operations/backend-async-request-pack.md`
- Systems intake: `pillars/1-operations/backend-systems-intake.md`
- Artifact request pack: `pillars/1-operations/backend-artifact-request-pack.md`
- First automation specs: `pillars/1-operations/backend-first-automation-specs.md`
- Next session runbook: `pillars/1-operations/backend-next-session-runbook.md`
- QuickBooks export SOP: `pillars/1-operations/quickbooks-export-sop.md`
- QuickBooks export validation: `outputs/operations/quickbooks-export-validation-2026-07-05/quickbooks-export-validation.md`
- Email thread audit: `outputs/operations/email-thread-audit-2026-07-05/email-thread-audit.md`
- Checklist: `pillars/1-operations/backend-systems-audit-checklist.md`
- Gap map: `pillars/1-operations/backend-initial-gap-map.md`
- One-order walkthrough: `pillars/1-operations/backend-reality-walkthrough.md`
- Question pack: `pillars/1-operations/backend-discovery-questions.md`
- Generated packet: `outputs/operations/backend-audit-2026-07-05/backend-audit-report.md`
- Evidence audit: `outputs/operations/backend-evidence-audit-2026-07-05/backend-evidence-summary.md`
- Intake analysis: `outputs/operations/backend-intake-analysis-2026-07-05/backend-intake-analysis.md`
- PO/printer tracker packet: `outputs/operations/po-printer-tracker-2026-07-05/po-follow-up-list.md`
- Vendor workflow map: `outputs/operations/po-printer-tracker-2026-07-05/vendor-workflow-map.md`
- Daily action board: `outputs/operations/backend-audit-2026-07-05/backend-action-board.md`
- Starter trackers:
  - `pillars/1-operations/templates/system-inventory-template.csv`
  - `pillars/1-operations/templates/automation-backlog-template.csv`
  - `outputs/operations/backend-audit-2026-07-05/ar-action-tracker-starter.csv`
  - `outputs/operations/backend-audit-2026-07-05/vendor-master-starter.csv`
  - `outputs/operations/backend-audit-2026-07-05/backend-gap-register-starter.csv`
  - `outputs/operations/backend-audit-2026-07-05/open-order-tracker-starter.csv`
  - `pillars/1-operations/templates/open-order-tracker-template.csv`
  - `pillars/1-operations/templates/printer-po-tracker-template.csv`

## Daily operating loop

Run this in 10-15 minutes.

0. **Action board**
   - Open `outputs/backend-ops-command-center-2026-07-05/Creative-Alternatives-Backend-Ops-Command-Center.xlsx`.
   - Start on the Dashboard sheet.
   - Open `outputs/operations/backend-readiness-dashboard-2026-07-05/backend-readiness-dashboard.md`.
   - Open `outputs/operations/backend-audit-2026-07-05/backend-action-board.md`.
   - Use it to pick the day's AR, vendor, and walkthrough priorities.

1. **Open orders**
   - Look at the open-order tracker.
   - Sort by `next_action_due`, `needed_by_date`, and blank `current_status`.
   - Pick the top 5 jobs that need movement today.

2. **Printer/PO follow-up**
   - Look at the printer PO tracker.
   - Check rows where `po_confirmed` is blank or `vendor_promised_ship_date` is blank.
   - Follow up only after Kenny/Maclaine approve vendor-facing messages.

3. **Proofs**
   - Find proofs waiting on customer approval.
   - Draft reminders, but let the human sender approve.

4. **AR**
   - Check the AR action tracker.
   - Review overdue A-tier accounts first.
   - No generic collections tone for high-value accounts.

5. **End of day**
   - Every active row should have a next action, owner, and due date.

## Weekly operating loop

Run this once per week with Maclaine.

If you only do one command, run the full backend ops check cycle:

```bash
python3 pillars/1-operations/automations/backend_ops_runner/run_backend_ops_checks.py \
  --date 2026-07-05
```

Then open:

- `outputs/operations/backend-ops-run-2026-07-05/backend-ops-run-summary.md`
- `outputs/operations/backend-readiness-dashboard-2026-07-05/backend-readiness-dashboard.md`
- `outputs/operations/backend-session-script-2026-07-05/backend-live-session-script.md`

If Maclaine/Kenny cannot meet live, send `pillars/1-operations/backend-async-request-pack.md` instead.

1. If starting a new live evidence session, create the evidence folder:

```bash
python3 pillars/1-operations/automations/backend_evidence_scaffold/create_backend_evidence_scaffold.py
```

2. Export fresh QuickBooks reports using `pillars/1-operations/quickbooks-export-sop.md`:
   - A/R Aging Summary
   - Expenses by Vendor Summary
   - Sales by Customer Summary
   - Sales by Product/Service Summary
   - Customer Contact List

3. Replace the matching CSVs in `context/import/`.

4. Validate the dated QuickBooks exports before using them downstream:

```bash
python3 pillars/1-operations/automations/quickbooks_export_validator/validate_quickbooks_exports.py \
  --quickbooks-dir context/import/backend-audit/2026-07-05/quickbooks
```

5. Regenerate the backend audit packet:

```bash
python3 pillars/1-operations/automations/backend_audit_packet/generate_backend_audit_packet.py
```

6. Review:
   - top overdue AR rows
   - new 91+ accounts
   - top vendor spend
   - any vendor/printer not mapped yet
   - zero-COGS/product margin issue
   - contact rows missing email/phone

7. Update trackers and intake workbook:
   - fill or refresh `context/import/backend-audit/2026-07-05/backend-answer-intake.csv` if new answers were learned
   - use `record_backend_answer.py` to save one answer at a time when working from chat or a live call
   - rerun the backend answer compiler if intake answers changed
   - update `outputs/backend-systems-intake-2026-07-05/Creative-Alternatives-Backend-Systems-Intake.xlsx` if new source-of-truth answers were learned
   - update the system inventory if a source of truth changes
   - add or rescore automation candidates in the automation backlog
   - copy new AR priorities into the AR action tracker
   - update vendor master fields
   - add new gaps to the gap register
   - add live orders to the open-order tracker
   - reflect the updates in the command center workbook

8. Pick one improvement for the week:
   - AR worklist
   - payment reconciliation exception report
   - PO confirmation tracker
   - proof approval chaser
   - open-order morning brief

Use `outputs/operations/backend-answer-summary-2026-07-05/first-automation-readiness.csv` as the evidence gate before picking.

9. If email/order-thread evidence was added, rerun the email thread auditor:

```bash
python3 pillars/1-operations/automations/email_thread_auditor/audit_email_threads.py \
  --evidence-dir context/import/backend-audit/2026-07-05
```

10. If new evidence was added, rerun the evidence auditor:

```bash
python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py
```

11. If the gap register or automation backlog changed, rerun the intake analyzer:

```bash
python3 pillars/1-operations/automations/backend_intake_analyzer/analyze_backend_intake.py \
  --input-dir outputs/operations/backend-audit-2026-07-05
```

12. If PO/printer rows or vendor mapping changed, rerun the PO/printer tracker generator:

```bash
python3 pillars/1-operations/automations/po_printer_tracker/generate_po_printer_tracker.py \
  --input-dir outputs/operations/backend-audit-2026-07-05
```

13. Regenerate the readiness dashboard:

```bash
python3 pillars/1-operations/automations/backend_readiness_dashboard/generate_backend_readiness_dashboard.py \
  --date 2026-07-05
```

## First 5 live orders to map

Pick these intentionally:

- one normal apparel order
- one rush order
- one high-dollar customer order
- one order with a printer/decorator involved
- one order with payment or invoice confusion

For each, run `backend-reality-walkthrough.md` and add gaps to the gap register.

## Job ID convention

Recommended starter format:

`CA-YYYY-####`

Example:

`CA-2026-0001`

Use this ID in:

- email subject line
- open-order tracker
- PO/printer tracker
- proof/art file folder or file name
- QuickBooks memo/custom field if available
- shipping/tracking notes
- invoice memo if appropriate

Do not force the convention into live external communication until Kenny/Maclaine agree.

## Status vocabulary

Use these values in the open-order tracker:

- `Needs quote`
- `Waiting on customer info`
- `Waiting on customer approval`
- `Ready for PO`
- `PO sent`
- `Vendor confirmed`
- `In production`
- `Proof pending`
- `Proof approved`
- `Shipped`
- `Delivered`
- `Ready to invoice`
- `Invoiced`
- `Paid`
- `Blocked`

## Backend gap priority

Score each gap 1-5:

- Cash risk
- Customer risk
- Manual time
- Frequency
- Ease to fix

Priority:

`(cash risk + customer risk + manual time + frequency) x ease to fix`

Fix high-priority, high-ease gaps first.

## What not to automate yet

- Final quote pricing.
- Supplier/printer choice for unusual jobs.
- High-value customer collections messages.
- Vendor-facing messages to key suppliers.
- QuickBooks writes.
- Any customer-facing send without approval.

## First automation candidates

Based on current evidence, the first safe automation should be one of:

1. **AR action worklist**
   - Best if cash recovery is the immediate priority.

2. **Payment-to-invoice reconciliation exception report**
   - Best if Maclaine is still spending hours manually matching payments.

3. **PO/printer confirmation tracker**
   - Best if orders are late or status is unclear after POs go out.

4. **Open-order daily brief**
   - Best if the team cannot quickly answer "what is active and what is stuck?"

## Questions that unlock the next build

1. Does QuickBooks currently use estimates, POs, bills, projects, or invoices only?
2. Where is the active open-order list today?
3. Where do printer/vendor confirmations arrive?
4. Where are vendor costs captured before customer invoicing?
5. Where do approved proofs live?
6. Who owns AR follow-up today?
7. Which top vendors/printers require Kenny's personal relationship handling?
