# HubSpot Sync Status

## Current Status
HubSpot API connection is working using the existing private app token stored in:

`/Users/ryantydingco/Documents/AIOS/dealthread-agents/.env`

Token value is not duplicated in AIOS notes.

## What Was Created In HubSpot

### Custom Contact Properties
Created Oloxa-specific contact fields including:
- `oloxa_assigned_to`
- `oloxa_market`
- `oloxa_segment`
- `oloxa_primary_signal`
- `oloxa_signal_evidence`
- `oloxa_fit_score`
- `oloxa_behavioral_score`
- `oloxa_total_score`
- `oloxa_intent_confidence`
- `oloxa_recommended_channel`
- `oloxa_next_action_type`
- `oloxa_outreach_status`
- `oloxa_reply_category`
- `oloxa_objection_tag`
- `oloxa_last_touch_date`
- `oloxa_next_follow_up_date`
- `oloxa_source_file`
- `oloxa_source_key`
- `oloxa_linkedin_url`
- `oloxa_personalized_opener`
- `oloxa_reasoning`
- `oloxa_warmed_by_content`
- `oloxa_content_interaction_url`

### Custom Company Properties
Created Oloxa-specific company fields including:
- `oloxa_company_segment`
- `oloxa_market`
- `oloxa_lender_product_complexity`
- `oloxa_document_workflow_clue`
- `oloxa_current_priority`

### Initial Data Loaded
Synced the initial Oloxa Top 20 action batch into HubSpot:
- Contacts created: 20
- Companies created: 15
- Companies updated: 5
- Tasks created: 20
- Errors: 0

Source CSV:
`AI GTM Engine/Lead Engine/Outputs/Oloxa_Daily_Top_20_Initial.csv`

## Verified After Sync
HubSpot search confirmed:
- 20 Oloxa contacts with `oloxa_source_file`
- 20 Oloxa tasks with Oloxa in the subject

## Limitation Found
The current HubSpot token can read/create contacts, companies, properties, and tasks. It returned `403 Forbidden` for the Owners endpoint, so the script cannot reliably map Ryan/Sway to HubSpot owner IDs yet.

Current workaround:
- Tasks include `[Ryan]` or `[Sway]` in the task subject.
- Contacts have custom property `oloxa_assigned_to = Ryan/Sway`.

If true owner assignment is needed later, update the HubSpot private app scopes to include owner/user read access, then rerun owner discovery.

## Script
Main sync script:

`AI GTM Engine/Operations/scripts/hubspot_oloxa_sync.py`

Usage:

```bash
set -a; source /Users/ryantydingco/Documents/AIOS/dealthread-agents/.env; set +a
python3 '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Operations/scripts/hubspot_oloxa_sync.py' \
  --csv '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/Oloxa_Daily_Top_20_Initial.csv' \
  --create-tasks
```

Dry run:

```bash
python3 '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Operations/scripts/hubspot_oloxa_sync.py' \
  --csv '/path/to/batch.csv' \
  --create-tasks \
  --dry-run
```

## Recommended HubSpot Views To Create Manually

### Ryan Today
Filters:
- `oloxa_assigned_to = Ryan`
- `oloxa_outreach_status = NOT_STARTED` or task status open

### Sway Today
Filters:
- `oloxa_assigned_to = Sway`
- `oloxa_outreach_status = NOT_STARTED` or task status open

### Hot Replies
Filters:
- `oloxa_outreach_status = REPLIED_POSITIVE`

### Oloxa Tier 1
Filters:
- `oloxa_intent_confidence = HIGH`
- `oloxa_primary_signal` is one of `PAIN`, `HIRING`, `CLOSING`, `VOLUME`

### Content-Warmed Leads
Filters:
- `oloxa_warmed_by_content = yes`

## Next Improvements
1. Create a recurring daily Top 20 generator that writes a HubSpot-ready CSV.
2. Add a daily Telegram summary showing Ryan/Sway tasks in HubSpot.
3. Add HubSpot outcome pull script for weekly GTM review.
4. Add owner assignment once HubSpot owner scope is available.
