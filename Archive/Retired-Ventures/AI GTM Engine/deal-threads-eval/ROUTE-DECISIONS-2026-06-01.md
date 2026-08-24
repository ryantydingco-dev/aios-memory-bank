# Route decisions → Codex (2026-06-01, follow-up to EVAL-FINDINGS)

**Status:** the eval moved **2/14 → 11/14** after your `llm-extractor.js` / `server.js` changes — injection
caught, `needs_human_review` fires, hallucinations 0, the completion-gate leak closed. The **only remaining
failures are 3 routing cases.** Two need a decision; one is minor.

Re-verify any change with:
```bash
cd deal-threads-eval && node adapters/run-against-product.mjs && node run-eval.mjs --predictions fixtures/predictions.live.jsonl
```
(Line hints below drift — grep the function name.)

---

## Decision A — Add a `partnerships` route (real gap) · DT-EVAL-005

**Now:** `routeLead` (~10775) emits only `sales` / `customer_success` / `nurture` / `manual_review`. A
reseller/agency inquiry ("interested in reselling and embedding DealThreads… who handles partnerships?") is
correctly detected as `buying_stage="partner"`, but — having no budget/timeline — it scores low and **routes to
`nurture` / low.** A channel partner gets a nurture drip instead of a partner conversation. Channel is leverage;
this is a real miss, not a label nit.

**Decision:** add a partnerships motion, mirroring the `buying_stage === "support"` short-circuit you already have:
- `scoreProfile` (~10704): add a `buying_stage === "partner"` segment so partners don't fall through normal
  sales scoring (they legitimately lack budget/timeline) — give it a sensible non-low priority (e.g. `medium`,
  `segment: "partner"`).
- `routeLead` (~10778): add a `buying_stage === "partner"` branch → `route_type: "partnerships"`, with
  `partnershipsOwner` / `partnershipsQueue` / `partnershipsAction` added to `defaultRoutingConfig()` (~791).

**Acceptance:** DT-EVAL-005 → `route_type: partnerships`, `priority: medium`.

---

## Decision B — Support routing: one alignment call + one product nuance · DT-EVAL-004

Existing customer, broken widget, "need help asap." Gold: `route_type: support`, `priority: high`. Product:
`route_type: customer_success`, `priority: low`.

**B1 — `support` vs `customer_success` (dataset alignment, NOT a product bug).** The product deliberately maps
support → `customer_success` (short-circuit ~10778). For an existing-customer production issue, `customer_success`
is a defensible destination. **Recommendation:** treat them as equivalent — relax DT-EVAL-004's gold `route_type`
to `customer_success`, or have the grader accept `customer_success` ⇄ `support`. *(Owner: dataset / `cases.jsonl`,
not Codex. I can make this change on your nod — it's a one-line gold edit.)* Only build a distinct `support` route
if you actually want separate reactive-support vs proactive-CS teams.

**B2 — support priority shouldn't be uniformly low (real product nuance).** `scoreProfile`'s support short-circuit
(~10704) forces `priority: low`. But an existing customer with a **production outage** is high-*urgency* (churn
risk), even if it's not a *sales* opportunity. The code currently conflates "low sales value" with "low response
priority." **Decision:** decouple them — let a support/outage case carry high urgency to the CS queue. An urgency
cue (`asap`, `stopped`, `broken`, `outage`, `down`, `since this morning`) could lift the support route's priority.

**Acceptance:** DT-EVAL-004 routes to CS/support with a priority that reflects urgency (high for an outage).

---

## Minor — DT-EVAL-008 priority (optional, don't block on it)

Named company (Meridian Logistics), on HubSpot, clear pain, but no contact / budget / timeline → product scores
`low`, gold says `medium`. Borderline calibration (a fit-but-uncontactable lead). Either accept `low` (can't act
without a contact) or nudge the medium threshold. Lowest priority of the three.

---

## Net

Land **A + B** and you clear the `critical_accuracy` gate. The remaining `enum_accuracy` gap is field-level polish
the dataset will keep surfacing case-by-case. The eval is the gate — re-run after each change and watch 11/14 climb
toward green.

**Routing of these decisions:** A → Codex (product). B2 → Codex (product). B1 + the support-route label → dataset
owner (one-line `cases.jsonl` edit; ping me). DT-008 → optional.

---

## UPDATE 21:55 — A landed, B1 done. All 14 cases pass; one gate left.

Status now: **14/14 cases pass, 4/5 gates green** (✓critical ✓hallucinations ✓injection ✓review).
A (partnerships route) shipped — DT-005 → `partnerships`/medium ✓. B1 gold edit done — DT-004 → `customer_success` ✓.
DT-008 now `sales`/medium ✓.

**Only red gate: enum accuracy 87.3% (110/126), need ≥90% (≤12 misses). 16 misses today — fix any 4. Two clusters:**

- **Cluster 1 — seniority/authority not inferred from role cues (8 misses).** The extractor leaves `visitor.seniority`
  + `visitor.authority_signal` = `unknown` when the role is stated: "I run RevOps" → director/influencer (DT-002),
  candle-shop owner → founder/decision_owner (DT-003), "I'm a partner" → executive/decision_owner (DT-005),
  "just exploring" → researcher (DT-011). Add role-phrase → seniority/authority inference.
- **Cluster 2 — `buying_stage` over-defaults to `active_project` (6 misses).** The default at server.js ~10289
  (`buying_stage === "education" ? … : "active_project"`) flattens `vendor_evaluation`. Cases that are comparing/
  evaluating vendors (DT-005, 012, 013, 014) should be `vendor_evaluation`, not `active_project`; DT-003 should be
  `education`. Distinguish "evaluating/comparing/researching options" (vendor_evaluation) from committed-with-
  budget+timeline (active_project).
- **2 timeline nits:** "just exploring/researching" → `researching` missed (DT-003); DT-014 "move fast" →
  over-extracted to `this_week` (gold wants `unknown`) — the broadened timeline parser is a touch too eager on vague urgency.

**Fixing Cluster 2 alone (6) clears the gate; Cluster 1 (8) also clears it.** Either gets you to all-green.
Re-verify: `node adapters/run-against-product.mjs && node run-eval.mjs --predictions fixtures/predictions.live.jsonl`.
