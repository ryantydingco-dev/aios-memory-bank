# Oloxa Internal Meeting Engine — Ryan + Sway Setup Runbook

Created: 2026-06-03

## Mission

Set up a compounding GTM system for Oloxa that helps Ryan and Sway consistently book meetings with commercial finance brokers, debt advisors, and adjacent finance operators.

The system should learn every week from:

- which lead sources produce replies
- which broker segments respond
- which pain language lands
- which objections appear
- which calls book
- which meetings become opportunities

## Core Oloxa positioning

Do not lead with "AI automation." Lead with the expensive bottleneck removed:

Oloxa helps commercial finance brokers turn messy borrower documents into lender-ready packages faster by sorting, renaming, filing, flagging missing docs, and reducing borrower follow-up.

Key proof/claims to use carefully:

- 7+ hours saved per deal
- 97% document classification accuracy
- 0 follow-up emails
- Automates deal paperwork in ~30 days

## Buyer/ICP

Primary:

- commercial finance brokers
- debt advisors
- commercial mortgage brokers
- business finance brokers
- equipment finance brokers
- SBA lending consultants/brokers
- factoring / AR finance brokers

Buyer titles:

- founder
- owner
- managing partner
- principal
- director
- broker owner
- commercial finance broker
- debt advisor

Company size:

- ~1–500 employees
- founder/partner-led preferred

Markets:

- Start US
- Then UK/Canada

## Team routing

Ryan and Sway split outbound ownership:

- Ryan owns 10 outreach-ready leads/day
- Sway owns 10 outreach-ready leads/day
- Tracker must include owner = Ryan or Sway
- Replies should be routed to the owner, but daily brief should summarize both

## Stack roles

- Lead sources: AI Arc, LinkedIn, directories, broker associations, Sendr LinkedIn engagement scraping
- Hermes: scoring, segmentation, copy, learning loop, daily brief
- Smartlead: cold email engine
- Sendr: personalized proof page/video for warm/top accounts
- AgentMail: reply desk + classification + routing to Ryan/Sway
- Salesfinity: same-day call follow-up for positive/warm leads
- Tracker: source of truth

## Lead lifecycle statuses

- NEW_LEAD
- SCORED
- ASSIGNED_RYAN
- ASSIGNED_SWAY
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
- OPPORTUNITY_CREATED
- CLOSED_WON
- CLOSED_LOST
- NURTURE
- DO_NOT_CONTACT

## Daily operating loop

Morning:

1. Pull replies from Smartlead.
2. AgentMail classifies replies and assigns next action.
3. Hermes generates Ryan + Sway daily hot list.
4. Each person gets 10 priority leads + call tasks.

Midday:

1. Ryan/Sway call positive replies and page viewers.
2. Sendr pages sent to warm/send-info replies.
3. Tracker updated.

Evening:

1. Log objections and call notes.
2. Update scoring/copy lessons.
3. Prepare next day’s 20 leads.

## Weekly learning loop

Every Friday answer:

1. Which segment produced positive replies?
2. Which role/title booked meetings?
3. Which message angle landed?
4. Which Sendr page/video got engagement?
5. Which objections appeared?
6. Which call opener booked meetings?
7. Which lead source produced opportunities?
8. What changes next week?

## First 14-day target

Week 1:

- 100–200 highly targeted emails
- 20–50 calls
- 5–10 Sendr proof pages
- 3–7 meetings

Week 2:

- 300–600 emails
- 75–150 calls
- 15–30 Sendr proof pages
- 8–15 meetings

Scale only after bounce/reply quality is clean.
