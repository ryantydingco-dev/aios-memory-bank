# Restoration Homes — AgentMail Seller Outreach / Reply Desk Plan

Created: 2026-06-03
Source site: https://www.restorationhomes.com/

## Context

Restoration Homes is a cash home buyer in the Midlands of South Carolina. Core offer from site:

- Cash offer in 24 hours
- Close in as little as 7–10 days
- Sell as-is
- No fees / no commissions
- No repairs / cleanup / showings
- Service area: Columbia, Lexington, Irmo, Newberry, Sumter, Chapin, and surrounding Midlands SC areas
- Phone: (803) 590-8818

Buddy's idea: pull potential seller data from CRS and emails via Tracerfy, then run email drip campaigns. Ryan could be paid per listing/deal sold from leads generated.

## Recommendation

Use Smartlead for outbound sending and AgentMail as the AI reply desk / seller triage inbox.

Do not use AgentMail as the main cold email sending engine.

## Clean stack

- Data source: CRS / Tracerfy / county/public records
- Ryan/Hermes: list scoring, segmentation, copy, compliance-safe messaging
- Smartlead: email sending, inbox rotation, unsubscribe handling, deliverability
- AgentMail: seller reply inbox, classification, drafting, routing, follow-up tasks
- CRM/Tracker: source of truth
- Human: Restoration Homes approves responses and handles offer/closing conversations

## Best AgentMail use cases

### 1. Seller Reply Desk

All replies from drip campaigns route into AgentMail. The agent classifies:

- HOT_SELLER
- WANTS_CASH_OFFER
- HAS_QUESTIONS
- NOT_INTERESTED
- AGENT/BROKER
- WRONG_PERSON
- UNSUBSCRIBE
- LEGAL/ANGRY
- NEEDS_CALLBACK
- NURTURE

For each reply, AgentMail generates:

- seller summary
- property/location if available
- motivation signal
- urgency
- drafted reply
- recommended next action
- callback task
- tracker update

### 2. Lead Intake Inbox

Create a dedicated inbox like offers@restorationhomes-agent.com or sellers@restorationhomes.com if they want to use their domain.

AgentMail watches incoming seller messages and turns them into structured lead cards.

### 3. Daily Seller Opportunity Brief

Every morning:

- hot seller replies
- callbacks needed
- questions waiting
- new offer requests
- angry/unsubscribe messages
- lead source/campaign performance

### 4. Nurture Follow-Up Assistant

For interested-but-not-ready sellers, the agent drafts follow-ups:

- checking in after 7 days
- asking if they still want a no-obligation cash offer
- offering to compare options
- moving urgency-based sellers to call queue

### 5. Lead Scoring

Score potential sellers by signals:

- absentee owner
- long ownership tenure
- high equity
- inherited/probate indicators
- tax delinquency if available/legal
- vacant property indicators
- code violations if public/legal
- out-of-state owner
- distress/condition language
- old listing/expired listing
- rental owner

Use caution with data source legality/compliance.

## Campaign angles

### Angle 1: As-is convenience

For homeowners who may not want repairs/showings:
"If selling as-is would be easier than repairs, showings, and waiting on financing, Restoration Homes can make a no-obligation cash offer."

### Angle 2: Timeline flexibility

"You can close quickly or on your timeline."

### Angle 3: Local Midlands buyer

"We’re local to the Midlands and buy directly in Columbia/Lexington/Irmo/Chapin/etc."

### Angle 4: No obligation / compare options

"Even if you’re just curious what a cash offer would look like, there’s no obligation."

## Compliance / risk notes

- Follow CAN-SPAM: clear sender identity, physical mailing address, unsubscribe mechanism, honor opt-outs quickly.
- Avoid deceptive subject lines or pretending to know personal circumstances.
- Avoid fair housing/discriminatory targeting or language.
- Check real estate solicitation rules, licensing/agency rules, DNC/TCPA if layering calls/texts.
- If using public records/CRS/Tracerfy, confirm permitted use and email consent/solicitation rules.
- AgentMail should not auto-send sensitive/legal replies without approval.

## Suggested business model for Ryan

### Option A: Pay-per-closed-deal only

High upside, but Ryan carries all risk. Only do this if attribution is clean and deal value is meaningful.

### Option B: Hybrid retainer + success fee — recommended

- Setup: $1,500–$3,500
- Monthly ops: $750–$1,500/mo
- Success fee: $500–$2,500 per closed transaction OR negotiated %/flat fee if legally permissible

### Option C: Internal beta/friend deal

- $0–$500 setup to test
- clear success fee per closed deal
- 60-day pilot
- written attribution rules

## Attribution rules needed

Define:

- lead source campaign ID
- reply/call timestamp
- property address
- owner email
- CRM status
- what counts as sourced by Ryan/system
- success fee trigger: signed agreement? closed sale? listing taken? property bought?
- payment due date after close

## First pilot plan

1. Pull 500–1,000 potential sellers in Midlands SC.
2. Segment into 3 groups:
   - absentee/high-equity
   - older ownership / likely equity
   - problem-property/vacant/distress if legally available
3. Verify emails.
4. Launch 3-email Smartlead sequence.
5. Route replies to AgentMail seller reply desk.
6. AgentMail classifies and drafts replies.
7. Restoration Homes handles calls/offers.
8. Ryan reviews weekly numbers.

## One-line strategy

Smartlead gets seller conversations started; AgentMail makes sure no seller reply gets missed, every response is classified, and the Restoration Homes team gets a daily hot-seller call list.
