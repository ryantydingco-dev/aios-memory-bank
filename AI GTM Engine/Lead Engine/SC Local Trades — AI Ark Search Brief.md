# SC Local Trades — AI Ark Search Brief (AR Recovery offer)

Last updated: 2026-06-08
Goal: build a **callable** list of South Carolina local service/trade business owners who have AR / debtor-chasing pain, for **cold calling (Salesfinity)** + the AR Recovery offer.
Why this tool, not Vibe: contractors/cleaners/landscapers aren't on LinkedIn, so Vibe only had ~39 reachable SC owners. They all have Google Business Profiles with a phone number → AI Ark / Maps-based pull is the right source. Local cold calling (local number + rapport) is the winning channel here.

## ICP
- **Location:** South Carolina.
  - **Phase 1 (Midlands, start here):** Columbia, Lexington, Irmo, West Columbia, Cayce, Chapin, Blythewood, Camden, Newberry, Orangeburg, Sumter.
  - **Phase 2 (statewide for volume):** Greenville, Spartanburg, Anderson, Charleston, Mount Pleasant, Summerville, Rock Hill, Myrtle Beach, Florence, Aiken, Hilton Head/Bluffton.
- **Decision-maker:** owner / president / founder (or just the main business line — you ask for the owner on the call).
- **Must have:** phone + website.
- **Best fit = COMMERCIAL / B2B accounts** (they bill net-terms → real AR pain). Pure residential point-of-sale = weaker fit.
- **Size:** small, owner-operated (roughly 1–50).

## Niches (priority order by AR pain)
1. General contractors / commercial builders
2. Commercial cleaning / janitorial
3. Commercial landscaping / lawn care / grounds maintenance
4. HVAC / heating & air contractors
5. Electrical contractors
6. Plumbing contractors
7. Roofing contractors
8. Pest control (commercial)
9. Security / alarm / fire protection
10. Equipment & tool rental
11. Concrete / masonry / paving
12. Commercial painting contractors

## Searches to run (niche × metro — start Midlands)
Adapt to AI Ark's input format; the pattern is `[niche] in [city] SC`:
```
general contractors Columbia SC
commercial cleaning Columbia SC
landscaping companies Columbia SC
HVAC contractors Columbia SC
electrical contractors Columbia SC
plumbing contractors Columbia SC
roofing contractors Columbia SC
pest control Columbia SC
```
…then repeat the set for Lexington, Greenville, Charleston, Rock Hill, Myrtle Beach, Spartanburg, Florence, Aiken.

## Export columns I need (for clean processing)
`business_name, owner_name (if available), phone, email (if available), website, city, state, category, rating, review_count`
- Business-level **name + phone + website is enough** for the call list — owner name/email is a bonus.
- `rating`/`review_count` help me rank (established firms = more likely to carry real AR).

## Hand it back
Drop the export in `AI GTM Engine/Lead Engine/Outputs/` (or paste the path). I'll:
1. Dedupe — including against your existing SC lists (`sc_smb_decisionmakers`, `construction_outreach_ready`, batch-1).
2. Clean + format into a **callable Salesfinity list** + an emailable subset, tagged by niche + city.
3. Tailor the AR call script for trades (below).

## AR call opener — tailored for trades (Salesfinity)
```
Hey [owner], this is Ryan — I'll be quick, tell me to buzz off if it's not relevant.
I help SC contractors get their overdue invoices collected without chasing customers
and GCs themselves. When a job wraps and the money's slow coming in — who's doing the
chasing right now, you, the office, or does it just sit?
...
That's the thing. I set it up so the reminders go out automatically the day it's due,
in your name, until they pay. Before I'd pitch anything I do a quick $500 AR audit —
map exactly how much you've got sitting out past 30/60/90 days. Most owners are
surprised. Worth a look?
```
Objection — "we get paid fine / customers pay cash":
```
Totally — so how much is sitting past 60 days right now on the commercial jobs?
That's the number the audit nails down. Residential cash-at-the-door is easy; it's the
commercial and GC accounts on terms that quietly pile up.
```
