# Oloxa AgentMail Reply Desk Spec

## Purpose

AgentMail becomes the AI reply desk for Oloxa outbound. It watches Smartlead replies and campaign signals, classifies replies, drafts responses, assigns owner tasks to Ryan/Sway, and creates Salesfinity call tasks.

## Recommended inboxes

- oloxa-replies@[domain]
- oloxa-signals@[domain]
- oloxa-dailybrief@[domain]

If custom domain is not ready, start with AgentMail-provided inboxes.

## Inbound sources

Forward/copy:

- Smartlead replies
- Smartlead campaign notifications
- Sendr page-view notifications
- Salesfinity call notes/callbacks
- Calendar booking confirmations
- Manual notes from Ryan/Sway

## Classification schema

- HOT_REPLY
- SEND_INFO
- BOOKING_REQUEST
- PRICING_QUESTION
- HOW_IT_WORKS
- SECURITY_COMPLIANCE
- CRM_OR_DOC_SYSTEM_OBJECTION
- NOT_INTERESTED
- WRONG_PERSON
- REFERRAL
- OUT_OF_OFFICE
- UNSUBSCRIBE
- NURTURE
- VENDOR_NOISE

## Output object

For every inbound item:

- lead_name
- company_name
- email
- owner: Ryan/Sway
- source_campaign
- classification
- urgency: hot/warm/cold
- pain_signal
- recommended_next_action
- drafted_reply
- salesfinity_call_task: yes/no
- sendr_page_needed: yes/no
- tracker_status_update
- lesson

## Assignment rules

- If lead owner exists, route to owner.
- If no owner, assign based on daily split.
- Hot replies get same-day call tasks.
- Send-info replies get proof page + two time options.
- Security/compliance objections get a careful approved response and call offer.

## Approval rules

- Do not auto-send without Ryan/Sway approval.
- Do not overclaim compliance, accuracy, or integrations.
- Do not say Oloxa replaces humans.
- Do not imply the prospect is disorganized/broken/wasting time.
- Keep tone casual/indirect and outcome-driven.

## Draft reply: send info

Yep — the simplest version is:

Oloxa helps brokers turn messy borrower docs into cleaner lender-ready packages faster. It sorts/renames/files docs, flags what’s missing, and reduces the borrower follow-up loop.

The usual starting point is one deal-flow workflow, not a giant system.

Easier to show than explain — are you open {{time_option_1}} or {{time_option_2}} for a quick 15?

## Draft reply: security/compliance

Totally fair — I’d ask the same thing.

The first conversation would just be to understand the current doc workflow and where the manual follow-up/sorting happens. Anything sensitive would need proper review, permissions, and a controlled rollout.

Worth a quick 15 to see the workflow at a high level?

## Call task triggers

Create Salesfinity task when:

- HOT_REPLY
- SEND_INFO
- BOOKING_REQUEST
- PRICING_QUESTION
- HOW_IT_WORKS
- Sendr page viewed by high-fit lead
- Multiple opens from high-score account
