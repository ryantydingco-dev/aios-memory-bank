# Failure modes — CA list engine (GrowthEngineX pattern)

## What it does
Turns ~10 known-good companies (QBO customers + inbound) into a qualified company list:
fingerprint how they actually show up → fan out industries/keywords → cheap-AI score →
live homepage verify. Contacts and SmartLead upload are a later phase. Drafts only.

## How it breaks (most likely first)
1. **Wrong seeds poison the TAM.** Bronx Science Alumni and USC look like "school" in QBO
   and will pull alumni associations + higher-ed. The schools lane must seed K-12 / PTA /
   booster / academy buyers (Yorkville, iSchool, Berry Hill), not every education invoice.
2. **Self-reported industries are junk.** Databases tag a camp-school as Recreation and a
   booster as Nonprofit. That is the point of the skill. If we pre-filter by industry we
   recreate Apollo. Score everything; only geo + headcount are legal pre-filters.
3. **Homepage verify lies in two directions.** School sites are often JS-heavy (Squarespace,
   Finalsite, Blackboard). Fetch returns a shell → false reject. Parked/district landing
   pages mention "school" once → false keep. Always re-judge on fetched text; if fetch
   fails, status=`unverified` not `reject`.
4. **No unlimited DB in this workspace.** Video uses Prospeo/GetLeads/Blitz. CA's engine
   is AI Ark, and Cursor has no AI Ark MCP. Live runs expand via web + seed lookalikes
   with a hard cap. Full-industry sweeps wait for AI Ark from Claude Code, or a paid
   company API. Do not pretend a 40-row demo is 85% TAM.
5. **Credit burn.** AI Ark email export and any paid lookalike API cost real money.
   Company discovery is cheap; contact/email reveal is the expensive step. Never reveal
   emails in the live demo. Cap `--cap` default 40.
6. **Suppression misses.** Harbor Haven and Camp Arcadia are customers. Existing QBO
   names collide (Crestwood = camp/school). Suppress on domain AND normalized name
   before anything is called a prospect.

## Limits and cost
Demo lane: $0 if we only fetch public homepages + local scoring (seconds, ~40 requests).
If OpenAI nano scoring is added later: ~$1–3 per 10k companies (video's number).
AI Ark email export: credits; keep `max_leads_per_run` 100 from `config/ca_outbound.yaml`.
Homepage fetches: polite 1 req/s, browser UA; expect 10–20% fetch failures on school CMS.

## How we'll detect breakage
Each run writes `output/<lane>/<run>/summary.md` with seed count, pulled, scored,
verified, rejected, fetch-fail. Silent failure = summary says READY but `verified=0`,
or every row `unverified` (bot-blocked). Compare kept domains against the suppress
list; a customer domain in `qualified.csv` is a bug.

## Mitigations built in
Hard `--cap` on live runs. Suppress file (customers + distributors). Fetch-fail ≠ reject.
Seeds are buyer-type, not "anyone who ever paid an education invoice." Company list
only in v1; no email reveal, no SmartLead upload. Human review before any send.

## Post-build notes
2026-08-19 first fingerprint: Yorkville and iSchool are Wix/JS shells. Raw 2–3 grams
were `wixstatic`, `ufonts`, `https static`. Industry hints still fired (`community
school`, `middle school`). Keyword miner now strips CMS/CDN tokens and CSS blobs.
Second pass: name-only rows like "Calhoun School" missed because KEEP lacked a lone
`school` token. Spence returned a thin JS shell and was marked dead. Thin live pages
are now `unverified`, not reject.
