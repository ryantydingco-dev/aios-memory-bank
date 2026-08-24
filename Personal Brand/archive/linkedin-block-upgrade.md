# LinkedIn Block Upgrade: Time Down, Revenue Up

Written 2026-08-20 after Ryan asked how to make the daily block save time and generate more revenue.

## Day-zero verdict

**REALISTIC for 1 CA order per month from this block. UNREALISTIC for 2+ until we have observed LinkedIn rates.**

The 2-hour block as written will grow the account. It will not grow CA revenue unless the 10 DMs go to people with a merch moment. Posting 7 days a week is a trust asset. Comments and DMs to buy-now people are the revenue line.

Observed numbers we actually have:
- CA cold email: about 1 positive per 700 to 1,100 sends
- CA first closed order this cycle: Miller Johnson, $2,600, started from a cold email + same-day mockup
- LinkedIn DM conversion for Ryan: **none observed**. Everything below is labeled assumed.

### Funnel (assumed rates, pessimistic)

| Step | Rate | Source | Monthly at 10 touches/day (300) |
|---|---|---|---|
| New connection requests | ~60% of touches | playbook split | 180 |
| Accept | 30% | assumed, LinkedIn warm-note floor | 54 |
| Reply | 20% of accepts | assumed, pessimistic | 11 conversations |
| Has a real event in 12 weeks | 10% if hunting the feed, 40% if we feed CA signals | assumed | 1 vs 4 |
| Mockup sent | 50% of event conversations | assumed | 0.5 vs 2 |
| Order | 25% of mockups | assumed (Miller Johnson is 1 of 1 public proof, do not treat as a rate) | **0 vs 0.5 to 1** |

What closes: **1 CA order per month is plausible if the DM queue is built from existing CA signals (openings, trade shows, email repliers, reactivation), not from random LinkedIn keyword hits.** At $2,600 conservative AOV that is about $2,600/month from the block. Holiday corporate work runs $5k to $20k; do not budget that until it happens.

What does not close: treating "AI thought leader" DMs as a revenue channel. Those conversations are month-6 inbound, not month-1 cash. Keep 20% of comments on that lane. Do not spend DM slots on it.

AI automation clients: this block warms them. It does not close them for 6 months by design. Count those as conversations logged, not as revenue.

## What actually wastes the 2 hours

| Minute | What happens today | Revenue? |
|---|---|---|
| 20 | Hunting the feed for posts to comment on | No. This is the job Grokbot should arrive already having done. |
| 30 | Writing comments to peers and big accounts | Weak. Peers help distribution. They do not order hats. |
| 15 | DMing people who "posted about events" with no date, no title, no company | Weak. Most of those posts are thought leadership, not a buy. |
| 10 | Logging by hand | No. |

The post pass is already cheap (factory drafts it). Do not try to save time by auto-posting. Auto-send on LinkedIn is how accounts get restricted. Ryan stays the sender.

## The upgrade (do these, in this order)

### 1. Daily pack, not screenshots (time)

Every morning, one file lands at `Personal Brand/daily-prep/YYYY-MM-DD.md`. Grokbot's session start is "run today's pack." Ryan stops pasting screenshots.

The pack has four lists, already scored HOT / WARM / PEER / SKIP:
1. **Buy-now queue (revenue).** People from CA engines who also have a LinkedIn URL: openings digest, trade-show exhibitors in the 8 to 12 week window, SmartLead repliers, reactivation names. These eat DM slots first.
2. **Engager queue (warm).** People who liked or commented on Ryan's or Maclaine's last 2 posts, tagged prospect / peer / other.
3. **Watering-hole posts (comments).** 12 to 15 recent posts matching event language, already filtered to buyer titles.
4. **Today's factory draft.** Copied in so Grokbot does the post pass without a second paste.

Until the scraper exists, Ryan or Grokbot fills the pack in 10 minutes from the Monday openings list + yesterday's post. The file shape is the same either way. Template: `daily-prep/_template.md`.

Target block once the pack is live: **75 minutes**, not 120.
- 10 min inbox
- 20 min comments (12, not 20: drop most peer comments)
- 20 min DMs (10 touches, HOT first)
- 20 min post
- 5 min log (Grokbot writes the rows, Ryan pastes)

### 2. Score every name before a DM (revenue)

Grokbot may not draft a DM for anyone below WARM.

| Score | Meaning | Action |
|---|---|---|
| HOT | Buyer title (planner, ops, office manager, marketing coord, HR, camp director, admin) AND a named event or opening in the next 12 weeks, OR a CA email reply | Comment today, DM today, mockup offer after first reply |
| WARM | Engaged with Ryan/Maclaine, or viewed the profile, and title fits ICP | Comment, DM in 24 to 72h (not same hour they liked) |
| PEER | Builder, outbound person, print-industry peer | Comment only. No DM unless they asked a question. |
| SKIP | Other merch vendors, agencies pitching you, no company, no event, "thought leadership" with no buy moment | Ignore |

Daily mix change: **8 of 10 DMs are HOT or WARM CA buyers. 0 DMs to peers. 12 comments: 8 prospect, 2 peer (distribution), 2 aspirational (ICP watering hole).**

### 3. Wire the engines you already paid to build (revenue)

Do not scrape LinkedIn hoping to find buyers. You already find them.

| Existing engine | What it knows | LinkedIn use |
|---|---|---|
| `ca-openings` weekly digest (Mon 7:15am) | New gyms, restaurants, medical, sponsors | First 5 DM slots that week |
| Trade-show exhibitor lists | Booth buyers on a deadline | Comment + DM the marketing/ops contact |
| SmartLead repliers | Already talked to CA | LinkedIn is the second channel, not a cold start |
| Reactivation list (981) | Bought before | Warm DM, no pitch, "still doing events?" |
| Miller Johnson path | Same-day mockup closes | Every HOT yes goes to this path the same day |

Grokbot's DM job now asks: "is this person on a CA list?" If yes, the first line references the real moment (opening, show, last order year), not "saw your post."

### 4. Same-day mockup SLA (revenue)

A LinkedIn "yes, send mockups" that sits overnight is a leaked close. Standing rule, already true for email: **positive reply to human follow-up in 24h, mockup same day.**

When a DM gets a yes, the block stops. Ryan sends the mockup (or queues `ca-production-art`) before writing another comment. The scorecard treats a same-day mockup as the win, not "10 touches completed."

### 5. Grokbot is the only interface (time)

Do not add Telegram, Slack, or another ping for this block. The content factory and openings digest already land in Telegram for CA ops. That is a different loop. For LinkedIn, the session is: open Grokbot, say "block time," point it at `daily-prep/YYYY-MM-DD.md`. If the pack is thin, Grokbot asks for 3 HOT names. No second app.

## What we will not automate

- Sending comments, DMs, or posts. LinkedIn will flag it, and a banned account wipes the 6-month plan.
- Auto-mockup from a LinkedIn yes without Ryan seeing the logo. Wrong art is worse than a slow art.
- Growing the block past 10 DMs/day. Volume is not the constraint. Targeting is. Cap stays 15 connection requests.

## Daily scorecard (green / yellow / red)

| Action | Green | Yellow | Red |
|---|---|---|---|
| HOT/WARM DMs sent | 8+ | 5 to 7 | under 5 |
| Conversations started (reply today) | 2+ | 1 | 0 for 3 days running |
| Mockups sent from LinkedIn yes | 1 | 0 but a yes is in progress | a yes sat overnight |
| Post live | yes | drafted, not posted | missed |
| Comments on prospect posts | 8+ | 4 to 7 | under 4 |

Tripwires:
- **Week 2:** if acceptance rate is under 30%, the notes are too salesy or the list is cold. Rewrite, do not add volume.
- **Week 4:** rank comment sources and DM sources by conversations started. Kill the worst source. If Sunday posts sit under 1x median, Sunday becomes comments+DMs only.
- **Week 8:** if zero mockup yeses from LinkedIn, the targeting is wrong. Stop keyword hunting. Run only CA-signal names for 2 weeks and interview the no's.
- **Warm-rejection:** if 5 HOT people with a named event decline the free mockup, stop sending. Ask what would have made it a yes. The offer is the problem, not the volume.

## Build sequence

1. **Today (no new APIs):** pack template + Grokbot scoring rules + this scorecard. Ryan can hand-fill 3 HOT names from the Monday openings digest and run the block.
2. **Next (needs preflight, then code):** morning pack builder. Apify for yesterday's engagers + a watchlist. Merge with CA openings CSV. Write the markdown file. Grokbot reads that file. Failure modes: `docs/failure-modes/linkedin-daily-pack.md`.
3. **After 2 weeks of logs:** decide whether the 75-minute block is real. If logging is still 10 minutes, the pack builder is also writing the conversation rows.
