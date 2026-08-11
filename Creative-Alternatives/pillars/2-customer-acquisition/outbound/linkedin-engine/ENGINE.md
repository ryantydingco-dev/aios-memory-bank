# LinkedIn Connect → Loom → Follow-Up Engine

Built 2026-08-09 per Ryan's spec: **automated connects, manual Looms, automated
follow-ups, goal = booked meetings.** Runs daily as a scheduled task that drives Ryan's
Chrome (claude-in-chrome). No HeyReach, no third-party tools.

## The funnel (state machine per prospect)

```
TARGET → CONNECT_SENT → ACCEPTED → LOOM_SENT → FU1 → FU2 → FU3 → EXHAUSTED
                            │           (any reply at any stage → REPLIED: cadence
                            │            STOPS, prospect flags to Ryan's queue)
                            └── Ryan's daily LOOM QUEUE (manual, ~5-10/day)
```

| State | Who acts | What happens |
|---|---|---|
| TARGET | engine | picked from source list (priority below) |
| CONNECT_SENT | engine | connection request, NO note, ~20/day, human pacing |
| ACCEPTED | engine detects | surfaces in the daily **Loom queue** with full context (company, show, title, email-engagement) |
| LOOM_SENT | **Ryan** (manual) | Ryan records + sends the Loom DM himself. Engine auto-detects it by scanning sent DMs for a loom.com link and stamps the date |
| FU1 / FU2 / FU3 | engine | automated follow-up DMs on day 2 / day 5 / day 9 after the Loom (templates below) |
| REPLIED | engine detects | **any inbound reply anywhere stops all automation** for that person and pushes them to Ryan's reply queue. The engine NEVER converses. |
| BOOKED | Ryan marks | meeting on calendar — logged to pipeline tracker |

## Target sourcing (priority order, refreshed daily by build_targets.py)
1. **Campaign repliers** (Smartlead) — hottest, connect same day
2. **Multi-openers/clickers** (Smartlead stats, ≥2 opens) — warm
3. **Fresh exhibitor contacts** from enriched CSVs (linkedin column) — cold, same shows
   the emails are hitting, so the connect lands next to the email touch

## Daily run (scheduled task `linkedin-engine`, weekdays 8:00am)
1. `python3 build_targets.py` — refresh targets from Smartlead + enriched CSVs
2. Open LinkedIn in Chrome. Check invitations: newly accepted → ACCEPTED
3. Scan DM inbox: inbound replies → REPLIED (stop cadence, flag to Ryan). Scan sent
   DMs for loom.com links → stamp LOOM_SENT
4. Send due follow-ups (FU1/FU2/FU3) — ONLY if templates are Ryan-approved (see gate)
5. Send ~20 new connection requests (no note), 30-90s human pacing between actions
6. Write the daily brief to `daily-brief.md`: Loom queue (accepted, with context),
   replies needing Ryan, counts by state, any anomalies (captcha, restriction warning)
7. Update state.json. STOP at any LinkedIn warning/captcha — never push through one.

## Ryan's two manual touchpoints (by design)
- **Loom block (~30 min):** record + send 5-10 Looms to the day's ACCEPTED queue.
  Loom formula: 60-90s, screen on their booth/company site, "saw you're exhibiting at
  {{show}} — made this for you", show a quick mockup concept or the lookbook, CTA =
  "worth a quick call?" with the booking link
- **Reply queue:** every REPLIED prospect same day

## Follow-up templates — ⚠️ GATE: RYAN MUST APPROVE BEFORE THE ENGINE SENDS THESE
(Connects carry no text so automation of those starts immediately; DMs in Ryan's voice
ship only after his sign-off. Edit freely, then tell the engine "templates approved".)

**FU1 (day 2 after Loom):**
> Hey {{first_name}} — know that video was out of the blue. Worth a watch when you get
> a minute, it's specific to {{company}}'s booth at {{show}}. Happy to answer anything.

**FU2 (day 5):**
> {{first_name}}, quick one — if booth swag for {{show}} is on your plate, I'll put
> mockups on your actual logo this week, no cost. Easier to talk through live:
> {{booking_link}}. 15 min and you'll have something to show your team.

**FU3 (day 9, close the loop):**
> Last note from me before {{show}} prep gets real. If it's handled, good luck at the
> show — genuinely. If not, the mockup offer stands: {{booking_link}}.

## Config (config.json)
- `booking_link`: cal.com/ryan/30min ← ⚠️ CONFIRM this is the live CA-appropriate link
- `daily_connect_cap`: 20 (LinkedIn safety; do not raise past 25)
- `daily_fu_cap`: 25
- `templates_approved`: false ← flips to true only on Ryan's explicit OK

## Guardrails
1. Any reply kills automation for that prospect, permanently. Humans talk to humans.
2. Stop the entire run on any captcha, restriction banner, or unusual-activity warning
   and flag it in the brief. An account restriction costs more than a missed day.
3. Caps are hard. The engine sends volume through EMAIL (5K/day capacity); LinkedIn is
   the warm layer, not the volume layer.
4. Follow-ups reference the Loom and the show — if either merge field is missing, the
   prospect is skipped and flagged, never sent a broken template.
5. State lives in state.json (git-tracked); every run commits its changes so the
   pipeline survives any session.
