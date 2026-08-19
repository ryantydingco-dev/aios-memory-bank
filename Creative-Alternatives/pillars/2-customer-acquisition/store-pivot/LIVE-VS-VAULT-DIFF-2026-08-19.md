# Live SmartLead copy vs vault — diff result (2026-08-19)

Ran per Ryan's request. Pulled E1 subject + body from all 7 ACTIVE campaigns.
Raw snapshot: `live-copy-snapshot-2026-08-19.json`.

## Headline: the drift is total, not one line

**None of the live E1 copy exists in the vault.** The vault's v3 lanes open with
"family print shop, 27 years in"; every live campaign runs a different, later
generation ("I'll put {{company_name}}'s mark on...", "The mockups are the whole first
step"). The repo was never the source of truth for what is actually sending.

## The approved-facts violation is in ALL SEVEN campaigns, not one

"We're a 27-year, multi-million-dollar family business" appears in the E1 of every
active campaign. **41,822 leads** are in these campaigns.

| Campaign | ID | Leads | "multi-million" | Other |
|---|---|---|---|---|
| Athletic Directors (Spirit Stores) | 3812874 | 7,601 | YES | + "Not a catalog. Not a pitch deck" + **fulfillment promise** |
| Law Firm Administrators | 3787452 | 9,109 | YES | + "not a catalog page" |
| Q4 Employee Gifting | 3787448 | 10,827 | YES | |
| Trade Show Exhibitors | 3777819 | 9,942 | YES | |
| Law National (Retreat Season) | 3580723 | 3,252 | YES | + "not a catalog spread" |
| Race Season | 3786125 | 897 | YES | |
| Galas & Fundraising | 3787454 | 194 | YES | |

"multi-million-dollar" is not on the approved-facts list (approved: since 1999 /
27 years / 2,700+ organizations / 75,000+ orders / 24-48h proofs / ~2wk production).

## 🚨 The bigger finding: campaign 3812874 is already selling the blocked promise

"Swag — Athletic Directors (Spirit Stores)" — **ACTIVE, 7,601 leads, 250/day** —
created 2026-08-17, last updated 2026-08-19 04:00. Its live E1 says:

> "A parent orders on a Tuesday, we print the piece, and it ships to their house.
> Nobody in the athletic office counts inventory or sits on a pile of leftovers."

That is **per-order consumer fulfillment**, promised to athletic directors right now.
It is the exact capability the store-pivot audit (written two days later, 08-19) says
must be confirmed by Kenny/Maclaine BEFORE any lane loads, because "the first yes-reply
is a commitment."

Neither `COPY-AUDIT-2026-08-19.md` nor the 08-19 work log mentions this campaign — the
cloud session appears not to have seen it. So the schools lane was being blocked in the
vault while a schools-equivalent campaign was already live.

**Two possibilities, and only Ryan knows which:**
1. He already confirmed with Kenny/Maclaine that CA can do per-order fulfillment, and
   built this deliberately on 08-17 → the vault block is stale and should be lifted.
2. He hasn't → 7,601 schools are receiving a promise CA may not be able to keep, and
   the campaign should pause until the terms conversation happens.

**No action taken.** Pausing a live 7,601-lead campaign and editing live copy at scale
are both Ryan's calls.

## Recommended, pending Ryan's go

1. **Decide on 3812874** (pause vs. confirmed-and-fine). Highest urgency — it is
   sending now.
2. **Strip "multi-million-dollar"** from all 7 E1s. Surgical: E1 only sends to leads
   entering the sequence, so no threading is disturbed and no one gets a duplicate.
   One API call per campaign.
3. **Reconcile repo vs live.** Either the live copy gets committed to the vault as the
   real v3.5, or the approved v4 store copy replaces it. Right now the vault documents
   copy nobody is sending.

---

# RESOLVED 2026-08-19 — live copy cleaned across all 7 campaigns

Ryan: "strip multi-million from all seven... the main priority is fixing all the
campaigns so that they don't say anything stupid in them."

## Audited all 28 steps (not just E1)

Pulled every sequence step from all 7 ACTIVE campaigns. **E2, E3, and E4 were clean
everywhere** — every violation sat in the E1 opener, which is the generation that got
rewritten outside the repo. Scanned for: approved-facts breaches, negation framing,
em-dashes, discount/urgency gimmicks, unbacked fulfillment promises, unrendered merge
fields, placeholder text.

## Fixed (11 replacements, 7 campaigns, 41,822 leads)

| Fix | Count | Old → New |
|---|---|---|
| Approved-facts breach | 8 | "We're a 27-year, multi-million-dollar family business." → "We've printed for 2,700+ organizations over 27 years." |
| Negation framing | 3 | "The page is the whole first step. Not a catalog. Not a pitch deck." → "The page is the whole first step." · "the firm's mark, not a catalog page" → "the firm's mark on real pieces" · "your own brand on the pieces, not a holiday catalog" → "your own brand on the pieces" · "actually take home, not a catalog spread." → "actually take home." |

The replacement is a straight upgrade: "2,700+ organizations over 27 years" is on the
approved-facts list, is more specific than the brag it replaces, and stops inviting the
price anchoring the audit warned about.

## Verified post-write

All 7: sequences intact (4 steps each), delays preserved (0/3/4/5; LawNational 0/3/5/6),
LawNational's 5 A/B variants preserved. Zero violations on re-scan.

## API notes for next time

- `POST /campaigns/{id}/sequences` round-trip has TWO key-name mismatches vs the GET:
  GET returns `seq_delay_details.delayInDays`, POST requires `seq_delay_details.delay_in_days`.
  GET returns `sequence_variants`, POST requires **`seq_variants`** (POST rejects
  `sequence_variants` with a 400).
- Test on the smallest campaign first; a malformed POST could wipe a sequence.
  Raw pre-edit backup: `scratchpad/all_sequences_raw.json`.

## STILL OPEN — the one thing not fixed

Campaign 3812874 (Athletic Directors, 7,601 leads, ACTIVE) still promises per-order
consumer fulfillment: *"A parent orders on a Tuesday, we print the piece, and it ships
to their house. Nobody in the athletic office counts inventory."* That is not a copy
problem to edit away — it is either true or it isn't, and only Kenny/Maclaine can say.
Removing it would gut the campaign's entire offer. **Ryan's call: confirm CA can do it,
or pause the campaign.**
