---
name: ca-list-engine
description: >-
  Build a qualified company list from seed customers using the GrowthEngineX
  list-expander pattern: fingerprint → fan-out → cheap score → homepage verify.
  Use when Ryan says build a list, expand a TAM, find companies like these,
  pull schools/camps/PTAs, or run the list engine. Does not send email.
---

# CA List Engine

Process from [Eric Nowoslawski / GrowthEngineX](https://www.youtube.com/watch?v=aq5r3_CMh-s).
CA adaptation: seeds come from QuickBooks + inbound, not Apollo. Contacts are a later phase.

Engine root:

`Creative-Alternatives/pillars/2-customer-acquisition/outbound/list-engine/`

## Exhaustive-sweep law

Recall is sacred. Precision is the judge's job.

- If one confirmed-fit company carries an industry or keyword, pull every company that
  matches it (inside geo + size). Do not pre-filter an industry by extra keywords.
- Score everything you pull. Never sample to save time on a real run.
- Live demo exception: `--cap 40` so a screen-share finishes. Say that out loud.
  A capped run is a process demo, not 85% TAM.
- Legal pre-filters only: geography, headcount/size, suppress list.
- Stop a snowball when a round adds <3% net-new qualified companies.

## Hard rules

1. Drafts only. Never upload to SmartLead. Never reveal emails in v1.
2. Seeds must be the *buyer we want more of*, not every QBO row in the vertical.
   Schools lane = K-12 / academy / PTA / booster / AD. Not alumni associations,
   not universities, not camps (Harbor Haven + Camp Arcadia are customers: suppress).
3. Fetch-fail ≠ reject. Mark `unverified` and keep for human review.
4. A customer domain in `qualified.csv` is a bug. Check suppress before writing.

## Live run (schools, the open load-blocker)

```bash
cd Creative-Alternatives/pillars/2-customer-acquisition/outbound/list-engine
python3 scripts/run_lane.py --lane schools --cap 40
```

Then, in this chat:

1. Read `output/schools/<run>/fingerprint.json` and say the industries + keywords out loud.
2. Expand: web-search the mined queries, collect 20–40 candidate schools with
   `name,domain,source`. Write `output/schools/<run>/candidates.csv`.
3. Re-run:

```bash
python3 scripts/run_lane.py --lane schools --cap 40 --candidates output/schools/<run>/candidates.csv
```

4. Open `summary.md` + `qualified.csv`. Spot-check 5 sites. Do not load SmartLead.

## Phase 0 — intake (ask once)

1. Seeds (~8–12 known-good). Default: `seeds/schools.json`.
2. ICP one-liner + disqualifiers (`judge/<lane>.md`).
3. Geo + size band.
4. Titles (contacts later; still record them).
5. Destination: CSV for now.
6. Suppress file (always on).

## Phases

| # | Script | What |
|---|--------|------|
| 1 | `scripts/fingerprint.py` | Fetch seed homepages. Mine industries + 2–3 gram keywords. |
| 2 | `scripts/expand_queries.py` | Turn the fingerprint into search queries. Agent fills candidates. |
| 3 | `scripts/score.py` | Rubric judge. No API required. |
| 4 | `scripts/verify.py` | Live homepage re-judge. Dead/parked drop. Fetch-fail stays unverified. |
| 5 | `scripts/run_lane.py` | Orchestrates + writes camera-ready `summary.md`. |

Optional later (not this session): AI Ark / Prospeo wide pull, nano scoring,
GetLeads/Blitz contacts, MillionVerifier, SmartLead DRAFT upload via `/ca-outbound`.

## Schools ICP (locked for the live build)

**Want:** US K-12 public, private, charter, academy, prep. PTA/PTO, athletic director,
booster, principal, head of school, admissions, advancement.

**Offer:** year-round spirit-wear store. School holds no inventory. Families order.
Share of each sale back to the school. Preview is free.

**Kill:** universities as the account, alumni associations, daycares, tutoring/edtech
vendors, other promo distributors, Harbor Haven, Camp Arcadia.

## Talking the process on camera

Do not narrate tools. Narrate the law:

1. Databases scrape *self-reported* industries. A school merch buyer is not an industry.
2. Start from companies that already paid us (or inbound that asked for the store).
3. Pull the messy universe those seeds live in.
4. Cheap judge throws out the junk.
5. Live site confirms the database is not a ghost.

If asked "why not Apollo": price + the industry-tag problem. Apollo is still fine for
a non-technical sales team that needs sequencing + call tracking in one box.
