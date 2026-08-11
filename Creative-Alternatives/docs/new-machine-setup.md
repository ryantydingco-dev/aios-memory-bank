# System: New Machine Setup (Mac Studio, or any future Mac)

> How to bring the Creative Alternatives AIOS up on a new computer so all machines
> stay intertwined through GitHub and no work is ever lost. ~20 minutes.
> Written 2026-07-12 for the Mac Studio; works for any Mac.

## The model

- **GitHub is the single source of truth** — repo `ryantydingco-dev/Creative-Alternatives-AIOS`, branch `master`. Every machine is a synced copy.
- **Committed & shared:** the reusable operating framework, context, plans, docs, scripts, GTD files, commands, and sanitized templates/examples.
- **Machine-local by design (never in git):** `.env` and auth settings, `data/`, raw QuickBooks/ledger imports, prospect/customer datasets, personalized proofs, `.venv`, and launchd jobs.
- **The rhythm on every machine:** start with `git pull` (or just ask Claude to pull) → work → `/commit` → `git push`. Claude handles this when asked; the habit is what matters.

## Setup steps (give this file to Claude on the new machine and say "set this up")

1. **Install Claude Code** — claude.ai/code (desktop app) or `npm install -g @anthropic-ai/claude-code`.
2. **Sign into GitHub** — in Terminal: `gh auth login` (browser flow; install gh first with `brew install gh` if needed). Use the ryantydingco-dev account (or a collaborator account added to the repo).
3. **Clone the workspace:**
   ```bash
   cd ~/Documents
   git clone https://github.com/ryantydingco-dev/Creative-Alternatives-AIOS.git "Creative Alternatives AIOS"
   ```
4. **Rebuild the Python sandbox:**
   ```bash
   cd ~/Documents/"Creative Alternatives AIOS"
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```
5. **Transfer `.env` from an existing machine** — AirDrop the `.env` file (it's invisible in Finder: in the workspace folder press ⌘⇧. to show hidden files). NEVER email it or put it in git. Drop it into the workspace root on the new machine.
6. **Transfer local business data securely, if this machine needs live reporting** — use AirDrop or an encrypted drive to copy the raw ledger/QuickBooks exports and other required local datasets from an existing authorized machine into their matching ignored paths (`context/import/` and `data/`). Do not email them or add them to git.
7. **Build the local database:** `.venv/bin/python scripts/collect.py` — recreates `data/data.db` from those local sources. Verify with `.venv/bin/python scripts/db.py`.
8. **Git identity** (so commits say who made them):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```
9. **Scheduled jobs — ONLY on the designated always-on machine** (see below):
   ```bash
   cp config/com.aios.data-collect.plist config/com.aios.daily-brief.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.aios.data-collect.plist
   launchctl load ~/Library/LaunchAgents/com.aios.daily-brief.plist
   ```
   ⚠️ First edit both plists if the workspace path differs (they contain absolute paths to `/Users/kennyscher/...`).
   Then grant Full Disk Access to python3 (System Settings → Privacy & Security → Full Disk Access → + → ⌘⇧G → `/Library/Developer/CommandLineTools/usr/bin/python3`).
10. **Test:** open Claude Code in the workspace and run `/prime` — it should know the operating context. Live metrics appear after the local data transfer and collection step.

## ⚠️ The one-brief-host rule

The 7 AM daily brief must run on exactly **ONE** machine, or #daily-brief gets duplicate posts.

- **Designated brief host: the Mac Studio** (always on) — once it's set up, load the launchd jobs there.
- On every other machine, either never load the jobs, or unload them:
  ```bash
  launchctl unload ~/Library/LaunchAgents/com.aios.daily-brief.plist
  launchctl unload ~/Library/LaunchAgents/com.aios.data-collect.plist
  ```
- Current state (2026-07-13): the **Mac Studio is now always on** and is the designated brief host. Handoff pending: run the setup steps above on the Studio (including AirDropping `.env` — the `SLACK_WEBHOOK_URL` currently lives only on the Air), load both jobs there, grant FDA, then unload both jobs on the MacBook Air.

## Machine roster

| Machine | Role | Jobs loaded? |
|---|---|---|
| Ryan's MacBook Pro | Ryan's daily driver; SmartLead collector (has its API key) | auto-sync commits |
| MacBook Air ("Kenny's") | Where the AIOS was built 2026-07-12; QuickBooks browser access | data-collect + daily-brief (FDA pending) — unload once the Studio takes over |
| Mac Studio | **Always-on home / brief host — always on as of 2026-07-13** | pending setup: both jobs + FDA |

## Troubleshooting

- **`git pull` says "Please commit your changes"** — ask Claude to commit first (`/commit`), then pull.
- **Push rejected ("fetch first")** — another machine pushed; `git pull` then push again.
- **Merge conflict** — ask Claude: "resolve the merge conflict" (rare; happens if two machines edit the same file offline).
- **data.db missing/empty** — run `.venv/bin/python scripts/collect.py`.

## History

| Date | Change |
|------|--------|
| 2026-07-12 | Written for the Mac Studio onboarding. |
| 2026-07-13 | Mac Studio confirmed always-on; declared designated brief host (handoff from Air pending). First scheduled brief run failed on the Air (never posted). |
