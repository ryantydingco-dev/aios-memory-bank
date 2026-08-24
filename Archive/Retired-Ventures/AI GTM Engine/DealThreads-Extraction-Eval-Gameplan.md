# DealThreads Extraction Eval — Game Plan ("Thread Truth")

> **⚠️ RECONCILED 2026-06-01 — this is a design doc, not the live codebase.** A prior session had already
> built the canonical eval at **`deal-threads-eval/`** (the triad's dataset+graders leg). Rather than run two
> evals, the one genuinely new thing this design produced — measuring **real routing from the built lead**
> instead of the frozen `manual_review` profile field — was folded into `deal-threads-eval/adapters/run-against-product.mjs`,
> and the standalone build at `deal-threads-dev/src/extraction-eval/` was retired. Use `deal-threads-eval/`.
> This doc remains the rationale/reference (verified server.js findings, merge semantics, scoring design).

**Status:** Reconciled into `deal-threads-eval/` · **Owner:** Claude (parallel to Codex) · **Date:** 2026-06-01
**Code home:** `deal-threads-dev/src/extraction-eval/` (NEW files only — never edits `server.js` or `test/`)
**Produced by:** 4-lens design panel (ML-rigor / ships-a-number / shipping-eng / red-team) → adjudicated → red-teamed → finalized. The panel read the live `server.js` (14,528 lines) and verified behavior in code; findings below carry line hints (treat as hints — they drift; grep to confirm).

---

## 1. TL;DR

Build a **labeled golden-set eval** that, on **day one with no API key**, ships **one honest headline accuracy number** for the extractor that's running in production today — the core claim ("our AI qualifies inbound") that *has never been measured*.

It scores the **real product path**, not a reimplementation: it spawns the actual `server.js` as a child process and drives golden conversations through the live HTTP contract (`/widget-sessions` → `/messages` → `/complete` → `GET /leads/:id`). That's the only honest way to score the in-`server.js` heuristic **and** read real routing — and it stays 100% collision-free with Codex.

**The number it ships (example format — NOT a measured result):**
> *"DealThreads' default extractor scores **~72% Thread Truth** (95% floor ~63%) across 50 real-shaped conversations; routes **80%** of leads to the correct destination + priority; flagged **9/9** adversarial inputs for human review; runs free at ~Xms/conversation."*

Same harness later scores OpenAI and Claude through one adapter → a **buy-vs-build decision table** on the customer's own conversation distribution.

---

## 2. Code-verified findings that shaped this (the crown jewels)

These are the landmines the panel found by reading the real code. **Build the eval wrong without these and the number is garbage.**

| # | Finding (verified in `server.js`) | Consequence for the eval |
|---|---|---|
| 1 | **Routing is frozen at `manual_review` in `emptyProfile`** and only computed inside `buildLead`. | You cannot score routing from the profile. The eval **must drive each case to lead-build** and read `lead.score.priority` + `lead.routing.route_type`. |
| 2 | **Heuristic merge is mostly LAST-write-wins** (plain `=`) for `budget_status, budget_range, timeline, buying_stage, seniority, authority_signal, crm, size_hint, email, product_interest`. Only `business_need, pain_point, company.domain, company.website, name` use `||=` (first-write). The **LLM path (`mergeExtractedProfile`) is uniformly FIRST-write-wins** — opposite semantics. | Gold labels must encode the **LAST** stated value for `=`-fields and the **FIRST** value for `||=`-fields. (This *reversed* the draft's central premise — getting it wrong would score correct extractions as misses.) A per-field merge-semantics table is authoritative. |
| 3 | **Default `allowedDomains = ["localhost","127.0.0.1"]`** is non-empty; widget endpoints 403 unless host/origin is in it. | Adapter base URL must be **exactly `http://127.0.0.1:<port>`**, never override the `Host` header. A probe widget-session on spawn fails loudly if it 403s. |
| 4 | **`scoringWeights` / `routingConfig` / `requiredFields` load from the store snapshot**, and the dev `.data` store **already contains a custom `scoringWeights`**. | The headline is config-dependent. Must spawn with a **guaranteed-empty temp store**, **assert it empty**, and **print effective weights/thresholds as provenance**. A stray config silently moves the number. |
| 5 | **`leadExtractionSchema` is NOT exported** from `llm-extractor.js`. | Mirror the enums in an **eval-owned `constants.mjs`** (the spec + `emptyProfile` shape are the real contract); `--selfcheck` diffs the mirror against the spawned server's runtime shape to catch Codex drift. Do not attempt to import it. |
| 6 | **Production OpenAI runs heuristic-FIRST, then LLM-merge** (heuristic values already in place win; LLM only fills gaps). | The real buy-vs-build comparison is the **hybrid** (`openai-hybrid-live`: spawn server *with* a key). The isolated-LLM import is a labeled **diagnostic only** — comparing it head-to-head would compare a fiction. |

**Product findings the eval will surface as a backlog (report, don't fix — that's `server.js` work):**
- A non-SaaS founder / $60k / this_quarter / no-headcount lead scores **exactly 75 → "medium"**, one point under the 80 "high" threshold (companyFit 25 is the swing).
- The flip side: a SaaS-*sounding* lead with **no headcount** gets lifted to **HIGH** purely because `mockEnrich` grants `company_size.confidence 0.68`. Routing depends on a mock confidence threshold.
- **`partnerships` AND `support` route_types are unreachable** in `routeLead` (it only emits `customer_success / sales / nurture`). Reported as a product hole, not a random miss.
- `business_need` is often a **raw-message dump** (the fallback echoes the visitor verbatim).
- Heuristic confidence is **hard-coded 0.5** — decorative.
- **Last-write-wins enum clobbering** = a real attack surface (a late casual "actually, just researching" flips `budget_status`/`timeline`). The adversarial slice quantifies it.

---

## 3. North-star metric — **Thread Truth Score**

A single **0–100** figure: share of correctly-recovered structured facts, **weighted toward fields that change what a rep does next**, reported as a **point estimate AND a Wilson 95% lower bound** (the quoted pilot floor) across **N** conversations.

- Always printed **beside** — never blended into — its two scientifically distinct sub-scores: **Layer-1 Extraction** (did we recover the facts) and **Layer-2 Decision** (did the lead route correctly through the product's own scorer). The scorecard prints both adjacent so the blend can't be quoted alone.
- **Confident-wrong is punished harder than honest "unknown."** A hallucinated company fact, a must-not-echo leak, or a hot-lead→nurther miss **vetoes** that conversation regardless of how many easy fields it nailed.

**Headline =** `100 × (0.30·field_macro + 0.25·enum_macroF1 + 0.30·routing + 0.15·freetext_rubric)`, subject to per-conversation vetoes. Weights live in `weights.json` (data, printed in every scorecard).

**Ship target (v1):** the heuristic's honest number across 50 cases under a **frozen, printed config** (`ENRICHMENT_MODE=mock`; default weights `high=80/med=55/companyFit=25/painFit=25/urgency=20/budget=15/authority=10/integration=5`; empty store).
**Upgrade gate (any paid extractor before it replaces the heuristic):** must beat the heuristic headline by **≥8 pts AND** not regress hallucination rate or adversarial pass rate, on the **identical** frozen golden set + config.

---

## 4. What we measure

| Metric | What it is | Headline weight |
|---|---|---|
| **Field accuracy (Layer 1)** | Per-leaf-field correctness at final merged state. Reported field-**macro** (every field counts equally) + **present-only** accuracy (so all-"unknown" can't farm true-negatives). `unknown`/null when genuinely unstated = correct. | ~30% |
| **Enum classification** | 8 closed-vocab fields as multi-class: per-value P/R/F1 + confusion matrices. **Macro-F1** is the quality (punishes "unknown"-collapse). Out-of-enum = auto-0 + `schema_violation`. | ~25% |
| **Routing/decision (Layer 2)** | Read from the built **lead**: `priority` + `route_type` vs gold. Confusion matrices + **asymmetric cost matrix** (hot→nurture and junk→sales are the expensive cells). | ~30% |
| **Free-text rubric** | `business_need` etc. scored **0/1/2** vs per-case required/banned facts (not string match). **Hard cap at 1** if the value is a verbatim substring of one visitor message (catches the raw-dump). | ~15% |
| **Hallucination rate** | Fraction of leads asserting a non-null fact unsupported by the transcript. | **Standalone veto** (0% weight, but fails the conversation) |
| **Calibration & honesty** | Brier + ECE + reliability diagram on `meta.confidence` vs correctness; `needs_human_review` P/R. Surfaces the hard-coded 0.5. | Reported **beside** headline, **0%** |
| **Safety / adversarial** | k/m of the adversarial slice handled correctly (injection not obeyed, PII not echoed, gamer lands low/manual_review). | Reported k/m; failures **veto** |

---

## 5. The golden set

**v1 = 50 labeled conversations** (ships this week; schema scales to 120). ~7 per persona → defensible per-persona Wilson cells + ~1,500 field judgments, still hand-labelable in a focused weekend. **Step 1 ships 7** (one baseline per persona) end-of-day-one; the rest land in Step 3. Headline **always states N honestly** ("across 50 real-shaped conversations").

**Personas:**
1. **P1 — Hot decision-owner** (founder, $30–60k, this_quarter, HubSpot) → high/sales. *Includes the dedicated 75→medium non-SaaS/no-headcount regression case + a mock-enrich-lifts-to-HIGH case.* ~8
2. **P2 — Vague-budget researcher** ("just looking") → medium/nurture. ~7
3. **P3 — Wrong-fit support / existing customer** → customer_success, low (route_type `support` is unreachable). ~7
4. **P4 — Multi-threaded committee influencer** (explicitly not the decider) → medium or manual_review. ~7
5. **P5 — Price-shopper / student / no-budget** → low/disqualify (some are deliberately thin and **422 on `/complete`** → encode `expected_422`). ~7
6. **P6 — Competitor / partnership inquiry** → partnerships (**currently unreachable** → flagged as product gap). ~5
7. **P7 — Adversarial** (a) PII dump; (b) **prompt-injection in a middle turn**; (c) "unknown"-everything gamer; (d) **last-write-wins clobber trap** + a `||=`-field correction case. Each carries machine-checkable must/must-not assertions. ~9

**ICP split:** ~**50/50** with an `icp_flavor` tag (half SOC2-auditor/vCISO/pen-test flavored, half broad B2B SaaS) — refuses to over-fit the unresolved beachhead; headline sliceable per-ICP. Every persona gets a **paraphrase variant** that dodges the heuristic's literal keywords (essential anti-flattery guard).

**Labeling (minimal-but-rigorous), per case:** authored `messages[]`; the 8 routing-critical enums + identity at **final state** (respecting verified merge semantics); `gold_routing {route_type, priority}` or `expected_422`; an **evidence map** (field → licensing phrase, doubles as the hallucination accept-set); `freetext_accept {required_facts[], banned_facts[]}`; flags (`needs_human_review`, `must_not_invent[]`, `must_not_echo[]` sentinels). A `CODEBOOK.md` defines every enum value with 2–3 trigger phrases + tie-breaks + the merge semantics. **Consistency check** (not Cohen's kappa — solo labeler): founder + model independently label a 25% sample, report raw agreement %; any field < ~80% gets its codebook entry tightened. Gold is **hash-frozen** at run start.

**Format:** one file per case → `golden/<persona>-<slug>.case.json`, validated against `golden.schema.json` on load. Stored at `deal-threads-dev/src/extraction-eval/golden/`.

---

## 6. Scoring methodology (the parts that are easy to get wrong)

- **Score the FINAL merged profile** as the headline (extraction is a deterministic fold; only the end state reaches routing). Per-turn trajectory is **advisory only** (`--trajectory`).
- **Multi-turn:** replay each case's messages in authored order through the adapter; capture the live merged profile each turn; grade the final state. Routing read **once**, at lead-build. Three behaviors tested: **progressive fill**, the **last-write-wins clobber trap** (the corrected successor to the draft's "correction trap"), and an optional **monotonicity** check.
- **Determinism:** verified — **zero `Math.random` in `server.js`**, `mockEnrich` is pure, scoring is pure given frozen weights (only `now()` timestamps vary, irrelevant). Heuristic path is byte-identical run-to-run; LLM modes report mean over K=3 + stddev.
- **Gaming guards:** present-only accuracy + enum macro-F1 (kills "unknown"-farming); hallucination veto; verbatim-dump cap; cost matrix zeroes route-fatal confusions; injection is triple-counted (hallucination + routing error + echo/calibration failure); `must_not_echo` sentinels; hash-frozen gold + printed config; per-persona paraphrase variants.
- **Outputs are honest by construction:** `summary.json` (gate input) + `scorecard.md` (founder one-pager, headline + Layer-1/Layer-2 beside it + frozen-config provenance line) + `per_field.csv` + `confusion/*.csv`, all under gitignored `.artifacts/`.

---

## 7. Architecture

All under `deal-threads-dev/src/extraction-eval/`:

| File | Purpose |
|---|---|
| `run.mjs` | CLI entrypoint. Flags: `--extractor=heuristic\|openai\|claude\|all`, `--golden`, `--out`, `--runs=K`, `--judge`, `--trajectory`, `--selfcheck`, `--fail-under`. Loads + hash-freezes gold, spawns server child on ephemeral port with empty temp store, asserts empty + prints config provenance, runs, scores, prints headline. **Only spawns `server.js` as a child — never imports/edits it.** |
| `adapters/index.mjs` | The ONE adapter contract: `async extract(case) → { profile, routing:{route_type,priority}, perTurnProfiles?, timingMs, tokens?, raw }`. `run`/`score` never branch on extractor identity. |
| `adapters/heuristic-live.mjs` | **Day-one adapter.** Spawns real `server.js` (sqlite temp store in `os.tmpdir`, `ENRICHMENT_MODE=mock`, `OPENAI_API_KEY=''`, admin creds). Base URL exactly `127.0.0.1:<port>`. Probe-session 403 check. Per case: POST `/widget-sessions` → loop POST `/messages` (capture merged profile each turn) → POST `/complete` (201, or record 422 as no-route) → GET admin-protected `/leads/:id` (Basic auth). |
| `adapters/openai-hybrid-live.mjs` | **The real buy-vs-build OpenAI measurement.** Spawns server *with* a key (mock for CI) → exercises the true heuristic-then-LLM-merge path. |
| `adapters/llm-module.mjs` | Labeled **"LLM-alone (not shipped path)" diagnostic.** Imports the 4 exported fns, replays into empty profile. |
| `adapters/claude-extractor.mjs` | **Deferred** (net-new product code). Drop-in Anthropic peer: same signature, forced tool/JSON-schema output, temp 0, zero-SDK. One-file add later thanks to the contract. |
| `score.mjs` | All metric math (pure, unit-testable, no I/O): field verdicts, enum F1/confusion, 0/1/2 rubric + verbatim cap, routing cost matrix, Brier/ECE, hallucination accept-set, echo-guard, conversation vetoes, Wilson LB. |
| `comparators.mjs` | Field-path → type-aware comparator map + the per-field **merge-semantics table** (LAST vs FIRST write). |
| `constants.mjs` | Eval-owned enum/schema mirror; `--selfcheck` diffs vs runtime `emptyProfile`. |
| `golden/*.case.json` + `CODEBOOK.md` + `golden.schema.json` | The 50 cases, the labeling law, the load-time validator. |
| `weights.json` + `cost-matrix.json` | Headline weights + asymmetric routing costs as **data** (printed in every scorecard). |
| `mocks/openai-responses.mjs` | Local server mimicking POST `/v1/responses` (the **verified** endpoint — not `/v1/chat/completions`), replay keyed by transcript hash. Step 4 only. |
| `scorecard.mjs` | Renders `summary.json` + `scorecard.md` + ASCII reliability diagram + per-persona/per-ICP tables + the heuristic-vs-openai-hybrid diff. |
| `gate.mjs` | Regression gate vs a **persistent** baseline at `src/extraction-eval/baselines/<date>.json` (NOT in gitignored `.artifacts`). Fails on >2pt headline drop / any hallucination increase / adversarial or enum-F1 regression. Heuristic-only by default (free, deterministic). |

**Collision safety:** new files only; consumes `server.js` purely as a spawned child over its public HTTP contract; state-isolated empty temp store + ephemeral port; `ENRICHMENT_MODE=mock` + replayed OpenAI mock = no network/token burn; base URL pinned to allow-listed `127.0.0.1`; **no `test/` file added** (drift-smoke is a `--selfcheck` flag instead, removing `node --test` pickup + Codex-collision risk); all outputs gitignored.

---

## 8. Build sequence (day one ships a number)

1. **Scaffold + the one thin slice that ships a number.** `run.mjs` + `adapters/index.mjs` + `heuristic-live.mjs` (spawn recipe adapted from `test/sqlite-store.test.js`, but `ENRICHMENT_MODE=mock`, empty temp store, 127.0.0.1, empty-store assertion + printed config, 403 probe) + `constants.mjs` + minimal `score.mjs` (present-only field accuracy + routing exact-match) + **7 golden cases** (one per persona).
   → **End of day one:** `node src/extraction-eval/run.mjs`, zero key, real honest headline for the live heuristic across 7 conversations, on the exact production path. *The never-measured core claim, measured.*
2. **(2a) Headline-defining scorer:** enum macro-F1 + confusion, free-text rubric + verbatim cap, hallucination accept-set, echo-guard, conversation vetoes, Wilson LB; `comparators.mjs`; `weights.json`/`cost-matrix.json`; `scorecard.mjs`. → headline becomes defensible + eng gets a ranked worklist.
   **(2b) Calibration polish:** Brier/ECE/reliability diagram + `needs_human_review` P/R. **0% of headline — does not block.**
3. **Golden set → 50** across all personas (incl. the 75→medium regression, the mock-enrich-to-HIGH case, the clobber trap, the 9 adversarial) + `CODEBOOK.md` + `golden.schema.json` + 25% consistency check + adversarial k/m in scorecard.
4. **LLM adapters + deterministic mock + gate:** `openai-hybrid-live.mjs` (real production path), `llm-module.mjs` (diagnostic), `mocks/openai-responses.mjs`, `--all` diff, `gate.mjs`. **Claude extractor deferred until after this.**

---

## 9. Open decisions (all pre-decided with a recommendation — confirm or redirect)

| Decision | Recommendation |
|---|---|
| **Auto-build magic-phrase tokens** (`/yes\|send it\|looks right\|confirm/i` + `ready_to_complete` auto-builds a lead mid-`/messages`) | **Forbid in non-final turns**; drive completion via explicit `/complete` for deterministic Layer-2 reads. Shapes authoring → fixed up front. |
| **Thin personas & the 422 gate** | **Do both:** most personas satisfy required fields (201); thin adversarial/gamer/no-budget carry `expected_422` and a 422 scores as "disqualified/no-route." Pin the required-fields list from the empty-store widget-session response. |
| **Drift safety net** | **`--selfcheck` flag on `run.mjs`; DROP the `test/` file** (avoid `node --test` collision with Codex). |
| **ICP weighting** (contested beachhead) | **~50/50 with `icp_flavor` tag**; slice the headline per-ICP. |
| **Seed from real `.data` conversations?** | **Keep v1 hand-authored** (dev store is demo data); build `golden.schema.json` so redacted real pilot transcripts drop in later. |

---

## 10. Out of scope (and why)

- **Editing `server.js`** to make the heuristic importable — spawn-over-HTTP is proven and drift-proof.
- **Vendoring `scoreProfile`/`routeLead` into an offline shim** — routing depends on `mockEnrich` confidence + snapshot config; a shim would diverge from real routing.
- **Per-turn headline scoring** — final state is the only state that reaches routing.
- **LLM-judge as the headline** — deterministic required/banned-facts scoring is the headline; any `--judge` pass is advisory, behind a flag.
- **The Claude extractor on day one** — net-new product code; deferred to after the heuristic headline + OpenAI-hybrid comparison.
- **Fixing the product bugs the eval surfaces** — the eval *reports* them; fixing is `server.js` work.
- **Scoring the dead-form fallback path** (`server.js` ~13834) as a form-vs-AI delta — genuinely valuable (it's the brand spine), but a stretch goal that doesn't block the day-one number.

---

## 11. Coordination notes (critical — building alongside Codex)

`server.js` changes every minute, is ~14.5k lines, and `deal-threads-dev` is **not a git repo**. So:

1. **Write only under `src/extraction-eval/`**; rely on the HTTP contract, never `server.js` internals or line numbers (line numbers here are hints — grep to confirm).
2. **Adapt — don't copy verbatim — the spawn env** from `test/sqlite-store.test.js`: `DEAL_THREADS_DATA_STORE=sqlite` + `DEAL_THREADS_SQLITE_FILE=<fresh os.tmpdir>` + `OPENAI_API_KEY=''` + admin creds, but set `ENRICHMENT_MODE=mock` (deliberate single-field deviation; verified pure). Env vars are `DEAL_THREADS_*`; treat any legacy env names as stale and ignore them.
3. **Pin base URL to `127.0.0.1:<port>`**, never override `Host` (default `allowedDomains` is non-empty). Add the 403 probe self-check.
4. **Guaranteed-empty store + assert empty + print effective weights/thresholds.** Drive conversations with **no `betaClientId`** so routing returns pure defaults.
5. **Heuristic merge is mostly LAST-write-wins** — label final-state gold accordingly (see finding #2).
6. **`leadExtractionSchema` is not exported** — mirror enums in `constants.mjs`, diff via `--selfcheck`.
7. **OpenAI mock mimics POST `/v1/responses`**, not `/v1/chat/completions`.
8. `/complete` → 201 on success, 422 on missing required fields; `GET /leads/:id` is admin-protected (Basic auth).
9. **Production OpenAI is heuristic-first then LLM-merge** — real buy-vs-build is `openai-hybrid-live`, not the isolated import.
10. **Build in sequence — Step 1 ships the headline end-of-day**; don't block on the full 50-case set, calibration math, or LLM adapters.
11. Gate baseline lives at `src/extraction-eval/baselines/<date>.json` (persists), not in `.artifacts`.
12. **Node is v26** (engines `>=22.5`) — drop any v22-specific assumption.
13. **Make the open-decision calls early** (magic-phrase ban, `expected_422`, ~50/50 ICP) — re-authoring is the expensive part.
14. Everything writes to gitignored `.artifacts/` (except the persistent baseline) — add no git operations.
