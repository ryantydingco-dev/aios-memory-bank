# Backend Ops Runner

Runs the local backend operations check cycle in one command.

## Run

```bash
python3 pillars/1-operations/automations/backend_ops_runner/run_backend_ops_checks.py \
  --date 2026-07-05
```

## What It Refreshes

- Session answer intake
- Backend answer summary
- QuickBooks export validation
- Email thread audit
- Backend evidence audit
- Backend audit packet
- Backend intake analysis
- PO/printer tracker packet
- Backend readiness dashboard
- Live backend session script

## Outputs

`outputs/operations/backend-ops-run-YYYY-MM-DD/`

Files:

- `backend-ops-run-summary.md`
- `backend-ops-run-log.md`

The refreshed live session script is written to:

`outputs/operations/backend-session-script-YYYY-MM-DD/backend-live-session-script.md`

## Guardrails

- Read-only against QuickBooks, email, customers, and vendors.
- Only writes local reports, trackers, and summaries.
- Passing runner checks do not mean the backend is build-ready; the readiness dashboard is the source of truth for blockers.
