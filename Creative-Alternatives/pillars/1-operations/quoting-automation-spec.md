# Quoting Automation — spec & build plan

> Pillar 1 (Operations), the current focus. This is the system that removes CA's
> single biggest throughput bottleneck: **every quote waits on Kenny to hand-price
> it from a blank page.** The GTM pressure-test (`../2-customer-acquisition/gtm-pressure-test-2026-07-17.md`)
> named the reply→quote→close path — not lead volume — as the real constraint;
> HOT deals like Miller Johnson's September retreat stall here. This tool attacks
> that directly.
>
> **Status: Phase 1 skeleton is built and working** (`scripts/ca_quote.py` +
> `config/ca_quote.yaml`). Phases 2–3 are designed below and marked as gaps.

---

## The problem, precisely

Kenny is the pricing engine. An interested reply comes in → it sits until Kenny
finds time to look up a blank, guess a price, and write a quote. Because it all
lives in his head, (a) quotes are slow (deals age, some die), (b) pricing drifts
(camp margin fell 35%→25% since 2019 — nobody was enforcing a floor), and (c) it
doesn't scale past his personal bandwidth. Every acquisition motion we build dumps
more replies onto this one clogged step.

**Design goal:** never make Kenny start from a blank page. Hand him a draft that
already has comparable pricing, the customer's history, and a margin-floor check —
so his job shrinks from "price this from scratch" to "confirm/adjust the judgment
calls." Quote turnaround drops from days to minutes.

---

## What the tool does NOT do (guardrails)

- **Never sends.** Output is a draft markdown file in `outputs/quotes/`. A human
  turns it into a real quote/estimate. (Same human-in-the-loop rule as all CA
  money-touching automation.)
- **Never sets a final price.** It proposes a starting point from history and
  flags every judgment call as `[KENNY: …]`. The supplier cost that determines
  true margin is Kenny's to fill — the skeleton is explicit about that.
- **Never fabricates.** Anchor prices are labeled as blended historical averages,
  not quotes. Unknown products are surfaced, not guessed.

---

## Architecture

```
Inbound request  (reply-watcher HOT item, or manual)
    │  {customer, items:[{product, qty}], rush?}
    ▼
ca_quote.py ──reads──► data/data.db  (sales_ledger, qb_sales_by_product)
    │                  config/ca_quote.yaml  (floors, anchors, aliases, addons)
    │
    ├─ infer vertical from customer's ledger history
    ├─ price each line from config anchor  (Phase 2: from live QBO catalog)
    ├─ pull customer's clean recent order history (comparable margins)
    ├─ compute subtotal + setup + rush → draft total
    ├─ flag margin floor for the vertical + this customer's typical margin
    └─ mark every judgment call [KENNY: …]
    ▼
outputs/quotes/<date>-<customer>.md   (DRAFT — Kenny fills gaps)
    ▼  (Phase 2)
QBO estimate  (qbo_sales_create_estimate)  →  send from QuickBooks
```

## Phase 1 — the skeleton (DONE)

`scripts/ca_quote.py`, driven by `config/ca_quote.yaml`. Working today:
- **Vertical inference** from the customer's own ledger history (or `--category`).
- **Per-line draft pricing** from `price_anchors` (sourced from real
  `qb_sales_by_product` average selling prices), with an alias map so free text
  ("t-shirt", "crewneck", "yeti") resolves to a known product.
- **Margin-floor check** per vertical — Camp = 28% (the revenue-plan floor that
  stops the leakage), others set a few points under recent historical margin.
- **Customer history** pulled and attached as context, with adjustment/credit
  rows (the $1 / -76500%-margin data errors) filtered out via config thresholds.
- **Every judgment call flagged** `[KENNY: …]`; unknown products surfaced.

Try it:
```bash
.venv/bin/python scripts/ca_quote.py --customer "Camp Becket" --items "tee:60, sweatshirt:60"
```
It already earns its keep: on Camp Becket it shows the customer's typical margin
(16%) sitting well under the 28% floor — the exact leakage the revenue plan
flagged, now caught at quote time instead of after the fact.

### The Kenny-dependent gaps (deliberate, marked in every draft)
These are judgment the skeleton can't and shouldn't fake:
1. **Supplier + exact blank** — anchors are blended; real margin depends on the
   specific garment/decorator. → Phase 2 (live QBO catalog) narrows this.
2. **Volume breaks** — qty may earn better pricing than the blended anchor.
3. **Decoration method** — screenprint vs embroidery vs DTF moves cost materially.
4. **Setup: colors/locations** — currently one placeholder charge per line.
5. **Rush policy** — the 15% surcharge is a placeholder pending Kenny's real rule.

## Phase 2c — full cost breakdown (BUILT 2026-07-17)

Ryan's spec: "instead of Maclaine having to hit up Kenny for a quote, the system
finds what it costs — printer, printing, shipping, item — and does a full
breakdown." Now live:

- **Four components per line**, each labeled with its source:
  - **Item (blank)**: supplier API (stubbed) → ledger cost ratio → web estimate.
  - **Decoration**: `config.decoration_costs` — method per product (laser_engrave
    on drinkware, deboss on padfolios, screenprint on tees…), priced from QBO
    decoration charge lines (ENGRAVE $5.40/pc, EMBROIDERY $7.78, Printing $1.16)
    × a 60% pay-side cost factor `[CONFIRM: Diamond/Viking rate card]`. Products
    whose vendors bundle decoration (padfolios, journals) are marked `bundled`
    so decoration isn't double-counted.
  - **Freight**: QBO shipment averages ($21.23 parcel / $37.75 heavy), allocated
    per piece; heavy items (Yeti, coolers, jackets) use the bulk rate.
  - **Sell** = all-in cost ÷ (1 − target margin); margin shown per line.
- **Diamond/Viking sheets** (`collect_viking_orders.py` etc., already in the DB)
  give **method + turnaround + rush flags**, not pricing — confirmed by inspecting
  the tables (no cost columns). Their invoices are the rate card; the sheets
  answer "who prints this and how fast" for the fulfillment note.
- **Honesty check paid off**: Miller Johnson Yeti moved $23.29 → **$28.59** once
  real decoration + freight were added — now beats AnyPromo's $29.99 by only
  $1.40. The old number would have won the deal and eaten the margin. The engine
  now surfaces that tension instead of hiding it.
- The blocker to "Maclaine sends without Kenny" is now exactly two things:
  the **Diamond/Viking rate card** (turns decoration from proxy to exact) and
  **supplier API keys** (turns blank cost from estimate to exact). Both are
  one-ask items; everything else is automated.

## Phase 2b — cost-first pricing (BUILT 2026-07-17)

The engine no longer guesses sell prices. Ryan's correction after the first
draft ("we come in cheaper than premium vendors, same quality") drove a redesign:

- **`scripts/cost_lookup.py`** — pluggable cost sources, tried in order:
  1. **Supplier APIs** (S&S / SanMar / alphabroder / SAGE) — STUBBED, needs
     Kenny's keys. Interface ready; drop-in when credentials land.
  2. **Ledger cost history** — CA's own cost/retail ratio from 25,662 orders
     (LIVE). Padfolio priced itself off this.
  3. **Web estimate** — LLM estimates the current wholesale blank cost from
     supplier-storefront knowledge (LIVE, ~$0.0001/lookup). Always labeled
     ESTIMATE, flagged for Kenny to verify on the supplier portal.
  4. **Config anchor** — last resort, labeled "NO cost data."
- **Cost-first math**: `sell = cost / (1 - target margin)`. Target margin comes
  from `pricing_posture` in config — defaults to the floor (aggressive end),
  because Kenny can quote UP from a floor price but the engine should never
  quote him out of a deal.
- **Value posture baked in**: config `pricing_posture.strategy = win_on_value`;
  the LLM analysis layer's job flipped from "suggest higher prices" to
  "sanity-check: flag anything that loses to competitor retail or breaks floor."
- **Competitor check**: web-estimate tier also pulls competitor retail at the
  quote qty; the draft shows a ✅ when CA's price beats it (the selling point).
- **Fabricated Yeti $32 anchor removed.** Miller Johnson re-priced: Yeti
  $32→**$23.29** (beats AnyPromo $29.99), padfolio $12→**$10.51**, total
  $2,687→**$2,075**. That's CA's real positioning, from real data.

## Phase 2a — comps + LLM reasoning layer (BUILT 2026-07-17)

`scripts/ca_quote.py` now does more than anchors:
- **Vertical comps**: `category_comps()` pulls recent clean orders in the
  customer's vertical across ALL customers — what similar accounts paid and
  the margins Kenny actually took — rendered as a comps table in every draft.
- **LLM analysis layer**: `llm_quote_notes()` sends the request + customer
  history + comps + the floor to an LLM (via `scripts/llm.py`, OpenRouter)
  and gets back per-line suggested prices with reasoning, a margin-posture
  read, comp-sourced upsells, and the specific `[KENNY: ...]` calls. Strict
  anti-fabrication rules: every number must trace to the data or be flagged
  an estimate; unknown costs say "get supplier quote."
- **Graceful degradation**: if the LLM call fails or `--no-llm` is passed,
  the engine still produces the anchors-only draft. The draft never blocks.
- **Burn tracking**: every call logs to `outputs/llm-usage.log` (model,
  tokens, est. cost). First live runs cost ~$0.0002/quote.
- First real quote: Miller Johnson (HOT reply, 60× Yeti Rambler 20oz + 60×
  padfolio) — anchors draft $2,687, AI comp analysis suggests $4,140 (comps
  in vertical closed 32–44% margin). Draft at `outputs/quotes/2026-07-17-miller-johnson.md`;
  reply-watcher draft updated with both price points.

## Phase 2 — QuickBooks catalog + estimate (designed, not built)

Replace config anchors with live data and close the loop into QBO:
- **Live product/pricing** from `qbo_catalog_search_products` /
  `qbo_accounting_get_product_service_list` so the anchor is CA's actual catalog,
  not a blended average.
- **Real cost basis** where QBO carries it → the tool can compute *actual* margin
  and hard-enforce the floor instead of just flagging it.
- **Emit a QBO estimate** via `qbo_sales_create_estimate` (still human-approved
  before send). The draft markdown becomes the estimate's line items.
- **Customer match** via `qbo_contact_search_customer` to attach to the right
  QBO customer (and reuse their real terms).

*Gap to close first:* map CA's product vocabulary → QBO item list (a one-time
reconciliation Kenny/the bookkeeper confirm).

## Phase 3 — wired to the reply pipeline (designed, not built)

Close the throughput loop end to end:
- A HOT reply tagged `[NEEDS PRICE]` in the reply-watcher board auto-generates a
  draft quote into `outputs/quotes/` and links it on the thread.
- Kenny gets the draft in the daily brief's action list — pre-filled, waiting only
  on his judgment calls — instead of a "quote this from scratch" todo.
- On approval, Phase-2 pushes the QBO estimate and advances the HubSpot deal.

This is the state where the bottleneck is actually gone: an interested reply
produces a Kenny-ready quote automatically, and Kenny's role compresses to the
5-minute judgment pass only he can do.

---

## Files
- `scripts/ca_quote.py` — the engine (Phase 1)
- `config/ca_quote.yaml` — floors, anchors, aliases, addons, comparable-lookup tuning
- `outputs/quotes/` — generated drafts (gitignored working output)

## Open `[CONFIRM]` with Kenny
1. The margin floors (esp. Camp 28%) — endorse or adjust per vertical.
2. Real rush policy and setup-charge structure (per color? per location? minimums?).
3. Product→QBO-item mapping for Phase 2.
4. Whether the tool should ever hard-block a sub-floor quote, or only ever flag it.
