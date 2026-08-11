# SmartLead Campaign Analysis — what the real numbers say

> Pulled live from the SmartLead API (2026-06-26) across all 13 completed CA campaigns — 6,582 leads. This is the ground truth that overrides earlier *modeled* assumptions in `../outbound-gtm-playbook.md` and `../90-day-gtm-game-plan.md`. Where this doc and those disagree, **this doc wins** — it's real data.

## The scoreboard (sorted by reply rate, A+B variants combined)

| Segment | Leads | Open % | Reply % | Replies | Interested | Verdict |
|---------|------:|-------:|--------:|--------:|-----------:|---------|
| **Summer camps** | 665 | 77.4 | **10.1** | 67 | 7 | 🏆 Proven winner, big sample |
| **Squash clubs** | 173 | (off) | **5.2** | 9 | 1 | ✅ Proven, CA home turf |
| Construction 3–11 FTE | 2,816 | (off) | 1.5 | 43 | 3 | Legacy, not the branded-store ICP |
| Yoga studios | 205 | 9.8 | 0.5 | 1 | 0 | ❌ Flopped (but see caveat) |
| Dance studios | 230 | 11.7 | 0.4 | 1 | 0 | ❌ Flopped |
| K-12 schools | 2,223 | 13.1 | 0.3 | 6 | 0 | ❌ Weak on a big sample |
| BJJ academies | 142 | 13.4 | 0.0 | 0 | 0 | ❌ Flopped |
| CrossFit boxes | 128 | 8.6 | 0.0 | 0 | 0 | ❌ Flopped |

*Open % is unreliable where tracking was off (squash/construction show 0% with replies = plain-text/pixel off). Reply % = replies ÷ unique leads.*

## Finding 1 — the boutique-fitness pivot flopped, but was never a fair test
The 90-day plan + playbook make **CrossFit the Phase 1 cold launch** ("mirrors camps, 7–12%"). Reality: CrossFit + BJJ + yoga + dance = ~705 leads at **~0.2% reply.** That kills the "proven mirror" assumption — **but the copy was sabotaged**, so it's not proof the segments are dead. See Finding 3.

## Finding 2 — the mockup wedge was NEVER used (in any of the 13)
The AI store-mockup first touch — the differentiator the entire offer is built on — appears in **zero** campaigns. Camps' step 2 only *offers* to send an example. So **camps hit 10.1% with the best weapon unused.** Implications: camps + the wedge could go higher, and the wedge is the untested lever that could rescue fitness (visual proof substituting for named-peer proof CA doesn't have yet).

## Finding 3 — copy autopsy: why winners won
Pulled the live sequences. The pattern is unambiguous:

| Lever | Winners (camps 10.1% / squash 5.2%) | Flops (fitness ~0.2%) |
|-------|--------------------------------------|------------------------|
| **Named social proof** | Real peers by name — "Driftwood, Crestwood, Camp Alvernia"; "Philadelphia Cricket Club, CitySquash, Monmouth… 10–18 yrs" | None — "gyms like yours" |
| **Subject line** | Curiosity/value | "free store for {{company}}" — spammy; fitness opens 8–18% vs camps **77%** (likely spam-foldered) |
| **Tone / CTA** | Confident, concrete mechanic, seasonal hook, one clear question | Hedgy — "just curious," "even something you think about" |
| **Signature** | "Maclaine Scher, Vice President, creativealternatives.com" | just "Maclaine" |
| **Offer framing** | Camps = web store ("families order directly"); Squash = core relationship ("Kenny picks up his phone, pay after delivery") | Generic "free store, earn a cut" |

**The single biggest lever: specific named-peer proof.** Fitness can't name peers yet because CA has no fitness logos — that's the real chicken-and-egg, and the mockup wedge is how you break it.

## Finding 4 — voice A/B (Maclaine vs Ryan) is still unresolved
Every A/B-split campaign (CrossFit, BJJ, yoga, dance, k12) flopped at ~0%, so there's **no clean read** on whether Maclaine's or Ryan's voice wins. Camps and squash (the winners) weren't split. Both winners used the full credible signature. **Re-test voice only on a segment that actually replies.**

## What to change (overrides the plan)
1. **Cold launch order = Camps → Squash** (proven), NOT CrossFit. Re-run camps timed to enrollment, this time **leading with the mockup**.
2. **Fitness = wedge test, not scale bet.** Re-run ONE fitness segment with: the mockup wedge + camps-grade copy (confident tone, real subject, named proof once 1–2 logos land). Flop again → then it's the segment.
3. **Run both offers:** web-store offer where there's a buy-direct audience (camps), relationship offer on CA's turf (squash).
4. **Fix the universals everywhere:** named-peer proof, non-spammy subjects, confident CTA, full signature.
5. **Mine the camps + squash replies** (`prospect-interaction-analyzer`) for the actual language that converted → rewrite all copy in it.

## Docs to reconcile
- `../outbound-gtm-playbook.md` §3 — its "validated launch order: CrossFit → BJJ → climbing" and "fitness modeled 7–12%" are **contradicted by this data**; update to Camps → Squash, fitness = wedge test.
- `../90-day-gtm-game-plan.md` — Phase 1/2 cold launch segment corrected to camps+squash (done).

*Source: SmartLead API, 13 COMPLETED campaigns, pulled 2026-06-26. Re-run the pull script anytime to refresh.*
</content>
