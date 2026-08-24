# Dealthreads Operating Plan — Multi-Channel GTM Machine (v1, 2026-07-16)

One machine, four channels (email, phones, LinkedIn, Sendr video), one CRM (HubSpot), one calendar (cal.com/ryantydingco/30min), briefed and graded daily. Time budget assumption: ~4 to 5 focused Dealthreads hours/day around the day job and CA blocks until ~mid-August, then more.

---

## 1. THE FUNNEL, START TO FINISH

Every prospect walks this exact path. Every stage lives in HubSpot.

1. **Loaded** — lead enters a SmartLead campaign (scrubbed, ICP-verified)
2. **Engaged** — replied to email, answered a call, or accepted/responded on LinkedIn
3. **Sample delivered** — the hiring-manager list sent same day, Sendr video optional on top
4. **Meeting booked** — on cal.com (30 min)
5. **Meeting held** — the call: walk through how their sample was built, run their math of sales
6. **Pipeline Proof proposed** — $2,000, 4 to 6 starts/month framing, next open start date
7. **Pipeline Proof live** — installed within 5 business days, then run for 14 calendar days
8. **Pipeline Verdict** — day 14: go / refine / no
9. **Pipeline OS client** — $4,500/mo when the client works the prepared queue; managed calling is scoped separately after the Proof; the $2,000 Proof credits against the first month
10. **Closed lost / Nurture** — no-gos get a quarterly check-in; they own infrastructure that reminds them of us

The reply playbook (proven today on Luke): answer inside 1 hour → deliver the sample list same day → deck link → soft calendar close → if phone number visible, call them.

---

## 2. DAILY OPERATING RHYTHM (Mon to Fri)

**7:30 AM — Daily Brief (Telegram, automated).** Yesterday's scorecard vs KPI, hot replies waiting, today's dial queue (Tier A + engaged leads first), trials in flight and their day number, meetings today.

**8:30 AM to 5:30 PM — the machine sends** (SmartLead handles itself; campaigns already scheduled).

**Block 1 (60 to 90 min) — Replies and fulfillment.** Answer every reply from the last 24h. Positive replies get the sample-list pipeline (AI Ark pull, scrub, deliver same day). Sendr video drop on every warm reply. Log stage changes in HubSpot.

**Block 2 (90 to 120 min) — Phones.** Salesfinity parallel dialer. Queue priority: (1) engaged email leads (opened-domain replies, sample recipients who went quiet), (2) Tier A owners with numbers, (3) wave1b phone rows. Every disposition synced to HubSpot.

**Block 3 (30 min) — LinkedIn.** 15 to 20 connection requests to the same ICP (staffing owners), 10 comments/DMs on engaged targets, posts on Mon/Wed/Fri (build-in-public: real numbers from the machine).

**Block 4 (as needed) — Pipeline Proof delivery** when a Proof is live (this is revenue work; it preempts Block 3, never Blocks 1 to 2).

**9:00 PM — EOD Scorecard (Telegram, automated).** The day's actuals vs KPI with a letter grade; reply W/L like the time-blocks game.

## DAILY KPIs (the scorecard lines)

| Metric | Target | Source |
|---|---|---|
| Email: total sends | 1,200 to 1,500 | SmartLead API |
| Email: new leads entered | 400 to 500 | SmartLead |
| Email: bounce rate | under 3% (pause + reverify above it) | SmartLead |
| Email: replies / positive replies | 5+ / 2+ | SmartLead master inbox |
| Sample lists: delivered same-day | 100% of requests | manual + HubSpot note |
| Dials / connects / completions (Reisert standard) | 75+ / 8+ / 5+ | Salesfinity |
| Sendr: videos sent on warm replies | 100% within 2 hours | Sendr |
| Sendr: video views followed up same day | 100% | Sendr engagement API |
| LinkedIn: connects / DMs | 15+ / 10 | manual |
| Meetings booked (all channels) | 0.5 to 1/day (3 to 5/week) | cal.com → HubSpot |
| HubSpot hygiene: replies staged, calls logged | 100% before EOD | HubSpot |

Grading: A = 90%+ of lines hit, B = 75%, C = 60%, F = below that or any same-day fulfillment miss. The one unmissable line is sample-list fulfillment; it converts better than every volume metric combined.

---

## 3. WEEKLY RHYTHM

**Monday AM — Pipeline review (30 min):** every open deal by stage, aging alerts (reply >48h unanswered = red), this week's Pipeline Proof starts.
**Wednesday — Refill day:** top up campaigns from the reserve tank (wave1b tranches through the scrub + SmartLead verify), pull fresh AI Ark only for samples/mobiles, Apify for bulk.
**Friday — Content + metrics:** LinkedIn post with real weekly numbers; check domain health (spam rate, inbox placement) across the 98 senders; rotate out any sender under 95% reputation.
**Sunday 5 PM — Weekly review (automated brief + 30 min):** funnel conversion table (loaded → engaged → meeting → Proof → Pipeline OS), cost per meeting by channel, KPI hit rate by day, next week's Proof capacity. Weekly grade.

## WEEKLY KPIs

| Metric | Ramp (wk 1-2) | Steady (wk 3+) |
|---|---|---|
| New leads entered | 1,500 | 2,000 to 2,500 |
| Replies / positive | 20 / 6 | 30+ / 10+ |
| Conversations (calls, Reisert) | 20 | 25+ |
| Meetings booked | 2 to 3 | 4 to 6 |
| Meetings held (expect ~75% show w/ Sendr confirm video) | 2 | 3 to 5 |
| Pipeline Proofs proposed | 1 to 2 | 2 to 3 |

---

## 4. MONTHLY RHYTHM

First business day: month brief (cohort table: each month's leads → meetings → trials → engines; MRR; churn; capacity check). Decisions made monthly, not daily: pricing changes, new vertical waves (MSP pull), trial capacity (raise from 2/month only when delivery hours allow), the contractor trigger (fire when delivery >15h/week or 4+ engine clients — per the ColdIQ blueprint), inbox fleet expansion (add dealthreads-branded domains monthly so the steven.laitmon@ fleet can retire).

---

## 5. HOW THE TOOLS INTERTWINE (HubSpot as the spine)

```
SmartLead (email) ──replies/opens──┐
Salesfinity (dials) ──dispositions─┤
Sendr (video) ──views/engagement───┼──► HubSpot contact + deal stages ──► cal.com bookings ──► pipeline
LinkedIn (manual) ──notes──────────┘                    │
                                                        ▼
                                    Telegram briefs (7:30a / 9p / Sun 5p / monthly)
```

- **HubSpot pipeline "Dealthreads Sales"** with the 10 funnel stages above. Every engaged human becomes a contact + deal. Nothing lives only in an inbox.
- **Existing scripts to repurpose (built in the Meeting Engine era, most wiring already written):** `sync_leads_to_hubspot.py` (Salesfinity/lists → HubSpot, ran daily at 7:10am), `meeting_engine.py` (SmartLead reply categories + sentiment → HubSpot stages → Telegram briefs 3x/day), Sendr API already wired (api.sendr.io), `docs/meeting-engine-playbook.md`. The Dealthreads version is a config-and-revive job, not a new build. Known gap: the cal.com API key was invalid last time; fix to auto-log bookings.
- **Sendr's three jobs:** (1) warm-reply video ("here's me building your sample list", 60 to 90 seconds), (2) pre-meeting confirmation video the morning of every call (show-rate protection), (3) post-verdict recap video. Engagement (views) triggers same-day follow-up and a HubSpot note.
- **Rule:** the CRM is the source of truth for humans, SmartLead for sends, Salesfinity for dials. Briefs read from all three so Ryan never has to.

---

## 6. MONEY MATH — 30 / 60 / 90 (honest, assumption-first)

Assumptions (all checkable weekly against actuals): ~1.5% reply rate on new leads, ~30% of replies positive, ~40% of positives reach a meeting, ~75% show, ~30% of held meetings buy a $2,000 trial, ~55% of verdicts convert to an Engine, mix ~2 Full : 1 Email. Day-one actuals (4 replies on the first few hundred sends) are ABOVE these assumptions. Trial capacity: 2/month now (3/month from September if delivery allows); excess demand books future slots, it doesn't vanish.

| Milestone | Conservative | Base | Stretch |
|---|---|---|---|
| Day 30: meetings held | 8 | 12 | 18 |
| Day 30: trials sold / cash collected | 2 / **$4,000** | 2 to 3 / **$5,500** | 4 / **$8,000** |
| Day 60: engine clients (MRR) | 1 Full ($4,500) | 2 Full + 1 Email (**$11,500 MRR**) | 3 Full + 1 Email ($16,000) |
| Day 60: month-2 cash (trials + engine payments) | ~$8,500 | **~$13,500** | ~$20,000 |
| Day 90: MRR exiting | $7,000 | **$11,500 to $16,000** | $18,500 (solo ceiling) |
| Day 90: month-3 cash | ~$11,000 | **~$15,000 to $18,000** | ~$22,000 |

Read on this: the base case crosses the $10K/month goal in month two, driven almost entirely by trial→engine conversion, which is why fulfillment speed and trial delivery quality outrank every volume KPI. The stretch case hits the solo delivery ceiling (~3 Full + 2 Email = your own blueprint's 8-12h/wk/client math), which is when the $600 to $1,000/month contractor gets hired out of margin, not hope. Also honest: these numbers exclude CA commission and assume zero warm-network deals; both are upside.

---

## 7. BUILD QUEUE TO WIRE THIS (in order, each small)

1. HubSpot: create the Dealthreads Sales pipeline + stages (one-time, via API/MCP)
2. Revive `meeting_engine.py` with a dealthreads config: SmartLead campaigns 3651390/3651414 → HubSpot stages → Telegram
3. Daily 7:30a brief + 9p scorecard with grade (launchd, same pattern as the time-blocks loop)
4. Fix cal.com API key → auto-log bookings to HubSpot
5. Sendr webhook → HubSpot note + brief line on video views
6. Sunday weekly review + monthly cohort brief
7. Salesfinity disposition sync (existing sync script pattern)
