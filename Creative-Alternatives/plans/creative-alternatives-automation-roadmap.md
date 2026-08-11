# Creative Alternatives Automation Roadmap

> **Historical/supporting roadmap.** Preserve its portfolio, evidence, and metrics, but use `../pillars/1-operations/backend-modernization-roadmap.md` for current priorities and stage gates.

> Drafted 2026-07-05. Built from the current workspace context, QuickBooks exports, and Pillar 1 operations docs. Any customer-facing, vendor-facing, money-facing, or public action stays human-approved unless Kenny explicitly changes that rule.

## North star

Turn Creative Alternatives into a modern, AI-assisted operating system without breaking the relationship-driven business Kenny built.

The first version should not "run the company." It should remove the manual pain around money, follow-up, and repeated data entry while making Kenny and Maclaine feel more in control.

## Strategic posture

1. **Trust first.** Kenny's judgment is a system, not a bottleneck. Automate the admin around his judgment before touching the judgment itself.
2. **Manual-assist before autonomy.** AI drafts, ranks, matches, flags, and summarizes. A human approves anything external.
3. **QuickBooks is the source of truth.** Customer history, invoices, AR, reorder timing, and financial reporting should come from QuickBooks once the connector is stable.
4. **Cash wins beat abstract wins.** The fastest buy-in comes from finding money, saving hours, or preventing missed revenue.
5. **Build the content layer as a byproduct.** Each automation should have a before/after story, but customer names and financial details stay private unless cleared.

## Current state

Known from workspace context:

- CA is a custom branding and promotional-products company, family-operated since 1999.
- The operating model is quote -> proof -> produce -> deliver -> invoice -> reorder.
- QuickBooks went live in 2025, so it has strong recent data but not the full 27-year customer history.
- QuickBooks exports show 364 customers with 2025-2026 sales and around 2,350 legacy contacts with unknown value.
- Camps and squash/racquet accounts are the highest-value confirmed segments, roughly 60% of recent revenue after cleanup.
- 118 2025 customers had not yet reordered in 2026 at the time of analysis, representing about $306k in 2025 sales.
- AR is the clearest cash drag: about $671k owed, about $378k past due, and about $63k 90+ days late in the 2026-06-26 export.
- Kenny and Maclaine spent 8 hours in one day matching customer payments/deposits to open invoices.
- The local SQLite system currently stores outreach snapshots, not QuickBooks operational data.
- A local QuickBooks MCP exists, but live production authentication/read-only rollout still needs to be completed and permissioned.

Open facts to confirm:

- Exact current gross revenue, net profit, and margin model.
- Which revenue/cost data is complete in QuickBooks versus outside QuickBooks.
- Whether costs are tracked outside QuickBooks, since item-level COGS is currently $0 in exports.
- Who currently owns AR follow-up and how often it happens.
- What Kenny considers sacred or off-limits in quoting, supplier selection, customer follow-up, and filming.
- Whether Maclaine wants Slack, Telegram, email, or another channel for daily briefs.

## Automation portfolio

| Automation | Why it matters | First version | Later version | Risk |
|---|---|---|---|---|
| AR worklist and reminder drafts | Immediate cash, clear ROI, protects relationships when tiered by customer value | Weekly AR export -> ranked worklist -> Maclaine approves drafts | QuickBooks read-only daily pull -> approval queue -> C-tier auto-send only if approved by policy | High if tone is wrong |
| Payment-to-invoice reconciliation | Converts an 8-hour manual slog into exceptions review | Upload invoices + payments CSVs to AI prompt | Script or app matches payments, writes exception report, optionally prepares QB updates | Medium because money records must be exact |
| Reorder-due rescue list | Protects the core book before customers lapse | QuickBooks export -> 118-account prioritized call/email list | Daily/weekly reorder model based on prior seasonality and customer cycle | Medium because outreach timing matters |
| Morning ops brief | Gives Maclaine/Ryan one place to see what needs attention | Generated markdown brief from exports and SmartLead data | Hermes/AIOS posts daily Slack/Telegram digest from live tools | Low if read-only |
| Reply triage | Prevents hot outbound replies from getting buried | Pull SmartLead replies -> classify -> draft response | Watch SmartLead/Sendr live -> alert + draft + approved send/log | Medium because external comms |
| Quote intake parser | Saves time and standardizes messy customer requests | Paste/email request -> structured intake checklist + missing info questions | Email watcher creates quote packet draft and asks missing info | Medium/high because bad assumptions create bad quotes |
| Quote builder assistant | High leverage but Kenny's pricing judgment must remain central | Draft quote outline from request, product category, prior customer history | Pull supplier pricing/catalogs and prepare margin-aware quote options | High because pricing and margin |
| Proof and approval chaser | Reduces stalled jobs and missed follow-up | Manual list of open proofs -> reminder drafts | Proof status tracker with timed reminders and escalation | Medium because customer tone |
| Supplier/order tracker | Keeps jobs from disappearing after approval | Manual order tracker template | Supplier PO/status ingest + late-risk alerts | Medium because supplier data varies |
| Margin visibility | Fixes pricing blindness and messy books | Report on revenue, expense buckets, missing cost data | Job-level margin tracker tied to suppliers/items/customer | High because accounting cleanup required |

## Recommended sequence

### Phase 0: Discovery and boundaries, July 5-12, 2026

Goal: lock the map and make the first automation safe.

Actions:

1. Run the AIOS kickoff with Kenny and Maclaine.
2. Interview Maclaine first on QuickBooks, AR, reorders, and the weekly pain.
3. Interview Kenny second on sales judgment, suppliers, quoting, relationship guardrails, and do-not-automate rules.
4. Walk one real order end to end and fill `pillars/1-operations/ops-discovery.md`.
5. Confirm filming/privacy boundaries before using any operational footage.
6. Pick the first automation using hours saved x ease x trust.

Deliverables:

- Completed workflow map.
- Tool stack map.
- Time and pain log.
- Do-not-automate rules added to `context/operators-code.md`.
- First automation decision with baseline time/cash metric.

Decision rule:

If Maclaine confirms AR is not systematically chased, start with AR worklist. If the 8-hour reconciliation pain is more urgent this week, start with reconciliation. Do not start with quote automation unless Kenny specifically asks for it.

### Phase 1: First visible win, July 12-26, 2026

Goal: ship one real automation that saves time or finds cash within two weeks.

Recommended first build: **AR + payment ops assistant**

Build in two tracks:

1. **AR worklist**
   - Input: `context/import/qb_ar_aging.csv` plus customer value/segment data.
   - Output: top 10 invoices to act on, value x aging tier, recommended channel, relationship-risk note, and draft message.
   - Approval: Maclaine/Kenny sends manually.
   - Metric: overdue dollars acted on, dollars collected, AR aging trend, time spent.

2. **Payment-to-invoice reconciliation**
   - Input: invoices CSV and payments/deposits CSV for one representative month.
   - Output: matched invoices/payments table plus exception list.
   - Approval: Maclaine reviews exceptions before any QuickBooks update.
   - Metric: time versus 8-hour baseline, exception count, dollars clarified.

Implementation shape:

- Create scripts under `pillars/1-operations/automations/`.
- Keep raw exports in `context/import/` or a private ignored data path.
- Generate outputs to `outputs/operations/`.
- Do not write back to QuickBooks in v1.

Definition of done:

- A real CA export goes in.
- A ranked worklist or exception report comes out.
- Maclaine can review it without Ryan explaining every line.
- A baseline improvement is measured.
- The story angle is logged for Episode 1 or Episode 2.

### Phase 2: Build the CA operations data layer, July 26-August 16, 2026

Goal: stop treating each export as a one-off and build the foundation for repeatable ops intelligence.

Actions:

1. Authenticate QuickBooks MCP in production with read-only posture first.
2. Set QuickBooks MCP flags to disable writes/updates/deletes during the pilot.
3. Add QuickBooks collection scripts that snapshot:
   - customers
   - invoices
   - payments
   - aged receivables
   - customer sales
   - items/products
   - vendor expenses
4. Store normalized snapshots in `data/data.db`.
5. Extend `scripts/generate_metrics.py` so `/prime` loads operational metrics, not just SmartLead outreach.
6. Create `context/tools-data-map.md` so future agents know which system owns which data.

Suggested tables:

- `qb_customers`
- `qb_invoices`
- `qb_payments`
- `qb_aged_receivables`
- `qb_customer_sales`
- `qb_items`
- `qb_vendor_expenses`
- `ops_daily_brief`
- `ops_action_log`

Definition of done:

- Ryan can run one command and refresh CA's operational data.
- `context/group/key-metrics.md` includes AR, reorder-due, and QuickBooks freshness.
- No external action is taken automatically.

### Phase 3: Always-on briefing and triage, August 16-September 6, 2026

Goal: give Ryan and Maclaine a daily command center.

Build:

1. Morning brief:
   - overdue invoices
   - top AR actions
   - reorder-due accounts
   - hot SmartLead/Sendr replies
   - open exceptions from reconciliation
   - one recommended action for the day

2. Reply triage:
   - SmartLead replies pulled daily.
   - Interested/not-interested/unclear classification.
   - Draft response in Maclaine or Ryan voice.
   - Human sends and logs decision.

3. Reorder rescue:
   - Weekly list of customers who bought in 2025 but not in 2026, filtered by seasonality and customer value.
   - Phone-first for A-tier.
   - Email backup for B/C-tier.

Channels:

- Ryan: CLI plus Slack if already active.
- Maclaine: Telegram, Slack, or email digest. [CONFIRM]
- Kenny: no new app until the system has proven value. Email digest only if wanted.

Definition of done:

- Maclaine receives or can open one daily brief.
- The brief has at most 5-10 actions, not a giant report.
- Every action has a source and a confidence level.

### Phase 4: Quote and order workflow automation, September 6-October 5, 2026

Goal: move from money/reporting automation into the core quote-to-order workflow.

Sequence:

1. **Quote intake parser**
   - Parse customer emails into structured job requirements.
   - Flag missing info: product type, quantity, sizes, logo/art, due date, delivery address, budget, prior order reference.
   - Draft a customer clarification email.

2. **Quote packet assistant**
   - Pull prior customer history from QuickBooks.
   - Suggest likely product categories from CA's real mix: tees, sweatshirts, bags, caps, bottles.
   - Prepare a quote packet for Kenny to review.
   - Do not set final pricing without Kenny/Maclaine approval.

3. **Proof/approval tracker**
   - Track open proofs and approval status.
   - Draft reminders when proof is waiting on customer.
   - Escalate stalled high-value jobs.

4. **Supplier/order tracker**
   - Track supplier, PO/status, expected ship date, and risks.
   - Start manually with a shared tracker before API integrations.

Definition of done:

- One real order can move through intake -> quote packet -> proof tracker with less retyping.
- Kenny still controls final supplier/pricing judgment.
- Maclaine has visibility into open jobs and stalled approvals.

## Operating cadence

Daily:

- Morning brief reviewed by Ryan/Maclaine.
- Top AR/reorder actions handled.
- Hot replies triaged.

Weekly:

- Refresh QuickBooks snapshots.
- Review AR trend, reorder-due trend, reply performance, and job exceptions.
- Pick one automation improvement for the next week.
- Log the content story angle.

Monthly:

- Review metrics with Kenny in plain English.
- Decide what is safe to move from manual-assist to approved-write.
- Review do-not-automate rules and update if needed.

## Metrics scoreboard

Ops:

- Hours saved per week.
- Number of manual reconciliation exceptions versus total records.
- Number of open/stalled jobs.
- Proof approval cycle time. [CONFIRM baseline]

Cash:

- Total AR.
- Percent of AR past due.
- 90+ day AR dollars.
- Dollars collected from AI-prioritized follow-up.
- Days sales outstanding. [CONFIRM target]

Revenue protection:

- Reorder-due accounts contacted.
- Reorder revenue recovered.
- A-tier accounts touched personally.

GTM:

- Hot replies flagged.
- Reply response time.
- Meetings or quote requests from campaigns.

Trust:

- Number of times Kenny/Maclaine used the system without Ryan.
- Number of incorrect suggestions caught.
- Anything that made Kenny's day harder. This is a defect, not a footnote.

## Technical architecture

### V1: export-assisted

```
QuickBooks CSV exports
        |
        v
Python scripts / AI prompts
        |
        v
Markdown/CSV reports in outputs/
        |
        v
Maclaine/Kenny approve action
```

Use this for AR, reconciliation, reorder rescue, and first content proof.

### V2: read-only data layer

```
QuickBooks MCP read-only + SmartLead collector + Sendr wrapper [build]
        |
        v
data/data.db snapshots
        |
        v
metrics generator + daily brief
        |
        v
Slack/Telegram/email digest
```

Use this once authentication and data freshness are stable.

### V3: approved action queue

```
AI recommendation
        |
        v
Action queue with source, confidence, and draft
        |
        v
Human approval
        |
        v
Send/log/write-back
```

Only move here after the read-only system has produced correct recommendations for multiple weeks.

## Do not automate yet

- Final quote pricing.
- Supplier selection for unusual or high-risk jobs.
- High-value customer collections messages.
- Customer-facing sends without approval.
- QuickBooks writes.
- Anything public-facing for the YouTube series without Kenny's explicit permission.

## First two-week action list

1. Schedule and run the kickoff with Kenny and Maclaine.
2. Confirm first automation: AR worklist or reconciliation assistant.
3. Export one fresh AR aging report and one fresh invoice/payment month from QuickBooks.
4. Build `pillars/1-operations/automations/ar_worklist/` or `reconciliation_assistant/`.
5. Generate the first report and have Maclaine review it.
6. Measure time saved and dollars/action items surfaced.
7. Write the before/after story angle for YouTube.

## Content angles

- "I found $378k past due inside a 27-year family business and built the system to chase it without damaging relationships."
- "AI turned an 8-hour QuickBooks reconciliation slog into an exception review."
- "The books revealed the real business: camps and squash clubs drive the money."
- "I built an AI morning brief for a company that still runs on founder memory."

## Next best build

Start with **AR worklist + reconciliation assistant** as the first automation bundle.

Why:

- It is grounded in real data.
- It has a clear cash/time baseline.
- It does not require changing Kenny's customer acquisition or sales style.
- It helps Maclaine immediately.
- It produces a visible proof artifact for the build-in-public series.
