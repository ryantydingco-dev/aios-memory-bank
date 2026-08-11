# /ca-outbound — automated cold-outbound pipeline

One command turns a target vertical into a reviewable SmartLead DRAFT campaign, personalized per lead.
Built 2026-07-07. **Draft-only — it never sends. Ryan reviews in SmartLead and clicks Start.**

## The chain (what `/ca-outbound <icp>` does)
1. **AI Ark** — pull leads for the ICP (`config/ca_outbound.yaml`). Data engine is AI Ark only (no Apollo/LEAD411).
2. **Crawl** — `ca_outbound_prep.py crawl` scrapes each firm's site → `company_description`.
3. **Personalize** — `/ca-personalization-subagent` (Task fan-out) writes a per-lead opener + mockup-tease CTA.
4. **Gates** — `/spam-word-checker` + `/list-quality-scorecard`.
5. **Assemble** — `ca_outbound_prep.py assemble|variants` → `leads.csv` + `variants.yaml`.
6. **Upload DRAFT** — the repo's proven `upload.ts` (draft-only) creates the campaign.
7. **Notify** — Telegram: "draft ready, review + Start."

## Run it manually (the normal way)
In a **CA-workspace Claude Code session** (so the ai-ark + smartlead MCPs are loaded):
```
/ca-outbound financial --limit 25
/ca-outbound law --limit 25
```
First run per ICP walks the personalization approval loop (1 → 10 → 10, lock after 2 clean rounds) and
saves the locked prompt for reuse.

## Files
- `.claude/skills/ca-outbound/` — orchestration skill
- `.claude/skills/ca-personalization-subagent/` — per-lead personalization (Task tool)
- `config/ca_outbound.yaml` — ICP filters (AI Ark), schedule, guardrails
- `config/ca_variants_template.yaml` — SmartLead copy (Maclaine's voice), upload.ts-compatible
- `scripts/ca_outbound_prep.py` — crawl / assemble / variants / notify (never sends)
- `scripts/ca_outbound_cron.sh` + `~/Library/LaunchAgents/com.aios.ca-outbound.plist.disabled` — scheduled runner (OFF)

## Prerequisites before scheduling it unattended
The scheduled job (`com.aios.ca-outbound.plist.disabled`) is **OFF on purpose.** Enable only when:
1. **Inboxes tagged** — the cold inboxes must be tagged `financial` / `law` in SmartLead, or `upload.ts`
   throws "No healthy inboxes found with tag=…". Run `/smartlead-inbox-manager` once to tag them.
2. **Prompt tuned once** — run `/ca-outbound <icp>` interactively first so a locked personalization
   prompt exists; unattended runs reuse it (no approval loop headless).
3. **Credit spend accepted** — each run exports up to `--limit` leads from AI Ark (costs credits).

Then:
```
mv ~/Library/LaunchAgents/com.aios.ca-outbound.plist.disabled ~/Library/LaunchAgents/com.aios.ca-outbound.plist
launchctl load ~/Library/LaunchAgents/com.aios.ca-outbound.plist
```

## Review checklist (every draft, before clicking Start in SmartLead)
- Subjects + a few body previews read right; merge fields resolved.
- Inboxes: correct **cold** tag, correct count (NEVER the reactivation/warm pool).
- **Set "stop on reply" ON and open/click tracking OFF** — `upload.ts` doesn't set these.
- Lead count + a few random rows look clean; personalization isn't repetitive or fabricated.
- Schedule (timezone/hours/throttle) matches `config/ca_outbound.yaml`.

## Guardrails (enforced by the skill)
Draft-only · per-run lead cap (≤100) · human-review gate · exclude existing customers/competitors ·
cold inboxes only (deliverability firewall) · never fabricate leads or facts.

## Aligns with the game plan
This is the **weeks 5-6** build (outbound v2). The A/B = personalized opener (arm A) vs generic (arm B),
one randomized list split 50/50, judged on positive replies at day 21 — governed by `/experiment-design`.
Run `/email-deliverability-audit` to baseline BEFORE the first A/B send.
