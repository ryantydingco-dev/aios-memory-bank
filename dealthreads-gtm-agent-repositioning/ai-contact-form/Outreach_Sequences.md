# Outreach Sequences — Dealthreads AI Contact Form

> Two channels, both give-first, both pointing to dealthreads.io. Personalize off the
> buying signal the engine detected (runs-ads / hiring / funded / chat-tool) + the form-test wedge.

---

## The form-test wedge (do this BEFORE you reach out — it's the whole edge)
For every 1:1 target:
1. Fill out their "Request a Demo" form as a real prospect (use a real-looking name + your domain).
2. Note the timestamp. Run `buyer_profile_enricher.py` on their domain → generate their teardown.
3. Track how long their callback takes. That gap IS your opener.
> "I filled out your form Tuesday at 2pm. Here's the full buyer profile your system could've
> built from it automatically — and (as of now) I still haven't heard back. Not a knock — it's
> the exact gap I fix."

---

## CHANNEL A — 1:1 LinkedIn + Loom (top 25 / HOT tier)
The give-first, high-touch motion. One target at a time. Goal: they watch a 2-min Loom of THEIR teardown.

**Step 1 — Connection request (no pitch):**
> "Hey [First] — I build inbound tooling for [vertical] teams. Made a quick teardown of [Company]'s
> contact form, figured I'd send it your way regardless. Mind if I connect?"

**Step 2 — On accept, the give (the Loom):**
> "Appreciate the connect. Here's that teardown — I filled out your demo form and recorded what
> your system *could* know about every lead automatically, before your rep calls back: [Loom link].
> No ask, it's yours. Built it because [signal — e.g., 'saw you're running ads to that form, so every
> lead's expensive']."

**Step 3 — Soft CTA (2-3 days later, if watched/replied):**
> "Glad it was useful. If it'd help, I can wire this to run on every [Company] lead and land in your
> CRM before the callback — I install it free, you only pay once profiles are actually landing.
> Worth 15 min? [dealthreads.io / calendar link]"

**Step 4 — Break-up (5-7 days later):**
> "No worries if the timing's off — the teardown's yours to keep either way. I'll leave it here.
> If inbound ever becomes a priority, you know where I am."

**Signal-based opener swaps (Step 2 last line):**
- runs-ads → "saw you're running paid ads to your demo form — every fumbled lead is money lit on fire"
- hiring-sales → "saw you're hiring an SDR — this makes whoever you hire 10x sharper on day one"
- funded-recent → "congrats on the raise — figured pipeline efficiency is top of mind right now"
- chat-tool → "noticed you run [chat tool] — this is the data layer that should sit behind it"

---

## CHANNEL B — Cold email (long tail / WARM tier · Smartlead + Vantage domains)
Send from a separate domain that forwards to your primary (protect deliverability). 3 steps.

**Email 1 — The teardown (give-first):**
Subject: `your contact form, torn down`
> Hi [First],
>
> I filled out [Company]'s demo form as a test and built the buyer profile your system *could*
> have handed your rep automatically — company, the person, a call-prep brief: [teardown link].
>
> It's yours, no ask. I make contact forms do this on every lead — [signal-based one-liner].
>
> — Ryan, Dealthreads

**Email 2 — The mechanism (3 days later):**
Subject: `re: your contact form, torn down`
> Most [vertical] teams get a name + email off their form, then a rep spends 20 min Googling
> before the callback. I make the full profile build itself the second someone hits submit —
> in your CRM before the call. Same form, nothing changes for your visitor.
>
> Worth seeing it run on your own site? 15 min, I install it free, you pay only when profiles
> are landing: dealthreads.io

**Email 3 — The break-up (4 days later):**
Subject: `closing the loop`
> Last one from me, [First]. The teardown link's still live if useful. If reading your inbound
> buyers ever moves up the list, reply "demo" and I'll show you on [Company]'s actual leads.

**Deliverability rules (per Ryan's setup):**
- Separate sending domains (e.g., trydealthreads.com, getdealthreads.com) forwarding to dealthreads.io
- Warm domains before volume; ZeroBounce the list before load; ≤ ~50/inbox/day to start
- Personalize the {teardown link} + {signal one-liner} per lead — no token = don't send

---

## Routing: which tier gets which channel
| Engine tier | Channel | Why |
|---|---|---|
| HOT (signal ≥2) | Channel A (1:1 Loom) | High intent — earn the meeting with a personal teardown |
| WARM (signal 1) | Channel B (cold email) | Real but lighter signal — scale the teardown via email |
| COOL (qualified, no signal) | Channel B, lower priority | Has the form/fit; nurture until a signal appears |
| SKIP / too big | drop | Not a layup at this price |
