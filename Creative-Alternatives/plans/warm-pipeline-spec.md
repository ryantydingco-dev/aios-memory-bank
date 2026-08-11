# Warm Pipeline — interested-but-silent leads, tracked to the sale

**Built 2026-07-17.** The system for outbound leads that replied "interested," got a
reply from us, and then went quiet — so they get chased on cadence instead of rotting
in an inbox, and carry all the way to an invoiced sale.

## The three layers

1. **System of record — HubSpot deal pipeline.** One deal per interested lead on the
   default Sales Pipeline (HubSpot account 246275995). reply-watcher stays the triage
   front-end; HubSpot is the pipeline of record downstream; QuickBooks is the close.
2. **Follow-up engine — HubSpot Tasks.** Each open deal has a task whose due date is the
   next-chase date. Cadence: our reply (day 0) → +3 business days → +7 → +14 → Nurture
   with a recycle date matched to the lead's timeline.
3. **Daily brief — the chase list.** `scripts/hubspot_warm.py:chase_lines()` is imported
   by `scripts/ca_daily_brief.py` and adds a "Warm pipeline" block to the 7:35am Telegram
   brief: pipeline $ total, "chase today" (task-driven), and "Kenny owes a quote."

## CA stages → native HubSpot stages

The connector can't create a custom pipeline, so CA's 7 stages map onto the 7 native
default stages. The mapping lives in `hubspot_warm.py:STAGE_LABEL`.

| CA stage | native id | meaning | ball with |
|---|---|---|---|
| Replied — Awaiting Them | appointmentscheduled | sent mockup/answer, waiting | them |
| Re-engaged | qualifiedtobuy | they came back, convo live | us |
| Pricing — Ball with CA | presentationscheduled | Kenny owes a quote | Kenny |
| Verbal Yes / Proofing | decisionmakerboughtin | committed; proof/sizing | us |
| (unused) | contractsent | — | — |
| Won — Invoiced | closedwon | written up in QuickBooks | — |
| Lost | closedlost | hard no / bad fit | — |

Nurture/Recycle has no native home — those deals sit in `appointmentscheduled` with a
far-dated task and a "NURTURE" note (e.g. Brunini → recycle Jan 2027).

### Optional 2-minute polish (Ryan, in HubSpot UI)
Settings → Objects → Deals → Pipelines → rename the 7 stages to the CA labels above.
Renaming keeps the stage **ids**, so every seeded deal and all the code keep working —
the UI just reads in CA's language. Add an 8th "Nurture" stage if you want it split out.

## Arming the automation (one-time, required)

The daily-brief warm section and the sync script need a **private-app token** in `.env`
as `HUBSPOT_TOKEN` (cron can't use the OAuth MCP connector).

**Status 2026-07-17:** `HUBSPOT_PRIVATE_APP_TOKEN` already exists in `.env` but the API
returns **403 Forbidden** — it's missing scopes or points at a different portal.

Fix: HubSpot → Settings → Integrations → Private Apps → (that app) → Scopes →
add `crm.objects.deals`, `crm.objects.contacts`, `crm.objects.tasks` (read + write),
confirm it's the **246275995** portal, save, copy the token into `.env` as
`HUBSPOT_TOKEN=pat-na1-...`. No code change needed after that — the brief section and
`sync_replies_to_hubspot.py` go live automatically.

## Files

- `scripts/hubspot_warm.py` — brief block + HubSpot upsert helpers (token-gated).
- `scripts/ca_daily_brief.py` — imports `chase_lines()` (already wired).
- `scripts/sync_replies_to_hubspot.py` — reply-watcher → HubSpot upsert (CLI + manifest).
- `pillars/2-customer-acquisition/reply-watcher/tasks.md` — triage board; deal IDs noted.

## The automation loop (once the token is armed)

- reply-watcher classifies a reply → `sync_replies_to_hubspot.py upsert` creates the
  contact + deal + a +3-day follow-up task.
- They reply again → advance the stage, reschedule/close the task.
- **Silence sweep** (daily, before the brief): any Awaiting-Them deal whose task is
  overdue with no new reply → auto-draft the next nudge into reply-watcher `drafts/` and
  flag it in the brief. **Never auto-sends** — a human approves and sends.
- **Won** → the QuickBooks invoice is the close signal; deal → closedwon, off the list.

## Seeded 2026-07-17 (13 deals, ~$32.5K est. warm pipeline)

Amounts are rough estimates to be refined. Deal/task IDs are in the git history of this
commit; contact IDs are the HubSpot contact records (7 pre-existed from SmartLead sync,
Brunini created fresh).

| Deal | CA stage | est. |
|---|---|---|
| Miller Johnson — mugs + padfolios (60 ea) | Pricing — Ball with CA | $4,500 |
| Harbor Haven — managed camp store | Verbal Yes / Proofing | $3,000 |
| Brunini — retreat kits (Feb 2027) | Nurture (recycle Jan 2027) | $3,000 |
| Porsche Financial — client gifting | Awaiting Them | $2,500 |
| CHLP — swag | Awaiting Them | $2,500 |
| PilieroMazza — swag | Awaiting Them | $2,500 |
| Weiss Serota — swag | Awaiting Them | $2,500 |
| Wuersch & Gering — swag | Awaiting Them | $2,500 |
| Hall Prangle — swag | Awaiting Them | $2,500 |
| Woodcraft Camps — camp merch | Pricing — Ball with CA | $2,000 |
| Camp Lilac — camp merch | Pricing — Ball with CA | $2,000 |
| SquashSmarts — racerbacks/skirts | Re-engaged | $1,500 |
| Wilmington CC — squash apparel | Re-engaged | $1,500 |

**Backfill needed:** Harbor Haven, SquashSmarts, Wilmington CC, Woodcraft, Camp Lilac
were created deal-only — add their contact emails (not in the reply files) to complete
the records.

**Excluded on purpose:** Apawamis (existing customer), Munck Wilson / Smith Anderson /
Gulf South (pure OOO auto-replies, no expressed interest — they stay in reply-watcher).
