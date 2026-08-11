# QuickBooks Customer Analysis — the real ICP, in dollars

> Pulled live from CA's QuickBooks (2026-06-26) via browser → 3 reports exported to `context/import/` (`qb_customer_contacts.csv`, `qb_sales_by_customer_by_year.csv`, `qb_sales_by_customer_total.csv`). Analysis script: scratchpad `qb_analyze.py`. This is real money data — it confirms and sharpens the SmartLead reply analysis.

## Read this first — the data's time window
**QuickBooks went live in 2025.** Revenue by year: 2015–2023 ≈ $0 (stragglers), 2024 = $77k, **2025 = $1.79M, 2026-YTD (through Jun) = $1.37M** (pacing ~$2.7M+ full year — consistent with the ~$3.2M/yr figure). So "All Dates" really means **2025–2026**. There is **no deep dormancy history in QuickBooks** — anyone pre-2025 simply isn't in here. That single fact reframes the reactivation play (below).

- **Customers with QB sales:** 364
- **Recorded revenue (2025–26):** $3.03M
- **Full contact list:** 2,717 names — so ~2,350 are legacy/pre-2025 contacts with **no QB sales record** (value unknown from QB).

## Finding 1 — the ICP, confirmed in hard dollars
| Segment | # cust | Revenue | Avg LTV | % of rev |
|---------|-------:|--------:|--------:|---------:|
| **Summer camps** | 54 | **$1.13M** (raw) | **$20,835** | 37% |
| Individual/Personal* | 131 | $476k | $3,631 | 16% |
| Other/Unclassified* | 53 | $449k | $8,480 | 15% |
| **Squash/racquet** | 42 | $387k (raw) | $9,214 | 13% |
| Business/Corporate | 21 | $206k | $9,809 | 7% |
| Clubs (other) | 17 | $168k | $9,886 | 5% |
| Schools/academies | 29 | $138k | $4,754 | 5% |
| Youth sports/athletics | 11 | $48k | $4,361 | 2% |

*\*The classifier undercounts camps + squash — several top "Other/Individual" accounts are actually them (e.g. **USSRA** $158k = US Squash; **Crestwood** $121k = a camp; **Heights Casino** = a racquet club). After fixing the obvious misses:*

> **Camps = 41% of revenue. Squash = 19%. Together = 60% of all revenue.** Camps also have the **highest avg LTV by 2–4×** ($20.8k vs $3–10k everywhere else).

**This is the whole ballgame.** The SmartLead data said camps reply best (10.1%) and squash second (5.2%). The money data says camps + squash are also your **most valuable customers by a mile.** Both signals — response *and* revenue — point at the same two segments. That's as clear an ICP as you'll ever get.

## Finding 2 — top accounts are camps & squash
$158k USSRA (squash) · $138k Camp Becket · $121k Crestwood (camp) · $110k Driftwood Day Camp · $107k Park Slope Day Camp · $72k Camp Shibley · $66k YMCA Camp Chingachgook · $65k NY Squash · $62k Yale Club · $52k Camp Hazen · $51k Farm & Forge Club. **The top of the book is camps and racquet orgs.**

## Finding 3 — the reactivation play is different than we thought
Because QB only starts in 2025, there's **no 27-year dormant base inside QuickBooks** to mine. Instead:

- **Truly dormant in QB (last order ≤2024):** only **11 accounts, ~$23k.** Tiny.
- **Reorder-due (bought in 2025, NOT yet in 2026):** **118 accounts worth $306k in 2025 sales.** ← **this is the warm money.** These are existing customers at risk of not reordering. Top of the list: CLC Day Camp ($35k), Camp Coniston ($21k), Joseph Freedman Co ($15k), Camp Burgess & Hayward ($10k). Many are camps whose 2026 order should be happening *now* (spring/summer cycle).
- **The legacy ~2,350 contacts (pre-2025):** unknown value — could be real reactivation gold (a camp that ordered every summer before 2025) or just old leads. **QB can't tell us; only Maclaine can.** `[CONFIRM with Maclaine]`

## What this means for the GTM
1. **Cold targeting (AI Ark):** hunt **camps + racquet/squash clubs** lookalikes. Don't guess — seed AI Ark with these proven, high-LTV customer profiles. This is the lookalike engine, now with a real seed list.
2. **Warm motion = reorder rescue, not deep reactivation.** Work the **118 reorder-due accounts** ($306k at stake) before their season passes — phone-first via Salesfinity, "it's time for your 2026 order." This is the fastest, highest-certainty revenue in the building.
3. **Ask Maclaine about the pre-2025 base** — is the 2,350-name legacy list real past customers (reactivation gold) or dead leads? That decides whether a bigger reactivation motion exists.
4. **Camps get the mockup wedge + the budget.** They're worth $20k+ each. Acquiring more camps is the single highest-value thing outbound can do.

## Caveats / `[CONFIRM]`
- Segment classification is keyword-based — directionally strong (camps/squash dominance is unmistakable) but individual rows have noise.
- $3.03M = 2025–26 only; confirm QB captures all CA revenue vs. a subset.
- "Reorder-due" includes seasonal accounts that may simply not have hit their 2026 order date yet — treat as a *prioritized call list*, not churned accounts.
- Pre-2025 legacy base value is unknown from QB — needs Maclaine.

---

# Business profile (beyond sales) — products, geography, risk, health

> Added from a 4th export (`qb_sales_by_product.csv`) + the contact/address data. Same 2025–26 window.

## What CA actually sells — it's an apparel decorator
136 distinct items, 669,440 units, $3.04M. The product mix is unmistakable:

| Product | Revenue | % of sales | Units | Avg $ |
|---------|--------:|-----------:|------:|------:|
| **TEES** | **$911k** | **30%** | 111,793 | $8.15 |
| "Sales" (generic line) | $515k | 17% | 4,531 | $113.67 |
| **SWEATSHIRTS** | $283k | 9% | 12,308 | $23.02 |
| BAGS | $137k | 5% | 29,115 | $4.72 |
| CAPS | $83k | 3% | 5,348 | $15.52 |
| WATER BOTTLES | $63k | 2% | 8,425 | $7.43 |
| GOLF SHIRTS | $62k | 2% | 2,563 | $24.19 |
| TROPHIES | $39k | 1% | — | — |
| STICKERS | $21k | <1% | 207,550 | $0.10 |

**Category roll-up:** Apparel-tops **46%** · Bags 5% · Headwear 3% · Drinkware 3% · Accessories 3% · Decoration/Service (art, setup, freight) 5% · generic "Sales" bucket ~17%.

**Takeaways:**
- **CA is fundamentally a decorated-apparel business.** Tees alone are 30% of revenue; tees + sweatshirts + golf/tops = the engine. "Print anything on everything" is true, but apparel pays the bills.
- **$515k (17%) is logged as a generic "Sales" line** — a big un-itemized bucket (likely large/custom orders). Real product mix is even more apparel-weighted than the named lines show.
- **Stickers/MISC = huge volume, tiny value** — add-on items, not profit drivers.
- This **validates the branded-store offer**: a camp/club store sells exactly this (tees, hoodies, caps, bottles) — the offer maps directly onto what CA already produces at scale.

## ⚠️ CA does not track cost or margin in QuickBooks
**COGS = $0.00 on every product line.** They can see *revenue* per product/customer but not *profit*. They're flying blind on margin — can't tell which products or customers actually make money. This is both a **risk** (pricing/discounting decisions made without margin visibility) and a clear **"AI guy" opportunity** (stand up margin tracking). `[CONFIRM with Maclaine]` — is cost tracked anywhere else?

## Geography — CA is a New York business
Top states by # customers: **NY 654** (dominant) · CA 56 · MA 54 · NJ 53 · CT 53 · **SC 45** · PA 38 · MD 21. → CA is **NY-metro + Northeast** at its core, with a notable **South Carolina** secondary cluster. **Implication:** local social proof and targeting should lead with NY-metro/Northeast ("we outfit camps and clubs across the NY area"); SC is a real second market worth a look.

## Revenue concentration (risk) — moderate
Top 5 = 21% · Top 10 = 31% · **Top 25 = 50%** · Top 50 = 69% of revenue. No single account dominates (healthy), but **the top 50 carry two-thirds of the business** — retaining them is existential. The reorder-rescue motion isn't optional; it protects the core.

## Customer-base health (2025 → 2026 YTD)
- Bought in 2025: **258** → retained into 2026 so far: **140 (54%)** (will rise as the year completes)
- **Not yet back in 2026 (reorder-due / at-risk): 118**
- **NEW in 2026: 87 customers = $230k** — CA is acquiring strongly on word-of-mouth *alone*, no marketing system. Imagine this with an actual engine.

## Contactability (for outreach readiness)
Of ~2,131 contacts: **61% have email, 64% have phone, only 40% have both, 15% have neither.** Of emails, **40% are personal** (gmail/yahoo/aol) vs 60% org domains — consistent with owner-operated camps/clubs. **Implication:** the list needs an enrichment pass (AI Ark/Origami) before outreach — a meaningful share isn't cleanly email-reachable today.

---

---

# The financial picture (P&L · receivables · suppliers)

> Added from 3 more exports: `qb_profit_and_loss_by_year.csv`, `qb_ar_aging.csv`, `qb_expenses_by_vendor.csv`. Script: `qb_financials.py`.

## Profit & Loss — CA is genuinely, strongly profitable
| | 2025 | 2026-YTD | All-time |
|---|------:|---------:|---------:|
| Total income | $2.66M | $1.30M | $4.05M |
| Gross profit | $2.02M | $631k | $2.75M |
| Total expenses | $1.50M | $296k | $1.80M |
| **Net income** | **$524k** | **$343k** | **$967k** |
| Net margin | **20%** | 26% | — |

**$524k net profit in 2025 (20% margin), pacing higher in 2026.** This is a healthy, real business — not a struggling one.

## The single most important fact in the whole analysis
**Advertising spend = $19,545 all-time** (~$10k/yr) on a **$2.6M/yr business.** CA does virtually **zero marketing** — the entire thing runs on 27 years of word-of-mouth. That's the whole investment thesis in one number: *this business throws off $500k+/yr in profit with no marketing engine at all.* Add one and the upside is enormous — and the 20% margins mean it can easily fund the build.

## ⚠️ The books are messy (real "AI guy" opportunity)
- **Gross margin swings 76% (2025) → 49% (2026)** — not real; COGS is recorded inconsistently. Cost-of-product is split between a "COGS" line ($1.3M) *and* a "Purchases" expense line ($1.06M) — double-bucketed.
- **"Ask my accountant" = $220k uncategorized** ($207k of it in 2025). A big suspense bucket = books needing cleanup.
- **No per-item margin** (COGS=0 on every product line). They can't see which products/customers are actually profitable.
- → Clean books + margin visibility is a concrete, high-trust first AI project.

## Receivables — a real cash drag (and an AI win)
**$671,805 is owed to CA right now** (≈3 months of revenue outstanding). Their "pay after delivery, no deposit" model (the squash pitch) creates this.
- **56% is past due ($378k)**; **$63k is 90+ days late.**
- Worst 90+ debtors include **Camp Becket** (their #2 customer, $5.6k 90+ late), YMCA Camp Mataucha, Cousin John's Bakery, Corey Modeste.
- → An **AR follow-up / collections system** is a fast, obvious internal win — recovering even half the overdue is six figures of cash, and it films well.

## Suppliers — the supply side
**471 vendors, $3.07M all-time spend.** Top suppliers are the promo industry's big blank wholesalers — confirming the apparel-decorator model:
- **Sanmar $549k** · **Viking Solutions $373k** · **S&S Activewear $327k** · **alphabroder $177k** · Diamond Graphics $172k · Pennant Sportswear $66k · Hit Promotional $39k.
- Plus IRS $164k (taxes), UPS $50k (shipping), Delta $45k (travel).
- **Top 10 vendors = 63% of spend** (Sanmar alone ≈18%) → supplier concentration; CA has buying leverage with Sanmar/S&S/alphabroder worth negotiating.

## What the financials add to the GTM
1. **The thesis is now bulletproof:** $500k+/yr profit on ~$0 marketing. Any engine is upside, and CA can fund it.
2. **First internal AI wins are obvious & high-trust:** AR collections ($378k overdue) + book cleanup/margin visibility. Both film well, both build Kenny's trust fast.
3. **Healthy margins (20%+)** mean a real CAC budget for outbound is affordable.

## Open `[CONFIRM]` for Maclaine
- Why is cost split across "COGS" vs "Purchases"? (margin accuracy)
- What's in "Ask my accountant" ($220k)?
- Is the $378k overdue AR actively chased, or is collection ad-hoc?
- "Realized Gain" -$261k — investment account inside the business?

---

*Source: CA QuickBooks, exported live 2026-06-26 (7 reports total). Scripts: `qb_analyze.py`, `qb_business.py`, `qb_financials.py`.*
</content>
