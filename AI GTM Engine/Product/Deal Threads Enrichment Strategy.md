# Deal Threads Enrichment Strategy

Last updated: 2026-06-01

## Recommendation

Use self-built enrichment as the default system and treat paid enrichment providers as optional confidence boosters.

## Why

Paid enrichment providers can be useful, but they are a bad default dependency before Deal Threads has proven conversion lift and willingness to pay. They introduce variable API costs, uncertain data coverage, compliance review, and vendor lock-in before the product knows exactly which fields predict sales outcomes.

The first beta should prove whether the core Deal Threads promise works:

- The visitor shares more useful context than a form.
- The rep receives a clearer buyer profile.
- Speed-to-lead improves.
- Qualified meeting conversion improves.

That does not require buying a full person/company database on day one.

## Default Enrichment Stack

The development app now uses an internal enrichment layer by default:

- Visitor-provided company size, CRM, budget, timeline, and need.
- Company website fetch.
- Title and meta description extraction.
- Canonical URL extraction.
- Social/company link extraction.
- Common tech stack detection from page HTML and scripts.
- Same-domain signal-page discovery for pricing, customer proof, integrations, security, careers, and about pages.
- Buying-motion, growth, proof, integration-fit, and enterprise-readiness signals.
- Explicit zero-dollar paid-provider cost tracking on each profile.
- ICP scoring from conversation plus website signals.

This gives Deal Threads a low-cost, inspectable enrichment baseline.

## When To Add Paid Enrichment

Add a paid provider only when one of these is true:

- Internal enrichment leaves too many high-value leads underqualified.
- Sales reps need missing fields that materially change follow-up quality.
- A beta client will pay enough to cover the API cost.
- A specific field, such as headcount, funding, or decision-makers, proves predictive in beta.

## Product Rule

Paid enrichment should never block lead creation or CRM sync. It should be an async add-on that improves confidence when available.

## Current Implementation

Development folder:

`deal-threads-dev/`

Relevant files:

- `src/internal-enrichment.js`
- `src/llm-extractor.js`
- `src/hubspot.js`
- `server.js`

Modes:

- `ENRICHMENT_MODE=internal` by default.
- `ENRICHMENT_MODE=mock` for deterministic local tests.
- `OPENAI_API_KEY` enables optional OpenAI structured extraction.
- `HUBSPOT_TOKEN` enables live HubSpot sync.

Internal enrichment controls:

- `INTERNAL_ENRICHMENT_TIMEOUT_MS=3500`
- `INTERNAL_ENRICHMENT_SIGNAL_PAGE_LIMIT=2`
