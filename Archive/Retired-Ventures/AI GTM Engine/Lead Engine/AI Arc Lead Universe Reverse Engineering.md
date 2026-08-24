# AI Arc Lead Universe Reverse Engineering

## Source Location
Existing Oloxa exports found under:

`/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa`

Important files:
- `sway_handoff/SUMMARY_FOR_SWAY.md`
- `smartlead_segments/Oloxa_HOT.csv`
- `smartlead_segments/Oloxa_WARM.csv`
- `smartlead_segments/Oloxa_MILD.csv`
- `smartlead_segments/Oloxa_NONE.csv`
- `smartlead_segments/Oloxa_BEHAVIORAL_ALL.csv`
- `sway_handoff/Oloxa_HOT_US_ENRICHED.csv`
- `sway_handoff/Oloxa_HOT_UK_ENRICHED.csv`
- `sway_handoff/Oloxa_HOT_CA_ENRICHED.csv`

## What We Have

### Original US + UK Universe
- 5,061 verified-email leads passed fit screen.
- 936 had behavioral signals.
- 138 HOT.
- 329 WARM.
- 469 MILD.
- 4,125 NONE.

### Behavioral Distribution
From `Oloxa_BEHAVIORAL_ALL.csv`:
- US: 842
- UK: 94
- MILD: 469
- WARM: 329
- HOT: 138

### Signal Distribution
Most common behavioral signals:
- MOVE: 458
- CLOSING: 200
- CLOSING + MOVE: 116
- HIRING: 40
- HIRING + MOVE: 35
- VOLUME: 27
- CLOSING + VOLUME: 19
- PAIN: rare but high value

## Current Lead Quality Read

### HOT US
- 112 rows.
- Many titles are Senior Loan Officer / Senior Mortgage Loan Officer.
- Risk: some may be too residential or generic mortgage unless company/product context shows commercial/private money/construction/portfolio lending.
- Action: filter harder before priority outreach.

### HOT UK
- 26 rows.
- Mostly Commercial Finance Broker.
- Best fit with Oloxa's current proof because this resembles the Owusu/Eugene use case.
- Action: prioritize immediately.

### HOT Canada Enriched
- 145 rows.
- Many are Commercial Real Estate Brokers, not necessarily finance/mortgage brokers.
- Risk: real estate brokerage ≠ document-heavy lending workflow.
- Action: use only where mortgage/finance/debt/advisory workflow is clear.

## Implication
The lead universe is good enough to start. The mistake would be treating it as a send list instead of a ranked GTM-learning asset.

## Recommended Lead Routing

### Tier 1 — Ryan/Sway White Glove
Use for:
- UK HOT commercial finance brokers
- US/CA leads with commercial/private lending/CRE debt/equipment/SBA evidence
- CLOSING, HIRING, VOLUME, or PAIN signals

Output requirements:
- LinkedIn URL
- email if verified
- evidence quote/source
- pain hypothesis
- personalized opener
- recommended action

### Tier 2 — Signal-Personalized Smartlead
Use for:
- WARM leads with CLOSING/HIRING/VOLUME/MOVE
- good fit but less white-glove evidence

Output requirements:
- segment-specific campaign
- one merge-field signal
- no fake personalization

### Tier 3 — Watchlist / Nurture
Use for:
- MILD leads mostly MOVE-only
- good fit with weak current pain

Action:
- do not prioritize until fresher signal is found

### Tier 4 — Do Not Send Yet
Use for:
- NONE leads
- residential-only loan officers
- generic real estate brokers
- companies with no document-heavy workflow clue

## Reverse Engineering Questions
Use existing AI Arc data to answer:
1. Which companies appear in multiple high-quality rows?
2. Which lead titles correlate with commercial finance vs residential noise?
3. Which signal combinations produced the best evidence?
4. Which markets have the cleanest fit?
5. Which rows are already Smartlead-ready vs need LinkedIn-first?

## Immediate Next Data Tasks
1. Create a cleaned master priority file from HOT UK + commercial-filtered HOT US + finance-filtered HOT CA.
2. Deduplicate by email, LinkedIn URL, and company domain.
3. Add assigned_to = Ryan/Sway.
4. Add recommended_channel.
5. Add campaign angle.
6. Produce a daily top 20.
