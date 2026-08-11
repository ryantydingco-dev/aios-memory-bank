# CA AI Implementation Game Plan — 2026-07-07 (v2, post-adversarial-review)
Companion to `ai-usecases-for-CA-2026-07-07.md` (the research). v2 incorporates a 10-finding adversarial review; the two load-bearing corrections: (1) reactivation runs on Kenny's QB customer book + the existing reorder-rescue list, NOT the 2,947 HubSpot contacts (those are cold leads from the retired consulting sprints); (2) dormant-customer outreach never touches the SmartLead cold-email infrastructure.

## Operating rules (non-negotiable)
1. **Revenue never pauses for builds.** Daily reply handling on the live SmartLead campaigns comes first, every day. Builds ride in CA build blocks only.
2. **One build in flight at a time.** A build isn't done until it ran on real data, has error alerting, and Ryan reviewed its first outputs.
3. **Every shipped build = one Friday episode** — except exam week (Jul 17 recording is explicitly skipped or covered by a banked episode).
4. **Human review gate on everything customer-facing** until it survives 2 weeks of spot-checks. Agents draft, humans send.
5. **Own numbers only.** Snapshot baselines before each upgrade; no external ROI stats (none survived verification).
6. **ACE exam Jul 18 is protected.** Weeks 1–2: Ryan hands-on time ≤1h/day beyond daily replies.
7. **Deliverability firewall.** Dormant/warm customer outreach goes by phone + personal email from the real CA domain (Kenny/Maclaine/Ryan). SmartLead inboxes are for cold campaigns only. Every dormant email gets validated (NeverBounce-class) before any send.
8. **Logo fidelity rule.** The client's actual logo file is composited deterministically onto product templates (transforms/masking). Gen-AI may produce backgrounds/scenes — it never renders the logo or text. One mangled trademark in front of a law-firm buyer kills the wedge.

## Phase map

### Week 1 — Jul 7–13: Foundations only (~1 day of Ryan time total)
- **Hardening (half-day):** Telegram error alerting on every launchd job, run logs, git on automation scripts, secrets to .env, memory-file size caps, and model routing (cheap models for mining/monitoring crons; frontier for planning/audits) — routing is what controls the API bill later.
- **30 min:** authorize HubSpot/QuickBooks/PayPal connectors in claude.ai settings → small-business skills usable (invoice-chase, margin-analyzer, lead-triage). Run crm-cleanup on the **QB customer contacts** (`Creative-Alternatives-AIOS/context/import/qb_customer_contacts.csv`) — not the 2,947 cold HubSpot leads.
- **30 min baselines:** SmartLead Financial + Law reply/positive rates to date; current time-to-first-reply on inbound; minutes per manual mockup.
- **Claude-only background tasks (30-min review each):** (a) inventory which of the 29 GrowthEngineX skills apply to promo ICPs; (b) enrich the existing top-25 reorder-rescue list with "where the relationship left off" — needs a QB *sales-by-customer-detail* export (Ryan requests it from Kenny/QB, 10 min) + any email history; (c) validate the 112 dormant emails on the rescue list.
- **Kenny shadow day → voice-memo variant:** instead of burning a full day pre-exam, Kenny voice-memos his tasks as he does them for one day; reverse-prompt the transcript into the ranked automation roadmap. Full shadow day can happen week 3+ if the memo version is thin.
- **Friday record (banked episode, low prep):** the research findings — "AI is coming for my industry's #1 selling tool (and almost nobody's using it)": mockup-wedge commoditization clock, 25% adoption stat, the white space.

### Week 2 — Jul 14–18: Exam week. Claude works, Ryan reviews ≤1h/day.
- Approve **wave 1 = the 10–15 accounts from `top-25-reorder-rescue-this-week.csv` that will ALL get mockups** (uniform treatment — no mixed test). Owners stay as assigned on the list (call-first: `call_then_email`).
- Hand-make the 10–15 mockups across the week (existing wedge process, ~short sessions). If exam prep squeezes, cut wave size, not mockup coverage.
- **No new builds. No Jul 17 recording.** Jul 18: exam.

### Week 3 — Jul 20–26: Wave 1 goes out + mockup factory sprint
- **Monday: wave 1 launches.** Kenny/Maclaine phone their assigned accounts ("you ordered X for your 2023 conference — we mocked up this year's version"), personal-email the mockup as follow-up from the CA domain. This is simultaneously the highest-conversion play and the Kenny buy-in artifact. Ryan tracks: connects, replies, meetings, reorder conversations.
- **Build: mockup factory** (Herk task-queue blueprint): "logo + SKU" queue → deterministic logo compositing per rule 8 (gen-AI scenes optional) → asset posted to CRM record/email thread; human review checkpoint. Pick the image API and set a per-mockup cost cap on day 1. Acceptance: 10 real mockups at send-quality; track $ + minutes vs manual baseline. **Fallback if quality fails:** template compositing for the top-20 SKUs *is* the factory — ship that.
- **1 hour: secret-shop skubot beta + SAGE instant virtual samples.** Grade their output vs CA's. This data feeds the Aug 10 and September decisions (research open question #2).
- **Friday record:** "I built a mockup factory for a $3.2M promo business."

### Week 4 — Jul 27–Aug 2: One build — the inbound reply pipeline (speed-to-lead + dossier merged)
- Single pipeline, two milestones sharing one trigger (inbound form/email or SmartLead warm reply):
  - **M1 — speed-to-lead:** instant qualification → HubSpot deal → drafted reply with the prospect's logo on a product (factory output). Ryan approves every send for 2 weeks (rule 4).
  - **M2 — dossier:** same trigger also produces a swag-angle brief (firm events, hiring, brand, email history) to Telegram before the human replies.
- **Measure draft-latency and send-latency separately** — don't claim "10-minute replies" on camera while the approval gate is on; the honest week-4 claim is draft speed.
- **Friday record:** "Every lead now gets a mockup drafted before I've even seen the email."

### Weeks 5–6 — Aug 3–16: Outbound v2 (clean A/B) + wave 2
- **A/B design (pre-committed):** randomize ONE lead list into both arms; control = current sequences, variant = GrowthEngineX per-lead sub-agent personalization + Saraev site-crawl icebreakers (crawl doubles as mockup intel). **Split existing daily send volume 50/50 — total volume does not increase.** Minimum ~300 sends/arm before judging; judge on positive replies + meetings, not raw reply %. CORRECTED 2026-07-07 (full local read of all 28 skills, see plans/coldoutbound-skills-inventory-2026-07-07.md): the repo DOES ship scripted SmartLead warmup/inbox management (smartlead-inbox-manager), spintax generation, deliverability audits, and a draft-mode campaign uploader — the earlier "upload only" refutation was wrong. Use experiment-design + email-deliverability-audit (baseline BEFORE the A/B) + positive-reply-scoring as the measurement layer.
- **Wave 2 reactivation:** next tranche off the 117-account rescue list with factory mockups, still call-first + personal email per rule 7.
- Inbox triage: **parked** (gap-week list). "If capacity allows" is how scope creep happens.
- **Aug 10 checkpoint (Sunday review): leading indicators only** — wave-1 connects/replies/meetings, draft-latency delta, mockup $/min, skubot/SAGE quality grades. Reorder *conversions* are judged at the Oct 1 stress test; promo reorder cycles don't close in 3 weeks, and n=25 can't carry a conversion verdict.

### Weeks 7–8 — Aug 17–30: Ops backbone (wins Kenny)
- Supplier PDF extraction → order-tracking table (rule-based, deterministic; anomaly flags vs original quote: margin, ship dates, billing errors).
- Kenny daily ops digest on top (open orders, proof-pending, at-risk ship dates, cooling buyers) → Telegram. **KPI: taps on a one-tap "got it / show me" button in the digest** (read receipts aren't observable), unprompted by day 7.
- Buyer-trigger monitoring cron (vendor complaints + hiring/office/award triggers → auto-mockup outreach hooks).

### September — The moat (decided at Aug 10 with the skubot/SAGE intel; Hyrox Sep 9 taper respected)
Pick ONE, corpus/design work early September, build after the race:
- **Buyer-facing self-serve mockup tool** — still-open lane (skubot/SAGE are distributor-side). Pre-ship: adversarial multi-agent bug audit before any law-firm buyer touches it. If the week-3 secret-shop shows skubot exiting beta strong, accelerate or reposition.
- **Digital Kenny RAG** — corpus assembly first (Kenny interviews, quote archives, decoration specs); 30-day correction loop budgeted.

### Gap-week / standing list
- Inbox triage agent (2–3d) · social-proof pipeline: closed-won → case-study card → LinkedIn/SmartLead (2–3d) · full Kenny shadow day if voice-memo version was thin.
- **Quarterly rituals:** strategy stress test w/ council personas (first run ~Oct 1 — also where reactivation conversions get judged); secret-shop CA's quote flow vs 4imprint (slowest step = next build).

## Weekly rhythm (unchanged blocks, new content)
- **Daily:** replies first (campaigns + inbound), then the CA build block on the ONE in-flight build. 1:45pm Content Factory continues.
- **Friday:** record the week's shipped build (except Jul 17).
- **Sunday 5pm review:** score the week, confirm next week's single build, check the in-flight KPI.

## KPIs (self-measured)
| Play | Metric | Baseline |
|---|---|---|
| Wave 1 reactivation (n=10–15) | connects, replies, meetings (leading); conversions judged Oct 1 | n/a |
| Inbound pipeline | draft-latency AND send-latency, separately | Week 1 |
| Outbound v2 A/B | positive replies + meetings per arm, ≥300 sends/arm, one randomized list | Week 1 |
| Mockup factory | $ + minutes per mockup, mockups/week | Week 1 (manual) |
| Kenny digest | one-tap acks by day 7 | n/a |

## Risks
- **Deliverability** — rule 7. The live cold campaigns are the only working outbound channel; nothing warm/dormant rides their inboxes, and A/B never doubles volume.
- **Logo fidelity** — rule 8. The research *refuted* "gen-AI mockups are established in promo"; deterministic compositing is the moat-safe architecture.
- **Scope creep** — rule 2 + the parked list. 16 research items run serially, not in parallel.
- **Exam sacrifice** — week 1 is ~1 day of hands-on time; week 2 is review-only. A failed ACE exam costs more than two weeks of builds.
- **Commoditization window** — factory live by end of July; skubot/SAGE secret-shop in week 3 keeps the September decision honest.
- **Kenny adoption** — he's active in week 3 (wave-1 calls), week 7 (digest), September (Digital Kenny). If he disengages, pause backbone work and fix that first.
- **Small-n overreach** — no conversion verdicts before Oct 1; no A/B winner before 300/arm.
