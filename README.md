# AIOS Memory Bank — Agent Orientation (read this first)

One repo, the whole operating picture. This is the shared business brain for **every** AI agent working with Ryan Tydingco — Hermes, grokbot, Claude Code, Codex, and whatever comes next. Load this file first, then follow the reading order below.

**Everything here is private business data. Never quote it externally, in outbound copy, or in public content.**

---

## The business right now

**Creative Alternatives** (creativealternatives.com) — Kenny Scher's 27-year promotional-products distributor, NY-metro. QuickBooks-verified (2026-07-12): **$2.65M income / $523K net in 2025; $1.37M income / $291K net in 2026 through July 12 and trending up.** Built almost entirely on word-of-mouth; no marketing engine until now.

**Ryan** (laid off 2026-08-04, 8 weeks severance → ~Sept 29, all-in) is transforming CA with AI and documenting it as a build-in-public YouTube series. Since 2026-06-23 CA is Ryan's **sole business focus** — all prior AI-consulting tracks (Dealthreads, Oloxa, AI GTM Engine, Invoice Chase / THE PLAN) are retired and kept in this repo as history only. Do not default advice to them.

**The revenue motion (live daily):** signal-led cold email at scale (SmartLead, 233 inboxes, 5,835/day combined limit) offering free logo mockups → prospect replies → same-day real-logo mockups + Gamma deck fulfillment → **Maclaine Scher** (maclaine@creativealternatives.com) quotes → close.

**State as of 2026-08-11 (last consolidation):**
- First closed customer 2026-08-10: **Miller Johnson, 2,600 water bottles.**
- Six campaigns active, ~31k leads in motion: Trade Show, Law National, Race Season (nearly dry), plus newly activated Q4 Gifting (10,827 leads), Law Firm Admins (9,109), Galas (194).
- Winter Shows 2027 (4,603 leads) intentionally left drafted — starts November per the 8–12-week buy-window rule.
- Second reply loop in flight: Impact Canopy (SEMA, Nov 3–6 LVCC) — fulfilled and sent 2026-08-11.

For anything newer, check the most recent file in `Work Logs/` — that is the current-state source inside this repo. Live-state truth for sends/replies is SmartLead; for money it's QuickBooks (neither is mirrored here).

## Who's who

- **Kenny Scher** — founder, 27 years running CA. Domain expert; change-wary; trust is the currency.
- **Maclaine Scher** — Kenny's daughter, Ryan's girlfriend. Owns **all pricing and quoting**. Warm sender voice.
- **Ryan Tydingco** — operator driving the AI transformation and the public build. Owns this repo and every agent.
- **Wil Antonides** (Miller Johnson) — first customer; naming him in campaign copy is **pending his OK** (open loop).

---

## Reading order for loading full context

1. **This file.**
2. `claude-memory/MEMORY.md` — the distilled long-term memory index; each linked file is one durable fact or system.
3. `Creative-Alternatives/context/` — the CA business brain: `business-info.md`, `current-data.md` (QuickBooks snapshot), `people.md`, `brand.md`, `offer.md`, `strategy.md`, `operators-code.md`.
4. `Dealthreads Outbound Engine/daily-swag-engine.md` — the every-day revenue loop — and `severance-plan.md` — the 8-week plan and its constraints.
5. The newest files in `Work Logs/` — current state.
6. `Open Loops.md` — standing unfinished threads.

## Repo map

| Folder | What it holds | Status |
|---|---|---|
| `claude-memory/` | Distilled long-term memory. `MEMORY.md` is the index. | **Active — start here** |
| `Creative-Alternatives/` | The CA workspace knowledge layer (text mirror of the Creative-Alternatives-AIOS repo): `context/` business brain, `pillars/` four workstreams, `plans/`, `config/`, `operating-system/`, `scripts/`, `.agents/skills/` (agent skill definitions), `AGENTS.md` + `CLAUDE.md` (session-load prompts). | **Active** |
| `Dealthreads Outbound Engine/` | The live daily revenue motion: daily swag engine, per-reply fulfillment records, severance plan. Despite the name, this now serves CA. | **Active** |
| `Work Logs/` | Daily session logs; newest = current state. | **Active** |
| `Open Loops.md` | Standing unfinished threads. | **Active** |
| `Projects/` | Per-project running notes. | Mixed |
| `Content-OS/`, `Personal Brand/` | YouTube / LinkedIn build-in-public content systems. | Active, secondary |
| `CGE Claude Skills Bundle V1.1/` | Packaged YouTube-coaching skills (.skill files). | Reference |
| `AI GTM Engine/`, `Oloxa/`, `dealthreads-gtm-*`, `AIOS Quickstart/`, `Revenue Sprints/` | Retired consulting/GTM tracks. | **History only** |
| `Workflows/`, `Source Maps/`, `AI Briefings/` | Infrastructure maps and session-source pointers. | Reference |

## The agent stack — and how to update agents

Ryan runs multiple agents off this one shared brain. If you (grokbot or any other agent) are updating agents, this is where everything lives:

| Agent | Where it runs | What it reads / where to update it |
|---|---|---|
| **Hermes** | Telegram + cron on Ryan's Mac | Reads this repo as memory; summarizes daily activity into `Work Logs/`. Map: `Workflows/Hermes Infrastructure Map.md`. |
| **Claude Code** | Ryan's MacBook / Mac Studio | Session prompts: `Creative-Alternatives/CLAUDE.md`; skills: `Creative-Alternatives/.agents/skills/`; durable memory: `claude-memory/`. |
| **Codex** | Same machines | Session prompt: `Creative-Alternatives/AGENTS.md` (keep in sync with `CLAUDE.md`). |
| **grokbot** | External | Load this README + the reading order above as business context before touching anything. |

**Agent update protocol:**
1. Load the reading order above before proposing changes — don't work from stale or assumed facts.
2. Any agent prompt you write or update **must embed the hard rules below** verbatim or equivalent.
3. When a durable business fact changes, update `claude-memory/` (fact file + `MEMORY.md` index) and the snapshot in this README — that's how every other agent inherits it.
4. `Creative-Alternatives/CLAUDE.md` and `Creative-Alternatives/AGENTS.md` are twins: a change to one goes to both.
5. Summarize, never transcript-dump. Keep everything human-readable (`Ryan Operating Style.md` has the full working-style picture).

## Hard rules (the operator's code — never violate, never strip from an agent)

1. **Human-in-the-loop** for anything customer-facing, vendor-facing, money, or public. Draft, never send.
2. **Never fabricate** numbers, dates, or claims. Unverified = mark `[CONFIRM]`. Datable signals need a sourced date.
3. **Maclaine owns all pricing/quoting.** Agents never invent prices.
4. **Mockups:** real logo + real vendor-deliverable products only (suppliers CA actually buys from — vendor list in `Work Logs/2026-08-10.md`). Classic logo treatments, no gag concepts.
5. **Timeline promises:** work backward from the real deadline including production slow-end + freight.
6. **No discount gimmicks** in any CA copy — CA sells premium done-for-you value, not price.
7. **SmartLead inbox signatures stay blank** (account-level signatures append to every send); sign in body copy.

## What is NOT in this repo

Secrets (.env, API keys, tokens), raw lead exports and bulk PII (local only), QuickBooks raw CSVs, media/mockup binaries, the 3.2GB reference library. This repo is the brain, not the runtime.
