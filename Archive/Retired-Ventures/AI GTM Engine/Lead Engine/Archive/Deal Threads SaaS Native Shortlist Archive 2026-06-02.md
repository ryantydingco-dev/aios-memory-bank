# Deal Threads 25 Account Shortlist

Last updated: 2026-06-02  
Purpose: first outbound account list for teardown-first outreach.

## How To Use This

1. Open the target CSV: [DealThreads_Targets_Template.csv](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/DealThreads_Targets_Template.csv>).
2. Find a named buyer for each account before sending: VP Revenue, Head of Growth, VP Demand Gen, RevOps, or Sales Enablement.
3. Run the daily send-board command.
4. Send the top 10 manually.
5. Log every touch in the tracker.

## First 10 To Work

These are the current highest-fit accounts selected by the send-board generator:

| Rank | Account | Buyer Role To Find | Demo/Form |
| --- | --- | --- | --- |
| 1 | Dock | Head of Revenue / Growth | https://www.dock.us/demo |
| 2 | Navattic | Head of Growth / Revenue | https://www.navattic.com/demo |
| 3 | Storylane | VP Growth / Revenue Marketing | https://www.storylane.io/request-demo |
| 4 | Sprinto | Head of Growth / Revenue | https://sprinto.com/book-a-demo/ |
| 5 | Common Room | Head of Revenue / Community-Led Growth | https://www.commonroom.io/demo/ |
| 6 | UserGems | VP Demand Generation / RevOps | https://www.usergems.com/contact |
| 7 | Vitally | VP Revenue / Customer Success Ops | https://www.vitally.io/demo-request |
| 8 | Secureframe | VP Revenue / Growth | https://secureframe.com/schedule-demo |
| 9 | Thoropass | VP Sales / Revenue Operations | https://www.thoropass.com/talk-to-an-expert |
| 10 | Cube | VP Sales / Revenue Marketing | https://www.cubesoftware.com/get-a-demo |

## Full 25

| Account | Segment | Buyer Role To Find | Demo/Form |
| --- | --- | --- | --- |
| Dock | Sales enablement | Head of Revenue / Growth | https://www.dock.us/demo |
| Walnut | Interactive demo software | VP Sales / Demand Generation | https://www.walnut.io/ |
| Navattic | Interactive demo software | Head of Growth / Revenue | https://www.navattic.com/demo |
| Storylane | Interactive demo software | VP Growth / Revenue Marketing | https://www.storylane.io/request-demo |
| UserEvidence | Customer evidence | Head of Revenue Marketing / Customer Marketing | https://userevidence.com/platform/evidence/ |
| Common Room | GTM intelligence | Head of Revenue / Community-Led Growth | https://www.commonroom.io/demo/ |
| UserGems | Pipeline generation | VP Demand Generation / RevOps | https://www.usergems.com/contact |
| Dreamdata | B2B attribution | Head of Marketing Ops / RevOps | https://dreamdata.io/request-demo |
| Factors.ai | ABM analytics | Head of Demand Generation | https://www.factors.ai/ |
| Metadata.io | Marketing automation | VP Marketing / Demand Generation | https://metadata.io/platform/ |
| ChurnZero | Customer success SaaS | VP Sales / Revenue Operations | https://churnzero.com/live-demo-of-churnzero/ |
| Planhat | Customer success and services ops | VP Revenue / Professional Services Leader | https://www.planhat.com/applications/psa |
| Vitally | Customer success SaaS | VP Revenue / Customer Success Ops | https://www.vitally.io/demo-request |
| Drata | Security compliance | VP Revenue / Demand Generation | https://drata.com/demo// |
| Secureframe | Security compliance | VP Revenue / Growth | https://secureframe.com/schedule-demo |
| Sprinto | Security compliance | Head of Growth / Revenue | https://sprinto.com/book-a-demo/ |
| Thoropass | Security compliance | VP Sales / Revenue Operations | https://www.thoropass.com/talk-to-an-expert |
| Hyperproof | Compliance operations | VP Revenue / Demand Generation | https://hyperproof.io/request-a-demo/ |
| Cube | FP&A software | VP Sales / Revenue Marketing | https://www.cubesoftware.com/get-a-demo |
| Zip | Procurement software | VP Revenue / Demand Generation | https://zip.com/request-demo |
| Spekit | Sales enablement | VP Revenue / Sales Enablement | https://www.spekit.com/demo-request |
| WorkRamp | LMS and enablement | VP Revenue / Learning Operations | https://www.workramp.com/contact |
| Matik | Presentation automation | VP Sales / Revenue Enablement | https://www.matik.io/learn-more |
| GUIDEcx | Client onboarding software | VP Revenue / Implementation Leader | https://www.guidecx.com/ |
| Appcues | Product adoption software | VP Growth / Product Marketing | https://www.appcues.com/request-demo |

## Qualification Notes

- These are account-level targets, not fully sourced contact records.
- Company-size ranges are directional and should be refined during contact research.
- For pages that block simple automated fetching, verify the form manually before sending.
- The best first message should reference one specific form or handoff observation, not the category in general.

## Daily Command

```bash
python3 'Operations/scripts/deal_threads_build_send_board.py' --targets 'Lead Engine/DealThreads_Targets_Template.csv' --limit 10
```
