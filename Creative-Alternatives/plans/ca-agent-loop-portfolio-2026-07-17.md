# Creative Alternatives Agent Loop Portfolio

**Source:** Greg Isenberg with Elie Steinbock, “Making $$$ with Loop Engineering”  
**Video:** https://www.youtube.com/watch?v=5p_BBdfvzgQ&t=2141s  
**Prepared:** 2026-07-17

## What the video contributes

The useful idea is not “let an agent run the company.” It is a stricter operating pattern:

1. Give an agent one bounded job.
2. Define one objective metric.
3. Separate the **builder** from the **verifier**.
4. Run on a schedule.
5. Save what happened as durable loop memory.
6. Change the next action based on measured results.
7. Stop or escalate when a safety threshold is hit.

The speaker explicitly separates bug/reliability loops from feature/growth loops around **34:40–35:10**. Around **35:41–36:24**, the discussion expands this into an “ultimate” business-feedback loop that can read analytics, customer feedback, and operational data. Around **38:03–38:30**, they recommend a minimal viable loop with a small verifiable outcome—not “get 100,000 followers,” but something like “get 10 likes.”

For CA, the correct translation is: **do not build one giant autonomous-company agent. Build small loops around revenue and operational bottlenecks, with customer/money actions held for approval.**

---

## The CA loop contract

Every CA loop should have this schema:

| Field | Requirement |
|---|---|
| Objective | One business outcome, stated plainly |
| Primary metric | One number the loop must move |
| Guardrail metrics | Numbers it must not damage |
| Inputs | Named systems and source files |
| Builder | Drafts or performs one bounded improvement |
| Verifier | Independently checks the result |
| Memory | Stores decisions, evidence, and prior outcomes |
| Cadence | Hourly, daily, weekly, or monthly |
| Stop condition | Metric target, budget cap, or safety threshold |
| Human gate | Exact action requiring Ryan/Kenny/Maclaine approval |

**North Star:** net collected gross profit after incentives and fulfillment costs.

**Never autonomous:** campaign activation, customer/vendor messages, quote sending, price changes, incentive promises, purchases, refunds, or publishing.

---

# Recommended loop portfolio

## Priority 1 — Partner Campaign Learning Loop

**Why first:** the 100-contact creative-agency Smartlead draft already exists. This loop can start producing learning immediately after human approval.

| Component | Specification |
|---|---|
| Objective | Turn partner outreach into live merchandise opportunities |
| Primary metric | Permissioned live opportunities per 100 delivered emails |
| Secondary metrics | Positive reply rate, partner-fit calls, quote requests, collected GP |
| Guardrails | Bounce <2%; complaints <0.1%; no unhandled positive reply >1 business day |
| Inputs | Smartlead campaign 3680968, Sendr activity, Salesfinity calls, HubSpot, partner pipeline CSV |
| Builder | Scores replies, identifies the best responding subsegments/signals, proposes one targeting or copy change for the next cohort |
| Verifier | Confirms delivered denominator, response labels, suppression, and whether an opportunity is real |
| Memory | Winning subsegments, losing segments, objections, hooks, signal weights, approved changes |
| Cadence | Reply sweep every 2 hours; cohort review weekly |
| Stop | Pause if bounce >2%, complaint threshold is breached, or reply SLA is missed |
| Human gate | Activating cohorts, sending responses, changing public copy |

### Minimal viable loop

1. Send the verified 100-agency cohort.
2. Classify every reply into the existing 11-label taxonomy.
3. Measure positive replies and live opportunities.
4. Compare the predicted Tier/signals with actual outcomes.
5. Change only one variable for cohort 2: either subsegment, opener, or CTA.
6. Store the decision and evidence.

**Do not call a 100-contact result statistically conclusive.** It is directional learning.

---

## Priority 2 — Reply-to-Revenue Loop

**Why:** CA previously had dozens of replies sitting untriaged. Attention is worthless if it does not become a fast human response and a quote.

| Component | Specification |
|---|---|
| Objective | Convert positive replies into qualified opportunities quickly |
| Primary metric | Positive-reply-to-qualified-opportunity conversion rate |
| Guardrails | Median first-response time; no stale positive reply; no duplicate owner |
| Inputs | Smartlead master inbox, Sendr, AgentMail, HubSpot, Salesfinity |
| Builder | Fetches new replies, classifies intent, drafts response, creates next-action task, identifies call-ready prospects |
| Verifier | Checks classification confidence, owner, CRM record, and response SLA |
| Memory | Objections, winning reply language, reasons leads stall |
| Cadence | Every 15–30 minutes during business hours |
| Stop | Escalate any high-intent reply immediately; pause drafts if classification confidence is low |
| Human gate | Sending any response or placing a consequential call |

### Objective progression

1. Zero untriaged positive replies.
2. Same-business-day response.
3. Qualified brief captured.
4. Quote initiated.
5. Paid order attributed.

---

## Priority 3 — Quote Throughput Loop

**Why:** this is the most important commercial bottleneck. More demand cannot become revenue if pricing and quoting stall.

| Component | Specification |
|---|---|
| Objective | Produce complete, margin-safe quote drafts faster |
| Primary metric | Median hours from qualified request to complete quote draft |
| Secondary metrics | Quote completion rate, approval time, win rate, gross margin |
| Guardrails | Never below margin floor; no unsupported costs; no quote sent without approval |
| Inputs | Request details, 27-year quote history, supplier costs, decorator invoices/rates, margin policy, QuickBooks |
| Builder | Detects missing fields, assembles products/costs, calculates margin-floor draft, flags unknown pricing |
| Verifier | Recalculates economics, checks evidence, detects unsupported assumptions, verifies customer/deadline details |
| Memory | Accepted products, Kenny overrides, margin decisions, vendor pricing gaps, win/loss reason |
| Cadence | Event-driven when a qualified brief arrives; daily backlog sweep |
| Stop | Complete draft or explicit `[NEEDS PRICE]`/`[NEEDS CUSTOMER INPUT]` escalation |
| Human gate | Kenny/Ryan approves price and sends quote |

### Learning mechanism

Every Kenny override becomes labeled training data:

- Price raised/lowered and why
- Product swapped and why
- Vendor changed and why
- Decoration choice changed and why
- Customer-specific judgment

The loop should reduce override frequency over time without removing Kenny.

---

## Priority 4 — Reorder Timing Loop

| Component | Specification |
|---|---|
| Objective | Surface existing customers shortly before their likely reorder window |
| Primary metric | Reorder gross profit generated per weekly recommendation batch |
| Guardrails | No duplicate outreach; no outreach during active service issue; human approval |
| Inputs | QuickBooks order history, seasonality, product categories, prior contacts, fulfillment dates |
| Builder | Predicts likely reorder window, drafts reason-specific outreach, ranks accounts by expected GP |
| Verifier | Confirms historical evidence, current customer status, and no recent touch |
| Memory | Actual reorder date, response, products, seasonality, owner judgment |
| Cadence | Weekly |
| Stop | Account contacted, suppressed, or reorder window passes |
| Human gate | Sending customer email/call task |

---

## Priority 5 — Accounts Receivable Collection Loop

| Component | Specification |
|---|---|
| Objective | Reduce overdue receivables without harming relationships |
| Primary metric | Overdue dollars collected per week |
| Secondary metrics | DSO, aging-bucket movement, promise-to-pay completion |
| Guardrails | No disputed invoice chased automatically; tone approved; no duplicate chase |
| Inputs | QuickBooks invoices/payments, thread history, customer owner, dispute flags |
| Builder | Prioritizes accounts, drafts stage-appropriate follow-up, identifies broken promises |
| Verifier | Confirms balance is still open, payment not received, message cadence allowed |
| Memory | Objections, promise dates, contact preference, successful language |
| Cadence | Daily business-day sweep |
| Stop | Paid, disputed, payment plan, or human hold |
| Human gate | Sending messages and escalating accounts |

---

## Priority 6 — Deliverability Safety Loop

This is a **bug/reliability loop**, not a growth loop—the distinction made around 34:40 in the video.

| Component | Specification |
|---|---|
| Objective | Keep CA sending infrastructure healthy |
| Primary metric | Healthy connected inbox percentage |
| Guardrails | Bounce, complaint, SMTP/IMAP failures, block events, domain-level reputation |
| Inputs | Smartlead inbox health, campaign analytics, DNS, verification reports |
| Builder | Produces exclusions and repair tasks; can recommend safer volume |
| Verifier | Rechecks live connection/reputation and confirms campaign assignment |
| Memory | Domain incidents, fixes, recovery time, recurring providers/problems |
| Cadence | Daily lightweight check; weekly full audit |
| Stop | All assigned inboxes healthy or campaign paused for human intervention |
| Human gate | Reconnecting accounts, changing DNS, attaching senders, resuming campaigns |

**Safe automatic action:** draft a pause recommendation or remove a broken inbox from a pending assignment.  
**Unsafe automatic action:** restarting a campaign.

---

## Priority 7 — Partner Signal Model Loop

| Component | Specification |
|---|---|
| Objective | Improve Tier 1/2/3 prediction using observed outcomes |
| Primary metric | Lift in live-opportunity rate for Tier 1 versus Tier 2/3 |
| Inputs | Current structural/live signals, replies, calls, opportunities, orders, collected GP |
| Builder | Reweights signals and proposes new/obsolete labels |
| Verifier | Runs holdout/backtest and checks for leakage or tiny-sample overfitting |
| Memory | Signal definitions, weight history, confidence, outcome evidence |
| Cadence | After every 300 delivered contacts or monthly, whichever is later |
| Stop | No meaningful lift, insufficient sample, or unstable model |
| Human gate | Deploying new weights to production scoring |

This is the loop that turns today’s hand-built signal ideas into a compounding GTM brain.

---

## Priority 8 — Lost Quote Rescue Loop

| Component | Specification |
|---|---|
| Objective | Recover quotes that stalled for a fixable reason |
| Primary metric | Recovered gross profit from stalled quotes |
| Inputs | Quote status, customer emails, pricing gaps, decision dates, win/loss notes |
| Builder | Classifies stall reason and drafts the smallest useful intervention |
| Verifier | Confirms quote is still open and no recent human follow-up |
| Memory | Loss reasons and successful rescue tactics |
| Cadence | Twice weekly |
| Stop | Won, lost, customer hold, or no-response threshold |
| Human gate | Sending follow-up or changing quote |

---

## Priority 9 — SEO Compounding Loop

This maps directly to the video’s monthly SEO example around 11:17–25:27.

| Component | Specification |
|---|---|
| Objective | Increase qualified non-brand search demand |
| Primary metric | Qualified organic clicks to commercial pages |
| Secondary metrics | Impressions, position, shortlist-form starts, qualified submissions |
| Inputs | Google Search Console, GA4, page inventory, keyword data, conversion events |
| Builder | Finds high-impression/low-CTR pages and near-page-one terms; proposes or drafts one bounded improvement |
| Verifier | Confirms indexing, factual claims, conversion path, and post-change metric movement |
| Memory | Page changes, query clusters, outcomes, links earned |
| Cadence | Monthly at first; biweekly once baseline volume exists |
| Stop | Target reached, no evidence, or page needs human proof/claims |
| Human gate | Publishing changes |

---

## Priority 10 — YouTube Build-in-Public Loop

| Component | Specification |
|---|---|
| Objective | Turn CA transformation work into qualified audience and opportunities |
| Primary metric | Qualified views per published episode and CA inquiries attributed to content |
| Secondary metrics | Average view duration, retention dips, comments with operational pain, email signups |
| Inputs | Session logs, shipped artifacts, YouTube analytics, comments, lead source |
| Builder | Selects highest-proof story, drafts episode/thumbnail angles, repurposes clips and LinkedIn posts |
| Verifier | Checks that claims are evidenced and compares predicted hook to actual retention/click-through |
| Memory | Winning hooks, retention moments, audience pains, conversion paths |
| Cadence | Weekly |
| Stop | No proof artifact, sensitive customer information, or weak story delta |
| Human gate | Filming, publishing, public claims |

---

## Priority 11 — Order Exception / “Bug” Loop

| Component | Specification |
|---|---|
| Objective | Catch orders likely to miss a deadline before they become emergencies |
| Primary metric | Preventable late-order incidents per month |
| Inputs | Proof status, vendor acknowledgment, ship date, event date, tracking, customer approvals |
| Builder | Detects risk and drafts next action/task |
| Verifier | Rechecks vendor/customer state and confirms risk is unresolved |
| Memory | Failure modes, vendor reliability, lead-time assumptions |
| Cadence | Every 2 hours on business days |
| Stop | Risk resolved, shipped, or escalated |
| Human gate | Vendor/customer communication and paid rush decisions |

---

## Priority 12 — Customer Voice / Product Feedback Loop

This is CA’s version of the video’s “ultimate” feedback loop.

| Component | Specification |
|---|---|
| Objective | Convert customer, prospect, and operator feedback into the highest-leverage system improvement |
| Primary metric | Validated friction points removed per month, weighted by revenue/time impact |
| Inputs | Replies, calls, quote losses, service issues, Kenny/Maclaine notes, site behavior, order exceptions |
| Builder | Clusters feedback, estimates impact, proposes one improvement with acceptance criteria |
| Verifier | Confirms multiple evidence points and checks whether the change moved the chosen KPI |
| Memory | Problem clusters, decisions, rejected ideas, measured outcomes |
| Cadence | Weekly synthesis; monthly decision |
| Stop | One approved improvement selected; avoid infinite backlog generation |
| Human gate | Process/product changes |

---

# How the loops connect

```text
Partner Campaign Learning
        ↓
Reply-to-Revenue
        ↓
Quote Throughput
        ↓
Order / Gross Profit
        ↓
Partner Signal Model learns what predicted revenue

Order History → Reorder Timing → Repeat Gross Profit
Invoices → AR Collection → Collected Cash
Operational Exceptions → Customer Voice → Process Improvements
Shipped Improvements → YouTube Loop → New Attention and Inquiries
```

The individual loops have local metrics, but the chain closes only when it reaches collected gross profit and feeds the result back into targeting.

---

# The first three loops to implement

## 1. Deliverability Safety Loop — immediately

The live audit found 51 Smartlead connection failures. This loop protects every campaign and can run without contacting anyone.

**MVP:** daily inbox-health snapshot → diff yesterday → flag newly failed/recovered accounts → produce repair list.

## 2. Partner Campaign Learning Loop — when campaign 3680968 is verified and approved

**MVP:** fetch campaign results and replies → label → compute delivered/positive/live-opportunity metrics → recommend one change for cohort 2.

## 3. Quote Throughput Loop — in parallel

**MVP:** sweep open inquiries/quotes → classify `READY`, `NEEDS PRICE`, `NEEDS CUSTOMER INPUT`, or `STALE` → draft next artifact → verify margin and missing evidence → Ryan/Kenny approval.

This sequence protects the channel, learns from demand, and makes sure demand can become revenue.

---

# Loop memory structure

```text
config/loops/<loop-name>.yaml       # objective, metrics, cadence, limits
outputs/loops/<loop-name>/state.json # current cursor and metric state
outputs/loops/<loop-name>/runs/      # immutable run reports
outputs/loops/<loop-name>/memory.md  # concise lessons carried forward
```

Each run report should record:

- Inputs and time window
- Prior metric
- Action proposed/performed
- Verification result
- New metric
- Guardrail status
- Human approvals required
- Lesson to carry forward

Never let the agent edit old run reports. It may append a new lesson or supersede a lesson with evidence.

---

# Anti-patterns to avoid

1. **One giant “grow CA” loop.** It has no objective verifier.
2. **Vanity metrics as the final goal.** Opens, impressions, and replies are diagnostic; revenue and GP close the loop.
3. **Self-grading agents.** Builder and verifier should use separate prompts, and consequential claims should be grounded in source data.
4. **Changing five variables at once.** The loop cannot learn what worked.
5. **Optimizing tiny samples as truth.** Store uncertainty and wait for adequate cohorts.
6. **Autonomous customer or money actions.** Draft, verify, approve.
7. **Memory without evidence.** Every lesson should link to the run and metric that produced it.
8. **No stop condition.** A loop without limits becomes token spend and operational noise.

---

# Recommendation

Start with three bounded loops rather than a company-building super-agent:

1. **Deliverability Safety** protects the sending system.
2. **Partner Campaign Learning** improves the new channel.
3. **Quote Throughput** converts attention into revenue.

Once those are reliable, add **Reply-to-Revenue**, **Reorder Timing**, and **AR Collection**. Those six loops cover acquisition, conversion, retention, and cash while keeping every consequential action human-approved.
