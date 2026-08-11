# Sales History — 1999 to 2026 (Kenny's ledger)

> Source: `context/import/1999thru2026xlsx.xlsx` — Kenny's per-invoice ledger, every order since Feb 1999
> (invoice #180 → #27212, April 2026). Columns: Date, Invoice #, Manufacturer, Cost, Customer, Retail,
> Profit, MU%/Type. Analyzed 2026-07-12. Companion: `context/import/Financial Update.xlsx` — Kenny's
> balance-position tracker (Bank, Cash, A/R, inventories, loans) with snapshot columns since Aug 2014.

## Lifetime totals (25,659 clean order rows)

- **$32.4M lifetime sales · $10.6M lifetime profit · 32.7% blended margin**
- Margin has been astonishingly stable: roughly 29–37% every single year for 27 years
- ~550–560 unique active customers/year at peak (2024–25) vs. 2,700+ lifetime → **~2,000+ dormant accounts = the reactivation goldmine, now quantified**

## Year by year

| Year | Orders | Sales ($) | Profit ($) | Margin | Active customers |
|------|--------|-----------|------------|--------|------------------|
| 1999 | 35 | 32,279 | 12,553 | 38.9% | 17 |
| 2000 | 136 | 184,429 | 53,507 | 29.0% | 71 |
| 2001 | 276 | 376,336 | 102,259 | 27.2% | 120 |
| 2002 | 392 | 409,389 | 131,570 | 32.1% | 169 |
| 2003 | 565 | 510,001 | 162,535 | 31.9% | 221 |
| 2004 | 749 | 714,385 | 225,055 | 31.5% | 263 |
| 2005 | 819 | 760,328 | 248,029 | 32.6% | 299 |
| 2006 | 799 | 805,005 | 266,134 | 33.1% | 284 |
| 2007 | 893 | 958,730 | 309,941 | 32.3% | 303 |
| 2008 | 942 | 1,001,042 | 318,748 | 31.8% | 303 |
| 2009 | 1,000 | 966,280 | 316,550 | 32.8% | 353 |
| 2010 | 1,191 | 1,100,801 | 359,525 | 32.7% | 386 |
| 2011 | 1,226 | 1,295,067 | 405,732 | 31.3% | 400 |
| 2012 | 1,291 | 1,416,018 | 451,104 | 31.9% | 382 |
| 2013 | 1,297 | 1,456,050 | 459,030 | 31.5% | 404 |
| 2014 | 1,249 | 1,459,838 | 432,664 | 29.6% | 433 |
| 2015 | 1,234 | 1,623,890 | 556,981 | 34.3% | 411 |
| 2016 | 1,103 | 1,433,980 | 520,501 | 36.3% | 360 |
| 2017 | 1,061 | 1,463,299 | 543,669 | 37.2% | 339 |
| 2018 | 1,134 | 1,597,080 | 579,020 | 36.3% | 385 |
| 2019 | 1,393 | 1,771,008 | 646,151 | 36.5% | 439 |
| 2020 | 757 | 859,923 | 298,846 | 34.8% | 329 |
| 2021 | 1,204 | 1,631,123 | 529,365 | 32.5% | 432 |
| 2022 | 1,186 | 1,688,048 | 521,554 | 30.9% | 392 |
| 2023 | 619 | 1,011,142 | 320,669 | 31.7% | 294 |
| 2024 | 1,394 | 2,755,051 | 840,441 | 30.5% | 555 |
| 2025 | 1,402 | 2,520,959 | 804,417 | 31.9% | 559 |
| 2026 (thru Apr) | 309 | 582,610 | 188,931 | 32.4% | 183 |

## The story the numbers tell

- **Steady 10-year climb** to ~$1M (2008), a decade around $1.0–1.8M, then a **step-change in 2024** to $2.7M+ — the business roughly doubled in the last five years.
- **COVID hit hard but briefly** (2020: −51% orders), full recovery by 2021.
- **Margins never broke.** Whatever Kenny's pricing instinct is, it holds ~32% through recessions, COVID, and growth spurts. This is the tribal knowledge to capture.
- Data caveats: 2023 shows only 619 orders / $1.01M — likely incomplete data entry that year `[CONFIRM with Kenny]`. Three rows have typo years (2028, 2029, 5013). Ledger 2025 ($2.52M) vs QuickBooks 2025 ($2.65M income) differ slightly — different measures (ledger = logged orders; QBO = all income incl. shipping); treat QBO as the accounting source of truth, the ledger as the per-order analytics source.

## How customers were acquired (CUSTOMERS sheet, 589 recorded)

| Source | Count |
|--------|-------|
| Through squash association | 117 |
| Through another account (referral) | 111 |
| "No idea" | 55 |
| Through EAC (health club) | 28 |
| Friend / cousin / personal network | ~60 |
| Bar mitzvahs | 16 |
| Vendors | 12 |
| Walk-ins | 12 |
| Camp shows / trade shows / postcards | ~35 |

**Implication:** the two engines that built this business — squash network + account referrals — are exactly the ones the acquisition pillar scales. Trade shows and postcards worked at small scale; outbound is their modern replacement.

## Financial Update.xlsx (the other sheet)

Kenny's running balance tracker since 2014: Bank, Cash, A/R, camp merch inventories (Driftwood, Crestwood), store/Boast inventory, stock market, auto, and personal loans. Columns are dated snapshots ("changes every day"). Kenny wants this **kept updated** — a candidate for automation once DataOS is in (QBO already provides Bank/AR live). `[CONFIRM with Kenny: which rows he still wants tracked, and whether a QBO-powered replacement would serve]`

## ✅ DONE 2026-07-12: both workbooks are now in Google Sheets

Ryan uploaded both to Google Drive (his account) and Drive converted them:
- **Sales ledger:** [1999thru2026xlsx](https://docs.google.com/spreadsheets/d/1BolliRgdwvrm1lnA3UfdA9cnO42ktTEkJOozx5pi9bY/) — verified complete: all 27,935 rows, 3 tabs (Sales / CUSTOMERS / Sheet3)
- **Financial Update** — converted alongside it (search "Financial Update" in Drive)
- The original .xlsx uploads also remain in Drive as backups; Kenny's Desktop originals untouched

Remaining design work (needs Kenny's buy-in — don't do unilaterally):
- **Ledger** → Google Sheet with the historical tab locked (1999–2026 history is done; don't risk edits) + a live "2026 onward" tab, eventually fed from QuickBooks automatically
- **Financial Update** → rebuild as a live dashboard: Bank/A-R rows pulled from QBO, manual rows (inventories, loans) kept editable for Kenny
- Migration itself is easy (upload to Google Drive → "Save as Google Sheets"); the design conversation with Kenny about which rows/format he wants is the real step
