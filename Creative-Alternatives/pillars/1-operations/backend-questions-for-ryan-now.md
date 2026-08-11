# Backend Questions For Ryan — Answer First

> Short version of the backend systems audit. Answer these before we build the first real automation.

## How to answer

Reply in plain English, or fill the current session intake:

`context/import/backend-audit/2026-07-05/backend-answer-intake.csv`

If the session intake does not exist yet, create it:

```bash
python3 pillars/1-operations/automations/backend_session_intake/create_backend_session_intake.py \
  --date 2026-07-05
```

Unknown is fine. For each answer, include the tool/file/inbox if you know it.

After filling the CSV, run:

```bash
python3 pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py \
  --input context/import/backend-audit/2026-07-05/backend-answer-intake.csv
```

To save one answer at a time instead of editing the CSV:

```bash
python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py \
  --date 2026-07-05 \
  --question Q001 \
  --answer "QuickBooks Online" \
  --source-system "QuickBooks Online"
```

## The first 15 questions

### QuickBooks

1. Which QuickBooks version are you using: QuickBooks Online, QuickBooks Desktop, or something else?
2. In QuickBooks, do you currently use estimates, invoices, sales receipts, purchase orders, bills, projects, or only some of those?
3. When a customer approves an order, what is the first thing Maclaine/Kenny creates in QuickBooks?
4. Are vendor/printer costs tied to the customer order in QuickBooks, or tracked somewhere else?
5. What exactly made the recent payment/invoice matching take around 8 hours?

### Email and order intake

6. Where do new customer orders usually come in: Kenny email, Maclaine email, phone/text, website, existing customer thread, or something else?
7. Does Kenny still use a personal/AOL inbox for active business?
8. Can Maclaine see the full customer/vendor thread when Kenny owns the relationship?
9. Is there any shared inbox, label system, or folder that marks active orders?

### Purchase orders, printers, and proofs

10. How are purchase orders sent to vendors/printers today: QuickBooks PO, PDF/email, vendor portal, phone/text, or a mix?
11. Who creates/sends POs?
12. Where do vendor/printer confirmations arrive?
13. Where do approved proofs live, and how does the printer know which proof is final?

### Spreadsheets and open orders

14. Is there one active open-order list today? If yes, where is it?
15. What spreadsheets does Maclaine/Kenny open every week to run the business?

## Decision question

If we could fix one backend pain first, which would feel most valuable this month?

- A. Know exactly what orders are active and stuck.
- B. Make AR follow-up and collections easier.
- C. Match payments/deposits to invoices faster.
- D. Track POs/printer confirmations better.
- E. Reorder follow-up so repeat customers do not go quiet.
- F. Something else.

## Artifact request

If possible, collect these for one recent order:

- original customer request
- quote or estimate
- approval/proof approval
- PO or vendor order
- vendor confirmation
- tracking/delivery info
- invoice
- payment status

Redact customer details if needed, but keep enough structure to see the workflow.
