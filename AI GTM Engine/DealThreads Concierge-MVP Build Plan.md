# DealThreads — Concierge-MVP Build Plan

**Purpose:** the minimum you build to deliver paid pilots, scoped down from the full [core spec](DealThreads-Feature-Specification.md). Runs in parallel with selling (the [Sales Kit](DealThreads%20Sales%20Kit.md)).

**Principle:** **build the one thing the customer sees; fake everything behind the curtain — by hand — until pilots pull it out of you.** A managed service to 5 clients can run on a human + Zapier + a spreadsheet. The full multi-tenant platform comes *after* paying design partners are pulling, not before.

**Date:** 2026-06-01 · **Timeline:** ~3 weeks to first pilot go-live · **Team:** you + (optionally) one contractor

---

## 1. Real vs. faked (the whole plan in one table)

| Capability (from core spec) | Pilot version | Build or fake? |
|---|---|---|
| **Conversational widget** (script tag, chat UI, LLM convo capturing intent/budget/timeline, consent) | The real thing. It's on the client's live site talking to their visitors — it **cannot** be faked. | 🔨 **BUILD** |
| **Lead store + config** (save captured leads; serve widget config per client) | A minimal backend + DB. The seed of the real platform. | 🔨 **BUILD (thin)** |
| **Internal lead view** | A bare admin page (or even a Postgres/Airtable view) where you see captured leads. | 🔨 **BUILD (bare)** or Airtable |
| **Enrichment** (firmographic + technographic) | You/a VA run a Clearbit/the secondary enrichment provider lookup per lead — or a single Zapier call. ~5 clients = low volume. | 🎭 **FAKE (manual/Zapier)** |
| **ICP scoring** | A one-page weighted rubric you apply by eye (or a 10-line function). | 🎭 **FAKE (rubric)** |
| **Routing to rep** | You forward the profile to the right rep via Slack/email. | 🎭 **FAKE (human)** |
| **CRM sync** (HubSpot/SF) | Zapier/n8n "new lead → create HubSpot contact + note," or manual entry. | 🎭 **FAKE (Zapier/manual)** |
| **Multi-tenant, RLS, admin console, question-policy editor** | Not needed for 5 hand-onboarded clients. Config lives in a JSON file per client. | ⛔ **SKIP** |
| **Premium: signal monitoring, monthly reports, ICP gap campaigns** | 100% manual. You *write* the monthly report; the CSM (you) runs campaigns by hand. Zero premium code. | 🎭 **FAKE (fully manual)** |

**The only non-negotiable build is the widget + a thin spine to store and display leads.** Everything else is a human until volume forces automation (§6).

---

## 2. What you build for real

### The widget (the customer-facing piece)
- A single `<script>` tag that injects a chat widget (Shadow-DOM isolated so it can't break the host site's CSS).
- A short, adaptive conversation driven by **Claude (`claude-sonnet`)** that captures **intent / business need, budget band, timeline, work email, company**.
- **Consent disclosure** before any personal field (you're capturing PII on someone else's site — this is mandatory, not optional).
- A confirmation screen ("Thanks — [rep] will follow up within [X]") and a **fallback contact form** if the AI call fails.
- Keep the conversation flow in a per-client **config JSON** so you can tune questions per pilot (this is how you learn *which questions predict deal quality* — the core thesis).

### The thin backend
- Stack = **the spec's stack (NestJS + Postgres on Render)** so the concierge MVP is the *seed* of the real product, not throwaway code. (If you want to go even faster, a single Next.js API route + Postgres works — but don't use no-code for the LLM conversation; you'll want real control.)
- Endpoints: serve widget config, accept conversation turns, store a `Lead` (intent/budget/timeline/email/company + transcript), fire a webhook/Slack alert on completion.
- That's it. No multi-tenancy abstraction — a `client_id` column is enough for 5 clients.

### The internal lead view
- A dead-simple authed page listing captured leads with their captured fields + transcript. (Airtable synced via webhook is a fine v0 if you want to skip building UI.)

---

## 3. The thin architecture

```
Visitor → [Widget on client site] → POST conversation turns → [NestJS API] → [Postgres: leads]
                                                                      │
                                                          on completion ▼
                                              [Slack/email alert to YOU]  +  [Zapier: → Clearbit/the secondary enrichment provider enrich → HubSpot contact+note]
                                                                      │
                                                          YOU (the "platform") ▼
                                          read profile → apply ICP rubric → forward to the right rep → (later) write the monthly report
```

The boxes marked "YOU" are the parts the spec automates later. For 5 clients, you *are* the enrichment service, the scoring engine, the router, and the report generator.

---

## 4. The ~3-week build sequence

**Week 1 — the widget + conversation.** Script-tag loader + Shadow-DOM chat UI; Claude conversation loop capturing the 5 fields; consent gate; confirmation + fallback form. Test on a dummy site.

**Week 2 — the spine.** NestJS API + Postgres `leads` table; per-client config JSON; completion webhook → Slack alert; Zapier hop to Clearbit/the secondary enrichment provider + HubSpot. Bare internal lead view (or Airtable).

**Week 3 — pilot-ready polish + onboard #1.** Per-client branding/copy, the ICP rubric, your back-office runbook (§5), and go live with your first signed pilot on one page.

**Ongoing — operate manually** (§5) and tune the conversation flow per what's converting.

---

## 5. The manual back-office runbook (per captured lead)

When a lead-completed Slack alert fires:
1. **Enrich** (if Zapier didn't auto-fill): Clearbit/the secondary enrichment provider lookup → company size, funding, tech stack, decision-makers. (~2–3 min by hand.)
2. **Score**: apply the ICP rubric (fit + intent + budget + urgency → High / Nurture / Low). (~1 min.)
3. **Assemble** the profile: intent summary + budget/timeline + enriched facts + score + recommended next step. (Drop into the CRM note.)
4. **Route**: @-mention the right rep in Slack / email with the profile and "call them today."
5. **Log** it for the weekly review (§7).

Target turnaround: **under ~30 min** during business hours (vs. the spec's automated 2-min — and still dramatically faster than the client's status quo of "a rep researches for 20 min, eventually"). Be honest with pilots that early turnaround is human-speed; it gets faster as you automate.

**Premium, if a pilot wants it:** you *write* the monthly intelligence report (signals you find manually via Clearbit/news + their own funnel data) and you *run* the ICP-gap email campaign by hand. The premium spec already calls it a CSM-managed service — so this is on-brand, not a hack.

---

## 6. Triggers to build the real thing (stop faking when…)

| When this breaks | Automate this (from the spec) |
|---|---|
| You're spending >1–2 hrs/day on manual enrichment + entry | Enrichment orchestration + auto CRM sync (spec §4.2, §4.5) |
| >5 clients, or onboarding a client takes you a full day | Multi-tenant config + admin console (spec §6, §7) |
| Reps complain about turnaround time | Auto scoring + routing engine (spec §4.3, §4.4) |
| A pilot pays for premium and the manual report eats a day/month | Signal engine + report generator (premium spec) |

**Don't pre-build any of these. Let the pain pull them.**

---

## 7. What to measure (this is the real point of the pilot)

Instrument from day one — these *are* your product validation and your sales proof:
- **Leading indicators** (measurable inside a 30-day pilot, since deals close slower): qualified-meeting conversion rate vs. the client's old form, time-to-first-meeting, conversation completion rate, required-field capture rate.
- **The north-star thesis** (tracked, matures post-pilot): cycle time from widget-complete → closed-won vs. their form baseline.
- **Conversation-flow learning:** tag which questions' answers correlate with good deals. **Decision rule (from the spec): if enriched profiles add context but cycle time doesn't move, rework the conversation flow first — not the enrichment.** This is why you keep the flow in editable config.

---

## 8. Rough cost to run the concierge MVP

- **LLM (Claude):** cents per conversation — negligible at pilot volume.
- **Enrichment (Clearbit/the secondary enrichment provider):** pay-as-you-go; a handful of lookups/day across 5 clients is small. Keep an eye on per-lead cost (spec's guardrail: ≤ $3.50/qualified lead).
- **Infra:** Render + Postgres + Redis ≈ low tens of $/mo at this scale.
- **Tools:** Zapier/n8n, a Slack workspace — ~$0–50/mo.
- **The real cost is your time** (the manual back-office). That's the point: you're trading your hours for proof of willingness-to-pay before you spend the build budget. The first $500 + $2,500/mo checks tell you whether to automate.

---

**Bottom line:** ~3 weeks of focused build gets the widget + spine live; everything else is you, by hand, for the first 5 logos. Sell in parallel (Sales Kit) — by the time pilots close, this is ready, and the pilots tell you exactly what to automate next.
