# GrowthEngineX coldoutboundskills — Full 28-Skill Inventory for CA
**Date:** 2026-07-07 · **Method:** one reader agent per skill over the local clone at reference/aaa-workshops/resources/coldoutboundskills (matches GitHub HEAD, last commit 2026-05-04). Companion to ai-implementation-gameplan-2026-07-07.md (weeks 1 + 5-6).

**Note:** the three skills promised in Nowoslawski's 2026-07-05 video (company-waterfall, contact-finding) are NOT in the repo yet — watch for a new push.

---

# Cold-Outbound Skills Pack — Synthesis for Creative Alternatives

## 1. SmartLead verdict: prior conclusion OVERTURNED

"Campaign upload only — no inbox/warmup/spintax operation" is wrong. The repo has working code or prompt logic for all three, plus analytics and spam testing:

- **Warmup operation — YES, scripted.** `smartlead-inbox-manager/set-warmup.ts` enables/disables warmup per inbox via `POST /email-accounts/{id}/warmup` with three presets (enable: 40/day cap + ramp 5 + 20% reply rate; insurance: 15/day; disable), bulk-looped with selectors (`--all`, `--domain`, `--tag`, `--ids-from-csv`).
- **Inbox operation — YES, scripted.** Same skill: `tag-inboxes.ts` (tag lifecycle via full-list replacement), `set-signatures.ts` (bulk signature templating), `list-health.ts` (health dashboard: reputation, blocked flag, SMTP/IMAP status, sent-today, CSV export). Limitation: it manages existing inboxes — inbox *provisioning* is external (Zapmail skill).
- **Spintax — YES, as copy generation.** `smartlead-spintax` produces Smartlead `{a|b|c}` syntax with combo-grammar verification and never-spin rules for `{{variables}}`/`%signature%`. It's a prompt skill, not an API call — but SmartLead ingests spintax in the body, so that's the correct layer.
- **Campaign upload — YES, and better than the MCP.** `smartlead-campaign-upload-public/upload.ts` packages create → A/B/C sequence save → tag/LRU healthy-inbox attach → batched lead upload with per-lead custom fields (`situation_line`/`value_line`/`cta_line`) → tracking-off/stop-on-reply settings → schedule, draft-only by design. `auto-research-public/phase-upload.ts` is a second, activation-capable implementation.
- **Beyond upload:** Smart Delivery spam-placement test create/poll/pull (`email-deliverability-audit/run-spam-test.ts` — no MCP equivalent), reply extraction + positive-reply-rate scoring (`positive-reply-scoring`), per-inbox-type reply/bounce comparison (`deliverability-test-public`), campaign/mailbox analytics scripts, and a full API reference (`smartlead-api`, cold-email-starter-kit's `08-smartlead-api.md`) documenting the exact `seq_variants` JSON, custom_fields schema, webhooks, and rate limits.

**Genuinely absent:** master-inbox reply *sending* (documented only), webhook wiring, lead-category writes, and inbox creation inside SmartLead. Several skills also reference sibling scripts missing from the distribution (`generate-report.ts`, `score-batch.ts`, competitor-engagers' entire pipeline) — spot-check before relying on any referenced file.

## 2. Install-now shortlist (use-as-is, ordered by value to live Financial + Law campaigns)

| # | Skill | What it adds | Effort |
|---|-------|--------------|--------|
| 1 | **email-deliverability-audit** | Weekly Monday health check: DNS SPF/DKIM/DMARC via dig, per-inbox reply/bounce flags (1% rule, 3% bounce), Smart Delivery spam-placement baseline — take the baseline BEFORE the weeks 5-6 A/B so copy effects aren't confounded with deliverability drift | ~1 hr; export `SMARTLEAD_API_KEY`, run 3 tsx scripts; Claude writes the report (generate-report.ts missing) |
| 2 | **experiment-design** | Governs the weeks 5-6 A/B correctly: two separate campaigns per arm (NOT SmartLead's in-campaign A/B), same-day launch, split inboxes, pre-registered thresholds, day-21 positive-reply judgment. Honest caveat: CA volume is below the 500/arm minimum — pool verticals or accept MEDIUM confidence / only-2x-effects detectable | Drop-in (pure framework) |
| 3 | **spam-word-checker** | Always-on copy QA before every `save_campaign_sequence` — directly relevant since "financial," "insurance," and "invoice" are banned tokens in CA's own vertical copy and prospect firm names (company-name sanitization rule handles this) | Drop-in |
| 4 | **list-quality-scorecard** | Pre-upload B-grade gate on every new AI Ark batch: verification coverage, dupes, title drift (paralegals in a partner list), role addresses | 30-60 min to write per-vertical ICP yaml |
| 5 | **smartlead-spintax** | Spin the boilerplate (greetings, opt-outs, mockup-CTA close) around unique per-lead icebreakers; combo-grammar verification is the value over naive spintax | Drop-in; push output via MCP `save_campaign_sequence` |

## 3. Adapt list (one-line adaptation each)

**Core for weeks 5-6:**
- **personalization-subagent-pattern** — rewrite the 3-field schema (situation/value/cta) around firm-site crawl input and the free-mockup CTA; run the approval loop, push merged fields via SmartLead MCP. Zero API cost.
- **campaign-copywriting** — use Problem Sniffing vs AI Generic as the exact A/B arms; replace the Email-4 "value bomb" with the custom mockup; skip variants.yaml, push via MCP.
- **smartlead-campaign-upload-public** — rename the merge columns (e.g., add `mockup_line`) and tag CA's cold inboxes first; then it's the one-command draft launcher for the A/B arm campaigns.
- **positive-reply-scoring** — port the fetch step to SmartLead MCP calls, keep the 11-label taxonomy/benchmarks verbatim; this is the A/B success metric.
- **auto-research-public** — cannibalize phase-scrape.ts (icebreaker input) + the phase-6 parallel-subagent fan-out; swap Prospeo/MillionVerifier phases for existing AI Ark lists. Don't run the full autonomous loop.
- **icp-prompt-builder** — write a CA qualification prompt (exclude existing/dormant customers and other distributors); score via Task subagents since score-batch.ts is missing.
- **smartlead-api** — keep as the schema reference (seq_variants JSON, custom_fields, distribution-field gotcha) the MCP tool descriptions don't spell out.

**Operational layer:**
- **cold-email-weekly-rhythm** — translate the Mon/Wed/Fri cadence to SmartLead MCP calls and wire into the existing launchd/Telegram brief; keep the 1%/2%/21-day thresholds.
- **deliverability-incident-response** — break-glass runbook; map script references to MCP tools and swap Zapmail for CA's actual provider.
- **smartlead-inbox-manager** — adopt the active/insurance/retired tag convention and 1% retirement rule; run list-health.ts weekly via launchd.
- **deliverability-test-public** — run as-is with the API key, but expect noisy results on a small fleet; the value is the by-provider aggregation logic.

**Later / conditional:**
- **campaign-strategy** — run with CA as the client to mine Kenny's 25 years of customers for lookalike/new-hire campaign angles; strip Clay/Zapmail scaffolding.
- **icp-onboarding** — reuse scrape-website.ts as-is; adopt client-profile.yaml as CA's canonical config, swapping Prospeo taxonomy for AI Ark vocab. Run per NEW vertical only.
- **lead-magnet-brainstorm** — the mockup already IS the magnet (~19/20 on its own rubric); steal the reply-hook CTA pattern and never-gate/no-meeting audit rules.
- **cold-email-starter-kit** — treat as a knowledge base only (copywriting/reply-handling/API payload docs); skip all infrastructure chapters.
- **zapmail-domain-setup-public** — shelf until capacity expansion or a burned domain; also the clean path to a separate reactivation inbox pool (enforces the never-ride-cold-inboxes rule). Needs new Dynadot+Zapmail accounts.
- **blitz-list-builder / disco-like** — marginal; only if AI Ark quality plateaus, and each needs a new paid key. Steal the sample-before-bulk discipline for free.

## 4. Skip list

- **cold-email-kickoff** — day-zero onboarding wizard; CA is live with ICP, offer, and campaigns already running.
- **competitor-engagers** — the entire npm pipeline it invokes is missing from the repo (days-long rebuild) and law/financial buyers don't engage with promo-distributor LinkedIn posts anyway.
- **google-maps-list-builder** — company-only SMB storefront data via a new paid RapidAPI, needing two more enrichment hops; AI Ark already delivers person-level contacts.
- **prospeo-full-export** — new paid subscription for 25K+ volume exports CA doesn't need; AI Ark covers it.
- **prospeo-search-api** — reference doc for an API CA won't buy; its funding-round filters target VC-backed tech, not law/financial firms.

## 5. Dependency bill (install-now + adapt, deduped)

**Already owned — no new spend:**
- SmartLead API key + paid account (live campaigns) — required by nearly every skill above
- SmartLead MCP server (connected) — replaces most script plumbing
- Node.js + tsx (`npx tsx`) — free, local
- `dig` — built into macOS
- Claude Code Task subagents — the personalization/ICP-scoring engine, no extra API cost
- AI Ark (data engine) + Apify — replace all Prospeo/Blitz/DiscoLike data calls in the core set

**Possible new spend, decision needed:**
- SmartLead **Smart Delivery** add-on — required only for the spam-placement test in email-deliverability-audit (verify it's on the current plan; may consume credits)
- **Email verifier** (MillionVerifier ~$0.50-2/1,000, or equivalent) — list-quality-scorecard only *reads* a verification column; something must populate it. Check whether AI Ark verification status suffices before buying.

**Conditional / deferred (only if those skills activate):**
- Blitz API (~$0.02-0.10/lookup) — blitz-list-builder only
- DiscoLike API ($0.10/call + $2/1,000 records) — disco-like only
- Dynadot (~$10-14/domain) + Zapmail (per-mailbox monthly) — zapmail-domain-setup-public, capacity expansion only

**Explicitly avoided by the adaptations:** Prospeo, RapidAPI (LinkedIn + Maps), OpenRouter, Instantly.

Bottom line: the install-now five plus the seven core adapts run on zero new subscriptions — the only open questions are Smart Delivery plan coverage and which email verifier populates the scorecard column.