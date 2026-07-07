# SESSION RESUME — 2026-05-31 (pick this up first)

Ryan stepped away mid-build. This is the single pickup point. Three workflows discussed; #1 and #2 are LIVE, #3 is mid-build.

## TL;DR state
- ✅ **#1 Outbound battlecard engine** — built, ran on all 20 daily leads. Drafts only.
- ✅ **#2 Daily Telegram brief** — LIVE on a 7:15am schedule, verified sending.
- 🔧 **#3 Weekly learning loop** — facts engine + outcome tracker built; learning workflow LAUNCHED; **review write-up + GTM Brain patch + weekly schedule still TODO**.

---

## ✅ #1 — Outbound battlecard engine (DONE)
Dynamic workflow: per-lead pipeline → verify signal (web) → write multi-channel copy (LinkedIn connect+DM, email, call, voicemail, SMS, 2 follow-ups, objection, sequence) → adversarial brand-QA.
- Workflow script: `.../4843f26d-.../workflows/scripts/oloxa-outbound-battlecards-wf_4604e72d-49e.js` (LEADS array inlined; 20 leads).
- Exporters: `AI GTM Engine/Operations/scripts/battlecards_to_md.py` and `battlecards_to_csv.py` (both handle the task-envelope `result.cards` wrapper + HTML-unescape; md auto-triages SEND/REVIEW/HOLD).
- Outputs (today): `Lead Engine/Outputs/Daily Outbound Battlecards - 2026-05-31.md` (20 cards, 1273 lines) + `Oloxa_Battlecards_2026-05-31.csv` (20 rows × 30 cols).
- **Re-run for a new batch:** run the workflow → `python3 battlecards_to_md.py <task.output.json> "<Outputs>/Daily Outbound Battlecards - <date>.md" <date>` and same for `_to_csv.py`.

### Send decisions from today's run (human review still required)
- **SEND now (6):** Robert Meunier (Bellevue, HIGH), Linzi Crellin (Halo), Chris Solinski (LitFinancial), Grant McIntyre (CFP), Michael Bucaro (Convoy), Matthew Beal (Bellevue).
- **REVIEW (12):** verify the trigger is live before quoting it. Special cases: **Justin Bunch (Ascent) & Chaston Montgomery (CIC) are direct/single-lender — NOT brokers** → use reframed copy (internal ops, not "shop to many lenders"). **Jeff Singleton = residential Non-QM** → confirm Oloxa covers those doc types first. Matt Wood & Lisa Eagle = older signals.
- **HOLD (2):** **Don O'Henly** (hiring line traced to a DIFFERENT firm's recruiter ad — do NOT reference the job ad) and **Jody Hill**.

---

## ✅ #2 — Daily Telegram brief (LIVE)
launchd `com.aios.oloxa-daily` @ 07:15 → `aios-starter-kit/scripts/run-oloxa-daily.sh`:
1. `generate_oloxa_daily_batch.py` → fresh dated Top 20 from HOT/WARM (~2.2k rows), excludes contacts already in HubSpot. **Verified: pulled 467 candidates, excluded 20, wrote Top 20.**
2. `oloxa_daily_brief.py` → composes "Oloxa GTM — <date>" (Ryan 10 / Sway 10, each w/ company+signal; ✅/⚠️/⏸️ triage when same-day battlecards CSV exists; else falls back to latest batch).
3. `telegram_send.py` → self-contained stdlib Bot API sender (creds in `aios-starter-kit/.env`). **Verified: `telegram sent`, exit 0.**

Controls: test = `bash aios-starter-kit/scripts/run-oloxa-daily.sh`; change time = edit `~/Library/LaunchAgents/com.aios.oloxa-daily.plist` then `launchctl unload/load -w`; pause = `launchctl unload`; logs = `aios-starter-kit/logs/oloxa-daily.run.log`.

**Known limitations (by design):** "Hot replies" shows a reminder not a number (needs reply-monitor/HubSpot wiring); brief enriches FROM battlecards but does NOT auto-run the 60-agent workflow nightly (~2M tokens/run — left on-demand).

---

## 🔧 #3 — Weekly learning loop (RESUME HERE)
**Reality check that shaped the build:** there are **zero outcomes** yet — reply-monitor = `0 campaigns, 0 replies`; Experiment Tracker empty; no Smartlead data; 20 HubSpot Oloxa contacts but no reply/meeting fields. So outcome-learning is honestly impossible this cycle. Decision: build the machine, gate outcome-learning, and run the PRE-LAUNCH learning that real data DOES support (the 20 battlecards).

### Built so far
- `AI GTM Engine/Operations/scripts/gtm_learning_facts.py` — computes REAL facts deterministically (no LLM, can't hallucinate) from the battlecards CSV + outcome tracker. Emits JSON.
- `Lead Engine/Outputs/Oloxa_Outcome_Tracker.csv` — seeded (header only) per the Outcome Tracker Schema, so post-launch logging has a home.
- Learning workflow `oloxa-gtm-learning-loop` — LAUNCHED this session (2 phases: Interpret signals + data-quality in parallel → Synthesize review + brain patch). **Raw result is in the newest `.../tasks/*.output` under the transcript dir — READ IT FIRST on resume.** If unreadable, just re-run the workflow (facts are inlined in its script + recorded below).

### REAL facts (2026-05-31) — CANONICAL, computed by gtm_learning_facts.py + verified per-lead from the CSV. Use these.
- 20 leads → **SEND 6, REVIEW 12, HOLD 2 (30% send-ready)**.
- Signal→action: **CLOSING 4 SEND / 7 REVIEW / 0 HOLD · HIRING 1/1/2 · PAIN 0/3/0 · VOLUME 1/1/0**.
- Segment→action: **UK 2 SEND / 8 REVIEW / 1 HOLD · US 4 SEND / 4 REVIEW / 1 HOLD**.
- Recency: unverifiable 5 · older 2 · 1-3 months 9 · 0-30 days 4.
- Outcomes: **0 sent / 0 replied / 0 meetings** (has_outcomes = false).
- (NOTE: an earlier draft of this doc mis-stated UK 3/US 3 and CLOSING 3 — those were a hand-transcription error; the numbers here are canonical, reconciled against the CSV.)

### Provisional findings (ONE batch, no market feedback — all PROVISIONAL until replies)
1. **PAIN is your #1-ranked signal but produced 0 of 6 send-ready cards** — because PAIN is scraped from posts behind the LinkedIn login wall (HTTP 999), so it can't be re-verified. The taxonomy ranks by *relevance*; reality is gated by *re-verifiability*.
2. **CLOSING produced the most send-ready cards (4/6) with zero holds** — most reliable signal in practice (deal posts are more public/verifiable).
3. **US out-performed UK on send-readiness (US 4 SEND vs UK 2 SEND)** — the OPPOSITE of the "UK looks cleaner" assumption in ICP Map.md. Provisional (n=20) but worth testing.
4. **The real bottleneck is signal re-verifiability, not signal type.** Candidate scoring change: add "re-verifiable public evidence" as a scoring input; trust gated-PAIN less.
5. **Both HOLDs are HIRING leads** — Don O'Henly (signal misattributed to a DIFFERENT firm's recruiter ad) and Jody Hill (lender-side, in-house processing). HIRING is taxonomy #2 but went 2-of-3 to HOLD here. Argues for a verify step on every signal before outreach.

### Status: learning loop BUILT. Weekly scheduler WRITTEN but UNVERIFIED (flaky terminal).
1. ✅ Read learning-workflow synthesis (corrected run `w2dpn8gyv`).
2. ✅ Wrote `Experiments/Weekly GTM Review - 2026-05-31.md` (rich, from the 3-agent workflow).
3. ✅ Patched `Strategy/Oloxa GTM Brain.md` (Learnings Log, 5 provisional claims) + `ICP Map.md` (UK-cleaner = UNVALIDATED).
4. ✅ Built `gtm_learning_facts.py` (deterministic), `gtm_learning_prompt.md`, `aios-starter-kit/scripts/run-oloxa-learning.sh`, `com.aios.oloxa-learning.plist` (Sun 18:00).
5. ✅ **DONE — verified + loaded.** Ran end-to-end (facts → claude -p → review → Telegram, exit 0, ~28s). `com.aios.oloxa-learning` loaded + registered (Sun 18:00). Rich 3-agent review restored as today's artifact of record.
6. Once outreach launches: log every touch into `Oloxa_Outcome_Tracker.csv` so the loop produces REAL outcome learning (until then it re-analyzes the same 20 cards — consider manual weekly runs, and run the full `oloxa-gtm-learning-loop` workflow rather than the cron for the richest review).

### Both scheduled jobs now live
- `com.aios.oloxa-daily` — 7:15am daily — battlecard batch + Telegram brief.
- `com.aios.oloxa-learning` — Sun 18:00 weekly — facts → synthesis → review + Telegram.
- Pause either: `launchctl unload ~/Library/LaunchAgents/<label>.plist`. Logs: `aios-starter-kit/logs/oloxa-*.run.log`.

---

## ✅ Batch One send + logging path (BUILT 2026-05-31)
The execution surface so batch one actually ships and feeds the loop.
- `Operations/scripts/build_send_board.py` → `Lead Engine/Outputs/Batch One Send Board - 2026-05-31.md` (6 SEND leads, copy-paste drafts + per-lead log command, CLOSING-first launch order). Also pre-seeds the tracker.
- `Operations/scripts/log_outcome.py` → one-line outcome logging (no CSV hand-editing). Verified: a full sent→replied→meeting log flips `gtm_learning_facts.py` has_outcomes=true, so the weekly loop becomes real outcome learning.
- Tracker `Lead Engine/Outputs/Oloxa_Outcome_Tracker.csv` pre-seeded with 6 QUEUED rows (Meunier, Bucaro, Beal, McIntyre, Crellin, Solinski).
- **TO SHIP:** open the Send Board → `export SC="…/Operations/scripts"` → per lead, send copy + run its log command. ⚠️ verify Smartlead sender/domain before EMAIL sends; LinkedIn is manual.

## ✅ #4 Inbound content factory (BUILT 2026-05-31)
Workflow `oloxa-content-factory` (draft per pillar → grade vs Content Grader → strip AI tells). Ran: 7 posts, avg 8.7/10.
- Delivered: `Inbound/Oloxa Content Calendar - Week of 2026-06-01.md` (399 lines — per-day post + short-form script + comment targets + grader scores). Tue & Fri scored 8.4 (⚠️ below 8.5 bar — review before posting).
- Renderer: `Operations/scripts/content_to_md.py` (deterministic).
- Weekly automation: `aios-starter-kit/scripts/run-oloxa-content.sh` + `content_factory_prompt.md` → `com.aios.oloxa-content` plist (Sun 16:00, LOADED). Uses headless `claude -p` (single-agent) — the richer version is the `oloxa-content-factory` Workflow (14 agents). ⚠️ The cron's end-to-end run was NOT tested inline (low context); `claude -p` itself is verified working. On first Sunday fire, check `logs/oloxa-content.run.log`. The cron writes `Oloxa Content Calendar - Week of <date>.md` — same filename pattern, so it won't clobber today's (different date).
- DISTINCT from existing `com.aios.daily-content` (that's a general trending-topics generator; this is Oloxa-pillar + Ryan-voice + Content-Grader specific). They don't conflict.

## ALL FOUR MOVES BUILT — full schedule now live
- `com.aios.oloxa-daily` (7:15 daily) — battlecard batch + Telegram brief
- `com.aios.oloxa-learning` (Sun 18:00) — weekly GTM learning loop
- `com.aios.oloxa-content` (Sun 16:00) — weekly inbound content factory
- On-demand: `oloxa-outbound-battlecards` + `oloxa-content-factory` + `oloxa-gtm-learning-loop` workflows; `build_send_board.py` + `log_outcome.py` for batch sending.

## ✅ AI GTM Engine service packaged + priced (2026-05-31)
Chose to package the engine as a $/mo service. Validated pricing with a deep-research run (108 agents, 10 verified findings, 17 sources) and wrote 3 deliverables to `Packaging/`:
- `AI GTM Engine - Offer and Pricing.md` — tiers + the verdict: setup $1.5–2.5k KEEP, monthly RAISE to $2k/$3.5k/$5k+ (old $1–3k was below where multi-channel agencies start at $3–8k/mo). Flat retainer, anchor on Growth $3.5k.
- `AI GTM Engine - ROI Model.md` — "vs hiring an SDR" math (fully-loaded US SDR ~$10–12k/mo, 3–4mo ramp, ~1.5yr tenure → ~$90k/yr saved vs Growth tier). Cited inputs w/ low/high ranges.
- `AI GTM Engine - Sales Sheet.md` — the one-pager to send prospects.
- Honest constraint baked in: NO case study yet → first 2–3 sales on system + 90-day pilot + founder-run de-risk, not proof. Deliverability regime (Google/Yahoo 0.3% spam cap since Feb 2024) is the premium wedge vs spray-and-pray.
- Guardrail kept: Oloxa stays client #0; running the engine on Oloxa IS the live demo. Raise prices / drop pilot discount after first real Oloxa win.

## THE ONE THING LEFT THAT ISN'T A BUILD
Send + log batch one (`Batch One Send Board - 2026-05-31.md`). Until real outreach is logged to `Oloxa_Outcome_Tracker.csv`, every learning run analyzes pipeline quality, not market outcomes. The machine is complete; it needs fuel (sent touches).

## Reusable note
This whole engine IS the productized "AI GTM Engine" offer ($1–3k/mo per `Packaging/AI GTM Engine Service.md`). Prove on Oloxa → repoint LEADS/ICP → sell.

## "womb"
Ryan said "womb" for the 4th outbound channel; zero hits in the bank. Read as SMS/text (Cold SMS teardown + Local Calls & Text sprint exist). **Confirm with Ryan if it's an actual tool.**

---

## ⚠️ This resume doc reverted mid-session (2026-05-31, late)
An external sync/linter restored an older copy, dropping several confirmed updates. The work itself is intact on disk — only this breadcrumb went stale. Source of truth = each item's own folder, not this file.

## ✅ Also completed this session (verify in-folder)
- **#4 Inbound content factory** — `oloxa-content-factory` workflow, 7 graded posts avg 8.7/10 → `Inbound/Oloxa Content Calendar - Week of 2026-06-01.md`. Weekly cron `com.aios.oloxa-content` (Sun 16:00) loaded.
- **Batch-one send path** — `Operations/scripts/build_send_board.py` + `log_outcome.py`; `Lead Engine/Outputs/Batch One Send Board - 2026-05-31.md` (6 SEND leads) + seeded `Oloxa_Outcome_Tracker.csv`.
- **AI GTM Engine service package** — `Packaging/`: Offer-and-Pricing, ROI-Model, Sales-Sheet. Pricing validated (setup $1.5–2.5k KEEP; monthly RAISE $2k/$3.5k/$5k+).
- **Dealthreads GTM Experiment Engine** — 11 files in `dealthreads-gtm-experiment-engine/`.
- **Dealthreads WEBSITE repositioning (GTM-only, problem-first)** — `dealthreads-gtm-agent-repositioning/`: 00 teardown, 01 positioning decision (reposition wholesale, ZERO real estate, canonical=managed-team, old Founding-50 SaaS doc retired), 02 problem-first offer, 04 full GTM-only landing copy (audited clean: no RE leakage / no AI-slop / guarantees only as negations) + SEO meta. PENDING: 07 website implementation plan — NO site-code edits yet per guardrail. Live site source: `AIOS/dealthread-landing-live` (React/Vite).

## Bottom line
Everything is built/packaged; nothing has been sent or pitched. Next dollar = execution. Memory: [[dealthreads-gtm-experiment-engine]], [[oloxa-battlecard-workflow]].

## ✅ Dealthreads ICP — chosen by market research (2026-05-31)
Ryan: no warm network, AAA = competitors, ~1,300 LI connections, cold start, US-only, AI Arc not the secondary enrichment provider. Decided to research the market for the ICP rather than chase who he knows.
- **Beachhead = retained executive search / specialized recruiting firms** (boutique 5–50 ppl; buyer = Managing Partner/Owner). Won all 6 gates in a 112-agent deep-research run.
- Why: acute verified 2025 pain ("finding new clients" = #1 staffing challenge, 23% up from 16%; Robert Half Q3-25 rev −8%) + huge ability-to-pay (~$75k on one $250k placement = many×the retainer) + recruiters are the most LinkedIn-native buyers alive.
- Lead hook: "clients used to come to you; in 2025 that flipped." Lead on CLIENT-side BD, not candidate sourcing.
- Shortlist behind it: MSPs (#2, sticky MRR, test video fit), commercial law (#3, high pay/hard cold open), fractional CFO (#4). AVOID: marketing agencies + B2B SaaS (saturated) + small CPA firms (economics don't clear $5k/mo).
- ⚠️ Honesty: saturation (criterion 4) + LinkedIn/video channel-fit (criteria 3/5) are the THIN-evidence parts — strong hypotheses to validate live, not proven. Pain/why-now/ability-to-pay are rock-solid.
- Files: `dealthreads-gtm-agent-repositioning/01c - ICP Market Research.md` (+ 01b resolved). NEXT: recognition one-pager, AI Arc pull spec, re-skin 02/04/08 to recruiting buyer.

## ✅ Dealthreads cold-outreach Grand Slam Offer (2026-05-31)
File: `dealthreads-gtm-agent-repositioning/06 - Cold Outreach Grand Slam Offer.md`. Hormozi value-equation offer for the recruiting-firm ICP.
- **Core move:** don't give a free "audit" — give free PIPELINE. "Mandate Radar" = ~7 companies in the firm's vertical showing exec-hiring signals (HIRING/FUNDING/DEPARTURE/EXPANSION) this week + decision-maker + why-now + opener. Built by the existing battlecard workflow pointed at the recruiter's CLIENT side. Each = a potential ~$75k mandate. Free, no call → demonstrates competence with zero case studies.
- **Ascension:** free batch → "engine runs this weekly" → 90-day pilot ($3.5k/mo Growth anchor). Guarantee = activity not revenue. Scarcity = real ~5/week build cap.
- **CAC model:** ~1 pilot per ~140 cold CRs / ~8-10 free builds (rates ESTIMATED, flagged). Constraint = Ryan's build-TIME (~1hr/batch), not money. CAC:LTV wildly favorable. Implication: qualify hard before free-building; free build is also the next sales asset + first case-study seed.
- Full verbatim cold sequence (CR, DM, 2 follow-ups, email, meeting-ask, content) in the file — give-first, client-side-BD-only, no AI-slop.
- ⚠️ "Moses-style" — built it as Hormozi Grand Slam; asked Ryan to confirm if Moses = a specific framework.
- NEXT: build the first Mandate Radar sample live on 1 real target (pressure-tests the whole offer); re-skin 02/04/08 to recruiter buyer + give-first frame.

## ✅ Dealthreads signals + signal-triggered scripts (2026-05-31)
- `07 - Buying and Paying Signals.md`: two-axis taxonomy for OUR ICP (boutique search firms). BUYING (intent): BD-HIRE⭐, WENT-INDEPENDENT⭐, REFERRAL-PAIN, CRAFT-RICH/BD-POOR, CONTRACTION, CHANNEL-FRUSTRATION, CAPACITY-OPEN, MACRO. PAYING (budget): ALREADY-SPENDS-ON-GROWTH⭐, RETAINED⭐, HIGH-COMP, ESTABLISHED, NICHE, TOOL/BRAND, MULTI-PARTNER. 2×2: prime = high buy × high pay. Scoring rubric mirrors Oloxa's so the battlecard workflow can run it. Key insight = "two signal layers": THEIR client signals (the free Mandate Radar) vs OUR signals on the firm (our targeting) — and our signal-triggered outreach DEMONSTRATES the product ("the medium is the proof"). Weights are designed not validated — learn via the loop. Bulk-filterable vs manual-read split flagged.
- `08 - Signal-Triggered Cold Outreach and Loom Scripts.md`: verbatim CR + DM openers keyed to each buying signal (BD-HIRE / went-independent / referral-pain / craft-rich / macro), shared give/follow-up/meeting blocks, cold email, + TWO Looms (A = 45-60s opener "send it"; B = 2-3min sample walkthrough = the deliverable + the sell). Includes the "apply our GTM to our GTM" close: "what I just did to you is the product."
- NEXT (Ryan's sequence): build the first real Mandate Radar sample on one actual US search firm = proof-of-concept for the whole offer + what Loom B walks through.

## ✅ Dealthreads first Mandate Radar SAMPLE built (2026-05-31)
File: `dealthreads-gtm-agent-repositioning/09 - Mandate Radar SAMPLE (proof of concept).md`. The free deliverable from offer `06`, built for real to pressure-test the whole GTM. Recipient = boutique GTM/sales-leadership search firm (ICP archetype #6). Signal used = FUNDING (most public/verifiable).
- 7 REAL recently-funded companies (cited, Jan–Apr 2026): Wonderful ($150M B), Pivot ($40M B), Unframe ($50M B), Monk ($25M A), Spektr ($20M A/NEA), depthfirst ($40M A/Accel), Sola Security ($35M A). Each = a "just raised → must build revenue leadership → retained search mandate (~$45-90k fee)" with why-now + role + decision-maker + a usable opener.
- HONEST gaps flagged in-file: contact NAMES must be LinkedIn-verified before sending (sample names the role, not a verified person — wrong name disproves the engine); a live build filters to the recipient firm's exact vertical + pulls last 7-14 days + excludes already-contacted.
- ⚠️ DATA-SOURCE OPEN Q (also flagged 01c): does AI Arc surface funding/exec-hiring signals? This sample used live web search (works, not yet wired to AI Arc). May need a Crunchbase/funding-news feed for Mandate Radar. **External validation: Harry's #1 CTA (10/12 positive replies) was this exact "free list of companies showing hiring+fundraising signals."**
- NEXT: Ryan gut-checks sample quality → resolve AI Arc-vs-funding-feed → pick 1 real recipient firm, filter to their vertical, verify contacts, record Loom B, send.

## ✅ Mandate Signal Detector BUILT + tested live (2026-05-31) — the Clay alternative
File: `AI GTM Engine/Operations/scripts/mandate_signal_detector.py` (free, ~$0/run vs Clay $149-800/mo). Ryan chose "build both" (funding + hiring).
- **Module A FUNDING:** Firecrawl /search → /scrape the funding-news pages → Claude extracts individual companies from the BODY (key lesson: search returns LISTICLES not announcements; the signal is IN the scraped body). Module B HIRING: Greenhouse+Lever public APIs (free), tightened exec-title filter. A+ grade = raised AND hiring overlap.
- **Precision layer (beats Clay):** Claude relevance gate kills funds/SPVs/listicles/IC-roles/non-US, + a "DO NOT GUESS → mark UNKNOWN-verify" rule.
- **TESTED LIVE end-to-end (not claimed):** fintech run → 10 real mandate cards w/ cited rounds (Worth $30M, Listen Labs $27M, OpenRouter $40M, Basis $34M = high-conf). cybersecurity run → 10 cards, 3 high-conf (Tenex.AI/Upwind/Cloaked), 6 honestly flagged UNKNOWN-verify. Debugged 3 real bugs along the way (loose title filter caught AEs; silent gate failure; search-returns-listicles → added scrape-extract).
- **KNOWN v1 GAPS (honest):** (1) `--days` recency NOT hard-filtered — gate down-weights old rounds but some Dec-2025/Jan-2026 leak through; v2 = date filter. (2) HIRING needs a target-company list to scan (Greenhouse/Lever are per-company); big public boards (Stripe) post AEs not exec roles → use on SMALLER cos. (3) contact NAME still needs LinkedIn verify before send (detector finds company+mandate, not the person).
- Usage: `set -a; source aios-starter-kit/.env; set +a; python3 mandate_signal_detector.py --vertical "X" --days N --boards "slug,slug" --out x.json --md x.md`
- NEXT: wire into signal_engine.py (or keep standalone); v2 date-filter; then pick a real recipient search firm, run detector on THEIR vertical, verify contacts, record Loom B, send.

## ✅ LIVE TEST on a real prospect — Melisa Migliaccio / mCubed Staffing (2026-05-31)
File: `dealthreads-gtm-agent-repositioning/11 - LIVE TEST - Melisa Migliaccio (mCubed Staffing).md`. First full end-to-end run of the whole machine on one real person.
- Prospect (verified via web, NOT LinkedIn — that's gated): CEO/founder of mCubed Staffing (Troy MI), woman-owned, ~17 ppl ~$7.6M rev, full-search exec/IT/engineering staffing. Sales-native (ex-AE), posts her own BD content.
- ICP fit: strong PAYING (already self-markets = ALREADY-SPENDS-ON-GROWTH), medium BUYING (macro + craft-rich, no fresh funding/BD-hire event on her). Tier A/B. Nuance: sales-native = high bar but recognizes a good motion instantly.
- Ran the REAL detector on her IT/eng/tech vertical → 6 high-confidence cited cards (Sierra $950M May-26, Replit $400M, Shield AI $1.5B, OpenRouter $40M Sequoia+a16z, Listen Labs $27M, Vivodyne $40M). Each = a funded co about to hire the IT/eng roles mCubed places.
- Wrote her full personalized cold sequence (CR + give-DM + follow-up + Loom B walking HER radar + meeting ask + the "what I just did to you is the product" close).
- KEY LEARNING: for a STAFFING firm the mandate = "staff the post-raise hiring surge" (many roles/company), not one exec hire — arguably stronger; warrants a staffing-variant of the 02 offer language.
- BEFORE SEND: trim radar to freshest 3-4 (recency v2 gap); verify her contact (LinkedIn confirmed channel).

## ✅ Melisa deliverables: branded dashboard + long video script + ideas (2026-05-31)
For Ryan to send Melisa tomorrow. Files: `dealthreads-gtm-agent-repositioning/mCubed_Client_Radar.html` (real branded HTML dashboard) + `12 - Melisa Loom Script + Out-of-Box Ideas.md`.
- **Key honesty calibration:** RIGHT-SIZED her radar — cut the mega-raises (Sierra $950M/Replit $9B/Shield AI $1.5B = they have in-house TA, wrong for a 17-person firm) from the core list; led with 5 Series A/B fits ($27-40M, scaling eng, no in-house recruiting yet): Vivodyne, OpenRouter, Listen Labs, Basis, Worth. The "I cut the big names and here's why" move = biggest trust-builder for a sales-native CEO. Mega-raises kept in a flagged "long shots" section.
- **Dashboard** = branded HTML (mCubed Client Radar), per-company: raise, what they do, roles she'd fill, drafted opener, source link, decision-maker (verify-on-LinkedIn). Validated well-formed. Footer CTA = placeholder calendar link to swap.
- **Long video** = ~4.5min Loom script, screen-shares the dashboard, beats: hook → funding insight → walk 5 companies → the honesty flex (cut big names) → the recursion close ("what I just did to you is the product") → soft ask.
- **Best CTA (recommended):** the STANDING OFFER — "tell me your top 3 verticals, I'll send this every Monday free for a month" — gives 4x more before asking, easier yes than "book a call", meeting becomes her idea. + charity hook (15% to charity), personalized thumbnail, testimonial bet.
- **Michigan local angle:** detector run on MI produced JUNK (directory pages too thin → hallucinated fragments) — do NOT use local names; instead promise "next one I'll point at Michigan." Honest gap.
- Clarified: "candidates for her pool" = built the COMPANIES (her clients) version; a TALENT-pool dashboard would need her data = phase 2.

## ✅ Deeper-signals strategy for staffing firms (2026-05-31)
Ryan: "funding is a signal I could've found myself — how do we get DEEPER signals for boutique staffing firms?" Correct — funding is commodity/leading; the deep signal is CONFIRMED HIRING PAIN now. File: `dealthreads-gtm-agent-repositioning/13 - Deeper Signals for Staffing Firms.md`.
- Signal depth hierarchy (shallow→deep): funding < open-role volume < AGED ROLES / reposts / role÷headcount ratio / hard-to-fill stack / geo. Deeper = proves real need + real pain + can't-find-by-hand = worth paying for.
- **PROVEN FREE (live probe):** Greenhouse public API exposes `first_published` → job AGE computable. Databricks: 35 eng roles open ≥45d (max 132d); Figma 9; GitLab 6. Lever also free; Ashby per-org (verify). All no-key. Catch: per-company APIs → need a company list to scan (funding/vertical lists = the discovery layer; jobs = the DEPTH layer). Funding+jobs COMBINE.
- v2 model: FOUND (funding/list) × PAIN DEPTH (aged roles + volume + ratio + stack + geo + reposts). A+ = funded AND visibly drowning (10+ reqs, 5 open 60d+, hard stack).
- Melisa pitch transforms: "raised $40M, will hire" (commodity) → "raised $40M AND a Sr Robotics Eng role open 88d + 9 reqs vs ~40 ppl in a brutal-to-source stack = stuck, takes your call today" (undeniable, unfindable by hand).
- Build tiers: v2a (NOW, free, proven) = job-age+volume+ratio+geo into detector. v2b = repost detection (needs weekly snapshot persistence = real moat, what the weekly loop is for). v2c = eng-leader-hired/departures (LinkedIn-gated, skip).
- DECISION PENDING: build v2a into mandate_signal_detector.py + regenerate Melisa's dashboard with depth?

## ✅ Melisa depth dashboard FINAL — triple-verified numbers (2026-05-31)
After the data-wobble finding, ran every candidate 3x; ONLY companies with identical numbers across all 3 pulls go on a sendable asset. PostHog flaked (None all 3x) → correctly EXCLUDED. Mercury was actually stable on retest.
- FINAL `mCubed_Client_Radar.html` = 3 cards, all triple-verified exact: **Hightouch 30 tech/12 stuck/283d oldest** (Go/distributed/ML/Rust), **Mercury 15/9/136d** (finance+IT lane, Go/embedded/ML), **Airtable 15/11/286d** (Go/K8s, flagged "bigger, likely in-house TA"). HTML balanced, numbers cross-checked vs live pull.
- RULE now baked in: live job-board counts wobble (rate-limits/flakes) → never put a number on a sendable asset without a multi-pull stability check. v2 detector TODO: daily cached snapshot so numbers are stable within a day + enables repost-detection (v2b).
- Stable-verified bench for future radars (3x-confirmed): Hightouch, Mercury, Airtable, Webflow(15/5/241), Amplitude(29/6/107), Vercel(38/26/333), GitLab(84/44/263), Figma(39/30/363), ClickHouse(127/97/327). Unstable/excluded: PostHog, Grafana.
- Video script (file 12) unchanged — just walk THIS depth dashboard (far stronger than the funding version). BEFORE SEND: LinkedIn-verify the decision-maker at Hightouch/Mercury/Airtable; swap calendar link; ideally glance each careers page to confirm roles still live.

## ✅ OFFER CLARIFIED + low-effort delivery model chosen (2026-05-31)
Ryan got lost in the machinery, asked "what IS my offer / what am I delivering." Wrote `dealthreads-gtm-agent-repositioning/00 - THE OFFER (read this first).md`.
- **The offer in one line: "You find boutique recruiting firms their next CLIENTS"** (not candidates). Deliver = weekly dashboard of companies stuck hiring now + who to call/why/what to say. Value math: 1 new client = 3-5 placements = $75-150k/yr; fee pays back 2-4x on ONE client. NOT a recruiter, doesn't close their deals.
- Ryan rejected full done-for-you BD = too much delivery labor for a solo op. Wrote `00b - Low-Effort Delivery Models.md` (5 models). DECISION: **sell the machine's OUTPUT not his hours.**
  - **Core = Model A: weekly Client Radar subscription, ~$500/mo, auto-delivered (cron→email dashboard), ZERO per-client labor, scales like SaaS.** Free Mandate Radar → $500/mo is the easiest upgrade.
  - Premium = Model C: radar + monthly strategy call ~$1.5k/mo (sell expertise not labor).
  - Explicitly NOT doing DFY outreach (the labor trap).
  - Delivery = same pattern as live Oloxa com.aios.oloxa-daily (cron→generate→deliver). Sell MANUALLY first (hand-email dashboard to clients 1-3), automate once paying.
- This reframes Melisa pitch: "$500/mo, less than your data tools, one new client pays for it 2 years, you run outreach, I just hand you the right companies every Monday."
- NEXT: this lowers the price on Melisa's dashboard footer (was $3.5k/mo Growth → now $500/mo subscription framing). Update the dashboard CTA + video script to the subscription offer before sending.

## ✅ Tier 2 added: Managed Outreach (I-run-it-you-close-it) — 2026-05-31
Ryan: he'll SET UP + RUN cold-email outreach for clients but won't handle replies or own meeting delivery. File: `dealthreads-gtm-agent-repositioning/00c - Managed Outreach Tier.md`. Now a clean 3-tier ladder (in `00 - THE OFFER`):
- T1 Client Radar ~$500/mo (dashboard, they do everything) · T2 Managed Outreach ~$1.5-3k/mo + $1-2k setup (Ryan runs signal-targeted cold email) · T3 Full DFY (skip, labor trap).
- **Tier 2 = LOW BUILD: Ryan already runs this exact setup for Oloxa** — Smartlead + separate warmed lookalike domains + forward-replies-to-inbox. Just point it at a client, feed it the detector's stuck-hiring list. Confirmed by Ryan ("this is exactly how I do it for Oloxa").
- Domain decision: SEPARATE lookalike domains (mcubed-talent.com), replies forward to client inbox → "your primary domain is never at risk" (objection-killer). ~2-3wk warming = campaigns live week 3.
- **The reframe: "I don't handle replies" = a FEATURE** ("you stay in control of every client conversation"). Recruiting firms don't want a stranger talking to their prospects in their name.
- Risk boundary (protects Ryan): responsible for domains/deliverability/sends/surfacing positive replies (weekly "you got 6 interested companies, they're in your inbox"); NOT for booked meetings (depends on their reply speed + close). Never guarantee meetings.
- Brand discipline: ONLY email the detector's stuck-hiring companies (signal-targeted), never a blast — keeps "relevance not spray-and-pray" intact + protects deliverability.
- Channel split clarified: LinkedIn+Loom = how RYAN sells Dealthreads; cold email/Smartlead = what Ryan RUNS FOR clients.
- Pricing rationale: full DFY $3-8k/mo, cold-email-only ~$2k/mo; Ryan's under full-service (no appointment-setting) → $1.5-3k. Margin strong (Smartlead seats + cheap domains + monitoring time).
- NEXT: Melisa can now be pitched T1 ($500 dashboard) OR T2 (managed cold email) depending on appetite. Update her dashboard/video to present the ladder.

## ✅ 90-day $20k/mo plan + List A BUILT (2026-05-31)
- **`14 - 90-Day Plan to $20k_mo.md`**: reverse-engineered funnel. KEY HONESTY: $20k MRR cold/solo/no-case-study in 90d = STRETCH (most agencies take 6-12mo); set Floor($6-8k)/Target($12-16k)/Stretch($20k+) band, judge success at Target. Path = BLEND (lead Tier1 $500 easy-yes for fast logos+cash+case-studies, upsell Tier2 $2k for MRR) → ~16 clients. Funnel: ~1,500 firms touched → ~720 contacted → ~180 radars → ~55 meetings → 16 clients. = ~125 touches/wk, ~4-5 meetings/wk.
- **#1 RISK + FIX:** 180 hand-built radars = 180hrs = impossible. FIX = build ~5 VERTICAL radars (tech/fintech/healthcare/sales-leadership/industrial) once; on "yes send it" send the vertical one + 5-min personalize, NOT 60-min bespoke. Build the 5 in Week 1. Without this, $20k is impossible.
- **LIST A = BUILT (the big find):** existing `staffing_recruiting_ai_automation.db` had 1,564 firms + 1,920 contacts already mined. Extracted `dealthreads-gtm-agent-repositioning/List_A_recruiting_firms.csv` = **1,125 unique boutique recruiting firms, 1 decision-maker each (owner/CEO/founder/MP), 99.7% valid emails (ZeroBounce-checked), <150 reviews=boutique**. 237 ICP-verified (Tier A), 888 need fit-check (Tier B). GAP: only 9 have LinkedIn URLs → LI channel needs AI Arc/the secondary enrichment provider enrichment; EMAIL channel can start THIS WEEK.
- Two lists clarified: List A = Ryan's prospects (recruiting firms, DONE). List B = each client's prospects (funded/stuck-hiring cos, the detector builds, per vertical).
- NEXT: pick the real $20k definition (MRR vs cash); build 5 vertical radars; load List A Tier-A into Smartlead (warm domains first, 3wk); enrich LinkedIn URLs; Melisa = live test #1.

## ✅ Goal locked + land-and-expand thesis + pipeline asset (2026-05-31)
- **Goal = $20k CASH COLLECTED/mo, a MIX (~$10k MRR + ~$10k collected).** Much softer than pure $20k MRR — setup fees + automation project cash count → reachable in 90d.
- **THE REAL GAME (strategic): recruiting client-finder = TRUST WEDGE to upsell AI AUTOMATION** ($5-15k projects) later. Front offer isn't the prize — it's the door. → lead cheap/free, OVER-DELIVER, the radar IS an AI automation = live demo of "I build AI that makes you money" → bridge to "what else can I automate for you?" The ~$10k "cash" half of the goal comes from automation upsell in days 45-90, NOT radar subs alone. File: `15 - The Real Game (land-and-expand) + Cold Email Campaign.md`.
- **PIPELINE ASSET BUILT:** full 4-touch cold email sequence (give-first, no pricing, CTA="want the free list?" not "book call") + the "yes→send radar→book 15min" conversion msg. In file 15, copy-paste ready for Smartlead.
- **List segmented:** `List_A_SEND_FIRST_tier_A.csv` = 237 ICP-verified firms (send these FIRST, ~20-30/day), spread across CA/NY/FL/TX. Full `List_A_recruiting_firms.csv` = 1,125. Data finding: firm vertical NOT in the data (mostly generic "staffing & recruiting" category) → build vertical-agnostic tech radar, let REPLIES reveal each firm's niche.
- **NEXT (Week 1):** warm a domain (3wk clock—start now), load 237 Tier-A into Smartlead Email 1 @20-30/day, send Melisa as live test #1, enrich LinkedIn URLs (only 9/1125 have them) via AI Arc/the secondary enrichment provider for the LI channel.

## ✅ IdeaBrowser #7856 (AI contact form) → Dealthreads automation upsell #1 (2026-06-01)
Ryan floated pivoting to IdeaBrowser idea #7856 "AI-driven contact form that pre-builds the buyer profile" (scores opp9/pain9/timing9; flagged technical_founder_needed). DECISION: NOT a pivot — it becomes the flagship AI automation Dealthreads INSTALLS for clients (the concrete answer to "what's the automation upsell?" from land-and-expand thesis `15`). File: `dealthreads-gtm-agent-repositioning/16 - AI Contact Form (automation upsell #1).md`.
- WHY: reuses the enrichment engine (= the signal detector, "thin input→full buyer profile" = the Mandate Radar pattern); plays Ryan's real strength (sell+install automation, NOT build SaaS — his profile is marketing/part-time/under-5k, mismatched for the standalone technical product); avoids second-startup trap mid-Dealthreads-launch. Founder profile pulled: archetype "The Architect/Operator" — warns he over-engineers before shipping; recurring-rev focused.
- The idea's real timing hook: Drift shutting down 2026 + Qualified went enterprise-only (Salesforce) → mid-market conversational-front-door gap NOW. Standalone econ: $2.5k/mo (vs $120k coordinator + $160k analyst).
- SLOTS INTO LADDER as the AUTOMATION tier: setup $1.5-3k + $500-1k/mo, bridge line "I found your clients; now let me fix the leak on your contact form." Works for recruiting firms (they have inbound) AND any mid-market B2B.
- BUILD = wire existing tools (AI chat widget + enrichment stack + client CRM), prove on ONE client manually first, NOT a multi-tenant SaaS. Clean future spin-out if 3-5 clients love it.
- ⚠️ GUARDRAIL: this is upsell #2 IN SEQUENCE, not the now-thing. Now-thing stays: warm domain, load List A, send Melisa, book meetings. Don't build the contact form before there's a landed+trusted client to install it for. Don't slip into the standalone SaaS (the technical second-startup Ryan correctly avoided).
- Idea is_saved in IdeaBrowser; could start_project a workspace later to run their build/GTM skills.

## ✅ AI Contact Form = LEAD OFFER + core engine BUILT & tested (2026-06-01)
Ryan went all-in on IdeaBrowser #7856 as the PRIMARY Dealthreads offer (supersedes the upsell framing in `16`). Logic: $2,500/mo × 8 = $20k/mo, 40 clients = $1M ARR — fewer logos, higher price, sharper pain than recruiting. Read full IdeaBrowser research (GTM 9, founder-fit 9, ACP 8). Files: `17 - AI Contact Form — ICP, GTM, and Build.md` + `buyer_profile_enricher.py`.
- **ICP:** mid-market B2B ($10-200M rev), $10k+ ACV, sales-led, REAL inbound (a form to replace), THIN RevOps, buyer=GTM leader. ⭐ BEST BEACHHEAD = **Drift refugees + Qualified-priced-out** (Drift shutting down 2026, Qualified→enterprise-only) = acute/timed/pre-educated buyers shopping NOW. Find via BuiltWith/Wappalyzer (who runs Drift).
- **GTM:** the FREE TEARDOWN wedge (Mandate-Radar move repurposed): "send me your form URL, I'll Loom what data it throws away" → fill out their form → enrich live → show the gap → install = close. Channels: LinkedIn (RevOps/VP Sales), cold email (Smartlead infra), Drift-refugee hunting. Pricing: $2.5k core / $3.5k +intel reports / $5k +ICP campaigns. Frame: "replaces $120k coordinator + $160k analyst."
- **CRITICAL BUILD DECISION: done-for-you INSTALL per client (wire existing tools), NOT a multi-tenant SaaS** (that's the technical_founder_needed second-startup — avoid). Stack = AI chat/smart-form widget + YOUR enrichment engine + client CRM push. Lead with ASYNC enrichment (enrich after submit, before rep callback = minutes not seconds) → dodges latency; real-time chat = v2.
- **BUILT TODAY: `buyer_profile_enricher.py`** — domain(+name/email/form answers) → full buyer profile (size/funding/what-they-do/tech-stack/decision-makers/ICP-fit/rep-brief/data-gaps). FREE path: Firecrawl scrape+search + Claude, ~pennies/lead (the secondary enrichment provider key DEAD/401 — don't depend on it; free path proven sufficient). TESTED LIVE on Hightouch inbound sim → nailed it ($100M ARR, $2.75B Series D, decision-makers, call brief) in 25s, WITH honest "still unknown" list (the trust feature). This engine = BOTH the free teardown AND the product core.
- HONEST RISKS (in file 17): contact-level/person enrichment patchier than company-level on free sources (may need cheap paid API for the PERSON vs the COMPANY); test before promising per-person data. Don't over-engineer (archetype warning) — prove on 1 client manually first.
- NEXT: build the teardown HTML generator (client-facing, like mCubed dashboard); pick the widget tool + wire 1 end-to-end demo; find 10 Drift-refugee targets; record master teardown Loom. Recruiting/List A = now the OUTBOUND channel to sell THIS.

## ✅ AI Contact Form GTM workflow — full pack BUILT (2026-06-01)
Ran `ai-contact-form-gtm-launch` workflow (31 agents, ~1.7M tok, 474 tool calls). Output in `dealthreads-gtm-agent-repositioning/ai-contact-form/`:
- **00 - Target Teardowns.md** + `AI_ContactForm_Targets.csv` = **12 REAL verified mid-market B2B targets**, each with buyer-profile teardown + give-first opener. ALL passed adversarial QA (0 fabrications survived — QA caught CaptivateIQ's unverified "Series D/$168M" and flagged "do NOT state as fact"). Beachhead 4: CaptivateIQ + Ketch (drift_refugee), Sendoso + DNSFilter (qualified_priced_out). Standard ICP 8: Secureframe, Thoropass, Procurify, Pondurance, Ashby, Revenova, Alvys, Tai Software.
- **01 - Cold Outreach Scripts.md** (CR/DM/email/follow-ups/conversion, give-first, no pricing cold, drift-refugee timing angle).
- **02 - Teardown Loom Script.md** (~3-4min, walks the before/after on their real form + the honesty beat).
- **03 - Widget Stack Decision.md** — KEY BUILD SPEC: v1 = SMART FORM (not chat), enrich-on-submit, async. Stack: form submit → ingest hop (Make/serverless, ~10 lines) → buyer_profile_enricher.py (UNCHANGED) → HubSpot v3 API (reuse hubspot_oloxa_sync.py pattern: upsert company+contact, attach profile.md as note, HIGH callback task). Verified HubSpot has NO native external-webhook→create-contact (must upsert via API first). Chat = v2. Person-level enrichment patchy → sell company-level v1, mark person "unknown-verify", cheap paid API (Prospeo $0.01/email, PDL $0.03) as v2 toggle.
- **04 - Launch Plan.md** — hit-list (drift-refugees first), funnel, ~90-100 touches/wk → 8 installs, channel mix (LinkedIn+Loom+Smartlead+BuiltWith drift-hunting), List-A/detector = the outbound machine repointed, floor/target/stretch (8 cold solo = stretch, win at Target).
- ⚠️ ENV GAP flagged by widget agent: confirm FIRECRAWL_API_KEY + HUBSPOT_TOKEN locations before wiring (enricher needs Firecrawl+Anthropic; Oloxa sync sources dealthread-agents/.env). [Note: enricher tested fine earlier w/ aios-starter-kit/.env Firecrawl key — the agent's env grep may have missed it; verify.]
- NOTE: 4 GTM agents wrote real files to folder root + returned meta-summaries (recovered/moved into ai-contact-form/). Same file-tool-vs-return-value glitch as prior workflows.
- NEXT: pick ONE target (lead: a drift-refugee like CaptivateIQ/Sendoso) → build the teardown HTML page via buyer_profile_enricher → record the Loom → send. Wire ONE end-to-end smart-form→enrich→HubSpot demo. Verify env keys.

## ✅ ICP CORRECTION — "where a nobody fits" (2026-06-01)
Ryan pushed back (correctly): CaptivateIQ/Sendoso are too big — a no-logo/no-case-study solo operator won't get their time, and they'll "build it in Clay" (QA flagged this). File: `ai-contact-form/05 - Where a Nobody Actually Fits (ICP correction).md`.
- THE FIX: flip the size filter. Corrected ICP = "founder-reachable, ops-starved, ROI-obvious" — **~5-40 employees, $1M-$20M rev, buyer IS the founder (no procurement/committee), NO RevOps team (so 'build it ourselves' isn't an option = the real wedge), deals still $8k+/high-LTV.** The research's mid-market $10-200M was "who benefits most," NOT "who buys from a nobody now."
- Re-ranked our 12: LEAD with smallest founder-led = **Revenova (~70), Tai Software (~60), Ketch (~60-90, keeps drift-timing + reachable)**. DEPRIORITIZE CaptivateIQ (263) + Sendoso (401) to phase-2/post-case-study (best timing flag, worst founder-fit).
- 3 ways to beat the "nobody" problem: (1) go smaller where founder=buyer, (2) the free TEARDOWN is the credential — give-first makes logo irrelevant, (3) use vertical adjacency (freight-software founder = level playing field vs $1.25B sales-tech VP).
- Pricing: add a founder-tier entry **$500-1.5k/mo or $1.5-3k one-time install** for small cos (card-yes, no procurement). $20k path = ~15×$1.3k (reachable cold) vs 8×$2.5k (needs logos). LAND SMALL CHEAP → case studies → THEN go up-market to the Sendosos.
- TODO ripple: re-rank `00`/CSV + `04 Launch Plan` to smallest-first; next detector sourcing run filters 5-40 emp founder-led (not mid-market).
- ONE-LINE: "You're not a nobody to a 30-person founder drowning in leads. You're a nobody to a $1.25B VP of Sales. Pick the room where the gift outweighs the logo."

## ✅ First small-target teardown built (Revenova) + honest build assessment (2026-06-01)
Built Revenova teardown live to answer Ryan's "is the build serviceable / not half-baked?" question. New: `teardown_page.py` (enricher JSON → client-facing before/after HTML lead magnet). Output: `ai-contact-form/Teardown_Revenova.html`.
- **HONEST BUILD VERDICT (~70% of a sellable thing):**
  - ✅ STRONG/demo-worthy TODAY: COMPANY-level intelligence. Revenova run nailed full tech stack (Salesforce-native + DAT/FourKites/Project44/Samsara/Cleo/MacroPoint), CEO (Charles Craigmile), size, industry in 32s, CONSISTENT across reruns. The "still unknown" honesty list = the trust feature.
  - ⚠️ WEAK/half-baked: PERSON-level (the individual who filled the form — title/seniority/identity). Confirmed live twice. RULE: sell COMPANY-level dossier in v1; never promise per-person profiling yet; cheap paid API (Prospeo/PDL) as v2 toggle.
  - ❌ DOESN'T EXIST YET: the automated end-to-end product (live widget on client's site → enrich → CRM). That's a spec (file 03), not built.
- **What's HONESTLY sellable NOW = the teardown AS A SERVICE** ("I build a buyer profile on every inbound lead") — the engine delivers this today. The automated widget install = still to build, prove on 1 client manually first.
- minor: icp_fit is a nested obj (teardown_page.py handles it; a quick console script hit a KeyError, not a tool bug).
- NEXT: open Teardown_Revenova.html in browser → judge demo quality → if good, record Loom + send to Revenova/Tai/Ketch (small founder-led). Build the ONE end-to-end widget→enrich→HubSpot demo to make the automated product real.
