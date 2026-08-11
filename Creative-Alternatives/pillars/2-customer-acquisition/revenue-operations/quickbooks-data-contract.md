# QuickBooks customer and order data contract

> Draft contract. Field availability, export names, historical coverage, and consent
> evidence require verification before any real import.

## Purpose

Create a repeatable, auditable path from QuickBooks exports to customer segmentation
without treating QuickBooks as an email-permission system. Raw exports remain untouched;
clean fields and derived fields sit beside them. QuickBooks is the eventual source of
truth for customer/order history, while permission evidence comes from a reviewed source.

## Required local inputs

Use exports only after Ryan/Maclaine approves access and storage:

1. Customer Contact List
2. Sales by Customer Detail or Transaction List by Customer
3. Invoice/Order Detail with line descriptions and dates
4. Estimates/Quotes, if used
5. Optional historical ledger mapping for pre-QuickBooks order dates
6. Separate consent/suppression evidence from Mailchimp or another reviewed source

Do not edit raw exports. Save a dated copy, record the export period, and populate the
cleaning templates in `templates/`.

## Customer dictionary

| Field | Type | Required | Source / cleaning rule | Used for |
|---|---|---:|---|---|
| `customer_id` | text | yes | Stable QuickBooks customer ID; never derive from name | joins, dedupe |
| `customer_name_raw` | text | yes | Exact QuickBooks value, preserved | audit |
| `customer_name_clean` | text | yes | Trim whitespace; normalize spacing/case; do not merge entities without review | tracker display |
| `parent_customer_id` | text | no | QuickBooks parent/job relation if present | account roll-up |
| `company_name` | text | no | Reviewed organization name | personalization |
| `contact_first_name` | text | no | Split only when reliable; otherwise leave blank | greeting |
| `contact_last_name` | text | no | Split only when reliable | review |
| `email` | text | no | Lowercase/trim; one address per row; malformed values flagged | reachability |
| `phone` | text | no | Preserve country code where available | call lane |
| `billing_city` | text | no | Trim | geography |
| `billing_state` | text | no | Two-letter US code when applicable | geography |
| `billing_country` | text | no | ISO-like label after review | geography |
| `account_owner` | enum | yes | `Kenny`, `Maclaine`, `Ryan`, or `[CONFIRM]` | routing |
| `key_account` | boolean | yes | Human judgment; never inferred only from spend | high-value |
| `first_order_date` | date | no | Earliest reconciled order date | tenure |
| `last_order_date` | date | no | Latest reconciled order/invoice date | recency |
| `lifetime_order_count` | integer | no | Count distinct reconciled orders/invoices | frequency |
| `lifetime_revenue` | currency | no | Sum reconciled order revenue | value |
| `trailing_12m_revenue` | currency | no | Revenue in trailing 365 days at refresh date | value |
| `trailing_12m_order_count` | integer | no | Orders in trailing 365 days | frequency |
| `primary_product_category` | enum | no | Map line detail using category map; `unknown` if unclear | campaign relevance |
| `secondary_product_category` | enum | no | Optional reviewed second category | campaign relevance |
| `last_order_summary` | text | no | Short factual description; no invented product detail | personalization |
| `seasonal_event` | text | no | Known event/season from history or owner note | timing |
| `typical_order_month` | integer | no | 1–12 from repeated history; blank if weak signal | timing |
| `likely_reorder_window_start` | date | no | Human-reviewed window, normally 6–10 weeks before need | prioritization |
| `likely_reorder_window_end` | date | no | Human-reviewed end | prioritization |
| `next_expected_order_date` | date | no | Next likely purchase date; include method note | task queue |
| `reorder_confidence` | enum | yes | `high`, `medium`, `low`, `unknown` | review priority |
| `marketing_permission` | enum | yes | `subscribed`, `unknown`, `transactional_only`, `unsubscribed`, `do_not_contact` | suppression |
| `permission_source` | text | no | Mailchimp form, written consent, reviewed legacy basis, etc. | audit |
| `permission_date` | date | no | Evidence date when known | audit |
| `do_not_contact` | boolean | yes | `true` overrides every campaign selection | suppression |
| `primary_segment` | enum | no | Derived using approved rules below | campaign |
| `source_file` | text | yes | Exact export filename | lineage |
| `source_exported_at` | datetime | yes | When export was produced | freshness |
| `data_quality_status` | enum | yes | `ready`, `review`, `blocked` | gate |
| `data_quality_notes` | text | no | Specific missing/conflicting fact | remediation |

## Order dictionary

| Field | Type | Required | Source / cleaning rule | Used for |
|---|---|---:|---|---|
| `order_id` | text | yes | Stable transaction/invoice/order ID | dedupe |
| `customer_id` | text | yes | Must match customer table | join |
| `transaction_type` | enum | yes | `estimate`, `sales_order`, `invoice`, `credit`, `other` | funnel/history |
| `order_date` | date | yes | Transaction/order date | recency |
| `invoice_date` | date | no | Invoice date if separate | reconciliation |
| `delivery_date` | date | no | Actual or promised date; label which | timing |
| `event_date` | date | no | Customer event/program date if known | planning |
| `invoice_number` | text | no | QuickBooks-visible reference | reconciliation |
| `status` | enum | yes | `draft`, `open`, `fulfilled`, `invoiced`, `paid`, `void`, `unknown` | history |
| `product_category` | enum | yes | Reviewed category map | relevance |
| `product_subcategory` | text | no | Normalized subtype | relevance |
| `line_description_raw` | text | no | Preserve QuickBooks line text | audit |
| `quantity` | number | no | Numeric quantity; blank if not meaningful | order context |
| `revenue` | currency | yes | Transaction revenue; credits negative | RFM/value |
| `cost` | currency | no | Only if verified; QBO item COGS is currently incomplete | margin |
| `gross_profit` | currency | no | `revenue - verified cost`; otherwise blank | prioritization |
| `campaign_id` | text | no | Campaign or motion that originated the order | attribution |
| `lead_source` | enum | no | Controlled list from operating cadence | attribution |
| `account_owner` | enum | yes | Owner at order time | routing |
| `next_reorder_date` | date | no | Derived/reviewed; never overwrite a known date silently | timing |
| `reorder_reason` | text | no | Annual event, inventory, new hires, gifting, etc. | message angle |
| `source_file` | text | yes | Exact export filename | lineage |
| `source_exported_at` | datetime | yes | Export timestamp | freshness |
| `data_quality_status` | enum | yes | `ready`, `review`, `blocked` | gate |
| `data_quality_notes` | text | no | Missing join, ambiguous category, conflicting date, etc. | remediation |

## Controlled product categories

Use one primary category per line:

`apparel`, `bags`, `headwear`, `drinkware`, `awards_recognition`,
`print_stationery`, `event_display`, `packaging_kitting`, `accessories`,
`managed_store`, `service_freight`, `other`, `unknown`.

Current merchandising preference is retail-quality, useful everyday merchandise,
sustainable choices, personalization/packaging, and drinkware. That is a campaign
direction, not permission to recategorize unrelated historical items.

## Cleaning and dedupe rules

1. Preserve raw columns and source filename.
2. Join by stable QuickBooks ID first.
3. Never merge on name alone. Name/email/phone similarity can create a review candidate.
4. Parent/jobs roll up for spend analysis only after Maclaine confirms the relationship.
5. Credits remain negative and voids remain identifiable.
6. Missing order detail is `unknown`, never inferred from a campaign concept.
7. If QBO and the historical ledger disagree, record the conflict. QBO controls current
   accounting; the ledger can extend earlier order history after reconciliation.
8. A permission field cannot be inferred from having an email address or prior purchase.
9. `do_not_contact=true` overrides every segment and audience.
10. Every refresh records `source_exported_at`; exports older than 14 days are stale for
    an active campaign selection.

## Derivation rules

- **Days since last order:** `refresh_date - last_order_date`.
- **Likely reorder:** use repeated historical months/event notes when available; otherwise
  use the last order anniversary as a low-confidence candidate and require human review.
- **Planning window:** default recommendation is 6–10 weeks before the likely need, but
  the actual window depends on product, decoration, packaging, quantity, and event date.
- **High value:** `key_account=true` or spend above a threshold Ryan/Kenny approves after
  distribution review. No threshold is approved yet.
- **Primary segment precedence:** `high_value` → `seasonal_reorder` → `recent_buyer` →
  `lapsed`. Suppressed contacts receive no primary campaign segment.

## Import templates

- `templates/qb-customer-import-template.csv`
- `templates/qb-order-import-template.csv`

They contain headers plus one row labeled `SYNTHETIC_EXAMPLE`; delete the example before
loading approved data. The workbook contains matching import layouts.

## Minimum data-quality gate for a Mailchimp pilot

- stable customer ID;
- reviewed organization/contact identity;
- valid email;
- `marketing_permission=subscribed`;
- permission source recorded;
- `do_not_contact=false`;
- owner assigned;
- last order date and summary verified for any personalized reference;
- segment and campaign timing reviewed;
- no unresolved customer merge;
- final suppression check completed the day of upload.
