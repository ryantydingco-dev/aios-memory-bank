# The Signal Engine — repeatable `{{signal}}` pipeline

> Research a recent, true, specific trigger for every lead in a SmartLead campaign and write a one-line `{{signal}}` to each lead, cheaply, with a cheap model (Haiku) + web search. Proven on the **Law** campaign (1,241 leads → 978 personalized signals, ~78% hit). Built to re-run on any vertical by changing one ID.
>
> Strategy/why behind this: `../trigger-and-signal-framework.md`. This folder is the *execution*.

## What it does (the flow)

```
1_pull_leads.py     SmartLead campaign  -> data/leads.json   (lead_id, first_name, company, email->domain)
2_dedupe_split.py   dedupe by domain    -> data/in/b_000.json ... + data/domain_map.json
signals_workflow.js Workflow: ~10 firms/agent (Haiku) web-search a trigger -> structured {signal}
3_aggregate.py      join results by DOMAIN -> data/final_signals.json (+ clean em-dashes) + stats
4_writeback.py      bulk upsert {{signal}} back into the SmartLead leads
```

## Setup (once)

```bash
export SMARTLEAD_API_KEY=<your key>      # scripts read it from env, never hardcode (this folder is in git)
```
`data/` holds lead PII and intermediate files — keep it gitignored.

## Run it on a campaign (every step prints what to do next)

```bash
cd signal-pipeline
export CAMPAIGN_ID=3562940               # the SmartLead campaign to enrich

python3 1_pull_leads.py                  # -> data/leads.json  (prints lead + domain counts)
python3 2_dedupe_split.py                # -> data/in/*.json    (prints DIR and COUNT)
```

Then set `DIR` and `COUNT` (from step 2's output) at the top of `signals_workflow.js` and launch the workflow from Claude Code:

```
Workflow({ scriptPath: "<abs path>/signals_workflow.js" })
```

When it finishes it writes a task output file. Pass that path to step 3:

```bash
python3 3_aggregate.py <path-to-workflow-output-file>   # -> data/final_signals.json + coverage/quality stats
python3 4_writeback.py                                   # bulk-writes signals into SmartLead (only non-empty)
```

`4_writeback.py` tests one lead and reads it back before touching the rest.

## The hard-won lessons (do NOT relearn these)

1. **Use the Workflow, never hand-launch agents for this.** General-purpose agents given a big batch *self-delegate* (spawn their own sub-agents), invent sequential fake `lead_id`s, overlap ranges, and write to random files. The workflow gives fixed batches, schema-forced output, and deterministic collection.
2. **Small batches (10) + agents read a *tiny* file.** A 40-firm task or reading the full 1,200-row lead file overwhelms Haiku and it writes placeholders. 10 firms in a 10-row file behaves like the proven samples.
3. **Domain-match guard is mandatory.** Firm names collide (e.g. "The Morgan Law Group" vs the giant "Morgan & Morgan"). The agent must confirm the source belongs to the lead's domain or abstain. ~11 firms/1,089 correctly abstained on Law.
4. **Join results back by DOMAIN, not by lead_id.** Don't trust the model to echo IDs. Dedupe leads by domain first (1,241 -> 1,089 unique on Law), research each firm once, then fan the signal out to every lead sharing that domain.
5. **Clean em-dashes/semicolons after.** Haiku slips an em-dash into ~11% of signals despite instructions. `3_aggregate.py` normalizes `— – ;` to commas and unescapes `&amp;`.
6. **Write-back = upsert.** `POST /campaigns/{id}/leads` with `{lead_list:[{email, custom_fields:{signal}}]}` MERGES custom fields (preserves the others) and updates existing leads. Batches of 100.
7. **Two gotchas:** (a) Workflow `args` can arrive as a *string*, so this pipeline hardcodes DIR/COUNT in the JS instead of relying on args. (b) Big runs can hit a session limit mid-way — resume with `Workflow({scriptPath, resumeFromRunId})`; completed batches return from cache.
8. **The SmartLead MCP's *sequence* endpoints 404** — use the REST API (`server.smartlead.ai/api/v1`) with a normal User-Agent header (the default `Python-urllib` UA gets Cloudflare-1010 blocked).

## Cost (so you can budget the other verticals)

Law: **1,241 leads ≈ 5.2M Haiku tokens, ~1,500 web searches, ~10–15 min** (across two runs incl. the resume). Roughly **~4k Haiku tokens per lead.** No enrichment-API credits.

## Per-vertical note

Triggers differ by industry (`../trigger-and-signal-framework.md` has the map). The prompt in `signals_workflow.js` is currently law-flavored ("associate roles," "practice group"). For another vertical, swap the priority examples in the prompt (e.g., agents -> "new client wins, culture gear"; accounting -> "tax-season hiring, new partners"). Everything else is identical.
