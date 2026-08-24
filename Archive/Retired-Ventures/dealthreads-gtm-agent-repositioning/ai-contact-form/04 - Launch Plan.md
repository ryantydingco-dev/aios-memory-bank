# Launch Plan — first paying clients for the AI Contact Form offer

> The concrete plan to land the first **8 clients = $20k/mo** on the AI contact form / buyer-profile builder (IdeaBrowser #7856, the PRIMARY Dealthreads offer per `17`). This is the *execution* doc — `17` is the ICP/GTM/build, this is the funnel, the hit-list, the activity targets, the channel mix, and what to build this week.
>
> Companion files: `17 - AI Contact Form — ICP, GTM, and Build.md` (the offer), `buyer_profile_enricher.py` (the engine, built + tested), `15` (the cold-email pattern, reskinned below), `14` (the funnel-math discipline).
>
> One rule above all (your archetype warning, `16`/`17`): **prove the whole thing on ONE client manually before you systematize anything.** The machine below is how you find the 8 — but the first install is hand-wired, watched, and small. Don't build the platform. Install the stack.

---

## 0) The number, and the shape of the bet

- **Target: 8 clients × $2,500/mo = $20,000/mo.** (40 = $1M ARR; that's later.)
- **The product is a done-for-you managed install, not a SaaS.** Off-the-shelf chat/smart-form widget + the enrichment engine you already built + push to the client's CRM. The rep opens a full buyer profile before the callback (async — minutes, not seconds; real-time in-chat enrichment is v2).
- **The wedge is the free contact-form teardown.** You fill out a prospect's own form, enrich that lead live, and show the gap: *"here's the name+email your form captured vs. the full buyer profile my system built from it."* The teardown IS the demo — the product run on them. Then: *"want this on your site?"* → install = close.
- **Honest framing throughout:** no guaranteed-revenue promises, mark every uncertain data point "unknown — verify," and a human reviews every draft before it sends. Honest data gaps are a feature — they prove the engine doesn't bullshit.

This is a **higher-price, fewer-logos, sharper-pain** path than the old recruiting subscription. 8 logos is a findable number. The whole plan is: build the teardown asset → point the outbound machine at the right 8-ish dozen buyers → let the teardown do the selling → install.

---

## 1) The prioritized hit-list (drift-refugees first)

Three concentric rings. **Work them in order.** Ring 1 is the beachhead — acute, timed, pre-educated, already shopping. Don't dilute Ring 1 effort by going wide too early.

### Ring 1 — Drift refugees + Qualified-priced-out (LEAD HERE) ⭐
Companies losing their conversational front door *right now*: Drift is shutting down in 2026; Qualified went enterprise-only post-Salesforce. They already believe in "replace the form with a conversation," they have budget allocated, and the pain is dated. This is the single best segment — every touch here is warm.

**The 12 verified targets (from the brief — send these FIRST):**

| # | Company | Bucket | The one-line gap (the teardown hook) |
|---|---|---|---|
| 1 | **CaptivateIQ** (captivateiq.com) | drift_refugee | Form hands the rep a name + email; my system hands them "~263-person, SF, ICONIQ/Accel/Sequoia-backed sales-tech co, sales-led inbound, RevOps-led buying committee" — from that one submission, before the callback. |
| 2 | **Ketch** (ketch.com) | drift_refugee | Demo form hands a rep "Ryan, a work email, a one-line interest note" — and throws away that it's a 5-figure-ACV privacy buyer at a named account before the rep has Googled a thing. |
| 3 | **Sendoso** (sendoso.com) | qualified_priced_out | Form hands a rep "Patty, work email, Sendoso" — and throws away that she's the SVP of Growth & Marketing who ran revenue at Postal, the exact buyer, walking in warm, before the rep even decides to call back. |
| 4 | **DNSFilter** (dnsfilter.com) | qualified_priced_out | Marketo form hands a rep a name + email — and throws away company size, the security stack they already run, the buyer-scale signals, and which of your execs should be on the call. |
| 5 | **Secureframe** (secureframe.com) | standard_icp | Form hands a name + email; the $20k-deal context — who this company is, headcount, framework footprint, who else needs to be on the call — gets re-discovered by hand on every inbound. |
| 6 | **Thoropass** (thoropass.com) | standard_icp | Form hands a name + email; the $50k+ context — size, funding stage, which framework deadline is driving the buy, who else signs off — left for the rep to dig out by hand. |
| 7 | **Procurify** (procurify.com) | standard_icp | Form hands a name + a company string — then makes the rep spend ~20 min rebuilding the ERP, the deal size, and the buyer before a single dial. We hand them the dossier first. |
| 8 | **Pondurance** (pondurance.com) | standard_icp | CRO runs a sales-led, often breach-urgent callback motion off a form that hands a name + email — then makes reps re-discover the account, vertical, compliance exposure, and who holds budget, one tab at a time. |
| 9 | **Ashby** (ashbyhq.com) | standard_icp | Demo form captures name, email, headcount band, current ATS — then the rep burns ~20 min rebuilding revenue, funding stage, who this person is, hiring volume, why-now, by hand before every callback. |
| 10 | **Revenova** (revenova.com) | standard_icp | Form tells the rep a name typed "Demo Request" — it can't tell them whether that's a 5-truck carrier or a $200M 3PL, the only thing that decides if the callback is worth it. |
| 11 | **Alvys** (alvys.com) | standard_icp | "Get Demo" form hands an AE a phone number + a one-word business type — then makes the rep rebuild fleet/MC size, current TMS, deal-size signal, and who signs, lead by lead. |
| 12 | **Tai Software** (tai-software.com) | standard_icp | Every "Book a Demo" fill tells the rep a broker exists — not whether it's a 3-seat startup or a 200-truck operation worth calling in the next 10 minutes. |

> These 12 are the **manual, founder-led tier** — each gets a hand-built teardown + a personal LinkedIn/Loom touch (Ring-1 quality, not volume). Send order: lead with the two `drift_refugee` + two `qualified_priced_out` (1–4) because the timing hook is sharpest, then the standard-ICP eight.

### Ring 2 — More drift-refugees + the sharp verticals (the outbound-machine fill)
Once the 12 are in motion, the machine (Section 5) finds the next ~80–120 like them:
- **More Drift / Qualified users** detected via BuiltWith/Wappalyzer (the technographic hunt — Section 5).
- **The sharp niches** (all need: mid-market, $10k+ ACV, sales-led, real inbound, thin RevOps): B2B SaaS (differentiate hard — over-pitched), **fintech, cybersecurity, HR-tech, logistics-software**, B2B prof-services with high-ticket inbound.

### Ring 3 — Broad mid-market B2B with a "Contact us / Book a demo / Request a quote" form
The long tail of the ICP. Only worked once Rings 1–2 are exhausted or while waiting on replies. Same qualify-hard discipline.

**Disqualify on sight (don't spend a touch):** B2C/e-commerce · <$5k ACV · no inbound form · pure self-serve/PLG with no reps · big enterprise with a real RevOps team (they DIY with Clay/6sense) · regulated/no-chat-allowed.

**The non-negotiable verification rule (`17`, HARD RULES):** every company you name in a teardown or an email must be a real, verifiable US/North-American mid-market B2B with a plausible inbound sales motion. If you can't verify it's real + fits, it doesn't go on the list. **A fake target destroys the pitch** — the whole wedge is "I did real research on YOU." Never fabricate funding/size/decision-makers; mark anything uncertain "unknown — verify."

---

## 2) The funnel (teardown → install)

```
Identify a fitting target (verified real + ICP)
        ↓
FREE CONTACT-FORM TEARDOWN  ← the wedge: fill out their own form, enrich that lead live,
        ↓                      produce the "what your form captured vs. what my system built" gap
Deliver the teardown (Loom + the HTML dossier page)  ← "yours whether or not we ever talk"
        ↓
"Want this live on your site?"  ← the teardown IS the demo; the ask is the install
        ↓
15-min install scoping call
        ↓
INSTALL (done-for-you): widget + enrichment engine + CRM push, wired for them
        ↓
$2,500/mo  (→ $3,500 +intel reports  →  $5,000 +ICP campaigns, later)
```

**The one job of every outbound touch:** get a *"yes, send me the teardown."* You do **not** pitch the install cold. The teardown earns the install. (Same shape as the Mandate-Radar give-first motion that's already proven in this workspace — `15`, the Melisa run — just repointed to a higher-value offer.)

**Why this converts:** the teardown is undeniable (it's their own form, their own data gap), personalized (real research on them), and it demos the product by using it on them. The async framing keeps the promise honest — *"your rep gets the full dossier before the callback,"* minutes not seconds.

**Conversion model (ESTIMATES — flagged; the first 2 weeks of real sends replace these with truth):**

```
8 clients
   ↑  ÷ install-close rate  (🟦 a teardown is a strong demo; warm Ring-1 ~30-40% of scoping calls → install; blended ~25-30%)
~28-32 install scoping calls held
   ↑  ÷ call-book rate  (🟦 a delivered teardown → "walk me through it" ~30-40%)
~80-90 teardowns delivered ("yes, send it")
   ↑  ÷ positive-reply rate  (🟦 give-first teardown offer, sharp + personalized ~20-30% say "send it"; higher in Ring 1)
~350-400 targets CONTACTED (LinkedIn accept+opener, or email opened+engaged)
   ↑  ÷ reach rate  (🟦 LinkedIn accept ~35% + email; blended reach ~40-45%)
~850-950 targets TOUCHED (connection requests + cold emails)
```

> Reality check: ~900 touches across two channels needs a **working list of ~350-450 fitting companies** (each touched on LinkedIn + email). The 12 verified targets seed it; the machine (Section 5) builds the rest. That's a findable universe — mid-market B2B with inbound forms numbers in the tens of thousands; you need a few hundred sharp-fit ones.
>
> ⚠️ This funnel is the planning model, not a promise. After ~2 weeks of real sends, recompute it against actual reply/book rates (that's the weekly loop, Section 4). If positive-reply runs low, the fix is **sharper targeting + better teardowns**, not more volume — that's the entire philosophy you're selling.

---

## 3) Daily / weekly activity targets (the scoreboard)

Reverse-math (Section 2) over a ~10-week push → the weekly engine:

| Weekly target | Number | How |
|---|---|---|
| **Targets touched** | **~90-100/wk** | ~45 LinkedIn connection requests (≈9/business day, safely under LI's limit) + ~50 cold emails |
| **"Yes, send the teardown" replies** | **~8-10/wk** | from the touches above |
| **Teardowns delivered** | **~8-10/wk** | the engine generates them; you personalize + record the Loom |
| **Install scoping calls held** | **~3-4/wk** | from delivered teardowns |
| **Installs closed** | **~1/wk** (building) | mostly later weeks, after the first manual proof |

### Daily rhythm (~2-2.5 hrs/day — the same cadence you'll run for clients)
- **45 min — LinkedIn:** ~9 personalized connection requests to the day's hit-list slice + follow-ups + 5-10 thoughtful comments on target buyers' posts (warm the cold before the DM). The teardown offer is the opener.
- **30 min — cold email:** load/monitor Smartlead, send the day's batch (~10/business day, ramping as domains warm).
- **30 min — deliver teardowns:** run `buyer_profile_enricher.py` on the day's "yes" replies → personalize the dossier + record the 3-5 min Loom. (Vertical-templated, not bespoke-from-scratch — Section 6.)
- **30 min — reply triage + calls:** respond to every reply fast; warm reply → push to a 15-min scoping call (calendar link). Hold the calls. **Don't sell the install over text** — book the call, walk the teardown, close there.
- **15 min — log the scoreboard:** touched / replies / teardowns / calls / installs into the tracker. Feeds the weekly loop.

### Weekly (Fri, ~45 min) — the loop, run on yourself
Review the week's numbers; identify what's landing (which ring, which hook, which teardown style); pick 3-5 experiments for next week. **Reuse the existing learning infrastructure** — the `gtm_learning_facts.py` + `log_outcome.py` + outcome-tracker pattern from the Oloxa engine already does deterministic weekly facts; point it at the teardown-campaign outcomes. (Don't rebuild it — it exists and runs.)

> The bottleneck won't be list size — it's **teardown quality + reply speed.** Protect the deliver-teardowns and triage blocks. And the classic founder trap (weeks 4-6): when scoping calls heat up, prospecting dies and week 7 is empty. Keep the daily touch rhythm no matter what's closing.

---

## 4) Channel mix

Three channels, run in parallel, each with a clear job. **The free teardown is the opener on all three.**

### A) LinkedIn (primary for the founder-led sell) — the 12 + Ring-2 named buyers
- **Target the person:** VP Sales / Head of Revenue / CRO / Head of Marketing / Head of Demand Gen / RevOps lead (founder at the smaller ones). The GTM leader who feels "leads go cold / reps waste ~17 hrs/week researching."
- **Motion:** comment on their post 2-3 days prior → personalized connection request (no pitch in the request) → on accept, a short opener tied to *their* form/company → the teardown offer → on "yes," deliver the Loom + dossier → 15-min scoping call. 2-3 touches then rest.
- This is where the **12 verified targets** and the sharpest Ring-2 buyers go — high-relevance, hand-built. The LinkedIn skills in this environment (`linkedin-post-writer`, `linkedin-comment-drafter`, `linkedin-engager-analytics`, `linkedin-profile-optimizer`) support the warming layer; fix the profile first so every DM lands on a credible page.

### B) Cold email — via the existing Smartlead infra (volume, Ring 2-3)
- **You already run this exact setup** (Smartlead + separate warmed domains) for Oloxa — `push_to_smartlead.py` / `smartlead_upload_csv.py` / `collect_smartlead.py` exist and work. Point it at the GTM-leader buyers with the teardown offer.
- **Reskin the proven `15` sequence** to the contact-form gap (draft below — Section 6). CTA is always *"want the teardown?"*, never "book a call" cold.
- **Deliverability discipline (your only asset):** warmed domains, ~10-30/day per domain ramping, signal-targeted not blasted. Post-Feb-2024 the 0.3% spam cap makes low-volume + relevance the *premium* play — which is exactly what you sell. Don't blast.
- ⚠️ **Domain lead time:** dedicated warmed domains take ~2-3 weeks. **Start warming this week** or email volume can't ramp on schedule. Until warm, run a careful low-volume trickle from a solid existing domain (and lead with LinkedIn).

### C) Drift-refugee hunting — via BuiltWith / Wappalyzer (the timing channel, highest-converting)
- **The play:** detect companies currently running Drift (and Qualified) on their site via BuiltWith / Wappalyzer technographics → filter to mid-market + ICP-fit → reach out: *"your conversational front door is shutting down this year — here's the successor, and here's a free teardown showing what your current form throws away."* Acute + timed + pre-sold.
- **This feeds Ring 1.** It's the single highest-intent source — they're losing a tool and shopping for a replacement *now*. Mine it continuously; every fitting hit is a near-term install candidate.
- **Build note:** a BuiltWith "websites using Drift" pull (or Wappalyzer lookup over a candidate list) → run each through `buyer_profile_enricher.py` for the ICP-fit read → the fitting ones drop into the LinkedIn + email queues. Verify each is real + fits before it gets a touch (HARD RULE).

> **Communities (light support, not a core channel):** RevOps Slack groups, r/MarketingAutomation, AI-automation FB groups, YouTube "what your contact form throws away" teardown content. Content warms the cold; it isn't the engine. 2-3 posts/week max — don't let it eat outbound time.

**Channel split, stated plainly:** LinkedIn + Loom = how *you* sell the install (founder-led, peer-to-peer). Cold email via Smartlead = volume top-of-funnel for the teardown offer. BuiltWith = how you *find* the warmest segment. The teardown is the single shared asset across all three.

---

## 5) The recruiting List A + detector = the OUTBOUND MACHINE (repointed)

This is the key reframe from `17`: **nothing built for the recruiting play is wasted — it becomes the machine that finds and reaches the GTM-leader buyers for THIS offer.**

- **The detector pattern** (`mandate_signal_detector.py` — funding + hiring signals via Firecrawl/free APIs, built + tested live) → **repointed** from "find recruiting-firm prospects" to "find mid-market B2B with inbound + buying signals." Funding round, exec-hiring (a posted VP Sales / Head of Revenue req = a sales-led company actively scaling its inbound motion), tech-stack signals → a queue of fitting target companies + the GTM-leader to contact.
- **List A muscle** (`List_A_recruiting_firms.csv` = 1,125 firms, `List_A_SEND_FIRST_tier_A.csv` = 237 — the proof you can assemble + ZeroBounce-validate a real list) → **the same sourcing-and-scoring workflow** now builds *List C*: the mid-market B2B GTM-leader list. (The recruiting list itself isn't the target list for this offer — recruiting firms *do* have inbound forms and are one valid vertical, but the asset that matters is the *machine that built the list*, repointed.)
- **The enrichment engine IS the product** (`buyer_profile_enricher.py`) — the same engine that does the teardown does the live product. Build the teardown = build the product core. One engine, two jobs.
- **The Smartlead infra** = how you send the teardown offer at volume (above).
- **The give-first/teardown wedge** = the proven Mandate-Radar pattern, repointed.

So the "machine" is: **detector finds fitting companies + the GTM-leader → List-A workflow scores + validates → BuiltWith flags the Drift-refugee subset → Smartlead + LinkedIn carry the teardown offer → the enrichment engine generates the teardown → the teardown closes the install.** You're not starting over; you're pointing the same GTM machine at a higher-value offer.

---

## 6) What to build / do THIS WEEK

> Anti-over-engineering reminder (your archetype, `16`/`17`): the goal this week is **one hand-wired teardown asset + the first real sends**, not a platform. Prove the outcome on ONE before systematizing. The engine is 80% built — this week is assembling the last 20% and turning on outreach.

**Build (in order):**
1. **The teardown HTML generator** — wrap `buyer_profile_enricher.py` output in a clean client-facing dossier page (like `mCubed_Client_Radar.html` already in this folder). Given a target domain, produce the "what your form captured vs. what my system built" gap page. *This is what the Loom walks through.* (The enricher already nails the data — tested live on Hightouch in ~25s with an honest "still unknown" list. This is the presentation layer.)
2. **Build the 12 teardowns** — run the engine on all 12 verified targets, generate the dossier pages, verify each company's data is real (HARD RULE — mark anything shaky "unknown — verify"). These are your first sends AND your sales collateral.
3. **Record the master teardown Loom** (template) — the 3-5 min screen-share: hook → "here's what your form throws away" → walk the dossier → the async framing ("your rep gets this before the callback") → soft ask ("want this on your site?"). Then per-target you swap the company + one tailored line — ~5 min each, not 60.
4. **Wire ONE end-to-end demo install** — pick an off-the-shelf chat/smart-form widget (`<script>`-tag embeddable), wire its submission → the enrichment engine → a test CRM (HubSpot most common). Prove form-submit → profile → CRM-note on ONE fake "client" (use a real company's public data). This is what you'll replicate per real client. **Don't build routing (v2). Don't build multi-tenant anything.**
5. **Reskin the `15` cold-email sequence** to the contact-form gap (draft below) + load Email 1 into Smartlead at low volume.
6. **Start warming dedicated domains** (3-wk clock — start today so email can ramp).
7. **Repoint the detector + List-A workflow** to produce the first ~50-80 Ring-2 GTM-leader targets (fintech / cybersecurity / HR-tech / logistics-software / B2B SaaS with inbound), and run the BuiltWith Drift-refugee pull for Ring-1 fill.

**Do (outreach starts this week — don't wait for "perfect"):**
8. **Send the 12 via LinkedIn** (founder-led, hand-built teardowns) — Ring 1 first (the 4 drift/qualified), then the standard-ICP 8.
9. **Pick ONE warm target from the 12 as the manual proof** — if they say yes to the install, hand-wire it, watch it work, measure form-submit → profile → rep-follow-up quality. **This is the single most important thing on the page.** One paying, happy install validates the whole offer and becomes the case study that makes every next sale easier.

### The cold-email sequence (reskinned from `15`, contact-form gap, give-first — DRAFT, human reviews before send)

> 4 touches over ~12 days. CTA is always *"want the teardown?"* Replace [brackets]. Send from a real human name. Async framing only — never promise real-time in-chat enrichment.

**Email 1 — the hook**
```
Subject: what your contact form throws away

[First name] — quick one, no pitch.

Someone fills out [Company]'s "[Book a demo / Contact us]" form and your rep gets a name and a work email. The stuff that actually decides the deal — company size, funding, the tech they run, who else needs to be on the call — your rep rebuilds by hand, ~20 min a lead, after the form's already gone cold.

I can show you exactly what your own form is throwing away. I'll fill it out, enrich that lead the way my system does, and send you a 5-min teardown: what your form captured vs. the full buyer profile a rep could've opened before calling back. Free, yours whether or not we ever talk.

Want me to send it over?

[Ryan]
```

**Email 2 — the proof teaser (+3 days)**
```
Subject: re: what your contact form throws away

[First name] — quick example of what I mean.

For a company like yours, that one form submission can become a full dossier before the rep dials: ~[size] headcount, [funding/stage], the [stack] they already run, and the two people who actually sign off. The rep opens that instead of a name and a Gmail.

I built one of these for [Company]. Want me to send it?
```

**Email 3 — the why (+4 days, new angle)**
```
Subject: the 20 minutes per lead

[First name] — no worries if the timing's off. The reason I build these:

Your reps spend the time between "form submitted" and "callback" rebuilding the buyer profile by hand — and the lead cools while they do. The data exists; it just isn't in front of them at the moment they call. I close that gap: the dossier is waiting before the callback, not Googled after.

Happy to send [Company]'s teardown — just say the word.
```

**Email 4 — the breakup (+5 days)**
```
Subject: last one from me

[First name] — I'll leave it here.

If "our form gives us a name and an email and that's it" ever starts costing you deals, I'm at this address. Either way, hope the back half of the year's a strong one.

[Ryan]
```

**On "yes, send it" → the conversion message**
```
Great — here it is. [link to their teardown dossier page]

I filled out your own form, then enriched that lead the way my system does. Left side = what your form captured. Right side = the full buyer profile your rep could've had before the callback (size, funding, stack, the people who sign off). Anything I couldn't verify, I marked "unknown — verify" rather than guess.

I built this one by hand. The live version runs on every inbound automatically — the rep opens the dossier before they call back. Easiest if I just walk you through it: grab 15 minutes? [calendar link]
```

---

## 7) Floor / Target / Stretch (honest timeline)

Cold start, no case study yet, solo, higher-price offer. Set the band so day-90 is honest, not demoralizing.

| | Clients | ~MRR | + setup cash | Verdict |
|---|---|---|---|---|
| **Floor** | **2-3 installs** | ~$5-7.5k | + setup ($1.5-2.5k each) | A real business exists. First case study in hand. The offer is validated cold. |
| **Target** | **4-5 installs** | ~$10-12.5k | + setup | Strong. Clear line to 8 = $20k as proof compounds and close rate climbs. |
| **Stretch** | **8 installs** | **$20k/mo** | + setup | The goal hit on time. Ring-1 timing + teardown converted + everything broke right. |

**Timeline read (honest):**
- **8 installs = $20k/mo in ~90 days, cold, solo, no case study, on a brand-new $2,500/mo offer** is a **stretch** — it needs the high end of every conversion AND the Drift-refugee timing to land hard. Treat $20k as the pace-setter, not the pass/fail line.
- **The first install is the gate.** Until one client is paying + happy, every number is a model. The realistic shape: **first paid install in ~3-5 weeks** (the manual proof), then close rate improves once you can say "here's it running for [client]." Most of the 8 land in the back half as proof accrues — don't panic at slow weeks 3-4.
- **Call it a win at Target (4-5).** Landing even 2-3 paid installs cold validates the entire offer and gives you the case studies that make installs 4-8 dramatically easier. A "2" here is not a failure — it's a real business with proof.
- **The Ring-1 timing window is the wildcard that could pull it forward:** Drift refugees are acute and shopping *now*. If the BuiltWith hunt + teardown converts that segment fast, the curve front-loads. That's the realistic path to Stretch.

**The biggest risks to name (so they don't ambush you):**
1. **Person-level enrichment is patchier than company-level** on free sources (the engine does companies well; a single inbound *person* needs email→identity resolution). **Test this before promising per-person data** — may need a cheap paid contact API. Lead with the company dossier (which is proven) and treat per-person as a bonus, marked "verify."
2. **Over-engineering** (your archetype) — the pull to build the multi-tenant SaaS / routing / automation before one client is paying. **Resist it.** v1 is a manual-ish managed install for ONE client. Prove the outcome, then systematize. The standalone product is an *earned later* move, not a now move.
3. **Domain warming lag** — start this week or email can't ramp; lean on LinkedIn + the 12 hand-built sends in the meantime.
4. **The estimates could be 2-3× off** — recompute the whole funnel after 2 weeks of real sends. That's what the weekly loop is for.

---

## TL;DR — the one-paragraph version
Lead with the 12 verified Drift-refugee / ICP targets via hand-built free teardowns (fill their form, enrich live, show the gap), LinkedIn + Loom founder-led. The recruiting detector + List-A workflow + Smartlead infra become the outbound machine that finds and reaches the next ~80-120 GTM-leader buyers (BuiltWith flags the warmest Drift-refugee subset). The teardown is the demo; the install ($2,500/mo) is the close. ~90-100 touches/wk → ~8-10 teardowns/wk → ~3-4 scoping calls/wk → ~1 install/wk building. This week: build the teardown HTML generator + the 12 teardowns + master Loom, wire ONE end-to-end demo install, reskin the email sequence, start warming domains. **Prove it on ONE client manually before systematizing anything.** Floor 2-3 / Target 4-5 / Stretch 8 = $20k in ~90 days — call it a win at Target.
