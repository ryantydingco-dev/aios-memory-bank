# Joey AI Video Skills — How We Use These

## Source Files

**v3 drop (added 2026-07-18)** — from Joey's video "these 3 claude skills save me hundreds of credits" (https://www.youtube.com/watch?v=x5nP-3t6R9o), downloaded via the Dropbox link on his Notion page (tinyurl.com/new-claude-skills):

- `banana-pro-director-30/SKILL.md` — supersedes 2.0. Biggest change: **3-panel character sheets are now the default** (headless full-body front / full-body rear / tight chest-up face lock) — 6-panel is legacy because it starves the face of pixels and causes character drift. Adds ghost-mannequin vs clean-neck-cut head removal, GPT-2 detail mode, and outfit replacement.
- `cinema-worldbuilder-pro-30/SKILL.md` — supersedes 2.0. Adds Frame Map (lock screen position before identity), **FOV in degrees not millimeters** (Seedance snaps to degrees, drifts on mm), write-the-visible discipline (km/h, % haze, observable action — never abstractions), and element tags (@sol_ref) instead of image numbers. Core lesson: prompt density is a bell curve — when 14 iterations deep and getting worse, reset the prompt and add back only what's necessary.
- `story-bible-builder/` — **new**. Interview-driven: walks you through premise, timeline, factions, locations, character voice/movement locks, and production rules, then outputs a canon SKILL.md you install so every future prompt already knows your world. Stacks with the other two: bible = who and why, Banana Pro = what it looks like, Worldbuilder = how it's shot.

All three are also installed at `~/.claude/skills/` so they load in every workspace.

**v2 originals** (kept for reference) — imported from the two ZIPs Ryan uploaded:

- `banana-pro-director-2.0/SKILL.md`
- `cinema-worldbuilder-pro-2.0/SKILL.md`

These are stored in this folder as reference material for Ryan's content system. They are not automatically installed as Hermes runtime skills yet; they are long prompt grammars for Higgsfield/Seedance-style image and video creation.

## Strategic Use
We use these to improve Ryan's content visuals, especially:

- funny Higgsfield scenes for LinkedIn posts
- YouTube Shorts pattern interrupts
- recurring character/metaphor visuals
- chapter-break visuals in longform videos
- polished proof/visual assets for AI workflow education

## What Banana Pro Director Is For
Banana Pro Director is the image asset builder.

Use it to create:
- face-locked characters
- base outfit references
- 6-panel character sheets
- scene plates
- detail face shots
- outfit replacements

Ryan-specific uses:
- Spreadsheet Goblin character sheets
- Overconfident AI Intern character
- CRM Gremlin
- Cursed Borrower Docs visual scenes
- Tool Duct Tape Monster
- Ryan-style AIOS command cave scenes

Key lesson from the skill:
- build characters in strict order
- use mid-gray backgrounds for character references
- avoid plastic AI gloss
- lock face/identity before outfit and scene work
- create references first, then scenes

## What Cinema Worldbuilder Is For
Cinema Worldbuilder is the video prompt director.

Use it to create:
- Seedance/Higgsfield video prompts
- cinematic scene movement
- multi-shot sequences
- sound beds
- camera/lens/stylistic direction
- mode-specific scenes: narrative, studio, action, performance, atmospheric

Ryan-specific uses:
- short comedic scenes for Shorts
- LinkedIn visual metaphors
- intro cold opens
- YouTube chapter-break scenes
- visual proof clips around AI/workflow metaphors

Key lesson from the skill:
- prompts should read like production documents
- every shot needs physical/spatial logic
- camera movement and imperfections make outputs feel real
- shorter dense prompts usually render better than bloated poetic prompts
- reference image order matters

## Ryan Content Rule
Use these skills to make content more watchable, not less useful.

The hierarchy stays:
1. practical workflow lesson
2. proof/template/checklist
3. funny cinematic visual metaphor

Do not let the visual gimmick replace the value.

## Default Production Flow

1. Pick the business lesson.
2. Pick the metaphor/character.
3. Use Banana Pro to build image references.
4. Use Cinema Worldbuilder to generate motion scene prompt.
5. Use Higgsfield/Seedance to create the clip.
6. Edit with Ryan's screen proof/workflow lesson.
7. Publish with a useful free artifact.

## Priority Visual Universe
Start with these recurring bits:

- Spreadsheet Goblin
- Overconfident AI Intern
- CRM Gremlin
- Cursed Borrower Docs
- Tool Duct Tape Monster

These should become visual shorthand for Ryan's brand.
