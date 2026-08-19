# Store Pivot — SmartLead Load Checklist

Ryan approved the store-pivot copy 2026-08-19 ("run it"). This session (cloud, no
SmartLead keys by design) ran the verify-copy pass and prepped everything; the load
itself happens from Ryan's machine (Hermes/Claude Code session with the SmartLead
API key).

## Gate status

- [x] Copy written (six lanes, `*_store_v4.md` / `schools_store_v1.md`)
- [x] Ryan approval — 2026-08-19
- [x] Verify-copy pass DONE 2026-08-19 — rules lens (2 PASS, 4 one-line FAILs) and
      buyer lens (all six LOAD WITH EDITS). ALL fixes applied to the files; verdicts
      stamped in each file's header. Buyer ranking as loaded: gifting > legal ≈ race
      > tradeshow > gala > schools pre-edit; schools jumps to top-2 post-edit given
      the live back-to-school window (its urgency framing goes stale ~late Sept).
- [x] **Kicker + fulfillment (2026-08-19):** already proven on a live school
      store. Default = $5 flat/item to the org, families pay ~$60 + $10 ship,
      CA cost ~$20–25, per-order consumer fulfillment is what we just ran.
      Cold copy still does NOT state $5 — Maclaine delivers it with the
      preview. Kenny's cheap-production instinct is the cost side, not a
      reason to block load. DO confirm with Maclaine that $5 remains the
      default she will quote before the first new yes.
- [ ] Miller Johnson naming OK from Wil (legal lane) — anonymous swap ("a Michigan
      law firm") if he objects
- [ ] Merge branch `claude/grokbot-github-business-context-5tsorg` → main so local
      machines sync the copy

## Load order

1. **Corporate lanes first** (no kicker gate): trade show, gifting, legal. These can
   load as soon as the verify FAILs (if any) are fixed.
2. **Kicker lanes** (schools, race, gala) the moment Kenny/Maclaine sign off.
3. Schools needs a lead pull first (PTA presidents, athletic directors, booster
   chairs, private school admins — back-to-school window is live NOW; this is the
   most time-sensitive pull).

## Per-campaign SmartLead steps (API notes from 2026-08-11 session)

For each lane:
1. Create/clone campaign; load the 4-step sequence. E1 carries the subject; E2-4
   thread as replies with NO subject.
2. Verify merge-field population per lead before activation (AI ARK precedent:
   `company_name` populates, `company` does not). Set fallbacks. Drop leads missing
   required fields (per file header).
3. Schedule: M-F 9:00-17:00 ET. `max_leads_per_day` is NOT settable via /settings —
   use `POST /campaigns/{id}/schedule` with `max_new_leads_per_day` + full schedule
   payload (1000/day for big lists, 200/day for small ones like galas).
4. Account-level inbox signatures BLANK (hard rule — signature lives in body copy).
5. QA the first rendered sends (copy clean, fields populated, threading works).
6. Activate: `POST /campaigns/{id}/status {"status":"START"}`.
7. Existing v3 threads finish as v3 — v4 loads for NEW leads only. Do not swap copy
   inside a running campaign.

## Reply handling (unchanged)

Any interest → store preview per the page-pipeline SOP same day (logo scrape → 5
lane products → Gamma page, brand-matched, view-only). Every reply is Ryan's queue.
Kicker % and all pricing come from Maclaine with the preview. Draft, never send,
for anything customer-facing.
