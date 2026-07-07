# The Video Factory

The system that turns one real business action into a record-ready video package.
Goal: you capture a workflow, paste the notes to Claude/Codex, and get back everything you need so you can **open a slide deck, press record, and just talk.**

---

## The handoff (how tools feed the factory)

The primary source is now the $3M promotional products business case study. Tools like Meedro, VidIQ, 1of10, Firecrawl, Apify, and IdeaBrowser support packaging and research, but the episode must start from a real business problem or system.

**IdeaBrowser is still connected** via your remote MCP endpoint (`plugins/ideabrowser/.mcp.json`). Use it for adjacent trends, but do not let it replace the promo-products case study.

```bash
cd "Content-OS/90-Day-YouTube-Sprint"
python ideabrowser-fetch.py profile                                  # your archetype / fit
python ideabrowser-fetch.py ideas --sort highest_opportunity         # top validated ideas
python ideabrowser-fetch.py ideas --query "google business profile"  # search a niche
python ideabrowser-fetch.py trends --sort growth --limit 15          # breakout keywords
python ideabrowser-fetch.py research --idea 1458                      # Tier-1 research on an idea
python ideabrowser-fetch.py research --idea 1458 --section go_to_market  # deep section
```

Three ways to drive it:
1. **Real business action** - "Run the Video Factory on today's quote follow-up system."
2. **Packaging intelligence** - paste Meedro/VidIQ/1of10 hooks and ask for the best angle for the current business system.
3. **Adjacent trend** - use IdeaBrowser only if the trend connects back to the $3M promo products transformation.

Deep-research sections available via `--section`: `competitive_analysis, traction_analysis, market_stage_analysis, why_now_analysis, community_analysis, acp_analysis, execution_plan, go_to_market, product_opportunities, proof_signals, market_gaps, founder_fit, keyword_research`.

---

## What you get back (the package)

Every run produces a folder under `episodes/epNN-slug/`:

| File | What it is | How you use it |
|---|---|---|
| `script.md` | Teleprompter-ready script in your voice + packaging | Read it on camera. Don't memorize. |
| `slides.html` | Self-contained screenshare deck | Open in browser, fullscreen, screen-record while you talk |
| `artifact/` | The proof asset (only when the video needs an interactive one) | Demo it on screen |
| Packaging block (inside script.md) | 5 titles, thumbnail concept, description, 5 Shorts, 2 LinkedIn, 1 X thread | Copy-paste at publish time |

---

## The record-and-yap workflow (your actual daily loop)

1. **Pick today's business action**: audit, lead research, follow-up, dashboard, SOP, or tool test.
2. **Paste notes/screens/context to Claude**, say "Run the Video Factory on this."
3. **Open `slides.html`** in your browser, hit `F` (or fullscreen the window).
4. **Open `script.md`** on your phone/second monitor as a teleprompter.
5. **Press record** on the ZV-E10 II + start the screen recording.
6. **Talk through the slides**, advancing with the arrow keys. Read the script loosely — inject your real opinion.
7. **Stop. Upload. Copy-paste** the packaging block. Done.

The only human parts: do the real business work, talk, inject opinion, protect private data, publish. Everything else is stamped out.

---

## The slide deck controls (slides.html)

- `→` / `Space` — next slide
- `←` — previous slide
- `F` — toggle fullscreen
- `B` — black out the screen (use between sections)
- Slide counter is bottom-right

Designed for 1920×1080 screen recording. Dark theme, big type, reads clean on camera.

---

## The master prompt (what Claude runs)

> Run the Video Factory on the business action, notes, or packaging angle below.
>
> My wedge / named method: **The AI Operator Install** - Leak (find the revenue or ops leak) -> Map (show the current workflow) -> Install (build a small AI-assisted artifact) -> Verdict (honest business call + what changed, what is still unproven, what gets built next).
> My audience: traditional SMB owners, family-business operators, and 9-to-5 tech/sales/account managers who want to use AI to become operators.
> My voice: friendly peer figuring it out in a real business. Practical, direct, zero guru-speak. I admit what I don't know.
> My proof environment: a real $3M promotional products business with revenue and customers, but no strong go-to-market or operating system. QuickBooks is the main source of truth.
>
> **Follow `Teaching-Style.md` exactly — it overrides any default instinct.** The non-negotiables:
> - ONE idea per video. Boil it down.
> - Don't over-teach. Create a FEELING (it's possible, it's easy, trust me), not an info dump.
> - Before writing, state the belief shift: what they wrongly believe → what they should believe.
> - Teach WHAT / WHEN / WHY-NOT — NOT step-by-step how. The how lives behind the offer.
> - Show the proof artifact to make it feel easy. Name the framework.
> - The CTA is teaching-as-service.
> - Protect private business data. Use fake customer, vendor, order, and financial details if needed.
>
> **Frame on slides, teach on screen** (Nate Herk layer in Teaching-Style.md): slides carry the spine (~5–6), the screen-share carries the teaching/proof. Cut between them. Screen-share the RESULT from the customer's POV — never raw code (audience is non-technical).
>
> Produce:
> 1. `script.md` — teleprompter-ready (8–11 min), hybrid structure below, with [SLIDE]/[🖥️ SCREEN-SHARE]/[OPINION] cues. Include a one-line **Belief shift:** at the top and a **Demo Plan** (exactly what to pull up and do on screen, step by step, customer-POV). Plus a packaging block (5 titles, thumbnail, description, 5 Shorts, 2 LinkedIn, 1 X thread).
> 2. `slides.html` — the SPINE deck only (~5–6 slides: hook, ONE idea + framework, wrong belief, verdict, CTA) with a clear "→ cut to screen-share" marker slide where the demo goes.
> 3. State the **CTA/deliverable** = follow along now; if there is a useful artifact, suggest a future checklist/template/prompt.
>
> Hybrid structure: cold open on artifact or belief shift → [SLIDE] ONE idea + named framework → [SLIDE] their wrong belief + gut-check → [🖥️ SCREEN-SHARE] do it live (proof) → what/why/when-not → [SLIDE] create the feeling to take the next step.
>
> Business action / notes / Meedro hook / VidIQ angle:
> [paste]

---

## Quality bar (don't ship without these)

- one specific problem
- one concrete workflow
- one visible thing on screen
- one clear business verdict
- one honest lesson
- zero private data exposed

Ship the rep. Polish later.
