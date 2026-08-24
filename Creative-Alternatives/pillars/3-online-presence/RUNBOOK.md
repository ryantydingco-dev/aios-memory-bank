# Weekend Setup Runbook — Tracking + Google Presence

> **PARKED 2026-08-23.** Ryan confirmed CA is not using HubSpot and has not
> adopted GA4 or Google Search Console. Do not execute this runbook unless he
> explicitly reactivates website analytics/inbound work. It remains historical
> reference only and is not part of the current cold-outreach system.

**For:** Phase 0 of `plans/2026-08-19-online-presence-engine.md`
**When:** Sat Aug 22 – Sun Aug 23, 2026
**Who:** Ryan (has Squarespace admin + Google account)
**Companion doc:** `inbound/implementation/account-provisioning-runbook.md` (naming conventions, ownership guidance — follow its identity rules)

**Ownership note before you start:** the Google Workspace migration is in flight (`plans/2026-07-12-aol-to-gmail-migration.md`). If the new company Workspace account exists by Saturday, create every property below under it. If not, create under Ryan's Google account and add a company owner the day Workspace goes live. Do not skip adding a second owner.

---

## Saturday — measurement layer

### 1. GA4 (~20 min)

1. Go to [analytics.google.com](https://analytics.google.com) → Admin → Create Account.
2. Use the exact naming from the provisioning runbook:
   - Account: `Creative Alternatives`
   - Property: `Creative Alternatives Website`
   - Time zone: New York · Currency: USD
   - Web stream: `https://www.creativealternatives.com`, stream name `Creative Alternatives Website`
3. Copy the Measurement ID (`G-XXXXXXX`).
4. Squarespace: Settings → Developer Tools (or Website → Site Settings) → External API Keys → paste the Measurement ID into the Google Analytics field. This uses Squarespace's built-in integration — no GTM for v1.
5. Verify: open the site in an incognito tab, then check GA4 → Reports → Realtime shows your visit.

### 2. Google Search Console (~15 min)

1. Go to [search.google.com/search-console](https://search.google.com/search-console) → Add property.
2. Add URL-prefix property `https://www.creativealternatives.com/`. (DNS TXT domain property is better long-term, but DNS is mid-migration with Converge exiting — use the HTML-tag or GA4 verification method now, upgrade to a domain property after DNS control lands.)
3. Verify via the GA4 tag you just installed (easiest) or Squarespace HTML injection.
4. Sitemaps → submit `https://www.creativealternatives.com/sitemap.xml` (Squarespace generates this automatically).
5. Record the baseline: Performance tab → screenshot/export current queries, impressions, clicks. Save to `outputs/inbound/baselines/`.

### 3. GA4 key events (~20 min)

In GA4 → Admin → Events:

1. Squarespace automatically sends `form_submit` style events through the integration; confirm which events appear after you test the form (step 4).
2. Mark as key events: form submission event, and create these if needed via "Create event":
   - `quote_page_view` — condition: `page_location` contains the quote/contact page path
   - `store_preview_click` — will be wired when niche pages publish (CTA links get `?cta=store-preview` for now)
3. Do not send any PII into GA4 (per `inbound/measurement-spec.md`).

### 4. Form → HubSpot end-to-end test (~30 min)

1. Locate the live Squarespace form (the one Hannah Fox used).
2. Confirm where submissions currently go (email? Squarespace inbox?).
3. Wire to HubSpot: preferred = replace/augment with the HubSpot form embed (`inbound/implementation/hubspot-form-embed.html` has the draft); fallback = Squarespace email notification + manual HubSpot entry until the embed ships.
4. Submit a dummy lead (use a `+test` email address).
5. Verify in HubSpot: contact created, source/landing page/UTM fields populated. If source data is missing, note the gap — fixing attribution capture is the Phase 1 priority, and paid ads stay gated until it works.
6. Delete/mark the test contact.

### 5. UTM conventions (~10 min)

Read `utm-conventions.md` (same folder). Starting Monday, every link in SmartLead campaigns, LinkedIn posts/DMs, and Instagram bio gets tagged. No exceptions — untagged links are invisible leads.

---

## Sunday — Google presence + on-site basics

### 6. Google Business Profile (~30 min + verification wait)

1. Go to [business.google.com](https://business.google.com) → Add business.
2. Name: exactly `Creative Alternatives` — no keyword stuffing (Google suspends for it).
3. Primary category: `Promotional products supplier`. Secondary: `Custom t-shirt store`, `Embroidery shop` (as applicable — confirm with Kenny what fits the actual operation).
4. Address/service area: confirm with Kenny whether to show the physical address or a service area `[CONFIRM before publishing]`.
5. Hours, phone, website link: `https://www.creativealternatives.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
6. Add 10+ real photos: shop floor, equipment, finished products, team. No stock images.
7. Start verification (postcard/phone/video — take whatever Google offers). This can take days; starting today is the point.
8. Once verified (later this week): fill Services, add a description, set up the review link, and start the Phase 1 review engine.

### 7. Squarespace SEO basics (~45 min)

Per the July audit (`inbound/implementation/live-system-audit-2026-07-10.md`), titles are generic and metas blank.

1. Marketing → SEO (or per-page Settings → SEO tab).
2. Homepage title: `Custom Branded Merchandise & Apparel | Creative Alternatives` (≤60 chars).
3. Homepage meta: one sentence, real claims only — e.g. `Family-run since 1999. Custom apparel, promo products, and free online merch stores for camps, schools, and organizations. We print anything on everything.`
4. Unique titles + metas for the top 5 pages (check GSC baseline for which pages already get impressions).
5. Kenny reviews any new public claims before saving.

### 8. Publish the first niche page (~60 min)

1. Source copy: `inbound/page-copy/school-spirit-wear-stores.md` (back-to-school window + Yorkville lead) — or `summer-camp-merchandise.md` if Kenny prefers leading with camps.
2. Create the page in Squarespace at the URL slug the copy specifies.
3. One primary CTA: the quote/store-preview form.
4. Every claim in the copy must pass the proof rule (90-day plan rule 6/7) — strip anything unverified or mark `[CONFIRM]` and hold.
5. Kenny approves → publish → GSC URL Inspection → Request indexing.

### 9. HubSpot chat widget (~20 min)

1. HubSpot → Conversations → Chatflows → Create chatflow → Website.
2. Simple v1: greeting ("Questions about custom merch or a store for your organization? Ask here — a real person replies."), capture name + email if no one's live, route to Maclaine and Ryan.
3. Copy the HubSpot tracking code → Squarespace → Settings → Advanced → Code Injection → Footer.
4. Set office-hours behavior and the away message honestly — no fake "we're online 24/7."
5. Test from an incognito window; confirm the conversation appears in HubSpot inbox.

### 10. Meta Pixel (~15 min)

1. [business.facebook.com](https://business.facebook.com) → Events Manager → Connect data source → Web → Meta Pixel. (Create the Business Manager account if CA has none — under the company identity, add Ryan as admin.)
2. Copy the pixel base code → Squarespace Code Injection → Header.
3. Verify with Meta Pixel Helper browser extension.
4. No ads run — this only accumulates a retargeting audience for the gated Phase 4.

---

## Definition of done (Sunday night)

- [ ] GA4 receiving realtime data
- [ ] GSC verified, sitemap submitted, baseline recorded
- [ ] Form tested end-to-end into HubSpot (or gap documented)
- [ ] GBP created, verification in progress
- [ ] Homepage + top-5 titles/metas fixed
- [ ] 1 niche page live and submitted for indexing
- [ ] Chat widget live and tested
- [ ] Meta Pixel firing

Log the outcome in the work log and update `inbound/implementation-status.md`.
