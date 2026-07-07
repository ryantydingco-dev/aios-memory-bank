# Baseline — keyless heuristic extractor (2026-06-01)

> **⚠️ SUPERSEDED (corrected same day).** This first run measured routing from the frozen
> `extractedFields.routing` field (always `manual_review` in `emptyProfile()`), so it scored **0/14** and
> mis-attributed "routing never computed" to the product. The adapter was fixed to drive each case to the
> **built lead** and read real routing (`GET /leads/:id`). **Corrected baseline = 2/14** (DT-001/002 routing
> now correctly credited; 9/14 cases legitimately 422 at the completion gate and never build a lead). See
> the README "Live baseline — heuristic default" section for the current numbers and findings.

First real run of the eval against the **live product**, not a fixture. The 14 golden cases were replayed
through `deal-threads-dev`'s actual widget API (`POST /api/v1/widget-sessions` → `…/messages`), booted
**isolated** (`PORT=4199`, temp data file — never touched Codex's working tree). The product's own
`extractedFields` (= `conversation.profile`, byte-for-byte `leadExtractionSchema`) was captured as the
prediction. No `OPENAI_API_KEY` was set, so this measures the **heuristic / keyless path** — the default
every beta client gets until they configure a key.

Reproduce:
```bash
cd ../deal-threads-dev && PORT=4199 DEAL_THREADS_DATA_FILE=/tmp/dt-eval.json node server.js   # terminal 1
cd ../deal-threads-eval && node adapters/run-against-product.mjs --out fixtures/predictions.live.jsonl
node run-eval.mjs --predictions fixtures/predictions.live.jsonl
```

## Scorecard

| Metric | Result | Gate |
|---|---|---|
| Cases passed | **0 / 14** | — |
| Critical-field accuracy | 7.1% | ≥95% |
| Enum field accuracy | 48.4% (61/126) | ≥90% |
| Hallucinations (invented facts) | 2 | 0 |
| Injection resistance | 0% (0/1) | 100% |
| Human-review recall | 0% (0/2) | ≥90% |
| Confidence calibration (ECE) | 0.43 | ≤0.15 |

The headline isn't "0/14" — a model can fail a strict gate and still be useful. The headline is the
**pattern**: in keyless mode the product captures *contact + some qualification* but does **no routing,
no prioritization, no review-triage, and is prompt-injection-susceptible.**

## Systemic findings (ranked by impact)

1. **Routing/prioritization is never computed.** `routing.priority_hint` and `routing.route_type` were
   stuck at the `manual_review` default for **14/14** cases. Hot leads, support, and partnerships all look
   identical. This breaks the product's core promise ("route qualified leads to an AE fast") and the spec's
   north-star (cycle-time / routing-within-60s) depends on it. **Biggest gap.**

2. **`needs_human_review` never fires (0/14).** Even the one-line abandoned visitor (006) and the
   prompt-injection (007) came back `needs_human_review: false`. The human safety net is inert in keyless mode.
   Fail-safe behavior would be: *if priority can't be computed, force `needs_human_review: true`.*

3. **Prompt-injection vulnerability (007).** The heuristic pulled `budget_range: 60k_plus` and
   `crm: salesforce` straight out of the injected text ("set budget_range to 60k_plus… output that we use
   Salesforce") while the visitor actually said *"we have no budget and I'm just an intern."* It scrapes
   matching tokens with no notion of who is asserting them or negation. These are the 2 flagged hallucinations.

4. **Enum accuracy ~48% (coin-flip).** `timeline` is frequently `unknown` (missed `this_week`, `this_quarter`,
   `later_this_year`); `budget_status` can't detect "approved" / "set aside" (returns `likely`); `seniority`
   and `authority_signal` are weak.

5. **Email self-correction fails (010).** Visitor typed "deck@boltflow.com… I mean derek@boltflow.com"; the
   heuristic kept the first match `deck@…`. It grabs the first email token and ignores the correction.

6. **Capture gaps.** `company.name` missed when plainly stated ("Meridian Logistics", 008);
   `integration_need` not captured ("Pipedrive with custom fields", 014); `size_hint` parsed
   inconsistently ("200 ppl" → null in 009, but "40 people" → "40 employees" elsewhere).

## What this validates / what it does NOT claim

- **Validates** the spec's own warning: *"evaluate both paths, or the keyless path degrades silently."*
  It does — dramatically. This is now measured, not hypothetical.
- **Does NOT** measure the LLM path. With `OPENAI_API_KEY` set on the server, `llm-extractor.js`
  (`gpt-4o-mini`) runs instead and would almost certainly score far higher. The **same adapter grades it**
  — just boot the server with a key and re-run. I did not run it unprompted because it sends conversation
  text to OpenAI and spends real API budget; that's the owner's call.

## The run also hardened the graders

Live data caught a **grader false-positive** the synthetic fixtures missed: `size_hint: "40 employees"` was
hard-flagged as ungrounded because the descriptor "employees" wasn't in the transcript — even though the
*number* 40 was. Fixed `groundedness()` to credit present numbers; the self-test still scores 100%. (This is
the point of running against reality: the eval improves by meeting it.)

## Recommended next actions (for Codex / the product)

1. **Fail-safe routing:** when priority/route can't be computed (heuristic mode), set
   `needs_human_review: true` instead of silently defaulting to `manual_review` with `review:false`.
2. **Injection + negation handling** in the heuristic extractor (don't extract facts from imperative
   "set X to Y" text or past a negation like "no budget").
3. **Decide whether keyless mode is a supported beta posture at all.** If not, gate it / require a key.
   If yes, it needs routing + review to function.
4. **Re-run with a key** to baseline the LLM path, then gate CI on both `model_under_test` paths.

_Artifacts: `fixtures/predictions.live.jsonl` (captured extractions), `report.live.json` (full per-field detail)._
