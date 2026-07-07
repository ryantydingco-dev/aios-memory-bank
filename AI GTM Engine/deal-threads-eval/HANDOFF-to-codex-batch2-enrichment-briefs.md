# Handoff → Codex, batch 2: enrichment + brief fixes (2026-06-01)

**Batch 1 worked — thank you.** Post-fix heuristic extraction went **2/14 → 13/14**: hallucinations 2→0,
injection resistance 0%→100%, human-review recall 0%→100%, leads-built 5/14→14/14. The completion fail-safe,
fail-open review, and injection/negation handling all landed and verify clean.

Two caveats before the new work:
- The **merge-precedence fix in `src/llm-extractor.js` is UNVERIFIED** — it only shows on the LLM path, and
  the eval's OpenAI key is currently invalid (401). Leave your change in; I'll verify it the moment a working
  key is available. No action needed now.
- Remaining extraction gap is minor (enum 84.9%, critical 92.9% — just under the 90/95 gates). Not in this batch.

This batch covers the two pipeline stages batch 1 didn't touch — **enrichment** and the **rep brief** — now
that the eval widened to cover them. All fixes are in `deal-threads-dev/`. Verify with the commands at bottom.

---

## Fix 1 — Enrichment invents an industry from one keyword

**File:** `src/internal-enrichment.js` → `inferIndustry` (~line 616).

**Problem (eval case ENR-002):** a visitor who says only *"our sales demo leads go cold"* — no stated
industry, no website — gets `industry = "B2B SaaS"` at 0.55 confidence. `inferIndustry` keyword-matches the
**business_need text** (`/saas|software|platform|api|cloud|crm|sales/`), so the word "sales" alone fabricates
a firmographic. This is the "embarrassing mistargeted outreach" risk.

**Direction:** infer industry from **website evidence** (metadata/title/description, tech stack) — not from the
visitor's `business_need` prose. With no website and no stated `industry_hint`, return `"unknown"` (low
confidence), don't guess. Echoing a visitor-stated `industry_hint` verbatim is fine.

## Fix 2 — Enrichment fabricates a senior buying committee with no evidence

**File:** `src/internal-enrichment.js` → `inferBuyingCommittee` (~line 450).

**Problem (eval case ENR-007, and it propagates to every brief):** *"our sales lead routing is slow"* produces
a buying committee of **`VP Sales / CRO @0.72`** and **`VP Revenue Operations / Director RevOps @0.78`** — from
a single keyword over visitor context, with zero firmographic evidence (no headcount, no scraped org/about
page). Presented at 0.72–0.78, a rep reads these as *identified* stakeholders. Even a blank profile yields a
fallback role at 0.62.

**Direction:** gate committee roles on real evidence (company size, scraped team/careers/about signals) and/or
drop confidence sharply when the only input is the visitor's stated pain. A hedged *"likely involves RevOps +
Sales leadership"* at ~0.4 is honest; a titled role at 0.78 implies identification it doesn't have.

## Fix 3 (lower priority) — Confidence counts features, not correctness

**File:** `src/internal-enrichment.js` → `calculateConfidence` (~line 651). It sums points for
*things found* (metadata, tech, size…), so a confident-but-wrong inference still scores high. Consider
weighting toward corroborated/cross-checked fields so `confidence` tracks accuracy, not effort.

## Fix 4 — The brief leaks "Unknown visitor" into outbound copy

**File:** `server.js` → `buildRepReadyBrief` (~line 10806, `copy_blocks`).

**Problem (brief eval, most leads):** when the name wasn't captured, `contactName = lead.contact?.name ||
"Unknown visitor"` is interpolated into `email_opener` / `voicemail_opener`, producing *"Unknown visitor, saw
your note about…"*. A rep who fires it as-is sends an embarrassing email.

**Direction:** when the name is missing, don't synthesize outbound copy with a placeholder — drop the name
("Hi there,"), or null the copy block and add a `quality_flag` ("No contact name — personalize before
sending."). Never emit "Unknown visitor"/"Unknown company" into send-ready copy.

## Fix 5 — Discovery questions are hardcoded and route-blind

**File:** `server.js` → `buildRepReadyBrief` (~line 10799, `discoveryQuestions`).

**Problem (brief eval, tailoring check):** all 14 leads get the **identical 5** questions, all about "lead
handoff" / "inbound routing" / "CRM fields" — so a **support** lead and a **partnership** lead both get asked
*"What happens if this lead handoff problem isn't fixed this quarter?"*

**Direction:** branch by `route_type` / `buying_stage` / need at minimum (sales vs support vs partnership vs
nurture), ideally generate from the lead's stated `business_need`.

---

## How to verify (from `AI GTM Engine/deal-threads-eval/`)

```bash
node run-enrichment-eval.mjs    # target: 8/8 honest (ENR-002 industry, ENR-007 committee now pass)
node run-brief-eval.mjs         # target: no_placeholder passes, discovery tailoring passes,
                                #         committee_not_overconfident resolves once Fix 2 lands
node adapters/run-against-product.mjs --out fixtures/x.jsonl && node run-eval.mjs --predictions fixtures/x.jsonl  # no extraction regression (stay ≥13/14)
```

**Do NOT edit the eval (`cases/`, `graders/`, `run-*.mjs`) to pass — fix the product.** If a golden label or
an assertion looks wrong, flag it for Ryan. Each new leg already caught one over-strict assertion on my side
(industry case-sensitivity); if you find another, say so rather than coding around it.
