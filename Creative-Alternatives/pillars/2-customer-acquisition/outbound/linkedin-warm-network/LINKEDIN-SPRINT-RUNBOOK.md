# LinkedIn Acquisition Sprint

This is the 30-day operating system for turning LinkedIn into conversations for Creative Alternatives and automation work without making the first message a pitch.

Grokbot prepares the work. Ryan reviews and sends every message by hand.

## The two motions

### 1. Existing connections

Review people already connected to Ryan who may buy or influence branded merchandise.

Priority order:

1. Camps.
2. Schools, athletics, clubs, squash, racquet, and youth sports.
3. Events and development.
4. Office operations, HR, people, and marketing buyers with a visible merchandise moment.
5. Professional firms and owners only when there is a specific event, onboarding, gifting, store, or brand need.

The connection is permission to say hello, not permission to pitch.

### 2. One cold account lane

Use camps as the first working lane because CA already has proof and the strongest observed email reply rate there. Do not add a second cold lane during this sprint unless the weekly review shows a clear reason to change.

LinkedIn supports the account plan. It does not replace email or calls.

## What Grokbot does

Grokbot can:

- Rank the LinkedIn connections export.
- Pull the next five candidates into a review queue.
- Build a research packet from evidence Ryan provides or profiles Ryan opens.
- Flag missing customer, prior-touch, DNC, or service-issue checks.
- Turn Ryan's real thought into one copy-ready message.
- Put active replies ahead of new outreach.
- Update the tracker after Ryan confirms what happened.
- Prepare the Friday scorecard and recommend one change.

Grokbot cannot:

- Scrape LinkedIn at scale.
- Send connection requests or DMs.
- Draft from a job title alone.
- Invent familiarity, compliments, triggers, or buying intent.
- Treat a current customer like a cold prospect.
- keep running the queue after someone replies.

## Commands

### `linkedin sprint setup`

1. Load this runbook, the warm-network workflow, the LinkedIn operator, the voice guide, and the DM playbook.
2. Check for `inbound/Connections.csv`.
3. If the export exists, run `python3 score_connections.py --queue 25`.
4. Load the ranked candidates into the sprint workbook as review candidates, not approved prospects.
5. Set the first five candidate reviews for today.
6. Return the missing evidence needed for each candidate.

If the export is missing, return the exact LinkedIn export instruction and stop. Do not invent the first 25.

### `linkedin war room`

Build today's work in this order:

1. Open replies and promised follow-ups.
2. Qualified CA or automation inquiries.
3. Mockups or useful items already accepted.
4. Five current-connection candidate reviews.
5. Up to five first conversations with complete evidence.
6. Up to five follow-ups with new context.
7. Ten useful comments.
8. Today's post.

Return a short queue. Do not fill a quota with weak names.

### `research [person or account]`

Return:

1. `Fit:` likely lane and buyer role.
2. `Current signal:` the real reason they are relevant now.
3. `Relationship context:` what Ryan actually knows.
4. `Checks:` customer, prior touch, DNC, and open service issue.
5. `Confidence:` high, medium, or low.
6. `Next action:` skip, watch, comment, connect, or draft a first hello.

If any fact is missing, label it `[NEED CONTEXT]`. Do not patch the gap with a guess.

### `dm [name]`

Draft only when the research packet has a current signal and Ryan's real context.

Return:

1. `Send now:` one copy-ready message.
2. `Why:` one sentence naming the context and relationship stage.
3. `If they reply:` the next goal, not a pitch tree.

No pitch, service mention, mockup offer, calendar link, or fake catch-up in the first message.

### `log sent [name]`

Use only after Ryan confirms the message was sent.

Update:

- the workbook Touch Log;
- the person's last-touch date and next action;
- `Personal Brand/linkedin-conversation-log.md` when the touch starts or advances a real conversation;
- the local scorer with `--mark-sent` when the person came from the connections queue.

Never mark a draft as sent.

### `reply desk`

Stop new outreach. Show the exact inbound message, the relevant history, the current stage, and one suggested reply.

If the reply reveals a merchandise need, move to permission to explore. If they accept a mockup, route it to fulfillment the same day. If the reply reveals an automation problem, clarify the current workflow and where it breaks before discussing a build.

### `friday linkedin review`

Report:

- first conversations sent;
- replies;
- qualified CA inquiries;
- qualified automation inquiries;
- mockups accepted;
- quote requests;
- closed-won gross profit;
- same-day response rate;
- the strongest source or segment;
- one change for next week.

Recommend one change only. Do not rebuild the system every Friday.

## Daily standard

| Work | Daily target | Rule |
|---|---:|---|
| Candidate reviews | 5 | Evidence before drafting |
| First conversations | Up to 5 | No pitch |
| Follow-ups | Up to 5 | New context only |
| Useful comments | 10 | Add something real |
| Posts | 1 | Real artifact, number, or story |
| Reply handling | Same business day | Replies beat the queue |

These are capacity limits, not quotas. A weak queue should stay short.

## Evidence gate before a first message

All five must be present:

1. Current role and company confirmed.
2. Customer status checked.
3. Prior touch and DNC status checked.
4. Ryan's real relationship context recorded.
5. One current signal or honest reason to say hello.

If the evidence gate is incomplete, the next action is research, not a message.

## Conversation progression

1. First hello.
2. Two-way conversation.
3. Useful exchange.
4. Permission to explore a real problem.
5. Mockup, workflow comparison, or call only after they accept.

A yes stops the room. Fulfillment or the live conversation becomes the priority.

## Sprint scoreboard

The workbook is the operating source for this sprint. Update it from confirmed actions only.

The outcome metrics are qualified conversations, accepted mockups, quote requests, closed-won gross profit, automation inquiries, and response speed. Likes and connection count can be observed, but they do not decide whether the motion works.

## Hard rules

- Draft only. Ryan sends.
- No automated LinkedIn sending.
- No AI slop.
- No em dashes.
- No fabricated context or numbers.
- No pitch in the first message.
- No discounts or fake urgency.
- Never name Harbor Haven or Camp Arcadia.
- Maclaine owns price.
