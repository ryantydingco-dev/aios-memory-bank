# Current Data

> This file holds metrics, data points, and current state information relevant to your role and strategy. It provides Claude with concrete context for analysis and decision-making.

---

## How This Connects

- **business-info.md** provides organizational context
- **people.md** defines the team and who's responsible for what
- **strategy.md** outlines what you're optimizing toward
- **This file** gives Claude the numbers behind the narrative

_Snapshot date: **July 12, 2026** — pulled directly from QuickBooks Online (accrual basis)._

---

## Key Metrics

| Metric | Current Value | Target | Notes |
| ------ | ------------- | ------ | ----- |
| Revenue 2025 (full year) | $2,655,188 | — | Sales $2,876,803 less -$240,332 "Realized Gain" line |
| Net income 2025 | $523,575 (~20%) | — | Expenses incl. Purchases $945K |
| Revenue 2026 YTD (thru 7/12) | $1,370,634 | — | Gross profit $590,859 (43%) |
| Net income 2026 YTD | $291,420 | — | QBO insight: NI trending +13%/mo vs '25 |
| Open invoices (A/R total) | **$671,805** (as of 6/26) | Minimize | **$377,981 overdue, $62,695 of it 91+ days.** (The QBO dashboard's $167K "not paid" figure is only last-30-days invoices.) Invoice chasing = named #1 pain point — top debtors listed in key-metrics.md |
| Paid, last 30 days | $269,653 (115 invoices) | — | |
| New revenue from Maclaine + Ryan | $0 (starting) | $1,000,000 | The 6–12 month growth goal |

## Top Customers — 2025 Sales

| Rank | Customer | 2025 Sales | Vertical |
|------|----------|-----------|----------|
| 1 | USSRA (US Squash) | $79,438 | Squash |
| 2 | Crestwood | $72,433 | Camp/School |
| 3 | Driftwood Day Camp | $64,567 | Camp |
| 4 | Park Slope Day Camp | $54,250 | Camp |
| 5 | Ebner Camps Inc. | $50,439 | Camp |
| 6 | Camp Hazen | $45,554 | Camp |
| 7 | Yale Club of NY | $41,191 | Club |
| 8 | Camp Shibley | $36,717 | Camp |
| 9 | Camp Playland | $36,490 | Camp |
| 10 | Bronx Science Alumni | $36,329 | School |

Also top-20: Open Squash Midtown, CLC Day Camp, Mirman Markovits & Landau (law), NY Squash, Camp Becket, Univ of South Carolina, YMCA Camp Woodstock.

## Current State

- Strong 2026: net income up ~13% monthly vs. 2025 trend (per QBO insights)
- Heavy seasonality: camp trade shows Jan–Apr → summer delivery; back-to-school spirit wear in fall
- Bookkeeping hygiene flags: "ask my accountant" held $207K (2025); one bank feed shows a -$75.8K QuickBooks balance (reconciliation to review with accountant)
- ~1,146 client folders on Kenny's Mac (`~/Documents/`) — the de facto customer archive; many duplicates/inconsistent names (future CRM cleanup project)

## Data Sources

- **QuickBooks Online** (P&L, AR, Sales by Customer) — Ryan and Maclaine have logins; accessed via browser
- **Kenny's 1999–2026 per-order ledger** — `context/import/1999thru2026xlsx.xlsx`, analyzed in `context/sales-history.md` ($32.4M lifetime, 32.7% margin, year-by-year table)
- **Kenny's Financial Update tracker** — `context/import/Financial Update.xlsx` (balance positions since 2014; Kenny wants this kept current)
- Sales-by-month spreadsheets in `~/Documents/Monthly Sales/`
- OrderMyGear (online team stores)

---

## Automation Note

_This file works as a static snapshot, but can be enhanced with scripts that pull live data. The DataOS module can refresh this automatically from QuickBooks. Until then, refresh manually after month-end._

---

_Update regularly — stale data limits Claude's usefulness as an analytical partner._
