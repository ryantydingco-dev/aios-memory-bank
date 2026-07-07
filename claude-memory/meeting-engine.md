---
name: meeting-engine
description: "The lead-to-booked-meeting pipeline (SmartLead + Salesfinity + Origami + HubSpot + Telegram brief 3x/day); playbook + routing yaml; Sendr.ai = manual VIP channel, Cal key invalid"
metadata: 
  node_type: memory
  type: project
  originSessionId: db2cdeee-3ed4-47f0-944a-bac9cad37234
---

Built 2026-06-11 on top of [[origami-hubspot-lead-sync]] when Ryan asked for a "foolproof system to book meetings ASAP." `scripts/meeting_engine.py` (aios-starter-kit) joins SmartLead engagement + Salesfinity dial outcomes onto the full lead universe, grades stages (new/working/warm/hot/meeting_booked/disqualified → `aios_stage` etc. on HubSpot contacts), auto-routes mapped sources to SmartLead campaigns (`config/meeting_engine_routes.yaml`, ships empty), and sends a prioritized Telegram brief at 7:25a/12:30p/4:30p (launchd `com.aios.meeting-engine`). Human process: `docs/meeting-engine-playbook.md` — reply to hot <1h with booking link, warm-first dial blocks, categorize every SmartLead reply, mark `meeting_booked` manually in HubSpot (sticky).

First run surfaced 6 unanswered repliers (1 AR Recovery, 5 k12) — all aging >24h. Pipeline at launch: 1,834 new / 1,103 working / 6 hot / 0 booked across ~2,952 contacts.

Key facts that took digging:
- Sendr (SENDER_AI_API_KEY) DOES have an API — but on **sendr.io**, not .ai: base `https://api.sendr.io`, header `X-API-Key`, OpenAPI at `api.sendr.io/openapi`, docs at docs.sendr.io. The .ai domain is marketing-only (wildcard subdomains all return Cloudflare 525 — dead ends). Endpoints: campaigns, sheets (+columns, +row INSERT), webhooks CRUD, enrichment (video/audio/page gen). NO per-lead engagement read — webhooks are the only engagement feed (future build: receiver on Runvue Railway portal). Engine derives sequence membership by token-matching sheet names to uploaded CSVs in `AI GTM Engine/Lead Engine/Outputs/`. Sendr campaign "Agencies AR Recovery — Leak Check" ACTIVE with 151 Tier-A agencies (8 steps). `sendr_routes:` in routes.yaml pushes leads into sheets (= enrolls into the sheet's active sequence).
- Salesfinity has no call-log endpoint; dial outcomes ride on contact records (`phone_numbers[].total_calls` / `call_classification`).
- SmartLead reply categories via `/leads/fetch-categories`; per-lead engagement via `/campaigns/{id}/statistics`.
- Cal.com `CAL_API_KEY` in .env is INVALID (401); `CAL_BOOKING_URL` env var (empty as of 2026-06-11) is what the brief embeds — ask Ryan for his link if still unset.

**Why:** replies were rotting in inboxes (6 found day one); disorganization came from channels never reporting back to one place.
**How to apply:** any new outreach channel gets wired INTO the engine (engagement → stage → brief), not run as a silo. Check `logs/meeting_engine.log` if briefs stop arriving.
