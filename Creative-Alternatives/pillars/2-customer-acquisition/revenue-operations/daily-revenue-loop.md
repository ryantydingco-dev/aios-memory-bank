# Daily Revenue Fulfillment Loop

**Why this exists:** Miller Johnson closed today — 2,600 water bottles from a cold email sent Jul 1. The motion is proven: cold email → reply with logo → same-day mockups + deck → Maclaine quotes → close. This doc is the repeatable daily loop so it happens every day, not by accident.

**The proven chain:** signal-led campaign → prospect interest → same-day fulfillment (research → catalog-checked mockups or store preview → customer-safe deck → human-approved reply) → quantities → Maclaine quotes → close. Reference packets live in `proof/`.

This loop implements actions 1 and 4 of `../../../gtd/daily-power-list.md`. The power list governs daily priority.

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
3. Items: pick 4-6 from the approved product catalog ONLY (`../../../config/ca_product_catalog.yaml`). **Never mock a branded product CA has no account for (the Yeti lesson).**
4. Mockups: two-reference composite (real blank photo + real logo, nano_banana_pro, explicit remove-sample prompts). QC every image: read every word aloud, check spelling.
5. Deck: Gamma, Canaveral-style theme matched to their brand. Item cards with one short line each + honest timeline + team card (Ryan design / **Maclaine Scher quoting, maclaine@creativealternatives.com**) + next-step card. Classic treatments, no gag concepts. External view on.
6. Reply: friendly, mid-length. Deliverable link + images attached + one line per item + "we can print on anything, name it and I'll mock it up, that part's always free" + honest timing ladder + ONE CTA (reply with quantities → Maclaine). CC Maclaine. Verify-copy pass if anything feels off.
7. Timeline math rule: work BACKWARD from the real deadline including freight. Never say "room to spare" unless the slow end of production + shipping still clears it.

### 3. Handoffs + pipeline (~10 min)
- Quantities received → Maclaine same day (she owns numbers; we never invent prices).
- Log every fulfillment + stage in the local revenue tracker. HubSpot is not in use.
- Fulfilled leads → nurture subsequence if one exists for that campaign (check first; documented ones are the staffing campaigns).

### 4. Feed the machine (afternoon, ~20 min)
- Campaigns keep sending: watch bounce/reply health per campaign (pause anything spiking bounces).
- Weekly (Mon): refresh trade-show cohorts — `/ca-tradeshows` scout, shows entering the 8-12-week window roll in continuously. Other verticals per the signal engine.
- Every close becomes proof: **Miller Johnson (2,600 bottles, Michigan law firm) is now the named-proof line for Law + corporate copy — get Wil's OK before naming them, else use "a 350-attorney Michigan firm."** Named specific proof is the #1 reply lever per the SmartLead copy autopsy.

## Weekly review (Friday)

Reconcile replies → fulfillments → quotes → closes → revenue by channel. Fill the weekly row in `../../../plans/1m-6-month-game-plan.md`. Fix or kill campaigns that create activity without quote-stage conversations.

## System dependencies

1. Keep `config/ca_product_catalog.yaml` current with approved products, suppliers, SKUs, decoration methods, minimums, lead times, and blank images.
2. Grow the approved blank-photo library with each fulfilled job.
3. Maintain one reply-triage queue with a named human owner and a 10 AM SLA.

## Standing open verification

- Confirm Miller Johnson's order details with Maclaine.
- Obtain Wil's approval before using Miller Johnson by name; otherwise use an approved anonymous description.
- Treat names and statuses in older fulfillment packets as historical until checked in the live inbox or pipeline.
