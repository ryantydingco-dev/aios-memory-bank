# Ops Audit — Interview Kit (Kenny & Maclaine)

> **Part of a bigger sequence.** See `aios-launch-protocol.md` (same folder) for the full
> picture — it wraps this file with a Kickoff (before) and a Validation/Blueprint close
> (after), and adds the context/strategy questions that feed the AI's ongoing understanding of
> the business. This file stays as-is; it's the deep workflow-mapping script (Layer 2).

The questions to run the operations discovery. Goal: understand exactly how Creative Alternatives runs today so we can map it, find the time leaks, and pick the first automation. Answers plug into `ops-discovery.md` and the `context/` files.

---

## For Ryan — how to run this

**Posture.** This is a conversation, not an audit of Kenny. He built a $3M business on instinct — the job is to *learn his system*, not grade it. Lead with "I want to understand how you do this so well, then take the annoying parts off your plate." Let him talk. The gold is in the stories and the complaints.

**Logistics.**
- **Time:** ~60–90 min with Kenny for the workflow + pain. A shorter follow-up with Maclaine for numbers and the web-store side.
- **Record it** (audio is enough) if Kenny's OK with it — you'll plug the transcript straight back in. Ask first. This is also potential Episode 1 footage; confirm what's filmable (Section 10) *before* rolling.
- **Bring one real, recent order** to walk through. Abstract questions get abstract answers; a specific job gets the truth.

**What to listen for** (the automation gold):
- "I always have to…" → repeated manual work.
- "Then I copy it into…" → data moving between tools by hand.
- "Sometimes it slips through…" → missed follow-ups, money left on the table.
- "Only I can…" → Kenny's judgment (do NOT automate — protect it).

**Tagging.** [KENNY] = ask Kenny live. [MACLAINE/BOOKS] = numbers, can be async. [BOTH] = either.

---

## 0. Open the conversation [KENNY]

Say something like:

> "You've run this thing for 25 years out of your head and it works. I don't want to change how you sell or who you are with customers. I want to map out everything you do behind the scenes, find the stuff that eats your time, and see what we can get a computer to do for you — so you get hours back. Walk me through it like I know nothing."

Then mostly listen.

---

## 1. The big picture [KENNY]

1. In your own words — what does Creative Alternatives actually do for a customer?
2. How does a typical job come in? Referral, repeat customer, someone calls you? Roughly what's the split?
3. What are you selling most of these days? (apparel, drinkware, promo, full company stores, …)
4. Walk me through your week. Where does your time actually go?
5. Who are the customers you would never want to lose? *(Listen for the anchor accounts — note them for Section 6.)*

---

## 2. Walk one real order, start to finish [KENNY]

Pick a recent order. For **every stage below**, ask the same five:

> **a) Who does this?  b) What do you use to do it (tool/system)?  c) How long does it take?  d) What goes wrong here?  e) What part needs *your* judgment specifically?**

Stages to walk (adapt to how CA actually flows):

1. **Request comes in** — how does it arrive? Email, call, text, form? What info do you get vs. have to chase?
2. **Quote / pricing** — how do you build a quote? Where do prices come from? Supplier catalogs, gut, a spreadsheet? How long per quote?
3. **Customer says yes** — how does an order get confirmed? Deposit? PO? Where's it recorded?
4. **Pick supplier / decorator** — how do you choose? How do you send them the order (PO)? How many suppliers in a typical job?
5. **Art & proof** — who makes the proof? How does the customer approve? How much back-and-forth? Where does this stall?
6. **Production** — how do you know it's on track? Do you chase suppliers? How do you find out if something's late?
7. **Receiving / quality check** — does product come to you or ship direct? Who checks it's right?
8. **Shipping / delivery** — how does it get to the customer? Who handles tracking and problems?
9. **Invoice & payment** — how/when do you invoice? How do you get paid? How often do you chase money?
10. **Reorder / follow-up** — do you follow up for repeat business? How do you remember who to re-contact and when?

*(Fill the workflow table in `ops-discovery.md` from this.)*

---

## 3. The tool stack [BOTH]

What do you actually use day to day? For each: what's it for, and does it talk to the others or do you re-type things?

- Email — which one?
- Spreadsheets — what lives in them? (pricing, customers, orders, inventory?)
- Any order/quote software? (or all manual?)
- Accounting — QuickBooks? Something else? Who runs it?
- Supplier ordering — portals, email, phone?
- The web-store platform (for company stores) — what is it?
- Payments — how do customers pay? How do you pay suppliers?
- Phone/text — how much business runs through your personal phone?

*(Every "I re-type it into…" is a candidate automation.)*

---

## 4. Time & pain — the money questions [KENNY]

1. What's the single most annoying thing you do over and over?
2. What takes way longer than it should?
3. What do you do at night or on weekends because there's no time during the day?
4. What slips through the cracks? (forgotten reorders, late proofs, unsent invoices, no follow-up)
5. When you're slammed, what breaks first?
6. If you could wave a wand and have one part of this just *handle itself*, what would it be?
7. What's the busy season vs. the slow season? When does the wheels-falling-off happen?

---

## 5. Suppliers & sourcing [KENNY]

1. Who are your main suppliers / decorators? *(Get names — we'll need them to automate POs and tracking.)*
2. How do you decide who to use for a given job?
3. How does pricing work with them? Set catalogs, negotiated, per-job?
4. What are payment terms with suppliers? (net 30, upfront, …)
5. Has a supplier ever burned you? What happened? *(Reveals the risk you'll never fully automate.)*

---

## 6. Customers & revenue [BOTH]

1. Roughly how many active customers do you have?
2. What share of revenue comes from your top handful? *(Concentration risk — important.)*
3. Who are the crown-jewel accounts, by name?
4. Any big accounts at risk, or that you've lost recently? Why?
5. How much is repeat vs. brand-new each year?

---

## 7. The web-store / branded-store offer [MACLAINE + KENNY]

*(This is the growth wedge Ryan + Maclaine run outbound for — get it precise.)*

1. Walk me through how a company-store deal actually works, start to finish.
2. What exactly does the organization get, and what do they earn? (confirm the 10–12% rev-share)
3. Who handles design, fulfillment, shipping, returns on these?
4. How many stores are live right now? Which are doing well? *(Farm & Forge — how's it going?)*
5. What does a good store do in revenue in year one?
6. What makes a store flop vs. thrive?
7. What's the most painful part of running these at scale?

---

## 8. Do-not-automate / guardrails [KENNY]

1. What part of this should *always* have you in it — where the relationship or your judgment is the whole point?
2. What would you never want a computer or a stranger touching?
3. What's "sacred" about how you do business that we should protect, not optimize away?

*(Write these down as hard do-not-automate rules. Respecting them is how we keep Kenny's trust.)*

---

## 9. The numbers [MACLAINE / BOOKS — sensitive]

*(Can be a separate, lower-key conversation. Frames the ROI and the baseline.)*

- Confirm gross revenue (~$3.2M?) and net (~$600–700k?).
- Rough blended margin on a typical order.
- Accounts receivable — how much is usually owed to you, and how late do people pay?
- Accounts payable — how do supplier payments flow?
- Any seasonality in the cash flow.

---

## 10. Filming boundaries [KENNY] — settle BEFORE recording

1. Are you good with me documenting this on YouTube as we go?
2. What's fine to show — the work, the products, the process?
3. What's off-limits — customer names, exact numbers, supplier names, anything?
4. Do you want to be on camera, or stay behind it?

*(Default everything to private until Kenny clears it. Record this answer in `context/operators-code.md`.)*

---

## After the interview — what Ryan does

1. **Dump it in.** Drop the recording/notes in `context/import/`, then run a session: "plug the ops interview into the workspace."
2. **Fill the maps.** Update the workflow table, tool stack, and time/pain log in `ops-discovery.md`. Resolve the `[CONFIRM]` flags in `context/business-info.md`, `offer.md`, `people.md`.
3. **Rank the backlog.** Score automation candidates by *hours saved × ease*. Pick the top one.
4. **Write the do-not-automate rules** into `context/operators-code.md`.
5. **Capture Episode 1.** Run `/episode-capture` — the audit itself is the first episode.

Then we build the first automation.
