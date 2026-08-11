# Backend Audit Packet Generator

Generates a first-pass backend operations report from QuickBooks CSV exports.

## Inputs

Expected files in `context/import/`:

- `qb_ar_aging.csv`
- `qb_expenses_by_vendor.csv`
- `qb_sales_by_customer_total.csv`
- `qb_sales_by_product.csv`
- `qb_customer_contacts.csv`

## Run

```bash
python3 pillars/1-operations/automations/backend_audit_packet/generate_backend_audit_packet.py
```

## Outputs

Writes a dated packet under `outputs/operations/backend-audit-YYYY-MM-DD/`:

- `backend-audit-report.md`
- `backend-action-board.md`
- `ar-priority-list.csv`
- `ar-action-tracker-starter.csv`
- `open-order-tracker-starter.csv`
- `top-vendors.csv`
- `vendor-master-starter.csv`
- `top-customers.csv`
- `top-products.csv`
- `backend-gap-register-starter.csv`

## Purpose

This does not replace the live backend walkthrough. It turns the existing QuickBooks exports into an evidence-backed starting point for:

- AR and reconciliation priorities
- vendor/printer exposure
- customer concentration
- product mix and margin visibility
- contact data quality
- backend gap validation
