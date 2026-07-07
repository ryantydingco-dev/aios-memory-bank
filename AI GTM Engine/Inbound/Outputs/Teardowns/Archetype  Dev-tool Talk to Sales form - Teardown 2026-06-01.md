# Dead Form Teardown — Archetype: Dev-tool "Talk to Sales" Form

**Mode: PROOF / ARCHETYPE** (fetchStatus = `archetype`)
**Target:** the dev-tool "Talk to sales" / "Contact sales" form archetype — a generic, representative pattern, **not a specific company.**
**Date:** 2026-06-01
**Prepared for:** the Deal Threads inbound proof library (public/anonymized teardown asset)

> **Honesty note — read this first.** No real company form was fetched. No `formUrl` was provided. Every field below is a **typical, representative pattern** for a developer-facing "Talk to sales" form. It is **not a claim about any specific company's live form.** Fields marked **(inferred)** are common-but-variable qualifiers for this archetype. Anything not directly observable is labeled **inferred** or **unknown**. To verify against a real target, re-run in **inbound mode** with the company's `/contact-sales` or `/talk-to-sales` URL so the actual visible fields, required markers, and CTA can be read directly.

---

## 1. What the form captures now

This is the **typical** field set for a dev-tool "Talk to sales" form. Treat it as a representative archetype, not a verified single form.

**Core set (verified-by-convention for this archetype — appears on almost all of them):**

- Work email — required
- First name — required
- Last name — required
- Company name — required
- Job title / role — required
- Company size — dropdown (e.g. 1-10, 11-50, 51-200, 201-500, 501-1,000, 1,000+) — required
- "How can we help?" / "What are you looking to solve?" — free-text box — required

**Common additions (vary by company — typical pattern):**

- Country / region — dropdown, often required for routing/compliance
- Phone number — optional or required
- Marketing consent checkbox — required on EU-facing forms

**Distinctive dev-tool qualifiers (inferred — common but variable):**

- Number of developers / engineers — dropdown or numeric *(inferred — the field that separates this archetype from a generic SaaS demo form)*
- Expected monthly usage / scale, or current stack — free-text or dropdown *(inferred, varies)*
- "How did you hear about us?" / referral source — dropdown *(optional, inferred)*

**Submit CTA:** "Talk to sales" / "Contact sales." Variants seen across the archetype: "Request a demo," "Get in touch," "Book a call." *(This archetype leans toward "Talk to sales" rather than "Request a demo.")*

**Friction level: HIGH (for this audience).** 8-13 fields including manual role / company-size / dev-count / usage qualifiers **plus** a free-text "what are you solving" box. Developers are a self-serve-first, form-averse audience — each added qualifier compounds drop-off. *Note: the exact same form would rate medium for a non-technical buyer. The friction read is audience-specific.*

**What the form does well:** it is a real gated sales form (not a newsletter), it forces work email + company + size, and the dev-count/usage qualifier is a genuine attempt to triage self-serve vs enterprise. The intent to qualify is there. The problem is *where* that qualification happens and *what the rep gets after submit.*

---

## 2. What sales still has to research

Even with 8-13 fields, the rep opens this submission and still has to go find the things that actually decide whether to drop everything and call. Everything in this section is the manual homework the form leaves on the rep's desk.

| Context the rep needs | On the form? | Where the rep goes to get it |
| --- | --- | --- |
| Real account size / is this a logo worth an AE | Partial (self-reported size) | LinkedIn, the company site, Crunchbase |
| **Existing self-serve / free usage under this domain** | **No** | **Product DB / PLG tool — the single most valuable signal, and it is invisible here** |
| Who actually controls budget vs the technical submitter | No | LinkedIn org chart, guesswork on the call |
| The true use case behind a terse free-text answer | Rarely | Discovery call, re-reading the one-line box |
| Tech stack / competitor displacement context | Inconsistent | BuiltWith, job posts, the submitter's GitHub |
| Seniority / authority of the submitter | Title only (self-reported) | LinkedIn |
| Urgency / what triggered the outreach | No | Inferred on the call |
| ICP fit (is this an AE deal or PLG nurture) | No — computed manually | Rep's head, after all the above |

**The pattern for this archetype specifically:** the submitter is almost always a **developer, eng lead, staff/principal engineer, platform/DevOps lead, or eng-manager** *(inferred — the defining trait of the archetype)* — a technical evaluator or champion, **frequently not the economic buyer.** The motion is **bottom-up / PLG**: the dev already tried the product self-serve and is raising a hand because they hit a wall — a seat or usage ceiling, a needed enterprise feature (SSO/SAML, audit logs, SLA), or procurement/security demanding a contract, SOC 2, or DPA. *(All inferred — structural to the archetype, not observed on a specific form.)*

**The biggest single gap:** the form has no idea whether this person — or their teammates — are **already using the product for free under the same domain.** That product-qualified signal is the difference between "route to an AE now" and "PLG nurture," and on a static form it is completely missing. (More on why that matters for fit in the verdict.)

---

## 3. The rep-ready buyer profile the CRM should receive

This is the before/after in one move. Instead of 11 raw fields plus a one-line text box, the rep opens HubSpot and sees a readable pre-call brief. **Illustrative — built from the archetype, with unknowns left as unknown on purpose.**

```text
Deal Threads AI Lead Profile  (ILLUSTRATIVE — archetype example)

Priority: MEDIUM (62/100)  — pending product-usage check
Recommended next action: Before routing to AE, check for existing self-serve
usage under this domain. If active paid/free usage exists, escalate to AE with
the usage angle. If not, route to PLG nurture + SDR touch.

Intent:
Technical evaluator raising a hand from a dev-tool sales form. Likely hit a
self-serve wall (seat/usage limit or enterprise feature/security requirement).

Qualification:
- Role: [submitter title, self-reported] / authority_signal: influencer  (inferred — likely champion, not economic buyer)
- Pain: [from free-text box — verbatim, not paraphrased]
- Timeline: unknown  (not captured on form)
- Budget: unknown  (technical submitter rarely owns budget)
- Company size: [self-reported range]  (source: visitor — verify against enrichment)
- Dev/eng count: [self-reported, if present]  (source: visitor)
- Stack / usage: [free-text if present, else unknown]

Company context (enriched behind the scenes):
- Employee range: [enriched]  (source: enrichment_provider, show confidence)
- Industry / segment: [enriched]
- Recent funding / eng-team growth: [enriched if available, else unknown]

Source:
- Page: /talk-to-sales  (or actual capture page)
- Campaign: [utm if present]

Visitor-provided facts:
- [fact from form]
- [fact from form]

Enriched context:
- [firmographic fact]
- [tech-stack / competitor signal if found]

Watchouts:
- Submitter is likely a CHAMPION, not the budget owner — identify the economic buyer.
- PRODUCT-USAGE SIGNAL NOT YET CHECKED — this is the field that decides AE vs PLG.
- Budget + timeline UNKNOWN — do not assume enterprise intent from a "Talk to sales" click.
```

The point is not to make the lead look complete. It is to hand the rep a 30-second read with **unknowns marked unknown** — and to flag, at the top, the one check (existing product usage) that actually changes the routing decision.

---

## 4. The 3 questions I would ask differently

The current form asks for company size, dev count, and "how can we help?" in a static box. For a developer audience that abandons long gated forms, I would **cut, not add** — replace blunt qualifiers with 2-3 conversational questions that produce routing signal *and* respect the self-serve buyer.

**Question 1 — replace the static "how can we help?" box with a routing-aware version:**
> "Are you already using [product] today, or evaluating it for the first time?"

This is the single highest-value question for this archetype and the form never asks it. It instantly separates expansion/product-qualified ("already using") from net-new, and it is the human-friendly version of the product-usage check.

**Question 2 — surface the wall they hit, in their words:**
> "What pushed you to talk to sales now — a seat/usage limit, a security or compliance requirement, or something else?"

Turns a vague free-text answer into a structured trigger (the thing the rep otherwise infers on the call) and tells the rep whether this is a SSO/SAML/SOC-2 procurement deal or a scale/usage deal.

**Question 3 — find the budget owner without interrogating the dev:**
> "Will you be the one owning this internally, or looping in a lead/manager for budget?"

Respectfully surfaces the champion-vs-economic-buyer gap that this archetype almost always has, so the rep knows on contact whether they are talking to the decision owner or the evaluator.

> Design rule for this audience: ask these **only after** email is captured (so a drop-off still yields a lead), keep it to 2-3 questions, allow short answers, and never make it feel like an interrogation. Some of this should come from the conversation; the rest gets enriched silently.

---

## 5. The enrichment fields I would add behind the scenes

Everything here is enriched silently after submit — **no extra form friction.** Each field carries a source and confidence, and **unknown stays unknown** (do not sync anything below ~0.50 confidence as fact). Maps directly to the Deal Threads HubSpot field map.

**Account-side (HubSpot Company):**

- `deal_threads_employee_range` — true employee range (validate the self-reported size against enrichment; flag mismatches)
- `deal_threads_revenue_range` — only if confidence >= 0.70
- `deal_threads_tech_stack` — detected stack / competitor displacement context (BuiltWith-style)
- `deal_threads_recent_funding` — recent round or eng-team growth (a real archetype trigger: funding expands the eng org)
- `deal_threads_icp_segment` — is this an AE-worthy logo or PLG-nurture

**Person-side (HubSpot Contact):**

- `deal_threads_authority_signal` — decision_owner vs influencer vs researcher (this archetype skews **influencer/champion**)
- `deal_threads_icp_score` — 0-100, computed from fit + the product-usage signal
- `deal_threads_priority` — high / medium / low
- `deal_threads_next_action` — the routing recommendation, AE vs PLG nurture

**The one I care about most for this archetype — the product-qualified signal:**

- **Existing self-serve / free usage under this domain** — *(this is the highest-value enrichment for a dev tool, and an honest caveat: it usually lives in the **product DB / PLG tooling** — Pocus, Calixa, HeadsUp, Segment telemetry, or homegrown — **not** in third-party firmographic enrichment. A CRM-side form-enrichment workflow can flag and route, but for a true PQL signal it has to read the product data layer.)* Labeled clearly so the rep knows whether it was checked.

> Honesty rule carried through: every enriched field shows where it came from. Self-reported form values (size, dev count) are tagged `visitor`; firmographics are tagged `enrichment_provider` with confidence; the product-usage field is only as good as the product-data connection, and says so.

---

## 6. The simplest install path

Nothing heavy, nothing that touches the existing form's conversion path until it is proven.

1. **Single script tag** on the `/talk-to-sales` page. The existing form keeps working; the script captures the submission and the 2-3 conversational questions.
2. **Enrich silently** after submit — firmographics, stack, funding/eng-growth — with source + confidence on every field.
3. **Push a rep-ready buyer profile into HubSpot** as a readable note + a small set of `deal_threads_` custom fields (priority, ICP score, next action, authority signal). Fill-if-empty on standard fields; never overwrite owner, lifecycle, or original source.
4. **Route on the product-usage flag:** if existing usage is detected (via the PLG-data connection, where available), escalate to AE with the usage angle; otherwise route to PLG nurture / SDR. Unknown routes to manual review.
5. **Reversible.** It is a script tag and a field map. Remove it and the form is exactly as it was.

CRM is near-universal for this archetype (HubSpot or Salesforce — the form itself is typically a HubSpot or Marketo/custom form posting into one), so the mechanical preconditions are already in place. *(Inferred, archetype-level — confirm by checking the form's network calls: `hs-scripts` / `forms.hsforms.com` = HubSpot; Marketo munchkin / Eloqua = those.)*

---

## 7. Want this live on your form?

The form is technically working. It is just doing the qualification in **blunt static fields a developer abandons**, and still making sales do the real buyer-profile work — *especially the one check that matters here: who is actually using the product already.*

**Want me to map the lightweight install that would push this profile into your CRM before callback — and wire in the product-usage routing signal?**

---

---

## Loom Script (60-90 seconds)

```text
Quick teardown — and a heads-up, this is the dev-tool "Talk to sales" archetype,
not your specific form. If you send me your real /talk-to-sales URL I'll redo it
live on yours.

Here's the typical form. It asks for work email, name, company, job title,
company size, usually a developer count, and a "what are you trying to solve" box.
Eight to thirteen fields.

That's actually a lot of friction for developers — they're a self-serve crowd,
and every extra qualifier field loses a few more of them.

But here's the thing: even after all those fields, the form still doesn't tell
sales the one thing that decides everything. Is this person — or their team —
already using the product for free under that same domain? That product-usage
signal is the difference between "call them now" and "drop them in nurture,"
and the form has no idea.

It also can't tell you if the developer who filled it out actually owns the
budget. On this archetype, they usually don't — they're the champion, not the
buyer.

If this were a buyer-profile form, I'd cut fields, not add them. I'd ask three
conversational questions: are you already using us or evaluating, what wall did
you hit, and are you the owner or looping in a manager. Then I'd enrich the
company, the stack, and any funding behind the scenes — and check product usage.

The rep opens HubSpot and sees: priority, why they reached out, whether they're
a champion or a buyer, and the one routing flag — AE versus PLG nurture. Unknowns
stay marked unknown.

That's the gap. The form converts fine. It's just making sales rebuild the buyer
profile by hand — and miss the product signal that matters most for a dev tool.

Want this on your real form?
```

---

## Before / After Carousel (raw form vs buyer profile)

**Slide 1 — Title**
> Your "Talk to sales" form got the lead. Your rep still got homework.
> *(Dev-tool archetype teardown)*

**Slide 2 — RAW: what sales receives today**
```text
Email: dev@company.com
Name: [first] [last]
Company: [company]
Title: Senior Engineer
Company size: 201-500
Developers: 50-100
How can we help?: "Looking into this for our team, hit some limits."
CTA clicked: Talk to sales
```
> 8-13 fields. Still a stranger.

**Slide 3 — The rep's reaction**
> "Who actually is this? Are they already using us? Do they own budget? Is this an
> AE deal or self-serve? What limit did they hit?" → 6 browser tabs.

**Slide 4 — AFTER: the buyer profile**
```text
Priority: MEDIUM (62/100) — pending product-usage check
Next action: Check existing self-serve usage under this domain first.
            Usage found → AE w/ usage angle. None → PLG nurture + SDR.

Who: Senior Engineer — likely CHAMPION, not budget owner (inferred)
Why now: [the actual wall, in their words]
Company: [enriched size] · [stack] · [recent funding / eng growth]
Unknown: budget, timeline, economic buyer — marked unknown, not guessed
```
> 30-second read. A routing decision, not homework.

**Slide 5 — The shift**
> Less "thanks, we got your message."
> More "here's the buyer context — and the one check that decides AE vs nurture."

**Slide 6 — CTA**
> Want this live on your real form? Send the /talk-to-sales URL.

> *Carousel note: archetype/illustrative. Bracketed values are placeholders filled per real lead. Build the real version from a submitted form URL.*

---

## DM Follow-Up (drafted from the Week 1 DM library — "Delivering A Teardown")

```text
I put together a teardown here: [link]

Short version — and fair warning, I ran this on the dev-tool "Talk to sales"
archetype, not your exact form, since I didn't have your URL.

Your form captures the basics plus a dev-count and a "what are you solving" box —
solid intent, but it's heavy for a developer audience and they abandon long gated
forms.

The biggest missing sales context is whether the person (or their team) is already
using the product self-serve under that domain. For a dev tool that's the signal
that decides AE vs PLG nurture, and a static form can't see it.

If I were turning this into a buyer-profile workflow, I'd cut a couple fields and
add 2-3 conversational questions (already using us vs evaluating / what wall did
you hit / do you own budget), enrich the company + stack + funding behind the
scenes, and push a rep-ready profile into HubSpot before callback — with the
product-usage routing flag wired in.

Want to map what the lightweight install would look like on your actual site and
CRM? Send me your /talk-to-sales URL and I'll redo this teardown live on yours.
```

---

## Qualification Verdict — Form URL Qualification Checklist

Scored against the Week 1 **Form URL Qualification Checklist**. Because this is proof/archetype mode, several boxes are judged at the archetype level, not against a real company.

```text
[~] B2B company.                          YES (archetype is B2B software)
[x] Has demo/contact-sales form.          YES (real gated sales form, not a newsletter)
[x] Deals are likely high value.          YES at the Enterprise tier (~$15K-$100K+ ACV, inferred, bimodal)
[~] Founder/GTM/sales/RevOps buyer        WEAK — submitter is usually a DEVELOPER /
    engaged.                              eng lead, a technical evaluator, NOT the
                                          founder/RevOps/demand-gen/sales-leader persona
                                          Deal Threads sells to. Economic buyer surfaces later.
[~] Sales follow-up matters.              YES, but a lot of the qualification is product-led
                                          scoring (PLG), which is adjacent to — not the same as —
                                          Deal Threads' CRM-side post-submit wedge.
[x] CRM exists or is likely.              YES (HubSpot or Salesforce near-universal, inferred)
[~] There is a real handoff problem.      YES — the "who is this account, who owns budget,
                                          what's the real use case" problem is genuine. But the
                                          highest-value signal (prior self-serve usage) lives in
                                          the product DB / PLG tooling, not CRM-side research.
[x] Not obviously low-ticket B2C.         YES (clears this easily)
```

### Verdict: **MAYBE — secondary / expansion segment, not a beachhead target**

**ICP fit: LOW** (per the research input). The mechanical preconditions Deal Threads needs are all satisfied — it is B2B, a real gated sales form, high-value enterprise deals, a CRM in place. The post-submit "who is this account really, who owns budget, what's the real use case" research problem genuinely exists for these reps.

**But the dominant buyer and motion sit outside Deal Threads' stated beachhead** (compliance/security **service** firms) and outside its ideal founder/RevOps/demand-gen buyer, on three axes:

1. **Buyer mismatch** — the human on the form is a developer/eng champion, not the economic buyer Deal Threads sells to.
2. **Motion mismatch** — PLG bottom-up. The most valuable enrichment signal (prior self-serve usage) lives in the **product DB / PLG tooling**, not in the CRM-side post-submit research Deal Threads automates. The qualification here is largely product-led scoring — adjacent to, but not the same as, Deal Threads' wedge.
3. **Partial fit on the rest** — B2B, real form, high-value enterprise tier, CRM present. The plumbing fits; the buyer and motion don't.

**Recommendation:** treat as an **expansion/secondary segment**, not a Week 1 priority. Do not spend custom teardown time on a named dev-tool over a compliance/security service firm. **Exception:** a specific named dev-tool with a **sales-led** enterprise motion and a **RevOps owner** could rate medium — re-run in **inbound mode** against the real company to confirm before investing.

---

## Source & Honesty Summary

- **Mode:** proof / archetype. No company form fetched; no `formUrl` provided.
- **Verified:** nothing about a specific company. The core field set is "verified-by-convention" for the archetype only.
- **Inferred (labeled throughout):** dev-count/usage/stack qualifiers; submitter persona (developer/champion); PLG bottom-up motion; deal-size band; CRM stack; structural triggers (seat/usage wall, SSO/SOC-2 requirement, funding-driven eng growth).
- **Unknown (kept unknown):** any real company's actual fields, budget, timeline, economic buyer, and live product-usage data.
- **To verify:** re-run in inbound mode with a real `/talk-to-sales` or `/contact-sales` URL. Read actual visible fields, required markers, and CTA directly; check network calls for the CRM (`hs-scripts`/`forms.hsforms.com` = HubSpot; Marketo/Eloqua = those); scan careers page for "HubSpot," "Salesforce," "Marketo," "RevOps," or "Marketing Operations."
