# The Series Map — everything I've built, as episodes

Working series title: **"I built an AI sales team"** — one guy, two businesses, an AI operating system that runs the go-to-market for both. Every episode shows a real system on screen with real numbers, including the failures. Record the tour first (Episode 1), then one system per week. See what sticks; double down there.

---

## BUSINESS 1 — DEALTHREADS (my agency: outbound systems for staffing firms)

### The acquisition machine
- **Email engine:** ~100 warmed inboxes, 600 sends/day capacity, two campaigns targeting staffing-firm owners. This week: 4,278 sent, 26 replies (0.6%), 8 positive. Plain text, stop-on-reply, no tracking pixels.
- **LinkedIn engine:** Sendr campaign, 22 steps, ~20 invites/day, 500-contact sheet, auto-fed weekly from list reserves.
- **Phone engine:** Salesfinity dialer loaded with 3,886 contacts: 69 "hiring BD right now" hot rows + 3,817 owner-office-line bench, every card carrying an AI-written call note.
- **Signal layer (Origami):** AI research agent that finds staffing firms hiring internal BD/sales reps THIS WEEK (119 qualified so far), qualifies them with company-type + US-HQ checks, enriches owner contact info, and refills the dialer automatically every morning.

### The intelligence loops (the part nobody else has)
- **Router:** classifies every reply (positive / out-of-office / negative / referral), auto-resumes sequences after OOO, harvests referrals into their own campaign.
- **Copy loop:** weekly A/B experiment proposals from real reply data; nothing changes without my approval via Telegram.
- **Targeting loop:** learns which verticals/tiers reply and re-weights next week's list loads.
- **Deliverability loop:** watches bounce rates and inbox reputation daily, advisory only.
- **Call loop:** reads dial outcomes out of the dialer nightly, suppresses wrong numbers forever, pings my phone on positive dispositions.
- **Channel loop:** replies-per-100-touches per channel, weekly, with one reallocation suggestion.
- **Quality control:** caught 63 non-staffing companies (roofing! plumbing!) that leaked into my lists, paused them mid-sequence, and flagged the source rows so they can never come back.

### The deal layer
- **Deal registry + external inbox monitor:** when a deal moves to my personal email, the engine watches that thread over IMAP and pings me the moment the prospect replies.
- **Close kit:** two ready-to-send SOWs, payment links, a 10-question kickoff form, and a day-by-day trial delivery runbook. A verbal yes becomes paperwork in five minutes.
- **Briefs:** Telegram, 7:10am and evening + Sunday weekly: everything above compressed into one phone screen.

### The lessons bank (episode gold)
- The $199-per-lead experiment: scraped LinkedIn engagers like the gurus say, 265 credits, 2 qualified leads. The math and why job-posting signals beat engagement signals in my niche.
- The roofing-company incident: how AI-labeled data lied ("South Shore Roofing → IT and tech") and what a real scrub looks like.
- Caps default to 1000/day: the setting that would have torched 100 inboxes in 48 hours.
- The phantom API: a vendor API that says "success: true" and writes to nowhere. Verify with reads, never trust writes.

## BUSINESS 2 — CREATIVE ALTERNATIVES (transforming a 25-year, $3.2M promo-products business with AI)

- **The story:** my girlfriend's dad Kenny has run it for 25 years. I'm installing the same machine for a completely different business, commission-only, documenting everything.
- **Reactivation engine:** mined the 2,700-customer QuickBooks base: 981 win-back targets, 338 active accounts for referrals, 502 phone-only. Warm converts ~10x cold in their own data.
- **Signal engines:** trade-show exhibitor scout (bulk swag buyers on a deadline, 85 exhibitors verified in one show), new-business openings tracker (restaurants, gyms, breweries via free news feeds — "sell to moments, not industries"), buying-signals ranker (hiring, mergers, awards), event-planner channel (one planner = 5-20 events/year of orders).
- **Production art AI:** replaces the $75-100/job outside artist: vector art, mockups, proof sheets. The mockup IS the cold-email hook: "here's your logo on the product before you asked."
- **Content factory:** daily LinkedIn draft + weekly plan for CA's account, anti-fabrication rules, Kenny-approved voice.
- **Cold outbound:** own campaigns live since July 1, first buyer reply day one.

## THE META-SYSTEM (what makes it one machine, not twenty scripts)
- Everything reports to Telegram; my daily job is answer replies, make dials, approve experiments.
- Every prospect-facing change requires my explicit approval. AI proposes, human disposes.
- Hard rules encoded: never guarantee meetings, never fabricate numbers, client tools on client cards.
- Two-machine git sync, launchd schedulers, one state file per business.

---

## THE EPISODES

1. **The tour (record TODAY):** "I built an AI sales team that runs 2 businesses. Full walkthrough." Scroll this doc + live dashboards. 12-15 min.
2. The email engine: 4,278 sends this week — the honest math of 0.6% and why that's the industry truth nobody posts.
3. The signal layer: my AI finds companies hiring salespeople and calls them first. Live build of a list.
4. The $199-per-lead mistake: I tested the guru LinkedIn play with real money.
5. The roofing company in my staffing list: AI data lies, here's my scrub system.
6. The dialer: 3,886 numbers, zero list-building, watch a call block with AI call notes.
7. The loops: my campaigns improve themselves weekly (copy A/B, targeting weights) — with my approval gate.
8. The close kit: yes-to-paid in one hour, show the whole flow.
9. CA episode: reactivating a 25-year customer base — 981 win-backs from QuickBooks exports.
10. CA episode: the mockup machine — replacing a $100/job artist and turning art into the cold-email hook.
11. The daily brief: my entire company on one phone screen, 7:10 every morning.
12. What it all costs: the full tool stack, monthly bill, and what I'd cut.

## REPURPOSE RAILS
- Each episode → 2 vertical clips (faceplant + lesson) → Shorts, TikTok, Reels, LinkedIn.
- Transcript → 1 LinkedIn text post (my words, trimmed) + 1 warm-list email.
- Episode 1's map section-by-section = a week of carousel/screenshot posts.
- CTA everywhere: free sample list, dealthreads.io.
