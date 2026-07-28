# LinkedIn revenue channel — connect → warm → Loom → meeting (2026-07-26)

Goal Ryan set: 1-2 signed clients/month from LinkedIn alone. The Oloxa loom
playbook, ported onto the Dealthreads engine.

## The honest math first (targets, not promises)

- 20 invites/weekday = ~100/wk. Staffing owners accept cold invites at ~25-35%
  (industry range; we'll have OUR observed rate within 2 weeks).
- → 25-35 fresh accepts/week = **5-7 Looms/day**, comfortably inside one block.
- Personal video DM to a fresh accept replies at ~15-25% (Oloxa-style; observed TBD).
- → 4-8 conversations/week → 1-3 meetings/week at normal convo→meeting rates
- → 1-2 closes/month requires ~20-30% meeting→close, which matches our warm-deal
  observed range. **The math closes — IF every stage hits floor.**

Tripwires (same discipline as email): after 200 invites, if accept rate <15%,
the target list or profile is the problem — fix before adding volume. After 50
Looms, if reply rate <8%, the script is the problem — rewrite before recording 50 more.

## The pipeline (stages mirror Oloxa, ledger = linkedin_feed.json)

1. **CONNECT** — 20 blank invites/weekday from the queue (already live).
2. **ACCEPT** — detected during the daily Chrome block (diff of recent
   connections vs ledger). Recorded with `accepted_at`.
3. **WARM (2 days)** — no pitch. If they posted recently, one genuine comment
   (drafted by me, approved by Ryan). Accept +2 weekdays = Loom-due.
4. **LOOM (Stage I)** — 90-second personal video, 3-section script (template:
   [[loom-script-dealthreads]] → loom-script-dealthreads.md). Ryan records in one take,
   pastes the Loom URL (HARD GATE — no URL, no ledger write; Oloxa learned this
   with 45 broken records), sends the DM himself.
5. **F1 (24h)** — one-liner bump: "worth 90 seconds?" **F2 (+3 days)** — the
   value drop: 3 real rows from their market, then quiet.
6. **REPLY → deal registry** — same-day package rule applies; meetings booked
   on the thread, not via "here's my link" alone.

## Division of labor (the line that keeps the account alive)

- Machine: queue building, accept detection, warming timers, script rendering,
  follow-up due-dates, ledger, funnel counts on the scoreboard.
- Ryan: records the Looms (the face IS the differentiator — nobody outsources
  trust), sends every DM, books the meeting.
- Me: drive Chrome for invites + accept scans, draft every comment/DM/script,
  surface the due queue each morning.

## Why Looms here specifically

The Dealthreads sale is "watch the system run my own company." A Loom IS that
demo in miniature: Section 2 literally screen-shares the live signal table with
the prospect's market on it. The medium is the proof. Cost: ~10 min/day of
recording for 5-7 sends. Loom free tier caps at 25 videos — use the trick of
deleting after download or pay the $15/mo (still $125 under Sendr).

## Operating rhythm

- 11:45 queue staged → 12:17 connect block (invites + accept scan, automated)
- Loom block (~20-30 min, Ryan + me): cards one at a time — script on
  clipboard, profile open, record, paste URL, send DM, next.
- F1/F2 dues surface in the morning brief with the 💼 deal actions.
- Weekly: funnel line on the Sunday scoreboard — invites → accepts → looms →
  replies → meetings, with the weakest stage named.
