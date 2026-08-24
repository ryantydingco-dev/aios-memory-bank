# Deal Threads Beta Implementation Pack

Last updated: 2026-06-01  
Status: Ready for MVP planning and beta execution  
Primary goal: Turn the Deal Threads feature specification into buildable and installable beta assets.

## What This Pack Contains

This pack is the practical bridge between strategy and implementation. It tells the team what to build next, how the AI conversation should behave, what data the lead profile should contain, how HubSpot should receive that data, and how to onboard the first five beta clients.

## Core Artifacts

1. `Product/Deal Threads AI Lead Profile Chat Widget - Feature Specification.md`
   - Full product and technical feature specification.
   - Use this as the master spec.

2. `Product/Deal Threads Conversation Flow v1.md`
   - Visitor-facing conversation sequence.
   - Branching logic.
   - Required fields.
   - AI extraction schema.
   - Fallback and consent behavior.

3. `Product/Deal Threads Lead Profile Schema and HubSpot Field Map.md`
   - Canonical lead profile JSON.
   - Field requirements by lifecycle stage.
   - HubSpot contact, company, deal, and note mapping.
   - Dedupe and overwrite rules.

4. `Product/Deal Threads MVP Prototype Spec.md`
   - Technical build scope.
   - Component responsibilities.
   - API surface.
   - Milestones and acceptance criteria.
   - Prototype test cases.

5. `Operations/Deal Threads Beta Client Onboarding SOP.md`
   - Beta client onboarding process.
   - Access checklist.
   - CRM setup workflow.
   - QA plan.
   - Weekly reporting template.

## Recommended Next Build Order

### Step 1: Build Local Widget Demo

Use:

- Conversation Flow v1.
- MVP Prototype Spec.

Output:

- Local page with widget.
- Mock conversation.
- Structured lead JSON.
- Fallback form.

Definition of done:

- A visitor can complete the high-priority demo request path.
- The prototype generates the canonical lead profile shape.

### Step 2: Build Lead Profile Backend

Use:

- Lead Profile Schema and HubSpot Field Map.
- MVP Prototype Spec.

Output:

- Conversation persistence.
- Lead profile creation.
- Consent record.
- Rep summary.

Definition of done:

- Completion endpoint creates a valid profile.
- Profile can be inspected by ID.

### Step 3: Add Mock Enrichment And Scoring

Use:

- Lead Profile Schema.
- MVP Prototype Spec.

Output:

- Mock enriched company data.
- ICP score.
- Score rationale.
- Priority label.

Definition of done:

- High, medium, low, and support scenarios score differently.
- Unknown fields do not create false positives.

### Step 4: Add HubSpot Sandbox Sync

Use:

- HubSpot Field Map.
- Beta Client Onboarding SOP.

Output:

- Contact creation.
- Contact update.
- Company creation/association.
- Deal Threads activity note.

Definition of done:

- Same Deal Threads lead can be retried without duplicate CRM records.
- Protected fields are not overwritten.

### Step 5: Install First Beta Client

Use:

- Beta Client Onboarding SOP.
- All product specs.

Output:

- Live script on approved pages.
- First live lead synced.
- Weekly reporting cadence.

Definition of done:

- Client sales team confirms the CRM profile is usable for follow-up.

## MVP Non-Negotiables

- Business need is asked before email.
- Consent is captured before personal data processing.
- CRM sync is idempotent.
- Enrichment is async and non-blocking.
- Deal Threads fields are clearly separated from customer-owned CRM fields.
- The rep summary is concise and actionable.
- Low-confidence enrichment is labeled or held for review.
- Fallback form exists.
- Costs are tracked by tenant.

## Suggested First Engineering Tickets

1. Create widget loader and chat shell.
2. Implement widget config endpoint.
3. Implement session creation endpoint.
4. Implement conversation message endpoint with mock AI.
5. Implement structured extraction schema validation.
6. Implement completion endpoint and lead profile persistence.
7. Implement fallback form submission.
8. Implement mock enrichment job.
9. Implement ICP scoring v1.
10. Implement HubSpot field mapping and sandbox sync.
11. Implement activity note creation.
12. Implement routing rule evaluator.
13. Implement high-priority notification.
14. Add analytics events.
15. Add beta operator configuration.

## First Demo Script

Use this demo path to show the product internally or to a beta client.

1. Open a staging pricing page with the Deal Threads widget installed.
2. Click `Want help figuring out if this fits?`
3. Enter: `We are a 150-person SaaS company using HubSpot. Demo requests are going cold because reps research them manually. We want to fix this this quarter and likely have $30K-$50K annually.`
4. Provide name and work email.
5. Confirm the summary.
6. Show the generated lead profile JSON.
7. Show the HubSpot contact/company and Deal Threads activity note.
8. Show the sales notification.
9. Explain what enrichment was visitor-provided versus provider-enriched.

## Open Decisions

- Which enrichment provider is first for beta?
- Should the first beta create deals automatically or only contacts/companies/notes?
- Should Slack be required for high-priority alerts or should email be default?
- What is the exact consent language approved for first beta?
- What is the initial pricing promise for beta clients after trial?

## Recommended Immediate Decision

Start with:

- HubSpot only.
- Contacts, companies, and notes by default.
- Deals optional per beta client.
- Email notification default, Slack optional.
- Mock enrichment in local development, real enrichment in staging and beta.

