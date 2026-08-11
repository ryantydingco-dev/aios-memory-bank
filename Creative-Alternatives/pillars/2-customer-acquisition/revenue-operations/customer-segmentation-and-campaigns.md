# Customer segmentation and 90-day Mailchimp operating plan

> Planning window: **2026-08-03 through 2026-10-31**. Every campaign remains `DRAFT`.
> Dates are proposed working dates, not sends. Mailchimp connection, audience upload,
> consent basis, final copy, and sending all require approval.

## Selection order

Contacts can qualify for more than one flag. Use this precedence for the primary campaign
segment so one person does not receive overlapping messages:

1. `high_value`
2. `seasonal_reorder`
3. `recent_buyer`
4. `lapsed`

Apply suppressions first: `do_not_contact=true`, `unsubscribed`, `transactional_only`,
`unknown` permission, invalid email, unresolved duplicate, active complaint, sensitive
account hold, or owner hold.

## Four segment definitions

| Segment | Draft rule | Buyer outcome | Best CTA | Owner review |
|---|---|---|---|---|
| **Recent buyers** | Last fulfilled/invoiced order within 365 days; not currently high-value or in an active reorder window | Make the next moment easier using known specs and lessons from the last order | “What are you planning next?” | Verify delivery satisfaction, order summary, and no open issue |
| **Seasonal/reorder candidates** | Expected order or event planning window is within 70 days; medium/high timing confidence | Avoid the last-minute scramble; preserve approved art/specs and work backward from the date | “Same direction or a few fresh options?” | Verify event date, prior product, production feasibility, and account owner |
| **High-value accounts** | Human-marked key account or spend above an approved threshold; threshold currently `[CONFIRM]` | Give the account a simple annual merchandise plan with proactive service | “Can we map the next 2–3 moments?” | Account owner personally reviews copy, relationship context, and offers |
| **Lapsed customers** | Last order more than 365 days ago; no active opportunity; permission explicitly reviewed | Reopen the relationship without assuming need; make a repeat or new direction easy | “Still the right person, and is anything coming up?” | Verify identity, consent, prior history, and whether a personal call is better |

### Required campaign tags/fields

- `ca_segment`
- `ca_account_owner`
- `ca_last_order_date`
- `ca_primary_product_category`
- `ca_next_expected_order_date`
- `ca_reorder_confidence`
- `ca_marketing_permission`
- `ca_campaign_id`

Do not upload revenue, free-text notes, A/R status, or internal relationship commentary to
Mailchimp unless Ryan/Maclaine explicitly approves a need.

## Frequency and suppression rules

- Maximum **two marketing messages in 30 days per contact** across these campaigns.
- High-value contacts receive owner-led communication; avoid broad campaign cadence.
- A reply, quote request, complaint, unsubscribe, or active sales conversation removes
  the contact from automated follow-up.
- Do not use opens as a decision trigger. Use replies, confirmed clicks, quote requests,
  orders, and human notes.
- Transactional updates and A/R messages are separate from marketing and never mixed into
  this calendar.
- Send only during staffed periods when same-business-day reply handling is possible.
- Final selection is rebuilt from fresh source data and suppression status on send day.

## 90-day calendar

| Draft date | Campaign ID | Primary segment | Buyer moment / concept | Subject-line direction | CTA | Follow-up rule | Human approval point |
|---|---|---|---|---|---|---|---|
| Aug 4 | `MC-2026-08-HV-PLAN` | High value | 15-minute annual merchandise map: next events, staff moments, gifting, reorders | Personal, account-specific: “planning the next few [Account] moments” | Reply with 2–3 upcoming dates | Owner follows personally within 1 business day; no automation | Account owner approves each recipient and every historical reference |
| Aug 11 | `MC-2026-08-RECENT-NEXT` | Recent buyers | Post-order planning check: reuse approved art/specs and improve the next run | Service-led: “what’s next after [recent program]?” | Reply with next date or use case | Click/no reply receives no chase; reply creates tracker action | Confirm last order was delivered satisfactorily and no support issue is open |
| Aug 18 | `MC-2026-08-REORDER-FALL` | Seasonal/reorder | Fall event/reorder planning, 6–10 weeks ahead | Timing-led: “[Account]’s fall order — same or fresh?” | Confirm “same,” “fresh ideas,” or “not this year” | “Same/fresh” becomes owner follow-up; “not this year” updates timing | Verify timing, prior item, capability, and no conflicting order |
| Aug 25 | `MC-2026-08-LAPSED-CHECKIN` | Lapsed | Respectful relationship check; confirm contact and current needs | Plain and personal: “still the right person at [Account]?” | Reply yes/no and next moment | One personal reply only; non-response stays quiet for 45+ days | Consent, identity, and relationship sensitivity reviewed row by row |
| Sep 2 | `MC-2026-09-SEASON-USEFUL` | Seasonal/reorder | Useful everyday fall merchandise: staff layers, durable drinkware, practical bags | Outcome-led: “useful gear for [event/team], not giveaway clutter” | Ask for audience, date, and quantity | Qualified reply receives a curated 3-option brief, not a catalog | Kenny approves feasible categories and any sustainability language |
| Sep 10 | `MC-2026-09-RECENT-PACKAGING` | Recent buyers | Personalization and packaging that makes recognition/gifting feel intentional | Experience-led: “a more personal way to deliver the next order” | Choose personalized names, note cards, or simple packaging | Reply becomes scoping task; no offer/pricing sent automatically | Packaging capability, minimums, lead time, and cost reviewed |
| Sep 17 | `MC-2026-09-HV-Q4` | High value | Q4 planning session for client gifts, recognition, or year-end events | Personal planning: “[Account]’s Q4 merchandise plan” | Book/reply with dates and recipient count | Owner follows within one business day | Recipient list, gift policy, budget, shipping, and claims reviewed |
| Sep 24 | `MC-2026-09-REORDER-EVENT` | Seasonal/reorder | Conference/trade-show readiness: staff apparel + useful attendee item + delivery plan | Deadline-led without false urgency: “working backward from [event]” | Share event date, booth/staff count, ship destination | Create opportunity only after human qualification | Confirm event date, delivery feasibility, and no unapproved guarantee |
| Oct 1 | `MC-2026-10-LAPSED-VALUE` | Lapsed | Win-back through a useful offer: rebuild an old reorder or curate a tighter modern set | Low-pressure: “should we keep [Account]’s old specs on file?” | Keep, update, or close the loop | Respect “close” immediately; one owner follow-up for positive replies | History and permission rechecked; no unsupported “we remember” claim |
| Oct 8 | `MC-2026-10-HV-GIFT` | High value | Thoughtful client/employee gifting: useful item, personal note, considered packaging | Recipient-led: “a gift people at [Account] will actually use” | Reply with audience, quantity, and delivery window | Owner produces 2–3 directions after budget/date discovery | Gift rules, addresses, privacy, packaging, and fulfillment approved |
| Oct 15 | `MC-2026-10-SEASON-DRINK` | Seasonal/reorder | Drinkware as a durable daily-use program, selected for context and quality | Use-case-led: “drinkware for desks, commutes, or the field?” | Pick use context; receive curated options | Reply becomes curated recommendation task | Brand/model availability, decoration, sustainability claims reviewed |
| Oct 22 | `MC-2026-10-RECENT-RECOG` | Recent buyers | Employee/volunteer recognition moments without a one-size-fits-all catalog | Recognition-led: “who should feel appreciated next?” | Share moment, audience, quantity | Human follows with package direction | Verify contact role and appropriateness of recognition use case |
| Oct 29 | `MC-2026-10-PLAN-AHEAD` | Permissioned, segmented | Plan-ahead checkpoint for year-end and early-2027 moments; content varies by segment | Planning-led: “the dates worth putting on the merchandise calendar” | Reply with next 1–3 dates | Responses create next actions; non-responses are not chased | Final frequency-cap, suppression, capacity, and calendar review |

## Campaign build checklist

For every draft:

1. Query one primary segment from a fresh, approved dataset.
2. Apply permission and owner holds.
3. Remove contacts with open opportunities or unresolved service issues.
4. Review every personalized fact against QuickBooks/order evidence.
5. Check the 30-day frequency cap across campaigns.
6. Assign a `campaign_id` and a single primary goal.
7. Select the matching template from `mailchimp-email-templates.md`.
8. Replace catalog language with a buyer moment, 2–3 relevant product directions at most,
   and one CTA.
9. Approve subject, preheader, body, links, claims, segment count, and send time.
10. Export a local approval snapshot before any later Mailchimp upload.

## Follow-up and measurement

| Signal | Action | Tracker update |
|---|---|---|
| Direct reply / call | Human responds same business day | stage, next action, owner, source campaign |
| Quote request | Discovery first if date/quantity/budget missing; quote through Kenny | `quote_requested`, expected value, probability |
| Click without reply | No automatic sales chase; may enter future relevant content segment | campaign engagement note only |
| Unsubscribe / complaint | Suppress immediately | permission + suppression evidence |
| Order | Reconcile to QuickBooks ID/invoice | won date, order value, campaign attribution |
| No response | Respect frequency cap; return to next relevant moment | no invented outcome |

Core success metrics: replies, qualified conversations, quote requests, quoted value,
orders, reorders, reconciled revenue, loss reason, and time-to-next-action.
