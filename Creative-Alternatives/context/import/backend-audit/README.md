# Backend Audit Evidence Drop

Use this folder for live backend walkthrough evidence.

Recommended structure:

```text
context/import/backend-audit/YYYY-MM-DD/
  quickbooks/
  email-threads/
  purchase-orders/
  proofs-artwork/
  shipping-tracking/
  spreadsheets/
  screenshots/
  notes/
```

Evidence to collect is listed in:

`pillars/1-operations/backend-artifact-request-pack.md`

Create a dated folder structure with:

```bash
python3 pillars/1-operations/automations/backend_evidence_scaffold/create_backend_evidence_scaffold.py
```

After adding evidence, run:

```bash
python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py
```

The latest audit report writes to:

`outputs/operations/backend-evidence-audit-YYYY-MM-DD/`

Keep private/internal evidence complete enough to audit the workflow. For any footage, public docs, or shared examples, redact customer names, bank/account details, and sensitive financial information.
