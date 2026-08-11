# 2026-07-17 — Quoting engine Phase 2a (LLM layer) + first real quote

## What happened
Ryan allocated ~$50 OpenRouter credit to spend against CA's top use cases. Ranked list
(quoting engine #1 — the mid-funnel unblock per the GTM pressure-test). Built and ran it.

## Built
- `scripts/llm.py` — shared OpenRouter client for the whole workspace. Key from `.env`,
  never printed. Every call logs to `outputs/llm-usage.log` (model, tokens, est. cost).
  Fails soft (returns None) so tools degrade instead of crashing.
- `ca_quote.py` Phase 2a:
  - `category_comps()` — recent clean orders in the customer's vertical across ALL
    customers (what similar accounts paid, margins Kenny took) → comps table in draft.
  - `llm_quote_notes()` — sends request + customer history + comps + floor to the LLM;
    returns per-line suggested prices with reasoning, margin posture, comp-sourced
    upsells, and specific `[KENNY: ...]` calls. Anti-fabrication rules after first run
    invented an upsell (fixed: every upsell must name its comp row, unknown costs say
    "get supplier quote").
  - `--no-llm` flag; graceful degradation to anchors-only.
- Config anchors added: `padfolio` $12, `journal_book` $28 (from QBO), `yeti_rambler_20oz`
  $32 (premium-brand placeholder, flagged for Kenny). Aliases wired.

## First real quote — Miller Johnson (HOT, stalled 15 days on pricing)
60× Yeti Rambler 20oz + 60× padfolio, September retreat. New account (no ledger history).
- Anchor draft: **$2,687** ($32/$12)
- AI comp analysis suggests: **$4,140** ($45/$18) — vertical comps closed at 32–44% margin
- Draft: `outputs/quotes/2026-07-17-miller-johnson.md`
- Reply-watcher draft `2026-07-03-antonidesw-millerjohnson-com.md` updated with both
  price points; `[NEEDS PRICE]` now has real numbers. Kenny picks, fills links, sends.

## Cost

~10 LLM calls total (smoke + quotes + cost estimates): **~$0.001**. At
~$0.0006/quote (quote-notes + per-item cost estimates), the $50 credit covers
~80,000 quotes. The constraint is not money.

## Course-correction (same day): guessed prices → cost-first
Ryan flagged the first Miller Johnson draft as too expensive: "we come in
cheaper than premium corporate vendors, same quality." Root cause: the $32 Yeti
anchor was fabricated (no CA history for premium brands) and the LLM prompt
pushed prices UP toward comp-range tops. Fixed with Phase 2b:
- `scripts/cost_lookup.py` — pluggable cost sources: supplier APIs (stubbed for
  Kenny's keys) → ledger cost history (live) → web estimate (live, ~$0.0001)
  → config anchor (last resort).
- sell = cost / (1 − target margin); target = floor by default (`pricing_posture`
  in config: strategy `win_on_value`).
- LLM layer flipped from "suggest higher" to "sanity-check vs competitor retail
  + floor." Competitor retail pulled per item; draft shows ✅ when CA beats it.
- Re-priced Miller Johnson: Yeti $32→$23.29 (beats AnyPromo $29.99), padfolio
  $12→$10.51, total $2,687→$2,075. CA's real positioning, from real data.

## Verified
- Camp Becket regression: tees $5.90 vs competitor $8.99 ✅; 16%-typical vs
  28%-floor leak still flagged.
- All 36 unittest tests pass.

## Phase 2c (same day): full cost breakdown
Ryan's spec: email in → system finds item + printing + shipping + printer cost →
full breakdown, so Maclaine never has to tap Kenny for a quote. Built:
- `config.decoration_costs`: method per product (laser_engrave drinkware, deboss
  padfolio, screenprint tees), priced from QBO charge lines × 60% cost factor
  `[CONFIRM: Diamond/Viking rate card]`; bundled-decoration products flagged.
- `config.freight`: QBO shipment averages ($21.23 / $37.75 heavy), per-piece.
- `cost_lookup.full_breakdown()`: blank + decoration + freight → sell @ target,
  rendered as a per-unit breakdown table in every draft.
- Diamond/Viking sheets confirmed = method/turnaround only (no price columns);
  their invoices are the rate card.
- Honesty win: MJ Yeti $23.29 → $28.59 once real costs added — still beats
  AnyPromo $29.99 but only by $1.40. Engine surfaces that instead of hiding it.

## Next
1. Kenny reviews the Miller Johnson draft → verify Yeti cost on supplier portal,
   add product links → send.
2. Reply-triage → auto-quote pipeline (use case #2): HOT `[NEEDS PRICE]` replies
   auto-generate drafts like this one.
3. A/R collections drafter (#3) — $378K overdue, drafts per the value×aging matrix.
4. `[KENNY]` two one-ask items: (a) Diamond/Viking rate card (screenprint/EMB/
   engrave per-piece cost), (b) supplier API keys (S&S self-serve first) + "do we
   have SAGE?" → upgrades decoration + blank cost from estimate to exact.
5. `[MIGRATION]` Gmail/Workspace plan exists (`plans/2026-07-12-aol-to-gmail-migration.md`):
   needs Kenny's AOL mailbox size, a Workspace admin/billing decision, and one
   email to Bill White ([REDACTED EMAIL]) for mailbox inventory + DNS.
   The email→quote watcher gets built on the Gmail API AFTER mail moves — don't
   build it on the legacy webmail/AOL we're retiring.
