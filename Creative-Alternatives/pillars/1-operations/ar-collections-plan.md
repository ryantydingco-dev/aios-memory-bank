# AR Collections Plan — Creative Alternatives

> **Plan only — not built yet.** How CA recovers the $378k in overdue receivables and stops invoices from aging, *without* damaging the camp/club relationships that are the business. Rides on real data: `../2-customer-acquisition/context/import/qb_ar_aging.csv` (and the customer LTV/segment analysis in `../2-customer-acquisition/quickbooks-customer-analysis.md`).
>
> Goal of *this* doc: a clear operating plan + an automation roadmap. Build comes later, on camera.

## The situation (from the books, 6/26/26)
- **$671,805 owed to CA.** 56% ($378k) past due. $63k is 90+ days late.
- Caused by the "pay after delivery, no deposit" model (a sales feature, a cash-flow bug).
- 90+ debtors include **Camp Becket** (the #2 customer overall, $138k LTV) — so this is NOT a "send everyone a dunning notice" problem.

## The guardrails (non-negotiable)
- **Protect the relationship first.** These are repeat camps/clubs worth $9k–$140k each. A clumsy collections email can cost a $20k/yr account. Relationship > the single invoice.
- **Human-in-the-loop on money + customer contact.** AI drafts and prioritizes; Maclaine/Kenny approve and send. Never auto-dun a high-value account.
- **Never fabricate amounts.** Every figure ties to the aging report.

## The core idea: a value × aging matrix
Don't treat a $200 one-off the same as your #2 customer. Two axes:
- **Customer value** (from LTV/segment analysis): A = top-50 / camps & squash / active reorderers · B = mid · C = small / one-off / dormant.
- **Aging bucket:** Current · 1–30 · 31–60 · 61–90 · 90+.

| | A — high value (protect) | B — mid | C — small / one-off |
|---|---|---|---|
| **1–30** | Soft FYI reminder (warm, Maclaine voice) | Friendly reminder | Standard reminder |
| **31–60** | Personal check-in ("everything ok with the order?") — *also a reorder touch* | Reminder + statement | Firmer reminder + statement |
| **61–90** | **Phone call** from Maclaine — relationship-first | Call or firm email | Firm email, payment-due tone |
| **90+** | **Kenny/Maclaine personal call** + payment-plan offer; never threaten | Call + final-notice email | Final notice → escalate / write-off review |

**The unlock:** for A-tier, an overdue invoice is an excuse for a *warm, personal touch* that doubles as a reorder conversation. For C-tier, it's a firm, mostly-automatable process. Same system, opposite tone.

## The daily collections worklist (how it's prioritized)
Each day, surface the **top ~10 invoices to act on**, ranked by:
`priority = $ amount × days-overdue weight × collectibility — relationship-risk penalty`
- Big + old + collectible floats to the top.
- High-value relationships get a *gentler* recommended action, not a louder one.
- Output: a short list ("chase these 10 today"), each with the customer, amount, age, last contact, suggested channel + tone, and a **drafted message** for Maclaine to approve.

## Tone & channel
- **Email** for routine reminders — warm, short, assume good faith ("wanted to make sure this didn't slip through"). Maclaine's voice.
- **Phone** (Salesfinity or direct) for 60+ days and any A-tier — people pay faster after a friendly human call, and it protects the relationship.
- **Statements** attached at 30+ so there's no "what invoice?" friction.

## Prevention (fix the root cause, not just chase)
Chasing is treating symptoms. Also plan:
- **Reminders at the *right* time** — a friendly nudge a few days *before* and *on* due date stops most aging before it starts.
- **Deposits on large / first-time orders** — keep "pay after delivery" as the trust-builder for *known* customers, but consider a deposit for new accounts or orders over `[$X]`. `[CONFIRM with Kenny — this touches the sales pitch]`
- **Clear terms on the invoice** (due date, late expectations) — gently.

## Automation roadmap (build later — this is the plan)
- **Phase 1 — Manual-assist (now-ready):** weekly AR aging export → Claude segments it (value × aging), produces the daily worklist + drafts each reminder → Maclaine approves & sends. Zero new tooling. *This is the on-camera build.*
- **Phase 2 — Semi-auto:** QuickBooks live (via the MCP we set up) → the worklist refreshes automatically → drafts land in Maclaine's channel (Telegram/Slack) each morning → one-tap approve. Calls routed through Salesfinity for the 60+ tier.
- **Phase 3 — Tiered auto-send:** C-tier routine reminders send automatically (with logging); A/B-tier always human-approved. Never fully hands-off on a valuable relationship.

## Metrics (the scoreboard)
- **DSO** (days sales outstanding) — the headline; drive it down.
- **% of AR overdue** — from 56% toward `[target]`.
- **$ recovered** from the 90+ bucket (the immediate prize: ~$63k).
- **Aging trend** week over week (is new AR aging slower?).

## How this connects to the GTM (not a side quest)
- **Frees cash** to fund the growth engine.
- **A-tier collections calls double as reorder/relationship touches** — overlaps with the warm reorder motion (the 118 reorder-due accounts).
- **It's content + trust:** "I found $378k in unpaid invoices and built the system to collect it" is an episode *and* the fastest way to earn Kenny's buy-in. See `../2-customer-acquisition/gtm-from-the-data.md`.

## Open `[CONFIRM]` with Maclaine
- Who currently chases AR, and how? (manual? not at all?)
- Are any 90+ accounts known bad debt vs. just slow?
- Appetite for deposits on new/large orders?
- Standard payment terms today (net 30? on delivery?).
</content>
