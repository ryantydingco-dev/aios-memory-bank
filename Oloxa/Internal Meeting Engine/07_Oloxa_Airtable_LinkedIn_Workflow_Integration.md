# Oloxa Airtable + LinkedIn Workflow Integration

Created: 2026-06-03

## Current access status

Hermes cannot see the Airtable base yet because `AIRTABLE_API_KEY` is not currently available in this Hermes environment.

Once Ryan provides/sets an Airtable PAT with base access, Hermes can inspect the schema and wire the workflow cleanly.

## Goal

Connect Claude's Airtable-built LinkedIn workflow into the Oloxa internal meeting engine so Ryan + Sway have one source of truth across:

- LinkedIn target discovery
- LinkedIn connection/comment/DM activity
- Smartlead email campaigns
- Sendr proof pages
- AgentMail reply classification
- Salesfinity call tasks
- meetings/opportunities

## Recommended Airtable structure

### Table 1: Leads

Core lead/account records.

Fields:

- Lead ID
- Owner: Ryan / Sway
- First Name
- Last Name
- Title
- Company
- Email
- Phone
- LinkedIn URL
- Website
- Country
- Segment
- Fit Score
- Source
- Source Detail
- LinkedIn Status
- Email Status
- AgentMail Classification
- Salesfinity Status
- Meeting Status
- Opportunity Stage
- Next Action
- Next Action Date
- Notes
- Lesson

### Table 2: LinkedIn Touches

Every LinkedIn interaction.

Fields:

- Lead linked record
- Touch Type: view / connect / accept / comment / DM / reply / follow-up
- Touch Date
- Message Sent
- Reply Received
- Sentiment: positive / neutral / negative / no_reply
- Next Action
- Owner
- Notes

### Table 3: Campaigns

Campaign metadata.

Fields:

- Campaign Name
- Channel: LinkedIn / Smartlead / Salesfinity / Sendr / Mixed
- Segment
- Owner
- Status
- Start Date
- End Date
- Message Angle
- KPI Notes

### Table 4: Signals

Discrete buying/intent signals.

Fields:

- Lead linked record
- Signal Type: LinkedIn engagement / doc workflow pain / hiring / post / reply / page view / email open / call connect
- Signal Detail
- Signal Date
- Score Impact
- Source URL

### Table 5: Meetings / Opportunities

Booked meetings and outcomes.

Fields:

- Lead linked record
- Owner
- Meeting Date
- Meeting Source
- Show / No Show
- Pain Confirmed
- Next Step
- Opportunity Stage
- Close Outcome
- Notes

## Oloxa status mapping

Airtable should support these statuses:

- NEW_LEAD
- SCORED
- ASSIGNED_RYAN
- ASSIGNED_SWAY
- LINKEDIN_VIEWED
- LINKEDIN_CONNECT_SENT
- LINKEDIN_CONNECTED
- LINKEDIN_DM_SENT
- LINKEDIN_REPLIED
- SENDR_PAGE_CREATED
- SMARTLEAD_IMPORTED
- EMAIL_SENT
- REPLIED_POSITIVE
- REPLIED_NEUTRAL
- REPLIED_NEGATIVE
- INFO_SENT
- PHONE_ENRICHED
- SALESFINITY_CALLED
- MEETING_BOOKED
- NO_SHOW
- OPPORTUNITY_CREATED
- CLOSED_WON
- CLOSED_LOST
- NURTURE
- DO_NOT_CONTACT

## Workflow connection logic

### LinkedIn → Airtable

Claude's workflow should write each lead and LinkedIn touch into Airtable.

If a lead replies positively on LinkedIn:

- Leads.Status = LINKEDIN_REPLIED
- Leads.Next Action = Send proof page or book call
- Owner = Ryan/Sway
- Signals record created

### Airtable → Smartlead

When a lead has verified email and is ready for email:

- Status = SMARTLEAD_READY
- Export/import into Smartlead
- Smartlead Campaign field populated

### Smartlead → AgentMail/Airtable

When email replies happen:

- Reply routes to AgentMail
- AgentMail classifies
- Airtable Lead status updated
- Salesfinity task created for hot/warm replies

### Sendr → Airtable

When a Sendr proof page is created:

- Sendr Page URL saved on Lead
- Status = SENDR_PAGE_CREATED

When a page view occurs:

- Signal record created
- Salesfinity task if high fit

### Salesfinity → Airtable

Call disposition updates:

- CALLED_NO_ANSWER
- CONNECTED
- MEETING_BOOKED
- CALLBACK_REQUESTED
- NOT_INTERESTED
- BAD_NUMBER

## Ryan + Sway daily view

Airtable should have two main views:

### Ryan Today

Filter:

- Owner = Ryan
- Next Action Date <= today OR Status in hot statuses
- Not DO_NOT_CONTACT

Sort:

- Fit Score descending
- Hot reply/page view first

### Sway Today

Same filter for Owner = Sway.

## What Hermes needs to connect directly

1. Airtable Personal Access Token with scopes:
   - data.records:read
   - data.records:write
   - schema.bases:read

2. Token access granted to the specific Airtable base.

3. Base ID, or permission for Hermes to list bases.

4. Table names/IDs Claude created.

5. Confirmation of whether Airtable or CSV/Sheet is the source of truth.

## Immediate recommendation

Use Airtable as the source of truth if Claude is already building there.

Hermes should connect once the base exists, inspect schema, then create a sync plan:

- Airtable fields → Oloxa tracker fields
- Airtable views → Ryan/Sway daily work queues
- Airtable statuses → AgentMail/Smartlead/Salesfinity statuses

## One-line principle

Airtable becomes the visible operating dashboard; Hermes becomes the intelligence layer that scores, drafts, classifies, and summarizes across LinkedIn, Smartlead, Sendr, AgentMail, and Salesfinity.
