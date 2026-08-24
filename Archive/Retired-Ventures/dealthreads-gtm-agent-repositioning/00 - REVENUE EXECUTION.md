# Deal Threads Revenue Execution

Last updated: 2026-07-28  
Status: active operating source of truth  
Scope: specialized staffing and recruiting firms only

This is the daily command center for turning existing interested cold-email replies into Pipeline Math calls and paid Revenue AIOS installs.

Do not add another vertical, restart broad cold-offer strategy, or send more volume while an interested reply is waiting. The current bottleneck is conversion, not lead supply.

## The only path

`Interested reply -> fast human response -> tailored answer/sample -> two proposed times -> warm-call task -> LinkedIn continuity -> Pipeline Math call -> proposal -> paid install`

Every live opportunity must exist in [Revenue Pipeline.csv](Revenue%20Pipeline.csv). That CSV is the one scoreboard input. Email, calls, and LinkedIn are touches on the same account thread, not separate funnels.

Use [18 - Interested Reply to Install Playbook.md](18%20-%20Interested%20Reply%20to%20Install%20Playbook.md) for all copy, call structure, and the proposal/install handoff.

Use [scripts/revenue_pipeline_ops.py](scripts/revenue_pipeline_ops.py) to log milestones, generate a human-reviewed account work card, build the daily queue, validate the tracker, and produce the weekly channel scoreboard. It never sends a message or connects to an external tool.

## Service levels

| Trigger | Human action | Done bar | Target |
| --- | --- | --- | --- |
| Interested reply arrives | Read the thread and send a human response | Their exact question is acknowledged; no brochure dump | 15 minutes in working hours |
| Response sent | Build the smallest useful tailored answer/sample | Specific to their firm, specialty, and client-acquisition motion | 2 hours |
| Sample/answer ready | Send it and propose two concrete times | Two times include timezone; no naked calendar link | Same message |
| Times proposed | Create and attempt the warm call | Context references their reply; permission-based opener | Within 30 minutes when a valid number exists |
| Email thread is warm | Add LinkedIn continuity | One connection note; do not duplicate the pitch | Same day |
| Call booked | Prep Pipeline Math | Known numbers, unknowns, hypothesis, next-step goal | Before call |
| Pipeline Math call held | Send decision recap/proposal | Scope, price, acceptance tests, owner, kickoff date | Within 24 hours |
| Verbal yes/payment | Start install handoff | Paid status, kickoff date, inputs, owners | Same day |

If a reply arrives outside working hours, acknowledge it at the start of the next work block. Do not use automation to impersonate a human response.

## Daily operating cadence

### Opening block — 20 minutes

1. Run:

   ```bash
   python3 scripts/revenue_pipeline_ops.py board
   ```

2. Work the `NOW` queue from top to bottom.
3. Interested replies outrank new prospecting.
4. A response is not complete until the next action and due time are in the tracker.

### Reply conversion blocks — three times daily

Check email at the start, middle, and end of the selling day.

For each interested reply:

1. Log `interested-reply`.
2. Send the human response.
3. Log `human-response-sent`.
4. Build the tailored answer/sample.
5. Send it with two meeting times and log both milestones.
6. Attempt the warm call if a verified business/direct number exists.
7. Add one non-pitchy LinkedIn continuity touch.

Do not wait until the end of the day to batch warm replies.

### Call block — 30 to 45 minutes

- Attempt every due warm call.
- Leave one short voicemail at most.
- Do not call repeatedly because a prospect did not answer.
- Record outcome and the next permissioned step immediately.

### Closing block — 10 minutes

1. Run the board again.
2. Resolve overdue items or explicitly reschedule them.
3. Confirm every booked call has a prep owner.
4. Confirm every held call has a proposal task due within 24 hours.

## Weekly operating cadence

Run Friday after the final reply block:

```bash
python3 scripts/revenue_pipeline_ops.py scoreboard --days 7
```

Review one scoreboard, not separate email/call/LinkedIn dashboards.

Answer:

1. How many interested replies entered?
2. What was median time to first human response?
3. How many received a tailored answer/sample and two times?
4. How many received a warm-call attempt and LinkedIn continuity?
5. How many Pipeline Math calls were booked and held?
6. How many proposals, verbal yeses, paid installs, and lost deals?
7. Which source channel produced the most calls and paid installs?
8. Where did accounts stall?

The weekly decision must be one of:

- **Keep:** a step or message that advanced real opportunities.
- **Fix:** the single largest conversion leak.
- **Stop:** a touch that is duplicative, spammy, or not moving the account.

Do not optimize raw activity while response or proposal SLAs are being missed.

## Quick-start logging

Run these from this directory. Timestamps default to now; use `--at` for backfill.

```bash
# Capture an interested email reply.
python3 scripts/revenue_pipeline_ops.py log \
  --id "firm::first-last" \
  --company "Firm Name" \
  --contact "First Last" \
  --specialty "Healthcare staffing" \
  --target-client "Regional healthcare systems" \
  --channel email \
  --intent "question" \
  --reply-excerpt "How would this actually work for our firm?" \
  --verified-observation "Firm specializes in hard-to-fill clinical roles; verified on its service page" \
  --sample-opportunity "Illustrative: a regional health system with persistent clinical vacancies; verify a live account before sending" \
  --first-install-hypothesis "a human-approved account-priority and follow-up task queue" \
  --meeting-times "Tue 2:00 PM ET | Wed 11:30 AM ET" \
  --event interested-reply \
  --note "Interested reply captured from the existing email thread"

# Generate the account-specific work card. Review and edit it; nothing is sent.
python3 scripts/revenue_pipeline_ops.py packet \
  --id "firm::first-last" \
  --output "outputs/firm-first-last-work-card.md"

# Record milestones as they happen.
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event human-response-sent
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event sample-sent
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event times-proposed --meeting-times "Tue 2:00 PM ET | Wed 11:30 AM ET"
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event warm-call-attempted --note "No answer; one voicemail"
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event linkedin-continuity
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event pipeline-math-booked --meeting-at "2026-07-30T14:00:00-04:00"
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event pipeline-math-held
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event proposal-sent --proposal-value "5000"
python3 scripts/revenue_pipeline_ops.py log --id "firm::first-last" --event install-paid --proposal-value "5000"
```

The packet is allowed to say `BLOCKED`. That is the quality gate working. Resolve missing facts or placeholders before sending anything; never fill them with guesses.

Validate after manual CSV edits:

```bash
python3 scripts/revenue_pipeline_ops.py validate
```

## Operating rules

- Stay inside specialized staffing/recruiting until this motion produces repeatable calls and installs.
- Treat every interested reply as a human conversation, not as a sequence enrollment.
- Answer the question they actually asked before asking for time.
- Tailored means the artifact names their firm, specialty, likely buyer/client type, and one credible workflow or pipeline observation.
- Propose two times. A calendar link may be offered as a fallback, never as the entire response.
- A warm call is contextual follow-through on an existing conversation. It is not a new cold pitch.
- LinkedIn creates continuity and recognition; it does not mirror every email.
- No automated sends, auto-DMs, auto-calls, or unsupervised replies.
- No fabricated signals, case studies, ROI, placement economics, or guaranteed revenue.
- No proposal without explicit current-state math and an agreed first installed workflow.

## Definition of done for one opportunity

An account has advanced only when the tracker shows evidence:

- a real interested reply;
- a human response;
- a tailored answer/sample;
- two proposed times;
- a warm-call outcome or a documented reason not to call;
- a LinkedIn continuity touch or a documented reason not to use LinkedIn;
- a booked/held Pipeline Math call;
- a proposal decision;
- and either a paid install, nurture date, closed-lost reason, or do-not-contact state.
