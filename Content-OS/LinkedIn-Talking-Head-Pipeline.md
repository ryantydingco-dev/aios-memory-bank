# LinkedIn Talking-Head Pipeline (one-command recut)

Created 2026-08-19. Ryan records raw talking-head brain dumps; a local Claude Code
session turns each into a LinkedIn-ready cut. Pilot video: "my honest opinion setting
up grokbot."

## The loop

1. **Ryan records** into `Content-OS/Content-Bank/raw/YYYY-MM-DD-slug/` :
   - `raw.mp4` (or .mov) — the talking head
   - `broll/` — optional screen recordings and clips referenced while talking
   - `notes.md` — optional: the one-line hook, anything that must stay in or out
2. **Local session runs the recut** (skills already installed in
   `Creative-Alternatives/.agents/skills/`):
   - `talking-head-recut` — transcript-based edit: cut dead air, retakes, rambles;
     keep the strongest take of each beat; punch-ins on key lines
   - `embedded-captions` — burned-in styled captions (most LinkedIn viewing is muted)
   - `hyperframes-media` — transcription, b-roll inserts, stat/text overlays, sfx
3. **Output** to `Content-OS/Content-Bank/ready/YYYY-MM-DD-slug/`:
   - `final.mp4` — captioned, b-rolled cut
   - `caption-draft.md` — LinkedIn post text (Content Factory voice rules apply:
     no fabrication, no discount gimmicks, Ryan edits ~10% and posts)
   - `cutlist.md` — what was cut and why, so Ryan can restore anything
4. **Ryan reviews** (the 20%: which take of him is right, does the joke land),
   posts himself. Human-in-the-loop — nothing auto-posts.

## Output spec

- **Aspect:** deliver 4:5 (1080x1350) as default for feed; keep a 16:9 master for
  YouTube reuse. Frame the recording so a center 4:5 crop works.
- **Hook frame:** first 2 seconds get a text overlay stating the payoff (LinkedIn
  autoplays muted) — pulled from the video's strongest claim, not clickbait.
- **Length:** 60-90 seconds for feed cuts. A longer master can also ship when the
  brain dump earns it; the short cut is the default deliverable.
- **Captions:** brand-styled, high-contrast, 2 lines max, keyword emphasis. No
  emoji spam.
- **Overlays:** when Ryan says a number or names a thing, show it — stat card,
  screenshot, mockup, store-preview page. Approved facts only on overlays (same
  rules as cold copy: 27 years, 2,700+ orgs, 75k+ orders, 24-48h proofs).

## Privacy guardrails (build-in-public ≠ open-books)

Screen b-roll and overlays must NEVER show:
- QuickBooks numbers, revenue, margins, or any financial dashboard
- Customer/lead PII, lead lists, CSVs, CRM records
- Miller Johnson order specifics (naming pending Wil's OK)
- API keys, inboxes, SmartLead campaign internals (counts/copy OK to paraphrase,
  screenshots of lead tables are not)
- Memory-bank contents verbatim (repo is private business data)
Blur or crop anything ambiguous. When in doubt, leave it out — the story works
without the sensitive frame.

## Pilot: "my honest opinion setting up grokbot" (2026-08-19)

Brain dump — no script. A loose beat shape so the edit has structure to find:
1. Hook: the one-sentence honest verdict (say it FIRST, then explain).
2. What I was trying to do: one repo that any AI agent can load my whole business
   from, so my agents stay current without me repeating myself.
3. What actually happened: the good, the annoying, the surprising.
4. The honest opinion: where it's genuinely useful vs. hype.
5. What I'd tell someone doing it tomorrow.
While setting grokbot up, screen-record the process (respecting guardrails above) —
that's the b-roll. Capture 20-30s more than feels necessary per step.

## Recording checklist

- Landscape or 4:5-safe framing, eyes upper third, lens height
- Window light or key light on face; avoid backlight
- Mic close (lav/earbuds beat room audio); record a 5s room-tone clip
- One clap at the start of each take (sync + take marker)
- Say the hook line 3 different ways at the end — the edit picks the best
