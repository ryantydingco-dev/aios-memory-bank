# Oloxa

## What it is
Oloxa focuses on commercial finance / broker workflows: borrower docs, missing docs, lender-ready submissions, and borrower follow-up.

## 2026-07-06 LinkedIn automation mapping for Sendr replication

A Claude subagent did a read-only exploration of Ryan’s OLOXA LinkedIn automation system so the pattern can be replicated in a new tool/context called **Sendr** for a different business.

Source areas named in the scan:

- `/Users/ryantydingco/Documents/AIOS/oloxa-outbound-engine/`
- Oloxa outbound docs: `README.md`, `INSTALL.md`, `UPDATING.md`, `INSTALL_CRON.md`
- Key scripts: `scripts/batch-linkedin-connect.py`, `scripts/exchange/daily_origami_to_prospects.py`
- Related starter-kit LinkedIn utilities: `linkedin_enrich_urls.py`, `linkedin_bulk_upload.py`, `linkedin_preengage.py`, `linkedin_db.py`

Durable implication: treat OLOXA as a reusable outbound-system reference architecture — prospect source/import, LinkedIn URL enrichment, queue/state tracking, human-reviewed connection/pre-engagement steps, and cron/update docs. The scan does **not** prove the Sendr version has been implemented yet.

## Current GTM context
- ICP: commercial finance/mortgage brokers and debt advisors.
- Target users: founders, owners, managing partners, broker operators.
- Strong signals: closings, hiring/admin strain, volume spikes, complex multi-lender packaging, paperwork/doc-chase pain.
- Workflow includes AI Arc, LinkedIn verification, HubSpot, Smartlead, and enriched CSV outputs.
- Oloxa is also acting as the live case study for Ryan’s broader AI GTM Engine: signal-based lead generation, outbound personalization, experiment tracking, and weekly learning loops.

## Positioning principle
Sell the expensive bottleneck removed, not generic AI: messy docs delaying lender-ready submissions.

## Current campaign direction
- Messaging should narrow around document intake, sorting/classification, missing-doc follow-up, and lender-ready packages.
- Campaigns should likely be split by ICP/persona instead of forcing one sequence across both commercial finance brokers and loan/mortgage personas.
- Sender/domain identity should be separated from Dealthread where possible because the buyer, pain, and trust frame are different.
- CTA direction from recent work: Loom + reply.
- Dynamic workflow direction: run outbound as a weekly experiment loop — lead signals → battlecard → human-approved touch → outcome tracker → weekly synthesis → updated claims.

## 2026-06-18 sender.ai Loom context

- Ryan asked for a generic LinkedIn Loom script for Oloxa because he is creating personalized pages in sender.ai.
- The goal is a reusable breakdown of what Oloxa/Ryan does, with account-level personalization handled by the sender.ai page around the video.
- The script was adapted from the proven Oloxa Loom template instead of being rebuilt from scratch.
- Output noted in-session: `../../AIOS/oloxa-outbound-engine/output/loom-scripts/generic-senderai_loom-script_2026-06-10.md`.
- Keep future edits grounded in the actual Oloxa wedge: document intake, sorting/classification, missing-doc follow-up, and lender-ready submissions.

## 2026-06-13 sender.ai Loom context

- A generic evergreen Loom script was drafted for personalized sender.ai pages.
- Purpose: give prospects a reusable explanation of what Ryan/Oloxa/AIOS does, while the personalized page carries the account-specific framing.
- Keep future versions grounded in Oloxa’s actual pain wedge: document intake, sorting/classification, missing-doc follow-up, and lender-ready submissions.
- Do not over-personalize the evergreen video itself; personalization should happen in the page copy/URL/context around it.
- 2026-06-15 scan confirms this remained the active Oloxa asset work: a generic LinkedIn Loom/script for sender.ai pages, adapted from the proven Loom template rather than rebuilt from scratch.

## 2026-06-15 model/job hygiene

- Oloxa-related scheduled Claude jobs have failed because the selected model `claude-fable-5` may not exist or may not be accessible.
- The 2026-06-21 memory-bank scan surfaced two more failed Oloxa/content jobs with the same model-access issue.
- The 2026-06-28 scan surfaced another Oloxa strategist session blocked by the same unavailable `claude-fable-5` model issue.
- Do not assume those content/strategy outputs were produced. Re-run with an available model before using them as source material.

## 2026-06-17 daily lead queue

- A new Oloxa daily brief and top-20 queue were generated in `AI GTM Engine/Lead Engine/Outputs/`.
- Brief summary: 20 leads queued, split 10 for Ryan and 10 for Sway, with closing/deal-activity signals.
- The brief explicitly says the list is a **basic list** and to **run battlecard workflow to enrich**.
- Treat the CSV as **drafts only / review before sending**. Do not imply outreach was sent, replied to, or booked unless Smartlead/HubSpot/outcome tracker confirms it.
- The brief says hot replies are unknown/unchecked: check Smartlead/HubSpot before reporting reply status.

## Verification hygiene
A 2026-06-02 memory-bank scan surfaced a lead-record cleanup in the Oloxa lead-generation pipeline:
- Bailey Moore / Moorgate Finance had two datable claims that verification showed were stale or undatable.
- The durable rule is to avoid using old anniversary/hiring claims or inferred “growth” language unless current sources support them.
- Future battlecards should separate:
  - verified current facts,
  - old-but-true historical context,
  - and unusable/undatable claims.

This matters because the Oloxa pipeline’s value is signal-backed outbound. A stale “growth” signal can damage trust even if the rest of the personalization is good.

## Adjacent GTM Experiment Engine research
A 2026-05-31 dynamic workflow researched ICPs for a US-based done-for-you GTM Experiment Engine service. Durable result:
- Best beachhead: retained executive search / specialized recruiting firms.
- Next-best test segments: MSP / managed IT, mid-sized commercial law, fractional CFO / finance.
- De-prioritize small CPA/accounting firms as the initial beachhead.

This may become either a separate service offer or an internal GTM engine for selling Oloxa/Dealthread. Keep the distinction explicit before changing positioning.

## Local source areas
Likely relevant files live under:
`/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa`

Recent handoff file:
`/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa/sway_handoff/SUMMARY_FOR_SWAY.md`

Lead Engine working area noted in sessions:
`/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine`

## Open loops
- Confirm whether a target lead list already exists or needs to be sourced.
- Finalize split sequences for each ICP/persona.
- Verify Smartlead sender/domain setup before editing live campaign copy.
- Continue enriching leads with source-backed buying signals; avoid unsourced assumptions.
- Remove or rewrite stale/undatable lead claims before using battlecards in outbound.
- Finish weekly learning loop and make sure real outreach outcomes are logged into `Lead Engine/Outputs/Oloxa_Outcome_Tracker.csv`.
- Build the inbound content-factory workflow as the fourth GTM move.
- Review/enrich the 2026-06-17 top-20 queue before any send step.

## Future memory updates
Capture campaign changes, ICP refinements, objection lessons, working opener formulas, and lead-source discoveries here.
