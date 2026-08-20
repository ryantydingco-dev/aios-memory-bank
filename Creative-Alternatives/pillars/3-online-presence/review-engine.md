# Google Review Engine — Wave Plan

**Created:** 2026-08-19 · Part of `plans/2026-08-19-online-presence-engine.md` (Phase 1)
**Goal:** Convert 27 years of customer goodwill into a steady stream of Google reviews without tripping Google's filters or the FTC's incentivized-review rule.
**Owners:** Ryan (segments, Mailchimp, tracking) · Kenny (voice, top-account picks) · Maclaine (send approval)

---

## Hard rules

1. **No incentives tied to reviews.** No gift, discount, or sweater in exchange for a review — violates Google review policy and the FTC rule on incentivized reviews. Google filters the reviews and can suspend a new profile.
2. **The sweater gift is a separate program.** Top 20–30 accounts get a no-strings Champion crewneck with their logo as a thank-you. Never mention reviews in the same message. (See "Top-account gift" below.)
3. **Waves, not a blast.** A burst of reviews on a brand-new profile looks fake to Google. Steady trickle wins.
4. **Never ask for a "5-star review."** Ask for honest words about working with CA.
5. **Kenny's voice, not marketing voice.** These are relationships, not a list.

## Preconditions (blockers — do not send before all three)

- [ ] Google Business Profile verified and the short review link works (`g.page/...` style link from GBP dashboard)
- [ ] Mailchimp sending domain checked: SPF/DKIM valid on whatever domain it sends from — the AOL → Workspace migration is mid-flight, confirm before a mass send
- [ ] Kenny approves the Wave 1 email copy

## The waves

| Wave | Who | Size | When | Purpose |
|---|---|---|---|---|
| 1 | Best customers: most recent + most frequent + known-happy (Kenny sanity-checks the pull) | 200–300 | Week after GBP verifies | Test wave — learn response rate and copy quality |
| 2 | Remaining active customers (ordered in last ~3 years) | ~800–1,000 | 1–2 weeks after Wave 1 | Volume, with copy fixed from Wave 1 learnings |
| 3 | Long tail / dormant | remainder | Ongoing, small batches | Doubles as a reactivation touch |
| Always-on | Every delivered order | per-order | Permanent | Review ask ~1 week after delivery becomes part of the order flow — the real engine; waves are catch-up |

**Segment pull:** customer + revenue data lives in `data/data.db` (QuickBooks collectors). See `reference/data-access.md` for schemas. Wave 1 pull ≈ sales-by-customer ranked by recency and frequency, joined to contacts for email addresses; export to CSV → Mailchimp tags (`review-wave-1`, etc.). Kenny reviews the Wave 1 list by eye before send — he knows who's happy.

**Measure per wave:** sends, opens, review-link clicks (Mailchimp), new reviews that week (GBP dashboard). If Wave 1 converts under ~2% to reviews, fix the copy before Wave 2.

## Wave 1 email draft (Kenny's voice — needs his edit + approval)

> **Subject:** A small favor after all these years
>
> Hi [First name],
>
> Kenny here from Creative Alternatives. After 27 years of doing business mostly on word of mouth, we finally set up our Google page.
>
> If we've done good work for you over the years, it would mean a lot if you took a minute to share a few honest words about your experience:
>
> [Review link]
>
> That's it — no catch. Thanks for trusting us with your orders all these years. If there's anything you need, you know where to find me.
>
> — Kenny

Keep it this plain. No images, no promo footer, no offer. One link.

## Top-account gift (separate program — never in the same message)

- Kenny picks 20–30 best relationships.
- Each gets a Champion crewneck with **their** logo, shipped with a handwritten-style note: pure thank-you, no ask.
- Production: one-off decoration per logo — use the ca-production-art pipeline for art; batch the blanks order.
- Side effects we expect but never request: reviews, referrals, reorders, and a live demo of "your merch could look like this" for the store offer.
- Track recipients in a simple list here or HubSpot; note any review/reorder that follows within 60 days.

## Targets (execution targets, not promises)

- 10 reviews within 30 days of Wave 1
- 25+ reviews by end of Wave 2
- Review ask embedded in the standard order flow by week 6
