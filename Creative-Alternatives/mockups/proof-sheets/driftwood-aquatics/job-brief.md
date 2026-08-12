# Driftwood Aquatics — Vector Art + Tank/Tee Mockups

> Job opened 2026-08-12. Customer: **Driftwood Day Camp** (Melville, NY) — top-5 QB account,
> $110k recorded sales. Two AI concept designs approved by Ryan for the vector→mockup run
> using the production-art pipeline (`docs/production-art.md`).
>
> **Action on the MacBook:** drop the two source PNGs into this folder as
> `concept-1-lifeguard.png` and `concept-2-raccoon.png`, then run the steps below.

---

## Concept 1 — "Lifeguards Only" retro surf whistle

Retro 50s-mascot style. Anthropomorphic blue lifeguard whistle (cartoon face, gloved
hands, sneakers) carrying a cream surfboard, walking on sand. Sky-blue background with
clouds, sun burst, gulls.

Text elements (all part of the art — this is a full-back / full-front print):
- "Driftwood" — big red retro script w/ navy shadow, arched
- "AQUATICS" — cream block caps w/ blue underline swash
- "SINCE 1959" — red starburst badge, cream text
- "LIFEGUARDS ONLY" — navy heavy block caps
- "MELVILLE, NEW YORK" — navy spaced caps between rules

Palette (PMS to confirm on proof — estimates from concept):
| Element | Hex (approx) | PMS (est.) |
|---|---|---|
| Script red / burst | #C8102E | 186 C |
| Whistle blue | #1D6FBF | 285 C |
| Navy text/outlines | #1F3A5F | 289 C |
| Sky background | #A8C8E0 | 543 C (or garment color) |
| Cream (board/text) | #F2E8D5 | 7527 C |
| Sun yellow | #FFC72C | 123 C |

Note: if the sky blue becomes the garment color, art drops to ~5 spot colors.

## Concept 2 — Raccoon splash badge

Badge/emblem lockup on cream. Cartoon raccoon leaping from a lake splash, pine trees +
rocks behind, inside a navy/red-ringed arch. Banner below: "DRIFTWOOD" cream block caps
w/ red outline on navy, "AQUATICS" cream caps on blue bar with red trim.

Palette: navy #1B2A4A, red ring/outline #C8102E, splash blues #2E7FD0/#7FB8E8/white,
pine green #2E5E3E, raccoon greys, cream bg #F5EEDF. This one is illustration-heavy —
more colors; good candidate for DTF/DTG rather than screen print, or simplify on redraw.

---

## Run steps (per docs/production-art.md)

1. **Vectorize.** These are AI raster concepts, not customer logos — two routes:
   - Recraft V4 (`RECRAFT_API_KEY` in `.env`) — regenerate each concept as native SVG
     using the concept PNG as style/reference; then fix type by hand (AI type QC gate!).
   - vtracer on the PNGs (Python ≤3.12 venv) for a literal trace, then clean up.
   - Either way: re-set ALL text as real type in the SVG — never ship traced AI lettering.
2. **Production files.** `scripts/logo_production.py <art.svg> <width_in> <out.pdf>` per
   placement once each SVG is final. Suggested imprints: full front ~11"w (tee),
   ~9"w (tank, narrower canvas).
3. **Mockups.** Real catalog blanks → `mockups/blanks/`:
   - Tank: e.g. Next Level 3633 or Bella+Canvas 3480 (white or light blue heather)
   - Tee: e.g. Comfort Colors 1717 (Chambray / Ivory) — matches the retro look
   Then Higgsfield `media_upload` blank + rendered art PNG → `nano_banana_pro`
   composite ("keep the photograph EXACTLY as it is… only ADD the artwork…").
4. **Proof sheets.** `proof.json` per product → `scripts/proof_sheet.py`. Title format:
   "DRIFTWOOD AQUATICS - TANK MOCKUP" / "- TEE MOCKUP". PMS callouts govern color.
5. **QC gate.** Read every word on every proof ("ACH CLU" rule). Confirm "SINCE 1959"
   against Driftwood's actual founding year before anything leaves the building.

## Angle

Same-day-mockup proof-of-value for an existing top account + the build-in-public
episode beat: "the AI artist just designed a merch line for a $110k customer."
