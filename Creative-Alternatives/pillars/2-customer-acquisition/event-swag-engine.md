# Event-Driven Swag Engine — built 2026-08-07

## The thesis (Ryan's call, and the data agrees)
"Law firms by email" was never the unit that converted. **Events with dates** were:
Miller Johnson (Sept retreat), KMF (retreat), DRRT (retreat) — every live law deal is an
event deal. So stop targeting industries and start targeting **visible upcoming events**.
A paid booth + a public date = the hardest "ready to buy now" signal that exists in cold.

Goal: revenue inside 60 days (by ~Oct 6). Sender: **Ryan, on the 91 dealthreads/calendargroup
inboxes** (all healthy, all already "Ryan Tydingco"). Reply SLA: same-day mockup, per SOP.

## Staggered rollout — one launch per week, gated by data
Ryan approved all four segments 8/7. NOT simultaneous — July's failure was 8 diffuse
verticals at once, and there is exactly one reply-handler.

| Wk | Segment | Why this order |
|---|---|---|
| 1 | **Trade show exhibitors** | Strongest visible signal; Oct shows order swag in Sept |
| 2 | **Fall sports / schools / homecoming** | Camp-adjacent (proven pattern), in-season NOW |
| 3 | **Galas + nonprofit fall events** | Q4 event season; TA ($6.9K lapsed) proves CA sells here |
| 4 | **Corporate retreats / holiday kickoffs** | Biggest AOV, weakest visible signal — last |

Gate: each launch proceeds only if the prior week's send is ≥3% reply by 300 sends.
Under that: stop, diagnose copy/list, fix before adding a queue.

## Week 1 — Trade show target list (verified dates)
Shows Oct 6 – Nov 5, exhibitors ordering booth swag in the exact window we email:

| Show | Dates | Where | Exhibitors | Notes |
|---|---|---|---|---|
| **PACK EXPO International** | Oct 18-21 | Chicago, McCormick Place | ~2,000+ | Biggest; packaging cos = swag-native |
| **High Point Market** | Oct 17-21 | High Point, NC | ~2,000 | Furniture brands, showroom gifting |
| **FABTECH** | Oct 21-23 | Las Vegas | large | 31K+ attendees; mfg = apparel buyers |
| **Greenbuild** | Oct 20-23 | NYC, Javits | mid | East coast, construction-adjacent |
| **Battery Show NA** | Oct 12-15 | Detroit | mid | Tech budgets, tight timeline (email 1st) |
| **SEMA** | Nov 3-5 | Las Vegas | ~2,000+ | Auto aftermarket = merch-obsessed |

Pipeline per show: exhibitor directory (public) → company list → AI ARK `companyName`
lookup for the marketing / events / trade-show manager (NOTE: `companyKeyword` is
plan-gated 401; `companyName` verified working 8/7) → email_finder → exclusion-set
cross-ref → Smartlead.

## The copy frame (segment 1)
Subject and line one name THE SHOW, not the industry:
> "Saw {{company_name}} is exhibiting at PACK EXPO in October."
Then the wedge: we put your logo on the stuff people actually keep — want to see it before
you order this year's booth items? Mockup on reply, same day. No pricing in email 1.
All claims from the approved-facts list only. No dashes. Plain text.

## Honest math (assumed rates — no observed exhibitor data yet)
6,000 exhibitor contacts × 3% reply (assume, half of camps) ≈ 180 replies →
~35 real conversations → ~8-12 orders × $2-4K booth packages ≈ **$20-45K**, Sept-close
weighted. This is an ASSUMPTION until the first 300 sends report. Tripwire above governs.

## Why the dealthreads domains are fine here
Exhibitor marketing managers get vendor email constantly; sender domain matters less than
the show-name specificity. CA-branded inboxes stay reserved for camps (best list, brand
match). This is also the domain-mismatch test the earlier plan called for.

## Standing rules
- Exclusion set (`context/import/_exclusion_set.json`) runs on every list before upload.
- Every reply logged same day; every order logged as Ryan-originated the day it closes.
- Camps re-run (582 DRAFTED, campaign 3726017) still launches — it is the steady lane and
  does not count against the one-launch-per-week gate (already built + approved).
