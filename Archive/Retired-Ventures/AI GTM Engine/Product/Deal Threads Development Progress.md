# Deal Threads Development Progress

Last updated: 2026-06-01

## Current Development Status

Development has started in:

`deal-threads-dev/`

This is a local full-stack prototype that advances the existing Railway demo from a static contact form into the planned Deal Threads script-tag AI intake widget.

## What Exists Now

- Demo customer page at `http://localhost:4173/`.
- Script-tag widget loaded from `/widget.js`.
- Widget configuration endpoint.
- Conversation session endpoint.
- Message endpoint with mock extraction.
- Consent capture.
- Guided qualification flow.
- Optional OpenAI structured extraction when `OPENAI_API_KEY` is set.
- Protected OpenAI extraction readiness API and admin probe that test heuristic/live extraction without creating leads or mutating state.
- Mock enrichment.
- Self-built website/domain enrichment using public site metadata and tech detection.
- Same-domain internal enrichment for pricing, proof, integrations, security, careers, and about-page signals.
- Persistent company enrichment memory that reuses corrected company profiles, confirmed tech stack, fit signals, and outcome history.
- Company memory correction panel on each CRM lead detail page.
- Enrichment review workflow for low-confidence/high-value profiles, including pending, in-review, research-needed, reviewed, and dismissed states.
- Target-account CSV import on `/enrichment` to seed reusable company memory before outreach.
- Company memory filters and filtered CSV export for imported, corrected, cache-hit, low-confidence, reusable, and no-lead account segments.
- Zero paid-provider cost metadata on lead profiles.
- Enrichment control dashboard at `/enrichment` with field coverage, confidence, review queue, company memory, modeled provider spend avoided, and paid-lookup gating.
- Protected enrichment summary API at `GET /api/v1/enrichment/summary`.
- Protected enrichment review API at `POST /api/v1/leads/:id/enrichment-review`.
- Protected company memory APIs at `GET /api/v1/enrichment/memory`, `GET /api/v1/enrichment/memory?format=csv`, `GET /api/v1/enrichment/memory/:domain`, `POST /api/v1/enrichment/memory/import`, and `POST /api/v1/leads/:id/company-memory`.
- Beta-client onboarding dashboard at `/beta-clients`.
- Protected beta-client APIs at `GET/POST /api/v1/beta-clients`, `GET/POST /api/v1/beta-clients/:id`, and `POST /api/v1/beta-clients/:id/checklist`.
- Beta-client install snippets with `data-beta-client-id` attribution.
- Per-client widget copy, quick replies, primary color, required fields, and routing overrides.
- Automatic beta-client checklist updates when a widget session starts and when a lead is created.
- ICP scoring.
- Lead profile creation.
- CRM-style rep inbox at `/crm`.
- Lead detail view at `/crm/:leadId`.
- Rep workflow on each lead: stage, owner, SLA due time, next action, activity, and notes.
- HubSpot sync preview on lead detail pages showing the exact contact, company, and note operations before live CRM sync.
- Protected lead workflow API at `POST /api/v1/leads/:leadId/workflow`.
- Protected HubSpot preview API at `GET /api/v1/leads/:leadId/hubspot-preview`.
- CRM inbox filters for stage, priority, owner, and SLA state.
- Protected lead list API at `GET /api/v1/leads`.
- Protected analytics summary API at `GET /api/v1/analytics/summary`.
- Pilot command center at `/pilot`.
- Protected pilot summary API at `GET /api/v1/pilot/summary`, including cohort target, client health, next actions, beta lead outcomes, report status, and email-adapter status.
- Protected outcome snapshot exports at `GET /api/v1/pilot/snapshots` and `GET /api/v1/pilot/snapshots?format=csv`, including experiment context.
- Protected outcome trend API at `GET /api/v1/pilot/trends`, comparing current vs previous beta snapshots with deltas and direction.
- Beta report page at `/reports/beta`.
- Protected beta report APIs at `GET /api/v1/reports/beta-summary` and `GET /api/v1/reports/beta-summary?format=markdown`.
- Per-client beta report page at `/beta-clients/:id/report`.
- Protected per-client beta report APIs at `GET /api/v1/beta-clients/:id/report`, including CSV and Markdown exports.
- Report delivery queue at `/reports/deliveries`.
- Per-client beta report schedule settings for recipients, cadence, reporting window, and next due date.
- Per-client beta experiments with title, hypothesis, success metric, owner, status, and notes.
- Per-client outcome snapshots generated from report metrics with learnings, decision, and recommended actions.
- Protected beta experiment and snapshot APIs at `POST /api/v1/beta-clients/:id/experiments` and `POST /api/v1/beta-clients/:id/snapshots`.
- Dry-run report email sender by default, with optional webhook delivery through `REPORT_EMAIL_MODE=webhook`.
- Protected report delivery APIs at `GET /api/v1/reports/deliveries`, `POST /api/v1/reports/deliveries/run-due`, `POST /api/v1/reports/deliveries/send-queued`, `GET /api/v1/reports/deliveries/:id`, `POST /api/v1/reports/deliveries/:id/send`, `POST /api/v1/reports/deliveries/:id/sent`, and `POST /api/v1/beta-clients/:id/report-deliveries`.
- Queued report packets with recipients, Markdown summary, CSV attachment content, send-attempt history, provider message ID, and sent-state tracking.
- Automatic beta-client checklist update when a report delivery is sent or marked sent.
- Filtered lead CSV export at `GET /api/v1/leads/export.csv`.
- Beta report CSV export at `GET /api/v1/reports/beta-summary?format=csv`.
- Operator admin UI at `/admin`.
- Basic Auth protection for `/admin`, `/crm`, lead APIs, and HubSpot setup APIs.
- Persisted widget, scoring, and routing configuration.
- Guarded state restore/import flow in `/admin` with dry-run default and exact confirmation phrase requirement.
- HubSpot property readiness checks and setup endpoints.
- Automated API regression test suite.
- Railway deployment config and deployment checklist.
- JSON-backed local persistence in `deal-threads-dev/.data/deal-threads-dev.json`.
- Persisted company enrichment memory records.
- Persisted beta-client records and onboarding checklist state.
- Persisted beta-client experiment notes and outcome snapshots.
- Persisted report delivery queue records and send-attempt history.
- HubSpot sync adapter with stub mode when `HUBSPOT_TOKEN` is not set.
- Manual HubSpot resync endpoint at `POST /api/v1/leads/:leadId/sync`.
- Protected HubSpot handoff queue APIs at `GET /api/v1/hubspot/sync-queue` and `POST /api/v1/hubspot/sync-queue/run`, with dry-run behavior when no token is configured.
- Repeatable browser QA script at `npm run qa:browser` for headless Chrome beta-client setup, per-client install snippets, widget, CRM workflow, report delivery, and admin backup screenshots.

## Files Added

- `deal-threads-dev/package.json`
- `deal-threads-dev/server.js`
- `deal-threads-dev/public/widget.js`
- `deal-threads-dev/README.md`
- `deal-threads-dev/src/data-store.js`
- `deal-threads-dev/src/hubspot.js`
- `deal-threads-dev/src/internal-enrichment.js`
- `deal-threads-dev/src/llm-extractor.js`
- `deal-threads-dev/scripts/browser-qa.mjs`
- `deal-threads-dev/test/regression.test.js`
- `deal-threads-dev/railway.toml`
- `deal-threads-dev/.env.example`
- `deal-threads-dev/DEPLOYMENT.md`
- `deal-threads-dev/.gitignore`

## Verification Completed

- `node --check server.js`
- `node --check public/widget.js`
- Local server started with `npm run dev`.
- API smoke test created a completed high-priority lead profile.
- Browser smoke test completed the widget flow using system Chrome.
- Local persistence verified across server restart.
- HubSpot stub sync verified without `HUBSPOT_TOKEN`.
- Internal enrichment mode added to reduce dependency on paid enrichment providers.
- Optional OpenAI structured extraction added with heuristic fallback.
- OpenAI extraction readiness probe added to `/admin`, `GET /api/v1/admin/llm/readiness`, and `POST /api/v1/admin/llm/test`; regression coverage confirms the no-key heuristic path does not create leads.
- HubSpot sync preview and handoff queue added to CRM detail pages, `/admin`, `GET /api/v1/leads/:id/hubspot-preview`, `GET /api/v1/hubspot/sync-queue`, and `POST /api/v1/hubspot/sync-queue/run`; regression coverage verifies protected access, exact mapped operations, and no-token dry-run queue behavior.
- Operator admin added for tenant/widget settings, scoring weights, and routing rules.
- Admin changes verified in the browser and persisted across restart.
- HubSpot readiness panel added to `/admin`.
- HubSpot property dry-run verified without `HUBSPOT_TOKEN`: 26 required properties reported as would-check/would-create.
- `npm test` passes and covers admin authentication, config publishing, HubSpot readiness dry-run, lead creation, workflow updates, target-account CSV memory import, memory filters and CSV export, company memory correction and cache reuse, protected lead filtering, analytics summaries, pilot command center, beta experiments, outcome snapshots, cohort trend comparisons, outcome snapshot CSV export, global and per-client beta report JSON, Markdown, and CSV exports, report delivery queue/run-due/dry-run-send flows, lead CSV exports, protected state backup export and dry-run validation, routing, CRM stub sync, and persistence.
- Railway config added with `npm start` and `/api/v1/health` healthcheck.
- CRM detail page verified for:
  - Contact name.
  - HubSpot stack.
  - High-priority score.
  - Rep call-prep brief.
  - Human-readable timeline.
  - Workflow stage, owner, SLA due time, notes, and activity.
  - Lead list filtering and analytics endpoint coverage.
  - Beta reporting JSON, Markdown, and CSV export coverage.
  - Lead CSV export coverage.
- Enrichment control verified in the in-app browser at `http://localhost:4173/enrichment`.
- Enrichment summary API verified with Basic Auth and zero paid-provider spend.
- Company memory import, filters, CSV export, correction API, and `internal_memory_cache` reuse verified through regression coverage.
- Beta-client API regression coverage added for protected access, client creation, install snippets, per-client widget config, routing overrides, checklist updates, domain allowlist updates, lead attribution, and persistence.
- Beta-client dashboard verified in the in-app browser at `http://localhost:4173/beta-clients`.
- Per-client widget/routing configuration verified against the running local API and dashboard.
- Per-client beta reporting verified through protected JSON, Markdown, and CSV regression coverage.
- Report delivery queue verified through protected API regression coverage, including due report creation, delivery detail retrieval, dry-run send behavior, checklist automation, send-attempt persistence, and persistence.
- Pilot command center verified through protected page/API regression coverage for client health, target cohort progress, lead metrics, report status, and next actions.
- Beta experiment and weekly outcome snapshot workflow verified through protected API regression coverage and persistence checks.
- Cohort outcome snapshot export verified through protected JSON and CSV regression coverage.
- Cohort outcome trends verified through protected API regression coverage for current/previous metrics, deltas, and improved/declined direction.
- Providerless enrichment build-vs-buy plan added to `/enrichment` and `/api/v1/enrichment/build-plan`, including internal source stack, quality gates, cost-avoidance model, manual review policy, and paid escalation criteria.
- Providerless build plan verified through regression coverage for protected access, API payloads, UI copy, quality gates, and zero recommended paid lookups during beta.
- Enrichment review workflow added to `/enrichment`, `/crm/:leadId`, `POST /api/v1/leads/:id/enrichment-review`, lead CSV exports, and beta reports; regression coverage verifies pending -> research-needed -> reviewed transitions and queue shrinkage.
- Protected operator page smoke coverage added in `deal-threads-dev/test/operator-pages.test.js` for `/crm`, lead detail, `/pilot`, `/beta-clients`, global and client beta reports, report delivery queue/detail, `/enrichment`, and `/admin` using a seeded beta client, lead, memory correction, experiment, snapshots, and queued report delivery.
- Beta-client widget install smoke coverage added in `deal-threads-dev/test/widget-install.test.js`, executing the real `public/widget.js` script against the local API with a DOM harness to verify client-specific launcher copy, quick replies, color, consent gating, UTM attribution, routing overrides, completed lead profile creation, beta-client attribution, and onboarding checklist automation.
- Protected operator form regression added in `deal-threads-dev/test/operator-forms.test.js`, covering URL-encoded form redirects and state changes for admin config, scoring, routing, HubSpot readiness, beta-client create/update/checklist, CRM workflow updates, company-memory correction, experiments, snapshots, target-account import, report delivery queueing, manual sent state, due-report queueing, and dry-run queued sending.
- Optional SQLite snapshot persistence added with `DEAL_THREADS_DATA_STORE=sqlite` and `DEAL_THREADS_SQLITE_FILE`, while JSON remains the default local mode.
- Healthcheck now reports `dataStore.mode` and `dataStore.location` so operators can confirm the active persistence backend.
- SQLite persistence verified in `deal-threads-dev/test/sqlite-store.test.js` with direct store save/load coverage and a server restart test that persists beta client and lead state across process restarts.
- Protected state backup export added at `/api/v1/admin/state/export`, including export metadata, data-store mode/location, object counts, and the full Deal Threads snapshot for JSON/SQLite migration and pre-deploy backups.
- Admin runtime panel now shows data-store mode/location and links to the state backup download.
- Protected state backup dry-run validation added at `POST /api/v1/admin/state/validate`.
- Admin state backup panel now lets operators paste a downloaded backup, validate parseability, section shape, duplicate IDs/domains, incoming counts, and count deltas without mutating state.
- Protected guarded restore added at `POST /api/v1/admin/state/restore` and `/admin`, with dry-run default, `RESTORE DEAL THREADS STATE` confirmation, synchronous persistence on apply, and regression coverage for dry-run, wrong-confirmation, and applied restore paths.
- Browser QA script added with no npm dependencies. It starts an isolated server, launches headless Chrome through the DevTools Protocol, creates a beta client through the operator form, loads the generated per-client script tag in a fixture page, completes a real widget conversation, opens the generated CRM profile, updates the rep workflow form, queues and marks a report delivery sent, validates a downloaded state backup through the admin form, captures desktop/mobile screenshots, and writes `.artifacts/browser-qa/browser-qa-summary.json`.
- `npm run qa:browser` passes locally and confirms the generated backup validation result is `restore_ready: true`.
- Report delivery detail now displays the operator sent note so manual delivery status can be audited from the UI.

## Screenshot Artifacts

Generated under:

`deal-threads-dev/.artifacts/`

- `home-desktop.png`
- `widget-complete-desktop.png`
- `crm-detail-desktop.png`
- `widget-mobile-open.png`
- `admin-hubspot-readiness.png`
- `enrichment-control.png`
- `enrichment-build-plan.png`
- `beta-clients-empty.png`
- `beta-clients-config.png`
- `browser-qa/beta-client-setup-form.png`
- `browser-qa/client-snippet-widget-open-desktop.png`
- `browser-qa/client-snippet-widget-complete-desktop.png`
- `browser-qa/crm-detail-browser-qa.png`
- `browser-qa/crm-workflow-updated.png`
- `browser-qa/report-delivery-queued.png`
- `browser-qa/report-delivery-sent.png`
- `browser-qa/admin-backup-validation.png`
- `browser-qa/client-snippet-widget-open-mobile.png`
- `browser-qa/browser-qa-summary.json`

## Next Build Slice

Recommended next slice:

1. Test HubSpot property setup, sync preview, and handoff queue against a real sandbox portal.
2. Run the OpenAI extraction probe with a real sk-proj- and compare live output against heuristic fallback.
3. Move from SQLite snapshot persistence to Postgres when beta usage requires multi-instance writes or SQL reporting.
4. Replace the generic report webhook with a chosen ESP adapter only after pilot sending volume is known.
5. Add an optional paid enrichment adapter only after internal enrichment quality and API costs are measured across beta clients.

[OPENAI_API_KEY_REMOVED - set OPENAI_API_KEY in environment]
