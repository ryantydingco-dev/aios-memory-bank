# Daily Swag Engine — the every-day loop (v1, 2026-08-10)

**Why this exists:** Miller Johnson closed today — 2,600 water bottles from a cold email sent Jul 1. The motion is proven: cold email → reply with logo → same-day mockups + deck → Maclaine quotes → close. This doc is the repeatable daily loop so it happens every day, not by accident.

**The proven chain (don't improvise it):** signal-led campaign → mockup-teased email 1 → prospect replies with logo → same-day fulfillment (research → catalog-checked mockups → Gamma deck → friendly reply, CC Maclaine) → quantities → Maclaine quotes same day → close. Reference fulfillment: `swag-tradeshow-fulfillment-2026-08-10.md` (AlpVision).

## The daily loop (run every working day)

### 1. Morning triage (~15 min, first block)
Pull new SmartLead replies (master inbox or REST API; MCP lead-fetch is broken, use `SMARTLEAD_API_KEY` from aios-starter-kit/.env against `server.smartlead.ai/api/v1`). Classify every reply:
- **Logo received / "sure, send it"** → same-day fulfillment queue (step 2). This is the golden path; never let one sit overnight.
- **Interested, no logo yet** → short reply asking for the logo (or pull it from their site header, faster).
- **Question/objection** → answer same day, human tone, no pitch escalation.
- **OOO** → mine the auto-reply for direct phones/alt contacts, log, snooze to return date.
- **Negative/unsubscribe** → mark in SmartLead so the router suppresses. Never re-touch.

### 2. Same-day fulfillment (per prospect, ~45-60 min all-in)
1. Research: their site (what they sell), the event/trigger the campaign rode (show dates verified with a source, never assumed).
2. Logo: pull the real file from their site header or email attachment. Never redraw.
3. Items: pick 4-6 from the approved product catalog ONLY (`Creative-Alternatives-AIOS/config/ca_product_catalog.yaml` — BUILD PENDING, see below). Until it exists: SanMar/alphabroder for apparel+socks, Hit Promo/Prime Line/Innovation Line for hard goods, Koozie Group/PCNA for drinkware. **Never mock a branded product CA has no account for (the Yeti lesson).**
4. Mockups: two-reference composite (real blank photo + real logo, nano_banana_pro, explicit remove-sample prompts). QC every image: read every word aloud, check spelling.
5. Deck: Gamma, Canaveral-style theme matched to their brand. Item cards with one short line each + honest timeline + team card (Ryan design / **Maclaine Scher quoting, maclaine@creativealternatives.com**) + next-step card. Classic treatments, no gag concepts. External view on.
6. Reply: friendly, mid-length. Deliverable link + images attached + one line per item + "we can print on anything, name it and I'll mock it up, that part's always free" + honest timing ladder + ONE CTA (reply with quantities → Maclaine). CC Maclaine. Verify-copy pass if anything feels off.
7. Timeline math rule: work BACKWARD from the real deadline including freight. Never say "room to spare" unless the slow end of production + shipping still clears it.

### 3. Handoffs + pipeline (~10 min)
- Quantities received → Maclaine same day (she owns numbers; we never invent prices).
- Log every fulfillment + stage in the fulfillment doc for that campaign; deals → HubSpot stages if in use.
- Fulfilled leads → nurture subsequence if one exists for that campaign (check first; documented ones are the staffing campaigns).

### 4. Feed the machine (afternoon, ~20 min)
- Campaigns keep sending: watch bounce/reply health per campaign (pause anything spiking bounces).
- Weekly (Mon): refresh trade-show cohorts — `/ca-tradeshows` scout, shows entering the 8-12-week window roll in continuously. Other verticals per the signal engine.
- Every close becomes proof: **Miller Johnson (2,600 bottles, Michigan law firm) is now the named-proof line for Law + corporate copy — get Wil's OK before naming them, else use "a 350-attorney Michigan firm."** Named specific proof is the #1 reply lever per the SmartLead copy autopsy.

## Weekly review (Fri, 15 min)
Replies → fulfillments → quotes → closes, per campaign. Kill/fix campaigns with sends but no replies; scale what converts. Only metric that matters per the severance plan: asks made.

## Build queue (prerequisites to make this bulletproof)
1. **`ca_product_catalog.yaml`** — approved items constrained to real QB vendors (supplier, SKU, decoration, min qty, lead time, blank photo). Seed ~20 items across tiers; Maclaine confirms SKUs. THE fix for "random products." ← NEXT BUILD
2. **Blank photo library** — `mockups/blanks/<vendor>-<sku>.jpg`, grows with every job (per ca-production-art skill).
3. **Reply-triage script** — auto-pull + classify new replies each morning into a worklist (the reply router pattern from the staffing campaigns).

## Today's open queue (2026-08-10)
- AlpVision reply READY TO SEND (deck + 5 mockups + reply text in fulfillment doc). Mug mockup shows YETI — swap to Koozie/PCNA equivalent or have Maclaine quote an equivalent before she orders.
- Untriaged repliers from this morning: Jennifer Wiernicki (BGC Metro South, Camps Fall), Avery Spain (familylawma.com, Law National), Whitney Rosa + Kristina Walsh Bull (brightlysoftware.com, Trade Show).
- Miller Johnson: confirm order details with Maclaine, get the proof-line OK from Wil, ask for the referral/review while the win is fresh.
