# CA Loop Execution Architecture — Hermes Upgrades Video

**Source:** Jack Roberts, “Hermes Agent just got 10X Better... I’m Done”  
**Video:** https://www.youtube.com/watch?v=sJt1sQO87sc  
**Prepared:** 2026-07-20

## Bottom line

The prior loop-engineering video defined **what a business loop is**. This video is primarily about **how to execute those loops inside Hermes**:

1. Route different jobs to different models.
2. Collect independent inputs in parallel.
3. Use Firecrawl/web extraction for current external evidence.
4. Produce an intelligence brief from many systems.
5. Use completion contracts so finite work does not stop early.
6. Promote durable lessons into memory/skills rather than restarting from zero.

The video’s “10X” and “60X” language is promotional. The useful capabilities themselves are real; official Hermes documentation, not the video, is the source of truth.

---

## Verified status in Ryan’s Hermes installation

Live audit on 2026-07-20:

| Capability | Status | CA use |
|---|---|---|
| GPT-5.6 through OpenAI Codex OAuth | Available and used in the active session | Orchestration, judgment, verification, consequential drafting |
| Kimi K3 through OpenRouter/custom route | Available; selected in the standalone Hermes config | High-volume synthesis, bulk research, design/copy support |
| Grok/xAI | Not configured | No current need; do not add complexity without a specific job |
| Parallel tool calls | Available and already used | Pull Smartlead, CRM, finance, web, and operational state concurrently |
| Firecrawl | Configured | Partner-site research, SEO evidence, competitor/page monitoring |
| Completion contracts (`/goal draft`) | Available in official Hermes docs | Finite builds with explicit proof and stop conditions |
| Cron scheduler | Gateway running; scheduler active | Durable daily/weekly loops |
| Persistent memory | Active | Compact durable facts and user preferences |
| Session search | Active | Retrieve prior decisions and work without bloating permanent memory |
| Skills | Active | Store reusable procedures and verification steps |
| Telegram gateway | Configured and running | Deliver briefs and allow follow-up from the phone |

---

# What this adds to the prior CA loop portfolio

## 1. Daily CA Intelligence Brief Loop

This is the clearest idea to borrow from the video.

### Objective

Give Ryan one short, evidence-backed daily answer to:

> “What changed, what is at risk, and what are the three highest-leverage actions today?”

### Parallel collectors

Run independent collectors concurrently:

- **Smartlead:** campaign state, delivered, bounce, reply, positive reply, disconnected inboxes
- **Partner channel:** new replies, opportunities, stale tasks, Tier/source performance
- **Salesfinity:** warm prospects, call outcomes, follow-up tasks
- **Sendr:** accepted connections, page engagement, replies
- **HubSpot:** stage changes, ownerless opportunities, aging
- **QuickBooks/data.db:** open invoices, collected payments, quote/order changes
- **Operations:** quote backlog, `[NEEDS PRICE]`, proof/vendor/deadline exceptions
- **Website/SEO:** qualified form submissions and meaningful GSC deltas

### Synthesizer

The agent receives only compact collector outputs and produces:

1. Revenue opportunities requiring action
2. Risks requiring action
3. Metric changes and likely cause
4. Approval queue
5. Today’s top three actions
6. What not to work on

### Verifier

A separate pass checks:

- Every claim has a source system and timestamp
- Counts use the same time window
- No opportunity is double-counted
- QuickBooks remains financial truth
- No action was reported complete without evidence

### Cadence

- Weekdays at 8:30 a.m. ET
- Optional 3:30 p.m. exception-only update
- Silent when there is no meaningful delta

### Human gate

The brief may recommend and draft. It may not send customer/vendor messages, change prices, activate campaigns, or move money.

---

## 2. Campaign Completion-Contract Loop

Use Hermes `/goal draft` for finite campaign setup tasks, not the recurring campaign-learning loop itself.

### Example contract

```text
/goal Build the Creative Agencies partner pilot through internal-test readiness
outcome: Smartlead campaign 3680968 contains the approved valid-only cohort, four reviewed sequence steps, healthy sender accounts, and remains DRAFTED
verification: API confirms DRAFTED status, valid-only lead count, four sequence steps, six healthy accounts, stop-on-reply, tracking off, plain text, and 25/day
constraints: do not activate or send externally; preserve blocklist/unsubscribe protections; no unverified claims or incentive promises
boundaries: Smartlead campaign 3680968 and the CA partner campaign artifacts only
stop when: Smartlead verification requires an authenticated UI action or Ryan must approve copy/test recipients
```

This prevents the agent from stopping at “I created a CSV” or “the campaign should be ready.” It must prove the configured state.

### Best use cases at CA

- Finish a campaign through test-ready draft
- Repair all broken sending inboxes and verify health
- Build a quote workflow and make its tests pass
- Migrate customer/order records with reconciliation
- Implement a website page and verify rendering/analytics

### Poor use cases

- “Grow CA”
- “Keep improving marketing forever”
- “Watch replies every day”

Those belong in cron loops with bounded runs.

---

## 3. Parallel Evidence Loop

The video’s parallel-tool capability matters because CA’s truth is split across systems.

### Pattern

```text
Collector A: Smartlead state
Collector B: CRM/opportunity state
Collector C: QuickBooks/payment state
Collector D: operational database state
Collector E: current web evidence
                 ↓
          synthesis agent
                 ↓
          independent verifier
```

### Where to use it

#### Partner research

In parallel:

- Website services and client portfolio
- Partnership/referral language
- Recent news and events
- LinkedIn/contact evidence
- Existing-customer/prior-touch suppression

Then synthesize Tier 1/2/3 with evidence URLs.

#### Quote preparation

In parallel:

- Historical comparable quotes
- Supplier product costs
- Decorator production rates/invoices
- Customer history
- Deadline/shipping feasibility

Then assemble one margin-safe draft and verify it independently.

#### Weekly strategy review

In parallel:

- Acquisition performance
- Conversion/quote performance
- Retention/reorders
- Cash collection
- Operational exceptions
- Content/SEO

Then identify the binding constraint rather than optimizing every metric at once.

---

## 4. Firecrawl Live-Signal Loop

Firecrawl is configured, so we should use it to upgrade structural partner scoring with current evidence.

### Objective

Improve prioritization within Tier 1—not manufacture fake personalization for all 3,000 contacts.

### MVP scope

Research the top 100 prospects in the next cohort only.

### Evidence to collect

- Explicit partner/alliance page
- White-label, referral, reseller, or vendor-network language
- Current client portfolio/case studies
- Recent client win or launch
- Upcoming events
- Hiring/expansion
- Employee experience/onboarding programs
- In-house merchandise capability or competitor conflict

### Output per company

- Signal label
- Exact evidence excerpt
- Source URL
- Source date/access date
- Confidence
- Score change
- Safe personalization line

### Verification

Do not use the personalization line unless the URL resolves and the excerpt supports the claim.

### Stop condition

- 100 companies researched
- Two pages/company maximum initially
- Cost/request cap reached
- No source evidence

---

## 5. Compounding GTM Memory Loop

The video uses Obsidian as an example. Ryan already has a local AIOS Memory Bank and project workspace, so adding another memory system would create fragmentation.

### Use the right memory layer

| Layer | Store |
|---|---|
| Stable user preference/environment fact | Hermes MEMORY/USER |
| Reusable procedure | Hermes skill |
| Project decision or current operating rule | CA project context/plan |
| Campaign run and metric result | `outputs/loops/<loop>/runs/` |
| Compact lesson from many runs | `outputs/loops/<loop>/memory.md` |
| Old conversation detail | Hermes session search |
| Cross-tool long-form knowledge | AIOS Memory Bank |

### Promotion rules

A campaign observation becomes durable only when:

- It appears in multiple replies/runs, or
- It produces a clear measurable lift, or
- Ryan/Kenny explicitly confirms it as an operating truth

Examples:

- One positive reply: run evidence only
- Same objection across 12 qualified prospects: loop memory
- Revised CTA improves live-opportunity rate across adequate cohorts: skill/process update
- Kenny confirms a pricing rule: project context plus structured pricing system

This avoids polluting persistent memory with temporary campaign noise.

---

## 6. Model-Routing Loop

Do not use one expensive model for every step.

### Recommended routing

| Work | Route |
|---|---|
| Deterministic API collection, thresholds, diffs | Script/no-agent cron |
| Bulk extraction, clustering, first-pass summaries | Kimi K3 or another cost-efficient model |
| Final prioritization and cross-system synthesis | GPT-5.6 |
| Verification of consequential claims/configuration | GPT-5.6 plus deterministic checks |
| Creative exploration with multiple variants | Kimi K3, then human selection |
| Campaign activation, quote sending, money | Human only |

### Rule

Use the cheapest layer capable of producing reliable input. Spend stronger-model reasoning at the decision and verification boundary.

---

## 7. Proof-Carrying Run Reports

Completion contracts should be applied inside every loop run even when `/goal` is not used.

Every run report must include:

- Outcome attempted
- Inputs and timestamps
- Action taken
- Verification evidence
- Guardrail status
- Files/IDs/URLs created
- What remains blocked
- Human approvals required

A loop is not allowed to say:

- “Campaign created” without campaign ID and live API readback
- “List is clean” without counts and validation method
- “Quote is ready” without cost/margin verification
- “SEO improved” without comparable GSC windows
- “Invoice collected” without QuickBooks/payment evidence

---

# Recommended Hermes architecture for CA

```text
              deterministic collectors
 Smartlead ─┐
 Sendr ─────┤
 Salesfinity┤
 HubSpot ───┼─ parallel collection ─→ CA Intelligence Brief
 QuickBooks ┤                              ↓
 data.db ───┤                        approval queue
 Web/GSC ───┘                              ↓
                                      Ryan/Kenny

Recurring jobs: cron + bounded fresh sessions
Finite builds: /goal draft + completion contract
Deep research: parallel subagents + Firecrawl
Durable learning: run logs → loop memory → skills/context
Consequential actions: human approval
```

---

# Recommended implementation sequence

## Now

1. Use a completion contract to finish campaign 3680968 through verification/test readiness.
2. Create the Deliverability Safety collector as a script-only daily check.
3. Add Firecrawl live-signal evidence to the next 100 agency prospects.

## After the first campaign sends

4. Create the Partner Campaign Learning loop.
5. Create the Reply-to-Revenue sweep.
6. Feed observed reply/opportunity outcomes into the Partner Signal Model.

## Then

7. Build the daily CA Intelligence Brief from the stable collectors.
8. Add Quote Throughput and operational-exception loops.
9. Add reorder, AR, SEO, and YouTube loops only after the first three are reliable.

---

# Recommendation

This video does not justify adding more tools for their own sake. Ryan’s current Hermes already has the important pieces:

- Strong orchestrator model
- Cost-efficient alternate model
- Parallel calls
- Firecrawl
- Persistent goals/completion contracts
- Cron
- Memory, skills, and session search
- Telegram delivery

The next leverage comes from wiring these into one disciplined execution system—not installing Grok, Obsidian, or another dashboard. The best first artifact is the **Daily CA Intelligence Brief**, but only after the underlying Deliverability, Partner Campaign, and Quote collectors are reliable.
