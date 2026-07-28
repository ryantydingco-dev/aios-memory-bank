---
name: verify-preflight-skills
description: "verify-copy + preflight skills (2026-07-19) — worker/verifier split with CA rubrics for all outbound/content copy, and failure-modes-first explainers before any new pipeline; stolen from Anthropic's Claude Code team practices."
metadata: 
  node_type: memory
  type: project
  originSessionId: ba4aebb0-fd3b-41f7-bad2-d463bce67e2a
  modified: 2026-07-20T01:21:35.208Z
---

Built 2026-07-19 from Thariq (Anthropic Claude Code team) on Peter Yang's podcast. Two user-level skills at `~/.claude/skills/`:

- **verify-copy** — before any cold email, sequence, or LinkedIn post ships, spawn independent verifier agents (fresh context, never the drafting agent — self-referential bias makes self-grading too lenient). Two lenses: rules compliance + skeptical buyer persona. Rubrics in the skill dir encode CA's real standards: 50–90 words, one ask, interest CTA, mockup hero, [[ca-no-discount-gimmicks]], anti-fabrication, writing-style bans. Batch mode = packaged workflow `workflows/verify-batch.js` (Workflow tool, one sub-agent pair per draft). Max two verify rounds, then surface to Ryan.
- **preflight** — before wiring any new pipeline/integration/cron, research real failure modes of each dependency and write `docs/failure-modes/<slug>.md` (under 80 lines) plus a 5-line top-risks summary to Ryan before build code.

**Why:** Anthropic cut Claude Code's system prompt 80% — smarter models need fewer constraints/examples; examples over-anchor. Trim audit for Ryan's own context files lives at `AIOS-Memory-Bank/Projects/Context Trim Audit 2026-07.md` (aios CLAUDE.md 822 lines = worst offender; spawn-task chip created to trim it). Related: [[ca-outbound-pipeline]], [[template-week-time-blocks]] (content factory output should route through verify-copy).

**How to apply:** run verify-copy automatically on final CA outbound copy and content-factory drafts; invoke preflight whenever adding an external dependency.
