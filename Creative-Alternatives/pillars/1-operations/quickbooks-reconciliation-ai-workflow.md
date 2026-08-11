# AI Workflow — QuickBooks Reconciliation (smallest real version)

> The first real automation to BUILD and SHOW. It powers Video 1. **No code** — just two exports, one prompt, and an AI. Built to model the muse (Chuck the Contractor plugs AI into his bookkeeping → 2 days of work in 30 min).

## The pain (real)
Kenny + Maclaine spent **8 hours in one day** reconciling QuickBooks by hand. This does the heavy lifting in minutes; a human reviews only the exceptions.

## ✅ Confirmed task (2026-06-25): payments → invoices
The 8-hour job = **matching customer payments / deposits to open invoices** (accounts receivable). The prompt below is tailored to exactly that. (Categorizing bank/card transactions and paying vendor bills are *different* jobs — save them for later videos.)

## What you need — 2 exports
QuickBooks → Reports/Lists → export to CSV:
1. **Invoices** for the period — customer, invoice #, date, amount, status (open/paid)
2. **Payments / deposits** for the period — date, amount, source/customer, reference

## Privacy (do this BEFORE filming)
- Real data is fine to give the AI for the actual work. But **on camera, sanitize**: swap real customer names for "Customer A/B/C," round or mask exact dollar amounts, and never show bank/account numbers. (Operator's code: don't expose customer/financial data publicly.)
- Easiest: do the demo on **one representative month**, anonymized.

## The prompt (paste with the 2 files)
```
You're my accounts-receivable assistant. I'm giving you two files from QuickBooks:
(1) our invoices for [period] — customer, invoice #, date, amount, status
(2) our payments/deposits for [period] — date, amount, source/customer, reference

Match each customer payment to the invoice(s) it pays. A single payment may cover
multiple invoices, and one invoice may be paid by multiple payments — handle both.
Match on customer + amount + reference/date, not on name alone. Then give me:

1. A clean table: invoice #, customer, invoice amount, matched payment(s) + date,
   amount applied, remaining balance, status (paid / partial / open), and a
   match-confidence (high / medium / low).
2. An EXCEPTIONS list — invoices with no matching payment (still owed), payments
   with no matching invoice (unapplied), amount mismatches, partial payments, and
   likely duplicate entries. Say why each is flagged.
3. A one-line summary: total invoiced, total collected, total still owed, and the
   number of exceptions a human needs to review.

Rules: do not guess. Any uncertain match goes in exceptions with your reasoning.
Never invent a number.
```

## Run it
1. Open Claude (or ChatGPT) → upload/paste the 2 CSVs + the prompt.
2. Read the output. **Spot-check the exceptions** — that's the 20% only a human can verify.
3. Fix anything off. Done.

## Measure — this is the video's payoff
- **Time it.** Real AI time vs the 8 hours by hand. Use the REAL number — don't fake "20 minutes," measure it.
- **Note what AI caught** a tired human would miss — a duplicate, an unpaid invoice, a mismatch. Those moments sell the video.

## Honest framing (the 80/20)
AI does the heavy matching in minutes; you review the exceptions. The win isn't "AI does it perfectly" — it's "AI turns an 8-hour slog into a 20-minute review of the few things that actually need a brain."

## Later (not for v1)
Save as a reusable Claude Project, or have AI write a tiny script so it's one click. v1 is just: export → prompt → review.
