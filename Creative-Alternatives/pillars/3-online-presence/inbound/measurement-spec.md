# Inbound Measurement And CRM Specification

## Objective

Create one trusted chain from acquisition source to qualified lead, quote, customer, revenue, and delivery burden.

```text
Source -> session -> conversion -> contact -> inquiry -> qualification -> deal -> quote -> customer -> revenue
```

Traffic and form volume are diagnostic. Qualified conversations, pipeline, customers, revenue, gross profit when available, and operational fit determine investment.

## Systems of record

- **QuickBooks:** customer, order, invoice, payment, and revenue truth.
- **HubSpot:** new lead, source, lifecycle, sales activity, deal, quote/pipeline linkage, and acquisition outcome.
- **GA4:** website behavior and conversion events.
- **Google Ads:** paid search delivery, search terms, cost, and imported outcomes.
- **Search Console:** organic queries, pages, clicks, impressions, and indexing.
- **Call tracking:** source-linked phone calls where implemented.
- **Google Business Profile:** local visibility and interactions.

HubSpot and QuickBooks must use a stable customer or deal reconciliation key. Email alone is not sufficient for organizations with several contacts.

## Core objects

### Contact

One person. Stores identity, consent, role, organization association, and first/latest attribution.

### Company

One organization. Stores niche, location, website, customer status, and QuickBooks linkage.

### Inbound inquiry

One submitted need or call. Stores service, niche, timing, scope, page, campaign, qualification, owner, and disposition.

If HubSpot cannot support a custom inquiry object, use a clearly named ticket or deal pipeline that does not pollute real sales pipeline before qualification.

### Deal

Created only after human qualification and a credible commercial next step. Stores potential value, service, niche, stage, quote, expected timing, source, and outcome.

## Contact properties

| Internal name | Label | Type | Rule |
|---|---|---|---|
| `ca_first_touch_source` | CA First Touch Source | Single-line text/dropdown | Set once; never overwrite |
| `ca_first_touch_medium` | CA First Touch Medium | Single-line text/dropdown | Set once |
| `ca_first_touch_campaign` | CA First Touch Campaign | Single-line text | Set once |
| `ca_first_touch_term` | CA First Touch Term | Single-line text | Set once when available |
| `ca_first_touch_content` | CA First Touch Content | Single-line text | Set once when available |
| `ca_latest_touch_source` | CA Latest Touch Source | Single-line text/dropdown | Update on new attributable inquiry |
| `ca_latest_touch_medium` | CA Latest Touch Medium | Single-line text/dropdown | Update |
| `ca_latest_touch_campaign` | CA Latest Touch Campaign | Single-line text | Update |
| `ca_latest_touch_term` | CA Latest Touch Term | Single-line text | Update |
| `ca_latest_touch_content` | CA Latest Touch Content | Single-line text | Update |
| `ca_primary_niche` | CA Primary Niche | Dropdown | Human-correctable |
| `ca_buyer_role` | CA Buyer Role | Dropdown/text | Human-correctable |
| `ca_marketing_consent` | CA Marketing Consent | Boolean/date | Separate from inquiry response permission |
| `ca_quickbooks_customer_id` | QuickBooks Customer ID | Single-line text | Set when matched |

## Company properties

| Internal name | Label | Type | Rule |
|---|---|---|---|
| `ca_niche` | CA Niche | Dropdown | Camps, Racquet, Law, Club, School, Corporate, Event, Financial, Youth Sports, Fitness, Construction, Manufacturing, Healthcare, Other |
| `ca_customer_status` | CA Customer Status | Dropdown | Prospect, Active Customer, Reorder Due, Former/Legacy, No Fit |
| `ca_quickbooks_customer_id` | QuickBooks Customer ID | Single-line text | Stable reconciliation key |
| `ca_service_area` | CA Service Area | Dropdown/text | Geography for analysis, not targeting permission |
| `ca_first_customer_date` | First Customer Date | Date | From QuickBooks when available |
| `ca_last_order_date` | Last Order Date | Date | From QuickBooks |
| `ca_lifetime_revenue` | Lifetime Revenue | Currency | From QuickBooks with date/window note |

## Inquiry properties

| Internal name | Label | Type |
|---|---|---|
| `ca_inquiry_id` | Inquiry ID | Unique text |
| `ca_inquiry_date` | Inquiry Date | Date/time |
| `ca_niche` | Niche | Dropdown |
| `ca_service_interest` | Service Interest | Multi-select |
| `ca_offer` | Entry Offer | Dropdown |
| `ca_need_date` | Need Date | Date/text |
| `ca_planning_horizon` | Planning Horizon | Dropdown |
| `ca_quantity_range` | Quantity/Audience Range | Dropdown |
| `ca_budget_range` | Budget Range | Dropdown, only after approval |
| `ca_shipping_model` | Shipping Model | Dropdown |
| `ca_logo_supplied` | Logo Supplied | Boolean |
| `ca_landing_page` | Landing Page | URL/path |
| `ca_referrer` | Referrer | URL/text |
| `ca_gclid` | GCLID | Text |
| `ca_utm_source` | UTM Source | Text |
| `ca_utm_medium` | UTM Medium | Text |
| `ca_utm_campaign` | UTM Campaign | Text |
| `ca_utm_term` | UTM Term | Text |
| `ca_utm_content` | UTM Content | Text |
| `ca_qualification_status` | Qualification Status | Dropdown |
| `ca_no_fit_reason` | No Fit Reason | Dropdown/text |
| `ca_priority_score` | Priority Score | Number |
| `ca_owner` | Owner | HubSpot owner |
| `ca_response_due` | Response Due | Date/time |
| `ca_next_step` | Next Step | Text/date |

## Deal properties

| Internal name | Label | Type |
|---|---|---|
| `ca_originating_inquiry_id` | Originating Inquiry ID | Text |
| `ca_original_source_detail` | Original Source Detail | Text |
| `ca_niche` | Niche | Dropdown |
| `ca_service` | Service | Dropdown |
| `ca_order_model` | Order Model | Bulk, Store, Gifting, Event, Mixed |
| `ca_need_date` | Need Date | Date |
| `ca_estimated_value` | Estimated Value | Currency |
| `ca_quote_value` | Quote Value | Currency |
| `ca_quickbooks_customer_id` | QuickBooks Customer ID | Text |
| `ca_quickbooks_order_invoice_id` | QuickBooks Order/Invoice ID | Text |
| `ca_closed_revenue` | Closed Revenue | Currency |
| `ca_estimated_gross_profit` | Estimated Gross Profit | Currency, only when reliable |
| `ca_delivery_burden` | Delivery Burden | Low, Medium, High |
| `ca_lost_reason_detail` | Lost Reason Detail | Dropdown/text |

## Qualification status

Required values:

- Qualified
- Nurture
- Existing Customer
- Vendor/Partner
- Job Seeker
- Spam
- No Fit

No-fit reasons:

- Single item/consumer
- Unsupported product
- Unsupported fulfillment
- Timing impossible
- Geography/shipping unsupported
- Budget mismatch
- Not decision process/contact
- Duplicate
- Other

## Deal pipeline stages

1. Qualified Inquiry
2. Discovery / Missing Inputs
3. Concept In Progress
4. Concept Delivered
5. Quote Requested
6. Quote Delivered
7. Decision / Follow-Up
8. Closed Won
9. Closed Lost
10. Nurture / Future Season

Do not create a deal for spam, vendors, jobs, single-item consumers, or unreviewed form submissions.

## GA4 event taxonomy

### Diagnostic events

| Event | Trigger | Parameters |
|---|---|---|
| `view_niche_page` | View of dedicated niche page | `ca_niche`, `ca_page_path` |
| `view_resource` | View of a configured resource page | `ca_niche`, `ca_resource_name`, `ca_page_path` |
| `select_service_path` | Bulk/store/gifting/event/rush selection | `ca_niche`, `ca_service`, `ca_page_path`, `ca_placement` |
| `cta_click` | Primary or secondary CTA | `ca_niche`, `ca_offer`, `ca_cta_name`, `ca_page_path`, `ca_placement` |
| `form_start` | First meaningful form interaction | `ca_niche`, `ca_offer`, `ca_form_id`, `ca_page_path` |
| `logo_upload_start` | First change to the logo-upload field | `ca_niche`, `ca_offer`, `ca_form_id`, `ca_page_path` |
| `phone_click` | Click-to-call | `ca_niche`, `ca_page_path`, `ca_placement` |
| `email_click` | Email link click | `ca_niche`, `ca_page_path`, `ca_placement` |
| `resource_download` | Explicitly tagged download or printable asset click | `ca_niche`, `ca_resource_name`, `ca_page_path`, `ca_placement` |
| `form_submit_attempt` | Browser submit event before persistence | `ca_niche`, `ca_offer`, `ca_form_id`, `ca_page_path` |

### Conversion events

| Event | Trigger | Primary? |
|---|---|---:|
| `inquiry_submit` | Valid form submission confirmed as persisted | Secondary until lead quality is known |
| `qualified_inbound_lead` | Human marks inquiry Qualified | Yes |
| `quote_created` | Credible quote created | Yes/value stage |
| `inbound_customer` | Closed-won matched to inbound source | Yes/value stage |
| `inbound_revenue` | Revenue reconciled from QuickBooks | Yes/value stage |

The human qualification and downstream events should be imported into ad platforms where supported. Do not train bidding only on raw form submissions when spam or poor-fit volume is material.

## UTM convention

Use lowercase, hyphenated values.

### Sources

- `google`
- `linkedin`
- `instagram`
- `facebook`
- `youtube`
- `aca`
- `tri-state-camp`
- `partner-[name]`
- `customer-referral`
- `email`

### Mediums

- `cpc`
- `organic`
- `social`
- `email`
- `referral`
- `directory`
- `partner`
- `qr`

### Campaign

`[year]-[niche]-[offer]-[initiative]`

Example: `2027-camps-merch-concept-planning-guide`

### Content

Describe the placement or creative:

- `hero-cta`
- `linkedin-case-study`
- `association-newsletter`
- `search-ad-proof-speed`
- `qr-tradeshow-handout`

## Attribution views

Report at least:

- First-touch source
- Latest-touch source before inquiry
- Self-reported source, when asked
- Originating commercial page
- Assisted content/resource
- Sales-created source notes

Do not force one model to answer every question. First touch explains discovery; latest touch explains conversion; self-reporting can reveal dark social and word of mouth.

## Self-reported attribution

After qualification, ask conversationally:

> How did you first hear about Creative Alternatives?

Values:

- Google search
- Google Maps/Business Profile
- Referral/customer
- Association/directory
- LinkedIn
- Instagram/Facebook
- YouTube/content
- Cold email/LinkedIn outreach
- Event/conference
- Existing relationship
- Other

Do not make this a high-friction required field on the initial form unless testing shows no conversion cost.

## Revenue reconciliation

Monthly:

1. Export or query closed-won inbound deals.
2. Match to QuickBooks customer and invoice/order identifiers.
3. Confirm new vs existing customer.
4. Record first order revenue and, separately, subsequent revenue.
5. Record ad and direct program costs.
6. Calculate CAC only for attributable new customers.
7. Calculate payback and gross-profit return only when cost data is reliable.
8. Flag unmatched or conflicting records for human review.

Because current QuickBooks product-level COGS is unreliable, revenue and pipeline reporting can launch first. Gross-profit optimization remains `[CONFIRM]` until margin tracking is trustworthy.

## Dashboard views

### Executive

- Qualified inbound leads this month
- Quotes and quote value
- New customers
- New-customer revenue
- Existing-customer inbound/reorder revenue
- Spend
- Cost per qualified lead
- CAC when available
- Pipeline by niche and source

### Acquisition

- Sessions and CTA behavior by landing page
- Search queries and paid terms
- Inquiry and qualification rate
- Qualified lead rate by source
- Page conversion by niche
- Cost by source/campaign

### Sales

- New inquiries awaiting review
- Response SLA status
- Deals by stage
- Concepts and quotes due
- Lost/no-fit reasons
- Nurture dates

### Operations

- Leads by requested date
- Service/order model mix
- Delivery burden
- Rush-request volume
- Mockup/concept queue

## Weekly operating review

1. New inquiries and qualification outcomes
2. Qualified opportunities and next steps
3. Search terms and exclusions
4. Page and CTA anomalies
5. Content and partner-assisted leads
6. Quotes, wins, losses, and no-fit reasons
7. Capacity or delivery concerns
8. One experiment decision for the next week

## Data QA

Weekly during launch, then monthly:

- Test one form submission per active page.
- Check event duplication.
- Confirm first-touch fields did not overwrite.
- Confirm UTM and click identifiers persist.
- Confirm spam is not imported as a primary conversion.
- Confirm deals are not created before qualification.
- Confirm won deals match QuickBooks.
- Review `Unknown` source and niche rates.
- Check owner and response-due fields.
- Confirm privacy and consent behavior.

## Local reporting implementation

The workspace includes a privacy-light local KPI warehouse for exported acquisition facts. It stores inquiry, company, deal, campaign, and QuickBooks reconciliation identifiers, but not contact names, email addresses, or phone numbers.

```bash
.venv/bin/python scripts/ca_inbound_metrics.py init
.venv/bin/python scripts/ca_inbound_metrics.py templates
.venv/bin/python scripts/ca_inbound_metrics.py ingest --kind inquiries --file [hubspot-export.csv]
.venv/bin/python scripts/ca_inbound_metrics.py ingest --kind deals --file [deal-export.csv]
.venv/bin/python scripts/ca_inbound_metrics.py ingest --kind spend --file [channel-export.csv]
.venv/bin/python scripts/ca_inbound_metrics.py report --start YYYY-MM-DD --end YYYY-MM-DD
```

Imports are upserts, so the same canonical export can be reprocessed without duplicating records. The report uses the inquiry-date acquisition cohort and flags unknown attribution, overdue first response, and won deals missing QuickBooks reconciliation keys.

## Baseline and targets

Do not invent targets before private analytics and baseline data are available. Capture the first 30 days as a baseline, then set targets for:

- Qualified inbound leads
- Qualified-lead rate
- Response time
- Quote rate
- Close rate
- Pipeline and revenue
- Cost per qualified lead
- CAC
- Delivery burden

Use the camp LTV and business profitability as directional evidence for willingness to invest, not as a substitute for reliable gross-profit and acquisition data.
