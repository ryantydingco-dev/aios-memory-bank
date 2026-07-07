# 17 — AI Contact Form: ICP, GTM, and the Build

> Ryan's call (2026-06-01): lead with IdeaBrowser #7856 (AI contact form that pre-builds the buyer profile) as the PRIMARY Dealthreads offer — stronger than the recruiting play, faster to money. Logo math: $2,500/mo × **8 clients = $20k/mo**; the $1M ARR target = 40 clients. This doc = the full ICP + GTM + build, grounded in the IdeaBrowser research (scores: opportunity 9, pain 9, timing 9, GTM 9, founder-fit 9, ACP 8).
>
> Supersedes `16` (which had this as an upsell). Decision: it's the lead offer now. The recruiting engine/List A become a *secondary* play / the outbound channel to sell THIS.

---

## 1) THE ICP

### Primary ICP (start here)
**Mid-market B2B companies, ~$10M–$200M revenue, that sell high-ACV deals ($10k+) through a sales team, get real inbound website traffic, and have NO/THIN RevOps.**

The qualifying combination (need ALL):
- **High deal value** ($10k+ ACV) → one closed deal pays for the service many times → ROI is obvious.
- **Real inbound** (a "Contact us / Book a demo / Request a quote" form that gets fills) → there's a form to replace. No inbound = no fit.
- **Sales-led** (reps call leads back) → the enriched-profile-before-callback is the value. Pure self-serve/PLG = weaker fit.
- **Thin RevOps** (no dedicated ops/analyst team) → they can't build this themselves → they buy it done-for-you. This is the wedge (per the research's #1 underserved segment).
- **Buyer = GTM leader** (VP Sales / Head of Revenue / CRO / Head of Marketing / RevOps lead / founder at smaller ones). The person who feels "leads go cold / reps waste time researching."

### The sharpest niches to hit FIRST (highest pain × ROI, per the research)
1. **B2B SaaS** (the obvious one — but over-pitched; differentiate hard).
2. **Fintech / cybersecurity / HR-tech / logistics-software** — high ACV, website-driven funnels, the research names these as the high-value verticals.
3. ⭐ **Drift refugees + Qualified-priced-out** — the timing play. **Drift is shutting down 2026; Qualified went enterprise-only post-Salesforce.** Companies actively losing their conversational front-door RIGHT NOW = warm, urgent, pre-educated buyers who already believe in "replace the form with a conversation." This is the single best beachhead — they have budget, the pain is acute, and they're shopping. **Lead here.**
4. **B2B professional-services / agencies with high-ticket inbound** (adjacent, easy to reason about).

### Disqualifiers (don't waste touches)
- B2C / e-commerce (different motion). · Low-ACV (<$5k deals — math doesn't clear $2.5k/mo). · No inbound traffic (nothing to replace). · Pure self-serve with no reps. · Big enterprise with a RevOps team (they DIY with Clay/6sense). · Regulated where chat-on-site is restricted.

### The buyer's pain, in their words (lead with these)
- "Leads come in, my rep calls back hours later, and by then they've gone cold or talked to a competitor."
- "My reps spend [research says ~17 hrs/week] Googling companies instead of selling."
- "Half my inbound is junk and I can't tell the $50k deal from the tire-kicker until someone's wasted an hour."
- "My contact form gives me a name and a Gmail address. That's it."

---

## 2) GO-TO-MARKET

### The offer (from the research, validated pricing)
- **Core: $2,500/mo** — AI conversation widget + real-time enrichment + CRM push + routing. (Setup fee $1.5–2.5k — Dealthreads norm; the research implies done-for-you install.)
- **Premium: $3,500/mo** — adds monthly intelligence reports (ICP-gap, speed-to-lead analytics).
- **Top: $5,000/mo** — adds ICP-gap marketing campaigns.
- **Anchor on $2,500.** Frame vs. cost: "replaces a ~$120k sales coordinator + a ~$160k marketing analyst on your wishlist."

### The wedge that beats every competitor: the FREE TEARDOWN (your Mandate-Radar move, repurposed)
You already proved the give-first wedge works. Same play, new target:
> **"Send me your contact form URL. I'll record a 5-min Loom showing you exactly what data your form throws away on every submission — and what a rep *could* have known before calling back. Free."**

You literally fill out their own form, then enrich that lead live on camera (company size, funding, decision-makers, tech stack) and show the gap between "what your form captured" vs "what my system captured." **It's the contact-form version of the depth dashboard — undeniable, personalized, and it demos the product by using it on them.** This is the lead magnet.

### Channels (GTM scored 9 — real signal here)
- **LinkedIn (primary):** target VP Sales / RevOps / Head of Demand Gen at the ICP. The free-teardown Loom is the opener. (Your existing List-A muscle + the detector, repointed to find these people.)
- **Cold email:** same teardown offer. You have the Smartlead infra.
- **Drift-refugee hunting (the timing channel):** find companies currently using Drift (BuiltWith/Wappalyzer detect it) → "your conversational tool is shutting down this year — here's the successor, and here's a free teardown." Acute + timed + pre-sold. **Highest-converting segment.**
- **Communities (per research):** RevOps Slack groups, r/MarketingAutomation, AI-automation FB groups (27k+ members), YouTube tutorials. Content: "what your contact form throws away" teardowns.

### The funnel
```
Free contact-form teardown (Loom)  →  "want this live on your site?"  →  install (done-for-you)  →  $2,500/mo
```
Same shape as everything you've built: give value first (the teardown), the install is the close.

### GTM honesty
- The research flags **buyer resistance to "chat-only" front doors** — some buyers/personas prefer a fast form. **Fix: hybrid.** Don't force chat-only; offer "smart form that enriches" OR "conversational widget" — let them keep a form if they want, you still enrich behind it. Sell the *enrichment outcome*, not the chat UI.
- ROI articulation is the #1 sales challenge → lead with the teardown (shows the gap in their own data) + the salary-replacement frame.

---

## 3) THE BUILD (the critical reframe that makes "today" real)

### ⚠️ Read this first — the build decision that determines everything
There are TWO ways to build this, and they are wildly different in effort:

**(A) Productized SaaS** — multi-tenant widget, dashboard, billing, self-serve. ❌ This is the `technical_founder_needed` second-startup. Months of build. **NOT today. NOT you (yet).**

**(B) Done-for-you install per client** — you wire EXISTING tools together for each client, manually. ✅ This is buildable, demoable TODAY, and matches your profile (you're the operator/installer, not the SaaS engineer). **This is the build.**

**The whole strategy depends on choosing (B).** You are not building a product; you are assembling a *stack* you install for each client and run as a managed service. The "product" is your playbook + the assembled stack.

### The (B) stack — what to wire together
1. **The conversational/smart-capture layer (the widget):**
   - Off-the-shelf AI chat widget that takes a `<script>` tag + a custom prompt. Options to evaluate today: an embeddable LLM chat tool (e.g. a Chatbase-style widget, Voiceflow, or a simple custom widget). Captures intent / budget / timeline / company.
   - v1 can even be a **smart form** (form → on submit, enrich + route) if a client resists chat. Lower friction to build + sell.
2. **The enrichment layer (YOUR existing engine — this is the moat + why it's "today"):**
   - The signal detector / enrichment stack you built THIS WEEK already turns a company name/domain into: size, funding, hiring signals, tech stack. Repoint it: input = the company from the form submission, output = the buyer profile.
   - Add an email→company resolver (free-ish: domain from email → company data). You have Firecrawl + the detector pattern.
3. **The CRM push:** webhook/Zapier/Make → drop the enriched profile into the client's CRM (HubSpot most common) as a note/fields on the contact. Rep opens a full dossier.
4. **Routing (v2, skip for v1):** Chili-Piper-style assignment. Don't build it day 1.

### What to actually build TODAY (the MVP proof)
**Build the teardown/enrichment engine first — it's the lead magnet AND the core of the product, and you 80% have it.**

1. **Take the detector and add a "single-lead enrichment" mode:** input a company domain (or a name+email), output the full buyer-profile dossier (size, funding, decision-makers, tech stack, ICP-fit guess). ~You have the pieces; wire them into one clean output.
2. **Wrap it in a teardown generator:** given a target company's domain, produce the "here's what your form throws away" dossier as a clean HTML page (like the mCubed dashboard) — this is what the free-teardown Loom walks through.
3. **THEN the widget:** pick an off-the-shelf chat/form widget, wire its submission → your enrichment → a test CRM. Prove the end-to-end on ONE fake "client" (use a real company's public data).

> The genius: **the free teardown and the paid product share the same engine.** Building the teardown IS building the product's core. You demo with the exact thing you sell.

### Build sequence (today → first client)
- **Today:** single-lead enrichment mode on the detector + the teardown HTML generator. Test it on 3 real mid-market companies (fill out their forms or use their domains). Confirm the output is "holy shit" quality.
- **This week:** pick the widget tool; wire one end-to-end demo (widget → enrich → CRM). Record the master teardown-offer Loom.
- **Next:** find 10 Drift-refugee / mid-market targets, send the free teardown, book installs.

### Honest build risks
- **Enrichment data quality at the individual-lead level** is harder than company-level (the detector does companies well; a single inbound person needs email→identity resolution, which is patchier on free sources). May need a cheap paid API (Apollo/Clearbit-style) for contact-level — budget for it. Test this TODAY before promising it.
- **Latency** — for a *live chat* enrichment, speed matters; for a "rep gets the dossier before they call back" flow, you have minutes, not seconds. **Lead with the async version** (enrich after submit, before callback) — it's easier and dodges the latency problem entirely. Real-time chat enrichment = v2.
- **Don't over-engineer** (your archetype warning): v1 is a manual-ish managed install for ONE client, not an automated platform. Prove the outcome, then systematize.

---

## The logo math (why this is worth leading with)
- **8 clients × $2,500 = $20,000/mo.** (vs ~16 recruiting clients.)
- **40 clients = $1M ARR** (the research's stated traction milestone).
- Higher price + sharper pain + ROI-obvious + a real timing window (Drift/Qualified) = a faster path to the goal than the $500 recruiting subscription.

## How the recruiting work plugs in (nothing wasted)
- **List A + the detector** = your outbound machine to FIND and reach these GTM-leader buyers. The recruiting ICP becomes one vertical; the engine that found recruiting firms now finds mid-market SaaS/fintech GTM leaders.
- **The Smartlead infra** = how you send the free-teardown offer at volume.
- **The give-first/teardown wedge** = proven pattern, repointed.
- So this isn't starting over — it's pointing the same GTM machine at a higher-value offer.

## Next decisions / actions
1. **Confirm: this is now the LEAD offer** (recruiting → secondary). [Ryan: yes]
2. **Build today:** single-lead enrichment mode + teardown generator (I can start now).
3. **Test the contact-level data quality** before promising it (the real risk).
4. Pick the widget tool. Find 10 Drift-refugee targets.
