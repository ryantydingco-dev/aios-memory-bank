---
name: runvue-client-portal
description: Runvue — white-label delivery portal for AI lead-gen agencies (Ideabrowser
metadata: 
  node_type: memory
  type: project
  originSessionId: 4051ae5c-0815-489e-b685-904e4200597e
---

Runvue = Ideabrowser idea #8026 ("White-label delivery dashboard for AI service agencies"), Ideabrowser project f78acbcf-d6ed-4525-93a1-bfb84f7d5e8a. Built 2026-06-10 from idea → deployed product in one session.

**Live:** https://runvue-portal-production.up.railway.app (Railway project e244f7f8, service runvue-portal). Client Zero portal link: `/p/recppwK8aGP9LFsCH/<sig>` — generate with `node print-link.js recppwK8aGP9LFsCH <baseUrl>` (signs with PORTAL_SECRET in aios .env).

**Stack:** Airtable base `appxMmocd7W63dnQu` (Clients tblNlWhrMfA3KalqS / Deliverables tblle5K7sclVoTES9 / Daily Metrics tblEUsmvOMmbaQ3Nt / Reports tbl8mSckwZfXp6oIt). App: `aios-starter-kit/apps/runvue-portal` (Express+EJS). Syncs: `aios-starter-kit/scripts/runvue/` (smartlead, salesfinity, hubspot, generate_digest, send_digest) — run via launchd `com.aios.runvue-sync` 7:30a/4:30p + Monday digest generate+send.

**Keys:** SmartLead + Resend + Sender.ai + PORTAL_SECRET in aios-starter-kit/.env; Salesfinity in the AI GTM Engine sprint `.env.salesfinity`; Airtable PAT in ~/.claude.json mcpServers.airtable. Digest sends from alerts@dealthreads.io (verified Resend domain). HubSpot sync UNBLOCKED 2026-06-11: HUBSPOT_PRIVATE_APP_TOKEN now in aios .env (contacts scopes only — meetings/deals read would need added scopes), HubSpot now holds ~2,985 contacts via [[origami-hubspot-lead-sync]]. Sendr connector now possible: API found 2026-06-11 at api.sendr.io (X-API-Key header, docs.sendr.io — product domain is .io, NOT .ai); key rotated same day. A Sendr→portal deliverables sync (campaigns endpoint) is an easy add; see [[meeting-engine]] for the working client code.

**Offer (validated against live competitive research):** DFY "Client Portal Setup for AI Agencies" — founding pilot $1K setup + $149/mo (first 5), standard $2.5K + $299/mo, 7-days-or-refund. Positioning seat "AI-agent-native client portal" confirmed EMPTY June 2026 (closest: DashLynk weeks-old n8n-chatbots-only; Wayfront ex-SPP is the structural threat). Sell retention/install/push+ROI reports, never the dashboard as software — Ryan himself judged the dashboard alone not worth $99/mo.

**Important correction made mid-session:** Ryan has NO paying clients — dogfood = his own Dealthreads lead engine (SmartLead 36k emails / Salesfinity dial lists) as "Client Zero." Validation gate from the roast: 5 paid pilot commitments in 14 days via his AI-agency community, demo-led (walkthrough video, not a survey post).

**Retention OS upgrade (same day):** product expanded beyond portal — Audit Findings table `tblXvM69jsi7YnKNq` (living AI audit with severity/status, 6 real findings seeded), Roadmap table `tblqYFtCb9UGPN61o` ("what's next" panel), ROI ledger (Clients value fields: Meeting Value $500 / Positive Reply Value $150 / Monthly Retainer / Renewal Date), and the **Churn Radar** — agency-side risk dashboard at `/admin/<sig>` (sig = sign("admin")) scoring portal silence + stale approvals + renewal proximity; Clients."Portal Last Viewed" auto-stamps on every portal load. Positioning locked: "the Retention OS for AI agencies" — moat is the retention lever, not the dashboard. Vision sequence: audit (promise) → feed (proof) → ledger (value) → radar (warning) → renewal pack (close). NOT built yet: renewal/QBR pack generator, comms hub, reseller mode, approval-gated webhook resume.

**Launch status (2026-06-11):** community post LIVE (drafts in `AI GTM Engine/content-writer-output/packages/runvue-launch/`). **Multi-tenant layer shipped:** `scripts/runvue/tenants.yaml` registry (env-var refs only; campaign→client regex fan-out), all syncs/sentinel/digest/voice loop tenants, per-tenant state files (`state/smartlead-{tenant}.json`), "Sync Key" dedupe fields on Deliverables+Reports (backfilled), tenant-aware approve-to-resume (`smartlead:{tenant}:resume:{id}` + `SMARTLEAD_API_KEY_<TENANT>` Railway vars). Pilot install = follow `apps/runvue-portal/docs/pilot-install-runbook.md` (day-by-day, live-in-7). Also built: "Ask your account manager" chat (Claude-style panel + cloned-voice replies) — HIDDEN until valid ANTHROPIC_API_KEY exists (boot health-check gates it; current key = disabled org). Approve-from-email magic links live in digests; 15s live pulse on portal.

**Next:** monitor post replies → first pilot intake (runbook day 0); fresh Anthropic key unlocks chat + AI-drafted pitches; per-tenant radar links + per-tenant digest sender domains are the next engineering items.

Related: [[ai-contact-form-build]], [[oloxa-battlecard-workflow]]
