# Oloxa / Olaxa Outbound Engine , Install-Module Audit

**Date:** 2026-06-03  ·  **Install:** tenant `olaxa` (Ryan = operator B)  ·  **By:** Claude Code (Opus 4.8)

Field report from the first real client install. Every item is something the **next client will hit** unless the module is updated (`INSTALL.md`, `INSTALL_CRON.md`, `templates/`, `scripts/`, `commands/`, `data/voice/`). The engine's *core* is solid (Airtable REST scripts, Unipile, Anthropic, the exchange logic). The gaps are (a) install-experience breaks, (b) drift between the shipped docs/scripts and the LIVE exchange base, and (c) the commands assuming an Airtable MCP the installer never sets up.

**Severity:** 🔴 blocks a fresh install · 🟡 silent/partial breakage · ⚪ polish / expectation-setting

## Summary

| # | Gap | Sev | Next-client symptom | Module fix (one line) |
|---|-----|-----|---------------------|----------------------|
| G1 | Commands need an Airtable MCP (+Calendly) the installer never sets up | 🔴 | `/loom-send` etc. call `mcp__airtable__*` (34x) with no server behind them | Add an "install the Airtable MCP" step |
| G2 | Secrets template format breaks the LinkedIn scripts | 🔴 | LinkedIn detection silently returns nothing | Ship `env.template` as `export KEY=value` |
| G3 | `env.template` missing the Unipile DSN + account_id | 🔴 | Unipile calls fail "missing creds" | Add `UNIPILE_BASE_URL` + `UNIPILE_ACCOUNT_ID` |
| G4 | `airtable-schema.md` missing 13 fields the code reads/writes | 🔴 | Runtime 422 "unknown field" on pull/loom/poller | Add the 13 fields to the schema doc + provisioner |
| G5 | `Pipeline` formula field not API-creatable, not flagged | 🟡 | Audit fails-loud; routing reads blank | INSTALL must instruct the manual formula field |
| G6 | `requirements-setter.txt` missing `pyyaml` | 🟡 | Audit INV-60 throws on every run | Add `pyyaml>=6` |
| G7 | Audit INV-60 lists 2 commands that don't ship | 🟡 | Audit shows 2 permanent blocking findings | Trim `INV60_COMMAND_FILES` or ship the 2 commands |
| G8 | Dead model constant `claude-sonnet-4-5` | ⚪ | Looks like model drift; confusing | Delete dead constant; document `claude -p` dependency |
| G9 | Exchange (Base C) schema drift vs `pull_from_c.py` | 🔴 | Pull imports 0 leads even when leads exist | Reconcile Handoff-Status values + Imported-flag logic |
| G10 | Reference-build voice/identity hardcoded | 🟡 | New client's Looms say "Sway / oloxa.ai / Eugene" | Parameterize sender/site/proof/ICP |
| G11 | `modules.email.enabled=true` default | 🟡 | Cred-resolution errors when no mailbox | Default email off |
| G12 | No "prime the pipeline" / CR-sending guidance | ⚪ | Client expects auto-leads; loom-send shows nothing | Document day-1 manual CR + lead-loading |

## Detail + exact fixes

### G1 , Airtable/Calendly MCP not installed (🔴)
**Found:** `commands/*.md` make 34 `mcp__airtable__{list,update,create,search}_records` calls and 2 `mcp__calendly__*` calls. The installer never connects an Airtable MCP; `config.mcp_servers:["airtable"]` is only a hint. No Airtable MCP exists in the connector registry.
**Fix:** add an INSTALL step: `claude mcp add airtable -s user -e AIRTABLE_API_KEY=<pat> -- npx -y airtable-mcp-server`. Verified in this install: package `airtable-mcp-server@1.13.0` exposes `list_records / update_records / create_record / search_records`, matching the command calls verbatim. For Calendly (Stage III only), document a community Calendly MCP or a REST fallback.

### G2 , Secrets file format (🔴)
**Found:** `templates/env.template` ships plain `KEY=value`. But `load_secrets()` in `check-linkedin-connections.py`, `detect-new-acceptances.py`, `detect-inbound-connections.py`, `check-linkedin-responses.py`, and `cleanup-connection-scan-pollution.py` only parse lines starting with `export ` , so those scripts see NO Unipile/Airtable creds and silently no-op. (`tenant_loader` and the exchange scripts tolerate both formats, which masks the bug during early validation.)
**Fix:** ship `env.template` with `export ` on every line, OR replace every `load_secrets()` with `tenant_loader._parse_env_file` semantics (strip-or-accept both).

### G3 , env.template missing Unipile vars (🔴)
**Found:** scripts read `UNIPILE_BASE_URL` (the DSN) and `UNIPILE_ACCOUNT_ID` from secrets, but `env.template` has neither (only `UNIPILE_API_KEY`). Worse, account_id is read from the **config** by some scripts (`cfg.linkedin.unipile_account_id`) and from **secrets** by others (`linkedin_reply_poller.py`), so it has to live in both places.
**Fix:** add `UNIPILE_BASE_URL` + `UNIPILE_ACCOUNT_ID` to `env.template`; pick ONE source of truth for account_id (recommend config) and update `linkedin_reply_poller.py`. INSTALL Step 4 can auto-discover account_id + provider_id via `GET {dsn}/api/v1/accounts` and `/api/v1/users/me?account_id=` (confirmed working).

### G4 , schema doc missing 13 fields (🔴)
**Found:** `airtable-schema.md` omits fields the code reads/writes, so provisioning straight from the doc yields a base that 422s at runtime. Missing on **Prospects**: `Date Responded, Date Researched, How Found, Outreach Channel, Last Manual Touch At, Last Signal Detected, Enrichment Status, Priority Score, Signal Score, Intent Signal, Signal Notes`. Missing on **Replies**: `Message-ID` (the pollers dedup on this; the doc calls it "Reply ID"), `Confidence`.
**Fix:** add all 13 to the schema doc with types; make doc + code agree on `Reply ID` vs `Message-ID`.

### G5 , Pipeline formula field (🟡)
**Found:** `Pipeline` is a formula field. The Airtable API cannot create formula fields, so any automated provisioner leaves it missing, and `setter-airtable-audit.py` then fails-loud ("Pipeline NOT on base") while routing reads blank.
**Fix:** INSTALL must call out the manual step with the exact formula:
`SWITCH({ICP Tier},"Primary","icp","Adjacent","icp","Jobs","icp","Affiliate","affiliate","Inbound","inbound")`

### G6 , missing pyyaml dep (🟡)
`requirements-setter.txt` lists `anthropic` + `jinja2` only, but `setter-airtable-audit.py` imports `yaml` for INV-60. Add `pyyaml>=6`.

### G7 , INV-60 phantom commands (🟡)
`INV60_COMMAND_FILES` lists `outreach.md` + `outreach-batch.md`, which this checkout does not ship, producing 2 permanent blocking findings at the end of every `/inbox-check` and `/follow-up`. The list path is also `.claude/commands/` while the repo ships `commands/`.
**Fix:** trim the list to shipped commands (or ship the two), and reconcile the path.

### G8 , dead model constant (⚪)
`CLASSIFY_MODEL="claude-sonnet-4-5"` (a retired model) in `detect-inbound-connections.py` + `cleanup-connection-scan-pollution.py` is **unused** , `classify_batch()` shells out to `claude -p` with NO `--model`. The API-based reply classifier uses `claude-sonnet-4-6` (live). 
**Fix:** delete the dead constant to avoid false "model drift" alarms; and document that the inbound/cleanup classifiers depend on the `claude` CLI being installed + authenticated on whatever host runs them (including the VPS), not on `ANTHROPIC_API_KEY`.

### G9 , Exchange (Base C) schema drift (🔴 , the operational one)
**Found:** `pull_from_c.py` filters `{Handoff Status}='Ready'` AND `{Imported Record ID}=BLANK()` AND `{Assignee}='<owner>'`. But the LIVE Base C "Leads" table uses Handoff Status values **`READY_FOR_LINKEDIN` / `NEEDS_RESEARCH` / `READY_FOR_EMAIL`** (not `Ready`), and **all 20 rows already carry an Imported Record ID**. Net: the pull matches **0** even though 10 rows are assigned to Ryan. The shipped script and schema doc (`Handoff Status = Draft/Ready/Imported`) are stale versus Sway's live exchange protocol.
**Fix (needs Sway, he owns the exchange schema):** either (a) update `pull_from_c.py` to treat `READY_FOR_LINKEDIN` (and which others?) as pullable and re-define the Imported-Record-ID semantics, or (b) make the ready-status set + dedup key config-driven (`base_c.ready_statuses: [...]`). Until reconciled, the C→B auto-pull is non-functional for a new operator.

### G10 , hardcoded reference-build voice (🟡)
`commands/loom-send.md` tab-switches to `oloxa.ai`, locks the "Eugene the debt advisor" proof verbatim, defaults the ICP label to "commercial finance brokers," and command prose addresses "Sway." `data/voice/*` ship the same.
**Fix:** parameterize `{your_website_url}`, the proof case, the ICP label, and the operator name from config + voice files; strip literal "Sway"/"oloxa.ai" from the command markdown.

### G11 , email default (🟡)
Template `modules.email.enabled=true` means a no-mailbox client hits cred-resolution errors. Default it `false`; flip on when SMTP/IMAP are provided.

### G12 , pipeline-priming expectations (⚪)
Nothing sends connection requests (manual by design), and a fresh base is empty, so `/loom-send` shows nothing on day 1. The module should state the day-1 sequence (load leads → send CRs → wait for accepts → warm → loom) and clarify that Base C leads only flow once an operator's rows are in the pullable state (see G9).

## Already fixed in this install (carry these back into the module)
- Provisioned all 3 tables + the 13 missing fields.
- Converted secrets to `export` format; added the Unipile DSN + account_id; auto-discovered provider_id.
- Installed `pyyaml`; trimmed the INV-60 list; added project-local `.claude/commands` + `.claude/skills`.
- Connected the Airtable MCP (`airtable-mcp-server`, user scope).
- Confirmed the only remaining manual steps are the `Pipeline` formula field and voice personalization.
