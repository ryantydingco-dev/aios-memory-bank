# Pillar 2 — Customer acquisition

Scale the outbound that already works into a repeatable engine for new branded-store logos. Add a reactivation motion for dormant accounts.

> Active after the ops foundation (Pillar 1) can absorb new volume. Seeded now so it's ready.
>
> **Current governing outbound system:** `account-based-outbound-engine.md`. It requires one evidence-selected segment and coordinates email, LinkedIn, and calls at the account level. The campaign files below are supporting assets; they do not authorize a launch.

## What we already know (migrated campaign history)

Real results from past CA campaigns — use them to prioritize:

| Campaign | Segment | Status | Reply rate |
|----------|---------|--------|-----------|
| Summer Camps | Youth camps | Completed | **10.1%** ← winner |
| Squash Clubs | Racquet sports | Active | 4.6% |
| Country Clubs | Private clubs | Active | 0.3% |
| CrossFit Boxes | Boutique fitness | Building (mirrors Summer Camps) | — |
| Youth Sports Clubs | Sports academies | Failed | 0% (but Farm & Forge is a live customer in-segment) |
| SaaS Companies | SaaS 20–500 | Stopped | 1.1% |

**Read:** camps and clubs win; corporate/SaaS doesn't. Lead with the camp/club playbook.

## The engine (built — see the playbook)

Origami (source + enrich + verify) → multichannel cadence across **SmartLead** (email), **Sendr.io** (LinkedIn + video/voice DM), **Salesfinity** (parallel-dial calls) → **HubSpot** (pipeline + handoff) → warm leads to Maclaine/Ryan.

**The differentiator:** every prospect gets a real **AI mockup of their own store** in touch #1. Show, don't pitch — the lever that turns a narrow ICP into a 10%+ reply rate.

- **Sender voices:** Maclaine (warm, family) and Ryan (consultative). See `context/brand.md`.
- **Before new copy:** mine real replies and calls with the `prospect-interaction-analyzer` skill. Use the audience's words.

## Files (the GTM build)

- **`account-based-outbound-engine.md`** — the current source of truth: one-segment decision gate, account plan, cross-channel stop rules, readiness, and measurement.
- **`revenue-operations/README.md`** — the canonical draft revenue operating system:
  QuickBooks customer/order data contract, four customer segments, 90-day Mailchimp
  calendar and templates, outcome-based new-customer offers, one tracker/dashboard,
  operating cadence, and approval gates. Local only; no connections or sends.
- **`revenue-positioning-offer-playbook-2026-07-12.md`** — the complete revenue-option map, market position, twelve moment-based offers, lead system, money model, and 90-day launch sequence.
- **`home-run-offer.md`** — the grand-slam offer: value stack, mockup wedge, guarantee, objection handling.
- **`outbound-gtm-playbook.md`** — the full engine: tool stack, ICP, multichannel cadence, infrastructure, volume model, pipeline, metrics, 90-day rollout.
- **`sequences/cold-outreach-copy.md`** — ready-to-send copy: email sequence, LinkedIn video-DM scripts, Salesfinity call scripts, reactivation, subject bank.
- `outbound/` — migrated sequences, Apollo queries (still valid for ICP filters), SmartLead setups, the V1 campaign docx.

## Next moves

Follow `../../plans/first-30-days-unified-operating-plan.md`: select one segment through the decision framework, build and suppress a reviewable account cohort, and dry-run the coordinated cadence. Contacting prospects requires separate explicit approval.
