# Eval findings → Codex (2026-06-01)

> Mirror of `../deal-threads-eval/CODEX-HANDOFF-2026-06-01.md` (the canonical, source-of-truth copy that
> lives with the eval). Placed here so it's visible in this tree. If they drift, the eval copy wins.

The eval at `deal-threads-eval/` now measures the **real product on the real path** (spawns `server.js`,
drives the live widget→messages→complete→lead contract, reads routing from the built lead). It surfaced
**two root-cause bugs that cap lead quality far more than model choice does**, plus three supporting fixes.

**The headline:** `gpt-4o-mini` (the LLM path) scores **3/14**; the keyless heuristic scores **2/14**. A
much better model barely helps — *not* because extraction is hard, but because **the pipeline throws away
the LLM's output and drops most leads before they're ever built.** Fix Findings 1 and 2 and both paths jump.

> Line numbers below are **hints as of 2026-06-01 and will drift** — grep the function name. The eval
> doesn't touch `server.js`; these are for you to fix and self-verify against the same 14 cases.

## Reproduce (no fixtures — the live product)

```bash
cd deal-threads-eval
node adapters/run-against-product.mjs                       # keyless heuristic (self-spawns isolated product)
node run-eval.mjs --predictions fixtures/predictions.live.jsonl
# LLM hybrid:  node adapters/run-against-product.mjs --openai sk-...   (then re-grade)
```

The 14 cases in `cases/cases.jsonl` are the regression gate — every fix below is verifiable by re-running.

---

## Finding 1 — Merge precedence discards the LLM's better values (HIGHEST LEVERAGE)

**Symptom:** the LLM path (3/14) barely beats the heuristic (2/14); enum accuracy 59.5% vs 54.8%. The model
investment is almost entirely wasted.

**Root cause (verified):** `extractIntoProfile` (server.js ~9211) runs the **heuristic first**, then merges
the LLM on top via `mergeExtractedProfile` → `mergeObject` (`src/llm-extractor.js` ~152/162). `mergeObject`
only writes when the target is still `null`/`""`/`"unknown"`:

```js
if (value === null || value === "" || value === "unknown") continue;
if (target[key] === null || target[key] === "" || target[key] === "unknown") target[key] = value;
```

The heuristic + `emptyProfile()` pre-fill most enums (last-write-wins) and dump a raw `business_need`, so by
the time the LLM runs, almost nothing is still empty → **the LLM's corrections are silently dropped.**

**Evidence from the cases:**
- Only `timeline` (DT-009/010) ever flips heuristic→LLM — everything else was already non-empty.
- Injected `budget_range=60k_plus` / `crm=salesforce` (DT-007) stay **locked in** because the heuristic set
  them first; the LLM can't correct them.
- `needs_human_review` never flips: it's pre-seeded `false`, and `false` isn't `null/""/"unknown"`, so the
  merge refuses to overwrite it even when the LLM returns `true`.

**Fix direction:** let the better source **override**, not just gap-fill. Carry a per-field confidence (the
heuristic's matches are low-confidence keyword hits) and prefer the LLM value when present and the heuristic
value wasn't high-confidence; or flip the order (LLM first, heuristic as fallback). Define an explicit
precedence policy per field.

**Acceptance:** re-run `--openai`; LLM path should clear the heuristic by a wide margin (enum acc ≥85%;
DT-007 no longer carries the injected `budget_range`/`crm`).

---

## Finding 2 — Brittle timeline parsing drops 9/14 leads at the completion gate

**Symptom:** 9 of 14 realistic conversations **422 on `POST /complete` and never build a lead** — they never
reach a rep. High-intent ones are in the dropped set: DT-004 (urgent support outage), DT-010 (VP needs it
"live by Friday"), DT-009 (strong-fit, "this q"). This is the product's own "leads go cold" failure, inside
the product.

**Root cause (verified):** `timeline` is a default required field (server.js ~766); `requiredMissing` /
`fieldCaptured` (~9360 / ~9333) block lead-build until `timeline !== "unknown"`. But `extractFromMessage`
(~9142) only recognizes literal `this week/month/quarter`, `q1–q4`, `later this year`, `researching`,
`just looking`. So **`this q`, `by Friday`, `move fast`, `asap`, `end of the year` all → `unknown` → 422.**

**Fix direction:** two complementary moves —
- **(a) Accuracy:** broaden timeline parsing (shorthands like "this q", relative/urgency cues like "by
  Friday"/"asap"/"ASAP"/"move fast", "end of year"→`later_this_year`).
- **(b) Fail-safe (recommended regardless):** don't hard-gate lead *creation* on a single brittle field —
  build the lead and set `needs_human_review=true` when a required field is missing, so a high-intent lead is
  never silently dropped at the gate.

**Acceptance:** re-run; ≥12/14 cases build a lead; DT-004/009/010 build and route.

---

## Finding 3 — `needs_human_review` never fires (no safety net)

Seeded `false` in `emptyProfile()`, never set true (and the merge won't flip it — see Finding 1). Human-review
recall = **0%**. Set it `true` on: missing required fields, low confidence, detected injection, or sparse/
abandoned conversations. This is the safety net behind Findings 1–2.

## Finding 4 — Prompt injection partially obeyed (security / trust)

DT-007: the heuristic scrapes the injected `crm=salesforce` and `budget_range=60k_plus` straight from the
attacker's text, and merge-precedence locks them in even on the LLM path. Injection resistance = **0%**. Treat
imperative "set X to Y / ignore instructions" patterns as suspect → don't extract them as facts, set
`needs_human_review`, never auto-route high. (Your compliance/security ICP will ask about exactly this.)

## Finding 5 — Route reachability + decorative confidence (polish)

- `routeLead` (~9616) only emits `sales` / `customer_success` / `nurture` / `manual_review` → `support` and
  `partnerships` route_types are **unreachable** (DT-004/005 can never route correctly).
- `meta.confidence` is hard-coded `0.5` (`emptyProfile`) → ECE 0.357; calibration is meaningless and `/proof`
  + `/trust` can't lean on it. Populate a real (or at least varying) confidence.

---

## Priority

1. **Finding 1 (merge precedence)** — unlocks the entire LLM investment; nothing else matters as much.
2. **Finding 2 (completion gate / timeline)** — stops silently dropping high-intent leads.
3. **Finding 3 (needs_human_review fail-safe)** — safety net behind 1–2.
4. **Finding 4 (injection)** — security/trust, ICP-critical.
5. **Finding 5 (route reachability, confidence)** — polish.

The eval is the regression gate: `node adapters/run-against-product.mjs && node run-eval.mjs --predictions fixtures/predictions.live.jsonl`
after each fix, and watch the pass count + gates climb.
