# Swag — Law Recruiting Season (Campaign #3) — cold copy

> **The angle:** fall recruiting is a hard deadline. OCI starts in ~6 weeks; firms are locking
> offer-package gifts, callback swag, and 2027 summer-associate branding RIGHT NOW. Buyer =
> **legal recruiting manager/coordinator/director** — a persona neither Law US nor Law National
> touches. Geos: TX/FL/IL/GA/PA/DC (Law US owns NY/NJ/CT).
>
> **The copy lesson this sequence exists to apply (audit 2026-07-14):** steps 2-3 of the live law
> campaigns get 47-53% opens and ~zero replies because they re-ask instead of escalate. Here every
> follow-up RAISES the stakes: tease → "I already made it" → proof + deadline → close.
> Maclaine's voice. Plain text, no links/images in cold sends. No discount gimmicks. Approved facts
> only: 27 years · 2,700+ organizations · 75,000+ orders · 24-48h proofs · ~2wk production · teams
> at Thermo Fisher and Trinity Health.

## Tokens
`{{first_name}}` · `{{company}}` · `{{signal_line}}` (arm A: real recruiting detail — school visits,
summer class size, a recent "welcome our summer associates" post) · reply-stage only: `{CA_CALENDAR_LINK}`

## Subject bank (step 1 only; follow-ups carry NO subject — SmartLead same-thread replies)
- `{{company}}'s recruiting class`
- `offer kits for {{company}}`
- `{{company}} + OCI season`

*("quick question, {{first_name}}" retired 2026-07-19: the most burned subject in cold email. "should I close your file" retired with it: recognizable breakup template, and it reads like collections to a law-firm inbox.)*

### Email 1 — Day 0 · the tease
**Subject:** {{company}}'s recruiting class

Hi {{first_name}},

{{signal_line}} I put together a quick mockup of what a {{company}} offer-package kit could look like for this fall's class.

With OCI and callbacks around the corner, the branded side (offer boxes, callback gifts, summer program gear) locks in about now. That's the part we handle. We've done this for 27 years, and you'd have one person to actually call when your dates hit.

Want me to send it over?

Maclaine Scher
Vice President, Creative Alternatives
creativealternatives.com

> *~65 words before the signal line resolves; hard cap {{signal_line}} at 12 words in the personalization gate so no rendered send can top 90. Thermo Fisher / Trinity Health swapped for "2,700+ organizations" for this persona: a biotech and a hospital system read as cross-industry blast to a legal recruiting coordinator.*

### Email 2 — Day 4 · the escalation (the step-data fix)
**Subject:** *(none — same-thread reply)*

Hi {{first_name}},

That {{company}} mockup is finished and sitting in my outbox. An offer-package kit with your logo on the pieces recruits actually keep: the notebook they'll use 2L year, a quality tumbler, the tote it all comes in.

Reply "send it" and it's in this thread within the hour, no call needed.

Maclaine

> *E2's "finished and sitting in my outbox" must be TRUE: the batch's mockups get rendered before day 4 (run gate 0 below). That's what makes the escalation work; an invented mockup is a trust-kill the first time someone says "great, attach it."*

### Email 3 — Day 9 · proof + the deadline
**Subject:** *(none — same-thread reply)*

Hi {{first_name}},

Quick timing math: proofs, production, and shipping need about three weeks end to end, and callback season doesn't move. We work backwards from callback dates: proofs in 24 to 48 hours, production in about two weeks, and if your class size changes late, we adjust the run without resetting your timeline.

If the branded side isn't locked yet, I'll send the {{company}} mockup and a timeline built back from your first callback. Worth a look?

Maclaine

### Email 4 — Day 14 · graceful close
**Subject:** *(none — same-thread reply)*

Hi {{first_name}},

I'll take the hint if the timing's off. Just say the word either way.

If recruiting season sneaks up and the gear isn't handled, the mockup's here and we can still hit tight dates. Good luck with this year's class.

Maclaine

## Reply stage (call-first, per house rule)
Any positive reply → same-hour mockup delivery (SOP) → CTA: *"Easiest next step is a quick 10–15 min
call. I'll bring options and pricing for your class size. Grab a time: {CA_CALENDAR_LINK}, or reply
with a day/time and I'll work around you."* (Link auto-omitted until CA_CALENDAR_LINK is set.)

## Run gates (every batch, no exceptions)
0. **Mockup truth gate:** E1 claims a mockup exists and E2 claims it's finished — render the
   batch's mockups (mockup-lead-magnet SOP) before E1 sends, and no batch advances to step 2
   without its mockups done.
1. **Firm short-name gate:** populate {{company}} with a cleaned short name ("Baker Botts", not "Baker Botts L.L.P.") — raw registered names in a subject line read as merge tags.
2. `ca_touch_ledger.py check` — ~6k law contacts already touched by Law US/National; expect real
   suppression on this pull. >30% = tell Ryan.
2. `/spam-word-checker` + `/list-quality-scorecard` (B grade minimum).
3. First batch only: 10-opener personalization approval with Ryan → prompt locks → batches 2-5 flow.
4. DRAFT-only upload into campaign 3582356 → Telegram ping → Ryan clicks Start.

## A/B (per /experiment-design)
Arm A = `{{signal_line}}` personalized (recruiting-specific detail) · Arm B = generic opener (drop the
signal line). 50/50 split, judge on positive replies at day 21, min 250/arm at this size.
