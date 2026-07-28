# Sendr Full-Leverage Plan — 30 Days (2026-07-17)

What Sendr (sendr.ai, ~$140/mo) actually includes: personalized video AT SCALE from one recording (dynamic/lipsync, ~250 videos/mo on this tier), LinkedIn sequencing, email + WhatsApp channels, unified inbox, dynamic landing pages with visit/view tracking, signal-triggered automation, lead finder + enrichment credits, Chrome extension, GIF generation. Currently used for: manual LinkedIn connection requests only.

## The three plays (in build order)

### Play 1 — LinkedIn campaigns for staffing/recruiting (this week)
Two campaigns in Sendr's LinkedIn sequencer:

**A. "Warm Wrap" (email-engaged leads):** the router already pushes positive repliers into a Sendr sheet. Sequence: profile visit → connection request (no pitch: "Ryan here, the one emailing you about the hiring manager list") → after accept: short DM referencing the email thread → personalized video DM. Cap irrelevant (small volume, highest value).

**B. "Cold Staffing Owners":** feed from the machine's Tier A vertical-known rows that carry linkedin_url (engine can push weekly batches to the sheet via API). Sequence: visit → connect (blank or 1-line, no pitch in the invite) → after accept, DM 1: the sample-list magnet ("want me to mock up a list of hiring managers hiring in your niche?") → DM 2 (3 days): personalized video → DM 3 (4 days): breakup. Volume: 20-25 invites/day, Mon-Fri (~100-125/week, inside LinkedIn safe limits). Expected: 25-35% accept on owners, DM reply rates typically 2-3x cold email.

### Play 2 — ONE master video, personalized at scale (weekend recording, 30 min)
Record a single 60-second master: "Hey {first name}, I put together something for you: a list of hiring managers actively hiring in your niche right now..." — Sendr generates per-contact versions. Deploy as: the video step in both LinkedIn campaigns, the video link in email follow-ups (video loop's watch-file), and on dynamic landing pages. This converts the 2-minutes-per-replier manual recording into 250 personalized videos/month for the same 30 minutes. Manual bespoke recordings stay reserved for the 3 hot deals (Luke/Angel/Dane tier).

### Play 3 — Dynamic landing pages as the destination (week 2)
Per-prospect page: their name, their niche, the personalized video, a preview of their sample list, the booking calendar. Every campaign link points here. Page-visit + video-view tracking inside Sendr's app = intent signal; check the unified inbox/notifications daily during the reply block, promote viewers to the dial queue (one line in sendr_views.json fires the existing automation).

## What Ryan does in Sendr, concretely
1. Confirm the LinkedIn seat is connected and healthy (Settings → LinkedIn account).
2. Build campaigns A and B above (sequencer), using the copy in this doc; sheets get filled by the engine.
3. Record the master video (Play 2); generate the personalized set for the cold campaign.
4. Build one landing page template (Play 3).
5. Daily: check unified inbox during reply block; note views into data/sendr_views.json.
6. Email Sendr support: ask to enable API read scopes for sheet rows + engagement/webhooks on this plan (unlocks full automation of the video loop; costs nothing to ask).

## Keep-or-cancel scorecard (decide day 30)
Track weekly in the Sunday brief: invites sent / accepts / DM replies / video views / meetings sourced from LinkedIn-or-video. KEEP if the channel contributes ≥2 meetings or ≥1 trial in 30 days (one trial = 14x the monthly cost). CANCEL if under that with campaigns actually run — but don't cancel on a month where the campaigns never launched; that's measuring the tool on our idle time.

## Integration notes (already built)
- Router → Sendr sheet push: LIVE for positive repliers.
- Video loop → in-thread email follow-up + bump: LIVE (watch-file `queues/video_links.csv`).
- Weekly cold-batch push to Sendr sheet: engine addition, trivial (add_leads works via API).
- Views → dial queue + Telegram: LIVE via `data/sendr_views.json` (manual note until Sendr grants API scopes).
