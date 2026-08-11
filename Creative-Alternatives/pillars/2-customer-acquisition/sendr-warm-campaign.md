# Sendr Warm Campaign — "Opened Twice, No Reply"

> **STATUS: LIVE as of 2026-07-06** (campaign id 9676, built + activated via browser automation).
> As-built flow differs from the draft below in two ways, both evidence-based:
> 1. **Connection request sends WITHOUT a note** — the old DealThreads campaign ran noteless and hit
>    132/151 accepts (87%); blank invites also avoid Sendr's variable-mapping risk (a literal
>    {{First Name}} rendering would be worse than no note).
> 2. **Messages use zero merge variables** for the same reason — copy written to work nameless.
> As-built v2 (2026-07-06, PERSONALIZED PAGES AT SCALE — the Oloxa pattern rebuilt in Sendr):
> Profile View → Wait 1d → Send Connection (no note) → Check Connection →
> [Yes] **Generate Page** (template "CA Mockup Offer Page" id 7948; vars firstname←First name,
> company←Company name; page = "{{firstname}}, this one's about {{company}}'s merch." + 30s
> Anything-on-Everything commercial + "Get My Free Mockups" mailto CTA) →
> Message: "Hey, thanks for connecting! My family runs a promotional products business. We help
> companies with swag, client gifting, whatever it may be. I actually put a quick page together for
> you here: {{Generate Page A5: pageUrl}} And I can mock up a couple of items with your logo on
> them, no charge. Want me to send them over?" → Wait 4d → Nudge · [No] ends.
> Pages generate ONLY on accept (Ryan's rule: no designs for people who don't respond) — the page is
> the cheap templated artifact; the bespoke mockup lookbook still fires on actual reply.
> Voice rule per Ryan: never "I run outreach" — family-business framing, casual, no job titles.
> Template maintenance: edit at app.sendr.io/templates/7948 (video swap needs the input-click
> interception trick; see memory).
> Zombie campaigns (DealThreads, Agencies AR) switched to Draft same session.
> The "personalized page" = the reply-triggered Gamma lookbook (proven motion) — richer than a
> pre-generated Sendr page. Sendr's Generate Page action exists if we ever want pages pre-reply.

> 2026-07-06. The LinkedIn layer from the response playbook. Audience: 202 leads (85 law, 117 financial)
> who opened a CA email 2+ times but never replied or bounced. All have LinkedIn URLs (matched from our
> own source lists, 202/202). File: `outbound/sendr-warm-audience.csv`.
> Refresh weekly: rerun the warm-audience build, add only NEW rows.

## Why this audience

They read the email (twice+) and stalled. A human-feeling touch on a second channel is exactly the
"proactive vendor" gap the pain research says nobody claims. Sendr sends from Ryan's LinkedIn — which
also compounds the content flywheel (they see the build-in-public posts after connecting).

## Setup (one-time, ~5 min in the Sendr UI — API can't create campaigns)

1. **First: pause the two zombie campaigns** — "DealThreads" (ACTIVE, 283 contacts) and "Agencies AR
   Recovery" are still live from retired ventures. Pause both.
2. New sheet: upload `sendr-warm-audience.csv` → name it `swag-warm-jul-2026`.
3. New campaign: **"Swag Warm — LinkedIn"** on that sheet.
4. Steps (below) · daily cap **20-25 connects/day** (LinkedIn-safe; 202 leads ≈ 2 weeks) ·
   stop-on-reply ON.

## Campaign steps & copy

**Step 1 — Profile visit** (day 0; visits alone get profile-view-back curiosity)

**Step 2 — Connection request + note** (day 1, ~190 chars):
> Hi {{first_name}} — Ryan from Creative Alternatives (family promo shop, 27 yrs). We made a couple {{company}} mockups after reaching out by email. Happy to share them here too.

**Step 3 — Message after accept** (day 1 post-accept):
> Thanks for connecting, {{first_name}}! Quick context: we mocked up a few pieces with the {{company}} logo — client gifts, team gear, that kind of thing. Want me to send them here or to your email? No pitch, they're already made.

**Step 4 — Nudge** (day 4 post-accept, if no reply):
> One more nudge and then I'll leave you be — the {{company}} mockups came out sharp. One word and they're yours.

## Rules

- Reply anywhere (LinkedIn OR email) = remove from both cadences, run the mockup motion inside the hour.
- No links in the connection note (spam filter + trust).
- Accepts who never reply still won: they now see Ryan's content. Do not re-pitch past step 4.
- Weekly refresh: new opened-2x names appended; anyone who replied comes off.
- Track in the Sunday review: connects sent, accept %, replies, meetings.

## The dialer completes the trio

Same audience, one week later: anyone who ACCEPTED the connect but didn't reply gets a call in the
10:30 block. Script: "Hi {{first_name}}, Ryan from Creative Alternatives — we connected on LinkedIn.
I made a couple mockups with the {{company}} logo and didn't want them to die in a folder. Got 30
seconds?" Warmest cold call in the world: they've seen the name twice by then.
