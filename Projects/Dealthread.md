# Dealthread

## What it is
A managed-agent AIOS deployment concept for brokerages, plus an active DealThreads product-build lane for an AI website intake widget.

Key source:
`/Users/ryantydingco/Documents/AIOS/Dealthread_AIOS_Kit/README.md`

Active DealThreads build path:
`/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/deal-threads-dev/`

Evaluation harness path:
`/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/deal-threads-eval/`

## Architecture — brokerage AIOS kit
An eight-agent fleet for brokerage operations:
- ISA
- Showing Assistant
- Offer Writer
- Transaction Coordinator
- Closing Coordinator
- Marketing Manager
- Operations Lead
- Admin Assistant

The brokerage interacts with one Ops Lead and gets a Friday Receipt while specialist agents operate underneath.

## Deployment principle
Clone → configure → deploy. Tenant-specific details live in configuration; the kit itself should stay reusable.

## Important guardrail
Do not deploy all eight agents on Day 1. Start with Ops Lead + the worst-scoring workflow specialists.

## Current positioning context
Dealthread remains the product/service lane for AIOS-style managed agents and operational automation. Recent content planning introduced a split-brand direction: Dealthread can stay focused on the offer while **Mocha Builds** becomes the broader AI-build/content brand.

## DealThreads widget build context
Recent sessions also focused on **DealThreads** as an AI website intake widget:
- A `<script>` tag drops a chat widget onto a customer website.
- A visitor has a short multi-turn conversation.
- The system extracts a structured B2B lead profile.
- It enriches/scores the profile, builds a rep-ready brief, routes the lead, and hands off to HubSpot/CRM.
- Brand spine: **“never lose the thread.”**

Technical context:
- Active product path: `/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/deal-threads-dev/`
- Eval path: `/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/deal-threads-eval/`
- Key product files include `server.js`, `src/llm-extractor.js`, and `src/internal-enrichment.js`.
- `server.js` is large and the product folder has repeatedly appeared not to be a git repo.
- `src/llm-extractor.js` exports extraction/merge helpers, including `llmExtractionMode`, `llmExtractionSettings`, `extractLeadFieldsWithLlm`, and `mergeExtractedProfile`.

## 2026-06-02 product/eval progress
Codex implemented targeted extraction/routing/scoring fixes against the live DealThreads product and eval harness.

Durable behavior changes:
- `src/llm-extractor.js`: LLM extraction can override heuristic conflicts when confidence/evidence supports it, instead of heuristic-first values always winning.
- `server.js`: timeline parsing handles more real buyer language (`this quarter`, `by Friday`, `asap`, `soon`, month/Q references, etc.).
- `server.js`: missing required fields no longer automatically block lead creation; incomplete cases can build as leads with human review.
- `server.js`: defaults/taxonomy were tightened to reduce invented facts and improve seniority, authority, buying-stage, support, partnership, RevOps, tiny-shop, and vendor-evaluation classification.
- Routing/scoring fixes route support cases to `customer_success`, partner/reseller/embed cases to `partnerships`, and allow named company + CRM + clear inbound pain to receive medium-priority sales follow-up even when timeline/budget are missing.

Verified results from the Codex session:
- Keyless live eval: `14/14` cases passing.
- Critical accuracy: `100%`.
- Enum accuracy: `97.6%`.
- Hallucinations: `0`.
- Injection resistance: `100%`.
- Human-review recall: `100%`.
- Product tests: `7/7` passing.
- Perfect guard: `14/14`, exit `0`.
- Example/tamper guard: exits `1` and catches failures.

Important caveats:
- The true post-patch OpenAI/LLM eval depends on a valid key being supplied safely through environment/Railway. Do not store or repeat raw API keys in Markdown memory notes.
- A separate batch-2 enrichment + rep-ready brief handoff was read, but Codex was blocked by sandbox permissions before editing `deal-threads-dev`; no product/eval files changed in that batch-2 session.
- Watch for drift between handoff docs and current `cases.jsonl` / fixtures. Current eval files should be checked before interpreting older handoff expectations.

## How to build alongside other agents
Ryan’s likely high-leverage lane is not to blindly edit the same files Codex is editing. Safer parallel lanes:
- Define/ship an evaluation harness for realistic visitor conversations.
- Test extraction quality, routing correctness, CRM handoff readiness, and rep-brief usefulness.
- Red-team technical claims against the actual code.
- Create acceptance criteria and QA scenarios for Codex to build against.
- Document integration risks and product-quality gaps.

## Monetization / packaging context
AIOS/Dealthread modules are being evaluated as:
- Lead magnets.
- Proof-of-capability artifacts to include in outbound/Looms.
- Future direct-sale products or installable modules.

Highest-priority assets are the ones that can support both Dealthread outbound and Mocha Builds content.

## Open loops
- Remove any raw OpenAI/API key from Markdown docs and keep credentials only in secure env/Railway variables.
- Rerun the true post-patch `--openai` eval once the key is safely configured outside docs.
- Re-run/complete batch-2 enrichment + rep-ready brief fixes in a session where `deal-threads-dev` is writable.
- If the split-brand direction is finalized, update Dealthread bio, website headline, outbound scripts, and content pillars accordingly.
- Decide which module artifacts are ready to package for prospects vs which should stay internal deployment docs.
- Finish/extend the evaluation harness beyond extraction/routing into CRM handoff readiness and rep-brief usefulness.
- Consider putting the active `deal-threads-dev` folder under source control if it remains the canonical build.
- Clarify whether DealThreads and Replede are separate products, renamed versions of the same concept, or adjacent experiments.
