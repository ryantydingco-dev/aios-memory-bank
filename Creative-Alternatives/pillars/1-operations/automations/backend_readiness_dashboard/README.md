# Backend Readiness Dashboard

Aggregates the current backend audit outputs into one operator-facing readiness report.

## Inputs

For a given date, this reads:

- `outputs/operations/backend-answer-summary-YYYY-MM-DD/unanswered-backend-questions.csv`
- `outputs/operations/backend-answer-summary-YYYY-MM-DD/first-automation-readiness.csv`
- `outputs/operations/quickbooks-export-validation-YYYY-MM-DD/quickbooks-export-validation.csv`
- `outputs/operations/email-thread-audit-YYYY-MM-DD/email-thread-packet-coverage.csv`
- `outputs/operations/backend-evidence-audit-YYYY-MM-DD/order-packet-coverage.csv`
- `outputs/operations/backend-intake-analysis-YYYY-MM-DD/backend-automation-recommendation.csv`
- `outputs/operations/po-printer-tracker-YYYY-MM-DD/po-exceptions.csv`

## Run

```bash
python3 pillars/1-operations/automations/backend_readiness_dashboard/generate_backend_readiness_dashboard.py \
  --date 2026-07-05
```

## Outputs

Writes:

`outputs/operations/backend-readiness-dashboard-YYYY-MM-DD/`

Files:

- `backend-readiness-dashboard.md`
- `backend-system-health.csv`
- `backend-next-actions.csv`
- `backend-active-blockers.csv`

## Purpose

Use this as the single "what do we do next?" report for backend operations. It consolidates:

- unanswered backend questions
- missing QuickBooks exports
- missing email/order thread evidence
- missing order packet artifacts
- PO/printer tracker exceptions
- first automation readiness

## Guardrails

- Read-only aggregator.
- Does not connect to QuickBooks, email, vendors, or customers.
- Missing evidence is treated as a blocker, not permission to guess.
