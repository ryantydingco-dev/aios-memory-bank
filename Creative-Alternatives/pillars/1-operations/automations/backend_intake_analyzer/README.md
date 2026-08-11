# Backend Intake Analyzer

Turns a filled backend intake packet into a first-automation recommendation.

## Inputs

Point the script at a folder containing any of these CSVs:

- `backend-gap-register.csv`
- `backend-gap-register-starter.csv`
- `automation-backlog.csv`
- `automation-backlog-template.csv`
- `system-inventory.csv`
- `open-order-tracker-starter.csv`
- `ar-action-tracker-starter.csv`

The current generated audit packet already includes starter files under:

`outputs/operations/backend-audit-2026-07-05/`

## Run

```bash
python3 pillars/1-operations/automations/backend_intake_analyzer/analyze_backend_intake.py \
  --input-dir outputs/operations/backend-audit-2026-07-05
```

## Outputs

Writes a dated folder under `outputs/operations/backend-intake-analysis-YYYY-MM-DD/`:

- `backend-intake-analysis.md`
- `backend-gap-scores.csv`
- `backend-automation-recommendation.csv`
- `missing-evidence-checklist.md`

## Purpose

This does not replace Ryan/Maclaine/Kenny's judgment. It makes the evidence review faster by:

- scoring the gap register
- grouping gaps by likely automation
- flagging missing evidence
- recommending the safest first build

