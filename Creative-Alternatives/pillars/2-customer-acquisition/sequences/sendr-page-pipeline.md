# Sendr page pipeline — real personalized pages, per lead

> **LIVE WIRING (2026-07-16, campaign "Swag Warm — LinkedIn" id 9676, ryan@dealthreads.io account):**
> The DM step (A5) now links the contact column **Mockup Page URL** (internal token key: `{{mcuAeul}}` —
> key is frozen from a garbled first save; display name is correct, do not recreate). Company token: `{{companyName}}`.
> Sequence: Profile View -> Wait 1d -> Send Connection -> **Wait 3d** -> Check Connection ->
> No: **Wait 4d -> Go to Check (retry loop — fixes the old instant-check bug that burned ~105 leads)**
> | Yes: **Wait 2d (production window)** -> Generate Page (legacy, unused output) -> DM with {{mcuAeul}} -> +4d breakup.

## The hard rule
**No page, no DM.** The 2-day window after connection-accept is the SLA: every accepted lead must have
their Mockup Page URL filled before the wait elapses. If a day is missed, PAUSE the campaign (toggle to
Draft) rather than let DMs fire with an empty link.

## The daily loop (~every weekday, one Claude session)
1. Open campaign 9676 Contacts -> filter/scan for leads that passed "Check Connection = Yes" in the last
   2 days (Logs tab shows check-yes events; or Data studio).
2. For each accepted lead, run the proven mockup line (`../mockup-lead-magnet-sop.md`):
   logo scrape -> clean reference -> 3 mockups (kit flat-lay / apparel hero in THEIR world / drinkware)
   -> **QC: company name letter-perfect, zero tolerance**.
3. Build the per-lead Gamma mini-lookbook (5 cards: Cover -> Kit -> Apparel -> Drinkware -> soft CTA;
   textMode preserve, brand-matched theme, noImages, external access = view). The durable
   gamma.app/docs/... link is the page.
4. Paste the link into that contact\'s **Mockup Page URL** cell in the campaign Contacts table.
5. Track in `../outbound/sendr-warm-audience.csv` (`Page Link` / `Page Status`).
6. Blocked logo -> snooze the lead in Sendr, `Page Status` = blocked, manual logo hunt.

## Content rules
- Letter-perfect logos only. No fabricated pricing/claims (approved: since 1999, 2,700+ orgs,
  75,000+ orders, 24-48h proofs, ~2wk production). Never mention AI. Human eyes before any link goes in.

## Scale notes
- Accepts arrive in batches after each re-check cycle (every 4 days) — expect lumpy days.
- 42 leads with 3+ email opens get priority if production backs up.
- Batch-2 audience (2,063 engaged leads, `../outbound/sendr-audience-batch2.csv`) uploads into the SAME
  campaign — dedupe is safe (no overlap with the 202).
