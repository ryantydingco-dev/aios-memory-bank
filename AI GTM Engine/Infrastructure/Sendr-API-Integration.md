# Sendr.ai API Integration

**Added:** 2026-06-10 · **Status:** Key verified live ✅

## Credentials

```
SENDR_API_KEY=skprod_bwbbfdiv_1GgPr+8onwddqpDDkVE5vW1xjpLzYv4VPTOLm1wIkrM=
```

- Auth header: `X-API-Key: <key>`
- Base URL: `https://api.sendr.io`
- Workspace: **Deal Threads** (`gje9pic8hfmau6p7vdhpqe3g`) · Seat: `yudnza0yqbpf7ms0xqf5jfqt` · Role: OWNER · ryan@dealthreads.io
- Docs: https://docs.sendr.io/ (OpenAPI spec: https://api.sendr.io/openapi)
- Key management: https://app.sendr.io/settings/api-keys

## What's already in the workspace (as of 2026-06-10)

| Asset | Detail |
|---|---|
| Campaign `8258` "DealThreads" | ⚠️ **belongs to the OLOXA motion** (despite the name) — DRAFT, 2 steps, 283 contacts from Oloxa master queue. Do not touch for AR-recovery. |
| Sheet `abfafi0d2yho08p5mplsnhv2` | `Oloxa_MASTER_QUEUE_2026-06-01.csv`, 283 rows (Oloxa) |
| Page template `7202` "My first template" | VIDEO type, only `firstname` var — used for API self-test |
| Page template `7376` **"AR Leak Check cold page"** | ⭐ PRODUCTION template (built 2026-06-10 via Chrome automation): Ryan's 73-sec Loom uploaded, vars `firstname` (fallback "there") + `company` (fallback "your firm"). **CTA "Get My Free Leak Check" → scrolls to on-page Calendly embed** (Calendar section "Grab 15 minutes", Calendly integration → "30 Minute Meeting" event; bookings tracked in Sendr Settings→Calendar). Dynamic website background confirmed end-to-end — test pages: https://sendrpage.com/zau34oh60z (pre-calendar), https://sendrpage.com/j519v1a1vv (with calendar) |

## AR-recovery launch assets (built 2026-06-10)

- **Launch kit** (video script + template spec + channel copy + run order): `First-Customer Sprint/Sendr Launch Kit - 2026-06-10.md`
- **Batch page generator**: `Operations/scripts/sendr_generate_pages.py` (resumable, dry-run, credit-safe)
- **Pipeline verified live**: self-test page generated via API → https://sendrpage.com/qaeij9bc85 (Ryan's own data, template 7202)
- Pending from Ryan: record the 90-sec script, build the `AR Leak Check — cold page` template (vars: `firstname`, `company`), booking link for the CTA button

## API surface (v1)

| Endpoint | Use |
|---|---|
| `GET /seat/me` | Verify key / who am I |
| `GET /api/v1/sheet` · `GET /sheet/{id}` · `GET /sheet/{id}/column` | Read lead sheets |
| `POST /api/v1/sheet/{sheetId}/row` | Push a lead into a sheet (feeds campaigns) |
| `GET /api/v1/campaigns` · `/campaigns/{id}` | Read campaign status/stats |
| `GET /api/v1/page-template/list` · `/page-template/{id}/variables` | Discover templates + their variable tags |
| `POST /api/v1/enrichment/sendr-page` | **Generate a personalized landing page** from a template (`templateId` + `variablesValues` map, e.g. `{first_name, company}`; optional `videoBackgroundUrl` = prospect's website behind the video, `gifSource`) |
| `POST /api/v1/enrichment/sendr-page-webhook` | Page generation via webhook pattern (Clay/n8n style) |
| `POST /api/v1/enrichment/dynamic-audio` | Queue personalized audio (name-swap via ElevenLabs voice) |
| `POST /api/v1/enrichment/generate-video` | Queue personalized video: `audioUrl` + `videoUrl` + `targetWord`→`replacementWord`, modes `merge`/`lipsync`/`video_only`, optional `webhookUrl` for completion callback |
| `POST/GET/PATCH/DELETE /api/v1/webhook` | Workspace webhooks → fire on engagement events (page visits, video views, clicks) into n8n/Make/own endpoint |

## How this plugs into the 30-day AR-recovery sprint

The play: record ONE video pitching the AR Leak Check; the API stamps out a per-prospect version where the firm name is voice-swapped and their own website scrolls behind the video on a branded page. Email contains a personalized GIF thumbnail → page link. Webhook fires when a prospect watches → that's the hot-lead signal for same-day follow-up/call.

Pipeline (all scriptable from this machine):
1. **Vibe Prospecting list** (CSV) → `POST /sheet/{sheetId}/row` or generate pages directly per row
2. **Per row:** `POST /enrichment/sendr-page` with `variablesValues` = {first_name, company, …} + `videoBackgroundUrl` = their site → returns page URL + GIF HTML
3. **Merge** page URL + GIF into Smartlead custom fields → send in existing AR-recovery sequences
4. **Webhook** on page-visit/video-view → log to Airtable pipeline + alert Ryan → call while warm

Credit economics: $119/mo plan = 2,500 credits + 250 videos. Reserve videos for TOP-150 invoice-chase tier; pages+GIF only for the 1,000-firm Smartlead lane.

## Quick test commands

```bash
# whoami
curl -s -H "X-API-Key: $SENDR_API_KEY" https://api.sendr.io/seat/me

# template variables (template 7202)
curl -s -H "X-API-Key: $SENDR_API_KEY" https://api.sendr.io/api/v1/page-template/7202/variables

# generate a page
curl -s -X POST -H "X-API-Key: $SENDR_API_KEY" -H "Content-Type: application/json" \
  -d '{"templateId":7202,"variablesValues":{"first_name":"Jane","company":"Acme CPA"},"videoBackgroundUrl":"https://acmecpa.com"}' \
  https://api.sendr.io/api/v1/enrichment/sendr-page
```
