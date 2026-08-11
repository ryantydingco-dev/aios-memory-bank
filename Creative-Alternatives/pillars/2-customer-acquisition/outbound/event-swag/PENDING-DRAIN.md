# Pending email_finder drain — as of 2026-08-10 late

**139 email_finder jobs are submitted and PENDING.** All trackIds are in `ef_trackids.txt`
(same directory). Nothing here is lost if the session dies — the trackIds are the receipts,
and results stay retrievable from AI ARK.

## What's waiting to be drained

| Lane | Chunks | Contacts | Enriched source file | Load into |
|---|---|---|---|---|
| Q4 corporate gifting | 54 (`gf_chunk1-54`) | 14,995 | `enriched_gifting.csv` | new campaign (not built) |
| Law firm administrators | 50 (`la_chunk1-50`) | 13,989 | `enriched_legaladmin.csv` | new campaign (not built) |
| Winter shows (CES/SHOT/WOC/IBS/NRF/KBIS/WWETT) | 33 (`ces_/shot_/woc_/ibs_/nrf_/kbis_/wwett_chunkN`) | 8,251 | `enriched_<show>_filtered.csv` | new campaign per season |
| Galas / nonprofits | 2 (`gl_chunk1-2`) | 544 | `enriched_galas_filtered.csv` + `gala_event_map.json` | new campaign (not built) |

## Drain recipe (proven, used 3x tonight)
1. `email_finder_results(trackId, size=100, page=N)` for all pages; 409 = still PENDING, cycle back.
2. Responses spill to `~/.claude/projects/.../tool-results/mcp-ai-ark-email_finder_results-*.txt`.
   **Never read spill files into context** — run `python3 parse_emails.py <out.csv>` right after
   each call (keeps only VALID/ACCEPT_ALL).
3. Join to the enriched source on `person_id`, dedupe by lowercase email.
4. **Exclusion cross-ref** against `context/import/_exclusion_set.json` (names + domains). Mandatory.
5. Drop emails already present in any `leads_*_final.csv` (cross-lane dupes).
6. Clean `company_name`: strip legal suffixes (LLC/Inc/Corp/Co/Ltd/LLP/PLLC/Company/GmbH/SA/PLC,
   repeatedly), title-case ALL-CAPS names >4 chars, keep ≤3-char all-caps as acronyms.
7. Upload via REST in batches of 100 (see recipe in STATE.md).

## ⚠️ Copy is NOT written for these four lanes
Gifting, legal admins, winter shows, and galas have **no approved sequence yet**. Each needs a
draft + two verification rounds + Ryan's approval before any campaign starts. Do not load leads
into a live campaign.

## Credits
~14K remaining as of this writing, **expiring 2026-08-16**. Recommended final spend: enrich
AAPEX (1,913 exhibitors, show Nov 3-5) + IAAPA (1,330, Nov 17-20) + RSNA (672, Nov 29-Dec 3) —
the only newly-harvested shows whose buying window is open now. ~5-6K credits. Bank the rest.

## Harvested but NOT enriched (stockpile — enrich when their window opens)
36 shows / 42,894 exhibitor companies total are in this directory. Spring 2027 shows
(AHR, Expo West, Inspired Home, ProMat, NRA, NAB, World Ag, Roofing, PACK EXPO SE) and
Jan shows (PGA, NAMM, IPPE, Surf Expo, Outdoor Retailer, Fancy Food, Global Pet, SuperZoo)
should be enriched **Dec-Feb**, not now — contact data goes stale and their buyers aren't
shopping yet.

**Show-year caveat:** SuperZoo, NAMM, Surf Expo, Outdoor Retailer, and part of NAB/PACK EXPO SE
are PRIOR-year lists (next directories unpublished). ~80% of exhibitors repeat, but copy must
say "you exhibited at X last year," never "I saw you're exhibiting at X."
