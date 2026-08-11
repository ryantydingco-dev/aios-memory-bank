# PO / Printer Tracker Generator

Creates a human-reviewable PO/printer tracker from the current open-order tracker and vendor master data.

## Inputs

Default source folder:

`outputs/operations/backend-audit-2026-07-05/`

Expected files:

- `open-order-tracker-starter.csv`
- `vendor-master-starter.csv`

After the live walkthrough, this can point at a folder containing updated versions of those same files.

## Run

```bash
python3 pillars/1-operations/automations/po_printer_tracker/generate_po_printer_tracker.py \
  --input-dir outputs/operations/backend-audit-2026-07-05
```

## Outputs

Writes a dated folder under:

`outputs/operations/po-printer-tracker-YYYY-MM-DD/`

Files:

- `po-printer-tracker.csv`
- `po-follow-up-list.md`
- `vendor-workflow-map.md`
- `po-exceptions.csv`
- `README.md`

## Guardrails

- This is review-only.
- It does not send vendor/customer emails.
- It does not write to QuickBooks.
- Starter rows must be replaced with real orders before using it for live operations.

