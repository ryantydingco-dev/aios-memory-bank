# Swag Handled — LinkedIn sequence (Sendr), Creative Alternatives

> The complete LinkedIn cadence for the corporate "Swag Handled" machine. Sendr-ready: every step has an action type, a delay, a condition, and the copy. Voice = **Ryan** (the operator reaching out personally — consultative, direct, human). This is Ryan's LinkedIn account, Ryan's video, and Ryan's Calendly. Runs ~16 days, in lockstep with the SmartLead email (Maclaine's voice) + Salesfinity call legs. **LinkedIn owns the relationship channel** — it's where these buyers actually are, and where the mockup gets *shown*.

## Design rules (why it's built this way)
- **No pitch in the connection request.** Relevance only — accept rates die when the ask is in the door-knock.
- **No links until trust exists.** First message is link-free; the page link lands at step 5, after the video.
- **The video DM is the conversion engine.** Showing their logo on a real kit beats any paragraph. It's step 3, right after they accept.
- **Short messages.** 2–4 lines each. LinkedIn rewards brevity; walls of text get ignored.
- **One idea per touch.** Connect → context → show → value → proof+CTA → nudge → breakup.
- **Any reply exits the sequence → routed to Ryan, same day** (HubSpot Engaged). Automation never talks to a warm human.
- **Branch on acceptance.** Not accepted by Day 7 → withdraw + lean on the email leg; don't burn the lead.

## Tokens
`{{first_name}}` · `{{company}}` · `{{industry}}` · `{{signal_line}}` (the research finding, e.g. "Saw {{company}} is hiring across a few roles") · `{{mockup_link}}` · `{{page_link}}` (Sendr personalized page) · `{{calendar_link}}`

---

## The sequence (Sendr steps)

| # | Day | Action | Condition | Purpose |
|---|-----|--------|-----------|---------|
| 0 | 0 | **Profile view** | — | Warm-up — they see Maclaine viewed them before the request |
| 1 | 0 | **Connection request** (+ note) | — | Get in the door on relevance, no pitch |
| 2 | +1 after accept | **Message** | Accepted | Context + tease the mockup |
| 3 | +2 after step 2 | **Message — video DM** | Accepted, no reply | Show their branded kit (the wedge) |
| 4 | +3 after step 3 | **Message** | Accepted, no reply | Value: one vendor, nothing to manage + page link |
| 5 | +3 after step 4 | **Message** | Accepted, no reply | Proof + soft CTA (15 min) |
| 6 | +3 after step 5 | **Message** | Accepted, no reply | Light qualifying nudge |
| 7 | +4 after step 6 | **Message — breakup** | Accepted, no reply | Leave the mockup on file |
| — | Day 7 | **Withdraw request** | NOT accepted | Clean up; email leg carries the lead |

> **Exit on reply at any step.** Sendr: set "stop sequence on reply" → tag `engaged` → HubSpot alert to Ryan.

---

## Copy

### Step 1 — Connection request note (≤300 chars; shorter wins)
> Hi {{first_name}} — I work with a lot of {{industry}} teams around the area on their branded gear and swag. {{company}} came up and I wanted to connect.

**A/B variant — no note** (often a higher accept rate): send the request with no message at all. Run note vs. no-note as the first test once we have volume.

### Step 2 — First message (Day +1 after accept; link-free)
> Thanks for connecting, {{first_name}} — no pitch, promise.
>
> I spend my days helping {{industry}} teams handle their branded swag — onboarding kits, event gear, client gifts — so it's not a last-minute scramble for whoever's closest to it. {{signal_line}}
>
> I actually put together a quick mockup of what a {{company}} welcome kit could look like. Want me to send it over?

### Step 3 — Video DM (Day +2; 20–30 sec, screen-share the mockup)
**Script:**
> Hey {{first_name}}, thanks again for connecting. Quick one — I made a mockup of what a branded onboarding kit for {{company}} could look like. Your logo on the tee, the bottle, the welcome box. *(show the mockup)* This is what we do for companies start to finish — design it, store it, ship it when new folks start, so it's never a scramble. No pitch, I just thought it'd be fun to see {{company}} on it. I'll drop the full mockup and my calendar below.

**Caption sent with the video:**
> Here's the {{company}} kit I mentioned 👆

### Step 4 — Value + page (Day +3; first link)
> Whenever you've got a sec, here's the full {{company}} mockup + a quick rundown: {{page_link}}
>
> The short version — companies move their swag to us so it stops being something they manage. One contact, 24–48hr proofs, everything warehoused and shipped on demand. You stop juggling vendors; we just handle it.

### Step 5 — Proof + CTA (Day +3)
> We've been doing this 27 years — everyone from local firms to teams at Thermo Fisher and Trinity Health. 75,000+ orders, in-house art team.
>
> If {{company}} has a new-hire wave or an event coming up, that's exactly when this earns its keep. Worth 15 minutes to see if it's a fit? {{calendar_link}}

### Step 6 — Qualifying nudge (Day +3)
> Quick one, {{first_name}} — is branded swag something that lands on your plate at {{company}}, or is it someone else's headache? Happy to send the mockup to whoever owns it.

### Step 7 — Breakup (Day +4)
> I'll leave it here so I'm not cluttering your inbox, {{first_name}}.
>
> The {{company}} mockup's on file whenever branded gear turns into a headache — onboarding, an event, client gifts. Just say the word and it's yours. Either way, good luck with the growth.

---

## Personalized page (Sendr) — the destination for steps 3–4
**Headline:** {{company}}'s branded swag, handled.
**Sub:** Here's a mockup we made for your team. Onboarding kits, event gear, client gifts — designed, stored, and shipped by us. One contact, 24–48hr proofs, nothing for you to manage.
*[their mockup image]*
**Three things you get:**
- One vendor for everything — stop juggling.
- Warehoused and shipped on demand — kits go out as new hires start.
- On time, or we make it right.
**Proof:** 27 years · 75,000+ orders · from local firms to Thermo Fisher and Trinity Health.
**Byline:** Ryan Tydingco, Creative Alternatives
**Button:** Schedule a call with Ryan → {{calendar_link}} (Ryan's Calendly)

---

## Conditional logic (Sendr setup)
- **Accepted** → run steps 2–7 on the delays above.
- **Not accepted by Day 7** → withdraw the request (keeps the account clean); the SmartLead email leg continues to carry the lead.
- **Replies at any step** → STOP sequence, tag `engaged`, alert Ryan (HubSpot). Speed-to-lead: respond within hours.
- **Profile-view-only openers** who never accept → re-queue once after 30 days, then drop.

## Notes
- Keep **one experiment at a time** once live: note vs. no-note request (step 1), then video vs. static mockup (step 3).
- The **video is the highest-leverage asset** — batch-record a template and swap the mockup per lead, or personalize the first 3 seconds ("Hey {{first_name}}").
- Pair-timing with email: LinkedIn step 3 (video) should land near email #1's "want the mockup?" so the channels reinforce, not collide.
