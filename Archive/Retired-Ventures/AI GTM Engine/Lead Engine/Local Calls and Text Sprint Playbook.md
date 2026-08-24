# Local Calls and Text Sprint Playbook

## Context
Ryan has already sent postcards to ~450 local businesses using the local Google/website model. The next fastest-money move is not more postcards. It is direct follow-up by phone, with compliant/light-touch text only where appropriate.

## Important Compliance Guardrail
Cold calling and texting can trigger TCPA, DNC, state mini-TCPA, carrier spam, and opt-out issues. This playbook is not legal advice.

Practical operating rules:
- Prefer calling listed business numbers first.
- Do not blast cold texts from a mass platform.
- Do not text personal cell numbers scraped from data brokers unless there is a clear business context and opt-out handling.
- If texting, keep it 1:1, identify yourself, reference the postcard/audit, and include an easy opt-out if continuing.
- Honor any "stop", "remove me", or negative response immediately.
- Check DNC/compliance before scaling beyond manual founder-led outreach.

## Strategy
Use the postcard as a warm-ish reason to call.

The call opener is not:
"Do you want marketing?"

The opener is:
"I sent you something specific — wanted to make sure it got to the right person."

This is much less spammy and creates context.

## Primary Channel Priority
1. Call business phone / front desk / listed company number.
2. Ask for owner/manager/marketing decision maker.
3. If not available, ask for best email or if you can send the audit/preview by text/email.
4. Send short follow-up text/email after a real call attempt or permission.
5. Use voicemail every time.

## Owner Phone Enrichment Workflow

### Phase 1: Use Existing Data
Existing ask_maps exports already contain:
- named contact
- title
- email
- LinkedIn
- company phone
- company website
- Google profile signals
- opening line

Start with company phone. Many local businesses route to the owner or manager.

### Phase 2: Manual Verification For Top Prospects
For the top 50 only:
- check website contact/team page
- check Google Business Profile phone
- check LinkedIn contact title
- check Facebook page for owner/manager names
- check Secretary of State business filing for registered agent/owner if needed

### Phase 3: Personal Cell Only If Worth It
Only enrich personal owner cells for high-value prospects where:
- business is a strong fit
- you have a specific audit/mockup
- you can identify the owner confidently
- outreach is 1:1 and respectful

## Dial List
Generated first Top 100 dial-ready list:
`AI GTM Engine/Lead Engine/Outputs/Local_Google_Calls_Sprint_Top_100_Dial_List.csv`

Prioritization favors:
- phone available
- owner/manager titles
- Midlands / Chapin / Columbia / Lexington / Irmo proximity
- strong Ask Maps/GBP gap
- not obvious dumpster-fire reputation issues

## Daily Sprint Targets
For first 7 days:
- 40 dials/day
- 15 voicemails/day minimum
- 10 follow-up emails/texts/day
- 5 audit offers/day
- 2 audits sent/day
- 1 booked conversation/day

If Ryan can only do one block:
- 10:00am-12:00pm ET = primary call block
- 2:00pm-4:00pm ET = secondary call block

## Call Script — Postcard Follow-Up

### Opener
```text
Hey, this is Ryan Tydingco here in Chapin. I sent {{business}} a postcard recently about a quick Google/website audit — did I catch you at a terrible time?
```

If they ask what it is:
```text
Super quick. I was looking at local businesses around South Carolina and noticed {{specific_issue}} for {{business}}.

I put together a short audit showing 3 fixes that could help turn more Google searches into calls.

I’m just trying to get it to the owner or whoever handles marketing. Is that you?
```

### If yes / decision maker
```text
Perfect. The audit is only about 60 seconds. It shows {{specific_issue}} and what I’d fix first.

Want me to text or email it to you?
```

### If gatekeeper
```text
No worries. Who’s usually the best person for Google profile/website stuff — owner, office manager, or marketing person?
```

If they give a name:
```text
Awesome, appreciate it. What’s the best way to send them the quick audit — email or text?
```

### If skeptical
```text
Totally fair. I’m not asking you to buy anything on this call. I just noticed a few easy fixes and figured I’d send the audit over. If it’s useful, great. If not, no worries.
```

### If interested
```text
Great — I’ll send it over. If those fixes look useful, I’m taking on a few local businesses this month for a 30-day Google Calls Sprint. I handle the profile cleanup, review flow, missed-call text-back, and a simple landing page. No long contract.
```

## Voicemail
```text
Hey {{first_name_or_business}}, this is Ryan Tydingco here in Chapin.

I sent {{business}} a postcard recently and also put together a quick 60-second Google/website audit after noticing {{specific_issue}}.

Just trying to get it to the right person. You can call or text me back at {{your_number}}. Again, Ryan Tydingco, {{your_number}}.
```

## Follow-Up Text After Call/Voicemail
Use after a call attempt, not as a mass cold blast.

```text
Hey {{first_name}} — Ryan Tydingco here in Chapin. I just called about the postcard/audit I sent {{business}}.

I noticed {{specific_issue}} and made a quick 60-sec audit with the 3 fixes I’d make first to help turn more Google searches into calls.

Want me to send it over?
```

If continuing conversation, include:
```text
Reply STOP and I won’t follow up.
```

## Follow-Up Email
Subject options:
- Quick audit for {{business}}
- Sent you a postcard — quick follow-up
- 3 Google fixes for {{business}}

```text
Hey {{first_name}},

Ryan here in Chapin. I sent {{business}} a postcard recently and wanted to follow up directly.

I noticed {{specific_issue}} when looking at your Google presence. I made a quick 60-second audit showing the 3 fixes I’d make first to help turn more local searches into calls.

Want me to send it over?

Ryan
```

## If They Ask Price
```text
The audit is free. If you want me to handle the fixes, the 30-day sprint is $497 setup + $497/month. No long contract. Core setup can be live in about 72 hours.
```

If you want less friction:
```text
The audit is free. If it looks useful, I can do the first 30-day sprint for $497 setup, then it’s $497/month only if you want to keep it running.
```

## Tracking Fields
Add these to the dial sheet:
- call_status: not_called / no_answer / voicemail / gatekeeper / connected / not_fit / interested
- decision_maker_confirmed: yes/no
- best_contact_method
- audit_requested: yes/no
- audit_sent_date
- follow_up_date
- meeting_booked: yes/no
- close_status
- objection
- next_action

## Decision Rules
- If no answer after 2 calls + voicemail + email: move to later nurture.
- If gatekeeper gives owner email/text: send audit request message same day.
- If they ask for info: send audit, not a generic deck.
- If they engage: push for 15-minute call within 48 hours.
- If they show price resistance before seeing audit: send audit first.

## The Main KPI
Audit requested rate.

If people are not asking for the audit, the opener/CTA is wrong.
If audits are requested but calls do not book, the audit is weak.
If calls happen but no closes, the offer/price/sales call needs work.
