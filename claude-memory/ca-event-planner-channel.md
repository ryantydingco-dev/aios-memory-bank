---
name: ca-event-planner-channel
description: "Event-planner channel campaign for CA (2026-07-10) — persona play (\"your invisible swag department\"), verified AI Ark TAM (~50k US planners, 753 SC), offer + 4-email sequence + ICP config built, ready to launch via /ca-outbound event_planners."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6a82da70-d9a0-49e3-a1f8-4169d10ad29a
---

Built 2026-07-10 on Ryan's pivot question ("what's the TAM on event planners?"). **The thesis: planners are a LEVERAGED market, not a bigger one** — one planner runs 5–20 events/yr, every event needs swag, so 20–50 planner relationships ≈ $1–5M/yr (the whole $3.2M→$5M gap). Channel/relationship play, not one-off sales.

**TAM (sourced):** ~155,800 US meeting/convention/event planners (BLS 2024); ~94k party/event firms + ~46k trade-show/conference firms (IBISWorld); promo TAM $26.6–26.8B (ASI/PPAI 2024), event-driven slice est. 20–30% (my estimate, verify before decks). SAM ≈ corporate/assoc/agency planners only — **EXCLUDE wedding/bridal/party** (favors, not branded merch). Associations: MPI ~17k engaged/~90 chapters, PCMA ~8.4k, ILEA ~2k/51 chapters — **chapter events themselves need swag; one local chapter sponsorship = 50 planners in a room** (overlaps ca_sponsors.py).

**AI Ark reachability VERIFIED (people_search, 2026-07-10):** "event planner" US = 26,370 · "director of events" US = 20,337 · "meeting planner" US = 3,950 · all-titles **SC = 753** (regional pilot viable). Sample quality high — first SC hit was a Sr. Event Planner (Myrtle Beach) running an in-house team w/ ~$5M event budget; that's the target profile (also: CMP cert, corporate/gala work).

**Offer ("Event Kit Partner" / "your invisible swag department")** — maps 1:1 to documented planner pains (vendor sprawl, MOQ/quote chaos, quality roulette, deadline terror, kitting): (1) **free client-logo mockups for the planner's own pitches** — CA becomes their sales tool, THE wedge, lead with it; (2) one contact, 24–48h proofs, deadline-guaranteed; (3) kitting + venue drop-ship; (4) white-label + planner margin (the 10–12% rev-share store, pointed at their org clients). Two sub-segments, same offer: **in-house** (direct buyer, "your events' swag handled") vs **agency** (channel partner, pitch-mockup + margin).

**Built artifacts:** `config/ca_outbound.yaml → icps.event_planners` (persona play: NO industry filter, title keywords + wedding/bridal/party excludes, 2–1000 staff, pilot locations SC/NC/GA/NY, inbox_tag `planners`) · `pillars/2-customer-acquisition/sequences/event-planners-cold-copy.md` (4-email Maclaine-voice sequence w/ split Day-0 by sub-segment, LinkedIn lane, association play, launch runbook). No-discount rule enforced ([[ca-no-discount-gimmicks]]).

**Launch (pending Ryan):** tag ~10 inboxes `planners` in SmartLead → `/ca-outbound event_planners --limit 50` → personalization approval loop → DRAFT review → Start. Parallel LinkedIn connects + scout an MPI-Carolinas/ILEA chapter sponsorship. Related: [[ca-outbound-pipeline]], [[ca-tradeshow-signal]] (planners of trade shows ≠ exhibitors — complementary), [[ca-reactivation-engine]], [[promo-market-landscape]].
