# Revenue operating cadence and tracker contract

## The one operating view

`pillars/2-customer-acquisition/revenue-operations/templates/creative-alternatives-revenue-ops.xlsx` is the local
consolidated view for existing-customer campaigns and new-customer pipeline. The
`Revenue Tracker` sheet is the only manually maintained pipeline table in this draft.

QuickBooks remains the source for won/order history. Mailchimp remains the source for
campaign execution after approval. Existing HubSpot warm deals are referenced by
`system_of_record=hubspot` and `external_record_id`; do not rekey them into a second live
workflow until Ryan approves a sync/export rule.

## Tracker fields

| Field group | Fields | Rule |
|---|---|---|
| Identity | `opportunity_id`, `account`, `relationship`, `customer_segment`, `buyer_role` | ID unique; no merge by account name alone |
| Offer | `offer_package`, `product_category` | Outcome package first; category supports it |
| Origin | `lead_source`, `campaign_id`, `campaign_attribution` | Preserve first known source; add campaign ID when applicable |
| Funnel | `first_touch_date`, `stage`, `quote_date`, `quote_amount`, `expected_order_value` | Dates are real; values are estimates until reconciled |
| Probability | `probability_override`, `close_probability`, `weighted_pipeline` | Default probability comes from visible stage mapping; overrides are explicit |
| Close | `order_date`, `order_value`, `qb_customer_id`, `qb_invoice_id`, `reorder_flag` | A win is reconciled when QuickBooks IDs are present |
| Action | `next_action`, `next_action_due`, `next_action_status`, `owner`, `last_touch_date`, `days_open` | Every open opportunity has one owner and one dated next action |
| Learning | `loss_reason`, `notes`, `data_quality_flag` | Lost requires a controlled reason plus useful detail |
| Safety | `marketing_permission`, `approval_status` | No marketing send unless permission and approval are valid |
| Systems | `system_of_record`, `external_record_id` | Prevent double entry and support later sync |

## Stage defaults

| Stage | Default probability | Definition |
|---|---:|---|
| `identified` | 5% | Account/moment identified; buyer not verified |
| `contact_ready` | 10% | Buyer and contact route verified |
| `outreach_drafted` | 10% | Human-approved draft pending/send action |
| `contacted` | 10% | First human-approved touch completed |
| `engaged` | 20% | Meaningful response or live conversation |
| `discovery` | 35% | Buyer, audience, timing, quantity, and decision path being qualified |
| `quote_requested` | 45% | Buyer asked for pricing/options |
| `quote_sent` | 60% | Approved quote delivered |
| `verbal_yes` | 80% | Buyer indicated intent; details remain |
| `proofing` | 90% | Proof/approval/order write-up in progress |
| `won` | 100% | Order accepted; reconcile to QuickBooks |
| `nurture` | 10% | Real fit with a specific future timing |
| `lost` | 0% | Closed; reason required |

An override is allowed only with a note that explains material evidence. Weighted pipeline
is directional planning, not forecast certainty.

## Existing HubSpot crosswalk

| Current HubSpot/warm label | Workbook stage |
|---|---|
| Replied — Awaiting Them | `engaged` |
| Re-engaged | `discovery` |
| Pricing — Ball with CA | `quote_requested` |
| Verbal Yes / Proofing | `proofing` |
| Won — Invoiced | `won` |
| Nurture / Recycle | `nurture` |
| Lost | `lost` |

## Controlled lead sources

`existing_customer_mailchimp`, `reorder_review`, `referral`, `word_of_mouth`,
`cold_email`, `linkedin`, `phone`, `event_trade_show`, `partner`, `website_inbound`,
`content`, `managed_store`, `other`.

## Attribution rules

1. **Lead source** is the earliest known motion that created the opportunity.
2. **Campaign attribution** stores the specific campaign/motion ID that produced the
   qualifying reply or conversation.
3. An order is attributed only after its QuickBooks customer/invoice is reconciled.
4. Existing-customer reorders carry `reorder_flag=yes`.
5. Multi-touch detail can remain in notes, but the weekly dashboard uses one primary
   campaign attribution to avoid double counting.
6. Partner economics continue to follow `partner-attribution-spec.md`; this tracker does
   not calculate payouts.
7. Ryan-originated compensation remains subject to the unresolved attribution decisions
   already documented in `dormant-goldmine-plan.md`.

## Loss reasons

`timing`, `budget`, `no_need`, `incumbent_vendor`, `unreachable`, `not_decision_maker`,
`deadline_infeasible`, `minimum_quantity`, `product_fit`, `price`, `procurement`,
`service_issue`, `duplicate_existing`, `no_permission`, `other`.

## Daily cadence — 15 minutes

Owner: Ryan or Maclaine.

1. Run the daily view:

   ```bash
   .venv/bin/python scripts/ca_revenue_ops.py views \
     --workbook pillars/2-customer-acquisition/revenue-operations/templates/creative-alternatives-revenue-ops.xlsx \
     --output-dir outputs/revenue-ops-views
   ```

2. Clear overdue and due-today next actions, highest expected value first.
3. Route pricing, promises, proofs, and sensitive customer touches for approval.
4. Add same-day replies and next actions.
5. Reconcile any new order to QuickBooks when its ID/invoice exists.
6. Stop volume if replies cannot receive same-business-day human handling.

## Weekly cadence — 45 minutes, Monday

Owners: Ryan + Maclaine; Kenny joins for pricing/capability/account judgment.

1. Validate the tracker and fix errors:

   ```bash
   .venv/bin/python scripts/ca_revenue_ops.py validate \
     --workbook pillars/2-customer-acquisition/revenue-operations/templates/creative-alternatives-revenue-ops.xlsx
   ```

2. Review: new leads, engaged conversations, quotes, quoted value, open/weighted pipeline,
   orders, reorders, reconciled revenue, overdue next actions, and losses.
3. Review performance by lead source, campaign attribution, buyer, and offer package.
4. Pick one experiment only: segment, signal, offer, subject/opener, CTA, or follow-up.
5. Approve the next Mailchimp cohort and any outbound batch.
6. Confirm operational capacity before creating more demand.

## Monthly cadence — 60 minutes

1. Refresh approved QuickBooks exports.
2. Reconcile won orders and update recency/value fields.
3. Rebuild segments and suppressions.
4. Review high-value threshold, reorder timing accuracy, permission evidence, and contact
   freshness.
5. Decide what to scale, stop, or revise using reconciled revenue and loss reasons.
6. Record the build-in-public story angle with customer/financial details anonymized until
   approved.

## Dashboard interpretation

- **Open pipeline:** expected value of non-won/non-lost DATA rows.
- **Weighted pipeline:** expected value × stage probability; directional only.
- **Quotes pending:** quote delivered/requested but not closed.
- **Won this month:** tracker orders dated in the current month; reconcile to QuickBooks.
- **Reorder pipeline:** open expected value where `reorder_flag=yes`.
- **Overdue actions:** open rows with a next-action date before today.

No target or performance claim is built into the dashboard. Baselines and targets are set
only after the first approved month of consistent tracking.
