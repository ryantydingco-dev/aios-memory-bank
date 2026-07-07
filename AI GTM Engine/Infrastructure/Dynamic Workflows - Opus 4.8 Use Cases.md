# Dynamic Workflows - Opus 4.8 Use Cases

Video: https://www.youtube.com/watch?v=-tLlZqrXpo8&t=66s
Anthropic reference: https://www.anthropic.com/news/claude-opus-4-8

## Core Concept
Dynamic workflows in Claude Code are for very large, wide-scope tasks where one agent would either miss details or require many sequential passes.

The workflow feature lets Claude Code decompose the task, create multiple agent teams, assign work across files/documents/data sources, cross-check findings, and synthesize a final output.

The video's example: a due diligence report across 70+ documents using 50+ agents in roughly 20-30 minutes. A deeper pass used 51 agents and ~3.2M tokens.

## Invocation Patterns

### Slash command
```text
/workflows [scope/task]
```

### Natural language trigger
Use the word `workflow` explicitly:
```text
Build a workflow that reads every file in this folder, flags risks, has another agent refute each finding, and returns only confirmed issues with evidence.
```

The creator says Opus may sometimes auto-select workflows when the task obviously fits, but the reliable trigger is saying `Build a workflow...`.

## When To Use
Use dynamic workflows when the task is:
- large-scale
- file/document heavy
- parallelizable
- evidence-based
- worth token spend
- has a clear beginning, middle, and end
- needs verification/cross-checking

Good pattern:
```text
many inputs -> many specialist passes -> adversarial verification -> final synthesis
```

Bad pattern:
```text
one small task -> 50 agents -> token bonfire
```

## What Makes It Different From Normal Agents
Normal agent/team patterns often require multiple runs. Dynamic workflows appear designed to create a compressed multi-agent execution plan in one larger operation:
- define scope
- decide how many agents are needed
- assign subtasks
- create a rough Kanban-like state: todo / in progress / done
- cross-check or refute findings
- synthesize final report

The important part is not "many agents." The important part is `many agents + validation + synthesis`.

## Cost / Token Reality
This is not for cheap everyday tasks.

Video examples:
- 70+ document diligence report: 20-30 minutes
- deeper data-room pass: 51 agents, ~23 minutes, ~3.2M tokens
- one agent team can cost ~250k-300k tokens depending on scope

Use only when the output saves hours/days of human work or meaningfully reduces risk.

## Use Cases For Ryan / AIOS

### 1. AIOS Memory Bank Audit
Prompt:
```text
Build a workflow that audits every markdown file in this AIOS Memory Bank, identifies duplicate strategy docs, stale plans, contradictions, and missing indexes. Have a second agent refute each finding. Return a prioritized cleanup plan with exact file paths and recommended merges.
```

Value:
Turns the Memory Bank from a growing vault into a cleaner operating system.

### 2. Oloxa GTM Brain Audit
Prompt:
```text
Build a workflow that reads every Oloxa GTM document in this folder, extracts ICP assumptions, positioning claims, outreach lessons, objections, proof points, and next actions. Cross-check contradictions and return a single GTM operating brief with evidence links to source files.
```

Value:
Creates a living GTM brain instead of scattered docs.

### 3. Lead Batch Quality Review
Prompt:
```text
Build a workflow that reviews every lead CSV in this folder, checks whether each lead matches our ICP, flags weak or duplicate leads, verifies evidence fields, and returns a ranked outreach-ready list with reasons. Have another agent challenge each HIGH score before final inclusion.
```

Value:
Better daily lead quality and less outreach waste.

### 4. Local Business Sprint Review
Prompt:
```text
Build a workflow that reviews all local-business sprint files, postcard lists, scripts, call notes, SMS replies, and audit outcomes. Identify which niches, openers, CTAs, and proof assets are producing responses. Return a 7-day action plan to get the next paid client.
```

Value:
Turns messy local outreach into a learning loop.

### 5. Content System Audit
Prompt:
```text
Build a workflow that analyzes every creator teardown and Ryan content strategy note, extracts repeatable formats, hooks, visual patterns, free artifact ideas, and brand rules. Deduplicate the advice and return a 30-day content production system.
```

Value:
Converts learning into execution.

### 6. Creator Video Corpus Analysis
Prompt:
```text
Build a workflow that reads all transcripts and visual teardown docs for the creators in this folder, clusters their strongest patterns, identifies which are relevant to Ryan, and outputs 20 content ideas with hook, proof asset, visual gag, and CTA.
```

Value:
Turns creator study into usable posts/videos.

### 7. Software / Hermes Repo Audit
Prompt:
```text
Build a workflow that audits every file under src for error handling gaps, duplicate logic, fragile assumptions, and security-sensitive code. Have a second agent refute each finding and return only confirmed issues with file path, line number, severity, and recommended fix.
```

Value:
Useful for large codebase QA before making changes.

### 8. Compliance / Policy Review
Prompt:
```text
Build a workflow that checks every policy/process doc in this folder against the standard in compliance-standard.md, flags gaps, has another agent refute false positives, and returns a ranked remediation list.
```

Value:
Good for regulated workflows or internal SOP cleanup.

## Ryan Rule Of Thumb
Use dynamic workflows when you would otherwise say:
- "This is too much for one pass."
- "We need to inspect every file/document."
- "I need a report with evidence, not vibes."
- "False positives are expensive."
- "This would take me half a day or more manually."

Do not use when:
- the task is small
- the output does not need cross-checking
- a normal grep/script/single agent pass is enough
- token cost would exceed value

## Best Prompt Skeleton
```text
Build a workflow that [inspects/analyzes/audits] every [file/document/row/site] in [folder/list].

Goal:
[desired business outcome]

Look for:
- [criterion 1]
- [criterion 2]
- [criterion 3]

For every finding:
- cite exact source/file/row
- explain why it matters
- assign severity/priority
- have another agent try to refute it
- include only confirmed findings

Final output:
- executive summary
- prioritized findings
- evidence table
- recommended next actions
- files/rows requiring human review
```
