# Deal Threads MVP Prototype Spec

Last updated: 2026-06-01  
Owner: Product / Engineering  
Status: Build-ready draft  
Target: Working beta prototype for first 5 managed clients

## Objective

Build a working MVP that proves Deal Threads can replace a contact form with an AI conversation that captures intent, builds a structured lead profile, enriches company context, scores fit, and syncs the result to HubSpot.

The prototype should be production-intent for beta clients, but deliberately narrow. It should optimize for install speed, learning, and data quality rather than full self-serve customization.

## MVP Scope

### In Scope

- Single script tag widget install.
- Tenant-specific widget configuration.
- Desktop and mobile chat widget.
- AI conversation flow using structured extraction.
- Fallback form.
- Consent disclosure and consent record.
- Lead profile creation.
- Mock enrichment mode for local development.
- One real enrichment provider adapter for beta.
- ICP scoring v1.
- HubSpot sync.
- Routing rule v1.
- High-priority notification by Slack or email.
- Internal operator setup through config file or lightweight admin UI.
- Basic analytics events.
- Operational error logging and alerts.

### Out Of Scope

- Full self-serve onboarding.
- Billing.
- Salesforce production sync.
- Live chat handoff.
- Multi-language support.
- Advanced analytics UI.
- Public customer-facing dashboard.
- Automated outbound campaigns.
- Monthly intelligence reports.
- Complex A/B testing.

## Recommended Build Sequence

1. Local widget shell with mock conversation.
2. Conversation API and structured extraction.
3. Lead profile storage and completion.
4. Mock enrichment and ICP scoring.
5. HubSpot sandbox sync.
6. Real enrichment adapter.
7. Routing and notification.
8. Operator configuration and launch checklist.
9. Beta client install.

## System Components

### Widget Loader

Responsibilities:

- Load asynchronously from Deal Threads CDN or app host.
- Validate allowed origin by requesting widget config.
- Render launcher.
- Initialize anonymous session.
- Isolate styles from customer site.
- Emit analytics events.

Acceptance:

- Does not block page render.
- Works with tag manager or direct script install.
- Can be disabled per tenant or widget.

### Widget UI

Responsibilities:

- Render chat messages.
- Show quick replies.
- Capture text input.
- Show consent disclosure.
- Show fallback form.
- Preserve active session state during same page session.
- Support mobile full-screen layout.

Acceptance:

- User can complete a conversation using keyboard only.
- Input is not covered on mobile.
- Loading and error states are visible.
- Chat works on latest Chrome, Safari, Firefox, and Edge.

### Conversation API

Responsibilities:

- Accept visitor messages.
- Store transcript.
- Call AI orchestration service.
- Return next assistant message.
- Return extracted fields and missing required fields.
- Enforce guardrails and validation.

Acceptance:

- Message response p95 below 3.5 seconds under normal provider behavior.
- Invalid sessions cannot post messages.
- Consent is required before personal data processing.

### AI Orchestration

Responsibilities:

- Apply tenant question policy.
- Ask one question at a time.
- Extract fields into schema.
- Identify completion status.
- Refuse prompt injection and irrelevant requests.
- Generate rep-facing summary.

Acceptance:

- Output validates against schema.
- Unknown fields remain null or unknown.
- Guardrail tests pass.

### Lead Profile Service

Responsibilities:

- Normalize extracted fields.
- Create or update profile.
- Calculate completeness.
- Store consent record.
- Trigger enrichment, scoring, routing, and CRM sync jobs.

Acceptance:

- Completion endpoint creates a valid lead profile.
- Duplicate completion requests do not create duplicate profiles.
- Partial, qualified, low-priority, and fallback profiles are supported.

### Enrichment Service

Responsibilities:

- Queue enrichment jobs.
- Query provider by domain, company name, or email.
- Normalize response.
- Store source and confidence.
- Avoid blocking CRM sync when unavailable.

Acceptance:

- Mock mode works locally.
- Real provider errors are retryable.
- Low-confidence data is not synced as fact.

### ICP Scoring Service

Responsibilities:

- Score firmographic fit.
- Score intent and urgency.
- Score authority and budget.
- Return transparent rationale.
- Assign priority.

Default scoring:

| Factor | Weight |
| --- | --- |
| Company fit | 25 |
| Business pain fit | 25 |
| Timeline / urgency | 20 |
| Budget signal | 15 |
| Authority signal | 10 |
| Integration fit | 5 |

Priority thresholds:

- `high`: 80-100.
- `medium`: 55-79.
- `low`: 0-54.
- `manual_review`: conflicting or low-confidence critical fields.

Acceptance:

- Score rationale cites fields used.
- Unknown values do not add positive points.
- Existing customer/support requests override sales priority.

### HubSpot Sync Service

Responsibilities:

- Find or create contact.
- Find or create company.
- Associate contact and company.
- Optionally create or update deal.
- Create activity note.
- Store HubSpot object IDs.
- Retry failures.

Acceptance:

- Sync is idempotent.
- Protected fields are not overwritten.
- Deal Threads custom fields are created or documented before launch.
- Sandbox tests pass before beta install.

### Routing And Notification

Responsibilities:

- Evaluate routing rules.
- Assign owner or queue.
- Respect existing CRM owner where configured.
- Send notification for high-priority leads.

Acceptance:

- Every qualified lead resolves to owner, queue, or manual review.
- Existing customers route away from new sales.
- Notification includes summary and CRM link when available.

### Operator Configuration

MVP can use either a lightweight admin UI or structured config files. A config-file approach is acceptable for the first beta if engineering time is tight.

Required configuration:

- Tenant name.
- Allowed domains.
- Widget theme.
- Welcome message.
- Eligible pages.
- Consent copy.
- Required fields.
- CRM provider and credentials reference.
- HubSpot field mapping.
- ICP criteria.
- Routing rules.
- Notification channel.

Acceptance:

- Changes are versioned.
- Production uses only published config.
- Previous config can be restored.

## Data Model MVP

Required tables or equivalent collections:

- `tenants`
- `widget_configs`
- `conversation_sessions`
- `conversation_messages`
- `lead_profiles`
- `consent_records`
- `enrichment_jobs`
- `crm_integrations`
- `crm_sync_events`
- `routing_rules`
- `analytics_events`
- `audit_logs`

## API Surface MVP

### Public Widget APIs

- `GET /api/v1/widgets/{widgetId}/config`
- `POST /api/v1/widget-sessions`
- `POST /api/v1/conversations/{conversationId}/messages`
- `POST /api/v1/conversations/{conversationId}/complete`
- `POST /api/v1/fallback-submissions`

### Internal APIs

- `GET /api/v1/leads/{leadProfileId}`
- `POST /api/v1/leads/{leadProfileId}/enrich`
- `POST /api/v1/leads/{leadProfileId}/score`
- `POST /api/v1/crm/sync`
- `POST /api/v1/routing/evaluate`
- `GET /api/v1/tenants/{tenantId}/health`

## Event Tracking MVP

Required events:

- `widget_loaded`
- `widget_opened`
- `conversation_started`
- `message_sent`
- `field_captured`
- `consent_accepted`
- `conversation_completed`
- `fallback_form_submitted`
- `lead_profile_created`
- `enrichment_started`
- `enrichment_completed`
- `enrichment_failed`
- `icp_scored`
- `crm_sync_started`
- `crm_sync_completed`
- `crm_sync_failed`
- `lead_routed`
- `notification_sent`

Each event must include:

- `tenant_id`
- `widget_id`
- `session_id`
- `timestamp`
- `event_type`
- `properties`

## Environment Strategy

### Local

- Mock LLM responses allowed.
- Mock enrichment allowed.
- HubSpot sandbox optional.
- Seed demo tenant and widget config.

### Staging

- Real LLM provider.
- Mock or low-cost enrichment mode.
- HubSpot sandbox required.
- Test domains only.

### Beta Production

- Real LLM provider.
- Real enrichment provider.
- Real HubSpot credentials.
- Restricted allowed domains.
- Error alerts active.
- Cost tracking active.

## Build Milestones

### Milestone 1: Local Conversation Demo

Definition of done:

- Widget opens on local test page.
- Visitor can complete the v1 flow.
- Structured profile JSON is produced.
- Fallback form works.

### Milestone 2: Backend Lead Profile

Definition of done:

- Conversation messages persist.
- Completion endpoint creates lead profile.
- Consent record persists.
- Rep summary generates.

### Milestone 3: Enrichment And Scoring

Definition of done:

- Mock enrichment populates company data.
- Real enrichment provider works in staging.
- ICP score and rationale generated.
- Low-confidence fields are flagged.

### Milestone 4: HubSpot Sync

Definition of done:

- Contact created in HubSpot sandbox.
- Existing contact updated safely.
- Company association works.
- Activity note created.
- Deal Threads custom fields mapped.
- Retry failure path tested.

### Milestone 5: Beta Install

Definition of done:

- First beta tenant configured.
- Script installed on approved domain.
- Test lead flows into real HubSpot.
- Sales notification received.
- Analytics dashboard or export shows full funnel.

## Prototype Acceptance Criteria

- A beta client can install Deal Threads using one script tag.
- A visitor can complete the conversation on desktop and mobile.
- The system produces structured lead JSON with required fields.
- A lead profile syncs into HubSpot with a readable summary.
- Enrichment does not block lead creation.
- High-priority leads are routed and notified.
- Errors produce fallback paths.
- Admin/operator can configure one beta client without code changes after initial tenant setup.
- The team can inspect failed enrichment or CRM sync jobs.

## Technical Constraints And Defaults

- Keep widget JavaScript under 150 KB gzipped if feasible.
- Use Shadow DOM or scoped CSS to avoid customer site conflicts.
- Use server-side validation for all extracted fields.
- Keep LLM prompt/version metadata on every conversation.
- Store raw transcript encrypted or in a protected store.
- Redact PII from logs.
- Queue external provider calls.
- Design provider adapters so CRM and enrichment vendors can be swapped.
- Track cost by tenant, conversation, and enrichment job.

## Initial Demo Data

Use these sample visitors for local QA:

### High Priority

```text
I am VP Sales at a 150-person SaaS company. We use HubSpot and our demo requests are going cold because reps do too much research before responding. We want to fix this this quarter and likely have budget around $30K-$50K annually.
```

Expected:

- Priority: high.
- Timeline: this_quarter.
- Budget: 30k_60k.
- CRM: hubspot.
- Route: sales.

### Medium Priority

```text
I am researching options for our marketing team. We may revisit lead routing later this year. We use Salesforce and I am trying to build the case internally.
```

Expected:

- Priority: medium.
- Timeline: later_this_year.
- Budget: building_case.
- CRM: salesforce.
- Route: nurture or SDR queue.

### Low Priority

```text
I am a student writing a paper about AI chatbots. Can someone answer some questions?
```

Expected:

- Priority: low.
- Buying stage: education.
- Route: suppress or low-priority queue.

### Existing Customer

```text
We already use your product and need help with our account setup.
```

Expected:

- Route: customer_success or support.
- Do not create new sales deal.

## Engineering Test Checklist

- Widget loads on a blank HTML page.
- Widget loads on a page with heavy CSS without visual breakage.
- Widget loads through tag manager.
- Conversation survives close/reopen in same session.
- Required fields are detected.
- Completion is idempotent.
- Mock enrichment works.
- Real enrichment failure does not break CRM sync.
- HubSpot contact dedupe works.
- HubSpot company dedupe works.
- Activity note created.
- Prompt injection test passes.
- Mobile layout passes.
- Logs do not expose PII.

