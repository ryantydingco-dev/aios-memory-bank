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
