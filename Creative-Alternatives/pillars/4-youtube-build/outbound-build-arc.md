# Outbound Build Arc — building CA's cold-customer engine, on camera

> The "build the whole outbound machine from the ground up and film it" plan. Expands what was a single backlog row (series-plan #4 / 30-day-sprint #6) into a standalone **arc** where each build session = one episode. The build IS the season.
>
> **Source of truth for the build itself:** `../2-customer-acquisition/outbound-gtm-playbook.md` + `home-run-offer.md` + `sequences/cold-outreach-copy.md`. This doc is the *filming layer* on top of that build.

---

## Three rules this arc obeys (your own system)

1. **Every episode stands alone. Never "Part 1 / Part 2."** Multi-part series tank CTR. The arc is *felt* by watching in order, never *labeled*. Each episode gets its own proven muse, its own searchable/clickable hook, its own copyable how-to.
2. **Value-first, every time.** Each video shows a real piece of the machine *actually working on CA* and hands the viewer the prompt/workflow in the description. The work is the content — one real demo per video.
3. **One pipeline per episode:** ICAHN muse (`cge-video-idea-finder`) → Holy Trifecta (`cge-holy-trifecta`) → script (`youtube-script-writer`) → **do the real build + capture** → record (talk + screen-record) → edit + cut Shorts → publish → `youtube-launch-loop`. Don't lock an episode until the muse is validated.

---

## Build-order vs content-order (the tension, resolved)

The machine has a logical build order. Some steps are gold on camera (the mockup reveal, live cold calls, replies landing); some are boring (domain DNS, warmup waiting). Rules:

- **Boring infra → montage + explainer, never the spine.** Domain setup and the 3-week warmup wait get compressed to B-roll with a voiceover ("here's the boring-but-critical part so you don't land in spam"). The *episode* is built around a payoff moment, not the chore.
- **Lead each episode with its strongest visual.** Cold open on the reveal/result, then show how you got there.
- **You can film slightly out of build-order.** The mockup line (OB-2) is the strongest hook — it's fine to shoot it as the arc's flagship even though the offer (OB-1) is conceptually first. Each stands alone, so order is a content choice, not a dependency chain.
- **Warmup is a 3-week clock — start it in the background immediately.** While it warms, you film OB-1/2/3 (offer, mockup, lead machine), which need no warm inboxes. By the time you film OB-4 (cold email) the inboxes are ready. The filming schedule and the build schedule fit together if you start warmup on day one.

---

## The arc at a glance

| Ep | Build chunk (real work) | Standalone hook direction (ICAHN-validate) | What they steal (the value) | The money shot |
|----|------------------------|--------------------------------------------|-----------------------------|----------------|
| **OB-1** | Finalize the home-run offer | "I used AI to build an offer so good it feels stupid to say no" | The offer-design framework + pressure-test prompts | The finished one-liner |
| **OB-2** ★ | The AI store-mockup line | "I send prospects a mockup of their store before they even reply" / "I gave a print shop an AI designer" | The exact mockup workflow/prompts | Blank hoodie → their logo appears |
| **OB-3** | ICP + lead sourcing (Origami/Apollo) | "I built an AI machine that finds my customers while I sleep" | The ICP filters + sourcing workflow | 1,500 perfect-fit leads appear |
| **OB-4** | Email infra + AI-written sequences | "How I send thousands of cold emails without landing in spam" | Domain/warmup setup + the AI copy + humanizer pass | A reply hitting the inbox |
| **OB-5a** | Sendr LinkedIn + video DMs | "I sent AI-personalized video DMs to 100 strangers" | The video-DM workflow | The in-DM video playing their mockup |
| **OB-5b** ★ | Salesfinity parallel dialer | "I cold-called 100 businesses in an hour with an AI dialer" | The dialer setup + call scripts | Live pickups + real reactions |
| **OB-6** ★ | Turn it all on | "I turned on my AI outbound machine — here's what happened" | Honest funnel numbers, what worked/flopped | Replies + a booked demo (ideally a signed store) |

★ = strongest standalone hooks. Any of OB-2 / OB-5b / OB-6 can over-index — lead the arc with OB-2 if you want max cold-open punch, or OB-1 if you want to set the stakes first.

**Companion episodes (already in the 30-day sprint — the warm-revenue twin of this arc):**
- **Reactivation** = sprint #3, *"I Found $X in 'Dead' Customers Hiding in a $3M Business."* Warm, fastest money, runs in parallel. Films great and needs no infra.
- **Recap** = sprint #8, *"30 Days of Putting AI Into a $3M Business — What Actually Happened."* The compounding payoff.

---

## Per-episode build + film notes

### OB-1 — The Offer
- **Build:** lock the grand-slam offer (`home-run-offer.md`) on camera — value stack, the mockup wedge, the guarantee. Use AI live to pressure-test it ("poke holes in this offer like a skeptical camp director").
- **The real beat:** you have to call Maclaine/Kenny to get the `[CONFIRM]` economics (rev-share, GMV). Film that — "I can't finish the offer until I know the numbers" is honest build-in-public.
- **Shorts:** the value-equation explainer; "the one line that makes an offer irresistible"; the grand-slam framework.
- **Why it's not boring:** offers feel abstract — keep it concrete by showing the mockup it's wrapped around and a real prospect persona.

### OB-2 — The Mockup Wedge ★ (recommended flagship)
- **Build:** the mockup production line — pull a logo → AI-composite onto hoodie/tee/tumbler → assemble a store preview (playbook §5). Tooling: `generate_image`/Replicate already wired in this workspace; CA's in-house art team for the hero version.
- **Money shot:** blank product → their logo materializes. Do 3–4 in a row for the montage.
- **Reconciles with sprint #7** ("I gave a print shop an AI designer"): same AI-design capability, two angles — internal proof-speed (ops) *and* the outbound wedge. This episode is the *wedge* angle.
- **Shorts:** the reveal (this is your highest-ceiling Short), the exact prompt, "promo companies take 2 days to mock this up — watch AI do it in 2 minutes."
- **Guardrail:** use a willing real prospect's public logo, a current customer's (with permission), or a demo brand. Don't put a named cold prospect on blast without thinking it through.

### OB-3 — The Lead Machine
- **Build:** the ICP filters (independent owner-operated, 1–25 employees, franchise exclusions) + Origami/Apollo pull + enrich + verify (playbook §3, and the existing `../2-customer-acquisition/outbound/boutique-fitness-apollo-queries.md`).
- **Money shot:** a clean list of ~1,500 perfect-fit owners populating on screen.
- **Shorts:** "the one filter that strips out every franchise"; "how I found 1,500 [niche] owners in 10 minutes."
- **Note:** anonymize/blur the actual contact rows in the export view.

### OB-4 — Cold Email That Lands
- **Build:** domains + mailboxes + SmartLead warmup (the montage), then the AI-written sequence + humanizer pass (the screen-record), referencing `sequences/cold-outreach-copy.md`.
- **Money shot:** the warmup dashboard climbing; the first real reply landing.
- **Shorts:** the deliverability checklist (SPF/DKIM/DMARC, secondary domains, 40/day cap); the cold-email-copy prompt; "why your cold email goes to spam."
- **Build-order anchor:** start warmup at the *top* of the arc so the inboxes are ready when you film this.

### OB-5a — LinkedIn Video DMs (Sendr)
- **Build:** Sendr setup (Maclaine's + Ryan's accounts), the connection + native video/voice DM flow that walks through the prospect's mockup.
- **Money shot:** the personalized video playing *inside* the LinkedIn DM.
- **Shorts:** the 20-second video-DM template; "I send a custom video to every prospect — here's how it's automated."

### OB-5b — The AI Dialer ★ (Salesfinity)
- **Build:** Salesfinity setup — verified-mobile swap, number rotation, the parallel dial — running the call scripts from `sequences/cold-outreach-copy.md`.
- **Money shot:** live human pickups, real reactions, the "I emailed you a mockup — did it land?" opener working in the wild. Cold-calling content has high retention; this can be a breakout.
- **Shorts:** the best 30 seconds of a real call; the opener script; "an AI dialer made 100 calls while I talked to 8 humans."
- **Guardrails (important):** two-party-consent states require disclosure before recording a call — handle this properly. Anonymize the prospect. Never air anyone who'd be embarrassed; "smart operator caught off guard" is fine, "making someone look stupid" is not.

### OB-6 — Launch & Results ★
- **Build:** flip the whole machine on; let the cadence run; watch the funnel (playbook §7).
- **Money shot:** replies stacking up, a booked demo, ideally a signed store. Real numbers on screen.
- **Format:** the proven "I did X — here's what happened" muse. Honest results, including flops.
- **Shorts:** the headline result; "X emails → Y replies → Z meetings → 1 store."

---

## How it fits your cadence & current sprint

- **Cadence stays 2 long-form/week + near-daily Shorts.** This arc is ~6 long-forms = ~3 weeks of backbone at full pace, or a 4–6 week season at the 1/week floor while you also do the real build.
- **Deploy it as your next "season"** after (or interleaved with) the current ops-focused 30-day sprint. The clean handoff: the ops sprint ends on reactivation (#3, warm revenue) → this arc opens the *cold* revenue story. Revenue is the through-line connecting both.
- **Reconcile the overlaps:** sprint **#6** becomes this whole arc (or its OB-1 opener); sprint **#7** becomes **OB-2**; sprint **#3** (reactivation) is the companion. Update `30-day-sprint.md` / `series-plan.md` when you commit a shooting order.
- **Batch like Machine Mastery says:** record the to-camera spines for OB-1/2/3 in one sitting; cut a week of Shorts at once; do the builds in build-order but film the reveals as you hit them.

---

## Filming boundaries specific to outbound (settle before rolling)

- **Anonymize prospects.** Blur names/emails/companies in list exports, inboxes, and dialer screens unless you have explicit permission. Cold prospects didn't sign up to be on your channel.
- **You're showing competitors your exact ICP and copy.** That's on-brand for build-in-public and the transparency *is* the moat (the relationship + execution, not the secret). But decide consciously what's on camera vs. what stays in the description.
- **Call recording = consent.** Respect two-party-consent law on OB-5b. When in doubt, get verbal consent or anonymize hard.
- **Kenny/Maclaine on camera:** Maclaine is the sender voice and the QuickBooks holder — her appearing (especially on OB-1 economics and the reactivation companion) adds the family-business authenticity. Confirm her comfort and Kenny's filming boundaries (`pillars/1-operations/ops-audit-interview-kit.md` §10) first.

---

## Next action

Pick the opener — **OB-2 (mockup) for max hook**, or **OB-1 (offer) to set the stakes** — and I'll run the **ICAHN muse hunt** (`cge-video-idea-finder` / `vidiq_muse_hunt`) to confirm a proven format, then **Holy Trifecta** it (title + thumbnail + intro, CTR-scored) and draft the script — same way Episode 1 ("The Audit") was packaged. Then it's ready for you to build + record.
