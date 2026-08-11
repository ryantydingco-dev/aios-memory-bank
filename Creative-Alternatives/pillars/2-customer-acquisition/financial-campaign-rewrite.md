# Financial Campaign Rewrite — diagnosis + new sequence

> 2026-07-05. Campaign 3562938 "Swag — Financial (US)": 675 sent, 3 replies (0.4%) vs Law 1.7% and the 2% benchmark.
> Sequences pulled live from SmartLead today. Nothing here is pushed — Ryan approves, then we load it.

## Diagnosis (why 0.4%)

1. **🚨 No follow-ups are sending — Financial AND Law.** Steps 2–4 exist but are EMPTY in both live campaigns. Camps (10.1%) ran a 3-step sequence — bump + breakup included. AAA's system expects the majority of replies from follow-ups. This is the single biggest fix and it applies to Law too.
2. **Wrong social proof.** The email cites Thermo Fisher (a science company) and Mirman Markovits & Landau (a LAW firm) to financial buyers. In-category proof is what made Camps work (Driftwood/Crestwood/Alvernia). Financial firms need financial names — pull real ones from QuickBooks, or omit names and use "27 years outfitting NY-area firms" until we have them.
3. **Generic "firms" copy.** Never names their world (advisors, wealth management, client appreciation events, closing gifts, FINRA limits). Relevance = the AAA troubleshooting layer after list quality.
4. **Sender/title mismatch.** "Ryan Tydingco, Director of Go-To-Market" reads like a lead-gen agency. FIX (per Ryan, 2026-07-05): keep Ryan as sender, drop the corporate title — sign as "Ryan Tydingco · Creative Alternatives — family-run since 1999". Optional later A/B: Ryan vs Maclaine sender.
5. **List mix suspicion.** 1,714 leads tagged "financial" likely blends advisors/banks/CPAs/insurance. If we can segment, wealth/advisory first (relationship-gift-heavy). If not, the copy below aims at the advisory/wealth center of mass.

## Vertical-fluent angle nobody generic can use

FINRA Rule 3220 caps business gifts at **$100 per person per year** for broker-dealer reps. A vendor who designs *inside* the compliance envelope ("premium under the limit") is speaking their language. Use it in email 2.

## New 3-step sequence (Maclaine voice, mockup-first)

**Step 1 — Day 0**
Subject A: `client gifts at {{company_name}}`
Subject B: `{{company_name}} client appreciation`

> Hi {{first_name}},
>
> We do branded client gifts for financial firms — welcome gifts for new clients, closing gifts, pieces for the client appreciation event, advisor apparel that doesn't look like a giveaway.
>
> Family shop, 27 years. We design in-house, warehouse it, and ship as you need it, so it looks consistent and nobody at the firm is chasing a vendor the week of an event.
>
> I went ahead and mocked up a few {{company_name}} pieces this morning — want me to send them over?
>
> Maclaine Scher
> Creative Alternatives
> creativealternatives.com

**Step 2 — Day 3** (the mockups exist whether they replied or not — send proof of work)
Subject: `those {{company_name}} mockups`

> Hi {{first_name}},
>
> Following up — the {{company_name}} mockups are sitting here and it feels wrong not to show you.
>
> One thing firms like about working with us: we design client gifts to fit inside gift-rule limits (the FINRA $100 cap comes up a lot), so the piece feels premium without creating a compliance conversation.
>
> Want me to send the three we made? Takes one reply.
>
> Maclaine

**Step 3 — Day 7** (breakup + door open, Camps pattern)
Subject: `re: {{company_name}}`

> Hi {{first_name}},
>
> Timing might be off — totally get it.
>
> If gifting or event gear comes up before year-end, the mockups will be in your inbox within the hour. That's kind of our thing.
>
> Door's open.
>
> Maclaine

## Also fix Law (same bug, campaign 3562940)

Add steps 2–3 mirroring the above (swap FINRA line for: "we keep recruiting-season and retreat dates — the gear shows up before the event, or it's 10% off"). Law is at 1.7% on a ONE-SHOT — follow-ups alone should carry it past benchmark.

## Launch checklist

- [ ] Ryan/Kenny: pull 2–3 real financial-firm client names from QuickBooks for step-1 proof (do NOT invent)
- [ ] Ryan approves copy above (edit voice freely — Maclaine should sound like Maclaine)
- [ ] Load steps into SmartLead (I can push via API on approval)
- [ ] Pause sends to obviously-wrong segments if list is mixed (banks/credit unions → later batch)
- [ ] Re-measure at ≥250 sends per variant before judging (AAA rule)
