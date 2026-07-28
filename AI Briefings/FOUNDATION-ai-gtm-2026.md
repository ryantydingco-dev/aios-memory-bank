# The Real State of AI in Sales, Outbound, and B2B Go-to-Market — 2026

**Foundation research report for the Dealthreads authority knowledge base.**
Compiled 2026-07-21. ~24 web searches + source fetches. Built to Ryan's editorial constitution: every claim sourced, verdicts over pitches, real numbers only, vendor marketing labeled as vendor marketing.

**Evidence-tier legend used throughout:**
- **[MEASURED]** — peer-reviewed study, RCT, government/administrative data, or independently audited dataset.
- **[SURVEY]** — self-reported survey data from a serious research org (McKinsey, Gartner, Forrester, Stanford HAI, trade bodies). Real, but answers are opinions, not telemetry.
- **[VENDOR]** — data published by a company that sells the thing being measured (Smartlead, Instantly, Lavender, Qualified, Bullhorn, Expandi). Often the only telemetry that exists; always assume selection bias.
- **[REPORTED]** — journalism (TechCrunch, Fortune, CNBC) based on named/unnamed sources.
- **[ANECDOTE]** — individual practitioner accounts, reviews, blog posts.
- **[SHAKY]** — commonly repeated, poorly sourced, or unverifiable. These are hype-watch fodder.

---

## 1. The Numbers That Matter (Authority Ammunition)

Thirty citable stats. Each entry: the number, the tier, the source, the date, the URL, and the caveat you say out loud on camera.

### Failure and reality-check numbers

1. **95% of enterprise GenAI pilots produce zero measurable P&L impact.** [SURVEY/REPORTED] MIT Project NANDA, "The GenAI Divide: State of AI in Business 2025" (Aug 2025), covered by Fortune. Method: 150 leader interviews, 350-employee survey, 300 public deployments. Caveat: this is about custom enterprise pilots, not individual tool use — and MIT's own framing is a "learning gap," not "AI doesn't work." https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/

2. **42% of companies abandoned most of their AI initiatives in 2025 — up from 17% in 2024.** [SURVEY] S&P Global Market Intelligence, 1,000+ enterprises, N. America + Europe. Average org scrapped **46% of AI proofs-of-concept** before production. https://www.ciodive.com/news/AI-project-fail-data-SPGlobal/742590/

3. **Gartner predicts 40%+ of agentic AI projects will be canceled by end of 2027** — costs, unclear business value, inadequate risk controls. Gartner also estimates **only ~130 of the "thousands" of agentic AI vendors are real** (the rest are "agent washing"). [SURVEY/analyst opinion — Gartner predictions are forecasts, not measurements] (Jun 25, 2025). https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027

4. **70–80% of 11x's customers churned within ~3 months; of ~$14M claimed ARR, roughly $3M survived the 90-day break clause.** [REPORTED] TechCrunch investigation by Marina Temkin (Mar 24, 2025), ~two dozen sources. 11x also displayed ZoomInfo and Airtable logos as customers; Airtable said it never was one, ZoomInfo said 11x performed worse than its own human SDRs and churned. https://techcrunch.com/2025/03/24/a16z-and-benchmark-backed-11x-has-been-claiming-customers-it-doesnt-have

5. **AI chatbots deployed across 7,000 Danish workplaces produced no significant effect on earnings or hours in any of 11 occupations studied** (confidence intervals rule out effects >1%); users self-reported average time savings of just **2.8% of work hours**. [MEASURED] Humlum & Vestergaard, NBER Working Paper 33777 (2025), linked survey + payroll administrative data, ~25,000 workers. https://www.nber.org/system/files/working_papers/w33777/w33777.pdf and https://fortune.com/2025/05/18/ai-chatbots-study-impact-earnings-hours-worked-any-occupation/

6. **Experienced open-source developers were 19% SLOWER with AI tools in a randomized trial — while believing they were 20% faster.** [MEASURED] METR RCT (Jul 2025; 16 devs, 246 real tasks, Cursor + Claude 3.5/3.7). METR itself now labels the result historical/tool-generation-specific — quote it with that caveat. https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/

7. **41% of US full-time workers received AI "workslop" in the prior month; each incident costs ~1h56m to untangle, ≈$186/employee/month.** [SURVEY] BetterUp Labs + Stanford Social Media Lab, published in HBR (Sep 2025), n=1,150. 42% viewed the workslop sender as less trustworthy. https://hbr.org/2025/09/ai-generated-workslop-is-destroying-productivity

### Effectiveness numbers (the honest positive case)

8. **The single best causal study of AI in a sales-adjacent job: +14–15% productivity for customer-support agents, +34% for novices, ~0% for top performers.** [MEASURED] Brynjolfsson, Li & Raymond, NBER WP 31161 (2023), published in *Quarterly Journal of Economics* (2025); 5,179 agents, staggered rollout. AI compresses the skill gap from the bottom; it does not lift the top. https://www.nber.org/papers/w31161 / https://academic.oup.com/qje/article/140/2/889/7990658

9. **An undisclosed AI chatbot making outbound sales calls matched proficient human sellers and was 4x better than inexperienced ones — but disclosing "this is a bot" up front cut purchase rates by 79.7%.** [MEASURED] Luo, Tong, Fang & Qu, *Marketing Science* 38(6), 2019; field experiment, 6,200+ customers. The foundational study for the entire "do buyers punish known AI?" question. https://pubsonline.informs.org/doi/10.1287/mksc.2019.1192

10. **Fully AI-generated cold emails: 2.4% reply rate. Fully human: 3.8%. AI-assisted + human-edited: 5.1%.** [VENDOR] Lavender (Will Allred/William Ballance), analysis of ~100M B2B sales emails. This is the most citable "centaur beats bot" stat in outbound — but it's vendor telemetry from a company selling an email-coaching tool, and classification of "AI-generated" is theirs. https://lavender.ai/blog/the-cold-email-benchmark-report / summary: https://laviebenrose.substack.com/p/ai-assisted-emails-get-51-reply-rates

11. **Klarna's AI assistant handled 2.3M chats in month one (workload of ~700 agents), resolved issues in <2 min vs 11 min, projected +$40M profit — then in May 2025 Klarna publicly reversed and rehired humans.** CEO Siemiatkowski: "We focused too much on cost. The result was lower quality." [VENDOR numbers, REPORTED reversal] https://www.forbes.com/sites/quickerbettertech/2025/05/18/business-tech-news-klarna-reverses-on-ai-says-customers-like-talking-to-people/ Note: the "700" was avoided hires during growth, not layoffs — commonly misreported.

### Adoption numbers

12. **88% of organizations now report regular AI use, but only 39% report any enterprise-level EBIT impact, and only ~6% qualify as "high performers" (≥5% of EBIT attributable to AI).** [SURVEY] McKinsey State of AI 2025 (fielded Jun 25–Jul 29, 2025; n=1,993, 105 countries). https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai

13. **Stanford HAI AI Index 2026: 88% org adoption, 70% use GenAI in at least one function — but agent deployment remains in single digits in nearly every business function.** Corporate AI investment $581.7B (+130% YoY). [SURVEY/MEASURED mix] https://hai.stanford.edu/ai-index/2026-ai-index-report

14. **Salesforce State of Sales 2026: 87% of sales orgs use some form of AI; ~41% "fully implemented," 40% experimenting.** [SURVEY + VENDOR — Salesforce sells the AI] https://www.salesforce.com/news/stories/state-of-sales-report-announcement-2026/ and https://www.salesforce.com/sales/state-of-sales/sales-statistics/

15. **HubSpot 2025 State of Sales: individual rep AI usage went 24% (2023) → 43% (2024); only 19% of reps use the AI built into their sales tools.** [SURVEY + VENDOR] The adoption is bottoms-up ChatGPT use, not sales-stack AI. https://blog.hubspot.com/sales/hubspot-sales-strategy-report

16. **SMB AI adoption depends entirely on the question asked: 58% of small businesses "use generative AI" (US Chamber, 2025, up from 40% in 2024) — but only ~17–20% use AI in actual production operations (US Census Bureau BTOS, May 2026; JPMorgan Chase Institute transaction data: 17.7%, Dec 2025).** [SURVEY vs MEASURED] The spread between 89% and 17.7% for "SMB AI adoption" is itself a story. https://capsulecrm.com/blog/small-business-ai-adoption-statistics/ / https://factoryjet.com/blog/ai-adoption-us-small-businesses-2026

### Channel numbers — email

17. **Average cold email reply rate 2026: 3.43% (Instantly benchmark report; "billions" of sends). Top quartile 5.5%+, top decile 10.7%+. First email drives 58% of all replies; best first-touch emails <80 words; 4–7 touches optimal.** [VENDOR] https://instantly.ai/cold-email-benchmark-report-2026

18. **The reply-rate decay curve everyone cites: ~8.5% (2019, Backlinko) → ~7% (2023) → ~5% (2025) → 3.43% (2026, Instantly).** [VENDOR/SHAKY as a single series] These are different datasets with different methodologies stitched into one trendline — the direction is real, the precision is fake. https://martal.ca/b2b-cold-email-statistics-lb/

19. **Smartlead's dataset: 14.3 billion cold-email sends, Jan 2021–Apr 2025; recent average open rate ~27%.** [VENDOR] "Reply" includes "not interested"; positive replies are a fraction of raw replies. https://www.smartlead.ai/blog/email-optimization-best-practices (Ryan's own observed rate — ~1 positive per 700–1,100 sends — is consistent with positive-reply reality vs raw-reply marketing numbers.)

20. **Since Feb 1, 2024, Google and Yahoo block bulk senders (5,000+/day) exceeding a 0.3% spam-complaint rate and require SPF/DKIM/DMARC + one-click unsubscribe. Microsoft applied equivalent rules to Outlook/Hotmail/Live on May 5, 2025.** [MEASURED — these are published platform policies] https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/ / https://www.mailgun.com/blog/deliverability/microsoft-sender-requirements/

21. **Open rates are now close to meaningless: Apple Mail Privacy Protection (2021) pre-loads tracking pixels on Apple servers, and Gmail's Gemini summaries (2026) auto-open emails to summarize them.** Omeda (billions of emails): CTR fell ~4.35% → ~3.93% after Gmail AI summaries. [MEASURED mechanism, VENDOR magnitude] Measure positive replies and meetings, never opens. https://www.paubox.com/blog/how-apple-mail-privacy-protection-inflates-email-open-rates / https://folderly.com/blog/gmail-gemini-ai-email-deliverability-2026

### Channel numbers — phone and LinkedIn

22. **Cold-call connect rates: Gong Labs (300M+ calls): 5.4% average, 13.3% top quartile. Cognism (200K calls): 8–12% on generic data, 18–22% on verified mobile direct dials. ~2.3–2.7% dial-to-meeting.** [VENDOR — both sell into this workflow] Data quality roughly doubles connect rate; that's the real lever. https://www.cognism.com/blog/cold-calling-statistics

23. **Since Feb 2024 the FCC treats AI-generated/cloned voices as "artificial or prerecorded voice" under the TCPA — AI cold calls carry robocall-level consent requirements (statutory damages $500–$1,500/call).** [MEASURED — regulation] The FCC's separate "one-to-one consent" lead-gen rule was vacated by the Eleventh Circuit on Jan 24, 2025, and the FCC dropped it — good news for lead-gen mechanics, but the AI-voice rule stands. https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/eleventh-circuit-vacates-tcpa-11-consent-rule / https://klariqo.com/blog/tcpa-compliance-ai-voice-agents/

24. **LinkedIn: ~100 connection requests/week cap (all tiers; SSI and Sales Nav can stretch to ~150–200); free accounts adding notes can be limited to ~5/week. Expandi (13.2M requests, 2025–26): 28.5% average acceptance; staffing & recruiting is the TOP-accepting industry at 36.5%.** [VENDOR — automation vendors measuring their own users] Notable: acceptance with vs without a note was 26.42% vs 26.37% — the note doesn't help acceptance, but noted connections reply at ~9.4%. https://expandi.io/blog/linkedin-outreach-benchmarks-2026/ / https://phantombuster.com/blog/social-selling/linkedin-connection-request-limit/

### Buyer-side and regulatory numbers

25. **Gartner (survey fielded Aug–Sep 2025, published Mar 2026): 67% of B2B buyers prefer a rep-free experience; 45% used AI during a recent purchase. Gartner ALSO predicts (Aug 2025) that by 2030, 75% of B2B buyers will prefer experiences prioritizing HUMAN interaction over AI.** [SURVEY + analyst forecast — note Gartner is simultaneously selling both narratives] https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience / https://www.gartner.com/en/newsroom/press-releases/2025-08-25-gartner-says-by-2030-that-75-percent-of-b2b-buyers-will-prefer-sales-experiences-that-prioritize-human-interaction-over-ai

26. **Forrester 2026 predictions: B2B companies will lose $10B+ in enterprise value from ungoverned GenAI; 19–20% of buyers using GenAI felt LESS confident in their decision because of unreliable AI output (28% among procurement); 69% of buyers still go to a human rep to validate AI-generated insights.** [SURVEY + forecast] https://www.forrester.com/press-newsroom/forrester-b2b-marketing-sales-product-2026-predictions/

27. **FTC "Operation AI Comply" (launched Sep 25, 2024; continuing under the new administration through 2025): five enforcement actions against deceptive AI claims, incl. DoNotPay's "AI lawyer" ($193K settlement) and Rytr (AI fake-review generation).** [MEASURED — enforcement record] Making unsubstantiated AI-performance claims in your own marketing is now an enforcement category. https://www.mintz.com/insights-center/viewpoints/54731/2024-10-03-ftc-launches-operation-ai-comply-five-enforcement / https://www.beneschlaw.com/insight/one-year-in-ftcs-operation-ai-comply-continues-under-new-administration-signaling-enduring-enforcement-focus/

### Staffing/recruiting numbers

28. **Bullhorn GRID 2026 (16th annual, ~2,300 recruitment professionals, fielded Nov–Dec 2025): agencies using AI anywhere in the recruitment cycle are 3.5–4.5x more likely to have grown revenue; only 10% of firms have AI embedded throughout the workflow; 56% of top-performing agencies place in under 10 days.** [SURVEY + VENDOR — Bullhorn sells the ATS] Correlation ≠ causation: growing firms can afford AI. https://www.bullhorn.com/grid/2026-industry-trends/report/ / https://www.globenewswire.com/news-release/2026/02/25/3244739/0/en/bullhorn-grid-report-staffing-firms-using-ai-see-stronger-growth-faster-placements.html

29. **SIA: agency AI adoption 61% in 2025, up from 48% in 2024. Pin's 2026 State of Recruitment Agencies: business development is the #1 priority for 44% of agency leaders; 83% of agencies need 1–6 months to close a new client; 44% of salespeople give up after a single follow-up.** [SURVEY + VENDOR (Pin sells recruiting outbound)] This is Ryan's ICP thesis in three numbers: staffing firms rank BD first, close slowly, and follow up badly. https://www.pin.com/blog/state-of-recruitment-agencies-report/

30. **LinkedIn now processes ~11,000 job applications per minute (+45% YoY); ~70–74% of job seekers use GenAI in applications; 93% of recruiters plan to increase AI use in 2026.** [REPORTED/SURVEY] The candidate side of recruiting drowned in AI first; the client-acquisition side is next. https://www.eweek.com/news/ai-job-applications-linkedin/ / https://www.cnbc.com/2026/01/11/ai-dominate-hiring-2026-linkedin-execs-top-tips-stand-out.html

---

## 2. What the Studies Actually Say About AI in Sales

### 2.1 The causal evidence is thin, positive, and specific

There are very few *measured* (non-survey) studies of AI in selling or sales-adjacent work. The ones that exist agree on a pattern:

- **Brynjolfsson/Li/Raymond (NBER 31161 → QJE 2025)**: +14–15% average productivity in customer support; the gain concentrates in novices (+34%) and rounds to zero for top performers. AI transfers the tacit knowledge of top performers to everyone else. Implication for outbound teams: AI is a floor-raiser, not a ceiling-raiser. If your differentiation is that your best people write better emails than everyone else's, AI erodes that moat; if your differentiation is judgment about *who* to contact and *why now*, it doesn't (yet).
- **Luo et al. (Marketing Science 2019)**: an AI voice agent doing scripted outbound *worked* — equal to proficient humans — until the customer knew it was a bot, at which point purchases fell 79.7%. Pre-LLM, but it remains the only randomized field experiment on AI doing actual outbound selling. Two readings: (a) AI can execute structured sales conversations, (b) the economics of AI outbound depend on either concealment (increasingly illegal/regulated for voice — see §3.3) or a buyer population that has stopped caring. Nobody has published a 2025-era replication. That absence is itself notable.
- **Humlum & Vestergaard (NBER 33777)**: the sobering macro check. Across 25,000 Danish workers whose employers pushed chatbots, real payroll data shows ~no effect on earnings or hours; self-reported time savings 2.8%. RCT-style gains (15%+) in lab-like conditions largely fail to reach the paycheck. The gap between task-level gains and firm-level outcomes is the central open question in the entire literature.
- **METR (2025)**: the perception-gap result. Experienced devs 19% slower with AI, believing +20% faster. Not a sales study, but the *self-assessment bias* generalizes: every "AI saves my reps 10 hours a week" survey stat should be read against a measured result where confident users were wrong about the sign of the effect.

### 2.2 The survey evidence says adoption is nearly universal and impact is rare

- McKinsey 2025: 88% adoption, 39% report any EBIT impact, ~6% are "high performers." The funnel from "we use AI" to "AI moved profit" loses ~94% of companies.
- Stanford HAI 2026: 88% org adoption, agent deployment single-digit per function. The "agentic era" is, as of the data, mostly a slideware era.
- MIT NANDA: the 95% pilot-failure number. Use it carefully — the study's own explanation is a "learning gap" (tools don't adapt to workflows, orgs don't adapt to tools), and its methodology (interviews + 300 public deployments) is far weaker than the headline suggests. It's a directional indictment of *enterprise pilot theater*, not proof that "AI doesn't work."
- S&P Global: abandonment of most AI initiatives jumped 17% → 42% in one year. This is the best single stat for "2025 was the year the pilot backlog got cancelled."

### 2.3 The synthesis Ryan can defend on camera

1. AI reliably improves *narrow, structured, high-volume* work (support tickets, first-draft copy, list processing) by 10–35%, mostly for weaker performers. [MEASURED]
2. Those gains mostly do not show up in company-level financials yet. [MEASURED + SURVEY]
3. Full replacement of a human seller has one rigorous supporting study — and it required the buyer not knowing. [MEASURED]
4. Everything else — "3x pipeline," "AI SDR outperforms humans," "reps save 2 hours a day" — is vendor telemetry or self-report. [VENDOR/SURVEY]

---

## 3. Deliverability and Channel Reality 2026

### 3.1 Cold email: compliance floor went up, signal went down

**The rules (hard facts):**
- Gmail + Yahoo, effective Feb 1, 2024: bulk senders (5,000+/day to consumer inboxes) must have SPF + DKIM + DMARC, one-click unsubscribe (honored ≤2 days), and spam-complaint rate under **0.3%** (aim <0.1%). Enforcement escalated through 2024–25 from spam-foldering to outright rejection. (Mailgun/Google Postmaster documentation; https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/)
- Microsoft (Outlook.com/Hotmail/Live), effective May 5, 2025: same trio of authentication requirements for 5,000+/day senders; non-compliant mail junked, later rejected. (https://www.mailgun.com/blog/deliverability/microsoft-sender-requirements/)
- Practical consequence: the cold-email industry's response was *inbox sprawl* — many domains × few sends each to stay under thresholds and dilute complaint rates. That is exactly the infrastructure Dealthreads runs (warmed inbox fleets). It works, but it's an arms race the mailbox providers are aware of; treat any single domain as disposable and any "deliverability guarantee" as marketing.

**The performance reality:**
- Raw reply rates: 3.43% average (Instantly 2026, vendor). Positive-reply rates run far lower — replies include "unsubscribe me." Ryan's observed ~1 positive per 700–1,100 sends on cold verticals is not underperformance; it's what honest positive-rate math looks like on cold lists in 2026.
- Structure findings that replicate across vendor datasets: first touch drives most replies (58% per Instantly); <80–120 words wins; 4–7 touches; bounce <2%.
- **Open rates are dead as a metric.** Apple MPP (2021) pre-fetches pixels; Gmail Gemini (2026) auto-opens to summarize. Any agency still reporting open rates is reporting noise. Report: delivered, positive replies, meetings.
- Gemini-era addition: Gmail now summarizes and priority-sorts inbound. Folderly and others [VENDOR] argue the email increasingly has to survive an *AI reader* before a human sees it — plain, specific, front-loaded value; spammy formatting gets pre-filtered. Mechanism plausible, magnitudes unproven.

### 3.2 LinkedIn: capped, but the best-performing channel for Ryan's ICP

- Hard caps: ~100 invites/week standard, throttling below that at low acceptance; personalized-note limits on free accounts. [VENDOR docs: PhantomBuster, Expandi, Evaboot]
- Expandi 13.2M-request benchmark [VENDOR]: 28.5% avg acceptance; >30% is good; <20% triggers algorithmic throttling. **Staffing & recruiting is the highest-accepting industry vertical (36.5%)** — directly useful for Dealthreads pitches.
- Volume finding: acceptance peaked at 10–19 invites/day and *fell* as volume rose. LinkedIn structurally punishes the spray that email still (barely) tolerates.

### 3.3 Cold calling + AI voice: the most regulated channel

- FCC declaratory ruling (Feb 2024): AI-generated/cloned voices = "artificial or prerecorded voice" under TCPA. Consent, disclosure, and DNC rules apply; statutory damages $500–$1,500 per call and TCPA class actions are a plaintiff-bar industry. An "AI SDR that calls" sold to US SMBs without consent infrastructure is a lawsuit generator. [REGULATION]
- Eleventh Circuit vacated the FCC's one-to-one consent (lead-gen loophole) rule Jan 24, 2025; FCC formally dropped it in 2025. Shared-consent lead-gen lives on, but the underlying robocall rules are untouched. [REGULATION] https://www.womblebonddickinson.com/us/insights/blogs/fcc-repeals-one-one-consent-rule-following-eleventh-circuit-decision
- Human calling benchmarks (vendor data, §1 #22): connect rates 5–12% generic, up to ~2x on verified mobiles. The channel is expensive per conversation but uncrowded relative to email — precisely because it doesn't scale with AI legally.

### 3.4 The cross-channel meta-trend

Every channel shows the same shape: **AI made sending cheap, so receivers (humans and platforms) installed filters, so the price of attention moved from production cost to trust and relevance.** Email got the 0.3% rule, LinkedIn got acceptance-based throttling, phones got the AI-voice TCPA ruling, and buyers got pattern recognition ("I can tell it's GPT by sentence two" — widely claimed, poorly measured; see Hype Ledger #7).

---

## 4. The AI SDR Category: Promise vs Evidence

### 4.1 The promise
2023–2025 pitch: "hire" an AI SDR (11x's Alice, Artisan's Ava, AiSDR, Regie, etc.) that researches, personalizes, sequences, replies, and books — at a fraction of a $70–90K loaded SDR cost. Funding followed: 11x raised a ~$50M Series B led by a16z at ~$350M (Sep 2024, TechCrunch); Artisan raised $25M Series A (Apr 2025) after a viral "Stop Hiring Humans" billboard campaign, disclosing ~250 customers / ~$5M ARR at the time. [REPORTED/VENDOR]

### 4.2 The evidence
- **11x (TechCrunch, Mar 24, 2025):** 70–80% churn inside 3 months; ~$3M of ~$14M claimed ARR survived break clauses; unauthorized customer logos (Airtable never a customer; ZoomInfo churned after a month saying 11x underperformed its own SDRs); employees describing hallucinations and a product "not working as suggested." [REPORTED] The single most important document in the category.
- **Artisan:** CEO Jaspar Carmichael-Jack publicly admitted first-gen AI SDRs had "pretty low response rates" and "relatively high churn." G2 reviews cite "bland," "obviously AI" messaging and "ZERO quality leads" after two months. [ANECDOTE/VENDOR-adjacent] The category leader's own founder conceding v1 didn't work is quotable.
- **Qualified's Piper** (the strongest counter-case): claims $200M pipeline, 9,000+ meetings across 300+ customers; Blackbaud +68% meetings. [VENDOR — all numbers from qualified.com] Crucial nuance: Piper is an **inbound** AI SDR — it responds to people already on your website. The evidence that AI can competently work *inbound* intent is meaningfully better than the evidence it can generate *outbound* demand. Don't let vendors blur that line.
- **Practitioner field tests** (Medium/SDR-blog reviews of 11x/Artisan/AiSDR, 2025–26): recurring findings — decent volume, weak targeting, personalization that misfires on edge cases, and meetings that no-show or don't qualify. [ANECDOTE]

### 4.3 The honest verdict
- What AI SDR tools demonstrably do: compress list-building, research, and first-draft personalization from hours to minutes; triage and respond to inbound within seconds; run infrastructure (rotation, warmup) no human wants to manage.
- What no independent evidence shows: an autonomous agent sustainably out-booking a competent human SDR on cold outbound, at equal list quality, without a human in the loop.
- The economics point the same way as Lavender's 2.4%/3.8%/5.1% split: **the winning configuration is human judgment + AI leverage**, i.e., exactly the "DFY outbound run by an operator using AI" shape Dealthreads sells. The AI SDR category's failure is Ryan's positioning gift: he doesn't compete with 11x, he cleans up after it.
- Watch: Gartner's "only ~130 real agentic vendors" estimate and the 40%-cancellation-by-2027 prediction imply category consolidation; expect surviving vendors to pivot to "AI-assisted SDR workflow" language through 2026–27.

---

## 5. AI in Staffing/Recruiting Specifically

### 5.1 Adoption: high on paper, shallow in the workflow
- Bullhorn GRID 2026 (n≈2,300): near-universal *some* AI use; only **10% have AI embedded throughout the workflow**; AI-using firms 3.5–4.5x more likely to have grown revenue (correlation — well-run firms adopt more of everything). Top applications: conversational AI (55%), résumé parsing/database cleanup (45%). [SURVEY/VENDOR]
- SIA: 61% agency adoption in 2025 (48% in 2024). Avionté's 2026 State of Staffing echoes discipline over hype. [SURVEY]
- Market backdrop: US staffing ~$178.9B (2025), ~+2% projected 2026 — a flat market where share shifts, which historically is when firms buy growth services. [SURVEY — SIA sizing]

### 5.2 Where staffing AI actually concentrates
Candidate-side automation: sourcing, screening, scheduling, résumé parsing, chatbot pre-screens. LinkedIn's Hiring Assistant (Oct 2025) automates job descriptions, screening, applicant messaging. Meanwhile the candidate side is flooded — 11,000 applications/minute on LinkedIn, ~70%+ of seekers using AI, recruiters hitting "1,000-applicant threshold" listings, Greenhouse's 2025 AI in Hiring report describing a two-sided trust collapse. [REPORTED/SURVEY] Net effect: **AI made candidate volume worthless and made vetted, warm, human-verified pipelines (of both candidates and clients) the scarce asset.**

### 5.3 The client-acquisition gap — Dealthreads' wedge
- Pin's 2026 agency report: BD is priority #1 for 44% of agency leaders; 84% expect sales growth; 83% take 1–6 months to close a new client; 44% of their salespeople quit after one follow-up. [SURVEY/VENDOR]
- Staffing firms are recruiters first, sellers second: their AI budgets went to candidate ops, not client outbound. Their vertical is also the single best-performing LinkedIn outreach category (36.5% acceptance, Expandi).
- Translation for Ryan's content: staffing owners can be shown, with third-party numbers, that (a) their industry's AI spend ignores the revenue side, (b) their buyers accept connection requests at the highest rate of any vertical, and (c) firms with systematic multi-touch BD are the outliers because 44% of their peers stop after one follow-up.

---

## 6. The Hype Ledger — 10 Common Claims vs the Evidence

| # | The claim you'll hear | What the evidence actually supports | Verdict |
|---|---|---|---|
| 1 | "95% of AI projects fail — AI doesn't work." | MIT NANDA found 95% of *enterprise GenAI pilots* showed no P&L impact, blamed on integration/learning gaps, using interviews + public deployments, not audited financials. Simultaneously, individual-level use is massive and measured task gains are real. | Half-true, doubly misused — by doomers ("AI is useless") and by vendors ("...unless you buy ours"). |
| 2 | "AI SDRs replace human SDRs." | One rigorous study of AI doing outbound (Luo 2019) required nondisclosure to work; the category leader posted 70–80% churn (TechCrunch); Artisan's CEO conceded v1 underperformed; best vendor numbers come from *inbound* agents. | Unsupported for cold outbound. Supported only as "AI compresses SDR grunt work." |
| 3 | "AI personalization lifts reply rates 2–3x." | Lavender's 100M-email data shows fully-AI emails *underperform* human ones (2.4% vs 3.8%); AI-assisted wins (5.1%). Vendor "2.7x with personalization" stats (Smartlead) compare against undifferentiated blasts — a strawman baseline. | The lift is from thinking + editing, not from the AI button. |
| 4 | "Cold email is dead (Google killed it in 2024)." | Google/Yahoo/Microsoft rules killed *unauthenticated, high-complaint* sending. Instantly's top decile still clears 10%+ replies; Ryan's live campaigns still source real buyer replies. Volume economics worsened; targeted economics survive. | False, but the floor got real: 0.3% complaint rate is a hard constitution. |
| 5 | "Buyers can spot AI emails in two sentences." | Widely quoted (attributed to "Gartner 2026 B2B buyer research" in vendor blogs); the primary source is elusive — no public Gartner document with that phrasing surfaced. Adjacent real data: 57% say outreach feels impersonal (Sopro-cited); Lavender's reply gap is consistent with *something* being detected. | Plausible, unproven, mis-cited. Prime hype-watch material. |
| 6 | "Reps save 10+ hours a week with AI." | Self-reported surveys say yes (HubSpot/Salesforce, both AI vendors). The only payroll-linked measurement (Denmark, 25K workers) found 2.8% time savings (~1h10m on a 40h week) and no earnings/hours effect; METR found confident users misjudged even the *direction* of their productivity change. | Survey artifact until someone measures it. |
| 7 | "87% of sales orgs use AI" (as proof it works). | Salesforce's number is real as a survey stat, but "use AI" includes autocomplete and note summaries. McKinsey: only ~6% of orgs get ≥5% EBIT from AI. Adoption stats measure fashion, not efficacy. | True number, false implication. |
| 8 | "AI staffing firms grow 3.5–4.5x faster." | Bullhorn GRID shows AI-adopting agencies were 3.5–4.5x *more likely to report* revenue growth. Cross-sectional, self-reported, sold by an ATS vendor. Firms with money adopt tools; tools don't necessarily make money. | Correlation dressed as causation — but still directionally useful. |
| 9 | "Buyers don't want salespeople anymore (67% rep-free)." | Gartner's 67% rep-free stat coexists with Gartner's own 2030 prediction (75% will prefer human-prioritized experiences) and Forrester's finding that 69% of buyers use a human rep to *validate* AI research and ~20% trust AI outputs less after using them. Buyers want fewer *bad* rep interactions, not zero humans. | Cherry-picked. The full picture is a trust story, not a replacement story. |
| 10 | "Our AI books you 30 meetings a month" (agency/tool pitch). | No independent benchmark supports guaranteed meeting volumes; honest math from observed positive-reply rates (~1 per 700–1,100 cold sends in Ryan's data; low-single-digit positive % industry-wide) makes most guarantees arithmetically impossible without garbage meetings. FTC's Operation AI Comply now explicitly targets unsubstantiated AI-performance claims. | Unsupported and, post-2024, a regulatory risk for whoever says it. |

---

## 7. Fifteen Content Angles for Ryan (deadpan house style)

Each: working title + the stat/source it's built on. All defensible from this document.

1. **"I read the study everyone quotes about AI replacing SDRs. It's from 2019 and the bot had to lie."** — Luo et al., *Marketing Science* 2019: disclosure cut purchases 79.7%. Then bridge to the FCC's 2024 AI-voice ruling making the nondisclosure play illegal on the phone.
2. **"The AI SDR with a $350M valuation kept 20% of its customers."** — TechCrunch's 11x investigation (70–80% churn, ~$3M of $14M ARR surviving). Verdict-over-pitch teardown of the whole category.
3. **"AI writes my cold emails. That's why they underperform."** — Lavender 100M-email split: 2.4% fully-AI vs 5.1% AI-assisted. Live demo: take a fully-AI email, do the human 20%, show the difference.
4. **"Everyone's open rate went up this year. It's because a robot is opening your email."** — Apple MPP + Gmail Gemini auto-opens; Omeda CTR decline. Why Dealthreads reports positive replies and meetings only.
5. **"Google published the exact number that gets your cold email domain executed. It's 0.3%."** — Gmail/Yahoo Feb 2024 + Microsoft May 2025 sender rules, explained as an operator's compliance checklist.
6. **"MIT says 95% of AI pilots fail. Here's the part of the study nobody reads."** — NANDA methodology + "learning gap" framing; both the doomer and the vendor misuse of the stat.
7. **"A study followed 25,000 workers using AI. Their paychecks didn't move."** — Humlum & Vestergaard NBER: 2.8% time savings, zero earnings/hours effect. The gap between task gains and money.
8. **"Developers using AI were 19% slower and swore they were 20% faster. Your sales team is not immune."** — METR RCT; why "my reps feel faster" isn't data.
9. **"Staffing firms spent their AI budget on the wrong side of the business."** — Bullhorn GRID (candidate-side AI concentration, 10% full-workflow) × Pin (BD = #1 priority for 44%, 44% of agency salespeople quit after one follow-up). The Dealthreads thesis video.
10. **"Recruiters have the best LinkedIn stats in the world and don't use them."** — Expandi 13.2M-request data: staffing & recruiting #1 acceptance at 36.5% vs 28.5% average.
11. **"11,000 job applications a minute: AI ruined recruiting's inbox. Yours is next."** — eWeek/LinkedIn data + Greenhouse trust-collapse report; sender-side arms race as a preview of every channel.
12. **"Gartner says buyers don't want reps. Gartner also says buyers will want humans back. Both press releases, one year apart."** — 67% rep-free (Mar 2026) vs 75%-human-by-2030 (Aug 2025) vs Forrester's 69%-validate-with-a-human. Analyst-industrial-complex teardown.
13. **"The FTC has a name for your AI marketing claims now."** — Operation AI Comply, DoNotPay's $193K "AI lawyer" settlement; why Dealthreads doesn't guarantee meeting counts.
14. **"Klarna fired the equivalent of 700 agents for AI. Then it hired humans back. Both press releases were true."** — 2024 numbers vs May 2025 reversal; the hybrid ending as the actual lesson (and the '700 avoided hires' misreport as a bonus correction).
15. **"What 1 positive reply per 1,000 cold emails actually costs — my real numbers vs the benchmark reports."** — Instantly's 3.43% raw-reply average vs positive-reply reality vs Ryan's observed 1/700–1,100. The honest-math funnel video; nobody else will publish their denominator.

---

## Appendix: Source Quality Notes

- **Most load-bearing measured sources:** NBER 31161/QJE (Brynjolfsson et al.), NBER 33777 (Humlum), Marketing Science 2019 (Luo), METR RCT, platform sender policies (Google/Yahoo/Microsoft), FCC/Eleventh Circuit/FTC records.
- **Serious-but-survey:** McKinsey State of AI 2025, Stanford HAI Index 2026, S&P Global 2025, Gartner press releases (treat predictions as marketed opinions), Forrester 2026 predictions, US Chamber, Census BTOS, JPMC Institute.
- **Vendor telemetry (usable with disclosure):** Instantly 2026 benchmark, Smartlead 14.3B-send dataset, Lavender 100M-email analysis, Expandi 13.2M LinkedIn requests, Gong Labs 300M calls, Cognism call data, Bullhorn GRID, Pin, Qualified case studies.
- **Known-shaky items flagged in text:** the 8.5%→3.43% reply "trendline" (stitched datasets), "spot AI in two sentences" (unverifiable Gartner attribution), "69% bothered by AI outreach" (vendor-blog provenance), all AI SDR vendor ROI claims, Bullhorn/SIA growth multipliers (correlation).
- **Gaps in the literature worth naming on camera:** no published RCT of LLM-era AI on cold outbound performance; no independent audit of any AI SDR vendor's booked-meeting quality; no measured (non-survey) data on staffing-firm client-acquisition AI use.
