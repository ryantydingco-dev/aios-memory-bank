# Outcome Tracker Schema

## Purpose
Track the full path from lead → touch → reply → meeting → opportunity → revenue so the GTM system compounds.

## Required Fields
```csv
lead_id,date_added,assigned_to,market,segment,company_name,contact_name,title,email,linkedin_url,source_file,primary_signal,signal_evidence,fit_score,behavioral_score,total_score,message_angle,channel,status,last_touch_date,next_follow_up_date,reply_category,objection_tag,meeting_date,meeting_outcome,opportunity_stage,estimated_value,notes,next_action
```

## Status Values
- NOT_STARTED
- READY_FOR_LINKEDIN
- READY_FOR_EMAIL
- SENT_CONNECTION
- SENT_EMAIL
- REPLIED_POSITIVE
- REPLIED_NEUTRAL
- REPLIED_NEGATIVE
- EXAMPLE_SENT
- MEETING_OFFERED
- MEETING_BOOKED
- MEETING_HELD
- OPPORTUNITY_CREATED
- CLOSED_WON
- CLOSED_LOST
- NURTURE
- DISQUALIFIED

## Reply Categories
- INTERESTED
- SEND_INFO
- ALREADY_HAVE_PROCESS
- ADMIN_TEAM
- CUSTOM_FILES
- BORROWER_BOTTLENECK
- SECURITY
- TIMING
- NOT_RELEVANT
- NO_RESPONSE

## Weekly Metrics
- touches by assigned_to
- replies by segment
- positive replies by signal
- meetings booked by signal
- objections by segment
- opportunities created
- closed revenue

## Compounding Rule
Every reply/meeting must update at least one of:
- ICP map
- signal taxonomy
- message library
- objection library
- scoring rubric
- weekly review
