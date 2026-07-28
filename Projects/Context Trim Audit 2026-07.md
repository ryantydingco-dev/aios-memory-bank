# Context Trim Audit — 2026-07-19

Source: Anthropic Claude Code team (Thariq, on Peter Yang's podcast). They cut the Claude Code system prompt by 80% because smarter models need fewer constraints and fewer examples. Examples now anchor the model too hard, and "never do X" works worse than giving the reason. Same logic applies to CLAUDE.md files and skills: they're loaded into context and long ones actively constrain output.

## Findings

**Biggest offender: aios-starter-kit/CLAUDE.md — 822 lines, 64KB, loaded every session in that repo.**
It documents ~20 subsystems. Per the workspace-map audit (2026-07-04) this repo is 75% dead and only time-blocks + content factory are live. Retired sections still being loaded every session: Meeting Engine, RE Signal Scraper, AI Cold Caller, Autopylon, Hormozi Playbook, Eric Siu skills, Client Delivery System, IntelOS, Signal-First Lead Engine, LinkedIn Lead Gen, Higgsfield Video, CommandOS.

Trim plan: keep What This Is, Workspace Structure (trimmed), Commands, Data, Time Blocks, Content Pipeline/Factory, Daily Brief. Move every retired subsystem section to docs/archive/claude-md-retired-sections.md so nothing is lost. Expected result: roughly 822 → 150 lines.

**Skills: bodies are fine to be long (they load on invoke, not always). The always-loaded part is each skill's frontmatter description.** Largest bodies for reference:

| Lines | Skill | Note |
|---|---|---|
| 1,873 | seedance-social-hook (aios) | example-heavy |
| 1,329 | seedance-cinematic (aios) | example-heavy |
| 1,191 | talking-head-recut (user) | |
| 1,151 | seedance-brand-story (aios) | |
| 1,145 | seedance-motion-design (aios) | |
| 1,117 | banana-pro-director-30 (user) | |

The Seedance family is ~5,500 lines of mostly worked examples. Per the 80% lesson, examples are what to cut first: keep the format spec and 1 example each, delete the rest. Only worth doing when one of them next misbehaves; not urgent.

**CA workspace CLAUDE.md: 114 lines. Healthy, leave it.**

## Done alongside this audit

- New user-level skill `verify-copy`: worker/verifier split for cold email + LinkedIn drafts, CA rubrics included, batch workflow packaged in the skill.
- New user-level skill `preflight`: failure-modes explainer required before wiring any new pipeline or integration.
