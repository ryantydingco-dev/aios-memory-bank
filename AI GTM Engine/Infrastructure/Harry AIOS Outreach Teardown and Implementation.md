# Harry (AAA) AIOS-Outreach Teardown → Implementation Into Our Cold Outreach

> Source: AAA community session w/ Harry, transcript `AIOS052926transcriptwharry.vtt` (2026-05-29). Analyzed 2026-05-31.
> Bottom line: Harry's system is **the same engine we've already built** for Oloxa + Dealthreads — independent confirmation from Ryan's own mentor. 3 real things to steal, 1 honest tension to resolve.

---

## 🔥 THE BURIED LEDE (from the live demo + Q&A — most important part)

Harry's **own live campaign demo** was selling to **recruiting firms** — *the exact ICP our market research independently landed on* (`01c`). And the parts that validate our decisions are uncanny:

1. **His winning angle = our angle, verbatim.** AIOS told him: lead with *"plenty of talent but not enough clients,"* target *"recruitment owners with 5–50 consultants,"* and pitch *"replace your BD function, not augment it"* — because they're stuck in the *"BD vs delivery trade-off / feast-and-famine cycle"* and *"can't justify a business-development rep."* That is **word-for-word** the pain + persona + hook in our `01c` ICP doc and the `06` Grand Slam offer. Two independent analyses converged on the same answer → high confidence we're right.

2. **His #1 CTA = our Mandate Radar, proven.** Harry's data showed **10 of 12 positive replies came from ONE CTA: "building a custom list of 50 companies showing hiring and fundraising signals for you right now."** A free, signal-flagged list of target companies. **That is exactly the "Mandate Radar" free-pipeline offer in `06 - Cold Outreach Grand Slam Offer.md`** — and Harry has live reply data proving it's the highest-converting move. This is the strongest external validation we've gotten on anything this session. Build the Mandate Radar; his numbers say it works.

3. **Human-in-the-loop confirmed.** His system creates the campaign in **DRAFT — "it won't auto-start without me checking over it, just from a safety perspective."** Same guardrail we've held all session.

4. **Apollo vs Clay (→ our AI Arc decision):** Harry uses **Apollo for scale/cost** (2,000+ contacts) and **Clay only for specific signals Apollo can't see** (e.g. geographic-expansion / new-office openings). Mechanism: Claude builds **Apollo URL-string filters** from the ICP and pulls via API. *Implication for us:* AI Arc is Ryan's Apollo-equivalent for scale; for **signal-rich** targeting (the exec-hiring/funding signals the Mandate Radar needs) we may still want a Clay-type signal source. Worth confirming what AI Arc can/can't surface on signals.

5. **Daily inbox-health report** auto-generated across all sending accounts (health scores, reconnect flags) — at thousands of inboxes he can't do it manually. A nice-to-have once volume justifies it.

---

## TL;DR — the big realization
Harry teaches a **pure-Claude, skill-file-driven cold-outreach OS**: 5 skills + a weekly self-improving loop, no n8n/Make/Zapier (just API keys in `.env`). It is structurally identical to the Oloxa battlecard engine + weekly learning loop + the Dealthreads GTM Experiment Engine we've spent this session building. **We are not behind — we're slightly ahead on the IP, slightly behind on two pieces of plumbing.** This is "borrow before you build" (Ryan's own principle): take Harry's actual skill files, don't re-author what he's giving away.

---

## Harry's system, distilled

**The 5 core skills** (each a markdown skill file plugged into Claude Code):
1. **Angle Generator** — input ICP → 10 angles, each = pain point + desired outcome + hook.
2. **Lead Scraper** — Apollo API key in `.env` → pulls a lead list by ICP filters.
3. **Personalization Writer** — per-lead one-line icebreaker from their LinkedIn/website.
4. **Campaign Analyzer** — reads the sending tool's data (Instantly) via API → tells you the bottleneck ("open rate fine, reply low → fix body copy"; "subject lines too long").
5. **Campaign Cloner** — takes a winning campaign → clones with variations to split-test.

**The loop (weekly):** generate angles → build list → personalize → push to Instantly → analyze → clone winners → kill losers → repeat.

**Operating principles he stresses:**
- **Data first.** Can't see what works, fix what's broken, or scale what converts without the funnel numbers. Use a sending tool (Instantly/HeyReach/Smartlead) so capture is automatic.
- **The 7-stage funnel:** leads → sent → opened → replied → positive replies → meetings → closed. Find the biggest drop-off; that's your next move.
- **Signal/intent angles** beat generic blasts. His example: selling voice agents → low replies → re-target **companies hiring a receptionist** (intent signal) → pitch the agent instead of the hire. (Same CLOSING/HIRING/VOLUME/PAIN logic we use.)
- **Test relentlessly:** his agency runs 30+ clients, **2 new angles + 2 new campaigns per client per week.**
- **Pour fuel on winners:** shift sending capacity (email accounts) onto the best campaign.
- **Volume math:** ~2,000 prospects → ~4% reply → ~30% interested → ~30% call. 20–30 emails/inbox/day; 30–50 inboxes for 1,000/day.

---

## Side-by-side: Harry's 5 skills vs. what we already have

| Harry's skill | Our equivalent | Verdict |
|---|---|---|
| Angle Generator | Signal taxonomy + per-lead angle in the **battlecard workflow** (CLOSING/HIRING/VOLUME/PAIN) | ✅ **We're ahead** — ours is signal-*anchored* with evidence, not generic pain/outcome/hook. Could extract as a standalone skill for parity. |
| Lead Scraper (Apollo) | **AI Arc** exports (Ryan's source; not Apollo) | ⚠️ **Gap** — we do this semi-manually. We have *no Claude skill* that pulls AI Arc by ICP. Harry's pattern, repointed at AI Arc, closes it. |
| Personalization Writer (1 line) | **Battlecard workflow** (verified signal → multi-channel copy → brand-QA) | ✅ **We're well ahead** — but see "depth vs volume" tension below; his lighter version is *correct for high-volume email*. |
| Campaign Analyzer (reads Instantly API) | **Weekly learning loop** (`gtm_learning_facts.py` + `oloxa-gtm-learning-loop`) | ✅ **We're ahead on rigor** (deterministic facts, adversarial verify) ⚠️ **behind on plumbing** — ours reads a *manual* tracker; his reads the sending tool *automatically* via API. |
| Campaign Cloner | "Pour fuel on winners" lives in our weekly *review* as advice, not an automated skill | ⚠️ **Gap** — we don't have a clone-the-winner skill. |

**Net:** our *intelligence layer* (verification, signal scoring, deterministic learning) is more sophisticated than Harry's. His *plumbing* (auto lead-pull skill, sending-tool API data capture, clone skill) is more complete. Merge the two.

---

## The 3 things to STEAL

1. **Harry's actual skill-file zip.** He shared a downloadable zip of the 5 cold-outbound skills. **Grab it → I'll diff it against our battlecard/learning workflow and merge the best of both.** Highest-leverage action; don't rebuild what's free.
2. **Sending-tool API data capture (close the manual-logging gap).** Our Oloxa loop depends on a human running `log_outcome.py`. Harry's Campaign Analyzer reads Instantly/HeyReach automatically. **If we run email volume → wire Instantly's API; if we run LinkedIn → wire HeyReach's API.** Then the learning loop feeds itself with zero manual logging.
3. **The two missing skills + the cadence.** Build an **AI-Arc Lead-Pull skill** and a **Clone-Winner skill**, and adopt his **2 angles + 2 campaigns/week** discipline per ICP. That completes our 5-skill parity with a sharper intelligence layer underneath.

---

## ⚠️ The one honest tension: Harry's VOLUME game vs. our RELEVANCE wedge

Harry's system is optimized for **cold email at managed volume** — 1,000/day across 30–50 inboxes, 4% reply, win by testing volume. **That partially conflicts with two things we decided this session:**
- The Dealthreads positioning I built ("low-volume, high-relevance, spray-and-pray is dead").
- The deliverability research (Google/Yahoo 0.3% spam cap punishes volume blasting).

**How to reconcile (don't just pick one):**
- Harry isn't reckless — 20–30/inbox/day across many inboxes keeps each domain *under* the spam threshold. It's **managed** volume, not a blast from one domain. So it's compatible with the deliverability rules *if* the infra is right.
- But it IS a different bet than the premium relevance wedge. **The resolution is channel-by-depth, not one-or-the-other:**

| Channel | Volume | Personalization depth | Use for |
|---|---|---|---|
| **LinkedIn + Loom** (our wedge) | Low (~10–20 CR/day) | **Deep** — full battlecard/research card | The high-trust first touch; recruiting-firm MPs (LinkedIn-native) |
| **Cold email** (Harry's system) | Managed-high (Instantly, many inboxes) | **Light** — one-line icebreaker | Scale layer / second channel once a winning angle is proven |

> The genuinely useful lesson: **match personalization depth to channel volume.** You can't deep-research 1,000 email leads — Harry's one-line icebreaker is *correct* there. You can deep-research 15 LinkedIn targets — our battlecard is *correct* there. Run both lanes; don't force one philosophy across both.

For the **recruiting-firm ICP** specifically: lead with LinkedIn+Loom (recruiters live on LinkedIn; the wedge is sharp), and stand up Harry's managed-email lane as the **parallel scale channel** with lighter icebreakers, once the LinkedIn motion proves an angle.

---

## Implementation plan (applies to BOTH Oloxa outreach + Dealthreads selling)

**This week**
1. **Download Harry's skill zip** → drop into a scratch Claude project → I diff vs. our workflow and write a one-page "keep ours / take his / merge" map.
2. **Pick the data-capture path:** Instantly (email) and/or HeyReach (LinkedIn). Get the API key into `.env`. This is the single highest-ROI plumbing fix — it makes the learning loop self-feeding.

**Next**
3. **Build the 2 gap skills:** AI-Arc Lead-Pull (repoint Harry's Apollo skill at AI Arc) + Clone-Winner.
4. **Standardize on the 5-skill shape** (Angle → Lead-Pull → Personalize → Analyze → Clone) as the canonical "Outreach OS," with *our* battlecard as the Personalize skill and *our* learning loop as the Analyze skill.
5. **Adopt the cadence:** 2 new angles + 2 new campaigns/week, per active ICP (Oloxa brokers; Dealthreads recruiting firms).

**This is also the Dealthreads product.** Harry's 5-skill OS = literally what Dealthreads sells to recruiting firms. His transcript doubles as a delivery blueprint and a credibility proof ("the system my own mentor's agency runs 30+ clients on").

---

## What NOT to do
- ❌ Don't throw out the relevance/LinkedIn-Loom wedge to chase Harry's email-volume game. Run both as separate-depth lanes.
- ❌ Don't rebuild the 5 skills from scratch — diff Harry's zip first.
- ❌ Don't switch to Apollo — Ryan uses AI Arc; just adopt the *pattern*.
- ❌ Don't start volume email without proper inbox infra (separate domains, warmup, 20–30/inbox/day) — that's how the 0.3% spam cap bites.
- ❌ Don't let "auto data capture" replace the human-approval step on *sends* — Harry automates *analysis*, not unreviewed blasting. Our human-in-the-loop on outbound stays.

## Next action
Send me Harry's skill zip (or the link) and I'll diff it against our battlecard + learning-loop workflow and produce the merge map. That's the fastest way to turn this transcript into a working upgrade.
