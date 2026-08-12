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

## Deliverables — RUN COMPLETE 2026-08-12 (remote session)

Full pipeline executed remotely (Higgsfield + vtracer + headless Chromium).
Note: art was **regenerated** from the approved chat concepts (nano banana pro,
palette-locked prompts) because the originals weren't on disk; SVGs are color
traces (vtracer, spline mode) — lettering is traced paths, not re-set type, so
this is proof/mockup grade. For final production, re-set the type per QC rule.

**Download everything (zip, permanent URL):**
https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/2b1185d4-0728-4bb3-960d-5fe0e1e7421f.zip
Contains: both concept PNGs, both traced SVGs, both exact-size vector PDFs
(lifeguard 11"×13.65", raccoon 10"×10", zero embedded fonts).
Unzip into this folder to complete the file-of-record.

Individual files:
- Lifeguard SVG: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/f610814a-9bd9-483c-ab43-3672d74f0ebc.svg
- Raccoon SVG: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/006ed973-44c8-4f7f-a352-085b0c5fdbd5.svg
- Lifeguard production PDF: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/9e387f81-95e6-4eed-babb-ada5744dbd0e.pdf
- Raccoon production PDF: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/245781dc-a9bd-406b-b551-37ac830bcd1b.pdf

Mockups (Higgsfield jobs, in the generations gallery):
- Lifeguard on cream tee: hf_20260812_171600_acffeb66…png (job acffeb66-86ed-41fb-9bad-a4c6050e9672)
- Lifeguard on light-blue tank: job 74eba87d-d050-468f-b1ed-9b69169123b6
- Raccoon on cream tee: job 6764c256-46ea-497a-8034-a23a41aee5eb
- Raccoon on white tank: job f1b7549e-9870-4999-8e90-cc9c01ae2e31
Art job IDs (reusable as Higgsfield media refs): lifeguard b95a0d4e-1623-4dfe-be87-e56acd3362b8, raccoon e46046df-17b0-4e39-8ef6-03b8252a7801.

**Background-removed set (added 2026-08-12, per Kenny's request, for Trish):**
Edge flood-fill key (removes only the connected background field; clouds/sun/
lettering preserved) + re-trace with background paths dropped.
- Lifeguard transparent PNG: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/c49b3647-4adf-4af3-b14d-5ab8fc8cc658.png
- Raccoon transparent PNG: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/43f8015e-c1dc-4991-ae01-dd1a01b08aea.png
- Lifeguard no-bg vector SVG: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/655ceaff-3318-417d-b381-e5a6757db89a.svg
- Raccoon no-bg vector SVG: https://d2ol7oe51mr4n9.cloudfront.net/user_3FAIrUredC1uodQC8sTxKYBU6jd/e802a955-2f88-4ed2-8433-8dbf3534527e.svg
(There are also AI background-remover cutouts from jobs e5185056/c3f1aa2c —
compare both versions; the flood-key set is the pixel-exact one.)

QC still open: read every word on the regenerated art; confirm "SINCE 1959";
mockups are ghost-mannequin studio renders, not catalog blanks (swap in real
Sanmar/S&S blanks for customer-facing proofs if desired).

## Recraft vector step — RUN COMPLETE 2026-08-12 (MacBook session)

The remote session had no network access to Recraft, so this leg ran locally.
Both background-removed PNGs went through `POST /v1/images/vectorize`
(10 credits each). All files below are in this folder — the job is now
file-of-record complete, nothing lives only on CloudFront.

| File | What it is |
|---|---|
| `driftwood-lifeguard-art.svg` / `driftwood-raccoon-art.svg` | **Recraft vector art** — the deliverable |
| `driftwood-lifeguard-production.pdf` (11"w × 13.65"h) | Exact-size outlined production PDF, `pdffonts` = 0 |
| `driftwood-raccoon-production.pdf` (10"w × 10"h) | Exact-size outlined production PDF, `pdffonts` = 0 |
| `driftwood-*-art-preview.png` | Render of each SVG for eyeballing |
| `driftwood-*-nobg.png` | Source transparent PNGs from the remote session |
| `driftwood-*-vtrace.svg` / `-vtrace-production.pdf` | The earlier vtracer versions, kept for comparison |
| `concept-1-lifeguard.png` / `concept-2-raccoon.png` | Approved AI concepts |

**Transparency: confirmed.** No `<rect>` and no full-canvas path in either SVG;
rendered over magenta, the ground shows through everywhere including between
letters and inside the badge gaps. The PDFs render with fully transparent
corners under `gs -sDEVICE=pngalpha` (42% / 51% ink coverage) — no white box.

### Type QC (the "ACH CLU" gate)

**Every word reads correctly in both files** — nothing dropped, nothing garbled.
Checked at high zoom: Driftwood / AQUATICS / SINCE 1959 / LIFEGUARDS ONLY /
MELVILLE, NEW YORK / DRIFTWOOD / AQUATICS.

But this is **vectorized raster, not set type** — the lettering is outlines
traced off the AI concept, so the letterforms carry defects. Re-set in
`production_art.py` before production, worst first:

1. **Lifeguard "AQUATICS"** — worst. The `Q` is malformed (bowl flattened where
   the swash crosses, tail merged into it). Highlight slivers are inconsistent:
   `A` and `A` get triangles, `Q` gets a full rounded pill, `U/T/I/C/S` get
   nothing. Letter bottoms of `AQUA` are eaten where the swash overlaps.
   Stray nick in the swash stroke, bottom-center.
2. **Lifeguard "MELVILLE, NEW YORK"** — roughest at size. Baseline wobbles,
   letter widths and spacing uneven, `O` in YORK has a stray blue blob in the
   counter, flanking rules vary in thickness. Prints ~1/4" tall; wobble will show.
3. **Lifeguard "LIFEGUARDS ONLY"** — reads clean, but counters are
   inconsistently filled: `G/U/A/R/D/O/N/Y` carry light-blue slivers,
   `L/I/F/E/S` don't. Stroke weights drift letter to letter. Small blue speck
   under the leading `L`.
4. **Raccoon "DRIFTWOOD"** — red outline weight varies a lot (heavy on `D/R`,
   thin on `T/W`); the two `O` counters are different shapes; letter tops
   uneven along the arch.
5. **Lifeguard "Driftwood" script** — best of the lifeguard type and reads well,
   but the navy shadow edge is lumpy around the `D` bowl and the `wood`
   descenders, highlight slivers are inconsistent, and there's a stray navy
   fragment above the final `d`.
6. **Raccoon "AQUATICS"** — cleanest type in either file; only a stubby `Q` tail
   and a slightly irregular `S`. The wavy top edge on the blue bar and the
   uneven red trim are container trace artifacts, not type.

Verdict: **proof/mockup grade — good enough to show Trish and the camp, not
good enough to hand a screen printer as final.** Re-set items 1–4 minimum.

**Still open:** "SINCE 1959" is unverified against Driftwood's actual founding
year — confirm before anything leaves the building.

**Housekeeping:** the Recraft API key in `.env` was NOT rotated (Ryan's call —
skipped to keep this run moving). The leaked key is still live and billable;
rotate at recraft.ai → update `Creative-Alternatives-AIOS/.env` line 279.

## Angle

Same-day-mockup proof-of-value for an existing top account + the build-in-public
episode beat: "the AI artist just designed a merch line for a $110k customer."
