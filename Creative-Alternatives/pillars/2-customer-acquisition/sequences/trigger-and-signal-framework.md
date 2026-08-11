# Cold Email — Trigger + Signal Framework (Josh Braun)

> The fix for "evergreen and not personalized." Rebuilds the swag cold email around a real **trigger** (a reason to email *now*) and defines what a strong **`{{signal}}`** looks like per vertical. Governs the 9 industry swag campaigns and future cold outreach.

## The principle

A cold email earns a reply when it's **true, specific, and timely**. Evergreen copy fails "timely" and "specific," so it reads like a blast no matter how good the words are. The fix: every send rides a trigger, and the first line (`{{signal}}`) proves you actually noticed something about them.

## The rebuilt framework (email 1)

1. **`{{signal}}`** — one true, specific observation tied to a trigger. This is now the *first line*, not a generic opener.
2. **Poke-the-bear question** — connect that trigger to the swag need, without assuming they have a problem.
3. **One line of value** — the outcome, not a feature list.
4. **Take-away CTA** — a small question plus the mockup ("want to see it?", "bad idea?").

Follow-ups: bump → proof → breakup (Josh Braun). Short, plain, **zero em-dashes**.

## The primary trigger: ACTIVE HIRING (use across every vertical)

Lead with hiring because it's the one trigger that is **findable at scale, always timely, and maps straight to the hottest swag category: onboarding and welcome kits.** Every new hire is a welcome-kit opportunity. It also sidesteps the "corporate doesn't buy swag" risk, because you're not selling "swag," you're solving a specific, dated need (new people starting).

## Trigger map (per vertical)

| Vertical | Primary trigger (why now) | Maps to | Alt / seasonal trigger | Where to find it |
|----------|---------------------------|---------|------------------------|------------------|
| **Law** | Open associate / lateral roles | welcome kits, recruiting swag | OCI + summer-associate season; new office | careers page, LinkedIn Jobs, legal news |
| **Real Estate** | Actively recruiting agents | agent welcome kits | spring/summer selling season; new office | brokerage careers / LinkedIn |
| **Medical** | Clinical hiring; new location | scrubs + staff onboarding | health fair / open-enrollment season | Indeed / careers page |
| **Consulting** | Headcount growth / open roles | distributed onboarding kits | funding; new office | LinkedIn, Apollo growth signal |
| **Architecture & Eng.** | Won project / groundbreaking; hiring | project + site gear, event swag | AIA / trade-show season | firm news, portfolio, event lists |
| **Insurance** | Producer hiring | client gifts, welcome items | sponsorship season; Q4 open enrollment | agency site / LinkedIn |
| **Agencies** | New client win; hiring | client promo, culture gear | new office | agency news / LinkedIn |
| **Financial** | Advisor hiring; AUM milestone | client gifts, seminar kits | year-end gifting; event season | LinkedIn, firm news |
| **Accounting** | Seasonal / staff hiring | client thank-yous, staff kits | post-April thank-yous; busy-season prep | careers page, the calendar |

## What `{{signal}}` is (and what kills it)

`{{signal}}` is **one line that references the trigger and proves it's true for *this* company.** Not flattery, not a paraphrase of their homepage.

**The test:** if the line could be pasted into an email to any other company, it is not a signal. It has to be falsifiable and specific to them.

| Vertical | ✅ Strong `{{signal}}` | ❌ Dead `{{signal}}` |
|----------|----------------------|---------------------|
| **Law** | "Saw {{company_name}} has a couple associate roles open right now." / "With summer associates starting soon…" | "Love the work {{company_name}} does for clients." |
| **Real Estate** | "Saw {{company_name}} is bringing on agents right now." | "Real estate is all about relationships." |
| **Medical** | "Noticed {{company_name}} is hiring clinical staff." / "With your new location opening…" | "Patient care matters." |
| **Consulting** | "Saw {{company_name}} has roles open across a few cities." | "Consulting is a people business." |
| **Arch & Eng.** | "Congrats on the {{project}} win." / "Saw the groundbreaking for {{project}}." | "Great design speaks for itself." |
| **Insurance** | "Saw {{company_name}} is adding producers." | "Insurance is about trust." |
| **Agencies** | "Saw {{company_name}} just picked up {{client}}." | "Branding is everything." |
| **Financial** | "Saw {{company_name}} is bringing on advisors." | "Wealth management is personal." |
| **Accounting** | "Now that the April crunch is behind you…" / "Saw you're hiring for the season." | "Taxes are unavoidable." |

## Worked example — Law (hiring trigger)

**Variant A (hiring) · subj `{{company_name}} new hires`**
> Hi {{first_name}},
> {{signal}}
> When a new associate starts, who puts their welcome kit together?
> Most firms wing it, and it's a small thing that makes a strong first impression. We build branded welcome kits and recruiting swag for firms, designed in house.
> I can mock up what a {{company_name}} kit might look like. Want to see it?
> Ryan

**Variant B (seasonal / OCI) · subj `recruiting season`**
> Hi {{first_name}},
> {{signal}}
> How's {{company_name}} handling recruiting swag this year? The branded stuff for the table, the gifts for the new class.
> We make that for firms so it isn't a last-minute scramble, and I can mock a few options up first.
> Bad idea?
> Ryan

E2 bump / E3 proof / E4 breakup stay as the Josh Braun versions, with the trigger referenced where natural.

## The A/B, redefined

Stop splitting A/B randomly. Make **A = the primary (hiring) trigger** and **B = the vertical/seasonal trigger**, and *segment leads by which trigger is actually true for them* rather than letting SmartLead split at random. A lead with no real trigger gets the soft evergreen version or gets held.

## How to populate `{{signal}}` at scale (the pipeline)

> **BUILT + PROVEN** → `../signal-pipeline/` (README + 5 scripts). Cheap-model (Haiku) + web search, fanned out via a Workflow. **Law run: 1,241 leads → 978 personalized signals (78%) live in SmartLead.** Re-run on any vertical by changing `CAMPAIGN_ID`.

The copy is only as good as this. Order of operations:

1. **Find the trigger per lead.** Hiring is the workhorse: pull open-roles / hiring signals from Apollo, the business-events data source, or a careers-page check. Pull alt triggers (new office, client win, project) from news / LinkedIn where available.
2. **Write the `{{signal}}` line** from that data with AI, held to the quality bar above (kill anything that passes the "could go to anyone" test).
3. **Load `{{signal}}`** into each lead's SmartLead custom field.
4. **Gate the send.** Prioritize leads with a real trigger. No-trigger leads get the evergreen fallback or wait until a trigger appears.

> **Sequencing note:** do NOT relaunch the trigger-led copy until `{{signal}}` is populated. Variant B opens *with* `{{signal}}`, so an empty field sends a blank first line. Pipeline first, then push, then launch.

## Open items
- Confirm which signal source we lean on first (Apollo job postings is the fastest path to the hiring trigger at volume).
- Decide the no-trigger fallback: soft evergreen send, or hold the lead.
- Honesty check: only claim vertical experience CA actually has (see proof note in `swag-industry-campaigns.md`).
