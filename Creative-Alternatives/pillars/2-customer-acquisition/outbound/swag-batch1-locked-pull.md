# Swag Handled — batch-1 LOCKED pull (MCP method)

> The reproducible "just pull this" recipe. Replaces the raw-API `ai_ark_pull.py` (Cloudflare-blocks raw clients). Uses the **AI Ark MCP** + a client-side **primary-industry filter** to defeat the MCP's loose multi-tag industry matching. See memory `ai-ark-mcp-industry-match-looseness` for the why.

## Step 1 — Pull (free `people_search`, no credits)
Run `mcp__ai-ark__people_search` with these LOCKED params, paging `size:100`, `page:0..N`:

- **title:** `office manager, marketing manager, operations manager, director of people, hr manager, executive assistant`
- **companyIndustry:** `law practice, legal services, accounting, real estate, financial services`
  - *(the five that map to AI Ark enums exactly. `marketing`/`advertising` deliberately EXCLUDED — too noisy; agencies = a clean batch-2, filtered on primary industry.)*
- **companyLocation:** `New York, New Jersey, Connecticut`
- **minEmployees:** `25` · **maxEmployees:** `500`

To balance segments (default sort is finance-heavy in NY metro), also run single-industry pages for the thin ones: `accounting` (p0–1), `law practice, legal services` (p1), `real estate` (p1). Large results auto-persist to the session `tool-results/` dir as `.txt`/`.json` — do NOT read them into context.

## Step 2 — Filter (`swag_pool_filter.py`)
Parses every persisted people_search dump and keeps a row ONLY if:
1. **primary** company industry (`company.summary.industry`) ∈ {law/legal, accounting, real estate, financial/finance/investment, insurance} — this is the fix for the fragrance-brand-on-a-stray-tag pollution.
2. **title** strict-matches one of the locked six (regex, no fuzzy "project manager" creep).
3. company **HQ state** ∈ NY/NJ/CT.
4. employee bucket overlaps 25–500.

Then dedupes by person id and to **one contact per company**. Output → `swag_candidate_pool.csv`.
*(The copied script has session-specific `TOOL_DIR`/`OUT` paths hardcoded — repoint them when re-running in a new session.)*

## Result locked 2026-06-28
- **903 raw → 841 unique → 468 pass filter → 384 after company-dedupe.**
- Mix: financial 149 · law 96 · accounting 72 · real estate 61 · insurance 5 · investment mgmt 1.
- Titles: EA 118 · ops mgr 67 · office mgr 66 · marketing mgr 56 · HR mgr 59 · dir/head of people 18.
- **No emails/mobiles revealed yet** — reveal happens AFTER filtering + deep-research narrows to the keepers (credit-smart).

## Tunables noted (not yet applied)
- `banking` primary industry is currently rejected (community banks are valid swag buyers) — add if we want them.
- Strict title drops near-misses ("Business Operations Manager", "Partner EA") — loosen per-title if we want volume over precision.

## Next
Filter + deep-research the 384 → rank by buy-now signal (hiring / funding / event / new office) → reveal email+mobile on the final cohort → write the 3 channel CSVs → load SmartLead / Sendr / Salesfinity. Related: [[swag-handled-launch]].
