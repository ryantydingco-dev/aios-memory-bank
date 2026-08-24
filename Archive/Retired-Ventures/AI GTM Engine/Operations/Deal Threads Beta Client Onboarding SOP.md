# Deal Threads Beta Client Onboarding SOP

Last updated: 2026-06-01  
Owner: Implementation / Customer Success / RevOps  
Status: Beta-ready draft  
Applies to: First 5 managed beta clients

## Purpose

This SOP defines how Deal Threads should onboard beta clients for the AI lead profile chat widget. The goal is to install quickly, collect clean baseline metrics, configure the widget around the client's sales motion, and prove whether AI-built profiles improve speed-to-lead and qualified meeting conversion.

## Beta Success Definition

A beta is successful when:

- Widget is live on approved pages.
- Qualified conversations sync into CRM.
- Sales reps can act from the Deal Threads profile without manual research.
- Client sees measurable improvement in speed-to-lead, qualification quality, or meeting conversion.
- Deal Threads team learns which questions and enrichment fields predict deal quality.

## Ideal Beta Client Profile

- B2B company with 50-500 employees.
- Deal size above $10K annual contract value.
- Uses HubSpot, preferably for MVP.
- Gets meaningful inbound demo, pricing, or contact requests.
- Has a sales team that follows up manually today.
- Has a RevOps, marketing ops, or sales ops owner.
- Willing to share baseline funnel and speed-to-lead metrics.
- Can install a script tag or add through tag manager.

## Pre-Sales Qualification Checklist

Confirm before accepting a beta client:

- CRM provider and admin access path.
- Monthly inbound lead volume.
- Primary inbound conversion pages.
- Current contact form fields.
- Average response time.
- Current MQL-to-SQL or demo conversion rate if available.
- Sales owner or RevOps owner assigned.
- Legal/privacy owner identified if needed.
- Approval to enrich business contact/company data.
- Approval to install third-party script.

## Access Needed

### Required

- Website access through CMS, tag manager, or developer contact.
- HubSpot admin or private app access.
- List of target pages for widget.
- Current form field list.
- CRM field mapping approval.
- Routing owner list or queues.
- Consent/privacy copy approval.

### Recommended

- Slack channel or email alias for lead alerts.
- Historical lead export for baseline.
- ICP definition.
- Sales territory or ownership rules.
- Existing lifecycle stage definitions.
- Example of a good lead and bad lead.

## Kickoff Agenda, 45 Minutes

1. Confirm business goal.
2. Review current contact form workflow.
3. Review speed-to-lead and conversion baseline.
4. Confirm target pages.
5. Confirm lead qualification fields.
6. Confirm CRM field mapping.
7. Confirm routing rules.
8. Confirm consent copy.
9. Agree launch timeline.
10. Agree weekly beta review cadence.

## Baseline Worksheet

Complete before launch.

| Metric | Current Value | Source | Notes |
| --- | --- | --- | --- |
| Monthly demo/contact submissions | TBD | CRM/forms | 30-day average preferred. |
| Form completion rate | TBD | Web analytics | If available. |
| Median speed-to-lead | TBD | CRM | Submission to first touch. |
| Average speed-to-lead | TBD | CRM | Watch for outliers. |
| MQL-to-SQL conversion | TBD | CRM | If lifecycle stages are reliable. |
| Demo booking rate | TBD | CRM/calendar | If available. |
| Closed-won conversion | TBD | CRM | Longer-term. |
| Average manual research time | TBD | Rep estimate | Baseline for time savings. |
| Primary disqualification reasons | TBD | Sales team | Useful for flow tuning. |

## Client Configuration Worksheet

### Company And Brand

- Client name:
- Website:
- Allowed domains:
- Logo URL:
- Primary brand color:
- Widget launcher position:
- Privacy policy URL:

### Target Pages

- Pricing:
- Demo request:
- Contact sales:
- Product/use-case pages:
- Excluded pages:

### Conversation Setup

- Default welcome message:
- Required fields:
- Optional fields:
- Disqualifying patterns:
- Support/customer route language:
- Fallback form recipient:

### ICP Rules

- Target employee range:
- Target industries:
- Excluded industries:
- Target regions:
- Required tech stack:
- Strong buying signals:
- Weak buying signals:
- Disqualifiers:

### Routing Rules

- High-priority owner or queue:
- Medium-priority owner or queue:
- Low-priority owner or queue:
- Existing customer route:
- Support route:
- Partner route:
- Fallback/manual review owner:

### CRM Mapping

- HubSpot portal ID:
- Contact owner rule:
- Lifecycle stage rule:
- Deal creation enabled:
- Pipeline:
- Deal stage:
- Protected fields:
- Deal Threads custom fields approved:

## Implementation Steps

### Step 1: Create Tenant

Owner: Deal Threads implementation operator  
Output: Tenant record with allowed domains.

Checklist:

- Create tenant.
- Add allowed domains.
- Add beta status.
- Add implementation owner.
- Add client contacts.

### Step 2: Configure Widget

Owner: Deal Threads implementation operator  
Output: Published widget config.

Checklist:

- Set brand theme.
- Set launcher text.
- Set welcome message by page type.
- Add consent copy.
- Configure required fields.
- Configure fallback form.
- Publish widget config.
- Save config version.

### Step 3: Configure CRM

Owner: Deal Threads implementation operator plus client CRM admin  
Output: HubSpot connection and field map.

Checklist:

- Create or connect HubSpot private app/OAuth.
- Confirm scopes.
- Create Deal Threads custom properties.
- Configure contact mapping.
- Configure company mapping.
- Configure optional deal mapping.
- Configure activity note format.
- Test contact creation in sandbox or controlled production test.
- Confirm protected fields.

### Step 4: Configure Enrichment

Owner: Deal Threads implementation operator  
Output: Enrichment provider enabled.

Checklist:

- Confirm enrichment provider.
- Configure provider credentials.
- Set confidence threshold.
- Set monthly usage limit if available.
- Test domain enrichment.
- Test no-match behavior.
- Confirm low-confidence fields do not sync as facts.

### Step 5: Configure Routing And Alerts

Owner: Deal Threads implementation operator plus client RevOps  
Output: Routing rules and notification destination.

Checklist:

- Add high-priority route.
- Add medium-priority route.
- Add low-priority route or suppression.
- Add existing customer route.
- Add support route.
- Add manual review route.
- Configure Slack or email notification.
- Test notification payload.

### Step 6: Install Script

Owner: Client web owner or Deal Threads implementation operator  
Output: Widget live on approved pages.

Checklist:

- Add script tag to staging if available.
- Verify allowed origin.
- Verify widget loads.
- Verify page performance impact.
- Verify mobile layout.
- Add script tag to production.
- Confirm widget appears only on approved pages.

Example script placeholder:

```html
<script async src="https://cdn.dealthreads.com/widget.js" data-widget-id="WIDGET_ID" data-tenant-id="TENANT_ID"></script>
```

### Step 7: End-To-End QA

Owner: Deal Threads implementation operator  
Output: Signed launch checklist.

Test cases:

- High-priority demo request.
- Medium-priority research request.
- Low-priority/student/vendor request.
- Existing customer support request.
- Invalid email.
- Personal email with company name.
- Fallback form.
- CRM duplicate contact.
- Enrichment no-match.
- Mobile completion.

Pass criteria:

- Lead profile created.
- Summary accurate.
- HubSpot record created or updated.
- Activity note created.
- Owner or queue assigned.
- Notification sent when expected.
- No protected fields overwritten.

### Step 8: Launch

Owner: Deal Threads implementation operator plus client owner  
Output: Beta live.

Checklist:

- Confirm launch date and time.
- Confirm monitoring owner.
- Confirm rollback process.
- Confirm support channel.
- Confirm weekly review meeting.
- Capture first live lead manually.
- Verify first live CRM sync.

## Rollback Plan

Rollback triggers:

- Widget blocks page load.
- CRM sync creates incorrect data at scale.
- Consent copy is wrong.
- High-priority leads fail to route.
- Error rate exceeds acceptable threshold.

Rollback steps:

1. Disable tenant widget config.
2. Remove script tag or disable tag manager rule if needed.
3. Pause CRM sync jobs.
4. Export affected Deal Threads lead profiles.
5. Review CRM writes and correct if needed.
6. Document issue and fix before relaunch.

## Daily Monitoring During Week 1

Check daily:

- Widget loads.
- Widget opens.
- Conversation starts.
- Completion rate.
- Fallback rate.
- Qualified lead count.
- Enrichment match rate.
- CRM sync failures.
- Routing failures.
- Sales notification delivery.
- Any rep complaints about profile quality.

## Weekly Beta Review Agenda, 30 Minutes

1. Review funnel metrics.
2. Review top 5 lead profiles.
3. Review any bad or confusing conversations.
4. Review CRM sync quality.
5. Review speed-to-lead.
6. Review rep feedback.
7. Decide conversation changes.
8. Decide routing or scoring changes.
9. Confirm next week's experiment.

## Weekly Report Template

```text
Deal Threads Beta Weekly Report

Client:
Week:

Funnel:
- Widget loads:
- Widget opens:
- Conversations started:
- Conversations completed:
- Qualified leads:
- Fallback submissions:

Lead quality:
- Average ICP score:
- High-priority leads:
- Medium-priority leads:
- Low-priority leads:
- Enrichment match rate:
- Manual review count:

Operations:
- CRM sync success rate:
- Sync failures:
- Routing failures:
- Average enrichment time:
- Average conversation completion time:

Sales impact:
- Median speed-to-lead:
- Meetings booked:
- SQLs created:
- Rep feedback:

Recommended changes:
1.
2.
3.
```

## Beta Exit Criteria

Client is ready for paid managed service when:

- Widget has run for at least 2-4 weeks or enough volume to judge.
- CRM sync success is at least 98%.
- Reps confirm profiles reduce manual research.
- Lead quality is equal or better than form submissions.
- Speed-to-lead improves or sales team can act faster.
- Client agrees to target KPI for next paid period.

Client should pause or rework when:

- Conversation completion is below 40%.
- Enrichment is consistently inaccurate.
- CRM data quality concerns persist.
- Sales team does not use the profiles.
- No measurable improvement appears after conversation and routing iteration.

## Roles And Responsibilities

| Role | Responsibilities |
| --- | --- |
| Deal Threads Implementation Operator | Tenant setup, widget config, CRM mapping, QA, launch. |
| Deal Threads Product/AI Owner | Conversation flow, prompt changes, scoring changes. |
| Deal Threads Engineer | Integration issues, sync failures, widget bugs. |
| Client RevOps Owner | CRM access, routing approval, baseline data, field mapping. |
| Client Sales Manager | Rep feedback, lead quality review, speed-to-lead enforcement. |
| Client Web Owner | Script install and page QA. |

## Implementation Timeline

### Fast Path, 3-5 Business Days

Day 1:

- Kickoff.
- Access collection.
- Baseline worksheet.
- Field mapping.

Day 2:

- Tenant setup.
- Widget config.
- CRM property setup.
- Enrichment setup.

Day 3:

- Staging install.
- End-to-end QA.
- Routing and notification test.

Day 4:

- Production install.
- First live lead verification.

Day 5:

- Fixes and first monitoring report.

### Standard Path, 1-2 Weeks

Use when legal, CRM access, web deployment, or routing rules require more review.

## Common Issues And Fixes

| Issue | Likely Cause | Fix |
| --- | --- | --- |
| Widget does not load | Domain not allowlisted or script blocked. | Add domain, check CSP, verify script URL. |
| Leads not syncing | CRM token/scopes/mapping issue. | Check integration health and field validation. |
| Duplicate contacts | Email normalization or dedupe issue. | Verify email matching and stored CRM IDs. |
| Poor completion rate | Flow asks for email too early or too many questions. | Move business question first, reduce required fields. |
| Reps ignore profiles | Summary too long or routing poor. | Tighten CRM note and priority rules. |
| Enrichment noisy | Low confidence threshold or weak provider match. | Raise threshold, mark manual review. |
| Sales alerts too noisy | Priority threshold too low. | Require urgency plus ICP fit for high priority. |

## Beta Client Handoff Packet

Send after launch:

- Widget installed pages.
- CRM fields created.
- Routing rules.
- What reps will see.
- How to report bad profiles.
- Weekly review schedule.
- Success metrics baseline.
- Rollback contact.

