# AI Use Cases for Creative Alternatives — Web + YouTube Deep Research
**Date:** 2026-07-07 · **Method:** two parallel multi-agent sweeps — (1) web deep-research: 5 angles, 22 sources fetched, 109 claims extracted, top 25 adversarially verified by 3-vote panels (17 confirmed, 8 refuted); (2) YouTube sweep via vidIQ: 6 angles, 47 videos found, 16 transcripts pulled, 121 use cases extracted and evidence-graded (Demonstrated on camera / Partial / Claimed only).

---

## TL;DR — Three strategic moves

1. **Accelerate the mockup wedge NOW — it has a shelf life.** The wedge is validated as the #1 buyer pain (commonsku's own polling), but commonsku shipped **skubot** (AI mockup generator, beta Feb 2026, tier-gated) and SAGE shipped **instant virtual samples** (Jan 2026). Platform-level commoditization pressure is 6–12 months out. CA's edge must shift to *buyer-facing self-serve mockups + speed + the documented build*, not the mere existence of AI mockups.
2. **Turn the live SmartLead campaigns into an agentic outbound machine.** GrowthEngineX (Eric Nowoslawski) open-sourced ~29 Claude Code cold-outbound skills (verified live on GitHub, 509★): list building → per-lead sub-agent personalization → SmartLead campaign upload, ~$6–10/campaign. Combine with the Saraev site-crawl personalization pattern and end every sequence in a **custom mockup** — nobody on the internet is doing this; it's uncontested territory.
3. **Mine the existing book before buying any new leads.** Three independent sources converge on lapsed-customer reactivation as the highest-ROI play. Kenny's 25 years of order history + 2,947 HubSpot contacts is the asset 4imprint can't copy. Promo is structurally a reorder business.

**Timing context (verified):** only ~25% of promo distributors reported using AI at all (ASI Counselor 2025 SOI) — but adoption is ~50% among $5M+ distributors, exactly the tier CA is entering. The edge must come from depth (agentic workflows, buyer-facing tools), not AI copywriting.

**White space confirmed twice:** across 16 YouTube videos and 22 web sources, nobody documents AI running a real physical-product business with real revenue. Ryan's build-in-public channel occupies an empty lane, and a promo-distributor Hermes/agent build would be near-first-of-kind content.

---

## Prioritized build list (merged, deduped, evidence-graded)

Effort assumes Ryan solo with Claude Code + existing infra (SmartLead + HubSpot MCPs, launchd, Telegram pipeline, mockup wedge).

### Tier 1 — This month (revenue-touching, ingredients already live)

**1. Reverse-prompt task audit of Kenny's day — 0.5 days.**
Shadow Kenny one day, log every task (quoting, PO chasing, proof back-and-forth, reorder nudges), feed the list to Claude, ask it to rank what it can take over. Output = the CA transformation roadmap; sequences everything below. Also a ready-made episode: "I asked AI to audit one day inside a $3.2M promo business."
*Evidence:* Peter Yang demonstrated the meta-prompt variant with real ranked output (youtube.com/watch?v=5CBnWGP5vIs); Isenberg/Finn demonstrated reverse-prompted cron design (EJm8Ka-gVOc).

**2. Lapsed-customer reactivation engine — 2–4 days.**
Pull dormant accounts (no order 12–24 mo), segment by history, personalized outreach referencing their specific past orders + an AI mockup of their logo on this year's version, hand responders to Ryan/Kenny.
*Evidence:* Ben AI **demonstrated** 160 lost leads processed with parallel sub-agents → ranked CSV with "where the relationship left off" per lead (EqJoui72QrU) — that's the buildable blueprint. Lemkin's 70% response claim and Herk's ROI math are unverified; the segment logic is sound regardless.
*Stack:* Claude Code + HubSpot + Gmail history + SmartLead + order archive.

**3. Speed-to-lead: instant reply with a mockup in it — 2–3 days.**
Any inbound quote/mockup request or warm SmartLead reply triggers instant qualification, HubSpot deal creation, and a reply within minutes containing the prospect's logo already on the product. Industry-average response is measured in days; 4imprint's autoresponder is generic.
*Evidence:* form→route→auto-reply→log demonstrated twice on camera (Futurepedia e3OV3LnrS7o); StickerYou's 6-second AI quoting chat is a verified in-industry proof point (ASI, Sept 2025, CEO-self-reported speed).

**4. Deep-personalized outbound upgrade on the live Financial + Law campaigns — 3–5 days.**
Clone the GrowthEngineX skills repo (github.com/growthenginenowoslawski/coldoutboundskills — verified: per-lead sub-agent A/B/C personalization pattern + 8-phase campaign launcher ending in SmartLead upload). Add the Saraev pattern: crawl each prospect's site, summarize every page, 3–4 line icebreaker referencing non-obvious detail. The crawl doubles as mockup intel (logo, brand colors, sponsored events). Kill shot: "saw the 5K you sponsor every spring — mocked up your logo on the runner kits."
*Evidence:* repo verified live via GitHub API 2026-07-07; Saraev pipeline demonstrated node-by-node (oAWe5wFwHlo) — his reply-rate/$72K claims are NOT evidenced. **CORRECTION 2026-07-07:** a full local read of all 28 skills OVERTURNED this refutation — the repo DOES ship scripted SmartLead warmup/inbox management, spintax generation, and deliverability tooling (see plans/coldoutbound-skills-inventory-2026-07-07.md).

### Tier 2 — Next (compounding the wedge + buyer experience)

**5. Mockup factory: industrialize the wedge as a task-queue pipeline — 3–5 days.**
"Logo + SKU" in a queue → agent calls image-gen API (async create-then-poll) → branded mockup posted back to CRM record / email thread. Turns "Ryan makes mockups" into "CA has a mockup factory." Feeds #2, #3, #4. Add a human review checkpoint before anything customer-facing.
*Evidence:* Nate Herk **demonstrated end-to-end** (ZeJXI2MAhj0), 2m23s task→posted asset, including two live errors Claude Code self-fixed. Strongest single demo in the sweep.
*Urgency:* skubot (commonsku, beta, tier-gated) and SAGE instant virtual samples are shipping — but both are distributor-side tools; a **buyer-facing self-serve** mockup experience is still open.

**6. Auto account-research brief on every buyer reply — 1–2 days.**
Reply lands / deal created → agent researches the firm (events, hiring, brand, news) + reads full email history → swag-angle dossier to Telegram before Ryan responds. White-glove feel at solo scale.
*Evidence:* demonstrated three separate times (Herk ZeJXI2MAhj0 company researcher; Ben AI call-prep brief; Herk EA Perplexity skill mi4hcipESKQ).

**7. Inbox triage agent — 2–3 days.**
Classify every inbound email (quote request / PO / art approval / supplier confirmation / freight notice / noise), flag hot quotes instantly to Telegram, auto-draft "where's my proof" answers, route invoices.
*Evidence:* Jono Catliff shown working in his real inbox daily (Dt6u-yFEpsk); Hormozi's 120K-ticket/90%-deflection version is claimed-only.

**8. Claude for Small Business workflows — near-zero build.**
Anthropic launched it May 13, 2026 (verified verbatim from anthropic.com/news/claude-for-small-business): 15 agentic workflows + 15 skills, native HubSpot/QuickBooks/PayPal/Canva/DocuSign connectors. Distributor-relevant out of the box: invoice chaser, margin analyzer, lead triager, CRM cleanup, month-end prep, contract reviewer. **The plugin is already installed in Ryan's Claude Code session** (small-business:invoice-chase, lead-triage, crm-cleanup, margin-analyzer, plan-payroll…) — the HubSpot/QuickBooks/PayPal connectors just need OAuth authorization in claude.ai connector settings. Caveats: generic SMB (not promo-tuned); AR reminders queue for approval, not auto-sent.

### Tier 3 — Ops backbone (funds the $5M push, wins Kenny)

**9. Supplier PDF extraction → order-tracking table — 3–5 days.**
Every supplier PDF (acks, invoices, freight quotes) parsed to structured rows with anomaly flags vs the original quote (margin checks, ship-date risk, supplier billing errors). Keep it rule-based and deterministic.
*Evidence:* receipt→line-items demonstrated live (Catliff); Herk's $70K-savings anecdote unaudited.

**10. Daily ops digest for Kenny — 1–2 days.**
Upgrade the existing 3x/day Telegram briefs from stage-counts to reasoning over threads: open orders, proof-pending, at-risk ship dates, "these 3 buyers are going cold, here's the nudge." Highest-stickiness artifact for Kenny's buy-in. Depends on #9 for order data.

**11. "Digital Kenny": RAG over 25 years of institutional knowledge — 4–7 days.**
Vectorize pricing history, decoration specs, supplier quirks, past quotes; query conversationally ("what did we charge X for 500 embroidered polos"). Quote faster than 4imprint on custom work; de-risk the Kenny-dependence. Bottleneck is corpus assembly (interviews, quote archives), not tech. Budget a 30-day correction loop — Lemkin's failures came from unreviewed outputs.
*Evidence:* Catliff demonstrated end-to-end on his real 7-figure business incl. live auto-answered client SMS (Dt6u-yFEpsk); Delphi is the buy-not-build option.

**12. Competitor + buyer-trigger monitoring crons — 2–3 days each.**
(a) Monthly 4imprint/regional teardown as branded PDF (~$1.43/run demonstrated, tDGiWn0flK8) feeding the two-lane positioning. (b) Daily scan of Reddit/LinkedIn/X for swag-vendor complaints + buyer triggers (hiring sprees, new offices, awards) → each complaint can trigger an auto-mockup for the complaining company as the outreach hook.

### Tier 4 — Layer + rituals

**13. Two-way always-on Telegram agent — 1–2 days.**
Upgrade one-way launchd pushes to conversational: order status, HubSpot queries, "fire off a mockup for X" from a phone. Hermes harness ($5–10/mo VPS, two full installs demonstrated: NetworkChuck QQEgIo4Juxg, Herk gb5TlGw6Uks) or a Claude Code Telegram gateway on existing infra. Value is multiplied by #1–12 existing behind it. NetworkChuck's non-technical wife driving one daily = the Kenny adoption proof.

**14. Quarterly AI strategy stress test — 1–2 days.**
Plan doc + live SmartLead/HubSpot MCP data → frontier model writes a focus one-pager; "council" skill debates hard calls (personas: law-firm marketing manager, "why not 4imprint?" skeptic, Kenny). CA already has every ingredient (market-landscape-2026.md). Doubles as a recurring video format.
*Evidence:* Peter Yang demonstrated with real artifacts (5CBnWGP5vIs) — his #1 recommended use case.

**15. Secret-shop funnel audit + pre-ship adversarial bug audit — 0.5–1 day each.**
(a) Quarterly: shop CA's own quote flow incognito vs 4imprint's; whatever is slowest is the next build. (b) Before the mockup tool goes in front of a law-firm buyer: adversarial multi-agent audit ("find everything wrong"). Yang's audit found 12+ major bugs incl. a cross-user data leak in an app that passed all unit tests.

**16. Delivered-order → social-proof pipeline — 2–3 days.**
HubSpot closed-won → branded case-study card ("500 tumblers for [law firm] in 8 days") → LinkedIn + SmartLead follow-ups. Extends the existing CA Content Factory; per-client brand configs = on-brand at small-account scale, which 4imprint doesn't do.

**Cross-cutting hardening (~1 day, do before customer-facing flows):** unified error alerting to Telegram for every launchd job (currently missing), run logs, git on automation scripts, hard size caps + scheduled curation on memory files, secrets in .env with per-automation API keys, model routing (cheap models for scans/enrichment crons; frontier only for strategy, audits, planning).

---

## What "Hermes" and "Fable 5" actually are (both sweeps agree)

### Hermes = the Nous Research **Hermes Agent** (harness, not the Hermes 4 model)
- Free, MIT, massively adopted (210k+ GitHub stars, v0.18.0 July 1 2026, actively developed). Always-on VPS agent; one persistent memory across Telegram/Discord/Slack/WhatsApp/Signal/Email/CLI; natural-language cron jobs; built-in web search, browser automation, vision; parallel subagents; **self-improving skill loop** (writes its own reusable skills from experience — demonstrated on camera twice).
- Nous's own catalog: 262 community user stories, only 16 in business ops (Supabase CRM demo, Plane.so ticket triage, a roofing lead-gen app) → vertical-business whitespace CA can own and film.
- Independent reviewers: compounding benefit is token/time savings (~40%), suited to "solo developers and small teams building non-critical workflows" — **not audit-grade**. Don't put AR or unattended quoting on it.
- Nearly all YouTube setup videos are Hostinger-sponsored; installs are real, the "$5–8/mo no rate limits" framing is affiliate pitch.
- **Recommendation:** steal the patterns (bounded memory files, skill crystallization, git-backed portable brain, reverse-prompted crons) into the existing Claude Code stack; adopting the harness itself is optional for the Telegram layer (#13).

### Claude Fable 5 / Claude 5 family
- YouTube wave is scarcity-driven ("before July 7") — treat view velocity as packaging signal, not capability signal.
- Substantive demonstrated uses (Peter Yang): adversarial bug audits (12+ real bugs incl. cross-user data leak), skill-system audits, live-data strategy one-pagers, feature plans with unprompted UI design. Multiple independent videos flag Fable-class UI/design strength — direct validation of the mockup wedge's technical premise.
- Hype: "10x better than Opus" (no benchmark), Stripe 50M-line refactor anecdote (secondhand), most of Alex Finn's 8 items (prompts typed, never run).
- **Recommendation:** frontier model for planning/auditing/strategy (quarterly stress test, pre-demo audits, pipeline design); cheap models for routine execution crons.

---

## Do NOT cite these numbers (refuted 0–3 or 1–2 by verification panels)
- "Claude Code compresses campaign builds from half a day to 20 min" / "200–400 personalized emails/hour" — low-quality blogs (databar.ai, syncgtm.com).
- "Micro-campaigns get 5.8% vs 2.1% reply rates" and the "10–15 micro-campaigns/week" cadence — same blogs.
- "87%/92% of PPAI 100 have adopted AI" — failed verification.
- "Firefly/DALL-E are established for promo virtual mockups" — refuted; the practice isn't established, which is more white space.
- Also unverified (claimed-only): Lemkin's 70% reactivation response, Hormozi's 120K tickets/90% deflection, Saraev's 5–10% replies/$72K/mo, all of Herk's ROI math. Patterns sound; figures are sales copy.
- **No quantified ROI claim survived verification anywhere in this research.** Effort/impact estimates are directionally sound but unquantified — measure your own.

## Open questions worth answering next
1. Which GrowthEngineX skills work out-of-the-box for promo ICPs vs need adaptation; can warmup/inbox management be added?
2. How good are skubot/SAGE mockups in practice → how long is the real exclusivity window for a buyer-facing self-serve tool?
3. Real reply-rate lift from deep personalization on CA's own campaigns (A/B it — no trustworthy external benchmark exists).
4. Is Hermes reliable enough for revenue-critical flows; did Givenly's "Brand Bot" buyer-facing consultation agent ever ship?

## Key sources
- github.com/growthenginenowoslawski/coldoutboundskills (verified live 2026-07-07)
- anthropic.com/news/claude-for-small-business (primary, verified verbatim)
- commonsku.com/articles/the-ai-features-shipping-inside-commonsku (skubot beta)
- ppai.org — SAGE 2026 instant virtual samples (Jan 12, 2026)
- members.asicentral.com — "10 Promo Pros Reveal How They're Using AI" (Sept 2025; StickerYou, ASI 25% adoption stat)
- hermes-agent.nousresearch.com/docs + github.com/nousresearch/hermes-agent (primary)
- YouTube: Nate Herk (ZeJXI2MAhj0, tDGiWn0flK8, mi4hcipESKQ, Y3PcRp5RFzk, gb5TlGw6Uks), Ben AI (EqJoui72QrU), Nick Saraev (oAWe5wFwHlo), Peter Yang (5CBnWGP5vIs), NetworkChuck (QQEgIo4Juxg), Jono Catliff (Dt6u-yFEpsk), Lenny's Podcast/Lemkin (I-R1bc1rlFs), Isenberg/Finn (EJm8Ka-gVOc), Hormozi (fr78adfAnuA), Alex Finn (A3fxKRsvh3U), Futurepedia (e3OV3LnrS7o)
