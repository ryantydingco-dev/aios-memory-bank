# Grok Bot research — 2026-08-14

> Context: Ryan is considering the $200/mo plan to record himself setting up CA agents on Grok Bot.
> Verified via web search 08-14; product launched in beta 08-11-2026 — expect fast change. Sources at bottom.

## What Grok Bot is
xAI's multi-agent platform (beta, launched Aug 11 2026): multiple specialized agents per user, each with a persistent cloud computer, own memory, agent-to-agent handoffs, work continues with your laptop closed. Three headline capabilities: computer use (operates apps/websites by logging in, plus MCP connectors), multi-tool coordination, and learn-from-demonstration (watch you do a workflow once → reusable routine; capped at 10 min, browser-only recording).

## Pricing reality
- **There is no standalone $200 xAI plan.** $200/mo = **Cursor Ultra** (Grok Bot bundled). $120/seat = Cursor Premium Teams. Included free with **SuperGrok Heavy ($300/mo)**. 7-day free trial (card required).
- Usage allowance is **weekly, unpublished size**, resets Monday. Overage bills at raw model/token cost on a model you don't choose, **no spend cap exists yet**. A heavy day can push the rest of the week onto the meter.
- Launch-week metering was buggy (dashboard/app disagreeing on usage %).

## Pros vs the existing AIOS stack
- Persistent cloud agents that survive laptop shutdown (our stack needs the Mac Studio single-writer for that — which is still not brought up).
- Computer-use on apps with **no API/MCP** (QBO desktop-ish flows, SmartLead UI, Sanmar/vendor portals — genuinely hard for our stack).
- Learn-from-demonstration is a faster on-ramp than writing skills/launchd jobs.
- Great **content material**: new, hot, demo-able — strong Teardown-episode fit.

## Cons vs the existing AIOS stack
- **All bots share one cloud computer and every login** (TechTimes headline criticism). Handing it Gmail/QBO/SmartLead credentials = CA's books and Kenny's customer data on a shared beta machine. Our stack's rule is human-in-the-loop + credentials in secret storage; this violates it out of the box.
- Beta reliability + unpublished weekly limits + uncapped overage = **unbudgetable recurring cost** during a commission-only, $0-income window.
- We already have the substance: memory bank + Claude skills/cron + MCP (Gmail, QBO, SmartLead, Airtable, HubSpot) + reply-watcher + reactivation engine + campaign stack. Grok Bot replaces none of the built pipeline; it would be a parallel system to babysit.
- Learned skills are drafts — you still write decision rules/failure handling. Setup theater ≠ shipped automation.
- Monk Mode rule: **no new tools through Sep 29**. This is the build-trap wearing a camera.

## Verdict (recommended)
1. **Don't subscribe now.** Use the **7-day free trial** and film the whole exploration inside it — the content is identical, the cost is $0, and it fits the 1-hr content block + Wednesday build slot.
2. During the trial, give it **only sandbox/dummy credentials** — never Gmail, QBO, SmartLead, or anything touching CA customer data.
3. Frame the episode as a Teardown: "$200 agent platform vs the free stack I already run my business on" — stronger content than a setup vlog, and honest.
4. Revisit a paid plan **after Sep 29** if the trial showed a concrete CA workflow our stack can't do (most likely candidate: computer-use on no-API vendor portals).

## 2026-08-14 update: Kenny covers the cost — where it's ACTUALLY useful for CA

Budget objection gone. The filter stands: Grok Bot only beats the existing stack where a task is **browser-only / no API / repetitive / currently eats human hours**. Ranked by Time-Saved-Ledger value:

1. **Vendor order-status sweeps (Sanmar, Viking, Diamond, random vendors).** The production exception queue flagged 8 POs past in-hand dates partly because status/tracking lives in vendor portals someone must log into and check. A daily Grok Bot sweep → one status sheet feeding the existing exception queue. This is Kenny's named pain category, pure browser work, and the clearest hours/week win. **Pilot #1.**
2. **SAGE/ASI (ESP) product sourcing + quoting.** The matte-badge sourcing loop is literally this job: search supplier catalogs, compare MOQ/net pricing/production time, pull quote-ready options. Portal-only, no API, hours per quote today. An agent that returns a 3-option comparison per request compresses quote turnaround — which is a REVENUE lever, not just time (faster quotes close more of the inbound/reactivation replies).
3. **SmartLead campaign QA in the UI.** "Verify posted/live, check sequences, confirm send readiness" is an open loop right now for the event-swag campaigns and recurs with every launch. Browser-only checking work — good agent fit, read-only.
4. **Shippo/carrier tracking ↔ order contents (Park Slope problem).** Cross-reference tracking numbers against what actually shipped, flag risk before the customer asks. Read-only browser work across two systems.
5. **Learn-from-demo on Maclaine/Kenny's repetitive flows.** Film one real flow (e.g., order email → QBO PO draft) and let it persist as a routine — this doubles as the content episode and as discovery of what the back office actually repeats.

**Not for Grok Bot (keep on existing stack):** anything sending email to customers/prospects, anything writing to QBO money records, list building/enrichment (AI Ark/Apollo/Clay already do it), the reply-watcher, and the campaign send path. Reasons: shared-cloud-computer credential model + beta reliability + our human-in-the-loop rule.

**Deployment guardrails:** dedicated limited-permission logins per portal where possible (never Ryan's Gmail/QBO master creds); read-only pilots first; every routine's output lands as a sheet/report a human acts on; each shipped routine gets a Time Saved Ledger line with hrs/week. Fits inside the Wednesday build block — the ask block is untouchable.

Sources: eesel review + pricing, MindStudio, TechTimes, kingy.ai, aipricing.guru, ayautomate (all Aug 2026).
