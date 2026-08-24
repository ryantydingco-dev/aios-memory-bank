# Source-of-Truth Map

This map keeps old plans and experiments from competing with the $1M revenue mission.

## Governing documents

| Area | Authority |
|---|---|
| Business mission and repository rules | Root `README.md` |
| Current command center | Root `00 - Command Center.md` |
| Six-month revenue strategy and targets | `plans/1m-6-month-game-plan.md` |
| Daily revenue execution | `gtd/daily-power-list.md` |
| Concrete supporting actions | `gtd/next-actions.md` |
| Revenue execution loop | `pillars/2-customer-acquisition/revenue-operations/daily-revenue-loop.md` |
| Verified business context | `context/business-info.md`, `context/current-data.md`, `context/sales-history.md`, `context/people.md` |
| Safety and operating boundaries | `context/operators-code.md`, `context/methodology.md`, root `README.md` |

## Live system truth

| Domain | System of record | Boundary |
|---|---|---|
| Customers, invoices, revenue, A/R | QuickBooks Online | Human-approved writes only |
| Campaigns, sends, replies, copy | SmartLead | Repository copy is not live truth until reconciled |
| Cold calls and LinkedIn DMs | Human call/LinkedIn logs | Grokbot may draft; Ryan performs external actions |
| Stores and store orders | OrderMyGear and approved store systems | Confirm status in the live system |
| Production status | Approved production sheets and email | Read and reconcile before automating |
| Pipeline and attribution | Simple chosen tracker plus QuickBooks convention | HubSpot is not in use; one entry point must be settled |
| Public content | Published platform state | Approval required before publishing |

## Supporting systems

The following remain useful when consistent with the governing plan:

- `pillars/2-customer-acquisition/` for campaign, reactivation, proof, store, list, and fulfillment playbooks.
- `pillars/1-operations/` for evidence-backed improvements to response time, order quality, margin, and capacity.
- `pillars/3-online-presence/` for measurable inbound infrastructure.
- `pillars/4-youtube-build/` and root `Personal Brand/` for CA-centered distribution.
- `claude-memory/` and `Work Logs/` for durable facts and dated internal evidence.

## Superseded or historical

- `plans/60-day-revenue-sprint.md` and `plans/90-day-revenue-plan.md` are explicitly superseded by the $1M plan.
- `plans/first-30-days-unified-operating-plan.md` and the older one-segment operating framework are supporting history, not cross-workstream authority.
- Broad cold-volume, general AI consulting, Dealthreads, Oloxa, SaaS, course, and creator-system material lives under root `Archive/`.

## Conflict rule

1. Prefer verified live system truth.
2. Then prefer the newest human-verified evidence measuring the same thing.
3. Then use the governing plan.
4. Record unresolved conflicts as `[CONFIRM]`.
5. Do not propagate uncertainty into pricing, outreach, public claims, delivery promises, or integrations.
