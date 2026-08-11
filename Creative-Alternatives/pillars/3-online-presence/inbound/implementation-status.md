# Inbound Implementation Status

Updated: 2026-07-11

This document distinguishes implementation-ready work in the repository from changes that are actually live in customer-facing systems. A checked strategy item does not imply that a page, campaign, integration, or automation has been published.

## Objective coverage

| Requirement | Repository status | Live status | Evidence |
|---|---|---|---|
| Cross-niche inbound strategy | Complete | Operating cadence not started | `plans/inbound-master-implementation-2026-07-10.md` |
| Evidence-based niche priorities | Complete | Quarterly review not started | `niche-registry.md`, `niche-briefs.md` |
| Reusable website architecture | Complete | Not published | `site-architecture.md` |
| Shared conversion and qualification funnel | Complete | Not configured | `shared-funnel-spec.md`, `lead-intake-schema.json` |
| Consent-safe niche nurture | Seven programs and 28 emails complete | Workflows and emails remain draft-only | `config/ca_inbound_nurture.yaml`, `outputs/inbound/implementation/nurture-copy-deck.md` |
| Visual proof and Squarespace production | 16 page packages, 56 asset slots and 177 section rows complete | Seven images and five proof records are candidates; zero slots approved | `config/ca_inbound_assets.yaml`, `outputs/inbound/implementation/asset-readiness.md` |
| GA4/GTM and conversion deployment | 15-event contract and nine GTM variables complete | 0/10 activation gates passed; no tags or imports installed | `config/ca_inbound_measurement.yaml`, `outputs/inbound/implementation/measurement-readiness.md` |
| SEO and paid-search system | Complete | Campaigns not launched | `ads-and-seo-playbook.md` |
| Content and partnership system | Eight resources and 20 sourced channels implemented | Nothing published or contacted | `content-and-partnerships.md`, `resource-copy/` |
| Tracking, CRM, attribution, and reporting design | Complete | Private systems not configured or verified | `measurement-spec.md` |
| Dedicated niche commercial copy | Seven page drafts complete | Not published | `page-copy/` |
| Camp visual staging preview | Commercial page and two resource pages built and responsive-QA'd | Preview only; noindex and form does not transmit | `staging/camp-inbound/`, `tests/test_camp_preview.py` |
| Launch and quality controls | Complete | Gates not passed | `launch-checklist.md` |
| Machine-readable launch preflight | Complete and tested | Correctly blocks current launch | `config/ca_inbound.yaml`, `scripts/ca_inbound.py` |
| Browser attribution and event runtime | Complete and unit-tested | Not installed on Squarespace | `implementation/squarespace-attribution.js` |
| HubSpot property and form package | Contact layer applied and verified | 37 contact properties live; company/deal/form/routing scopes still unavailable | `config/ca_hubspot_properties.yaml`, `implementation/hubspot-form-embed.html` |
| Ads Editor proposal package | Generated with paused status | Not imported, posted, or enabled | `outputs/inbound/implementation/` |
| Local KPI and reconciliation warehouse | Implemented, initialized, and tested | Contains no live inbound exports yet | `scripts/ca_inbound_metrics.py`, `data/data.db` |

## Implementation-ready assets

- Master rollout and channel strategy covering every niche in the registry
- Evidence-ranked launch waves led by camps, racquet/padel, and law
- Shared service, industry, resource, proof, and conversion-page structure
- Squarespace-ready drafts for the services hub and all seven Build/Validate industry pages
- Responsive camp staging build covering the commercial page, planning calendar, store-vs-bulk guide, navigation, metadata, schema, and local-only form behavior
- Google Ads keyword, negative-keyword, campaign, and decision rules
- Technical and on-page SEO requirements
- Buyer-content calendar, proof-capture loop, and partnership channels
- Eight full niche resources with validated metadata and commercial parent paths
- Generated 32-link internal-link map and eight review-only Article/Breadcrumb schema plans
- Twenty sourced partner/directory targets, including ten P1 validation channels, all held in research status
- Dynamic lead form, qualification, routing, nurture, and response rules
- Five draft HubSpot workflow definitions and 28 consent-safe nurture emails across all seven dedicated niches
- Sixteen Squarespace production packages with exact section/block maps and 56 visual/proof slots
- Validated parity between 11 browser events and the attribution runtime, plus four CRM/revenue conversion events
- Nine GTM variable definitions and a fail-closed Google Ads conversion-import hierarchy
- Seven audited current-gallery candidates and five public proof records held behind explicit reuse-permission gates
- HubSpot property model, GA4 events, UTMs, attribution, and QuickBooks reconciliation
- End-to-end launch checklist with stop conditions
- Fail-closed CLI that rejects incomplete evidence and invalid ad copy lengths
- Consent-aware first/latest-touch attribution and data-layer events without lead PII
- Review-only HubSpot API/property plan and embedded-form template
- Paused Google Ads Editor proposals and shared negative-keyword package
- Idempotent inquiry, deal, and spend imports with source-to-revenue reporting

## Current live-state gaps

The following must remain marked incomplete until verified inside the authenticated system:

- Squarespace navigation, metadata, forms, schema, pages, and sitemap changes
- HubSpot company/deal fields, form, workflows, routing, lifecycle stages, and dashboards
- GA4 events and conversions
- Search Console ownership, sitemap submission, and indexing checks
- Google Ads campaigns, negatives, conversion actions, budgets, and test leads
- Google Business Profile ownership, accuracy, and service-area settings
- Call tracking, if adopted
- Public use permission for customer names, logos, images, and testimonials
- Production or approval of every hero, support, proof, inline-tool, and social-share asset in `asset-readiness.md`
- Approval of store economics, free-concept policy, rush language, delivery claims, and response SLA
- One complete test from traffic source through qualified lead, follow-up, opportunity, order, and revenue reconciliation

No public publishing, ad spend, customer outreach, or automated customer response should occur without human approval.

## Definition of live

The inbound engine becomes live only when:

1. Gates 1-5 in `launch-checklist.md` pass for the first niche.
2. A real or controlled test submission reaches the correct owner with source data intact.
3. The submission can be classified as qualified, no-fit, duplicate, spam, or nurture.
4. An opportunity and eventual order can be reconciled to the originating channel.
5. The first weekly review produces a documented keep, revise, scale, or pause decision.

## Immediate execution order

1. Confirm business claims, customer permissions, response owner, and capacity.
2. Obtain authenticated access listed in Gate 2 without storing credentials in the repository.
3. Grant the missing HubSpot scopes, then configure company/deal properties, form, routing, and attribution persistence.
4. Clear the services and camp asset/permission queues, then repair the shared Squarespace foundation and stage the services hub.
5. Stage, publish, and test the camp page and funnel after its complete page package passes.
6. Launch a controlled camp search experiment only after attribution and routing pass.
7. Publish racquet/padel and law using the same verified system.
8. Select later niches from measured demand, economics, proof, and delivery burden.

## Confidence and gaps

Confidence is high that the repository now covers the requested strategic and implementation design surface. Confidence in live readiness is intentionally low until authenticated access, business approvals, and end-to-end tests provide direct evidence.

Current automated evidence:

- Configuration validation passes.
- Thirty-six Python launch-control, measurement, page-package, asset-permission, form-contract, nurture, organic-layer, partner, KPI, and camp-preview tests pass.
- Seven JavaScript attribution tests pass.
- Camp paid preflight exits `2` with 25 open gates, as designed.
- Generated ad entities are `Paused` and contain no approved budget or geography.
- Local inbound database tables exist and the live-data baseline is currently zero.
- HubSpot `CA Inbound` contact group has 37/37 planned properties with no schema mismatch; company, deal, pipeline, and form requests return `403` until the private app gains the required scopes.
- All 16 page packages have complete assembly and asset requirements; zero are falsely marked publish-ready while permission and production evidence is absent.

See `implementation/live-system-audit-2026-07-10.md` for the current public and authenticated evidence behind this status.

The exact account-creation and ownership sequence is in `implementation/account-provisioning-runbook.md`.
