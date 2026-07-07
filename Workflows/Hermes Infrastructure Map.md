# Hermes Infrastructure Map

## Goal
Connect Ryan's work across Telegram, Hermes, Claude Code, Codex, local project files, and future Obsidian into a shared operating memory.

## Current sources
- Hermes chat/memory/skills
- Claude Code sessions: `~/.claude/projects`
- Codex sessions: `~/.codex/sessions`
- AIOS project files: `~/Documents/AIOS`
- Memory bank: `~/Documents/AIOS-Memory-Bank`

## Desired loop
1. Ryan works in Claude Code, Codex, Hermes, or local files.
2. A scanner detects recent activity.
3. Hermes summarizes useful context.
4. Markdown notes are updated in the memory bank.
5. Future agents read the memory bank before making recommendations.

## Guardrails
- Summarize, do not transcript-dump.
- Avoid secrets and raw API keys.
- Preserve decisions and open loops.
- Keep the notes human-readable.
- Prefer boring durable systems over fancy fragile ones.
