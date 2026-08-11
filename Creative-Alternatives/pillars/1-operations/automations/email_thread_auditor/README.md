# Email Thread Auditor

Scans saved email/order-thread evidence and reports whether each order packet contains the operational signals needed for a backend walkthrough.

## Inputs

Default folder:

`context/import/backend-audit/YYYY-MM-DD/`

It scans:

- `email-threads/`
- `orders/order-01/` through `orders/order-05/`

Supported text evidence:

- `.eml`
- `.txt`
- `.md`
- `.html`
- `.csv`

Screenshots, PDFs, and vendor portal exports can still be saved as evidence, but this auditor will mark them as not text-scannable unless a text summary is included.

## Run

```bash
python3 pillars/1-operations/automations/email_thread_auditor/audit_email_threads.py
```

Or point it at a dated evidence folder:

```bash
python3 pillars/1-operations/automations/email_thread_auditor/audit_email_threads.py \
  --evidence-dir context/import/backend-audit/2026-07-05
```

## Outputs

Writes a dated folder under:

`outputs/operations/email-thread-audit-YYYY-MM-DD/`

Files:

- `email-thread-audit.md`
- `email-thread-detail.csv`
- `email-thread-packet-coverage.csv`

## Signals Checked

- Customer request
- Product details
- Quantity / size / color details
- Needed-by / event date
- Customer approval
- Proof / artwork
- Vendor / PO handoff
- Shipping / tracking
- Invoice / payment
- Internal job/order ID
- Attachment / file reference

## Purpose

Use this before deciding that email is "mapped." The report shows whether email evidence can answer the operational questions that currently slow the team down:

- What did the customer ask for?
- What was approved?
- What needs to be ordered?
- Which vendor/printer has the job?
- Has it shipped?
- Has it been invoiced or paid?

## Guardrails

- Read-only: no inbox connection and no email sends.
- Missing signals are workflow prompts, not accusations.
- Customer/vendor/money-facing actions still require human approval.
