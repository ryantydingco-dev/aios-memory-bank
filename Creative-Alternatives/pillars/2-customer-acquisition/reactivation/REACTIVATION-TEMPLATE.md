# Reactivation / Reorder Engine — Reusable Template

**What this is:** The repeatable system that replaces Kenny's manual "couple hours in QuickBooks finding who bought last year." It (1) finds reorder-due accounts from the data, (2) builds a branded top-5 flyer with the customer's logo, (3) drafts a warm reorder email in Maclaine's voice. Build → draft → human review → send. **Never auto-sends** (operator's code: human-in-loop for customer-facing actions).

First proven on **The Heights Racquet & Social Club** (2026-06-26 dry run): $5,025 in 2025, $0 in 2026. See `dry-run-heights-racquet.md` notes below.

---

## 1. Targeting — how to find who to contact

Source = the QuickBooks CSVs in `context/import/`. Three buckets (from `quickbooks-customer-analysis.md`):

| Bucket | Rule | Size | Play |
|---|---|---|---|
| **Reorder-due** ◀ primary | bought 2025, $0 in 2026 | 118 accounts / $306k | warm reorder nudge |
| Truly dormant (in QB) | had QB sales, now $0 | 11 / $23k | win-back |
| Pre-2025 legacy contacts | in contact list, no QB sales | ~2,350 | `[ASK MACLAINE]` real past customers or dead leads? |

**Selection logic (reusable):**
- Join `qb_sales_by_customer_by_year.csv` (year columns) with `qb_customer_contacts.csv` (email/phone) on customer name.
- Reorder-due = `year_2025 >= threshold AND year_2026 == 0`.
- **Rank by lifetime value, not days silent** — big accounts get a white-glove Maclaine call (Salesfinity); long tail gets the automated email (Gmail/SmartLead).
- **Seasonality matters:** camps/clubs reorder on a calendar (a camp that bought last June is "due" in Mar–Apr, not 24 months later). Tune the window per segment.
- **Route check:** accounts associated with a partner-managed book must route through that partner. Flag, don't blind-send.

Script pattern proven in the dry run (Python over the CSVs): filter on the 2025/2026 columns, join contacts, exclude partner-managed / generic inboxes when a direct decision-maker email is wanted.

---

## 2. Email template (Maclaine's voice — warm, family-business)

Merge fields in `{{ }}`. Keep it soft; the goal is a reply/conversation, not a hard pitch.

**Subject:** `{{ClubName}} — ready when you are for this season`

```
Hi {{FirstName}},

It's Maclaine over at Creative Alternatives — we put together your {{gear_noun}}
last year and I realized we hadn't connected yet about this season.

No pressure at all, just wanted to make it easy. I pulled together the {{N}} pieces
{{segment}} like yours are ordering most right now and put a quick mockup with your
mark on them so you can see it ({{attached|linked}}). If anything jumps out, just
reply and we'll have real proofs back to you within 48 hours — same simple process,
we handle the rest.

And if the timing's not right yet, no worries — just wanted you to have it.

Happy to hop on a quick call too if that's easier.

Warmly,
Maclaine Scher
Creative Alternatives
```

**Merge fields:** `FirstName`, `ClubName`, `gear_noun` (e.g. "club gear", "camp gear", "team apparel"), `N` (usually 5), `segment` ("clubs", "camps", "teams"), `attached|linked` (depends on send channel — see gaps).

**Upgrade when QB line items are available:** swap "the 5 pieces clubs like yours order most" → "the exact gear you ordered last June" + their real items. Far stronger. Needs per-customer line items from QuickBooks proper (not in the summary CSVs).

---

## 3. Flyer template

Rendered HTML saved as `flyer-template.html` (open in browser, edit per account). Design:
- **Header:** CA wordmark + "25 years of getting it right" / customer monogram + name (top-right).
- **Headline:** "Gear your members are reaching for this season."
- **5 product cards:** each a garment illustration in the club's color with a logo badge showing where their mark goes.
- **Footer CTA:** "Reply and we'll have proofs back in 48 hours."

**The top 5 (from `qb_sales_by_product.csv`, CA's real best-sellers):**
Tees (30%) · Sweatshirts (9.5%) · Bags (4.6%) · Caps (2.8%) · Water bottles (2.1%).
Club/racquet variant used: Performance tee · ¼-zip pullover · Polo · Structured cap · Club duffel.

**Make it segment-specific:** show camps the top 5 *camps* order, corporate the top 5 *corporate* orders. More persuasive than a generic list.

**Real product + real logo — PROVEN METHOD (2026-06-26).** The professional way (how SAGE/ESP do it): overlay the customer's EXACT logo file onto a real product photo — never let AI redraw the logo (it mangles text; the mark must be pixel-exact).

Pipeline, all scripted in `assets/mockup_logo.py`:
1. **Pull their real logo automatically from their website.** Most sites expose it as `<img>`/`og:image`. For Wix sites (Heights Racquet is one), strip the `/v1/fill/...` transform from the URL to get the original transparent PNG. logo.dev / Clearbit by domain are fallbacks. (Did this live for Heights Racquet — got their cream "angled lockup" + logomark in seconds.)
2. **Get the product photo.** Best = CA's real catalog blanks from supplier media libraries (**SanMar / S&S Activewear / alphabroder**). Stock (Pexels) or AI-generated clean product shots also work for concepts.
3. **Composite** with `mockup_logo.py` — recolor the logo for contrast on the garment (e.g. navy on white), scale to a chest print (~34% of width), place, soften to 93% opacity so it reads as print. Logo stays exact.

Proof saved: `assets/hrc_tee_real.png` = real white tee photo + Heights Racquet's exact logo (navy colorway). `assets/hrc_logo.png` = their pulled logo.

**Quality tiers:**
- **Flat composite (above)** — reliable, exact logo, runs anywhere, great for flyers. ✅ working now.
- **Photoreal-on-fabric** (logo warps with folds/lighting) — use AI image tools (nano-banana/Gemini image, Replicate, higgsfield). **These need API keys that are wired in the CA workspace, NOT the Memory-Bank session** — run mockups from a CA `/prime` session.
- **SAGE / ESP virtual-sample tools** — promo-industry native, photoreal, if CA has access.

> Note on naming: **"Sendr" = the outreach tool (LinkedIn/video DMs), NOT a product catalog.** Product imagery comes from suppliers (S&S/SanMar/alphabroder). The "which 5 products" data comes from CA's own QuickBooks sales.

---

## 4. Send / draft channel

- Decided 2026-06-26: **not Sendr** for this — hook into an **email draft** via personal/company Gmail (build → draft → human reviews → sends). Salesfinity for the high-value phone-first accounts.
- **Open:** the Gmail draft tool was **not enabled** in the dry-run session ("Mail service not enabled"). Enable the mail connector to close the loop.
- **Constraint:** that draft tool **can't attach files** → flyer must be **inline image or a link**, not a true attachment. Shapes the flyer export (PNG inline vs. hosted link).

---

## 5. Open gaps before this goes live

1. `[ASK MACLAINE]` Are the ~2,350 pre-2025 legacy contacts real past customers (= biggest reactivation list) or dead leads?
2. `[ENABLE]` Gmail mail connector for drafting.
3. `[PULL]` Per-customer line items from QuickBooks for the "you ordered X last year" personalization.
4. `[DECIDE]` Partner-book routing for accounts that invoice through an intermediary.
5. `[CONFIRM]` Brand colors with Kenny (flyer currently uses placeholder navy/coral).

---

## 6. This is Episode 3

Reactivation is the CTR-scored-85 video. Build the live version **on camera with Maclaine + real QuickBooks line items** — the "I rebuilt Kenny's two-hour job in one prompt" beat.
