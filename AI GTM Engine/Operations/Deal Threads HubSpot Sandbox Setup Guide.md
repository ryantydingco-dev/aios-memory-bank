# Deal Threads HubSpot Sandbox Setup Guide

Last updated: 2026-06-02  
Purpose: make the CRM proof real before beta clients hand over access.

## Goal

Create a HubSpot sandbox or test portal that shows exactly what Deal Threads will create:

- contact.
- company.
- optional deal.
- custom fields.
- activity note.
- high-priority lead view.
- enrichment review view.
- handoff queue.

## Setup Checklist

### 1. Portal Prep

- Create or open HubSpot sandbox/test portal.
- Confirm admin access.
- Create a test pipeline or use existing sales pipeline.
- Create a `Deal Threads Test Leads` list/view.
- Create one test user as the assigned sales owner.

### 2. Custom Contact Properties

Create or verify:

- `deal_threads_authority_signal`
- `deal_threads_timeline`
- `deal_threads_budget_status`
- `deal_threads_budget_range`
- `deal_threads_business_need`
- `deal_threads_pain_point`
- `deal_threads_icp_score`
- `deal_threads_priority`
- `deal_threads_next_action`
- `deal_threads_source_page`
- `deal_threads_utm_campaign`
- `deal_threads_sync_status`
- `deal_threads_lead_profile_id`
- `deal_threads_conversation_id`
- `deal_threads_last_synced_at`

### 3. Custom Company Properties

Create or verify:

- `deal_threads_employee_range`
- `deal_threads_revenue_range`
- `deal_threads_tech_stack`
- `deal_threads_recent_funding`
- `deal_threads_icp_segment`
- `deal_threads_enrichment_status`
- `deal_threads_enrichment_confidence`

### 4. Lead Views

Create these views:

#### High-Priority Deal Threads Leads

Filters:

- `deal_threads_priority` = high.
- `deal_threads_sync_status` = synced.

Columns:

- name.
- company.
- email.
- owner.
- `deal_threads_business_need`.
- `deal_threads_timeline`.
- `deal_threads_icp_score`.
- `deal_threads_next_action`.
- last activity date.

#### Enrichment Review

Filters:

- `deal_threads_enrichment_status` = low_confidence / manual_review / failed.

Columns:

- company.
- domain.
- `deal_threads_enrichment_confidence`.
- `deal_threads_tech_stack`.
- `deal_threads_next_action`.

#### New Profiles This Week

Filters:

- `deal_threads_last_synced_at` is this week.

Columns:

- contact.
- company.
- priority.
- source page.
- next action.

### 5. Test Records

Create or sync:

1. High-priority founder-led lead.
2. Medium-priority demand gen lead.
3. Low-confidence enrichment lead.
4. Existing contact update.
5. Partner/consultant lead.

### 6. Activity Note Format

Use:

```text
Deal Threads AI Lead Profile

[Contact] from [Company] reached out from [source page].

Business need: [need]
Pain: [pain]
Timeline: [timeline]
Budget signal: [budget]
Authority: [authority]
ICP fit: [score/priority]

Company context:
[employee range, industry, tech stack, signals]

Recommended next action:
[next action]

Unknowns:
[unknowns]

Visitor-provided facts:
[facts]

Enriched facts:
[facts + source/confidence if available]
```

### 7. Demo Script

```text
Here is the normal problem: a form fill creates a thin CRM record.

Deal Threads creates or updates the same contact, but adds a buyer profile your rep can act on.

The important thing is that Deal Threads-owned fields stay separate from your existing CRM fields.

Unknowns stay unknown. Low-confidence enrichment is marked for review.

The rep does not need another dashboard. They open HubSpot and see the pre-call context.
```

## Done Means

- Properties exist.
- Views exist.
- 3-5 test records look clean.
- One note example is demo-ready.
- You can show a prospect the CRM output in under 2 minutes.

