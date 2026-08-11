# Loop: deliverability

**Judge metric:** overall bounce rate across sending campaigns; per-campaign bounce rate and unique-open rate. Source: `smartlead_campaigns` in `data/data.db`.
**Cadence:** weekly, Mondays.
**Stop condition:** none — this loop is the immune system of the cold-email engine (71 inboxes). It protects every other outbound loop.

## What a run does

1. `loop_metrics.py report deliverability` — overall bounce + flagged campaigns + deltas.
2. Read `memory.md`: what was flagged last week, what remediation was recommended, did the numbers recover?
3. **Verify**: for each past flag, did bounce/open rates move after the recommended action?
4. Triage this week's flags:
   - Bounce rate >2% on any campaign → recommend pausing that campaign's sends and re-verifying the list (list quality, not inbox health).
   - Bounce rising across MANY campaigns at once → inbox/domain problem → recommend running the `email-deliverability-audit` skill and checking SmartLead warmup stats.
   - Open rate <25% on an ACTIVE campaign **with open-tracking enabled** → possible spam-folder placement → recommend a placement test. (Known caveat: Dealthreads campaigns report 0% opens because tracking is off — never flag those on opens.)
5. Append memory entry; Telegram ping only if something is flagged (green weeks = one-line "all clear").

## Guardrails

- **Recommendations only.** The loop never pauses campaigns, never touches inbox/warmup settings, never edits DNS. Ryan executes.
- A real deliverability incident (blocklist, mass bounces) escalates to the `deliverability-incident-response` skill, out of loop.
