# 00 — Current Page Teardown (dealthreads.io)

> Task 1 of the website-repositioning lane. Honest analysis of the **live** site before any rewrite. Source: dealthreads.io fetched 2026-05-31, cross-checked against local authoring docs. Goal: what to **keep**, what to **change**, and where the page blocks the GTM-agent repositioning.

---

## ⚠️ First finding: there are two Dealthread positionings on record

Before teardown, a conflict to resolve — this is a source-of-truth problem, not a copy nitpick:

| | **Live site (dealthreads.io)** | **Local doc (`AIOS/Dealthread_Landing_Page.md`, v3)** |
|---|---|---|
| Promise | "Give your producers the team they need. Without doing the hiring." | "Stop typing the same client's name into four different tools." |
| Model | **Deploy a 7-agent team** (managed service) | **Founding 50 self-serve SaaS**, $99/mo prove-it |
| Buyer | Brokerages (5+) / teams (3+) | Solo producing agents (15+ deals/yr) |
| Frame | Operations team, human-monitored | Workflow connector (Zapier-but-reliable) |

**These are two different businesses.** The live site is the managed-agent-team model; the local doc is an older self-serve-SaaS model. Pick one as canonical before touching anything — the GTM repositioning should branch from the **live managed-team model** (it's the one that maps to the GTM Experiment Engine offer). Flagging so a rewrite doesn't accidentally merge two incompatible offers.

*(Rest of this teardown analyzes the LIVE site.)*

---

## Current ICP

**Brokerages (5+ producers) and teams (3+ producers)** in residential real estate, plus "real-estate-adjacent operations" (TC firms, property management). Buyer = broker-owner / team lead. The page speaks fluent real estate: FUB, Dotloop, Zillow, Realtor.com, MLS, lockbox codes, disclosure packets, settlement filing, eXp/Compass/KW.

**Verdict:** sharp and credible — but *hermetically real-estate-sealed.* There is not one sentence a non-real-estate B2B buyer could read and feel addressed.

## Current promise

> "Your producers are doing the work of five people. Dealthread gives them the team anyway — without hiring humans you'd pay."

It's a **capacity/retention** promise (give producers leverage so they don't burn out or flee to a competitor brokerage). The metric is **hours saved** (12–18 hrs/week, time-per-workflow), not dollars made.

## Current offer structure

A genuinely well-built **"deploy a team, not software"** offer:
- **7 named agents** (ISA, Showing Assistant, Offer Writer, TC, Closing Coordinator, Marketing Manager + Operations Lead orchestrator) shown as cards, each with a function + "what it replaces."
- **Pilot-first, scale-on-proof:** discovery call → 3–5 producer pilot, first agent in 72h on the worst workflow → brokerage rollout.
- **Human-in-the-loop credibility:** "The Operations Lead is real. A human monitors every deployment." Friday report with hours saved + exceptions.
- **Data-stays-in-your-tools** security reassurance.
- **Named-founder trust:** Ryan, producing agent, replies to every email, "counted 36 manual handoffs in one transaction."
- **No public pricing** ("avoid anchoring before understanding structure"). CTA: "Book a brokerage conversation. 30 minutes, no deck" + "take the audit first."

---

## Strongest reusable ideas (keep these — they're the brand's real equity)

These transfer to the GTM offer almost unchanged. Don't rebuild them; re-skin them.

1. **"Deploy a team, not software."** This is the whole differentiator and it's *already* the exact frame the GTM Experiment Engine offer uses. Keep verbatim as a structural principle.
2. **The agent-card pattern** (name → function → "what it replaces"). Proven, scannable. Swap the 7 RE agents for the 11 GTM agents; keep the card format and the "what it replaces" line — it's how you make abstract agents concrete.
3. **Pilot-first, scale-on-proof.** Maps 1:1 onto the GTM 90-day pilot. Keep the "first thing live in 72h on your worst workflow" hook — it's a great de-risker.
4. **"The Operations Lead is real / a human monitors every deployment."** This is the anti-spam, anti-"AI slop" credibility line. *Critical* to keep for GTM — it's the exact reassurance a burned-by-automation buyer needs.
5. **Named-founder trust + "I replies to every email."** Operator credibility. Reuse directly — it's also the honest "client #0 / founder-run pilot" proof posture the GTM offer already depends on.
6. **"Take the audit first" secondary CTA.** Lower-friction diagnostic entry. Becomes the GTM "workflow/pipeline audit" or "Loom audit" entry — keep the mechanic.
7. **Honest, no-fake-proof posture** (the "why this exists" section literally says it'll be replaced with real quotes, "we don't fake social proof"). Keep this DNA — it's on-brand and matches the GTM offer's "no fabricated results" rule.

---

## What must change for a GTM agent offer

1. **ICP language — total swap.** Every RE noun (FUB/Dotloop/MLS/lockbox/disclosure/brokerage/producer) → GTM nouns (CRM/LinkedIn/Loom/pipeline/ICP/account universe). Buyer shifts from broker-owner → **B2B founder / agency / consultant without a RevOps function** (per `01 - Best First ICP.md`).
2. **The 7 RE agents → the 11 GTM agents** (ICP Architect, TAM Builder, Signal Scout, Contact Mapper, LinkedIn Strategist, Loom Scriptwriter, Follow-Up Operator, Reply Router, CRM Ops, Experiment Analyst, GTM Ops Lead). Same card format, new team.
3. **The core metric: hours saved → qualified conversations / pipeline.** (See "not revenue-direct enough" below — this is the biggest single change.)
4. **The mechanism: static workflows → the weekly Experiment Loop.** The RE page sells 5 fixed workflows. The GTM page must sell the *learning loop* (context → TAM → experiments → human-approved outreach → measure conversation quality → improve weekly). That loop is the new IP; the RE page has no equivalent.
5. **CTA: "Book a brokerage conversation" → a GTM pilot CTA** ("Book a 30-min GTM pilot conversation" / "Get a pipeline audit").
6. **Channel story.** RE page = agents working *inside* existing tools silently. GTM page must foreground the **LinkedIn + Loom + follow-up** motion (human-approved, on-camera) — a visible, founder-led wedge, not silent back-office plumbing.

---

## Where the page is too narrow / too real-estate / not revenue-direct

Three honest weaknesses for the repositioning:

**1. Too narrow — real estate is a ceiling, not a floor.** The page is so RE-specific that the broader TAM (every B2B company that needs pipeline) is invisible. Strategic fork to decide *before* rewriting:
- **Option A — Reposition dealthreads.io wholesale** to the GTM masthead; real estate becomes *one vertical* under it.
- **Option B — Keep dealthreads.io real-estate-focused** and launch the GTM offer on a separate page/path/brand (the experiment-engine work lives standalone).
- My read: the RE site is *good* and possibly converting — don't bulldoze a working asset for an unproven offer. Leaning B (new GTM page, RE page intact) is the lower-risk move, but it's your call and depends on whether the RE site has real traction. **This teardown can't answer that without your conversion data — flagging it as the key decision, not deciding it.**

**2. Too real-estate in the proof.** The trust is built on Ryan-the-producing-agent ("36 handoffs in one transaction"). That credibility **does not transfer** to a B2B-founder buyer — they don't care that you're a real estate agent. The GTM page needs *different* founder proof: "I run this exact engine live on my own company (Oloxa)." The RE origin story becomes a liability if pasted into a GTM page unchanged.

**3. Not revenue-direct enough — this is the deepest shift.** The entire live page sells **cost avoidance** (hours saved, don't-hire-a-human, retention). That's the correct frame for *operations*. But GTM buyers don't buy time savings — **they buy pipeline.** The repositioned page has to lead with *revenue motion* (more qualified conversations, sharper targeting, faster experimentation) and treat efficiency as secondary. "Hours saved" headlines will undersell a GTM offer to a founder who's measured on bookings, not admin time. The `02 - Offer` and `05 - Landing Page Copy` in the experiment-engine folder already make this shift — the rewrite should inherit that revenue-first framing, not the RE page's cost-first one.

---

## One-paragraph summary

The live dealthreads.io is a **well-built, credible, but hermetically real-estate-sealed managed-agent-team page** whose *structure* (deploy-a-team, agent cards, pilot-first, human-monitored, named-founder, no-fake-proof) is excellent and ~80% reusable — but whose *ICP, vocabulary, agents, core metric, and mechanism* all need swapping, and whose fundamental frame must move from **cost-saving (hours) to revenue (pipeline)**. The biggest pre-work decisions aren't copy: (a) reconcile the two conflicting positionings on record, and (b) decide reposition-in-place vs. new-GTM-page — and that one needs the site's actual conversion data, which I don't have. Recommend NOT bulldozing a possibly-working RE asset; build the GTM page from the experiment-engine offer files and keep RE as one vertical.

---

## Next files in this lane (per the website-rewrite spec)
01 Positioning Options · 02 Offer · 03 Agent Architecture · 04 Landing Copy · 05 Sales Plan · 06 First 72h · **07 Website Implementation Plan** (exact files/sections to edit — only after you pick reposition-in-place vs new page) · 08 Scripts · 09 Proof Assets.
*Most of 02–04, 08, 09 already exist in `dealthreads-gtm-experiment-engine/` — reuse, don't rebuild.*
