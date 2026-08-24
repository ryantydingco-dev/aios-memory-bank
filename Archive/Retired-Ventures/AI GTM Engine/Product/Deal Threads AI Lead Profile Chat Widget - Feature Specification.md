# Feature Specification: Deal Threads AI Lead Profile Chat Widget

Last updated: 2026-06-01  
Target audience: Product, engineering, design, RevOps, customer success  
Target release: MVP Beta v0.1, first 5 managed beta clients  

## 1. Feature Overview

**Feature Name**: Deal Threads AI Lead Profile Chat Widget  
**Feature Category**: Core  
**Priority Level**: Must-Have  
**Target Release**: MVP Beta v0.1  

**Problem Statement**  
Mid-market B2B teams receive contact form submissions that contain too little sales context: name, email, company, and a vague message. Sales reps then spend 10-20 minutes researching company size, buyer role, intent, budget, timeline, funding, tech stack, and fit before they can follow up. This creates a response gap where high-intent buyers cool off and competitors win the meeting.

**Feature Summary**  
Deal Threads replaces a static contact form with an AI chat widget installed through a single script tag. The widget captures buyer intent through a natural conversation, enriches the lead profile behind the scenes, scores ICP fit, routes the lead to the right rep, and pushes the completed profile into the client's CRM.

**Success Criteria**
- Install the widget for 5 beta clients within the beta window.
- Achieve at least 75% completion rate for visitors who start the qualification conversation.
- Capture at least 85% of required qualification fields for completed conversations.
- Reduce manual lead research time by at least 10 minutes per qualified lead.
- Sync at least 98% of completed lead profiles to the configured CRM without manual intervention.
- Deliver enriched lead profiles to reps within 2 minutes of conversation completion.
- Improve qualified meeting conversion rate by at least 15% against the client's baseline contact form.

**User Impact**
- Website visitors get a faster, more helpful intake experience than a static form.
- Sales reps receive actionable lead context before first touch.
- RevOps leaders get cleaner pipeline data and better routing controls.
- Marketing leaders can measure which pages, campaigns, and ICP segments produce qualified opportunities.

## 2. User Personas And Use Cases

### Primary Persona: RevOps / Sales Operations Manager

**Demographics**: 30-50, works at a 50-500 employee B2B company, manages CRM hygiene, routing, attribution, and sales process efficiency. Medium to high technical fluency.  
**Goals**: Increase speed-to-lead, improve CRM data quality, reduce manual research, route qualified opportunities accurately, prove ROI.  
**Pain Points**: Static forms produce thin data, CRM fields are inconsistent, reps ignore low-context leads, integration work is fragmented, data providers are expensive and noisy.  
**Context**: Configures Deal Threads during onboarding, monitors lead quality weekly, reviews reports with sales leadership.

### Secondary Persona: High-Intent Website Visitor

**Demographics**: 25-55, buyer, evaluator, founder, department leader, or operator researching a B2B solution. Mixed technical fluency.  
**Goals**: Ask for help, book a call, get routed to the right person, avoid repetitive form fields.  
**Pain Points**: Long forms, irrelevant chatbot scripts, unclear next steps, delayed follow-up.  
**Use Case**: Opens the widget from a pricing, demo, product, or use-case page and answers a short adaptive qualification flow.

### Tertiary Persona: SDR / Account Executive

**Demographics**: 22-45, uses CRM daily, measured on meetings, pipeline, and response time.  
**Goals**: Prioritize the right leads, personalize first touch, understand buying intent, avoid manual research.  
**Pain Points**: Raw form submissions, duplicate leads, unclear authority or budget, stale enrichment data.  
**Use Case**: Receives an assigned lead with an AI-built buyer profile, qualification summary, enrichment sources, and recommended next action.

### Edge Cases

- Visitor abandons the conversation before giving email.
- Visitor gives personal email but company domain can be inferred from message or company name.
- Visitor provides invalid, fake, or disposable email.
- Enrichment provider returns multiple possible company matches.
- Enrichment provider has no match.
- CRM contains an existing contact, lead, or account for the same person or company.
- CRM integration token expires during sync.
- LLM provider latency spikes or fails.
- Visitor asks unrelated questions or tries prompt injection.
- Visitor requests data deletion or asks what data is being collected.
- Customer operates in a regulated industry with stricter consent language.

## 3. Detailed User Stories

**Epic**: Replace static B2B contact forms with an AI conversation that captures buyer intent, enriches the account, scores fit, routes the lead, and syncs a complete buyer profile into CRM.

### Story 1: Visitor Starts A Qualification Conversation

**As a** website visitor  
**I want** to describe what I need in a conversational widget  
**So that** I can request help without filling out a long generic form.

**Acceptance Criteria**
- **Given** the widget script is installed and enabled, **when** the visitor lands on an eligible page, **then** the widget launcher appears without blocking page load.
- **Given** the visitor opens the widget, **when** the session starts, **then** the widget greets them with context-aware copy based on the page or campaign.
- **Given** the visitor answers a question, **when** the response is submitted, **then** the system stores the message, extracts relevant fields, and asks the next best qualification question.
- **Given** the visitor completes required fields, **when** the conversation ends, **then** the widget shows a confirmation and the system creates or updates a lead profile.

### Story 2: AI Captures Structured Qualification Data

**As a** RevOps manager  
**I want** the AI conversation to produce structured sales fields  
**So that** reps can act on the lead without reading the full transcript.

**Acceptance Criteria**
- **Given** the visitor mentions budget, timeline, pain, company, role, or use case, **when** the message is processed, **then** the system extracts the field into a structured profile.
- **Given** a field cannot be confidently extracted, **when** the profile is generated, **then** the field remains unknown and is not guessed.
- **Given** the AI asks a follow-up question, **when** the question is rendered, **then** it must be relevant to the buyer journey and must not ask for sensitive data outside the configured policy.
- **Given** the conversation completes, **when** the lead profile is created, **then** the summary includes intent, pain, timeline, budget range, authority signal, and recommended sales action.

### Story 3: Lead Is Enriched Behind The Scenes

**As an** SDR or AE  
**I want** company and buyer context enriched automatically  
**So that** I can personalize outreach immediately.

**Acceptance Criteria**
- **Given** a lead profile has email or company domain, **when** enrichment starts, **then** the system queries configured enrichment providers asynchronously.
- **Given** enrichment returns company size, industry, funding, tech stack, or decision-maker data, **when** confidence meets the configured threshold, **then** the data is added to the profile with source metadata.
- **Given** enrichment fails or returns no match, **when** the profile is synced, **then** the lead still reaches CRM with captured conversation fields and an enrichment status of failed or unavailable.
- **Given** multiple matches are returned, **when** confidence is below threshold, **then** the system marks the field for manual review instead of choosing silently.

### Story 4: Lead Syncs To CRM And Routes To The Right Owner

**As a** RevOps manager  
**I want** completed profiles synced and routed automatically  
**So that** high-intent leads reach the right rep quickly.

**Acceptance Criteria**
- **Given** a lead profile is completed, **when** CRM sync runs, **then** the system creates or updates the appropriate contact, company, and deal or lead record.
- **Given** routing rules exist, **when** the lead is scored, **then** the system assigns the lead to the matching owner or queue.
- **Given** the CRM already has a matching record, **when** sync runs, **then** the system updates configured Deal Threads fields without overwriting protected CRM fields.
- **Given** sync fails due to token expiration, rate limit, or validation error, **when** retries are exhausted, **then** the system logs the failure and alerts the internal operations channel.

### Story 5: Rep Receives A Useful Lead Profile

**As an** SDR or AE  
**I want** a concise lead summary inside my CRM  
**So that** I know who to call, why they came in, and what to say first.

**Acceptance Criteria**
- **Given** a lead is synced, **when** the rep opens the CRM record, **then** they see a Deal Threads summary containing buyer intent, qualification fields, enrichment highlights, score, source page, transcript link, and next action.
- **Given** the lead is high priority, **when** routing completes, **then** the assigned owner receives a notification through the configured channel.
- **Given** enrichment contains low-confidence fields, **when** the rep views the profile, **then** those fields are clearly labeled as low confidence or needs review.

### Story 6: Admin Configures A Beta Widget

**As a** Deal Threads implementation operator  
**I want** to configure a widget for each beta client  
**So that** the conversation, branding, enrichment, and CRM sync match that client's sales motion.

**Acceptance Criteria**
- **Given** a tenant exists, **when** an operator creates a widget configuration, **then** they can set brand colors, welcome copy, eligible pages, qualification questions, required fields, consent copy, CRM mapping, and routing rules.
- **Given** a configuration is updated, **when** the widget loads again, **then** the latest published configuration is used.
- **Given** a draft configuration exists, **when** it has not been published, **then** production widget sessions continue using the previous published version.

### Story 7: Error Handling And Recovery

**As a** website visitor  
**I want** the widget to handle errors gracefully  
**So that** I can still contact the company if AI or enrichment fails.

**Acceptance Criteria**
- Error messages are written in plain language and explain the next action.
- Visitor-entered data is preserved if an AI response fails.
- The widget provides a fallback form when chat completion is unavailable.
- CRM and enrichment failures do not block user confirmation after the required visitor fields are captured.
- All retryable backend failures use bounded retries with exponential backoff.

### Story 8: Consent, Privacy, And Auditability

**As a** RevOps manager  
**I want** data collection and enrichment to be consent-aware and auditable  
**So that** the business can use Deal Threads with confidence.

**Acceptance Criteria**
- **Given** consent copy is configured, **when** the visitor starts the conversation, **then** the widget displays the configured disclosure before collecting personal data.
- **Given** a visitor submits personal data, **when** the profile is created, **then** the system stores consent timestamp, source URL, IP-derived region if available, and policy version.
- **Given** an admin or operator views or changes a lead profile, **when** the action occurs, **then** the system records an audit event.
- **Given** a deletion request is received, **when** the request is validated, **then** the system can delete or anonymize the visitor's personal data across Deal Threads-owned stores.

## 4. Functional Requirements

### Function 1: Widget Embed And Initialization

**Description**: Load the Deal Threads widget on client websites through a single non-blocking script tag.  
**Input**: Tenant ID, widget ID, page URL, referrer, UTM parameters, browser metadata.  
**Processing**: Load published widget configuration, initialize session, apply theme, determine whether the current page is eligible.  
**Output**: Launcher button or embedded chat interface displayed on the page.  
**Validation**: Widget ID must exist, tenant must be active, origin must match allowed domains, configuration must be published.

### Function 2: Conversational Lead Capture

**Description**: Conduct a short adaptive qualification conversation and extract structured fields.  
**Input**: Visitor messages, conversation state, page context, configured question policy.  
**Processing**: Store messages, call AI orchestration service, extract fields into schema, select next question, enforce guardrails.  
**Output**: Assistant message, updated lead profile draft, completion status.  
**Validation**: Required fields must include email or phone plus at least one business intent field before qualified completion.

### Function 3: Lead Profile Creation

**Description**: Convert captured conversation data into a structured lead profile.  
**Input**: Contact fields, company fields, qualification fields, transcript, consent metadata, source attribution.  
**Processing**: Normalize values, deduplicate against existing profiles, calculate completeness, generate summary, create lead record.  
**Output**: Lead profile ID and qualification summary.  
**Validation**: Email format, phone format if supplied, budget range normalization, timeline enum, required consent fields.

### Function 4: Enrichment

**Description**: Enrich company and buyer context using configured providers.  
**Input**: Email, domain, company name, LinkedIn URL if provided, tenant enrichment settings.  
**Processing**: Queue enrichment job, query provider APIs, normalize provider responses, attach source and confidence, flag conflicts.  
**Output**: Company size, industry, revenue range if available, funding signals, tech stack, decision-makers, enrichment status.  
**Edge Cases**: No match, multiple matches, provider outage, rate limit, conflicting fields, paid API budget exceeded.

### Function 5: ICP Fit Scoring

**Description**: Score the profile against client-specific ICP rules.  
**Input**: Captured fields, enrichment fields, configured ICP criteria.  
**Processing**: Calculate score using transparent weighted rules for firmographic fit, urgency, pain, budget, authority, and tech fit.  
**Output**: ICP score from 0-100, segment label, score rationale, recommended action.  
**Validation**: Score rationale must cite fields used; unknown fields must not count as positive evidence.

### Function 6: CRM Sync

**Description**: Push completed lead profiles into the customer's CRM.  
**Input**: Lead profile, CRM mapping, CRM credentials, routing owner.  
**Processing**: Find or create contact/company, update mapped fields, create activity note with transcript summary, attach routing assignment.  
**Output**: CRM object IDs, sync status, last synced timestamp.  
**Validation**: Required CRM fields must be mapped; protected CRM fields must not be overwritten; sync must be idempotent.

### Function 7: Routing And Notifications

**Description**: Assign leads to the right owner or queue and notify sales.  
**Input**: ICP score, territory, company size, industry, product interest, CRM ownership, configured routing rules.  
**Processing**: Evaluate routing rules in priority order, assign owner, create notification payload.  
**Output**: Assigned owner, queue, notification event, CRM assignment.  
**Validation**: Every qualified lead must resolve to either a named owner or fallback queue.

### Function 8: Analytics And Reporting

**Description**: Track the funnel from widget load to CRM sync and closed-won attribution.  
**Input**: Widget events, conversation milestones, profile fields, CRM outcomes.  
**Processing**: Store analytics events, calculate conversion rates, expose beta reporting metrics.  
**Output**: Dashboards or exports showing engagement, completion, qualification, sync success, speed-to-lead, and downstream deal outcomes.  
**Validation**: Analytics events must include tenant ID, widget ID, session ID, timestamp, and event type.

### Business Rules

- Deal Threads must never invent enrichment facts. Unknown is preferable to inaccurate.
- AI-generated summaries must distinguish visitor-provided facts from third-party-enriched facts.
- A completed qualified lead requires consent, contact method, business need, and either timeline or urgency.
- Enrichment failures must not prevent CRM sync of captured first-party data.
- CRM deduplication must match by email first, then domain plus company name.
- Deal Threads-managed fields may be updated on each sync; customer-owned protected fields require explicit configuration to overwrite.
- High-priority routing requires both ICP fit and urgency, not enrichment fit alone.
- Admin configuration changes must be versioned and publishable.
- Personally identifiable information must not be written to raw application logs.
- Beta clients are manually onboarded by Deal Threads until self-serve onboarding is prioritized.

### Integration Requirements

**External APIs**
- LLM provider for conversation orchestration and structured extraction.
- Enrichment provider for company, person, funding, and tech stack signals.
- CRM provider, HubSpot for MVP beta; Salesforce should be designed as a future adapter.
- Optional notification provider for Slack or email alerts.
- Optional calendar provider for handoff or demo-booking CTA.

**Internal Systems**
- Tenant and widget configuration.
- Lead profile store.
- Conversation transcript store.
- Enrichment job queue.
- CRM sync service.
- Analytics and event pipeline.
- Audit logging.

**Data Synchronization**
- Deal Threads stores the canonical conversation transcript and enrichment job history.
- CRM stores the actionable sales record and selected Deal Threads fields.
- Sync operations must be idempotent using tenant ID plus lead profile ID.
- Failed syncs must be retryable and visible to operations.
- CRM object IDs must be stored after successful sync to prevent duplicate records.

## 5. Non-Functional Requirements

### Performance Requirements

- Widget loader must be non-blocking and must not reduce client page Lighthouse performance score by more than 3 points in beta tests.
- Widget script target size: less than 150 KB gzipped for MVP.
- Widget launcher render p95: less than 1 second after script load.
- Chat response p95: less than 3.5 seconds under normal provider conditions.
- Lead profile creation p95: less than 2 seconds after conversation completion.
- Enrichment completion p95: less than 120 seconds for provider-available records.
- CRM sync p95: less than 30 seconds after profile completion or enrichment completion, depending on tenant setting.
- MVP throughput target: 50 beta tenants, 10,000 widget sessions per day, 1,000 completed profiles per day.

### Reliability Requirements

- Widget availability target: 99.5% for MVP beta.
- Backend API availability target: 99.5% for MVP beta.
- CRM sync retries: at least 3 attempts with exponential backoff before manual review.
- Enrichment retries: provider-specific retry policy with rate-limit awareness.
- Fallback form must be available when AI conversation service is unavailable.
- All async jobs must be idempotent.

### Security Requirements

- All traffic must use TLS 1.2 or higher.
- Sensitive data must be encrypted at rest.
- CRM tokens must be encrypted using a managed secrets mechanism.
- Admin access requires authenticated user accounts; SSO can be post-MVP.
- Role-based permissions must separate Deal Threads operator, tenant admin, and read-only viewer.
- Audit logs must capture admin configuration changes, CRM sync actions, lead exports, and manual edits.
- Application logs must redact email, phone, transcript content, and tokens by default.
- Prompt injection attempts must not expose system prompts, credentials, hidden configuration, or other tenant data.

### Privacy And Compliance Requirements

- Widget must display configurable consent/disclosure copy before collecting personal data.
- Store consent timestamp, page URL, policy version, and source IP-derived region where available.
- Provide tenant-level data retention settings; default beta retention is 24 months unless otherwise configured.
- Support deletion/anonymization workflow for visitor data requests.
- Enrichment sources and confidence levels must be visible for auditability.
- Do not enrich categories prohibited by policy, including sensitive personal traits unrelated to B2B qualification.

### Usability Requirements

- Widget must meet WCAG 2.1 AA expectations for contrast, keyboard navigation, focus states, labels, and screen-reader semantics.
- Browser support: latest two major versions of Chrome, Safari, Firefox, and Edge.
- Mobile support: responsive full-screen or near full-screen chat on screens narrower than 640 px.
- Visitor must always understand the next step after completing the conversation.
- Reps must be able to scan the CRM summary in less than 30 seconds.
- Admin configuration should be simple enough for Deal Threads operators to configure a beta client without engineering support after initial setup.

## 6. Technical Specifications

### Architecture

1. Client site loads Deal Threads script tag.
2. Widget loader fetches published configuration from the Widget Config API.
3. Visitor messages are sent to the Conversation API.
4. Conversation Orchestrator calls the LLM provider and structured extraction layer.
5. Lead Profile Service stores normalized first-party data and transcript summary.
6. Enrichment Service runs async provider lookups through a job queue.
7. ICP Scoring Service calculates score and recommended action.
8. CRM Sync Service creates or updates CRM records.
9. Routing Service assigns owner and sends notification.
10. Analytics Service records funnel and operational events.

### Frontend Requirements

**Components**
- Script loader.
- Widget launcher.
- Chat shell.
- Message list.
- Message input.
- Quick reply buttons.
- Contact field capture controls.
- Consent disclosure.
- Completion confirmation.
- Fallback form.
- Error banner.
- Admin preview mode.

**State Management**
- Local widget state: closed, open, active, completed, error, fallback.
- Session state: anonymous session ID, conversation ID, lead profile draft ID.
- Conversation state: messages, extracted fields, next required fields, completion status.
- Configuration state: theme, welcome copy, question policy, routing context, consent copy.

**Routing**
- Public widget has no client-side route requirement.
- Admin MVP may use `/admin/tenants/:tenantId/widgets/:widgetId`.
- Lead detail view may use `/admin/tenants/:tenantId/leads/:leadId`.

**Styling**
- Use isolated styles through Shadow DOM or equivalent namespace isolation.
- Allow tenant-configurable primary color, launcher position, logo, welcome copy, and CTA copy.
- Maintain accessible contrast even when customer brand color is low contrast by deriving safe foreground colors.

### Backend Requirements

#### GET /api/v1/widgets/{widgetId}/config

**Purpose**: Return published widget configuration for an allowed origin.  
**Query Parameters**: `tenantId`, `pageUrl`, `referrer`.  
**Response 200**

```json
{
  "widgetId": "wid_123",
  "tenantId": "ten_123",
  "version": 7,
  "theme": {
    "primaryColor": "#1F6FEB",
    "launcherPosition": "bottom-right"
  },
  "conversation": {
    "welcomeMessage": "Tell us what you are trying to solve.",
    "requiredFields": ["email", "business_need", "timeline"],
    "questionPolicyId": "qp_123"
  },
  "consent": {
    "policyVersion": "2026-06-01",
    "disclosure": "By continuing, you agree that we may process your responses to qualify and respond to your request."
  }
}
```

**Errors**
- `403 origin_not_allowed`
- `404 widget_not_found`
- `409 widget_not_published`

#### POST /api/v1/widget-sessions

**Purpose**: Create an anonymous widget session.  
**Request Body**

```json
{
  "tenantId": "ten_123",
  "widgetId": "wid_123",
  "configVersion": 7,
  "pageUrl": "https://example.com/pricing",
  "referrer": "https://google.com",
  "utm": {
    "source": "linkedin",
    "campaign": "demo-offer"
  }
}
```

**Response 201**

```json
{
  "sessionId": "ses_123",
  "conversationId": "con_123",
  "expiresAt": "2026-06-01T18:00:00Z"
}
```

#### POST /api/v1/conversations/{conversationId}/messages

**Purpose**: Process a visitor message and return the assistant response plus extracted field updates.  
**Request Body**

```json
{
  "sessionId": "ses_123",
  "message": "We are a 120 person SaaS company looking to improve demo routing this quarter.",
  "consentAccepted": true
}
```

**Response 200**

```json
{
  "assistantMessage": "Got it. What CRM are you using today?",
  "extractedFields": {
    "companySize": "120 employees",
    "industry": "SaaS",
    "businessNeed": "improve demo routing",
    "timeline": "this quarter"
  },
  "missingRequiredFields": ["email"],
  "completionStatus": "in_progress"
}
```

**Validation**
- Message must be 1-4000 characters.
- Consent must be accepted before collecting email, phone, or company enrichment fields.
- Conversation must belong to the supplied session.

#### POST /api/v1/conversations/{conversationId}/complete

**Purpose**: Complete the conversation and create or update the lead profile.  
**Request Body**

```json
{
  "sessionId": "ses_123",
  "completionReason": "visitor_completed"
}
```

**Response 201**

```json
{
  "leadProfileId": "lead_123",
  "qualificationStatus": "qualified",
  "profileCompleteness": 0.88,
  "nextAction": "route_to_sales"
}
```

#### POST /api/v1/leads/{leadProfileId}/enrich

**Purpose**: Queue enrichment for a lead profile.  
**Response 202**

```json
{
  "enrichmentJobId": "enj_123",
  "status": "queued"
}
```

#### GET /api/v1/leads/{leadProfileId}

**Purpose**: Retrieve the structured lead profile.  
**Response 200**

```json
{
  "id": "lead_123",
  "tenantId": "ten_123",
  "contact": {
    "name": "Jordan Lee",
    "email": "jordan@example.com",
    "role": "VP Sales"
  },
  "company": {
    "name": "ExampleCo",
    "domain": "example.com",
    "employeeRange": "101-250",
    "industry": "B2B SaaS"
  },
  "qualification": {
    "businessNeed": "Improve demo routing",
    "budgetRange": "$25K-$50K annually",
    "timeline": "This quarter",
    "authoritySignal": "Decision maker"
  },
  "score": {
    "icpFit": 87,
    "segment": "high_priority",
    "rationale": ["Matches target employee range", "Timeline is this quarter", "CRM pain confirmed"]
  },
  "enrichment": {
    "status": "completed",
    "sources": ["provider_name"],
    "confidence": 0.82
  },
  "crm": {
    "syncStatus": "synced",
    "contactId": "12345",
    "companyId": "67890"
  }
}
```

#### POST /api/v1/crm/sync

**Purpose**: Sync one lead profile to the tenant CRM.  
**Request Body**

```json
{
  "tenantId": "ten_123",
  "leadProfileId": "lead_123",
  "force": false
}
```

**Response 200**

```json
{
  "syncStatus": "synced",
  "provider": "hubspot",
  "objects": {
    "contactId": "12345",
    "companyId": "67890",
    "dealId": "24680"
  }
}
```

### Database Changes

**New Tables**

`tenants`
- `id`, `name`, `status`, `allowed_domains`, `created_at`, `updated_at`

`users`
- `id`, `tenant_id`, `email`, `role`, `status`, `created_at`, `updated_at`

`widget_configs`
- `id`, `tenant_id`, `version`, `status`, `theme_json`, `conversation_json`, `consent_json`, `allowed_pages_json`, `created_by`, `published_at`, `created_at`, `updated_at`

`conversation_sessions`
- `id`, `tenant_id`, `widget_id`, `config_version`, `anonymous_visitor_id`, `page_url`, `referrer`, `utm_json`, `status`, `started_at`, `completed_at`

`conversation_messages`
- `id`, `tenant_id`, `conversation_id`, `sender`, `body_encrypted`, `extracted_fields_json`, `model_metadata_json`, `created_at`

`lead_profiles`
- `id`, `tenant_id`, `conversation_id`, `status`, `contact_json`, `company_json`, `qualification_json`, `summary`, `icp_score`, `score_json`, `profile_completeness`, `created_at`, `updated_at`

`consent_records`
- `id`, `tenant_id`, `conversation_id`, `lead_profile_id`, `policy_version`, `consent_text`, `source_url`, `region`, `accepted_at`

`enrichment_jobs`
- `id`, `tenant_id`, `lead_profile_id`, `provider`, `status`, `attempt_count`, `request_hash`, `result_json`, `error_code`, `created_at`, `completed_at`

`crm_integrations`
- `id`, `tenant_id`, `provider`, `status`, `credentials_ref`, `field_mapping_json`, `created_at`, `updated_at`

`crm_sync_events`
- `id`, `tenant_id`, `lead_profile_id`, `provider`, `status`, `external_object_ids_json`, `error_code`, `attempt_count`, `created_at`, `completed_at`

`routing_rules`
- `id`, `tenant_id`, `priority`, `conditions_json`, `assignment_json`, `status`, `created_at`, `updated_at`

`analytics_events`
- `id`, `tenant_id`, `widget_id`, `session_id`, `lead_profile_id`, `event_type`, `properties_json`, `created_at`

`audit_logs`
- `id`, `tenant_id`, `actor_id`, `actor_type`, `action`, `target_type`, `target_id`, `metadata_json`, `created_at`

**Indexes**
- `conversation_sessions(tenant_id, started_at)`
- `conversation_sessions(widget_id, status)`
- `conversation_messages(conversation_id, created_at)`
- `lead_profiles(tenant_id, created_at)`
- `lead_profiles(tenant_id, status, icp_score)`
- `enrichment_jobs(status, created_at)`
- `crm_sync_events(tenant_id, lead_profile_id, provider)`
- `analytics_events(tenant_id, event_type, created_at)`
- Unique CRM external object mapping per tenant and provider where applicable.

**Migration Strategy**
- Start with additive tables only for MVP.
- Store provider-specific payloads in JSON fields initially; normalize only after beta learnings identify stable fields.
- Encrypt transcript body and sensitive contact fields before production beta.
- Add CRM-specific field mapping migrations after HubSpot beta stabilizes.

### AI And Data Guidelines

- Use structured output schemas for field extraction and lead summaries.
- Version every system prompt and question policy.
- Keep conversation goal-oriented: identify need, company context, timing, budget or urgency, authority, and next step.
- Do not allow the AI to answer unrelated broad support questions unless configured by the tenant.
- Use deterministic validation outside the LLM for email, phone, enums, required fields, and routing.
- Separate visitor-provided fields from enriched fields in storage and display.
- Include source and confidence on every enriched field.
- Cache enrichment results by domain where legally and contractually allowed.
- Add cost tracking per conversation, enrichment job, and tenant.

## 7. User Interface Specifications

### Wireframes / Mockups

Design file: TBD. MVP can proceed with low-fidelity wireframes for the widget, CRM profile card, and internal operator configuration screen.

### Widget Layout Requirements

**Page / Screen Structure**
- Launcher fixed to configured corner.
- Chat panel opens above launcher on desktop.
- Header includes tenant logo or name, status text, and close control.
- Message area shows visitor and assistant messages.
- Input area includes text input, send button, optional quick replies, and privacy link.
- Completion state shows confirmation, expected response time, and optional meeting CTA.

**Navigation**
- Visitor can open, close, and reopen the widget without losing active conversation state during the same session.
- Visitor can return to fallback form if chat fails.
- Visitor can access privacy disclosure before submitting personal data.

**Information Hierarchy**
- First screen should ask for the visitor's goal, not force contact details immediately.
- Required contact capture should occur after initial intent is established.
- Confirmation should clearly state what happens next.

### CRM Profile Card Requirements

**Summary Fields**
- Lead priority label.
- ICP score and reason.
- Buyer intent summary.
- Pain point.
- Timeline.
- Budget or budget signal.
- Authority signal.
- Company size and industry.
- Tech stack highlights.
- Funding or growth signals if available.
- Source page, campaign, and referrer.
- Transcript link or latest conversation summary.
- Recommended next action.

**Interaction**
- Reps can expand to read full transcript.
- Low-confidence enrichment fields are labeled.
- Manual review flags are visible.

### Internal Operator UI Requirements

**Configuration Areas**
- Tenant details and allowed domains.
- Widget theme and launcher settings.
- Welcome message and fallback message.
- Qualification fields and question policy.
- Consent copy and privacy link.
- CRM provider and field mapping.
- Routing rules.
- Test conversation preview.
- Publish controls and version history.

### Responsive Design

**Desktop**
- Chat panel target width: 380-420 px.
- Chat panel target height: 560-680 px.
- Must avoid covering critical customer page CTAs where possible through configurable positioning.

**Tablet**
- Chat panel may use 70-85% viewport height and no more than 480 px width.
- Touch targets must be at least 44 px.

**Mobile**
- Chat opens as full-screen or near full-screen overlay.
- Input remains accessible above mobile browser controls.
- Launcher must not obscure cookie banners, navigation, or primary CTAs where possible.

### Interactive Elements

- Primary button: send, continue, book meeting, submit fallback form.
- Secondary button: close, back to chat, privacy link.
- Quick replies: budget ranges, timeline options, company size ranges, CRM options when configured.
- Loading state: typing indicator for AI response, enrichment pending state for operator UI.
- Error feedback: plain-language banner with retry or fallback option.
- Confirmation: success message plus expected follow-up window.

## 8. Testing Requirements

### Unit Tests

- Widget configuration parsing.
- Origin and domain validation.
- Conversation state transitions.
- Required field detection.
- Email, phone, URL, and enum validation.
- Structured extraction schema validation.
- ICP scoring logic.
- Routing rule evaluation.
- CRM field mapping.
- Retry and idempotency helpers.
- PII redaction in logs.

### Integration Tests

- Widget config API returns only published configurations.
- Conversation API stores messages and returns next assistant response.
- Completion endpoint creates lead profile and consent record.
- Enrichment job queues and updates lead profile.
- CRM sync creates contact/company in HubSpot sandbox.
- CRM sync updates existing records without duplicating.
- Routing assigns fallback queue when no rule matches.
- Analytics events fire for widget load, open, message, completion, enrichment, CRM sync, and routing.
- Provider failures produce recoverable states.

### End-To-End Tests

- Visitor opens widget, completes conversation, profile appears in admin lead detail.
- Visitor completes conversation, profile enriches, and HubSpot contact is created.
- Visitor abandons after two messages, partial session is stored but no qualified lead is routed.
- AI service failure triggers fallback form and preserves visitor-entered data.
- CRM token expiration triggers retry failure and operations alert.
- Mobile visitor completes conversation without layout overlap or blocked input.

### User Acceptance Tests

**Scenario 1: Qualified Demo Request**
1. Visitor lands on pricing page from LinkedIn campaign.
2. Visitor opens widget and describes a demo-routing problem.
3. Widget captures name, work email, company, need, timeline, CRM, and budget range.
4. System enriches company size and tech stack.
5. System scores lead above 80.
6. Lead syncs to CRM, routes to AE, and sends notification.
7. Rep opens CRM and sees summary, score, source page, and next action.

**Scenario 2: Low-Fit Lead**
1. Visitor opens widget from blog page.
2. Visitor identifies as a student or vendor.
3. Widget captures contact details but identifies low commercial intent.
4. System scores lead below qualified threshold.
5. Lead syncs to CRM with low-priority status and does not alert sales.

**Scenario 3: Enrichment Failure**
1. Visitor completes conversation with valid email.
2. Enrichment provider returns no match.
3. System creates profile using visitor-provided data.
4. CRM sync succeeds with enrichment status unavailable.
5. Operations dashboard shows enrichment gap without blocking rep follow-up.

**Scenario 4: Existing CRM Record**
1. Visitor submits using an email already in CRM.
2. System finds matching contact.
3. System appends Deal Threads qualification fields and activity note.
4. System does not overwrite protected lifecycle stage or owner fields unless configured.

### Performance Tests

- Load test widget config and conversation APIs at MVP target volume.
- Stress test message ingestion and async job queue.
- Test third-party provider rate-limit behavior.
- Measure script impact on sample customer pages.
- Validate chat p95 response time under normal and degraded provider conditions.

### Security Tests

- Prompt injection attempts.
- Cross-tenant data access attempts.
- Origin spoofing attempts.
- CRM token storage and rotation.
- PII logging scans.
- OWASP top 10 checks for admin surfaces.
- Dependency vulnerability scanning.

## 9. Implementation Plan

### Phase 0: Product And Technical Setup, 1-2 Days

- Confirm beta scope and out-of-scope items.
- Select first CRM provider, HubSpot recommended for MVP.
- Select enrichment provider and define fallback behavior.
- Define lead profile schema and CRM field mapping.
- Draft consent language and privacy disclosure.
- Create low-fidelity widget and CRM summary mockups.

### Phase 1: Widget And Conversation Core, 4-6 Days

- Build script loader and widget UI.
- Create widget configuration endpoint.
- Create session and conversation APIs.
- Implement AI orchestration with structured extraction.
- Store transcripts and extracted fields.
- Implement fallback form.
- Track core analytics events.

### Phase 2: Lead Profile, Enrichment, And Scoring, 4-6 Days

- Create lead profile service and database tables.
- Implement completion endpoint.
- Add enrichment job queue and provider adapter.
- Normalize enrichment responses.
- Add ICP scoring and score rationale.
- Add profile completeness calculation.
- Add internal lead detail view or operational export.

### Phase 3: CRM Sync And Routing, 4-6 Days

- Build HubSpot OAuth or private app credential flow for beta.
- Implement field mapping.
- Implement dedupe logic.
- Create contact/company/deal or lead sync.
- Implement routing rules and fallback queue.
- Add Slack or email notification for high-priority leads.
- Add CRM sync retries and failure alerts.

### Phase 4: Admin Configuration And Beta Operations, 3-5 Days

- Build internal operator configuration UI.
- Add draft/publish versioning for widget configs.
- Add tenant allowed domains.
- Add test conversation preview.
- Add routing rule configuration.
- Add sync status and enrichment status views.

### Phase 5: QA, Security, And Beta Launch, 3-5 Days

- Complete unit, integration, and e2e tests.
- Run accessibility and mobile QA.
- Run performance tests on sample pages.
- Verify PII redaction and audit logs.
- Install for first beta client.
- Monitor daily and iterate on conversation questions.

### Dependencies

**Blocking Dependencies**
- CRM sandbox access.
- Enrichment provider API access.
- LLM provider access and approved model.
- Consent and privacy copy.
- Beta client website domain access.
- CRM field mapping decisions.

**Parallel Work**
- Widget UI and backend APIs.
- CRM field mapping and enrichment provider adapter.
- Conversation prompt design and ICP scoring.
- Analytics event schema and dashboard setup.

**External Dependencies**
- Enrichment provider uptime, rate limits, pricing, and data coverage.
- HubSpot API limits and object model constraints.
- Client website tag manager or developer support.
- Client CRM admin permissions.

### Risk Assessment

**Technical Risks**
- LLM responses are slow, inconsistent, or too expensive.
- Enrichment data is inaccurate or incomplete.
- CRM object models differ significantly by client.
- Widget conflicts with client site CSS or scripts.
- Prompt injection or privacy issues expose hidden logic.

**Timeline Risks**
- Client CRM access takes longer than expected.
- Legal review delays consent copy.
- Beta clients require custom routing logic.
- Enrichment provider selection takes longer than expected.

**Mitigation Strategies**
- Use structured output and deterministic validators outside the LLM.
- Start with HubSpot-only beta implementation.
- Keep enrichment async and non-blocking.
- Use manual operator setup for first five clients.
- Version every widget configuration and prompt policy.
- Provide fallback form and manual review queue.
- Track API cost per tenant from day one.

### Out Of Scope For MVP Beta

- Full self-serve signup and onboarding.
- Native Salesforce production support.
- Advanced multi-language conversations.
- Real-time live chat handoff.
- Automated outbound ICP campaigns.
- Monthly intelligence report generation.
- Billing and subscription management.
- Public API for customers.

## 10. Success Metrics And Monitoring

### Feature Adoption Metrics

- Widget installs by tenant.
- Widget load count.
- Widget open rate.
- Conversation start rate.
- Conversation completion rate.
- Fallback form usage rate.
- Completed qualified leads by tenant.
- Repeat usage across pages and campaigns.

### Lead Quality Metrics

- Required field completion rate.
- Profile completeness score.
- ICP score distribution.
- Enrichment match rate.
- Low-confidence enrichment rate.
- Manual review rate.
- High-priority lead volume.

### Technical Metrics

- Widget loader latency.
- Conversation API latency.
- LLM provider latency and error rate.
- Enrichment job duration and error rate.
- CRM sync success rate.
- CRM sync retry count.
- API cost per conversation.
- Enrichment cost per qualified lead.
- Queue depth and job age.

### Business Impact Metrics

- Speed-to-lead before and after Deal Threads.
- Manual research time saved per lead.
- Qualified meeting conversion rate.
- MQL-to-SQL conversion rate.
- Pipeline created from Deal Threads leads.
- Closed-won revenue from Deal Threads-sourced or Deal Threads-enriched leads.
- Sales rep satisfaction.
- Support or RevOps ticket reduction related to lead quality.

### Monitoring Setup

**Analytics Events**
- `widget_loaded`
- `widget_opened`
- `conversation_started`
- `message_sent`
- `field_captured`
- `consent_accepted`
- `conversation_completed`
- `lead_profile_created`
- `enrichment_started`
- `enrichment_completed`
- `enrichment_failed`
- `icp_scored`
- `crm_sync_started`
- `crm_sync_completed`
- `crm_sync_failed`
- `lead_routed`
- `meeting_cta_clicked`
- `fallback_form_submitted`

**Alerts**
- CRM sync failure rate above 2% over 30 minutes.
- Conversation API p95 latency above 5 seconds over 15 minutes.
- LLM provider error rate above 5% over 15 minutes.
- Enrichment queue job age above 10 minutes.
- Widget config error for any active tenant.
- Cross-tenant authorization denial spike.

**Dashboards**
- Beta client health dashboard.
- Conversation funnel dashboard.
- Lead quality dashboard.
- CRM sync operations dashboard.
- Cost and provider usage dashboard.
- Sales outcome dashboard after CRM outcome data is available.

## Definition Of Done

- Widget can be installed with one script tag on an allowed beta client domain.
- Visitor can complete a qualification conversation on desktop and mobile.
- Required lead fields are extracted into a structured profile.
- Consent record is stored before personal data processing.
- Enrichment runs asynchronously and records source/confidence.
- ICP score and score rationale are generated.
- Lead profile syncs to HubSpot with mapped fields and activity summary.
- Routing assigns owner or fallback queue.
- High-priority lead notification is sent.
- Analytics events are emitted for the full funnel.
- Error, fallback, and abandonment states are tested.
- Logs redact sensitive visitor data.
- Admin/operator can configure and publish widget settings for a beta client.

## Implementation Notes For The Development Team

- Optimize for beta learning speed over broad platform flexibility.
- Keep provider adapters behind interfaces so enrichment and CRM vendors can change later.
- Treat HubSpot as the first concrete CRM implementation, not the whole abstraction.
- Keep AI prompts, question policies, and scoring rules versioned because they will change weekly during beta.
- Store transcript summaries separately from raw transcripts to reduce what reps need to read.
- Build manual review paths for low-confidence enrichment rather than over-automating early.
- Instrument cost and quality from the first tenant; API costs are a known risk for this business model.
- Design every external write operation to be idempotent.
- Preserve a clean distinction between first-party visitor statements, AI inferences, and third-party enrichment.
