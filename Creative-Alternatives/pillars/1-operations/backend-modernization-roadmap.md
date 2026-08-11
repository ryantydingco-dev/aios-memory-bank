# Backend Modernization and AI Automation Roadmap

> **Governing operations roadmap.** This consolidates prior automation plans around four business outcomes: response time, order quality, margin, and capacity. It does not change production integrations or authorize external actions.

## North star

Give Kenny, Maclaine, and Ryan a reliable operating view that helps them answer four questions:

1. What needs a response now?
2. Which order is at risk of being wrong or late?
3. Where is margin unsupported, leaking, or invisible?
4. How much more work can the team absorb without adding chaos?

Automation supports judgment. Kenny retains pricing, product, vendor, and relationship decisions. Maclaine retains financial and customer follow-through. Ryan owns system design and validation.

## Current operating reality

Confirmed workspace evidence shows:

- QuickBooks is the accounting truth.
- Diamond, Viking, and Random Vendor Google Sheets carry open production status.
- Email carries customer requests, vendor confirmations, proofs, and tracking clues.
- The historical ledger preserves long-run order and customer behavior.
- Existing collectors, a backend command center, daily briefs, AR assets, proof tooling, and exception generators already exist.
- Data and tooling freshness varies. Some automations have generated useful artifacts but are not equivalent to a production system.
- Final quote pricing, unusual supplier selection, external messages, QuickBooks writes, and source-sheet rewrites remain human-gated.

The first move is to validate and connect the useful layer that already exists, not to build a second command center.

## Outcome definitions and baselines

| Outcome | Definition | First baseline |
|---|---|---|
| Response time | Elapsed business hours from qualified request to complete internal response/quote draft | Sample 10 recent requests; separate draft latency from send latency |
| Order quality | Share of reviewed orders with no missing or contradictory customer, PO, proof, due-date, vendor, tracking, invoice, or payment state | Review 10 representative open/recent orders |
| Margin | Gross profit and margin supported by traceable revenue and cost evidence | Review 10 orders across common product/vendor types; flag missing costs |
| Capacity | Quotes/orders completed per human hour without adding exceptions or late work | One-week time sample for quoting, order status, and reconciliation |

Do not declare an automation win without a before measure and a review sample.

## Prioritization rubric

The working backlog is `operating-system/trackers/operations/automation-backlog.csv`.

Score 0–5 on each outcome and evidence strength; score implementation effort 1–5. Then apply these gates:

1. **Safety gate:** read-only/draft-only before write or send.
2. **Evidence gate:** at least three representative examples; ten for a production pilot.
3. **Adoption gate:** the operator can use the output without Ryan narrating every field.
4. **Reliability gate:** verifier catches missing, contradictory, and stale source data.
5. **Outcome gate:** measured improvement in at least one named outcome without harming another.

Priority is not the largest theoretical ROI. It is the best evidence-backed improvement that can be safely adopted now.

## Current portfolio

### Priority A — validate the existing open-order exception view

**Outcomes:** order quality and capacity.

Reuse the Diamond, Viking, and Random Vendor collectors plus the existing command-center assets. Produce one read-only view with:

- Order/customer key.
- Required date and latest known status.
- PO, confirmation, proof, tracking, invoice, and payment evidence.
- Exception, owner, and next action.
- Source and freshness for each status.

**Definition of done:** ten reviewed orders reconcile to their source systems; false/missing exceptions are labeled; Maclaine can identify the top five actions without opening three sheets.

**Not included:** editing sheets, emailing vendors, or changing invoice/payment status.

### Priority B — offline quote-intake and missing-field assistant

**Outcomes:** response time, order quality, and capacity.

Use three historical orders first, then ten. Parse customer request threads into:

- Customer/account.
- Product and decoration requirements.
- Quantities, sizes, colors, art, in-hands date, delivery location, budget, and prior-order reference.
- Missing/contradictory fields.
- Internal next step and a draft clarification question set.

**Definition of done:** a reviewer agrees the packet is complete or correctly flags gaps; draft time is measured; no unsupported fact is inserted.

**Not included:** sending clarification, choosing final products, pricing, or creating a QuickBooks record.

### Priority C — quote cost and margin decision packet

**Outcomes:** margin and response time.

This starts only after cost sources and Kenny's decision rules are mapped. The assistant may:

- Retrieve cited blank, decoration, freight, and setup cost evidence.
- Calculate price/margin options under approved rules.
- Flag missing or stale cost inputs.
- Record Kenny's override and reason.

**Definition of done:** ten reviewed drafts recalculate correctly, cite every cost, and never present a final price without approval.

This is high leverage and high risk. It is not the first production automation.

### Supporting candidates

- Proof/approval and stalled-job tracker.
- Vendor bill/payment reconciliation.
- A/R prioritization and relationship-safe draft queue.
- Daily owner brief built on validated source data.
- Reorder timing recommendations after active-order controls are stable.

Their current evidence, dependencies, and stage are recorded in the backlog CSV.

## Architecture

### Stage 1 — evidence packet

```text
Exports / read-only source access
        ↓
Normalized local record with source + timestamp
        ↓
Builder produces draft or exception
        ↓
Independent validation rules
        ↓
Human review
```

### Stage 2 — read-only operational view

```text
QuickBooks + production sheets + approved email evidence
        ↓
Snapshot collectors
        ↓
Order / quote / invoice identity reconciliation
        ↓
Read-only command view and daily exceptions
```

### Stage 3 — approved action queue

```text
Verified recommendation
        ↓
Named owner + source evidence + confidence
        ↓
Human approval
        ↓
Manual action and outcome log
```

No Stage 4 writeback or automated external action is planned in the first 30 days.

## Data contracts

Every operational record should carry:

- Stable local ID.
- Source system and source record identifier.
- Source timestamp and collection timestamp.
- Customer/account and order/PO/invoice identifiers where available.
- Current state and the evidence supporting it.
- Exception type, owner, next action, and due date.
- Confidence and `[CONFIRM]` where identity or state is unresolved.

Never merge records on company name alone when a PO, invoice, order number, or other stable key exists.

## Verification contract

Each candidate needs a builder and a verifier:

| Candidate | Builder | Verifier |
|---|---|---|
| Open-order view | Normalizes rows and proposes exceptions | Checks required fields, freshness, duplicate keys, and source contradictions |
| Quote intake | Extracts a structured request | Checks all source text was covered and unsupported values were not invented |
| Margin packet | Retrieves costs and calculates options | Recalculates math, checks source dates and approved floors |
| Reconciliation | Matches transactions | Checks totals, one-to-one/many-to-one logic, and unresolved exceptions |

The verifier does not “fix” uncertainty by guessing.

## 30-day sequence

### Week 1 — baseline and access

- Confirm which collectors can run in this worktree and which depend on another machine/account.
- Refresh or clearly mark stale sources.
- Select ten representative order records and three historical quote threads.
- Measure current response-time, quality, margin-evidence, and capacity baselines.

### Week 2 — validate what exists

- Run the current open-order collection/reporting path in read-only mode.
- Compare ten rows to source evidence.
- Repair only local normalization/reporting defects found in the validation.
- Produce the operator-facing exception view.

### Week 3 — offline quote-intake pilot

- Parse three historical quote/order threads.
- Review with Kenny/Maclaine.
- Record missed fields, false assumptions, review time, and overrides.
- Decide whether to expand to ten examples.

### Week 4 — choose a production pilot

- Compare measured results.
- Select one candidate and write a pilot charter: users, sources, baseline, success threshold, failure/rollback, and human gates.
- Request explicit approval before any production integration, send, or write.

## Weekly operations review

- Top five order/quote exceptions.
- Median draft response time.
- Exception-free order rate on the reviewed sample.
- Orders with unsupported or missing margin evidence.
- Human hours spent and avoided.
- Corrections by Kenny/Maclaine.
- One automation change for the next week.

## Do not automate in this cycle

- Final pricing or margin exceptions.
- Supplier selection for unusual/high-risk jobs.
- Customer or vendor sends.
- Collections escalation.
- QuickBooks writes.
- Production-sheet edits.
- Public content or customer-logo use.

## Build-in-public proof

Capture privately:

- Before/after operator time.
- Exception counts and examples.
- The decision Kenny made that the system could not.
- What the system prevented or surfaced.

Publishing still requires approval and anonymization. A draft tool is not described publicly as live.
