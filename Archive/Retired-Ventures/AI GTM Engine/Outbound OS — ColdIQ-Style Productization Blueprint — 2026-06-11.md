# Dealthreads Outbound OS: ColdIQ-Style Productization Blueprint
2026-06-11

> **SEQUENCED BEHIND THE 60-DAY PLAN — Phase 0 costs ~0 build hours; Phase 1 unlocks only at 3 AR logos or the day-60 gate. This doc exists so the ColdIQ idea has a home and a date instead of becoming pivot #9.**

Honest accounting behind the banner: Phase 0 is about 1 hour/week of logging that rides mechanics the plan already mandates, plus one 30-60 minute config task in week 3 (Jun 29). Zero new scripts. Zero new builds.

**How this doc enters the plan:** as an agenda item at a Friday 45-minute review, suggested Fri Jun 19, after week 1's fires are out. The plan's rule is "no strategy re-planning outside the Friday review," and that rule applies to this document too. Nothing here gets inserted into week 1, which is already scheduled hour by hour (Day 1 alone is 4 named blocks, ~5.5h). The disease isn't only scripts; it's any non-selling work that feels productive.

Phase boundaries are the committed plan's own gates. Day-30 gate Jul 11. Day-60 gate Aug 10 (>=4 MRR clients AND >=$3,250 signed MRR AND >=$6,000 cash). Nothing below overrides the 60-day plan. Phases 1-2 activate only on gate passes (or 3 signed AR logos arriving early).

Core finding the whole blueprint rests on: ColdIQ runs as a 30+ person human services firm (~$215K revenue per head) wrapped in an automated acquisition flywheel and automated delivery plumbing. Ryan already has MORE delivery automation per head than 2022-ColdIQ. What he lacks is 2+ years of daily founder distribution and daily sends, and the 60-day plan already prescribes exactly that ingredient. Copy 2022 ColdIQ, not 2026 ColdIQ.

---

## 1. MODEL MAPPING: ColdIQ component -> Ryan equivalent -> status

| # | ColdIQ component | Human or software at ColdIQ | Ryan's equivalent | Status |
|---|---|---|---|---|
| 1.1 | Signal-based list building (Clay, Apollo, intent: Trigify/Fibbler) | Software | Origami daily tables (job-signal: agencies hiring AR/billing) + lead-engine (Apollo intent, 40+ campaign YAMLs) + Mandate Signal Detector | HAVE. This was ColdIQ's first-client play ("companies hiring salespeople") and Ryan runs it daily |
| 1.2 | Enrichment waterfalls | Software | LEAD411 mobile enrichment + lead-engine pipeline | HAVE (lighter, sufficient) |
| 1.3 | Multi-channel send infra (Instantly/Smartlead/Expandi/lemlist) | Software | SmartLead + Salesfinity (2,880 leads) + Sendr.io | HAVE |
| 1.4 | Stage-triggered plays in CRM | Software | Meeting Engine grading + auto-routing + aios_* HubSpot stages | PARTIAL by design. `config/meeting_engine_routes.yaml` ships `routes: {}` as a deliberate human gate: unmapped sources emit a ready-to-upload CSV plus a Telegram line. One route gets mapped Jun 29 (see 2.2) |
| 1.5 | Campaign diagnostics + client reporting | Software | Runvue portal: multi-tenant syncs, sentinel, digests, churn radar | HAVE. Already multi-tenant in production, ahead of 2022-ColdIQ |
| 1.6 | ICP strategy, account selection, copy iteration | HUMAN | Ryan | HAVE. Irreducibly human at ColdIQ too; this never gets fully automated |
| 1.7 | Reply handling + meeting booking | HUMAN (they sell agents that *assist*) | Manual categorization + booking sends (playbook design) | PARTIAL. The binding constraint on client count |
| 1.8 | Client management at scale (70+ concurrent) | HUMAN (30+ staff) | Ryan solo | MISSING, and it's not a software problem; ColdIQ solved it with headcount |
| 1.9 | 90-day pilot -> 6-month partnership arc | Structure | Free teardown -> $2K install -> $1K/mo Managed AR (90-day initial term) | HAVE. Maps 1:1 |
| 1.10 | Founder LinkedIn machine (65K followers, 356 meetings/quarter) | HUMAN, daily, 2+ years | 1 proof post/week (plan-allowed), $650K-recovered proof | MISSING. The single biggest gap; it was a TRUST layer 6-12 months before it produced inbound |
| 1.11 | Free tools + SEO directories (26 tools) | Software + years of content ops | Mandate Signal Detector (runs concierge in Phase 2, never self-serve on spec) | MISSING as a product; the scripts exist |
| 1.12 | Newsletter (~10K subs) / paid ads (EUR30K/mo) | Mixed / cash | None | KILLED until an audience source exists. The owned distribution is the ~3,000-contact outbound list |
| 1.13 | Productized education arm (aiagency.io) | Audience-first business | GTM Experiment Engine docs (11 files, frozen) | PARTIAL. Written, correctly frozen; ColdIQ built theirs LAST, at multi-million ARR |
| 1.14 | "One revenue activity per day" (500 emails OR 1 post) | Discipline | The 60-day plan's dial quotas + weekly post | HAVE on paper. This is ColdIQ's named antidote to Ryan's named disease |

Honest summary: rows 1.1-1.5 (software) are at parity or better. Rows 1.6-1.8 and 1.10 (humans, reps, distribution) are where ColdIQ's $6.5M actually lives. So Phase 0 automates nothing new and spends the next 60 days buying reps and proof, which the plan already mandates.

---

## 2. PHASE 0 — NOW THROUGH DAY 60 (Jun 12 to Aug 10)

Real cost: ~1h/wk of logging riding existing plan mechanics, plus one 30-60 minute config task in week 3. All of it logged in the Friday build line, inside the 2h/wk cap.

The Invoice Chase Engine motion IS the productized system in Managed mode. A Managed-AR client #2 today is one `tenants.yaml` block plus the written 2-4h install runbook (`/Users/ryantydingco/Documents/AIOS/aios-starter-kit/apps/runvue-portal/docs/pilot-install-runbook.md`). Zero new code. Every AR client delivered is a rep of the future Outbound OS install.

### 2.1 Exactly three artifacts, all riding mechanics the plan already requires

1. **Friday 5-line time-per-client log.** Hours by client by activity (replies / portal / teardown / escalations). Folds into the plan's existing Friday build-hour logging and feeds the week-6 delivery-cost audit. This one genuinely earns its keep: it's the pricing floor and the contractor-hiring trigger for everything in sections 3-6, and the arbiter between the plan's 30-min/client delivery target and this doc's heavier hypotheses.
2. **Runbook field notes.** The runbook is one of the plan's three named build exemptions. After every teardown and install, append deviations and timings to a "field notes" section of pilot-install-runbook.md. By Aug 10 the install is documented from 3-4 live reps instead of theory.
3. **Week-4 before/after AR-aging screenshots.** Already mandated by the plan for case study #2. They become the future landing page and Phase 2 content raw material as a side effect.

What got cut, and why it stays cut:

- **No standalone reply taxonomy.** meeting_engine.py already ingests SmartLead's native reply category and sentiment_type per lead. Building a parallel tag list "as the training spec for the Phase 1 auto-categorizer" is pre-building a day-60-gated automation: build-without-send relapse wearing a clipboard.
- **No standalone objection/close log.** The plan's "record every readout" rule already exists. The tape is the log.
- **No archive rituals.** Teardown decks and the weekly proof post self-archive by existing as files. By day 60 the teardown library holds 14-18 readouts' worth of iterations without anyone maintaining it.

### 2.2 The one config task: week 3, Jun 29, same day as the email relaunch

Map exactly one route in `/Users/ryantydingco/Documents/AIOS/aios-starter-kit/config/meeting_engine_routes.yaml`: `"Origami — Agencies Hiring for AR/Billing"` -> the rewritten personalized campaign (the file's own comments already sketch this as campaign 3475533). 30-60 minutes, logged in the Friday build line.

Not earlier, because `routes: {}` is not a bug. The file's comments define it as deliberate default-off behavior: unmapped sources emit a ready-to-upload CSV plus a Telegram line, a human gate. And the plan has cold email DARK until then: domains warming to ~Jun 22, rewrite ships Jun 29, then 350/wk, personalized only, existing Agencies AR/Billing table only. Turning on auto-routing in week 1 would wire fresh leads into a channel budgeted at zero closes and collide head-on with "zero new lists through week 3."

The law-firm and IT-services routes stay unmapped on purpose. Their target campaigns don't exist, creating campaigns is kill-listed, and the CSV+Telegram fallback is the correct behavior for them. Until Jun 29, the "unrouted CSV" state is working as designed.

### 2.3 What NOT to do (kill-list enforcement)

1. No multi-tenant refactor of `meeting_engine.py` or `sync_leads_to_hubspot.py`. That's pre-building the frozen GTM Engine offer on spec.
2. No free tool, no "Outbound OS" landing page, no newsletter, no directory content.
3. No pitching the OS before week 6, and then only inside live AR conversations, per plan.
4. No posting cadence increase beyond 1/week.
5. No new dashboards, lists, or scripts. That includes the auto-deck builder, which is deferred behind the day-60 gate (see 5.6). The Day-3 teardown template plus the week-3 CSV parser already cut teardowns to 30-45 minutes; the plan solved that problem without a new script.
6. No unscheduled insertions into week 1. Changes route through the Friday review or they don't happen.

The ColdIQ rule restated for Ryan: a day with 0 dials and 0 published post is a failed day regardless of what got built.

---

## 3. PHASE 1 — productize the install

**Gate to enter:** 3 signed Managed-AR logos, or a passed day-60 gate (Aug 10: >=4 MRR clients / >=$3,250 signed / >=$6,000 cash), whichever lands first. If the gate fails, Phase 1 does not start; the plan's pre-committed branch (collapse to best sub-ICP, double dials) runs instead.

### 3.1 Offer

"We install your outbound system." ONE ICP: founder-led agencies and professional services firms (5-50 staff), the exact companies already buying Managed AR. First 1-2 sold as upsells inside live AR relationships (the plan's week-6+ back-pocket lane made primary), then cold after 2 installs prove the runbook.

### 3.2 Pricing: Starter only while solo

Anchored to `/Users/ryantydingco/Documents/AIOS-Memory-Bank/dealthreads-gtm-experiment-engine/02 - Dealthreads GTM Experiment Engine Offer.md`. Market band validated there: DFY multi-channel outbound clusters at $3-8K/mo. 90-day initial term mirroring ColdIQ's pilot arc.

- **Sold in Phase 1: Starter.** $1,500-2,500 one-time setup + ~$2,000/mo. 1 ICP, 2-3 experiments/wk.
- **On the rate card but NOT sold solo: Growth (~$3,500/mo) and Scale ($5,000+/mo).** Growth's scope per the offer doc is 3-5 experiments/wk each with a hypothesis, every message human-drafted and human-approved, Ryan-recorded 60-90s Looms, every reply tagged for conversation quality, plus a weekly review document billed as the core artifact. That is 8-12h/wk of human work per client. The section 3.3 refactor automates syncs, digests, routing, and portals; it never touches the strategy/copy layer (section 5's standing rule), so Growth delivery hours don't compress. Growth gets offered only after contractor #1 is hired or after 2 Starter deliveries prove the real hours.

### 3.3 Build: triggered ONLY by a signed contract, billed as fulfillment

All reusing the `scripts/runvue/tenants.yaml` + `runvue_common.load_tenants()` pattern:

1. `scripts/meeting_engine.py` tenant loop + `meeting_engine:` block per tenant (channel key envs, telegram_chat_env, booking_url_env, routes): 4-6h
2. `scripts/sync_leads_to_hubspot.py` tenant loop + per-tenant list/table scope regex: 3-4h
3. Per-tenant routes folded into tenants.yaml: 1-2h
4. Per-agency radar/admin HMAC link in `apps/runvue-portal` (already flagged "next build"): 4-8h
5. Per-tenant DIGEST_FROM + Resend domain: 2h + client DNS
6. Tenant-prefixed state/CSV outputs: 1h
7. lead-engine SmartLead key param + client campaign YAML: 1-2h
8. `upsell_scout.py` branding string: 0.5h
9. Sendr: OMIT from v1. The local-CSV inference at meeting_engine.py:156-190 is unportable; omitting saves 1-2h and a fragile dependency.

Critical path ~10-12h; full list ~18-26h. Rule: not one hour before the contract is signed. At $1,500-2,500 setup the refactor is paid for by install #1.

### 3.4 Per-client onboarding (runbook-derived)

Intake email (SmartLead/Salesfinity/HubSpot keys, logo, campaign-to-client mapping, Telegram chat ID, booking URL); day-1 wiring ~45 min (Airtable rows + .env + tenants.yaml + 1 Railway var); routes block + campaign YAML; manual first sync; portal links via print-link.js; digest verify; 30-min walkthrough. Target: live in 7 days.

Hours honesty: box the FIRST OS install at 20-25h. The plan's 12h box was calibrated on an AR install of a system already running on Kenny's books; the first OS install (per-tenant meeting-engine wiring, routes, campaign YAML, client DNS) will run 2-3x like every first rep. Install #2 earns the 12h claim or it doesn't.

### 3.5 Fulfillment budget (every number a hypothesis until the week-6 audit)

- Starter: 3-5h/wk steady state after install. Hypothesis.
- Growth: 8-12h/wk per the offer-doc scope. Not sold solo.
- Existing Managed AR: this doc's hypothesis is 2-3h/client/wk; the plan's competing prior is 30 min/client/wk through the Runvue portal. They can't both be true. Under the heavier figure, the plan's collision rule (>8h/wk total delivery cuts prospecting) trips at just 2-3 clients. The week-6 delivery-cost audit on client #2's actuals is the arbiter. No Phase 1 strategy decision keys off the hours column before that audit lands.
- "Dial blocks" is struck from AR delivery. Managed AR is automated chasing in the client's voice with escalation routed to the OWNER; nothing in the offer has Ryan phoning debtors. If a Ryan-dials add-on ever exists, it's a separately priced product that hasn't been designed or sold.

---

## 4. PHASE 2 — DAY 90+ (realistically mid-Sep to late Oct, the plan's own honest $10K window): the acquisition engine ColdIQ actually runs on

1. **Founder content: hold 1-2 posts/wk.** Don't copy the 3-5/wk cadence; it rode a 65K-follower account, team amplification, and eventually ghostwriting, and still took 6-12 months to produce inbound. Solo at near-zero followers, 3-5 posts/wk is 4-8h/wk shipped into a void at the exact moment Ryan is fulfilling 6+ clients. Spend the saved hours on the two solo substitutes that don't need an audience: (a) engagement-first, 15 min/day commenting on agency-owner posts (sub-1K accounts earn more reach from comments than posts, and the LinkedIn comment tooling is already wired); (b) make distribution the sequence rather than the algorithm: every proof post becomes a 1:1 asset embedded in dial follow-ups, Sendr video pages, and readout pre-reads, where content's first job actually lives (making cold convert). Every post still anchors to a real client number from the Phase 0 artifact library. Daily sends continue regardless.
2. **AR Risk Radar, concierge mode only.** Ryan manually runs the existing Mandate Signal Detector scripts (`AI GTM Engine/Operations/scripts/`, funding + hiring-depth via Greenhouse/Lever + Firecrawl) on a named prospect's domain and sends the 1-page report as the cold-open hook: "Ran your agency through our AR risk radar. 3 flags. Want the 15-min walkthrough?" Zero build, doubles as outbound personalization, and generates the screenshots that justify productizing later IF inbound requests ever exceed manual capacity. A self-serve version today is a landing page with no traffic source, and "<2 weeks of wrapping" turns into auth, email capture, report rendering, rate limiting, abuse handling, and Firecrawl cost control. Productize on demand evidence, never on spec. The free teardown already IS the free tool, human-delivered and converting.
3. **Newsletter: killed** until an audience source exists. Ryan already owns distribution to ~3,000 contacts; it's called the outbound list. Resend stays client-facing for digests.
4. **First hire: part-time contractor** for reply triage + Ryan's dial blocks, $15-25/hr (~$600-1,000/mo), triggered at ~4-5 managed clients OR fulfillment >15h/wk per the Friday time log. Training material: the readout recordings plus SmartLead's native reply categories (no separate taxonomy ever got built, and none was needed). Hire #2, later: an install tech running runbook v2. This is the honest ColdIQ lesson: past ~4-5 clients the scaling unit is a person. Contractor cost is COGS inside the section 6 margin math, never an afterthought.
5. **The 777-EUR-style paid consult** (Stripe link, 1 hour): introduce only when inbound teardown requests sustainably exceed ~2/wk. Until then, every teardown request, even from unlikely buyers, is rep volume for a closer with 0 lifetime meetings. That's worth more than EUR777.

---

## 5. AUTOMATION MAP — which currently-human steps get automated, in order, with trigger gates

| # | Human step today | Automation | Trigger condition | Build hrs | Gate required first |
|---|---|---|---|---|---|
| 5.1 | New-source Origami leads land as CSV + Telegram line (deliberate human gate, working as designed) | Map the single AR/Billing route in routes.yaml; law/IT stay unmapped | Jun 29, same day as the email relaunch | 0.5-1 | Week-3 email relaunch; logged in the Friday build line |
| 5.2 | Teardown built by hand (~2h) | AR-aging CSV parser -> 30-45 min teardowns | Plan week 3 (one of the three named build exemptions) | 1-2 | None; plan-sanctioned |
| 5.3 | SmartLead reply triage on RYAN'S OWN prospecting campaigns | Draft-and-suggest classifier; human approves (the human stays in the loop; that's the quality moat) | 3rd paying client OR triage >5h/wk | 6-10 | Day-60 pass; ideally billed to client 3-4 |
| 5.4 | meeting_booked marked by hand (cal.com key 401) | HubSpot crm.objects.meetings.read scope + fix cal.com auth | Same as 5.3 | 2-4 | Day-60 pass |
| 5.5 | Sendr engagement checked manually (Ryan's outbound) | Sendr webhooks -> Runvue Railway receiver -> auto-warm | Paid work for client 3-4 (playbook already names this "next build") | 4-8 | Day-60 pass |
| 5.6 | Readout deck assembled by hand | Teardown CSV + template -> auto-deck | Day-60 pass, alongside 5.3-5.5. Escape valve: if readout production demonstrably crowds out the dial block before then, raise a Friday-review exemption with logged hours as evidence. Not pre-authorized here | 3-5 | Day-60 pass |
| 5.7 | Booking-link replies typed by hand | Suggested replies embedded in the 3x/day Telegram brief | After 5.3 ships | 4-6 | Day-60 pass |
| 5.8 | Single-tenant operating layer | The full 18-26h tenant refactor (section 3.3) | First SIGNED in-their-accounts engagement | 18-26 | Phase 1 gate + signed contract |

Two standing rules:

- **5.3-5.5 automate the ACQUISITION funnel, not client delivery.** 5.3 classifies replies on Ryan's own prospecting; 5.4 detects Ryan's booked meetings; 5.5 watches Ryan's outbound engagement. Managed-AR delivery hours live in escalation judgment, dispute handling, promised-pay tracking, and renewal invoicing, the exact items the plan's QuickBooks-objection slide names as the human value ("auto-reminders aren't escalation judgment"). None of 5.3-5.5 touch those. Delivery relief comes from the portal features that already exist plus the Phase 2 contractor.
- **Never automate the strategy/copy-iteration layer.** ColdIQ keeps it human too, and it's why clients pay.

Ordering principle: the one config mapping (5.1) on relaunch day, the plan-sanctioned parser (5.2) in week 3, the binding acquisition constraint (5.3) first after the gate, and everything else only when a client's check funds it or logged hours exceed the cap.

---

## 6. UNIT ECONOMICS

### 6.1 Per-client revenue vs fulfillment hours

The day-60 book is contractually mostly founding-rate: the live Skool offer is $750 install + $99/mo (2 slots, 12-month lock), and the first 3 AR clients are $750/mo locked 12 months. Phase 1 pricing floors derive from the founding-rate column, since those locked contracts run through ~mid-2027.

Every hours cell is a HYPOTHESIS. The plan's competing prior for Managed AR is 30 min/client/wk through the portal. The week-6 audit on client #2's actuals arbitrates.

| Phase | Offer | Founding rate (actual book) | Standard rate | Hrs/wk hypothesis | $/hr at founding rate |
|---|---|---|---|---|---|
| 0 | Runvue portal-only pilot | $750 install + $99/mo (12-mo lock) | $1K install + $149/mo | 0.5-1 | ~$23-46 |
| 0 | Managed AR (email chasing + escalation judgment; no dial blocks exist in this offer) | $750/mo, first 3 clients, 12-mo lock | $1,000/mo | 2-3 (vs plan prior 0.5) | $58-87 at hypothesis; ~$346 at the plan's 30-min prior |
| 1 | Outbound OS Starter | n/a (post-gate offer) | $1.5-2.5K setup + ~$2,000/mo | 3-5 (after 20-25h first install) | ~$92-154 |
| 1, deferred | Outbound OS Growth | n/a | setup + ~$3,500/mo | 8-12 per offer-doc scope | ~$67-101 solo, which is exactly why it waits for contractor #1 |

### 6.2 Paths to $10K MRR

- **AR-only:** 3 founding ($2,250) + 8 standard ($8,000) = $10,250 at 11 clients; ~14 at the plan's 70%-attach base case. Delivery hours at 11 clients: ~5.5-7h/wk at the plan's 30-min prior (comfortably solo, dial engine intact) versus ~22-33h/wk at this doc's 2-3h hypothesis (ceiling breached around client 6-8, since >8h/wk delivery trips the plan's cut-prospecting rule). Which world is real is the week-6 audit's call, not this doc's. The plan's own honest date: mid-Sep to late Oct.
- **Mixed (realistic Phase 1, modeled at Starter only, sold exclusively to proven AR clients):** 4-5 AR ($3,250-4,250 on the founding-heavy book) + 1-2 Starter ($2,000-4,000) = ~$5.3-8.3K, reaching ~$7-9K when both Starters land, with $10K arriving on AR client #6-7 at standard rate. That matches the plan's mid-Sep-to-late-Oct window instead of silently beating it.
- **Struck from the model:** 2 Growth clients at the $3,500 anchor by Sep-Oct. As of Jun 11 the funnel has booked zero meetings ever, the close base is 15% on a $2K offer, no external case study exists, and the plan's own stretch lever is ONE Starter in weeks 7-8. No observed rate anywhere supports anchor-tier x2, or 50% of the AR book buying a second product 3.5x the size of their first within weeks of signing.

### 6.3 Path to $25K MRR (a Phase 2+ number; it does not exist solo)

Sample composition: 4 Growth ($14,000) + 2 Starter ($4,000) + 7 AR ($6,250: 3 founding + 4 standard) = ~$24-25K gross.

Hours, honestly derived: 4 Growth at 8-12h each = 32-48h, + Starters 6-10h, + AR delivery 3.5h (plan prior) to 14-21h (hypothesis). 5.3-5.5 get credited ONLY against Ryan's own prospecting/triage hours (~4-6h/wk back); they buy back zero client-delivery hours. So $25K requires contractor #1 (trigger ~4-5 managed clients, $600-1,000/mo as COGS, netting ~$23.3-23.7K) taking triage, dial blocks, tagging, and report assembly, which cuts Ryan's Growth share to roughly 5-8h/client. Even then Ryan carries 25-35h/wk of delivery plus his own selling, so $25K realistically also wants hire #2 (the install tech) or a heavier AR mix. That's arithmetic.

### 6.4 The solo ceiling and what breaks it

The binding constraint is human-judgment hours on both sides of the business: acquisition (Ryan's reply triage, booking sends, dial blocks) and delivery (escalation judgment, disputes, promised-pay tracking, renewals on AR; experiment design and copy on OS).

- Under this doc's hours hypothesis: ~4-6 Managed AR clients + 1-2 OS Starter while still prospecting.
- If the week-6 audit lands near the plan's 30-min prior: the AR side of the ceiling roughly doubles (10-14 AR clients), while OS capacity stays at 1-2 Starter, because experiment design doesn't compress.
- Automations 5.3-5.5 return ~4-6h/wk of acquisition time and raise meeting throughput; they do not raise delivery capacity.
- Contractor #1 (~4-5 managed clients, $600-1,000/mo COGS) is what actually breaks the ceiling; hire #2 breaks the next one.

Benchmark: ColdIQ runs ~$215K revenue/head with 30+ people. Ryan at $25K MRR with one contractor is ~$250-280K/head, plausible precisely because his delivery plumbing already exceeds what ColdIQ had at the equivalent stage.

### 6.5 The number that matters before any of this

Readouts held. The plan's chain (commitments x 70% held x 15% close) puts 14-18 readouts and 3-4 MRR clients at day 60. Every Phase 1 and Phase 2 decision keys off that gate, never off build progress.

---

## Key file paths

- `/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/60-DAY GAME PLAN — 10K MRR — 2026-06-11.md` (gates, kill list, the three build exemptions)
- `/Users/ryantydingco/Documents/AIOS/aios-starter-kit/apps/runvue-portal/docs/pilot-install-runbook.md` (install checklist seed; field notes accrete here)
- `/Users/ryantydingco/Documents/AIOS/aios-starter-kit/scripts/runvue/tenants.yaml` + `runvue_common.py` (the reusable multi-tenant pattern)
- `/Users/ryantydingco/Documents/AIOS/aios-starter-kit/config/meeting_engine_routes.yaml` (default-off human gate; map the single AR/Billing route on Jun 29, nothing else)
- `/Users/ryantydingco/Documents/AIOS-Memory-Bank/dealthreads-gtm-experiment-engine/02 - Dealthreads GTM Experiment Engine Offer.md` (Phase 1 pricing: $1.5-2.5K setup; Starter $2K sold solo; Growth $3.5K and Scale $5K+ deferred to contractor #1)
- `/Users/ryantydingco/Documents/AIOS/aios-starter-kit/docs/meeting-engine-playbook.md` (the two pre-named automation hooks behind 5.4/5.5)
