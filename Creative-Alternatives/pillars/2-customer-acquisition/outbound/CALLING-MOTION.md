# The Calling Motion — built 2026-08-11

The call sheet (`call_sheet_top20.md`) tells you WHO to call first. This is the machine
around it: a queue that refills itself, a daily rhythm, and what happens when the top 20
runs out.

**Why calling matters more than another campaign:** you now have 5,385 leads getting
emailed and an 0.8% reply rate. Calling is the only channel where a "no reply" becomes a
conversation. And unlike email, nobody else is doing it to these people.

---

## The queue, in strict priority order

### TIER A — Lapsed customers (LIVE NOW, no prep needed)
107 accounts, **$299,196 historical**, top 20 = $188,709. They already bought from you.
Kenny's name opens the call. **This is the warmest list Creative Alternatives will ever
have and it has never been worked**, because until August nobody could call during
business hours.
→ Sheet: `call_sheet_top20.md`. Start with **CLC Day Camp ($35,182, phone-only)**.

### TIER B — Repliers who went quiet
Anyone who replied to a campaign and then stopped. Already documented: 159 past repliers
in `followup_list.csv`, 13 of them marked Interested, plus the 6 on the Gamma sheet who
got a full lookbook and were never followed up.
**A reply means the email worked. A call is just finishing the sentence.**
→ Refill: any lead in Smartlead with `reply_count > 0` and no order.

### TIER C — Multi-openers who never replied
Opened 3+ times, never wrote back. That is interest without action — the single best
cold-call trigger that exists, because you are not calling a stranger, you are calling
someone who read you three times.
→ Refill: Smartlead lead statistics, `open_count >= 3` and `reply_count = 0`.
→ **Needs phone numbers** (see below).

### TIER D — Cold exhibitors with a show date
42,894 harvested companies. Lowest priority, highest volume. Only worth calling once
Tiers A-C are dry, and only for shows inside 8 weeks.
→ **Needs phone numbers.**

---

## The phone-number problem
Tiers A and B mostly have numbers already (existing customers, email signatures, company
sites). Tiers C and D do not.

AI ARK has a `mobile_phone_finder` endpoint. **Do not bulk-buy numbers.** Buy them for a
named list only — e.g. "the 200 people who opened 3+ times" — after Tier A and B are
worked. Numbers for people who never engaged is the same mistake as buying more inboxes.

---

## Daily rhythm (fits the monk-mode schedule)
| Block | What |
|---|---|
| **9:00-11:00** | **Phone block.** The immovable one. Business hours are the asset the layoff bought. |
| Before dialing (5 min) | Pull the day's 10-15 names from the top of the queue. Never dial without the list already built — hunting for the next name is how a 2-hour block becomes 40 minutes. |
| After each call (60 sec) | Log it. Outcome + next action + date. |

**Target: 10-15 dials/day.** That clears the top 20 in two days, the top 40 in a week.
Not 50 — the list isn't deep enough yet and quality of prep beats volume on warm calls.

---

## What actually happens on the call
Scripts A and B live in `call_sheet_top20.md` — Script A for one-year lapses, Script B
for the habit-breakers who bought twice then vanished. Two rules that matter more than
the script:

1. **Ask the question, then stop talking.** The silence does the work.
2. **The ask is never "do you want to buy."** It is *"want me to put your logo on a few
   options and send it over? Costs nothing, you'll have it today."* Same mockup wedge as
   the email. It is the whole engine.

**Kenny takes over the moment it becomes pricing, history, or a real order.** Ryan opens,
Kenny closes. That is also how Ryan learns to quote.

---

## Voicemail
Leave one, once, on the first attempt only. Never on follow-ups.
> "Hi [name], Ryan with Creative Alternatives — Kenny's shop, we did your [item] last
> year. Calling about fall gear, nothing urgent. I'll try you again, or 
> [number] if it's easier."

Then **email the same person within the hour**, referencing the voicemail. The combination
converts far better than either alone.

## Call cadence per account
Attempt 1 → voicemail + same-day email. Attempt 2 → 3 days later, different time of day.
Attempt 3 → the following week, then stop and drop them to email-only. Three attempts,
never more, unless they engage.

---

## Tracking (do this or the motion dies)
Log every call the day you make it: **who / outcome / next action / date**. At 15% of
originated revenue, an unlogged call is unpaid work.

Nightly, add two numbers to the scoreboard:
- **Dials made**
- **Mockups triggered by a call** ← this is the real metric. Dials are input; mockups are
  the leading indicator of revenue.

## Weekly gate
- **Tier A converts (any 2 of the top 20 reorder)** → calling becomes the primary motion
  and cold email gets deprioritized. Warm beats cold on a clock, every time.
- **Top 20 worked with zero traction** → stop, sit with Kenny, and find out what actually
  happened with those accounts before dialing 21-40.

---

## What NOT to do
- Don't batch Tier A into an email. Email is why that list went quiet.
- Don't buy phone data before Tiers A and B are worked.
- Don't cold-call trade show exhibitors yet. They're getting emailed; adding a cold call
  to a stranger who hasn't engaged is the lowest-yield activity available.
- Don't call outside business hours in the prospect's timezone.
