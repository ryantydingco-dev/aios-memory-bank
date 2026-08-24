# Creative Alternatives AIOS

The AI operating system for transforming **Creative Alternatives** — Kenny's 27-year promotional-products business — into a modern, AI-assisted, marketed operation, documented publicly on YouTube.

This is a standalone workspace (a "fresh AIOS install"), seeded with Ryan's engine so it works on day one, but fully separate from his consulting starter-kit.

## Start a session

Open this folder in Claude Code and run:

```
/prime
```

That loads `CLAUDE.md` + everything in `context/` and tells Claude where the focus is right now.

## The four pillars

1. **Operations** — map and automate how CA runs *(current focus)*
2. **Customer acquisition** — scale the outbound that already works
3. **Online presence** — turn the credible existing site and 27 years of proof into measurable content and inbound
4. **YouTube build-in-public** — film and publish the whole thing

Each lives under `pillars/`. The YouTube pillar runs alongside the rest.

## Current operating framework

The governing objective is [`plans/1m-6-month-game-plan.md`](plans/1m-6-month-game-plan.md): $1M in attributable revenue by February 28, 2027. Daily work starts with [`gtd/daily-power-list.md`](gtd/daily-power-list.md).

[`operating-system/README.md`](operating-system/README.md) coordinates the five revenue engines—reactivation, gifting, stores, camps, and cold outbound—with the operational work needed to support them. Older plans remain as evidence; [`operating-system/source-of-truth-map.md`](operating-system/source-of-truth-map.md) defines their authority.

## What's where

| Path | What it holds |
|------|----------------|
| `CLAUDE.md` | Core context, loads every session |
| `context/` | The venture brain — business, brand, audience, offer, strategy, people |
| `operating-system/` | Current control plane, authority map, and practical trackers |
| `pillars/1-operations/` | The current focus. `/ops-audit` framework + automations |
| `pillars/2-customer-acquisition/outbound/` | Migrated CA campaigns (summer camps, crossfit, etc.) |
| `pillars/4-youtube-build/` | Series plan + per-episode outlines |
| `scripts/` | Seeded engine — SQLite db, collectors, metrics, weekly report |
| `.claude/commands/` | Slash commands |

## Setup notes

- **Secrets:** `.env` and `.mcp.json` hold live keys and are **gitignored**. Sanitized `.env.example` / `.mcp.json.example` are tracked for handoff. Don't push the real ones to a public remote.
- **Sensitive data:** raw QuickBooks/ledger imports, customer and prospect datasets, reply archives, personalized proofs, runtime reports, and machine auth state are also gitignored. Transfer them separately over an approved secure channel when provisioning another Mac.
- **Tools:** 5 MCP servers are wired (heyreach, smartlead, apollo, ghl, higgsfield). The `ghl` server points at a venv inside the starter-kit — a known cross-dependency that can be detached later.
- **Skills:** all of Ryan's user-level skills/plugins (CGE, YouTube, marketing, sales) work here automatically.

## First move

Open the daily power list. Revenue execution comes before operations projects or content. The first structural project is the Kenny/Maclaine quoting handoff because it unlocks every revenue channel.

## Revenue strategy

For current revenue work, start with:

- `plans/1m-6-month-game-plan.md`
- `gtd/daily-power-list.md`
- `pillars/2-customer-acquisition/revenue-operations/daily-revenue-loop.md`
