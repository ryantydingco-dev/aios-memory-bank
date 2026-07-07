---
name: ai-usecase-research-2026-07
description: "2026-07-07 dual deep-research (web + YouTube) on AI use cases for Creative Alternatives — 16-item prioritized build list, mockup-wedge commoditization warning, Hermes/Fable 5 reality check."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Full report: `aios-starter-kit/outputs/deep-research/ai-usecases-for-CA-2026-07-07.md` (web sweep: 22 sources, 25 claims 3-vote verified; YouTube sweep: 16 transcripts, 121 use cases evidence-graded). Execution plan (v2, adversarially reviewed): `aios-starter-kit/outputs/deep-research/ai-implementation-gameplan-2026-07-07.md`. Canonical copies for CA work: `Creative-Alternatives-AIOS/plans/ai-usecase-research-2026-07-07.md` + `ai-implementation-gameplan-2026-07-07.md` (alongside market-landscape-2026.md).

**Data correction that must not be lost:** the 2,947 HubSpot contacts are cold leads from the retired consulting sprints — NOT CA customers. Kenny's customer book = QB exports in `Creative-Alternatives-AIOS/context/import/` (qb_customer_contacts.csv, qb_sales_by_customer_by_year.csv, ~370 customers), and a ranked reorder-rescue list already exists: `Creative-Alternatives-AIOS/outputs/gtm-sprint-2026-07-06/` (117 accounts w/ emails + top-25 with owners, call-first). Reactivation runs on THAT, by phone + personal email from the CA domain — never through the SmartLead cold inboxes (deliverability firewall). Mockup pipeline rule: client logo composited deterministically; gen-AI never renders logos/text.

Verified facts that should shape [[creative-alternatives-aios]] decisions:
- **Mockup wedge has a shelf life:** commonsku skubot (AI mockup gen, beta Feb 2026, tier-gated) and SAGE instant virtual samples (Jan 2026) are commoditizing distributor-side mockups within ~6-12 mo. Pivot differentiation to buyer-facing self-serve + speed + the documented build.
- **Top plays (Tier 1):** reverse-prompt audit of Kenny's day → lapsed-customer reactivation over 25-yr order history (Ben AI demonstrated blueprint) → speed-to-lead with mockup in first reply → GrowthEngineX cold-outbound Claude Code skills + Saraev site-crawl personalization ending in a custom mockup.
- **GrowthEngineX repo (CORRECTED 2026-07-07 by full local read of all 28 skills):** the deep-research refutation was WRONG — the repo DOES ship scripted SmartLead warmup/inbox management (smartlead-inbox-manager), spintax gen, deliverability audits (Smart Delivery spam tests), positive-reply scoring, and a draft-mode campaign uploader. Local clone at `Creative-Alternatives-AIOS/reference/aaa-workshops/resources/coldoutboundskills/` matches GitHub HEAD (2026-05-04). Full inventory + install shortlist: `Creative-Alternatives-AIOS/plans/coldoutbound-skills-inventory-2026-07-07.md` (install-now 5: email-deliverability-audit, experiment-design, spam-word-checker, list-quality-scorecard, smartlead-spintax — zero new spend). The 3 skills promised in Nowoslawski's Jul 5 video (waterfall sourcing/contact finding) are NOT pushed yet — check the repo for new commits.
- **Data engine = AI Ark ONLY** (confirmed by Ryan 2026-07-07). CA does NOT use Apollo or LEAD411 — ignore any older memory that names them. AI Ark = discovery + verified emails/mobiles + company data in one (REST base `https://api.ai-ark.com`, key `AI_ARK_API_KEY` in CA .env; MCP tools: company_search, people_search, email_finder→email_finder_results, industry_search/location_search for enum resolution).
- **ASI 2025 SOI:** ~25% of distributors use AI at all; ~50% at the $5M+ tier CA is entering — edge must be depth, not AI copywriting.
- **"Hermes"** = Nous Research Hermes Agent harness (MIT, 210k+ stars, Telegram front-end, self-written skills, NL crons) — reviewer-rated for non-critical solo workflows only; steal patterns, harness optional. Only 16/262 official user stories are business-ops = whitespace for the YouTube channel.
- **No quantified AI-ROI claim survived verification** (all reply-rate/time-savings stats refuted) — never cite them; A/B test CA's own numbers.
- **White space confirmed twice:** nobody documents AI running a real physical-product business — Ryan's build-in-public lane is empty.
- Claude for Small Business plugin already installed in Ryan's session (invoice-chase, lead-triage, crm-cleanup, margin-analyzer); just needs HubSpot/QuickBooks/PayPal connector OAuth.
