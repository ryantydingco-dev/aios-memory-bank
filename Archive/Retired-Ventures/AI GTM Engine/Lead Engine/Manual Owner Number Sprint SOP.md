# Manual Owner Number Sprint SOP

## Goal
Build a fast, manual call/text queue for Ryan's 30-day local revenue sprint without wasting days enriching all 450 postcard businesses.

## Current Asset
Generated queue:
`AI GTM Engine/Lead Engine/Outputs/Manual_Text_Call_Queue_Top_50.csv`

This queue includes:
- top 50 companies from existing Ask Maps/postcard universe
- named decision maker where available
- public/business phone to start
- email/LinkedIn/website
- specific issue from the Google/Ask Maps audit
- ready-to-send manual SMS opener
- follow-up SMS
- call opener
- blank owner_mobile fields for enrichment

## Important Boundary
The fastest usable path is not "private cell at all costs." It is:
1. use public/business phone and existing named contact immediately
2. enrich owner/direct mobile for top prospects only
3. manually text/call with context
4. track replies and audit requests

## Step 1 — Start With Existing Named Decision Makers
Many rows already have strong titles:
- Owner
- Co-Owner
- Company Owner
- General Manager
- Office Manager
- Operations Manager
- Service Manager
- Director of Operations

For these, the existing public/business phone may route directly or close enough.

## Step 2 — Find Owner Mobile/Direct Numbers
For each top prospect, try this order:

### A. Website / Public Sources
- website contact page
- about/team page
- footer phone numbers
- staff directory
- booking/contact forms
- Facebook page
- LinkedIn profile/company page
- Google Business Profile
- review replies signed by owner

### B. Search Queries
Use these searches manually:
- `"{{owner_name}}" "{{company_name}}" phone`
- `"{{owner_name}}" "{{city}}" "{{state}}"`
- `"{{company_name}}" owner phone`
- `"{{company_name}}" "{{owner_name}}"`
- `site:{{domain}} "{{owner_first_name}}"`

### C. Enrichment Tools
If public/manual search is slow, test one tool on 25 prospects:
- Lead411
- RocketReach
- FullEnrich
- Seamless.ai
- Prospeo
- ClearoutPhone for validation

Do not buy a big annual contract. We only need proof from 25-50 prospects first.

## Step 3 — Confidence Tag
For any direct/mobile number found:
- HIGH: exact person + company match from reputable source or public business source
- MEDIUM: exact person, plausible company/location match
- LOW: same name only / uncertain match

Use HIGH/MEDIUM first. Avoid wasting time on LOW.

## Step 4 — Manual Outreach
First text:
```text
Hey {{first_name}} — Ryan Tydingco here in Chapin. I sent {{business}} a postcard recently and made a quick 60-sec Google/website audit after noticing {{specific_issue}}. Worth sending it over?
```

Follow-up after ~24h:
```text
Quick follow-up — no pitch in the audit, just the 3 fixes I’d make first so {{business}} can turn more Google searches into calls. Want me to send it?
```

If positive:
```text
Cool — I can send it here or email it over. Also happy to walk you through it in 2 minutes today. Would later this afternoon or tomorrow morning be easier?
```

## Step 5 — Test Threshold
Do not scale beyond 50 until we know:
- positive reply rate
- audit request rate
- booked call rate
- negative/stop rate

Minimum signal from first 50:
- 2-3 positive replies
- 1-2 audit requests
- 1 booked call

If below that, fix message/offer before texting more.

## Step 6 — Daily Operating Rhythm
- enrich 10-15 owner/direct numbers
- manually text/call 25-50 prospects
- respond to every reply within 5 minutes if possible
- record result in CSV
- create/send audits only for positive replies

## Principle
Manual is fine. Sloppy is not. The winning variable is not the phone number alone — it is owner access + specific audit + tiny CTA + fast follow-up.
