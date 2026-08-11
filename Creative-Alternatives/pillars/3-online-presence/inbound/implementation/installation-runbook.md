# Inbound Installation Runbook

This runbook stages the implementation without publishing pages, enabling campaigns, spending money, or automating a customer-facing commercial decision.

## Architecture decision

Use Squarespace for pages and HubSpot's hosted form embed for the primary inbound form.

Why:

- The complete CA intake and attribution model contains more fields than the Squarespace form-block recommendation of 30 fields.
- HubSpot is the intended lead system of record and exposes a callback after a form submission has persisted.
- A single embedded form can preserve field names across every niche page while the page supplies niche and offer context.
- The hosted HubSpot script retains HubSpot's security, spam, accessibility, and platform updates.

Keep a reduced Squarespace-native contact form as a fallback only. It should collect name, work email, organization, service, need date/horizon, project description, phone for rush requests, response consent, niche, offer, latest source, campaign, landing page, and click ID. Connect two storage destinations and test both.

## 1. Generate the implementation package

```bash
.venv/bin/python scripts/ca_inbound.py validate
.venv/bin/python scripts/ca_inbound.py render
.venv/bin/python scripts/ca_inbound.py audit --niche camp --channel site --verbose
```

Expected current result: validation and rendering pass; audit exits `2` because launch gates remain open.

Generated review files live in `outputs/inbound/implementation/`:

- `page-metadata.csv`
- `form-field-map.csv`
- `hubspot-property-plan.csv`
- `hubspot-api-plan.json`
- `hubspot-workflow-plan.csv`
- `nurture-email-plan.csv`
- `nurture-copy-deck.md`
- `asset-library.csv`
- `proof-permission-register.csv`
- `asset-production-queue.csv`
- `squarespace-page-build.csv`
- `squarespace-page-packages.json`
- `asset-readiness.md`
- `ga4-event-plan.csv`
- `gtm-variable-plan.csv`
- `google-ads-conversion-import-plan.csv`
- `measurement-deployment.json`
- `measurement-readiness.md`
- `google-ads-editor-proposal.csv`
- `google-ads-negative-keywords.csv`
- `launch-readiness.md` and `.json`

Do not edit generated files as a source of truth. Update `config/ca_inbound.yaml`, `config/ca_hubspot_properties.yaml`, `config/ca_inbound_nurture.yaml`, `config/ca_inbound_assets.yaml`, `config/ca_inbound_measurement.yaml`, or `lead-intake-schema.json`, then render again.

## 2. Confirm the business layer

Before creating public forms or pages, record dated evidence in `config/ca_inbound.yaml` for:

1. Service area and any local-search location claims
2. Supported order, store, shipping, kitting, and fulfillment models
3. Whether the concept offer is free and who qualifies
4. Response owner and practical internal response target
5. Privacy, upload, and customer-artwork handling
6. Customer names, logos, images, and testimonials approved for public use
7. Any deadline, rush, pricing, revenue-share, or availability language

Set a gate to `complete: true` only with a concrete evidence note. The validator rejects completed gates with empty evidence.

## 2A. Clear the visual and proof queue

Use `asset-production-queue.csv` as the shot/design list and `proof-permission-register.csv` as the approval register.

Use `../proof-capture-workflow.md` for permission-request drafts, case-study questions, capture requirements, and evidence handling.

1. Treat every current gallery image and testimonial as a candidate until dated reuse permission is recorded.
2. Obtain organization, photographer, subject, and parent or guardian permission where applicable.
3. Use real CA work for customer proof. Stock or generated media may support an editorial concept but must never be presented as a customer result.
4. Capture the missing law, private-club, corporate, event, services, store-screen, product-detail, and case-study assets from the briefs.
5. Keep store or workflow screenshots free of recipient, student, customer, order, address, and payment data.
6. Add descriptive alt text based on what the final crop actually shows.
7. Set a slot to `approved` only with evidence in `config/ca_inbound_assets.yaml`, then render and confirm `asset-readiness.md` changes as expected.
8. A page package remains blocked until the page and every required visual/proof slot are approved.

## 3. Create the HubSpot model

1. Confirm whether qualified inbound opportunities will use deals or a separate inquiry object/ticket before changing the account.
2. Review `hubspot-property-plan.csv` for name collisions and existing equivalent properties.
3. Create the `CA Inbound` property group for contacts, companies, and deals.
4. Create or map the proposed fields. Preserve existing HubSpot source fields; the `ca_*` fields are the explicit CA contract.
5. Confirm all 34 form fields map to native or planned contact properties in `form-field-map.csv`; never recreate native identity fields with `ca_*` names.
6. Lock first-touch workflow logic so those fields set only when blank.
7. Let latest-touch fields update only on a new attributable inquiry.
8. Use contact-level `ca_inquiry_status` for pre-deal human review.
9. Do not create a deal for every raw form submission. Route submissions to a human qualification queue first.
10. Create a deal only after a human selects `qualified` and a credible need and next step exist.
11. Build views for new inquiries, overdue responses, qualified pipeline, no-fit reasons, nurture state, and unmatched source.

`hubspot-api-plan.json` contains review-only group and property payloads. It is not an apply script and contains no credentials.

## 4. Build the primary form

Create one HubSpot form with conditional or progressive behavior where the account supports it.

Visible minimum:

- First name and last name
- Work email
- Organization
- Service interest
- Need date or planning horizon
- Project description
- Inquiry-response consent

Useful qualification fields:

- Niche
- Quantity or audience range
- Shipping model
- Organization website
- Phone for rush requests
- Logo or brand assets, only after handling is approved

Hidden fields use the exact `ca_*` CRM property names from `form-field-map.csv`. Page-specific niche and offer values are supplied by the attribution runtime.

Configure the confirmation message conservatively:

> Thanks - we have your project details. A person from Creative Alternatives will review the request and follow up with the most useful next step. If your deadline is urgent, call Kenny at 718-496-5268.

Do not enable a marketing subscription merely because the visitor requested a response.

## 4A. Stage routing and nurture

Use `hubspot-workflow-plan.csv` as the workflow build sheet and `nurture-copy-deck.md` as the copy-review artifact.

1. Keep all five workflows and all 28 emails in draft.
2. Send the accepted-inquiry confirmation only for the specific inquiry; it must not alter marketing consent or subscription state.
3. Enroll marketing nurture only when a human sets `ca_inquiry_status=nurture`, `ca_marketing_consent=true`, and HubSpot reports a subscribed email status.
4. Apply every suppression in `config/ca_inbound_nurture.yaml`, including open deals, active sales conversations, unsubscribes, hard bounces, no-fit, non-buyers, duplicates, and manual pauses.
5. Skip fixed camp dates that are already past; never send a backlog of seasonal emails at once.
6. Include HubSpot's unsubscribe controls in every marketing email.
7. Test one eligible contact and one contact for each suppression before activation.
8. Keep re-enrollment disabled until the first full nurture cycle is reviewed.

## 5. Stage Squarespace code

1. Duplicate or record the current page before editing.
2. Add `squarespace-attribution.js` to site-wide footer code injection inside a `<script>` element, or host it as a versioned same-origin asset.
3. Keep this setting before the runtime while consent behavior is unverified:

```html
<script>
  window.CA_INBOUND_CONFIG = { persistentStorageAllowed: false };
</script>
```

4. After the cookie banner and consent behavior are verified, call the following only when the visitor has granted the required storage consent:

```html
<script>
  window.CAInbound.setPersistentStorageAllowed(true);
</script>
```

5. Add `hubspot-form-embed.html` to the page form section and replace all `[CONFIRM]` identifiers in a private working copy.
6. Do not place a HubSpot private-app token, API key, password, or other credential in page code.
7. Add `data-ca-cta` and `data-ca-placement` to custom CTA links when Squarespace permits it. Phone and email links are detected automatically.

The runtime sends structured events to `window.dataLayer`; it does not itself install Google Tag Manager, GA4, Google Ads, or a consent manager.

## 6. Configure analytics

Create GTM or GA4 mappings for:

- `view_niche_page`
- `cta_click`
- `form_start`
- `form_submit_attempt` as diagnostic only
- `inquiry_submit` after HubSpot confirms persistence
- `phone_click`
- `email_click`
- `view_resource`
- `select_service_path`
- `logo_upload_start`
- `resource_download`

The primary ad optimization event is not the raw attempt. Import `qualified_inbound_lead` only after a human sets the qualified status and the CRM-to-ad-platform connection is tested.

Test that events fire exactly once and contain niche, offer, and page path but no visitor-entered PII.

Use `gtm-variable-plan.csv` for the nine Data Layer Variables and `ga4-event-plan.csv` for the exact 15-event browser/CRM contract. The validator rejects drift between configured client events and literal runtime `track()` calls.

Keep `form_submit_attempt` diagnostic-only. Mark `inquiry_submit` as a secondary key event only after persistence is confirmed. Use `qualified_inbound_lead` as the Google Ads bidding conversion only after the controlled CRM import test passes. Keep quote, customer, and reconciled-revenue events observation-only during the first cycle.

## 7. Stage Wave 1 pages

Build in this order:

1. Services hub
2. Summer camp merchandise
3. Racquet club merchandise
4. Law firm branded merchandise

Keep each page unlinked or password-protected while staging. Do not request indexing until claims, proof, form routing, mobile layout, metadata, canonical state, and events pass.

## 8. Stage paid search

1. Import `google-ads-editor-proposal.csv` into Google Ads Editor.
2. Review and map headers in the import preview.
3. Import `google-ads-negative-keywords.csv` separately.
4. Add approved location targeting and budget inside Editor; neither is supplied as launch-ready data.
5. Keep every campaign, ad group, keyword, and ad paused.
6. Run **Check changes** and resolve every error or warning.
7. Test the landing page and one controlled conversion.
8. Post or enable only after Ryan approves the exact budget, geography, search terms, ads, and conversion actions.

## 9. End-to-end proof

Run these scenarios before removing draft mode:

1. Camp lead from a tagged Google Ads URL with a logo
2. Future-season camp lead from organic search
3. Existing customer requesting a reorder
4. Law-firm lead from LinkedIn without a logo
5. Urgent event request
6. Single-item consumer request
7. Vendor solicitation
8. Spam submission
9. Form validation failure and retry
10. HubSpot or storage failure

For every scenario verify page context, first/latest touch, CRM record, human owner, qualification path, confirmation, event count, and no accidental deal creation.

## 10. Release control

Only after every required gate has evidence:

1. Run `ca_inbound.py audit` for the exact niche and channel.
2. Confirm the audit returns `READY` and exits `0`.
3. Record the human launch decision.
4. Publish the page while the ad campaign remains paused.
5. Re-run the live form and analytics test.
6. Request indexing.
7. Enable only the approved paid test.
8. Schedule first-week search-term and lead-quality reviews.

## 11. Reporting handoff

Export or automate canonical inquiry, qualified deal, and channel-spend data into the generated templates. Then run:

```bash
.venv/bin/python scripts/ca_inbound_metrics.py ingest --kind inquiries --file [inquiries.csv]
.venv/bin/python scripts/ca_inbound_metrics.py ingest --kind deals --file [deals.csv]
.venv/bin/python scripts/ca_inbound_metrics.py ingest --kind spend --file [spend.csv]
.venv/bin/python scripts/ca_inbound_metrics.py report --start YYYY-MM-DD --end YYYY-MM-DD
```

Re-imports update records by stable ID. The report contains no contact PII and flags won deals that still need QuickBooks customer or invoice/order keys.

## Official platform references

- Squarespace code injection: `https://support.squarespace.com/hc/en-us/articles/205815908-Using-code-injection`
- Squarespace form blocks and storage: `https://support.squarespace.com/hc/en-us/articles/206566737-Form-blocks`
- Squarespace hidden fields: `https://support.squarespace.com/hc/en-us/articles/205814018-Form-fields-explained`
- HubSpot hosted form embeds and persisted-submission callbacks: `https://developers.hubspot.com/docs/cms/start-building/features/forms/legacy-forms`
- HubSpot CRM property types, including form-available file properties: `https://developers.hubspot.com/docs/api-reference/latest/crm/properties/guide`
- Google data layer: `https://developers.google.com/tag-platform/devguides/datalayer`
- Google Ads Editor CSV preparation: `https://support.google.com/google-ads/editor/answer/56368?hl=en`
- Google Ads Editor import review: `https://support.google.com/google-ads/editor/answer/30564?hl=en-GB`
