# Dynamic Workflows Money Sprint Prompt Pack

## Purpose
Ryan is on Claude Max and wants to use Claude Code dynamic workflows today to get a lot done and set up a path to make money this month.

## Recommended Execution Order
1. Local Business Sprint Control Tower
2. Owner Phone / Text Queue Quality Audit
3. Offer + Audit Asset Factory
4. 7-Day Execution Calendar
5. Content-to-Cash System
6. Oloxa GTM Brain Audit, if time remains

## General Claude Code Setup
Run these from the AIOS Memory Bank root when possible:

```bash
cd "/Users/ryantydingco/Documents/AIOS-Memory-Bank"
claude
```

Then paste one prompt at a time.

For dynamic workflows, use:
```text
Build a workflow that...
```

Guardrail to include in prompts:
```text
Do not delete or overwrite source files. Write outputs as new markdown/CSV files. Cite exact file paths and rows wherever possible.
```

---

# Prompt 1 — Local Business Sprint Control Tower

```text
Build a workflow that audits every file related to the local-business / OpenClaw / postcard / Lead411 / cold SMS sprint inside:

/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine
/Users/ryantydingco/Documents/AIOS/aios-starter-kit

Goal:
Create a practical 30-day revenue control tower for Ryan to close 1-3 paid local business clients this month.

Look for:
- postcard campaign assets/lists
- local business CSVs
- Ask Maps / Google profile scoring files
- Lead411 / owner phone enrichment files
- call scripts, SMS scripts, offer docs, audit docs
- existing sales scripts and Hormozi/Ask Maps playbooks
- contradictions, stale recommendations, duplicate files, and missing next steps

For every important finding:
- cite exact file path
- summarize what it says
- explain whether it helps Ryan make money this month
- mark actionability: HIGH / MEDIUM / LOW
- have another agent challenge whether the recommendation is actually useful or just busywork

Final output:
Create a new folder:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Revenue Sprint Control Tower

Inside it, write:
1. 00 - Revenue Sprint Dashboard.md
2. 01 - Best Current Offer.md
3. 02 - Daily Call Text Operating Rhythm.md
4. 03 - Top Assets And Files Index.md
5. 04 - What To Ignore For Now.md
6. 05 - Next 72 Hours.md

Do not delete or overwrite source files. Write only new markdown files.
```

---

# Prompt 2 — Owner Phone + Text Queue Quality Audit

```text
Build a workflow that reviews and improves Ryan's local-business call/text queue using these files:

/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/Manual_Text_Call_Queue_Top_50.csv
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/Local_Google_Calls_Sprint_Top_100_Dial_List.csv

Goal:
Create the highest-probability manual text/call queue for Ryan to start outreach today.

Tasks:
- inspect all rows
- identify the best 25 to contact first
- prioritize owner/co-owner/founder/GM/office manager/director of operations titles
- prioritize Chapin/Lexington/Irmo/Columbia/Lake Murray proximity
- prioritize businesses where the Google/GBP issue is concrete and easy to explain
- downgrade weird/low-fit industries that do not match the local service-business sprint
- check for duplicate companies or weak contacts
- rewrite SMS openers so they sound human, local, specific, and not scammy
- rewrite call openers for decision-maker routing
- create an owner-phone enrichment checklist per lead

Have another agent challenge each top-25 inclusion and remove weak picks.

Final output:
Write a new CSV:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/Manual_Text_Call_Queue_Best_25_Today.csv

Columns:
rank,company_name,city,state,decision_maker_name,decision_maker_title,public_phone,email,linkedin,website,specific_issue,why_top_25,manual_sms_opener,followup_sms,call_opener,owner_mobile_needed,owner_mobile,owner_mobile_source,owner_mobile_confidence,status,next_action

Also write:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Best 25 Today - Outreach Notes.md

Do not invent phone numbers. Leave owner_mobile blank if unknown.
```

---

# Prompt 3 — Offer + Audit Asset Factory

```text
Build a workflow that creates Ryan's local-business sales assets for the 30-day sprint.

Read:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine
/Users/ryantydingco/Documents/AIOS/aios-starter-kit/reference

Goal:
Create a complete, usable offer + audit package Ryan can use to sell a Local Google Calls Sprint this month.

The package should be built around:
- high-ticket local service businesses near Chapin/Lake Murray
- Google profile/reviews/website trust gaps
- missed calls and slow follow-up
- simple landing page/profile improvements
- fast 30-day implementation
- price: $497 setup + $497/mo, with backup option of $497 setup including first 30 days

Produce:
1. one-page offer doc
2. 60-second audit script
3. 15-minute sales call script
4. objection handling doc
5. text reply playbook
6. audit scorecard checklist
7. simple close/invoice checklist
8. before/after case-study template

Have another agent critique the package for:
- sounding too vague
- being too hard to deliver
- weak CTA
- weak urgency
- too much AI jargon
- not enough money/business outcome language

Final output folder:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Revenue Sprint Sales Assets

Write each asset as a separate markdown file.
```

---

# Prompt 4 — 7-Day Money Sprint Calendar

```text
Build a workflow that turns Ryan's current local-business sprint files into a day-by-day execution calendar for the next 7 days.

Read:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine

Goal:
Give Ryan a realistic execution schedule to get paid conversations this week.

Constraints:
- Ryan is doing manual texting/calling from a second phone number
- focus on speed to revenue, not perfect automation
- use existing postcard context
- avoid generic marketing agency positioning
- do not overbuild before outreach

Calendar must include:
- daily targets for enrichment, texts, calls, voicemails, audits sent, calls booked
- exact morning/afternoon/evening blocks
- what files to open each day
- what to track
- stop/go decision rules
- what to change if replies are low
- what to do if someone replies positively
- what to do if someone asks price

Have another agent challenge the plan for unrealistic workload and remove busywork.

Final output:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine/7-Day Local Revenue Sprint Calendar.md
```

---

# Prompt 5 — Content-to-Cash System

```text
Build a workflow that reads Ryan's creator teardown docs, Higgsfield docs, local-business sprint docs, and Oloxa GTM docs to create a content-to-cash system for this month.

Read:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Inbound
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Lead Engine

Goal:
Turn Ryan's real business experiments into authority-building content that can also generate leads.

Extract:
- strongest creator patterns Ryan liked
- proof-on-screen content formats
- Higgsfield visual metaphor ideas
- local-business sprint lessons
- Oloxa GTM lessons
- free artifact ideas

Build:
1. 14-day LinkedIn posting plan
2. 10 short-form video scripts
3. 5 Higgsfield visual prompts
4. 5 free artifacts/templates to give away
5. a repeatable content production workflow
6. a CTA system that routes interested people to local-business audit / AI workflow audit / Oloxa conversation

Have another agent critique each content idea for:
- too generic
- too guru-ish
- not enough proof
- not enough useful free value
- not enough Ryan voice/humor

Final output folder:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Inbound/Content To Cash Sprint

Write each output as markdown.
```

---

# Prompt 6 — Oloxa GTM Brain Audit

```text
Build a workflow that audits every Oloxa-related GTM document in the AIOS Memory Bank and produces a single money-focused GTM brief.

Read:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine

Goal:
Create a current source-of-truth for Oloxa GTM execution this month.

Extract and reconcile:
- ICP definition
- positioning
- strongest pain language
- proof points
- best outreach openers
- current lead sources
- Ryan/Sway daily workflow
- objections
- conversion assets needed
- what to ignore for now

Have another agent challenge the brief for contradictions and stale assumptions.

Final output:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Oloxa Current GTM Brief - Dynamic Workflow.md

Also output:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Oloxa Next 7 Days - Revenue Actions.md
```

---

# Prompt 7 — AIOS Infrastructure Cleanup For Revenue

```text
Build a workflow that audits the AIOS Memory Bank for revenue-critical organization issues.

Read:
/Users/ryantydingco/Documents/AIOS-Memory-Bank

Goal:
Make it easier for Ryan and AI agents to find the right files, prompts, scripts, and GTM assets when executing revenue work this month.

Find:
- duplicate docs
- stale plans
- missing dashboards/indexes
- assets not linked from dashboards
- unclear folder structure
- files that should be archived or ignored
- revenue-critical docs that need to be surfaced

Have another agent challenge each cleanup recommendation and only keep changes that improve execution speed this month.

Final output:
/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Infrastructure/AIOS Revenue Infrastructure Cleanup Plan.md

Do not move/delete files automatically. Produce a plan first.
```

## Best Today Sequence
If Ryan wants maximum money progress today:
1. Run Prompt 2 first to get the Best 25 queue.
2. Run Prompt 3 while Ryan enriches/gets numbers.
3. Run Prompt 4 to create the next 7-day schedule.
4. Execute outreach manually.
5. Run Prompt 1 or 5 later once replies/notes exist.

## Rule
Dynamic workflows should create execution leverage, not more dashboards. If a workflow does not produce a file Ryan can use today, it is probably too abstract.
