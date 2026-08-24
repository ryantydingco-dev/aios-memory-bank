# DealThreads — Feature Specification
## Conversational Buyer-Profile Widget

| Field | Value |
|---|---|
| Document version | 1.1 (Draft for development — post-QA consistency cleanup) |
| Date | 2026-06-01 |
| Feature category | Core |
| Priority level | Must-Have |
| Target release | MVP Beta v0.1 (5 managed beta clients, 2-4 week build) |

**In scope:** Single <script> tag embeddable widget (Shadow-DOM isolated) that replaces or augments a static contact form on eligible pages, with tenant-configurable branding, welcome copy, and a fallback form when AI is unavailable.; Adaptive AI qualification conversation that captures intent/business need, budget range, timeline, authority signal, company, and role, with deterministic validation and structured field extraction outside the LLM.; Asynchronous enrichment layer that pulls firmographic (company size, industry, revenue range, funding) and technographic (tech-stack) signals plus decision-maker hints, attaching source and confidence to every enriched field.; Transparent weighted ICP fit scoring (0-100) with a score rationale, segment label, and recommended next action that never counts unknown fields as positive evidence.; Rule-based intelligent routing to the matching rep or fallback queue plus a high-priority notification, and idempotent CRM sync to HubSpot (first) and Salesforce (second adapter) writing a DealThreads summary, mapped fields, and an activity note.; Full funnel instrumentation: an analytics event pipeline from widget load through CRM sync to closed-won, with the conversation flow versioned and iterable and per-question deal-quality attribution tracked.; Internal operator/admin configuration UI with draft/publish versioning, allowed-domain controls, consent copy, CRM field mapping, and routing rules, since the first 5 clients are onboarded manually.

**Out of scope (this release):** Full self-serve signup, billing, subscription management, and a public customer-facing API.; Premium-tier capabilities deferred past MVP: automated outbound ICP campaigns and monthly intelligence reports on tech-stack changes and funding rounds (these define the $5,000/mo premium tier, not the v0.1 core).; Real-time human live-chat handoff and multi-language conversation support.; Native production-grade Salesforce support beyond a designed adapter (HubSpot is the only fully exercised CRM in the beta; Salesforce ships as the second integration once HubSpot stabilizes).; Enrichment of sensitive personal traits unrelated to B2B qualification, and any data category prohibited by the configured privacy policy.

---

## Table of Contents
1. Feature Overview
2. User Personas & Use Cases
3. Detailed User Stories
4. Functional Requirements
5. Non-Functional Requirements
6. Technical Specifications
7. User Interface Specifications
8. Testing Requirements
9. Implementation Plan
10. Success Metrics & Monitoring
- Appendix A — Specification Quality Review
- Appendix B — Glossary

---

### 1. FEATURE OVERVIEW

**Feature Name**: Conversational Buyer-Profile Widget

**Feature Category**: Core

**Priority Level**: Must-Have

**Target Release**: MVP Beta v0.1 (5 managed beta clients, 2-4 week build)

**Problem Statement**: Mid-market B2B teams running $10K+ deals collect leads through static contact forms that yield almost no sales context: a name, an email, a company, and a vague message. Before a rep can act, they spend 10-20 minutes manually researching company size, the buyer's role and authority, intent, budget, timeline, recent funding, and tech stack. During that lag the highest-intent buyers cool off and faster competitors win the meeting. The market gap is structural: Drift exited and Qualified moved upmarket, leaving mid-market companies with no managed service that does conversational capture, enrichment, scoring, routing, and CRM sync as one integrated motion. Existing point tools — Intercom, Chili Piper, Clearbit, Drift, Qualified — each do one slice of chat, routing, or enrichment, but none deliver all of it as a single managed mid-market service. DealThreads closes that gap by replacing the static form with an embeddable AI chat widget (single `<script>` tag install) that converses to capture intent/budget/timeline, enriches firmographic and technographic signals behind the scenes, assembles a scored buyer profile, routes it to the right rep, and syncs it to the client's CRM (HubSpot first, Salesforce second), so the rep opens every lead with a full profile at first contact. The decisive bet is on cycle time: enriched context only matters if reps working AI-built profiles close faster than reps working raw form submissions. This is the explicit decision rule for the product — if the enriched profiles add context but cycle time does not move, the **Conversation Flow** is what gets reworked first, not the enrichment stack.

**Success Criteria**:
- **Install and run for 5 managed beta clients**: Stand up the widget for all 5 beta tenants (each with HubSpot or Salesforce connected) within the 2-4 week beta window, replacing or sitting alongside their existing static contact form on a limited set of eligible pages.
- **In-window leading indicators of faster close (headline acceptance bar)**: Because $25K-$80K mid-market deals run 1-3+ month sales cycles, closed-won outcomes typically will not land inside the 2-4 week beta. The release-measurable bar is therefore a set of leading indicators that the AI-built profile accelerates the early funnel: at least a 15% improvement in *Qualified Meeting Conversion Rate* over each client's static-form baseline, plus faster time-to-first-meeting and stronger early stage-progression velocity on DealThreads-sourced leads versus form-sourced leads. These are the indicators that must move at release.
- **North-star cycle-time reduction (≥ 20%, post-beta / cohort-maturation metric)**: Achieve at least a 20% reduction in median *Cycle Time: Widget-Complete to Closed-Won* versus each client's pre-DealThreads contact-form baseline. This is the product's north star, but it is explicitly designated a post-beta metric measured once the beta cohort's deals mature to closed-won; it is tracked and instrumented from day one but is not an in-window acceptance bar.
- **Conversation completion ≥ 75% and required-field capture ≥ 85%**: Reach at least a 75% *Conversation Completion Rate* among visitors who start the qualification flow, and capture all required qualification fields (consent, work email, business need, timeline/urgency) on at least 85% of completed conversations (*Required Field Capture Rate*).
- **CRM sync ≥ 98% and speed-to-profile ≤ 2 min p95**: Sync at least 98% of completed lead profiles into the connected CRM with no manual intervention (*CRM Sync Success Rate*), and deliver the enriched, scored profile to the assigned rep within 2 minutes p95 of conversation completion (*Speed-to-Profile / Time-to-Rep*).
- **≥ 3 deal-quality predictive questions identified**: Identify at least 3 conversation questions whose captured answers are statistically associated with downstream deal quality (closed-won or stage progression), validating that the **Conversation Flow** is instrumented and iterable per the decision rule (*Deal-Quality Predictive Questions Identified*).
- **~25% pilot-to-paid, cost ceiling held, churn < 10%**: Hit ~25% *Pilot-to-Paid Conversion* across the beta cohort while holding *Cost per Qualified Lead (LLM + Enrichment)* under the tracked $3.50 ceiling and keeping *Logo Churn Rate* under 10% annualized.

**User Impact**: Website visitors (the widget end-user) get a faster, more helpful intake than a long static form — they answer a short adaptive conversation, accept a clear consent disclosure before any personal data is collected, and learn exactly who will follow up and when before they leave the page. Sales reps (SDRs/AEs) open each CRM record to a ready-made **Buyer Profile (Lead)** — an intent summary, an **ICP Fit Score** with rationale, **Enrichment Coverage** highlights with source and confidence, and a recommended first action — eliminating 10-20 minutes of pre-call research. Because the enriched, scored profile is *delivered to the rep within 2 minutes* of conversation completion (the *Speed-to-Profile* SLA), the rep can reach hot leads while intent is still high rather than after the research lag — though, as the after-hours edge case shows, the 2-minute target is the delivery SLA to the rep, not a guarantee of human response within 2 minutes. Sales coordinators stop hand-routing and de-duplicating thin form fills because **Routing Rules** guarantee every qualified lead resolves to a named owner or fallback queue, and **Idempotent CRM Sync** prevents duplicate records. RevOps/GTM leaders (the economic buyer) gain cleaner pipeline data, transparent routing controls, instrumented conversation analytics that show which questions predict deal quality, and a defensible cycle-time improvement they can attribute to DealThreads. The compounding effect is a measurably shorter path from first touch to closed deal — the *Cycle Time* metric the entire product is optimized against.

### 2. USER PERSONAS & USE CASES

**Primary Persona**: **Maya Chen — Director of RevOps (economic buyer)**

- **Demographics**: 34 years old; works at a 180-employee B2B SaaS company selling $25K-$80K annual contracts; owns CRM hygiene, lead routing, attribution, and sales-process efficiency; medium-to-high technical fluency; reports to the VP of Sales/CRO and holds the budget for the $2,500/mo core and $5,000/mo premium tiers (plus the $500 pilot setup fee).
- **Goals**:
  - Shorten *Cycle Time* from inbound submission to closed-won and prove it with attribution data she can show the CRO.
  - Improve *Speed-to-Lead* and CRM data quality so reps stop ignoring thin, low-context leads.
  - Route high-intent, high-fit leads to the right rep automatically with transparent, auditable **Routing Rules**.
  - Show a defensible ROI story (faster close, cleaner pipeline) that justifies renewal and the premium upsell.
- **Pain Points**:
  - Static forms produce four thin fields, so reps spend 10-20 minutes researching every lead and the best ones cool off.
  - CRM fields are inconsistent and routing is manual, creating leakage and slow follow-up.
  - Existing point tools (Intercom, Chili Piper, Clearbit, Drift, Qualified) each do one slice of chat/routing/enrichment, but none deliver it as one managed mid-market service.
  - Enrichment vendors are expensive and noisy, and she cannot easily tell which captured signals actually predict deal quality.
- **Context**: Evaluates DealThreads in a $500 pilot on a limited set of pages. During onboarding she configures the **WidgetConfig** (branding, **Question Policy**, consent copy), CRM field mapping, and **Routing Rules** alongside the DealThreads CSM through the operator/admin console, using draft/publish versioning so changes are reviewed before going live. Because she watches the in-window leading indicators — *Qualified Meeting Conversion Rate*, time-to-first-meeting, and stage-progression velocity — she can read early signal before deals mature to closed-won. She monitors lead quality and these indicators weekly via the funnel analytics endpoint (`GET /api/v1/admin/tenants/{tenantId}/analytics/funnel`) and reviews outcomes with sales leadership before deciding pilot-to-paid; the ≥ 20% *Cycle Time* north star is tracked as a post-beta cohort-maturation metric. She is the person who acts on the decision rule: if the leading indicators are not moving, she works with the CSM to iterate the **Conversation Flow**.

**Secondary Persona**: **Marcus Reed — Account Executive / SDR (daily user, profile consumer)**

- **Demographics**: 29 years old; lives in HubSpot/Salesforce all day; measured on booked meetings, pipeline created, and response time; carries 40-70 active leads; moderate technical fluency.
- **Goals**:
  - Open each lead already knowing who they are, why they came in, and what to say first.
  - Prioritize the highest-fit, highest-urgency leads (by **ICP Fit Score**) instead of triaging raw form fills.
  - Personalize the first touch immediately while buyer **Intent Signal** is still hot.
  - Close faster from richer context — the behavior the north-star *Cycle Time* metric rewards.
- **Use Case**: Marcus receives a high-priority routed-lead notification in Slack or email after the profile is delivered (the *Speed-to-Profile* SLA targets delivery within 2 minutes of conversation completion). He opens the DealThreads **Buyer Profile (Lead)** card inside HubSpot/Salesforce (backed by `GET /api/v1/leads/{leadProfileId}`) and scans the intent summary, **ICP Fit Score** with rationale, **Enrichment Coverage** highlights, source page, and recommended next action in under 30 seconds, then makes a contextual first-contact call while the cycle-time clock runs. Low-confidence or `needs_review` enrichment fields are clearly flagged so he knows exactly what to verify rather than risk mistargeted outreach.

**Secondary Persona**: **Priya Nair — Prospective Buyer / High-Intent Website Visitor (widget end-user)**

- **Demographics**: 41 years old; VP-level operator or department leader at a mid-market company researching a B2B solution; mixed technical fluency; arrives on a pricing, demo, product, or use-case page, often via a LinkedIn campaign (UTM-tagged).
- **Goals**:
  - Quickly describe the problem she needs solved and get routed to the right person.
  - Avoid long, repetitive form fields and irrelevant chatbot scripts.
  - Understand the next step and the expected response time before leaving the page.
  - Know what data is being collected and feel in control of it.
- **Use Case**: Priya lands on the pricing page and the Shadow-DOM widget loads non-blockingly in place of the static form, fetching the published **WidgetConfig** via `GET /api/v1/widgets/{widgetId}/config` (the `widgetId` path parameter resolves to the published `WidgetConfig.id` — there is no separate Widget entity in the data model) and rendering page/campaign-aware welcome copy. She opens it (creating an anonymous **ConversationSession** via `POST /api/v1/widget-sessions`) and answers a short adaptive flow about her need, timeline, and company, with each turn processed by `POST /api/v1/conversations/{conversationId}/messages`. Before any personal data is collected she is shown a clear consent disclosure; on acceptance she provides a work email, and on completion sees a confirmation stating who will follow up and when. She may abandon early, use a personal email, or ask an off-topic question — all of which the widget must handle gracefully, including showing the **Fallback Form** if the AI service is unavailable.

**Secondary Persona**: **Devin Brooks — Sales Coordinator / SDR Manager (routing and hygiene owner)**

- **Demographics**: 37 years old; oversees inbound lead distribution, SLA adherence, and queue fairness for a 6-10 rep team; high CRM fluency; partners closely with RevOps (Maya).
- **Goals**:
  - Ensure every qualified lead reaches a named owner or a fallback queue with no drops.
  - Enforce fast follow-up SLAs on high-priority leads.
  - Keep the CRM free of duplicates and mis-assigned records.
  - Spot **Routing Rules** that misfire and adjust them quickly.
- **Use Case**: Devin uses the operator/admin console and CRM views to monitor routing outcomes (`POST /api/v1/routing/evaluate`) and **CrmSyncRecord** sync health across the team. He receives operations alerts when a CRM sync fails or an OAuth token expires, relies on **Idempotent CRM Sync** and dedupe (by email, then domain + company name) so protected fields like lifecycle stage and owner are never overwritten without explicit config, and works with Maya during the beta to refine **Routing Rules**, consent copy, and field mapping. He confirms via analytics that high-priority leads hit their follow-up SLA and that the fallback queue is catching anything the priority-ordered rules miss — including the nurture/fallback queue that low-fit, disqualified leads are routed to.

**Edge Cases**:
- **Visitor abandons mid-conversation**: Priya leaves before completing the flow. The **ConversationSession** is persisted with a non-completed status and the partial `extractedFieldsJson` from each **ConversationMessage** is retained for analytics so abandonment points feed *Conversation Completion Rate* and **Conversation Flow** iteration. Per the canonical rule (Section 4.1), an abandoned session never creates a **Lead** — only an explicit completion (finishing the conversation, or submitting the **Fallback Form**) does. Whatever was captured before she left, including consent and a work email if already provided, is retained on the **ConversationSession** for operator review and **Conversation Flow** analysis, but it does not enter the Lead/score/route/sync pipeline and no CRM sync fires. The conversation never demands contact details before they have been earned.
- **Enrichment provider returns no or partial match**: `POST /api/v1/leads/{leadProfileId}/enrich` queues the async enrichment job; Clearbit is queried first, with the secondary enrichment provider as the decision-maker/contact fallback. On no match or a provider outage, the **EnrichmentProfile** is stored with status `unavailable` or `partial`, low-confidence fields route to `needs_review` rather than being guessed, and the **Lead** proceeds on first-party data. **Enrichment Coverage** gaps never block CRM sync, and the **ICP Fit Score** never counts unknown fields as positive evidence.
- **Low-intent, ambiguous, or disqualified visitor**: A visitor gives vague answers or is just browsing. The orchestrator captures whatever **Intent Signal** exists, the profile completes with a low **ICP Fit Score** and a Low-Fit/Disqualified segment label reflecting weak fit/urgency. Disqualified leads are still assembled, scored, routed, and synced: **Routing Rules** direct them to a nurture/fallback queue (not a high-priority rep notification), and the profile syncs to the CRM with its DealThreads summary and activity note. This keeps reps from being pulled off hot leads to chase unqualified buyers while ensuring no completed lead is silently dropped — the routing guarantee that every qualified lead resolves to a named owner extends to disqualified leads resolving to the fallback/nurture queue.
- **Bot / spam traffic**: Automated or junk traffic hits the widget. Because the first visitor message reaches Claude (a paid LLM call) before any **Lead** exists, a pre-LLM abuse gate runs first: a bot-defense challenge (Cloudflare Turnstile) at widget open plus a per-IP and per-widget request budget, evaluated before the orchestrator issues any LLM call on the first turn. Sessions that fail the challenge or exceed the budget are rejected or quarantined and never reach the model. Behind that gate, Redis rate limiting, deterministic validation of email/required fields outside the LLM, and conversation guardrails further reject or quarantine non-genuine sessions so they do not create **Lead** records, incur paid enrichment calls, or pollute *Cost per Qualified Lead* and funnel metrics. (This pre-LLM abuse gate is also specified in the Section 5 security controls.)
- **GDPR/CCPA consent declined**: Priya declines the consent disclosure. No personal data is collected or processed and no **ConsentRecord** is written. To make "anonymous, non-personal terms" actually guaranteed — since a visitor can freely type PII (name, email, employer) into a message body before any structured contact-field prompt — message persistence is suppressed or redacted while consent is absent: no `bodyEncrypted` rows containing free-text PII are retained without consent, and any pre-consent turns are dropped or PII-redacted before storage. The conversation then either ends or continues only on anonymous, non-personal terms, and nothing is enriched or synced to the CRM. When consent **is** accepted, it is captured as an immutable **ConsentRecord** (policy version, consent text, source URL, region, timestamp) to support audit and deletion workflows. Enrichment of sensitive personal traits unrelated to B2B qualification is never performed.
- **After-hours lead with no rep online**: A high-intent lead completes outside business hours. The profile is still scored, routed, and synced, with the enriched profile delivered within the 2-minute *Speed-to-Profile* SLA; **Routing Rules** assign it to an on-call owner or the fallback queue with a high-priority notification queued. Because no rep may be online to act immediately, the visitor's confirmation sets accurate response-time expectations rather than promising an instant reply — so no lead sits unassigned during the research lag even though human response may come later.
- **Duplicate of an existing CRM contact**: The visitor's email or company already exists in the CRM. **Idempotent CRM Sync** dedupes by email, then domain + company name, and updates the existing contact/company/deal using stored external object IDs in the **CrmSyncRecord** instead of creating a duplicate. Protected CRM fields (lifecycle stage, owner) are not overwritten without explicit configuration, and the DealThreads summary plus an activity note are appended so the existing owner gets the new context.

### 3. DETAILED USER STORIES

**Epic**: As a mid-market B2B go-to-market organization, we want to replace our static contact form with the Conversational Buyer-Profile Widget so that every inbound visitor is qualified through a short adaptive conversation, enriched with firmographic and technographic signals behind the scenes, scored against our ICP, routed to the right rep, and synced into HubSpot (then Salesforce) as a complete buyer profile within 2 minutes of conversation completion. The decisive outcome is cycle time: a rep working a DealThreads-assembled profile must reach closed-won at least 20% faster than a rep working a raw form submission, and if enriched context fails to move that north-star metric, the instrumented, versioned Conversation Flow is what we rework first. These seven stories span the website visitor (Priya Nair), the daily profile consumer (Marcus Reed), the routing/hygiene owner (Devin Brooks), and the economic buyer (Maya Chen), covering conversational capture, background enrichment, profile assembly and notification, intelligent routing, CRM sync, graceful degradation, and conversation-flow analytics across the MVP Beta v0.1 cohort of 5 managed clients.

**Story 1: Adaptive conversational capture of intent, budget, and timeline**
- **As a** prospective buyer / high-intent website visitor (Priya Nair)
- **I want** to describe my business need in a short adaptive chat instead of filling out a long static form, and to be asked for contact details only after the conversation has earned them
- **So that** I can quickly explain the problem I need solved, stay in control of my data, and learn who will follow up and when before I leave the page
**Acceptance Criteria**:
- Given Priya lands on an eligible pricing page from a LinkedIn campaign and opens the launcher, when the widget initializes, then `POST /api/v1/widget-sessions` creates an anonymous `ConversationSession` capturing `pageUrl`, `referrer`, and `utmJson`, and the AI's first turn asks what she is trying to solve without requesting any name, email, or phone.
- Given Priya replies in free text, when each message is sent to `POST /api/v1/conversations/{conversationId}/messages`, then the Conversation Orchestrator calls Claude (claude-sonnet) with a structured-output JSON schema, returns the next-best assistant question, and persists the deterministically extracted fields (intent/need, company, role, budget range, timeline, authority) into the turn's `extractedFieldsJson` with deterministic validators (not the LLM) enforcing email/enum/required-field checks.
- Given the conversation reaches the point of collecting personal data, when the AI requests a work email, then the consent disclosure defined in `consentJson` is shown first and Priya must accept it before any personal field is stored, and acceptance creates an immutable `ConsentRecord` with `policyVersion`, `consentText`, `sourceUrl`, and `region`.
- Given all required fields (consent + work email + business need + timeline/urgency) are captured, when `POST /api/v1/conversations/{conversationId}/complete` is called, then a `Lead` profile and `ConsentRecord` are created, `profileCompleteness` is computed, and Priya sees a confirmation stating who will follow up and the expected response time — contributing to the >= 75% Conversation Completion Rate and >= 85% Required Field Capture Rate targets.
- Given Priya abandons the conversation before completion, when no further messages arrive and the session is finalized past its idle TTL, then no `Lead` is created and no CRM sync fires — a session, not a completion, never produces a Lead (see §4.1); any first-party data captured before she left, including consent and work email if already provided, is retained on the `ConversationSession` and its messages for operator review and is never silently dropped.

**Story 2: Background firmographic and technographic enrichment**
- **As a** Director of RevOps / economic buyer (Maya Chen)
- **I want** the system to silently enrich each completed lead with company size, industry, revenue range, funding, tech-stack, and decision-maker hints, with a source and confidence on every field
- **So that** my reps open leads with verified firmographic context without 10-20 minutes of manual research, and I can trust which enriched signals are reliable enough to act on
**Acceptance Criteria**:
- Given a `Lead` is created with a work email or company domain, when `POST /api/v1/leads/{leadProfileId}/enrich` is called, then a BullMQ `EnrichmentJob` is queued, the endpoint returns the job id with HTTP 202 queued status, and the enrichment runs asynchronously so it never blocks the visitor's confirmation.
- Given the enrichment job runs, when signals are fetched, then Clearbit is queried first for firmographic and technographic data with the secondary enrichment provider as the decision-maker/contact fallback, and each returned field is normalized and stored in the `EnrichmentProfile` `resultJson` with its `provider` source and per-field `confidence`.
- Given a confident match is returned above the configured confidence threshold, when results are written, then the `EnrichmentProfile` `status` is set to `completed` or `partial`, contributing to the >= 70% Enrichment Match Rate target on enrichable leads, and the blended Claude + Clearbit/the secondary enrichment provider cost is recorded per job to keep Cost per Qualified Lead <= $3.50.
- Given Clearbit and the secondary enrichment provider return no match or a provider outage occurs, when the job resolves, then the `EnrichmentProfile` `status` is set to `unavailable` (or `needs_review` for low-confidence fields), the `Lead` proceeds on first-party conversation data alone, and CRM sync of that first-party data is never blocked by missing enrichment coverage.

**Story 3: Enriched profile assembly, ICP scoring, and rep notification**
- **As an** Account Executive / SDR (Marcus Reed)
- **I want** each routed lead delivered to me as a ready-made buyer profile with an intent summary, a transparent ICP score and rationale, enrichment highlights, and a recommended first action
- **So that** I can scan a lead in under 30 seconds, personalize my first touch while intent is hot, and close faster from richer context — the behavior the north-star cycle-time metric rewards
**Acceptance Criteria**:
- Given a completed and enriched `Lead`, when `POST /api/v1/leads/{leadProfileId}/score` runs, then the ICP Scoring Service computes a 0-100 `icpScore`, a segment label, a recommended next action, and a `scoreJson` rationale citing the specific captured and enriched fields used, and unknown or unavailable fields are never counted as positive evidence.
- Given the profile is scored and synced, when a high-priority notification fires to Marcus via Slack or email, then opening `GET /api/v1/leads/{leadProfileId}` renders a profile card showing the intent summary, ICP score with rationale, enrichment highlights, source page, transcript link, and recommended action in a single view.
- Given some enriched fields carry low confidence or `needs_review` status, when Marcus views the profile card, then those fields are clearly flagged as low-confidence so he knows exactly what to verify before outreach, preventing mistargeted contact.
- Given the profile is delivered to Marcus, when the `AnalyticsEvent` pipeline records delivery, then the enriched, scored profile reaches the assigned rep within 2 minutes p95 of conversation completion (Speed-to-Profile target) and the cycle-time clock from widget-complete toward closed-won begins, directly instrumenting the North-Star Cycle Time metric.

**Story 4: Intelligent routing to the right rep**
- **As a** sales coordinator / SDR manager (Devin Brooks)
- **I want** every completed lead automatically assigned to the matching rep or queue by transparent priority-ordered rules, with a guaranteed fallback queue and a fast-follow-up notification
- **So that** no high-intent lead sits unassigned during the research lag, SLAs are enforced, and I can see why each lead was routed where it went and fix misfiring rules quickly
**Acceptance Criteria**:
- Given a scored `Lead`, when `POST /api/v1/routing/evaluate` runs, then the Routing Service evaluates `RoutingRule` records in priority order against conditions (ICP score, territory, company size, industry, product interest), assigns the first matching owner to `assignedOwnerId`, and emits the high-priority notification payload.
- Given a completed lead does not match any rep-targeting `RoutingRule` — including a qualified lead with no matching rule and a disqualified (Low-Fit) lead — when routing resolves, then the lead is assigned to the configured fallback queue (a nurture queue in the disqualified case) so that 100% of completed leads resolve to a named owner or queue with zero drops; the routing guarantee covers every completed lead, not only qualified ones.
- Given a lead is routed to a rep, when the assignment is made, then a high-priority notification is delivered to that owner via Slack or email, and the routing decision (which rule matched and the resulting assignment) is recorded so Devin can audit routing outcomes in the operator UI.
- Given Devin observes a routing rule misfiring during the beta, when he adjusts the priority or conditions of a `RoutingRule`, then subsequent leads are evaluated against the updated rule set without affecting already-assigned leads.

**Story 5: Idempotent CRM sync to HubSpot and Salesforce**
- **As an** Account Executive / SDR (Marcus Reed)
- **I want** each enriched, scored lead written automatically into our CRM as a contact, company, and deal with a DealThreads summary and activity note, without duplicates or overwritten protected fields
- **So that** I open every lead inside HubSpot or Salesforce already complete, and I never waste time de-duplicating or distrusting records that an integration corrupted
**Acceptance Criteria**:
- Given any completed `Lead` (qualified or disqualified), when `POST /api/v1/crm/sync` runs against HubSpot (the fully exercised beta CRM, with Salesforce as the second adapter behind the same interface), then the contact/company/deal is created or updated, mapped DealThreads fields plus an activity note are written, and the external object IDs are stored in a `CrmSyncRecord` `externalObjectIdsJson`; disqualified leads sync with their Low-Fit/Disqualified segment label so reps and RevOps see them in the CRM rather than losing them.
- Given the same `Lead` is synced more than once (retry or recompute), when the sync executes, then it is keyed on tenant ID plus lead profile ID and the stored external object IDs so it is idempotent, deduping by email then domain+company name and creating no duplicate contacts, companies, or deals.
- Given the tenant has configured protected fields such as lifecycle stage or record owner, when DealThreads writes to the CRM, then those protected fields are never overwritten without explicit configuration, satisfying Devin's hygiene requirement.
- Given a rolling measurement window across the beta cohort, when sync outcomes are aggregated, then at least 98% of completed lead profiles sync to the connected CRM with no manual intervention (CRM Sync Success Rate target).

**Story 6: Error handling and graceful degradation**
- **As a** prospective buyer / high-intent website visitor (Priya Nair) — with downstream impact on Devin Brooks
- **I want** the widget and pipeline to degrade gracefully when the AI, enrichment, or CRM is unavailable, never losing my submission or my contact request
- **So that** I can always reach the company even during an outage, and the operations team is alerted to recover failed records instead of silently dropping leads
**Acceptance Criteria**:
- Given the Claude conversation service is unavailable or a message exceeds its latency budget, when the visitor interacts with the widget, then the widget always falls back to the static Fallback Form (a non-disableable guarantee, never gated behind a tenant toggle) so Priya can still submit her contact details, and the captured first-party data is preserved rather than lost.
- Given enrichment fails (no match, provider outage, or repeated job failure under bounded BullMQ retries with exponential backoff), when the lead is finalized, then the `EnrichmentProfile` `status` is set to `unavailable` with an `errorCode`, the `Lead` still assembles, scores on first-party data, routes, and syncs, and the ICP rationale reflects that enriched fields were absent without penalizing the lead with false negatives.
- Given a `POST /api/v1/crm/sync` attempt fails (CRM down or expired OAuth token), when retries are exhausted, then the `CrmSyncRecord` `status` records the failure with its `errorCode` and `attemptCount`, the operation remains idempotent so a later retry creates no duplicates, and an operations alert is fired to Devin so he can intervene.
- Given the Shadow-DOM widget bundle loads on a client site, when the page renders, then the bundle loads non-blockingly and stays within the <150 KB gzipped target so that a DealThreads outage or slow asset never blocks or breaks the host page.

**Story 7: Conversation-flow analytics and iteration**
- **As a** Director of RevOps / economic buyer (Maya Chen)
- **I want** an instrumented, versioned Conversation Flow with a funnel dashboard and per-question deal-quality attribution, plus the ability to publish new question-policy versions safely
- **So that** I can prove a defensible cycle-time improvement to my CRO, identify which questions predict deal quality, and iterate the flow weekly under the decision rule when enriched context alone doesn't move the metric
**Acceptance Criteria**:
- Given the funnel is instrumented end to end, when Maya opens `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel`, then she sees the North-Star Cycle Time (widget-complete to closed-won versus her pre-DealThreads contact-form baseline), Conversation Completion Rate, Required Field Capture Rate, CRM Sync Success Rate, and per-question deal-quality attribution, all derived from the `AnalyticsEvent` pipeline.
- Given conversations have accumulated downstream outcomes, when the attribution report is computed, then at least 3 conversation questions whose captured answers are statistically associated with closed-won or stage progression are surfaced as validated predictive questions (Deal-Quality Predictive Questions Identified target).
- Given enriched profiles add context but median cycle time has not improved by the targeted 20%, when Maya reviews the analytics, then the dashboard attributes the gap to the Conversation Flow (per the decision rule) and she can edit and publish a new `questionPolicyId` version via `PUT /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config` followed by `POST /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config/publish`.
- Given Maya publishes a new draft `WidgetConfig` version, when the publish succeeds, then new `ConversationSession`s begin using the latest published version while in-flight sessions retain their pinned `configVersion`, enabling controlled weekly iteration of the Question Policy without disrupting active conversations.

### 4. FUNCTIONAL REQUIREMENTS

#### Core Functionality

The Conversational Buyer-Profile Widget decomposes into five core functions. Each is specified with Input, Processing, Output, Validation, and Edge Cases. All functions operate within row-level tenant scoping in PostgreSQL 16 and run on Node.js 20 / NestJS with BullMQ (Redis) job queues, per the kernel tech stack.

**Widget identity note.** Throughout this section `widgetId` is the **stable logical widget identifier** carried as a `widget_id` column on `widget_configs` and shared across every version of the same widget (`UNIQUE (tenant_id, widget_id, version)`, with at most one published row per `(tenant_id, widget_id)`). It is distinct from the per-version `WidgetConfig.id`. `GET /api/v1/widgets/{widgetId}/config` resolves `widgetId` to the **latest published** `WidgetConfig` row, and the same `widgetId` is stored on `ConversationSession` and `AnalyticsEvent`.

**Question Policy persistence note.** The versioned `Question Policy` (allowed questions, priority order, required fields, forbidden topics) is its own persisted entity — a `question_policies` row (`id`, `tenant_id`, `version`, `status`, `questions_json`, `forbidden_topics_json`) — referenced by `WidgetConfig.questionPolicyId`. This gives the decision-rule lever a durable, versioned home so per-question deal-quality attribution resolves to a specific policy version.

---

##### 4.1 Function (a): Widget Conversation Engine

The adaptive AI qualification loop that turns an anonymous visitor into a structured `Lead`. Implemented by the Conversation Orchestrator calling Anthropic Claude (`claude-sonnet`) with structured-output JSON schemas, while deterministic validators run outside the LLM.

**Input**
- `GET /api/v1/widgets/{widgetId}/config` request from the embedded `<script>` carrying the page `Origin`/`Referer`, returning the published `WidgetConfig` (theme, welcome/fallback copy, `allowedPagesJson`, `questionPolicyId`, required fields, `consentJson`).
- `POST /api/v1/widget-sessions` payload: `widgetId`, `pageUrl`, `referrer`, `utmJson`, `anonymousVisitorId` (first-party cookie/UUID). Creates a `ConversationSession` pinned to the live `configVersion`.
- `POST /api/v1/conversations/{conversationId}/messages` payload per turn: visitor message text (**1–2,000 chars**, matching the §6 endpoint contract and Section 8 test fixtures), `conversationId`.

**Processing**
1. Orchestrator loads the session, the pinned `WidgetConfig`, and the versioned `Question Policy` from `question_policies` (allowed questions, priority order, required fields, forbidden topics).
2. The visitor turn is persisted as a `ConversationMessage` with `bodyEncrypted` (see §5.2) before any LLM call.
3. Claude is invoked with a versioned system prompt + structured-output JSON schema; it returns the next-best assistant turn plus an extraction object for `intent/need`, `company`, `role`, `budget range`, `timeline`, `authority`.
4. Deterministic validators (NOT the LLM) normalize and check every extracted field: email regex + work-vs-personal-domain classification, enum coercion for budget/timeline bands, required-field presence. Validated fields are written to `extractedFieldsJson` on the message and merged into the in-progress profile.
5. The consent disclosure (`consentJson`) is forced before the engine requests or stores any buyer-identifying personal data (work email, name, phone); see Business Rule 4.
6. When required fields (consent + work email + business need + timeline/urgency) are satisfied, the engine surfaces a completion CTA. `POST /api/v1/conversations/{conversationId}/complete` creates/updates the `Lead`, writes the `ConsentRecord`, computes `profileCompleteness`, and shows the confirmation ("who follows up and when").
7. Every step emits `AnalyticsEvent` rows (widget_load, session_start, message_turn, field_captured, conversation_complete, abandoned) for the funnel and per-question deal-quality attribution.

**Output**
- Per turn: assistant reply text, the structured fields extracted this turn, the list of still-missing required fields, and a `completionStatus` flag.
- On completion: a `Lead` (`status = qualified | disqualified`), `summary`, captured `qualificationJson`, `profileCompleteness`, and the visitor confirmation message. The completion handler **synchronously enqueues the asynchronous enrichment job** (§4.2) — enrichment runs on the BullMQ worker, never inline, so the visitor confirmation is never blocked by enrichment latency.

**Validation**
- `widgetId` must resolve to an `active` published `WidgetConfig` whose `Tenant.status = active`; otherwise the script renders nothing (no leakage).
- `Origin`/`Referer` host must match `Tenant.allowedDomains` AND the page must satisfy `allowedPagesJson`; mismatches return `403` and the launcher does not render.
- Work email must pass RFC-5322 syntax AND not match a maintained free-mail block-list (gmail, yahoo, outlook, etc.); a personal email is accepted but flagged `low_confidence` and does not count toward required-field capture as "work email."
- `budget` and `timeline` must coerce to defined enum bands; free-text that cannot be coerced is stored verbatim under `qualificationJson.raw` and marked unresolved.
- Required-field completion requires all four of: accepted consent, valid work email, non-empty business need, resolved timeline/urgency band. Partial sets cannot fire `/complete`.

**Edge Cases**
- *LLM timeout / outage*: after a 2,500 ms first-token budget breach or provider error with exhausted retries, the widget renders the static **Fallback Form**. Whatever was captured is preserved on the `ConversationSession`. **No `Lead` is created from the outage alone**; a `Lead` is created only if the visitor submits the Fallback Form (an explicit completion), at which point the captured first-party data forms a `Lead` with `status = needs_review`. This keeps the engine consistent with the abandonment rule below (a session, not a completion, never produces a Lead).
- *Off-topic / abusive input*: guardrails redirect to the qualification task; repeated off-topic turns (>3) gracefully offer the fallback form.
- *Early abandonment*: a session left incomplete past a 30-minute idle TTL is marked `abandoned`. Consistent with Section 2 and Stories 1/6, **no `Lead` is created and no CRM sync fires** for an abandoned session, even when consent + work email were already captured; the partial capture is retained on the `ConversationSession` (transcript + extracted fields) so an operator can review it, but it does not enter the Lead/score/route/sync pipeline until an explicit completion occurs.
- *Prompt-injection attempts*: structured-output schema + deterministic extraction prevent the LLM from writing fields it is not permitted to; system prompt is versioned and immune to in-conversation override.
- *Duplicate visitor*: same `anonymousVisitorId` returning re-attaches to an open session rather than spawning a duplicate.

---

##### 4.2 Function (b): Enrichment Orchestration

The asynchronous layer that augments a first-party `Lead` with firmographic + technographic signals, attaching source and confidence to every field. Clearbit is primary; the secondary enrichment provider is the decision-maker/contact fallback.

**Input**
- `POST /api/v1/leads/{leadProfileId}/enrich` (returns `202` with an enrichment job id). Trigger payload derives `company domain` (from work email), `companyName`, and any contact hints from the `Lead`.

**Processing**
1. A BullMQ `EnrichmentJob` is queued on Redis with bounded retries and exponential backoff; an `EnrichmentProfile` row is created with `status = queued`, `attemptCount`, and a `requestHash` keyed on `tenantId + company domain + provider`.
2. Cache lookup first: results cached by company domain (where contractually allowed) short-circuit a paid call to control cost.
3. Clearbit is queried for company size, industry, revenue range, funding, and tech stack. the secondary enrichment provider is then queried for decision-maker/contact hints (and as a firmographic fallback if Clearbit returns no match).
4. Each returned field is normalized to the canonical schema and stored in `resultJson` with `source` (`clearbit` | `secondary_provider`) and a 0–1 `confidence`. Per-job cost is recorded for the Cost per Qualified Lead metric.
5. Overall `status` resolves to `completed`, `partial`, `unavailable`, or `needs_review`. Fields below the configured confidence threshold are flagged for manual review, not guessed.
6. On terminal state, the orchestrator triggers scoring (§4.3) and persists `completedAt`.

**Output**
- An `EnrichmentProfile` with per-field `source`/`confidence`, an aggregate `confidence`, and `status`. `Enrichment Coverage` (proportion of firmo/techno fields filled above threshold) is computed and stored for analytics.

**Validation**
- Enrichment fires only on leads with a work email OR a resolvable company domain; consumer-domain-only leads skip paid enrichment and proceed first-party.
- `requestHash` enforces idempotency: an identical in-flight or recently completed request reuses the result rather than re-billing.
- No field is written above the confidence threshold without a `source`; unsourced data is rejected.
- The **per-lead hard spend cap** is checked before each paid provider call (Business Rule 5); a call that would push this lead's accumulated enrichment spend over the cap is suppressed.

**Edge Cases**
- *No provider match*: `status = unavailable`; the `Lead` proceeds on first-party data only and CRM sync is NOT blocked.
- *Provider outage / rate-limit (429/5xx)*: retried with exponential backoff up to the bounded ceiling; on exhaustion `status = unavailable` with `errorCode` recorded; ops alert raised for Devin.
- *Conflicting firmographics across providers*: higher-confidence source wins; conflict noted in `resultJson` and field flagged `needs_review` if confidences are close.
- *Stale cache*: cached entries older than the configured TTL are refreshed on next request to avoid the "embarrassing, mistargeted outreach" pain point.
- *Partial timeout*: whatever completed is stored as `partial`; scoring runs on the partial set, never counting the missing fields as positive evidence.
- *Per-lead cap reached mid-enrichment*: the optional/lower-priority provider call (the the secondary enrichment provider fallback) is suppressed first; the profile proceeds on first-party data plus whatever Clearbit already returned, with `status = partial`.

---

##### 4.3 Function (c): ICP-Fit Scoring & Profile Assembly

Transparent weighted scoring that produces the `ICP Fit Score`, segment, rationale, and recommended next action, and assembles the final `Buyer Profile (Lead)` reps consume.

**Input**
- `POST /api/v1/leads/{leadProfileId}/score` (computes or recomputes). Reads captured `qualificationJson` (intent, budget, timeline, authority) + the `EnrichmentProfile` (firmographic fit, tech fit).

**Processing**
1. The ICP Scoring Service applies the tenant's transparent weighted model across the dimensions: firmographic fit, urgency/timeline, pain/intent, budget, authority, and tech fit.
2. Each contributing field is scored only on **known** values; unknown/low-confidence fields contribute zero and are excluded from the denominator weighting so they are never counted as positive evidence.
3. A 0–100 `icpScore` is produced with a canonical `segment` value (see Business Rule 1: `high_fit`, `nurture`, or `low_fit`) and a `rationale` citing exactly which fields drove the score.
4. A `recommended next action` is derived from segment + intent (e.g., "Call within 1 hour — high budget, near-term timeline, exec authority").
5. The profile is assembled: normalized `contactJson`, `companyJson`, `qualificationJson`, AI `summary`, `icpScore`, `scoreJson` (rationale + weights), and `profileCompleteness`. Result is readable via `GET /api/v1/leads/{leadProfileId}` for the operator UI and CRM card. Scoring completion triggers routing (§4.4).

**Output**
- A scored `Lead`: `icpScore` (0–100), `segment` (canonical enum), `scoreJson` (rationale citing fields + weights used), `summary`, `profileCompleteness`, and `recommended next action`.

**Validation**
- Score is bounded 0–100; the rationale must enumerate at least the fields that contributed, and every cited field must exist in the captured/enriched data (no fabricated justification).
- The model must be deterministic for identical inputs (same inputs → same score) so iteration effects are attributable.
- Unknown-field handling is asserted: a profile with sparse data cannot score higher than the same profile with the same known values plus more positives.
- `profileCompleteness` is computed from required + enriched field coverage and must be present.

**Edge Cases**
- *Enrichment unavailable*: scoring runs on first-party fields alone; rationale explicitly states enrichment was unavailable and the score reflects only known evidence.
- *Disqualified lead*: a lead with `Lead.status = disqualified` is still scored and assigned `segment = low_fit`, and is **still assembled and synced** so RevOps retains pipeline data. It enters routing (§4.4) but is directed to the nurture/fallback queue rather than triggering a high-priority rep notification (see §4.4 and Business Rule 3).
- *Recompute*: a later enrichment completion (or a config change) recomputes the score; `scoreJson` is versioned so analytics can attribute score changes.
- *Tie at a threshold boundary*: deterministic rounding rule applies (round half up) so boundary leads land in a single, predictable segment.

---

##### 4.4 Function (d): Routing Engine

Rule-based intelligent routing that guarantees every completed lead — qualified or disqualified — reaches a named owner or a queue, then fires a high-priority notification for the leads that warrant immediate rep action.

**Input**
- `POST /api/v1/routing/evaluate` for a scored `Lead`. Reads the tenant's priority-ordered `RoutingRule` set (`conditionsJson` on ICP score, territory, company size, industry, product interest; `assignmentJson` → owner or queue).

**Processing**
1. The Routing Service evaluates `RoutingRule` rows strictly in ascending `priority` order; the first rule whose `conditionsJson` matches wins (first-match-wins, Business Rule 3).
2. The matched `assignmentJson` sets `assignedOwnerId` on the `Lead`; if no rule matches, the lead is assigned to the tenant's guaranteed **fallback queue**. Disqualified / `low_fit` leads route to the nurture or fallback queue rather than a named high-priority owner, so they are captured for pipeline data without paging a rep.
3. For qualified, action-worthy leads (e.g., `high_fit`, or any segment meeting the tenant's notification threshold) a high-priority notification payload is emitted to the owner via Slack/email (per persona Marcus/Devin). The assignment + the matched rule id are written to `AnalyticsEvent` for "routed, why, and SLA-met" visibility regardless of segment.
4. Assignment then hands off to CRM sync (§4.5) so the owner is set both in DealThreads and the CRM. Disqualified leads also sync (§4.5), preserving pipeline data per §4.3.

**Output**
- An assigned `Lead` (`assignedOwnerId` set, or fallback/nurture queue), the high-priority notification payload where applicable, and a routing audit event capturing the matched rule and timestamp.

**Validation**
- Exactly one assignment results from evaluation: the first matching rule, or the fallback/nurture queue — never zero, never two. This guarantee covers every completed lead, so no qualified lead is ever left unassigned (Story 4 AC2) and disqualified leads always resolve to a queue.
- Only `status = active` rules are evaluated; disabled rules are skipped.
- An owner referenced by `assignmentJson` must be an active user in the tenant; an invalid owner causes that rule to fall through to the next (and is flagged to ops), never a silent drop.

**Edge Cases**
- *No rule matches*: fallback queue catches the lead, satisfying "no qualified lead goes unassigned."
- *Duplicate priority at config time*: `RoutingRule` priorities are **unique per tenant**, enforced at configuration time (Business Rule 3); the operator console rejects a save that would create two rules at the same priority. Because uniqueness is guaranteed before any rule is persisted, evaluation never encounters a priority tie at runtime and there is no runtime tie-break branch.
- *Round-robin within a queue*: queue-level fair distribution is honored where configured; an unavailable rep rolls to the next without dropping the lead.
- *Re-route on recompute*: if a recompute changes the segment, re-evaluation re-assigns and re-notifies, but protected CRM owner fields are not overwritten without explicit config (Business Rule 4 / dedupe rules).

---

##### 4.5 Function (e): CRM Sync

Idempotent synchronization of the assembled, scored, routed `Lead` into the tenant CRM. HubSpot is fully exercised in beta; Salesforce ships as the second adapter behind the same interface.

**Input**
- `POST /api/v1/crm/sync` for a `leadProfileId`. Reads the `Lead`, the tenant's field mapping, and any existing `CrmSyncRecord` (for prior external object IDs).

**Processing**
1. A BullMQ CRM-sync job runs with bounded retries and exponential backoff. Dedupe runs first: match by **email**, then fall back to **domain + company name** against existing CRM contacts/companies.
2. The CRM adapter idempotently creates or updates contact / company / deal: writing the DealThreads `summary`, mapped DealThreads fields, the `icpScore` + rationale, source page, transcript link, and an **activity note**.
3. External object IDs (contact/company/deal) are stored in `externalObjectIdsJson` on a `CrmSyncRecord`; subsequent syncs key on `tenantId + leadProfileId + stored IDs` so retries never duplicate records.
4. Protected fields (lifecycle stage, owner) are NOT overwritten unless explicit tenant config permits it (Business Rule 4 / Devin's pain point).
5. On success, the owner notification is confirmed and the funnel event (`crm_synced`) is emitted; the Speed-to-Profile clock target is ≤ 2 minutes p95.

**Output**
- A `CrmSyncRecord` (`status = success | failed | retrying`, `externalObjectIdsJson`, `attemptCount`, `errorCode`), the CRM record(s) created/updated, and the activity note + DealThreads profile card visible to the rep inside HubSpot/Salesforce.

**Validation**
- Sync requires a valid, unexpired CRM OAuth/private-app token; an expired token raises an ops alert (Devin) and the job is held for retry, not dropped.
- Field mapping must resolve every required CRM property; an unmapped required property fails the job with a clear `errorCode` rather than writing a malformed record.
- Idempotency assertion: re-running sync for the same lead with stored external IDs MUST update, never create.

**Edge Cases**
- *Existing contact found (dedupe hit)*: update in place, append the activity note, and do not duplicate the company/deal.
- *CRM 429 / 5xx / outage*: retried with exponential backoff; on exhaustion `status = failed` with `errorCode`, ops alerted, and the lead remains queued for manual/automatic retry — the lead is never lost.
- *Partial write (contact created, deal failed)*: stored external IDs let the retry resume from the failed object instead of recreating the contact.
- *Protected-field conflict*: if config forbids overwrite and the CRM value differs, DealThreads writes to the mapped DealThreads-owned field and notes the conflict, leaving the protected field intact.
- *Salesforce vs HubSpot divergence*: the same interface is used; Salesforce-specific object/relationship quirks are isolated in the adapter so core logic is unchanged.

---

#### Business Rules

**Rule 1 — ICP-fit scoring thresholds and segmentation.** The `ICP Fit Score` is a transparent weighted 0–100 value. The `segment` field uses one canonical enum, used verbatim in prose, this rule, and all JSON payloads: **`high_fit` (score ≥ 75, display label "Hot/High-Fit")**, **`nurture` (50–74, display label "Warm/Nurture")**, **`low_fit` (< 50, display label "Low-Fit")**. `high_fit` leads trigger the highest-priority notification and the fastest follow-up SLA. Every score MUST ship with a rationale citing the contributing fields and weights. (Lead disqualification is carried separately on `Lead.status = disqualified`; a disqualified lead carries `segment = low_fit`.)

**Rule 2 — Unknown fields are never positive evidence.** No scoring dimension may credit an unknown, missing, or below-confidence-threshold field as positive. Such fields contribute zero and are excluded from positive weighting; a sparse profile can never out-score the same profile with additional confirmed positives. Low-confidence enriched fields are flagged for review rather than scored as fact.

**Rule 3 — Routing precedence and guaranteed resolution.** `RoutingRule` rows are evaluated strictly in ascending `priority`, first-match-wins. **Priorities are unique per tenant, enforced at configuration time** (the operator console rejects a duplicate-priority save), so evaluation never encounters a runtime priority tie. If no active rule matches, the lead is assigned to the tenant's fallback queue; disqualified / `low_fit` leads resolve to the nurture or fallback queue. The outcome is always exactly one assignment — every completed lead resolves to a named owner or a queue, a qualified lead is never left unassigned, and no lead is assigned twice.

**Rule 4 — Data privacy, consent, and protected fields (GDPR/CCPA).** The widget MUST present the configured consent disclosure and obtain acceptance BEFORE collecting or storing any buyer-identifying personal data (work email, name, phone). Each acceptance creates an immutable `ConsentRecord` (`policyVersion`, `consentText`, `sourceUrl`, `region`, `acceptedAt`). The functional identifiers captured at session creation (`anonymousVisitorId`, `pageUrl`, `referrer`, UTM, and the transient IP used for rate limiting / region resolution) are processed under the legitimate-interest / strictly-necessary basis detailed in §5.2 and are not treated as buyer-identifying profile data pre-consent. Enrichment is limited to B2B qualification signals; sensitive personal traits and any category prohibited by the configured policy are never collected. Data deletion and export requests are honored across the stores enumerated in §5.2, and CRM **protected fields (lifecycle stage, owner) are never overwritten without explicit tenant config**. Retention is bounded by `Tenant.retentionMonths`.

**Rule 5 — Enrichment cost controls (two distinct limits).** Two separate limits govern enrichment spend and MUST NOT be conflated:
- A **per-lead hard spend cap** of **≤ $1.50 per lead** in paid enrichment (sized to cover one Clearbit company call plus, when needed, one the secondary enrichment provider fallback call; refined during beta). This is a real-time gate: before each paid provider call the orchestrator checks the lead's accumulated enrichment spend, and a call that would breach the cap is suppressed in priority order (the optional the secondary enrichment provider fallback is dropped first), after which the profile proceeds on first-party + already-enriched data with `status = partial`.
- A **per-tenant blended average target** — the `Cost per Qualified Lead` metric — of **≤ $3.50 per qualified lead** (blended Claude + Clearbit/the secondary enrichment provider, tracked and refined during beta). This is a tracked aggregate average across the tenant's qualified leads, NOT a per-call gate; an individual lead never "reaches" this ceiling because a single lead is only ~1–2 provider calls. It is monitored on the funnel dashboard and informs pricing/threshold tuning, while the per-lead hard cap above is what actually suppresses calls.

Cache-by-domain is attempted before any paid call and `requestHash` idempotency prevents duplicate billing, both of which reduce the blended average and the chance of hitting the per-lead cap.

**Rule 6 — Idempotent CRM dedupe against existing contacts.** Before any CRM write, dedupe by **email first**, then by **domain + company name**. A match updates the existing contact/company/deal in place (appending the activity note); stored `externalObjectIdsJson` guarantees retries update rather than create. No duplicate contact, company, or deal may be produced by any number of sync retries.

**Rule 7 — Configuration versioning and session pinning.** Live sessions always run the latest **published** `WidgetConfig`; in-flight sessions retain their pinned `configVersion` through completion. The `Question Policy` (persisted in `question_policies` and referenced via `WidgetConfig.questionPolicyId`) and system prompts are versioned so per-question deal-quality attribution is attributable to a specific flow/policy version (supporting the decision rule that the conversation flow is the primary lever).

**Rule 8 — Fallback availability (always on, non-disableable).** If the AI conversation service is unavailable, the widget MUST render the static **Fallback Form** so a visitor can always reach the company, and any captured data MUST be preserved even when chat completion or enrichment fails. The Fallback Form is a **non-disableable** guarantee: it is not exposed as a tenant on/off toggle in `WidgetConfig`, so no configuration can break this MUST. Tenants may customize the fallback copy and fields but cannot turn the fallback off.

---

#### Integration Requirements

**External APIs**
- **Anthropic Claude (`claude-sonnet`)** — live conversation loop and structured field extraction/summaries via versioned system prompts and structured-output JSON schemas; behind an LLM adapter interface for swap-ability. First-token latency budget governs fallback behavior.
- **Clearbit** — primary firmographic + technographic enrichment (company size, industry, revenue range, funding, tech stack); results cached by company domain where contractually allowed; per-call cost tracked against the per-lead hard cap (Business Rule 5).
- **the secondary enrichment provider** — decision-maker/contact-data fallback and secondary firmographic source; queried after Clearbit per the kernel ordering, and the first paid call suppressed when the per-lead cap would be breached.
- **HubSpot (first) and Salesforce (second adapter)** — private-app/OAuth (HubSpot), behind a single CRM interface; all writes idempotent via stored external object IDs.
- **Slack / Email** — high-priority routing notifications to the assigned owner and operational alerts (sync failure, token expiry) to the routing/hygiene owner.

**Internal Systems**
- **Conversation Orchestrator** (NestJS) — drives the LLM loop, deterministic validators, and consent gating.
- **Enrichment Orchestrator, ICP Scoring Service, Routing Service, CRM Sync** — coordinated as BullMQ jobs on Redis with bounded retries and exponential backoff; provider adapters sit behind interfaces.
- **PostgreSQL 16** — system of record with row-level tenant scoping; JSONB for provider payloads and extracted fields during beta. Houses `question_policies` (versioned policy store) and the `widget_id` logical-widget column on `widget_configs`.
- **Redis** — job queues, session cache, and rate limiting.
- **Operator/Admin Console** (React 18 + Vite SPA) — `PUT /api/v1/admin/.../config`, `POST .../config/publish`, and `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel`, with draft/publish versioning, allowed-domain controls, consent copy, CRM field mapping, question policy editing, and routing rules (including config-time enforcement of unique routing priorities).

**Data Synchronization**
- **Lead → CRM**: idempotent, keyed on `tenantId + leadProfileId + externalObjectIdsJson`; dedupe email-then-domain+company; protected fields preserved; activity note + mapped fields + ICP rationale written; target ≥ 98% automatic sync success and ≤ 2 minutes p95 Speed-to-Profile. Both qualified and disqualified completed leads sync (disqualified for pipeline data only).
- **Enrichment → Lead → Score → Route**: asynchronous, eventually consistent; enrichment unavailability never blocks first-party CRM sync; recompute on later enrichment re-runs score and (if segment changes) re-routes without violating protected-field or idempotency rules.
- **Analytics pipeline**: every stage emits `AnalyticsEvent` rows from widget_load through crm_synced to closed_won, powering the north-star Cycle Time metric, the conversion funnel, and per-question deal-quality attribution; the cycle-time clock starts at conversation completion and stops at CRM closed-won. Because abandoned sessions produce no `Lead` (see §4.1), abandonment is tracked purely as session-level funnel events and never enters the cycle-time or sync metrics.

---

### 5. NON-FUNCTIONAL REQUIREMENTS

#### Performance Requirements

**Response Time**
- **Widget first-token latency**: assistant first token returned within **≤ 2.5 s p95** per visitor turn (Claude `claude-sonnet` chosen explicitly for latency/cost); breach of the 2,500 ms first-token budget on a turn triggers Fallback Form rendering.
- **Widget load / config fetch**: `GET /api/v1/widgets/{widgetId}/config` returns within **≤ 300 ms p95** from the Cloudflare CDN edge; the launcher renders non-blockingly so it never delays host-page load.
- **Speed-to-Profile (Time-to-Rep)**: from conversation completion to enriched, scored, synced, and routed profile delivered to the rep within **≤ 2 minutes p95** (kernel metric).
- **Full enrichment SLA**: an `EnrichmentJob` reaches a terminal `status` (`completed`/`partial`/`unavailable`/`needs_review`) within **≤ 60 s p95** including bounded retries; otherwise it resolves to `partial`/`unavailable` so downstream stages are never blocked.
- **Profile-to-CRM sync latency**: a queued CRM-sync job completes within **≤ 30 s p95** of scoring/routing completion (inside the 2-minute end-to-end budget).
- **Operator funnel API**: `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel` returns within **≤ 1.5 s p95** for standard dashboard ranges.

**Throughput**
- Sustain **≥ 200 concurrent active conversations** across the 5 beta tenants with no degradation of the first-token p95 budget.
- Process **≥ 2,000 conversation messages/minute** and **≥ 500 enrichment + CRM-sync jobs/minute** through the BullMQ queues during peak campaign traffic.
- Enrichment and CRM provider rate limits are respected via Redis-backed rate limiting and exponential backoff; bursts queue rather than fail.

**Scalability**
- NestJS API on Render scales horizontally (stateless API nodes); session/queue state lives in Redis and the system of record in managed PostgreSQL 16, so adding API replicas scales conversation throughput linearly.
- BullMQ workers (enrichment, scoring, CRM sync) scale independently of the web tier so spiky async load does not affect live conversation latency.
- Row-level tenant scoping plus JSONB payload columns support adding beta tenants without schema migration; provider adapters behind interfaces allow capacity to be added (or vendors swapped) without core changes.

**Resource Usage**
- **Widget bundle**: vanilla TypeScript built with Vite into a single self-initializing `<script>`, **target < 150 KB gzipped**, rendered inside a Shadow DOM with no framework runtime shipped to client sites.
- **Cost per Qualified Lead** held to a **per-tenant blended average ≤ $3.50** (Claude + Clearbit/the secondary enrichment provider) as a tracked aggregate, with a separate **per-lead hard spend cap ≤ $1.50** in paid enrichment that actually gates calls (Business Rule 5), enforced via domain caching, `requestHash` idempotency, and per-lead spend suppression.
- LLM token budgets are bounded per turn via structured-output schemas; Redis session cache and domain-keyed enrichment cache minimize redundant paid calls.

---

#### Security Requirements

**Authentication**
- **Embedded widget**: no end-user login; sessions are anonymous (`anonymousVisitorId`). Origin authenticity is enforced by `Tenant.allowedDomains` + `allowedPagesJson` checks on every `GET .../config` and session create, served over **TLS 1.2+** via Cloudflare.
- **Operator/Admin console & APIs**: authenticated operator sessions for DealThreads staff and tenant admins (Maya, Devin); all `/api/v1/admin/*` endpoints require an authenticated, tenant-scoped principal.
- **CRM**: HubSpot private-app/OAuth tokens (Salesforce OAuth via the adapter) held in a managed secrets store; tokens are never exposed to the browser widget.

**Authorization**
- **Multi-tenant isolation**: every query is row-level tenant-scoped by `tenantId` in PostgreSQL 16; no endpoint may return or mutate another tenant's `Tenant`, `Lead`, `EnrichmentProfile`, `RoutingRule`, `CrmSyncRecord`, or `AnalyticsEvent`. Admin endpoints are pathed by `tenantId` and authorization is checked against the principal's tenant.
- Operator actions (publish config, edit routing rules, edit field mapping/consent copy, edit question policy) are restricted to authorized roles; the widget's anonymous session can only create sessions/messages and complete a conversation for its own `conversationId`.

**Data Protection**
- **PII handling & encryption at rest**: PII is application-layer encrypted everywhere it is stored, not only in transcripts. Conversation bodies are stored as `bodyEncrypted` on `ConversationMessage`, **and the duplicated contact PII in `Lead.contactJson` (name, work email, role) is likewise application-layer (column/field-level) encrypted** — envelope-encrypted with a per-record data key wrapped by the managed KMS — rather than relying only on disk encryption + row-level scoping. `GET /api/v1/leads/{leadProfileId}` decrypts `contactJson` in the application layer only for an authenticated, tenant-scoped principal, so the most-queried copy of contact PII is never persisted in plaintext. Enrichment is restricted to B2B qualification signals — sensitive personal traits and any policy-prohibited category are never collected (Business Rule 4 / scope).
- **Pre-consent identifier & IP processing (legal basis)**: at `POST /api/v1/widget-sessions` the widget captures `anonymousVisitorId` (first-party functional cookie/UUID), `pageUrl`, `referrer`, UTM attribution, and a transient client IP used for per-IP rate limiting and coarse region resolution — all **before** the consent disclosure. This pre-consent processing rests on the **legitimate-interest / strictly-necessary** basis: it is required to deliver the service the visitor explicitly requested (loading the widget), to secure it against abuse and fraud, and to apply rate limiting. The IP is used transiently for rate limiting and region resolution and is **not persisted as a buyer-profile attribute** pre-consent (only the coarse resolved `region` lands on the eventual `ConsentRecord`). The consent gate continues to govern collection of buyer-identifying personal data (work email, name, phone) per Business Rule 4. Tenants in stricter regimes may configure consent-first behavior that defers even the functional identifier.
- **Encryption (transit & secrets)**: data in transit over TLS 1.2+ (widget bundle, admin SPA, all API traffic via Cloudflare); data at rest encrypted in managed PostgreSQL/Redis on Render, with the application-layer PII encryption above layered on top; CRM tokens and provider secrets held in a managed secrets store, never in the database in plaintext.
- **Consent, region resolution, deletion & erasure scope**:
  - *Consent record*: an immutable `ConsentRecord` (`policyVersion`, `consentText`, `region`, `sourceUrl`, `acceptedAt`) backs GDPR/CCPA auditability. The `region` value is **resolved at consent time by coarse IP geolocation** (country / state granularity only; the IP itself is not stored), yielding values such as `EU`, `US-CA`, `US`, or `ROW`, which determine whether GDPR or CCPA handling applies. **Fallback when geolocation is unavailable or ambiguous**: apply the strictest configured regime — default to GDPR (`EU`-equivalent) handling — so consent and erasure protections fail safe to the most protective standard; a tenant may set an explicit default region in config to override this fallback.
  - *Erasure scope (exact stores)*: a validated deletion/erasure request purges or anonymizes PII across the following, traversed via the `ConsentRecord` → `ConversationSession` → `Lead` linkage: **(1) `conversation_messages`** — encrypted bodies are crypto-shredded by destroying the per-record data key, rendering the ciphertext permanently unrecoverable while the row and model metadata remain for audit counts; **(2) `lead_profiles`** — `contactJson` (and any free-text PII in `qualificationJson`/`summary`) is deleted or anonymized via the same key destruction; **(3) `conversation_sessions`** — `anonymousVisitorId`, `referrer`, and any URL-embedded PII are scrubbed; **(4) `analytics_events`** — rows are anonymized in place by stripping/hashing `leadProfileId` linkage and removing any PII from `propertiesJson`, preserving the funnel counts the metrics depend on without retaining identity; **(5) downstream CRM** — a deletion signal is issued to the connected CRM via the stored `CrmSyncRecord` external IDs. **Audit-trail preservation without retaining PII**: `consent_records` are intentionally **exempt from routine deletion** because they are the legal proof-of-consent; on erasure they are reduced to non-identifying proof (retaining `policyVersion`, `region`, `acceptedAt`, and a salted hash of the consented identifier) rather than the raw email/name, so the audit trail proves consent existed without storing the person's PII. Retention is otherwise bounded by `Tenant.retentionMonths`.
- **Idempotency & integrity**: CRM writes are idempotent (stored external object IDs), protected CRM fields are never overwritten without explicit config, and enrichment results are only written with a `source` and confidence.

**Audit Trail**
- The following are audit-logged: every `ConsentRecord` acceptance (immutable, and on erasure reduced to non-PII proof as above); every config draft/publish action (which operator, which version, when); every routing decision (matched `RoutingRule` id, assignment, fallback/nurture-queue use) via `AnalyticsEvent`; every `CrmSyncRecord` attempt (provider, status, external IDs, `attemptCount`, `errorCode`); every `EnrichmentProfile` job (provider, status, `requestHash`, confidence, cost, `errorCode`); and the canonical transcript in `ConversationMessage` with model metadata (encrypted, and crypto-shredded on erasure). Token-expiry and sync-failure events raise operational alerts to the routing/hygiene owner.

---

#### Usability Requirements

**Accessibility**
- The embedded widget conforms to **WCAG 2.1 AA**: full keyboard operability, visible focus states, programmatic labels/ARIA on the launcher and chat input, and a contrast ratio of ≥ 4.5:1 for text against tenant-themed backgrounds. The Shadow DOM isolation must not strip assistive-technology semantics. The static **Fallback Form** is likewise WCAG 2.1 AA compliant so accessibility is preserved when AI is unavailable.
- The React 18 operator/admin console also targets **WCAG 2.1 AA** for the dashboards reps and RevOps use daily.

**Browser Support**
- Widget supports the latest two major versions of **Chrome, Edge, Firefox, and Safari** (desktop and mobile), relying on standard Shadow DOM and ES2020 support produced by the Vite build. The single `<script>` tag loads non-blockingly and degrades to the Fallback Form where the conversation service cannot run.
- The operator/admin SPA supports the same evergreen desktop browsers.

**Mobile Responsiveness**
- The widget renders responsively from **320 px wide upward**, with a mobile-first chat layout, tap targets ≥ 44×44 px, and a launcher that does not obstruct host-page content — supporting Priya arriving from LinkedIn on mobile. Confirmation ("who follows up and when") is fully legible on small screens.

**User Training**
- **Daily users (Marcus, reps/SDRs)** require effectively zero training: the DealThreads profile card lives inside HubSpot/Salesforce and is designed to be scanned (intent summary, ICP score + rationale, enrichment highlights, recommended action) in **under 30 seconds**, with low-confidence fields clearly flagged.
- **Economic buyer / hygiene owners (Maya, Devin)** are onboarded by the Customer Success Manager during the manual beta setup, with a short operator-console walkthrough (config draft/publish, allowed domains, consent copy, CRM field mapping, question policy, routing rules) plus the funnel dashboard; the visitor (Priya) requires no training, only a short adaptive conversation and a clear consent disclosure.

### 6. TECHNICAL SPECIFICATIONS

This section specifies the engineering build for the **Conversational Buyer-Profile Widget** (MVP Beta v0.1). It covers two distinct frontend surfaces — the embeddable visitor-facing chat widget and the internal operator/rep admin console — plus the NestJS backend, the documented API surface, and the PostgreSQL data model. All names, endpoints, entities, and tech choices are taken verbatim from the shared kernel and must not be renamed or contradicted downstream.

**Canonical identifiers and enums used throughout this section** (defined once here, referenced everywhere):

- **`widgetId`** is the stable, tenant-scoped identifier of a logical widget — the parent of its versioned `WidgetConfig` rows. It is **not** the same as a `WidgetConfig.id`: a widget keeps one `widgetId` across every draft/published config version. It is modeled by the `widgets` table (see Database Changes); `widget_configs`, `conversation_sessions`, and `analytics_events` carry `widget_id` as a foreign key to that table.
- **`Lead.status` enum (canonical, full set):** `qualified` | `disqualified` | `incomplete` | `needs_review`. `qualified` and `disqualified` are terminal outcomes of a completed conversation that captured the required fields; `incomplete` means a conversation finalized without all four required fields; `needs_review` flags a profile a human should inspect (e.g. conflicting signals or low-confidence enrichment that materially affects fit). This is the only Lead status vocabulary; it is enforced by a Postgres CHECK constraint (see Schema Updates).
- **Segment label enum (canonical):** machine values `high_fit` | `nurture` | `low_fit`, rendered in UI as **Hot/High-Fit** (ICP ≥ 75), **Warm/Nurture** (50–74), and **Low-Fit** (< 50). All prose, scoring output, and JSON examples use the machine values verbatim.

#### Frontend Requirements

There are two independent frontends that share no runtime. The widget is a dependency-free Vanilla TypeScript bundle dropped onto third-party customer sites; the operator/admin console is a separate React 18 SPA used internally by Maya (RevOps), Devin (coordinator), and Marcus (rep, profile consumer).

**Components**

*Embeddable Widget (Vanilla TypeScript, Vite, Shadow DOM, target < 150 KB gzipped):*

- `WidgetLoader` — the self-initializing entry the single `<script>` tag boots; reads the `data-widget-id` attribute, attaches a Shadow root, fetches config via `GET /api/v1/widgets/{widgetId}/config`, and renders non-blocking so it never delays the host page's load.
- `Launcher` — the closed-state bubble/pill showing the tenant brand and page/campaign-aware welcome copy from `WidgetConfig.themeJson` / `conversationJson`.
- `ChatPanel` — the expanded conversation surface; hosts `MessageList`, `Composer`, `TypingIndicator`, and `ConsentBanner`.
- `MessageList` / `MessageBubble` — renders the turn-by-turn transcript (visitor + assistant), distinguishing visitor-stated **Intent Signal** content from system prompts.
- `Composer` — text input with deterministic client-side hints (email format) that does NOT block send; server-side validators remain authoritative.
- `ConsentBanner` — surfaces `consentJson` copy and captures explicit acceptance before any personal-data field (work email, name) is requested; blocks contact-detail prompts until accepted.
- `ConfirmationCard` — terminal state showing who will follow up and the expected response window, per the core user flow.
- `FallbackForm` — the static contact form rendered when the AI conversation service is unavailable (the **Fallback Form**), preserving captured fields so a visitor can always reach the company. It is always available; there is no tenant toggle that can disable it (see endpoint 1 and Business Rule 8).
- `ErrorBoundary` / `OfflineBanner` — degrades to `FallbackForm` on LLM/orchestrator timeout or non-2xx from `/messages`.

*Operator / Admin + Rep Console (React 18 + Vite SPA):*

- `LeadProfileCard` — the enriched **Buyer Profile (Lead)** view Marcus opens; renders intent summary, **ICP Fit Score** (0–100) with rationale, enrichment highlights with per-field source + confidence badges, source page, transcript link, and recommended next action. Low-confidence fields are visually flagged for verification.
- `LeadInbox` / `LeadTable` — filterable, sortable list of leads by ICP score, segment, owner, sync status, and recency.
- `WidgetConfigEditor` — draft/publish editor for branding, welcome/fallback copy, allowed pages, **Question Policy** reference, required fields, and **Consent** copy; wraps `PUT .../config` and `POST .../config/publish`.
- `QuestionPolicyEditor` — versioned editor for the **Question Policy** bound to a widget config: the allowed qualification questions and their priority, the required fields, and the forbidden/sensitive topics the AI must avoid; iterated weekly during beta and the basis for per-question deal-quality attribution.
- `CrmMappingPanel` — field-mapping UI (DealThreads field → CRM property) with protected-field guards.
- `RoutingRulesBuilder` — priority-ordered **Routing Rule** editor (conditions → owner/queue assignment) with a mandatory fallback queue.
- `FunnelDashboard` — renders `GET .../analytics/funnel`: north-star **Cycle Time**, **Conversation Completion Rate**, **Required Field Capture Rate**, **CRM Sync Success Rate**, **Speed-to-Profile**, and per-question deal-quality attribution.
- `SyncHealthPanel` — `CrmSyncRecord` / `EnrichmentProfile` status, retries, and operator alerts for sync failures or expired CRM tokens (Devin's surface).

**State Management**

- *Widget:* No framework runtime ships to client sites. State is a single explicit TypeScript finite-state machine (`idle → opened → consenting → conversing → completing → confirmed | fallback | error`) held in a lightweight in-memory store inside the Shadow DOM. Conversation continuity is keyed by the server-issued `sessionId` and `conversationId`, persisted to `sessionStorage` (not `localStorage`) so a refresh resumes the in-flight session but the identifier does not leak across host-page navigations. `configVersion` is pinned at session start so an in-flight conversation never swaps question policies mid-stream.
- *Admin/Rep SPA:* TanStack Query (React Query) for all server cache/fetch state against the kernel API surface (stale-while-revalidate, automatic refetch of lead/sync status), plus React Context for auth/tenant scope and lightweight local `useReducer` for editor draft state. No global Redux store — server state stays in the query cache to avoid stale lead data.

**Routing**

- *Widget:* No client-side router; the widget is a single Shadow-DOM overlay whose views are FSM states, not URLs. It must never manipulate the host page's history or URL.
- *Admin/Rep SPA:* React Router v6, tenant-scoped paths: `/login`, `/t/:tenantId/leads` (inbox), `/t/:tenantId/leads/:leadProfileId` (`LeadProfileCard`), `/t/:tenantId/widgets/:widgetId/config` (draft editor + publish), `/t/:tenantId/routing`, `/t/:tenantId/crm-mapping`, `/t/:tenantId/analytics` (funnel), `/t/:tenantId/sync-health`. All routes are guarded by an auth + tenant-membership check so a user cannot load another `Tenant`'s data; deep links open the rep directly on a lead card from a Slack/email notification.

**Styling**

- *Widget:* All styles scoped inside the Shadow DOM (constructable stylesheet injected by the bundle) so host-site CSS can neither leak in nor be overridden out. CSS custom properties (`--dealthreads-primary`, `--dealthreads-radius`, `--dealthreads-font`) are populated at runtime from `WidgetConfig.themeJson` for per-tenant branding. No external font/CSS network requests; system font stack by default with optional tenant font. Hard budget: total bundle < 150 KB gzipped (CI gate fails the build if exceeded).
- *Admin/Rep SPA:* Tailwind CSS utility classes with a small shared component layer (buttons, badges, tables). Confidence and sync-status use a fixed semantic palette (green = confident/synced, amber = low-confidence/needs_review, red = unavailable/failed) so Marcus and Devin read state at a glance.

#### Backend Requirements

Node.js 20 + TypeScript on **NestJS (REST)**. Async work (enrichment, scoring, CRM sync, routing, notifications) runs on **BullMQ over Redis** with bounded retries and exponential backoff. LLM, enrichment, and CRM providers sit behind swappable interface adapters. PostgreSQL 16 is the system of record with row-level tenant scoping; every request is tenant-scoped and every write is tenant-stamped. Standard envelope for errors: `{ "error": { "code": <HTTP>, "type": "<machine_code>", "message": "<human>", "details": [...] } }`.

##### API Endpoints

**1. `GET /api/v1/widgets/{widgetId}/config`** — first call the embedded script makes on page load; returns the published config for an allowed origin.

- *Request body:* None. Carries `widgetId` (path; resolves the parent widget, then its current `published` `WidgetConfig`); `Origin` header is validated against `Tenant.allowedDomains`. Optional query `pageUrl` for page/campaign-aware copy.
- *Response (success `200`):*
  ```json
  {
    "widgetId": "wgt_8f12",
    "tenantId": "ten_001",
    "configVersion": 7,
    "status": "published",
    "theme": { "primary": "#1B4DFF", "radius": "12px", "logoUrl": "https://cdn.dealthreads.io/t/ten_001/logo.svg" },
    "welcome": { "headline": "Tell us what you're solving", "subtext": "A few quick questions, then the right person reaches out." },
    "requiredFields": ["consent", "workEmail", "businessNeed", "timeline"],
    "consent": { "policyVersion": "2026-04-01", "text": "We process your responses to route you to the right rep...", "region": "auto" }
  }
  ```
- *Response (error):* `403 origin_not_allowed` (Origin not in `allowedDomains`); `404 widget_not_found`; `409 no_published_config` (only drafts exist).
- *Validation:* `Origin` must match an `allowedDomains` entry (exact host or configured wildcard); only `status = published` configs are ever returned (drafts never served to live sites). Response is CDN/edge-cacheable per `configVersion` with a short TTL; no auth token required (public, origin-gated, read-only). The **Fallback Form** is non-disableable, so the config exposes no enable/disable toggle for it (per Business Rule 8 and the glossary Fallback Form definition — a visitor must always be able to reach the company); the widget renders the fallback whenever the conversation service is unavailable.

**2. `POST /api/v1/widget-sessions`** — creates the anonymous `ConversationSession` + conversation when the visitor opens the widget.

- *Request body:*
  ```json
  {
    "widgetId": "wgt_8f12",
    "configVersion": 7,
    "pageUrl": "https://acme.com/pricing",
    "referrer": "https://www.linkedin.com/",
    "utm": { "source": "linkedin", "campaign": "q2-midmarket", "medium": "paid-social" },
    "anonymousVisitorId": "av_3b9c-optional"
  }
  ```
- *Response (success `201`):*
  ```json
  {
    "sessionId": "ses_a1b2",
    "conversationId": "cnv_a1b2",
    "configVersion": 7,
    "status": "active",
    "assistantOpening": "Hi — what are you trying to solve today?"
  }
  ```
- *Response (error):* `403 origin_not_allowed`; `404 widget_not_found`; `409 config_version_stale` (pinned version no longer resolvable — client must re-fetch config); `429 rate_limited`.
- *Validation:* `widgetId` is **required**. `configVersion` is **required**: the embedded script obtains it from the `GET .../config` response it already made on page load and echoes it here so the session pins that exact version for its lifetime. If `configVersion` is omitted, malformed, or does not match a real version for the widget, the request is rejected with `400 validation_error` (no implicit "use latest" fallback — pinning must be explicit so the `409 config_version_stale` path is well-defined and testable). If the supplied `configVersion` is a real-but-no-longer-resolvable version (e.g. superseded and pruned), the server returns `409 config_version_stale` and the client re-fetches config and retries. `Origin` re-checked against `allowedDomains`; `pageUrl` host must match the allowed domain; `utm`/`referrer` length-capped and sanitized; per-IP and per-`widgetId` rate limiting via Redis to blunt abuse/cost. No personal data accepted here — session is anonymous by construction.

**3. `POST /api/v1/conversations/{conversationId}/messages`** — processes one visitor turn; stores it, calls the Conversation Orchestrator (Claude `claude-sonnet`), returns the assistant reply plus extracted fields, missing required fields, and completion status.

- *Request body:*
  ```json
  { "sessionId": "ses_a1b2", "message": "We need to replace our contact form, budget is around $40k, hoping to start next quarter." }
  ```
- *Response (success `200`):*
  ```json
  {
    "conversationId": "cnv_a1b2",
    "assistantReply": "Got it — a Q3 start at roughly $40k. What's your work email so the right rep can follow up?",
    "extractedFields": {
      "businessNeed": { "value": "replace static contact form", "confidence": 0.91 },
      "budgetRange": { "value": "$25k-$50k", "confidence": 0.78 },
      "timeline": { "value": "next_quarter", "confidence": 0.88 }
    },
    "missingRequiredFields": ["consent", "workEmail"],
    "consentRequired": true,
    "complete": false
  }
  ```
- *Response (error):* `400 validation_error` (empty/oversized message); `404 conversation_not_found`; `409 conversation_closed` (already completed/abandoned); `422 extraction_unparseable` (LLM returned non-schema output after retries → client falls back to plain reply, no field write); `502 llm_upstream_error`; `503 conversation_service_unavailable` (signals the widget to show the **Fallback Form**); `429 rate_limited`.
- *Validation:* `sessionId` must own `conversationId` and be `active`; **message length 1–2,000 characters** (the single canonical visitor-message cap, matching Section 4.1 and the Section 8 fixtures; messages over 2,000 chars are rejected with `400 validation_error`). Structured field extraction uses Claude **structured-output JSON schemas**, but email/phone/enum/required-field checks run in **deterministic validators outside the LLM** — the model never decides field validity. Guardrails block sensitive/off-policy topics per the bound **Question Policy** (sourced from `question_policies.forbidden_topics_json`); the consent disclosure is enforced server-side before any personal-data field is accepted, and unknown/uncertain extractions are stored with confidence, never coerced to a positive value.

**4. `POST /api/v1/conversations/{conversationId}/complete`** — finalizes the conversation, creates/updates the `Lead`, writes the `ConsentRecord`, computes completeness, returns qualification status + next action.

- *Request body:* `{ "sessionId": "ses_a1b2", "consentAccepted": true, "policyVersion": "2026-04-01" }`
- *Response (success `201`):*
  ```json
  {
    "leadProfileId": "lead_77a",
    "status": "qualified",
    "profileCompleteness": 0.86,
    "capturedRequiredFields": ["consent", "workEmail", "businessNeed", "timeline"],
    "nextAction": "A rep will reach out within one business hour.",
    "enrichmentQueued": true
  }
  ```
- *Response (error):* `400 consent_not_accepted` (required fields include consent but `consentAccepted=false`); `404 conversation_not_found`; `409 already_completed` (idempotent — returns the existing `leadProfileId`); `422 required_fields_missing` (lists which of consent/workEmail/businessNeed/timeline are absent).
- *Validation:* The `status` written is drawn from the canonical **`Lead.status` enum** (`qualified` | `disqualified` | `incomplete` | `needs_review`). When all four required fields (consent, work email, business need, timeline/urgency) are present, the lead is finalized as `qualified` or `disqualified` based on the score/segment; when one or more required fields are absent it is finalized as `incomplete` (never `qualified`). `ConsentRecord` is written immutably with `policyVersion`, `consentText`, `sourceUrl`, `region`, `acceptedAt`. Completion is **idempotent** on `conversationId`. On success the handler **synchronously enqueues the asynchronous enrichment job** (see endpoint 5) onto BullMQ and returns immediately — enrichment runs out of band and never blocks the visitor's confirmation. All finalized leads that captured the required fields (both `qualified` and `disqualified`) proceed downstream to scoring, routing, and CRM sync (see endpoints 7–9); `incomplete` leads are persisted for analytics and operator review but are not auto-routed to a rep.

**5. `POST /api/v1/leads/{leadProfileId}/enrich`** — queues the async enrichment job (Clearbit then the secondary enrichment provider).

- *Request body:* `{ "force": false }` (optional; `force=true` bypasses the company-domain cache).
- *Response (success `202`):* `{ "enrichmentJobId": "enr_55c", "status": "queued", "provider": "clearbit" }`
- *Response (error):* `404 lead_not_found`; `409 enrichment_in_progress` (returns the in-flight `enrichmentJobId`); `429 rate_limited`.
- *Validation:* Lead must have a work email or company domain to be enrichable; **Clearbit** queried first for firmographic + technographic signals, **the secondary enrichment provider** as decision-maker/contact fallback; `requestHash` (tenant + normalized domain + provider) dedupes and drives the domain cache where contractually allowed; every returned field is normalized and stored with **source + confidence**; per-job cost is recorded to feed **Cost per Qualified Lead**. On no match or provider outage the `EnrichmentProfile.status` is set to `unavailable` and the lead **proceeds on first-party data** (enrichment never blocks CRM sync). Bounded retries with exponential backoff via BullMQ.

**6. `GET /api/v1/leads/{leadProfileId}`** — full structured buyer profile for the operator UI and CRM card.

- *Request body:* None (path param + bearer/tenant auth).
- *Response (success `200`):*
  ```json
  {
    "id": "lead_77a", "tenantId": "ten_001", "status": "qualified",
    "contact": { "name": "Priya Nair", "email": "priya@midco.com", "role": "VP Operations", "emailType": "work" },
    "company": { "name": "MidCo", "domain": "midco.com", "size": "150-250", "industry": "B2B SaaS", "revenueRange": "$20M-$50M", "lastFunding": { "round": "Series B", "amount": "$18M", "source": "clearbit", "confidence": 0.82 } },
    "qualification": { "businessNeed": "replace static contact form", "budgetRange": "$25k-$50k", "timeline": "next_quarter", "authoritySignal": "decision_maker" },
    "summary": "VP Ops at a 180-person B2B SaaS co; wants to replace a static form, ~$40k, Q3 start.",
    "icpScore": 84,
    "score": { "segment": "high_fit", "rationale": [ {"factor": "company_size", "weight": 0.2, "contribution": 17}, {"factor": "urgency", "weight": 0.25, "contribution": 22} ], "recommendedAction": "Call within the hour; lead with form-replacement ROI." },
    "enrichment": { "status": "completed", "provider": "clearbit", "fields": { "techStack": {"value": ["HubSpot","Segment"], "source": "clearbit", "confidence": 0.74} } },
    "crmSync": { "status": "synced", "provider": "hubspot", "externalObjectIds": {"contactId": "201", "companyId": "552", "dealId": "8841"} },
    "profileCompleteness": 0.86,
    "assignedOwnerId": "usr_marcus"
  }
  ```
- *Response (error):* `401 unauthorized`; `403 wrong_tenant` (record belongs to another `Tenant`); `404 lead_not_found`.
- *Validation:* Caller's tenant must equal `lead.tenantId` (row-level scope enforced); `status` is one of the canonical `Lead.status` values and `score.segment` is one of `high_fit` | `nurture` | `low_fit`; first-party **Intent Signal** fields are returned distinct from third-party enriched facts; every enriched field carries `source` + `confidence` so low-confidence values render flagged.

**7. `POST /api/v1/leads/{leadProfileId}/score`** — compute/recompute the transparent **ICP Fit Score**.

- *Request body:* `{ "recompute": true }` (optional; recompute after enrichment lands).
- *Response (success `200`):*
  ```json
  { "leadProfileId": "lead_77a", "icpScore": 84, "segment": "high_fit",
    "rationale": [ {"factor": "company_size", "contribution": 17}, {"factor": "tech_fit", "contribution": 9} ],
    "recommendedAction": "Call within the hour; lead with form-replacement ROI." }
  ```
- *Response (error):* `404 lead_not_found`; `409 score_locked` (a recompute is already running); `422 insufficient_fields` (no scorable signals captured yet).
- *Validation:* Score is a transparent weighted 0–100 combining firmographic fit, urgency, pain, budget, authority, and tech fit; the resulting `segment` is the canonical `high_fit` (≥ 75) / `nurture` (50–74) / `low_fit` (< 50); **unknown fields are never counted as positive evidence** (they reduce confidence/completeness, not inflate the score); every score persists a `rationale` citing the fields used. Typically invoked by the scoring worker after enrichment completes or partially completes.

**8. `POST /api/v1/crm/sync`** — idempotently syncs one lead to the tenant CRM (HubSpot first, Salesforce second adapter).

- *Request body:* `{ "leadProfileId": "lead_77a", "provider": "hubspot" }`
- *Response (success `200`):*
  ```json
  { "crmSyncRecordId": "csr_90f", "provider": "hubspot", "status": "synced",
    "operation": "created",
    "externalObjectIds": {"contactId": "201", "companyId": "552", "dealId": "8841"},
    "wroteActivityNote": true, "attemptCount": 1 }
  ```
- *Response (error):* `404 lead_not_found`; `409 sync_in_progress`; `422 crm_mapping_invalid` (a mapped target property does not exist in the tenant CRM); `424 crm_auth_expired` (token expired → operator alert to Devin, job retried after refresh); `429 crm_rate_limited`; `502 crm_upstream_error`.
- *Validation:* **By design this idempotent-upsert endpoint always returns `200` on success — never `201` — for both create and update**, because a retry of the same `(tenantId, leadProfileId)` must be indistinguishable from the first call (the operation is a stable upsert keyed on stored external IDs, not a resource-creation POST). The `operation` field (`"created"` | `"updated"`) tells the caller which branch ran without changing the status code. **Idempotent CRM Sync** keyed on `tenantId` + `leadProfileId` + stored `externalObjectIds`; dedupe **by email, then domain + company name**; **protected fields (lifecycle stage, owner) are never overwritten without explicit config**; writes mapped DealThreads fields + a DealThreads summary + an activity note; `CrmSyncRecord` stores provider, status, external IDs, `attemptCount`, `errorCode`. Both `qualified` and `disqualified` leads are synced (a `disqualified`/`low_fit` lead still lands in the CRM so RevOps has full pipeline data and can nurture it); `incomplete` leads are not auto-synced. Bounded BullMQ retries with backoff; contributes to **CRM Sync Success Rate** (≥ 98%) and **Speed-to-Profile** (≤ 2 min p95).

**9. `POST /api/v1/routing/evaluate`** — evaluates `RoutingRule`s in priority order, assigns owner/queue, emits the notification payload.

- *Request body:* `{ "leadProfileId": "lead_77a" }`
- *Response (success `200`):*
  ```json
  { "leadProfileId": "lead_77a", "assignedOwnerId": "usr_marcus", "matchedRuleId": "rule_12",
    "assignmentType": "owner", "fallbackUsed": false,
    "notification": { "channel": "slack", "priority": "high", "deepLink": "https://app.dealthreads.io/t/ten_001/leads/lead_77a" } }
  ```
- *Response (error):* `404 lead_not_found`; `409 not_scored_yet` (must be scored before routing); `422 no_owner_resolved` only if even the fallback queue is unconfigured (configuration error surfaced to operator).
- *Validation:* Rules evaluated strictly by ascending `priority`; first match wins. Both `qualified` and `disqualified` leads enter routing: a **fallback queue guarantees every such lead resolves to an owner or a queue** (no silent drops). The kernel's "100% of qualified leads resolve to an owner or queue" guarantee is the floor — `qualified` leads route to a matching named owner (or the fallback queue) and fire a **high-priority notification** so Marcus can act while intent is hot, while `disqualified`/`low_fit` leads route to a nurture/fallback queue (`assignmentType: "queue"`, lower-priority or suppressed notification) rather than a named rep. `incomplete` leads are not routed.

**10. `PUT /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config`** — create/update a **draft** widget config (operator admin surface).

- *Request body:*
  ```json
  { "theme": { "primary": "#1B4DFF" }, "welcome": { "headline": "Tell us what you're solving" },
    "allowedPages": ["/pricing","/demo","/product/*"], "questionPolicyId": "qp_4",
    "requiredFields": ["consent","workEmail","businessNeed","timeline"],
    "consent": { "policyVersion": "2026-04-01", "text": "..." } }
  ```
- *Response (success `200`):* `{ "configId": "cfg_19", "widgetId": "wgt_8f12", "version": 8, "status": "draft", "updatedAt": "2026-06-01T17:00:00Z" }`
- *Response (error):* `401 unauthorized`; `403 wrong_tenant`; `404 widget_not_found`; `422 config_validation_error` (e.g. required fields omit `consent`, or `questionPolicyId` not found).
- *Validation:* Admin role + tenant membership required; `widgetId` (path) must resolve to a `widgets` row owned by `tenantId`; saves a **draft** `WidgetConfig` version under that widget (live sessions keep using the latest *published* version); `requiredFields` must include `consent`; `questionPolicyId` must reference an existing `question_policies` row owned by the same tenant; `allowedPages` and CRM mapping validated for shape; never mutates a published version in place.

**11. `POST /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config/publish`** — publish a draft so new sessions adopt it.

- *Request body:* `{ "version": 8 }`
- *Response (success `200`):* `{ "configId": "cfg_19", "widgetId": "wgt_8f12", "version": 8, "status": "published", "publishedAt": "2026-06-01T17:05:00Z" }`
- *Response (error):* `401 unauthorized`; `403 wrong_tenant`; `404 version_not_found`; `409 already_published`; `422 not_publishable` (draft fails validation gate, e.g. missing consent copy or an unresolved `questionPolicyId`).
- *Validation:* Promotes the named draft to `published` for that `widgetId`; **in-flight sessions retain their pinned `configVersion`**; only one published version is live per widget at a time (enforced by the partial-unique index on `(tenant_id, widget_id)` where `status = 'published'`); publish is audited (who/when) for the manually onboarded beta tenants.

**12. `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel`** — funnel + outcome analytics for dashboards/exports.

- *Request body:* None. Query params: `from`, `to`, optional `widgetId`, `groupBy`.
- *Response (success `200`):*
  ```json
  { "tenantId": "ten_001", "window": {"from":"2026-05-01","to":"2026-05-31"},
    "funnel": { "widgetLoads": 4200, "conversationsStarted": 1100, "conversationsCompleted": 880, "leadsQualified": 610, "synced": 605, "closedWon": 92 },
    "metrics": { "conversationCompletionRate": 0.80, "requiredFieldCaptureRate": 0.88, "crmSyncSuccessRate": 0.992, "speedToProfileP95Seconds": 96, "enrichmentMatchRate": 0.72, "medianCycleTimeHours": 38, "baselineCycleTimeHours": 52, "cycleTimeReductionPct": 0.27 },
    "questionAttribution": [ {"questionId":"q_timeline","liftOnClosedWon":0.18,"significant":true} ] }
  ```
- *Response (error):* `401 unauthorized`; `403 wrong_tenant`; `400 invalid_date_range`.
- *Validation:* Tenant-scoped; powers the north-star **Cycle Time** vs each client's pre-DealThreads baseline and the per-question **deal-quality attribution** required by the decision rule (rework the **Conversation Flow** first if cycle time does not move). Per-question attribution joins `AnalyticsEvent` to the `question_policies` version active for each session so lift is attributed to a specific versioned question. Heavy aggregations served from materialized rollups over `AnalyticsEvent`.

#### Database Changes

PostgreSQL 16 (managed on Render), single schema for the beta, **row-level tenant scoping** on every table (`tenant_id` on all rows; enforced in the data layer and via Postgres RLS policies). **JSONB** holds provider payloads and extracted fields during beta. All PKs are prefixed string IDs (e.g. `lead_77a`). All tables carry `created_at timestamptz default now()`. `ConversationMessage.bodyEncrypted` and lead PII are encrypted at the application layer; CRM tokens live in the managed secrets store, never in Postgres.

**New Tables** — the ten kernel `dataEntities` objects (names/key fields verbatim) **plus two supporting tables the API surface requires but the kernel underspecified**: `widgets` (the stable parent that gives `widgetId` a home in the data model) and `question_policies` (the versioned Question Policy referenced by `WidgetConfig.questionPolicyId`). That is **twelve tables total**, reconciling the earlier "ten tables" assertion with the columns and constraints the endpoints rely on.

*Kernel data entities (10):*

- **`tenants`** (`Tenant`) — `id (PK)`, `name`, `status`, `allowed_domains text[]`, `retention_months int`, `created_at`, `updated_at`. Root of multi-tenant isolation.
- **`widget_configs`** (`WidgetConfig`) — `id (PK)`, `tenant_id (FK→tenants)`, `widget_id (FK→widgets)`, `version int`, `status` (`draft`|`published`), `theme_json jsonb`, `conversation_json jsonb`, `consent_json jsonb`, `allowed_pages_json jsonb`, `question_policy_id (FK→question_policies)`, `published_at`. Unique `(tenant_id, widget_id, version)`; only one `published` per `(tenant_id, widget_id)`. (`id` is a specific version's identifier; the stable `widget_id` is what live sessions and the public `GET .../config` resolve against.)
- **`conversation_sessions`** (`ConversationSession`) — `id (PK)`, `tenant_id (FK)`, `widget_id (FK→widgets)`, `config_version int`, `anonymous_visitor_id`, `page_url`, `referrer`, `utm_json jsonb`, `status`, `started_at`, `completed_at`. `config_version` pins the policy for the session's lifetime.
- **`conversation_messages`** (`ConversationMessage`) — `id (PK)`, `tenant_id (FK)`, `conversation_id (FK→conversation_sessions)`, `sender` (`visitor`|`assistant`), `body_encrypted bytea`, `extracted_fields_json jsonb`, `model_metadata_json jsonb`, `created_at`. Canonical transcript.
- **`leads`** (`Lead`) — `id (PK)`, `tenant_id (FK)`, `conversation_id (FK)`, `status` (canonical enum `qualified`|`disqualified`|`incomplete`|`needs_review`), `contact_json jsonb`, `company_json jsonb`, `qualification_json jsonb`, `summary text`, `icp_score int`, `score_json jsonb` (carries `segment` ∈ `high_fit`|`nurture`|`low_fit`), `profile_completeness numeric`, `assigned_owner_id`. Central object reps consume.
- **`enrichment_profiles`** (`EnrichmentProfile`) — `id (PK)`, `tenant_id (FK)`, `lead_profile_id (FK→leads)`, `provider`, `status` (`completed`|`partial`|`unavailable`|`needs_review`), `attempt_count int`, `request_hash`, `result_json jsonb`, `confidence numeric`, `error_code`, `completed_at`.
- **`consent_records`** (`ConsentRecord`) — `id (PK)`, `tenant_id (FK)`, `conversation_id (FK)`, `lead_profile_id (FK)`, `policy_version`, `consent_text text`, `source_url`, `region`, `accepted_at`. Immutable (no UPDATE/DELETE via app; deletion only through the GDPR/CCPA erasure workflow).
- **`routing_rules`** (`RoutingRule`) — `id (PK)`, `tenant_id (FK)`, `priority int`, `conditions_json jsonb`, `assignment_json jsonb`, `status`, `created_at`, `updated_at`. Evaluated ascending by `priority`.
- **`crm_sync_records`** (`CrmSyncRecord`) — `id (PK)`, `tenant_id (FK)`, `lead_profile_id (FK)`, `provider`, `status`, `external_object_ids_json jsonb`, `attempt_count int`, `error_code`, `completed_at`. Drives idempotency/dedupe.
- **`analytics_events`** (`AnalyticsEvent`) — `id (PK)`, `tenant_id (FK)`, `widget_id (FK→widgets)`, `session_id`, `lead_profile_id`, `event_type`, `properties_json jsonb`, `created_at`. Append-only funnel/operational event stream.

*Supporting tables required by the API surface (2):*

- **`widgets`** (the stable parent of `WidgetConfig` versions; gives `widgetId` a concrete home) — `id (PK)` (this is the `widgetId` used in `GET /api/v1/widgets/{widgetId}/config` and as the `widget_id` FK on `widget_configs`, `conversation_sessions`, and `analytics_events`), `tenant_id (FK→tenants)`, `name`, `status`, `created_at`, `updated_at`. One row per logical embeddable widget; its `WidgetConfig` rows are its versions.
- **`question_policies`** (`Question Policy` — the versioned, weekly-iterated policy that is the primary lever of the decision rule and the basis of per-question deal-quality attribution) — `id (PK)` (referenced by `widget_configs.question_policy_id`), `tenant_id (FK→tenants)`, `version int`, `status` (`draft`|`published`), `questions_json jsonb` (allowed questions, priority, required fields), `forbidden_topics_json jsonb` (sensitive/off-policy topics the guardrails block), `created_at`, `updated_at`. Persists the versioned questions/priorities/required fields/forbidden topics that endpoint 3's guardrails and endpoint 12's attribution rely on.

**Schema Updates**

- Add Postgres **CHECK constraints** on enumerated columns: `widget_configs.status`, `question_policies.status` (`draft`|`published`); `conversation_messages.sender` (`visitor`|`assistant`); `conversation_sessions.status`; `enrichment_profiles.status` (`completed`|`partial`|`unavailable`|`needs_review`); and **`leads.status` against the canonical full enum (`qualified`|`disqualified`|`incomplete`|`needs_review`)**. Also a CHECK on the `segment` value inside scoring output (`high_fit`|`nurture`|`low_fit`), and a `NOT NULL tenant_id` on every table.
- Add a generated/maintained `request_hash` uniqueness guard on `enrichment_profiles (tenant_id, request_hash)` to back the domain-cache + dedupe behavior.
- Add a partial uniqueness rule so only one `widget_configs` row per `(tenant_id, widget_id)` may have `status = 'published'`.
- Add a partial uniqueness rule so only one `question_policies` row per `(tenant_id, version)` lineage may have `status = 'published'`, keeping the active policy unambiguous.
- Add Postgres **RLS policies** keyed on the request's `tenant_id` claim so cross-tenant reads are impossible even on a query bug.
- Provision **materialized views** (`mv_funnel_daily`, `mv_question_attribution`) over `analytics_events`/`leads`/`question_policies` to serve `GET .../analytics/funnel` cheaply, refreshed on a schedule.

**Indexes**

- `widgets (tenant_id, status)` — operator listing and `widgetId` → tenant resolution on the public config call.
- `widget_configs (tenant_id, widget_id, version)` **UNIQUE** and a partial-unique index on `(tenant_id, widget_id)` where `status = 'published'` — version lookup and single-published guarantee.
- `question_policies (tenant_id, version)` — policy version resolution for guardrails and attribution joins.
- `leads (tenant_id, status, icp_score DESC)` — `LeadInbox` sort/filter and routing input.
- `leads (tenant_id, assigned_owner_id, created_at DESC)` — Marcus's per-owner queue.
- `conversation_messages (tenant_id, conversation_id, created_at)` — transcript fetch.
- `conversation_sessions (tenant_id, widget_id, started_at DESC)` and `(tenant_id, status)` — funnel/abandonment.
- `enrichment_profiles (tenant_id, request_hash)` **UNIQUE** — dedupe/cache; plus `(tenant_id, lead_profile_id)`.
- `crm_sync_records (tenant_id, lead_profile_id)` and a GIN index on `external_object_ids_json` — idempotency lookups.
- `routing_rules (tenant_id, priority)` — ordered evaluation.
- `analytics_events (tenant_id, event_type, created_at)` and `(tenant_id, lead_profile_id)` — funnel + cycle-time joins; `BRIN (created_at)` on the append-only table for time-range scans.
- `consent_records (tenant_id, lead_profile_id)` — audit/erasure lookups.
- GIN indexes on heavily-queried JSONB (`leads.qualification_json`, `analytics_events.properties_json`) for attribution queries.

**Migrations**

- Managed via a versioned, forward-only migration tool run from the NestJS app (TypeORM/Prisma-style migrations) on Render deploy; each migration is reversible in code and reviewed before publish. Migration **0001** creates all **twelve tables** (the ten kernel entities plus `widgets` and `question_policies`), their enums/CHECKs, FKs (including `widget_configs.widget_id → widgets`, `widget_configs.question_policy_id → question_policies`, and the `widget_id` FKs on `conversation_sessions` and `analytics_events`), RLS policies, and the indexes above. Because beta data volumes are small (5 managed clients), migrations run online; index creation uses `CREATE INDEX CONCURRENTLY` to avoid write locks. The materialized views and their refresh jobs ship in migration **0002** once event volume exists. No destructive/down-migrations are run against tenant data without an explicit operator-approved backup; `consent_records` are exempt from routine deletes and only removed via the audited GDPR/CCPA erasure path.

---

### 7. USER INTERFACE SPECIFICATIONS

The UI spans two audiences. The **visitor-facing chat widget** (Priya Nair, the high-intent visitor) lives inside a Shadow DOM on the customer's own marketing pages and replaces or augments the static contact form. The **internal admin/rep console** (Marcus the AE, Maya in RevOps, Devin the coordinator) is the React SPA where the enriched **Buyer Profile (Lead)** is consumed and the widget/routing is configured.

#### Wireframes/Mockups

References (to be produced in Figma under the DealThreads MVP Beta v0.1 file; linked here as the source of truth for build):

- `Figma / Widget — Visitor Flow`: Launcher (closed), ChatPanel (open), ConsentBanner, in-conversation field-capture state, ConfirmationCard, and FallbackForm (degraded) frames at 360 px and 1440 px host widths.
- `Figma / Admin — Lead Inbox & Profile`: `LeadInbox` table and the `LeadProfileCard` (Marcus's 30-second scan view) with ICP score, rationale, enrichment confidence badges, transcript link, recommended action.
- `Figma / Admin — Config & Routing`: `WidgetConfigEditor` (draft/publish), `QuestionPolicyEditor`, `CrmMappingPanel`, `RoutingRulesBuilder`, `SyncHealthPanel`.
- `Figma / Admin — Funnel Dashboard`: north-star **Cycle Time** card, funnel chart, per-question attribution table.
- `Figma / Notification`: Slack/email high-priority lead card with deep link.

#### Layout Requirements

**Page/Screen Structure**

*Widget (visitor side):* A single fixed-position overlay anchored bottom-right of the host page, fully contained in a Shadow root so it cannot disrupt the host layout. Two visual states: (1) **Launcher** — a compact branded bubble/pill with welcome microcopy; (2) **ChatPanel** — a card (default ~ 380 × 560 px on desktop) with three stacked regions: header (tenant logo, title, minimize/close), scrolling `MessageList`, and a pinned `Composer`. The `ConsentBanner` slides in above the composer at the first personal-data step. Terminal states swap the message region for `ConfirmationCard` or `FallbackForm`. The widget never opens a new page or modal on the host site.

*Admin/Rep console:* Persistent left nav (Leads, Widgets/Config, Routing, CRM Mapping, Analytics, Sync Health) + top bar (tenant switcher, user menu). Main content is route-driven. The `LeadProfileCard` uses a two-column layout: left = identity + intent summary + transcript link; right = ICP score, rationale, enrichment highlights with confidence, recommended action. The `LeadInbox` is a dense, sortable table above an optional detail drawer.

**Navigation**

*Widget:* No URL navigation. Movement is launcher → open → converse → confirm, with an always-available minimize/close that preserves the in-flight session (`sessionStorage`) so reopening resumes the conversation. A single "start over" affordance resets to the launcher.

*Admin/Rep console:* Left-nav primary navigation; breadcrumb on the lead card back to the inbox. A high-priority Slack/email notification deep-links Marcus straight to `/t/:tenantId/leads/:leadProfileId`. Tenant scope is locked in the URL; switching tenants is an explicit top-bar action.

**Information Hierarchy**

*Widget:* The conversation is the hero — one question at a time, the assistant's latest turn most prominent, prior turns scrollable. Consent is surfaced before any contact-detail request, never buried. The confirmation's "who follows up and when" is the single dominant element at the end so Priya leaves knowing the next step.

*Rep card:* Optimized for a sub-30-second scan in this priority order: (1) **who + why** (name, role, company, one-line intent summary), (2) **ICP Fit Score** (0–100) + segment (`high_fit` / `nurture` / `low_fit`, shown as Hot/High-Fit, Warm/Nurture, Low-Fit) + recommended next action, (3) enrichment highlights (size, funding, tech stack) each with a source + confidence badge, (4) source page + transcript link. **First-party Intent Signal content is visually separated from third-party enriched facts**, and low-confidence fields are flagged so Marcus knows what to verify rather than trusting blindly.

#### Interactive Elements

**Buttons**

- *Widget:* Launcher button (open); header minimize + close; `Composer` send (disabled while empty/in-flight); `ConsentBanner` "Agree & continue" + a link to the full policy; `ConfirmationCard` "Done"/close; `FallbackForm` "Send". Quick-reply chips render for enum questions (e.g. timeline: This month / This quarter / Later) to reduce typing.
- *Admin:* `LeadProfileCard` "Open in HubSpot/Salesforce" (deep link to the CRM record via stored `externalObjectIds`), "View transcript", "Recompute score", "Reassign owner". `WidgetConfigEditor` "Save draft" + "Publish" (publish gated behind a confirm dialog noting in-flight sessions keep their pinned version). `QuestionPolicyEditor` "Save draft" + "Publish" for the bound policy version. `RoutingRulesBuilder` "Add rule", drag-to-reorder priority, "Add fallback queue" (required). `SyncHealthPanel` "Retry sync", "Reconnect CRM" (on `crm_auth_expired`).

**Forms**

- *Widget:* The conversation *is* the form — fields are extracted from natural-language turns, not rendered as a long static form. Where structured input helps, the composer offers chips. The `FallbackForm` is a conventional short form (name, work email, message) shown only on AI-service unavailability; it is always available (not tenant-disableable), and its captured data is preserved/synced.
- *Admin:* `WidgetConfigEditor` (branding, copy, allowed pages, `questionPolicyId`, required fields incl. mandatory consent, consent copy); `QuestionPolicyEditor` (allowed questions + priority, required fields, forbidden/sensitive topics) producing the versioned policy a config binds to; `CrmMappingPanel` (DealThreads field → CRM property dropdowns with protected-field guards); `RoutingRulesBuilder` (condition rows on ICP score/territory/size/industry/product interest → owner/queue). All admin forms validate inline against the same rules as `PUT .../config` (e.g. consent required, `questionPolicyId` must resolve, mapped property must exist).

**Feedback**

- *Widget:* Optimistic render of the visitor's message, then a typing indicator until the assistant reply returns; inline, non-blocking validation hints (e.g. "that doesn't look like a work email — okay to use it?") without hard-blocking the conversation; a clear confirmation state on completion. On `503 conversation_service_unavailable`, a single calm message ("Our assistant is briefly unavailable — leave your details and we'll follow up") then the `FallbackForm`.
- *Admin:* Toasts on save/publish/retry success and failure; confidence/sync status shown as fixed-palette badges (green confident/synced, amber low-confidence/needs_review, red unavailable/failed); the lead segment badge uses the canonical `high_fit`/`nurture`/`low_fit` labels; operator alerts (Devin) banner on sync failure or expired token; the **FunnelDashboard** highlights the north-star **Cycle Time** vs baseline with a delta and direction.

**Loading States**

- *Widget:* Non-blocking script load (host page never blocked, < 150 KB gzipped budget); skeleton launcher until `config` resolves; typing indicator during `/messages`; a brief spinner on `/complete` before the `ConfirmationCard`. Enrichment runs asynchronously and never blocks the visitor's confirmation — Priya is done the moment the lead is created (the completion handler enqueues the enrichment job and returns immediately).
- *Admin:* Skeleton rows in `LeadInbox`; per-section skeletons on the `LeadProfileCard` (the enrichment block shows "Enriching…" then resolves or shows "Enrichment unavailable — first-party data shown" without blocking the rest of the card); inline spinners on score recompute and CRM retry. Speed-to-Profile target (≤ 2 min p95) means a just-created lead may show enrichment "in progress" briefly before the full card settles.

#### Responsive Design

Because the widget is embedded on *customer* sites the team does not control, responsive behavior is specified against host-viewport widths and must be robust to arbitrary host CSS (Shadow-DOM isolation guarantees this).

**Desktop** (host viewport ≥ 1024 px)

- *Widget:* Anchored bottom-right; ChatPanel ~ 380 × 560 px floating card; launcher visible at all times; quick-reply chips wrap on one or two rows. Does not obscure host page content (offset from the corner).
- *Admin:* Full two-column `LeadProfileCard`, persistent left nav, multi-column `LeadInbox` (owner, ICP score, segment, sync status, recency), side-by-side editors. FunnelDashboard shows cards + chart in a multi-column grid.

**Tablet** (host viewport 768–1023 px)

- *Widget:* ChatPanel narrows to ~ 92% width with max 420 px, still bottom-anchored; touch targets ≥ 44 px; chips remain tappable. Keyboard open shrinks the message region, not the composer.
- *Admin:* Left nav collapses to an icon rail; `LeadProfileCard` keeps two columns where space allows, otherwise stacks score/enrichment below identity; inbox drops lower-priority columns first (keeps name, ICP score, owner, sync).

**Mobile** (host viewport ≤ 767 px)

- *Widget:* ChatPanel goes effectively full-screen within the Shadow root (100% width, near-full height) with a prominent close control so Priya can return to the page; launcher remains reachable; the composer is pinned above the on-screen keyboard and the message list auto-scrolls to the latest turn. Consent text remains fully legible (no truncation) before any contact detail is requested. The `FallbackForm` stacks single-column. The widget must remain usable on a phone arriving from a LinkedIn campaign — the most common acquisition path.
- *Admin:* Single-column stacked layout; left nav becomes a hamburger drawer; `LeadProfileCard` stacks in scan order (who+why → ICP score + action → enrichment with confidence → source/transcript); `LeadInbox` becomes a card list with ICP score and sync badge per row. The console is functional on mobile for Marcus to triage a notification on the go, but config-heavy editors (mapping, routing, question policy) are optimized for desktop.

### 8. TESTING REQUIREMENTS

**Unit Tests**: Cover the deterministic, vendor-independent logic that the kernel deliberately places *outside* the LLM, since these are the components whose correctness must not depend on a stochastic model or a third-party provider being up.
- **Field extraction & validation**: Test the deterministic validators that run on `extractedFieldsJson` after each `POST /api/v1/conversations/{conversationId}/messages` call — work-email format (and rejection/flagging of free webmail domains like gmail.com per Priya's "personal email" edge case), phone normalization, enum coercion for `budget range` and `timeline/urgency`, and the required-field checklist (consent + work email + business need + timeline/urgency). Assert that malformed or missing values are surfaced as `missingRequiredFields` rather than silently accepted.
- **ICP Fit Score computation (`POST /api/v1/leads/{leadProfileId}/score`)**: Test the transparent weighted 0–100 scoring against fixed input fixtures. The load-bearing assertion: an `unknown` field is **never** counted as positive evidence (a lead with company size unknown must score strictly lower than the same lead with a confirmed in-ICP company size, never higher or equal-by-default). Verify `scoreJson` always emits a rationale citing the exact fields used, plus a `segment` label and `recommended next action`. Test boundary scores (0, 100) and tie-break determinism.
- **Idempotent CRM Sync keying**: Unit-test the dedupe/idempotency key (tenantId + leadProfileId + stored `externalObjectIdsJson`) and the dedupe order (email first, then domain + company name). Assert that a second sync call with the same key updates rather than creates, and that protected CRM fields (lifecycle stage, owner — Devin's pain point) are excluded from the write payload unless explicitly enabled in config.
- **Routing rule evaluation**: Test `RoutingRule` evaluation in strict `priority` order against `conditionsJson` (ICP score, territory, company size, industry, product interest). Assert that when no rule matches, the lead resolves to the fallback queue (guaranteeing "no qualified lead goes unassigned"), and that the emitted assignment payload matches `assignmentJson`.
- **Profile completeness & multi-tenant scoping**: Test `profileCompleteness` math on partial vs full `Lead` records, and assert every repository query enforces row-level `tenantId` scoping so Tenant A can never read Tenant B's leads, configs, or analytics.
- **WidgetConfig versioning**: Test draft/publish transitions — that publishing increments `version` and sets `publishedAt`, and that an in-flight session pinned to `configVersion = N` is unaffected by a publish of version `N+1`.
- **Coverage target**: ≥ 80% line coverage on the scoring, validation, routing, and CRM-mapping modules (the deterministic core); LLM adapters and HTTP controllers are validated primarily through integration tests below.

**Integration Tests**: Exercise the async, multi-service pipeline end-to-end with provider adapters (LLM, enrichment, CRM) swapped for sandbox/mock implementations behind their interfaces, plus a real PostgreSQL 16 and Redis instance to validate the BullMQ job flow.
- **Conversation loop**: Drive `POST /api/v1/widget-sessions` → repeated `POST /.../messages` → `POST /.../complete` against a mocked Claude `claude-sonnet` adapter returning canned structured outputs. Assert a `Lead`, `ConsentRecord`, and `ConversationMessage` rows are created with encrypted bodies (`bodyEncrypted`) and that completeness is computed on `complete`.
- **Enrichment job pipeline**: After `POST /api/v1/leads/{leadProfileId}/enrich` (assert HTTP `202` + job id), run the BullMQ worker against a mocked Clearbit-then-the secondary enrichment provider chain. Verify (a) Clearbit is queried first and the secondary enrichment provider is the decision-maker/contact fallback, (b) every returned field is stored with `source` and `confidence`, (c) on no-match or simulated provider outage the `EnrichmentProfile.status` becomes `unavailable`/`partial` and the lead still proceeds with first-party data, and (d) bounded retries with exponential backoff stop at the configured `attemptCount` ceiling.
- **Scoring → routing → CRM sync chain**: Assert the post-completion chain produces a scored `Lead`, evaluates `RoutingRules`, writes a `CrmSyncRecord` via the HubSpot sandbox adapter (contact/company/deal + mapped fields + activity note + DealThreads summary), stores `externalObjectIdsJson`, and fires the high-priority Slack/email notification payload.
- **Idempotency under retry**: Replay `POST /api/v1/crm/sync` for the same lead (simulating a worker retry after a timeout) against the HubSpot sandbox and assert exactly one contact/company/deal exists — no duplicates (Marcus's and Devin's pain point).
- **HubSpot adapter (fully exercised) + Salesforce adapter (contract-only)**: Run the HubSpot OAuth/private-app adapter against HubSpot's sandbox for full create/update/dedupe coverage; for Salesforce, run the second adapter against a mock that satisfies the shared CRM interface contract (the kernel scopes native production Salesforce out of beta). Include a token-expiry path that surfaces an operations alert to Devin.
- **Analytics funnel integrity**: Assert that one visitor journey emits the full ordered `AnalyticsEvent` sequence (widget load → session start → message turns → complete → enrich → score → route → CRM sync → closed-won) and that `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel` returns coherent completion rate, required-field capture rate, sync success, Speed-to-Profile, and per-question deal-quality attribution.
- **Config publish isolation**: Publish a new `WidgetConfig` mid-test and assert `GET /api/v1/widgets/{widgetId}/config` serves the new version to new sessions while an in-flight conversation retains its pinned version.
- **Consent & origin enforcement**: Assert `GET /api/v1/widgets/{widgetId}/config` rejects a disallowed origin (`Tenant.allowedDomains`) and that no contact PII is persisted on a `Lead` until a `ConsentRecord` exists.

**User Acceptance Tests**:

**Scenario 1 — High-intent visitor → enriched profile → routed rep closes faster (the north-star happy path)**
1. Priya Nair lands on a beta client's pricing page from a LinkedIn campaign; the single `<script>` tag loads the Shadow-DOM widget non-blockingly and renders campaign-aware welcome copy in place of the static form (verify page does not jank and bundle is < 150 KB gzipped).
2. Priya opens the widget; a session/conversation is created and the AI greets her and asks what she's trying to solve **before** requesting any contact details.
3. Priya describes a need ("we need conversational lead capture for our pricing page"), gives a timeline ("this quarter"), and her company; the AI extracts intent/need, company, role, and timeline turn by turn and asks the next-best question.
4. The AI presents the consent disclosure; Priya accepts and provides a work email; the system creates the `Lead`, writes the immutable `ConsentRecord`, computes completeness, and shows her a confirmation stating **who** will follow up and **when**.
5. Enrichment runs asynchronously: Clearbit returns company size, industry, revenue range, funding, and tech stack (each tagged source + confidence); the ICP Fit Score resolves to a high score (e.g. 82/100) with a rationale citing the fields used and a recommended next action.
6. Routing assigns the matching rep (Marcus Reed); a `CrmSyncRecord` creates the HubSpot contact/company/deal with the DealThreads summary and activity note; a high-priority Slack notification fires — all within **≤ 2 minutes p95** of completion (Speed-to-Profile).
7. Marcus opens the DealThreads profile card inside HubSpot, scans the intent summary, ICP score + rationale, enrichment highlights, source page, and recommended action in **under 30 seconds**, and makes a contextual first-contact call while intent is hot; the cycle-time clock (widget-complete → closed-won) is now running. **Pass:** profile delivered ≤ 2 min, rep needed zero manual research, deal logged against the north-star metric.

**Scenario 2 — Enrichment miss / personal email → graceful first-party path (resilience)**
1. A visitor opens the widget and completes the conversation but provides a personal email (e.g. gmail.com) and works at a company with no third-party match.
2. Deterministic validation flags the email as non-work and the AI politely requests a work email; the visitor declines, so the flow proceeds on first-party data only (the widget handles this gracefully per Priya's edge cases).
3. On `complete`, the `Lead` and `ConsentRecord` are created; `POST /.../enrich` queues a job; Clearbit returns no match and the secondary enrichment provider fallback also returns no match, so `EnrichmentProfile.status = unavailable` and low-confidence fields are routed to `needs_review` rather than guessed.
4. The ICP Fit Score is computed **without** counting any unknown enriched field as positive evidence, yielding a lower, honest score with a rationale that explicitly notes missing firmographic data and flags fields for the rep to verify.
5. Routing still resolves the lead (to a fallback queue if no rule matches) and CRM sync **still succeeds** with first-party data — enrichment coverage gaps never block sync. The synced record clearly marks low-confidence/unverified fields.
6. Marcus opens the profile, sees the flagged "verify" fields and the honest score, and avoids embarrassing mistargeted outreach. **Pass:** no crash or stuck lead, sync succeeds on first-party data alone, no unknown field inflated the score, low-confidence fields visibly flagged.

**Scenario 3 — RevOps admin iterates the conversation flow and proves a predictive question (the decision-rule loop)**
1. Maya Chen opens the operator/admin console and, via `PUT /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config`, edits the Question Policy in a **draft** — adding/reordering a qualification question hypothesized to predict deal quality (e.g. an explicit budget-range question).
2. Maya reviews the draft in a preview, then calls `POST /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config/publish`; new sessions immediately adopt the new flow version while in-flight sessions retain their pinned `configVersion`.
3. Over the following days, completed conversations emit per-question `AnalyticsEvent`s tagged with the flow version; Maya opens `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel` and reviews completion rate, required-field capture rate, and per-question deal-quality attribution.
4. Maya confirms that the budget-range question's answers are statistically associated with downstream deal quality (closed-won / stage progression), contributing to the **≥ 3 validated predictive questions** success criterion, and that completion rate stayed **≥ 75%** after the change (the new question didn't increase abandonment).
5. Applying the decision rule, Maya observes whether median cycle time moved; because the flow change improved field capture and the predictive signal, she keeps the new version and exports the funnel data to review cycle-time impact with the CRO. **Pass:** flow versioned and published without disrupting live sessions, per-question attribution is visible, ≥ 1 newly validated predictive question identified, completion rate held ≥ 75%.

**Performance Tests**:
- **Widget load**: Assert the bundle is **< 150 KB gzipped** and loads non-blockingly (Shadow-DOM isolated, no layout shift) on a simulated mid-tier connection; first render of the launcher does not block the host page's main thread.
- **Conversation latency**: P95 assistant reply latency for `POST /api/v1/conversations/{conversationId}/messages` (including the `claude-sonnet` call + deterministic extraction) **≤ 3 s**, keeping the chat feeling live; verify graceful degradation to the Fallback Form if the LLM call exceeds a hard timeout.
- **Speed-to-Profile (north-star enabler)**: Load-test the completion → enrich → score → route → CRM-sync chain and assert **≤ 2 minutes p95** from `complete` to profile delivered/synced/routed, per the Speed-to-Profile metric.
- **CRM sync success under retry/load**: Under simulated HubSpot rate-limiting and transient 5xx, assert bounded BullMQ retries with exponential backoff achieve **≥ 98% automatic sync success** with **zero duplicate** records (CRM Sync Success Rate metric).
- **Enrichment match rate (sandbox baseline)**: On a fixture set of enrichable leads (work email/domain present), assert the pipeline records a match-rate metric and surfaces it to the funnel endpoint, validating the **≥ 70%** target instrumentation.
- **Cost-per-qualified-lead instrumentation**: Assert that every Claude conversation and Clearbit/the secondary enrichment provider job records its cost so blended **Cost per Qualified Lead** is computed per tenant and can be asserted against the **≤ $3.50** tracked ceiling.
- **Beta-scale concurrency**: Soak-test at the realistic beta load (5 tenants, a few hundred concurrent sessions on the Render-hosted NestJS API + managed Postgres/Redis) and assert no queue backlog growth, no connection-pool exhaustion, and stable p95 across a 30-minute run.

### 9. IMPLEMENTATION PLAN

**Development Phases**: The build fits the kernel's 2–4 week MVP window with a 3-person team (AI developer, solution architect, customer success manager) and a manual 5-beta-client rollout. Phases run partly in parallel; total ≈ 18 working days.

**Capacity-driven scope cut (read first):** the team is effectively **two engineers** — the customer success manager (CSM) is non-engineering and owns client paperwork, consent-copy drafting, manual onboarding, and baseline collection, not build. Two engineers cannot deliver the full five-service async pipeline, both front-ends, the HubSpot integration, the Salesforce adapter, the admin SPA, analytics, row-level scoping, and the GDPR workflow at production polish in ≈ 18 days. To protect the window, the following are **deliberately descoped from v0.1** (not merely flagged as risk) while preserving every kernel in-scope capability:
  - **Analytics ships as data, not dashboards.** The full `AnalyticsEvent` pipeline and the `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel` endpoint are built and return coherent JSON (north-star cycle-time, completion rate, required-field capture, sync success, Speed-to-Profile, per-question deal-quality attribution, cost-per-qualified-lead), but the **visual dashboard UI is deferred**; for the beta the CSM and Maya consume the funnel endpoint via a thin read-only view plus CSV export. Instrumentation correctness (the kernel's funnel requirement) is fully preserved; only the charting layer is cut.
  - **Operator admin SPA ships a minimal editor set.** The console covers exactly what manual onboarding of 5 clients needs — draft/publish `WidgetConfig` versioning, allowed-domain controls, consent copy, CRM field mapping, and routing-rule editing — but **polished UX (rich previews, bulk editing, in-app analytics charts) is deferred**; where an editor would be gold-plating, the CSM hand-configures via the same `PUT .../config` / `POST .../config/publish` APIs during white-glove onboarding, which the kernel already assumes is manual.
  - **Salesforce stays contract-only.** Per the kernel, only the HubSpot adapter is fully exercised in beta; the Salesforce adapter ships as a contract-conformant, mock-exercised second integration and is **not** hardened against a live Salesforce org inside the window.
  These cuts keep the conversation core, enrichment, transparent scoring, routing, idempotent HubSpot sync, multi-tenant isolation, consent/GDPR handling, and full funnel *instrumentation* in v0.1, and push only presentation polish and Salesforce hardening past the beta.

- **Phase 1 — Foundation & conversation core (Days 1–6).** Stand up the NestJS API on Render with managed PostgreSQL 16 + Redis and the secrets store; implement the multi-tenant schema with row-level `tenantId` scoping for all entities (`Tenant`, `WidgetConfig`, `ConversationSession`, `ConversationMessage`, `Lead`, `ConsentRecord`). Ship the Shadow-DOM Vanilla-TS widget bundled with Vite (single self-initializing `<script>`, < 150 KB gzipped) with launcher, chat UI, consent disclosure, and Fallback Form. Wire the Claude `claude-sonnet` conversation loop behind the LLM adapter interface with versioned system prompts/Question Policy, structured-output field extraction, and the deterministic validators (email/enum/required-field) outside the LLM. **Deliverables:** live API + DB/queues on Render; embeddable widget that loads via `GET /api/v1/widgets/{widgetId}/config`, runs `POST /api/v1/widget-sessions` → `.../messages` → `.../complete`, creates a `Lead` + `ConsentRecord`, and falls back to the static form when AI is unavailable.

- **Phase 2 — Enrichment, scoring, routing & CRM sync (Days 5–12, overlaps Phase 1).** Build the async BullMQ enrichment worker with the Clearbit-primary / secondary-provider fallback adapters (per-field source + confidence, per-job cost tracking, bounded retries/backoff, `unavailable`/`needs_review` statuses). Implement the transparent weighted ICP Fit Score (`POST /api/v1/leads/{leadProfileId}/score`) that never credits unknown fields. Build rule-based routing (`POST /api/v1/routing/evaluate`) with a guaranteed fallback queue, and the idempotent HubSpot adapter (`POST /api/v1/crm/sync`) writing contact/company/deal + mapped fields + activity note + DealThreads summary, dedupe by email then domain+company, protected fields preserved, `externalObjectIdsJson` stored. Add high-priority Slack/email notifications and the Salesforce adapter as a contract-conformant second integration (mock-exercised only, per the scope cut above). **Deliverables:** completion → enrich → score → route → HubSpot sync working end-to-end within the ≤ 2-minute Speed-to-Profile target; rep receives notification and opens a populated DealThreads profile card.

- **Phase 3 — Operator UI, analytics, hardening & beta onboarding (Days 11–18, overlaps Phase 2).** Ship the **minimal-editor** React 18 + Vite operator/admin SPA (per the scope cut): draft/publish `WidgetConfig` versioning (`PUT .../config`, `POST .../config/publish`), allowed-domain controls, consent copy, CRM field mapping, and routing-rule editing — rich previews and in-app charts deferred. Build the full `AnalyticsEvent` pipeline and `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel` (north-star cycle-time, completion rate, required-field capture, sync success, per-question deal-quality attribution, cost-per-qualified-lead), exposed for the beta as a thin read-only view plus CSV export rather than a full dashboard. Run security/compliance hardening (encryption of message bodies, GDPR/CCPA consent + deletion workflow, origin enforcement) and the performance suite. The CSM then manually onboards the 5 beta clients: install widget, connect HubSpot (or Salesforce), configure mapping + routing, capture each client's pre-DealThreads static-form cycle-time baseline. **Deliverables:** working minimal admin console + funnel data (view/export, dashboard charts deferred); 5 beta tenants live with HubSpot/Salesforce connected; baselines recorded so the ≥ 20% cycle-time reduction can be measured.

**Dependencies**:
- **Blocking Dependencies**: (1) The multi-tenant data model + row-level scoping (Phase 1) blocks every entity write and all downstream work. (2) The conversation-complete flow producing a `Lead` + `ConsentRecord` blocks enrichment, scoring, routing, and CRM sync (nothing to enrich/score/sync until a lead exists). (3) The ICP Fit Score blocks routing rules that key on `icpScore` and blocks the rep-facing profile card. (4) The `AnalyticsEvent` pipeline blocks the funnel endpoint and the per-question deal-quality attribution that the decision rule depends on. (5) Recorded per-client static-form **cycle-time baselines** block any claim of the north-star ≥ 20% reduction.
- **Parallel Work**: The Vanilla-TS widget (Phase 1) and the React admin SPA (Phase 3) are independent front-ends and can be built concurrently. Behind their interfaces, the LLM, enrichment, and CRM adapters can be developed in parallel against mocks/sandboxes before live credentials land. The CSM can run client paperwork, consent-copy drafting, and baseline-data collection in parallel with engineering throughout Phases 1–2.
- **External Dependencies**: (1) **LLM provider** — Anthropic Claude (`claude-sonnet`) API access, keys, and rate limits, held in the secrets store. (2) **Enrichment provider contract** — a Clearbit account/contract (firmographic + technographic) and an the secondary enrichment provider account for the decision-maker/contact fallback, including any contractual limits on caching results by company domain. (3) **CRM API access/credentials** — a HubSpot private-app / OAuth app plus per-tenant connection authorized during onboarding (Salesforce credentials as the second adapter once HubSpot stabilizes). (4) **Hosting/infra** — Render (NestJS API + managed PostgreSQL/Redis), Cloudflare CDN over TLS 1.2+ for the widget bundle and admin SPA, and a managed secrets store for CRM tokens and provider keys. (5) **Per-tenant inputs** — each beta client's allowed domains, CRM field mapping, routing rules, consent/privacy policy text, and their historical static-form cycle-time baseline.

**Risk Assessment**:
- **Technical Risks**: (a) **High enrichment + LLM API cost** eroding unit economics, threatening the ≤ $3.50 Cost-per-Qualified-Lead ceiling. (b) **CRM integration complexity** — HubSpot/Salesforce object models, OAuth/token expiry, rate limits, dedupe correctness, and the risk of overwriting protected fields (lifecycle stage, owner) or creating duplicate records on retry. (c) **LLM reliability/latency** — non-deterministic extraction, hallucinated fields, or slow/failed `claude-sonnet` calls breaking the conversation. (d) **Enrichment data quality** — low match rates or stale/noisy data producing mistargeted outreach. (e) **Multi-tenant data isolation** — any row-level scoping gap is a privacy breach across beta clients.
- **Timeline Risks**: (a) The 2–4 week window is tight for a five-service async pipeline plus two front-ends with an effectively two-engineer team; this is addressed structurally by the capacity-driven scope cut above (analytics as data not dashboards, minimal admin editor set, Salesforce contract-only) rather than left as an open risk. (b) **External-credential lead time** — delayed Clearbit/the secondary enrichment provider contracts or per-tenant HubSpot authorization can stall integration work. (c) **Conversation-flow tuning is open-ended** — iterating the Question Policy to hit ≥ 75% completion and find ≥ 3 predictive questions can expand beyond the window. (d) **CRM edge cases** discovered during real onboarding (custom fields, non-standard pipelines) can balloon Phase 2/3. (e) **Baseline scarcity** — the north-star ≥ 20% cycle-time proof needs closed-won deals, which often will not land inside the short beta; left unaddressed this would make the in-beta success bar unfalsifiable.
- **Mitigation Strategies**: (a) **Cost** — track per-job LLM + enrichment cost from day one and surface it in the funnel; use the cost-efficient `claude-sonnet` for the live loop; cache enrichment by company domain where contractually allowed; cap retries with bounded exponential backoff; never re-enrich on a cache hit. (b) **CRM** — start with HubSpot only (fully exercised), ship Salesforce as a contract-conformant adapter behind the shared CRM interface, make every sync idempotent via stored `externalObjectIdsJson` with email-then-domain dedupe, and exclude protected fields unless explicitly enabled; route token-expiry/sync failures to an operations alert for Devin. (c) **LLM** — keep all field validation deterministic and outside the model, version every prompt/Question Policy, hard-timeout LLM calls with the Fallback Form, and degrade to first-party data on failure. (d) **Enrichment quality** — attach source + confidence to every field, route low-confidence fields to `needs_review` instead of guessing, flag unverified fields in the rep card, and never let coverage gaps block CRM sync. (e) **Isolation** — enforce row-level `tenantId` scoping at the repository layer with unit tests asserting cross-tenant reads fail. (f) **Scope/capacity** — execute the capacity-driven scope cut as the primary timeline lever: defer the analytics dashboard charts to a read-only funnel view + CSV export, ship the admin SPA with a minimal editor set leaning on manual CSM onboarding, and keep Salesforce contract-only — preserving every kernel in-scope capability while removing presentation polish from the critical path. Sequence phases with deliberate overlap, secure all external credentials (Anthropic, Clearbit, the secondary enrichment provider, HubSpot) in the first days as a tracked unblock, and keep beta at exactly 5 managed clients with manual onboarding (no self-serve). (g) **Baseline scarcity → restated, two-stage success bar** — because closed-won deals frequently will not accumulate inside the 2–4 week window, the north-star is proved in two explicitly defined stages so the ≥ 20% target stays falsifiable rather than aspirational. **In-beta (window-bounded) bar:** capture each client's pre-DealThreads static-form cycle-time baseline at onboarding and validate the *leading* indicators the kernel already tracks — Speed-to-Profile (≤ 2 min p95), Conversation Completion Rate (≥ 75%), Required Field Capture Rate (≥ 85%), CRM Sync Success Rate (≥ 98%), Qualified Meeting Conversion Rate (≥ 15% over baseline), and ≥ 3 validated predictive questions — as the in-window pass condition, with the cycle-time clock (widget-complete → closed-won) running and instrumented for every lead. **Post-beta (cohort-bounded) bar:** the ≥ 20% median cycle-time reduction versus baseline is then confirmed on the first cohort of closed-won deals as they mature, which may extend past the beta window; this is the gate that the north-star claim must clear before it is asserted. This ties the mitigation to a concrete restated bar (leading-indicator pass in-beta, cycle-time confirmation on the first closed-won cohort) instead of merely "reporting leading indicators," and keeps the kernel's 20% target intact while making explicit when it is measured.

### 10. SUCCESS METRICS & MONITORING

The entire measurement strategy is anchored to a single hierarchy: the **north-star metric is Cycle Time: Widget-Complete to Closed-Won** — the median elapsed time from `ConversationSession.completedAt` (the moment the `Lead` profile is created) to the associated CRM deal reaching `closed-won`, compared against each `Tenant`'s pre-DealThreads static-form baseline. Every other metric in this section exists either to *cause* a cycle-time reduction or to *explain* its absence.

**DECISION RULE (authoritative, drives the entire monitoring design):** If the enrichment layer is demonstrably adding context (i.e., `Enrichment Match Rate` >= 70%, profiles are scored, and `CRM Sync Success Rate` >= 98%) but the north-star **Cycle Time does not improve by at least 20%** versus baseline, the conclusion is that the **Conversation Flow needs rework — not the enrichment stack.** The dashboards below are deliberately built so this diagnosis can be made unambiguously: enrichment health and conversation-flow health are reported on separate panels so that a flat cycle-time curve can be attributed to the right layer. When the rule fires, the action is to iterate the versioned `Question Policy` (bound to `WidgetConfig.conversationJson`) and the per-question attribution analysis described under Feature Adoption Metrics, then publish a new flow version via `POST /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config/publish` and measure the next cohort.

---

**Feature Adoption Metrics**:

These measure whether visitors (`Priya Nair`) actually use the `Conversational Buyer-Profile Widget` and whether the `Conversation Flow` is instrumented and iterable per the decision rule. All are derived from the `AnalyticsEvent` stream (see Monitoring Setup) and exposed via `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel`.

| Metric (kernel name) | Definition | Target | Source events |
|---|---|---|---|
| **Conversation Completion Rate** | % of visitors who start the qualification conversation and reach a completed (qualified or disqualified) end state instead of abandoning. | **>= 75%** of started conversations | `conversation.started` → `conversation.completed` |
| **Required Field Capture Rate** | % of completed conversations for which all required fields (consent, work email, business need, timeline/urgency) were captured. | **>= 85%** of completed conversations | `conversation.completed` with `propertiesJson.requiredFieldsComplete = true` |
| **Deal-Quality Predictive Questions Identified** | Count of conversation questions whose captured answers are statistically associated with downstream deal quality (closed-won or stage progression), proving the flow is instrumented and iterable. | **>= 3** validated predictive questions during beta | `question.asked` + `field.extracted` joined to `deal.stage_changed` / `deal.closed_won` |
| Widget Open Rate (supporting) | % of widget loads (`widget.loaded`) where the visitor opens the launcher (`widget.opened`). | >= 8% of loads on eligible pages (tracked, refined per tenant) | `widget.loaded` → `widget.opened` |
| Funnel drop-off by step (diagnostic) | Per-question abandonment, i.e., the share of sessions that abandon immediately after each `question.asked`. | No single required question with > 25% step abandonment | `question.asked` → `conversation.abandoned` |

**Conversation-flow / per-question deal-quality attribution (the core of the decision rule).** Each question presented by the AI carries a stable `questionId` (defined in the versioned `Question Policy`) and is logged as a `question.asked` event with the `WidgetConfig.version` and `questionPolicyId` attached. The extracted answer is logged as a `field.extracted` event referencing the same `questionId`, the `Lead.id`, and the `extractedFieldsJson` slice. Because every `Lead` is later joined to its CRM deal outcome (`deal.stage_changed`, `deal.closed_won`, `deal.closed_lost`), the analytics pipeline can compute, per `questionId` and per flow version:

- **Predictive lift** — correlation/odds-ratio between a given answer (e.g., timeline = "this quarter", or budget band) and `closed-won` or forward stage progression, controlling for `ICP Fit Score`.
- **Cost of the question** — the marginal abandonment that question introduces (its contribution to drop in `Conversation Completion Rate`) versus the predictive signal it yields, so low-signal/high-friction questions can be pruned.
- **Median cycle-time delta** by answer value, so we can see which captured `Intent Signal` values precede the fastest closes.

This is the instrumentation that lets us satisfy the kernel success criterion of identifying >= 3 statistically predictive questions, and it is the lever pulled when the DECISION RULE fires. The analysis is re-run each time a new `Question Policy` version is published so flow iterations are measured cohort-over-cohort, not conflated.

---

**Technical Metrics**:

These measure that the enriched, scored profile reaches the rep (`Marcus Reed`) fast and reliably enough that the north-star cycle-time bet is even testable, and they isolate enrichment/routing health so the decision rule can attribute a flat cycle-time curve correctly. All thresholds are evaluated over a rolling 24-hour and 7-day window per `Tenant`.

| Metric (kernel name) | Definition | Target | Instrumentation |
|---|---|---|---|
| **Speed-to-Profile (Time-to-Rep)** | P95 elapsed time from `conversation.completed` to the enriched, scored profile being delivered to the assigned rep (synced + routed + notified). This is `Speed-to-Lead`. | **<= 2 minutes p95** | Timestamp delta between `conversation.completed` and `notification.sent`, spanning `enrichment.completed` → `score.computed` → `crm.sync.succeeded` → `routing.assigned` |
| **CRM Sync Success Rate** | % of completed `Lead` profiles synced to the connected CRM (HubSpot first, Salesforce second adapter) with no manual intervention. | **>= 98%** automatic sync success | `crm.sync.succeeded` / (`crm.sync.succeeded` + `crm.sync.failed`), keyed by `CrmSyncRecord` |
| **Enrichment Match Rate** | % of completed leads with a work email or company domain for which the enrichment layer returns a confident firmographic/technographic match above the configured threshold. | **>= 70%** on enrichable leads | `EnrichmentProfile.status in (completed, partial)` with `confidence >= threshold`, over enrichable `Lead` count |
| **Cost per Qualified Lead (LLM + Enrichment)** | Blended Claude (`claude-sonnet`) conversation cost + Clearbit/the secondary enrichment provider enrichment cost ÷ number of completed qualified leads, tracked per `Tenant`. | **<= $3.50** per qualified lead (tracked ceiling, refined during beta) | Per-job cost on `ConversationMessage.modelMetadataJson` + `EnrichmentProfile` cost field, aggregated nightly |
| Enrichment Coverage (diagnostic) | Proportion of a profile's firmographic/technographic fields filled above the confidence threshold; low coverage routes a field to manual review (`needs_review`), never blocks first-party CRM sync. | Median coverage >= 60% on enrichable leads | Filled-field ratio in `EnrichmentProfile.resultJson` |
| Routing latency (diagnostic) | P95 time from `score.computed` to `routing.assigned` via `POST /api/v1/routing/evaluate`. | <= 5 seconds p95 | `score.computed` → `routing.assigned` delta |
| LLM extraction validity (diagnostic) | % of `conversation.messages` turns where deterministic validators (email/phone/enum/required outside the LLM) accept the structured extraction without fallback. | >= 95% | Validator pass flag on `field.extracted` |
| Widget performance (diagnostic) | Shadow-DOM bundle gzipped size and p75 time-to-interactive on the host page. | Bundle <= 150 KB gzipped; TTI <= 1.5s p75 | CDN asset size + `widget.loaded` client timing |

**Enrichment accuracy & confidence.** Beyond raw match rate, every enriched field carries `source` and `confidence` in `EnrichmentProfile.resultJson`. We track the share of enriched fields landing in `needs_review` and spot-audit a weekly sample of high-confidence Clearbit/the secondary enrichment provider fields against ground truth to catch silent drift in provider quality — protecting `Marcus Reed` from the "embarrassing, mistargeted outreach" pain point. Crucially for the decision rule: when `Enrichment Match Rate >= 70%` and accuracy holds but cycle time is flat, enrichment is exonerated and the conversation flow is the target.

---

**Business Impact Metrics**:

These are the outcomes the economic buyer (`Maya Chen`) and the GTM thesis are judged on. The north-star sits at the top.

| Metric (kernel name) | Definition | Target |
|---|---|---|
| **Cycle Time: Widget-Complete to Closed-Won (NORTH STAR)** | Median time from `conversation.completed` (Lead created) to CRM deal `closed-won`, vs. each client's pre-DealThreads static-form baseline. The product is optimized to prove reps working AI-built profiles close faster than reps working raw form submissions. | **>= 20% reduction** in median cycle time vs. baseline within beta |
| **Qualified Meeting Conversion Rate** | % of completed qualified leads that convert into a booked, qualified sales meeting, vs. the client's static-form baseline. | **>= 15% improvement** over client baseline |
| **Pilot-to-Paid Conversion** | % of $500 pilot clients that convert to a paid $2,500/mo core (or $5,000/mo premium) subscription. | **~25%** pilot-to-paid |
| **Logo Churn Rate** | Annualized % of paying clients that cancel their DealThreads subscription. | **< 10%** annualized churn |
| **Customer Acquisition Cost (CAC)** | Fully loaded sales + marketing spend to acquire one paying client, validating the lean distribution thesis. | **~$250** CAC |

**How the north-star is computed and baselined.** Each beta `Tenant` provides (or we reconstruct from CRM history) a *pre-DealThreads baseline*: the median form-submit-to-closed-won time across a trailing window of static-form leads. DealThreads leads are tagged at source (the `Lead` originates from a `ConversationSession`), so the cycle-time clock starts deterministically at `conversation.completed` and stops at the matched `deal.closed_won` event observed via the CRM. Because B2B sales cycles can exceed the 2–4 week beta window, we report two signals: (1) the realized closed-won cycle time for deals that close inside the window, and (2) **leading proxies** — `Qualified Meeting Conversion Rate`, time-to-first-meeting, and stage-progression velocity — which move earlier and let us read the trend before full deals close. A sustained improvement in the leading proxies with no movement in `Cycle Time` still triggers a flow review under the decision rule once enrichment health is confirmed green.

---

**Monitoring Setup**:

**Analytics tracking.** A single append-only `AnalyticsEvent` pipeline spans the entire funnel from widget load through CRM sync to closed-won, scoped by `tenantId`/`widgetId`/`sessionId`/`leadProfileId` with a typed `eventType` and free-form `propertiesJson`. The canonical event taxonomy (all carrying the active `WidgetConfig.version` and `questionPolicyId` where relevant):

- **Funnel:** `widget.loaded`, `widget.opened`, `conversation.started`, `question.asked`, `field.extracted`, `consent.accepted`, `conversation.completed`, `conversation.abandoned`, `lead.disqualified`.
- **Enrichment & scoring:** `enrichment.queued`, `enrichment.completed`, `enrichment.partial`, `enrichment.unavailable`, `score.computed`.
- **Routing & sync:** `routing.assigned`, `routing.fallback_queued`, `crm.sync.succeeded`, `crm.sync.failed`, `notification.sent`.
- **Outcome (from CRM):** `deal.stage_changed`, `deal.closed_won`, `deal.closed_lost`.

Events are emitted server-side from the NestJS API and BullMQ workers (not trusted from the client) and surfaced through `GET /api/v1/admin/tenants/{tenantId}/analytics/funnel`. Three dashboards are stood up per tenant in the operator console (React 18 SPA), deliberately separated so the **DECISION RULE** can be evaluated at a glance:

1. **North-Star & Funnel** — cycle-time vs. baseline, full conversion funnel (`widget.loaded` → `closed_won`), `Conversation Completion Rate`, `Required Field Capture Rate`, and the per-question predictive-lift / drop-off table. This is where the conversation flow is judged.
2. **Pipeline Health (enrichment/routing/sync)** — `Enrichment Match Rate`, Enrichment Coverage, `Speed-to-Profile` p95, routing latency, `CRM Sync Success Rate`. This is where the enrichment stack is judged. *If panel 2 is green and panel 1's cycle-time is flat → rework the flow, not enrichment.*
3. **Unit Economics & GTM** — `Cost per Qualified Lead`, `Pilot-to-Paid Conversion`, `Logo Churn`, `CAC`.

**Error logging/alerting.** Structured JSON logs with `tenantId` and correlation IDs flow to the platform logging stack on Render; BullMQ jobs (enrichment, scoring, CRM sync) use bounded retries with exponential backoff and a dead-letter queue. `Devin Brooks` (routing/hygiene owner) and the CSM receive operations alerts. Alert thresholds:

- **CRM sync** — page if `CRM Sync Success Rate` < 98% over a rolling 1-hour window, or any single `CrmSyncRecord` exhausts retries (`status = failed`); immediate alert on CRM OAuth/private-app token expiry or 401 (directly addresses Devin's "token expired / sync failed" pain point).
- **Speed-to-Profile** — alert if p95 `conversation.completed` → `notification.sent` exceeds the 2-minute SLO over a rolling 30-minute window.
- **Enrichment provider** — alert on Clearbit error rate or `enrichment.unavailable` rate > 20% over 1 hour (provider outage), so leads fall back to first-party data + `unavailable` status without blocking sync.
- **LLM / conversation** — alert on `claude-sonnet` error/timeout rate > 5% or sustained latency regression; the widget auto-degrades to the **Fallback Form** so a visitor can always reach the company, and `widget.fallback_shown` is logged.
- **Routing leakage** — alert if any qualified `Lead` is unassigned (no `routing.assigned` and no `routing.fallback_queued`) within 60 seconds of `score.computed`.
- **Cost ceiling** — daily alert to the CSM if `Cost per Qualified Lead` for any tenant trends above the $3.50 ceiling, protecting the known API-cost risk.

**Performance monitoring.** Track API latency (p50/p95/p99) per endpoint — with `POST /api/v1/conversations/{conversationId}/messages` watched most closely because conversational latency directly affects `Conversation Completion Rate` — plus BullMQ queue depth and processing time for enrichment/scoring/sync, PostgreSQL 16 query latency and connection saturation, Redis health, and Cloudflare CDN metrics for the widget bundle (gzipped size <= 150 KB, edge TTL, error rate). Synthetic checks exercise the full path (load config via `GET /api/v1/widgets/{widgetId}/config` → create session → message turns → complete → enrich → score → sync) against a sandbox tenant on a schedule to catch regressions before real visitors do.

**User feedback collection.** Three feedback loops, one per persona:

- **Reps (`Marcus Reed`):** a lightweight thumbs-up/down + "profile was useful / what was wrong" control on the DealThreads profile card inside HubSpot/Salesforce, logged as `profile.feedback` against the `Lead`. Low-confidence enrichment fields are flagged for verification, and rep corrections feed enrichment-accuracy auditing.
- **Economic buyer / coordinator (`Maya Chen`, `Devin Brooks`):** structured weekly beta review with the CSM walking the three dashboards (especially the north-star vs. baseline and the per-question predictive table), capturing requested `Question Policy` / `RoutingRule` / field-mapping changes that are then drafted via `PUT /api/v1/admin/tenants/{tenantId}/widgets/{widgetId}/config` and published.
- **Visitors (`Priya Nair`):** an optional one-tap satisfaction prompt on the confirmation screen after `conversation.completed`, plus monitoring of abandonment points and off-topic/early-abandon handling, logged via `widget.feedback` and the funnel drop-off analysis — feeding directly back into conversation-flow iteration under the decision rule.

---

## Appendix A — Specification Quality Review
_This specification was produced by a multi-agent authoring pipeline (1 architect → 6 section authors → 1 adversarial QA reviewer → targeted revision) and assembled programmatically._

_**v1.1 note:** The "Overall assessment," finding counts, strengths, and consistency-issue list below are recorded **as-found by the QA reviewer (pre-revision)** and are preserved as an audit trail. Most items were fixed in the revision pass; the current resolution status of every issue is documented in **"Post-QA Consistency Cleanup (v1.1)"** at the end of this appendix._

**Overall assessment:** This is a strong, unusually disciplined draft: it faithfully carries kernel entity/endpoint/metric names, threads the north-star decision rule consistently through all ten sections, and the worked funnel-JSON math (880/1100=0.80 completion; 605/610≈0.992 sync; (52-38)/52≈0.27 cycle-time reduction) is internally coherent. The transparent-scoring, idempotent-CRM-sync, and consent-gating treatments are detailed and largely contradiction-free. However, there are several real problems an implementer or QA lead would hit. The single most serious is testability: the headline success criterion (>=20% reduction in median Widget-Complete-to-Closed-Won cycle time) cannot be validated inside the stated 2-4 week beta for $25K-$80K mid-market deals whose sales cycles routinely exceed the window — the draft acknowledges this in Sections 9 and 10 but never reframes the actual success bar, leaving the primary acceptance criterion effectively unmeasurable at release. There is one hard internal contradiction (abandonment creates 'no Lead' in Section 2 but a partial needs_review Lead in Section 4.1), two structural data-model gaps inherited and amplified from the kernel (widgetId is used across the API, ConversationSession, AnalyticsEvent and the DB schema yet no Widget entity exists and WidgetConfig carries no widgetId field; the central, versioned Question Policy is referenced by questionPolicyId but has no backing table among the asserted 'ten tables'), and a cluster of medium privacy gaps (contact PII stored in plaintext JSONB while message bodies are encrypted; pre-consent processing of visitor identifier/IP/UTM; unspecified GDPR-erasure scope across analytics_events and conversation_messages). A few smaller contradictions (message length 2000 vs 4000 chars; segment-label vocabulary; the fallbackFormEnabled toggle vs the mandatory-fallback rule) are quick fixes. None are fatal, but the testability and data-model items should be resolved before build.

**QA finding counts:** 2 high · 4 medium · 4 low · 8 consistency issue(s)

**Strengths noted by review:**
- Naming discipline is excellent: kernel entities (Lead, EnrichmentProfile, ConsentRecord, CrmSyncRecord, RoutingRule, AnalyticsEvent), endpoints, and metric names are carried verbatim across sections 1-10 with almost no drift, and {leadProfileId} path params vs Lead.id are handled correctly.
- The north-star decision rule (if cycle time doesn't move, rework the Conversation Flow not the enrichment stack) is threaded coherently through the problem statement, success criteria, Story 7, the metrics hierarchy, and the deliberately separated dashboards (panel 1 conversation-flow health vs panel 2 enrichment/pipeline health) so the diagnosis can actually be made.
- The worked JSON example in the funnel endpoint is numerically self-consistent: 880/1100 = 0.80 completion rate, 605/610 ≈ 0.992 sync success, medianCycleTimeHours 38 vs baseline 52 ≈ 0.27 reduction, and speedToProfile 96s < 120s budget all reconcile.
- Speed-to-Profile is decomposed into a coherent latency budget that sums under the ceiling (enrichment <=60s p95 + CRM sync <=30s p95 + routing <=5s p95 = 95s < 120s), with explicit p95 framing throughout.
- The 'unknown fields are never positive evidence' invariant is specified rigorously and made testable (a sparse profile can never out-score the same profile with additional confirmed positives), with determinism asserted for identical inputs.
- Idempotent CRM sync is specified consistently end to end: keyed on tenantId + leadProfileId + stored externalObjectIds, dedupe by email then domain+company, protected-field preservation, with a matching unit + integrity test (replay sync, assert exactly one contact/company/deal).
- Edge cases are broad and mostly well-reasoned (enrichment miss, bot/spam, consent declined, after-hours, duplicate contact, prompt injection), and the resilience UAT (Scenario 2) directly exercises the first-party-only degradation path.
- Non-functional specifics are concrete and checkable rather than generic: WCAG 2.1 AA with 4.5:1 contrast and 44x44 targets, <150 KB gzipped widget with a CI gate, 320px responsive floor, sessionStorage (not localStorage) rationale, server-side-only analytics emission.

**Cross-section consistency checks:**
- Direct contradiction on whether mid-conversation abandonment creates a Lead. Section 2 ('Visitor abandons mid-conversation') states 'no Lead is created and no CRM sync fires.' Section 4.1 ('Early abandonment') states that if consent + work email were already captured, 'a partial Lead (status = needs_review) is created so a rep can still follow up.' These are mutually exclusive for the consent+email-captured abandonment case. Pick one rule and reconcile it across Sections 2, 3 (Story 1/6), and 4.1. _(sections 2, 3, 4)_
- widgetId has no home in the data model. The kernel WidgetConfig entity lists no widgetId field (id, tenantId, version, status, themeJson, conversationJson, consentJson, allowedPagesJson, questionPolicyId, publishedAt), and there is no Widget entity, yet widgetId is a path param on GET /widgets/{widgetId}/config, a column on ConversationSession and AnalyticsEvent, and the Section 6 DB schema asserts a UNIQUE (tenant_id, widget_id, version) and a 'one published per (tenant_id, widget_id)' constraint plus indexes on widget_id. The schema references a widget_id column that the entity definitions never declare. Either add a Widget entity/table (or a widgetId column on widget_configs) and document the relationship, or state explicitly that widgetId == widget_configs.id. _(sections 2, 4, 6)_
- The Question Policy is described as a central, versioned, weekly-iterated object that is the primary lever of the decision rule and the basis of per-question deal-quality attribution (glossary; Sections 4, 7, 10), but it is never modeled as a data entity. Section 6 asserts 'Migration 0001 creates all ten tables' and lists a question_policy_id column on widget_configs with no question_policies table behind it. There is nowhere to persist the versioned questions, priorities, required fields, or forbidden topics. Add a QuestionPolicy table (id, tenant_id, version, status, questions_json, forbidden_topics_json) and reconcile the 'ten tables' count, or specify that the policy is embedded in widget_configs.conversation_json and remove the dangling questionPolicyId FK semantics. _(sections 4, 6)_
- Maximum visitor message length is contradictory: Section 4.1 Input caps 'visitor message text (max 2,000 chars)' while Section 6 endpoint 3 validation states 'message length 1-4,000 chars.' Set a single value and use it in both places (and in the unit-test fixtures referenced in Section 8). _(sections 4, 6)_
- Whether disqualified leads are routed and synced is underspecified and mildly contradictory. Section 4.3 ('Disqualified lead') says it is 'scored and labeled Low-Fit/Disqualified; still assembled and synced.' But the routing guarantee in Story 4 AC2 and Section 4.4 is scoped only to 'qualified' leads ('100% of qualified leads resolve'), and Section 6 endpoint 4 creates disqualified/incomplete leads without stating they route. Clarify explicitly whether disqualified leads enter routing (to a nurture/fallback queue) and CRM sync, and align the 'qualified' wording in Story 4/4.4 with the 'still synced' wording in 4.3. _(sections 2, 3, 4, 6)_
- Segment-label vocabulary is inconsistent. Section 4.3 lists segments as 'Hot/High-Fit', 'Nurture', 'Low-Fit'; Business Rule 1 lists 'Hot/High-Fit (>=75)', 'Warm/Nurture (50-74)', 'Low-Fit (<50)'; the JSON examples in endpoints 6 and 7 use the literal value 'high-fit'. Define one canonical enum for the segment field and use it verbatim everywhere (prose, Business Rule 1, and JSON). _(sections 4, 6)_
- Mandatory fallback vs configurable toggle. Business Rule 8 and Story 6 state the widget MUST render the Fallback Form so a visitor can always reach the company, but endpoint 1's config payload exposes 'fallbackFormEnabled': true, implying a tenant can set it false and break the MUST guarantee. Either make the fallback non-disableable (drop the toggle) or downgrade Rule 8 from MUST to 'when fallbackFormEnabled is true', and reconcile the glossary Fallback Form definition. _(sections 3, 4, 6)_
- Loose 'synchronous' wording for an asynchronous trigger. Section 4.1 Output says completion 'synchronously triggers enrichment (§4.2)', while Section 6 endpoint 4 and the kernel describe the completion handler enqueuing an async BullMQ EnrichmentJob (202 queued). Reword 4.1 to 'the completion handler synchronously enqueues the async enrichment job' to avoid implying enrichment runs inline (which would violate the non-blocking-confirmation requirement). _(sections 4, 6)_

**Sections revised after QA:**
- Feature Overview + Personas & Use Cases (sections 1, 2)
- Detailed User Stories (sections 3)
- Functional + Non-Functional Requirements (sections 4, 5)
- Technical + UI Specifications (sections 6, 7)
- Testing + Implementation Plan (sections 8, 9)

---

## Post-QA Consistency Cleanup (v1.1)

After the automated QA pass, a holistic consistency cleanup was run across the full assembled document. The QA reviewer and the per-section revisers each saw only part of the document, so a few cross-section conflicts survived the revision — and in two cases were *split further*, with two sections "fixing" the same issue to opposite values while each claimed agreement with the other. Status of every flagged issue:

| # | Issue (as found by QA) | Status in v1.1 | Resolution |
|---|---|---|---|
| 1 | Abandonment: does a mid-conversation abandon create a Lead? (§2 vs §4.1) | **Resolved — canonical decision** | Canonicalized on the rule the routing/CRM-sync/metrics sections already assume: **a Lead requires an explicit completion; an abandoned session never creates one.** Captured first-party data (incl. consent + work email if present) is retained on the `ConversationSession` for operator review. §2 and Story 1 — which had been revised to the opposite "partial `needs_review` Lead" rule — were realigned to §4.1. See the decision note below. |
| 2 | `widgetId` had no home in the data model (§2/§4/§6) | Resolved in revision | A `widgets` parent table and a `widget_id` FK on `widget_configs` were added (§6); `widgetId` is defined as the stable logical-widget id. |
| 3 | `Question Policy` referenced but never modeled (§4/§6) | Resolved in revision | A versioned `question_policies` table was added (§6), referenced by `widget_configs.question_policy_id`. |
| 3b | "ten tables" count vs. the actual schema (§6) | Resolved in revision | Reconciled to **twelve tables** (ten kernel entities + `widgets` + `question_policies`) in §6 and Migration 0001. |
| 4 | Max visitor message length: 2,000 vs 4,000 chars (§4 vs §6) | **Resolved in cleanup** | The two sections had been independently "fixed" to *different* values, each claiming to match the other. Canonicalized on **1–2,000 characters** (the binding §6 API-validation contract); §4 corrected from 4,000 → 2,000. |
| 5 | Are disqualified leads routed and synced? (§2/§3/§4/§6) | Resolved in revision | Specified consistently: every **completed** lead routes (qualified → named rep; disqualified/`low_fit` → nurture/fallback queue) and syncs to CRM (disqualified for pipeline data only). |
| 6 | Segment-label vocabulary inconsistent (§4 prose vs §6 JSON) | Resolved in revision | One canonical enum — machine values `high_fit \| nurture \| low_fit`, display labels "Hot/High-Fit (≥75) · Warm/Nurture (50–74) · Low-Fit (<50)" — used verbatim in prose, business rules, schema, and JSON. |
| 7 | Mandatory fallback vs. a `fallbackFormEnabled` toggle (§3/§4/§6) | Resolved in revision | The Fallback Form is **non-disableable**; the config toggle was removed and Rule 8 states "always on, non-disableable." |
| 8 | "Synchronous" wording for an async enrichment trigger (§4 vs §6) | Resolved in revision | Reworded to "the completion handler **synchronously enqueues the asynchronous enrichment job**" (returns `202`; runs on BullMQ). |

**Decision note (Issue 1 — abandonment).** v1.1 adopts **"explicit completion required"** because the routing guarantee ("every completed lead resolves…"), the CRM-sync path, and the §10 funnel ("abandoned sessions produce no Lead") are all written around it, and it keeps the `Lead` ⇔ completion invariant clean. The trade-off: a visitor who accepted consent and gave a work email but bailed before finishing is **not** auto-created as a CRM lead — their captured data waits on the `ConversationSession` for operator review. If you would rather auto-capture those as partial `needs_review` Leads (more aggressive pipeline capture, at the cost of thinner CRM records and a softer "completed lead" guarantee), say so and I will flip §2, Story 1 (§3), and §4.1 to that rule instead.

---

## Appendix B — Glossary
| Term | Definition |
|---|---|
| Conversational Buyer-Profile Widget | DealThreads's MVP core: a single-<script>-tag embeddable AI chat widget that replaces a static contact form, converses with a website visitor to capture intent/budget/timeline, enriches the lead behind the scenes, scores ICP fit, routes to the right rep, and syncs an enriched buyer profile to the client's CRM. |
| Conversation Flow | The versioned, instrumented sequence of adaptive qualification questions and guardrails the AI uses to capture buyer intent. It is the primary lever under the decision rule: if enriched profiles do not shorten cycle time, the conversation flow is reworked first. Every question is tracked for its predictiveness of deal quality. |
| Question Policy | A versioned configuration object that defines which qualification questions the AI may ask, in what priority, the required fields, and the topics it must avoid (e.g. sensitive data). Bound to a WidgetConfig and iterated weekly during beta. |
| Intent Signal | A first-party, visitor-stated indicator of buying motivation extracted from the conversation, such as the stated business need, pain point, urgency, or use case. Kept distinct in storage and display from third-party enriched facts. |
| Enrichment Coverage | The proportion of a buyer profile's firmographic and technographic fields successfully filled by the enrichment layer (Clearbit, then the secondary enrichment provider) above the confidence threshold. Low coverage routes a field to manual review rather than guessing; coverage gaps never block CRM sync of first-party data. |
| ICP Fit Score | A transparent, weighted 0-100 score of how well a buyer profile matches the client's Ideal Customer Profile, combining firmographic fit, urgency, pain, budget, authority, and tech fit. Every score carries a rationale citing the fields used, and unknown fields are never counted as positive evidence. |
| Buyer Profile (Lead) | The assembled, structured output of a completed conversation: normalized contact, company, and qualification fields plus AI summary, ICP score, enrichment highlights, and recommended next action. The artifact a rep opens at first contact. |
| Speed-to-Lead | The elapsed time between a lead completing the conversation and a rep being able to act on it (synced, scored, and routed). DealThreads's target is delivery within 2 minutes, versus the 10-20 minutes of manual research a static form requires. |
| Cycle Time | The north-star measure: median time from widget-complete (conversation done) to closed-won deal in the CRM. The product is optimized to prove reps working AI-built profiles close faster than reps working raw form submissions. |
| Idempotent CRM Sync | A sync operation keyed on tenant ID plus lead profile ID and the stored external CRM object IDs, so retries never create duplicate contacts, companies, or deals and protected CRM fields are not overwritten without explicit configuration. |
| Routing Rule | A tenant-defined, priority-ordered condition-to-assignment mapping (by ICP score, territory, company size, industry, or product interest) that sends a qualified lead to a named owner or a fallback queue, guaranteeing no qualified lead goes unassigned. |
| Fallback Form | A static contact form the widget displays when the AI conversation service is unavailable, ensuring a visitor can always reach the company and that captured data is preserved even when chat completion or enrichment fails. |
| Tenant | A single DealThreads beta client and the root of multi-tenant data isolation; all widgets, configs, leads, enrichment, routing rules, CRM credentials, and analytics are scoped to a tenant. Beta tenants are onboarded manually. |