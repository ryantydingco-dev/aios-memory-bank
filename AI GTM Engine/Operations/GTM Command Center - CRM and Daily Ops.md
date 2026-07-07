# GTM Command Center - CRM and Daily Ops

## Purpose
Give Ryan and Sway one foolproof operating system for daily Oloxa execution: leads, tasks, outreach, content, commenting, replies, meetings, and learning.

## Recommendation
Use HubSpot as the source of truth for contacts, companies, deals, tasks, and notes. Use Smartlead only for email sequencing. Use AIOS/Hermes as the strategy, research, and daily briefing layer.

Do not run the system from CSVs alone. CSVs are staging files, not the operating home.

## Recommended Stack

### 1. HubSpot CRM — Source of Truth
Use for:
- contacts
- companies
- lifecycle/status
- owner assignment: Ryan / Sway
- tasks
- notes
- meeting outcomes
- deal/opportunity stages
- daily views

Start with free or Starter. Do not jump to expensive tiers until the process proves it needs them.

### 2. Smartlead — Email Sending Layer
Use for:
- verified qualified email sequences
- campaign sending
- deliverability management
- email reply capture

Do not upload unqualified broad lists.

### 3. LinkedIn — Manual Relationship Layer
Use for:
- connection requests
- DMs
- comments
- Loom follow-ups
- profile research

Keep final posting/messaging human.

### 4. AIOS/Hermes — GTM Brain
Use for:
- lead scoring logic
- daily batch generation
- research cards
- content calendar
- comment suggestions
- weekly GTM review
- system improvements

### 5. Shared Daily Command Board
Can live in HubSpot task views plus optionally Google Sheet/Notion if HubSpot task views feel too clunky.

## HubSpot Objects and Fields

### Contact Properties
Create or use fields:
- assigned_to: Ryan / Sway
- market: US / UK / Canada
- segment: UK commercial finance, US commercial lending, Canada commercial mortgage, etc.
- primary_signal: PAIN / HIRING / CLOSING / VOLUME / COMPLEXITY / SPEED_PROMISE / MOVE
- signal_evidence: short text
- fit_score
- behavioral_score
- total_score
- intent_confidence: HIGH / MEDIUM / LOW
- recommended_channel: LinkedIn / Email / Loom / Call
- next_action_type: LinkedIn DM, LinkedIn comment, Loom, Email, Follow-up, Book call
- outreach_status
- reply_category
- objection_tag
- last_touch_date
- next_follow_up_date
- source_file
- warmed_by_content: yes/no
- content_interaction_url

### Company Properties
- company_segment
- company_size
- market
- website
- lender_panel_or_product_complexity
- document_workflow_clue
- current_priority: Tier 1 / Tier 2 / Watchlist / Disqualified

### Deal Pipeline
Create a simple Oloxa pipeline:
1. Prospect Identified
2. Outreach Started
3. Positive Reply
4. Meeting Booked
5. Meeting Held
6. Opportunity / Workflow Audit
7. Proposal / Implementation Plan
8. Closed Won
9. Closed Lost
10. Nurture

## Daily Task Views
Create saved views or task queues:

### Ryan - Today
Filters:
- assigned_to = Ryan
- next_follow_up_date = today or overdue
- status not Closed/Lost/Disqualified

Group by:
- next_action_type
- primary_signal

### Sway - Today
Same as Ryan, assigned_to = Sway.

### Hot Replies
Filters:
- outreach_status = REPLIED_POSITIVE or Positive Reply
- next_action_type = Book call / Send example / Send Loom

### Needs Follow-Up
Filters:
- next_follow_up_date <= today
- status in Sent / Replied Neutral / Example Sent / Meeting Offered

### Content Warmed Leads
Filters:
- warmed_by_content = yes
- status not closed/disqualified

## Daily Operating Checklist

### Morning — 20 Minutes
1. Open HubSpot Ryan/Sway Today views.
2. Confirm each person has 10 priority actions.
3. Review Hot Replies first.
4. Review daily content/comment tasks.

### Execution Block 1 — Outbound
- Ryan sends 10 LinkedIn/DM/Loom actions.
- Sway sends 10 LinkedIn/email/Loom actions.
- Log every action in HubSpot.

### Execution Block 2 — Inbound
- Publish/queue one LinkedIn post if scheduled.
- Comment on 5–10 target posts.
- Add any useful interactions to HubSpot.

### Execution Block 3 — Replies and Meetings
- Handle replies same day.
- Route positive replies to quick example or 15-min paperwork audit.
- Create/update deals when meetings are booked.

### End of Day — 10 Minutes
Update:
- actions completed
- replies
- meetings booked
- objections
- best learning
- tomorrow’s priority

## Foolproof Daily Scorecard
Track every day:
- Ryan actions completed / target 10
- Sway actions completed / target 10
- LinkedIn comments completed / target 5–10
- Content posted yes/no
- Positive replies
- Meetings booked
- Meetings held
- Objections captured
- Next day batch ready yes/no

## Buying HubSpot Paid?
Recommendation: start with HubSpot Free or Starter, not Professional.

Upgrade only when one of these becomes painful:
- you need task automation/workflows
- you need sequences inside HubSpot instead of Smartlead
- you need reporting dashboards beyond basic views
- you need more advanced permissions/team management
- pipeline is active enough that manual admin is slowing deals

Since Smartlead is already the email sequencing layer, HubSpot paid is mainly useful for CRM discipline, task management, custom properties, and reporting — not mandatory on day one.

## Critical Rule
HubSpot is where Ryan/Sway execute and track. AIOS is where Hermes thinks, plans, reviews, and improves the system.

If a lead is real, it belongs in HubSpot.
If a lesson is durable, it belongs in AIOS.
If an email sequence is ready, it belongs in Smartlead.
