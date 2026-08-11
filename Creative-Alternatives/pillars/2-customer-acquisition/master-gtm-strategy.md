# Master GTM Strategy — Creative Alternatives

> **Historical/supporting strategy.** The five-motion model remains useful, but current outbound execution is governed by `account-based-outbound-engine.md` and the current 30-day plan.

> The spine. This ranks **every** revenue motion CA has, sequences them for a durable engine that compounds, and sets targets. It does not duplicate the detail docs — it points to them:
> - Offer (both): `context/offer.md`
> - The grand-slam branded-store offer: `home-run-offer.md`
> - The cold-outbound engine: `outbound-gtm-playbook.md`
> - Ready-to-send copy: `sequences/cold-outreach-copy.md`
> - Revenue/content plays: `../../plans/ai-growth-plays.md`
>
> **Goal this plan serves (locked 2026-06-26):** build the *durable* engine — stand up all five motions in the right order so revenue compounds to a bigger number by month 6, not a one-off spike. Going all-in on revenue, channel is the byproduct.
>
> **⚠ Pressure-test overlay (2026-07-17):** this spine is sound, but three things have changed since it was written. (1) The **QuickBooks data gate (§3) is now open** — the dormant list, real margins, and A/R all exist in `outputs/revenue-plan/`, so motions 1–3 are no longer blocked. (2) The real bottleneck is the **reply→quote→close path, not lead volume** (71 replies queued, HOT deals stalled on Kenny's pricing). (3) The near-term sequence needs a **calendar correction** — it's mid-July, camp season is over, and Q4 gifting is the timely play the original mid-camp-season roadmap under-weighted. Full analysis + the un-gated model: **`gtm-pressure-test-2026-07-17.md`**. Read it alongside this.

---

## 1. The thesis in one paragraph

CA already makes $3.2M/yr on pure word-of-mouth with zero marketing system. That's not a weakness to fix — it's a base to **monetize harder**. The fastest dollars aren't in cold outreach to strangers; they're in the 2,700 customers and 75,000 orders already sitting in QuickBooks, plus systematizing the referral/reorder behavior that built the company. Cold outbound for branded stores is the *expansion* engine — real, but it carries a 3–6 week warmup tax before its first dollar. So we light the warm motions first, stand up cold and inbound in parallel, and let them stack.

---

## 2. The five motions, ranked by speed-to-cash

| # | Motion | Source | Time to 1st $ | Owner | Detail doc | Build state |
|---|--------|--------|--------------|-------|-----------|-------------|
| **1** | **Reactivation** | Dormant + reorder-due accounts in QuickBooks | **Days** | Maclaine (calls) | new (below) + reactivation copy in `sequences/` | Under-built ◀ |
| **2** | **Reorder / referral system** | The active core base (Offer 1) | **Days–weeks** | Maclaine + ops | new (below) | Not built ◀ |
| **3** | **Branded-store upsell to existing customers** | Same QuickBooks base | **Weeks** | Maclaine + Ryan | `home-run-offer.md` (warm framing) | Offer built, motion not |
| **4** | **Cold outbound — branded stores** | Camps and squash first; later niches earn tests | **Weeks** | Ryan + Maclaine | `outbound-gtm-playbook.md` + `outbound/smartlead-campaign-analysis.md` | Built and operating in waves |
| **5** | **Inbound — search, niche pages, content, partnerships** | Existing site + proven niches | **Months** | Ryan | `../../plans/inbound-master-implementation-2026-07-10.md` | System designed; external implementation pending |

**The strategic correction this doc makes:** the existing library is ~80% motion #4 (the slowest to pay) and barely covers #1, #2, #3 (the fastest). For a revenue sprint, that order is backwards. We fix it here.

---

## 3. The gate: the Maclaine / QuickBooks session

Motions **#1, #2, #3 are all locked** until you sit with Maclaine and pull from QuickBooks. Nothing fast happens before it. It is the single highest-leverage action in this entire plan, and it doubles as Episode 1 footage.

**What the session must produce (the revenue pull, on camera):**
- **Dormant list** — customers with no order in 12+ months, ranked by historical spend.
- **Reorder-due list** — accounts that buy on a cycle and are overdue.
- **Top 25 by lifetime revenue** — and which have gone quiet.
- **Existing web-store customers** — what they spend, how often (the upsell proof set).
- **The real economics** — see the `[CONFIRM]` block in §6. Without these, CAC is a guess.

→ Run sheet already exists: `../4-youtube-build/maclaine-session-run-sheet.md`. **Booking this is next action #1 (§8).**

---

## 4. Each motion — mechanic, what's missing, target

### Motion 1 — Reactivation (the cash in the building)
- **Mechanic:** AI flags dormant + reorder-due accounts from QuickBooks → personalized win-back → **Salesfinity call first** ("it's Maclaine from Creative Alternatives") + email backup. Warm relationship = no warmup, no cold start, far above cold conversion.
- **What's missing:** the dormant-account logic, the win-back call script + email copy, and a Salesfinity run sheet. This is the #1 thing to build *the moment the QuickBooks pull exists.*
- **Built on:** `crm-lifecycle` / CRM skills (per the ops-brain decision — reactivation is a Claude skill, not a Hermes job).
- **Target:** `[CONFIRM after pull]` — set as a % of the dormant base. Working assumption to validate: of N dormant accounts worth reactivating, a warm phone-first win-back lands **8–15%** back to an order within 60 days. Fill N from the pull.

### Motion 2 — Reorder / referral system (systematize what already works)
- **Mechanic:** the business runs on word-of-mouth and repeat — make it a system, not luck. (a) **Reorder nudges:** flag accounts due for their seasonal/annual order before they think of it. (b) **Referral asks:** templated ask fired at the right moment (post-delivery, post-reorder, after a happy proof) to the customers most likely to refer.
- **What's missing:** essentially everything — this is one line in the growth plays today and it's pointed at the $3.2M core, the biggest revenue surface CA has.
- **Target:** `[CONFIRM]` — a named # of reorders pulled forward/month and referral asks sent/month. Even a small reorder-acceleration on a $3.2M base is material.

### Motion 3 — Branded-store upsell to existing customers (warm version of the home run)
- **Mechanic:** existing customers already buy gear and trust CA — the perfect first audience for the Store Engine offer, with **none of the cold infra.** Same offer as motion #4, warm framing: *"You already order from us — now your people can buy directly and you earn on every order."*
- **What's missing:** the warm-upsell sequence (a variant of `home-run-offer.md` positioning, no domains/warmup needed — these are existing contacts).
- **Target:** `[CONFIRM]` — # of existing accounts pitched the store, target conversion likely **higher than cold's 8–15%** given the warm relationship.

### Motion 4 — Cold outbound, branded stores (the expansion engine — already built)
- **Mechanic:** the full engine in `outbound-gtm-playbook.md`. AI store-mockup first touch → email/LinkedIn/phone cadence → HubSpot pipeline. The completed SmartLead analysis overrides modeled assumptions: camps (10.1%) and squash (5.2%) lead; boutique fitness is a validation test, not the default launch.
- **What's missing:** continued execution, reply handling, mockup throughput, sales follow-up, and disciplined niche tests.
- **Target (from the playbook's model):** ~400 leads/wk × ~8% blended reply → ~30 replies → ~10–12 conversations → ~3–6 demos → **~1–2 new stores/week** at steady state, post-warmup.

### Motion 5 — Inbound — search, niche pages, content, and partnerships
- **Mechanic:** one shared analytics/CRM/conversion system plus evidence-ranked niche pages, paid search, SEO resources, case studies, Google Business Profile, buyer-facing content, associations, directories, and referrals. All inbound feeds the same HubSpot qualification and revenue-attribution model.
- **What's missing:** external access and public implementation. The strategy, niche registry, page briefs, funnel, search, content, measurement, and launch gates now live in `../3-online-presence/inbound/` and `../../plans/inbound-master-implementation-2026-07-10.md`.
- **Target:** set after private baseline data is available. Govern by qualified inbound leads, quotes, pipeline, customers, revenue, and acceptable delivery burden.

---

## 5. Sequencing — the durable-engine roadmap

Build order optimizes for "compounds by month 6," not "biggest week-1 spike." Fast motions fund the slow ones standing up in parallel.

**Weeks 1–2 — Unlock the warm base + start the cold rails.**
- **Book + run the Maclaine session.** Pull dormant/reorder/top-25/web-store lists + economics. (Films Episode 1.)
- Build **Motion 1** (reactivation logic + call/email copy + Salesfinity run sheet) on the real list. First win-back dials go out end of week 2 — *first revenue target.*
- In parallel, **cold rails (Motion 4):** buy 3–5 domains, stand up 6–9 mailboxes, turn SmartLead warmup on (it runs in the background for 3+ weeks regardless).

**Weeks 3–5 — Warm revenue flowing, warm upsell + reorder online.**
- Reactivation is producing. Start **Motion 3** (branded-store upsell) to the best existing accounts — warm, no infra needed.
- Stand up **Motion 2** (reorder nudges + referral asks) on the active base.
- Begin **Motion 5**: first 1–2 segment landing pages + Google Business Profile (compounding clock starts now).

**Weeks 6–9 — Cold engine goes live.**
- Launch **Motion 4** on camps and squash first, full cadence + mockup line. LinkedIn + calls in lockstep. Other niches earn controlled tests from evidence.
- Lock the demo→close motion. Track *stores signed*, not just replies.

**Weeks 10–13 — Compound.**
- Add cold and inbound niches one at a time using the evidence gate; do not use a preset fitness sequence.
- Camps, racquet, and law inbound assets launch in order as proof and access clear their gates.
- Standardize the winning cold sequence as the template; document CAC vs first-year margin to set scale aggression.

By ~month 3 all five motions are live; months 4–6 are about compounding the winners and killing the losers fast.

---

## 6. The unified revenue model (fill in at the Maclaine session)

This is the formula, transparent so it completes itself once the books are open. **Do not put any unconfirmed number on anything public.**

```
Monthly new revenue  =
    Reactivation:   N_dormant_worth_calling  × reactivation_rate  × avg_order_value
  + Reorder accel:  N_reorder_due            × pull_forward_rate  × avg_order_value
  + Store upsell:   N_existing_pitched       × warm_close_rate    × store_GMV × rev_share_or_margin
  + Cold stores:    new_stores_per_month     × store_GMV          × CA_production_margin
  + Inbound:        (compounds from ~month 3)
```

**Known anchors (real):** 2,700 customers · 75,000 orders · 27 yrs · $3.2M gross / ~$600–700k net · rev-share **10–12%** · proven reply rates (camps 10.1%, squash 4.6–5.2%, corporate dead).

**`[CONFIRM]` to complete the model (the Maclaine session):**
- Avg order value + CA's **production margin %** (this, not rev-share, is where CA actually earns).
- Exact rev-share %, payout cadence, who eats shipping/returns.
- Realistic **year-one GMV** for a "good" store (sets the CAC ceiling for Motion 4).
- Size of the dormant base worth calling (sets Motion 1's ceiling).
- Anchor-account concentration (how much revenue rides on the top few — risk flag).

Until these land, every dollar figure in this plan is a `[CONFIRM]`, by design.

---

## 7. The stack — reconciled (resolves the doc-vs-wired drift)

The detail docs name a few tools inconsistently. Locking it here:

| Layer | Tool | Status | Note |
|-------|------|--------|------|
| **System of record** | **QuickBooks** | Locked | Single source of truth for customers, orders, money. The spine of motions 1–3. |
| **Lead data engine** | **AI Ark** | Locked | Discovery + enrich + verify in one. Replaced Apollo (dropped on cost). Not yet MCP-wired in CA — wiring it is a Phase-0 task. |
| **Lead data (optional)** | **Origami** | Evaluating | Experimental, not core. Keep only if a coverage test beats AI Ark on verified contacts for the niche. |
| **Cold email** | **SmartLead** | Locked | Warmup + rotation + deliverability. Secondary domains only. |
| **LinkedIn + video DM** | **Sendr.io** | Locked | NOT HeyReach (the wired heyreach MCP is stale). NOT GHL. |
| **Phone / dialer** | **Salesfinity** | Locked | Powers reactivation calls *and* cold ICP dials. Mobile-swap on. |
| **Pipeline / stages** | **HubSpot** | Locked | New-lead pipeline (cold + inbound): stages, reply logging, handoff. **QuickBooks = customer/order/money truth; HubSpot = new-lead pipeline.** Clean division, they don't fight. |
| **Ops brain (separate)** | Hermes (gateway) + Claude Code (heavy lifting) | Parallel track | Not a GTM tool — morning brief + alerts. See `../1-operations/hermes-ops-brain.md`. |
| **Mockup production** | In-house art team (high-fit) + AI image gen (volume) | Locked | The wedge for motions 3 & 4. |

**GHL (GoHighLevel) is out. HeyReach is out.** Remove from `.mcp.json` per the ops-brain decision.

---

## 8. Scoreboard — the few numbers that matter

Track weekly, **per motion**, so losers die fast:

- **Motion 1:** dormant accounts called · connect rate · reactivated (ordered) · $ reactivated ← *the early scoreboard*
- **Motion 2:** reorder nudges sent · reorders pulled forward · referral asks sent · referrals landed
- **Motion 3:** existing accounts pitched the store · stores opened · warm close rate
- **Motion 4:** leads sourced · reply rate (per segment) · demos booked · **stores signed**
- **Motion 5:** pages live/indexed · inbound leads attributed
- **Deliverability health (gates Motion 4):** bounce <3% · spam complaints ≈0 · domain reputation

**The one number above all:** total new monthly revenue, attributed by motion — so you know which engine to feed.

Tie the weekly read to `/weekly-review`. One experiment per week, one variable at a time. Mine every week's replies/calls with `prospect-interaction-analyzer` → rewrite copy in the customer's own words.

---

## 9. Guardrails (operator's code — non-negotiable)

- **Human-in-the-loop** on every customer / vendor / money / public action. AI drafts; Maclaine or Ryan sends.
- **Never fabricate a number.** Everything financial stays `[CONFIRM]` until the books confirm it.
- **Nothing ships that makes Kenny's day harder.** Trust is the asset.
- **Two-party consent** on any recorded call (filming the build).
- **Anonymize prospects/customers** in public content.

---

## 10. Open `[CONFIRM]` list (carry into the Maclaine session)

1. Economics: avg order value, production margin %, rev-share %, payout cadence, shipping/returns owner, year-one store GMV.
2. Dormant base size worth calling + reorder-cycle accounts.
3. Anchor-account concentration (revenue risk).
4. Current tool reality: is HubSpot in for pipeline, or collapse into QuickBooks? Apollo vs Origami for sourcing?
5. What Kenny will allow on camera + what CA can stand behind publicly (the 7-day guarantee, etc.).

---

## 11. Immediate next actions

1. **Book the Maclaine / QuickBooks session.** Everything fast is gated on it. (`maclaine-session-run-sheet.md` is ready.) ← do this first
2. **After the pull:** build the **reactivation engine** (Motion 1) on the real dormant list — logic + call script + email + Salesfinity run sheet. First win-back dials within days.
3. **In parallel now (no gate):** start the cold rails — buy domains, stand up mailboxes, turn on SmartLead warmup (the 3-week clock starts whenever you start it, so start it).
4. **Reconcile the stack** (§7) — pull GHL + HeyReach from `.mcp.json`, confirm HubSpot-vs-QuickBooks pipeline call.

> Each step is also a YouTube beat — the build *is* the show. See `../4-youtube-build/outbound-build-arc.md`.
</content>
</invoke>
