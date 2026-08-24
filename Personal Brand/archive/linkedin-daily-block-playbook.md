# The Daily 2-Hour LinkedIn Block: Run-of-Show + Scripts

Companion to `linkedin-6-month-plan-2026-08.md`. This is the execution layer: what happens inside the 2 hours, every day, Mon through Sun. Built 2026-08-20.

The order matters. Asks first, content second. DMs and comments are conversations with real prospects; the post can ship rougher on a bad day, a skipped DM session can't be recovered.

Revenue rule (added 2026-08-20): 8 of 10 DMs go to HOT or WARM CA buyers. Peers get comments, not DMs. A mockup yes stops the block. Full math and scorecard: `linkedin-block-upgrade.md`. Start from `daily-prep/YYYY-MM-DD.md` so you are not hunting the feed.

---

## The block, minute by minute

Target **75 minutes** once today's pack is filled. Use 120 only if the pack is empty and you have to hunt.

| Time | Activity | Output |
|---|---|---|
| 0:00 to 0:10 | **Inbox + replies.** Answer every comment on yesterday's post, answer DMs. If any DM is a mockup yes, stop and send the mockup. | Zero unanswered comments or DMs |
| 0:10 to 0:30 | **Comments, 12.** Pack list first: 8 prospect, 2 peer, 2 aspirational. Substantive only. Never "Great post!" | 12 comments logged |
| 0:30 to 0:50 | **Warm DMs, 10 touches.** HOT rows first, then WARM. 0 peer DMs. 5 to 8 new connection notes + follow-ups. | 10 touches, 8+ HOT/WARM |
| 0:50 to 1:10 | **The post.** Factory draft from the pack, rewrite 10 to 20% in your voice, humanizer pass, publish | 1 original live |
| 1:10 to 1:15 | **Log.** Grokbot rows into `linkedin-conversation-log.md` | Books balanced |

First 30 minutes after posting: stay reachable and reply fast to early comments. Doesn't need to be inside the block, phone is fine.

---

## The 7-day posting calendar

One post a day. Weekends get the personal formats because B2B reach drops 30 to 50% on Sat/Sun and narrative is the format least hurt by it. No formula repeats within the same week.

| Day | Pillar | Format | What it looks like |
|---|---|---|---|
| Mon | Narrative | Sprint Log | The week's scoreboard + the plan. Real numbers from the CA dashboard |
| Tue | Authority | Teardown (text or video) | Open one system on screen: the AR chase, the signal table, the reply router. What it did this week |
| Wed | Offer (the week's only one) | Mockup wedge story | "Someone replied to a cold email Tuesday. Here's what they had back before lunch." Show the mockup. No pitch, no price |
| Thu | Authority | Steal-this tactic | Your proven format (Google Maps post pulled 22, cold-email machine 15). One tactic, exact steps, observed cost |
| Fri | Narrative | Build-in-public log | What got built, what broke, what Kenny said. Post-Mortem slot when something failed this week |
| Sat | Personal narrative | Story post | Fitness, Hyrox, coaching at the gym, the SC move. Your Aug 18 trainer post pulled 22 on this exact lane. One business lesson injected, never forced |
| Sun | Community | Light + human | Maclaine crossover, a customer spotlight, a poll, or a photo from the shop floor with 3 sentences. Lowest-effort slot by design |

Notes:
- The content factory only drafts Mon to Sat today. Either extend `ca_content_factory.py` to Sundays or accept that Sunday is the hand-written photo/poll slot. The Sunday slot is deliberately the one a tired human can do in 15 minutes.
- Wed is the ONLY offer-flavored post. Two in a week kills trust.
- Every post except Sat/Sun gets a contextual credibility line with an observed number.

---

## The comment system (15 to 20 a day)

### Target mix

| Share | Who | Why |
|---|---|---|
| ~65% (8) | **Prospects + watering holes.** Event planners, ops/office managers, firm admins, marketing coordinators, camp directors, HR people posting about retreats, onboarding, trade shows, events | These are the people who buy from CA. Commenting is the warm-up for the DM |
| ~15% (2) | **Peers.** AI-for-SMB builders, outbound operators, promo/print industry folks, other build-in-public accounts | Peers engage back, which feeds your posts' early velocity. No DMs. |
| ~20% (2) | **Aspirational.** Jason Bay tier and up, big AI-operator accounts | Their comment sections are where your ICP hangs out. A sharp comment there outreaches your own feed |

### Finding prospects daily (10 minutes of the comment window)

- Search posts, not people: "trade show booth", "company retreat", "employee onboarding", "swag", "conference next month", "team offsite", filtered to past week
- Your own engagers and Maclaine's engagers (her shop-floor posts pull CA-relevant people)
- Commenters on promo-industry and event-planner accounts
- Save every prospect you comment on to a running list; they're tomorrow's DM candidates

### Comment patterns (pick one, never generic praise)

1. **Data-first:** add an observed number from CA or your outbound history that extends their point
2. **Answer-their-question:** if their post asks something you've lived, answer it fully, 3 to 5 sentences
3. **Story-match:** "we hit this exact thing at the shop last month" + the two-sentence version
4. **The useful disagree:** respectful, specific, once a day max

## The warm DM system (10 touches a day)

Warm only. Someone qualifies when at least one is true: engaged with your content, accepted your connection in the last 2 weeks, you've exchanged comments anywhere, they fit CA ICP and posted something real this week, or they viewed your profile.

Volume split, roughly: 5 to 8 new connection requests with a note, 2 to 5 follow-up messages. Hard cap 15 requests/day (LinkedIn throttles around 100 to 150/week and acceptance rate is the health metric: under 30% means pull back).

### Scripts (format law: opening line alone, blank line, hook, blank line, question)

**Connection request, prospect who posted about an event:**
> Saw your post about [the retreat / the show / the offsite].
>
> I run growth at a 27-year print shop and half my job is watching people plan events like yours, so it caught my eye.
>
> How's the planning going, is the merch side sorted yet?

**Connection request, peer/builder:**
> Your post on [specific thing] was the best take on it I've seen this week.
>
> I'm mid-build on the same problem inside a 27-year family print shop (documenting it as I go), so your stuff is directly useful.
>
> What made you go with [specific choice they made]?

**Follow-up after they accept (24 to 48h later, only if they didn't reply to the note):**
> Thanks for connecting.
>
> No agenda here, your [post/comment] on [thing] just stuck with me. I'm the guy running growth at Creative Alternatives and posting the build as it happens.
>
> What are you working on this quarter?

**Follow-up to someone who engaged with a post:**
> Noticed you [commented on / reacted to] the [topic] post, appreciated that.
>
> Curious what landed for you, I'm trying to figure out which parts of this build are actually useful to people versus just interesting to me.

**Prospect who's clearly planning something (the ONLY one that mentions the offer, and only as a give):**
> You mentioned [the event] is coming up in [month].
>
> Standing offer I make everyone: tell me the event and I'll send mockups with your logo already on the gear, free, usually same day. No call, no deck, you just get to see it.
>
> Want me to put a couple together?

Rules: the mockup offer only goes to someone who has already replied at least once, or whose post explicitly describes an event they're running. Never as a first message to a cold accept. Nothing else ever pitches, links to buy, or discounts.

### Tracking

One row per person in a running log (`linkedin-conversation-log.md` or a sheet): date, name, segment (prospect/peer/aspirational), touch type, their last reply, next step. Weekly count of conversations started is the number that gets reviewed, not requests sent.

---

## Weekly review (Sundays, 15 min, inside the block)

- Posts: 7/7? Which was the week's multiple winner and loser?
- Comments: which watering holes produced replies or profile views?
- DMs: requests sent, acceptance %, conversations started, mockup offers extended, any that moved to email/call
- Feed one insight into next week: double the thing that started conversations

## Wiring it into the day

The old content block was 1:45 to 2:45. This is now a 2-hour block; slot it wherever the calendar allows daily, but the factory draft lands at 1:45pm, so 1:45 to 3:45 is the natural home. Add it to `time_blocks.json` / GCal so the W/L game loop scores it. The block's done-when: post live + 15 comments + 10 DM touches + logs updated.
