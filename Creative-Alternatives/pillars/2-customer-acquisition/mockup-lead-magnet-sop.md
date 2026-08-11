# The Mockup Lead Magnet — SOP

> **Status: PROVEN LIVE 2026-07-01.** Miller Johnson (law firm, millerjohnson.com) replied to Maclaine's outreach asking "what pieces do you have mocked up?" → within ~1 hour they had 3 photorealistic branded mockups + a personalized Gamma lookbook + a friendly reply drafted. This SOP makes that repeatable for every prospect. It operationalizes `home-run-offer.md`'s "AI mockup wedge" and the 90-day plan's Phase-1 "mockup line."
>
> Worked example on disk: `mockups/miller-johnson/` (logo reference + 3 mockups). Lookbook: https://gamma.app/docs/fjnvptg4fu4kkce

---

## Why this is the lead magnet (the 3 Blockers, solved in one artifact)

Every prospect silently asks: *Is this relevant to me? What exactly am I getting? Can these people actually pull it off?* A mockup of THEIR logo on real products answers all three before a single sales sentence — it's show-don't-tell as a business model. No promo competitor is doing this on touch #1.

## The two-stage motion (don't send the lookbook cold)

**Stage 1 — the tease (cold touch #1):** ONE hero mockup image (the flat-lay kit is the best single image) embedded in a short email/DM + the ask-first CTA:
> "We mocked up [Company]'s logo on a few pieces — want me to send over the full lookbook?"

The reply is the conversion event. Do NOT attach the deck or stack links in cold sends (deliverability + it burns the reveal).

**Stage 2 — the delivery (on any reply or warm/inbound interest):** the full personalized Gamma lookbook + friendly reply, ideally same-hour. Speed IS the wow. CTA = soft call invite with an email-works-too escape hatch (see the Miller Johnson reply for the tone template).

**Stage 3 — the deepener (on the call / in the thread):** ask what their event/season looks like → mock up activity-matched pieces (golf polos, vests, blankets) within the hour. "Your agenda is our shopping list."

## The production line (~15 min per prospect, all proven steps)

1. **Get the logo** — `curl` their homepage, grep for `logo` in src/href (usually an SVG in the theme folder). Fallback: `logo.clearbit.com/<domain>`.
2. **Render a clean reference** — if SVG: cairosvg in the destiny `.venv-inpaint` (needs `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib`), composited onto a brand-appropriate dark card via PIL. White/light logos → dark card; keep products dark so the logo applies as-is.
3. **Upload → UUID** — `higgsfield upload create <ref>.png`.
4. **Generate 3 grounded mockups** — `nano_banana_2`, `--image <uuid>`, 4:5, 2k. The proven trio: (A) flat-lay kit on wood, (B) apparel hero in a setting that matches THEIR world (law office for a firm, gym for a box, field house for a camp), (C) drinkware+cap pairing. Always include the design-lock line ("reproduce the logo EXACTLY… do not warp, rewrite, re-letter") + the negative block (no people/hands/watermarks/garbled text).
5. **QC — non-negotiable** — Read each image at full size; the company NAME must be letter-perfect on every item. One garbled letter = regenerate. (Zero tolerance: the logo is their name.)
   - **Statement pieces / any text beyond the logo (proven fix, TONE 2026-07-02):** NEVER let the model invent lettering — model-drawn slogans read instantly as AI (fake brush scripts, mushy kerning). Design the actual print in PIL first and use it as the reference:
     1. **Find the brand's font**: curl their site, grep the Google Fonts css2 link, and render side-by-side candidates against the logo before committing (TONE's site loaded Syne but the logo was actually Poppins Black — verify against the logo image, not the site body font).
     2. **Use the brand's color, not black**: sample gradient stops from the logo PNG with PIL getpixel and apply them to the slogan text (TONE: #7ECFD6 → #1D9D9A vertical gradient). A generic black print reads as clip-art; the brand teal read as merch.
     3. **Slogan only, no logo lockup** unless asked — equal-width stacked lines (scale each line's font size to a common width), centered on a white card.
     4. Upload THAT as the `--image` reference and prompt: "Apply the print design from the reference image EXACTLY as-is onto the garment chest… realistic screen print: matte water-based ink sitting flat on the fabric, subtly following the folds and knit texture." The model only renders fabric/light; the typography is yours.
   - **Gamma retry rule:** `textMode: preserve` occasionally gets ignored (deck comes back rewritten with the markdown `![](url)` images dropped — detectable by a tiny PDF filesize, ~140KB vs ~1.5MB). Re-run the identical call with `additionalInstructions` explicitly demanding exact text + embedding the provided image URLs; that has fixed it first retry. ALWAYS page-check the exported PDF before sending.
6. **Lookbook** — Gamma generate, `themeId` matched to their brand palette (marine = navy firms), `textMode: preserve` + `cardSplit: inputTextBreaks`, mockup CloudFront URLs embedded as card heroes, `imageOptions: {source: "noImages"}` so nothing fake gets added, `exportAs: pdf`, sharing `externalAccess: view`. 7-card structure: Cover → Kit → Apparel hero → Drinkware → "Anything on Everything" (the order-expander) → Timeline → Contact.
7. **Draft the reply/email** — friendly, mirrors their energy, activities question (the discovery-that-grows-the-order), soft call CTA. Human review ALWAYS before send (house rule) — check names, timeline promises (24-48h proofs / ~2wk production must match what Kenny stands behind), and download the PDF (export links die in ~1 week; the gamma.app/docs link is durable).

## Hard rules

- **No fabricated pricing, stats, or claims** in any deck/email. Approved facts: since 1999, 2,700+ organizations, 75,000+ orders, 24-48h proofs, ~2wk production, "we print anything on everything."
- **Never mention AI/the mechanism** to prospects — this is CA's design team being fast, full stop.
- **Human-in-the-loop on every send** — Ryan or Maclaine approves; Kenny approves anything with pricing.
- **Log every send** for attribution (Ryan-originated tag) + the feedback loop (which mockup trio → replies).

## Segment notes

- **Law firms (validated ICP):** multi-category repeat buyers — retreats, summer associate classes, recruiting, client gifts, holiday. Ranked lists already exist: `outbound/swag_final_law.csv`, `swag_pool_law.csv`, `swag_mt_law.csv`, `swag_w2_law.csv`. Scene language: wood-paneled offices, conference rooms, navy/charcoal palettes.
- **Camps (10.1% reply, proven):** scene = camp/field settings; kit skews tees, caps, water bottles, drawstring bags.
- **Squash/clubs (5.2%):** court settings, performance apparel.
- Match the apparel hero's SETTING to their world every time — that's what makes it feel made-for-them.

## Scale path (next build)

Script the line end-to-end (`mockup-magnet.sh <domain> <company> <segment>` → logo scrape → render → upload → 3 gens → QC contact sheet → Gamma → drafted email in an approval queue). Batch-pregenerate Stage-1 hero images for the top 50-100 of a segment before a campaign launches; build Stage-2 lookbooks on reply only (keeps cost near zero and the wow instant).
