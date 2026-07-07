---
name: youtube-video-factory
description: "Ryan's daily YouTube system — turn an IdeaBrowser idea into a record-ready script + screenshare deck so he can press record and talk"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4aa587ab-5626-4d2b-911d-190dc5f5082d
---

Ryan is running a **90-day YouTube sprint (1 video/day)**, filming on a Sony ZV-E10 II, with a ~2-month work deadline (PIP) driving urgency.

**LOCKED STRATEGY (`Content-OS/90-Day-YouTube-Sprint/00 - STRATEGY (North Star).md`) — decided 2026-06-10, SUPERSEDES earlier framing below:**
- **Money game = Game B:** sell his OWN community/product, NOT done-for-you client work.
- **Positioning:** "I help operators/agencies build AI systems that land them clients — and I build them in public."
- **Audience:** online entrepreneurs/operators/agencies whose #1 pain is getting clients (NOT non-technical local business owners — that was the wrong buyer).
- **Teaches:** build an AI-powered client-getting machine (AI GTM — outbound, enrichment, lead-gen, signal prospecting). His deepest real expertise (Oloxa, AI Contact Form, cold email/SMS).
- **Offer:** a **paid community / founding cohort** (recurring; shows up live). First-sales play = open a founding cohort at a founding price to the first warm members; don't wait for scale.
- **Funnel:** build-in-public video → free asset (template/prompt) behind a free community → paid founding cohort.
- **90-day win = FIRST SALES of the community, not views.** Replacing salary in 90 days is NOT the goal.
- **CURRENT PHASE = TRUST/CONTENT, NOT SELLING (decided 2026-06-10).** Ryan deliberately is NOT setting up Skool / the offer yet — wants to build trust + a body of work + audience FIRST. The ONLY CTA right now is "subscribe / follow — doing this in public." No community link, no offer mention. Don't push the funnel; capture + offer come later once trust/audience exist. (Funnel + offer are designed and on the shelf in the docs for when he's ready.)
- The "Boring Business Teardown" content is RE-AIMED at operators (watch me find a niche + build an AI client-getting system) instead of pitching local owners. monetization-offers.md (old $500 GBP audit) + EP01/EP02 (aimed at local owners) are now stale and need re-aiming to this strategy.

**Voice:** build-in-public · "friendly peer figuring it out" · practical/direct/slightly goofy/no guru-speak.

**Ryan's LIVE trench work (= the build-in-public case study):** he's selling a **client invoice recovery system** to **agencies, professional services, and trades**, via cold calling + cold email + LinkedIn (sender.ai). KEY FRAMING: the channel teaches the *client-getting machine* (the transferable skill), NOT invoice recovery — invoice recovery is just his live proof the machine works on a real offer. Distribution strategy in `Distribution & Trust Engine.md`; first content batch (opener + 7-day map + trench template) in `Week 01 - Content Batch.md`. Platforms: YouTube=trust/depth funnel home · LinkedIn=buyers live here, top conversion · TikTok/Reels/Shorts=reach · IG Stories=parasocial. One real action → 1 long-form → shorts → LinkedIn → stories.

**Earlier wedge (now re-aimed, kept for the format):** boring business problem → painful workflow → tiny AI proof artifact → business verdict.

**IdeaBrowser IS connected** (live), via the remote MCP HTTP endpoint in `AIOS/plugins/ideabrowser/.mcp.json` (key `ib_795bb2...`). It's NOT loaded as session tools from the Memory-Bank cwd, but `Content-OS/90-Day-YouTube-Sprint/ideabrowser-fetch.py` (stdlib-only JSON-RPC client) drives it: `profile | ideas --sort highest_opportunity --query X | trends --sort growth | research --idea ID [--section ...]`. Ryan's archetype = "The Architect / The Operator" (builds to be free; blind spot = over-engineers before shipping → daily-ship channel is the cure).

**House teaching style = `Content-OS/90-Day-YouTube-Sprint/Teaching-Style.md`** (synthesizes TWO videos Ryan chose to emulate: Omar El Attkoury's "How To Become A Millionaire in 2026 (Start Teaching)" + Nate Herk's "I Turned Claude Fable Into The Ultimate Second Brain"). Applies to ALL content. Core: teaching = creating a FEELING (possible/easy/trust-me) that makes the viewer take the next step, NOT an info dump. Rules: ONE idea/video; don't over-teach (≠ over-deliver); state the belief shift first; **teach what/when/why-not, NEVER step-by-step how — the how lives behind the offer**; name frameworks; CTA is teaching-as-service; keep it raw.

**Format = "frame on slides, teach on screen" (Nate Herk layer):** slides carry the spine (~5–6: hook, ONE idea+framework, wrong belief, verdict, CTA); the SCREEN-SHARE carries the teaching/proof — actually DO the thing live. Critical adaptation: Ryan's audience is non-technical, so screen-share the RESULT from the customer's POV (the Google profile, the dashboard, AI drafting the fix, before/after) — NEVER raw code. Every script now includes a **Demo Plan** + [SLIDE]/[🖥️ SCREEN-SHARE] cues. Ryan's named method = **The Boring Business Teardown** (Leak → Map → Proof → Verdict). EP02 rebuilt as the worked example: cold-open on a live map, screen-share two real GBP profiles + fix the gap live with AI, 10-point checklist demoted to a free DM deliverable; deck trimmed to a 7-slide spine with a "cut to screen-share" marker.

**The Video Factory** (`Content-OS/90-Day-YouTube-Sprint/Video-Factory.md`): pull/paste an IdeaBrowser idea or breakout trend → get per-episode under `episodes/epNN-slug/`: `script.md` (teleprompter w/ [DECK:]/[OPINION] cues + packaging block) and `slides.html` (self-contained screenshare deck, arrow-key nav, F=fullscreen, B=blackout). EP01 "The Best AI Businesses Are Boring" (template) + EP02 "GBP Panic" (built off live data: +853% "google business profile" breakout trend + idea #1056 LocalLift GBP service) are done and ready to record.

The master prompt + record-and-yap workflow live in Video-Factory.md. Builds on the pre-existing Content-OS (daily template, prompt-bank, monetization-offers $500 audit → $2.5–5k build sprint, video-tracker.csv). Related: [[ai-contact-form-build]].
