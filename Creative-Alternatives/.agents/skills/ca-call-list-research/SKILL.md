---
name: ca-call-list-research
description: Build and verify source-backed Creative Alternatives cold-call lists for Salesfinity. Use when Ryan asks for call prospects, a Salesfinity list, prospect research, reasons to call, or a call-ready queue. Does not upload, dial, or contact anyone.
---

# CA Call List Research

Create a call-ready queue, not a generic lead dump.

Load:

1. `README.md`
2. `Creative-Alternatives/context/audience.md`
3. `Creative-Alternatives/context/offer.md`
4. `Creative-Alternatives/pillars/2-customer-acquisition/outbound/call-list-agent/AGENT.md`

Use the existing company discovery engine at
`Creative-Alternatives/pillars/2-customer-acquisition/outbound/list-engine/`.

## Outcome

Return a CSV that can be mapped into Salesfinity after human review. Every row marked
`call_ready=yes` must have:

- a verified-fit organization;
- a named buyer with a title relevant to merchandise, events, membership, athletics,
  advancement, operations, marketing, or employee experience;
- a sourced phone number, never a guessed number;
- a source-backed `reason_to_call` tied to a dated trigger or verified recurring buying
  moment;
- a relevant `merch_hypothesis` and a short opener Ryan can say naturally;
- research and source dates;
- suppression status checked against the CA suppress list.

Company fit alone is not a reason to call. “They have employees,” “they run events,”
and “they may need swag” fail verification unless supported by a specific source and
buying moment.

## Batch contract

- Work one lane and one offer at a time.
- Default first lane: schools and attached PTA/PTO/booster organizations using the free
  branded-store wedge.
- Produce batches of 100 verified records until the initial 400-record queue is built.
- Aim for 25 Tier A and 75 Tier B records per batch. Hold Tier C; do not pad the queue.
- Reuse no person, phone, domain, or suppressed account within an active batch.

Tier A has a named buyer plus a dated trigger within 120 days or a dated future event.
Tier B has a named buyer plus a verified recurring/seasonal program with a defensible
current buying window. Tier C is fit-only or has weak evidence and is not call-ready.

## Boundaries

- Draft and research only. Never upload to Salesfinity, dial, email, DM, or change a
  live campaign.
- Never invent names, titles, phone numbers, dates, events, or relationships.
- Do not state that a number is DNC-cleared unless a named suppression source was
  actually checked. Use `unknown` otherwise and hold the record.
- Customers and exclusions in `list-engine/suppress.json` can never be prospects.
- Maclaine owns prices. Use no unapproved kickback, margin, or delivery promise.
- Keep source URLs in the internal CSV; Ryan chooses what to say on the call.

## Verification

Run:

```bash
python3 Creative-Alternatives/pillars/2-customer-acquisition/outbound/call-list-agent/scripts/validate_list.py <csv>
```

Zero validation errors is necessary but not sufficient. Manually spot-check ten random
rows and every Tier A row before labeling a batch ready for Ryan.

