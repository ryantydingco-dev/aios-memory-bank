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

Start with [`operating-system/README.md`](operating-system/README.md). It is the control plane for:

1. One account-based outbound engine across email, LinkedIn, and calls.
2. A differentiated LinkedIn/content engine for Ryan, Kenny, and Maclaine.
3. The backend modernization roadmap for response time, order quality, margin, and capacity.

The active 30-day sequence is [`plans/first-30-days-unified-operating-plan.md`](plans/first-30-days-unified-operating-plan.md). Older plans remain in place as evidence and implementation references; [`operating-system/source-of-truth-map.md`](operating-system/source-of-truth-map.md) states which documents govern current execution.

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

Run `/ops-audit` with Kenny and Maclaine to map CA's real workflows. That output drives the first automations — and becomes Episode 1.

## Revenue strategy

For the current revenue-doubling work, start with:

- `plans/revenue-doubling-strategy-index.md`
Run the first-Monday agenda in `plans/first-30-days-unified-operating-plan.md`: complete the one-segment decision evidence, confirm the three content voices and permissions, and select the representative orders/quote threads for the operations baseline. Nothing external launches from that meeting.
