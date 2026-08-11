# Source-of-Truth Map

This map prevents dated strategy documents from competing with the current operating framework. Historical files stay in place because they contain useful research, copy, evidence, and implementation detail.

## Authority levels

- **Governing:** current decision and execution authority.
- **Supporting:** reusable evidence, implementation detail, scripts, or idea banks. Use only when consistent with governing documents.
- **Historical:** preserves a prior strategy or assumption. Do not execute its next actions without revalidation.
- **System truth:** a live business data source, not a planning document.

## Governing documents

| Area | Document | Authority |
|---|---|---|
| Cross-workstream control | `operating-system/README.md` | Roles, gates, cadence, and shared outcomes |
| First cycle | `plans/first-30-days-unified-operating-plan.md` | Current 30-day implementation sequence |
| Outbound | `pillars/2-customer-acquisition/account-based-outbound-engine.md` | Segment decision, account workflow, three-channel cadence, measurement |
| Inbound validation | `pillars/3-online-presence/inbound/30-day-channel-validation-plan.md` | Current niche, offer, channel test, KPI thresholds, and approval gates |
| Content | `pillars/3-online-presence/linkedin-content-engine.md` | Ryan/Kenny/Maclaine voices and sustainable weekly workflow |
| Operations | `pillars/1-operations/backend-modernization-roadmap.md` | Outcome-weighted automation priorities and stage gates |
| Business facts | `context/business-info.md`, `context/current-data.md`, `context/sales-history.md`, `context/people.md` | Verified facts and named caveats |
| Safety | `context/operators-code.md`, `context/methodology.md` | Human gates, trust, mapping, measurement |

## Supporting documents

| Document | Keep using it for | Do not let it decide |
|---|---|---|
| `pillars/2-customer-acquisition/campaign-diagnosis-2026-07-25.md` | Observed segment performance and July diagnosis | Automatic launch or a permanent segment choice |
| `pillars/2-customer-acquisition/cold-outbound-orchestration.md` | Cross-channel suppression, signal handoff, call operations | The current segment or cohort |
| `config/ca_outbound.yaml` and `config/ca_hubspot_outbound.yaml` | Draft schemas and implementation detail | Whether HubSpot or campaigns are live |
| `scripts/ca_touch_ledger.py` | Existing-customer/prior-touch suppression mechanics | Account approval without review |
| `pillars/2-customer-acquisition/sequences/` | Copy and call-script components | Current positioning before adapting to the selected segment |
| `pillars/3-online-presence/ca-brand-content-machine.md` | Format library, mockup content, shop capture | Daily multi-platform cadence or greenfield claims |
| `plans/ca-social-brand-playbook.md` | Creative formats and comedy guardrails | The three-person LinkedIn cadence |
| `plans/content-positioning.md` | Ryan/CA brand separation and artifact-first storytelling | A publishing schedule |
| `plans/content-idea-engine.md` | Idea prompts when a real event needs packaging | Inventing content without a real event |
| `pillars/4-youtube-build/content-packet-template.md` | Repurposing a proven story into multiple assets | Making every weekly event a large production |
| `plans/creative-alternatives-automation-roadmap.md` | Portfolio history, phases, metrics, and prior evidence | Current automation priority |
| `pillars/1-operations/backend-automation-build-plan-2026-07-05.md` | Confirmed source map and detailed build inputs | Current build order without fresh evidence |
| `pillars/1-operations/README.md` and `automations/` | Existing tools, commands, and generated evidence | Declaring those tools production-ready |
| `docs/aios-audit-2026-07-17.md` | Known tooling failures and human dependencies | Current status without rerunning checks |

## Historical plans retained for reference

| Document | Why it is historical |
|---|---|
| `pillars/2-customer-acquisition/outbound-gtm-playbook.md` | Contains valuable stack/cadence detail, but its preset launch order and mockup-first assumptions conflict with later evidence and the new one-segment decision gate. |
| `pillars/2-customer-acquisition/master-gtm-strategy.md` | Useful five-motion model, but several gates and financial assumptions were later resolved or corrected. |
| `pillars/2-customer-acquisition/90-day-gtm-game-plan.md` | Useful flywheel concept, but it sets an unsustainable content cadence and preselects launch segments. |
| `plans/cold-volume-scale-plan-2026-07-10.md` | Documents infrastructure capacity, but broad volume is no longer the operating objective. Learning and conversion capacity come first. |
| `plans/content-growth-game-plan.md` | Strong narrative foundation, but not the current weekly operator workflow. |
| `plans/ai-implementation-gameplan-2026-07-07.md` | Time-bound July sprint containing work that may have changed state. |

## System truths and boundaries

| Domain | Current truth | Boundary |
|---|---|---|
| Money, customers, invoices | QuickBooks Online and approved exports | No writes in this cycle |
| Production status | Diamond, Viking, and Random Vendor Google Sheets; supporting email | Read and reconcile; do not rewrite source sheets |
| Historical order analytics | Kenny's ledger / protected converted Sheet | Treat as analysis source; preserve history |
| New-lead pipeline | HubSpot once reviewed and activated | Do not assume the draft config is live |
| Cold sending state | SmartLead | No campaign activation from this workspace cycle |
| LinkedIn activity | Human profile/account history | No automated messages or publishing |
| Calls | Salesfinity exports or manual call log | Human caller, human disposition |

## Conflict rule

When two sources disagree:

1. Prefer a verified system truth over a planning document.
2. Prefer the newer evidence, but inspect whether it measures the same thing.
3. Record the conflict and leave the fact `[CONFIRM]` if it cannot be resolved safely.
4. Do not ripple the uncertain value into outreach, pricing, public content, or an integration.
