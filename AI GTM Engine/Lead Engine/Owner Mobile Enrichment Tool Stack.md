# Owner Mobile Enrichment Tool Stack — Local Sprint

## Boundary
Ryan wants fast leads from the 450 postcard businesses. The fastest route may be owner direct/mobile numbers, but mass-blasting unsolicited personal SMS is high-risk and not the recommended workflow.

Use this document for owner/direct number enrichment and call-first outreach. SMS should be manual, 1:1, contextual, and opt-out friendly.

## Recommended Tool Stack

### Tier 1 — Start Here

#### 1. Lead411
Best likely fit for SMB owner direct dials/mobile numbers.

Why:
- sales contact database
- direct dials/mobile numbers
- easier than building Clay waterfalls
- less enterprise-heavy than ZoomInfo

Use for:
- owner/founder/president/GM lookups
- direct dial enrichment
- batch CSV upload if plan allows

#### 2. RocketReach
Good backup for finding owner emails/direct numbers when company/domain/name are known.

Use for:
- individual lookups
- smaller verified batches
- owner name + company matching

#### 3. FullEnrich
Waterfall enrichment across many B2B data sources.

Why:
- instead of choosing one vendor, it checks multiple sources
- useful when Apollo is not available
- can return emails and phone/direct numbers depending on source coverage

Use for:
- batch enrichment of top 50-100 after dedupe

### Tier 2 — If Budget Allows

#### 4. ZoomInfo
Strong but usually expensive/enterprise. Good for direct dials but probably overkill for this 30-day sprint.

#### 5. Seamless.ai
Can work for phone/direct dials, quality varies. Worth trialing if they offer quick self-serve.

#### 6. Cognism
Good mobile coverage/compliance positioning, but likely too expensive/enterprise for immediate sprint.

### Tier 3 — Manual/Local Public Sources
Use for top prospects only:
- company website / team page
- LinkedIn
- Facebook page
- South Carolina Secretary of State business search
- chamber directories
- BBB/trade directories
- reviews where owner signs replies

## Workflow

### Step 1: Start with Top 100 Dial List
File:
`AI GTM Engine/Lead Engine/Outputs/Local_Google_Calls_Sprint_Top_100_Dial_List.csv`

### Step 2: Create Enrichment Input CSV
Columns:
- company_name
- company_domain
- company_website
- city
- state
- known_contact_name
- known_contact_title
- company_phone
- email
- linkedin

### Step 3: Enrich In Batches
Batch order:
1. Top 25
2. Next 75
3. Remaining postcard list only if early results justify it

### Step 4: Validate Outputs
Add:
- owner_name
- owner_title
- owner_mobile
- owner_direct_dial
- source
- confidence
- notes

### Step 5: Call-First Use
Recommended outreach order:
1. Call business number
2. Call owner/direct number if found
3. Leave voicemail
4. Send 1:1 contextual follow-up text/email if appropriate

## Tool Buying Recommendation
If choosing one tool today:
1. Try Lead411 first.
2. If coverage is weak, try RocketReach for individual owner lookups.
3. If batch/waterfall is needed, use FullEnrich.

Do not buy ZoomInfo/Cognism before testing cheaper/self-serve options.

## Success Test
A tool is worth keeping if, on 25 prospects, it gives:
- 10+ plausible owner/decision-maker direct numbers
- 5+ actual connects or callbacks
- 3+ audit requests
- 1+ booked call

If it only produces questionable numbers, cancel and shift back to business-line calling + warm referrals.
