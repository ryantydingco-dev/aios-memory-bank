# DealThreads — Launch Copy

Voice rules in force: plainspoken-professional, decisively serious with dry wit aimed at the form (never the reader), **no exclamation marks**, **never lead with "AI,"** banned words off (seamless, unlock, leverage, revolutionize, synergy, supercharge, transform-your-pipeline). Spine: *the unbroken thread.*

---

## A. Homepage

### Hero
**Eyebrow:** DealThreads — conversational enrichment for inbound

**H1:** Never lose the thread.

**Subhead:** A standard contact form returns a name and an email, then drops the conversation. DealThreads replaces it with one that captures intent, budget, and timeline — and weaves in company size, decision-makers, recent funding, and tech stack behind the scenes. Your reps call back already knowing the deal.

**Primary CTA:** See a live thread →
**Secondary CTA:** Watch it run (60s)

**Trust strip (under the fold):** One script tag · Works with HUBSPOT and SALESFORCE · Your data, source-cited

---

### Section 1 — The gap (problem)
**Eyebrow:** `THE GAP`
**Headline:** The form gives your sales team homework.
**Body:** The data that decides whether a deal closes — company size, who signs, recent funding, the stack they already run — sits behind 20 minutes of research the form refused to do. The buyer typed in a name and an email. The rep Googles the rest at 5 PM, two days later, if at all. By then the thread is cold and the faster competitor has the meeting.
**Pull stat (Thread Amber):** `20 minutes` of research per lead — gone.

### Section 2 — How it works
**Eyebrow:** `ONE TAG, THE WHOLE THREAD`
**Headline:** It picks up the thread the form drops.
**Three steps (threaded list):**
1. **It talks.** One script tag swaps your form for a short, sharp conversation. It asks the two questions that matter — what they're solving, and the budget and timeline behind it — and stops there. No ten-field interrogation.
2. **It weaves.** While the buyer types, the enrichment layer pulls company size, decision-makers, recent funding, and tech-stack signals — and threads them to what the buyer just told you. Every field cites its source.
3. **It routes.** The complete thread lands in your CRM and on the right rep's desk, scored and ready. The rep opens the call already knowing the deal.

### Section 3 — The dossier (product proof)
**Eyebrow:** `WHAT YOUR REP OPENS`
**Headline:** Three tiers. One unbroken thread.
**Body:** `STATED` — what the buyer told you: intent, budget, timeline. `ENRICHED` — what we wove in: headcount, decision-makers, funding, stack. `ROUTED` — fit score and the rep it belongs to. Never a fact without a footnote.

### Section 4 — Differentiation
**Eyebrow:** `WHY NOT JUST BOLT TOOLS TOGETHER`
**Headline:** Everyone owns one slice. You stitch the rest by hand.
**Body:** Chat tools book a meeting and hand the rep a thin record. Enrichment tools have the data but never talk to the buyer. Routing tools move the lead fast but don't qualify it. DealThreads is the one managed layer that talks, enriches, scores, and routes — the whole thread, done for you.

### Section 5 — Pricing teaser
**Eyebrow:** `THE MATH`
**Headline:** $30K a year, against a $280K wish-list.
**Body:** The widget, the enrichment, and intelligent routing run $2,500 a month. The sales coordinator and the marketing analyst you've been meaning to hire run about $280,000 a year between them. DealThreads does the thread-weaving both of them would. Premium ($5,000/mo) adds ICP campaigns and a monthly intelligence report on funding rounds and stack changes.
**CTA:** Book a 20-minute walkthrough →

### Closing band
**Headline:** Never lose the thread.
**Sub:** DealThreads — conversational enrichment for inbound.
**CTA:** See a live thread →

---

## B. Widget Conversation Script

Design notes baked in. The widget is the brand: composed, one question on screen at a time, no emoji, no exclamation marks, opens with purpose not friendliness. As signals resolve, the **thread rail** on the panel edge lights nodes (`COMPANY` → `HEADCOUNT` → `FUNDING` → `STACK`); one node flashes Thread Amber as it completes. Enrichment runs silently from the email domain + first answers — the buyer is never asked for anything the thread can pull itself.

### Opening (launcher → first turn)
> **DealThreads:** I'll get you to the right person fast — and make sure they show up knowing your situation, not asking you to repeat it. What are you trying to solve?

*(Free-text intent capture. No menu of canned options unless the buyer stalls — see fallback.)*

### Turn 2 — qualify the intent
> **Buyer:** *"We're evaluating tools to replace our contact form / shorten lead response time."*
> **DealThreads:** Makes sense. Two quick things and I'll route you. Is this for your own team's inbound, or are you evaluating on behalf of a client?

*(Branches: in-house → continue; agency/reseller → tag + route to partnerships. `INTENT` captured.)*

### Turn 3 — budget & timeline (the two that matter)
> **DealThreads:** Got it. Roughly what timeline are you working against — this quarter, or scoping for later?
> **Buyer:** *"This quarter, if it works."*
> **DealThreads:** And is there a budget already set aside for this, or are you still building the case internally?

*(Captures `TIMELINE` + `BUDGET` conversationally — framed as routing logic, never as a gate. If the buyer deflects on budget, accept it: "No problem — I'll flag it as still scoping." Never push twice.)*

### Turn 4 — silent enrichment surfacing (the signature moment)
*(No question here — the thread rail visibly completes. Optional one-line acknowledgment, only if natural:)*
> **DealThreads:** One sec — pulling your company details so the rep doesn't have to ask. …Done.

*(`COMPANY`, `HEADCOUNT`, `FUNDING`, `STACK` nodes light; final node flashes amber. This is shown, not narrated at length. No "scanning…" theater.)*

### Turn 5 — capture the human + close the thread
> **DealThreads:** Best email and name for the follow-up? I'll route this to the rep who handles teams your size.
> **Buyer:** *"jordan@acme.com, Jordan."*
> **DealThreads:** Thanks, Jordan. Here's what I'm handing them: what you're solving, your timeline, and your company details — so the first call starts where this left off, not at square one. Expect to hear from [Rep] within the hour.

*(Close-state reassurance line — earns trust by showing the outcome, not promising it.)*

### Branch — low intent / "just browsing"
> **Buyer:** *"Just looking right now."*
> **DealThreads:** Fair enough — no pitch. If it's useful, I can send a one-page breakdown of how DealThreads replaces the form and what your reps would see. Want it, or shall I leave you to it?

*(If yes → capture email only, tag `low-intent / nurture`, no rep routing. If no → close gracefully: "Understood. The thread's here whenever you want to pick it up." Never trap the buyer.)*

### Branch — wrong fit (SMB / consumer / out of ICP)
> **DealThreads:** Honestly, we're built for mid-market B2B teams running larger deals — you might not need this much machinery yet. I'll point you to a lighter setup instead of selling you something oversized.

*(Disqualifies honestly — the Substantiated/Plainspoken personality. Routes to a resource, not a rep.)*

### Branch — buyer asks "is this AI / a bot?"
> **DealThreads:** It is — but the point isn't the bot, it's what the rep opens afterward. Instead of a name and an email, they get your full situation in one thread, so the first call doesn't waste your time. Want to keep going, or would you rather just book a slot directly?

*(Never defensive, never leads with "AI" unprompted; reframes to the outcome. Offers the human exit immediately.)*

### Fallback — buyer stalls / one-word answers
*(After a non-answer, offer 3 plainspoken chips instead of free text:)*
> **DealThreads:** No problem — pick whichever's closest: ▢ Replacing our contact form ▢ Leads go cold before we call ▢ Just comparing options

### Micro-copy
- **Launcher label (hover):** Talk to DealThreads
- **Input placeholder:** Type your answer…
- **Send affordance:** ↳ (Signal Teal)
- **Privacy line (always visible, small):** We enrich from public business signals and cite every source. [What we collect]
- **Typing indicator:** a thin even pulse (not a bouncing ellipsis)
- **Reduced-motion:** thread nodes fade in instead of drawing

---

*Both surfaces hold the line: the thread you don't want to lose is the buyer's context, and the form is the thing that keeps cutting it.*
