---
name: ca-outbound-pipeline
description: The /ca-outbound one-command cold-outbound pipeline built 2026-07-07 — AI Ark → crawl → personalize → gates → SmartLead DRAFT → Telegram. Draft-only. All 28 GrowthEngineX skills installed. Data engine = AI Ark only.
metadata: 
  node_type: memory
  type: project
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Built 2026-07-07 in the CA workspace. Full docs: `Creative-Alternatives-AIOS/scripts/CA-OUTBOUND-README.md`. This is the game-plan weeks-5-6 outbound-v2 build, automated into one command.

**Install:** all 28 GrowthEngineX coldoutboundskills are now in `Creative-Alternatives-AIOS/.claude/skills/` (was 6, added 22). Data engine = **AI Ark ONLY** (Apollo + LEAD411 removed from memory per Ryan 2026-07-07; the standalone lead411 memory was deleted).

**The pipeline — `/ca-outbound <financial|law> [--limit N]`:**
1. AI Ark pull (MCP: industry_search/location_search to resolve enums → email_finder → poll email_finder_results). REST base `https://api.ai-ark.com`, key `AI_ARK_API_KEY` in CA .env.
2. `scripts/ca_outbound_prep.py crawl` — site crawl → company_description.
3. `/ca-personalization-subagent` (NEW skill, adapted from personalization-subagent-pattern) — Task-tool fan-out, per-lead `situation_line` (opener) + mockup-tease `cta_line`, Swag Handled offer + named proof (Thermo Fisher/Trinity Health/Farm Credit East), approval loop then scale.
4. Gates: `/spam-word-checker` + `/list-quality-scorecard`.
5. `ca_outbound_prep.py assemble|variants` → leads.csv + variants.yaml.
6. Upload DRAFT via the repo's proven `upload.ts` (npx tsx; node v22 available) — VALIDATED end-to-end (parsed clean, died only at fake-key 401, nothing created).
7. `ca_outbound_prep.py notify` → Telegram review ping.

**Key files:** skill `ca-outbound` (orchestrator) + `ca-personalization-subagent`; `config/ca_outbound.yaml` (ICP AI Ark filters from the proven 2,918-match batch-1 query; NY/NJ/CT, 25-500 emp, office-mgr/marketing/ops/HR/EA/partner titles); `config/ca_variants_template.yaml` (Maclaine's Swag Handled copy, MUST stay compatible with upload.ts's restricted YAML parser — quoted `\n` bodies, no `|`/`{}`); `scripts/ca_outbound_prep.py`.

**Guardrails (hard):** DRAFT-ONLY, never sends/activates · per-run cap ≤100 leads · cold inboxes only (never the reactivation/warm pool — deliverability firewall) · exclude existing customers/competitors · only the opener is personalized, proof+mockup-tease stay static · email teases the mockup (no embedded image in #1).

**Prerequisites before it can actually run a real campaign:** (1) tag SmartLead cold inboxes `financial`/`law` via /smartlead-inbox-manager (else upload.ts throws "no healthy inboxes"); (2) run once interactively to tune+lock the personalization prompt; (3) upload.ts does NOT set stop-on-reply/tracking-off → set those in the SmartLead UI at review.

**Scheduling:** `scripts/ca_outbound_cron.sh` + `~/Library/LaunchAgents/com.aios.ca-outbound.plist.disabled` (biweekly ICP rotation, Mon 7:30) exist but are OFF by default — enable only after the 3 prerequisites. Runs `claude --print` headless, still draft-only.

**Cheap lead waterfall (built 2026-07-07, `/ca-leads`):** `scripts/ca_lead_waterfall.py` self-sources leads so AI Ark is gap-filler only. Stages: registry-ny-law (FREE NY Attorney Registrations Socrata `eqw2-r5nb` → real attorney+firm+phone+address, filtered NY-metro counties + currently-registered) → resolve-domains (Google Places, owned, firm→domain+main phone, ~1000 free/mo) → permute (free, top email formats) → verify (pluggable ZeroBounce/MillionVerifier, per-firm pattern detection to save cost) → build (→ `outputs/ca-outbound/<run>/leads.json` email-ready + `call-list.json` phone-only). TESTED LIVE: 300 real attorneys pulled free, Places resolved real domains (schlamstone.com etc.)+phones, permute correct. `/ca-outbound --leads <path>` consumes it and SKIPS AI Ark. **BLOCKER: ZeroBounce key returns -1 (invalid/no credits) → no email verification works right now.** Fix ZEROBOUNCE_API_KEY or add MILLIONVERIFIER_API_KEY to .env ($39/10k, recommended). Until then the waterfall still produces the free phone call-list; email path waits on a verifier. Full playbook: [[self-sourcing-leads-playbook]].

**PII note:** fresh AI Ark lead pulls + waterfall lists go to `outputs/ca-outbound/` which is now gitignored. Pre-existing: `outputs/gtm-sprint-2026-07-06/reorder-rescue-call-list.csv` (117 customer contacts) IS tracked in the private CA repo — legitimate synced business data, but be aware it's in git. Related: [[ai-usecase-research-2026-07]], [[creative-alternatives-aios]], [[two-machine-sync]].
