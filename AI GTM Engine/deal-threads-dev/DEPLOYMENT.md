# Deal Threads Railway Deployment

Last updated: 2026-06-01

## What Is Configured

This app includes `railway.toml` for Railway config-as-code.

Railway currently looks for `railway.toml` or `railway.json` by default, supports a configured start command, and supports a healthcheck path that is queried during deployment startup. This app uses:

- Start command: `npm start`
- Healthcheck: `/api/v1/health`
- Builder: Railpack
- Restart policy: on failure, max 3 retries

## Required Variables

Minimum:

```bash
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=generate-a-strong-password
```

Recommended:

```bash
DEAL_THREADS_DATA_STORE=sqlite
DEAL_THREADS_SQLITE_FILE=/data/deal-threads-dev.sqlite
PILOT_TARGET_CLIENTS=5
```

Use a Railway volume mounted at `/data` so SQLite persistence survives redeploys. JSON remains available for local development with `DEAL_THREADS_DATA_STORE=json` and `DEAL_THREADS_DATA_FILE=/data/deal-threads-dev.json`. Move to Postgres when beta usage requires multi-instance writes or deeper SQL reporting.

## Optional Variables

OpenAI structured extraction:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com
```

HubSpot sandbox sync:

```bash
HUBSPOT_TOKEN=pat-na1-...
HUBSPOT_BASE_URL=https://api.hubapi.com
```

Enrichment mode:

```bash
ENRICHMENT_MODE=internal
INTERNAL_ENRICHMENT_TIMEOUT_MS=3500
INTERNAL_ENRICHMENT_SIGNAL_PAGE_LIMIT=2
PAID_ENRICHMENT_LOOKUP_ESTIMATE_USD=0.25
ENRICHMENT_REVIEW_CONFIDENCE_THRESHOLD=0.65
MAX_REQUEST_BODY_BYTES=1048576
```

Report email delivery:

```bash
# Default: records a send attempt without transmitting external email.
REPORT_EMAIL_MODE=dry_run
REPORT_EMAIL_FROM=reports@dealthreads.local

# Optional later: POST report packets to a controlled email workflow.
REPORT_EMAIL_MODE=webhook
REPORT_EMAIL_WEBHOOK_URL=https://example.com/deal-threads/report-email
REPORT_EMAIL_WEBHOOK_TOKEN=optional-bearer-token
REPORT_EMAIL_REPLY_TO=revops@yourdomain.com
```

## Pre-Deploy Checklist

1. Run `npm test`.
2. Confirm `test/regression.test.js`, `test/operator-pages.test.js`, `test/operator-forms.test.js`, `test/widget-install.test.js`, and `test/sqlite-store.test.js` pass.
3. Run `npm run qa:browser` locally and confirm `.artifacts/browser-qa/browser-qa-summary.json` reports `restore_ready: true`.
4. Run `npm start` locally and open `/api/v1/health`.
5. Confirm `/api/v1/health` reports the expected `dataStore.mode`, `dataStore.location`, and `hardening.status`.
6. Confirm `/api/v1/trust/hardening` works with Basic Auth and has no blockers before sending any live script tag.
7. Confirm a request from a disallowed `Origin` to `/api/v1/widget-sessions` returns `403`.
8. Download `/api/v1/admin/state/export` with Basic Auth and save the state backup before changing store mode or deploying.
9. Validate that backup through `/api/v1/admin/state/validate` or the `/admin` backup form and confirm `restore_ready` is true.
10. Run `/api/v1/admin/state/restore` without confirmation and confirm it reports a dry run with `applied=false`.
11. Confirm `/admin` rejects unauthenticated requests and loads with Basic Auth.
12. Confirm `/api/v1/admin/beta-readiness` works with Basic Auth and has no blockers before sending a beta install to a client.
13. Confirm `/api/v1/admin/llm/readiness` works with Basic Auth, then run `/api/v1/admin/llm/test` or the `/admin` OpenAI extraction probe.
14. Confirm `/api/v1/hubspot/properties` works in dry-run or live mode with Basic Auth.
15. Set Railway variables.
16. Deploy.
17. Confirm Railway healthcheck passes.
18. Run `LAUNCH_BASE_URL=https://your-domain LAUNCH_ADMIN_USERNAME=admin LAUNCH_ADMIN_PASSWORD=... npm run qa:launch` and confirm `.artifacts/launch-readiness/launch-readiness-summary.json` reports `passed`.
19. Open `/admin` and run HubSpot property check.
20. Submit a test widget conversation.
21. Verify the lead in `/crm`.
22. Update the lead workflow stage and add a rep note.
23. Confirm `/api/v1/leads/LEAD_ID/hubspot-preview` returns contact, company, and note operations for the lead.
24. Confirm `/api/v1/hubspot/sync-queue` lists the lead as eligible, then run `/api/v1/hubspot/sync-queue/run` with `{"dryRun":true}`.
25. Confirm `/crm` filters by stage, priority, owner, and SLA state.
26. Confirm `/api/v1/analytics/summary` returns lead workflow metrics.
27. Confirm `/enrichment` loads and `/api/v1/enrichment/summary` shows zero paid-provider spend plus buyer-profile, buying-committee, and buying-trigger coverage.
28. Import a target-account CSV on `/enrichment` and confirm `/api/v1/enrichment/memory` shows imported reusable records.
29. Confirm `/enrichment?segment=imported` filters the memory table and `/api/v1/enrichment/memory?segment=imported&format=csv` exports matching records.
30. Mark one low-confidence lead `research_needed`, then `reviewed`, through `/enrichment` or `POST /api/v1/leads/LEAD_ID/enrichment-review`; confirm the open review queue shrinks.
31. Correct one lead's Company memory panel and confirm `/api/v1/enrichment/memory?segment=corrected` shows the reusable company record.
32. Submit another lead from an imported or corrected domain and confirm the lead uses `internal_memory_cache`.
33. Open `/launch`, create or select a beta client, review `/api/v1/beta-clients/BETA_CLIENT_ID/launch-packet`, send or dry-run the launch packet, open the test-install page, create a launch test lead, and confirm `/api/v1/launch/first-beta` shows snippet, install, and test-lead steps passing.
34. Open `/beta-clients`, confirm the pilot client has custom widget copy/routing, copy its install snippet, and verify `/api/v1/beta-clients` returns it.
35. Confirm `/pilot` loads and `/api/v1/pilot/summary` shows the beta cohort target, client health, next actions, and linked lead metrics.
36. Add an experiment on the beta client and confirm `/api/v1/beta-clients/BETA_CLIENT_ID/experiments` returns it.
37. Capture an outcome snapshot and confirm `/api/v1/beta-clients/BETA_CLIENT_ID/snapshots` stores the weekly metrics and decision.
38. Capture a second snapshot after an outcome changes, then confirm `/api/v1/pilot/trends` reports current, previous, delta, and direction.
39. Confirm `/api/v1/pilot/snapshots?format=csv` exports all captured outcome snapshots with experiment context.
40. Confirm `/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=BETA_CLIENT_ID` returns the client-specific widget config.
41. Confirm a test lead created from a beta-client snippet is linked back to that client and routed to the client-specific owner if set.
42. Send a synthetic CRM webhook test from `/beta-clients` or `POST /api/v1/beta-clients/BETA_CLIENT_ID/crm-delivery/test`; confirm it records `sent` in dry-run mode and does not include real buyer data.
43. Configure report recipients, cadence, reporting window, and next due date for the beta client.
44. Confirm `/reports/beta` loads and `/api/v1/reports/beta-summary?format=markdown` exports the global weekly report.
45. Confirm `/beta-clients/BETA_CLIENT_ID/report` loads and `/api/v1/beta-clients/BETA_CLIENT_ID/report?format=markdown` exports the client-specific weekly report.
46. Run due deliveries with `/api/v1/reports/deliveries/run-due`, then confirm `/reports/deliveries` shows a queued packet.
47. Open the queued delivery, confirm the Markdown and CSV packet content, send it in dry-run or webhook mode, and confirm the beta-client `First report sent` checklist item updates.
48. Confirm `/api/v1/leads/export.csv`, `/api/v1/reports/beta-summary?format=csv`, and `/api/v1/beta-clients/BETA_CLIENT_ID/report?format=csv` download CSV attachments.
49. Confirm the workflow, enrichment review state, company memory, beta-client experiment/snapshot, pilot summary, and report delivery updates persist after restart.
50. Confirm `/api/v1/enrichment/build-plan` returns the providerless build plan, quality gates, zero default paid lookups, and manual escalation criteria.

## Notes

Without `HUBSPOT_TOKEN`, the app is safe to deploy and demo. HubSpot actions remain stubbed or dry-run.

Without `OPENAI_API_KEY`, the app is safe to deploy and demo. Extraction uses the local heuristic parser.

Without `REPORT_EMAIL_MODE=webhook`, launch packet and report sends stay in dry-run mode and do not transmit customer data outside Deal Threads.
