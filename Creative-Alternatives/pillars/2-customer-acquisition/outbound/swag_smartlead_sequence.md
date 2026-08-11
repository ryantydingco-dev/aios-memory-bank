# SmartLead — Swag Handled batch-1 sequence (load-ready)

> 4 emails, plain text, Maclaine's voice. Email 1 opens with a per-lead **`{{salutation}}`** — the personalized 1-to-1 line built from each lead's real research signal (hiring wave / funding / expansion), so the email doesn't read like a blast. Other tokens: `{{first_name}}`, `{{company}}`. Deliverability rule: NO images/links in email 1 — tease the mockup, show it on LinkedIn/page.

## Campaign settings
- Name: `Swag Handled — Corporate` (batch-1 NY/NJ/CT = `swag_cold_email_list.csv`; nationwide wave-1 = `swag_nw_cold_email_list.csv`)
- Leads: the cold-email CSV (has First Name, Company, Email, **Salutation** = the personalized opener)
- Sending: ramp across the 71 warmed inboxes; cap ~20–30/inbox/day; track per-segment.
- Stop on reply: yes → route to Maclaine same day (HubSpot Engaged).

## Email 1 — Day 0
**Subject:** a kit for {{company}}'s new hires

Hi {{first_name}},

{{salutation}} Usually when a team is growing like that, the branded welcome-kit stuff — shirts, bottles, the new-hire box — turns into a last-minute scramble for whoever's closest to it.

That's the part we take off your plate. We've handled branded gear for 27 years — everyone from local firms to teams at Thermo Fisher and Trinity Health — onboarding kits, event gear, client gifts, designed and stored and shipped, with one person you can actually call.

I put together a quick mockup of what a {{company}} welcome kit could look like. Want me to send it over?

Maclaine Scher
Vice President, Creative Alternatives
creativealternatives.com

## Email 2 — Day 4
**Subject:** Re: a kit for {{company}}'s new hires

Hi {{first_name}},

Following up on that mockup for {{company}}.

The reason companies move their swag to us is that it stops being something they manage. We design it, source it, warehouse it, and ship it on demand — so when a new hire starts or an event's coming up, it's already handled. Proofs come back in 24–48 hours, and you've got one contact, not a vendor maze.

Worth a look at the mockup? Happy to send it your way.

Maclaine

## Email 3 — Day 9
**Subject:** how a medical group stopped chasing swag

Hi {{first_name}},

One more then I'll leave it here.

A medical group we work with used to run their employee gear through three vendors and still missed deadlines. We pulled it into one — onboarding kits warehoused and shipped as people start, event gear ready on time, a single point of contact. They haven't had to think about swag since.

If {{company}} has a new-hire wave or an event coming up, that's exactly when this earns its keep. Open to 15 minutes to see if it's a fit?

Maclaine Scher
Vice President, Creative Alternatives

## Email 4 — Day 14 (breakup)
**Subject:** closing your file, {{first_name}}

Hi {{first_name}},

I'll close this out so I'm not cluttering your inbox.

If branded gear for {{company}} ever turns into a headache — onboarding, an event, client gifts — we're the easy button, and that mockup's ready whenever you want it. Just reply and it's yours.

Either way, thanks for the time.

Maclaine

## signal_line generation (per lead, from deep research)
- Hiring (multi-role): `Saw {{company}} is hiring across a few roles — congrats on the growth.`
- Hiring (HR/people): `Saw {{company}} is adding to the team — congrats on the momentum.`
- Funding/raise: `Saw {{company}} recently closed new funding — congrats.`
- Expansion/new office: `Saw {{company}} is expanding — congrats on the growth.`
- Generic (1B / weak signal): `Most {{industry}} teams your size juggle two or three vendors for branded gear — and it still lands on whoever has the least time.`
