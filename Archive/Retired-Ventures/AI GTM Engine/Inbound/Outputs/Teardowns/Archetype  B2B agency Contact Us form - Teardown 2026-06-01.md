# Dead Form Teardown — Archetype: B2B Agency "Contact Us" Form

**Mode:** PROOF / ARCHETYPE (no live form fetched)
**Target:** `agency-contact` archetype — a typical B2B services agency "Contact Us" / "Start a project" page
**Date:** 2026-06-01
**Prepared by:** Ryan (Deal Threads)

> **Read this first.** This is a *proof teardown of an archetype*, not an audit of a real company. No `formUrl` was provided and nothing was fetched, so every field below is a **documented typical pattern** for the agency-contact archetype, labelled **unverified — typical pattern**. I am not claiming any specific agency's form contains these fields. If you send me a real `/contact` URL, I will WebFetch the live page and verify the actual visible fields, the exact CTA label, and the required-field markers before reporting. Anything I could only infer is marked **(inferred)**. Where something is genuinely unknowable here, it stays **unknown**.

---

## 1. What the form captures now

*Typical field set for the agency-contact archetype — **unverified — typical pattern**. A real form would be confirmed by fetching the page.*

| Field | Type | Typically required? |
| --- | --- | --- |
| Full name (or First + Last) | text | Required |
| Work email | email | Required |
| Company / Organization name | text | Required |
| Phone number | tel | Often required |
| Company website / URL | text | Optional |
| Budget range | dropdown (e.g. `<$10k`, `$10k–$25k`, `$25k–$50k`, `$50k+`) | Optional → required |
| Service / project type | dropdown or checkboxes (branding, web, paid media, SEO, content) | Required |
| How did you hear about us? | dropdown | Optional |
| "Tell us about your project" | free-text box | Required |
| Marketing / privacy consent | checkbox (GDPR-style) | Required in EU |

**CTA (inferred):** a button labelled something like *"Let's talk"*, *"Get in touch"*, *"Start a project"*, or *"Send message"*. Exact label unknown without the live page.

**Friction level: HIGH.** This archetype uses the contact form as a **qualification gate**, not a low-commitment "start a conversation" door. Three friction stacks compound:
- **Self-qualification gates** — budget dropdown + service-type force a cold visitor to price and categorize themselves before any value comes back.
- **The signature high-friction element** — the *"Tell us about your project"* essay box demands the visitor compose a project brief from cold.
- **Commitment stack** — phone (often required) + consent checkbox on top.

**The archetype failure mode (inferred):** a strong-fit prospect who is not yet ready to articulate budget or scope **bounces rather than self-qualifies.** The form filters *for* people who already know what they want to buy and filters *out* high-fit buyers who are still forming the brief — exactly the buyers worth a conversation.

---

## 2. What sales still has to research

Even when this form is fully completed, whoever owns new business (founder, biz-dev lead, or account director — **rarely a dedicated RevOps function at this size, inferred**) still opens new tabs to answer:

- **Is this real?** — tire-kicker vs. student vs. competitor vs. genuine buyer. Check the work-email domain against the company-website field.
- **Company size / funding / vertical** — to judge whether the stated budget is *credible*.
- **Does the project match what we actually want to sell?** — scope-mismatch check (e.g. a `$10k` "full rebrand + site + paid" ask that can't be delivered at that number).
- **Is the submitter senior enough to buy?** — decision-maker vs. coordinator vs. intern.
- **How warm / what intent?** — "how did you hear about us" + any UTM context to gauge source and urgency.
- **Suggested opener** — given all of the above, what's the right first reply that doesn't sound generic.

That is the manual buyer-profile work this archetype does by hand on every submission. The form collected the lead; the rep still got homework.

---

## 3. The rep-ready buyer profile the CRM should receive

This is the standard Deal Threads pushes into the CRM before the callback — buyer-provided facts, enriched facts, and unknowns kept **distinct**, with anything not known left as **unknown** (never guessed). Illustrative example for this archetype below; values shown are a plausible sample, not a real lead.

```
Deal Threads AI Lead Profile  —  (archetype illustration)

Priority: [High / Medium / Low]  (ICP fit __/100)
Recommended next action: [e.g. "Reply within the hour; lead with scope-fit, not pricing"]

Intent:
  Wants [service type]. Trigger appears to be [website relaunch / new funding / campaign push].

Qualification:
  - Need:        [business_need, in their words]
  - Project type: [branding / web / paid / SEO / content]
  - Timeline:    [this_month / this_quarter / researching / unknown]
  - Budget:      [budget_status: approved / likely / building_case]  /  [range, if stated]
  - Authority:   [role]  /  [decision_owner / influencer / researcher / unknown]

Company context (enriched):
  - Size:        [employee_range]        (source: enrichment, confidence shown)
  - Industry:    [vertical]
  - Signals:     [recent funding / hiring / relaunch — or "none found"]

Source:
  - Page:        [/contact]
  - How heard / Campaign: [referral / organic / UTM]

Visitor-provided facts:
  - [fact 1]
  - [fact 2]

Enriched context:
  - [fact 1]
  - [fact 2]

Watchouts (unknowns):
  - [e.g. "Budget not stated — do not assume"]
  - [e.g. "Personal email; company match via website field only"]
```

The point is the format, not the sample values: a rep should be able to read it in under 30 seconds and know **who this is, why they care, whether they fit, how urgent it looks, what's unknown, and what to say first.**

---

## 4. The 3 questions I would ask differently

The current archetype asks the visitor to do the agency's qualification work (budget dropdown + essay box). I would flip the burden: ask fewer, smarter questions that improve the *first reply* and let enrichment fill the rest.

1. **Replace the cold "Budget range" dropdown with an outcome question.** Instead of "What's your budget?" (which makes unsure-but-real buyers bounce), ask *"What would a successful outcome look like 90 days from now?"* — this captures intent and urgency without forcing a price tag the visitor may not have, and budget can be inferred/qualified on the call.

2. **Replace the open "Tell us about your project" essay with a scoped prompt.** Swap the blank box for *"Which best describes where you are: (a) exploring options, (b) have a brief and a timeline, (c) ready to start now?"* plus one short "anything specific?" line. This captures **buying stage** (the thing that actually predicts deal quality) instead of demanding cold prose.

3. **Replace "How did you hear about us?" with a timeline question.** Source can be captured silently from UTM/referrer behind the scenes (inferred), so don't spend a form field on it. Use that slot for *"When are you hoping to kick off?"* — timeline is a far stronger routing and prioritization signal than self-reported attribution.

Net effect: the visitor does **less** typing, the rep learns **more** about fit and urgency, and fewer high-fit-but-not-yet-articulate buyers bounce.

---

## 5. The enrichment fields I would add behind the scenes

Captured silently from the email domain + website field, so the form stays short while the CRM record gets rich. Every enriched field carries a **source + confidence** tag, and anything below threshold is stored but **not written as fact** (it stays unknown).

- **Company size / employee range** — to sanity-check stated or inferred budget.
- **Industry / vertical** — for scope-fit and routing.
- **Tech / site stack** (from the website field) — signals platform and project realism.
- **Funding / growth / news signals** — funding round, hiring spike, recent website relaunch (the relaunch is the most archetype-relevant trigger: the form is freshly in scope).
- **Seniority / authority signal** — is the submitter a decision-owner or a researcher.
- **Real-vs-noise flag** — work-email-domain match against the company website to filter tire-kickers, students, and competitors before a human spends time.
- **Source / UTM context** — captured silently rather than asked.

Rule throughout: visitor-provided, AI-inferred, and third-party-enriched fields stay distinguishable, and **unknown stays unknown.**

---

## 6. The simplest install path

- **One script tag** on the `/contact` page — the intake layer replaces or wraps the existing form; no site rebuild.
- **Maps to the CRM you already run.** For this archetype that is most likely **HubSpot Free/Starter** (popular with agencies for CRM + native forms) — **but this is inferred and unverified.** A meaningful share of boutique agencies instead run a form plugin (Gravity Forms / Typeform / Webflow native) into a shared inbox, Pipedrive, or Notion/Monday as a pseudo-CRM, and many are **inbox-first with no structured pipeline at all.** If there's no real CRM, the profile can land as a formatted email/Slack note instead.
- **Reversible.** Single tag, remove anytime; existing form stays intact underneath during testing so conversion can be measured before/after.
- **Profile lands before callback** — as a readable CRM note (or inbox/Slack note) with priority, fit, intent, and suggested opener, not a new dashboard to learn.

I would confirm the actual CRM/stack from careers-page or job-post mentions and site tracker fingerprints **only if this were run against a real URL** — none of that is possible in archetype mode, so the stack above is inferred-typical.

---

## 7. Want this live on your form?

The form is technically working — it captures a lead. It's just making whoever owns new business build the buyer profile **by hand** on every submission, and (worse for this archetype) the qualification gates are quietly bouncing high-fit buyers who aren't ready to self-price.

If you want, send me your real `/contact` URL and I'll redo this against your *actual* fields, then map the lightweight install that pushes a rep-ready buyer profile into your CRM before the callback.

---
---

## Loom Script (60–90s)

> *Record over the archetype form on screen. Keep it calm and specific — founder-to-founder, not pitchy.*

```
Quick teardown — and a caveat up front: this is the typical B2B agency contact
form, not your real page, because I didn't have a URL. So treat the fields as a
pattern, not a claim about you.

Here's the shape of it. Name, email, company, phone. Then the gates: a budget
dropdown, a service-type picker, and the big one — a "tell us about your project"
box that asks a cold visitor to write you a brief before they get anything back.

That's enough to capture a lead. But it doesn't tell whoever picks this up whether
the person is real, whether they're senior enough to buy, whether the budget they
clicked is credible for the project they want, or what to say first.

So someone — probably you or your new-business lead — opens the email, then the
company site, then LinkedIn, and pieces the buyer together by hand. Every time.

And there's a quieter cost: that budget dropdown and essay box are filtering out
good buyers who just aren't ready to price themselves yet. They bounce instead of
self-qualifying.

If this were a buyer-profile form, I'd ask two or three sharper questions — buying
stage and timeline instead of a cold budget tag — and enrich the company size,
vertical, and any recent trigger behind the scenes. Then push one readable note to
your CRM: who they are, why they care, whether they fit, how urgent it looks, and
what's still unknown.

The form's working technically. It's just making sales do the buyer-profile work
manually. Send me your real contact URL and I'll run this against your actual fields.
```

---

## Before / After Carousel (raw form vs. buyer profile)

> *6 slides. Use for a Wednesday "teardown proof" post. Label slide 1 clearly as archetype so it never reads as a real company's form.*

**Slide 1 — The setup**
> *"What a typical B2B agency contact form gives sales (archetype — not a real company)."*

**Slide 2 — RAW (what the form captures)**
```
Name:     ____________
Email:    ____________
Company:  ____________
Phone:    ____________
Budget:   [ <$10k ▼ ]
Service:  [ Branding ▼ ]
"Tell us about your project:"
[ ___________________________ ]
[ ___________________________ ]
☑ I agree to the privacy policy
        [ Let's talk ]
```

**Slide 3 — The rep's reaction**
> *"Who is this? Real buyer or tire-kicker? Senior enough to sign? Is that budget credible for what they're asking? What do I say first?"*
> Then: email → company site → LinkedIn → guess.

**Slide 4 — AFTER (the buyer profile the CRM should get)**
```
Priority: High (ICP fit 8x/100)
Next action: Reply within the hour — lead with scope-fit, not price.

Intent:   Wants [web rebuild]. Trigger: recent site relaunch.
Need:     [in their words]
Stage:    Has a brief + timeline
Timeline: This quarter
Budget:   Building case (not stated — do not assume)
Authority:Decision-owner

Company (enriched): ~25 ppl · [vertical] · relaunch signal
Source:   /contact · referral

Watchouts: Budget unstated. Confirm scope before quoting.
```

**Slide 5 — What changed**
> Same lead. The form didn't get longer.
> The visitor typed *less*. The rep learned *more*: fit, urgency, what to say first — and what's still unknown.

**Slide 6 — CTA**
> *"Most agency forms do slide 2. They should be moving toward slide 4. Send me your contact URL for a real teardown."*

---

## DM Follow-up (drafted from the Week 1 DM library — "Delivering A Teardown")

> *Use after they've engaged or asked for a look. This is the archetype/proof version; swap in their real fields once you have the URL.*

```
I recorded the teardown here: [link]

Short version — and fair warning, I ran it on the *typical* agency contact form
since I didn't have your URL, so this is a pattern, not a claim about your page.

The usual setup captures name, email, company, phone, a budget dropdown, a service
picker, and a "tell us about your project" box.

The biggest missing sales context is buying stage + whether the budget is credible
for the scope — so whoever follows up is still researching every submission by hand,
and the budget gate is quietly bouncing good-but-unsure buyers.

If I were turning this into a buyer-profile workflow, I'd swap the cold budget/essay
asks for two sharper questions (stage + timeline), enrich company size + vertical +
any recent trigger behind the scenes, and push one readable note to your CRM before
callback.

Want to send me your actual contact URL so I can redo this on your real fields?
```

---

## Qualification Verdict — Form URL Qualification Checklist

*Applied honestly against the archetype. This is the Week 1 Execution Pack checklist.*

| # | Criterion | Archetype result |
| --- | --- | --- |
| 1 | B2B company | **Yes** — B2B services agency. |
| 2 | Has demo/contact-sales form | **Yes** — the contact form *is* the archetype. |
| 3 | Deals likely high value | **Mixed** — wide range ($5k–$50k projects, $2k–$15k/mo retainers, inferred); a meaningful share falls **below** the $10k+ threshold. Only lead-gen-heavy/premium shops clear the bar. |
| 4 | Founder/GTM/sales/RevOps buyer engaged | **Weak** — owned by founder / biz-dev / account director; **rarely a RevOps function** at this size (inferred). |
| 5 | Sales follow-up matters | **Partial** — manual post-submit research is real, but many agencies are referral/network-led, so inbound-form volume is often *not* the most painful channel. |
| 6 | CRM exists or likely | **Mixed** — HubSpot-using agencies pass; **inbox-first shops fail** this outright (inferred). |
| 7 | Real handoff problem | **Yes (generic)** — high-friction form + manual research is genuinely present. |
| 8 | Not obviously low-ticket B2C | **Pass** — it's B2B, though deal value is inconsistent. |

### Verdict: **DISQUALIFIED** (as a live prospect segment)

On the *form-mechanics* axis the archetype superficially passes — high-friction contact form, real manual research, sometimes $10k+ projects — which is exactly why it can slip past a naive filter. But on the axes that actually decide deals for this founder, agencies are a **known dead end**, per project memory (`dealthreads-gtm-beachhead.md`). The beachhead is **compliance/security service firms (SOC 2 auditors as the lead wedge)**, chosen because the founder has insider-grade messaging there. Agencies were **tried and explicitly dropped** for four reasons that all apply to this archetype:

1. **Too savvy/skeptical** — agencies sell marketing/web and self-identify as able to build their own AI widget ("I'll build it myself"). Hardest possible audience for a lead-capture tool. This maps directly to the **DIY Automation Power User** and **AI-Curious** anti-personas in the persona system.
2. **Mild own-lead pain** — many run on referral/network/portfolio, so inbound-form volume isn't the primary pain.
3. **No warm doors** — the founder has no insider edge or warm network into agencies; the cold motion's entire unlock is insider-voiced messaging, which doesn't exist for this vertical.
4. **Weak CRM/RevOps fit** — boutique agencies frequently run inbox-first with no real pipeline and no sales team in the Deal Threads sense, failing the core lead-flow signature (inbound form + $10K+ deals + sales-led + no RevOps).

**Use of this artifact:** keep it as a **generic archetype illustration** for content (the Wednesday before/after carousel, a teardown clip) — *not* as a signal to prospect agencies. Even a strong buying trigger (e.g. an agency shifting from referral-led to inbound-led growth) would **not** override the disqualified verdict, because the block is go-to-market access and buyer psychology, not the presence of a form.

---

### The single biggest gap

**Buying stage / scope-credibility is never captured — so every submission becomes manual research, and the budget gate silently bounces high-fit-but-unsure buyers.** The form asks the visitor to self-price and write a cold brief, yet still doesn't tell the rep the one thing that predicts deal quality (where the buyer is in their decision and whether the stated budget is credible for the scope). The lead is captured; the buyer profile is not.

### Missing buyer-profile fields

- Buying stage (exploring vs. brief-ready vs. ready-now)
- Timeline / urgency
- Budget *credibility* (stated range sanity-checked against company size) — not just a self-selected dropdown
- Authority / seniority of the submitter (decision-owner vs. researcher)
- Company size / employee range (enriched)
- Industry / vertical (enriched)
- Tech / site stack (enriched from the website field)
- Recent trigger — funding, hiring, website relaunch (enriched)
- Real-vs-noise flag (work-email-domain ↔ website match)
- ICP fit score + priority label
- Suggested first-reply opener
- Source / UTM context (captured silently)
