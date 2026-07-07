# 07 — Buying & Paying Signals (for our own ICP: boutique search firms)

> Ryan's move: before building the sample, define the signals that tell us WHICH search firms to hit and WHEN — so the offer lands on the right firm at the right moment. This is us **applying our own GTM engine to our own GTM** — dogfooding. Mirrors the Oloxa signal taxonomy structure (`AI GTM Engine/Signals/Signal Taxonomy.md`) so the existing battlecard workflow can score search firms with minimal change.
> ⚠️ These are **designed heuristics**, not researched facts. They're starting hypotheses to validate through the weekly loop (which signal actually predicts a "yes"). Confidence flagged per signal. Don't treat the scoring weights as proven.

---

## The two signal layers (don't conflate them)

There are **two** engines running, each with its own signals:

| | **Layer 1 — THEIR client signals** | **Layer 2 — OUR signals on the firm** (THIS doc) |
|---|---|---|
| Whose pipeline | The recruiter's (companies that need to hire an exec) | Ours (search firms that should hire us) |
| Signals | Company HIRING / FUNDING / DEPARTURE / EXPANSION | The firm's BUYING + PAYING signals (below) |
| Goes into | The free **Mandate Radar** we give them (`06`) | **Our** cold outreach targeting + timing |
| Purpose | Demonstrate the engine on their market | Pick + time who we pitch |

**The recursion (this is the whole strategic point):** our Layer-2 outreach *demonstrates* the exact capability Layer-1 delivers. "I noticed [Layer-2 signal] at your firm" proves we can find signals → which is precisely what they'd be paying us to do on their clients. **The medium is the proof.** A generic "hope you're well" DM would actively *disprove* the product. So signal-triggered outreach isn't optional polish here — it's the demo.

---

## BUYING signals — do they NEED client-side BD help, now? (intent/pain)

Ranked strongest → weakest. "Where" = how we actually detect it on the channels Ryan has (LinkedIn + AI Arc).

| Signal | What it looks like | Where to detect | Strength | The outreach hook it unlocks |
|---|---|---|---|---|
| **BD-HIRE** ⭐ | Firm posts a "Business Development / Client Partner / New Business / Growth" role (NOT a recruiter role) | LinkedIn Jobs, company page, AI Arc job-signal | **Strongest.** They've decided client-acquisition is worth real money and are about to spend $10k+/mo on it | "Saw you're hiring a BD lead — before you carry that cost, worth seeing what a system does first?" |
| **WENT-INDEPENDENT** ⭐ | MP recently launched the firm / left a big search firm to go solo (last 0–12 mo) | LinkedIn profile change, "excited to announce," company founded date | **Strong.** Zero BD infrastructure, building from nothing, hungry, fast solo decision | "Going out on your own means you're the whole BD engine now. That's the part I build." |
| **REFERRAL-PAIN** | MP posts/comments about slow market, "tough year," referral dependence, "need to diversify pipeline" | LinkedIn posts/comments (manual read) | **Strong** (when explicit) — names the pain in their own words | Quote it back: "You mentioned [their words] — that's exactly the gap I work on." |
| **CRAFT-RICH/BD-POOR** | Constant candidate/placement content, but **nothing** about how they win new client companies | LinkedIn post history (manual read) | Medium-strong — the classic "great at craft, bad at selling" profile | "You post placements constantly — but who's filling the *client* side while you deliver?" |
| **CONTRACTION** | Flat/declining headcount; "quiet quarter" tone; clients pulling back | Sales Nav headcount-growth filter, AI Arc | Medium — segment-wide in 2025, so weak alone; strong combined with another | Ride the macro: "clients used to come to you; that flipped this year." |
| **CHANNEL-FRUSTRATION** | Posts that outbound/LinkedIn "isn't working," tried an SDR/agency that failed | LinkedIn posts (manual read) | Medium — pre-qualified pain, but may be burned/skeptical | "Most outbound for search firms fails because it's volume. Here's the opposite." |
| **CAPACITY-OPEN** | "Taking on new searches / open to new mandates / have capacity" posts | LinkedIn posts | Medium — explicit demand, but could be routine marketing | Direct: "You mentioned capacity — want a few live mandates in [vertical] to fill it?" |
| **MACRO (baseline)** | The 2025 staffing contraction itself (the whole segment) | `01c` research | Weak alone — applies to everyone, so it's table-stakes context, not a trigger | The why-now frame, used when no firm-specific signal exists |

---

## PAYING signals — can they AND will they afford ~$2–5k/mo? (budget/willingness)

The filter that kills wrong targets even when buying-intent is high. "Willing" matters as much as "able" — a firm that already *spends* on growth is the best paying signal of all.

| Signal | What it looks like | Where to detect | Strength | Why it predicts payment |
|---|---|---|---|---|
| **ALREADY-SPENDS-ON-GROWTH** ⭐ | Already employs a marketer/BD person, runs ads, sponsors events, has a content/SEO presence | LinkedIn team page, ads, website | **Strongest.** They've *already decided* client-acquisition is worth paying for — you're a better line item, not a new category | — |
| **RETAINED MODEL** ⭐ | Charges retained/upfront fees (vs pure contingency) | Website services page, "retained search" language | **Strong.** Upfront cash, healthier margins, values process over volume | Retained firms have predictable cash + respect paying for process |
| **HIGH-COMP PLACEMENTS** | Places VP/C-suite/Director roles (≥ ~$150k comp → ~$45k+ fees) | Website case studies, placement posts, vertical | **Strong.** One mandate dwarfs the retainer → ROI is obvious | The CAC math only works above this fee floor |
| **ESTABLISHED (3+ yrs, 5–50 ppl)** | Multiple employees/partners, multi-year history, real office/brand | LinkedIn company, website, founded date | Medium-strong | Past survival mode; has overhead budget; not about to fold |
| **NICHE/SPECIALIZED** | Defensible vertical (e.g. "fintech exec search," "med-device leadership") | Positioning, website | Medium | Premium fees, defensible margin → cash to reinvest |
| **TOOL/BRAND INVESTMENT** | Paid ATS, polished website, real branding, awards | Website, BuiltWith-type tells, LinkedIn | Medium | Proven willingness to invest in the business |
| **MULTI-PARTNER** | 2+ named partners/principals | Team page | Medium | Revenue base big enough to support partners = can fund a retainer |

---

## The 2×2 — combine buying × paying to decide WHO and WHEN

This is the actual targeting decision. A firm is only PRIME when **both** are high.

```
                 HIGH PAYING                  LOW PAYING
            ┌───────────────────────┬───────────────────────┐
 HIGH       │  🔥 PRIME — GO NOW     │  ⚠️ CAN'T AFFORD      │
 BUYING     │  free build + pitch    │  Starter-only / nurture│
            │  this week             │  or skip               │
            ├───────────────────────┼───────────────────────┤
 LOW        │  🌱 NURTURE            │  ❌ IGNORE            │
 BUYING     │  content + stay close; │  not a target          │
            │  no pain yet           │                        │
            └───────────────────────┴───────────────────────┘
```

- **🔥 Prime (high buy + high pay):** the free Mandate Radar build + full sequence. Where the ~5 weekly builds go.
- **⚠️ High buy / low pay:** real pain but can't fund Growth. Offer Starter, or nurture — don't burn a free build. (The desperate contingency solo lives here — tempting, wrong.)
- **🌱 Low buy / high pay:** the fat retained firm with no urgency yet. Content + light touch; they convert when a buying signal fires later.
- **❌ Low/low:** not a target.

---

## Scoring rubric (mirrors the Oloxa Lead Scoring Rubric so the battlecard workflow can run it)

Per firm, score **two axes 0–10**, then place in the 2×2:

**Buying score (0–10):** BD-HIRE +4 · WENT-INDEPENDENT +3 · REFERRAL-PAIN +3 · CRAFT-RICH/BD-POOR +2 · CONTRACTION +1 · CHANNEL-FRUSTRATION +2 · CAPACITY-OPEN +2 (cap 10).
**Paying score (0–10):** ALREADY-SPENDS-ON-GROWTH +4 · RETAINED +3 · HIGH-COMP +3 · ESTABLISHED +2 · NICHE +1 · TOOL/BRAND +1 · MULTI-PARTNER +1 (cap 10).

- **Both ≥6 → Tier A (prime).** Buying ≥6, paying <6 → Tier B-cantafford. Buying <6, paying ≥6 → Tier C-nurture. Both <6 → drop.
- **The opener is keyed to the firm's HIGHEST buying signal** — that's the "I noticed X" hook that proves the engine.

---

## Detection reality (be honest about what's bulk vs manual)

- **Bulk-filterable (Sales Nav / AI Arc, scales):** BD-HIRE (job posts), WENT-INDEPENDENT (tenure/founded date), CONTRACTION (headcount growth), ESTABLISHED/MULTI-PARTNER/RETAINED/NICHE (firmographics + website). → use these to build the *list*.
- **Manual-read (requires reading their posts, doesn't scale — but highest-converting):** REFERRAL-PAIN, CRAFT-RICH/BD-POOR, CHANNEL-FRUSTRATION, CAPACITY-OPEN, ALREADY-SPENDS-ON-GROWTH. → use these to *prioritize Tier A and write the opener.*

**Implication:** bulk-filter to a fit list (paying signals + BD-HIRE), then manually read the top candidates' recent posts to find the buying hook. That manual read is low-volume by design — which is fine, because the model is ~5 builds/week, not 500 blasts. The constraint and the method agree.

---

## How this plugs into the system
- **Feeds `05` sourcing:** the bulk paying-signal filters become the AI Arc / Sales Nav query; the manual buying-read becomes the Tier-A prioritization pass.
- **Feeds the cold outreach (`06` + next):** the firm's top buying signal = the first line of the DM/Loom ("I noticed you just [signal]"). Signal → opener is now deterministic.
- **Feeds the weekly loop:** track which signal preceded each positive reply → learn which signal actually predicts a "yes" → re-weight the scores. (This is the loop improving our *own* GTM — the dogfood proving itself.)

---

## Honest flags
- These weights are **designed, not validated.** First ~10–15 sends will show which signals actually correlate with replies; re-weight then. Don't over-trust the +4/+3/+2 until real data exists.
- **BD-HIRE is double-edged:** a firm hiring a BD person may feel they've *solved* it. Frame as "before you carry that cost" — position as the cheaper/faster alternative, not a duplicate.
- **REFERRAL-PAIN / CHANNEL-FRUSTRATION firms may be burned** by a prior agency → lead harder on the human-approved, anti-spray, give-first angle.
- **Paying signals are inference from public tells** — a polished website ≠ confirmed budget. Treat as probability, confirm on the call.

---

## Next (Ryan's stated sequence)
Signals done → **draft the signal-triggered cold outreach + Loom scripts**, where each variant is keyed to a specific buying signal (BD-HIRE opener, went-independent opener, referral-pain opener, etc.) so the "I noticed X" proof lands every time. That's the next file.
