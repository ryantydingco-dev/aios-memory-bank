# Person-Match Coverage — Validation Run (2026-06-01)

**Method (non-circular):** ground truth = real people scraped from companies' OWN
team pages (Vitally, Sourcegraph, Buffer). Test = run the search-based enricher on
each and score whether it found them + got the seniority right. Truth source (team
page) ≠ enrichment source (web search), so it's not circular.

## Result (n=20, after dropping 5 investor/board entries)

| Metric | Result |
|---|---|
| **Found** (identified with a title) | **20/20 = 100%** |
| **Usable** (correct seniority ±1 tier) | **19/20 = 95%** |
| **LinkedIn URL captured** | **16/20 = 80%** |

By tier: exec 6/6 found · director 12/12 found (11/12 right seniority) · manager 2/2 found.

Title accuracy was often verbatim: "SVP of Revenue"→"SVP of Revenue", "Staff
Engineer"→"Staff Engineer", "Associate Director of HR"→"Associate Director of HR".
The 1 "wrong" (VP Financial Controller→Controller) and 1 "close" (VP Talent→Chief
People Officer) may be the tool being MORE current than a stale team page.

## The honest caveat (read this before quoting 100%)

**Every test subject was listed on their company's public team page** — so by
definition they all have a public footprint. This measures **accuracy GIVEN a
findable person**, not what % of *all* leads are findable. The hard case — a junior
IC with no LinkedIn at a non-tech company — could not be included, because if no
public ground truth exists for them, neither I nor the tool can find them. Sample
also skews B2B-tech (3 SaaS companies) and toward director-level (no true ICs).

## What you can honestly claim
- "Company-level profile on **every** inbound lead." (always true)
- "For any buyer with a professional footprint — **essentially all director-level-
  and-up B2B buyers** — we identify the right person and seniority **~95%** of the
  time, with their LinkedIn ~80% of the time." (measured, defensible)
- Do NOT claim person-match on *every* lead. The true population coverage depends on
  the client's actual lead mix and is only knowable from their real form data.

## Recommendation
Pitch company-level as universal + person-level as "anyone findable." Then measure
true coverage on the **first client's real leads** — that's the only number that
reflects their actual buyer population.
