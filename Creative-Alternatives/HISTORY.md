# Workspace History

> Chronological log of all work done in this workspace. Updated every session.
> Most recent entries at the top. Each entry has a date, title, and bullet points.
>
> **How it works:** When you run `/commit` after meaningful work, Claude adds an entry here
> automatically. You don't need to write this file yourself.

---

## 2026-08-05

### 60-Day Revenue Sprint launched (day 1 post-layoff)
- Sprint plan created: cold outbound to NEW customers is the commission engine (Ryan earns half the markup on new customers, ~16% of revenue); existing-customer work (holiday cross-sell, camp reactivation, A/R chase) reclassified as proof-of-value channels, timeboxed
- Daily power list installed: 100+ Salesfinity dials, 100+ prospects/day into the machine, same-day mockups, 1-hour reply SLA, daily log table for /weekly-review
- Campaign C1 briefed: corporate holiday gifting (HR/office-manager ICP, 25–500 employees, NY/NJ/CT core, mockup-tease CTA) — ready for /ca-outbound on the MacBook
- Tech stack documented in context/tech-stack.md (Salesfinity, AI Ark, SmartLead + Dealthreads domains, ZV-E10/OBS); Sendr cancelled in favor of Claude-drafted manual LinkedIn touches
- Key files: plans/60-day-revenue-sprint.md, plans/daily-power-list.md, pillars/2-customer-acquisition/holiday-gifting-campaign-brief.md
## 2026-07-28

### Unified operating framework + revenue operations, prepared for secure GitHub handoff
- Consolidated the current control plane across account-based outbound, the Ryan/Kenny/Maclaine content engine, backend modernization, the 30-day execution plan, and reusable operating trackers
- Added the complete draft revenue operating system: QuickBooks data contract, segmentation rules, 90-day Mailchimp plan and templates, offer/outreach system, operating cadence, validation CLI, tests, and a synthetic workbook template
- Added the July 28 Daily AI Landscape brief and updated the Mac Studio setup guide for a secure clone plus separate local-data transfer
- Hardened repository hygiene: raw QuickBooks/ledger files, customer/prospect lists and replies, personalized proofs, runtime reports, machine auth settings, build temp files, and draft renders remain local and are no longer part of the published snapshot
- **Build-in-public angle:** the transformation became a portable operating system without turning private customer data into content

## 2026-07-19

### Loop engine — the self-improving layer
- Built 7 agent loops in `loops/` (outbound-copy, ar-chase, quote-conversion, vendor-ops, deliverability weekly; reactivation, margin monthly), each judged on ONE real metric from data.db with an append-only experiment memory — inspired by the loop-engineering episode
- `scripts/loop_metrics.py` (judge/snapshots/Telegram), `/loop-run` command, `com.aios.ca-loops` launchd Mondays 08:30
- First cycles ran live: Construction GCs campaign paused (0.53% reply), both Swag Handled batches launched (277 leads, sending Mon), 5 A/R chase drafts (~$46k non-camp overdue), fall win-back segment identified (9 lapsed accounts, ~$310k of 2025 revenue)
- Channel policy locked: SmartLead = cold only; chases/reactivation from personal email

### Production-art pipeline — the AI artist
- Replicated the outside artist's full $75–100/job deliverable: `proof_sheet.py` (her exact proof format), `production_art.py` (text lockups → outlined vector PDF, zero fonts), `logo_production.py` (customer SVG → exact-size printer file), Recraft V4 direct API for native-SVG illustration (~$0.08/gen), packaged as the `ca-production-art` user skill
- Killed the AI-mockup look: real catalog blank photo + exact art via Higgsfield two-reference composite — the mockup IS the production file rendered
- First live job: Miller Johnson (hot Swag-Law reply) — Yeti engrave + padfolio deboss mockups with their real SVG logo + both printer-ready art files, attached to Kenny's follow-up draft

## 2026-07-13

### All three order sheets in the daily brief — today / tomorrow / this week
- Built `collect_diamond_orders.py` (DIAMOND <> CA sheet: apparel/embroidery printer — Ship To Date, art status, rush notes like "MUST THURSDAY", bold = hard date, tracking = shipped) and `collect_vendor_orders.py` (RANDOM VENDORS <> CA sheet: promo POs across Wow Line/NC Custom/PrimeLine/etc. — In Hand Date is the customer deadline, vendor captured per order)
- Replaced the Viking-only brief section with one unified 📦 `sec_orders()` across Viking + Diamond + Vendors: going out TODAY, tomorrow, later this week, PAST DUE — with per-sheet counts, ‼️ hard-date, 🔥 rush, unreadable-date and missing-sheet warnings
- key-metrics.md production section unified the same way (counts per sheet + cross-sheet past-due table for /prime)
- Runs automatically with every 7 AM brief — collectors are auto-discovered by `collect.py`, no schedule change needed
- First combined pull (59 orders) immediately surfaced 8 vendor POs past their in-hand date, incl. Legal Services Staten Island fans backordered since 6/26 and two date typos to fix on the sheets (Yale Club "2426-07-01")

## 2026-07-12

### Viking open-orders in the daily brief — first production visibility
- Built `collect_viking_orders.py`: pulls the shared CA/Viking production-schedule Google Sheet (link-share xlsx download, no API key) → `viking_open_orders` table, full reload per run
- Parses the sheet's real quirks: weekly block headers, rush notes in the Dates column, alphanumeric POs (27263F), typo ship dates kept as raw text, and **bold = must-ship-on-date** captured from cell formatting
- New 🏭 brief section (`sec_viking`): counts by status + PAST-SHIP-DATE flags + due-in-3-days (‼️ for bold) + rush 🔥 + unreadable-date nudges; matching section in key-metrics.md for /prime
- First pull immediately surfaced 2 orders past ship date (Open Squash totes, Yale Club duffles — due 7/10, still "On Track") and 6 orders Viking hasn't statused
- CLOSED tab (shipped history) not collected yet — different column layout; other decorators (Diamond, TSF, LISP) still untracked

### ProductivityOS (GTD) installed — tailored to CA
- Created gtd/ (inbox, projects, next-actions, waiting-for, someday, areas, dashboard, review-checklist) with CA-specific areas: CA Operations · Growth/Lead Gen · AIOS & Systems · Content/YouTube · Personal
- Areas of responsibility mapped to the real business incl. Finance & A/R (standard: overdue shrinking from $378K) and Team & Succession
- Installed /process command + dashboard scripts; existing /review (already GTD-aware from Ryan's seed) now has its files; gtd/dashboard.md wired into /prime
- Skipped Telegram integration (team uses Slack; capture-from-Slack can ride the Phase 2 bot)

### Slack Daily Brief LIVE — first brief posted to #daily-brief
- Webhook connected (Ryan created the "AIOS Daily Brief" Slack app); live post verified with real data
- Still pending: Kenny's email mirror (SMTP creds) + Full Disk Access grant for unattended 7 AM runs

### Slack Daily Brief built (delivery pending 2 user steps)
- Slack chosen over Telegram as the team layer (Maclaine created the workspace); CommandOS module bypassed in favor of a Slack-native build
- Built generate_brief.py / post_brief.py / daily_brief.py + 7 AM launchd job; brief content verified against real data (A/R $671,805, chase list with contacts)
- Email mirror to Kenny's AOL included (SMTP via Gmail app password)
- Plans written: slack-daily-brief (In Progress) + aol-to-gmail-migration (Draft — discovery found domain email lives on the web host's own server, IT contact Bill White / convergesc.com)
- Remaining to go live: Slack webhook URL + SMTP app password in .env, macOS Full Disk Access grant

### DataOS activated on Kenny's Mac — 29,192 records in the warehouse
- Created .venv and verified the seeded pipeline framework (db.py / collect.py / generate_metrics.py)
- Built `collect_ledger.py` (25,662 orders from Kenny's Excel → sales_ledger table) and `collect_quickbooks_csv.py` (6 QBO exports → qb_* tables incl. A/R aging + customer contacts)
- key-metrics.md now shows: **true A/R = $671,805 with $377,981 OVERDUE** (dashboard's $167K was only recent invoices) + top-debtor chase list, net income by year, ledger lifetime + pace
- Found: ledger entry lags QBO by ~$790K this year — future automation candidate
- Added `reference/data-access.md` (schemas + ready-made SQL: invoice-chase, dormant reactivation, seasonality), `/update-data` command; wired key-metrics into /prime
- launchd 6 AM job installed but blocked by macOS Documents privacy (needs one-time Full Disk Access grant); /update-data works on demand

### Kenny's 27-year sales ledger + Financial Update added to context
- Imported `1999thru2026xlsx.xlsx` (25,659 orders, invoice #180→#27212) and `Financial Update.xlsx` into context/import/
- Analyzed into `context/sales-history.md`: $32.4M lifetime sales, $10.6M profit, 32.7% margin held for 27 years; 2024 step-change to $2.7M+
- Quantified the reactivation play: ~555 active customers/year vs 2,700+ lifetime → ~2,000+ dormant
- Acquisition sources from Kenny's own records: squash association (117) + account referrals (111) = the historic engines

### ContextOS + InfraOS installed on Kenny's Mac · workspaces unified
- Ran the ContextOS interview (Ryan + Kenny): confirmed roles, priorities (efficiency/invoice chasing, succession, $1M new revenue goal), and tech reality
- Surveyed ~1,146 client folders on Kenny's Mac (read-only) — client roster, vendors, seasonality mapped
- Pulled verified financials from QuickBooks Online: 2025 = $2.65M income / $523K net; 2026 YTD = $1.37M / $291K; top-customer ranking (USSRA, Crestwood, Driftwood, Park Slope, Ebner)
- Set up Git on Kenny's Mac and **merged with Ryan's primary workspace** (GitHub: ryantydingco-dev/Creative-Alternatives-AIOS) — both Macs now sync to one repo
- Answered the open `[CONFIRM]` items in context/business-info.md and context/people.md with verified data; added context/current-data.md (QBO snapshot)
- Created HISTORY.md and the docs/ system; wired them into /prime

## Before 2026-07-12 (Ryan's MacBook)

### Prior work (see git log for detail)
- Seeded the four-pillar workspace: operations, customer acquisition, online presence, YouTube build-in-public
- Migrated outbound campaigns (summer camps 10.1% reply), lead lists, backend audit imports, QB CSV exports
- Built commands: /ops-audit, /episode-capture, /weekly-review, /ca-outbound stack, and more
