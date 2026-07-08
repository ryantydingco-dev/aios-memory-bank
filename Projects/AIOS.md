# AIOS

## What it is
Ryan's AI Operating System workspace: an autonomous intelligence layer around a business.

Source workspace:
`/Users/ryantydingco/Documents/AIOS`

Key source file:
`/Users/ryantydingco/Documents/AIOS/aios-starter-kit/CLAUDE.md`

## Core layers
1. Context — the AI understands the business.
2. Data — the AI sees numbers and signals.
3. Intelligence — the AI synthesizes briefs and recommendations.
4. Automate — recurring tasks get automated away.
5. Build — recovered bandwidth goes into growth and new initiatives.

## Known components
- AIOS starter kit
- Daily brief / daily intel outputs
- GTD reminders and logs
- Module installs
- Scripts and data collection
- Dealthread / Oloxa managed-agent work
- Oloxa/outreach engine workflow under `/Users/ryantydingco/Documents/AIOS/oloxa-outbound-engine/` for LinkedIn-first outbound from Claude Code
- Content pipeline assets

## Current monetization context
Recent AIOS monetization work is mapping existing modules/skills into Tier A asset plays. Each asset should answer whether it fuels:
- Dealthread outbound.
- Mocha Builds content.
- A future direct-sale product.
- Some combination of the above.

Highest priority: assets that serve both Dealthread outbound and Mocha Builds content.

## 2026-07-07 two-machine setup decision

The AIOS starter-kit now has a documented MacBook ↔ Mac Studio architecture in `AIOS/aios-starter-kit/studio-setup/README.md`.

Durable decision:

- Git is the sync spine.
- GitHub private repos are the hub.
- Four synced repos should exist at identical paths on both machines.
- The **Mac Studio is the automation server** and single writer for launchd jobs + runtime data.
- The **MacBook is the mobile client**.
- Commit history doubles as the cross-machine session log; `git log` should answer “what did the other machine do?”

Future agents should respect this architecture before adding scheduled jobs or runtime-writing automation. Do not create competing launchd/runtime writers on the MacBook unless Ryan explicitly changes the architecture.

## 2026-06-23 Creative Alternatives pivot

- Ryan wants a fresh AIOS SYSTEM install dedicated to **Creative Alternatives** (`creativealternatives.com`), Kenny’s 25+ year business.
- This is a notable pivot: instead of broad AI consulting in the abstract, Ryan is considering focusing his AIOS knowledge and systems on a specific real business tied to his family/girlfriend’s family.
- Future agents should inspect existing AIOS install conventions before creating new structure. The recent session surfaced `businesses/`, `clients/`, `client-template/`, and `module-installs/` as likely workspace/install primitives.
- Treat Creative Alternatives as a serious business transformation workspace, not a demo sandbox. Capture context, workflows, constraints, approvals, and first low-risk automation candidates before building.

## 2026-06-26 credential hygiene note

- Ryan requested AI Ark API key maintenance in AIOS starter-kit `.env` files.
- Do not record the key value in memory notes, docs, prompts, or logs.
- Durable rule: credentials belong only in `.env`/secret storage; memory bank should record at most that credential maintenance occurred and which integration it related to.

## Dynamic workflow context
Ryan is exploring dynamic workflows as the production layer for GTM: not just “ask AI for assets,” but route work through repeatable loops such as:
- research → adversarial verification → synthesis,
- lead sourcing → battlecard → personalized Loom/email/LinkedIn draft,
- human approval → send/call/follow-up,
- outcome logging → weekly learning → next experiment.

Useful framing: dynamic workflows should maximize shipped revenue experiments per week while keeping human approval on risky actions. The goal is faster validated learning and closed revenue, not more unreviewed AI output.

## 2026-06-21 starter-kit prime / working bias

- A fresh Claude Code prime in the AIOS starter-kit workspace re-grounded the context: Ryan is building an AI automation agency operating system while also working as an Account Manager at Drata.
- The session reinforced Ryan’s preferred agent behavior: challenge assumptions, keep work tied to revenue, ship artifacts, and avoid speculative build mode unless it supports booked calls, paid pilots, or delivery.
- Strategic note from the session: outbound is not inherently broken; Calendar Group came from outbound. If outbound feels weak, diagnose offer, list quality, proof, and volume before pivoting entirely to inbound.

## 2026-06-18 Claude tooling / Superpowers

- Ryan asked to install skills/plugins from `https://github.com/obra/superpowers`.
- Session research identified Superpowers as a Claude Code plugin distributed through a marketplace, not just a raw repo copy.
- The environment inspection had begun, but the scan did not confirm a completed/verified install.
- 2026-06-30 scan again shows this install flow in progress: the correct path still appears to be the Claude Code plugin/marketplace flow, and local plugin setup inspection was started, but activation was not verified.
- Future agent should verify the correct Claude Code plugin marketplace flow and confirm the plugin/skills are active before marking this done.

## 2026-06-13 integration hygiene

- Recent sessions explored adding Origami API support to AIOS workflows and evaluating whether MyCenter.ai API access can automate outreach.
- Treat both as infrastructure experiments until actual API capabilities, docs, and endpoints are verified.
- Never record API keys or `.env` values in memory notes, scripts, prompts, or project docs. Keep credentials in environment/secret storage only.

## 2026-06-15 working-style signal

- Ryan explicitly asked whether he is using AI in the best way and whether the assistant has learned from him.
- Durable preference reinforced: challenge mode over passive execution, ship over polish, no fabricated proof, surface source-of-truth conflicts before cascading changes, and treat agentic AI itself as the automation layer where possible.
- Future agents should not just agree with Ryan’s premise; they should identify mis-scoped work, risky assumptions, and the shortest path to a useful shipped artifact.

## Durable module/package context
`/Users/ryantydingco/Documents/AIOS/Dealthread_AIOS_Kit/modules/` is the packaging unit for AIOS agents. Each module is meant to bundle an agent spec, install guide, config, cost/pricing notes, and collateral into something that can be shipped to a prospect, design partner, or tenant.

## What future agents should know
Before doing meaningful AIOS work, inspect the project `CLAUDE.md`, `AGENTS.md`, context docs, plans, and current outputs. Treat source-of-truth conflicts seriously before changing downstream website copy, outbound scripts, or module packaging.

If Ryan references new model names or capabilities, verify official release details before using them in business-facing claims.
