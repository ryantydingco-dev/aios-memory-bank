# Campaign Queue — one lane at a time (Ryan's call, 2026-08-11)

**The rule:** one sequence runs to completion, we read the result, then the next one
starts. Not six at once. This is what event-swag-engine.md said from the beginning —
"NOT simultaneous — July's failure was 8 diffuse verticals at once, and there is exactly
one reply-handler." Six live campaigns was a build-night mistake; corrected.

## Why sequential is right
1. **One reply handler.** The same-day mockup is the conversion engine. Six campaigns of
   replies means the SLA slips, and a missed reply is a wasted lead — the exact leak the
   Gamma follow-up sheet exists to clean up.
2. **You can't read the data.** Six lanes at once and you can't tell which niche
   converts. One at a time gives a clean reply rate per niche. The 3%-by-300 tripwire is
   meaningless without attribution.
3. **Domain health.** 199 inboxes ramping six campaigns simultaneously is a burn risk.
   One lane at a time keeps volume sane.

## Running now
| Campaign | Leads | Why first |
|---|---|---|
| **Trade Shows (7 shows)** | 3,575 | Hard deadline: shows are Oct 18 - Nov 5, exhibitors order in Sept. Biggest list, and the event-driven thesis that produced the $2,600 Miller Johnson close. |
| Camps (kept, small) | 552 | Proven best vertical historically, in-season for fall staff gear, only 552 leads so trivial added reply load. **Say the word and this pauses too if you want literally one.** |

## Paused, queued in DEADLINE order (not arbitrary)
Some lanes have hard event dates and cannot be pushed indefinitely — that's what
determines the order, not list size.

| # | Campaign | Leads | Deadline pressure | Start when |
|---|---|---|---|---|
| 1 | **Race Season** | 897 | Races Sept-Dec; Sept/Oct races order NOW | as soon as trade shows' send phase ends (~2 wks) |
| 2 | **Conference Sponsors** | 753 | Conferences Oct-Dec, same window as trade shows | right after races |
| 3 | **Q4 Gifting** | 10,827 | Holiday orders placed Sept-Oct | early September |
| 4 | **Galas** | 194 | Events Oct-Feb, 8-12 wks lead time | September |
| 5 | **Winter Shows** | 4,603 | Shows Jan-Feb, order window opens Nov | November |
| 6 | **Law Firm Admins** | 9,109 | No event date — evergreen, the proven ICP | whenever a slot is free; ideal Oct |
| 7 | **Funded Startups** | 1,032 | Evergreen, monthly refresh | last, or as filler |
| — | Synagogues | 147 | Paused; kippot are 19-day overseas production | fold into a later slot |

## The gate between lanes
Before starting the next campaign, check the finishing one:
- **Reply rate ≥3% by 300 sends** → the niche works; log what converted and proceed.
- **Under 3%** → stop and diagnose copy or list BEFORE burning the next lane. Do not
  start the next campaign just because the calendar says so.
- Either way: every reply answered same-day, every order logged as Ryan-originated.

## What this changes about the build
Nothing needs rebuilding. All 10 campaigns are loaded with verified copy and are one
API call from starting. The queue above is just the order of those calls.

---

## UPDATE 2026-08-11 — Maclaine's lane opened

**Race Season (3786125) is LIVE on Maclaine's inboxes only.** This is the one case where a
second parallel lane does NOT violate the one-at-a-time rule: it has its own sender and
its own reply handler, so it adds capacity rather than splitting Ryan's attention.

- 24 of her 25 inboxes attached (all 99-100% reputation, all CA-branded domains).
  `mscher@alternatecreativity.com` excluded — SMTP failure, 84% reputation.
- All 199 Ryan inboxes REMOVED from this campaign.
- **Copy re-signed "Maclaine"** — it sends from "Maclaine Scher", so a Ryan signature
  would have contradicted the sender on every email. Only the sign-off changed; the
  approved body copy is untouched.
- Throttled to 120 new leads/day (24 inboxes × 30/day cap = 720 sends/day available;
  120 leads/day keeps per-inbox volume low and the reply flow manageable for one person).

**Standing rule this establishes: sender identity must match the signature.** Any future
campaign on Maclaine's inboxes gets her name in the copy; any on Ryan's gets his. Never
mix identities inside one campaign.

**Her queue:** every reply to Race Season is Maclaine's, same same-day mockup SLA. She
also already owns the DRRT and Skyer Law threads on the Gamma follow-up sheet.

### Now running
| Campaign | Leads | Sender | Inboxes |
|---|---|---|---|
| Trade Show Exhibitors | 3,575 | Ryan | 171 (Ryan's, healthy only) |
| Race Season | 897 | Maclaine | 24 (hers, CA-branded) |
