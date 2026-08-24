# AgentMail Internal Reply Desk — Workflow Spec

## Purpose

Use AgentMail as the email inbox layer for the internal AIOS GTM machine. It should help Ryan respond faster, call faster, and learn faster.

## Inboxes to create

Recommended custom-domain style names if available:

- replies@aios-ops.com or replies@agentmail-managed-domain
- signals@aios-ops.com
- dailybrief@aios-ops.com

If custom domain is not ready, start with AgentMail-provided inboxes.

## Inbound sources

Forward/copy these into AgentMail:

- Smartlead positive/neutral replies
- Smartlead notifications if useful
- Sendr page-view notifications
- Salesfinity call notes/callbacks
- Calendar booking confirmations

## Classification schema

Each inbound email should be classified as one of:

- POSITIVE_REPLY
- SEND_INFO
- PRICING_QUESTION
- COMPLIANCE_CONCERN
- MEETING_REQUEST
- REFERRAL
- NEUTRAL_QUESTION
- NOT_INTERESTED
- UNSUBSCRIBE
- OUT_OF_OFFICE
- VENDOR_NOISE
- INTERNAL_NOTE

## Output object

For every relevant inbound item, produce:

- lead_name
- company_name
- email
- source_tool
- classification
- urgency: hot/warm/cold
- recommended_next_action
- drafted_reply
- salesfinity_call_task: yes/no
- reason
- tracker_status_update

## Approval rules

- Never auto-send replies without Ryan approval.
- Never make compliance claims.
- Never request sensitive borrower docs in v1.
- If mortgage/borrower PII appears, flag and do not process deeply until Ryan reviews.
- Always push positive/send-info replies toward a 15-minute workflow audit.

## Draft reply template: send info

Yep — for {{company_name}}, I’d probably start with:

1. {{routine_1}}
2. {{routine_2}}
3. {{routine_3}}

Everything stays approval-only, no auto-sending, and no sensitive borrower files are needed for version one.

Easier to show than explain — are you open {{time_option_1}} or {{time_option_2}} for a quick 15?

## Draft reply template: compliance concern

Totally fair — I would be careful there too.

For version one, I intentionally keep this away from sensitive borrower files. It uses sanitized examples/approved templates to draft briefs and follow-up queues, and your team reviews anything before it goes out.

Worth a quick 15 to see the safe version?

## Salesfinity task trigger

Create a same-day call task when classification is:

- POSITIVE_REPLY
- SEND_INFO
- PRICING_QUESTION
- MEETING_REQUEST
- COMPLIANCE_CONCERN if not negative
- Sendr page viewed by high-score lead
