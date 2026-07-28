# Interested Reply to Revenue AIOS Install Playbook

Last updated: 2026-07-28  
ICP: owners, founders, managing partners, and BD leaders at specialized staffing/recruiting firms

This playbook starts after a real prospect has replied with interest. It is not a cold sequence.

The goal is to answer well, preserve momentum across email/phone/LinkedIn, run a Pipeline Math call, and reach a clear install decision.

## 1. Interested-reply router

### “Yes / interested / tell me more”

```text
[First name] — absolutely.

Based on [Firm]’s focus on [specialty], the first thing I’d map is how you identify and work the companies most likely to need that talent before the need turns into a crowded req.

I’ll send you a short, tailored example so this is concrete. Once you’ve seen it, I can walk through the pipeline math and whether an install would actually be worth it for [Firm].

Would [Day] at [Time] [TZ] or [Day] at [Time] [TZ] work?
```

### They ask a specific question

Use this order: direct answer -> tailored detail -> two times.

```text
Short answer: [one-to-three sentence direct answer].

For [Firm], I’d tailor that around [their specialty / buyer / current client-acquisition motion]. The practical output would be [one specific artifact or workflow], with a human approval step before anything customer-facing.

I can show you the account-level version and run the math with you. Is [Day] at [Time] [TZ] or [Day] at [Time] [TZ] easier?
```

### “Send information”

```text
Happy to. I don’t want to send you a generic deck.

I’ll make the example about [Firm] and [specialty]: the likely client-side signal, who would own the conversation, and what the first installed workflow would produce.

I can also walk through the numbers in 20 minutes. Would [Day] at [Time] [TZ] or [Day] at [Time] [TZ] work?
```

### Pricing question

Do not hide price if a current price is approved. Do not invent one if it is not.

```text
The price depends on the first workflow we install and how much of the data/outreach layer you want included. I don’t want to give you a fake range without seeing the current motion.

The Pipeline Math call is where we quantify the gap, choose the smallest useful install, and put a real number against it. Would [Day] at [Time] [TZ] or [Day] at [Time] [TZ] work?
```

### Interested, but bad timing

```text
Understood. I’ll keep this useful and low-pressure.

I can send the tailored example now, then circle back on [specific date or trigger]. If it is better, we can also use 20 minutes on [Day/time] just to capture the pipeline math while it is fresh.
```

### Clear no / wrong person

```text
Got it — thanks for the straight answer. I’ll close the loop.
```

For a referral:

```text
Thanks — I’ll reach out to [Name] and mention you pointed me their way. I won’t keep you copied on a sales thread unless you want that.
```

## 2. Tailored account answer/sample

The tailored sample is not a full free build. It is the smallest artifact that proves you understand their business and gives the call something concrete to discuss.

### Required inputs

These inputs belong in the canonical tracker and are rendered by:

```bash
python3 scripts/revenue_pipeline_ops.py packet --id "firm::first-last"
```

- Firm name and site.
- Staffing/search specialty.
- Target client type.
- Contact’s role.
- The exact question or interest expressed.
- One verified client-acquisition or operating observation.
- One verified or explicitly illustrative client-side opportunity.
- One first-install hypothesis.
- Unknowns clearly marked.

### One-page format

```markdown
# [Firm] — Revenue AIOS working sample

## What I heard
[Their question or stated interest, in their language.]

## Current pipeline hypothesis
[How they likely win clients today; label inference as inference.]

## One account/client-side opportunity
[A real, verified example or a clearly labeled illustrative example.]

## What the installed workflow would do
Trigger -> data/context -> human decision -> action/task -> recorded outcome

## What remains human
[Judgment, relationship, approval, call, close.]

## What I need to validate on the Pipeline Math call
1. [Unknown]
2. [Unknown]
3. [Unknown]
```

### Quality gate

Do not send until all are true:

- It could not be sent unchanged to another staffing firm.
- It answers the prospect’s question.
- Every external fact is verified or labeled as an assumption/illustration.
- It shows a workflow, not a list of AI tools.
- It states what remains human.
- It creates a useful question for the Pipeline Math call.

## 3. Two-times booking templates

Default:

```text
I can walk you through the example and run the pipeline math in 20 minutes. Would Tuesday at 2:00 PM ET or Wednesday at 11:30 AM ET work?
```

If neither works:

```text
No problem — send me two windows that are easier, or I can share my calendar as a fallback.
```

When they choose:

```text
Perfect — [Day, date] at [time] [TZ]. I’ll send the invite.

I’ll keep it to 20 minutes: current client pipeline, the math on one additional client, and the smallest workflow worth installing.
```

Never write only “here’s my Calendly.” Never offer vague “sometime next week.”

## 4. Warm-call scripts

Only call when there is a valid business/direct number and a real interested reply. Respect time zones and do-not-call requests.

### Live opener

```text
Hi [First name], Ryan here. Thanks for replying to my email about [specific topic].

I sent over [the tailored answer/sample]. I had one question that changes what I’d recommend for [Firm]: [short, relevant question].

Did I catch you with two minutes, or is later better?
```

If they have two minutes:

```text
When you look at new-client growth today, is the constraint more:

1) knowing which companies to approach,
2) getting enough relevant conversations, or
3) following up consistently once there is interest?
```

Then:

```text
That’s helpful. Rather than turn this into a surprise sales call, let’s use the 20-minute Pipeline Math session to quantify it and decide whether there is a sensible first install.

Would [time one] or [time two] work?
```

### If they are busy

```text
No problem. I’ll keep the detail in email. I proposed [time one] and [time two] there — reply with whichever is easier.
```

### Voicemail

```text
[First name], Ryan here. Thanks for replying to my email about [specific topic]. I sent the tailored [answer/sample] and two times for a short Pipeline Math call. No need to call back — replying to the email is easiest. My number is [number].
```

One voicemail is enough. Do not run a cold-call cadence on a warm reply.

## 5. LinkedIn continuity

LinkedIn’s job is recognition and continuity. Email remains the active thread unless the prospect chooses otherwise.

### Connection note after an email reply

```text
[First name] — good speaking over email about [specific topic]. Connecting here so you can put a face to the name. I’ll keep the actual detail in our email thread.
```

### After they accept

```text
Thanks for connecting. I sent the [Firm]-specific sample by email — no need to reply in two places. Looking forward to comparing the pipeline math.
```

### If LinkedIn is their preferred channel

```text
Happy to keep it here. The key question I’m tailoring around is [question]. I’ll send the short answer/sample here, then we can use [time one] or [time two] if either works.
```

### Guardrails

- Do not paste the full email into LinkedIn.
- Do not send a connection note, DM, InMail, and call in rapid succession.
- Do not engage with old personal posts to manufacture familiarity.
- Do not mention information that would feel invasive.
- Stop LinkedIn touches when they book, decline, or ask to stay in email.

## 6. Pipeline Math call

Length: 20 to 30 minutes.  
Outcome: a quantified business case and a decision on the smallest useful paid install.

### Agenda

1. Confirm the reason for the call.
2. Map current new-client pipeline.
3. Quantify economics and bottleneck.
4. Show the tailored workflow.
5. Choose the first install and decision process.

### Opening

```text
The goal today is simple: map how new-client pipeline works now, put numbers around the bottleneck, and decide whether there is a small Revenue AIOS workflow worth installing. If the math is weak, I’ll say so.
```

### Questions

Ask only what is needed; do not interrogate.

1. Which client vertical or role family is the priority for the next 90 days?
2. How do new client conversations start today: referrals, founder network, outbound, job signals, partnerships, or something else?
3. Roughly how many qualified client conversations happen in a typical month?
4. How many become a signed search, contract, or active req?
5. What is an average new client worth in the first 12 months? Use their number, not an industry claim.
6. Where does the motion break: account selection, context, first touch, follow-up, handoff, or reporting?
7. Who owns each step now, and how much time does it consume?
8. What systems already hold the needed data?
9. What must stay human for trust, judgment, or compliance?
10. What would have to be true 30 days after install to call it useful?

### Math worksheet

Use the prospect’s numbers:

```text
Current monthly qualified client conversations = A
Current conversation-to-new-client rate = B
Current new clients/month = A × B
Average 12-month gross revenue per new client = C
Current expected revenue from monthly pipeline = A × B × C

Target additional new clients/month = D
Qualified conversations required = D ÷ B
Conversation gap = required conversations - A

First-install price = E
Break-even additional clients = E ÷ C
```

If close rate or client value is unknown, show a low/base/high sensitivity range and label it. Do not manufacture precision.

### First-install selection

Choose one bottleneck:

- Account/signal prioritization.
- Tailored research and response preparation.
- Human-approved follow-up/task routing.
- Warm-reply conversion and meeting handoff.
- Pipeline scoreboard and weekly review.

Write it as:

`Trigger -> required context -> AI-assisted output -> human approval -> action -> recorded outcome`

Do not sell a broad “AI transformation” on the first call.

### Close

```text
Based on the numbers, the first install I’d recommend is [workflow], because the leak is [bottleneck].

I’ll send a short proposal with the workflow, what stays human, acceptance tests, price, and kickoff requirements by [specific time]. Is there anyone else who needs to approve it?
```

## 7. Proposal and install handoff

Send within 24 hours of a qualified call.

### Proposal template

```markdown
# [Firm] Revenue AIOS — first install

## Business outcome
[One quantified outcome tied to the Pipeline Math call.]

## Current-state math
[Inputs supplied by prospect, assumptions, and gaps.]

## Workflow being installed
Trigger -> context/data -> AI-assisted output -> human approval -> action/task -> recorded outcome

## In scope
- [Specific input]
- [Specific workflow]
- [Specific output]
- [Human approval point]
- [Scoreboard/measurement]

## Out of scope
- Unsupervised outbound or auto-replies
- Revenue, meeting, placement, or mandate guarantees
- Additional verticals/workflows not listed above
- [Other explicit exclusions]

## Acceptance tests
1. Given [input], the workflow produces [output].
2. A human can approve, edit, or reject before customer-facing action.
3. Every run records [status/outcome].
4. Failure/unknown states are visible and do not fabricate data.
5. The agreed owner can operate the workflow from the runbook.

## Delivery and owners
[Milestones, client owner, Deal Threads owner, dependencies.]

## Investment
[Setup/install fee, recurring fee if any, payment timing.]

## Kickoff
[Proposed date] after payment and required access/inputs.

## Decision
[Approver, decision date, next action.]
```

### Same-day recap

```text
[First name] — thanks for the straight conversation.

The math says [one-sentence finding]. The first install I recommend is [workflow], with [human step] staying human.

I’ve attached the short scope with acceptance tests, investment, and kickoff inputs. If it matches what we agreed, the next step is [payment/signature] and a [length] kickoff with [owners].

I can hold [kickoff option one] or [kickoff option two].
```

### Proposal follow-up

Use the agreed decision date. Do not “just check in.”

```text
[First name] — you said [decision date] was the right point to decide. Is the open question scope, economics, timing, or internal approval? I’m happy to resolve the real blocker; if it is not a priority, I’ll close the loop cleanly.
```

## 8. Required tracker outcomes

Every opportunity ends in one of:

- `install_paid`
- `nurture` with a date/trigger
- `closed_lost` with a reason
- `do_not_contact`

“Waiting” is not an outcome. It must have an owner, next action, and due time.
