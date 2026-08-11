# Swag Handled — the outbound machine (build + automation plan)

> The end-to-end build that turns the `swag-handled-offer.md` Grand Slam into a repeatable revenue machine: **list + signals → mockups + pages → multichannel sequence → pipeline → iterate.** On the real stack (AI Ark, Origami, SmartLead, Sendr, Salesfinity, HubSpot). This is also the **template** — once it runs for corporate, it clones for any industry/offer.

## The machine in one picture
```
 ┌──────────────────────────────────────────────────────────────────────┐
 │ 1. LIST + SIGNALS        AI Ark — discover + buy-signals +             │
 │    ICP + trigger cohort  verified email/mobile/LinkedIn → clean list   │
 └───────────────────────────────┬──────────────────────────────────────┘
                                  │  clean leads, each w/ logo URL
 ┌───────────────────────────────▼──────────────────────────────────────┐
 │ 2. PERSONALIZE (the wedge)   per-lead branded onboarding-kit MOCKUP    │
 │    Canva / AI image          + a personalized PAGE (Sendr) w/ calendar │
 └───────────────────────────────┬──────────────────────────────────────┘
                                  │  mockup + page link on every lead row
 ┌───────────────────────────────▼──────────────────────────────────────┐
 │ 3. MULTICHANNEL SEQUENCE  (one orchestrated 16-day cadence)           │
 │    SmartLead → email (mockup in #1)                                    │
 │    Sendr     → LinkedIn connect + video DM + personalized page         │
 │    Salesfinity → cold calls referencing the mockup                     │
 └───────────────────────────────┬──────────────────────────────────────┘
                                  │  reply / connect / live answer
 ┌───────────────────────────────▼──────────────────────────────────────┐
 │ 4. PIPELINE + HANDOFF   HubSpot — auto-pause sequence, alert human,    │
 │    Engaged → human       Maclaine/Ryan take the call → demo → close     │
 └───────────────────────────────┬──────────────────────────────────────┘
                                  │  every reply/call mined
 ┌───────────────────────────────▼──────────────────────────────────────┐
 │ 5. MEASURE + ITERATE   per-signal reply rates · weekly review ·       │
 │    kill losers, scale winners · rewrite copy in prospect's words       │
 └──────────────────────────────────────────────────────────────────────┘
```

## Stage 1 — List + buying signals (AI Ark → Origami)
**Goal:** a clean, signal-ranked list, not a raw dump. We don't email everyone who fits the ICP — we lead with firms showing a **buy-now trigger.**

**ICP base (AI Ark filters):** target industries (law, accounting, real estate, agencies, dental/medical, finance, A&E, consulting), 25–500 employees, NY-metro/Northeast, decision-maker titles (Office Mgr, Marketing, HR/People Ops, EA, Partner).

**Buying signals to layer (rank highest-intent first):**
| Signal | Why it = a swag need | Source |
|--------|----------------------|--------|
| **Actively hiring** (esp. multiple roles / HR / "onboarding") | New hires = onboarding kits, now | AI Ark job/hiring signals |
| **Recent funding / growth** | Spending + scaling = swag budget | AI Ark business events |
| **Upcoming event / conference / sponsorship** | Booth gear + giveaways on a deadline | AI Ark events + web signals |
| **New office / relocation / expansion** | Launch swag, new-space gear | AI Ark events |
| **New leadership hire** (CMO / Head of People) | New initiatives, fresh budget | AI Ark |
| **Q4 / year-start** (seasonal) | Holiday gifts / new-year onboarding waves | calendar |

**AI Ark also delivers the contact layer:** verified business email + **mobile** (for Salesfinity) + LinkedIn URL (for Sendr), plus the **logo URL** on each row (for the mockup). No lead enters the machine without a verified email, a mobile, a LinkedIn, and a logo. *(Origami dropped — AI Ark covers discovery + contacts in one.)*

**Automated?** ✅ The AI Ark (MCP) pull is scriptable/MCP-driven. Output: a structured list (name, title, firm, email, mobile, LinkedIn, logo URL, signal tag).

## Stage 2 — Personalize: mockups + pages (the wedge)
**Goal:** every lead gets a mockup of *their* branded onboarding kit + a personalized page — before any touch.

1. **Mockup:** drop their logo onto a kit (tee + bottle + notebook + tote) in their colors. Batch via AI image gen / Canva template. Store at `mockups/corporate/<firm-slug>.png`, linked to the lead row.
2. **Personalized page (Sendr):** a one-prospect landing page — their mockup + the 3-line offer + a calendar link. The thing the LinkedIn DM and email point to.
3. **Batch it:** make all mockups + pages in the same run as the list pull, *before* the sequence starts. No lead sequences without a mockup ready.

**Automated?** ✅ Batch-generatable. Human QA on mockups for high-value/high-trigger leads before they ship.

## Stage 3 — The multichannel sequence (one cadence, three tools)
The corporate-weighted 16-day cadence (full table in `swag-handled-offer.md`), **LinkedIn-led** because that's where these buyers are:
- **Sendr** — Day 0 connect → Day 2 video DM (walk their mockup) → Day 11 DM w/ page link. *Owns the relationship channel.*
- **SmartLead** — Day 0 email #1 (mockup embedded) → #2 #3 #4. *Owns volume + deliverability (71 warmed inboxes).*
- **Salesfinity** — Day 6 + Day 16 calls referencing the mockup. *Owns the highest-converting human moment.*

**Rules:** mockup in email #1, cap email at 4, **any reply/connect/answer → pull from all automation immediately → route to human.**

**Automated?** ✅ Each platform runs its leg. The orchestration = loading the same lead + copy + mockup/page into all three and starting them together.
**⚠️ Build gap:** Sendr is API-only — needs a thin MCP/script wrapper so the agent can load leads + pages programmatically (same pattern as the AI Ark wiring). This is the one infra piece to build.

## Stage 4 — Pipeline + handoff (HubSpot)
Outbound's job is a warm conversation; the human closes. Stages: **Sourced → Sequenced → Engaged (auto-pause + alert) → Conversation → Call booked → Proposal/mockup review → Won → Nurture.**
- The moment a lead hits **Engaged**, it belongs to a person, not a tool. Maclaine takes warm; Ryan takes consultative/skeptical.
- **Speed-to-lead matters** — reply within hours.

**Automated?** Detection + stage-change + alert = ✅. The conversation + close = 👤 human (operator's code: customer/money actions are human).

## Stage 5 — Measure + iterate
- Track **per signal** (hiring vs funding vs event…) so you learn which trigger converts, not just which industry.
- Weekly: mine replies/calls with `prospect-interaction-analyzer` → rewrite copy in the prospect's own words.
- One experiment/week (subject, mockup product mix, first line). Kill any signal/segment under ~4% after a real sample.

## The automation architecture (what's wired vs. what to build)
| Piece | Status | Note |
|-------|--------|------|
| AI Ark — discover + signals + verified contacts | ✅ MCP wired | define the saved query; covers enrich too (Origami dropped) |
| Mockups | ✅ AI/Canva available | build the kit template + batch script |
| **Sendr — LinkedIn + pages** | ⚠️ **build** | API-only → needs MCP/script wrapper |
| SmartLead — email | ✅ MCP wired | create the campaign shell |
| Salesfinity — dial | ✅ have it | list-upload flow |
| HubSpot — pipeline | ✅ MCP wired | set the stages |

**The weekly machine loop (the "automated build"):**
1. AI Ark pull this week's **signal cohort** (with verified contacts) → 2. batch mockups + pages → 3. push to SmartLead + Sendr + Salesfinity → 4. cadence runs → 5. replies auto-route to HubSpot + alert Maclaine → 6. daily worklist (who to call, who's booked) → 7. weekly review feeds copy back in. Steps 1–3 are the build-once, run-weekly pipeline.

## Roles
- **AI/Claude:** pulls list, enriches, generates mockups + pages, loads platforms, drafts copy, produces the daily worklist + weekly review.
- **Maclaine:** the warm voice — takes replies/calls, the relationship.
- **Ryan:** consultative/skeptical conversations, the build, the closes, the content capture.

## Build sequence (how to stand it up)
- **Week 1 — Rails:** wire the Sendr wrapper; define the AI Ark saved query (ICP + signals); build the mockup-kit template; create the SmartLead campaign shell + HubSpot stages; set Salesfinity list flow.
- **Week 1–2 — First batch:** pull the first signal cohort (start: *firms hiring now, NY-metro, 25–500*) — AI Ark returns verified contacts — batch mockups + pages, load the copy.
- **Week 2 — Launch:** start the 16-day cadence on batch #1. Calls in lockstep.
- **Weeks 3–4 — Iterate:** first replies → mine → tighten. Add the next signal cohort. Lock the demo→close.
- **Weeks 5+ — Scale + automate:** standardize the winning sequence, automate the weekly loop, expand geography, then clone the whole machine to the next industry/offer.

## Scoreboard
Leads pulled · % with verified email+mobile · mockups made · **reply rate per signal** · connects · dials · conversations · **calls booked** · proposals · **deals won.** The one number that matters: **booked calls/week → deals/month.**

## What good looks like (day 30–60)
A repeatable weekly loop that turns a signal cohort into booked calls on a predictable cadence, with per-signal reply data telling you exactly which trigger to pour into — and a documented machine that clones to camps (Nov/Dec), breweries, and beyond.

> **Next concrete builds (none gated on QuickBooks):** (1) write the cold copy — email + LinkedIn + call, Maclaine's voice; (2) define the AI Ark saved query + pull batch #1; (3) build the Sendr wrapper. Recommend copy first — it's needed for every channel and unblocks the launch.
</content>
