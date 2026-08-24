# Dead Form Teardown — Archetype: B2B SaaS "Request a Demo" Form

**Mode: PROOF / ARCHETYPE (no live page fetched).**
**Archetype ID:** `b2b-saas-demo`
**Date:** 2026-06-01
**Prepared by:** Ryan (Deal Threads)

---

> **Read this first — honesty note.**
> This is a **reference teardown of a TYPICAL "Request a Demo" form**, not an audit of any specific company. No page was fetched. Every form field, the CTA wording, and the friction read below are a **documented typical pattern for the b2b-saas-demo archetype** — labelled **"unverified — typical pattern."** None of it is a claim about a real company's live form.
>
> To turn this into a real, company-specific teardown: re-run in **inbound mode with a `formUrl`** so the actual visible fields, the submit CTA, and the real qualification questions can be fetched and verified. Until then, treat this as the **fit template** that shows what the gap looks like on a normal demo form.

---

## Short version (the DM-ready summary)

A typical "Request a Demo" form captures **who someone is and where they work** — name, work email, phone, company, title, size bucket, region, a free-text "what are you looking to solve?" box, and a consent checkbox. That is enough to *log the lead*. It is not enough to *prepare the rep*.

The biggest missing piece is not another field. It is **buying context**: real seniority and authority, ICP fit, urgency/timeline, current stack, and a trigger that explains *why now*. None of that is on the form, so a human goes and digs it up by hand — **~10–20 minutes per inbound demo request** *(inferred — typical pattern)*.

The form is working technically. It is just making sales build the buyer profile manually.

---

## 1. What the form captures now

**Source: unverified — typical pattern for the `b2b-saas-demo` archetype. Not fetched from a live page.**

| Field | Typically required? | What it gives sales |
| --- | --- | --- |
| First name | Required | Identity |
| Last name | Required | Identity |
| Work email | Required (often blocks free/personal domains) | Identity + company domain |
| Phone number | **Frequently required** — known friction driver | A way to call |
| Company name | Required | Account name |
| Job title / role | Often required (routing + qualification) | Rough seniority (unreliable on its own) |
| Company size (dropdown) | Dropdown — ICP gate | Rough size bucket |
| Country / region (dropdown) | Dropdown — routing + data residency | Territory |
| "How can we help? / What are you looking to solve?" (free-text) | Optional or required, varies by vendor | A sentence the rep has to interpret |
| Consent / marketing opt-in checkbox | Common (GDPR-influenced) | Compliance record |

- **CTA (typical pattern):** primary button reads **"Request a demo."** Variants seen across the archetype: "Get a demo," "Book a demo," "Talk to sales," "Schedule a demo."
- **Qualification questions on the form:** title, company size, and the open "what are you looking to solve?" box are the only qualification signals — and the free-text box is unstructured.
- **Friction level: medium** *(inferred — typical pattern)*. The fields are standard B2B, so intent-qualified buyers usually push through. What pushes it to the *high* end of medium: (1) **phone as a required field** — the single biggest abandonment lever on demo forms; (2) the **open-ended "how can we help?" box**, which forces the visitor to compose a sentence and stalls momentum; (3) **title + company-size as required gates** can deter lower-level researchers who would otherwise convert.

**Honest read:** this form is a competent *contact capture* form. It is not a *buyer-profile* form. That distinction is the whole teardown.

---

## 2. What sales still has to research

The form hands the rep a name, work email, company, title, size bucket, region, and a free-text problem statement. Before a credible first call, a human still has to manually dig up everything below. **All of this is the post-submit research burden — inferred as the typical pattern for this archetype; ~10–20 min/lead.**

| What sales still has to research | Why the form did not answer it |
| --- | --- |
| **Company size (verified)** — real headcount, not just the self-selected dropdown bucket | Dropdown is self-reported and coarse |
| **Industry / vertical** | Not captured |
| **Role + authority** — is this an economic buyer, a champion, or a researcher? | Title alone is unreliable |
| **Urgency / timeline** | The form never asks "when" |
| **Budget / buying stage** | Never asked |
| **Tech stack / current tools** — what competing or adjacent tools they run (displacement vs greenfield) | Not captured |
| **ICP fit** — does this account actually match who we win with? | Has to be assembled from the above |
| **Recent trigger** — funding, leadership hire, product launch, M&A, hiring signals that explain *why now* | Not captured |
| **Account history in CRM** — prior touches, open opportunities, other contacts, marketing engagement | Lives in the CRM, not the form |
| **Decoded need** — translating the free-text box into a real use-case and mapping it to a relevant case study | Free-text is unstructured |
| **Routing / dedup** — is this account already owned, in-territory, or a duplicate record? | Not handled at submit |

**Suggested opener (what good context would let the rep say):** lead with the buyer's *operational* problem from their decoded need and a relevant proof point — not a generic "thanks for your interest, here's a calendar link." *(Inferred — the actual opener depends on the real lead.)*

This is the section that matters. The lead may be excellent. The **handoff** is what makes it look like homework.

---

## 3. The rep-ready buyer profile the CRM should receive

This is what the CRM record *should* look like before the rep calls back — assembled from the form answers **plus** enrichment, with every field tagged by source and **unknowns kept as unknown**. Modeled on the Deal Threads lead-profile schema.

> **Note:** the values below are an **illustrative example** for a plausible demo-form lead, to show the *shape* of the output. They are not a real lead. In a live run, every field is sourced from the actual visitor + enrichment.

```text
Deal Threads AI Lead Profile  (ILLUSTRATIVE — archetype example)

Priority: High (ICP 87/100)
Recommended next action: Call within 15 min; open with their operational
  bottleneck, not a generic product pitch.

Intent:
  Evaluating [product category] to fix a specific workflow problem they
  described in the demo request.

Qualification:
  - Pain: [decoded from free-text "what are you looking to solve?"]
  - Timeline: this_quarter            (source: enrichment/inferred — confirm on call)
  - Budget: likely / 30k_60k          (source: ai_inferred — UNKNOWN until confirmed)
  - Authority: VP / decision_owner    (source: ai_inferred from title + LinkedIn)
  - Stack: HubSpot + [adjacent tools]  (source: enrichment_provider, conf 0.81)

Company context:
  - ~101–250 employees (verified, source: enrichment — NOT the form dropdown)
  - Industry: B2B SaaS
  - Region: United States

Why they reached out:
  [one-line decoded use-case mapped to a relevant case study]

Trigger / why now:
  [recent funding / new sales leader / hiring AEs — source: enrichment]
  If none found: UNKNOWN — do not invent one.

Source:
  - Page: /request-a-demo
  - Campaign: [utm_campaign if present]

Visitor-provided facts:
  - [what they actually typed]
  - Company size bucket they selected
  - Region they selected

Enriched context:
  - Verified headcount band
  - Detected tech stack
  - Funding / leadership signals (if any)

Watchouts / Unknowns:
  - Budget unconfirmed
  - Exact decision process unknown
  - [anything enrichment could not find stays UNKNOWN]

Deal Threads profile ID: lead_[id]
```

**The standard:** the profile should be readable in under 30 seconds, separate **visitor-provided** from **enriched** from **inferred**, and say **"unknown" where it is unknown** — never dress a guess up as confidence.

---

## 4. The 3 questions I would ask differently

The goal is **not** a longer form. It is to replace low-signal friction with high-signal questions, and to let a conversational intake ask them so the form itself stays light.

**Question 1 — Replace the open "How can we help?" box with a structured need + a timeline.**
Instead of a blank box that stalls momentum and produces an un-parseable sentence, ask:
> "What's the main thing you're trying to fix or improve right now?" → with 3–5 tappable common answers + an "other" option, **followed by** "When are you hoping to have something in place?" (this quarter / this half / just researching).
*Why:* turns free-text into a routable `business_need` + a real `timeline`, the two fields the rep most needs and the form never structures.

**Question 2 — Ask for role-in-decision, not just job title.**
Title is unreliable. Ask:
> "Are you the one who'll own this decision, helping evaluate, or researching for the team?"
*Why:* gives a real `authority_signal` (decision_owner / influencer / researcher) so a senior buyer gets prioritized and a researcher gets nurtured — without a punitive title gate that scares off champions.

**Question 3 — Drop phone as a hard requirement; make it conditional.**
Phone-required is the single biggest abandonment lever. Instead:
> Capture work email first, then offer "Want a faster response? Add a number and we'll call." (optional)
*Why:* recovers the abandoners while still letting high-intent buyers opt into a call. You lose almost no real phone numbers and gain the leads who bounce at a required phone field.

---

## 5. The enrichment fields I would add behind the scenes

These are filled **automatically after submit** — the visitor never sees them — so the form stays short while the buyer profile gets rich. Each carries a **source + confidence**, and anything below the confidence floor **stays unknown**.

| Enrichment field | What it answers | Source / confidence rule |
| --- | --- | --- |
| Verified employee range | Real headcount vs the self-reported dropdown | `enrichment_provider`; show source |
| Revenue range | Rough company scale | Sync only if confidence ≥ 0.70 |
| Industry / vertical | Segmentation + case-study match | `enrichment_provider` |
| Tech stack | Competing/adjacent tools → displacement vs greenfield | `enrichment_provider`; semicolon list |
| Funding events | Recent raise = budget + urgency signal | Add if available; else UNKNOWN |
| Leadership / hiring signals | New sales leader, AE job posts = "why now" | `ai_inferred`; mark as signal, not fact |
| Seniority / authority | Decision-owner vs researcher | `ai_inferred` from title + LinkedIn |
| ICP fit score (0–100) | Single prioritization number | computed; with rationale list |
| Priority label | high / medium / low | computed from ICP + timeline |
| CRM dedup + ownership | Already-owned? In-territory? Duplicate? | `crm`; prevents collisions |
| Recommended next action | What the rep should literally do next | computed; one line |

**Rule that earns trust:** enrichment is **confidence-aware**. High confidence syncs as fact; medium shows its source and flags "needs review"; below the floor it is **not** written as fact. Unknown stays unknown.

---

## 6. The simplest install path

Built to remove technical fear — single script, works with the existing form and CRM, reversible.

1. **One script tag** on the page that hosts the demo form (or wrap the existing form). No site rebuild, no replatforming.
2. **Conversational intake** asks only the 3–6 high-value questions (Section 4) — the static form can stay as-is or get lightened.
3. **Enrichment runs behind the scenes** (Section 5) the moment the lead submits.
4. **Profile syncs to the CRM** — most likely **HubSpot** (dominant in SMB, the default for scale-ups running combined sales+marketing) or **Salesforce** (mid-market leader). *CRM-in-place is a safe assumption for this archetype — verified 2025 share data, not a claim about a specific company.* Standard Contact + Company objects, Deal optional, plus a readable **Note/Engagement** with the rep summary.
5. **Unknown-safe writes:** Deal Threads-owned fields (`deal_threads_*`) always update; customer-owned fields are fill-if-empty; owner, lifecycle stage, and original source are never overwritten. Idempotent + dedup'd.
6. **Reversible:** remove the script and the form reverts. Nothing is locked in.

**Effort for the buyer:** point us at the form + the CRM, confirm the 5–8 fields sales actually needs, define what "working" means. That is the scoping call.

---

## 7. Want this live on your form?

The form is technically working. It is just making sales build the buyer profile by hand on every inbound demo request.

If you want, send me your **real demo/contact form URL** and I'll run this same teardown against *your actual* fields — what it captures now, what sales still researches, and the buyer profile your CRM could receive before the callback.

**Want this live on your form?** The next step isn't a generic demo — it's a 15-minute install scoping call: your site/form, your CRM, the fields sales actually needs, and whether this is worth testing.

---

## Loom script (60–90 seconds)

> **Use:** record over the archetype form (or a screen-share of a typical demo form). Keep it calm, founder-to-founder, specific. ~150–210 words.

```text
Quick teardown — and a caveat: this isn't your form, it's the typical
"Request a Demo" form, because I'm showing the pattern.

Here's what a form like this captures: first and last name, work email,
phone, company, job title, company size, region, a "how can we help?" box,
and a consent checkbox.

That's enough to log the lead. It is not enough to prepare the rep.

Because here's what sales STILL has to go research after this submits:
the real company size, the person's actual authority — are they the buyer
or just researching — how urgent this is, what stack they're on, whether
they fit your ICP, and whether anything happened recently that explains
why they're looking now.

None of that is on the form. So a human spends ten to twenty minutes
digging it up. Per lead.

If this were a buyer-profile form, I'd ask three things differently —
a structured need plus a timeline, role-in-decision instead of just title,
and I'd make phone optional. Then I'd enrich the rest behind the scenes
and push a clean, rep-ready profile into your CRM, with unknowns marked
as unknown.

The form works. It's just making sales do the buyer-profile work by hand.

Want me to run this on your actual form? Send me the URL.
```

---

## Before / After carousel (raw form vs buyer profile)

> **Use:** anonymized LinkedIn/screenshot carousel, 6 slides. This is a Tier-2 proof asset. Everything is archetype-level; label slide 1 as typical pattern.

**Slide 1 — "Here's what a normal demo form gives sales"** *(typical pattern)*
Name · Work email · Phone · Company · Title · Company size · Region · "How can we help?" · Consent
→ *Enough to log the lead.*

**Slide 2 — "Here's what the rep actually does next"**
Opens LinkedIn → company site → CRM → Apollo/Clay/BuiltWith → funding & news searches.
→ *10–20 minutes. Per lead. (inferred)*

**Slide 3 — "The lead and the homework look identical in the CRM"**
A great buyer and a tire-kicker arrive as the same thin record.

**Slide 4 — "Here's the buyer profile the rep should get instead"**
Priority: High (ICP 87/100) · Authority: decision_owner · Timeline: this quarter · Stack: HubSpot + adjacent · Trigger: recent raise · Next action: call in 15 min, open with their bottleneck.

**Slide 5 — "Unknown stays unknown"**
Budget: unconfirmed · Decision process: unknown. *No guessing. No hallucinated confidence.*

**Slide 6 — "Same form. Better handoff."**
One script. Works in your CRM. Reversible.
→ **Want this on your form? Send the URL.**

---

## DM follow-up (drafted from the Week 1 DM library — "Delivering A Teardown")

```text
I recorded the teardown here: [link]

Short version:

A typical "Request a Demo" form captures name, work email, phone, company,
title, company size, region, a "how can we help?" box, and consent — enough
to log the lead, not enough to prepare the rep.

The biggest missing sales context is buying context: real authority,
urgency, stack, ICP fit, and a "why now" trigger — none of which the form
captures, so sales researches it by hand (~10–20 min/lead).

If I were turning this into a buyer-profile workflow, I'd add a structured
need + timeline, role-in-decision instead of just title, and make phone
optional — then enrich company size, stack, funding, and ICP fit behind the
scenes and push a rep-ready profile (with unknowns marked unknown) into your
CRM before callback.

This one's the generic pattern — want me to run it on your actual form?
Send the URL and I'll show what yours captures vs what sales still researches.

Worth mapping what the lightweight install would look like for your site
and CRM?
```

---

## Qualification verdict (Form URL Qualification Checklist)

Applying the Week 1 checklist. **Caveat:** this scores the *archetype*, not a real account — archetype = the **shape** of a high-fit buyer, not a sourcing instruction.

```text
[~] B2B company.                        YES — definitionally B2B SaaS.
[~] Has demo/contact-sales form.        YES — the "Request a Demo" form is exactly it.
[~] Deals are likely high value.        YES — demo-led motion skews $10K+ ACV;
                                              mid-market ~$40K (ACV verified; demo→deal
                                              linkage inferred).
[ ] Founder/GTM/sales/RevOps buyer engaged.  UNKNOWN — no real person; archetype has the
                                              buyer role (founder / demand-gen / RevOps) but
                                              none is engaged in proof mode.
[~] Sales follow-up matters.            YES — human-worked funnel; speed + context both matter.
[~] CRM exists or is likely.            YES — HubSpot/Salesforce near-certain (verified 2025
                                              share data, not company-specific).
[~] There is a real handoff problem.    YES — the 10–20 min/lead manual research pass is the
                                              core pain (inferred typical pattern).
[~] Not obviously low-ticket B2C.       YES — clears it; this is high-consideration B2B.
```

**Verdict: HIGH-FIT (as a fit template).**
On the checklist, the archetype is a textbook Deal Threads target — it satisfies every *structural* criterion. The only unchecked box is **"buyer engaged,"** which is unknowable in proof mode because there is no real person or company.

**Two non-negotiable caveats:**
1. High-fit here is **archetype-level** — it confirms the *buyer shape*. It is **not** "go sell to generic B2B SaaS."
2. The founder's validated beachhead is narrower: **compliance & security SERVICE firms** (SOC 2 / ISO 27001 auditors as the lead wedge, plus vCISO, pen-test, GRC consultancies, MSSPs), where the founder has insider-grade messaging. Generic B2B SaaS is the broad target the founder narrowed *away* from, and **marketing agencies were explicitly rejected** (too savvy/skeptical, "I'll build it myself"). Live prospecting should route through that beachhead via AI Ark search criteria — use `b2b-saas-demo` to **confirm** a real prospect is in-profile, not as a list to source from.

---

## Appendix — what would make this a REAL teardown

To convert this reference teardown into a company-specific one, re-run in **inbound mode with a `formUrl`** so we can verify:
- the actual visible fields (not the typical set),
- the real submit CTA wording,
- the real on-form qualification questions,
- the real CRM fingerprint (HubSpot vs Marketo vs Salesforce Web-to-Lead leave detectable traces in hidden field names / network calls; confirm via careers-page RevOps reqs and BuiltWith/Wappalyzer),
- a real "why now" trigger (recent funding, new sales/RevOps/demand-gen hire, AE/SDR job posts, funnel revamp, public lead-response complaints).

Until then: **mode = proof, everything inferred is labelled inferred, and unknown stays unknown.**
