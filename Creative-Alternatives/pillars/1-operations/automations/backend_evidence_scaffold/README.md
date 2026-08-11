# Backend Evidence Scaffold

Creates the dated evidence folder structure for a backend audit session.

## Run

```bash
python3 pillars/1-operations/automations/backend_evidence_scaffold/create_backend_evidence_scaffold.py
```

Or pass a specific date:

```bash
python3 pillars/1-operations/automations/backend_evidence_scaffold/create_backend_evidence_scaffold.py \
  --date 2026-07-05
```

## Output

Creates:

`context/import/backend-audit/YYYY-MM-DD/`

With:

- `quickbooks/`
- `email-threads/`
- `purchase-orders/`
- `proofs-artwork/`
- `shipping-tracking/`
- `spreadsheets/`
- `screenshots/`
- `notes/`
- `orders/order-01/` through `orders/order-05/`
- `MANIFEST.csv`
- `session-notes.md`
- `README.md`

## Next step

After adding evidence, run:

```bash
python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py \
  --evidence-dir context/import/backend-audit/YYYY-MM-DD
```

