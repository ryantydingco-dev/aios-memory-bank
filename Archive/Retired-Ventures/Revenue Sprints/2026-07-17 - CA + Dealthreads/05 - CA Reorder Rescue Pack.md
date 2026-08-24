# Creative Alternatives Reorder Rescue Pack

## What Changed

The obvious August-anniversary list was unsafe as a 57-account blast. A normalized join against the latest local QuickBooks customer-year export found:

- 57 August 2025 customers.
- 38 already show 2026 sales totaling $543,721.25.
- 19 show no 2026 sales.
- Burrito Bar has an open balance and is excluded.
- Corrected review cohort: 18 accounts with $22,755.21 of August 2025 revenue.

The broader reorder-rescue queue contains 117 accounts representing $302,077.08 of 2025 revenue. Its top 25 represented $198,404.16 when built, but it must be refreshed against live QBO before contact.

## Seven-Day Motion

1. Live-QBO check the top 25 for any 2026 order since the source export.
2. Check open A/R, open quote, relationship owner, opt-out, and active production status.
3. Route Todd-owned accounts for explicit approval.
4. Rank the surviving rows by prior revenue and seasonal relevance.
5. Work the first ten phone-first. Use email only as an approved follow-up.
6. On reorder interest, pull exact prior products and prepare a same-day quote.
7. On "something different," use the mockup workflow and same-day draft SLA.
8. Record disposition, next reorder date, booked value, invoice, and cash date.

## Warm Call Script

Hi {{first_name}}, it is {{caller}} at Creative Alternatives. We handled {{company}}'s {{prior_order}} around this time last year, and I wanted to check whether anything similar is coming up again. We still have the artwork and order history, so an exact reorder is straightforward. If you are considering something different, we can put a few visual concepts together. What is on the calendar?

If no answer, leave one voicemail and schedule a second attempt at a different time. Do not repeatedly dial or enroll the account in cold automation.

## Email Follow-Up

**Subject:** last year's {{prior_order}} for {{company}}

Hi {{first_name}},

I just tried you because we handled {{company}}'s {{prior_order}} around this time last year.

If you would like an exact reorder, we have the artwork and order history on file. If you are thinking about something different this year, tell me what is coming up and we can put a few ideas together.

You can reply here or call {{approved_callback_number}}.

Best,
{{approved_sender}}

## Required Row Gates

- `live_qbo_checked = yes`
- `no_2026_order = yes`
- `open_ar_reviewed = yes`
- `open_quote_reviewed = yes`
- `relationship_owner_approved = yes`
- `contact_verified = yes`
- `approval_status = approved`

Rows missing any gate remain on hold.

## Measurement

Track attempts, connections, conversations, quote requests, mockups requested, quotes sent, booked orders, invoiced revenue, cash collected, next reorder date, and lost reason. The existing originated ledger is header-only; this sprint workbook becomes the temporary operating tracker until the durable ledger is repaired.

