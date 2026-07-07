# Deal Threads Outbound Machine Blueprint

Last updated: 2026-06-02  
Objective: turn outbound into a repeatable, useful, proof-driven system that produces teardown requests, install calls, and beta clients without relying on pure cold pitch volume.

## Executive Summary

Deal Threads outbound should not feel like outbound.

It should feel like a sharp operator noticing a broken handoff and offering a useful teardown.

The wedge:

> Your demo/contact form captures the lead. It does not build the buyer profile sales needs before callback.

The machine:

```text
Find weak form
  -> score fit
  -> send teardown ask
  -> produce quick teardown
  -> deliver buyer-profile preview
  -> ask for install mapping
  -> launch beta
  -> capture proof
  -> convert to paid
```

## North Star

Install mapping calls booked from Dead Form Teardowns.

Supporting metrics:

| Metric | Daily Target | Weekly Target |
| --- | ---: | ---: |
| New targets added | 10 | 50 |
| High-fit targets found | 4 | 20 |
| First touches sent | 10 | 50 |
| Follow-ups sent | 10 | 50 |
| Teardown yes replies | 1 | 5 |
| Teardowns delivered | 1-2 | 5 |
| Install mapping calls booked | 0-1 | 2 |
| Betas started | - | 1 |

## Targeting Thesis

Outbound only works if the account has a visible form problem.

Prioritize accounts where:

- the site has a demo/contact-sales form.
- the company sells high-consideration B2B offers.
- one lead is worth USD 8K+.
- sales follow-up quality affects revenue.
- the current form captures contact info but not buyer context.
- the buyer or founder is reachable.
- HubSpot is likely, visible, or easy to infer.

## Tiering

### Tier 1 - Teardown First

Send a personalized teardown ask and build the teardown if they respond.

Criteria:

- fit score 4-5.
- visible weak form.
- obvious missing context.
- specific reason now.
- reachable founder/GTM/RevOps buyer.

### Tier 2 - Nurture And Comment

Use LinkedIn comments and lighter DMs. Do not spend teardown time yet.

Criteria:

- fit score 3.
- form exists but buyer access or deal value is unclear.
- useful for content examples.

### Tier 3 - Avoid

Do not send.

Criteria:

- B2C.
- low-ticket.
- no sales-led motion.
- no visible form.
- unclear CRM handoff.

## Signal Sources

Use these to find accounts:

1. LinkedIn posts by founders, GTM leaders, RevOps, demand gen, and sales leaders.
2. SaaS directories and category pages.
3. HubSpot partner/client ecosystems.
4. Webflow/Framer/SaaS sites with `Book demo`, `Request demo`, `Talk to sales`, `Contact sales`.
5. Companies running paid traffic to demo/contact pages.
6. RevOps communities where people complain about lead quality, routing, speed-to-lead, or enrichment.
7. B2B agencies and service firms with generic forms.

## The Daily Operating Loop

### Morning - Build The Queue

1. Add 10 target companies.
2. Score fit 1-5.
3. Mark 5 as `teardown first`.
4. Generate the send board.

### Midday - Send

1. Send 10 first touches.
2. Send 10 follow-ups.
3. Comment on 10 ICP posts.
4. Log every sent touch.

### Afternoon - Produce Proof

1. Build or polish 1 teardown.
2. Deliver any promised teardown.
3. Ask for install mapping.
4. Log replies, objections, and meetings.

### End Of Day - Review

1. Count sends, replies, teardown yeses, teardowns delivered, install calls.
2. Pick tomorrow's one bottleneck.
3. Update the workbook.

## Automation Boundary

Automate:

- target scoring.
- daily queue selection.
- copy generation from known fields.
- send board creation.
- outcome tracker seeding.
- daily metrics.
- follow-up reminders.

Do not fully automate:

- scraping without review.
- LinkedIn sending.
- email blasting before deliverability is validated.
- teardown judgment.
- reply handling that could hurt trust.

## Campaign Architecture

### Campaign 1 - Weak Demo Form

Primary buyer: founder, VP Sales, head of growth.  
CTA: "Want the quick teardown?"

### Campaign 2 - CRM Handoff

Primary buyer: RevOps, sales ops, CRM consultant.  
CTA: "Want me to map what the CRM note could include?"

### Campaign 3 - Paid Traffic Waste

Primary buyer: demand gen, growth, founder.  
CTA: "Want the before/after on this landing page form?"

### Campaign 4 - Partner Channel

Primary buyer: HubSpot consultant, RevOps agency, GTM consultant.  
CTA: "Want a partner teardown kit you can use with clients?"

## What Good Looks Like After 30 Days

- 200-300 targets scored.
- 100-150 first touches sent.
- 100+ follow-ups sent.
- 20+ teardown yeses or form URLs.
- 15+ teardowns delivered.
- 6+ install mapping calls.
- 2-5 beta clients live or in setup.
- 1+ proof quote.
- clear message-learning from replies.
