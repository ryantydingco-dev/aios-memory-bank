# 90-Day Compounding GTM Game Plan — Creative Alternatives

> **Historical/supporting plan.** Keep the flywheel and tooling concepts; do not use its preselected launch segments or daily multi-platform cadence as current instructions. See `account-based-outbound-engine.md`, `../3-online-presence/linkedin-content-engine.md`, and `../../plans/first-30-days-unified-operating-plan.md`.

> The build plan for a GTM engine that *compounds* — three engines that feed each other so leads come from outbound, the warm QuickBooks base, AND content, each making the others stronger. Built on Ryan's **actual** stack (not the older docs' Apollo/SmartLead/HubSpot).
>
> Builds on: `master-gtm-strategy.md` (the why + motion ranking), `home-run-offer.md` (the offer), `outbound-gtm-playbook.md` (the cadence detail).
> **Goal:** by day 90, a flywheel that prints leads from three sources at once.

---

## 1. The three engines and the flywheel

```
        ┌──────────────────────────────────────────────────────────┐
        │                                                          │
        ▼                                                          │
  ┌───────────┐      sharpens ICP      ┌───────────┐               │
  │  WARM     │ ───────────────────►   │   COLD    │               │
  │ QuickBooks│   (best customers =    │ Outbound  │               │
  │ reactivate│    cold lookalikes)    │ AI Ark +  │               │
  │ reorder   │                        │ Origami → │               │
  │ upsell    │ ◄───────────────────   │ Sendr +   │               │
  └─────┬─────┘   feeds win stories    │ Salesfin. │               │
        │              + data reveals  └─────┬─────┘               │
        │                                    │                     │
        │   both produce raw material        │  conversations +    │
        │   (numbers, wins, case studies)    │  case studies       │
        ▼                                    ▼                     │
  ┌──────────────────────────────────────────────────┐            │
  │              CONTENT / PRESENCE                    │            │
  │   YouTube (flagship) → repurposed to              │            │
  │   LinkedIn · X · Instagram · TikTok               │  warms the │
  │   built with Gamma (decks/assets) + Canva (visual)│  cold ─────┘
  └──────────────────────────────────────────────────┘  prospects
              audience + sales assets + optionality
```

**The compounding loop, in one read:**
1. **Warm + Cold** produce conversations, real numbers, and case studies.
2. Those become **Content** across five platforms.
3. Content **warms the exact prospects outbound is targeting** (they see your LinkedIn/posts before or after the DM) → cold reply rates climb.
4. Higher reply → more conversations → more revenue, more case studies → more content. The loop tightens every week.
5. Meanwhile **QuickBooks ICP** sharpens who Cold targets, so the leads get better, not just more.

That's the difference between "doing outbound + posting" and a *compounding* engine: each output is another engine's input.

---

## 2. The stack — roles (reconciled to what you actually have)

| Layer | Tool | Owns |
|-------|------|------|
| **System of record** | **QuickBooks** | Customers, orders, money, history. Spine of the warm engine + ICP. |
| **Lead data (the engine)** | **AI Ark** | Full data layer — search the ICP, pull person-level/bio data, verify emails/phones. Discovery + enrich + verify in one. Replaced Apollo (dropped on cost). |
| **Lead data (optional)** | **Origami** | Experimental, *not core*. Only earns a slot if a coverage test beats AI Ark on verified contacts for the niche. |
| **Cold email** | **SmartLead** | High-volume cold email, mailbox rotation, warmup, deliverability. The email backbone. |
| **LinkedIn + video DM** | **Sendr.io** | Connection requests, **video/voice DMs** (the mockup walkthrough). The LinkedIn + social-DM layer. |
| **Phone** | **Salesfinity** | Parallel dialer — warm reactivation calls AND cold ICP dials. Mobile-swap on. |
| **Pipeline / CRM** | **HubSpot** | Stages + reply logging + handoff for NEW leads (cold + inbound). QuickBooks stays the customer/financial truth; HubSpot is the new-lead pipeline. |
| **Decks / assets / pages** | **Gamma** | Store-preview decks, one-pagers, lead magnets, segment pages. Sales assets + gated content. |
| **Visual / social** | **Canva** | Mockups for the wedge, thumbnails, carousels, social graphics. |
| **Video flagship** | **YouTube** | The build-in-public series — every play filmed. |
| **Distribution** | LinkedIn · X · Instagram · TikTok | One shoot → many posts via the repurpose engine. |

**Reconciled with older docs:** **Apollo is OUT (dropped on cost) → AI Ark is the data engine.** Origami is optional/experimental. **SmartLead, Sendr, Salesfinity, HubSpot all confirmed in hand.** GHL + HeyReach → out.
**Wiring note:** AI Ark is an API key only — it is **not yet MCP-wired in CA** (the only data MCP wired today is Apollo, which we're removing). To let the agent build lists directly (and on camera), wiring AI Ark is a Phase-0 rails task. Also clean `.mcp.json`: remove **apollo, ghl, heyreach**.

---

## 3. Decisions (B & C resolved; A still open)

**A. Lead data — RESOLVED.** **AI Ark is the engine** (Apollo dropped on cost; it does discovery + enrich + verify in one). **Origami is optional** — keep only if a head-to-head coverage test beats AI Ark on verified emails + mobiles for the niche-local ICP. Action: wire AI Ark so the agent can drive it (Phase 0).

*(original recommendation, superseded:)* AI Ark and Origami overlap. Recommended split: **AI Ark = discovery** (search the ICP, pull person-level data), **Origami = verify + enrich** (clean emails/phones, fill gaps) right before sequencing. One finds, one cleans. → *Confirm this is how you want them divided, or tell me which is primary.*

**B. Cold email channel — RESOLVED.** You have **SmartLead** → cold email runs there (dedicated warmup + deliverability + mailbox rotation, the safe way to scale). Email still carries a 3–6 week domain-warmup tax, so it joins live sending in Phase 2 — but the warmup clock starts **Week 1**. Phase 1 leads with LinkedIn + phone + the mockup (no warmup needed).

**C. Pipeline — RESOLVED.** You have **HubSpot** → it's the home for new cold + inbound leads (stages, reply logging, handoff). Clean division: **QuickBooks = customer/order/money truth; HubSpot = new-lead pipeline.** They don't fight.

**D. Two content buckets (keep them straight — this bit us before).**
- **Ryan's operator/build-in-public presence** (LinkedIn/X/IG/TikTok/YouTube) = brand + audience + optionality, AND it warms cold prospects + generates sales assets. This is the "huge presence" you want.
- **CA's own findability** (niche landing pages, Google Business Profile) = how CA's *buyers* find it. Separate, lighter track, stands up in Phase 3.
- Both are in this plan; they don't compete because the AI work you film *is* real value you're creating in CA anyway. → *No action needed, just don't merge them.*

---

## 4. The 90-day phases

### Phase 0 — Foundations (Week 1, everything in parallel)
*No waiting. Start every clock that has a delay.*
- **Maclaine connects QuickBooks** to the instance → run the session → pull dormant/reorder/top-25/web-store lists + economics. (Films Episode 1.)
- **From the pull → ICP analysis** (classify customers by type, rank by LTV/reorder) → this seeds AI Ark's cold targeting.
- **Cold rails:** **71 inboxes already exist** for CA — capacity is NOT the constraint (~10–14k sends/wk possible). Confirm warmup status + domain spread + that they're on dedicated secondary domains (not `creativealternatives.com`). If warmed → cold can go live far sooner (collapses Phase 1/2). If cold → start warmup now.
- **Sendr:** optimize + warm both LinkedIn accounts (real photo, banner, a few posts — so cold prospects see a live profile).
- **Salesfinity:** number pool + mobile-swap configured.
- **Content rig:** lock the repurpose system, build Gamma + Canva templates, optimize all five platform profiles. Record the channel trailer.

### Phase 1 — Warm cash + content live (Weeks 2–4)
- **Reactivation engine live** (Salesfinity warm calls + Sendr/email backup) on the real dormant list → *first revenue.*
- **Content engine goes live:** YouTube Ep1 (the QuickBooks audit/reveal) → cut 5–10 shorts → daily LinkedIn build-in-public posts → repurpose to X/IG/TikTok. The "data archaeology" series starts.
- **Mockup line built** (Canva + AI) → first cold batch prepped on the ICP-validated segment.
- Cold email warming in the background.

### Phase 2 — Cold engine live + content compounding (Weeks 5–8)
- **Cold outbound launches** on the PROVEN segments (per `outbound/smartlead-campaign-analysis.md`): **Camps (10.1%) → Squash (5.2%)**, NOT CrossFit (real data: fitness flopped at ~0.2%). This time **lead with the mockup wedge** — which was never used in any prior campaign, so camps' 10.1% was hit with the best weapon unused. Sendr LinkedIn (connection → video DM mockup) + Salesfinity calls + SmartLead email.
- **Content at full cadence:** 1–2 long videos/wk + daily shorts + daily LinkedIn; X/IG/TikTok flowing from one shoot.
- The loop kicks in: prospects who saw your content reply to cold at higher rates. **Track reply lift on warmed vs cold-cold.**
- **Gamma sales assets** (store-preview decks, one-pagers) used live in the pipeline to close.
- Reactivation + reorder + upsell all running in parallel.

### Phase 3 — Compound + systematize (Weeks 9–13)
- **Fitness = wedge TEST, not scale bet** (it flopped at ~0.2% on weak no-mockup copy — invalid test). Re-run ONE fitness segment with the mockup + camps-grade copy + 1–2 named logos; only scale if it clears bar. Add other segments seeded by the QuickBooks ICP.
- **Stand up CA's own findability:** segment landing pages (Gamma) + Google Business Profile → first inbound feeds the same pipeline.
- **Lock the economics:** with QuickBooks LTV known, document CAC vs LTV → decide how hard to scale each segment.
- **Systematize:** the winning sequence becomes the template; referral + reorder motions run on a cadence; best-performing content formats doubled down.

By day 90: three engines live and feeding each other — leads from cold outbound, the warm base, and inbound/content at once.

---

## 5. The content system (how five platforms run without burning you out)

The trick is **one shoot → many posts**, with the AI skills doing the cutting.

| Platform | Role | Cadence | Built with |
|----------|------|---------|-----------|
| **YouTube** | Flagship — the build, filmed | 1/wk → 2/wk by Phase 2 | `youtube-script-writer`, `cge-holy-trifecta`, `youtube-launch-loop` |
| **LinkedIn** | Primary written + warms cold prospects (owner-operators live here) | Daily post + engagement | `linkedin-post-writer`, `linkedin-*` skills |
| **X** | Short-form / threads, repurposed | Daily | repurpose from LinkedIn |
| **Instagram / TikTok** | Vertical shorts + behind-the-scenes | Daily shorts | cut from the YouTube long + B-roll |
| **Gamma** | Lead magnets, teardown decks, segment pages | ~1 asset/wk | Gamma |
| **Canva** | Thumbnails, carousels, mockups, graphics | Ongoing | Canva |

**The repurpose flow:** film one long YouTube piece → script + edit → cut 5–10 vertical shorts → write the LinkedIn post + X thread off the same idea → Canva for thumbnail/carousel → Gamma if it deserves a downloadable asset. One sitting, 10+ pieces of content, five platforms.

**Content themes that double as GTM fuel:**
- **Data archaeology** — open the QuickBooks books on camera, reveal a real number, act on it ("$X in dormant accounts," "the 8 whales").
- **Build-in-public** — standing up the outbound machine, the mockup wedge, the AI dialer.
- **Wins** — every reactivated account / new store / case study.

---

## 6. Scoreboard (activity-based until QuickBooks locks the economics)

Leading indicators now; revenue targets fill in once the books are open.

**Warm engine:** dormant accounts called · connect rate · reactivated · $ reactivated
**Cold engine:** leads sourced (AI Ark) · verified (Origami) · LinkedIn connects · DMs · dials · **replies/conversations** · demos · **stores signed**
**Content engine:** posts/wk per platform · follower growth · **reply-rate lift on warmed vs cold prospects** (the proof the loop works) · inbound leads attributed
**The number above all:** total new conversations/wk and new revenue/mo, attributed by engine — so you feed the one that's working.

---

## 7. This week (immediate actions)

1. **Maclaine connects QuickBooks** → run the session → ICP + reactivation list + economics. *(Gate for the warm engine + targeting.)*
2. **Lock the 3 decisions** in §3 (lead-data split, email channel, content buckets).
3. **Confirm the 71 inboxes** — warmup status, domain spread, dedicated domains. This sets whether cold sends next week or after warmup. (Capacity is already solved; the throttle is lead supply + mockups + reply-handling, so plan to run *well below* max while copy proves out.)
4. **Stand up the content rig** — profiles optimized on all five platforms, Gamma/Canva templates, channel trailer recorded.
5. Then I build: the **reactivation engine** on the real list + the **AI Ark targeting queries** seeded by the ICP.

> Every step is a YouTube beat — see `../4-youtube-build/outbound-build-arc.md`. The build *is* the show.
</content>
