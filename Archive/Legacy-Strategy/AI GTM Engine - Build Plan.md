# AI GTM Engine - Build Plan

## Decision
Build the AI-powered GTM system inside Hermes/AIOS first, then use Codex or Claude Code only when implementation work becomes app/code-heavy.

Reason: the highest-value work right now is system design, market learning, scoring logic, workflows, prompt templates, and operating rhythm — not a polished app UI.

## Primary Objective
Use Oloxa as the live case study to master AI-powered lead generation and GTM systems: better buyer selection, stronger signal detection, better outreach personalization, booked meetings, and market learning loops.

## Long-Term Thesis
AI will make shallow outbound cheap and noisy. The durable edge is GTM intelligence: identifying who to contact, why now, what pain likely exists, what message should be sent, and what the market is teaching us.

## Core System Modules

### 1. Oloxa GTM Brain
A living knowledge base containing:
- ICP definitions
- target verticals
- buyer personas
- signal taxonomy
- scoring rules
- proof points
- objections
- winning/losing message patterns
- weekly learnings
- market notes

### 2. Signal Engine
Classifies public evidence into buying signals:
- CLOSING: public closings/deal activity
- HIRING: hiring processors/admins/ops/sales roles
- VOLUME: lots of deal flow, lender programs, multiple product pages
- MOVE: expansion, new market, acquisition, new office
- PAIN: process/document/follow-up/ops language
- COMPLEXITY: multiple lenders, products, borrower types, submissions
- SPEED_PROMISE: public promise around fast funding/approval

### 3. Research Card Template
Every lead becomes a meeting-ready research card:
- company
- buyer/contact
- firm fit
- behavioral fit
- primary signal
- evidence
- pain hypothesis
- personalized opener
- confidence
- recommended next action

### 4. Lead Production Pipeline
Inputs:
- AI Arc exports
- broker directories
- LinkedIn-visible research
- Google News/Alerts
- company sites
- job posts
- transaction/deal pages

Outputs:
- Ryan top 10
- Sway top 10
- CSV export
- Telegram digest
- HubSpot-ready fields
- Smartlead-ready fields

### 5. Outreach Experiment Loop
Track:
- segment
- signal
- opener angle
- channel
- sent date
- reply
- objection
- meeting booked
- next action

### 6. Weekly GTM Review
Every week answer:
- Which segment had the best signals?
- Which signal produced the strongest leads?
- Which message angle felt strongest?
- What objections appeared?
- What proof points landed?
- What should change next week?

### 7. Packaging Layer
Once Oloxa has results, package the system as:
- AI GTM Engine setup
- done-for-you lead research engine
- signal-based outbound playbook
- weekly market intelligence report
- CRM/Smartlead implementation

## Recommended Tooling Strategy

### Use Hermes now for:
- strategy
- workflow design
- memory bank architecture
- prompt/template creation
- daily lead batch generation
- market learning summaries
- cron jobs and recurring automation
- Telegram digests

### Use Codex/Claude Code later for:
- building a web dashboard
- automating CSV ingestion
- database/API work
- HubSpot/Smartlead integrations
- CLI tools/scripts
- tests/refactors

### Do not start with a full app.
First build the operating system in markdown, CSVs, scripts, and repeatable workflows.

## 30-Day Build Sequence

### Week 1: Foundation
- Create Oloxa GTM Brain folder
- Write ICP map
- Write signal taxonomy
- Write lead scoring rubric
- Write research card template
- Write CSV schema
- Define Ryan/Sway daily digest format

### Week 2: Manual Engine
- Run daily lead batches manually/semiautomatically
- Enrich only the top prospects
- Start tracking signal quality
- Capture objections/replies
- Build message library

### Week 3: Automation
- Add scripts for CSV normalization and scoring
- Add enrichment helper scripts
- Add daily summary generator
- Consider cron-assisted digest if stable

### Week 4: Packaging
- Summarize first month of learnings
- Create case study skeleton
- Build external offer draft
- Identify first external beta clients only if Oloxa loop is showing traction

## Principle
No more random building. Every task must help one of these:
1. find better buyers
2. identify stronger reasons now
3. say better things
4. book more meetings
5. learn the market faster
6. package the proven system later
