# AIOS Internal Meeting Engine — Setup Runbook

Created: 2026-06-03

## Mission

Build a compounding internal system that generates consistent meetings week in/week out for AIOS Quickstart and later Oloxa/Dealthreads.

The machine:

Lead sources → scoring/segmentation → Smartlead outbound → Sendr proof assets → AgentMail reply desk → Salesfinity calls → booked meetings → closed installs → learning loop.

## Core principle

Every tool has one job:

- AI Arc / Sendr / LinkedIn: lead source
- Hermes: campaign brain + learning loop
- Smartlead: cold email sending engine
- Sendr: personalized proof page/video layer
- AgentMail: reply/ops inbox for AI routines
- Salesfinity: call-to-meeting engine
- Tracker/HubSpot/CSV: source of truth
- Ryan: final judgment + calls + close

No duplicate sequencers. No tool soup.

## Phase 1: Internal only

Before selling AgentMail/client AI inboxes, use the system for Ryan's own GTM.

### Internal inboxes/routines

1. AIOS Outbound Reply Desk
   - Receives Smartlead replies/notifications.
   - Classifies replies.
   - Drafts approved responses.
   - Creates call tasks.

2. AIOS Daily Money Brief
   - Summarizes hot leads, replies, page views, call tasks, meetings, and objections.

3. AIOS Weekly Learning Loop
   - Reviews segments/copy/calls/closes.
   - Updates scoring rules, scripts, Sendr pages, and Salesfinity battle cards.

## Lead lifecycle statuses

- NEW_LEAD
- SCORED
- SEGMENTED
- SENDR_PAGE_CREATED
- SMARTLEAD_IMPORTED
- EMAIL_SENT
- OPENED
- REPLIED_POSITIVE
- REPLIED_NEUTRAL
- REPLIED_NEGATIVE
- INFO_SENT
- PHONE_ENRICHED
- SALESFINITY_CALLED
- MEETING_BOOKED
- NO_SHOW
- CLOSED_WON
- CLOSED_LOST
- NURTURE
- DO_NOT_CONTACT

## First 14-day targets

Week 1:
- 500–1,000 emails
- 25–50 Sendr proof pages
- 50–100 calls
- 5–10 meetings
- 1–3 closes

Week 2:
- 1,500–2,500 emails
- 50–100 Sendr pages
- 150–250 calls
- 10–20 meetings
- 2–5 closes

## Daily operating loop

Morning:
1. Pull Smartlead replies/opens.
2. Pull Sendr page views.
3. Pull Salesfinity callbacks/call notes.
4. AgentMail/Hermes classifies and produces hot list.

Midday:
1. Ryan calls hot leads in Salesfinity.
2. Reply to positive/neutral replies.
3. Send Sendr proof pages to warm leads.

Afternoon:
1. Run booked workflow audits.
2. Close $1,500 Quickstarts.
3. Update tracker.

Evening:
1. Capture objections.
2. Update message variants/battle cards.

## Weekly learning loop

Every Friday answer:

1. Which lead source produced positive replies?
2. Which segment booked meetings?
3. Which message angle worked?
4. Which Sendr pages got views?
5. Which calls booked?
6. Which objections blocked progress?
7. Which deals closed and why?
8. What changes next week?

## Initial build order

1. Source-of-truth tracker.
2. Smartlead campaign files by segment.
3. Sendr AIOS Quickstart proof template.
4. AgentMail reply desk/routing rules.
5. Salesfinity battle cards/call queues.
6. Daily Money Brief cron/job.
7. Weekly learning report.
