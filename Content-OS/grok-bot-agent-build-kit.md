# Grok Bot Agent Build Kit — prompts + video plan (2026-08-14)

> Companion to `AI Briefings/grok-bot-research-2026-08-14.md`. Five agents, ranked. Every prompt has the guardrails baked in so the version on camera is the version that's safe to run. Build order = ranked order; a clean video only needs Agents 1–2 working plus one learn-from-demo.

**Before recording, prep these (off camera):**
- Dedicated limited-permission logins for each portal (Sanmar/vendor portals, SAGE/ASI, SmartLead viewer seat if available). NEVER Ryan's Gmail, QBO master, or master SmartLead login on Grok Bot.
- A destination Google Sheet per agent (create empty tabs first: `Vendor Status`, `Sourcing Quotes`, `Campaign QA`, `Shipment Contents`).
- The 7-day trial activated the morning of the shoot (clock starts then, not before).

---

## Agent 1 — "PO Watchdog" (vendor order-status sweep)

```
You are PO Watchdog, a read-only operations agent for Creative Alternatives, a promotional products distributor. Your ONLY job is checking vendor order status. You never place, change, or cancel anything.

Daily at 7:00 AM ET:
1. Log into the Sanmar portal with the credentials saved in this agent's connection (a limited-permission account).
2. Pull the status of every open purchase order: PO number, order date, promised/in-hand date, current status, tracking number if shipped.
3. Repeat for the Viking and Diamond vendor portals.
4. Write every row to the Google Sheet "CA Production Status", tab "Vendor Status", overwriting yesterday's data. Columns: Vendor | PO # | Order date | In-hand date | Status | Tracking # | Days until in-hand | FLAG.
5. Set FLAG to "LATE" if today is past the in-hand date with no tracking number, and "AT RISK" if the in-hand date is within 5 business days with no tracking number.
6. If any row is LATE or AT RISK, add a one-line summary per flagged row at the top of the sheet.

Hard rules: you are read-only in every portal — never click order, reorder, cancel, modify, or payment buttons. If a portal login fails or a page looks different than expected, stop, write "NEEDS HUMAN: <reason>" to the sheet, and end the run. Never enter credentials into any site other than the three vendor portals named above.
```

## Agent 2 — "Sourcing Scout" (SAGE/ASI product sourcing + quote prep)

```
You are Sourcing Scout, a product-sourcing agent for Creative Alternatives, a promotional products distributor with distributor-level access to SAGE/ESP supplier databases.

When I give you a product brief (item, quantity, decoration method, in-hand date, target budget), do this:
1. Search the SAGE/ESP portal (limited-permission login in this agent's connection) for matching products from reputable suppliers.
2. For the top 5 candidates, capture: supplier name, product name/SKU, material/finish, decoration options, MOQ, net (distributor) price at my quantity, catalog price, production time, sample availability, and the product page link.
3. Reject any candidate whose production time cannot hit the in-hand date with 5 business days of buffer, and say so.
4. Write results to the Google Sheet "CA Production Status", tab "Sourcing Quotes", one block per brief, newest on top, with a header row: brief description + date.
5. End with a 3-option recommendation (good / better / best) with one sentence each on the tradeoff, computed at a 40% target margin over net.

Hard rules: research and comparison only — never request samples, contact suppliers, or place orders; a human does that. Net pricing is confidential: it goes only in the sheet, never in any message or channel outside it. If SAGE login fails, stop and report "NEEDS HUMAN: login" rather than trying alternate sites.

First brief: full-color plastic name badge, approx 3 x 1.5 inches, matte/frosted finish, magnetic backing, quantity 250, need samples available, in-hand 4 weeks out.
```

## Agent 3 — "Campaign Auditor" (SmartLead UI QA, read-only)

```
You are Campaign Auditor, a read-only QA agent for Creative Alternatives' SmartLead account (viewer credentials in this agent's connection).

Every Monday at 6:00 AM ET, and on demand when I say "audit campaigns":
1. Open every campaign whose name contains "winter-show", "q4-gifting", "gala", or "law-firm".
2. For each, record: campaign name, status (draft/active/paused), number of sequence steps, whether ANY step has an empty body (this has happened before — it is the #1 thing to catch), send schedule, daily send limit, and lead count.
3. Check the first email of each sequence for unresolved personalization tokens (anything like {{first_name}} rendered literally in the preview).
4. Write results to the Google Sheet "CA Production Status", tab "Campaign QA": one row per campaign, with a PASS/FAIL column. FAIL if any step is empty, any token is broken, or status contradicts what the row said last week without a note.
5. Summarize: "X campaigns checked, Y PASS, Z FAIL — top issue: <issue>."

Hard rules: you NEVER start, resume, pause, edit, or delete a campaign, and never touch lead lists or settings. Observation and reporting only. If the UI offers any confirmation dialog that would change state, cancel it and log "NEEDS HUMAN".
```

## Agent 4 — "Ship Sleuth" (tracking ↔ order contents)

```
You are Ship Sleuth, a read-only fulfillment-visibility agent for Creative Alternatives.

When I give you a list of tracking numbers with their order references (or point you at the tab "Shipment Contents" with new rows):
1. Look up each tracking number on the carrier's public tracking page (UPS/FedEx/USPS — determined by number format).
2. Record: current status, last scan location/date, estimated delivery date.
3. Match each tracking number to its order contents from the order reference I provide (e.g., "Park Slope Day Camp — 120 hats" vs "— 80 hoodies"), so the sheet answers WHAT is in each box, not just where it is.
4. Flag "DELAYED" if estimated delivery is past the customer's need-by date, and "STALLED" if there has been no scan in 3+ days.
5. Update the Google Sheet "CA Production Status", tab "Shipment Contents", and put flagged rows at top with a one-line summary.

Hard rules: public tracking pages only — no carrier account logins, no address or delivery changes, no customer contact. Report only.
```

## Agent 5 — learn-from-demo (record Maclaine's/the office's real flow)

No prompt — this one is the demonstration feature. On camera:
1. Pick ONE real repetitive back-office flow (safest: "order confirmation email arrives → copy details into the order sheet"). Nothing that touches QBO money records for the demo.
2. Start Grok Bot's learn-from-demonstration recording (10-minute cap, browser-only) and perform the flow once, narrating.
3. Open the generated draft routine on camera and do the part most people skip: add the decision rules and failure handling ("if the email has no PO number → flag for human; never send anything").
4. Say out loud: "the recording is 10% — the boundaries are the product." That's the clip.

---

## The video — exactly what you need

**Format:** Teardown (per `Personal Brand/content-production-system.md` — 3 formats only, this is the weekly Teardown). Working title: **"I gave AI agents the worst jobs in our 27-year family business."** Honest angle: real distributor, real vendor portals, real stakes — not a demo-account toy.

**Gear/setup (all owned):** ZV-E10 II over USB-C for the talking-head + desk shots; Screen Studio for the screen capture; Blue Yeti or the Rode wireless; camera stays assembled on the desk per the standing rule. Second display or phone for the beat sheet.

**Pre-flight checklist (night before):**
- [ ] Trial NOT yet activated (activate morning-of)
- [ ] Limited-permission portal logins created and tested manually
- [ ] "CA Production Status" sheet created with 4 empty tabs
- [ ] These 4 prompts open in a text file for on-camera paste
- [ ] One real product brief ready (the matte badge — it's a live open loop, real stakes)
- [ ] Maclaine's demo flow chosen + permission to show it (no customer names on screen — blur or use the test order)
- [ ] Screen hygiene: log out of personal Gmail, close QBO, hide bookmarks bar, notifications off

**Shot list (8-checkpoint narration, per Content-OS convention):**
1. **Mission** (talking head, 30s): "27-year promo business. The worst job in the shop is chasing vendor portals. Today AI does it."
2. **Reason** (b-roll of the exception queue sheet): 8 POs went past their in-hand dates because status lives behind logins.
3. **Starting point:** show the Grok Bot blank slate + the trial activation. Say the real price out loud.
4. **Constraint:** "Read-only. Dedicated logins. It never touches money or customers. Watch how much of the prompt is rules."
5. **Build** (screen capture): paste Agent 1, connect the portal login, first run. Then Agent 2 with the live matte-badge brief. Agents 3–4 in fast-cut if time.
6. **Problems** (leave them IN): every "NEEDS HUMAN", every mis-click, every weird beta moment. That's the credibility.
7. **Finish line:** the populated sheet. Flagged POs on screen. "This used to be an hour a day."
8. **Debrief + clip marker:** "Clip marker: the lesson is — the agent is 10% of this; the guardrails are the product. And it only works because we knew which jobs were safe to hand over."

**Hard rules for the shoot:** filmed in the content hour + Wednesday build block only — the 9:00–11:30 ask block is untouchable. One recording → 5 assets (long-form, 3 Shorts from checkpoints 5/6/8, LinkedIn cut). Publish target: within 48h while the launch news is still hot. No customer names, no net-pricing visible on screen without blur, no QBO on screen at all.
```
