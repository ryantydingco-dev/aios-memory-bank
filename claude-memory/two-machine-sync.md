---
name: two-machine-sync
description: "MacBook ↔ Mac Studio git-sync architecture (built 2026-07-07) — 4 private repos, Studio = automation server, sync script + hooks, memory synced via claude-memory/ symlink."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Built 2026-07-07 on the MacBook. Full docs: `aios-starter-kit/studio-setup/README.md`.

- **Spine:** 4 private GitHub repos (ryantydingco-dev): `aios-memory-bank` (~/Documents/AIOS-Memory-Bank), `Creative-Alternatives-AIOS`, `aios-workspace` (~/Documents/AIOS/aios-starter-kit), `personal-ai-os`. Identical paths on both machines; commit history = cross-machine session log.
- **Claude memory is git-synced:** the real dir is `AIOS-Memory-Bank/claude-memory/`; `~/.claude/projects/-Users-ryantydingco-Documents-AIOS-Memory-Bank/memory` is a SYMLINK to it. Same symlink gets created on the Studio by setup-studio.sh.
- **Sync mechanics:** `aios-starter-kit/scripts/aios_git_sync.sh` (pull --rebase --autostash → commit "sync(host): auto" → push; conflicts abort cleanly, logged to logs/git-sync.log). Runs via launchd `com.aios.git-sync` every 20 min on BOTH machines + a SessionStart hook (`--pull`) in ~/.claude/settings.json on both.
- **Single-writer rule:** Studio = automation server (the 8 com.aios.* business jobs move there via studio-setup/setup-studio.sh, then demote-macbook.sh on the laptop). data/ + logs/ are gitignored — runtime state lives on the job-owning machine only. Secrets (.env) never travel via git; manual copy list is printed by setup-studio.sh (includes data/time_blocks_log.json = W/L streak history).
- **Status as of 2026-07-07:** MacBook side fully done (repos pushed, sync live, hook validated). PENDING RYAN AT THE STUDIO: run setup-studio.sh, copy .env/data, demote-macbook.sh, --activate-jobs. Until then the MacBook still runs the business jobs. Verify: exactly ONE 4:30am Telegram card next morning.
- Known losses/flags: ascend-app's local one-commit git history was lost during fold-in (working tree fully preserved); `AIOS-Memory-Bank/aios-starter-kit/` = dead Feb-2026 copy, gitignored, delete when convenient; hermes gateway plists deliberately not migrated; ~/.claude/settings.json permissions allowlist embeds plaintext Telegram/Apify tokens (machine-local, but worth rotating someday). Related: [[workspace-map]], [[creative-alternatives-aios]].
