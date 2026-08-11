# Operations Discovery — Creative Alternatives

> Living document. Filled 2026-07-12 from the **2026-07-05 backend audit** (Kenny/Mickey/Maclaine answers via Ryan — `context/import/backend-audit/2026-07-05/async-response.md`), the source-of-truth map in `backend-automation-build-plan-2026-07-05.md`, the gap map in `backend-initial-gap-map.md`, and QuickBooks data in `context/current-data.md`. Remaining unknowns are marked `[CONFIRM]`.

## How to run it

Use **`backend-systems-intake.md`** for the backend systems intake and **`ops-audit-interview-kit.md`** for the broader operations interview. Start with `backend-questions-for-ryan-now.md`, then shadow 5 real orders from first contact to payment/reorder. For every step, capture the five things in the workflow table. The goal is a baseline you can automate against and measure.

**Status:** first intake round DONE (Q001–Q016 answered/partial). Next: the 5-order evidence walkthrough (`backend-reality-walkthrough.md`, packets scaffolded under `context/import/backend-audit/2026-07-05/orders/`) to validate the map below with real artifacts.

---

## 1. Workflow map

Validated shape (from the audit — replaces the guess):

`inquiry (email/phone/text/website) → quote → order finalized → QuickBooks PO to vendor/printer → proof attached to PO → production (tracked in Google Sheets) → shipping/tracking (Sheets + Kenny email) → invoice (Maclaine, 15-day cadence) → payment (QB link / checks) → reorder (not tracked)`

| # | Step | Who does it | Tools used | Time per order | Where it breaks / the pain |
|---|------|-------------|------------|----------------|----------------------------|
| 1 | Inbound request / lead | Kenny & Maclaine | Kenny email, Maclaine email, phone, text, website, repeat customer threads — **all channels active** (Q006). Kenny still runs an active AOL inbox; 3 active addresses total (2 CA + 1 AOL, Q007). Maclaine can see all email (Q008). | `[CONFIRM]` | Pre-order requests live only in email/text — **no shared label/folder/tag marks active orders** (Q009). Orders can get buried in threads (G-007). |
| 2 | Quote / pricing | Kenny `[CONFIRM]` | Annual pricing PDFs/Word docs from the three print shops, saved on desktops. QB **estimates not confirmed in use** (Q002). | `[CONFIRM]` | Pricing rules live in desktop docs, not a system. No job/margin visibility — vendor costs not tied to orders (Q004; G-003: product COGS shows $0 in QB). |
| 3 | Order intake | Kenny/Maclaine | Once finalized, the order is tracked in **Google Sheets**; first QuickBooks object created is a **purchase order** (Q003, Q009). | `[CONFIRM]` | No single order/job ID across email, QB, sheets, proof, tracking (G-006). Handoff from email/text to "real order" is manual judgment. |
| 4 | Supplier / decorator selection | Kenny `[CONFIRM]` | Known print shops: **Diamond, Viking**, plus "random vendor" jobs and **Todd** (Q015). Merch sources incl. S&S Activewear / SanMar `[CONFIRM which]`. | `[CONFIRM]` | Selection logic is in Kenny's head. Vendor master data not yet compiled (`templates/` has the tracker). |
| 5 | Proof & customer approval | Artist creates; **Kenny approves** | Artist → CA → **final proof attached to the PO in QuickBooks**; Kenny may also save proofs on his desktop (Q013). | `[CONFIRM]` | Approval evidence isn't consistently tied to order status (G-009). Proof speed (24–48 hr) is CA's differentiator — protect it. |
| 6 | Production tracking | Print shops + Maclaine/Kenny | **Google Sheets** — print shops have access and update completion + tracking themselves (Q009). | `[CONFIRM]` | **No single open-order list** — active orders split across the Diamond, Viking, and random-vendor sheets (Q014). Status truth fragmented across QB, email, text, and 3+ sheets. |
| 7 | Fulfillment | `[CONFIRM]` | `[CONFIRM]` | `[CONFIRM]` | Not yet mapped — cover in the 5-order walkthrough. |
| 8 | Shipping / delivery | Print shops / vendors | Print shops add tracking to the sheets **when on top of it**; other vendors email tracking to **Kenny's inbox** (build-plan map). | `[CONFIRM]` | Tracking arrives in two places and isn't reliably copied to the sheet (G-012). Delays customer status answers and invoicing. |
| 9 | Invoicing / payment | **Maclaine** (invoices); Kenny (checks) | QuickBooks Online. Maclaine sends invoices **every 15 days when due**. Most customers pay via the QB link (ACH/card); checks handled by Kenny. Vendor POs/bills also in QBO (Q010–Q011). | `[CONFIRM]` | **The 8-hour reconciliation** (Q005): vendor bills paid on the spot / outside net terms weren't marked paid in QB → team reconstructed payments, called vendors for statements, re-verified pricing. A/R: **$671,805 open, $377,981 overdue, $62,695 at 91+ days** (6/26 export) — invoice chasing is the named #1 pain. |
| 10 | Reorder / follow-up | Nobody (today) | None — **no reorder flag or list exists** (build-plan map). | n/a | Missed repeat revenue: QB analysis found **118 accounts that bought in 2025 with $0 in 2026** (~$306k of 2025 spend). The 1999–2026 master ledger ($32.4M lifetime) is the mining source. |

## 2. Tool stack today

Confirmed 2026-07-05 unless noted:

- **Accounting:** QuickBooks Online (Q001). In use: invoices, purchase orders, bills. NOT confirmed: estimates, sales receipts, classes, projects, custom fields (Q002). POs created & sent from QBO by Maclaine or Kenny (Q010–Q011).
- **Email:** 3 active addresses — 2 Creative Alternatives + Kenny's AOL (Q007). Maclaine has access to all (Q008). Vendor/printer confirmations arrive in **Kenny's email** (Q012). No shared labels/folders (Q009). (Google Workspace migration planned — see `plans/`.)
- **Spreadsheets (Google Sheets — a core operating system, not a side artifact):** the **Viking** sheet, **Diamond** sheet, **random-vendor** sheet, **Todd** sheet, and the **master order sheet tracking every order since 1999** — the most important sheet to never break (Q015). Print shops edit the vendor sheets directly.
- **Order/quote system:** none. Pre-order = email/text; post-finalization = Sheets + QB PO.
- **Pricing reference:** annual pricing PDFs/Word docs from the three print shops, saved on desktops — not yet collected into `context/import/` `[CONFIRM which docs]`.
- **Web store platform (branded-store offer):** OrderMyGear (`context/current-data.md`).
- **Customer archive (de facto):** ~1,146 client folders on Kenny's Mac `~/Documents/` — duplicates and inconsistent naming; future CRM cleanup.
- **Supplier portals / vendor APIs:** none in use. Candidates when ready: S&S Activewear API, SanMar web services, PromoStandards `[CONFIRM credentials]`.

## 3. Time & pain log

Quantified so far (fill per-step hours during the 5-order walkthrough):

| Step | Hours/week | Error/delay rate | Annoyance (1–5) | Notes |
|------|-----------|------------------|------------------|-------|
| Vendor bill / payment reconciliation | **8 hrs in one day** (worst case, documented) | Bills paid on-spot not marked paid in QB | 5 | Q005 — required vendor statement calls + price re-verification. Target of the paid/unpaid control. |
| Invoice chasing / A/R follow-up | `[CONFIRM]` | $377,981 overdue of $671,805 open; $62,695 at 91+ days | 5 (named #1 pain) | See `ar-collections-plan.md`. Cash lever, relationship-sensitive. |
| Order status lookup ("where is job X?") | `[CONFIRM]` | Truth split across 3+ sheets, QB, email, text | `[CONFIRM]` | The Open-Order Command Center target. |
| PO confirmation chasing | `[CONFIRM]` | Confirmations land only in Kenny's inbox | `[CONFIRM]` | Q012; biggest handoff gap per build plan. |
| Quoting / pricing lookup | `[CONFIRM]` | Pricing docs on desktops | `[CONFIRM]` | |
| Reorder follow-up | 0 (not done) | 118 lapsed 2025 buyers | — | Revenue leak, not a time sink. |

## 4. Automation backlog (ranked)

Scored by the intake analyzer (`outputs/operations/backend-intake-analysis-2026-07-05/`) + build-plan sequencing. **Priority = hours saved × ease**, tempered by evidence readiness. All v1 builds are read-only / draft-only.

| Candidate | Score | Readiness | Human-in-loop? | Notes |
|-----------|-------|-----------|----------------|-------|
| **Open-Order Command Center** (unify Diamond/Viking/random-vendor/master sheets into one status view) | build #1 | Needs sheet read access + column headers | Yes — reports & drafts only, never edits source sheets | Creates the order ledger every later automation needs. |
| **PO/printer confirmation tracker** (QB POs vs Kenny-inbox confirmations vs sheet status) | 67.0 — top analyzer score | Needs 1 sample PO + confirmation/tracking flow | Yes — follow-up drafts marked "Needs approval" | Biggest handoff gap (Q012, G-005). |
| **Vendor bill paid/unpaid control** (exception report: likely-paid bills still open in QB) | 60.0 | Needs bills + payments export, on-spot-payment rule | Yes — review queue only, never marks bills paid | Directly attacks the 8-hour reconstruction (Q005). |
| **AR action worklist** | 56.0 | Needs open-invoice detail + A-tier relationship notes | Yes — Kenny/Maclaine send everything | $671k open / $378k overdue. See `ar-collections-plan.md`. |
| **Read-only email intake index** (order requests / confirmations / tracking not yet in sheets) | 34.0 (as daily brief) | Needs read-only IMAP on 3 inboxes | Yes — no auto-label, no auto-send | Q006–Q009; visibility without changing how Kenny sells. |
| **Reorder opportunity list** (mine the 1999 master ledger + QB) | ✅ **BUILT 2026-07-12** (`scripts/reorder_rescue.py`) | Rerun any time after `/update-data` | Yes — every outreach drafted for approval | 97 accounts / $296,613 at risk + 96 ledger-only reactivation candidates ($2.2M lifetime). Output: `outputs/reorder-rescue-*/`. Master plan: `plans/2026-07-12-backend-automation-builds.md`. |
| Auto-draft quotes from a request | — | Blocked on pricing docs + margin model `[CONFIRM]` | Yes | Revisit after pricing PDFs are collected. |

## 5. First automation (decision)

- **Chosen (2026-07-05):** **Open-Order Command Center + PO/Printer Confirmation Tracker** — uses systems CA already trusts, kills status confusion, touches no customer/vendor/money action, and builds the order ledger everything else needs. First money-side follow-up: **Vendor Bill Paid/Unpaid Control**.
- **Baseline it replaces:** status truth split across 3+ sheets/QB/email/text; 8-hour worst-case bill reconstruction; `[CONFIRM]` weekly hours on status lookups + PO chasing.
- **Target:** one unified open-order view with exception flags (missing PO / confirmation / proof / tracking / invoice), and a paid/unpaid review queue that makes an 8-hour reconstruction impossible.
- **Build approach:** human-in-the-loop, read-only v1. No QB writes, no sheet edits, no auto-send. Specs: `backend-first-automation-specs.md`; working surface exists at `outputs/backend-ops-command-center-2026-07-05/…xlsx`.
- **Blocking evidence still needed:** the `order-01`…`order-05` packets (scaffolded, empty), sheet column headers + read access, QB export-vs-API decision, email read-only access.
- **Proof to capture for Episode 1:** before/after of "where is this order?" + the five-systems story — *"the family business didn't have one broken system; it had five working systems that didn't talk to each other."*

## 6. Open questions for Kenny/Maclaine

Carried from the build plan + unresolved intake items:

- **Q016 (unanswered):** which backend pain do *they* want fixed first — the answers point at paid/unpaid bill control and the open-order tracker, but Kenny hasn't picked.
- Which recent printer/decorator order becomes `order-01` for the evidence walkthrough?
- Exact column headers of the Diamond, Viking, random-vendor, Todd, and 1999 master sheets — and who owns each sheet (CA, Kenny, Maclaine, or the print shops)?
- Can AIOS get read-only Google Sheets access? QBO read-only API access, or CSV exports for v1? AOL/CA email read-only IMAP?
- Which vendors/printers are safe to monitor automatically (but never contact automatically)?
- Which pricing PDFs/Word docs should be copied into `context/import/` first?
- Margin model — how do they price/mark up? (QB shows $0 COGS on product lines; costs aren't job-tied.)
- What must a human always touch (do-not-automate rules)? All customers require personal handling from Kenny — confirm vendor-side rules.
- What can and can't be shown on camera?
