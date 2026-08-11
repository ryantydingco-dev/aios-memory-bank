# Methodology — how Ryan transforms CA with AI

The repeatable approach behind every pillar. The point is a machine that compounds, not one-off outputs.

## The loop (applies to any pillar)

1. **Map before you build.** Document the real workflow — who does what, with which tools, how long it takes, where it breaks. No automation before the map.
2. **Quantify the pain.** Hours/week, error rate, delay, dollars. You need the baseline to prove the win and to pick what to fix first.
3. **Rank by leverage.** Score candidates on *hours saved × ease to build*. Do the top one. Resist the urge to boil the ocean.
4. **Build human-in-the-loop first.** Draft-and-approve before full automation. Earn trust, catch edge cases, then tighten.
5. **Prove it.** Measure against the baseline. A real number ("saved Kenny 6 hours a week") is the proof artifact and the content hook.
6. **Document it.** Capture the story for YouTube and the workflow for the workspace. Every win makes the next one cheaper.

## Pillar-specific approach

**Operations.** Shadow Kenny/Maclaine through real orders. Use `/ops-audit`. Look for: repeated data entry, copy-paste between tools, manual quoting, chasing proofs/approvals, invoice/reorder follow-up. First automations usually live in quoting and order intake.

**Customer acquisition.** Don't reinvent — the camp/club outbound already works. Standardize it: ICP → enrichment (Apollo) → verify (ZeroBounce) → sequence (SmartLead) → track. Mine real replies with `prospect-interaction-analyzer` before writing new copy. Add a reactivation sequence for dormant accounts.

**Online presence.** Start with the basics that compound: claim/optimize Google Business Profile, fix the site's core pages and proof, pick one or two social channels, ship a simple cadence. Use the marketing skills. Repurpose YouTube content here.

**YouTube.** Use the CGE method end-to-end: validate the idea (niche-finder, video-idea-finder), package it (title/thumbnail/intro), script it (youtube-script-writer), then review the upload (launch-loop). The transformation supplies the substance; the skills supply the craft.

## Tools to reach for

- **Outbound/enrichment:** SmartLead, Apollo, HeyReach, ZeroBounce, HubSpot/GHL (MCP wired).
- **Research:** `/deep-research`, Firecrawl, Apify.
- **Content:** CGE skills, youtube-script-writer, marketing skills, ElevenLabs/HeyGen/Pexels (MCP + media tools).
- **Ops automation:** Python scripts in `scripts/`, the SQLite db, scheduled tasks.

## Anti-patterns

- Automating a process nobody mapped.
- Shipping a customer/vendor-facing change without approval.
- Building for theoretical scale before the first manual win.
- Fabricating numbers or customer details to make a better story. Mark gaps `[CONFIRM]`.
