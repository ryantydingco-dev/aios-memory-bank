---
name: oloxa-sway-handoff-schema
description: "The standardized schema Ryan & Sway share for Oloxa enriched batches (unified 0-100 score, GB/US/CA, 4-tier confidence, signal_date), and the script that emits it."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4b67e6ea-75b4-412d-bb95-ab9a1383e301
---

Ryan and his partner **Sway** co-enrich a UK/US/CA Oloxa lead universe and need the batches in one comparable schema (agreed 2026-06-01). The format is defined once in `AI GTM Engine/Operations/scripts/sway_schema.py` and consumed by BOTH `generate_oloxa_daily_batch.py` (baked in 2026-06-01 — every future daily batch is born standardized) and `standardize_for_sway.py` (re-emits the older curated `*_HOT_*_ENRICHED.csv`). `build_master_queue.py` merges the per-region standardized files into one ordered pull-list: `sway_handoff/Oloxa_MASTER_QUEUE_<date>.csv` + a readable `Oloxa Master Pull List - <date>.md`.

**The shared schema:**
- **Score (recency-PURE):** `fit_score` 0–50 + `behavioral_score` 0–50 = `total_score` 0–100. Source dims run 0–12 → mapped `÷12×50` (percent-of-max). Recency is deliberately NOT in the score — it rides in the date fields + the tier (Sway's "without a date they look identical" rule).
- **country:** 2-letter `GB`/`US`/`CA`.
- **intent_confidence (Buying Signal Tier):** `HIGH / MEDIUM_HIGH / MEDIUM / LOW` — curated tier refined by recency (fresh MEDIUM→MEDIUM_HIGH; aging/stale HIGH capped; NONE→LOW).
- **primary_signal_refined:** HIRING/CLOSING/COMPLEXITY/VOLUME/GROWTH/PAIN/HIGH_VALUE/SPEED_PROMISE/MOVE/NONE.
- **signal_date + signal_timeframe + recency_tier + signal_date_basis** — the recency Sway needs for priority + Loom lines.

**Why / key facts:**
- Source files: `AIOS/Dealthread/managed-agents/exports/oloxa/sway_handoff/Oloxa_HOT_{UK,US,CA}_ENRICHED.csv`. Signal recency is recovered by joining to `signal_post_age` (LinkedIn post age) in `smartlead_segments/*.csv` (US+UK) and the per-region `Oloxa_*_CFB_Priority.csv` files.
- **UK/US dates are authoritative** (real post age, 100% join). **CA was only fit-scored** — no behavioral score, no post age anywhere — so CA behavioral is derived from signal type and CA dates are best-effort text estimates (`signal_date_basis` flags this). CA should be re-scraped to reach UK/US quality.
- `linkedin_provider_id` emitted empty (can't resolve ACoAA from vanity URLs; Sway resolves on import).
- **Inbound RAW lists from Sway** (e.g. `sway_inbound/sway-uk-leads-full-ICP-194_...csv` — 194 UK, no signal/score columns) can't be enriched to full signal depth without a LinkedIn-activity scrape — only firmographic **fit** is derivable. `enrich_sway_uk_icp.py` produces the standardized fit-scored *base* + a `*_scrape_input_*.csv` of LinkedIn URLs to feed AI Arc/Apify; signals/dates fill in after the scrape (only ~3 of 194 overlapped our existing signals). Never fabricate the signal layer.
- Reuses [[oloxa-recency-guardrail]]'s text date extraction for the CA fallback; future-dated text mentions are rejected.
- Output: `sway_handoff/Oloxa_{UK,US,CA}_ENRICHED_standardized_<date>.csv` + a transform note. Originals never modified.

**Live enrichment pipeline (built 2026-06-01) — raw list → send-grade signals:**
- **Scrape** LinkedIn posts: `Dealthread/managed-agents/apify_scrape_urls.py` (stdlib urllib, no `requests`) → Apify actor **`apimaestro~linkedin-profile-posts`**, token `APIFY_API_TOKEN` in `aios-starter-kit/.env`. Posts carry `posted_at.date` (exact) + `.relative` + `text`. (176/194 scraped in ~71s. Apify has a monthly hard limit — Ryan raised it to $200.)
- **Classify** (send-grade): `claude_signal_enrich.py` — calls Anthropic Messages API via **urllib** (no SDK; `ANTHROPIC_API_KEY` in `aios-starter-kit/.env`, model `claude-sonnet-4-5`), reusing `enrich_hot_with_claude.py`'s skeptical `report_lead` prompt. Keyword classification (signal_label) is too noisy (over-flags MOVE/HIRING) — **use Claude for anything going to Sway.** Adds `signal_post_date` so signal_date = exact post date. `process_apify_signals.py` is the keyword fallback (triage only).
- **Emails:** Ryan uses **AI Ark** (NOT Hunter/Apollo — those keys are dead/stale, ignore them). `AI_ARK_API_KEY` + `AI_ARK_BASE_URL` (`https://api.ai-ark.com/api/developer-portal/v1`) in `.env`. **Email = `POST /people/export/single` (header `X-TOKEN`) → VALID personal email, synchronous, 1 credit.** KEY UNLOCK: it accepts **`{"url": <linkedin_url>}`** as well as `{"id": <ai_ark_id>}` — the `{url}` form resolves any lead by LinkedIn profile URL, so NO id/search needed. `ai_ark_emails.py` batches it (got 46 personal emails on Sway's missing set; overrides FireCrawl generics like `info@`→`mike@`). AVOID: `/people/search`, `/people/match`, `/people/email-validation` all 401 (no scope on this token); `/people/email-finder` is async (needs trackId+webhook). `find_emails.py` is the export-by-id example. FireCrawl fallback (`firecrawl_emails.py`, `FIRECRAWL_API_KEY`, ~99k credits) scrapes company sites for emails — ~1/3 homepage yield, name-matched.

Related: [[oloxa-recency-guardrail]] [[oloxa-battlecard-workflow]]
