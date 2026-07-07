# Oloxa — Example Implementation of the GTM Experiment Engine

> **TL;DR:** This is one *worked example* of the GTM Experiment Engine (see file 02) deployed on a real niche — Oloxa, our client #0. It exists to show prospects what the artifacts actually look like, not to define the offer. **The offer is NOT Oloxa-specific and NOT real-estate / commercial-finance-specific.** Only the context pack and account universe change per client; the loop is identical. Read the right-hand "transfers as" notes throughout — that's the part that sells.

---

## Why This File Exists (and the honest caveat)

Prospects don't buy a pitch deck. They buy because they saw the *real machine* run on a real company and thought "I want that pointed at my pipeline."

Oloxa is **client #0 — in progress.** There is no closed-revenue case study yet. So this file does one job: show the **shape of the work** — the context pack, the scored account universe, a live LinkedIn + Loom experiment, a weekly review, and a before/after. These are the artifacts we put in front of a first pilot.

**Critique up front — what this file is NOT:**
- Not proof of revenue. It's proof of *system*. Don't let it drift into implied results.
- Not "the Oloxa playbook for sale." Commercial finance is a sample vertical. If a prospect hears "you only do finance," we've mispositioned.
- Not a template to copy verbatim onto the next client. The *structure* transfers; the *content* gets rebuilt from their context pack.

> Rule of thumb when showing this: narrate it as **"here's the engine — here's it running on my own company — here's where your name goes instead of Oloxa's."**

---

## What Oloxa Is (one paragraph, so the example lands)

Oloxa turns messy borrower documents into lender-ready packages for commercial finance brokers. The buyer is a broker drowning in incomplete files; the value is faster, cleaner submissions and fewer lender kickbacks. We run Oloxa's GTM the same way we'd run a client's: signal-scored leads, LinkedIn-first + Loom + structured follow-up, research cards, weekly learning.

---

## 1. Sample Customer Context Pack

> **What this is:** The deliverable we build in Step 1 of the loop. It's the "brain" every message and score is derived from. Built once at setup, updated as we learn.
>
> **Transfers as:** every client gets this exact pack structure — only the contents change. This is the reusable schema.

| Field | Oloxa (example) | *Transfers as (any client)* |
|-------|-----------------|------------------------------|
| **Offer in one line** | Turn messy borrower docs into lender-ready packages for commercial finance brokers. | The thing they sell, stated as an outcome. |
| **Core outcome bought** | Faster, cleaner lender submissions; fewer kickbacks; more deals funded per month. | The result the buyer actually pays for. |
| **Who feels the pain** | Commercial mortgage / equipment / SBA brokers handling multiple live files. | The exact role drowning in the problem. |
| **Trigger / "why now"** | Deal volume spikes; a lender just bounced a package; a new hire can't keep up. | The event that makes the pain acute *this week*. |
| **Pain hypothesis** | "Every incomplete file costs days and risks the lender relationship." | The belief we test in messaging. |
| **Status quo / competition** | Doing it manually, an overloaded processor, or a generic VA. | What they do today instead of buying. |
| **Proof we can point to** | Sample lender-ready package; before/after a real (anonymized) file. | Their strongest concrete artifact, not adjectives. |
| **Disqualifiers** | Residential-only brokers; solo brokers doing <2 deals/mo; lenders themselves. | Who to *not* waste touches on. |
| **Voice / tone** | Operator-to-operator, no fluff, respects their time. | The client's brand tone for approved messages. |
| **Banned claims** | No "guaranteed approvals," no volume promises. | The client's compliance / honesty guardrails. |

**Distilled positioning (one block, the kind we'd put at the top of the messaging system):**

> For commercial finance brokers who lose days to incomplete borrower files, Oloxa packages every deal to lender-ready standard — so you submit faster, get fewer kickbacks, and fund more. Not a VA, not software you babysit. Done-for-you packaging.

*Transfers as:* same five-part shape — **for [role] who [pain], [client] delivers [outcome] — so [benefit]. Not [status quo A], not [status quo B]. [Category].**

---

## 2. Filled Account-Universe Schema (sample rows)

> **What this is:** The Step 2 deliverable — a built + enriched, **scored** account list. Not a stale CSV. Each row carries a signal, evidence, a fit score, and a routing decision a human can approve.
>
> **Transfers as:** identical columns for every client. Only the *signal definitions* are re-tuned to the client's "why now." Oloxa's signals are CLOSING / HIRING / VOLUME / PAIN — a SaaS client's might be FUNDING / HIRING / TOOL-SWITCH / EXPANSION.

**Signal legend (Oloxa):** `CLOSING` = recent/visible deal activity · `HIRING` = adding processing/ops headcount · `VOLUME` = multi-deal shop · `PAIN` = public signal of submission/file pain.

| Account | Contact / Role | Signal | Evidence (where we saw it) | Fit (1-5) | Signal score | Tier | Route |
|---|---|---|---|---|---|---|---|
| Harbor Commercial Capital | J. Reyes — Principal Broker | VOLUME + CLOSING | 4 "deal funded" LinkedIn posts in 30d; 6-person shop | 5 | 9/10 | A | LinkedIn + Loom now |
| Ridgeway Equipment Finance | M. Okafor — Founder | HIRING | Job post: "loan processor / file coordinator" | 4 | 8/10 | A | LinkedIn + Loom now |
| Summit SBA Advisors | D. Cho — Managing Partner | PAIN | Post complaining about lender doc requirements | 4 | 7/10 | B | Connection + value DM |
| Beltline Capital Partners | (no named contact yet) | VOLUME | Site lists 5 brokers; no individual identified | 3 | 5/10 | C | Enrich before touch |
| Coastal Bridge Lending | R. Patel — Broker | CLOSING | One funded-deal post, solo operator | 2 | 4/10 | D | Hold — likely DQ (solo) |

**How to read the scoring (this is the part prospects care about):**
- **Fit** = firmographic match to the context pack (right type, right size, not a disqualifier).
- **Signal score** = strength + freshness of the "why now."
- **Tier A** (high fit + hot signal) gets the full LinkedIn + Loom treatment first. **Tier C/D** get enriched or held — we don't waste a personalized Loom on a likely DQ.
- Row 5 shows the **honest part**: we *down-rank and hold*, we don't pad the list to look busy. Low-volume, high-relevance is the whole moat (file 02 — Feb-2024 deliverability reality).

*Transfers as:* every client's universe is scored on the **same two axes (fit × signal)** and tiered the same way. The routing logic is portable; only the signal definitions get re-tuned.

---

## 3. One Concrete LinkedIn + Loom Campaign Experiment

> **What this is:** A single Step 3-5 experiment, fully specified the way it'd appear in the experiment log. This is the wedge motion (file 03): LinkedIn DM + connection from a real founder profile, paired with a personalized 60-90s Loom, then structured follow-up.
>
> **Transfers as:** this exact experiment *card structure* is how we run every test for every client. Segment, angle, message, hypothesis, metric — same skeleton.

**Experiment ID:** OLX-W1-A
**Segment:** Tier A — multi-deal commercial brokers showing VOLUME + CLOSING signals (5-10 person shops actively posting funded deals).
**Angle (the bet):** Lead with the *kickback / resubmission* cost, not the "messy docs" feature. Hypothesis is that funded-deal posters are in throughput mode and feel resubmission delay most acutely right now.

**Connection note (≤300 chars, no pitch):**
> Hey J — saw Harbor's run of funded deals lately, congrats, that's a busy desk. I work with commercial brokers on the file/packaging side. Not selling anything here, just like connecting with people actually closing. Would be good to follow your stuff.

**Loom (60-90s) — sent after connect / as the value follow-up, structure:**
- **Hook (first 5s, on-screen + spoken):** "J — 30 seconds, specific to Harbor, then I'll get out of your way." *(names them, time-boxes, no generic intro)*
- **Body (40-60s):** Show a real anonymized before/after — a messy file vs. an Oloxa lender-ready package. "When you're funding this many deals, the thing that quietly eats days is the back-and-forth with the lender on incomplete files. Here's what we hand back instead."
- **Close (10s, low-pressure):** "If resubmissions are a tax you're paying right now, worth a 15-min chat. If not, no worries — keep crushing it."

**Follow-up sequence (structured, 2-3 touches, human-approved):**

| Touch | Timing | Channel | Content |
|---|---|---|---|
| T1 | Day 0 | LinkedIn | Connection note (above) |
| T2 | Day 2-3 (on accept) | LinkedIn | Personalized Loom + one-line context |
| T3 | Day 6-7 | LinkedIn | One specific value-add (e.g., "the 3 doc gaps lenders bounce most") — no ask |
| T4 (optional) | Day 10-12 | LinkedIn or email | Soft re-offer of the 15-min chat; then stop |

**Hypothesis (falsifiable):** A kickback-cost angle to active funded-deal posters earns a *higher reply AND higher conversation-quality score* than a generic "messy docs" angle, because the pain is acute during high-throughput periods.

**Success metric (primary = quality, not vanity):**
- **Primary:** ≥2 *quality* conversations from ~25 Tier-A touches (quality = ICP-fit broker engages on the actual pain, not just "thanks"). Conversation-quality scored 1-3 per reply.
- **Secondary:** Reply rate (context only — cold reply benchmarks are 1-5%, we don't optimize for the vanity number).
- **Kill / iterate rule:** If 0 quality conversations after 25 touches, the *angle* is wrong before the *channel* is — swap the angle next week, hold the segment.

*Transfers as:* same card for any client — only `segment / angle / message / signal` change. The hypothesis-and-kill-rule discipline is the product. We're selling **faster learning**, and this card is what learning looks like.

---

## 4. Weekly Learning-Report Template (with filled example)

> **What this is:** The Step 5-6 deliverable — the weekly review + next-week plan. This is the single most important recurring artifact: it's the thing the founder reads that proves the engine is *getting smarter*, not just *staying busy*.
>
> **Transfers as:** identical template for every client. It's the heartbeat of the retainer.

### Template (blank)

```
# Weekly GTM Review — [Client] — Week [N] ([date range])

## 1. Activity (what ran)
- Touches sent: __  | Tier A: __  Tier B: __
- Experiments live: __ (IDs)
- Looms recorded / sent: __

## 2. Results (what came back)
- Replies: __  | Quality conversations (score 2-3): __
- Calls booked: __  | Reply rate: __% (context only)
- Best-performing angle: ____  | Worst: ____

## 3. What we learned (the actual signal)
- [Insight 1 — tie to a specific experiment]
- [Insight 2 — segment or angle behavior]
- [Surprise / disconfirmed assumption]

## 4. Next week's plan (the experiments)
- Keep: ____  | Kill: ____  | New experiment: ____
- List / segment changes: ____

## 5. Founder asks (human-in-the-loop)
- Approvals needed: ____
- Looms for founder to record: ____
- Calls to run: ____
```

### Filled example — Oloxa, Week 1

```
# Weekly GTM Review — Oloxa — Week 1 (May 19-23)

## 1. Activity (what ran)
- Touches sent: 31  | Tier A: 22  Tier B: 9
- Experiments live: 2 (OLX-W1-A kickback angle, OLX-W1-B "new-hire" angle)
- Looms recorded / sent: 14

## 2. Results (what came back)
- Replies: 6  | Quality conversations (score 2-3): 3
- Calls booked: 1  | Reply rate: ~19% (small n — context only, not a promise)
- Best-performing angle: OLX-W1-A (kickback cost)
- Worst: OLX-W1-B (new-hire angle — felt presumptuous, 1 reply, 0 quality)

## 3. What we learned (the actual signal)
- Kickback-cost angle clearly out-pulled the new-hire angle on the SAME segment.
  The pain that lands is "lender bounced my file," not "you just hired."
- VOLUME + CLOSING posters reply warm; PAIN-signal brokers replied but were
  earlier-stage / smaller — lower quality scores. Signal strength ≠ deal readiness.
- Loom completion mattered: replies clustered among people who watched past ~30s.
  The named, time-boxed hook is doing work.

## 4. Next week's plan (the experiments)
- Keep: OLX-W1-A (kickback angle) — scale to next 20 Tier-A.
- Kill: OLX-W1-B (new-hire angle).
- New experiment OLX-W2-C: test "lender relationship risk" framing vs kickback-cost
  on the same Tier-A segment (angle-on-angle test).
- List change: down-weight pure PAIN-signal-only accounts; require fit ≥4.

## 5. Founder asks (human-in-the-loop)
- Approve OLX-W2-C copy (draft attached).
- Record 6 new Looms for next Tier-A batch (script unchanged, names swapped).
- Run the 1 booked call (Harbor) Thu.
```

**Why this artifact closes pilots:** it's small, honest (n is tiny, no inflated claims), and visibly *improving* — a killed angle, a sharpened segment, a next test. That's the product: a loop that compounds, not a dashboard.

*Transfers as:* swap "Oloxa" for the client and the experiment IDs for theirs — the report is unchanged. This is what every client gets every week.

---

## 5. Before / After — Oloxa's GTM

> **What this is:** The narrative arc a prospect maps onto their own company. Honest version — "after" is the *operating state* of the engine, not a revenue claim.

| Dimension | Before (Oloxa, no engine) | After (engine running) | *Transfers as* |
|---|---|---|---|
| **Outbound rhythm** | Sporadic — a few DMs when slow, silence when busy delivering | Weekly, consistent, runs whether or not founder is heads-down | Every founder-led B2B has this gap |
| **List** | None / a vague idea of "brokers" | Scored account universe, tiered by fit × signal | Stale CSV → live scored universe |
| **Targeting** | Spray whoever comes to mind | Signal-scored (CLOSING/HIRING/VOLUME/PAIN), Tier-A first | Re-tune signals per client |
| **Messaging** | One generic pitch, reused | Tested angles; kickback-cost beat new-hire in W1 | Angle-testing is portable |
| **Channel** | Random LinkedIn DMs | LinkedIn + personalized Loom + structured follow-up | The wedge motion (file 03) |
| **Measurement** | "Did anyone reply?" | Reply rate **and** conversation-quality score, weekly | The durable edge (file 02) |
| **Learning** | None — same approach forever | Documented weekly: keep / kill / new | This *is* the product |
| **Founder load** | GTM is chaos in the founder's head | Founder approves, records Looms, takes calls — system carries the rest | The relief every ICP buyer wants |

**The honest "after" line:** Oloxa went from *guessing, sporadically* to *a measured weekly loop that gets sharper every week.* We are not claiming a revenue number — we're claiming a **better operating system for pipeline**, which is exactly what file 02 says we sell.

---

## How To Use This File (sales)

- **Show, don't tell.** Walk a prospect through Sections 1-4 live. Let them see the research card and the weekly review.
- **Always say the transfer line:** "This ran on my own company. Your name goes where Oloxa's is. The loop is identical — only your context pack and account universe change."
- **Stay honest:** Oloxa is client #0, in progress. No revenue claims. The proof is the *system + artifacts + founder-run credibility* (file 02 pilot terms).
- **Position the vertical correctly:** commercial finance is *a* worked example, not the offer. If they hear "finance specialist," reframe immediately.

---

## What NOT To Do With This Example (critique)

- **Don't turn it into a finance case study.** It's a *format demo*. The minute it reads as "Dealthreads = commercial-finance outbound," the repositioning (file 01) breaks.
- **Don't imply results.** "3 quality conversations in week 1, small n" is the honest ceiling. No extrapolation to revenue.
- **Don't reuse Oloxa's angles on the next client.** The kickback-cost angle is Oloxa's. The *method* of finding it is what transfers.
- **Don't over-polish into a deck.** It should feel like a real operating artifact a founder could've pulled from the engine this morning — that's why it's credible.

---

*Oloxa is the worked example, not the offer. The offer is the loop (file 02), pointed at the ICP (file 03). Swap the context pack and the account universe, and this exact machine runs on any B2B niche.*
