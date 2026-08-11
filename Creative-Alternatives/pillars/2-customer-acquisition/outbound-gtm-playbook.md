# Outbound GTM Playbook — Creative Alternatives

> **Historical/supporting plan.** Preserve its stack, cadence, infrastructure, and copy detail, but do not use its preset segment launch order or activate a campaign from this document. Current authority: `account-based-outbound-engine.md`.

> The full revenue engine for the home-run offer (`home-run-offer.md`). Pure outbound across **email, LinkedIn, and phone**, mapped onto Ryan's real stack: **Origami → SmartLead → Sendr.io → Salesfinity → HubSpot.** Ready-to-send copy lives in `sequences/cold-outreach-copy.md`.
>
> **Building this on camera?** Every chunk below maps to an episode in `../4-youtube-build/outbound-build-arc.md` — the build *is* the YouTube season.

---

## 1. The engine in one picture

```
                    ┌─────────────────────────────────────────────┐
                    │  ORIGAMI  — lead sourcing + data layer        │
                    │  (Apollo/Sendr DB enrich → verify → list)     │
                    └───────────────────────┬─────────────────────┘
                                            │  clean, verified leads
                                            │  + AI store mockup made per lead
                    ┌───────────────────────▼─────────────────────┐
                    │           MULTICHANNEL SEQUENCE               │
                    │                                               │
                    │  SMARTLEAD ──────► cold email at scale        │
                    │  SENDR.IO ───────► LinkedIn + video/voice DM  │
                    │  SALESFINITY ────► parallel-dial calls        │
                    │     (orchestrated as ONE cadence, below)      │
                    └───────────────────────┬─────────────────────┘
                                            │  replies / connects / live calls
                    ┌───────────────────────▼─────────────────────┐
                    │   HUBSPOT  — pipeline, stages, handoff         │
                    │   warm lead → Maclaine/Ryan → demo → close     │
                    └───────────────────────────────────────────────┘
```

**The whole thing rides on one differentiator:** every prospect gets a **real mockup of their own store** in the first touch. No other promo distributor does this. It's the reason a narrow ICP converts at 8–15% instead of 3%.

---

## 2. Tool stack — who does what

| Tool | Role | What it owns | Notes |
|------|------|--------------|-------|
| **Origami** | Data layer | Source + enrich + verify leads → clean lists by segment | Feeds every channel. Apollo queries already written (`outbound/boutique-fitness-apollo-queries.md`); Sendr's 479M-contact DB can supplement |
| **SmartLead** | Cold email engine | High-volume sending, mailbox rotation, warmup, deliverability | The deliverability specialist. Primary email channel |
| **Sendr.io** | LinkedIn + multichannel | Connection requests, **native video/voice DMs**, signal-driven cross-channel triggers | The video-DM mockup walkthrough is the killer use. Can also do email — keep email in SmartLead for now, revisit consolidation later |
| **Salesfinity** | Phone | AI parallel dialer (10+ lines), auto-swaps bad numbers for verified mobiles, connects only on live answers | Powers warm-tier calls + ICP cold calls + reactivation dials |
| **HubSpot** | CRM / source of truth | Pipeline stages, reply logging, handoff, reporting | Every replier/connect/conversation lands here |

**One assumption to confirm:** I've mapped email to SmartLead (best pure-email deliverability) and LinkedIn/video to Sendr. Sendr *can* do email too — if you'd rather run a single platform, we consolidate email into Sendr later. For v1, keep them split; SmartLead's warmup + rotation is the safer email engine while we scale volume.

---

## 3. ICP & targeting (proven — don't relitigate)

Real campaign data already told us where to fish. **Camps and clubs win; corporate/SaaS flops.**

| Segment | Reply rate | Verdict | Launch priority |
|---------|-----------|---------|-----------------|
| Summer camps | **10.1%** (completed, 2 clients) | Winner — the template | **Re-run + expand** |
| Squash / racquet clubs | 4.6–5.2% | Solid, CA's home turf | Steady-state |
| CrossFit / BJJ / boutique fitness | building (mirrors camps) | Highest-potential new | **Phase 1 launch** |
| Climbing / boxing / yoga / dance | untested, modeled | Strong alternates | Phase 2 |
| Country / private clubs | 0.3–1.0% | Weak | Park it |
| Youth sports clubs | 0% (but Farm & Forge is a live customer) | Offer works, campaign didn't | Re-approach via referral, not cold |
| Corporate / SaaS | 1.1% | Dead for this offer | Do not target |

**Launch order (from the Apollo-queries doc, validated):** CrossFit boxes → BJJ academies → climbing gyms → independent yoga → boxing/Muay Thai → dance studios. ~25,000–35,000 addressable leads across the six. Re-run summer camps seasonally (timed to enrollment).

**ICP filter rules (apply in Origami / Apollo):**
- Independent / owner-operated only. Employee count **1–25** (this single filter strips franchisor HQs).
- Titles: Owner, Founder, Co-Founder, President, Head Coach, Studio/Box Owner, GM.
- Has verified email. US.
- **Exclude franchise chains** at the keyword/domain level (Orangetheory, F45, Club Pilates, CycleBar, Anytime, Title Boxing, 9Round, YogaSix, CorePower — full list in the Apollo-queries doc). Corporate brand control kills the offer.

**Why these win (the through-line):** captive identity-driven audience, single non-technical decision-maker, zero existing ecom, seasonal merch spikes, too busy to DIY. That's the exact profile the home-run offer is built for.

---

## 4. The multichannel cadence (the orchestrated sequence)

One prospect, three channels, ~18 days. Channels reinforce each other — an email lands, then a LinkedIn face shows up, then a call references both. The mockup is the spine.

| Day | Channel | Touch | Tool |
|-----|---------|-------|------|
| **0** | LinkedIn | Connection request (no pitch — just a relevant line) | Sendr |
| **0** | Email | **Email 1 — the mockup.** Embed their store mockup. Subject + 1 line + "want the rest?" | SmartLead |
| **2** | LinkedIn | If connected: **video/voice DM** walking through their mockup (20 sec) | Sendr |
| **4** | Email | Email 2 — the "you earn, you do nothing" angle + proof (75k orders) | SmartLead |
| **6** | Phone | **Call 1** — "I sent you a mockup of a store for [Org] — did it land?" | Salesfinity |
| **9** | Email | Email 3 — short case-style proof (Farm & Forge / a camp), soft CTA | SmartLead |
| **11** | LinkedIn | DM follow-up — one line, the calendar link | Sendr |
| **14** | Email | Email 4 — the breakup ("should I close your file?") | SmartLead |
| **16** | Phone | **Call 2** — final dial, leave the voicemail script | Salesfinity |

**Rules that keep it working:**
- **First email = the mockup, period.** 58% of all replies come from email #1 — make it impossible to ignore.
- Cap the email side at **4 sends** — replies and deliverability both fall off a cliff after #4, complaints triple.
- Any reply / connect / live answer → **pull them out of automation immediately** and route to a human (HubSpot stage change). Nothing kills trust like a prospect replying and getting touch #3 anyway.
- Calls are not optional filler — a live human referencing "the mockup I emailed" is the highest-converting moment in the whole cadence.

---

## 5. Mockup production line (how to make the wedge at scale)

The mockup is the bottleneck and the moat. Industrialize it.

1. **Pull the logo** — from the lead's site/social during Origami enrichment. Store the URL with the lead row.
2. **Generate the mockup** — drop the logo onto 2–3 product templates (hoodie, tee, tumbler) in their colors. Options, fastest first:
   - CA's **in-house art team** for high-value / high-fit leads (best quality, their actual workflow).
   - **AI image generation** for volume (the `generate_image` / Replicate tooling is wired in this workspace) — logo composited onto product blanks.
   - A reusable mockup template + script so it's one step per lead, not a design project.
3. **Name + store the asset** — `mockups/<segment>/<org-slug>.png`, linked to the HubSpot/Origami row so SmartLead embeds it and Sendr references it.
4. **Batch it** — make mockups in the same batch you pull leads, before the sequence starts. Never start a sequence for a lead without a mockup ready.

> Content double-duty: filming the mockup line *is* a YouTube episode — *"I send prospects a mockup of their store before they even reply."* (`ai-growth-plays.md` Play #1.)

---

## 6. Infrastructure setup (do this before sending a single email)

Skipping this is how you burn domains and tank reply rates. 2026 deliverability is unforgiving.

**Email (SmartLead):**
- **Never send from creativealternatives.com.** Buy **3–5 secondary domains** (e.g., `getcreativealts.com`, `trycreativealternatives.com`, `ca-stores.com`) — close cousins, not the money domain.
- **2–3 mailboxes per domain** → start with ~6–9 mailboxes. Each on Google Workspace or MS365.
- **SPF + DKIM + DMARC** on every domain. Custom tracking domain. No spammy link shorteners.
- **Warm up 3–6 weeks** before real sends. Start 5–10/day/mailbox, ramp to **40/day** (cap 50; never chase 60+). SmartLead's warmup handles this — turn it on day one and leave it running even during live campaigns.
- Steady-state capacity: **9 mailboxes × 40 = ~360 sends/day**. That supports entering **~75–100 new leads/day** into sequences once the follow-up load is factored in.

**LinkedIn (Sendr):**
- Use **Maclaine's** account (warm/family voice) and **Ryan's** (consultative). Two accounts = two voices + double the limit.
- Stay under **~20–25 connection requests/day/account** (~100–125/week each). Aged accounts with a real photo, banner, and a few posts get accepted far more — have Pillar 3/4 content make their profiles look alive first.
- Sendr's hybrid (video-link-in-DM) approach is safer for account health than full-API automation — lean on it.

**Phone (Salesfinity):**
- Let it **swap bad numbers for verified mobiles** (its 6-provider lookup) before any session — owner-operators answer mobiles, not main lines.
- Number rotation on (avoids "Spam Likely"). Local presence where possible.
- Block **one 60–90 min power-dial session, 2–3×/week**, not random dialing. Parallel dialer + a tight list = 100–150 dials and 5–12 live conversations per session.

---

## 7. Volume & activity model (realistic for a 2-person operation)

Numbers to steer by, not gospel. Tune after week 2.

**Weekly inputs (steady state, post-warmup):**
- New leads sourced + mockups made: **~400/week** (one segment batch at a time).
- Emails: ~360/day live capacity → enter ~75–100 new leads/day.
- LinkedIn: ~200–250 connection requests/week (both accounts).
- Calls: 2–3 power sessions → ~300–400 dials/week.

**Expected funnel (using CA's own + 2026 benchmarks):**
- Email reply rate target: **6–10%** on proven segments (camps hit 10.1%; fitness modeled at 7–12%).
- ~400 leads/week × ~8% blended reply = **~30 replies/week**.
- Positive/interested ≈ 30–40% of replies = **~10–12 conversations/week**.
- → **~3–6 demos/week** → **~1–2 new stores/week** at a conservative close rate, ramping as the rep gets reps.

**The one number that matters:** new stores signed/month. Everything upstream is in service of it. If replies are healthy but stores aren't closing, the problem is the demo/close, not the outbound — fix there, don't crank volume.

---

## 8. Pipeline & handoff (HubSpot)

Outbound's job is to create a warm conversation. The *human* (Maclaine first, Ryan for consultative) closes. Clean handoff or the whole thing leaks.

**Stages:**
1. **Sourced** — in Origami list, mockup made, not yet sequenced.
2. **Sequenced** — live in SmartLead/Sendr/Salesfinity cadence.
3. **Engaged** — replied / connected / live call. **Auto-pause all automation. Notify human same day.**
4. **Conversation** — human is talking to them (DM, email, or phone).
5. **Demo/mockup review booked** — calendar hold set.
6. **Proposal / store mockup sent** — formal store preview + terms.
7. **Won — store building** → hand to CA art/ops to launch.
8. **Nurture** — not now, recycle in 60–90 days.

**Handoff rule:** the moment a lead hits **Engaged**, it belongs to a person, not a tool. Maclaine takes warm/family-fit replies; Ryan takes the consultative/skeptical ones. Speed-to-lead matters — reply within hours, not days.

---

## 9. Metrics & weekly operating rhythm

**Track weekly (per segment, so you can kill losers fast):**
- Leads sourced · emails sent · open rate · **reply rate** · positive reply rate
- LinkedIn: requests sent · accept rate · DM reply rate
- Calls: dials · connect rate · conversations · meetings set
- **Demos booked · stores signed** (the scoreboard)
- Deliverability health: bounce rate (<3%), spam complaints (≈0), domain reputation

**Weekly review (tie into `/weekly-review`):**
- Which segment is winning on reply *and* close? Double down. Which is dead after 400+ sends? Kill it.
- Mine the week's replies/calls with `prospect-interaction-analyzer` → rewrite copy in the prospect's own words.
- Deliverability check — any domain degrading? Rotate/rest it.
- One experiment per week (subject line, mockup product mix, first-line angle). Change one variable.

**Benchmarks to hold the line against:** avg cold reply is 3.4%; top-decile is 10.7%+. CA already hits top-decile on camps. If a segment can't clear ~4% after a real sample, it's the wrong segment or the wrong copy — not a volume problem.

---

## 10. Parallel motion — reactivation (fastest revenue, warm not cold)

Not cold outbound, but it runs on the same rails and prints money faster. Flagged here so it isn't forgotten.

- **Source:** Maclaine's QuickBooks — 75,000 orders / 2,700 customers over 27 years = a large dormant/one-time base (`ai-growth-plays.md` Play #3).
- **Find:** AI flags dormant + reorder-due accounts.
- **Reach:** personalized win-back — **Salesfinity call** (warm, "it's Maclaine from Creative Alternatives") + email. These pick up and convert far above cold because the relationship already exists.
- **Offer twist:** existing customers are perfect candidates for a *branded store* upgrade — they already buy gear; now they can earn from it.
- **Sequence/copy:** see `sequences/cold-outreach-copy.md` → "Reactivation."

This should run *alongside* cold outbound from week one — it's the lowest-effort revenue in the building.

---

## 11. 90-day rollout

**Weeks 1–2 — Build the rails (no sends yet).**
- Buy 3–5 domains, stand up 6–9 mailboxes, turn on SmartLead warmup. (Warmup runs in the background for the next 3+ weeks.)
- Set up Sendr (both LinkedIn accounts), Salesfinity (number pool + mobile-swap), HubSpot pipeline stages.
- Build the mockup production line; make the first 400 (CrossFit batch).
- Pull CrossFit list in Origami (filters from the Apollo doc). Load the sequence + copy.
- In parallel: Maclaine pulls the QuickBooks dormant list → reactivation calls can start *immediately* (no warmup needed for phone/known contacts).

**Weeks 3–5 — Launch + reactivation.**
- Mailboxes warmed → launch **CrossFit** cold campaign (full cadence). Start LinkedIn + calls in lockstep.
- Run reactivation calls/emails in parallel. First revenue should come from here.
- First weekly reviews. Mine replies, tighten copy.

**Weeks 6–9 — Prove and expand.**
- If CrossFit clears ~6%+ reply, add **BJJ** then **climbing**. Keep batches to one new segment at a time.
- Re-run **summer camps** if timing fits enrollment season.
- Lock the demo→close motion; track stores signed, not just replies.

**Weeks 10–13 — Compound.**
- Add Phase 2 segments (yoga, boxing, dance) that modeled well.
- Standardize the winning sequence as *the* template. Document CAC vs first-year margin → set how hard to scale.
- Stand up segment landing pages (`ai-growth-plays.md` Play #4) so inbound starts feeding the same pipeline.

---

## 12. What good looks like at day 90

- A **repeatable engine**, not one-off blasts: a documented cadence + copy that lands new stores on a predictable cadence.
- **1–2 winning segments** proven on reply *and* close, with CAC understood.
- **Reactivation** producing steady warm revenue from the QuickBooks base.
- Every step **filmed** — the build is the YouTube show, and each won store is a case study and a sales asset.
