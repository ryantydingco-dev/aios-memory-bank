# 03 — GTM Agent Team Architecture

> What the customer actually gets: a small, deployed GTM operating team that runs the weekly Experiment Engine. Each "agent" is a defined role with one job, clear inputs/outputs, and a human approval gate where brand or judgment is on the line. This is the org chart of the machine — not a roster of cool-sounding bots.

---

## Read this first (so we don't lie to ourselves or the client)

A few honest framings before the role specs, because "11 AI agents" is exactly the kind of claim that smells like automation-agency slop:

- **"Agent" = a role with a defined job, not necessarily an autonomous bot.** Some of these run mostly on automation + data tools (TAM Builder, Signal Scout, Reply Router). Several are **AI-assisted operator workflows** — a human (Ryan, in the pilot) running a tight checklist with AI drafting underneath (ICP Architect, Loom Scriptwriter, GTM Ops Lead). We name them as roles so the *system* is legible and survives a person leaving. We do not pretend a model is autonomously DMing your prospects.
- **Nothing reaches a prospect without a human "yes."** Every outbound-facing role has an approval gate. Human approval is the product, not the bottleneck (per the offer doc).
- **The artifacts are the contract.** Every role's output is a concrete artifact you can see — research card, account universe, experiment card, weekly review. If a role doesn't produce a visible artifact, it doesn't exist.
- **You do not deploy all 11 on day one.** See [Deploy order](#deploy-order--what-to-stand-up-first) at the end. Standing up the whole fleet for pilot #1 is over-engineering; the lean core is 4 roles.

The team maps directly onto the weekly loop:

`Context → Universe → Signal → Contact → Message (LinkedIn/Loom/Follow-up) → Reply → CRM → Measure → Improve`

| Loop stage | Owning role(s) |
|---|---|
| Context | ICP Architect |
| Universe (TAM) | TAM Builder |
| Signal | Signal Scout |
| Contact | Contact Mapper |
| Message — LinkedIn | LinkedIn Strategist |
| Message — Loom | Loom Scriptwriter |
| Message — Follow-up | Follow-Up Operator |
| Reply | Reply Router |
| CRM / handoff | CRM Ops Agent |
| Measure + Improve | Experiment Analyst |
| Orchestration (owns the whole loop) | GTM Ops Lead |

---

## The roles

### 1. ICP Architect
*(plain-English name: **Targeting & Context Lead**)*

**Purpose.** Turn the client's offer, proof, and won/lost patterns into a sharp, written ICP and a fit-signal definition — the source of truth every other role reads from. Garbage in here poisons the whole loop, so this is the most leverage-dense role.

**Inputs.** Offer + pricing, case studies/wins, lost-deal patterns, the client's own "best clients," objection notes, the kickoff call.

**Outputs.**
- **Context pack** (offer, positioning, proof, objections, won/lost patterns).
- **ICP definition** — firmographics + the buyer persona + a written "why this account fits" rubric.
- **Fit-signal spec** — the CLOSING / HIRING / VOLUME / PAIN-style signals (adapted to the client's business) that mark a good-fit, good-*timing* account.
- **"Qualified conversation" definition** — what counts as a win, in the client's words.

**Tools / data sources.** Kickoff transcript, client's site/case studies, LinkedIn (to study their best existing clients), the AI-assist drafting layer. No paid data needed yet.

**Human approval points.** **High-touch.** Client signs off on the ICP, the fit signals, and the definition of "qualified conversation" before any list gets built. This gate protects the entire downstream spend.

**KPIs.** ICP precision (what % of the universe the client agrees is "right-fit" on review); how stable the ICP is after week 1 (lots of churn = it was rushed); downstream reply quality traced back to ICP accuracy.

**Failure modes.**
- ICP left too broad ("agencies") → TAM Builder produces a junk universe → everything downstream wastes touches. (This is the exact warning from the ICP doc — narrow before you prospect.)
- Signals defined as *firmographics* (size, industry) instead of *timing* triggers → you target fit but not readiness.
- Skipped/rushed because it's "just strategy" → the most expensive failure, found 3 weeks later in bad replies.

---

### 2. TAM Builder
*(plain-English name: **Account Universe Builder**)*

**Purpose.** Build and enrich the actual list of in-scope accounts (the TAM, scoped to what's reachable this quarter), so experiments run against a real, deduped, enriched universe — not a stale CSV.

**Inputs.** The approved ICP + fit-signal spec from the ICP Architect.

**Outputs.**
- **Account universe** — companies matching the ICP, deduped, with firmographic enrichment (size, sector, location, tech/observable attributes).
- **Coverage note** — how big the reachable universe actually is (a reality check: if the ICP yields 40 accounts, the motion needs rethinking; if 40,000, it's too broad).

**Tools / data sources.** LinkedIn Sales Navigator (primary for this ICP), an enrichment source (e.g. Apollo/Clay-style tooling), public web. Built to be tool-flexible — we spec what the client has rather than force a stack.

**Human approval points.** **Medium.** Client approves the account list (or a representative sample) before enrichment spend and before any outreach. Quick lane, not a committee.

**KPIs.** Universe size vs. ICP (is it a sane number?), enrichment coverage/accuracy %, duplicate rate, % of accounts that survive the client's sample review.

**Failure modes.**
- Enrichment garbage (wrong company, dead data) → personalization breaks downstream.
- Over-scoping to hit a vanity "TAM size" → reintroduces spray-and-pray by the back door.
- Treating the universe as static → it must be refreshed as signals change; a frozen list decays like a bought one.

---

### 3. Signal Scout
*(name's fine — it does one clear thing)*

**Purpose.** Watch the account universe for the timing triggers defined in the fit-signal spec and rank accounts by *readiness*, so outreach hits accounts when there's a live reason to talk — the difference between "good fit" and "good fit, right now."

**Inputs.** The account universe + the fit-signal spec.

**Outputs.**
- **Signal-scored account queue** — each account tagged with the signal(s) that fired (e.g. HIRING SDRs, recent funding, leadership change, content signalling a pain), the evidence/source, and a recency stamp.
- **This-week's priority accounts** — the ranked shortlist that feeds research cards.

**Tools / data sources.** LinkedIn (job posts, headcount moves, posts/activity), news/funding sources, the client's own intent data if any, web monitoring. (Mirrors Oloxa's CLOSING/HIRING/VOLUME/PAIN scoring.)

**Human approval points.** **Low.** Signal *logic* was approved upstream (ICP Architect). Spot-check only — periodically confirm a fired signal is real and not a false positive.

**KPIs.** Signal precision (do flagged accounts actually convert to better conversations?), signal freshness (lag between trigger and detection), % of outreach that lands on a genuinely "warm-timed" account.

**Failure modes.**
- False positives → wasted personalization on accounts with no real trigger.
- Stale signals → reaching out about a "recent" event that's 3 months old kills credibility.
- Over-indexing on one easy-to-detect signal (e.g. hiring) and missing the higher-intent, harder ones.

---

### 4. Contact Mapper
*(plain-English name: **Decision-Maker Finder**)*

**Purpose.** For each priority account, find the right human (the actual buyer/decision-maker) and a clean, reachable contact path — so the perfect message doesn't land on the wrong person or a dead profile.

**Inputs.** Signal-scored priority accounts + the buyer persona from the ICP.

**Outputs.**
- **Contact records** — name, role, LinkedIn profile URL, profile activity level (are they actually on LinkedIn?), email *only if* needed for the optional secondary channel.
- **Reachability flag** — best channel per contact (LinkedIn-active vs. not), so the LinkedIn Strategist isn't firing into a dormant profile.

**Tools / data sources.** LinkedIn / Sales Navigator, enrichment tooling for verified contact data, the client's CRM (to avoid re-touching existing relationships).

**Human approval points.** **Low–medium.** Client confirms persona/seniority fit on a sample; flags any do-not-contact (existing clients, conflicts, friends).

**KPIs.** Right-persona match rate, contact data validity (bounce/dead-profile rate), LinkedIn-active %, duplicate-against-CRM catch rate.

**Failure modes.**
- Targeting the wrong seniority (too junior = no authority; too senior = no relevance).
- Contacting someone the client already knows/has a relationship with → embarrassing, brand-damaging.
- Dead or dormant LinkedIn profiles treated as reachable → silent failure (no replies, no clear reason).

---

### 5. LinkedIn Strategist
*(plain-English name: **LinkedIn Outreach Lead**)*

**Purpose.** Own the primary channel: design and draft the connection request → first DM → message sequence per segment/angle, in the client's peer-to-peer founder voice, on a cadence that's reputation-safe (low-volume, human-paced — not bot-paced).

**Inputs.** Contact records, research cards (the opener + pain hypothesis), the approved messaging system, the week's experiment design (which angle/segment).

**Outputs.**
- **Per-account LinkedIn message drafts** — connection note (no pitch), first DM (names the wound, soft Loom ask), and the structured sequence.
- **Send cadence + daily caps** — paced to look human and protect the profile.
- **Touch log** — invites sent, accepts, replies (feeds the Analyst).

**Tools / data sources.** LinkedIn / Sales Navigator, the messaging system v1, AI-assist for drafting variants. **No aggressive auto-senders** — cadence stays within human, profile-safe limits.

**Human approval points.** **High — the core gate.** Every message (or every sequence, via a fast approval lane) is approved before send. In the pilot, it sends from Ryan's own profile, so Ryan *is* the approver. This is the on-brand, anti-spam guarantee.

**KPIs.** Connection accept rate → DM reply rate → Loom-ask conversion → **qualified-conversation rate** (the one that matters). Profile health (zero restrictions/warnings).

**Failure modes.**
- Templated, "Dear [First Name]" energy → ignored, and it cheapens a high-ticket brand.
- Volume creep / aggressive automation → LinkedIn restrictions or a torched profile (especially bad when it's Ryan's own).
- Optimizing accept/reply *rate* over conversation *quality* → vanity metrics, no pipeline.

---

### 6. Loom Scriptwriter
*(plain-English name: **Loom Brief Writer** — note: writes the brief, the human records)*

**Purpose.** Turn a research card into a tight 60–90s Loom script/outline that screen-shares the prospect's *own* world (e.g. a draft research card for one of *their* target accounts) — the show-don't-tell differentiator. The script makes recording fast and repeatable; it does **not** generate a fake video.

**Inputs.** The research card (signal, evidence, pain hypothesis, personalized opener), the chosen angle.

**Outputs.**
- **Loom script/outline** — 60–90s: hook (their specific signal/pain) → quick value demo (the artifact on screen) → low-friction CTA ("worth 15 min?").
- **Recording shot-list** — what to show on screen, so batching Looms takes minutes.

**Tools / data sources.** Research card, AI-assist for scripting, Loom (the human's recording tool).

**Human approval points.** **High by definition — the human records it.** It's the client's (or Ryan's) actual face and voice. The script is approved *and* performed by a human every time. No synthetic video, no impersonation.

**KPIs.** Loom view rate, view-to-reply rate, reply quality from Loom-touched accounts, recording time per Loom (efficiency — is the brief actually making it fast?).

**Failure modes.**
- Generic script that *could* apply to anyone → defeats the entire point of the channel.
- Scripts too long/complex to batch → the human stops recording them, the differentiator dies.
- **Over-engineering risk:** trying to automate/synthesize the video. The whole edge is that it's genuinely personal — automating it destroys the moat. (Flagged again in the critique section.)

---

### 7. Follow-Up Operator
*(name's fine)*

**Purpose.** Run the structured 2–3-touch follow-up where most replies actually live — each touch adding value (a second angle, a relevant proof artifact), never "just bumping this." Make sure no warm-but-quiet thread dies from neglect.

**Inputs.** Touch log + reply status from LinkedIn Strategist / Reply Router, the messaging system's follow-up library.

**Outputs.**
- **Scheduled follow-up touches** per non-responder/soft-responder, sequenced over ~10 days.
- **Value-add assets per touch** (drafted) — the "here's a second angle" or "thought of you re: X" content.
- **Stop/continue flags** — when to gracefully stop (so we never become the annoying founder).

**Tools / data sources.** LinkedIn, the follow-up message library, the tracking sheet/CRM, AI-assist for drafting variants.

**Human approval points.** **Medium.** Follow-ups run on the approved messaging system, so a fast approval lane (or batch approval) works; net-new angles get a closer look.

**KPIs.** Reply rate *attributable to follow-ups* (often the majority), touches-to-reply, opt-out/negative-reaction rate (must stay near-zero — the anti-spam guardrail), % of warm threads that go cold (should be low).

**Failure modes.**
- "Just bumping this" filler → annoys prospects, cheapens the brand, drives opt-outs.
- Over-following-up → crosses into spam-feel, the exact thing we sell against.
- Dropping warm threads → the most expensive miss; a curious prospect ghosted because no one followed up.

---

### 8. Reply Router
*(plain-English name: **Reply Triage**)*

**Purpose.** Catch every reply, classify it by intent *and conversation quality*, and route it to the right next action — fast — so real interest reaches a human immediately and the loop captures clean quality data.

**Inputs.** Inbound replies across LinkedIn (primary), email (if used), the touch log.

**Outputs.**
- **Tagged replies** — real interest / soft no / objection / not-fit / ghost (the conversation-quality taxonomy from the offer).
- **Routing** — hot replies → immediate human handoff (client takes the call); objections → Follow-Up Operator with the right rebuttal; not-fit → suppress + feed back to ICP Architect.
- **Quality data feed** → Experiment Analyst.

**Tools / data sources.** LinkedIn inbox, email inbox (if used), CRM, AI-assist for first-pass classification.

**Human approval points.** **Medium.** AI does first-pass tagging; a human confirms before anything is treated as "qualified" or before a nuanced reply gets an auto-response. **Hot leads always go to a human — never auto-replied.**

**KPIs.** Classification accuracy, time-to-route on hot replies (speed kills or saves deals here), % of qualified conversations correctly escalated, mis-tag rate.

**Failure modes.**
- Mis-tagging a hot lead as soft → a real buyer goes cold while sitting in the wrong bucket.
- Slow routing → the prospect's interest window closes.
- Auto-replying to a nuanced/sensitive message → off-brand, exactly what human approval exists to prevent.

---

### 9. CRM Ops Agent
*(plain-English name: **Pipeline Hygiene**)*

**Purpose.** Keep the system of record clean — log every touch, status, and warm handoff as a trackable task — so nothing warm goes cold and the client always sees an honest pipeline. If the client has no CRM, this runs on a shared tracking sheet.

**Inputs.** Touch logs, reply tags, routing decisions, qualified-conversation flags.

**Outputs.**
- **Updated CRM/tracking records** — account, contact, touch history, status, conversation-quality tag.
- **Follow-up tasks** for every warm thread → handed to the client (they close).
- **Clean pipeline view** that feeds the weekly review.

**Tools / data sources.** Client CRM (HubSpot/Close/etc.) or a shared sheet; the touch/reply logs.

**Human approval points.** **Low.** Logging is mechanical and safe to run hands-off; the client just consumes the output. Approval only where a record changes deal stage/value.

**KPIs.** Data completeness (no orphan touches), task follow-through rate, stale-record rate, accuracy of the pipeline view vs. reality.

**Failure modes.**
- Half-logged data → the weekly review and Analyst run on garbage.
- Warm threads with no task created → they silently die (the thing this role exists to prevent).
- Over-building: a full CRM replatforming project. Explicitly out of scope — we work with what's there. (Critique section.)

---

### 10. Experiment Analyst
*(plain-English name: **Weekly Learning Lead**)*

**Purpose.** Close the loop. Read what shipped vs. what worked — by segment, angle, and opener — measuring reply rate **and conversation quality**, then write next week's experiment plan from evidence. This is the role that makes week 5 sharper than week 1; it's the actual product.

**Inputs.** Everything: touch logs, reply tags/quality data, Loom view data, pipeline movement, the experiment cards that were run.

**Outputs.**
- **The weekly review** (the core client artifact) — what we shipped, what replied, what the replies *meant*, what we learned.
- **Next-week experiment plan** — 3–5 angle × segment × message experiments, each with a hypothesis, kill/scale calls on prior ones.
- **Trend view** — what's compounding across weeks.

**Tools / data sources.** The tracking sheet/CRM, all touch + reply data, AI-assist for synthesis. (Lightweight by design — a sharp sheet beats a dashboard build for pilot #1.)

**Human approval points.** **Medium–high (strategic).** Client + Ryan review the readout and agree on next week's direction. The *analysis* runs automatically; the *direction* is a human decision.

**KPIs.** Does week N+1 actually beat week N (the meta-KPI)? Quality of hypotheses (specific + testable, not vibes), kill/scale discipline (are we actually retiring losers?), client's "I learned something" rate.

**Failure modes.**
- Reporting vanity metrics (sends, opens) instead of conversation quality → reduces to the spray-and-pray reporting we sell against.
- Analysis with no decision → a pretty report that doesn't change next week = no compounding = no product.
- Over-engineering: building a fancy dashboard before there's enough data to matter. A sheet is fine for pilot #1.

---

### 11. GTM Ops Lead
*(plain-English name: **the human running the engine** — Ryan, in the pilot)*

**Purpose.** Orchestrate the whole loop and own the client relationship. Sequences the other roles, holds the quality bar, manages approval lanes, runs the weekly review *with* the client, and makes the judgment calls AI shouldn't. This is the conductor, not a section player.

**Inputs.** Outputs of every other role, the client relationship, the weekly cadence.

**Outputs.**
- **A running engine** — every role firing in sequence, on cadence, every week.
- **The weekly review meeting** + the agreed direction.
- **Quality control** — the final brand/judgment backstop before things ship.
- **The client relationship** — trust, expectation-setting, honest "here's what's working / not."

**Tools / data sources.** All of the above; mostly human judgment + the operating cadence.

**Human approval points.** **This role IS the human.** It's the top-level approval and judgment layer. In the pilot, it's Ryan — the "I run this exact engine on my own company" credibility, in person.

**KPIs.** Loop adherence (did every stage run this week?), client retention/renewal, qualified conversations generated, the honesty bar (no overpromising, expectations set correctly), pilot → case-study conversion.

**Failure modes.**
- Over-automating the judgment layer → the brand-safety and trust that *is* the product erodes.
- Becoming the bottleneck (approvals pile up) → the loop stalls; fast approval lanes exist to prevent this.
- Overpromising to win/keep the client → the cardinal sin; kills trust and contradicts the honest-economics positioning.

---

## Deploy order — what to stand up first

> **Do NOT build all 11 for pilot #1.** That's the trap. The ICP doc says it plainly: *"Don't over-engineer the product before pilot #1… the MVP is tight ICP list → research cards → human-approved LinkedIn+Loom → weekly review. Ship that, learn, then add."* Mirror that. The fleet is the *destination*, not the launch config.

### Phase 1 — The lean core (stand up day one, pilot #1)
These four (plus Ryan as the GTM Ops Lead orchestrating) *are* the minimum viable engine. They produce the full artifact chain and the complete weekly loop.

1. **ICP Architect** — without a sharp ICP + signals, everything downstream is wasted. Highest leverage. Build first.
2. **TAM Builder + Signal Scout (run as one motion at first)** — produce a scored, enriched, signal-flagged universe + research cards. At pilot scale (top ~100 accounts) these collapse into a single build-and-score pass; split them only when volume demands it.
3. **LinkedIn Strategist + Loom Scriptwriter** — the actual wedge motion (DM + connection + personalized Loom). This is what's in market. Treat as one combined "outreach" function early.
4. **Experiment Analyst** — even a lightweight weekly review *is the product*. Without it you're a freelancer sending DMs, not running an Experiment Engine. Non-negotiable from week one, even if it's just a sharp sheet.

> Plain version of Phase 1: **define who + why → build the scored list + cards → run human-approved LinkedIn+Loom → write the weekly review.** Everything else is enhancement.

### Phase 2 — Add as the motion proves out (weeks 3–6 / client #2)
5. **Follow-Up Operator** — formalize it once you have enough live threads to systematize (early on, Ryan just does follow-ups by hand; that's fine).
6. **Reply Router** — formalize triage once reply *volume* justifies a system. At pilot scale, Ryan eyeballs every reply — which is *better*, not worse.
7. **Contact Mapper** — split out from TAM Builder when finding the right human at scale becomes its own job.

### Phase 3 — Scale infrastructure (multiple clients / Scale tier)
8. **CRM Ops Agent** — a shared sheet is genuinely fine until you're juggling multiple clients or a real CRM. Don't build CRM ops before there's a CRM problem.
9. **TAM Builder / Signal Scout as separate specialized roles** — split when volume and signal complexity outgrow the combined pass.
10. **Email as a managed secondary channel** — only when a client has a clear reason and the LinkedIn+Loom core is humming. (Optional/low-volume by design — never the headline.)

> **GTM Ops Lead (Ryan) is present from minute one** — it's not a "later" role; it's the human running all of the above. In the pilot, *one person plays most of these roles wearing different hats.* The role names exist so the system is documentable and transferable — not because pilot #1 needs 11 separate workstreams.

---

## Critique — what's over-engineered for a first pilot

Calling my own design honestly, because shipping the whole fleet for pilot #1 would be exactly the kind of impressive-looking over-build that doesn't move revenue:

- **Treating these as 11 separate "agents" on day one is the biggest trap.** For pilot #1 this is **one person (Ryan) wearing ~5 hats**, with AI assist underneath. The value is the *loop and the artifacts*, not an 11-box org chart. Sell the loop; don't sell the box count. Eleven named agents on a sales call reads as automation-agency theater — show the research card and the weekly review instead.
- **CRM Ops Agent is premature.** A shared Google Sheet does everything pilot #1 needs. Building or integrating CRM automation before a client even has a CRM problem is wasted effort. Defer to Phase 3.
- **Contact Mapper, Reply Router, and Follow-Up Operator are real but not separate *systems* yet.** At ~100 accounts, Ryan finds the contact, reads the reply, and sends the follow-up himself — and doing it by hand early is an *advantage*: it generates the judgment that later automation gets trained on. Formalize them only when manual genuinely doesn't scale.
- **Signal Scout can over-promise.** Real-time multi-source signal monitoring is genuinely valuable but easy to over-build into a fragile data pipeline. For pilot #1, a handful of *manually-checked* high-intent signals (hiring, funding, leadership change, pain-signalling posts) beats an automated firehose of noisy ones. Start manual, automate the signals that prove they predict good conversations.
- **The Loom Scriptwriter must never drift toward automating the video.** The entire moat of this channel is that it's genuinely, personally human. Any move to synthesize or templatize the actual Loom kills the differentiator and lands us in the slop bucket we're positioned against. Keep it: AI writes the *brief*, the human records the *video*. Full stop.
- **Splitting TAM Builder and Signal Scout on day one is needless overhead.** At pilot scale they're one build-and-score pass. Two roles, one workflow — split only when volume forces it.

> **Net:** the 11-role architecture is the *mature* shape of the engine and the right thing to document so it's transferable and sellable as a "deployed team." But pilot #1 ships the **lean core (4 roles + Ryan)**, run largely by hand with AI assist, and earns the right to add the rest. Build the machine as the work demands it — not before.
