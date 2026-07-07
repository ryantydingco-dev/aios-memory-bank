# HubSpot Monday Updates

## Status
Updated via HubSpot API on 2026-05-30.

## What Was Updated

### Initial Oloxa Top 20 Outreach Tasks
Found and updated 20 Oloxa outreach tasks in HubSpot.

Changes:
- Set due date/time to Monday 2026-06-01 9:00 AM ET.
- Set priority to HIGH.
- Set status to NOT_STARTED.

These are the primary Ryan/Sway Monday execution tasks.

### Monday Meta/Ops Tasks Created
Created 4 additional Monday operating tasks:

1. `[Ryan] Oloxa Monday: Publish LinkedIn post — buying signals > job titles`
2. `[Ryan] Oloxa Monday: Comment on 5–10 buyer/industry LinkedIn posts`
3. `[Sway] Oloxa Monday: Complete 10 assigned outreach tasks and log outcomes`
4. `[Ryan] Oloxa Monday: End-of-day scoreboard and Tuesday adjustments`

## HubSpot Account Info
Portal ID: `246275995`
UI domain: `app-na2.hubspot.com`
Timezone: `US/Eastern`

## What Could Not Be Done Automatically
HubSpot saved UI views could not be created automatically from the current API setup.

Reasons:
- Browser session is not logged into HubSpot.
- HubSpot's public CRM APIs can create contacts/companies/tasks/properties, but saved record views are primarily managed in the UI.
- Lists API returned `403` due missing scopes, so dynamic lists could not be created either.
- Owners endpoint also returns `403`, so native owner assignment is still unavailable.

## Current Workaround
Use task subject prefixes and Oloxa fields:
- `[Ryan]` / `[Sway]` task subject prefixes
- `oloxa_assigned_to = Ryan/Sway`
- all Oloxa tasks moved to Monday and marked high priority

This is enough to execute Monday without saved views.

## Recommended Manual View Creation Later
If Ryan logs into HubSpot and wants the cleaner UI:
- Ryan Today: `oloxa_assigned_to = Ryan`
- Sway Today: `oloxa_assigned_to = Sway`
- Hot Replies: `oloxa_outreach_status = REPLIED_POSITIVE`
- Content-Warmed Leads: `oloxa_warmed_by_content = yes`

But Monday can run from tasks/search even without these views.
