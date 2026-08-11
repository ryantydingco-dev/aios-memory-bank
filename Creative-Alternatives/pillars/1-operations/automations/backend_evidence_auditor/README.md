# Backend Evidence Auditor

Scans backend audit evidence and reports what is present versus missing before the first automation is trusted.

## Inputs

Default evidence folder:

`context/import/backend-audit/`

The auditor also checks existing QuickBooks starter exports in:

`context/import/`

## Run

```bash
python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py
```

Or point it at a dated evidence folder:

```bash
python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py \
  --evidence-dir context/import/backend-audit/2026-07-05
```

## Outputs

Writes a dated folder under:

`outputs/operations/backend-evidence-audit-YYYY-MM-DD/`

Files:

- `backend-evidence-summary.md`
- `evidence-inventory.csv`
- `missing-evidence-report.md`
- `order-packet-coverage.csv`

## Purpose

Use this before choosing or running the first real backend automation. It tells us:

- which QuickBooks exports exist
- which order-packet artifacts are missing
- whether PO/printer evidence is complete enough
- whether AR/reconciliation inputs are present
- what Ryan/Maclaine/Kenny need to collect next

