# Reactivation + Referral — warm sequences (Maclaine's real inbox)

> **These are NOT cold.** They go from Maclaine's actual inbox to people CA already has a business
> relationship with. Different rules than the cold campaigns: personal from-name, real signature, small
> daily batches (~40/day), honor any "stop" instantly. No lookalike domains, no spintax, no cold pool.
> The warmth *is* the wedge. Segments + lists: `outputs/reactivation/<date>/` (built by `scripts/ca_reactivation.py`).

## Hard rules (same as all CA copy)
- **No discount gimmicks.** Never "X% off", coupons, or fake urgency. The referral "reward" is *great service*
  and (optionally) a genuine thank-you piece of swag — never a price cut. CA sells premium done-for-you.
- **Never fabricate.** Real logos, real past work. `{{first_name}}` / `{{company}}` tokens only.
- **Mockup-led.** Email teases a fresh mockup; the mockup shows on the reply (same wedge as everything else).
- **Human-in-the-loop.** Maclaine (and Kenny on anything with pricing) approves before send.

## Tokens
`{{first_name}}` · `{{company}}` · `{{last_thing}}` (what they last ordered — blank until Phase-2 spreadsheet
history is merged; leave generic if unknown) · `{{signal}}` (event/season if known)

---

# SEQUENCE A — Reactivation (win-back)  →  `segment_reactivation.csv` (981)
Lapsed customers: on file, have email, no order in the last 2 years. Work biggest-known-spend first
(list is pre-sorted). Tone: warm, honest, a little personal — you're reconnecting, not selling.

### Email 1 — Day 0 · the re-open
**Subject:** it's been a minute, {{first_name}}
*(A/B:* `{{company}}'s gear, refreshed` *)*

Hi {{first_name}},

It's been a while since we made anything for {{company}}, and you came to mind — we've added a lot of new products and gotten a good bit faster since we last worked together.

I had one of our designers mock up a couple of fresh pieces with your logo, just to show you what's possible now. Want me to send them over?

Either way, good to reconnect.

Maclaine Scher
Creative Alternatives
creativealternatives.com

### Email 2 — Day 4 · what's new
**Subject:** Re: it's been a minute

Hi {{first_name}},

Following up — that mockup for {{company}} is ready whenever you'd like to see it.

Quick update since we last worked together: proofs come back in 24–48 hours, we warehouse and ship on demand so a reorder is one email, and you've got one person (me) instead of a vendor maze. Same team you knew, a lot more dialed in.

Anything coming up — an event, new hires, a season of gear? Happy to put something together.

Maclaine

### Email 3 — Day 9 · graceful close
**Subject:** should I close your file, {{first_name}}?

Hi {{first_name}},

I don't want to keep landing in your inbox if the timing isn't right — just say the word either way.

If anything's on the horizon for {{company}}, I'd love to earn your business back. And if not now, no worries — I'll keep the mockup on hand so it's ready when you need it.

Always good to reconnect.

Maclaine

> **On any reply:** send the mockup/proof page same-hour (the SOP that converts). Ask what's coming up →
> mock activity-matched pieces. Log the reactivation to `data/originated-ledger.csv`.

---

# SEQUENCE B — Referral + reorder  →  `segment_active.csv` (338)
Current, happy customers (ordered in the last 2 years). Two short motions — run the **referral ask** on the
2+ year repeat buyers (138, the most loyal) and the **reorder nudge** on all of them.

### B1 — Referral ask (repeat buyers)
**Subject:** a quick favor, {{first_name}}

Hi {{first_name}},

You've been one of my favorite people to work with — thank you for trusting us with {{company}}'s gear.

Quick ask: know anyone who could use branded stuff done right — another org, someone running a team or an event? If you point them my way, I'll take great care of them and mock something up for them the same way we do for you.

No pressure at all — just figured I'd ask the people who actually know what we do.

Maclaine

> If they refer someone, thank them for real — a genuine piece of CA swag or a handwritten note, **not** a
> discount. The referred lead gets the full mockup-first treatment on touch #1.

### B2 — Reorder / seasonal nudge (all active)
**Subject:** {{company}} — anything coming up?

Hi {{first_name}},

Checking in — is {{company}} coming up on anything that needs gear? New season, an event, new hires, client gifts?

We've got your logo and past artwork on file, so a reorder or a fresh piece is quick — I can have a mockup to you today if you tell me what you're thinking.

Maclaine

---

## Operating cadence
- **Send from Maclaine's inbox**, ~40/day, Tue–Thu best. Reactivation first (981 ≈ ~a month), then referral asks, then reorder nudges on a rolling seasonal basis.
- **Reply handling → Telegram** (existing brief). Every positive reply → same-hour mockup → log to the ledger.
- **Phase 2 sharpener:** once the 1999–2024 spreadsheets are digitized and merged into `customers_master.csv`,
  `{{last_thing}}` and real lapse dates fill in — then Email 1 becomes *"you ordered ~200 camp tees every
  spring '08–'19 — here's this year's mockup,"* and the deeply-lapsed big spenders QB can't see surface to the top.
