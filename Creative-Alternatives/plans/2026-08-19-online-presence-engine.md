# CA Online Presence & Traffic Engine

**Created:** 2026-08-19
**Trigger:** Inbound lead via the Squarespace form (Hannah Fox, Yorkville Community School — Online Stores, needs by Sept 9) proved the website can generate demand. We currently can't see, track, or reliably convert that demand.
**Status:** Active — Phase 0 executes this weekend (Aug 22–23)
**Owner:** Ryan (systems, analytics, publishing) · Maclaine (lead response) · Kenny (public-claims approval)

---

## What this plan is

Four gated phases that take CA from "dark" to a measurable inbound engine:

1. **Phase 0 (this weekend):** tracking + Google presence — GA4, Search Console, Google Business Profile, chat widget, Meta Pixel, first niche page live
2. **Phase 1 (weeks 1–2):** conversion funnel — remaining niche pages, review engine, weekly metrics ritual
3. **Phase 2 (weeks 2–6):** SEO content engine — the existing 90-day plan cadence
4. **Phase 3 (weeks 2–6, parallel):** organic social — LinkedIn + Instagram systems
5. **Phase 4 (gated, no spend):** paid ads playbook, ready to launch once attribution is proven

Most of this was already designed in July and never shipped. This plan sequences the existing assets into execution:

| Existing asset | Role here |
|---|---|
| `plans/90-day-seo-inbound-execution-plan-2026-07-11.md` | Governing SEO/content cadence (Phases 2+) |
| `plans/inbound-master-implementation-2026-07-10.md` | Funnel + measurement design |
| `pillars/3-online-presence/inbound/page-copy/` | 8 drafted Squarespace-ready niche pages |
| `pillars/3-online-presence/inbound/measurement-spec.md` | Event/attribution spec |
| `pillars/3-online-presence/inbound/ads-and-seo-playbook.md` | Detailed ads keyword/campaign design |
| `plans/ca-social-brand-playbook.md` | Social strategy (Phase 3) |
| `pillars/3-online-presence/linkedin-content-engine.md` | LinkedIn workflow, <2 hrs/week |

**Operating constraints (unchanged):** improve Squarespace, don't rebuild. Kenny approves anything public. No ad spend until attribution is verified — Phase 4 is a plan, not a budget. Honest gaps stay marked `[CONFIRM]`.

---

## The funnel logic

```
TRAFFIC                      CONVERSION                    MEASUREMENT
Google Business Profile  →   Niche landing pages       →   GA4 key events
Niche SEO pages          →   Quote / store-preview form →  HubSpot attribution
Organic social (UTM'd)   →   HubSpot chat widget       →   Weekly metrics review
Paid ads (gated) - - - - →   (same pages)
```

Every traffic source lands on a niche page. Every niche page has one primary CTA (store preview / quote form). Every form fill arrives in HubSpot with source, landing page, and UTM data. That's the whole machine.

---

## Phase 0 — This weekend (Aug 22–23): tracking + Google presence

Everything else is blind without this layer. Ryan has Squarespace admin and a Google account — no blockers. Click-by-click steps live in `pillars/3-online-presence/RUNBOOK.md`.

### Saturday — measurement

- [ ] Create GA4 property, connect via Squarespace's built-in Google Analytics integration (no GTM needed for v1)
- [ ] Verify domain property in Google Search Console; submit `https://www.creativealternatives.com/sitemap.xml`; record baseline queries/impressions
- [ ] Configure GA4 key events: form submission, quote-page view, store-preview CTA click
- [ ] Confirm Squarespace form submissions land in HubSpot with source data; test with a dummy lead end to end
- [ ] Adopt UTM conventions (`pillars/3-online-presence/utm-conventions.md`) — SmartLead and LinkedIn links get tagged starting Monday

### Sunday — Google presence + on-site basics

- [ ] Create/claim Google Business Profile — primary category Promotional Products Supplier; start verification immediately (it can take days)
- [ ] Fix sitewide SEO basics in Squarespace: homepage title + meta description, unique titles on the top 5 pages (generic/blank per the July audit — `inbound/implementation/live-system-audit-2026-07-10.md`)
- [ ] Publish the first niche page from existing drafts — `/school-spirit-wear-stores` (back-to-school window is open now and the Yorkville lead is a school) or `/summer-camp-merchandise` (proven 10.1% outbound reply segment). Kenny reviews claims before publish.
- [ ] Enable the HubSpot free chat widget sitewide — this is chatbot v1: zero build, routes conversations to Maclaine/Ryan
- [ ] Install Meta Pixel via Squarespace code injection — free now, required later for Phase 4 retargeting

**Definition of done Sunday night:** GA4 receiving data, GSC verified, GBP verification started, 1 niche page live, chat widget on, pixel installed.

---

## Phase 1 — Weeks 1–2: conversion funnel

- Publish the remaining drafted niche pages from `inbound/page-copy/` at ~2/week: schools, camps, racquet clubs, private clubs, law firms, corporate programs, event merchandise. Consistent template: pain → proof (27 years, 2,700+ customers) → free store offer → form.
- One primary CTA per page: **"Get a free store preview"** — the proven outbound wedge, now working inbound.
- Review engine: once GBP verifies, Kenny picks 10 best repeat customers; send the review-request template. Target: 10 Google reviews in 30 days.
- Weekly 15-minute metrics ritual (Fridays, alongside `/review`): GA4 traffic, GSC impressions/queries, form fills, chat conversations → one line in the work log.

**Gate to Phase 2/4:** we can answer "where did this lead come from?" for every form fill, verified on at least 2 real leads.

---

## Phase 2 — Weeks 2–6: SEO content engine

Execute the cadence already defined in `plans/90-day-seo-inbound-execution-plan-2026-07-11.md`:

- 1 niche/service page or resource per week (drafts already exist in `inbound/resource-copy/` — camp planning calendar, school store comparison guide, event merchandise timeline, etc.)
- GBP weekly posts: shop-floor product photos — free proof content
- NAP consistency across GBP, site footer, and directories
- Internal linking from homepage to niche pages; alt text on product galleries
- Weekly Search Console review: which queries get impressions, which pages need title/copy adjustments

---

## Phase 3 — Weeks 2–6 (parallel): organic social

- **LinkedIn:** follow `pillars/3-online-presence/linkedin-content-engine.md` — Ryan/Kenny/Maclaine voices, event-driven, under 2 hrs/week total. Every post that links out uses a UTM-tagged niche page URL.
- **Instagram:** the visual engine per `plans/ca-social-brand-playbook.md`. Content system: shop-floor production shots, before/after mockups, customer store launches. Batch 1x/week; link in bio → niche page with UTMs.
- **Outbound alignment:** SmartLead campaigns and LinkedIn touches get UTM-tagged links so inbound and outbound attribution stay separated in HubSpot.

---

## Phase 4 — Paid ads: strategy only, no spend

Detailed campaign design lives in `pillars/3-online-presence/inbound/ads-and-seo-playbook.md`. This section is the launch gate and sequencing.

**Why Google Search first, Meta second:** promo products are high-intent search ("custom camp merchandise," "school spirit wear supplier"). Google captures existing demand; Meta creates demand, which is slower and pricier to prove. Retargeting via Meta only makes sense once the site has traffic worth retargeting.

**Tier 1 — Google Search (~$500–1k/mo when unlocked):**
- 2 campaigns on proven niches (camps, schools), exact/phrase match only
- Land on the matching niche page, never the homepage
- Conversion = form fill (GA4 key event imported to Google Ads)

**Tier 2 — Meta retargeting (after Tier 1 shows signal):**
- Warm audience only: site visitors from the pixel installed in Phase 0
- Creative = real production photos + store-preview offer

**Launch criteria — all must be true before any spend:**
1. GA4 key events firing correctly (verified in DebugView)
2. HubSpot shows correct source attribution on 2+ real inbound leads
3. At least 3 niche pages live and converting organically (any nonzero form-fill rate)
4. Named human owner for ad-driven leads with a response-time expectation
5. Kenny approves the budget

---

## Measurement scoreboard

| Checkpoint | Target |
|---|---|
| Sunday night (Aug 23) | Phase 0 definition-of-done met |
| Week 2 | Every form fill attributable to a source; 3+ niche pages live |
| Week 6 | 6+ niche pages live, 10 Google reviews, weekly social cadence running, paid-ads gate criteria evaluated |
| Week 12 | Defer to the 90-day plan's Day-90 definition of done |

North star (from the 90-day plan): qualified inbound opportunities, quotes, customers, and gross profit — not traffic or form fills.

---

## Related docs

- Weekend setup steps: `pillars/3-online-presence/RUNBOOK.md`
- UTM standard: `pillars/3-online-presence/utm-conventions.md`
- Governing SEO plan: `plans/90-day-seo-inbound-execution-plan-2026-07-11.md`
- Funnel/measurement design: `plans/inbound-master-implementation-2026-07-10.md`
