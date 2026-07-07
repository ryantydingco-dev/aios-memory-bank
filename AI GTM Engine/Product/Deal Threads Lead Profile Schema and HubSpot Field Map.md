# Deal Threads Lead Profile Schema And HubSpot Field Map

Last updated: 2026-06-01  
Owner: Product / Engineering / RevOps  
Status: Beta-ready draft  
Target CRM for MVP: HubSpot

## Purpose

This document defines the canonical Deal Threads lead profile and how it maps into HubSpot for the MVP beta. The goal is to make the output of the AI widget useful to sales reps while preserving CRM data integrity.

## Data Principles

- Deal Threads is the system of record for conversation transcript, extraction metadata, enrichment job history, and source/confidence.
- HubSpot is the system of action for reps.
- Visitor-provided fields, AI-inferred fields, and third-party-enriched fields must be distinguishable.
- Unknown fields should remain unknown. Do not guess.
- CRM writes must be idempotent.
- Customer-owned CRM fields must not be overwritten unless explicitly mapped and approved.
- Every synced profile must include a human-readable summary.

## Lead Profile Lifecycle

| Status | Meaning | CRM Action |
| --- | --- | --- |
| `draft` | Conversation in progress. | No CRM sync by default. |
| `partial` | Contact plus some context captured. | Optional sync to nurture queue. |
| `qualified` | Required qualification fields captured. | Sync and route. |
| `low_priority` | Low commercial intent or poor fit. | Sync as low priority or suppress by tenant config. |
| `manual_review` | Conflicting, low-confidence, or integration issue. | Sync if safe; alert operator. |
| `synced` | CRM write completed. | Store CRM object IDs. |
| `sync_failed` | CRM write failed after retries. | Alert operator. |
| `deleted` | Deleted or anonymized by request. | Remove or anonymize Deal Threads-owned data. |

## Canonical Lead Profile v1

```json
{
  "id": "lead_123",
  "tenant_id": "ten_123",
  "widget_id": "wid_123",
  "conversation_id": "con_123",
  "status": "qualified",
  "created_at": "2026-06-01T15:00:00Z",
  "updated_at": "2026-06-01T15:03:00Z",
  "source": {
    "page_url": "https://example.com/pricing",
    "referrer": "https://linkedin.com",
    "utm_source": "linkedin",
    "utm_medium": "paid_social",
    "utm_campaign": "demo-routing-q3",
    "widget_config_version": 7
  },
  "consent": {
    "accepted": true,
    "accepted_at": "2026-06-01T15:01:00Z",
    "policy_version": "2026-06-01",
    "source_url": "https://example.com/pricing",
    "region": "US"
  },
  "contact": {
    "name": "Jordan Lee",
    "first_name": "Jordan",
    "last_name": "Lee",
    "email": "jordan@example.com",
    "phone": null,
    "role": "VP Sales",
    "seniority": "vp",
    "authority_signal": "decision_owner",
    "linkedin_url": null,
    "source": "visitor"
  },
  "company": {
    "name": "ExampleCo",
    "domain": "example.com",
    "website": "https://example.com",
    "industry": "B2B SaaS",
    "employee_range": "101-250",
    "revenue_range": null,
    "country": "United States",
    "source": "mixed"
  },
  "qualification": {
    "business_need": "Improve demo routing and reduce slow follow-up",
    "pain_point": "High-intent demo requests are reaching reps without context",
    "product_interest": "AI lead enrichment widget",
    "timeline": "this_quarter",
    "urgency_score": 4,
    "budget_status": "likely",
    "budget_range": "30k_60k",
    "buying_stage": "vendor_evaluation",
    "crm": "hubspot",
    "sales_stack": ["HubSpot", "Chili Piper"],
    "integration_need": "HubSpot contact and company sync"
  },
  "enrichment": {
    "status": "completed",
    "completed_at": "2026-06-01T15:02:30Z",
    "provider": "provider_name",
    "confidence": 0.84,
    "company_size": {
      "value": "101-250",
      "source": "provider_name",
      "confidence": 0.86
    },
    "tech_stack": [
      {
        "value": "HubSpot",
        "category": "CRM",
        "source": "provider_name",
        "confidence": 0.81
      }
    ],
    "funding_events": [],
    "decision_makers": []
  },
  "score": {
    "icp_fit": 87,
    "priority": "high",
    "segment": "mid_market_b2b",
    "rationale": [
      "Matches target employee range",
      "Timeline is this quarter",
      "CRM integration need confirmed",
      "Budget likely"
    ],
    "disqualifiers": []
  },
  "routing": {
    "route_type": "sales",
    "assigned_owner_email": "ae@example.com",
    "queue": "inbound_high_priority",
    "rule_id": "route_123",
    "recommended_next_action": "Call within 15 minutes with demo-routing angle"
  },
  "crm": {
    "provider": "hubspot",
    "sync_status": "synced",
    "synced_at": "2026-06-01T15:03:00Z",
    "contact_id": "12345",
    "company_id": "67890",
    "deal_id": "24680",
    "last_error": null
  },
  "summary": {
    "rep_summary": "Jordan Lee, VP Sales at ExampleCo, is evaluating ways to improve demo routing this quarter. They use HubSpot and likely have budget in the $30K-$60K annual range. Recommended next action: call within 15 minutes and lead with reducing slow follow-up from high-intent demo requests.",
    "visitor_facts": [
      "Wants to improve demo routing",
      "Timeline is this quarter",
      "Uses HubSpot"
    ],
    "enriched_facts": [
      "Company appears to be 101-250 employees",
      "CRM detected as HubSpot"
    ],
    "watchouts": []
  }
}
```

## Required Fields By Stage

### Minimum Partial Lead

- `tenant_id`
- `conversation_id`
- `source.page_url`
- `consent.accepted`
- `contact.email` or `contact.phone`
- `qualification.business_need`

### Qualified Lead

- All minimum partial fields.
- `company.name` or `company.domain`.
- `qualification.timeline` or `qualification.urgency_score`.
- `summary.rep_summary`.
- `score.icp_fit`.
- `routing.route_type`.

### High-Priority Lead

- All qualified fields.
- `score.priority = high`.
- `routing.assigned_owner_email` or `routing.queue`.
- CRM sync attempted.
- Notification attempted.

## Enumerations

### `timeline`

- `this_week`
- `this_month`
- `this_quarter`
- `later_this_year`
- `researching`
- `unknown`

### `budget_status`

- `approved`
- `likely`
- `building_case`
- `none`
- `unknown`

### `budget_range`

- `under_10k`
- `10k_30k`
- `30k_60k`
- `60k_plus`
- `unknown`

### `authority_signal`

- `decision_owner`
- `influencer`
- `researcher`
- `consultant`
- `unknown`

### `priority`

- `high`
- `medium`
- `low`
- `manual_review`

## Source And Confidence Rules

Every field that can come from multiple places should include source metadata.

Valid source values:

- `visitor`
- `ai_inferred`
- `enrichment_provider`
- `crm`
- `operator`
- `mixed`

Confidence values:

- `0.90-1.00`: High confidence.
- `0.70-0.89`: Usable, show source.
- `0.50-0.69`: Low confidence, show as needs review.
- `< 0.50`: Do not sync as fact; store only in raw enrichment payload.

## HubSpot Object Strategy

### MVP Recommendation

Use standard HubSpot objects:

- Contact: person-level information.
- Company: account-level information.
- Deal: optional, created only for high-priority qualified opportunities if the beta client wants pipeline creation.
- Note / Engagement: Deal Threads summary and transcript link.

Avoid a custom HubSpot object for MVP unless the beta client already uses custom lead objects heavily.

## HubSpot Contact Field Map

| Deal Threads Field | HubSpot Field | Type | Write Rule | Notes |
| --- | --- | --- | --- | --- |
| `contact.email` | `email` | Standard | Create/update key | Primary dedupe key. |
| `contact.first_name` | `firstname` | Standard | Fill if empty | Do not overwrite unless configured. |
| `contact.last_name` | `lastname` | Standard | Fill if empty | Do not overwrite unless configured. |
| `contact.phone` | `phone` | Standard | Fill if empty | Optional. |
| `contact.role` | `jobtitle` | Standard | Fill if empty | Use visitor-provided only. |
| `contact.authority_signal` | `deal_threads_authority_signal` | Custom | Always update | Deal Threads-owned. |
| `qualification.timeline` | `deal_threads_timeline` | Custom | Always update | Enum. |
| `qualification.budget_status` | `deal_threads_budget_status` | Custom | Always update | Enum. |
| `qualification.budget_range` | `deal_threads_budget_range` | Custom | Always update | Enum. |
| `qualification.business_need` | `deal_threads_business_need` | Custom | Always update | Long text. |
| `qualification.pain_point` | `deal_threads_pain_point` | Custom | Always update | Long text. |
| `score.icp_fit` | `deal_threads_icp_score` | Custom | Always update | Number 0-100. |
| `score.priority` | `deal_threads_priority` | Custom | Always update | Enum. |
| `routing.recommended_next_action` | `deal_threads_next_action` | Custom | Always update | Long text. |
| `source.page_url` | `deal_threads_source_page` | Custom | Always update | URL. |
| `source.utm_campaign` | `deal_threads_utm_campaign` | Custom | Always update | Text. |
| `crm.sync_status` | `deal_threads_sync_status` | Custom | Always update | Operational. |

## HubSpot Company Field Map

| Deal Threads Field | HubSpot Field | Type | Write Rule | Notes |
| --- | --- | --- | --- | --- |
| `company.domain` | `domain` | Standard | Create/update key | Secondary dedupe key. |
| `company.name` | `name` | Standard | Fill if empty | Prefer CRM value if present. |
| `company.industry` | `industry` | Standard/custom | Fill if empty | Use mapped tenant field. |
| `company.employee_range` | `deal_threads_employee_range` | Custom | Always update | Enriched or visitor-provided. |
| `company.revenue_range` | `deal_threads_revenue_range` | Custom | Update if confidence >= 0.70 | Optional. |
| `enrichment.tech_stack` | `deal_threads_tech_stack` | Custom | Always update | Semicolon-separated list. |
| `enrichment.funding_events` | `deal_threads_recent_funding` | Custom | Update if available | Long text. |
| `score.segment` | `deal_threads_icp_segment` | Custom | Always update | Text or enum. |

## HubSpot Deal Field Map

Deal creation is optional for MVP. Default behavior should create a deal only when the client explicitly wants qualified inbound opportunities converted into pipeline immediately.

| Deal Threads Field | HubSpot Field | Type | Write Rule | Notes |
| --- | --- | --- | --- | --- |
| `company.name + product_interest` | `dealname` | Standard | Create only | Example: `ExampleCo - AI Lead Enrichment`. |
| `qualification.budget_range` | `amount` | Standard | Optional | Use midpoint only if client approves. |
| `qualification.timeline` | `closedate` | Standard | Optional | Map approximate date only if configured. |
| `score.priority` | `deal_threads_priority` | Custom | Always update | Deal Threads-owned. |
| `summary.rep_summary` | Note engagement | Engagement | Always create | Better than packing into deal field. |

## Custom HubSpot Properties To Create

### Contact Properties

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

### Company Properties

- `deal_threads_employee_range`
- `deal_threads_revenue_range`
- `deal_threads_tech_stack`
- `deal_threads_recent_funding`
- `deal_threads_icp_segment`
- `deal_threads_enrichment_status`
- `deal_threads_enrichment_confidence`

### Deal Properties, Optional

- `deal_threads_priority`
- `deal_threads_icp_score`
- `deal_threads_lead_profile_id`
- `deal_threads_next_action`

## Dedupe Logic

### Contact Dedupe

1. Match HubSpot contact by exact normalized email.
2. If no match and phone exists, optionally search by phone if tenant approves.
3. If no match, create new contact.
4. Store HubSpot `contact_id` on the Deal Threads lead profile after sync.

### Company Dedupe

1. Match HubSpot company by domain.
2. If no domain, search by normalized company name.
3. If multiple matches, mark `manual_review`.
4. If no match and company name or domain exists, create company.
5. Associate contact with company.

### Deal Dedupe

1. If deal creation is enabled, search open deals for same associated company and similar product interest.
2. If open deal exists, add note instead of creating duplicate.
3. If no open deal, create deal in configured pipeline and stage.

## Overwrite Rules

### Always Safe To Update

These are Deal Threads-owned fields:

- All fields prefixed `deal_threads_`.
- Deal Threads activity notes.
- Deal Threads transcript links.

### Fill If Empty

These fields may already be customer-owned:

- `firstname`
- `lastname`
- `phone`
- `jobtitle`
- `company.name`
- `company.industry`

### Do Not Overwrite By Default

- Contact owner.
- Lifecycle stage.
- Lead status.
- Deal stage.
- Original source.
- Existing amount.
- Existing close date.

## HubSpot Activity Note Template

```text
Deal Threads AI Lead Profile

Priority: [priority] ([icp_score]/100)
Recommended next action: [recommended_next_action]

Intent:
[intent summary]

Qualification:
- Pain: [pain_point]
- Timeline: [timeline]
- Budget: [budget_status] / [budget_range]
- Authority: [role] / [authority_signal]
- Stack: [crm and sales_stack]

Source:
- Page: [source.page_url]
- Campaign: [utm_campaign]

Visitor-provided facts:
- [fact 1]
- [fact 2]

Enriched context:
- [fact 1]
- [fact 2]

Watchouts:
- [missing or low-confidence data]

Deal Threads profile ID: [lead_profile_id]
```

## Routing Fields

Routing should evaluate:

- ICP score.
- Timeline.
- Budget status.
- Company employee range.
- Industry.
- CRM or integration need.
- Region.
- Existing customer status from CRM.
- Contact owner from CRM.
- Page source or campaign.

Default rules:

1. Existing customer routes to customer success.
2. Support request routes to support.
3. High ICP plus active timeline routes to sales owner or high-priority queue.
4. Medium ICP routes to SDR queue.
5. Low fit routes to nurture or suppresses notification.
6. Unmatched routes to manual review.

## Validation Requirements

- Email must pass syntax validation.
- Work email preferred; personal email allowed only with company name or website.
- Phone normalized to E.164 when possible.
- URL and domain normalized before dedupe.
- Enum values must match schema.
- Long text fields should be trimmed to HubSpot limits.
- Activity note should stay under HubSpot engagement limits.
- CRM sync request must include `tenant_id` and `lead_profile_id`.

## Example Minimum CRM Payload

```json
{
  "contact": {
    "email": "jordan@example.com",
    "firstname": "Jordan",
    "lastname": "Lee",
    "jobtitle": "VP Sales",
    "deal_threads_authority_signal": "decision_owner",
    "deal_threads_timeline": "this_quarter",
    "deal_threads_budget_status": "likely",
    "deal_threads_budget_range": "30k_60k",
    "deal_threads_business_need": "Improve demo routing and reduce slow follow-up",
    "deal_threads_icp_score": 87,
    "deal_threads_priority": "high",
    "deal_threads_next_action": "Call within 15 minutes with demo-routing angle",
    "deal_threads_source_page": "https://example.com/pricing",
    "deal_threads_lead_profile_id": "lead_123"
  },
  "company": {
    "domain": "example.com",
    "name": "ExampleCo",
    "deal_threads_employee_range": "101-250",
    "deal_threads_tech_stack": "HubSpot; Chili Piper",
    "deal_threads_enrichment_status": "completed",
    "deal_threads_enrichment_confidence": 0.84
  }
}
```

## QA Checklist

- Contact creates correctly when email is new.
- Contact updates correctly when email already exists.
- Company creates correctly when domain is new.
- Company association works.
- Protected fields are not overwritten.
- Deal Threads-owned custom fields update on repeat sync.
- Activity note is readable.
- Low-priority lead does not trigger urgent notification.
- High-priority lead routes correctly.
- Failed sync retries and alerts operator.
- Sync is idempotent when same lead profile is retried.

