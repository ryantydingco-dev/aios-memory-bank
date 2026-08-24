# Invoice Chase Engine Lead Enrichment Summary

Date: 2026-06-08

## Inputs pulled

- `sc_trades_ar_callist_2026-06-08_CLEAN.csv` — 781 rows
- `ar_recovery_proservices_batch1_CLEAN.csv` — 1,000 rows

Total loaded: 1,781 deduped contact/company rows.

## Enrichment method

First-pass enrichment for Invoice Chase Engine / AR Leak Audit buying signals.

Used existing AI Ark/Vibe Prospecting fields plus homepage fetches where available.

Homepage fetch attempted: 1,723 domains
Homepage fetch success: 1,501 domains

Scored for:

- invoice/billing language
- recurring contracts, retainers, renewals, service agreements
- high-ticket project work
- third-party payer / insurance / property manager / commercial account signals
- compatible tool stack hints like QuickBooks, Jobber, ServiceTitan, ConnectWise, etc.
- hiring/growth/volume signals
- explicit AR/admin pain language like collections, overdue, unpaid, billing coordinator
- owner/operator decision-maker fit

## Outputs created

- `invoice_chase_enriched_universe_2026-06-08.csv` — all 1,781 rows, enriched and scored
- `invoice_chase_TOP_150_call_first_2026-06-08.csv` — top call-first dial list

## Recommended action counts

- CALL_FIRST_TODAY: 47
- CALL_PLUS_EMAIL: 139
- EMAIL_OR_SECONDARY_CALL: 564
- LOW_PRIORITY_SKIP_FOR_NOW: 1,031

## Segment notes

Top scored rows skew heavily toward restoration/trades and agencies/pro services because the public website language gave stronger signals than the MSP subset in these files.

Detected segment counts:

- Agency/Marketing/Creative: 979
- Restoration/Roofing/Trades: 589
- Pro-services generic: 117
- SC local trades generic: 46
- Consulting/Professional Services: 45
- MSP/IT Services: 5

## Best phone strategy

Call the top 150 first. The first 47 are highest priority.

Opening question:

> Quick one — after work is done, do invoices ever sit unpaid because follow-up is still manual?

For restoration/trades/commercial signals:

> Saw you handle commercial/insurance/property-manager style payment paths. Do completed jobs ever sit unpaid because someone needs another nudge?

For agencies/pro services:

> Do unpaid invoices or retainer renewals ever depend on someone manually nudging the client?

## Caveat

This was a fast, practical enrichment pass — good enough to prioritize calls. It is not a perfect deep-research pass. For the first 25–50 call targets, manually sanity-check the company website and phone/contact before dialing if needed.
