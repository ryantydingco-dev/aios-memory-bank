# GTM Pressure-Test & Unification — 2026-07-17

> Companion to `master-gtm-strategy.md`. The master ranks and sequences the five motions; this doc stress-tests them **as one system** now that the data gate is open, names where the motions fight each other, and corrects the near-term sequence for where we actually are in the calendar (mid-July, camp season over, Q4 ahead). Operator-level. Read after the master.

---

## Headline: the gate the whole plan waited on is already open

The master strategy (§3, §6, §10) gates motions 1–3 and the entire revenue model on a "Maclaine / QuickBooks session" that pulls the dormant list, reorder-due accounts, top-25, and real economics. **That deliverable now exists** — the revenue plan (`outputs/revenue-plan/2026-07-17-revenue-opportunity-plan.md`) produced it directly from the ledger + QBO:

| The master's `[CONFIRM]` | Now known |
|---|---|
| Production margin % | Blended **31–32%**; by vertical: Events 35.4%, Health Clubs 34.6%, Leagues 37.0%, **Camps 26.9% (and eroding — 35%→25% since 2019)** |
| Dormant base worth calling | **113 verified-dormant accounts ≥$10K lifetime** (`dormant-accounts-2026-07-17.csv`), name-checked against 2025–26 activity |
| Anchor-account concentration | Top 20 customers carry ~10%+ of revenue; the squash ecosystem alone (~$300K+/yr) is one relationship web |
| A/R reality | **$672K open, $378K overdue** — bigger than any cold campaign's upside this year |

**Implication:** stop treating motions 1–3 as blocked. The data is in `data/data.db`. The reactivation list is generated. What's missing is not the pull — it's execution throughput (below).

---

## The real bottleneck is not lead volume — it's the reply→quote→close path

The master ranks cold outbound (motion 4) as the most-built motion, and it is: 6 active campaigns, 18,728 emails sent, 161 replies. But the audit found the conversion layer behind it is **jammed**:

- **71 replies sat un-triaged in `queue/inbox/`** (oldest Jul 1) because the triage job never ran (Full Disk Access — see the audit doc). Live prospect replies aging is lost revenue that no amount of new top-of-funnel fixes.
- **The HOT board stalls on pricing.** Every `[NEEDS PRICE]` item — Miller Johnson's 60-each September retreat order (a real, sized, HOT deal), Harbor Haven, Woodcraft, Camp Lilac — is waiting on **Kenny to hand-fill product links and prices.** Kenny is the single point of failure between "interested reply" and "sent quote."

**This is the most important correction in this doc:** the system is top-of-funnel-rich and mid-funnel-poor. Adding more cold volume while the reply→quote path is clogged just grows the backlog. **The highest-leverage GTM investment right now is throughput, not reach** — and two things directly unclog it:
1. The reply-triage automation being armed (audit item 1).
2. **The quoting tool (sprint item #5) — which is a GTM unlock, not just an ops nicety.** It removes the Kenny-pricing bottleneck that is currently stalling HOT deals. Build it and the mid-funnel opens.

---

## Where the motions fight each other (conflicts to resolve)

**1. Three different "dormant" lists with three different thresholds.**
- Reactivation Sequence A (`ca_reactivation.py`): 981 lapsed, "no order in 2 years, has email."
- Salesfinity win-back list 4: 620 lapsed "with phones, biggest spend first."
- Revenue plan: 113 verified-dormant ≥$10K lifetime, name-variant-checked.
These overlap and disagree. **Fix:** one canonical dormant table, one definition, with channel availability (email/phone) as columns — not three lists built by three scripts. The revenue-plan list is the cleanest seed (it removed the spelling ghosts the others still contain).

**2. Cold outbound can hit a dormant customer as if they're a stranger.**
8% of past cold replies were existing customers; a dormant camp reactivation (motion 1, warm "it's been a minute") and a cold branded-store pitch (motion 4, "we should work together") can both fire at the same account. On the phone that's a relationship-damaging mistake. **Fix:** one relationship-state tag per account (`active / dormant / cold-never`) that decides which motion may touch it — enforced at list-build, not by memory. The suppression list in `tasks.md` is the seed; it needs to be a table every list-builder reads.

**3. Camps are simultaneously the top cold winner AND the retention problem.**
Camps reply at 10.1% cold (the best segment) — but camps also carry the worst margin (25%), the biggest churn ($250K of 2025 camps quiet in 2026), and the most pricing leakage. The strategy currently points cold outreach at *new* camps while existing camps leak out the back. **Fix:** flip camps to a primarily **retention + margin** motion (win-backs, the 28% margin floor, reorder nudges) and tilt *new* cold acquisition toward the higher-margin verticals — Events (35%), law, financial — where the drafted campaigns already sit. Chase margin, not just reply rate.

**4. HubSpot's role widened today and the master hasn't caught up.**
The warm pipeline went live in HubSpot today (acct 246275995) holding interested-but-silent leads. Master §7 still frames HubSpot as only the "new-lead pipeline." **Reconciled:** QuickBooks = customer/order/money truth; **HubSpot = every live pipeline (cold + warm/interested + inbound)**; the reply board is triage that feeds HubSpot. Clean, no fight — but write it down.

---

## Weighting: what's over- and under-built

| Over-weighted (has more than it can convert) | Under-weighted (where the compounding is) |
|---|---|
| Cold email top-of-funnel — 6 active + 12 drafted campaigns | **Reply→quote turnaround** (the `[NEEDS PRICE]` jam; quoting tool fixes it) |
| Cold camp acquisition (season is over until Jan) | **Reorder/referral system** (motion 2, still "not built" — pointed at the $2.6M core) |
| — | **Second-order program** for the 300 new customers/yr (revenue plan #6 — the leaky bucket) |
| — | **A/R collection cadence** (cash already earned, $378K overdue) |

The pattern: CA keeps building *reach* and under-building *conversion and retention*. Every motion that monetizes the existing base (1, 2, 3, A/R) is faster-paying than motion 4 and less built.

---

## Near-term sequence correction (it's mid-July — the calendar has moved)

The master's Weeks 1–13 roadmap was written for a standing start. Given where we actually are (2026-07-17, camp buying season done, Q4 gifting ahead), the next 90 days should run:

**Now → end of July — collect cash + unclog the middle.**
- **A/R chase cadence weekly** (revenue plan #1) — $378K overdue is the biggest number on the board. Nothing to build; run it.
- **Arm reply-triage + drain the 71-reply backlog** (audit item 1). Every one is a prospect who already raised a hand.
- **Kenny clears the `[NEEDS PRICE]` HOT deals** — Miller Johnson's September retreat order is time-boxed (it ships in September). Losing it to slow pricing is the concrete cost of the bottleneck.

**August — retention + Q4 setup (the timely revenue).**
- **Reactivation calls to churned camps** (revenue plan #2): framed as relationship-preservation and 2027 season (which sells in January), NOT a 2026 order. Kenny knows these people; phone-first.
- **Stand up the corporate/gifting motion for Q4** — December is CA's *worst* month ($124K) in the industry's *biggest* gifting season. Activate the drafted corporate SmartLead campaigns + a "holiday gifting" offer to the 500+ active customers now, so it lands in Sep–Oct buying windows. This is the single most timely *new* revenue play on the board.
- Set the **28% camp-margin floor** (revenue plan #3) — one decision, enforced by the quoting tool.

**September–October — reorder engine + higher-margin cold.**
- Build **motion 2** (reorder nudges + referral asks) on the active base — still unbuilt, still pointed at the biggest surface.
- Weight *new* cold toward Events/law/financial (margin), not more camps.
- **Second-order touch** for 2025's 277 new customers (revenue plan #6).

**November–December — compound + camp win-back prep.**
- Q4 gifting revenue lands.
- Prep the 2027 camp win-back list so January (camp buying season) opens with warm calls already queued.

The through-line: **the master's "monetize the base first" thesis is right — but the base data now exists, so execute it instead of gating it, and re-order the near term around the A/R cash, the clogged middle, and the Q4 gifting window that the original roadmap (written mid-camp-season) didn't weight.**

---

## What to change in the master doc
1. §3 / §10 — un-gate motions 1–3: the QuickBooks pull is done, results in `outputs/revenue-plan/`.
2. §6 — replace the `[CONFIRM]` economics block with the real margins (blended 31%, by-vertical table above).
3. §7 — widen HubSpot's stated role to all live pipeline (warm went live 2026-07-17).
4. §5 — insert the calendar correction above as the near-term overlay.
5. Add the reply→quote throughput bottleneck and the single-dormant-list / relationship-state-tag fixes as explicit workstreams.
