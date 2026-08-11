# Agent Orientation — Ryan's Consolidated AIOS (read this first)

One repo, the whole operating picture. Consolidated 2026-08-11 so an external agent (Hermes) can load full context. Everything here is private business data — never quote it externally.

## What this repo is

Ryan Tydingco's working memory + the Creative Alternatives business brain, merged:

| Folder | What it holds |
|---|---|
| `claude-memory/` | **Start here.** Distilled long-term memory. `MEMORY.md` is the index; each file is one durable fact/system. |
| `Creative-Alternatives/` | The CA workspace knowledge layer (text-only mirror of the Creative-Alternatives-AIOS repo). `context/` = business brain (financials, people, brand, strategy). `pillars/2-customer-acquisition/` = the whole GTM: offers, sequences, playbooks, QuickBooks analysis. `plans/`, `config/`, `operating-system/`, `scripts/`. |
| `Dealthreads Outbound Engine/` | The live daily revenue motion: `daily-swag-engine.md` (the every-day loop), per-reply fulfillment records, severance plan. |
| `Work Logs/` | Daily session logs, newest = current state. |
| `Projects/` | Per-project running notes. |
| `Open Loops.md` | Standing unfinished threads. |

## The business in four sentences

Creative Alternatives (Kenny Scher, ~$3.2M/yr promo-products distributor, NY-metro) is being transformed with AI by Ryan (laid off 2026-08-04, 8 weeks severance, all-in). Revenue motion: signal-led cold email at scale (SmartLead, 233 inboxes) offering free logo mockups → reply → same-day mockup + Gamma deck fulfillment → Maclaine Scher (maclaine@creativealternatives.com) quotes → close. **First closed customer 2026-08-10: Miller Johnson, 2,600 water bottles.** Six campaigns active (~31k leads in motion) as of 2026-08-11.

## Hard rules (the operator's code — do not violate)

1. Human-in-the-loop for anything customer-facing, vendor-facing, money, or public. Draft, never send.
2. Never fabricate numbers, dates, or claims. Unverified = mark `[CONFIRM]`. Datable signals need a sourced date.
3. Maclaine owns all pricing/quoting. Agents never invent prices.
4. Mockups: real logo + real vendor-deliverable products only (suppliers CA actually buys from — see `Work Logs/2026-08-10.md` vendor list). Classic logo treatments, no gag concepts.
5. Timeline promises: work backward from the real deadline including production slow-end + freight.
6. No discount gimmicks in any CA copy.

## What is NOT in this repo

Secrets (.env, API keys, tokens), raw lead exports and bulk PII (local only), QuickBooks raw CSVs, media/mockup binaries, the 3.2GB reference library. Live-state truth for sends/replies is SmartLead; for money it's QuickBooks. This repo is the brain, not the runtime.
