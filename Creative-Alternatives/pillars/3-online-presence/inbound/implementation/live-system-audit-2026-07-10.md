# Live Inbound System Audit - 2026-07-10

> Rechecked 2026-07-11. Squarespace still requires login; the contact-level HubSpot model remains intact; missing company/deal scopes still block those objects.

This is an evidence record of authenticated and public live state. It does not infer completion from repository plans.

## Squarespace and public site

Public checks:

- The current sitemap contains nine existing URLs and still includes `/home`.
- The existing `/services` page returns HTTP `200`; the new services package in this repository is not published there.
- None of the seven planned dedicated niche pages appears in the sitemap.
- Each planned URL returns HTTP `404`:
  - `/summer-camp-merchandise`
  - `/squash-racquet-club-merchandise`
  - `/law-firm-branded-merchandise`
  - `/private-club-merchandise`
  - `/school-spirit-wear-stores`
  - `/corporate-merch-programs`
  - `/event-merchandise`
- All eight planned resource URLs also return HTTP `404`.
- No authenticated Squarespace editor access was available in this task.
- A direct Chrome check on 2026-07-11 reached the Squarespace login screen, confirming that no authenticated editor session is available in the connected browser.
- A responsive noindex staging preview now exists at `staging/camp-inbound/`; this is not a public deployment.

Conclusion: page drafts and metadata are implementation-ready in the repository, but no proposed niche page is live.

## Visual and proof sources

- Seven selected current-gallery image candidates return HTTP `200` with image content types.
- The candidates cover camp, racquet, event-adjacent, and school contexts.
- Several candidates contain identifiable people, minors, and customer branding.
- Five current public testimonial records are registered for racquet and law-firm proof.
- Current public publication is not treated as permission for new niche pages, email, ads, social, or YouTube.
- Approved visual/proof slots: 0 of 56.
- Publish-ready page packages: 0 of 16.

Conclusion: candidate evidence and complete production briefs exist, but no new page visual or proof slot is approved. The source of truth is `config/ca_inbound_assets.yaml`; the current queue is `outputs/inbound/implementation/asset-readiness.md`.

## HubSpot

Authenticated account evidence:

- Account/portal: `246275995`
- Data-hosting location: `na2`
- Time zone: `US/Eastern`
- Contact properties endpoint: HTTP `200`
- Contact property groups endpoint: HTTP `200`
- `CA Inbound` contact property group: created successfully
- Planned contact properties: 37
- Live matching contact properties: 37
- Missing planned contact properties: 0
- Group/type/field-type mismatches: 0
- `ca_marketing_consent` options: `true` and `false`
- Ten first/latest-touch attribution properties are available for hidden form use.
- Contact-level inquiry status, no-fit reason, response timing, nurture state, and next-planning-date properties are live.
- Existing contact records or property values changed: no
- A 2026-07-11 read-only recheck reports 37 existing, 0 missing, 0 updates, with company and deal scopes still blocked by HTTP `403`.

The property apply command is idempotent. A second read-only run reports 37 existing, 0 missing, and 0 updates.

Unavailable HubSpot surfaces:

| Surface | Result | Evidence |
|---|---:|---|
| Company schema | `403` | Private app lacks company read scope |
| Deal schema | `403` | Private app lacks deal read scope |
| Deal pipelines | `403` | Private app lacks required deal object/schema read scope |
| Forms | `403` | Private app lacks `forms` scope |

Conclusion: the contact intake, attribution, pre-deal qualification, and nurture-state foundation is live. Company properties, deal properties, qualification pipeline, form, workflows, routing, and end-to-end tests remain incomplete.

## Google Analytics 4

- The local measurement contract contains 11 browser events, four CRM/revenue events, and nine GTM Data Layer Variables.
- Browser-event configuration exactly matches runtime `track()` calls in `squarespace-attribution.js` version `1.1.0`.
- The contract excludes named contact PII and keeps raw submit attempts diagnostic-only.
- Measurement activation gates complete: 0 of 10.
- `GA4_PROPERTY_ID` is named in `.env`.
- `GOOGLE_APPLICATION_CREDENTIALS` has no configured value in the loaded environment.
- No authenticated GA4 API or browser session was available.
- The current baseline cannot be read or verified.
- 2026-07-11 browser recheck: the connected Google identity reaches the Analytics welcome/provisioning screen and has no Analytics account or CA property.

Conclusion: GA4 access and event installation remain incomplete.

## Google Ads

- Paused proposal files exist in `outputs/inbound/implementation/`.
- No authenticated Google Ads API, connector, or browser session was available.
- No proposal was imported, posted, budgeted, geographically targeted, or enabled.
- 2026-07-11 browser recheck: the connected Google identity has no Google Ads accounts and is offered account creation.

Conclusion: paid-search strategy and import files exist, but no campaign is live.

## Search Console and Business Profile

- No authenticated connector, API credential, or browser session was available for either surface.
- Sitemap submission, indexing inspection, local business details, service area, and profile ownership remain unverified.
- 2026-07-11 Search Console recheck: the login has only a `https://dealthreads.io/` URL-prefix property; Creative Alternatives is absent.
- 2026-07-11 Business Profile recheck: the login contains one unrelated duplicate restaurant listing and no visible Creative Alternatives profile.

## Local measurement warehouse

- `inbound_inquiries`, `inbound_deals`, `inbound_spend`, and `inbound_import_log` exist in `data/data.db`.
- Current live inquiry, deal, and spend row counts are zero.
- The July baseline report correctly reports zero live inbound records.
- The warehouse contains no contact name, email, phone, or other direct contact PII columns.

## Current completion verdict

The strategy, deployable artifacts, contact-property foundation, local reporting system, and safety controls are implemented. The full objective is not complete because pages, forms, routing, analytics, search visibility, paid campaigns, and source-to-revenue behavior have not been staged and verified in the authenticated live systems.

## Exact access changes needed

1. Grant Squarespace editor access or explicitly authorize use of an already signed-in Chrome session.
2. Add the HubSpot scopes required to read/write company and deal schemas, read deal pipelines, and manage/read forms.
3. Provide authenticated GA4 access or a valid application credential authorized for the configured property.
4. Provide authenticated Search Console, Google Ads, and Business Profile access.
5. Approve the business claims and public proof listed in `launch-checklist.md`.
