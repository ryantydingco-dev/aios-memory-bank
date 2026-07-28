---
name: ca-reactivation-engine
description: "CA warm-base reactivation + referral engine built 2026-07-09 from QuickBooks exports — the warmest/cheapest lead channel (mine the 2,700-customer base) vs cold email. Master table + segments + Maclaine-voice sequences."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6a82da70-d9a0-49e3-a1f8-4169d10ad29a
---

Built 2026-07-09 after a lead-channel review showed CA's own SmartLead data: **warm/fit niches convert ~10x cold** (summer camps 68% open / ~10% reply vs cold Financial 49%/0.4% + Law 43%/0.8%). So the highest-ROI move isn't more cold volume — it's mining CA's existing 2,700-customer base. This is that engine. Warmest, cheapest channel; the whole $3M was built on word-of-mouth. Sends WARM from **Maclaine's real inbox** (Ryan's choice) — NOT the cold lookalike pool (relationship footing = better deliverability + trust); ~40/day, honor stops instantly, no discount gimmicks (see [[ca-no-discount-gimmicks]]), mockup-led on the reply.

**KEY DATA REALITY:** QuickBooks only holds ~2025-2026 order history (confirms Ryan's "QB only goes back so far"); the **1999-2024 order history is trapped in spreadsheets, not digitized** (Phase 2). QB exports already sat in `context/import/`: `qb_customer_contacts.csv` (2,131 customers, **1,306 email / 61%**, 1,359 phone) + `qb_sales_by_customer_by_year.csv` (~356 with 2015-2026 revenue, really only 2025-26 populated). So "reactivation" is defined as **on-file + has email + NO order in last 2 yrs** — launchable today without touching a spreadsheet.

**Engine = `scripts/ca_reactivation.py build --out outputs/reactivation/<date>`** — merges the two QB files into `customers_master.csv` (name, email, phone, last_order_year, total_spend, n_years, segment) + emits segment CSVs. **Verified live output 2026-07-09:** 2,131 contacts → **981 reactivation** (win-back, sorted by known spend — top: Corey Modeste $7,225/last 2019, Mike Vargas $3,214/2023, Hudson Valley Ceremonies $2,278/2024; only 10 have QB-era spend, rest need Phase-2 history) · **338 active** (recent buyers w/ email; 138 are 2+yr repeat = best referral targets) · **502 phone-only** (call lane) · 310 no-contact.

**Sequences (Maclaine warm voice, mockup-led, no gimmicks):** `pillars/2-customer-acquisition/reactivation/reactivation-referral-sequences.md` — Seq A win-back (3 touches: re-open → what's-new → graceful "close your file?" close) for the 981; Seq B referral-ask (repeat buyers) + reorder nudge (all active) for the 338. Referral reward = great service / genuine swag thank-you, NEVER a discount.

**Status:** foundation + copy DONE, awaiting Ryan: (1) approve/tweak copy, (2) confirm Maclaine's sending inbox + warmup, (3) first ~40-lead batch → replies to Telegram → same-hour mockup → log to `data/originated-ledger.csv`. **Phase 2 (the sharpener, not a blocker):** digitize the 1999-2024 spreadsheets (AI extracts per-customer order history → merge into master) → fills `last_thing`/real lapse dates so Email 1 becomes "you ordered ~200 camp tees every spring '08-'19 — here's this year's mockup," AND surfaces deeply-lapsed big spenders QB can't see. Ryan must point to the spreadsheet files (location/format unknown). Existing reactivation pillar assets: `REACTIVATION-TEMPLATE.md`, `flyer-template.html`, `assets/mockup_logo.py`. Related: [[creative-alternatives-aios]], [[ca-outbound-pipeline]], [[ca-tradeshow-signal]], [[promo-market-landscape]].
