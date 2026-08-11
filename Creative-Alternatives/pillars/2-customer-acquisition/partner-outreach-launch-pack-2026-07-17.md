# CA Partner Outreach Launch Pack — Smartlead + Sendr + Salesfinity + AI Ark

> Created 2026-07-17. All campaigns remain DRAFT until Ryan reviews the first 10 contacts and messages. Partner recruitment is separate from end-buyer outreach. Existing customers, current partners, competitors, and prior opt-outs must be suppressed before enrollment.

## Campaign goal

Recruit a small first cohort of industry-adjacent partners who can introduce repeat, permissioned merchandise opportunities.

A successful conversion is not a positive reply or a signed partner agreement. It is:

> **One permissioned live client opportunity or one scheduled co-marketing action.**

## Pilot design

| Lane | Smartlead campaign | Partner offer | Pilot list | First launch batch |
|---|---|---|---:|---:|
| Creative agencies | CA Partners — Creative Agencies [DRAFT] | White-Label Merch Desk | 50 | 25 |
| Event planners/producers | CA Partners — Event Planners & Producers [DRAFT] | Planner Merch Concierge | 50 | 25 |
| HR/People advisors | CA Partners — HR & People Advisors [DRAFT] | Employee Moment Merch Partner | 50 | 25 |

Pull 50 per lane through AI Ark but launch only the best 25 after scoring and review. Keep the remaining 25 as the comparison/nurture pool.

## Shared targeting rules

Include:

- Owner, founder, principal, president, managing director, partner, or relevant senior practice lead.
- Firms where one relationship can create multiple end-client opportunities.
- US organizations in the pilot geographies from `config/ca_outbound.yaml`.
- Active website and credible evidence of the target service.
- People with authority to choose a delivery/referral partner.

Exclude:

- Promotional-products distributors, branded-merchandise vendors, screen printers, embroidery companies, apparel decorators, and direct competitors.
- Current CA customers and any known current partner unless routed to a warm conversation.
- Prior unsubscribes, do-not-contact records, bounced emails, and Salesfinity do-not-call records.
- Freelancers with no recurring client base.
- Wedding, bridal, party, and consumer-social planners.
- Internal recruiters when targeting independent People advisors.
- Generic info@/hello@ addresses when a named decision-maker can be found.

## Lead schema

Required before Smartlead upload:

- `email`
- `first_name`
- `last_name`
- `company_name`
- `company_domain`
- `title`
- `linkedin_url`
- `partner_lane`
- `partner_offer`
- `client_trigger`
- `situation_line`
- `value_line`
- `cta_line`
- `fit_score`
- `fit_reason`
- `relationship_state`
- `suppression_checked`

Required before Salesfinity:

- All above fields
- `mobile_phone`
- `mobile_source`
- `mobile_verified_at`
- `email_engagement_tier`
- `do_not_call_checked`

## Personalization standard

The opener must identify a concrete reason the partnership model fits their business. Examples:

- Agency: a visible client roster, launch/event practice, experiential work, or brand strategy capability.
- Planner: corporate events, conferences, retreats, nonprofit galas, association meetings, or experiential production.
- People advisor: onboarding, employee experience, retention, recognition, culture, employer brand, benefits, or HR operations.

Do not congratulate generic website claims. Do not fabricate a client, event, employee count, budget, or capability.

A passing `situation_line`:

- Is one sentence.
- References a verifiable fact.
- Explains why CA sees overlap.
- Does not pretend the sender has followed the company for years.
- Contains no link.

---

# Smartlead

## Campaign settings

- Status: DRAFT until Ryan approves.
- Sending window: Monday–Friday, 9:00am–5:00pm prospect local time.
- Stop on reply: ON.
- Plain text: ON.
- Open tracking: use only if current CA deliverability policy allows it.
- Link tracking: OFF in Emails 1–3. Add a resource only after reply or in a controlled fourth-email test.
- New leads: 25/day campaign-wide during the pilot.
- Sender identities: Ryan for agency/partner language; Maclaine may test event planners after first 25.
- Existing-customer and competitor suppression: required.
- Positive reply routing: same-business-day human response and HubSpot partner record.

## Lane 1 — Creative agencies

### Email 1 — Day 0

**Subject options:**

- a merch back end for {{company}}
- when clients ask for merch
- physical brand work

Hi {{first_name}},

{{situation_line}}

Quick reason for reaching out: agencies get asked for apparel, launch kits, event gear, and client gifts, but sourcing and production can turn into a second job.

We're Creative Alternatives — for 27 years we've been the merch operation behind US Squash's national events, the Yale Club of New York, and 100+ camps and clubs across the Northeast. We're opening that same back end to a small number of agencies: curated options, quotes, proofs, production, and delivery, behind your brand. Your team keeps the client relationship and can use a referral or reseller model.

Would it be useful to compare notes on the types of requests you currently turn down or outsource?

Ryan
Creative Alternatives

### Email 2 — Day 4

**Subject:** Re: when clients ask for merch

Hi {{first_name}},

The model is intentionally simple: you send one real client brief, we return a short product direction and production path, and you decide whether CA is visible or stays behind your brand.

No generic referral swap and no expectation to move existing work. I would rather test one odd or annoying request and see whether we make your team look better.

Anything like that crossing your desk this quarter?

Ryan

### Email 3 — Day 9

**Subject:** what we would handle

Hi {{first_name}},

For clarity, the useful part is not another product catalog. We handle the work between the brief and delivery: narrowing the options, checking decoration details, coordinating proofs, and staying on top of production.

If a client asks for merchandise and your team wants to keep the relationship, we can stay in the background.

Worth a short fit conversation, or should I close this out?

Ryan

### Email 4 — Day 15

**Subject:** close the loop?

Hi {{first_name}},

Last note from me. If a client ever asks for launch kits, event merchandise, apparel, gifts, or a company store and your team would rather not become the production department, send me the messy brief.

If that overlap is not part of {{company}}'s work, no problem and I will leave it here.

Ryan

## Lane 2 — Event planners and producers

### Email 1 — Day 0

**Subject options:**

- one less vendor for {{company}}
- your event merch back end
- when the date cannot move

Hi {{first_name}},

{{situation_line}}

You already own the date, audience, venue, and client relationship. We can own the merchandise line of the run-of-show: attendee items, staff apparel, speaker gifts, proofs, production, and delivery coordination.

We're Creative Alternatives — we run the on-site merch stores at US Squash's national championships (the Junior Open, the British Open, High School Nationals) and have hit hard event dates for 27 years, from the Yale Club of New York to 100+ camps. For planner partners we stay behind the scenes, and you choose a referral or reseller model.

Would testing one upcoming event brief be useful?

Ryan
Creative Alternatives

### Email 2 — Day 4

**Subject:** Re: your event merch back end

Hi {{first_name}},

The reason I thought this could fit: event merchandise is rarely hard because of the logo. It is hard because the proof, quantity, venue, freight, and in-hands date all have to agree.

Send us the date, ZIP, quantity, budget, and artwork status. A real person works backward and recommends viable options instead of handing you a catalog.

Any event on the calendar where the merch piece is still open?

Ryan

### Email 3 — Day 9

**Subject:** planner-only test

Hi {{first_name}},

We are opening a small partner pilot for planners and producers. The test is one real project, no long agreement: CA handles the merchandise work and you keep the client relationship.

If it is useful, we can then document whether referral, reseller, or partner credit makes the most sense.

Want to try it on one upcoming event?

Ryan

### Email 4 — Day 15

**Subject:** should I close this out?

Hi {{first_name}},

I will stop after this. If an event deadline gets tight or a client asks for a kit, gifts, staff apparel, or giveaways, you can send us the brief and we will tell you what is actually feasible.

If that is not relevant to {{company}}, no worries.

Ryan

## Lane 3 — HR and People advisors

### Email 1 — Day 0

**Subject options:**

- a client benefit for {{company}}
- when clients ask about onboarding kits
- employee moments, handled

Hi {{first_name}},

{{situation_line}}

People advisors often see the moment before anyone searches for a merchandise vendor: a hiring wave, new office, recognition program, retreat, or holiday plan.

We're Creative Alternatives — 27 years of branded gear for organizations from the Yale Club of New York to law firms, Legal Services offices, and hospitals like Holyoke Medical Center. We can be the execution layer behind those moments: we curate the products, guide the proof, and coordinate production and delivery, while you keep the advisory relationship. The incentive can be a referral share, partner merchandise credit, or a benefit passed to the client.

Would it be useful to test this with one client need rather than talk about a broad partnership?

Ryan
Creative Alternatives

### Email 2 — Day 4

**Subject:** Re: employee moments, handled

Hi {{first_name}},

The most common fit is not “swag for swag's sake.” It is helping a client operationalize something already happening: onboarding, recognition, an offsite, distributed gifting, or a company-store question.

We would handle the merchandise details and keep you informed without inserting ourselves into unrelated client work.

Does that ever come up in your client conversations?

Ryan

### Email 3 — Day 9

**Subject:** cash, credit, or client benefit

Hi {{first_name}},

One thing we are designing around: some advisors can accept referral compensation, some prefer merchandise credit, and others would rather pass a benefit to the client.

We can structure the pilot around the model your business is comfortable with, after the economics and terms are approved.

Worth fifteen minutes to see if there is real overlap?

Ryan

### Email 4 — Day 15

**Subject:** leave this with you

Hi {{first_name}},

Last note. If a client asks about new-hire kits, recognition gifts, team apparel, an offsite, or a store, feel free to send the rough request. We will tell you whether we are a fit and protect the relationship either way.

Ryan

## Smartlead positive-reply handler

Hi {{first_name}},

Great. I am not looking to make this heavier than it needs to be.

Could we spend 15 minutes on three things: when clients ask you for merchandise, whether you want to stay client-facing, and one real request we could use as a pilot?

Here are a couple of times: [INSERT OPTIONS OR CALENDAR LINK]

Ryan

---

# Sendr

## Campaign structure

Create three DRAFT campaigns:

- CA Partners · Creative Agencies
- CA Partners · Event Planners
- CA Partners · People Advisors

Sequence:

1. View profile.
2. Wait 1 day.
3. Send connection request.
4. Recheck acceptance every 4 days for up to 16 days.
5. After acceptance, wait 2 days.
6. Send partner-specific page or one-page overview.
7. Wait 4 days.
8. Send one final follow-up.
9. Stop on reply.

Cap:

- 10–15 connection requests/day/account during pilot.
- Weekdays, normal business hours.
- Sendr is the only LinkedIn automation on the account.

## Creative agency connection

Hi {{first_name}} — saw the work {{company}} does around {{verified_specialty}}. We handle the physical merchandise/production side for teams and thought there might be some useful overlap. Glad to connect.

## Creative agency DM

Thanks for connecting, {{first_name}}. The simple version: we've been the merch operation behind US Squash's national events and 100+ Northeast camps and clubs for 27 years — and when an agency client asks for launch kits, apparel, gifts, or event merchandise, we can run the sourcing, quote, proof, and delivery behind the scenes while the agency keeps the relationship. I put the model on one page here: {{partner_page_url}}. Curious whether those requests ever land on your team.

## Creative agency final follow-up

No pressure on a formal partnership. If one odd merch request crosses your desk, send the messy brief and let us prove whether the model is useful.

## Event planner connection

Hi {{first_name}} — saw {{verified_event_focus}} is a big part of {{company}}'s work. We are on the branded-merchandise and event-kit side. Thought it made sense to connect.

## Event planner DM

Thanks, {{first_name}}. We run the on-site stores at US Squash's national championships, and we help planners take the merchandise line off the run-of-show: product direction, proofs, attendee/staff items, and delivery planning around the in-hands date. We can stay behind the planner's brand. Short overview here: {{partner_page_url}}. Any upcoming event where that piece is still open?

## Event planner final follow-up

If a deadline gets weird later, send the date, ZIP, quantity, and logo status. We will tell you what is actually possible instead of forcing a catalog on you.

## People advisor connection

Hi {{first_name}} — your work around {{verified_people_specialty}} caught my eye. We help execute the physical side of employee moments: onboarding kits, recognition, events, and company merchandise. Glad to connect.

## People advisor DM

Thanks, {{first_name}}. People advisors usually see the trigger before a merch vendor does. We can handle the products, proofs, and delivery while you keep the client relationship. The pilot can use referral share, partner credit, or a client benefit depending on what fits. Overview: {{partner_page_url}}. Does this ever come up with your clients?

## People advisor final follow-up

Happy to leave it here. If one client asks about kits, gifts, apparel, or a store, send the rough request and we can test the model on something real.

## Sendr page requirements

Do not build end-client mockups before a partner shows interest. Partner recruitment pages should be reusable by lane and include:

- The client requests CA handles.
- What the partner keeps.
- What CA handles.
- Disclosed versus white-label options.
- Referral, reseller, credit, or client-benefit models marked “subject to approved terms.”
- No-poach/account-ownership promise.
- One short process graphic.
- One pilot CTA: **Bring One Live Request.**

---

# Salesfinity

## Queue eligibility

A partner prospect enters Salesfinity only after at least one of:

- Positive or ambiguous email reply.
- Email click or repeated opens under the current engagement policy.
- Accepted LinkedIn connection plus page view/message engagement.
- Warm introduction.
- Existing relationship or event conversation.

Do not bulk-reveal mobiles for the full partner list. Reveal Tier-1 partner prospects only after identity verification and cost review.

## Partner call opener

Hi, is this {{first_name}}?

Hey {{first_name}}, Ryan from Creative Alternatives. This is a cold call, but it is not really a pitch for you to buy merchandise. I think we may be useful behind the scenes when your clients ask for it. Can I take thirty seconds and you tell me if that is completely wrong?

## Creative agency reason

You build the brand and campaigns. We handle the physical merchandise part that can become a production headache: narrowing products, quoting, proofs, and delivery. The agency keeps the client and can use referral or reseller economics.

**Question:** When clients ask for merchandise now, do you handle it, refer it, or try to avoid it?

## Event planner reason

You already own the event and client. We can own the merchandise line: attendee items, staff apparel, gifts, proofing, and delivery coordination around the date.

**Question:** Is merch usually handled by your team, the client, or a different vendor every event?

## People advisor reason

You tend to see hiring, onboarding, recognition, and offsites before anyone looks for a merchandise vendor. We can execute the physical program without stepping into the advisory relationship.

**Question:** Do clients ever ask you who can handle kits, gifts, apparel, or a company store?

## Branches

### “Yes, that comes up”

That is exactly the fit. I do not want to sell a theoretical partnership. Let us take one real request, document who owns the client and how the economics work, and see if we make you look good. Do you have anything active, or should we set fifteen minutes to map the next likely one?

### “We already have a vendor”

Makes sense. I am not asking you to replace a relationship that works. Where we may help is overflow, an unusual product, a tight deadline, or a client that needs more hands-on curation. Would it be useful to keep CA as the second-call option?

### “How do we get paid?”

We are testing three approved structures: a share of collected gross profit on a referred order, wholesale/reseller pricing, or merchandise/client credit. We choose the model before any introduction and put account ownership in writing.

### “I do not take referral fees”

No problem. We can pass an approved benefit to the client or do co-marketing instead. The important part is whether your clients need the execution help.

### “Send information”

I will send a one-page overview for your lane. Before I do, which matters more in your world: staying client-facing, deadline reliability, or having product ideas ready for the pitch?

### “Not interested”

Understood. Is that because merchandise never comes up, or because you already have it covered? I will note it correctly and stop there.

### “Do not call”

Absolutely. I will suppress you across phone, email, and LinkedIn today.

## Dispositions

- `partner-fit-call-booked`
- `live-opportunity-registered`
- `send-partner-overview`
- `existing-vendor-second-call`
- `co-marketing-interest`
- `not-a-fit`
- `callback-set`
- `referred-to-partner-owner`
- `do-not-call`
- `no-answer-vm`

## Voicemail

Hi {{first_name}}, Ryan at Creative Alternatives. I am calling about a behind-the-scenes merchandise partnership, not asking {{company}} to buy swag. When a client asks for apparel, event merchandise, gifts, or kits, we can handle the sourcing and production while you keep the relationship. I will send a short email too. I am at [CALLBACK NUMBER].

---

# AI Ark pull runbook

## Credit rules

1. Use AI Ark `people_search` first to validate population and exact filter enums.
2. Pull a maximum of 50 contacts per lane for the first pilot.
3. One decision-maker per domain unless the first contact is clearly wrong.
4. Use named business emails only.
5. Do not reveal mobile numbers during the initial pull.
6. Suppress competitors and current CA relationships before paid mobile enrichment.
7. Mobile reveal only for Tier-1 engaged partner prospects.

## Pull 1 — Creative agencies

Use the `partner_agencies` filters in `config/ca_outbound.yaml`.

Selection priority:

1. Founder/owner/principal of a 2–50 person branding, marketing, PR, experiential, or creative agency.
2. Managing director/president of a 2–100 person agency.
3. Senior client-services/account leader only where partner selection appears within their authority.

Domain proof to capture:

- Client-service model.
- Brand, campaign, event, experiential, launch, or packaging capability.
- Evidence of recurring B2B clients.
- No in-house promotional-products fulfillment.

## Pull 2 — Event planners and producers

Use `partner_event_agencies`.

Selection priority:

1. Owner/founder of corporate, conference, association, nonprofit gala, retreat, or experiential event firm.
2. Executive producer/managing director.
3. Director of events at a small independent production agency.

Exclude weddings, parties, social-only events, venue-only salespeople, and internal corporate event buyers for this partner campaign.

Domain proof:

- Corporate/conference/association/nonprofit event work.
- Repeated events or recognizable event portfolio.
- Evidence they coordinate vendors and client budgets.

## Pull 3 — HR and People advisors

Use `partner_people_advisors`.

Selection priority:

1. Founder/partner/principal of HR consulting, People Ops, employer-brand, PEO, benefits, culture, or employee-experience firm.
2. Benefits/HR consultant with a recurring client book.
3. Senior practice lead with client ownership.

Exclude internal recruiters, staffing sourcers without advisory scope, and firms focused only on payroll software resale.

Domain proof:

- Advises multiple clients.
- Works on onboarding, culture, recognition, retention, benefits, employee experience, or HR operations.
- Has a reason to encounter physical employee-program needs.

## AI Ark output mapping

Map AI Ark output to:

```json
{
  "email": "",
  "first_name": "",
  "last_name": "",
  "company_name": "",
  "company_domain": "",
  "title": "",
  "linkedin_url": "",
  "partner_lane": "",
  "partner_offer": "",
  "summary": "",
  "relationship_state": "cold-never",
  "suppression_checked": false
}
```

After pull:

1. Deduplicate by normalized domain.
2. Remove direct competitors.
3. Check current-customer/relationship suppression.
4. Crawl sites with `scripts/ca_outbound_prep.py crawl`.
5. Create `situation_line`, `value_line`, and `cta_line`.
6. Score 0–16 with the partner qualification model.
7. Review the top 25 per lane manually.
8. Assemble Smartlead CSV.
9. Build DRAFT campaign only.
10. Add the same reviewed contacts to lane-specific Sendr DRAFT campaigns.
11. Build Salesfinity queue later from engaged Tier-1 contacts only.

## Pilot file layout

```text
outputs/partnerships/outreach-2026-07-17/
  partner-agencies/
    raw-ai-ark.json
    enriched.json
    personalized.json
    smartlead-leads.csv
    sendr-leads.csv
  partner-event-agencies/
    raw-ai-ark.json
    enriched.json
    personalized.json
    smartlead-leads.csv
    sendr-leads.csv
  partner-people-advisors/
    raw-ai-ark.json
    enriched.json
    personalized.json
    smartlead-leads.csv
    sendr-leads.csv
  suppression-report.md
  launch-checklist.md
```

## Launch gates

- First 10 leads in every lane manually checked.
- Company and title fit correct.
- No direct competitors.
- No existing customers accidentally treated as cold partners.
- Personalization source verified.
- No fabricated claims.
- Smartlead campaign DRAFT.
- Sendr campaign DRAFT and stop-on-reply enabled.
- Salesfinity has no unengaged bulk list.
- HubSpot partner fields and lead-registration rules ready.
- Incentive language says “approved terms,” not a fixed public promise.
