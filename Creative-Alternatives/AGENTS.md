# AGENTS.md — Creative Alternatives AIOS

This file loads at the start of every session in this workspace. It tells you who we are, what we're doing, and how to operate. Run `/prime` to load the full context brain on top of it.

---

## What this is

This is the AI operating system for **Creative Alternatives** (creativealternatives.com) — a promotional-products company Kenny has run for 25+ years. It does roughly **$3.2M gross revenue** and nets **$600–700k/year**, built almost entirely on word-of-mouth. There is no marketing engine, no real online presence, and most of the operation runs out of Kenny's head and a set of manual workflows.

Ryan is stepping in to change that. This workspace is where the change gets designed, built, and recorded.

> Numbers above are Ryan's stated figures. Treat them as directional until confirmed against Kenny's actual books — see `context/business-info.md` for what's verified vs. `[CONFIRM]`.

---

## Mission

Generate **$1,000,000 in attributable Creative Alternatives revenue from September 1, 2026 through February 28, 2027** while building the systems that make the growth repeatable.

All previous AI-consulting ventures are retired under the repository archive. Their patterns may be reused only when they solve a named CA constraint.

This is not a client engagement. Ryan is operating inside a family business (his girlfriend's father's company). That changes the posture: trust is the currency, Kenny's instincts are an asset not an obstacle, and nothing ships that makes Kenny's life harder.

---

## The four pillars

Each pillar is a workstream under `pillars/`. The YouTube pillar runs in parallel with the other three — everything we do becomes content.

| # | Pillar | What it means | Status |
|---|--------|----------------|--------|
| 1 | **Operations** | Remove constraints in quoting, orders, vendor coordination, fulfillment, and invoicing. | Supports revenue priorities |
| 2 | **Customer acquisition** | Run reactivation, gifting, stores, camps, and signal-led outbound. | **◀ CURRENT FOCUS** |
| 3 | **Online presence** | Build measurable search, local, site, and inbound conversion paths. | Supporting |
| 4 | **YouTube build-in-public** | Document real CA results and decisions without displacing revenue work. | Secondary |

**Priority rule:** complete the daily revenue power list first. Operations, inbound, and content earn priority when they remove a named conversion or capacity constraint.

---

## Who's who

- **Kenny** — Founder. 25+ years running CA. Built it on relationships and word-of-mouth. The domain expert on the business, the suppliers, and the customers. Likely change-wary; earn it.
- **Maclaine** — Kenny's daughter, Ryan's girlfriend. Runs outreach. Warm, personal sender voice in campaigns.
- **Ryan** — Operator driving the AI transformation and the public build. Professional, consultative sender voice. Owns this workspace.
- **Codex (you)** — Read context, understand the business, design systems, produce outputs, keep this workspace consistent. Explain simply, then act.

---

## Workspace map

```
context/        The venture brain. Read by /prime. business-info, brand, audience,
                offer, strategy, methodology, operators-code, people. Drop raw docs in import/.
pillars/        The four workstreams. Customer acquisition is the current focus.
scripts/        Seeded engine — SQLite db, collectors, metrics, weekly report.
data/           data.db and working data (gitignored).
outputs/        Generated briefs, reports, decks.
plans/          Implementation plans.
reference/      Templates, playbooks, research.
logs/           Work logs.
.Codex/commands/  Slash commands (see below).
```

---

## Commands

- **`/prime`** — Load full context (this file + all of `context/`) and state current focus. Run at the start of every session.
- **`/ops-audit`** — Run the operations discovery framework. The engine for the current focus. Built to run *with* Kenny/Maclaine.
- **`/episode-capture`** — Turn the work just done into a YouTube episode outline. Wires into the CGE YouTube skills.
- **`/weekly-review`** — Weekly compounding review across all four pillars.
- Plus seeded generics: `/capture`, `/deep-research`, `/create-plan`, `/brainstorm`, `/review`, `/commit`, `/schedule`, `/content-os`.

All of Ryan's user-level skills and plugins (CGE niche/idea/title-thumbnail, youtube-script-writer, marketing, sales, etc.) are available here automatically — they live at `~/.Codex/` and carry into any workspace.

---

## Operating principles

1. **Trust Kenny.** 25 years of judgment is data. Map and improve his process; don't bulldoze it.
2. **Human-in-the-loop for anything that touches a customer, a vendor, or money.** Draft, then let Ryan/Kenny approve.
3. **Surface source-of-truth conflicts before rippling them** into the site, outbound, or docs. Flag, don't assume.
4. **Ship revenue leverage, not essays.** Automations, proof artifacts, and decisions must move the $1M plan or remove a named constraint.
5. **Systems that compound.** Build the machine underneath the work — every output should make the next one cheaper.
6. **Honest gaps.** If a fact isn't verified, mark it `[CONFIRM]`. Don't fabricate numbers, dates, or customer details.

---

## Build-in-public rule

Every meaningful CA result is potential content. Capture the story angle only after the daily revenue power list is handled. The build is the source material; content is distribution, not a competing project.
