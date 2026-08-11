# QuickBooks Export SOP — Backend Automation Inputs

> Purpose: give Maclaine/Ryan the exact QuickBooks exports needed before we build AR, reconciliation, PO/printer, margin, or order-status automations.

## Where to save exports

For the next backend audit session, save files here:

`context/import/backend-audit/2026-07-05/quickbooks/`

Use the exact filenames below when possible. If QuickBooks forces a different name, rename the file after export.

## Export rules

- Export CSV or Excel. CSV is preferred.
- Do not edit numbers by hand after export.
- If a report cannot be exported, write that in `session-notes.md`.
- Keep internal copies complete. Redact only copies used for filming/public sharing.
- Do not change QuickBooks data from this process.

## Export checklist

| Priority | Report/export | Filename | Date range | Required columns | Used for |
|---:|---|---|---|---|---|
| 1 | Invoice Detail | `qb_invoice_detail.csv` | one representative month plus current open invoices | customer, invoice number, invoice date, due date, amount, balance, status, memo/job/order reference | AR worklist and payment matching |
| 2 | Payments Received / Deposits Detail | `qb_payments_deposits_detail.csv` | same month as invoice detail | customer/source, payment date, amount, reference/check/ACH note, linked invoice if available | payment-to-invoice reconciliation |
| 3 | Open Invoices | `qb_open_invoices.csv` | current day | customer, invoice number, date, due date, amount, balance, aging bucket | daily AR action list |
| 4 | Open Purchase Orders | `qb_open_purchase_orders.csv` | current day, if POs are used | PO number, vendor, customer/job reference, amount, date, status | PO/printer tracker |
| 5 | Unpaid Bills / Vendor Bills | `qb_unpaid_bills_vendor_bills.csv` | current day, if bills are entered | vendor, bill number, date, amount, linked customer/job if any, status | vendor cost and margin matching |
| 6 | Estimates / Quotes | `qb_estimates_quotes.csv` | one representative month, if estimates are used | estimate number, customer, date, amount, status, converted invoice if any | quote-to-order mapping |

## Existing baseline exports

These already exist in `context/import/` and are used by the audit packet:

- `qb_ar_aging.csv`
- `qb_expenses_by_vendor.csv`
- `qb_sales_by_customer_total.csv`
- `qb_sales_by_product.csv`
- `qb_customer_contacts.csv`

Refresh them weekly once the export flow is stable.

## How to export if using QuickBooks Online

Use this as a general path; labels may vary by account setup.

1. Go to **Reports**.
2. Search for the report name or nearest equivalent.
3. Set the date range.
4. Customize columns if needed.
5. Export to Excel/CSV.
6. Rename the file using the filename above.
7. Move it into `context/import/backend-audit/2026-07-05/quickbooks/`.

If a needed field is missing, try:

- Customize
- Rows/Columns
- Change columns
- Filter by transaction type
- Group by customer/vendor
- Export transaction detail instead of summary

## How to export if using QuickBooks Desktop

Use this as a general path; labels may vary by version.

1. Go to **Reports**.
2. Open the closest transaction/detail report.
3. Set the date range.
4. Customize report columns if needed.
5. Export to Excel.
6. Save as CSV if practical.
7. Rename the file using the filename above.
8. Move it into `context/import/backend-audit/2026-07-05/quickbooks/`.

## If the exact report does not exist

Use the closest export that can answer the same question:

| Needed export | Acceptable substitute |
|---|---|
| Invoice Detail | transaction list filtered to invoices |
| Payments Received / Deposits Detail | transaction list filtered to payments/deposits |
| Open Invoices | A/R aging detail with invoice numbers |
| Open Purchase Orders | purchase order list or vendor transaction detail |
| Vendor Bills | unpaid bills detail or vendor transaction detail |
| Estimates / Quotes | estimates by customer or transaction list filtered to estimates |

Record the substitute in:

`context/import/backend-audit/2026-07-05/session-notes.md`

## After exporting

Run the QuickBooks export validator first:

```bash
python3 pillars/1-operations/automations/quickbooks_export_validator/validate_quickbooks_exports.py \
  --quickbooks-dir context/import/backend-audit/2026-07-05/quickbooks \
  --output-dir outputs/operations/quickbooks-export-validation-2026-07-05
```

Review:

`outputs/operations/quickbooks-export-validation-2026-07-05/quickbooks-export-validation.md`

Then run the evidence auditor:

```bash
python3 pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py \
  --evidence-dir context/import/backend-audit/2026-07-05 \
  --output-dir outputs/operations/backend-evidence-audit-2026-07-05-session
```

Then review:

`outputs/operations/backend-evidence-audit-2026-07-05-session/missing-evidence-report.md`

## Questions to answer while exporting

1. Are estimates used before invoices?
2. Are purchase orders used in QuickBooks?
3. Are vendor bills linked to customers/jobs?
4. Are payments automatically matched to invoices, manually matched, or often unapplied?
5. Are deposits/partial payments common?
6. Which report does Maclaine already use when reconciling?
