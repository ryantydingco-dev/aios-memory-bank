# Creative Alternatives — CrossFit Boxes Email Sequence V1

> **Status:** Ready to build lists
> **Created:** 2026-05-05
> **Senders:** Split test — Maclaine (Variant A) / Ryan (Variant B)
> **Target:** Independent CrossFit affiliate boxes, US, owner-operated
> **Offer:** Free custom branded online store — full fulfillment, box earns on every order
> **Mirror:** Summer Camps campaign (10.1% reply, 2 clients landed) — 3-email structure preserved exactly

---

## Architecture: Fixed Template + Per-Lead Personalization Line

The fixed 3-email template lives in **SmartLead** (one for Maclaine, one for Ryan). The AI writes **one deep-personalization line per lead** — that line gets pushed as a custom variable.

| Component | Where it lives | Generated how |
|-----------|----------------|---------------|
| 3-email body template | SmartLead sequence | Manually configured once, never regenerated |
| `{{personalization}}` variable | Per-lead, per CSV row | AI reads box website + signals, outputs 1 sentence |
| `{{first_name}}`, `{{company_name}}` | Per-lead, standard SmartLead vars | From Apollo lead data |

**Why this beats per-lead full-email generation:**
- 5-10x cheaper per lead (one short prompt, one short output)
- Faster to push to SmartLead (less to validate)
- Template is human-tested and locked — no AI drift
- Easier to A/B test sender voice — same template, different sign-off

---

## Sequence Overview

| Email | Purpose | Delay | Personalization |
|-------|---------|-------|-----------------|
| 1 | The Opener | Day 0 | YES — `{{personalization}}` line |
| 2 | The Reframe | Day 4 | NO — fully generic |
| 3 | The Light Breakup | Day 9 | NO — fully generic |

Personalization sits in Email 1 only. Follow-ups stay generic. This mirrors what worked in Summer Camps — short, casual, low-friction.

---

## SMARTLEAD TEMPLATE — VARIANT A (Maclaine)

### Email 1

**Subject:** `free store for {{company_name}}`

```
Hi {{first_name}},

{{personalization}}

Do you guys currently sell any branded gear for your members?

We build free custom online stores for CrossFit gyms — we handle all the fulfillment, and your box earns a cut on every order with nothing to manage.

Just curious if it's something on your radar.

Maclaine
```

### Email 2

**Subject:** `free store for {{company_name}}`

```
Hi {{first_name}},

We set up free branded online stores for CrossFit gyms — fulfillment, shipping, everything handled on our end. Your box just earns a percentage on every order.

Are you guys doing anything with merch right now?

Maclaine
```

### Email 3

**Subject:** `{{company_name}} merch`

```
Hi {{first_name}},

Quick one — does {{company_name}} sell any gear to members?

We handle the whole thing for free for boxes like yours. Just wanted to see if it's even something you think about.

Maclaine
```

---

## SMARTLEAD TEMPLATE — VARIANT B (Ryan)

### Email 1

**Subject:** `free store for {{company_name}}`

```
Hi {{first_name}},

{{personalization}}

Does {{company_name}} currently sell any branded merch to members?

We set up free custom online stores for CrossFit gyms — design, fulfillment, and shipping all handled on our end. The box earns on every order with zero inventory or upfront cost.

Wanted to see if this is something that's been on your radar.

Ryan
```

### Email 2

**Subject:** `free store for {{company_name}}`

```
Hi {{first_name}},

We build free branded online stores for CrossFit gyms — fulfillment, shipping, the whole thing on our end. Your box earns a percentage on every order.

Are you running any merch right now?

Ryan
```

### Email 3

**Subject:** `{{company_name}} merch`

```
Hi {{first_name}},

Quick one — does {{company_name}} sell any gear to members?

We handle it end-to-end for free for boxes like yours. Just wanted to see if it's even on the radar.

Ryan
```

---

## Personalization Line Spec

The AI generates ONE sentence per lead. Output goes into the `personalization` column of the SmartLead CSV.

### Rules

1. **One line, one sentence.** No two-sentence personalizations. No paragraph.
2. **Specific.** Must reference something visible on the box's website, social, or Google data — programs, location, anniversary, community vibe, fundraiser WOD, member spotlight, recent event, signature class.
3. **Conversational.** Sound like Maclaine or Ryan glanced at the site, not like an AI mined data.
4. **Naturally bridges into "do you sell merch?"** — feels casual, not forced.
5. **No CrossFit insider vocab** (no `RX'd`, `AMRAP`, `box jumps for time`). Plain English.
6. **No compliments that sound generic** ("loved the website", "looks like a great community"). Be specific or skip.

### Examples (good)

> Saw {{company_name}} just hit 10 years — congrats, that's no small thing in this space.

> Noticed you guys run a Murph fundraiser every year for the local fire department — really cool tradition.

> Saw the post about the new strength program kicking off — looks like you've built a tight community over there.

> Noticed {{company_name}} has been in Mount Pleasant since 2014 — local OG status.

> Caught the member spotlight series on your site — clear you've got a real community, not just a gym.

### Examples (bad — reject these)

> Your website looks great! _(generic, no specifics)_

> CrossFit is awesome and {{company_name}} seems like a great box. _(filler)_

> I love what you're doing with WODs and AMRAPs and high-intensity training. _(insider jargon, sounds like a bot)_

> Your box is impressive. I'd love to chat about merch. _(no specifics, pre-pitches)_

### Fallback

If the website returns nothing useful, output:

> Saw {{company_name}} on a list of solid affiliate boxes in {{city}}.

(Replace `{{city}}` with the city from Apollo data. This is a clean catch-all that still feels human.)

---

## Split Test Setup in SmartLead

50% of leads → Variant A (Maclaine inbox pool)
50% of leads → Variant B (Ryan inbox pool)

Both variants use identical subject lines to isolate sender voice as the variable. Both use the same `{{personalization}}` line — the AI doesn't write two versions, the line works for both senders.

**Inbox routing:**
- Variant A: Use Maclaine Scher inboxes only
- Variant B: Use Ryan Tydingco inboxes only

Track reply rate per variant. After ~500 sends per variant, lock in the winner. Continue split-testing if rates are within 1% of each other.

---

## Replacement Variables

| Token | Source | Example |
|-------|--------|---------|
| `{{first_name}}` | Apollo lead data | "Mike" |
| `{{company_name}}` | Apollo lead data | "Lowcountry CrossFit" |
| `{{city}}` | Apollo lead data | "Charleston" |
| `{{personalization}}` | AI-generated per lead | "Saw you guys just hit 10 years — congrats." |

---

## SmartLead Setup

- **Sending volume:** Mirror Summer Camps cadence (~30-40/inbox/day, ramped)
- **Day delays:** 0 / 4 / 9 (same as Summer Camps)
- **Tracking:** Open + click tracking ON (no links in V1 — keep zero links)
- **Custom variable:** Add `personalization` as a custom field in SmartLead before importing the CSV

---

## Success Criteria (Go/No-Go for Phase 2)

| Metric | Target | If Hit | If Miss |
|--------|--------|--------|---------|
| Reply rate (combined) | 5%+ | Expand to BJJ + Climbing immediately | Diagnose — list quality, copy fit, or personalization quality |
| Reply rate (winning variant) | 6%+ | Lock that sender for Phase 2 | Test third variant or rework |
| Closed clients | 1+ in 30 days | Strong validation, scale to 3,000+ leads | Fold the campaign |

Summer Camps benchmarks for reference:
- 1,890 sent → 67 replies (10.1%) → 2 clients landed
- That's ~28 sends per reply, ~945 sends per client

---

## Tone Notes

- **Word-for-word mirror of Summer Camps in body copy.** Only the niche-specific anchors changed.
- **Subject line repetition (E1 + E2 same).** Intentional. Do not "improve" by varying.
- **Personalization line is the only AI-generated piece.** Everything else is locked.
- **No landing page, no Calendly, no price.** Anything more polished kills the rate.
