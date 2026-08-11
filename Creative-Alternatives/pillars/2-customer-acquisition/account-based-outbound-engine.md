# Account-Based Outbound Engine

> **Governing outbound document.** This replaces competing launch orders with one account-based operating model. Existing campaign docs, copy, lists, and scripts remain supporting assets. No segment is selected and no campaign is authorized by this document.

## Objective

Turn cold email, LinkedIn, and calls into one coordinated account journey that produces qualified merchandise conversations without double-touching people, confusing ownership, or scaling beyond CA's response and fulfillment capacity.

The account is the unit of work. Contacts and channel touches belong to an account plan; they are not three independent campaign lists.

## Current evidence

- Summer camps produced a 10.1% reply rate in the observed March campaign.
- Squash/racquet produced a 5.2% reply rate and sits next to CA's deepest category proof.
- Broad law, financial, construction, and corporate campaigns produced far weaker interested yield despite healthy delivery.
- Timing, buyer role, and adjacency to real CA customers materially changed outcomes.
- Reply-to-quote follow-through and cross-channel visibility have been bottlenecks; more volume does not fix them.

These facts narrow the field. They do not select the next segment automatically.

## Segment decision gate

Ryan selects exactly one segment using `operating-system/trackers/outbound/segment-decision-scorecard.csv`.

Score each candidate from 0–5:

| Criterion | Weight | Question |
|---|---:|---|
| Merch necessity | 25% | Is branded merchandise a recurring operational need rather than a nice-to-have? |
| Proof proximity | 20% | Can CA show real adjacent customers, products, or results with permission? |
| Buyer clarity | 15% | Is there a reachable person who owns the decision? |
| Timing | 15% | Is there a current planning, event, season, hiring, or gifting window? |
| Reachable accounts | 10% | Is there a sufficient account pool after customer and prior-touch suppression? |
| Fulfillment fit | 10% | Can CA deliver the likely product mix and timing without straining the back office? |
| Multichannel reach | 5% | Can the same accounts be reached responsibly across email, LinkedIn, and phone? |

Weighted score:

```text
(merch necessity × .25)
+ (proof proximity × .20)
+ (buyer clarity × .15)
+ (timing × .15)
+ (reachable accounts × .10)
+ (fulfillment fit × .10)
+ (multichannel reach × .05)
```

### Mandatory evidence before `selected`

- One paragraph explaining why now.
- A named buyer-role hypothesis.
- At least one real CA proof set, marked public, private, or `[CONFIRM]`.
- Estimated reachable account count after QuickBooks and prior-touch suppression.
- Current delivery-capacity review with Kenny/Maclaine.
- A stop threshold and a decision date.

### Automatic disqualifiers

- Active CA customer or active service issue in the cold cohort.
- No clear human buyer.
- No reason the account should care in the next 90 days.
- Expected product/delivery load CA cannot support.
- A contact source that cannot support opt-outs and cross-channel suppression.

Only one row may be `selected`. All others remain `candidate`, `parked`, or `rejected`.

## Account lifecycle

| Stage | Definition | Exit condition |
|---|---|---|
| Research | Account matches the selected segment; facts are being gathered | Minimum evidence complete |
| Suppression review | Customer, prior touch, do-not-contact, and service-issue checks | All four checks pass |
| Human approved | Ryan approves account and contacts for a dry run or pilot | Account plan has owner and why-now |
| Coordinated cadence | Approved channel plan is active | Reply, live conversation, cadence end, or suppression |
| Conversation | A human response or referral exists | Qualified, nurture, disqualified, or do-not-contact |
| Qualified | Real need, timing, buyer, and next step confirmed | Meeting, request, or quote workflow |
| Opportunity | Human-approved commercial work is in motion | Won, lost, or hold |

Until a CRM flow is reviewed and live, `account-plan-template.csv` is the planning layer and `touch-ledger-template.csv` is the reconciliation layer. Do not treat them as a production database.

## Minimum account plan

Every approved account needs:

- Why this account fits the selected segment.
- A real trigger, planning window, or recurring need.
- Primary and secondary roles, not just names.
- The one proof artifact most relevant to the account.
- QuickBooks customer check.
- Prior-touch and do-not-contact check.
- Active service-issue check.
- One owner and one next action.
- Channel status for email, LinkedIn, and phone.

No personalized claim may be generated from an unverified inference. Use `[RESEARCH]` or omit it.

## Three-channel orchestration

The precise days are chosen only after the segment and timing are known. The operating sequence is:

1. **Email establishes relevance.** A concise note connects the account's real event/need to CA's relevant proof. The first cold email should stay plain text; a mockup may be offered or referenced only when a quality-controlled asset actually exists.
2. **LinkedIn establishes a human.** A view, connection, or profile touch adds familiarity. No automated pitch pile-on. A DM is used only when the profile and message fit the chosen segment and platform rules.
3. **Phone resolves ambiguity.** Call the account when there is a reason: a direct number, a timing window, engagement, or a high-fit account that merits research. The call seeks the right owner or a concrete next step.

### Default pilot shape

| Window | Channel action | Rule |
|---|---|---|
| Day 0 | Email 1 | One verified reason and one low-friction question |
| Day 1–3 | LinkedIn view/connect | No duplicate pitch; human profile must be credible |
| Day 3–5 | Email 2 or LinkedIn message | Choose the channel with a signal; do not use both blindly |
| Day 5–8 | Human call | Reference prior contact only if it occurred |
| Day 9–12 | Proof or useful follow-up | Only if relevant; no generic brochure dump |
| Day 12–16 | Final human decision | Close loop, nurture with a real date, or suppress |

This is a coordination pattern, not authorization to enroll contacts.

## Stop and suppression rules

- A reply anywhere pauses every other channel.
- An opt-out or do-not-call anywhere suppresses the person everywhere.
- A negative account-level signal may suppress the whole account; a referral to the right owner may continue under the new owner.
- Never call a person because an open pixel fired. Opens are noisy; use fit, a verified event, clicks, replies, or human judgment.
- No more than one active owner per account.
- No new automated touch after a human conversation until the owner records the next step.
- QuickBooks customers are not cold prospects. They belong in a separate warm motion.

The existing `scripts/ca_touch_ledger.py` provides useful email-level suppression. The account plan adds account-, service-, and channel-level review that the current ledger does not cover.

## Roles

| Role | Responsibility |
|---|---|
| Ryan | Segment decision, list quality, research standard, deliverability, weekly experiment decision |
| Maclaine | Warm human voice, replies, buyer conversations, handoff context |
| Kenny | Pricing, unusual product/vendor judgment, relationship exceptions |
| System | Research, draft, reconcile, flag, and report; never activate or send in this cycle |

## Pilot readiness gate

A controlled pilot can be proposed only when:

- One segment is marked `selected`.
- 20 accounts have complete plans; at least 10 pass human review.
- The account and touch trackers have no duplicate owners or unresolved suppression checks.
- Email, LinkedIn, and call language pass a dry run.
- Every reply has an owner and same-business-day handling plan.
- A mockup promise has a defined quality and response-time owner.
- Operations confirms the likely work can be absorbed.
- The stop thresholds below are written into the decision note.

Launching still requires explicit new authorization.

## Measurement

Measure at account and opportunity level, not as three isolated channel reports.

Primary:

- Qualified accounts / unique accounts touched.
- Meetings or real merchandise briefs / unique accounts touched.
- Quote requests and closed-won gross profit by selected segment.
- Median human response time to positive replies.

Diagnostic:

- Email delivery, bounce, positive replies.
- LinkedIn connection and reply outcomes.
- Dials, live conversations, and referrals.
- Accounts touched in more than one channel before a response.
- Opt-outs, duplicates caught, and active-customer suppressions.

### First-cycle stop rules

- Stop immediately for a suppression failure, active-customer cold touch, material factual error, or deliverability breach.
- Pause and review if reply ownership exceeds one business day.
- At the predeclared sample size, continue only if there is evidence of qualified conversations—not opens, likes, or raw replies alone.
- Change one variable per learning cycle: segment is fixed for the cycle; test account filter, reason-why-now, proof, or CTA one at a time.

Record weekly results in `operating-system/trackers/outbound/weekly-scorecard.csv`.

## Weekly cadence

### Monday: approve the book

- Confirm the selected segment remains valid.
- Approve, revise, or remove account plans.
- Check suppression, capacity, ownership, and proof readiness.
- Reconcile any activity from the prior week.

### Daily: protect response time

- Replies and live conversations first.
- Record channel activity and next action.
- Stop other channels when a response occurs.
- Surface any quote/pricing block the same day.

### Friday: learn

- Read qualified outcomes by unique account.
- Review exact objections and referrals.
- Identify one operating change for the next cohort.
- Capture one content-safe lesson or artifact.

## First implementation cycle

The outbound tasks for days 1–30 live in `plans/first-30-days-unified-operating-plan.md`. The first two weeks are decision, research, suppression, and dry-run work only. No prospect contact is part of the workspace setup.
