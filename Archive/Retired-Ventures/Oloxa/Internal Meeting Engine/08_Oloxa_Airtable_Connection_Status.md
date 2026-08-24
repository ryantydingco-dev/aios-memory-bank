# Oloxa Airtable Connection Status

Created: 2026-06-03

## Airtable access

Connected successfully using the provided PAT.

Security note: the PAT was not saved into this file. Rotate it if needed after setup.

## Base discovered

- Base name: Oloxa Exchange , Base C
- Base ID: appd0IQxhenqAqPKe
- Permission: create

## Tables discovered

### Leads

- Table ID: tblNYQw5HZxm7a0Ye
- Uploaded initial CSV here.

Fields observed:

- first_name
- last_name
- rank
- total_score
- fit_score
- behavioral_score
- intent_confidence
- primary_signal_refined
- signal_date
- signal_timeframe
- recency_tier
- signal_date_basis
- confirmed_pain_evidence
- firm_intent_signals
- personalized_opener
- reasoning
- source_url
- enrichment_status
- dedup_note
- title
- company_name
- seniority
- company_size
- industry
- city
- state
- country
- email
- email_status
- email_basis
- email_sub_status
- linkedin_url
- linkedin_provider_id
- company_website
- company_domain
- company_revenue
- icp_tier
- Assignee
- Signal Score
- Handoff Status
- Imported Record ID
- Date Ready

### Funnel Rollup

- Table ID: tblZW0SnQ9dLhmoGW

Fields observed:

- key
- owner
- date
- sourced
- assigned
- contacted
- engaged
- call_booked
- closed
- crs_sent_today
- looms_sent_today
- followups_today
- replies_today
- acceptance_rate

## Upload completed

Uploaded source CSV:

/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/Oloxa_Daily_Top_20_Initial.csv

Result:

- Attempted: 20
- Created: 20
- Updated: 0
- Errors: 0

Merge/upsert key used:

- email

## Current recommendation

Use Airtable as the source of truth for the LinkedIn-first Oloxa workflow Claude is building.

Immediate workflow:

1. Claude/LinkedIn workflow enriches or updates Leads.
2. Ryan/Sway work out of Airtable views by Assignee + Handoff Status.
3. Smartlead import view pulls email-ready leads.
4. AgentMail classifies replies and writes status/classification back to Leads.
5. Salesfinity call outcomes update Leads and Funnel Rollup.
6. Hermes generates daily/weekly summaries from Airtable.

## Suggested next Airtable views

### Ryan Today

Filter:

- Assignee = Ryan
- Handoff Status is READY_FOR_LINKEDIN or NEEDS_RESEARCH or SENDR_READY or CALL_READY

Sort:

- rank ascending
- total_score descending

### Sway Today

Same filter for Assignee = Sway.

### Smartlead Ready

Filter:

- email is not empty
- email_status is verified or imported/unverified if acceptable
- Handoff Status = SMARTLEAD_READY

### Needs Research

Filter:

- Handoff Status = NEEDS_RESEARCH

### Hot Replies

Filter:

- AgentMail Classification in HOT_REPLY / SEND_INFO / BOOKING_REQUEST / PRICING_QUESTION / HOW_IT_WORKS

## Notes

The uploaded CSV had some leads marked READY_FOR_LINKEDIN and some NEEDS_RESEARCH. The workflow should preserve that distinction so Ryan/Sway do not blindly outreach stale/uncertain triggers.
