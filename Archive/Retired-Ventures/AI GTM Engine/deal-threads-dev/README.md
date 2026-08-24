# Deal Threads Development App

This is the first local development slice for Deal Threads. It mirrors the current Railway prototype's core idea, then moves it from a static contact form into the planned script-tag AI intake widget.

## What It Includes

- Customer demo page at `/`.
- Script-tag widget loaded from `/widget.js`.
- Widget config API.
- Conversation session API.
- Heuristic extraction by default.
- Optional OpenAI structured extraction when `OPENAI_API_KEY` is set.
- Self-built website/domain enrichment by default.
- Public providerless enrichment page at `/providerless-enrichment` with the buyer-safe build-vs-buy strategy, internal source stack, paid-lookup firewall, JSON export, and Markdown export.
- Enrichment cost-control dashboard at `/enrichment`.
- Protected providerless account preflight from `/enrichment` and `POST /api/v1/enrichment/preflight`, with public-site signal extraction, optional reusable company memory save, private-network fetch blocking, JSON export, and Markdown export.
- Providerless enrichment build-vs-buy plan at `/api/v1/enrichment/build-plan`.
- Enrichment review workflow for low-confidence/high-value profiles, with operator notes and beta report counts.
- Providerless research evidence workspace on `/crm/:leadId`, with source URLs, confidence, reusable company memory, and beta report counts.
- Protected providerless evidence packet at `/crm/:leadId/providerless-evidence`, with JSON and Markdown export at `/api/v1/leads/:leadId/providerless-evidence`, first-party context, website signals, inferred buyer profile, research evidence, reusable company memory, rep feedback gaps, copy blocks, and the paid-lookup firewall.
- Mock enrichment fallback and ICP scoring.
- Lead profile creation.
- Rep inbox at `/crm`.
- Lead detail pages at `/crm/:leadId`.
- Rep-ready lead briefs with call plan, discovery questions, copy blocks, quality flags, JSON, and Markdown export.
- Rep feedback capture for brief usefulness, missing context, confidence, call usage, and source-field gaps.
- Tokenized customer rep feedback room at `/feedback/:token` for scoring beta-attributed profiles without admin access or protected CRM profile links.
- Tokenized public rep handoff packets at `/handoff/:token/:leadId` with first-touch summary, call plan, discovery questions, copy blocks, providerless evidence, and Markdown export for manual CRM copy/paste.
- Tokenized buyer-safe beta proof report at `/handoff/:token/proof` with install proof, profile volume, rep feedback, first-touch comparisons, providerless enrichment metrics, Markdown export, and JSON export.
- Lead workflow stages, owner assignment, SLA due times, activity, rep notes, and structured sales outcomes.
- CRM inbox filters by stage, priority, owner, and SLA state.
- Lead analytics summary for overdue leads, stage mix, priority mix, meetings, opportunities, pipeline value, wins, and first-touch speed.
- Mid-market readiness room at `/readiness` with proof, handoff controls, governance, providerless enrichment gates, open gaps, buyer-question answers, and a marked demo scenario for buyer walkthroughs before live beta data exists.
- Public pilot launch hub at `/pilot-launch` with stakeholder-specific start paths, launch sequence, proof gates, offer snapshot, providerless cost controls, buyer-safe links, JSON export, and Markdown export.
- Public beta pilot intake at `/pilot-intake` with consent-gated mid-market request capture, protected activation-prospect creation, tokenized buyer confirmation status handoff after submit, and public next-step links in the JSON API response without exposing CRM profiles or operator actions.
- Public pilot agreement at `/pilot-agreement` with buyer-safe scope, fees, responsibilities, success criteria, security posture, commercial review checklist, agreement claim audit, and not-included terms for the 14-day private beta.
- Public pilot approval room at `/pilot-approval-room` with stakeholder tracks, approval checklist, launch sequence, default data posture, approval routing checklist, approval claim audit, JSON export, and Markdown export for mid-market buying committees.
- Public mutual action plan at `/mutual-action-plan` with the 14-day approval, install, CRM handoff, live-traffic, proof-review, and go/no-go timeline plus buyer inputs, proof targets, risk controls, execution checklist, MAP claim audit, JSON export, and Markdown export.
- Public buyer confirmation guide at `/buyer-confirmation-guide` with the six details needed before `/confirm/:token`, stakeholder prework, baseline examples, submission rules, post-confirmation handoff steps, confirmation prework checklist, guide claim audit, JSON export, and Markdown export.
- Public stakeholder forwarding kit at `/stakeholder-forwarding-kit` with buyer-safe internal notes for executive, RevOps, website, CRM, security/procurement, and sales stakeholders, stakeholder forwarding checklist, forwarding claim audit, JSON export, and Markdown export.
- Public pricing and packages page at `/pricing` with the free education offer, $500 private beta setup, $2,500/month managed service, $1,000/month intelligence reports add-on, $5,000/month premium ICP campaigns, buyer fit, cost controls, commercial terms checklist, pricing claim audit, JSON export, and Markdown export.
- Public sales enablement packet at `/sales-enablement` with mid-market target segments, qualification filters, outbound email copy, LinkedIn copy, discovery questions, objection responses, demo talk track, success definition, forwarding checklist, sales copy audit, JSON export, and Markdown export.
- Public providerless enrichment page at `/providerless-enrichment` with the answer to whether Deal Threads needs paid enrichment on day one, plus source stack, beta operating rules, field-level strategy, build-vs-buy rules, paid escalation policy, current aggregate metrics, JSON export, and Markdown export.
- Public comparison guide at `/compare` with category-level positioning against plain contact forms, generic chatbots, enterprise conversational marketing platforms, scheduling/routing tools, paid enrichment providers, and internal builds, plus a decision-fit matrix, comparison claim audit, JSON export, and Markdown export.
- Public proof preview at `/proof-preview` with synthetic/template install proof, profile volume, first-touch speed, rep usefulness, pipeline motion, providerless enrichment metrics, a public claim audit that blocks live-result and market-ready claims until the protected market gate clears, interpretation rules, buyer inputs, JSON export, and Markdown export.
- Public business case calculator at `/business-case` with adjustable mid-market assumptions, modeled payback, annual service-cost comparison, model sensitivity, ROI claim audit, pilot proof targets, JSON export, and Markdown export without exposing operator data or making guaranteed ROI/customer-outcome claims.
- Public implementation guide at `/implementation-guide` with install prerequisites, stakeholder roles, script-tag steps, source-check QA, acceptance criteria, rollback plan, data posture, JSON export, and Markdown export for website and RevOps owners.
- Public CRM handoff guide at `/crm-handoff-guide` with manual export, dry-run queue, synthetic webhook test, webhook delivery, HubSpot preview/sandbox options, field groups, go-live gates, rollback plan, JSON export, and Markdown export for CRM owners.
- Public procurement packet at `/procurement-packet` with a forwardable approval checklist, default data posture, processor modes, security controls, pilot terms, public links, JSON export, and Markdown export without exposing operator forms, protected tenant exports, admin routes, or CRM profiles.
- Public security center at `/security` with data categories, processor posture, access/privacy controls, hardening checks, providerless enrichment gates, and install boundaries without exposing operator-only exports or profiles.
- Buyer trust packet at `/trust` with data categories, processors, data flow, production hardening, controls, procurement disclosures, and Markdown export.
- Tokenized buyer confirmation form at `/confirm/:token` with a completion checklist, missing-detail count, owner actions, request-kit/acceptance links, and browser-required fields for target page, implementation owner, CRM owner, routing owner, and proof recipients.
- Tokenized buyer confirmation status room at `/confirm/:token/status` with missing required details, current confirmation state, a buying-committee brief, owner actions, risk controls, forwardable summary, buyer-safe links, JSON export, and Markdown export before the buyer submits `/confirm/:token`.
- Tokenized buyer confirmation request kit at `/confirm/:token/request-kit` with stakeholder-specific forwardable asks, one-click `mailto:` drafts, and a champion reply template for website, CRM, routing, and proof owners, plus JSON export and Markdown export before the buyer submits `/confirm/:token`.
- Tokenized pilot acceptance room at `/confirm/:token/acceptance` with signer, billing contact, setup-fee status, manual invoice/PO intent, JSON export, and Markdown receipt without processing payment, sending email, creating beta clients, mutating CRM, or running paid enrichment on `GET`.
- Widget consent gating for both chat and fallback submissions before any lead profile is created.
- Production hardening status in `/api/v1/health` and `/api/v1/trust/hardening`, covering security headers, request body limits, widget origin enforcement, operator auth, and default external-transmission posture.
- Pilot command center at `/pilot` for five-client beta health, risks, outcomes, reports, and next actions.
- Beta proof dashboard at `/proof` comparing old contact-form baselines against Deal Threads first-touch speed, conversion, pipeline, rep feedback, and research time saved.
- Protected first-five beta board at `/launch/first-five-board` for the five launch slots across target accounts, activation prospects, real beta clients, install proof, first profiles, CRM handoff, rep feedback, and providerless enrichment guardrails, with activation-slot action kits, JSON export, and Markdown export.
- Protected launch operations command room at `/launch/ops` for the current first-five focus, outreach, buyer confirmation, install queue, CRM handoff, rep feedback, proof gate, and read-only safety posture.
- Protected first beta launch drill at `/launch/first-beta-drill` for the read-only sequence from buyer confirmation through install, first profile, CRM handoff, rep feedback, and live-proof review, with operator POST previews, JSON export, and Markdown export.
- Protected first beta next-action room at `/launch/next-action` for the shortest proof-gate action path: before buyer confirmation it shows follow-up copy, manual `mailto:` draft, manual sent recorder, buyer-safe confirmation/status/request links, and reply preview; after buyer confirmation it prioritizes the explicit beta-install kickoff POST over additional follow-up packets; after a real beta client exists it pivots to install-proof mode with the active install action, install public links, install workbench, proof blockers, and no stale buyer manual-send controls.
- Protected launch confirmation command center at `/launch/confirmation-command` for moving the active buyer from follow-up to manual delivery record, buyer status, reply parsing, reviewed confirmation capture, and real beta kickoff in one operator room, with providerless enrichment firewall, JSON export, Markdown export, and read-only `GET` safety flags.
- Protected launch confirmation watchroom at `/launch/confirmation-watch` for buyer-confirmation SLA focus across active prospects: current chase target, due/overdue counts, next check time, queue links into the command center, buyer-safe status/request links, providerless posture, JSON export, Markdown export, and read-only `GET` safety flags.
- Protected first beta execution packet at `/launch/first-beta-execution` for the exact next production run sheet across the active buyer follow-up, confirmation capture, install kickoff, first profile, CRM handoff, rep feedback, and live-proof review, with copy-ready follow-up text while confirmation is pending, kickoff action preview after confirmation is complete, providerless enrichment cost firewall, JSON export, and Markdown export.
- Protected first profile capture room at `/launch/first-profile` for turning client-domain install proof into the first beta-attributed buyer profile, with capture checklist, POST-only test-lead preview, CRM/rep/live-proof unlocks, JSON export, Markdown export, and read-only `GET` safety flags.
- Protected profile handoff bridge at `/launch/profile-handoff` for moving the first beta profile into CRM handoff proof, rep handoff, rep feedback, and proof-packet review, with rep-ready brief, POST-only CRM/rep/feedback actions, buyer-safe handoff links, JSON export, Markdown export, and read-only `GET` safety flags.
- Protected rep feedback command room at `/launch/rep-feedback` for turning beta profiles into copy-ready rep feedback asks, public feedback-room links, per-client/profile feedback coverage, JSON export, Markdown export, and read-only `GET` safety flags before market-ready claims.
- Protected proof capture runbook at `/launch/proof-capture` for guiding the operator from client-domain install proof through first real beta profile, CRM handoff proof, rep feedback, first proof packet, and live-proof gate review, with JSON export, Markdown export, exact evidence surfaces, and read-only safety flags.
- Protected first proof packet workbench at `/launch/proof-packet` for assembling the buyer-safe proof packet once install, first profile, CRM handoff, and rep feedback evidence exists; includes strict evidence gates, buyer-safe packet preview, POST-only queue action, POST-only manual sent recorder, JSON export, Markdown export, and read-only `GET` safety flags.
- Protected market launch readiness gate at `/launch/market-ready` for deciding whether real mid-market beta traffic and live-proof claims are allowed yet, with JSON export and Markdown export.
- Protected market launch kit at `/launch/market-kit` for launch-safe claims, required disclosures, prohibited claims, GTM copy blocks, buyer-safe CTAs, JSON export, and Markdown export before promoting Deal Threads to mid-market B2B buyers.
- Protected launch proof ledger at `/launch/proof-ledger` for the evidence checklist that must clear before broad market-ready or live-proof claims, with owner, proof condition, capture surface, verification surface, JSON export, and Markdown export.
- Protected launch proof owner handoff at `/launch/proof-handoff` for copy-ready stakeholder asks, one-click `mailto:` drafts, and manual sent recording generated from the proof ledger, grouped by buyer champion, implementation, CRM, sales, and operator owners, with JSON export and Markdown export.
- First beta launch cockpit at `/launch` for client setup, snippet handoff, install verification, and launch test leads.
- Protected activation intake triage at `/activation/intake-triage` for ranking public pilot-intake submissions and qualified CRM leads into the first-five beta workflow, with fit reasons, missing buyer-confirmation details, recommended action packets, JSON export, Markdown export, and zero paid-lookups by default.
- Protected activation follow-up queue at `/activation/follow-ups` for close packets, confirmation nudges, overdue buyer-confirmation threads, waiting-on-buyer states, and kickoff-ready prospects.
- Protected activation outbox at `/activation/outbox` for the sendable buyer follow-ups blocking first beta confirmation, with recipients, subject/body, manual `mailto:` draft handoff, delivery audit, send POST previews, manual sent recorder POST previews, JSON export, and Markdown export.
- Protected activation close desk at `/activation/close-desk` for batching close packets, confirmation nudges, manual confirmation capture, and kickoff-ready prospects without running bulk sends, paid enrichment, CRM transmission, beta-client creation, or live-proof claims on `GET`.
- Protected buyer confirmation workbench at `/activation/prospects/:leadId/confirmation-workbench` for one prospect's nudge copy, missing details, status room, request kit, pilot acceptance receipt, manual confirmation capture, and kickoff path, with JSON export and Markdown export.
- Protected confirmation reply preview at `/activation/prospects/:leadId/confirmation-reply` for parsing a pasted buyer reply into a reviewable confirmation payload before any state-changing POST, with JSON export and Markdown export.
- Protected stakeholder handoff pack at `/activation/prospects/:leadId/stakeholder-handoff` for one prospect's champion note, owner-specific copy blocks, buyer-safe links, stakeholder asks, and kickoff preflight, with JSON export and Markdown export.
- Protected install follow-up queue at `/launch/install-queue` for post-kickoff beta clients, launch packets, install handoff, source checks, client-domain config loads, first profiles, CRM handoff proof, rep feedback, and proof packet follow-up. Client-domain config proof supersedes a missing tested-URL handoff response, so the queue advances to first-profile capture once the buyer page has loaded the widget config.
- Beta-client onboarding dashboard at `/beta-clients`.
- Per-client readiness gates for snippet handoff, install proof, test leads, CRM handoff, experiments, and first proof packet.
- Per-client launch wizard with setup, packet, install, test-lead, CRM-proof, and live-ready phases.
- Beta-client install snippets with `data-beta-client-id` lead attribution.
- Beta-client runtime domain authorization: client-specific widget config can load from the Deal Threads hosted/test host or the configured beta-client domain, but not from another globally allowed client domain.
- Per-client widget copy, quick replies, color, required fields, and routing overrides.
- Per-client conversation playbooks with editable question prompts, answer hints, and required-field gates.
- Per-client experiment notes and weekly outcome snapshots.
- Per-client proof baselines for old-form first-touch time, meeting rate, opportunity rate, win rate, sample-size target, and proof notes.
- Beta-client checklist tracking for domain allowlist, snippet delivery, install, CRM readiness, test lead, routing, and first report.
- Beta report page plus JSON and Markdown exports for weekly pilot updates, including opportunity and pipeline metrics.
- Beta report delivery queue with per-client recipients, cadence, due dates, Markdown packets, CSV attachments, and sent-state tracking.
- Dry-run report email sender by default, with an optional webhook adapter for real delivery.
- Rep alert queue for high/medium priority owned leads, with dry-run or webhook email handoff.
- Generic CRM delivery queue for beta-attributed buyer profiles, dry-run by default with an optional webhook handoff.
- Tokenized manual CRM export at `/handoff/:token/crm-export.csv`, plus Markdown import notes and JSON packet, for HubSpot/Salesforce/Pipedrive upload before native sync is connected.
- CSV exports for filtered lead lists, beta report attachments, and enrichment memory segments.
- Operator admin UI at `/admin`.
- Beta launch readiness gate on `/admin` and `/api/v1/admin/beta-readiness`.
- Persisted widget, scoring, and routing configuration.
- Protected state backup export, dry-run validation, and guarded restore for store migration and pre-deploy snapshots.
- HubSpot sync preview and handoff queue for safe dry-run CRM backfills before a live token is configured.
- Repeatable headless Chrome browser QA for beta-client setup, per-client install snippets, widget, rep feedback, research evidence, CRM workflow, sales outcome updates, rep alerts, CRM delivery, readiness room, report delivery, and admin backup screenshots.
- HubSpot readiness checks for required Deal Threads custom properties.
- Automated regression tests for the core API flow, protected operator pages, operator forms, and beta-client widget install flow.
- Railway deployment config and deployment checklist.
- JSON-backed local persistence in `.data/deal-threads-dev.json`.
- Optional SQLite-backed persistence for beta deployments with `DEAL_THREADS_DATA_STORE=sqlite`.
- HubSpot sync adapter with safe stub mode when `HUBSPOT_TOKEN` is not set.
- Persisted 24/7 SDR control plane for idempotent buying-signal ingestion, ICP ranking, account dossiers, voice-aware sequences, reply classification, opt-out suppression, meeting qualification, exponential retries, approval mode, and controlled webhook delivery.
- Protected Revenue Watchdog at `/sdr-ops` with a mobile decision queue, 24-hour revenue pulse, deterministic decision IDs, persistent resolutions, reply/sequence/suppression/reliability grading, evidence-backed improvement proposals, continuous revenue-path integrity checks, Markdown/JSON briefs, and 90-day daily history.

## Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:4173
```

## Test

```bash
npm test
```

The regression tests start isolated servers on test ports with temporary data files. The package script runs the test runner with `--test-concurrency=1` because several regression cases intentionally reuse the same local server port.

For browser-level UI proof, run:

```bash
npm run qa:browser
```

The browser QA script starts an isolated local server, launches headless Chrome through the DevTools Protocol, creates a beta client through the operator form, loads the generated per-client script tag in a fixture page, completes a real widget conversation, opens the generated CRM lead profile, saves rep feedback, saves sourced research evidence, sends the dry-run rep alert, sends the dry-run generic CRM delivery, updates the rep workflow and sales outcome forms, verifies the readiness room and buyer trust packet, queues and marks a report delivery sent, validates a state backup through the admin form, and captures desktop/mobile screenshots in `.artifacts/browser-qa`. Set `CHROME_PATH` if Google Chrome is installed somewhere other than the default macOS path.

`test/regression.test.js` checks HubSpot readiness dry-run, HubSpot sync preview and queue dry-runs, generic CRM delivery queueing and dry-run sending, admin config publishing, beta launch readiness states, launch proof ledger states, mid-market readiness summaries, beta-client setup, install snippets, configurable conversation playbooks, checklist automation, high-priority lead creation, activation intake triage, activation follow-up queue states, activation close desk packets, tokenized pilot acceptance receipts, rep alert queueing and dry-run sending, lead workflow and sales outcome updates, rep feedback capture, research evidence capture, providerless account preflight safety, providerless evidence packet export, enrichment review transitions, protected lead list, analytics, pilot command center, beta experiments, outcome snapshots, beta proof scorecards, enrichment build-vs-buy gates, beta reports, report delivery queue, dry-run report sending, CSV export APIs, protected state backup export, validation, guarded restore, and persistence.

`test/operator-pages.test.js` seeds a realistic beta client, lead, company memory correction, rep feedback, research evidence, experiment, pipeline outcome, snapshots, and report delivery, then verifies the protected operator pages render the expected data on `/crm`, `/crm/:leadId`, `/pilot`, `/proof`, `/readiness`, `/beta-clients`, `/reports/beta`, per-client reports, `/reports/deliveries`, delivery detail, `/enrichment`, and `/admin`, including the rep feedback panel, rep alert panel, CRM delivery panel, sales outcome panel, enrichment review panels, research evidence workspace, HubSpot sync preview, proof baseline panel, and beta launch readiness panel.

`test/operator-forms.test.js` submits the protected URL-encoded forms used by the server-rendered UI, then verifies redirects and resulting state for admin config, scoring, routing, HubSpot readiness and queue dry-run, rep feedback capture, rep alert sending, CRM delivery sending, state backup validation, guarded restore dry-run, beta-client create/update/checklist, CRM workflow and sales outcome updates, enrichment review updates, research evidence capture, company-memory correction, experiment notes, outcome snapshots, target-account import, report delivery queueing, manual sent state, due-report queueing, and dry-run queued sending.

`test/widget-install.test.js` executes the real `public/widget.js` script in a lightweight DOM harness against the real local API. It verifies that a beta-client script tag applies client-specific launcher copy, quick replies, color, consent handling, UTM attribution, routing overrides, completion UI, lead profile creation, beta-client attribution, and onboarding checklist automation.

`test/sdr-desk.test.js` verifies signal idempotency, fit scoring, dossier/sequence creation, reply-driven sequence cancellation, opt-out suppression, retry behavior, persisted restore, and reply classification. See `../../Dealthreads Outbound Engine/SDR-DESK-24-7.md` for deployment modes and webhook examples.

`test/revenue-watchdog.test.js` verifies revenue-decision generation, deterministic decision resolution, SLA and adapter-failure detection, opt-out leak detection, self-improvement rubric behavior, runtime integrity gates, and the client-ready Markdown brief. See `../../Dealthreads Outbound Engine/REVENUE-WATCHDOG-PRODUCT.md` for the product and sales model.

`test/sqlite-store.test.js` verifies the SQLite data-store adapter directly and starts the server in SQLite mode, creates beta state, restarts the server against the same `.sqlite` file, and confirms clients and leads hydrate back into the app.

## Demo Path

Open the widget and use this high-priority path:

```text
We are a 150-person SaaS company using HubSpot. Demo requests are going cold because reps research them manually. We want to fix this this quarter and likely have $30K-$50K annually.
```

Then provide:

```text
I own the decision
```

```text
jordan@exampleco.com
```

```text
Jordan Lee
```

```text
Yes, send it
```

Open the generated rep profile from the widget or visit `/crm`.

## Pilot Command Center

Open:

```text
http://localhost:4173/pilot
```

The pilot command center is the operator view for the first five beta clients. It summarizes:

- Client count against the target beta cohort.
- Live, installed, blocked, and warning client counts.
- Beta lead volume, overdue follow-up, meetings, opportunities, pipeline value, expected value, wins, and first-touch speed.
- Report due, queued, sent, failed, and email-adapter status.
- Per-client health, risks, latest report state, and next action.
- Per-client readiness blockers and whether each client is ready for live beta traffic.
- Active experiment count, latest experiment, and latest outcome snapshot.
- Snapshot trend comparisons for current vs previous beta outcomes, including pipeline and paid-provider spend.

Protected API:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/pilot/summary
curl -u admin:deal-threads-local http://localhost:4173/api/v1/pilot/snapshots
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/pilot/snapshots?format=csv"
curl -u admin:deal-threads-local http://localhost:4173/api/v1/pilot/trends
```

The default target is five clients. Override it with:

```bash
PILOT_TARGET_CLIENTS=5
```

## Beta Proof Dashboard

Open:

```text
http://localhost:4173/proof
```

The proof dashboard answers the beta go/no-go question: whether Deal Threads is beating the client's old contact form. Each beta client can store old-form baseline metrics on `/beta-clients`, including first-touch minutes, meeting rate, opportunity rate, win rate, sales-cycle days, sample-size target, and notes about the baseline source.

The dashboard compares those baselines against Deal Threads' current beta data:

- Average first-touch speed versus the old form.
- Meeting, opportunity, and win rates versus the old form.
- Pipeline, expected value, and closed-won value.
- Rep feedback reviewed, helpful, missing-context, and average usefulness score.
- Estimated manual research hours saved, using the default 20 minutes per raw form submission.
- Paid-provider spend, so the beta can stay providerless until missing data proves it changes sales outcomes.
- Per-client proof status: baseline needed, waiting for leads, collecting data, winning, mixed, or needs rework.

Protected APIs:

```bash
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/proof/summary?days=14"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/proof/summary?days=14&format=csv"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/proof/summary?days=14&format=markdown"
```

Use proof status conservatively. `winning` means there is enough baseline and beta data to turn into customer-facing proof. `collecting_data` means keep the pilot running. `needs_rework` means fix conversation flow, routing SLA, or rep handoff before adding more clients.

## Mid-Market Readiness Room

Open:

```text
http://localhost:4173/readiness
```

The readiness room is the buyer-demo control surface. It combines proof, profile usefulness, handoff controls, data governance, providerless enrichment gates, open gaps, and buyer-question answers into one protected view.

It shows:

- Buyer-readiness status and score.
- Beta proof metrics: leads, meetings, opportunities, pipeline, first-touch savings, and paid-provider spend.
- Rep feedback quality: reviewed profiles, helpful profiles, missing context, and average usefulness.
- Governance: auth, data store, backup readiness, consent policy, allowed domains, HubSpot/LLM/enrichment modes, and CRM delivery mode.
- Providerless enrichment quality gates and paid-escalation policy.
- Open gaps to clear before a mid-market buyer demo.
- Plain-English answers to common buyer questions about results, adoption, cost control, uncertainty, and handoff risk.
- A safe demo scenario control for loading and clearing marked synthetic mid-market proof data.

Protected APIs:

```bash
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/readiness/summary?days=14"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/readiness/summary?days=14&format=markdown"
```

The demo scenario seeds three clearly marked mid-market beta clients, six buyer-profile leads, sourced research evidence, rep feedback, pipeline outcomes, dry-run CRM handoffs, and sent report packets. Use it when a buyer walkthrough needs a full proof story before real beta traffic has accumulated. The scenario uses `.example` domains, tags records with `mid_market_buyer_demo`, and can be removed from the readiness room or API without clearing real beta data.

Demo scenario APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/demo-scenarios/mid-market
curl -u admin:deal-threads-local -X POST http://localhost:4173/api/v1/demo-scenarios/mid-market/seed
curl -u admin:deal-threads-local -X POST http://localhost:4173/api/v1/demo-scenarios/mid-market/clear
```

## Buyer Trust Packet

The public security center is the buyer-safe pre-install version:

```text
http://localhost:4173/security
```

It summarizes data categories, processor posture, access/privacy controls, runtime hardening, providerless enrichment gates, install boundaries, and default external-transmission posture without exposing operator forms, protected exports, tenant deletion controls, or real CRM profiles.

The public pilot approval room is the single forwardable hub for the buying committee:

```text
http://localhost:4173/pilot-approval-room
```

It routes executive sponsors, RevOps, website owners, CRM owners, security/legal/procurement, and sales reps to the exact packet they need before the beta install. It includes the approval checklist, launch sequence, default providerless/dry-run posture, approval routing checklist, approval claim audit, and buyer-safe links without exposing operator forms, CRM profiles, tenant exports, signature capture, payment collection, buyer-state mutation, protected links, or external transmission. Every JSON and Markdown export locks the room to buying-committee-routing-only, blocks signed-order, binding-acceptance, install-approved, live-proof, market-ready, customer-ROI, and guaranteed-lift claims, and requires stakeholder-owner alignment, buyer confirmation, tokenized acceptance or equivalent buyer-approved order, pilot proof, and protected market-gate clearance before stronger approval or outcome claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/pilot-approval-room
curl "http://localhost:4173/api/v1/pilot-approval-room?format=markdown"
```

The public pilot launch hub is the buyer-facing start page for the 14-day beta:

```text
http://localhost:4173/pilot-launch
```

It routes revenue leaders, RevOps/CRM owners, website implementation owners, security/procurement, and sales managers to the right buyer-safe asset, then lays out the launch sequence, proof gates, offer snapshot, providerless cost controls, launch readiness checklist, and pilot launch claim audit. It is read-only and does not expose operator forms, CRM profiles, tenant exports, buyer-state mutation, external transmission, email sending, paid enrichment, protected links, live-results claims, market-ready claims, customer-ROI claims, or guaranteed-lift claims. Every JSON and Markdown export locks the hub to buyer-safe launch routing only and requires buyer confirmation, signed pilot terms, client-domain install proof, first beta profile, rep feedback, and protected market-gate clearance before stronger proof or launch claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/pilot-launch
curl "http://localhost:4173/api/v1/pilot-launch?format=markdown"
```

The public AI-powered lead enrichment webinar is the buyer education walkthrough for the first conversation:

```text
http://localhost:4173/webinar
```

It presents the 30-minute agenda, demo flow, audience fit, qualification prompts, follow-up CTAs, proof disclosures, webinar follow-up checklist, and webinar claim audit without exposing operator forms, CRM profiles, tenant exports, buyer-state mutation, beta-client creation, outbound sending, paid lookup, protected links, live-result claims, market-ready claims, customer-ROI claims, or guaranteed-lift claims. Every JSON and Markdown export locks the webinar to buyer education and manual follow-up only, and requires buyer context, buyer confirmation, signed pilot terms, client-domain install proof, first beta profile, rep feedback, and protected market-gate clearance before stronger proof or outcome claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/webinar
curl "http://localhost:4173/api/v1/webinar?format=markdown"
```

The public first-five beta invite is the buyer-safe cohort page for qualified mid-market prospects:

```text
http://localhost:4173/first-five-beta
```

It presents cohort slot metrics, offer snapshot, fit criteria, pilot scope, proof sequence, buyer CTAs, cohort forwarding checklist, and first-five claim audit without exposing operator forms, CRM profiles, tenant exports, target-account names, protected links, buyer-state mutation, beta-client creation, outbound sending, paid lookup, live-result claims, market-ready claims, customer-ROI claims, or guaranteed-lift claims. Every JSON and Markdown export locks the invite to beta-invite-only use, blocks treating beta slots as live customer proof, and requires buyer fit confirmation, buyer confirmation, signed pilot terms, client-domain install proof, first beta profile, CRM handoff proof, rep feedback, and protected market-gate clearance before stronger proof or outcome claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/first-five-beta
curl "http://localhost:4173/api/v1/first-five-beta?format=markdown"
```

The public pilot close kit is the forwardable buyer packet for moving from interest to a scoped 14-day beta:

```text
http://localhost:4173/pilot-close-kit
```

It summarizes the pilot offer, proof plan, buyer questions, current launch posture, buyer forwarding checklist, and close-kit claim audit without exposing operator forms, CRM profiles, tenant exports, buyer-state mutation, outbound sending, paid lookup, or protected links. Every JSON and Markdown export locks the packet to pilot-planning-only use, blocks market-ready, live-result, customer-ROI, and guaranteed-lift claims, and requires buyer confirmation, signed pilot terms, client-domain install proof, first beta profile, CRM handoff proof, rep feedback, and protected market-gate clearance before stronger proof claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/pilot-close-kit
curl "http://localhost:4173/api/v1/pilot-close-kit?format=markdown"
```

The public mutual action plan is the 14-day timeline from approval to proof review:

```text
http://localhost:4173/mutual-action-plan
```

It shows the executive sponsor, RevOps owner, website owner, CRM owner, and sales rep what happens on Day 0 through Day 14: approval, buyer inputs, install prep, source check, CRM handoff, first test profile, live buyer traffic, rep feedback, proof review, and go/no-go decision. It includes an execution checklist and MAP claim audit, stays buyer-safe, and avoids operator forms, CRM profiles, tenant exports, signature capture, payment collection, protected links, buyer-state mutation, and external transmission. Every JSON and Markdown export locks the plan to pilot-timeline-planning-only, blocks signed-order, binding-acceptance, completed-milestone, live-proof, market-ready, customer-ROI, and guaranteed-lift claims, and requires buyer confirmation, tokenized acceptance or equivalent buyer-approved order, client-domain install proof, first real beta profile, CRM handoff proof, rep feedback, proof review, and protected market-gate clearance before stronger timeline or outcome claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/mutual-action-plan
curl "http://localhost:4173/api/v1/mutual-action-plan?format=markdown"
```

The public business case calculator is the budget-facing planning model:

```text
http://localhost:4173/business-case
```

It lets RevOps, sales leadership, and finance adjust monthly qualified leads, average contract value, modeled close-rate lift, research minutes saved, blended hourly cost, monthly price, and setup fee. The output shows monthly research savings, modeled incremental revenue, service cost, payback, annual net after service, model sensitivity, and the pilot proof targets that must be verified before making customer-specific ROI claims. Every JSON and Markdown export includes an ROI claim audit that locks the calculator to modeled planning only and blocks guaranteed ROI, customer ROI, live-result, conversion-lift, or market-ready claims until buyer pilot proof and the protected market gate clear.

Public exports:

```bash
curl http://localhost:4173/api/v1/business-case
curl "http://localhost:4173/api/v1/business-case?monthlyLeads=80&dealValue=15000&closeLift=3"
curl "http://localhost:4173/api/v1/business-case?format=markdown"
```

The public implementation guide is the website/RevOps owner handoff:

```text
http://localhost:4173/implementation-guide
```

It explains the one-page script-tag install path, prerequisites, stakeholder responsibilities, hosted widget-load test, source-check QA, beta-attributed test profile, synthetic CRM webhook test, rep-feedback loop, rollback plan, and default dry-run/providerless data posture. The real install snippet remains tokenized and client-specific after buyer confirmation or activation kickoff.

Public exports:

```bash
curl http://localhost:4173/api/v1/implementation-guide
curl "http://localhost:4173/api/v1/implementation-guide?format=markdown"
```

The public CRM handoff guide is the CRM-owner approval packet:

```text
http://localhost:4173/crm-handoff-guide
```

It explains the manual export, dry-run delivery queue, synthetic webhook test, webhook delivery, and HubSpot preview/sandbox paths. The guide covers CRM-owner prerequisites, field groups, synthetic test acceptance, live go gates, and rollback so buyers can approve the handoff model before real buyer-profile data is transmitted.

Public exports:

```bash
curl http://localhost:4173/api/v1/crm-handoff-guide
curl "http://localhost:4173/api/v1/crm-handoff-guide?format=markdown"
```

The public procurement packet is the buyer-forwardable version for RevOps, security, legal, and implementation stakeholders:

```text
http://localhost:4173/procurement-packet
```

It packages the 14-day pilot scope, commercial terms, success criteria, approval checklist, default providerless enrichment posture, dry-run/manual external transmission posture, processor modes, controls, and public links. It deliberately excludes operator forms, protected CRM profiles, tenant export/delete controls, admin URLs, and buyer-state mutation.

Public exports:

```bash
curl http://localhost:4173/api/v1/procurement-packet
curl "http://localhost:4173/api/v1/procurement-packet?format=markdown"
```

Open:

```text
http://localhost:4173/trust
```

The trust packet is the procurement-facing companion to the readiness room. It lists the data categories Deal Threads collects, how data flows through the widget and operator workflow, which processors are active or dry-run, which production-hardening checks pass, which controls pass, and which disclosures still need to be handled before a production procurement review. Both the chat path and fallback form require the widget consent disclosure before a lead profile can be created.

It also includes tenant data controls. Operators can export a beta client's scoped data package, preview deletion counts, or apply a guarded delete with the exact confirmation phrase `DELETE DEAL THREADS TENANT DATA`. The delete path removes beta client records, attributed leads, conversations, sessions, company memory, reports, alerts, CRM deliveries, allowed domains, and related audit events for that tenant scope.

The hardening section covers response security headers, the `MAX_REQUEST_BODY_BYTES` payload cap, invalid JSON handling, widget origin enforcement across public widget endpoints, operator authentication, production admin-secret configuration, data-store posture, and whether any live external adapter can transmit customer data.

Protected APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/trust/packet
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/trust/packet?format=markdown"
curl -u admin:deal-threads-local http://localhost:4173/api/v1/trust/hardening
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/trust/tenant-data/summary?betaClientId=BETA_CLIENT_ID"
curl -u admin:deal-threads-local -o tenant-data.json "http://localhost:4173/api/v1/trust/tenant-data/export?betaClientId=BETA_CLIENT_ID"
curl -u admin:deal-threads-local -X POST http://localhost:4173/api/v1/trust/tenant-data/delete \
  -H "Content-Type: application/json" \
  -d '{"betaClientId":"BETA_CLIENT_ID"}'
curl -u admin:deal-threads-local -X POST http://localhost:4173/api/v1/trust/tenant-data/delete \
  -H "Content-Type: application/json" \
  -d '{"betaClientId":"BETA_CLIENT_ID","applyDelete":true,"dryRun":false,"confirmation":"DELETE DEAL THREADS TENANT DATA"}'
```

## Beta Launch Readiness

Open `/admin` before a beta install or demo and check the Beta launch readiness panel. It combines runtime, backup, beta-client, test-lead, rep alert handoff, CRM, enrichment, reporting, and extraction checks into one status: `ready`, `needs_attention`, or `blocked`.

Protected API:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/admin/beta-readiness
```

Treat blockers as launch-stopping. Warnings are acceptable for early beta only when the operator has an explicit manual workaround, such as dry-run report delivery or HubSpot sandbox sync.

## First Beta Launch

Open:

```text
http://localhost:4173/launch
```

The launch cockpit guides the first private beta setup:

- Create or select a beta client.
- Use the launch wizard to move through setup, packet, install, test-lead, CRM-proof, and live-ready phases.
- Copy the generated launch packet with the install snippet, email draft, test-install URL, and acceptance checks.
- Send or dry-run the launch packet through the report email adapter, which records recipients and marks the snippet handoff complete.
- Optionally mark the snippet sent manually if the handoff happened outside Deal Threads.
- Open a test-install page that loads the real widget script with the selected beta client ID.
- Create a launch test lead that flows through enrichment, scoring, routing, generic CRM delivery, HubSpot preview, and checklist automation.
- Re-check the same readiness gate used by `/admin`.

Protected API:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/first-beta
curl -u admin:deal-threads-local http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/launch-packet
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/launch-packet?format=markdown"
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"recipients":"owner@example.com,implementer@example.com"}' \
  http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/launch-packet/send
```

## Rep Workflow

Every lead profile includes a lightweight sales workflow:

- Stage: `new`, `contacted`, `meeting_booked`, `closed_won`, `closed_lost`, `nurture`, or `disqualified`.
- Owner email from the routing rule.
- SLA due time based on priority: 15 minutes for high, 4 hours for medium, 2 days for low.
- Next action from the routing rule.
- Rep notes and activity history.
- Automatic rep alert queueing for high and medium priority owned leads.
- Sales outcome: `unworked`, `contacted`, `meeting_booked`, `opportunity_created`, `closed_won`, `closed_lost`, `disqualified`, or `nurture`.
- Deal value, probability, first-contact time, meeting-booked time, opportunity-created time, closed time, and outcome notes.

The CRM detail page at `/crm/:leadId` has a rep-ready brief, rep feedback form, workflow form, sales outcome form, rep alert panel, and generic CRM delivery panel. In default dry-run mode, sending an alert or CRM delivery records the outbound handoff without transmitting external email or CRM data. Set `REPORT_EMAIL_MODE=webhook` and `REPORT_EMAIL_WEBHOOK_URL` when a beta client is ready for live alert delivery.

## Rep-Ready Briefs

Each CRM profile derives a current rep-ready brief from the lead, enrichment, workflow, outcome, routing, and beta-client context. It includes:

- Executive summary and priority/owner/SLA context.
- Opening angle, call plan, discovery questions, and copyable email/voicemail/internal note blocks.
- Buying committee, buying triggers, research evidence, enrichment confidence, and quality flags.
- JSON and Markdown exports for CRM notes, Slack, email, or manual handoff.

The same brief is embedded in the generic CRM delivery payload and attached to rep alerts as Markdown, so the rep and the CRM receive the same source of truth.

## Rep Feedback Loop

After a rep reviews or uses a profile, capture whether the brief was helpful, missing context, not helpful, or needs rework. The feedback form records a 0-5 usefulness score, rep confidence, whether the profile was used on the first call, missing context fields, and a note. Missing fields include company size, buying committee, budget, timeline, tech stack, CRM, authority, pain, source evidence, and other.

This creates the beta learning loop: do not buy a paid enrichment provider just because a field is nice to have. Buy or build a data source only after reps show the missing field changes follow-up quality or conversion.

Rep feedback appears in:

- `/crm/:leadId`, including feedback history and missing-field labels.
- Lead CSV exports.
- Global and per-client beta reports.
- `/proof`, including reviewed count, helpful count, missing-context count, and average usefulness score.
- Recommended actions when missing context or rework shows the conversation flow needs tuning.

Protected feedback API:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"status":"missing_context","usefulnessScore":3.5,"repConfidence":"medium","usedOnCall":true,"missingFields":["budget","source_evidence"],"missingContextNote":"Rep needed budget owner and source evidence before calling."}' \
  http://localhost:4173/api/v1/leads/LEAD_ID/rep-feedback
```

Protected brief APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/leads/LEAD_ID/rep-brief
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/leads/LEAD_ID/rep-brief?format=markdown"
```

Protected workflow update:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"stage":"meeting_booked","outcomeStatus":"opportunity_created","outcomeValue":45000,"outcomeProbability":40,"note":"Meeting booked and opportunity created."}' \
  http://localhost:4173/api/v1/leads/LEAD_ID/workflow
```

Protected rep alert APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/rep-alerts
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"recipients":"ae@example.com"}' \
  http://localhost:4173/api/v1/leads/LEAD_ID/rep-alert/send
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"limit":25}' \
  http://localhost:4173/api/v1/rep-alerts/send-queued
```

## Generic CRM Delivery

Generic CRM delivery is the default low-cost beta handoff. Every beta-attributed lead queues a buyer-profile payload that includes contact, company, qualification, score, routing, workflow, outcome, buyer committee, buying triggers, rep-ready brief, and the rep profile URL. In dry-run mode, Deal Threads records the delivery and send attempt without posting to any external system.

Use this before paying for enrichment providers or building native CRM integrations. For early beta clients, the payload can be copied manually, sent to a Zapier/Make/n8n webhook later, or used as the contract for a future native adapter.

Operators can:

- Configure a per-client destination name, owner, notes, and optional webhook URL on `/beta-clients`.
- Send a synthetic CRM webhook test from `/beta-clients` before any real buyer profile is transmitted.
- Send or resend a lead's generic CRM delivery from `/crm/:leadId`.
- Run queued deliveries in bulk from `/admin`.
- See queued, sent, failed, and skipped delivery counts in the beta readiness gate and state backup.

Protected CRM delivery APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/crm-deliveries
curl -u admin:deal-threads-local http://localhost:4173/api/v1/crm-deliveries/CRM_DELIVERY_ID
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"note":"Dry-run sent to the pilot CRM."}' \
  http://localhost:4173/api/v1/leads/LEAD_ID/crm-delivery/send
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"limit":25}' \
  http://localhost:4173/api/v1/crm-deliveries/send-queued
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"forceResend":true}' \
  http://localhost:4173/api/v1/crm-deliveries/CRM_DELIVERY_ID/send
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"webhookUrl":"https://hooks.example.com/deal-threads/crm-profile","note":"Synthetic webhook test before live buyer data."}' \
  http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/crm-delivery/test
```

Default CRM delivery is intentionally no-cost and no-transmission:

```bash
CRM_DELIVERY_MODE=dry_run
```

To post buyer-profile payloads to a real workflow, configure webhook mode:

```bash
CRM_DELIVERY_MODE=webhook
CRM_DELIVERY_WEBHOOK_URL=https://example.com/deal-threads/crm-profile
CRM_DELIVERY_WEBHOOK_TOKEN=optional-bearer-token
```

Webhook mode posts real buyer profiles with `type: deal_threads.crm_profile`. The synthetic beta-client test posts `type: deal_threads.crm_webhook_test`, includes `test.no_real_buyer_data: true`, and uses `x-deal-threads-event`, `x-deal-threads-beta-client-id`, and `x-deal-threads-synthetic` headers so the receiving workflow can safely branch test traffic away from production CRM imports.

The CRM inbox at `/crm` supports filters:

```text
/crm?stage=contacted&priority=high&sla=overdue&owner=ae@example.com
```

Protected lead list, analytics, and enrichment APIs:

```bash
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/leads?stage=contacted&sla=overdue"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/leads/export.csv?stage=contacted&sla=overdue"
curl -u admin:deal-threads-local http://localhost:4173/api/v1/analytics/summary
curl -u admin:deal-threads-local http://localhost:4173/api/v1/enrichment/summary
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"companyName":"Acme Revenue OS","website":"https://example.com","businessNeed":"Preflight this target before the beta install.","crm":"HubSpot","saveMemory":true}' \
  http://localhost:4173/api/v1/enrichment/preflight
```

## Company Enrichment Memory

Deal Threads is internal-first by default. Each lead with a company domain creates or updates company memory, and operator corrections make that memory reusable for future leads from the same domain.

The CRM detail page also includes a Research evidence panel. Use it to save public or manual findings before approving paid enrichment. Evidence supports categories such as company size, industry, tech stack, buying committee, buying trigger, funding/growth, ICP signal, risk, competitor context, and general notes. Each finding can include a source URL, source label, confidence score, operator note, and reusable-memory flag.

The enrichment page can also run a providerless account preflight before an install or target-account import. It inspects public website signals, blocks private-network fetch targets, reports paid spend as zero, and only saves company memory when the operator explicitly checks the save-memory option.

The enrichment page can also import a target-account CSV before outreach. Supported headers include:

```csv
company_name,domain,industry,company_size,tech_stack,signals,notes
Acme Revenue OS,acme.com,B2B SaaS,101-250,"HubSpot; Segment","Funding; ICP fit",Tier 1 account
```

The CRM detail page includes a Company memory panel where an operator can correct:

- Company name.
- Website.
- Industry.
- Company size.
- Confirmed tech stack.
- Confirmed fit signals.
- Reusable research evidence from sourced findings.

Once a memory record has confirmed fields or enough confidence, the next matching lead uses `internal_memory_cache` instead of crawling the website again or calling a paid provider.

The `/enrichment` page shows a research evidence workspace with category counts and recent evidence across the beta cohort. The memory table can be filtered by imported, corrected, cache-hit, low-confidence, reusable, and no-lead records. The Memory CSV export respects the active segment and search filters and includes research evidence counts/latest source.

Protected memory APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/enrichment/memory
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/enrichment/memory?segment=imported&q=hubspot"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/enrichment/memory?segment=cache_hit&format=csv"
curl -u admin:deal-threads-local http://localhost:4173/api/v1/enrichment/memory/acme.com
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"csv":"company_name,domain,industry,company_size,tech_stack,signals\nAcme Revenue OS,acme.com,B2B SaaS,101-250,\"HubSpot; Segment\",ICP fit"}' \
  http://localhost:4173/api/v1/enrichment/memory/import
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"industry":"B2B SaaS","companySize":"101-250","techStack":"HubSpot, Segment","signals":"Manual ICP fit confirmed"}' \
  http://localhost:4173/api/v1/leads/LEAD_ID/company-memory
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"category":"buying_committee","value":"VP Revenue Operations owns inbound routing.","sourceUrl":"https://example.com/team","confidence":88,"reusable":true,"markReviewed":true}' \
  http://localhost:4173/api/v1/leads/LEAD_ID/research-evidence
```

## Beta Client Onboarding

Open:

```text
http://localhost:4173/beta-clients
```

The beta-client dashboard lets an operator:

- Create and update pilot client records.
- Customize launcher text, welcome message, quick replies, required fields, primary color, and priority routing for each client.
- Tune the conversation playbook per client with supported keys: `business_need`, `company_name_or_domain`, `authority`, `timeline`, `budget`, `crm`, `email`, and `name`.
- Auto-add each client domain to the widget allowed-domain list.
- Copy the script tag for that client.
- Verify install activity from real widget config loads, including last page, origin, load count, and session count.
- Configure generic CRM delivery destination, owner, notes, and optional webhook URL.
- Configure report recipients, cadence, reporting window, and next due date.
- Track the onboarding checklist from setup through first report.
- See per-client readiness status, blockers, warnings, and next actions.
- Distinguish clients that are ready to receive a snippet from clients that are ready for live beta traffic.
- Follow a per-client launch wizard from setup through CRM handoff proof.
- See linked lead count and high-priority lead count by client.
- Open per-client beta reports and export client-specific CSV or Markdown summaries.
- Track generic CRM deliveries for linked leads.
- Queue a client report delivery packet and track the latest delivery status.
- Add experiment hypotheses with owner, metric, status, and notes.
- Capture weekly outcome snapshots from the per-client report metrics.

The install snippet includes a beta client ID:

```html
<script async src="http://localhost:4173/widget.js" data-widget-id="wid_deal_threads_demo" data-tenant-id="ten_deal_threads_demo" data-beta-client-id="beta_CLIENT_ID"></script>
```

When the widget loads with `data-beta-client-id`, it requests a merged client-specific config from `/api/v1/widgets/:id/config?betaClientId=...` and records install evidence. Runtime authorization is beta-client matched: the request must come from the Deal Threads hosted/test host or the configured beta-client domain, so another globally allowed buyer domain cannot load the wrong client's config. A Deal Threads-hosted load test proves config delivery, but `Widget installed` only auto-completes when the buyer's own target page/domain loads the widget config. The beta-client card shows total config-load count, hosted/test load count, client-domain load count, session-start count, last load time, last session time, origin, and page URL. When a lead profile is created from that session, Deal Threads marks `Test lead created`, links the lead back to the client, and uses that client's routing overrides when present.

Implementation owners can submit their tested page URL from the tokenized `/install/:token` page, watch buyer-safe install proof from `/install/:token/status`, and use `/install/:token/test` to run a Deal Threads-hosted widget load test without admin access. The hosted test loads the real script with the beta client ID and helps isolate Deal Threads config delivery before debugging the buyer's page, but hosted/test config loads are tracked separately from client-domain config loads. Final live install proof and live-proof export readiness require the buyer's own target page/domain to load the widget config. The protected per-client install proof workbench at `/launch/install-queue/:betaClientId/workbench` gives operators the copy blocks and proof checklist to move website, CRM, sales, and proof stakeholders through that sequence. The public status endpoint returns counts, timestamps, source-check state, feedback totals, and next actions only; it does not expose lead IDs, CRM profiles, reports, operator actions, tenant exports, or live CRM controls. Customer reps can score captured buyer profiles from the tokenized `/feedback/:token` room without admin access; each captured profile also links to a tokenized `/handoff/:token/:leadId` rep handoff packet and Markdown export with the first-touch summary, call plan, discovery questions, copy blocks, and providerless evidence for manual CRM copy/paste. CRM owners can download `/handoff/:token/crm-export.csv`, `/handoff/:token/crm-export.md`, or `/handoff/:token/crm-export.json` to import captured profiles and public handoff URLs into HubSpot, Salesforce, Pipedrive, Zapier, or Make before native sync is connected. Buyer stakeholders can open `/handoff/:token/proof` for a tokenized beta proof report with install proof, profile volume, first-touch comparisons, rep feedback, providerless enrichment metrics, Markdown export, and JSON export. Those submissions update the same rep feedback metrics used by `/proof`, beta reports, and providerless enrichment decisions. Operators can run the protected install source check from `/launch`, `/beta-clients`, or `POST /api/v1/beta-clients/:id/install-verification`; it verifies the page source contains `/widget.js`, the widget ID, tenant ID, and matching beta client ID. Set `INSTALL_AUTO_SOURCE_CHECK_ON_HANDOFF=true` to run that same domain-safe source check immediately after a public install handoff submission. Hosted load proof is not a substitute for source-checking the client's actual target page before live traffic.

Each beta client has a readiness object with setup, launch, handoff, and measurement checks. `ready_to_send_snippet` means profile, allowlist, widget config, routing, reporting, and CRM delivery setup have no blockers. `ready_for_live_beta` means the widget install, test lead, and CRM delivery proof are passing. Rep feedback collection is tracked as a measurement warning until at least one worked profile is scored.

The launch wizard packages those checks into the practical operator sequence: client setup, launch packet, hosted/client install verification, test lead, CRM handoff proof, and live-ready decision. It appears on `/beta-clients` and `/launch?client=BETA_CLIENT_ID`, and is also available as JSON.

Use the public `/pilot-intake` page when a mid-market buyer is ready to request a private beta pilot. The form supports query-string prefill from `/outreach`, requires explicit consent, captures company, CRM, target page, handoff owners, reporting recipients, and old-form baseline, then creates a protected lead profile with `source.pilot_intake=true`. Successful form submissions redirect the buyer to their tokenized `/confirm/:token/status?intake=1` room so they can see what is complete, open the confirmation form, or forward the request kit without admin access. The JSON API response also includes `public_handoff`, `public_next_action`, and `public_next_steps` with buyer-safe public links only. It does not expose CRM profiles or operator actions publicly.

Use the public `/pilot-agreement` page when a buyer needs the beta order packet before approving the install. It defines the 14-day scope, $500 setup fee, $2,500/month managed pilot, optional $5,000/month premium expansion, buyer responsibilities, Deal Threads responsibilities, success criteria, providerless enrichment posture, commercial-review steps, claim-audit evidence, and exclusions. The page, `/api/v1/pilot-agreement`, and `/api/v1/pilot-agreement?format=markdown` are public buyer-safe surfaces; they do not expose CRM profiles, operator forms, protected exports, signature capture, payment collection, buyer-state mutation, or protected links. Every JSON and Markdown export locks the packet to commercial-review-only, blocks signed-order, payment-page, binding-acceptance, live-proof, market-ready, customer-ROI, and guaranteed-lift claims, and requires buyer owner confirmation, tokenized acceptance or an equivalent buyer-approved order process, pilot proof, and protected market-gate clearance before stronger commercial or outcome claims are used.

```bash
curl http://localhost:4173/api/v1/pilot-agreement
curl "http://localhost:4173/api/v1/pilot-agreement?format=markdown"
```

```bash
curl -H "content-type: application/json" \
  -d '{"contactName":"Dana Vale","contactEmail":"dana@acme.com","companyName":"Acme Revenue","websiteUrl":"https://acme.com","companySize":"180 employees","crm":"hubspot","targetPageUrl":"https://acme.com/demo","businessNeed":"Demo requests go cold while reps manually research budget, timeline, and CRM fit.","timeline":"this_month","budgetStatus":"likely","budgetRange":"30k_60k","authority":"decision_owner","implementationOwnerEmail":"web@acme.com","routingOwnerEmail":"ae@acme.com","reportRecipients":"revops@acme.com,ae@acme.com","baselineFirstTouchMinutes":45,"consentAccepted":true}' \
  http://localhost:4173/api/v1/pilot-intake
```

Qualified pilot-intake leads appear in `/activation` as real beta activation prospects. If the request includes enough target-page, owner, and recipient detail, the prospect close workflow is prefilled as buyer-confirmed so beta-client conversion can reuse those defaults.

Use `/activation` when moving from demo proof to real beta onboarding. The protected real-beta cockpit excludes synthetic demo clients, surfaces qualified CRM prospects that can be converted into beta client records, generates prospect close packets and confirmation nudges before conversion, keeps operators in the same cockpit through prospect conversion and launch handoff actions, tracks handoff/source-check/config-load/live-lead readiness, and mirrors the live-proof export gate so operators know exactly what still blocks buyer-facing proof. The same summary is available at `/api/v1/activation/real-beta`.

Each activation prospect has a protected runbook that shows the current operator action, close-packet/nudge/confirmation/kickoff checklist, missing buyer-confirmation details, recommended beta-client defaults, buyer-safe links, protected operator endpoints, and providerless enrichment posture without sending email, creating a beta client, or claiming live proof on `GET`:

```bash
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/runbook"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/runbook?format=markdown"
```

Each activation prospect has a protected close packet:

```bash
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/close-packet?format=markdown"
```

The packet includes a ready email draft, pilot close kit link, pilot approval room link, mutual action plan link, buyer confirmation guide link, stakeholder forwarding kit link, pilot agreement link, tokenized buyer confirmation form, tokenized buyer confirmation status room, tokenized buyer confirmation request kit, tokenized pilot acceptance room, security center link, sample profile link, buyer confirmation checklist, recommended beta-client defaults, and operator next steps before converting the lead into a beta client.

Operators can send the close packet through the protected email adapter before conversion. Dry-run is the default, so no external email is transmitted unless `REPORT_EMAIL_MODE=webhook` and `REPORT_EMAIL_WEBHOOK_URL` are configured:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"recipients":"buyer@acme.com"}' \
  http://localhost:4173/api/v1/activation/prospects/LEAD_ID/close-packet/send
```

The send result is recorded in `close_workflow.close_packet_delivery` with recipients, subject, send attempts, adapter mode, provider message ID, and last error. `/activation` also has a form to send the close packet or mark it sent manually.

If the close packet is sent but the buyer has not submitted `/confirm/:token`, use the protected confirmation nudge packet. It restates the exact confirmation action, includes the status room, request kit, pilot acceptance room, buyer confirmation guide, stakeholder forwarding kit, mutual action plan, implementation guide, CRM handoff guide, and security center, and records delivery attempts separately in `close_workflow.confirmation_nudge_delivery` without marking buyer confirmation complete:

```bash
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/confirmation-nudge?format=markdown"

curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"recipients":"buyer@acme.com,revops@acme.com"}' \
  http://localhost:4173/api/v1/activation/prospects/LEAD_ID/confirmation-nudge/send

curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"recipients":"buyer@acme.com,revops@acme.com","note":"Sent manually from the operator mailbox."}' \
  http://localhost:4173/api/v1/activation/prospects/LEAD_ID/confirmation-nudge/sent
```

Use `/confirmation-nudge/sent` only after the operator sends or pastes the `mailto:` draft from their own email client. It records `sent_via: manual` in `close_workflow.confirmation_nudge_delivery` with a manual send attempt and does not send external email from the server.

The buyer confirmation link uses `/confirm/:token`, a public buyer-safe page that collects the target page, implementation owner, CRM owner, routing owner, report recipients, and old-form baseline without exposing protected CRM profiles, operator actions, reports, exports, or live CRM controls. The form shows a completion checklist, missing required details, owner actions, status/request-kit/acceptance links, and browser-required fields for the target page, implementation owner email, CRM owner email, routing owner email, and proof recipients. Buyers can also choose `Save progress without confirming`; that stores partial target-page/owner/baseline details in the tokenized close workflow as `collecting_details`, redirects to `/confirm/:token/status?saved=1`, and does not send email, create beta clients, transmit CRM data, run paid enrichment, or mark buyer confirmation complete. The saved-progress status room shows a saved-progress plan with captured required fields, details still blocking kickoff, a finish-confirmation link, request-kit link, copy-ready internal reply, and one-click `mailto:` finish draft so the buyer champion can keep gathering owner details without restarting the form. Each token also has `/confirm/:token/status`, a read-only buyer status room that shows missing required details, current confirmation state, pilot acceptance state, next action, a buying-committee brief, owner actions, providerless/CRM/live-proof risk controls, forwardable summary, buyer-safe support links, JSON export via `?format=json`, and Markdown export via `?format=markdown`. Each token also has `/confirm/:token/request-kit`, a read-only buyer request kit that turns missing confirmation details into forwardable asks, one-click `mailto:` drafts, and a champion reply template for website/implementation, CRM/RevOps, sales routing, and proof/report stakeholders, with JSON and Markdown variants. Each token also has `/confirm/:token/acceptance`, a buyer-safe pilot acceptance room that records signer, billing contact, setup-fee status, manual invoice/PO intent, and a Markdown receipt in `close_workflow.pilot_acceptance`; `GET` is read-only and `POST` does not process payment, send email, create beta clients, mutate CRM, run paid enrichment, or claim live proof. Valid confirmation submissions update the same prospect close workflow used by `/activation`, reject target pages outside the prospect's domain, and record a `buyer_confirmation_delivery` receipt/activation alert through the email adapter. In dry-run mode this is only an audit record; with `REPORT_EMAIL_MODE=webhook`, it can notify `ACTIVATION_NOTIFICATION_RECIPIENTS` plus the confirmed handoff owners and proof recipients.

Use `/buyer-confirmation-guide` before or alongside the tokenized form when a buyer asks what details they need to gather. It is public and buyer-safe; it explains the target page, implementation owner, CRM owner, routing owner, proof recipients, baseline examples, and what happens after confirmation with a confirmation prework checklist and guide claim audit. It does not expose a buyer-specific confirmation token, submit confirmation, create a beta client, send email, mutate buyer state, transmit CRM data, run paid enrichment, or expose protected links. Every JSON and Markdown export locks the guide to confirmation-prework-only, blocks tokenized-form, submitted-confirmation, install-approved, live-proof, market-ready, customer-ROI, and guaranteed-lift claims, and requires the tokenized confirmation form, buyer confirmation, pilot acceptance/order approval, install proof, first beta profile, CRM handoff proof, rep feedback, and protected market-gate clearance before stronger confirmation or outcome claims are used.

Use `/stakeholder-forwarding-kit` when the champion needs short internal notes to forward before the confirmation form. It gives executive, RevOps, website, CRM, security/procurement, and sales stakeholders their specific ask, proof point, owner, and risk-control note with a stakeholder forwarding checklist and forwarding claim audit. The kit is manual-forwarding-only and draft-copy-only: it does not expose a buyer-specific token, send email, submit confirmation, create a beta client, mutate buyer state, transmit CRM data, run paid enrichment, expose protected links, or claim live proof, market readiness, customer ROI, or guaranteed lift. Every JSON and Markdown export requires the tokenized confirmation form, buyer confirmation, pilot acceptance/order approval, install proof, first beta profile, CRM handoff proof, rep feedback, and protected market-gate clearance before stronger forwarding, install, or outcome claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/stakeholder-forwarding-kit
curl "http://localhost:4173/api/v1/stakeholder-forwarding-kit?format=markdown"
```

Use `/pricing` when a buyer asks how the pilot turns into a paid service. It lays out the free education offer, $500 private beta setup, $2,500/month managed service, $1,000/month intelligence reports add-on, $5,000/month premium ICP campaigns, buyer fit, proof gates, cost controls, commercial terms checklist, and pricing claim audit without exposing operator forms, CRM profiles, tenant exports, buyer-state mutation, payment collection, paid lookup, or external transmission. Every JSON and Markdown export locks the page to budgetary offer-ladder review, blocks signed-order, guaranteed-payback, guaranteed-ROI, live-result, and market-ready claims, and requires the pilot agreement, buyer scope confirmation, paid-enrichment approval, pilot proof, and protected market-gate clearance before stronger commercial or outcome claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/pricing
curl "http://localhost:4173/api/v1/pricing?format=markdown"
```

Use `/sales-enablement` when preparing outreach to the first five beta buyers. It includes mid-market target segments, qualification filters, outbound email copy, LinkedIn copy, discovery questions, objection responses, demo talk track, success definition, forwarding checklist, sales copy audit, and public support links without exposing operator forms, CRM profiles, tenant exports, buyer-state mutation, outbound sending, automation, or external transmission. Every JSON and Markdown export locks the packet to manually reviewed draft copy, blocks guaranteed-lift, customer-ROI, live-result, and market-ready claims, requires public links only, and requires human review, buyer fit, pilot proof, and protected market-gate clearance before stronger result claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/sales-enablement
curl "http://localhost:4173/api/v1/sales-enablement?format=markdown"
```

Use protected `/outreach` when working the first five beta pipeline from imported target-account memory. It rolls up the target cohort, remaining beta slots, qualified activation prospects, imported target accounts, account-specific email and LinkedIn openers, buyer-safe public links, and prefilled `/pilot-intake` URLs. GET requests are read-only: they do not send email, create beta clients, mutate buyer state, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/outreach/first-five
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/outreach/first-five?format=markdown"
```

Use protected `/activation/follow-ups` when working the activation queue after prospects receive close materials. It ranks each qualified activation prospect as close-packet-needed, nudge-due, overdue-confirmation, waiting-on-buyer, or ready-for-kickoff, then exposes the next operator action, delivery audit, missing confirmation details, runbook/packet links, buyer confirmation link, and kickoff defaults. GET requests are read-only: they do not send email, create beta clients, mutate buyer state, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/follow-ups
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/follow-ups?format=markdown"
```

Use protected `/activation/outbox` when the active blocker is a buyer follow-up that must be sent or pasted before confirmation can move forward. It narrows the close desk to sendable close packets and confirmation nudges, shows recipients, subject/body, manual `mailto:` draft handoff, delivery audit, buyer-safe status/request links, exact send POST previews, and manual sent recorder POST previews. GET requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment; send and manual-record actions require explicit POST.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/outbox
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/outbox?format=markdown"
```

Use protected `/activation/close-desk` when batching the next activation action across all qualified prospects. It groups close-packet-ready, confirmation-nudge, manual-confirmation, and kickoff-ready prospects, adds a first-five close-packet campaign plan with the top send batch, and adds a buyer-confirmation chase campaign for sent close packets that now need nudges, status-room review, request-kit forwarding, or reply parsing. Both campaign plans include `mailto:` drafts, send POST previews, POST-only manual sent recorders, market-gate effect, and operator checklists. The desk shows the recommended packet body per prospect, links to buyer-safe confirmation/status/request-kit rooms, and keeps paid lookup recommendations at zero by default. GET requests do not send email, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, run bulk sends, or run paid enrichment; buyer-safe links rely on the existing activation confirmation-token workflow, while send, capture, kickoff, and manual-record actions remain POST-only.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/close-desk
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/close-desk?format=markdown"
```

Use protected `/activation/prospects/:leadId/confirmation-workbench` when a specific prospect is blocking the market gate. It brings the nudge draft, suggested recipients, buyer-safe confirmation form, status room, request kit, pilot acceptance receipt, missing details, stakeholder asks, manual confirmation capture defaults, kickoff preflight, market-gate effect, after-kickoff proof sequence, and kickoff path into one page. GET requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/prospects/LEAD_ID/confirmation-workbench
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/confirmation-workbench?format=markdown"
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/prospects/LEAD_ID/pilot-acceptance
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/pilot-acceptance?format=markdown"
```

Use protected `/activation/prospects/:leadId/confirmation-reply` when the buyer replies by email instead of submitting `/confirm/:token`. The operator can paste the buyer reply, preview extracted target-page, implementation-owner, CRM-owner, routing-owner, proof-recipient, and baseline fields, review the generated checklist, acknowledge any defaulted required fields, and then apply the exact reviewed payload with a separate POST to `/activation/prospects/:leadId/close-workflow`. The applied close workflow stores the review source, checklist status, extracted/defaulted/missing counts, reviewer, and review timestamp. Preview requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/prospects/LEAD_ID/confirmation-reply-preview
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/confirmation-reply-preview?format=markdown"
```

Use protected `/activation/prospects/:leadId/stakeholder-handoff` when the buyer champion needs one copy-ready packet for the internal handoff. It bundles champion, website-owner, CRM-owner, sales-routing, proof-recipient, and security/procurement notes with exact buyer-safe confirmation, status-room, request-kit, implementation, CRM, security, and proof links. GET requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/prospects/LEAD_ID/stakeholder-handoff
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/prospects/LEAD_ID/stakeholder-handoff?format=markdown"
```

Use protected `/activation/intake-triage` when new pilot-intake submissions or qualified CRM leads need to be ranked into the first-five beta workflow. It shows public-intake source, first-five fit score, fit reasons, fit concerns, missing buyer-confirmation details, the recommended close/kickoff packet, protected CRM/workbench links, buyer-safe confirmation links, and providerless safety flags. GET requests are read-only: they do not send email, mutate buyer state, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/activation/intake-triage
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/activation/intake-triage?format=markdown"
```

Use protected `/launch/ops` as the daily command room for the first-five beta launch. It aggregates first-five outreach, activation follow-ups, post-kickoff install work, live-proof gate state, the current focus target, stage stack, and recommended next actions. GET requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/ops
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/ops?format=markdown"
```

Use protected `/launch/first-five-board` when you need the client-by-client path to market-ready proof. It fills five slots from current evidence in this order: real beta clients, qualified activation prospects, first-five outreach target accounts, then empty reserve slots. Each slot shows its stage, next action, proof focus, links, paid lookups recommended now, and safety posture. Activation-prospect slots also include an action kit with the recommended packet, recipients, copy-ready subject/body, one-click `mailto:` draft, send POST preview, POST-only manual sent recorder, buyer-safe confirmation/status/request-kit links, and protected reply preview. The providerless guardrail keeps paid lookup default disabled and manual approval required. GET requests are read-only: they do not send email, mutate buyer state, mark buyer confirmation complete, create beta clients, transmit CRM data, run bulk sends, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/first-five-board
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/first-five-board?format=markdown"
```

Use protected `/launch/first-beta-drill` as the read-only answer to "what do we still need before this is ready?" It walks the operator from close packet, buyer confirmation, real beta-client conversion, install handoff, client-domain install proof, first beta profile, CRM handoff proof, rep feedback, live-proof gate review, and final market-gate review. Operator POSTs are shown as previews only; GET requests do not send email, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/first-beta-drill
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/first-beta-drill?format=markdown"
```

Use protected `/launch/next-action` when you want the single shortest path to the next proof gate. It distills the first-beta execution packet and install queue into one active mode: if buyer confirmation is still pending, the room shows follow-up copy, a manual `mailto:` draft, manual sent recorder, buyer-safe links, reply parser, buyer-confirmation proof focus, and POST previews; if buyer confirmation is captured, the room switches to an active kickoff state with the explicit `/activation/prospects/:leadId/kickoff` POST and no manual email draft requirement; if a real beta client already exists, the room switches to install-proof mode with `current_install_action`, install handoff/status/feedback/CRM-export links, the install workbench, current proof blockers, and no buyer follow-up form. GET requests remain read-only: they do not send email, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/next-action
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/next-action?format=markdown"
```

Use protected `/launch/confirmation-command` when the active blocker is getting one buyer from interested to confirmed beta install. It composes the next-action room, the per-prospect confirmation workbench, reply preview, kickoff preflight, and providerless enrichment build plan into one command center. Before confirmation it shows the active follow-up copy, one-click `mailto:` draft, explicit send POST, POST-only manual sent recorder, buyer-safe confirmation/status/request-kit links, reply parser, and reviewed confirmation form. After confirmation it switches to the kickoff POST. After kickoff it pivots to install-proof mode and removes stale manual-send controls. GET requests remain read-only: they do not send email, record manual sends, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/confirmation-command
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/confirmation-command?format=markdown"
```

Use protected `/launch/confirmation-watch` when the active blocker is keeping buyer-confirmation threads from going stale. It composes the activation follow-up queue, activation outbox, activation close desk, confirmation command center, and market gate into one SLA watchroom. The page shows the current focus, due-now/overdue/waiting/kickoff-ready counts, next check time, missing confirmation details, command-center links per buyer, buyer-safe status/request-kit links, and the providerless rule that paid enrichment stays off while confirmation is the blocker. GET requests remain read-only: they do not send email, record manual sends, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/confirmation-watch
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/confirmation-watch?format=markdown"
```

Use protected `/launch/first-profile` when install proof exists and the next blocker is the first beta-attributed buyer profile. It selects the real beta client that is ready for profile capture, shows client-domain config loads, profile count, CRM handoff count, rep feedback count, proof blockers, and a capture checklist. The room previews the existing launch test-lead POST payload and links the launch wizard, install workbench, latest lead, feedback room, manual CRM export, proof packet, and market gate. GET requests remain read-only: they do not create a profile, send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment; first-profile creation requires the explicit POST form.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/first-profile
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/first-profile?format=markdown"
```

Use protected `/launch/profile-handoff` after the first beta-attributed profile exists. It selects the real beta client and latest profile, then brings the rep-ready brief, CRM delivery proof, rep alert/handoff, public feedback room, manual CRM export, buyer-safe proof report, and proof-packet gate into one room. The page distinguishes queued CRM records from sent handoff proof, keeps paid enrichment at zero by default, and exposes only POST previews for handoff actions. GET requests remain read-only: they do not create profiles, send email, send rep alerts, queue CRM delivery, transmit CRM data, update rep feedback, create beta clients, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/profile-handoff
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/profile-handoff?format=markdown"
```

Use protected `/launch/first-beta-execution` when it is time to work the next launch action. It consolidates the active buyer candidate, pending-confirmation follow-up copy, buyer-safe links, confirmation reply preview, stakeholder handoff, proof ledger, first beta drill, install queue, providerless enrichment cost firewall, and POST previews into one run sheet. When a prospect is `ready_for_kickoff`, this packet suppresses extra buyer-follow-up copy and makes the kickoff install POST the active operator preview. The providerless section exposes the build-ourselves plan, internal source stack, quality gates, modeled spend avoided, and paid-escalation criteria so the first beta can stay off paid enrichment unless rep feedback proves a missing field changes first-touch quality. GET requests remain read-only: they do not send email, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/first-beta-execution
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/first-beta-execution?format=markdown"
```

Use protected `/launch/market-ready` as the conservative launch decision gate before inviting broad real traffic or making buyer-facing live proof claims. It aggregates buyer assets, first-five pipeline, buyer confirmation, real beta-client conversion, install handoff, client-domain config proof, real beta profiles, CRM handoff, rep feedback, and live-proof status into pass/warning/blocker gates. The JSON and Markdown exports also include a readiness estimate that separates required code builds before first beta, remaining real-world proof steps, optional scale builds, and paid-enrichment lookups needed now. GET requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/market-ready
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/market-ready?format=markdown"
```

Use protected `/launch/market-kit` after reviewing the market gate to prepare launch-safe GTM language. It turns the current proof scope into approved claims, claims that require disclosure, prohibited claims, website/LinkedIn/outbound/webinar copy blocks, buyer-safe CTAs, and a disclosure checklist. GET requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, expose CRM profiles, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/market-kit
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/market-kit?format=markdown"
```

Use protected `/launch/proof-ledger` as the evidence checklist behind the market gate. It maps buyer confirmation, real beta-client conversion, install handoff, client-domain install proof, first real profile, CRM handoff, rep feedback, and live-proof gate items to their owner, current evidence, proof condition, capture surface, verification surface, and next action. GET requests do not send email, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/proof-ledger
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/proof-ledger?format=markdown"
```

Use protected `/launch/proof-handoff` when converting proof-ledger blockers into stakeholder copy. It groups open proof items by owner, suggests recipients when available, and creates subject/body plus one-click `mailto:` drafts for buyer champion, implementation, CRM, sales, and Deal Threads operator follow-up. Each owner group also has a POST-only manual sent recorder at `/api/v1/launch/proof-handoff/:ownerKey/sent`; this records the operator follow-up trail without sending email or clearing proof blockers. GET requests do not send email, mark buyer confirmation complete, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/proof-handoff
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/proof-handoff?format=markdown"
```

Use protected `/launch/install-queue` after a confirmed buyer becomes a beta client. It excludes synthetic demo clients, ranks each real beta client by the next install/proof step, and surfaces launch-packet delivery, public install handoff, source-check status, hosted/test versus client-domain config loads, first attributed profiles, CRM handoff proof, rep feedback, and proof packet readiness. GET requests are read-only: they do not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment.

Use protected `/launch/proof-packet` when the install queue reaches `proof_packet_due`. It selects the ready beta client, verifies strict evidence for client-domain install proof, first beta profile, CRM handoff proof, and rep feedback, previews the tokenized buyer-safe proof report, and exposes explicit POST-only actions to queue the first proof delivery or mark a manually sent proof packet. Loading the page or API never queues a delivery, sends email, writes CRM data, runs paid enrichment, or claims live proof.

Protected exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/launch/install-queue
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/launch/install-queue?format=markdown"
```

For one kicked-off beta client, use protected `/launch/install-queue/BETA_CLIENT_ID/workbench` as the install proof workbench. It bundles the client's launch state, public install/status/feedback/CRM/proof links, protected operator links, stakeholder copy blocks, one-click `mailto:` drafts, POST-only manual sent recorders, source-check status, public install status steps, readiness checks, proof preflight, market-gate effect, and read-only safety posture. JSON and Markdown exports are available at `/api/v1/beta-clients/BETA_CLIENT_ID/install-workbench`; loading them does not send email, mutate buyer state, create beta clients, transmit CRM data, claim live proof, or run paid enrichment. If an operator sends a copy block from their own mailbox, record that audit trail with `POST /api/v1/beta-clients/BETA_CLIENT_ID/install-workbench/COPY_BLOCK_KEY/sent`.

Protected per-client exports:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/install-workbench
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/install-workbench?format=markdown"
```

Use `/compare` when a buyer asks how Deal Threads differs from keeping the current form, adding a chatbot, buying an enterprise conversational platform, relying on scheduling/routing, buying enrichment data, or building internally. It stays category-based and buyer-safe, with decision criteria, a decision-fit matrix, proof questions, and a comparison claim audit instead of vendor-specific claims that need live market verification. Every JSON and Markdown export locks the guide to category positioning only, blocks named-vendor superiority, guaranteed-lift, customer-ROI, live-result, and market-ready claims, and requires buyer context, pilot proof, and protected market-gate clearance before stronger claims are used.

Public exports:

```bash
curl http://localhost:4173/api/v1/compare
curl "http://localhost:4173/api/v1/compare?format=markdown"
```

Use `/proof-preview` when buyers ask what they will get after the 14-day pilot. It shows a synthetic/template proof packet with install evidence, profile volume, first-touch speed, rep usefulness, pipeline motion, providerless enrichment metrics, interpretation rules, buyer inputs, and report sections without claiming live results or exposing real beta data. The JSON and Markdown exports include a public claim audit that locks the scope to synthetic templates, blocks observed-result, market-ready, customer-ROI, and conversion-lift claims, and requires protected market-gate clearance before live-proof language is used.

Public exports:

```bash
curl http://localhost:4173/api/v1/proof-preview
curl "http://localhost:4173/api/v1/proof-preview?format=markdown"
```

Set `ACTIVATION_AUTO_KICKOFF_ON_CONFIRMATION=true` when a confirmed buyer should immediately become a beta client. In that mode, a valid `/confirm/:token` submission creates or reuses the beta-client launch record, sends or dry-runs the launch packet through the existing email adapter, and redirects the buyer to the tokenized `/install/:token` handoff page.

Operators can still track the close workflow before conversion. Mark the packet sent after emailing the prospect, or use the protected endpoint when the buyer details were captured manually:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"action":"confirm","targetPageUrl":"https://acme.com/demo","implementationOwnerEmail":"web@acme.com","crmOwnerEmail":"revops@acme.com","routingOwnerEmail":"ae@acme.com","reportRecipients":"revops@acme.com,ae@acme.com","baselineFirstTouchMinutes":45,"baselineMeetingRate":0.18,"baselineOpportunityRate":0.07,"baselineWinRate":0.21,"baselineSalesCycleDays":47}' \
  http://localhost:4173/api/v1/activation/prospects/LEAD_ID/close-workflow
```

Confirmed close-workflow details become the default beta-client website, owner, routing, reporting, and baseline values when the prospect is converted from `/activation`.

When the buyer confirmation is complete, use the activation kickoff endpoint to convert the prospect and send the beta install packet in one protected action:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"launchRecipients":"web@acme.com,revops@acme.com"}' \
  http://localhost:4173/api/v1/activation/prospects/LEAD_ID/kickoff
```

Kickoff creates or reuses the beta client, preserves the original sales lead outside beta traffic, sends the launch packet through the dry-run/webhook email adapter, marks the install snippet handoff complete, and returns the public install handoff URL. The response also includes `proof_transition`, a before/after market-gate delta showing which gates moved, which blockers remain, the next proof actions, install/proof URLs, and safety flags that keep market-ready and live-proof claims blocked until real evidence clears the gate.

Question playbooks can be submitted as JSON arrays through the API or as operator-form lines:

```text
authority | Decision role | Who owns this buying decision? | I own the decision; I influence the decision | optional
timeline | Timing | When do you need this solved? | This week; This month; This quarter | required
```

Required playbook fields feed the same completion gate used by the widget. If a required field is missing from a custom playbook, Deal Threads falls back to the default question for that field so the conversation can still complete.

Protected beta-client APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/beta-clients
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"name":"Acme Revenue OS","websiteUrl":"https://acme.com","ownerEmail":"ae@example.com","crm":"hubspot","crmDestinationName":"Acme CRM webhook","crmDeliveryWebhookUrl":"https://hooks.example.com/acme","launcherText":"Ask Acme","highPriorityOwner":"ae@example.com","requiredFields":"email,business_need,timeline,company_name_or_domain","questions":[{"key":"authority","prompt":"Who owns this buying decision?","quickReplies":["I own the decision","I influence the decision"]}],"reportRecipients":"owner@example.com,revops@example.com","reportCadence":"weekly","reportPeriodDays":14}' \
  http://localhost:4173/api/v1/beta-clients
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"key":"install_snippet_sent","checked":true,"note":"Sent to client."}' \
  http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/checklist
curl -u admin:deal-threads-local http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/readiness
curl -u admin:deal-threads-local http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/launch-wizard
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/launch-packet?format=markdown"
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"recipients":"owner@example.com,implementer@example.com"}' \
  http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/launch-packet/send
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/report?days=14"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/report?days=14&format=csv"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/report?days=14&format=markdown"
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"recipients":"owner@example.com,revops@example.com","days":14}' \
  http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/report-deliveries
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"title":"Ask budget earlier","hypothesis":"Budget-first routing improves first-touch speed.","metric":"Average first-touch minutes","status":"running"}' \
  http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/experiments
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"days":14,"decision":"Iterate","learnings":"Lead quality improved, but follow-up is still slow."}' \
  http://localhost:4173/api/v1/beta-clients/BETA_CLIENT_ID/snapshots
```

## Beta Reporting

Open:

```text
http://localhost:4173/reports/beta
```

The beta report summarizes a 7, 14, 30, or 90 day reporting window with:

- Lead volume and priority mix.
- SLA health and first-touch speed.
- Meeting, opportunity, pipeline, expected-value, and close outcomes from workflow stages and sales outcome fields.
- Self-built enrichment usage and paid-provider spend.
- Rep feedback coverage, helpful/missing-context counts, average usefulness score, and top missing fields.
- Recommended next actions for the pilot.
- Example leads to review with the customer.

The global report covers all beta activity. Each beta client card also links to a scoped report at:

```text
http://localhost:4173/beta-clients/BETA_CLIENT_ID/report?days=14
```

Protected report APIs:

```bash
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/reports/beta-summary?days=14"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/reports/beta-summary?days=14&format=csv"
curl -u admin:deal-threads-local "http://localhost:4173/api/v1/reports/beta-summary?days=14&format=markdown"
```

## Report Delivery Queue

Open:

```text
http://localhost:4173/reports/deliveries
```

The delivery queue turns beta reports into send-ready packets and can send them through a safe dry-run adapter before Deal Threads has a paid email integration. Operators can:

- Run due weekly reports across beta clients.
- Queue an individual client report from the beta-client dashboard.
- Review recipients, reporting window, Markdown summary, and CSV attachment content.
- Send queued packets in dry-run mode without transmitting external email.
- Optionally send through a configured webhook adapter later.
- Mark a queued delivery as sent after emailing it manually.
- Automatically update the beta-client `First report sent` checklist item when a delivery is sent or marked sent.

Protected delivery APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/reports/deliveries
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{}' \
  http://localhost:4173/api/v1/reports/deliveries/run-due
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{}' \
  http://localhost:4173/api/v1/reports/deliveries/send-queued
curl -u admin:deal-threads-local http://localhost:4173/api/v1/reports/deliveries/DELIVERY_ID
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"note":"Sent through the configured adapter."}' \
  http://localhost:4173/api/v1/reports/deliveries/DELIVERY_ID/send
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"note":"Sent via email."}' \
  http://localhost:4173/api/v1/reports/deliveries/DELIVERY_ID/sent
```

Default email delivery is intentionally no-cost and no-transmission:

```bash
REPORT_EMAIL_MODE=dry_run
REPORT_EMAIL_FROM=reports@dealthreads.local
ACTIVATION_NOTIFICATION_RECIPIENTS=
ACTIVATION_AUTO_KICKOFF_ON_CONFIRMATION=false
INSTALL_AUTO_SOURCE_CHECK_ON_HANDOFF=false
```

To hand off launch packets or report packets to a real email workflow, configure a webhook endpoint. Deal Threads posts `{ from, to, subject, text, attachments, metadata }` to the webhook and records the send attempt:

```bash
REPORT_EMAIL_MODE=webhook
REPORT_EMAIL_WEBHOOK_URL=https://example.com/deal-threads/report-email
REPORT_EMAIL_WEBHOOK_TOKEN=optional-bearer-token
REPORT_EMAIL_FROM=reports@yourdomain.com
REPORT_EMAIL_REPLY_TO=revops@yourdomain.com
ACTIVATION_NOTIFICATION_RECIPIENTS=founder@yourdomain.com,ops@yourdomain.com
ACTIVATION_AUTO_KICKOFF_ON_CONFIRMATION=true
INSTALL_AUTO_SOURCE_CHECK_ON_HANDOFF=true
```

## Operator Config

Open:

```text
http://localhost:4173/admin
```

Protected pages use Basic Auth. In local development, the default credentials are:

```text
Username: admin
Password: deal-threads-local
```

For production, set `ADMIN_USERNAME` and a strong `ADMIN_PASSWORD`. If `NODE_ENV=production` and no `ADMIN_PASSWORD` is set, `/admin`, `/crm`, lead detail APIs, CRM delivery APIs, and HubSpot setup APIs return `503` instead of exposing private data.

The admin page can update:

- Tenant name and allowed domains.
- Launcher text.
- Welcome message.
- Quick replies.
- Required fields.
- Primary widget color.
- Consent disclosure.
- ICP scoring weights and thresholds.
- Routing owners, queues, and recommended actions.

Every save increments the widget config version and persists to `.data/deal-threads-dev.json`.

## Persistence

Lead profiles, company memory, beta clients, CRM deliveries, report deliveries, conversations, sessions, and analytics events are persisted locally to:

```text
.data/deal-threads-dev.json
```

Override the path with:

```bash
DEAL_THREADS_DATA_FILE=/path/to/deal-threads-dev.json npm run dev
```

## HubSpot Sandbox Sync

Without a token, leads are created locally and marked as `stubbed`.

To attempt real HubSpot contact/company/note sync:

```bash
HUBSPOT_TOKEN=pat-na1-your-token npm run dev
```

Required HubSpot scopes for the sandbox/private app should include CRM object read/write access for contacts, companies, and notes.

Manual resync endpoint:

```bash
curl -u admin:deal-threads-local -X POST http://localhost:4173/api/v1/leads/LEAD_ID/sync
```

Before using a live token, inspect exactly what Deal Threads would send:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/leads/LEAD_ID/hubspot-preview
```

The same preview is shown on `/crm/:leadId` under HubSpot sync preview.

Backlog handoff queue:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/hubspot/sync-queue
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"dryRun":true,"limit":25}' \
  http://localhost:4173/api/v1/hubspot/sync-queue/run
```

The queue is also available from `/admin` under HubSpot handoff queue. Without `HUBSPOT_TOKEN`, queue runs are dry-run only and report which leads would sync. With `HUBSPOT_TOKEN`, set `dryRun:false` to execute eligible unsynced leads.

HubSpot property readiness endpoints:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/hubspot/properties
curl -u admin:deal-threads-local -X POST http://localhost:4173/api/v1/hubspot/properties/setup
```

Without `HUBSPOT_TOKEN`, these endpoints run in dry-run mode and report what would be checked or created. With `HUBSPOT_TOKEN`, setup attempts to create missing Deal Threads contact, company, and deal properties.

## LLM Extraction

By default, the app uses the local heuristic extractor so development is free.

To use real structured extraction:

```bash
OPENAI_API_KEY=sk-your-key npm run dev
```

Optional model override:

```bash
OPENAI_MODEL=gpt-4o-mini OPENAI_API_KEY=sk-your-key npm run dev
```

Check extraction readiness without creating leads or CRM records:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/admin/llm/readiness
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"message":"My name is Lina Vale. I am evaluating this for ReadyCo, a 160-person SaaS company using HubSpot. We need demo routing fixed this quarter and likely have $30K-$50K annually. I own the decision. lina@readyco.test"}' \
  http://localhost:4173/api/v1/admin/llm/test
```

The same probe is available on `/admin` under OpenAI extraction readiness. Without `OPENAI_API_KEY`, it confirms the heuristic fallback path. With `OPENAI_API_KEY`, it attempts one live extraction and reports success or failure without storing a test lead.

If OpenAI extraction fails, the app keeps the heuristic extraction and marks the profile for review.

## Enrichment Without Paid Providers

The default enrichment mode is `internal`. It fetches the company website and extracts:

- Page title and meta description.
- Canonical URL.
- Social/company links.
- Common tech stack signals from scripts and HTML.
- Same-domain signal pages such as about/team, careers, integrations, customers, pricing, security, and news.
- Public-site company size language such as "160 employees", employee ranges, and team-size statements.
- Public-site buying-role language for RevOps, sales leadership, CRM ownership, demand generation, and security review stakeholders.
- Hiring/growth signals such as open-role counts from careers pages.
- Growth, proof, enterprise-readiness, and buying-motion signals from public pages.
- Visitor-provided company size and CRM context.
- Inferred ICP fit, likely buying committee roles, buying triggers, and a rep opening angle.
- Funding or investor language from public website, press, news, blog, and resource pages.
- Reusable internal research evidence with source URLs, labels, confidence, and notes.
- Explicit zero paid-provider cost metadata.

Open the protected enrichment control page:

```text
http://localhost:4173/enrichment
```

The page and `/api/v1/enrichment/summary` show:

- Field coverage for domain, website, company size, industry, budget, CRM, authority, tech stack, social links, self-built signals, buyer profile, buying committee, buying triggers, and funding/growth signals.
- Average confidence and low-confidence review queue.
- Review status counts for pending, research-needed, and reviewed profiles.
- Top inferred buying roles and buying triggers across the beta cohort.
- Research evidence counts, categories, source URLs, and reusable-memory status.
- Internal request counts, paid-provider calls, paid spend, and modeled provider spend avoided.
- A provider gate that keeps paid lookup disabled by default.
- Field-level build-vs-buy decisions for rep-missing fields such as budget, authority, source evidence, tech stack, company size, and buying committee.
- Recommended changes to the chat flow before buying external data.

The same page now includes a build-ourselves plan that turns the provider decision into quality gates:

- Conversation fields that replace firmographic lookups.
- Website and signal-page coverage.
- Buyer-profile coverage before any paid enrichment provider is considered.
- Company memory reuse from imports and operator corrections.
- Operator research evidence with source URLs and confidence scores.
- Manual review criteria and notes for high-value low-confidence leads.
- A ranked field strategy showing rep pain count, internal coverage, evidence count, recommended build path, and paid-provider trigger for each missing field.
- Paid escalation rules that keep external data behind approval.

Operators can update enrichment review status from `/enrichment` or the lead detail page at `/crm/:leadId`. Closing a profile as `reviewed` or `dismissed` removes it from the open review queue; `research_needed` keeps it visible until the missing fields are checked.

Protected enrichment APIs:

```bash
curl -u admin:deal-threads-local http://localhost:4173/api/v1/enrichment/build-plan
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"status":"research_needed","note":"Need to confirm decision makers before any paid lookup."}' \
  http://localhost:4173/api/v1/leads/LEAD_ID/enrichment-review
```

Lead CSV exports and beta reports include research evidence counts, enrichment review queue, reviewed-profile counts, rep feedback status, usefulness score, and top missing fields, so beta decisions can compare internal research effort against paid-provider spend. This avoids paid enrichment calls while proving the workflow. A paid provider should only be added after real beta data shows that a missing field changes rep follow-up quality. To use the old deterministic mock mode:

```bash
ENRICHMENT_MODE=mock npm run dev
```

Optional internal enrichment controls:

```bash
INTERNAL_ENRICHMENT_TIMEOUT_MS=3500
INTERNAL_ENRICHMENT_SIGNAL_PAGE_LIMIT=2
PAID_ENRICHMENT_LOOKUP_ESTIMATE_USD=0.25
ENRICHMENT_REVIEW_CONFIDENCE_THRESHOLD=0.65
```

## Persistence Modes

JSON remains the default for local development:

```bash
DEAL_THREADS_DATA_STORE=json
DEAL_THREADS_DATA_FILE=.data/deal-threads-dev.json
```

SQLite is available for beta deployments that need a single durable file on a mounted volume:

```bash
DEAL_THREADS_DATA_STORE=sqlite
DEAL_THREADS_SQLITE_FILE=.data/deal-threads-dev.sqlite
```

The `/api/v1/health` response includes `dataStore.mode` and `dataStore.location` so operators can confirm which persistence backend is active.

Before changing store mode, deploying, or running a beta reporting cycle, download a protected state backup:

```bash
curl -u admin:deal-threads-local \
  -o deal-threads-state-backup.json \
  http://localhost:4173/api/v1/admin/state/export
```

The backup includes export metadata, active data-store mode/location, object counts, and the full Deal Threads snapshot used by both JSON and SQLite persistence.

Validate a backup before any migration or restore planning:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d @deal-threads-state-backup.json \
  http://localhost:4173/api/v1/admin/state/validate
```

The validator is a dry run. It checks parseability, schema metadata, required snapshot sections, duplicate lead/client/session/report IDs, duplicate company-memory domains, incoming counts, and count deltas against the active runtime without mutating state.

Run a guarded restore dry run:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d @deal-threads-state-backup.json \
  http://localhost:4173/api/v1/admin/state/restore
```

To replace local state, the backup must be valid and the request must include the exact confirmation phrase:

```bash
curl -u admin:deal-threads-local \
  -H "content-type: application/json" \
  -d '{"backupJson":"...","dryRun":false,"applyRestore":true,"confirmation":"RESTORE DEAL THREADS STATE"}' \
  http://localhost:4173/api/v1/admin/state/restore
```

The same guarded restore form is available in `/admin`. Restore is dry-run unless `applyRestore=true`, `dryRun=false`, and the confirmation phrase matches exactly.

## Six-Channel Revenue Loop

The 24/7 worker now consolidates the six production systems into one persisted control plane:

1. SmartLead email replies, opens, clicks, categories, and unsubscribes.
2. Salesfinity call dispositions, callbacks, do-not-contact outcomes, and meetings set.
3. Sendr proof-page engagement and high-intent completion/click events.
4. Cal.com bookings, reschedules, and cancellations.
5. HubSpot property readiness and automatic eligible-lead synchronization.
6. Telegram, Slack, and email delivery for the morning brief and urgent decisions.

Public ingestion endpoints:

```text
POST /webhooks/v1/smartlead
POST /webhooks/v1/salesfinity
POST /webhooks/v1/sendr
POST /webhooks/v1/calcom
```

SmartLead requests use its `X-Smartlead-Signature` HMAC SHA-256 signature, and Cal.com uses `X-Cal-Signature-256`. Salesfinity and Sendr require a provider-specific shared secret as `Authorization: Bearer ...`, `X-Webhook-Secret`, `X-{provider}-Webhook-Secret`, or a `?token=...` receiver URL when the vendor cannot send custom headers. An endpoint returns `503` until its secret is configured, so an accidentally deployed receiver is not open.

Protected operating endpoints:

```text
GET  /api/v1/sdr-ops/integrations
POST /api/v1/sdr-ops/notifications/run
GET  /api/v1/sdr-ops/watchdog
GET  /sdr-ops
```

To run unattended, set `SDR_AUTOMATION_ENABLED=true`. `HUBSPOT_AUTO_SYNC=true` processes eligible pending HubSpot leads on every worker cycle. `HUBSPOT_AUTO_SETUP_PROPERTIES=true` is deliberately separate because it changes the connected HubSpot portal schema.

For the current internal installation, the revenue-loop launcher safely loads the existing AIOS credential files, maps legacy HubSpot/Sendr/Cal variable names, enables the worker, enables HubSpot auto-sync when a token is present, keeps outbound actions in approval mode, and enables Telegram when its existing token/chat are present:

```bash
npm run start:revenue
```

It never prints secret values. In another environment, set `DEAL_THREADS_ENV_FILES` to a comma-separated list of environment files or inject variables through the deployment platform.

`REVENUE_NOTIFICATIONS_ENABLED=true` queues a timezone-aware brief once per local day and deduplicated urgent alerts for each open high/critical decision. Deliveries persist with exponential retries. Configure one or more of:

- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`
- `SLACK_WEBHOOK_URL`
- `REPORT_EMAIL_WEBHOOK_URL` + `REVENUE_WATCHDOG_EMAIL_TO`

The source adapter, CRM automation, and notification readiness are visible in `/sdr-ops`, `/api/v1/sdr-ops/integrations`, and `/api/v1/health`.

## Next Development Targets

1. Register the four production webhook URLs after a stable public deployment URL is selected.
2. Test HubSpot sandbox sync and property setup against a real portal.
3. Run the OpenAI extraction probe with a real `OPENAI_API_KEY` and compare LLM output against heuristic fallback.
4. Move from SQLite snapshot persistence to Postgres when beta usage requires multi-instance writes or SQL reporting.
5. Add an optional paid enrichment adapter only after internal enrichment quality and API costs are measured.
