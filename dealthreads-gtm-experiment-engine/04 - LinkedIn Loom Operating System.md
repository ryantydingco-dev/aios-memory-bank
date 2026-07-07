# 04 — LinkedIn + Loom Operating System

The concrete, trackable operating manual for the Dealthreads GTM Experiment Engine wedge motion: **LinkedIn DM + connection request → personalized 60-90s Loom → structured 2-3 touch follow-up.** Email is an optional, low-volume secondary, not the engine.

This is the exact motion Ryan runs live on Oloxa (client #0). Everything here is built to drop straight into a spreadsheet or CRM and to be reviewed weekly. Schemas list **exact column names** so you can paste them as a header row today.

> **The one rule that governs this whole doc:** we optimize for **qualified conversations**, not reply rate. A wall of "haha nice" replies is a failure. Three real conversations with fit buyers is a win. Wherever a metric can be gamed by being annoying or vague, it's flagged as **VANITY** below.

---

## 0. Operating principles (read before the schemas)

- **Human-approved, every message.** The system drafts; a human approves the ICP, the list, and every single message and Loom before it sends. This is the on-brand, non-spammy guarantee — not a nice-to-have.
- **Low volume, high relevance.** This is a LinkedIn-first motion. We are not chasing send counts. ~10-20 *new* connection requests/day per sending profile is the working ceiling, not a target to max out. More than that risks the account and dilutes quality.
- **The Loom is the differentiator.** Anyone can send a DM. A specific, 60-90s Loom referencing *their* business is what earns the reply and the call. If a prospect doesn't warrant a real Loom, they probably don't belong in the universe.
- **Personalization comes from a signal, not a template.** Every outbound references a concrete observed reason we reached out (the signal). No signal → no send.
- **One artifact per prospect: the research card.** Account schema + contact schema + signal schema combine into the research card the human approves before recording the Loom. (Card format lives in file `03`; this doc defines the underlying fields.)

---

## 1. Account Universe schema (the TAM)

One row per **company**. This is the account-level table — the universe of orgs worth pursuing for the current ICP (agencies/consultants selling high-ticket B2B services). Build it, score it, and only then enrich contacts.

**Drop-in columns:**

| Column | Type | Description | Example |
|---|---|---|---|
| `account_id` | ID | Stable unique key (slug or CRM ID). Never reuse. | `acc_northwind` |
| `company_name` | text | Legal/brand name. | Northwind Consulting |
| `website` | url | Primary domain. | northwind.co |
| `linkedin_company_url` | url | Company LinkedIn page. | linkedin.com/company/northwind |
| `vertical` | enum | Which Dealthreads vertical/ICP slice. | `agency-consulting` |
| `sub_niche` | text | Specific service lane (the real targeting unit). | "fractional CMO for SaaS" |
| `hq_geo` | text | City / region (timezone + relevance). | "Austin, US" |
| `headcount_band` | enum | `1-10` / `11-50` / `51-200` / `200+`. | `11-50` |
| `est_revenue_band` | enum | Rough size signal if known, else blank. | `$1-5M` |
| `icp_fit_score` | int 0-5 | How well the *company* matches ICP (not the signal). | `4` |
| `icp_fit_reason` | text | One line: why this score. | "high-ticket, founder-led, no RevOps" |
| `has_revops` | enum | `none` / `partial` / `mature`. We want `none`/`partial`. | `none` |
| `priority_tier` | enum | `A` / `B` / `C`. Derived from fit + signal strength. | `A` |
| `assigned_experiment` | text | Which weekly experiment this account is in. | `EXP-2026-W22-03` |
| `source` | text | Where the account came from (for source ROI). | "LinkedIn search: fractional CMO" |
| `status` | enum | `new` / `enriching` / `ready` / `in_sequence` / `engaged` / `meeting` / `won` / `disqualified` / `nurture`. | `ready` |
| `disqualify_reason` | text | If status=disqualified, why (feeds learning). | "in-house BDR team of 6" |
| `notes` | text | Freeform. | — |
| `created_date` | date | Row created. | 2026-05-20 |
| `last_updated` | date | Last touched. | 2026-05-29 |

**Critique / what NOT to build yet:** Don't pour weeks into a 5,000-account universe before the motion converts. For the first pilots, a tight **150-300 account** universe per ICP slice is plenty to run real experiments. A massive TAM you can't personalize against is just a worse CSV.

---

## 2. Contact schema (the people)

One row per **person**. Many contacts can map to one `account_id`. This is who we actually message. For high-ticket B2B services, the decision-maker is usually the founder/owner or a partner — keep it to 1-2 contacts per account, not a whole org chart.

**Drop-in columns:**

| Column | Type | Description | Example |
|---|---|---|---|
| `contact_id` | ID | Stable unique key. | `con_jdoe` |
| `account_id` | FK | Links to Account Universe. | `acc_northwind` |
| `full_name` | text | — | Jordan Doe |
| `first_name` | text | For message merge (use sparingly — never as the whole personalization). | Jordan |
| `title` | text | Role. | Founder / Principal |
| `seniority` | enum | `founder` / `c-level` / `vp` / `director` / `ic`. We target `founder`/`c-level`. | `founder` |
| `is_decision_maker` | bool | Can they buy? | TRUE |
| `linkedin_profile_url` | url | The profile we connect with. | linkedin.com/in/jordandoe |
| `connection_degree` | enum | `1st` / `2nd` / `3rd`. 2nd = warmest cold. | `2nd` |
| `mutual_connections` | int | Count of shared connections (warmth signal). | 7 |
| `email` | email | Optional secondary channel only. May be blank. | jordan@northwind.co |
| `email_status` | enum | `verified` / `risky` / `unknown` / `none`. Don't email `risky`. | `none` |
| `loom_recorded` | bool | Has a personalized Loom been made? | FALSE |
| `loom_url` | url | Link to the recorded Loom. | — |
| `assigned_sender` | text | Which human profile is sending (Ryan, for now). | ryan |
| `current_step` | enum | Where they are in the sequence (see §6). | `cr_sent` |
| `next_action_date` | date | When the next touch is due. | 2026-06-02 |
| `response_class` | enum | Latest response classification (see §7). | `positive_interest` |
| `conversation_quality` | int 1-5 | **The real metric.** Quality of the actual back-and-forth (see §9). | 4 |
| `meeting_booked` | bool | Did it convert to a call? | FALSE |
| `meeting_date` | date | — | — |
| `outcome` | enum | `open` / `meeting` / `opportunity` / `won` / `lost` / `not_now` / `dead`. | `open` |
| `do_not_contact` | bool | Hard stop. Respect immediately. | FALSE |
| `notes` | text | Freeform conversation log. | — |
| `last_touch_date` | date | Last outbound from us. | 2026-05-29 |
| `last_reply_date` | date | Last inbound from them. | — |

**Critique:** `first_name` is the *least* important personalization field. "Hi {{first_name}}" with a generic body is the spray-and-pray tell we're explicitly avoiding. The `signal` (next section) is what makes a message land.

---

## 3. Signal schema (the reason we reached out)

One row per **observed signal**. A signal is a concrete, recent, evidence-backed reason this account/contact is worth contacting *now*. Signals power the personalized opener and the Loom. **No signal → no outreach.** This is the discipline that keeps volume low and relevance high.

Signal types mirror the Oloxa model: **CLOSING / HIRING / VOLUME / PAIN** — adapted for the agency/consultant ICP.

**Drop-in columns:**

| Column | Type | Description | Example |
|---|---|---|---|
| `signal_id` | ID | Unique key. | `sig_0142` |
| `account_id` | FK | Company the signal is about. | `acc_northwind` |
| `contact_id` | FK | Person it attaches to (optional). | `con_jdoe` |
| `signal_type` | enum | `HIRING` / `CLOSING` / `VOLUME` / `PAIN` / `TRIGGER` / `INTENT`. | `HIRING` |
| `signal_summary` | text | One line, human-readable. | "Posted a BDR role 6 days ago" |
| `evidence_url` | url | The proof. Must be real and linkable. | linkedin.com/jobs/... |
| `evidence_quote` | text | Exact snippet/quote that proves it. | "...looking for our first SDR..." |
| `observed_date` | date | When the signal occurred (recency matters). | 2026-05-23 |
| `freshness` | enum | `hot` (<2wk) / `warm` (2-6wk) / `stale` (>6wk). Prefer hot. | `hot` |
| `pain_hypothesis` | text | What pain this implies we can speak to. | "no pipeline system; hiring to fix it" |
| `signal_strength` | int 1-5 | How buy-relevant + actionable the signal is. | 5 |
| `personalized_opener` | text | The drafted first line built from this signal. | "Saw you're hiring your first SDR — most founders I talk to are doing that *because* outbound's been ad-hoc..." |
| `used_in_step` | text | Which message/touch used this signal. | `cr_note` |
| `status` | enum | `candidate` / `approved` / `used` / `expired`. | `approved` |

**Signal-type definitions (agency/consultant ICP):**

| Type | Means | Why it's a buying window |
|---|---|---|
| `HIRING` | Posting SDR/BDR/growth/marketing roles | They feel the pipeline gap and are about to spend ~$10-12k/mo on an SDR — exactly our "live week one vs 3-4mo ramp" wedge. |
| `CLOSING` | Announced new clients, case studies, wins | Capacity + cash to invest in more pipeline; proof they sell high-ticket. |
| `VOLUME` | Hiring spree, new office, fundraise, expansion | Growth pressure on a team with no RevOps. |
| `PAIN` | Founder posting about lead-gen struggle, "where do clients come from", referral dependence | Explicit stated pain we can answer directly. |
| `TRIGGER` | New role, promotion, company milestone, anniversary | Natural, non-creepy reason to reach out. |
| `INTENT` | Engaged with relevant content/competitor, follows GTM topics | Soft signal; use only stacked with another. |

**Critique:** `INTENT` alone is weak — treat it as a tiebreaker, not a reason to send. And don't manufacture signals. A forced "I loved your post!" when you skimmed one line reads as fake and tanks `conversation_quality`. If you can't find a real signal at `signal_strength >= 3`, the account waits or drops.

---

## 4. LinkedIn connection-request rules

The connection request (CR) is the first touch. It sets whether you ever get to send the Loom.

**Rules:**

1. **Send from Ryan's real profile.** Founder-to-founder, peer tone. Not a faceless company page, not a VA account. The credibility *is* "I run this engine on my own company."
2. **Volume ceiling: ~10-20 new CRs/day per profile.** Ramp slowly on a newer account. This is a safety + quality limit, not a goal — under-sending with great targeting beats maxing out.
3. **Prefer 2nd-degree + mutual connections.** Warmest cold audience. Sort the universe so 2nd-degree with mutuals go first.
4. **Note vs no-note — test both (this is an experiment variable).**
   - **No-note** often gets *higher accept rates* (less to object to) but a colder open. Good for known-warm 2nd-degree.
   - **With-note** filters for genuine interest and warms the relationship. Use the signal here.
5. **If using a note: ≤ ~300 chars, signal-led, zero pitch.** The CR note's only job is to get accepted and prime the real conversation. Do **not** pitch or ask for a meeting in the CR.
   - **Template:** *"Hey {{first_name}} — saw {{signal_summary}}. I work with {{ICP}} on exactly that problem and liked what you're building. Mind connecting?"*
   - **Example:** *"Hey Jordan — saw you're hiring your first SDR. I help founder-led consultancies build the outbound system *before* the headcount. Liked Northwind's positioning — mind connecting?"*
6. **Never pitch in the CR. Never paste a calendar link.** That's the spam tell. The CR earns the right to the Loom; the Loom earns the call.
7. **One contact per account at a time.** Don't blast the founder and two partners simultaneously — it looks coordinated and spammy.
8. **Respect declines/ignores.** No CR followed by InMail spam. If not accepted in ~14 days, mark `cr_ignored` and move on (optional low-volume email if `email_status = verified`).

**Track per CR:** which variant (`note` / `no_note`), the signal used, accept/ignore, time-to-accept.

---

## 5. Post-accept message rules (the first DM)

The moment a CR is accepted, you're in. This first DM is where the Loom usually lives. **Speed and specificity win here.**

**Rules:**

1. **Wait for accept. Then send within ~24-48h** while you're fresh in their memory. Not instantly (looks automated), not a week later (cold).
2. **Lead with the signal and a thank-you, not a pitch.** Re-anchor on why you reached out.
3. **The first DM's job is to earn a watch of the Loom or a one-line reply — nothing more.** Soft, single, easy-to-answer ask.
4. **Attach / link the personalized Loom here** (or in the immediate follow-up touch — see §6). Tell them it's short and made for them: *"recorded you a quick 90s thing."*
5. **No calendar link in the first DM.** Earn the conversation first. Calendar comes after a positive reply.
6. **Short. Mobile-readable. No walls of text.** 3-5 short lines max.
7. **One clear, low-friction CTA.** Either "worth a quick look?" (Loom) or an open question tied to the signal. Never two asks.

**First-DM template (Loom-forward):**

> Thanks for connecting, {{first_name}} — appreciate it.
>
> Reason I reached out: {{signal_summary}}. I actually recorded you a quick 90s Loom on what I'd try for {{company_name}} specifically (not a generic pitch, promise): {{loom_url}}
>
> No ask — just thought it might be useful. Curious if it lands.

**First-DM template (no Loom yet / signal-question):**

> Thanks for connecting, {{first_name}}.
>
> Genuinely curious — with {{signal_summary}}, how are you handling outbound right now? Most founder-led {{ICP}} I talk to are doing it ad-hoc and it's the first thing to slip when you get busy.

**Critique:** Don't open with "Can I get 15 minutes?" on message one. That's the move that trains people to ignore you. The Loom *is* your value-first proof; let it do the work.

---

## 6. Multi-touch follow-up sequence

A structured **2-3 touch** follow-up after the first DM (matching the offer's "structured 2-3-touch follow-up"). Spaced, value-led, and it **stops the moment they reply or book.** This is not a drip campaign — it's a short, polite, human cadence.

> **Hard rules:** Reply → exit sequence, switch to human conversation. Negative/"not now" → exit, set `nurture` or `do_not_contact`. Never more than 3 follow-up touches after the first DM without a response. Every touch adds something; no "just bumping this."

| Step | Day (after prev.) | Channel | Purpose | What it contains |
|---|---|---|---|---|
| `cr_sent` | 0 | LinkedIn | Connection request | Note variant (signal-led) or no-note |
| `cr_accepted` | — | — | (Trigger) | Marks accept; starts DM clock |
| `dm1_loom` | +1 to 2 | LinkedIn DM | First touch + Loom | Thank-you, signal, personalized Loom, soft ask |
| `f1_value` | +3 to 4 | LinkedIn DM | Value-add nudge | A relevant resource/insight/quick idea tied to their signal. NOT "did you see my Loom?" Give something. |
| `f2_reframe` | +4 to 5 | LinkedIn DM | Different angle | Reframe the value around a *different* pain or a 1-line proof point (e.g., the Oloxa artifact). New angle, not a repeat. |
| `f3_breakup` | +5 to 7 | LinkedIn DM (or email if verified) | Polite close-the-loop | "Seems like the timing's off — I'll leave it here. Door's open if outbound becomes a priority." Low-pressure breakups often get the most replies. |
| `nurture` | — | — | Long-game | If no reply after f3: stop active touches, optionally engage with their content occasionally. Re-enter only on a *new* signal. |

**Email as secondary:** Only if `email_status = verified`, low volume, and used as *one* alternate touch (often the breakup) — never a parallel email blast. Respect the Feb-2024 deliverability reality: low-volume, high-relevance only.

**Cadence guardrails:**
- Total active touches per prospect (CR note + 3 DMs) = **4 messages over ~2 weeks.** That's it.
- Business days only, sane local hours per `hq_geo`.
- If they view your profile / engage your content mid-sequence, that's a warm signal — a human can jump in early.

**Critique / what NOT to build:** Do not build a 9-step automated cadence. This motion's whole premium is that it *isn't* a machine-gun. Three thoughtful, value-led touches from a real founder outperform nine automated bumps and protect the brand and the account.

---

## 7. Response-classification taxonomy

Every inbound reply gets classified. This drives the next action **and** feeds weekly learning. Store as `response_class` on the contact + a timestamped log.

| Class | Meaning | Typical next action |
|---|---|---|
| `meeting_booked` | They agreed to / booked a call | Confirm, prep, exit sequence |
| `positive_interest` | "Tell me more" / "What's this cost?" / engaged Q | Human reply, move toward call, share artifact |
| `positive_soft` | Friendly but non-committal ("looks cool!", "nice Loom") | Light qualifying question; do NOT count as a win yet |
| `referral` | "Not me, talk to {{person}}" | Thank, get intro, create new contact row |
| `not_now` | Interested-ish but bad timing | Set `nurture`, diarize re-touch on new signal |
| `objection` | Pushback (price, trust, "we tried outbound") | Address once, honestly; don't argue |
| `not_a_fit` | Clear no / wrong person / not ICP | Mark `disqualified` + reason; exit |
| `negative` | Annoyed / "stop" / unsubscribe energy | `do_not_contact = TRUE` immediately. Exit. Log it — this is a targeting/messaging lesson. |
| `auto_or_irrelevant` | Out-of-office, emoji-only, spam-back | No action / wait |
| `no_response` | Silence after full sequence | Move to `nurture` |

**The critical distinction:** `positive_soft` is **not** a real conversation. "Haha love it" is a vanity reply. It only counts when it advances toward qualification. Classify honestly — inflating `positive_interest` corrupts the entire learning loop and makes you optimize for politeness instead of pipeline.

---

## 8. Weekly experiment-review format

The engine improves weekly. Each experiment cohort (`assigned_experiment`, e.g. `EXP-2026-W22-03`) and the week as a whole get reviewed in this exact structure. Keep it skimmable — this is an operating review, not a deck.

**Experiment definition (set at start of week):**

| Field | Description |
|---|---|
| `experiment_id` | `EXP-{year}-W{week}-{n}` |
| `hypothesis` | "If we {change}, then {metric} improves because {reason}." |
| `variable` | What changed (segment / signal type / opener / CR note vs no-note / Loom style). **One primary variable at a time.** |
| `segment` | Which slice of the universe it ran on |
| `sample_size` | # contacts in the cohort (be honest about significance) |
| `control` | What it's compared against |

**Weekly review (end of week):**

```
WEEK OF: 2026-W22
EXPERIMENTS RUN: 3

— EXP-2026-W22-03 —
Hypothesis: If CR notes lead with a HIRING signal, accept rate beats no-note.
Variable: CR note (HIRING signal) vs no-note control
Sample: 40 (20/20)
Results:
  Accept rate:            note 62%  | no-note 55%
  Reply rate:             note 25%  | no-note 14%
  QUALIFIED conv. rate:   note 15%  | no-note 7%   <- the one that matters
  Avg conversation_quality: note 3.8 | no-note 2.9
  Meetings booked:        note 2    | no-note 1
Read: HIRING-signal notes drove materially better *qualified* conversations,
      not just more replies. Quality went UP, not just volume.
Decision: KEEP. Roll HIRING-signal notes to all A-tier next week.
Surprise/lesson: 2 "not_now" replies both cited budget freeze — add a
      budget-timing qualifier to the universe filter.

— THIS WEEK'S DECISIONS —
KEEP:   HIRING-signal CR notes
KILL:   "I loved your post" opener (3 negatives, quality avg 1.7)
TEST NEXT WEEK: shorter 45s Loom vs 90s Loom on A-tier

— NEXT WEEK PLAN —
New universe added: 30 accounts (fractional CMO niche)
Experiments queued: EXP-W23-01 (Loom length), EXP-W23-02 (breakup-touch timing)
```

**Rule:** Every week ends with explicit **KEEP / KILL / TEST** decisions and a next-week plan. A review with no decision is a status update, not a learning loop. This review (plus the raw artifacts) is what you show pilot clients in their transparent weekly review.

---

## 9. Metrics — what to track, and which are VANITY vs REAL

This is the heart of the doc. **We sell qualified conversations and faster learning, not reply rate.** Track vanity metrics only as *diagnostics* — never as the scoreboard.

### REAL metrics (the scoreboard — optimize these)

| Metric | Definition | Why it's real |
|---|---|---|
| **Qualified conversations** | # of two-way threads with an ICP-fit decision-maker that reach a real exchange about their pipeline/pain (class `positive_interest`+ that advances). | This is the product. Everything else is upstream of it. |
| **Qualified conversation rate** | Qualified conversations ÷ contacts engaged | The true efficiency of the motion. |
| **Avg conversation_quality (1-5)** | Human-scored depth/fit of each conversation (rubric below) | Catches the "lots of replies, no substance" trap. |
| **Meetings booked (from qualified convos)** | Calls actually scheduled | Down-funnel proof. |
| **Meeting → opportunity rate** | Meetings that become real sales conversations | Validates targeting, not just messaging. |
| **Signal → qualified-conversation rate (by signal_type)** | Which signals actually produce real talks | Tells you *who* to target next. The compounding edge. |
| **Cost/effort per qualified conversation** | Time/$ in ÷ qualified convos out | The economics story vs an SDR (~$90k/yr saved at Growth tier). |
| **Learning velocity** | # of validated KEEP/KILL decisions per week | The literal thing the engine sells: faster learning. |

### VANITY metrics (diagnostics only — NEVER the goal)

| Metric | Why it's vanity | Legit diagnostic use |
|---|---|---|
| **Connection accept rate** | Easy to inflate (no-note, broad targeting). High accepts with zero conversations = nothing. | Sanity-check CR note variants. |
| **Raw reply rate** | "lol nice" counts the same as "what's this cost?" Maxed by being provocative/annoying. | Compare openers — but always paired with quality. |
| **Total connections / network size** | Pure ego. Buys nothing. | Capacity for future re-touch on new signals. |
| **Loom views / open rate** | A view isn't interest; a high view rate with no replies means the Loom isn't landing. | Diagnose Loom hook (do they watch past 15s?). |
| **Messages sent / activity volume** | The spray-and-pray vanity metric. More sends ≠ more pipeline; on LinkedIn it risks the account. | Watch as a *ceiling/safety* number, not a target. |
| **Profile views** | Soft interest at best. | Warm-signal trigger for a human to jump in. |

> **The trap, stated plainly:** It is trivial to 3x reply rate by being vague, flattering, or provocative — and produce *zero* extra pipeline while looking busy. If a change lifts reply rate but not **qualified conversation rate** or **conversation_quality**, it failed. Report both, always, side by side.

### `conversation_quality` scoring rubric (1-5)

| Score | What it looks like |
|---|---|
| **5** | ICP-fit decision-maker, real pain discussed, explicit interest or meeting — a genuine sales conversation. |
| **4** | Fit prospect engaging substantively with a qualifying question answered. |
| **3** | Polite two-way exchange, some signal of fit, not yet substantive. |
| **2** | Friendly but empty (`positive_soft`) — "cool!", no substance. **A vanity reply.** |
| **1** | Off-target, wrong person, annoyed, or auto-reply. |

**Pilot note:** The 90-day founder-run pilot carries a *soft meeting-activity floor* (credited if missed) — explicitly **not** a guaranteed-revenue or meeting-flood promise. These REAL metrics + the raw artifacts (research cards, weekly KEEP/KILL reviews) are exactly what you show in the transparent weekly review to prove the engine is learning, even before a case study exists.

---

## 10. What NOT to build / track yet (honest critique)

- **No fully-automated sending.** The human-approval step is the product's integrity. Automating the messages turns this into the spam tool we're positioned against and risks Ryan's actual LinkedIn account.
- **No vanity dashboards.** Don't build a slick "1,200 messages sent / 38% accept rate" dashboard for clients. It trains everyone to optimize the wrong thing. Lead the client review with qualified conversations + quality + KEEP/KILL decisions.
- **No giant TAM before product-market fit on the motion.** 150-300 well-scored accounts per ICP slice. Prove conversion, then scale the universe.
- **No multi-profile / VA send farm yet.** One real founder profile (Ryan's) is the credibility wedge. Scaling sender accounts before the motion is proven dilutes the exact thing that makes it work.
- **No 9-step cadences, no calendar-link-in-first-message, no manufactured signals.** Each is a documented way to trade short-term activity for long-term brand and deliverability damage.
- **Don't over-instrument week one.** Track the REAL metrics + `conversation_quality` first. Add finer diagnostics only once the core loop is running and reviewed weekly.

---

*Cross-references: offer + pricing in `02 - Dealthreads GTM Experiment Engine Offer.md`; research-card format in `03`. This file = the trackable execution layer for the LinkedIn + Loom wedge.*
