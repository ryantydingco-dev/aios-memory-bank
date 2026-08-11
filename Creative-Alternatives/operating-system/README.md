# Creative Alternatives Operating System

This folder is the control plane for the next stage of Creative Alternatives. It coordinates three workstreams without replacing the detailed evidence, scripts, and history already stored under `pillars/`, `plans/`, `outputs/`, and `context/`.

## The operating thesis

Run one commercial learning loop and one operational improvement loop at a time. Use real business events as the input to content, and use content as proof rather than as a separate production burden.

The four workstreams are:

1. **Account-based outbound:** one selected segment, one account list, and one cross-channel history across cold email, LinkedIn, and calls.
2. **Inbound validation:** one selected niche, one offer, one conversion path, and measured distribution across LinkedIn, search, and one concentrated buyer community.
3. **LinkedIn/content:** Ryan, Kenny, and Maclaine each have a distinct job and voice. Posts start with real work, customer-safe proof, or founder judgment.
4. **Backend modernization:** prioritize improvements by response time, order quality, margin, and capacity. Keep customer, vendor, money, and production actions human-approved.

## Active source-of-truth documents

| Workstream | Governing document | Working trackers |
|---|---|---|
| Account-based outbound | `pillars/2-customer-acquisition/account-based-outbound-engine.md` | `operating-system/trackers/outbound/` |
| Inbound validation | `pillars/3-online-presence/inbound/30-day-channel-validation-plan.md` | `operating-system/trackers/inbound/` |
| LinkedIn/content | `pillars/3-online-presence/linkedin-content-engine.md` | `operating-system/trackers/content/` |
| Backend modernization | `pillars/1-operations/backend-modernization-roadmap.md` | `operating-system/trackers/operations/` |
| Cross-workstream execution | `plans/first-30-days-unified-operating-plan.md` | `operating-system/trackers/30-day-execution.csv` |
| Document authority | `operating-system/source-of-truth-map.md` | — |

The active source of truth is deliberately small. Older plans remain useful evidence and idea libraries; the authority map states how to use them.

Practical decision and review templates live in `operating-system/templates/`:

- `segment-decision-note.md`
- `operations-pilot-charter.md`
- `weekly-operating-review.md`

## Shared outcome model

Every weekly activity should move at least one of these outcomes:

| Outcome | Primary measure | Supporting measures |
|---|---|---|
| Response time | Median qualified-request-to-complete-draft hours | first-response time, stalled replies, quote backlog |
| Order quality | Exception-free orders / total reviewed | missing fields, missed due dates, proof/PO/tracking exceptions |
| Margin | Gross profit dollars and margin on reviewed orders | missing costs, Kenny price overrides, vendor variance |
| Capacity | Orders/quotes handled per human hour | hours saved, open work per owner, rework avoided |
| New revenue | Qualified opportunities and attributed gross profit | positive replies, conversations, quote requests |
| Trust | Human adoption and correction rate | unsafe suggestions caught, unwanted touches, owner usage |

QuickBooks is the accounting source of truth. Existing production sheets are the live order-status sources until a controlled migration is approved. HubSpot is the intended new-lead pipeline source once its review-only configuration is approved and proven. The local trackers are the planning and reconciliation layer; they are not a replacement CRM.

## Cadence

### Daily, 15 minutes

- Review urgent customer replies and operational exceptions first.
- Record business events worth learning from or turning into content.
- Advance the single next action on each in-flight workstream.
- Do not send, publish, change production data, or contact a customer/vendor from an automated workflow.

### Monday, 45 minutes

- Confirm the one selected outbound segment and its active account cohort.
- Review the one inbound niche, offer, funnel constraint, and channel decision.
- Review order/quote exceptions and choose the operational build for the week.
- Choose one real event for each LinkedIn voice. A voice may skip if there is no honest event.
- Assign owners and due dates in `trackers/30-day-execution.csv`.

### Friday, 45 minutes

- Read one scoreboard across outbound, content, and operations.
- Record one keep/change/expand/pause decision for each active inbound channel.
- Capture objections, Kenny overrides, order exceptions, and proof artifacts.
- Make one keep/change/stop decision per workstream.
- Log the build-in-public story angle, even if it remains private.

## Decision rights

| Decision | Owner | Required approval |
|---|---|---|
| Outbound segment selection and cohort size | Ryan | Ryan |
| Customer, prospect, or vendor contact | Maclaine/Ryan | Human approval before every send/call during the pilot |
| Pricing, supplier choice, margin exception | Kenny | Kenny |
| Operational data or integration write | Ryan + system owner | Explicit approval; read-only first |
| Public customer story, logo, financial detail, or post | Content owner | Kenny/Maclaine as applicable |
| Weekly operating change | Ryan | Evidence recorded in the relevant tracker |

## Hard gates

- Exactly zero or one outbound segment may be marked `selected`; never run multiple segment tests during the first cycle.
- Exactly one niche and one primary offer may be active in the inbound validation cycle.
- QuickBooks customers, prior touches, do-not-contact records, and active service issues must be checked before an account is approved.
- A reply or opt-out in any channel stops the other channels until a human decides the next step.
- Mockups are previews and must use deterministic logo placement; never present generated production scenes as real.
- No customer/vendor/money/public action is automated in this operating cycle.
- Missing or unverified facts remain `[CONFIRM]`.

## Validation

Run:

```bash
python3 scripts/validate_operating_framework.py
```

The check validates the required documents, tracker schemas, unique identifiers, score ranges, and the one-segment rule. It does not connect to or modify any external system.
