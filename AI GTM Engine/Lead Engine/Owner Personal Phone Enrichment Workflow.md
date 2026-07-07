# Owner Personal Phone Enrichment Workflow

## Goal
Find owner/decision-maker direct/mobile numbers for the local Google Calls Sprint so Ryan can reach the person who can say yes quickly.

## Important Guardrail
Personal mobile numbers are powerful but legally/risk sensitive.

Use this workflow for manual, 1:1 founder-led outreach. Do not mass-blast personal cell numbers with automated SMS.

Rules:
- Start with business phone calls when possible.
- Use direct/mobile numbers for highest-fit prospects only.
- Identify yourself clearly.
- Reference the business context/postcard/audit.
- Honor opt-outs immediately.
- Check TCPA/DNC rules before scaling.

## Data We Already Have
Existing Ask Maps lists include:
- company name
- named contact
- title
- email
- LinkedIn
- company phone
- company website
- Google/GBP issues in enriched files

Generated dial list:
`AI GTM Engine/Lead Engine/Outputs/Local_Google_Calls_Sprint_Top_100_Dial_List.csv`

## Fastest Path To Owner Direct Numbers

### 1. Apollo First
Ryan has an Apollo API key in the AIOS environment.

Use Apollo to:
- search company domain + owner/CEO/founder/president/general manager titles
- enrich person by name + domain
- retrieve available phone/mobile fields if plan/credits allow

Best title filters:
- Owner
- Founder
- President
- CEO
- Managing Partner
- General Manager
- Practice Manager
- Office Manager
- Operations Manager

For local businesses, the "owner" may not always be in Apollo. Office manager / GM can still be a decision path.

### 2. AI Arc / Existing Lead Tools
Use AI Arc for owner/contact discovery if Apollo misses.

Search by:
- company name
- domain
- city/state
- owner/founder/manager

### 3. Manual Public Verification
For the top 50:
- company website team/about page
- LinkedIn company employees
- Facebook page owner/admin hints
- Google Business Profile / website schema
- Secretary of State business filings
- local chamber directory
- reviews where owner responds by name
- BBB / Angi / HomeAdvisor / trade directory profiles

### 4. Paid Waterfall If Needed
If Apollo/AI Arc does not cover mobile numbers, use a waterfall provider/tool stack.

Potential tools:
- Apollo direct dials/mobile enrichment
- People Data Labs API
- Clay waterfalls using Apollo/PDL/Datagma/FullEnrich/etc.
- ZoomInfo / Seamless / Lead411 / Cognism if available
- Whitepages/BeenVerified-type tools only if compliant and used manually

The goal is not to buy every possible number. The goal is to enrich the top 50-100 best prospects.

## Owner Number Enrichment Sheet Columns
Add:
- owner_name
- owner_title
- owner_linkedin
- owner_email
- owner_mobile
- mobile_source
- mobile_confidence: high/medium/low
- verified_business_context: yes/no
- permission_to_text: yes/no
- dnc_checked: yes/no
- first_call_date
- first_text_date
- opt_out: yes/no

## Confidence Rules

### High Confidence
- number returned by reputable B2B provider tied to exact person + company
- confirmed on business website/contact page
- owner directly provides number

### Medium Confidence
- number tied to person but company match is indirect
- number appears across multiple public/business profiles

### Low Confidence
- generic people-search result
- number tied to same name but uncertain location/company

Only text high/medium confidence numbers. Call low-confidence numbers only if there is strong context and no automation.

## Recommended Batch Workflow

### Batch 1: Top 25
- Enrich manually/with Apollo
- Create audit notes for each
- Call business line first
- If owner/mobile found, call owner direct
- Text only after call/voicemail or if very clearly business-related

### Batch 2: Next 75
- Apollo/AI Arc bulk enrich
- Use company phone first
- Manual owner mobile only for high-fit prospects

### Batch 3: Remaining Postcard Universe
- Only after message works
- Enrich with waterfall if ROI is proven

## Why Not Enrich All 450 Immediately?
Because enrichment can become the new procrastination cave.

Better:
- enrich 25
- call 25
- measure connect/reply/audit-request rate
- improve script
- then enrich next 75

## Success Metric
The owner-mobile workflow is worth it if it increases:
- owner connect rate
- audit request rate
- booked 15-min calls
- paid sprint closes

If personal numbers increase negative replies/opt-outs, shift back to business phone + warm referral path.
