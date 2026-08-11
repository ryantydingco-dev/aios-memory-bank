# Pillar 1 — Operations ◀ CURRENT FOCUS

Map how Creative Alternatives actually runs, then automate the biggest time-sinks.

> **Current governing roadmap:** `backend-modernization-roadmap.md`. It prioritizes existing and proposed work against response time, order quality, margin, and capacity. The detailed audit/build documents below remain supporting evidence and implementation references.

## Why this is first

You can't AI-transform a process you haven't mapped, and you can't safely scale customer volume onto a manual back office. The ops wins also earn Kenny's trust (give him hours back before changing how he sells) and produce the first hard proof for the YouTube build.

## The work

1. **Map** the real workflow with Kenny/Maclaine — run `/ops-audit`. Output grows in `ops-discovery.md`.
2. **Quantify** the pain: hours/week, errors, delays, dollars.
3. **Rank** automation candidates by *hours saved × ease to build*.
4. **Build** the top one or two, human-in-the-loop first. They land in `automations/`.
5. **Prove** the win against the baseline. That number is the content hook for Episode 1.

## Files

- `backend-modernization-roadmap.md` — current source of truth for outcome definitions, priority, safety gates, and the first 30-day operations sequence.
- `ops-discovery.md` — the audit: workflow map, time/pain log, ranked automation backlog.
- `backend-systems-audit-checklist.md` — tactical backend checklist for QuickBooks, email, spreadsheets, POs, printers/decorators, proofs, shipping, AR, and reorders.
- `backend-systems-intake.md` — meeting-by-meeting intake for Maclaine, Kenny, and five live orders; turns answers into a source-of-truth map and automation backlog.
- `backend-questions-for-ryan-now.md` — the first 15 questions Ryan should answer before we choose the first automation build.
- `backend-artifact-request-pack.md` — exact QuickBooks exports, email threads, PO examples, proof/artwork examples, shipping evidence, and spreadsheets to collect.
- `backend-async-request-pack.md` — short copy/paste request Ryan can send to Maclaine/Kenny to collect the minimum answers and evidence asynchronously.
- `backend-automation-build-plan-2026-07-05.md` — actual automation build sequence from Ryan-provided system answers: Open-Order Command Center, PO/printer tracker, vendor bill paid/unpaid control, email intake index, and reorder list.
- `backend-first-automation-specs.md` — build-ready specs and decision matrix for the first safe backend automation.
- `backend-next-session-runbook.md` — 90-minute session plan for Ryan/Maclaine/Kenny to answer questions, collect evidence, score gaps, and pick the first automation.
- `quickbooks-export-sop.md` — exact QuickBooks exports, filenames, fields, and save location needed for AR/reconciliation/PO automation.
- `backend-initial-gap-map.md` — evidence-backed starting gap map separating confirmed issues from likely gaps to validate.
- `backend-ops-sop.md` — daily/weekly backend operating cadence using the audit packet and trackers.
- `backend-reality-walkthrough.md` — one-order worksheet for tracing a real job through customer email, QuickBooks, PO/vendor, proof, shipping, invoice, and payment.
- `backend-discovery-questions.md` — question pack for Maclaine, Kenny, vendors/printers, QuickBooks, email, spreadsheets, proofs, shipping, AR, and reorders.
- `templates/backend-answer-intake-template.csv` — reusable structured answer capture template; live answers go in `context/import/backend-audit/YYYY-MM-DD/backend-answer-intake.csv`.
- `templates/` — CSV trackers for system inventory, automation backlog, open orders, printer POs, backend gaps, AR actions, spreadsheet inventory, and vendor master data.
- `automations/` — built automations (scripts, workflows, docs) land here.

## Backend readiness dashboard

Open this first during backend ops work. It aggregates the answer intake, QuickBooks validator, email auditor, evidence auditor, intake analyzer, and PO/printer exceptions into one operator readout:

```bash
python3 pillars/1-operations/automations/backend_readiness_dashboard/generate_backend_readiness_dashboard.py \
  --date 2026-07-05
```

Latest generated readiness dashboard:

- `outputs/operations/backend-readiness-dashboard-2026-07-05/backend-readiness-dashboard.md`
- `outputs/operations/backend-readiness-dashboard-2026-07-05/backend-next-actions.csv`
- `outputs/operations/backend-readiness-dashboard-2026-07-05/backend-active-blockers.csv`

## Backend ops runner

Refresh the full backend ops check cycle in one command:

```bash
python3 pillars/1-operations/automations/backend_ops_runner/run_backend_ops_checks.py \
  --date 2026-07-05
```

Latest generated run:

- `outputs/operations/backend-ops-run-2026-07-05/backend-ops-run-summary.md`
- `outputs/operations/backend-ops-run-2026-07-05/backend-ops-run-log.md`

## Backend live session script

Generate the facilitation script for the next Ryan/Maclaine/Kenny backend session:

```bash
python3 pillars/1-operations/automations/backend_session_script/generate_backend_session_script.py \
  --date 2026-07-05
```

Latest generated script:

- `outputs/operations/backend-session-script-2026-07-05/backend-live-session-script.md`
- `outputs/operations/backend-session-script-2026-07-05/backend-answer-capture-commands.md`
- `outputs/operations/backend-session-script-2026-07-05/backend-question-capture-sheet.csv`

If a live session is not practical, send:

- `pillars/1-operations/backend-async-request-pack.md`

## Backend answer compiler

Create the dated session intake, then compile Ryan/Maclaine/Kenny's answers into open questions, source map, gap register, and first-automation readiness:

```bash
python3 pillars/1-operations/automations/backend_session_intake/create_backend_session_intake.py \
  --date 2026-07-05
```

```bash
python3 pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py \
  --input context/import/backend-audit/2026-07-05/backend-answer-intake.csv
```

Latest generated answer summary:

- `outputs/operations/backend-answer-summary-2026-07-05/backend-answer-summary.md`
- `outputs/operations/backend-answer-summary-2026-07-05/unanswered-backend-questions.csv`
- `outputs/operations/backend-answer-summary-2026-07-05/first-automation-readiness.csv`

Record one answer without hand-editing the CSV:

```bash
python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py \
  --date 2026-07-05 \
  --question Q001 \
  --answer "QuickBooks Online" \
  --source-system "QuickBooks Online"
```

Import a markdown async response into the intake CSV:

```bash
python3 pillars/1-operations/automations/backend_session_intake/import_async_response.py \
  --date 2026-07-05
```

## QuickBooks export validator

Validate the next QuickBooks exports before relying on them for AR, reconciliation, PO/printer, margin, or quote-to-order automation:

```bash
python3 pillars/1-operations/automations/quickbooks_export_validator/validate_quickbooks_exports.py \
  --quickbooks-dir context/import/backend-audit/2026-07-05/quickbooks
```

Latest generated validation:

- `outputs/operations/quickbooks-export-validation-2026-07-05/quickbooks-export-validation.md`
- `outputs/operations/quickbooks-export-validation-2026-07-05/quickbooks-export-validation.csv`

## Email thread auditor

Audit saved email/order-thread evidence before deciding that customer requests, approvals, PO handoffs, tracking, and invoice/payment clues are mapped:

```bash
python3 pillars/1-operations/automations/email_thread_auditor/audit_email_threads.py \
  --evidence-dir context/import/backend-audit/2026-07-05
```

Latest generated email audit:

- `outputs/operations/email-thread-audit-2026-07-05/email-thread-audit.md`
- `outputs/operations/email-thread-audit-2026-07-05/email-thread-packet-coverage.csv`

## Backend audit packet

Generate an evidence-backed packet from the current QuickBooks exports:

```bash
python3 pillars/1-operations/automations/backend_audit_packet/generate_backend_audit_packet.py
```

Latest generated packet:

- `outputs/operations/backend-audit-2026-07-05/backend-audit-report.md`

## Backend intake analyzer

Analyze a filled gap register / intake packet and produce a first-automation recommendation:

```bash
python3 pillars/1-operations/automations/backend_intake_analyzer/analyze_backend_intake.py \
  --input-dir outputs/operations/backend-audit-2026-07-05
```

Latest generated intake analysis:

- `outputs/operations/backend-intake-analysis-2026-07-05/backend-intake-analysis.md`

## Backend evidence auditor

Scan the backend evidence folder and produce the current missing-evidence checklist:

```bash
python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py
```

Latest generated evidence audit:

- `outputs/operations/backend-evidence-audit-2026-07-05/backend-evidence-summary.md`
- `outputs/operations/backend-evidence-audit-2026-07-05/missing-evidence-report.md`

Create a dated backend evidence folder before a live walkthrough:

```bash
python3 pillars/1-operations/automations/backend_evidence_scaffold/create_backend_evidence_scaffold.py \
  --date 2026-07-05
```

Current evidence session folder:

- `context/import/backend-audit/2026-07-05/`

## PO/printer tracker generator

Generate the current review-only PO/printer tracker packet:

```bash
python3 pillars/1-operations/automations/po_printer_tracker/generate_po_printer_tracker.py \
  --input-dir outputs/operations/backend-audit-2026-07-05
```

Latest generated PO/printer packet:

- `outputs/operations/po-printer-tracker-2026-07-05/po-follow-up-list.md`
- `outputs/operations/po-printer-tracker-2026-07-05/vendor-workflow-map.md`

## Backend ops command center

The current working Excel command center is:

- `outputs/backend-ops-command-center-2026-07-05/Creative-Alternatives-Backend-Ops-Command-Center.xlsx`

The fillable backend systems intake workbook is:

- `outputs/backend-systems-intake-2026-07-05/Creative-Alternatives-Backend-Systems-Intake.xlsx`

The command center rolls the generated audit packet into one daily operating workbook:

- Dashboard
- AR Actions
- Open Orders
- Vendors
- Gap Register
- Top Customers
- Top Products
- Top Vendors
- AR Priority
- Metrics

Use the command center as the first human-in-the-loop operating surface. Use the intake workbook to map the actual QuickBooks, email, PO, proof, and vendor workflows before deeper automation.

## Definition of done (first cycle)

CA's core workflow is documented, the top time-sinks are quantified, and at least one automation is live and saving Kenny a named number of hours per week.
