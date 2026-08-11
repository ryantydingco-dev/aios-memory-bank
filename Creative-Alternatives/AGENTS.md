# AGENTS.md — Creative Alternatives AIOS

This file loads at the start of every session in this workspace. It tells you who we are, what we're doing, and how to operate. Run `/prime` to load the full context brain on top of it.

---

## What this is

This is the AI operating system for **Creative Alternatives** (creativealternatives.com) — a promotional-products company Kenny has run for 25+ years. It does roughly **$3.2M gross revenue** and nets **$600–700k/year**, built almost entirely on word-of-mouth. There is no marketing engine, no real online presence, and most of the operation runs out of Kenny's head and a set of manual workflows.

Ryan is stepping in to change that. This workspace is where the change gets designed, built, and recorded.

> Numbers above are Ryan's stated figures. Treat them as directional until confirmed against Kenny's actual books — see `context/business-info.md` for what's verified vs. `[CONFIRM]`.

---

## The pivot & mission

Ryan is folding his AI-consulting work (Dealthreads, Oloxa, the GTM engine, the lead-gen stack) into **one focus**: take everything he knows about AI and systems and use it to modernize Creative Alternatives — then publish the whole thing on YouTube as a build-in-public series.

The mission, in one line: **turn a 25-year word-of-mouth business into an AI-run, marketed, modern operation — and document every step.**

This is not a client engagement. Ryan is operating inside a family business (his girlfriend's father's company). That changes the posture: trust is the currency, Kenny's instincts are an asset not an obstacle, and nothing ships that makes Kenny's life harder.

---

## The four pillars

Each pillar is a workstream under `pillars/`. The YouTube pillar runs in parallel with the other three — everything we do becomes content.

| # | Pillar | What it means | Status |
|---|--------|----------------|--------|
| 1 | **Operations** | Map how CA actually runs, then automate the biggest time-sinks (quoting, orders, vendor coordination, fulfillment, invoicing). | **◀ CURRENT FOCUS** |
| 2 | **Customer acquisition** | Scale the outbound that already works (Summer Camps hit 10.1% reply) into a repeatable engine for new business. | Seeded (existing campaigns migrated) |
| 3 | **Online presence** | Build CA's brand, site, and social from near-zero. The business has run dark for 25 years. | Not started |
| 4 | **YouTube build-in-public** | Film and publish the transformation. Episode 1 = the operations audit. | Runs in parallel from day one |

**Why operations first:** you can't AI-transform what you haven't mapped, scaling customer volume onto a manual back office breaks it, and the efficiency wins are the most concrete proof for both Kenny and the camera. Trust gets built by removing pain before changing how Kenny sells.

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
pillars/        The four workstreams. 1-operations is the current focus.
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
4. **Ship leverage, not essays.** Automations, proof artifacts, decisions that move a pillar forward.
5. **Systems that compound.** Build the machine underneath the work — every output should make the next one cheaper.
6. **Honest gaps.** If a fact isn't verified, mark it `[CONFIRM]`. Don't fabricate numbers, dates, or customer details.

---

## Build-in-public rule

Every meaningful work session is potential content. When we finish something worth showing — a mapped workflow, a built automation, a campaign result, a hard decision — note the story angle so `/episode-capture` can turn it into an episode. The transformation is the product; the documentation is the distribution.
