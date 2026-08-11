# Creative Alternatives Inbound Operating System

This folder owns the online system that turns search, content, social proof, partnerships, directories, referrals, and paid traffic into attributable sales opportunities.

## Governing principle

Build one measurable acquisition system, then express it through each niche. Do not create disconnected campaigns, generic AI pages, or content that cannot be tied to a buyer, offer, and next action.

## System map

```text
Market evidence
    -> niche registry
    -> service and niche page
    -> conversion offer
    -> structured lead intake
    -> HubSpot qualification
    -> concept / call / quote
    -> order
    -> review / case study / referral / reorder
    -> stronger market evidence
```

## Source of truth order

1. QuickBooks for customer, order, revenue, and reorder evidence.
2. HubSpot for new-lead source, lifecycle, pipeline, and sales follow-up.
3. Google Ads, Search Console, GA4, call tracking, and Business Profile for acquisition evidence.
4. Customer conversations, replies, and approved testimonials for buyer language.
5. Public market and competitor research for supporting hypotheses.

## Files

- `niche-registry.md` - every current niche, evidence, offer, URL, channel, and launch status.
- `site-architecture.md` - service, niche, resource, proof, and conversion-page structure.
- `shared-funnel-spec.md` - reusable forms, qualification, nurture, and lead-handling behavior.
- `ads-and-seo-playbook.md` - keyword, campaign, on-page, technical, and testing rules.
- `content-and-partnerships.md` - buyer-facing content system and concentrated distribution.
- `measurement-spec.md` - event names, HubSpot fields, lifecycle rules, scorecard, and review cadence.
- `niche-briefs.md` - page and offer briefs for the active and queued niches.
- `lead-intake-schema.json` - structured intake, qualification, attribution, and routing contract.
- `page-copy/` - Squarespace-ready services hub and all seven Build/Validate industry-page drafts.
- `resource-copy/` - eight full planning, timeline, checklist, and comparison resources covering every dedicated niche.
- `partnership-outreach-templates.md` - human-reviewed education, directory, chapter, conference, and referral drafts.
- `proof-capture-workflow.md` - permission records, outreach drafts, case-study questions, shot list, and weekly proof queue.
- `launch-checklist.md` - approval, access, data, publishing, campaign, and QA gates.
- `implementation-status.md` - repository coverage, current live gaps, and immediate execution order.
- `30-day-channel-validation-plan.md` - the current one-niche activation plan across LinkedIn, website/Google organic, and one ACA community path.
- `implementation/` - attribution runtime, HubSpot form template, and platform installation runbook.
- `implementation/live-system-audit-2026-07-10.md` - authoritative public/authenticated status and exact access gaps.

## Machine-readable implementation

- `config/ca_inbound.yaml` - niche rollout, offers, page metadata, ad proposals, owners, and evidence gates.
- `config/ca_hubspot_properties.yaml` - review-only contact, company, and qualified-opportunity property model.
- `config/ca_inbound_partners.yaml` - sourced, draft-only association, directory, conference, and supplier-channel registry.
- `config/ca_inbound_nurture.yaml` - consent-safe inquiry routing, suppression, workflow, and seven-niche nurture source of truth.
- `config/ca_inbound_assets.yaml` - visual slots, current-site candidates, proof permissions, production briefs, and page-package controls.
- `config/ca_inbound_measurement.yaml` - browser/CRM event parity, GTM variables, conversion hierarchy, PII exclusions, and activation gates.
- `scripts/ca_inbound.py` - validates configuration, renders implementation files, and fails closed on launch readiness.
- `scripts/ca_inbound_metrics.py` - imports canonical inquiry, deal, spend, and reconciliation facts into SQLite and produces cohort reports.
- `outputs/inbound/implementation/` - generated page, form, CRM, ad, and readiness files.
- Generated organic, CRM, page-production, and measurement files include `resource-metadata.csv`, `internal-links.csv`, `structured-data-plan.json`, `partnership-tracker.csv`, `partnership-scorecard.md`, `hubspot-workflow-plan.csv`, `nurture-email-plan.csv`, `nurture-copy-deck.md`, `asset-production-queue.csv`, `squarespace-page-build.csv`, `squarespace-page-packages.json`, `asset-readiness.md`, `ga4-event-plan.csv`, `gtm-variable-plan.csv`, `google-ads-conversion-import-plan.csv`, and `measurement-readiness.md`.
- `outputs/inbound/templates/` - canonical CSV headers for HubSpot, deal, and channel-spend exports.
- `outputs/inbound/reports/` - source-to-qualified-lead, quote, customer, spend, and revenue reports.
- `operating-system/trackers/inbound/` - the channel-level execution log and weekly pilot scorecard.
- `operating-system/templates/inbound-channel-weekly-review.md` - the keep/change/expand/pause decision surface.

```bash
.venv/bin/python scripts/ca_inbound.py validate
.venv/bin/python scripts/ca_inbound.py render
.venv/bin/python scripts/ca_inbound.py audit --niche camp --channel paid --verbose
.venv/bin/python scripts/ca_inbound_metrics.py init
.venv/bin/python scripts/ca_inbound_metrics.py templates
.venv/bin/python scripts/ca_inbound_metrics.py report --start 2026-07-01 --end 2026-07-31
```

The audit intentionally exits `2` while required launch gates remain incomplete.

## Existing companion assets

- `plans/inbound-master-implementation-2026-07-10.md`
- `plans/camp-inbound-experiment-brief-2026-07-10.md`
- `pillars/2-customer-acquisition/mockup-lead-magnet-sop.md`
- `pillars/2-customer-acquisition/gtm-from-the-data.md`
- `pillars/2-customer-acquisition/outbound/smartlead-campaign-analysis.md`

## Operating rules

- Human review for customer, vendor, pricing, order, and public actions.
- `[CONFIRM]` any unverified economics, guarantee, customer result, or fulfillment promise.
- No page becomes indexable until it contains unique buyer value and a tested CTA.
- No paid channel scales until qualified lead and pipeline outcomes are visible.
- No niche expands because it sounds attractive; it must pass the evidence gate.
- Every useful customer interaction should improve page copy, content, ads, FAQs, or qualification.
