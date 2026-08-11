# Cold Outreach Copy — Creative Alternatives

> Ready-to-send copy for the home-run offer across all three channels. Primary voice = **Maclaine** (warm, family-business — the proven winner). Ryan's consultative variant noted where it differs. Run any final draft through the `linkedin-humanizer` / humanizer skill before it ships — AI-sounding cold email tanks deliverability and replies.

**Golden rules:** the mockup is the hero. Email 1 carries 58% of replies — make it unskippable. Short (50–90 words). One idea, one ask. Interest-based CTAs ("want the rest?"), never "book a 30-minute demo." Any reply pulls them out of automation.

---

## Personalization tokens

Set these per lead in Origami so every channel pulls the same values:

| Token | Example | Source |
|-------|---------|--------|
| `{{first_name}}` | Mike | enrichment |
| `{{org_name}}` | CrossFit Wodtown | enrichment |
| `{{segment_noun}}` | box / camp / club / studio / academy | by segment |
| `{{segment_noun_plural}}` | boxes / camps / clubs / studios / academies | by segment (NEVER write `{{segment_noun_plural}}` — renders "boxs"/"academys") |
| `{{member_noun}}` | members / campers / players / athletes / families | by segment |
| `{{mockup_url}}` | hosted image of their store mockup | mockup line |
| `{{brand_color}}` | their primary color (referenced casually) | logo pull |
| `{{city}}` | Austin | enrichment |
| `{{calendar_link}}` | Maclaine's/Ryan's booking link | fixed |

---

# CHANNEL 1 — EMAIL (SmartLead)

4 emails over 14 days. Stop at 4. Plain text, zero links and zero images in cold sends: E1 teases the mockup, the reply delivers it. The mockup must actually be rendered before E1 sends (QA gate below) so every "I made you a mockup" line is true. No HTML templates, no banners. Looks like a person, lands in inbox. Follow-ups use SmartLead's same-thread setting (blank subject inherits whichever E1 subject the lead received) — never hardcode a "re:" line against rotating subjects.

### Email 1 — The Mockup (Day 0) — the hero

**Subject options (rotate, test):**
- `made something for {{org_name}}`
- `quick {{org_name}} mock`
- `idea for {{org_name}}`

**Body (v2, 2026-07-19 — verified rewrite):**

```
Hi {{first_name}},

My dad's been making custom branded gear for {{segment_noun_plural}} for 27
years. I put together a quick mockup of what a {{org_name}} store could
look like, your logo on a hoodie, tee, and tumbler.

We build and run the whole store, you earn a cut of every order, and you
never touch inventory or shipping.

Want me to send it over?

Maclaine
Creative Alternatives
```

> **v2 changes (verify-copy audit):** killed the "I run outreach" opener (self-outs as a cold blast, breaks Maclaine voice); family line now leads. Removed the inline mockup link — E1 is now a pure tease, so "want me to send it over?" gives a zero-cost reason to reply and the sequence stops contradicting itself (E2–E4 already talk about *sending* the mockup). Zero links also helps deliverability. Em dashes removed per writing-style rule. "clubs and camps" tokenized to {{segment_noun}}.
>
> *v1 (original, for reference): opened "I run outreach for Creative Alternatives" and embedded {{mockup_url}} inline with CTA "Want me to send the full mockup?"*

*Ryan variant — same mockup, consultative open:* `"I help run growth at Creative Alternatives. We build done-for-you branded stores for {{segment_noun_plural}}. Made you a mockup to show what I mean..."`

---

### Email 2 — You earn, you do nothing (Day 4)

**Subject:** *(none — SmartLead same-thread reply; inherits the E1 subject the lead got)*

```
{{first_name}}, still holding that {{org_name}} mockup if you want it.

We make our money on production, so there's no fee to you. You earn
10–12% of every order, and we handle design, printing, shipping, and
returns.

We've shipped 75,000+ orders for {{segment_noun_plural}} like yours.

Worth seeing the full store?

Maclaine
```

---

### Email 3 — Proof (Day 9)

**Subject:** *(none — same-thread reply to E1)*

```
Quick example, {{first_name}}:

We set up a store for a youth club in Tennessee. Their families finally
had good gear to buy, the club earned on every order, and they did zero
work. We even handed them a launch post so it actually sold week one.

Same playbook would work for {{org_name}}. Your {{member_noun}} already
want to rep the brand. This just makes it buyable.

Want me to send the full store preview?

Maclaine
```

> **VERIFY before scale (2026-07-19 audit):** confirm with Kenny that the Tennessee youth club story (and "sold week one") is a real account. If it can't be confirmed, swap the first paragraph for approved facts: "We've done this for 2,700+ organizations over 27 years, 75,000+ orders shipped." Calendar link removed from this step per the golden rules; the link goes out after they reply.

---

### Email 4 — Breakup (Day 14)

**Subject:** *(none — same-thread reply to E1)*

```
{{first_name}}, haven't heard back, so I'll assume the timing's off and
stop bugging you.

If it's ever worth a look, the mockup's still here and the offer's the
same: we build the store, you earn the rev share, we do the work.

Just reply "mockup" and I'll send it over.

Maclaine
```

> Breakup emails are reliably the #2 reply driver after E1. Keep it light, no guilt.

---

# CHANNEL 2 — LINKEDIN (Sendr.io)

Maclaine's + Ryan's accounts. Stay ≤20–25 connection requests/day/account. The **video/voice DM is the weapon** — use it.

### Touch 1 — Connection request (Day 0)

No pitch. Just relevance (Sendr connection note, ≤300 chars):

```
Hi {{first_name}}, we make branded gear for {{segment_noun_plural}} and I
put a quick {{org_name}} store mockup together. Figured I'd connect
before sending it over.
```

### Touch 2 — Video/voice DM (Day 2, once connected)

**This is the home-run move.** Record a 20–30 sec screen-share of *their* mockup. Sendr plays it in-conversation.

**Video script (talk over their mockup on screen):**
```
"Hey {{first_name}}, Maclaine here, quick one. I made a mockup of what a
store for {{org_name}} could look like [show hoodie, tee, tumbler in their
colors]. We'd build and run the whole thing, you'd earn a cut of every
order, zero inventory on your end. Reply here and I'll send you the full
mockup to look at."
```

### Touch 3 — DM follow-up (Day 11)

```
{{first_name}}, did my note about the mockup come through? Say the word
and I'll send the full store preview.
```

---

# CHANNEL 3 — PHONE (Salesfinity)

Power-dial sessions, 2–3×/week. Let Salesfinity swap to verified mobiles first — owners answer cells. The call references the email/DM, which is why it converts.

### Call 1 — The mockup call (Day 6)

**Opener (pattern interrupt, permission):**
```
"Hey {{first_name}}, it's Maclaine with Creative Alternatives. I emailed you a
few days back about a store mockup I put together for {{org_name}}.
Did you catch that one, or did it get buried?"
```

**If "what's this about":**
```
"Totally fair. Real quick: we build done-for-you branded stores for
{{segment_noun_plural}}. Your {{member_noun}} get gear they actually want to
wear, you earn a cut of every order, and you do none of the work.
We design, print, and ship all of it. I made you a mockup to show
what it'd look like. Can I re-send it?"
```

**The ask (interest, not calendar pressure):**
```
"Want me to send the full store preview over, and if it looks good we
grab 10 minutes? No pressure either way."
```

### Objection quick-hits (full set in `home-run-offer.md`)

- *"We already do merch."* → "Nice, so you know there's demand. Yours is probably unmanaged. We run it properly and you earn more for less work."
- *"What's it cost?"* → "Nothing to you. We make our margin on production; the rev share is yours."
- *"No time."* → "That's the point. You point your people at it once, we do the rest."
- *"Send me info."* → "Done. What's the best email? I'll send the mockup today." (then route to E-sequence + HubSpot)

### Call 2 — Voicemail (Day 16, final)

```
"Hey {{first_name}}, Maclaine with Creative Alternatives. Left you a
store mockup for {{org_name}}. I'll stop chasing, but if you ever want to
see it, reply to my email with 'mockup' and it's yours. Thanks!"
```

---

# PARALLEL MOTION — REACTIVATION (warm)

For dormant QuickBooks customers. Warm — lead with the relationship. Phone-first (Salesfinity), email backup. No warmup needed.

### Reactivation call opener
```
"Hi {{first_name}}, it's Maclaine from Creative Alternatives. We did
[your gear / your order] a while back. Reaching out because we've started
building branded stores for our customers: we set up a store with your
logo, your people order directly, you earn a cut, and we handle everything
like always. Thought of you. Can I put together a quick mockup?"
```

### Reactivation email

**Subject:** `it's been a minute, {{first_name}}`

```
Hi {{first_name}},

Maclaine at Creative Alternatives here. We worked together on {{org_name}}'s
gear a while back.

We've started doing something new for past customers: a branded store
with your logo that your people order from directly. You earn on every
order, we handle design + printing + shipping like always. No inventory
or hassle on your end.

Want me to mock one up for {{org_name}}? Takes me a day.

Maclaine
```

---

# SUBJECT LINE BANK (test relentlessly)

Lowercase, short, curiosity > clever. Avoid spam triggers (free, $$$, !!!, ALL CAPS).

- `made something for {{org_name}}`
- `quick {{org_name}} mock`
- `idea for {{org_name}}`
- `{{member_noun}} would wear this`
- `quick mockup, {{first_name}}`

E2–E4 carry **no subject** — SmartLead same-thread replies. ("should I
close your file?" and "quick question" are retired: the two most burned
template subjects in cold email.)

---

# QA CHECKLIST BEFORE ANY CAMPAIGN GOES LIVE

- [ ] Mockup made + hosted for **every** lead (no mockup = don't send)
- [ ] Tokens populated, no `{{broken}}` merge fields (spot-check 10 rows)
- [ ] Sending from secondary domains, never creativealternatives.com
- [ ] Mailboxes warmed 3+ weeks; daily cap ≤40/mailbox
- [ ] Reply detection → auto-pause automation → HubSpot "Engaged" → human notified
- [ ] Run final copy through humanizer skill
- [ ] One variable being tested this batch (subject / first line / product mix), logged
