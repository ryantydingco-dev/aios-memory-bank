# Deal Threads Outbound Target CSV Schema

Last updated: 2026-06-02  
Purpose: target CSV format used by `deal_threads_build_send_board.py`.

## Required Columns

| Column | Meaning |
| --- | --- |
| company | Company name. |
| website | Main site. |
| form_url | Demo/contact/pricing form URL. |
| buyer_name | Prospect name, if known. |
| buyer_role | Founder, VP Sales, Head of Growth, RevOps, etc. |
| linkedin_url | Buyer or company LinkedIn URL. |
| segment | Founder-led B2B, RevOps-light, vertical SaaS, agency, cybersecurity, compliance, fintech, MSP, data/analytics. |
| company_size | Estimated employee range. |
| deal_value_guess | Low, medium, high, USD 8K+, USD 25K+, USD 50K+, unknown. |
| crm_guess | HubSpot, Salesforce, Pipedrive, unknown. |
| weak_form_observation | What the form fails to capture. |
| sales_research_hypothesis | What sales probably researches after submit. |
| reason_now | Hiring, growth, paid traffic, launch, form issue, content, sales expansion. |
| fit_score | 1-5. |
| teardown_priority | Teardown first, later, avoid. |
| outreach_status | Not started, sent, replied, teardown requested, teardown sent, call booked, closed, passed. |
| teardown_status | Not started, drafted, sent, install CTA sent, won, lost. |
| next_action | Specific next step. |
| notes | Context, buyer language, objections. |

## Recommended Daily Use

1. Add 10 new rows.
2. Fill the first 15 columns.
3. Run the send board generator.
4. Send only the rows selected in the board.
5. Log outcomes with `deal_threads_log_outcome.py`.

## Lead ID Format

The scripts use this ID:

```text
company::buyer_name
```

If buyer name is missing:

```text
company::buyer
```
