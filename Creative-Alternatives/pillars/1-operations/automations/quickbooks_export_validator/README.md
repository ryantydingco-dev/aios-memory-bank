# QuickBooks Export Validator

Checks whether the next QuickBooks exports exist and whether CSV files include the headers needed for AR, reconciliation, PO/printer, margin, and quote-to-order automation.

## Inputs

Default folder:

`context/import/backend-audit/YYYY-MM-DD/quickbooks/`

For the current audit session:

`context/import/backend-audit/2026-07-05/quickbooks/`

Expected exports:

- `qb_invoice_detail.csv`
- `qb_payments_deposits_detail.csv`
- `qb_open_invoices.csv`
- `qb_open_purchase_orders.csv`
- `qb_unpaid_bills_vendor_bills.csv`
- `qb_estimates_quotes.csv`

CSV is preferred. Excel files are marked present but unvalidated because this tool only checks CSV headers.

## Run

```bash
python3 pillars/1-operations/automations/quickbooks_export_validator/validate_quickbooks_exports.py
```

Or point it at a specific QuickBooks export folder:

```bash
python3 pillars/1-operations/automations/quickbooks_export_validator/validate_quickbooks_exports.py \
  --quickbooks-dir context/import/backend-audit/2026-07-05/quickbooks
```

## Outputs

Writes a dated folder under:

`outputs/operations/quickbooks-export-validation-YYYY-MM-DD/`

Files:

- `quickbooks-export-validation.md`
- `quickbooks-export-validation.csv`

## Purpose

Use this immediately after exporting QuickBooks reports and before running deeper backend automation. It tells us:

- which required exports are missing
- which CSV headers are missing or renamed
- whether a file is present but saved as Excel
- what Ryan/Maclaine/Kenny need to fix before automation relies on the data

## Guardrails

- Read-only: no QuickBooks connection and no QuickBooks writes.
- Header validation only; it does not decide whether business values are correct.
- Customer, vendor, and money-facing actions still require human approval.
