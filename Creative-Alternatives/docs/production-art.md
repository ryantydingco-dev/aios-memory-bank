# Production Art Pipeline

> The AI artist: replaces the $75–100/job outside artist for routine art.
> Full playbook lives in the user-level skill `~/.claude/skills/ca-production-art/`
> — this doc is the workspace-side map. Built 2026-07-19.

## Core principle

**Vector art first; everything renders from it.** The mockup, the proof sheet,
and the printer file are the same art — so customer approval at mockup stage
≈ production approval (Ryan's 80–90% target). Never let an image model draw
the art OR the product: feed it the exact rendered art + a real catalog blank
photo; its only job is compositing ink onto a photograph.

## The scripts

| Script | Job |
|--------|-----|
| `scripts/production_art.py <job>/art.json` | Text lockup → art.svg + art-production.pdf + **art-outlined.pdf** (ghostscript -dNoOutputFonts; `pdffonts` must list zero) |
| `scripts/logo_production.py <logo.svg> <w_in> <out.pdf> [hex]` | Customer vector logo → exact-size, single-tone, outlined PDF |
| `scripts/proof_sheet.py <job>/proof.json` | The artist-format proof sheet PDF (red CA header, specs, Pantone chip, disclaimer) |
| `scripts/proof_page.py <manifest>` | Interactive customer approval page (approve / request-change buttons) |

Custom illustration (badges/emblems): Recraft V4 direct API — `RECRAFT_API_KEY`
in `.env`, ~$0.08/gen, native SVG. Raster logo vectorization: vtracer
(needs Python ≤3.12 venv — segfaults on 3.14).

## Job folder convention

`mockups/proof-sheets/<customer-slug>/` — art.json, art.svg, art-*.pdf,
blank-*.jpg, mockup-*.png, proof.json, proof-sheet.pdf.
Reusable blank photos: `mockups/blanks/<vendor-style-color>.jpg`.

## Mockup recipe (kills the AI look)

1. Real logo (grab their actual SVG from their website — never redraw) or
   rendered art PNG at 300dpi.
2. Real catalog blank photo of the EXACT product (Sanmar/S&S/Richardson dealer
   images). **Eyeball it first: dealer photos are often decorated samples or
   crops** (a "blank" padfolio shipped with an Albertsons deboss baked in).
3. Higgsfield `media_upload` both → `nano_banana_pro` with both as role
   "image"; prompt: "keep the photograph EXACTLY as it is… only ADD the
   artwork… do not redraw, restyle, or alter…".

## QC gate (non-negotiable)

Human reads every word on every proof before it leaves — AI type can drop
letters (a real run produced "ACH CLU"). PMS callout governs color, not pixels.
Artist's remaining lane: complex redraws, original illustration, round-3+ revisions.

## Reference

- Artist's original format: `reference/artist-proof-examples/`
- Proven jobs: bach-club-long-lake (full run-through), miller-johnson (first
  live deal: Yeti engrave + padfolio deboss), camp-hazen-badge-demo (Recraft).

## History

| Date | Change |
|------|--------|
| 2026-07-19 | Built + proven end-to-end; first live job attached to the Miller Johnson hot reply draft |
