# Failure modes: LinkedIn daily pack

## What it does
Builds one markdown file each morning (`Personal Brand/daily-prep/YYYY-MM-DD.md`) that merges CA buy-now names, yesterday's post engagers, and a short list of event-language posts so Grokbot can draft comments and DMs without Ryan hunting the feed.

## How it breaks
1. **No-cookie LinkedIn actors miss keyword search.** HarvestAPI and similar scrapers are reliable for a known profile or post URL. They are weak or empty on "search posts for company retreat." A pack that only uses keyword search will look successful and contain junk, or it will be empty and look like a scrape outage.
2. **Engager pull is the expensive, useful call.** `fetch_post_engagers` is about $0.005 per person. A 200-engager post is about $1. Running it on every post every day will blow a $5 credit before week two. Silent failure: the actor returns 20 of 80 engagers and we treat it as complete.
3. **CA list join is the real join, and it is messy.** Openings digest, SmartLead, and reactivation files do not share a LinkedIn URL field. A "successful" pack that cannot match names will dump email-only leads into a LinkedIn block. Those names are for email, not a connection request.
4. **Markup and actor IDs change.** LinkedIn breaks scrapers often. The job will keep writing a file with yesterday's names or an empty HOT section.
5. **The pack is empty and nobody says so.** Ryan starts the block on a blank file and wastes the hour hunting anyway.

## Limits and cost
- LinkedIn connection volume is unchanged (human send, cap 15/day). The pack does not send.
- Apify: budget **$8/month**. One engager pull on Ryan's latest post (cap 40 people) plus Maclaine's latest (cap 40) is about $0.40/day worst case, ~$12/month if uncapped. Cap at 40 each and skip days with under 5 new engagers. Keyword search, if used at all, is a fallback, not the primary source.
- CA list merge is local and free. Time cost is matching; if no LinkedIn URL, the name stays on the email list.

## How we'll detect breakage
- Pack file missing, or HOT section has 0 rows: Grokbot says "PACK THIN" and asks Ryan for 3 HOT names. It does not invent targets.
- Engager count equals the cap (exactly 40) three days in a row: likely truncation, log it.
- Apify spend over $0.50 in a day: job stops further actor calls that day.
- Silent failure: HOT names have no LinkedIn URL. Count those separately; they do not count as a filled pack.

## Mitigations built in
- Primary source is CA lists + post URLs we already own (Ryan, Maclaine). Keyword search is optional and labeled `unverified`.
- Hard cap 40 engagers per post, 2 posts max per day.
- Empty or thin pack: Grokbot asks Ryan for 3 HOT names instead of inventing targets.
- No LinkedIn login cookies stored. No send step in the job.
- First two weeks: Ryan or Grokbot can fill the pack by hand from the Monday openings list. The file format is the product; the scraper is a later multiplier.
