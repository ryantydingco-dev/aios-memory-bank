# Weekly GTM Review — 2026-05-31

> Produced by the `oloxa-gtm-learning-loop` workflow from REAL facts computed deterministically by `gtm_learning_facts.py` (no invented data). Facts reconciled against the `Oloxa_Battlecards_2026-05-31.csv` artifact of record.

## ⚠️ Honesty gate — read first
**No outreach has been sent this cycle.** reply-monitor = 0 campaigns / 0 replies; outcome tracker empty. So **zero claims can be made about what works in market** — not reply rate, not signal→meeting conversion, not US-vs-UK win rate, not which opener lands. The North Star (booked qualified meetings) has **no data point yet**.

Everything below is a verdict on the **lead-sourcing/triage pipeline** (could a card be re-verified, does it fit ICP) — explicitly **not** on buyer behavior. First real outcomes require sending the 6 SEND-ready cards and logging replies.

## Headline
Pre-launch triage dry run, n=20, zero outcomes: **the engine is sound but the lead pipeline has a verifiability problem, not a targeting problem.** Every number here measures data quality, not buyer demand.

## Activity
- Leads researched (battlecards built): **20**
- Send-ready (SEND): **6** · Needs review/reframe (REVIEW): **12** · Hold (HOLD): **2** → 30% send-ready
- Leads contacted: **0** · Replies: **0** · Meetings booked: **0**
- QA layer rewrote **12 of 20 cards (60%)** for brand/voice/claim issues

## Signal Performance (verifiability + fit, NOT market outcome)
| Signal | SEND | REVIEW | HOLD | Within-type SEND rate | Taxonomy rank (relevance) |
|---|---|---|---|---|---|
| CLOSING | 4 | 7 | 0 | 36% (4/11) | #3 |
| HIRING | 1 | 1 | 2 | 25% (1/4) | #2 |
| PAIN | 0 | 3 | 0 | 0% (0/3) | **#1** |
| VOLUME | 1 | 1 | 0 | 50% (1/2) | #4 |

## Segment Performance (verifiability + fit, NOT market outcome)
| Segment | SEND | REVIEW | HOLD | Send rate |
|---|---|---|---|---|
| UK | 2 | 8 | 1 | 18% (2/11) |
| US | 4 | 4 | 1 | 44% (4/9) |

Recency of evidence: unverifiable 5 · older 2 · 1–3 months 9 · 0–30 days 4 → **7 of 20 (35%) recency-compromised before any fit judgment.**

## What we learned (PRE-LAUNCH, all PROVISIONAL — n=20, 0 outcomes)
1. **The decisive axis was RE-VERIFIABILITY of a scraped instance, not RELEVANCE of a signal type.** The bulk of REVIEW/HOLD were gated LinkedIn (HTTP 999) or model-mismatch — not bad targeting. **Fix the pipeline, not the taxonomy.**
2. **PAIN (relevance #1) produced 0 of 6 SEND — but 3/3 went to REVIEW, 0 to HOLD.** That's a *sourcing/verification gap* (pain is stated in gated/un-public posts), not evidence PAIN is weak. The highest-value signal is the one we're currently worst at evidencing.
3. **CLOSING produced 4 of 6 SEND but "won" mostly on abundance** — 55% of the batch (11/20); its 36% within-type rate is barely above the 30% average. CLOSING is the most *re-verifiable and abundant* (public deal posts) → pragmatic fuel for batch one, not proven superiority.
4. **US out-performed UK on send-readiness on both metrics (US 44% vs UK 18%)** — opposite of the ICP "UK cleaner" assumption. Likely a UK-side verifiability artifact (more gated profiles this batch). **Flag the ICP assumption UNVALIDATED; don't overturn it.**
5. **HIRING had the worst hard-fail rate (2 of 4 = 50% HOLD)** — both HOLDs. One was a scrape *misattribution* (signal belonged to a different firm); one was a lender-side model mismatch. HIRING needs an entity-resolution + buyer-side check.
6. **QA rewrote 60% of cards** — high enough that the most common fixes (over-claiming, voice drift) should be absorbed into the *generation* prompt, not just caught at QA.

## Objections Heard
None — nothing sent. (Predicted objections are captured per-card in the battlecards file for prep.)

## Scoring / System Changes (provisional — see GTM Brain patches)
- Add **"re-verifiable from a public, non-gated source"** as a Lead Scoring Rubric input, weighted ahead of signal type.
- Add an **entity-resolution + broker-vs-lender check** to the HIRING path.
- Give **PAIN a dedicated non-gated evidencing method** (Trustpilot/Google reviews, public job-post language, blogs/forums).

## Next Week's Experiments (to generate REAL data)
1. **Send all 6 SEND-ready cards** (4 CLOSING, 1 HIRING, 1 VOLUME), log every reply. *The only way to get a first North-Star data point.* Target: 6 sent, replies logged by next review.
2. **Re-source the 3 PAIN leads** with non-gated evidence; see how many become SEND-ready. Target: convert ≥1 of 3.
3. **US-only vs UK-only mini-batch** (next 20 each, same scrape method/day) to test whether US>UK is real or a gating artifact. Target: clean rate comparison, n≥20/side.
4. **Add entity-resolution + broker/lender check to HIRING** and re-run the 4 HIRING leads. Target: 0 misattribution HOLDs.
5. **Fold the 3 most common QA rewrites into the generation prompt;** measure next-batch QA rewrite rate. Target: <40% (from 60%).

## Monday Launch Order
Fire the 6 SEND-ready first, led by the 4 CLOSING (most re-verifiable) — **Robert Meunier, Grant McIntyre, Michael Bucaro, Matthew Beal** — then VOLUME (**Linzi Crellin**) and HIRING (**Chris Solinski**). **Log every reply before sourcing net-new.**

## Action Items
**Ryan**
- [ ] Send your SEND-ready cards (Grant McIntyre, Michael Bucaro) + log in `Oloxa_Outcome_Tracker.csv`
- [ ] Re-source the 3 PAIN leads (Matt Wood, Dillon Freeman, Jeff Singleton) via non-gated evidence

**Sway**
- [ ] Send your SEND-ready cards (Robert Meunier, Matthew Beal, Linzi Crellin, Chris Solinski) + log replies
- [ ] Hold Don O'Henly + Jody Hill; reframe Justin Bunch / Chaston Montgomery as lender-ops (not broker)

**Hermes/AIOS**
- [ ] Apply the 5 provisional GTM Brain patches (done this cycle — see `Strategy/Oloxa GTM Brain.md`)
- [ ] Next batch: add re-verifiability scoring + HIRING entity-resolution to the workflow
- [ ] Re-run this loop next week — with outcomes logged, it produces REAL market learning

## Method note
An earlier draft of the inputs mis-stated UK/US and CLOSING counts (a hand-transcription slip). Caught, traced to the CSV as single source of truth, corrected, and the workflow re-run on canonical numbers before this review was written. Going forward facts are computed by `gtm_learning_facts.py` only — never hand-typed.
