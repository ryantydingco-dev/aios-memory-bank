# Deal Threads Revenue Watchdog

Date: 2026-07-26  
Status: product layer implemented in `AI GTM Engine/deal-threads-dev`

## The category

Deal Threads is not a fractional SDR and is not another AI SDR sender.

It is the operating and intelligence layer around a client's outbound infrastructure:

> The system watches the market, works the routine steps, detects revenue leaks, learns from every interaction, and asks the client only for decisions that require judgment.

The client owns the lists, domains, inboxes, CRM data, recordings, and campaign infrastructure. The licensed Deal Threads layer supplies the monitoring, decisions, learning, and continuous QA that keep the machine improving.

## Why this is sticky

Commodity providers sell activity:

- fractional SDRs sell labor;
- AI SDR tools sell automated touches;
- list vendors sell records;
- outbound agencies sell campaign management.

Deal Threads sells controlled execution plus institutional intelligence:

1. Nothing revenue-critical disappears into an inbox or log.
2. Every hot signal and reply receives an explicit next action.
3. Opt-outs stop every channel.
4. Failures retry and become visible decisions when retries are exhausted.
5. Reply handling and task reliability are graded against a rubric.
6. Improvements are proposed with evidence and require approval before production changes.
7. The client receives a daily record of what happened, what is at risk, and what the system learned.

Leaving does not destroy the client's infrastructure. It removes the intelligence layer that keeps the infrastructure monitored and improving. That is an honest retention moat.

## Implemented product surfaces

Protected operator page:

```text
/sdr-ops
```

Protected APIs:

```text
GET  /api/v1/sdr-ops/watchdog
GET  /api/v1/sdr-ops/watchdog?format=markdown
GET  /api/v1/sdr-ops/decisions
POST /api/v1/sdr-ops/decisions/:decisionId/resolve
GET  /api/v1/sdr-ops/learning
GET  /api/v1/sdr-ops/integrity
POST /api/v1/sdr-ops/capture
```

The Revenue Watchdog is also summarized on:

```text
GET /api/v1/health
```

## Revenue Watchdog

The watchdog rolls up:

- buying signals during the current window;
- new replies and positive replies;
- hot prospects and meeting-ready prospects;
- external actions awaiting approval;
- exhausted task retries;
- overdue lead follow-up;
- failed rep alerts;
- failed CRM handoffs;
- opted-out prospects with any remaining open action;
- worker, persistence, and integration health.

It outputs a client-ready Markdown brief and a structured JSON packet.

## Mobile decision queue

Every decision contains:

- severity;
- category;
- a plain-language title;
- why the decision matters;
- the agent's recommendation;
- supporting evidence;
- the underlying entity and inspection link;
- a due time;
- a persistent resolution.

Deterministic decision IDs prevent the same unresolved condition from generating duplicate decisions. Resolving an approval decision can also close the related SDR task so the system does not leave ghost work behind.

## Self-improvement review

The current rubric grades:

1. Reply routing — did a reply create the correct next action?
2. Sequence stop — did all future outbound stop after a reply?
3. Opt-out compliance — did suppression close every channel?
4. Task reliability — did automation avoid exhausting its retry budget?

Failing rubric items generate evidence-backed improvement candidates. The deployment policy is fixed:

> Generate a tested change for operator approval; never mutate live campaigns directly.

The system also flags a positive-reply-to-meeting gap before recommending more top-of-funnel volume.

## Continuous revenue-path QA

Runtime integrity checks cover:

- durable SQLite persistence;
- worker enabled state;
- worker heartbeat freshness;
- exhausted task retries;
- rep-alert delivery;
- CRM handoff delivery;
- cross-channel suppression;
- lead follow-up SLA;
- external action delivery mode.

A failure affects the watchdog headline and creates a decision when intervention is required. Existing automated application tests remain the deeper end-to-end release gate.

## Daily history

The 24/7 worker captures one watchdog snapshot per day, retaining up to 90 snapshots:

- revenue headline;
- signal, reply, decision, failure, and SLA metrics;
- learning grade;
- number of proposed improvements;
- integrity status.

This is the proof layer for weekly client reporting and retention conversations.

## Sales demonstration

The trial's day-two moment should be a real Revenue Watchdog brief on the client's phone:

> Three buyers showed intent overnight. One positive reply is waiting for approval. Two follow-ups are overdue. Every remaining sequence was stopped correctly. The engine graded yesterday's work A and found one calendar-handoff gap.

The verdict call should show:

1. what the system detected;
2. what it prevented from being dropped;
3. what it learned;
4. what improved during the trial;
5. what the client owns forever;
6. what the licensed intelligence layer continues to operate.

## Six-channel production layer

The product now has one event and delivery layer for:

- SmartLead signed replies, engagement, categories, and opt-outs;
- Salesfinity call dispositions, callbacks, suppression, and meetings set;
- Sendr proof-asset views, clicks, and completions;
- Cal.com signed bookings, reschedules, and cancellations;
- HubSpot property readiness plus automatic eligible-lead sync;
- Telegram, Slack, and email morning briefs and urgent alerts.

All incoming events are normalized into the same persisted prospect graph. Duplicate vendor deliveries reuse deterministic event IDs. A reply stops future outreach, an opt-out suppresses all open work, a meeting creates a qualified handoff, and a delivery failure returns to the watchdog as a decision.

Notification deliveries are durable, idempotent, and retried with exponential backoff. The daily brief uses a configured local timezone rather than server time. Urgent alerts use the watchdog's deterministic decision ID so one incident cannot spam every worker cycle.

The internal revenue-loop launcher reuses the existing AIOS credential files without printing values, maps legacy variable names, and can start the worker with HubSpot and Telegram active while leaving external SDR actions in approval mode.

## Remaining activation boundary

The code is production-ready, but four receivers require a stable public HTTPS deployment URL and vendor-specific webhook secrets before the vendors can deliver events. Existing credentials were found for SmartLead, Salesfinity, Sendr, HubSpot, Cal.com, and Telegram; no receiver secrets were present. Slack currently has bot/app credentials but no incoming-webhook URL. The previously recorded Cal.com key should be revalidated because the last live check returned `401`.

Until the public URL, receiver secrets, and Cal.com key are verified, the status page reports those adapters as not ingest-ready. It does not claim external events were received. Approval mode remains the correct default for outbound messages until real replies pass the end-to-end verification gate.
