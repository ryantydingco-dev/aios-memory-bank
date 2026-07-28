# Deal Threads Outbound Command Center

Last updated: 2026-06-02  
Purpose: one place to run the outbound machine every day.

> **Legacy command center:** this operates the older multi-vertical dead-form outbound machine. The active revenue-conversion source of truth is [`dealthreads-gtm-agent-repositioning/00 - REVENUE EXECUTION.md`](../dealthreads-gtm-agent-repositioning/00%20-%20REVENUE%20EXECUTION.md), scoped only to specialized staffing/recruiting firms and current interested replies. Do not use this older queue to expand verticals while warm staffing replies are open.

## What This Is

This is the execution layer for Deal Threads outbound.

The goal is not to send more cold messages.

The goal is to create a repeatable system that turns weak forms into useful teardowns, then teardowns into install calls.

## Open These First

1. [Outbound Machine Blueprint](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/Deal Threads Outbound Machine Blueprint.md:1>)
2. [30-Day Outbound Sprint](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/Deal Threads 30-Day Outbound Sprint.md:1>)
3. [90-Day First Client Plan](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/Deal Threads 90-Day First Client Plan.md:1>)
4. [Project Intake Teardown Grand Slam Offer](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Offers/Deal Threads Project Intake Teardown Grand Slam Offer.md:1>)
5. [Message Library](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/Message Library.md:1>)
6. [LinkedIn Openers](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/LinkedIn Openers.md:1>)
7. [Follow-Up Library](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/Follow-Up Library.md:1>)
8. [Reply Router](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/Deal Threads Reply Router.md:1>)
9. [Automation SOP](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Outreach/Deal Threads Automation SOP.md:1>)
10. [Dead Form Teardown Template](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Conversion/Deal Threads Dead Form Teardown Template.md:1>)
11. [Objection And Trust Pack](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Conversion/Deal Threads Objection And Trust Pack.md:1>)

Workbook:

[Deal Threads Outbound Machine Workbook.xlsx](</Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/outputs/deal_threads_outbound_machine/Deal Threads Outbound Machine Workbook.xlsx>)

## Daily Command

```bash
python3 'Operations/scripts/deal_threads_build_send_board.py' \
  --targets 'Lead Engine/DealThreads_Targets_Template.csv' \
  --limit 10
```

## Daily 90-Minute Game Plan

### 15 Minutes: Build Queue

- add 10 new target companies.
- score fit.
- mark teardown priority.
- run the send board script.

### 25 Minutes: Send First Touches

- send 10 messages from the send board.
- use LinkedIn first for Tier 1 accounts.
- log every send.

### 20 Minutes: Follow Up

- send all due follow-ups.
- reply to any engaged prospects.
- mark objections.

### 25 Minutes: Produce Proof

- build one teardown.
- deliver any promised teardown.
- ask teardown viewers for install mapping.

### 5 Minutes: Scoreboard

- update sends.
- update replies.
- update teardown yeses.
- choose tomorrow's bottleneck.

## The Default CTA

```text
I looked at your quote/contact intake and noticed it captures the lead, but probably still leaves sales figuring out the actual project profile manually.

Want me to send over a quick intake teardown?
```

## Weekly Review

Every Friday, answer:

1. Which segment replied most?
2. Which opener got replies?
3. Which objection repeated?
4. Which teardowns converted to install calls?
5. Which target filter should get stricter?
6. Which proof asset should be built next?

## Done Means

The outbound machine is working when:

- daily queue can be generated with one command.
- every send has copy and a log command.
- every reply has a router response.
- every teardown has a template.
- daily tasks are clear.
- weekly metrics show what to improve.
