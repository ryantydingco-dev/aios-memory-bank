# Building "The Intern" — the AI-Ryan avatar pipeline

> GenHQ's consistent-character method (Foundations: character sheets + reference locking +
> consistency anchors) applied to creating one re-generatable character used in every episode.
> Same mechanics that kept the destiNY print pixel-consistent — now for a person.

## Step 1 — Reference photos (RYAN SHOOTS THESE, ~10 minutes)
Wearing the **navy CA quarter-zip** (or closest navy zip/pullover until a real CA one exists —
whatever is chosen becomes canon forever, so choose once):
- 6-8 photos, good even light (light the ROOM, not just the face), plain background
- Angles: front, 3/4 left, 3/4 right, profile, full-body front, full-body 3/4
- Neutral expression + one smiling + one mid-gesture
- Same session, same outfit, same lighting = one consistent identity for the sheet

## Step 2 — Character sheet (engine, one command)
Feed the reference photos to `nano_banana_2` (multi-image reference) to produce a **character
sheet**: a single grid image with the same person in multiple angles/poses on neutral
background. This is GenHQ's "one-click character sheet" pattern — the sheet, not any single
photo, becomes the master reference. Iterate until the likeness is right, THEN freeze it.
- Upload the approved sheet: `higgsfield upload create intern-character-sheet.png` → UUID
- Record the UUID in this file + `reference-ids` (canon, like the destiNY print UUIDs)

## Step 3 — Consistency anchors (Visual DNA Extractor, installed)
Run `/visual-dna-extractor` on the approved sheet → capture the ⚑ consistency anchors (the
3-5 irreducible tokens: face descriptor, hair, the navy quarter-zip, energy). These anchors go
INTO EVERY generation prompt verbatim — they're what keeps The Intern being The Intern across
episodes. Save the anchor block in this file once extracted.

## Step 4 — The locked-frame scene method (per episode shot)
The technique from the reference videos, systematized:
1. Film the real scene on a TRIPOD (never handheld for AI shots). Get the real take first.
2. Pull a still frame from the locked shot (the "base plate") — `ffmpeg -ss <t> -i clip.mp4 -frames:v 1 plate.png`
3. **Eligibility check the plate BEFORE building on it** (their hard-won lesson: a single IP
   item in frame — plushies, logos, posters — kills generation. Clean the set first: no
   branded objects except CA's own).
4. Upload plate → UUID. Then generate with `seedance_2_0`:
   - `--start-image <plate-uuid>` so the background IS the real room
   - Character sheet UUID as reference + the ⚑ anchors in the prompt
   - EXPLICIT stage directions ("The Intern materializes with a soft digital glitch at frame
     right, takes the navy tee held out from off-frame left, ...") — vague prompts drift
   - PHYSICS block (from the /ugc-cinematic-prompt 11-block structure): how fabric moves,
     how the object handoff lands, weight and momentum — this is what sells the composite
   - 4-8 seconds max per AI shot. Always generate **2 takes** and pick the cleaner (technique
     mining rule).
5. QC frame-check (contact sheet, same as destiNY pipeline): likeness, outfit, no warped
   hands ON CAMERA CUTS, glitch-tell present.
6. Upscale the winning take (`higgsfield upscale_video`) before it goes in the edit.

## Step 5 — The edit grammar
- Cut real → AI on action (the toss, the turn, the point) — motion hides the seam
- The Intern ALWAYS enters with the glitch/materialize beat (the honesty tell + its signature)
- Real object versions appear/disappear across the cut (blank tee in real shot, printed tee
  in the return shot — physically print the payoff item; the final frame should always be REAL)
- Sound: trending audio added in-app per platform; a consistent soft "materialize" SFX for
  the Intern's entrances becomes an audio brand

## Canon registry (fill as created)
- Character sheet UUID: `[pending Ryan's reference photos]`
- Consistency anchors: `[pending /visual-dna-extractor run]`
- The Intern's outfit: navy quarter-zip `[confirm which physical garment = canon]`
- Materialize SFX: `[pick once, reuse forever]`
