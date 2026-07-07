# Video Teardown - 10 Hermes Agent Hacks For 24-7 Assistant

Source: https://www.youtube.com/watch?v=FpIvl6b4tRo  
Created: 2026-06-01

## Big idea

Hermes stops feeling like a chat app when it is connected to workflow state, time-based jobs, event triggers, reusable skills, task boards, and specialist agents.

The durable lesson: do not just prompt Hermes manually. Design the workflows around Hermes so it knows what to do when time passes or when something changes.

## The 10 hacks

1. **Mission control**  
   A visible dashboard for active work, blockers, approvals, agent tasks, and changes since yesterday.

2. **Workflow-state triggers**  
   Example: moving a Notion idea to “to film” triggers Hermes to create a filming brief.

3. **Cron jobs**  
   Time-based jobs that make Hermes start the conversation: daily AI story, X posts to quote, competitor outliers, weekly stuck-pipeline audit.

4. **Slashgoal / objective-based prompting**  
   Use outcome + sources + constraints + deliverable + stopping condition instead of vague prompts.

5. **Subagents as research teams**  
   Split research across specialized workers, then synthesize one final recommendation.

6. **Telegram topics as workspaces**  
   Separate YouTube, coding, research, reactions, and general ops so context does not blend into soup.

7. **Kanban for agent task management**  
   Track what is ready, running, done, blocked, and assigned to whom/which agent.

8. **Skills as reusable SOPs**  
   Turn any repeated workflow into a skill. If you explain it twice, it probably deserves a skill.

9. **Webhooks and event-based agents**  
   Cron jobs run when the clock changes. Webhooks run when the world changes: new lead, PR opened, meeting transcript generated, keyword trending, competitor post published.

10. **Separate agents by job**  
    Different agents need different models, memory, tools, and permissions. Do not let your dentist fly your plane.

## What this means for Ryan

This is directly relevant to the Dealthreads first-money loop.

The current money workflow should become:

```text
Target found → teardown artifact created → Loom needed → message sent → reply received → call booked → beta install → weekly learning logged
```

Hermes should react to state changes in that workflow.

## Highest-value Dealthreads automations

### 1. Daily Money Brief cron

Every morning:

- top 5 follow-ups due
- teardowns waiting on Loom
- warm replies needing response
- top 3 new targets
- yesterday’s objection pattern
- one recommended money action

### 2. Teardown status trigger

When a prospect moves to `READY_FOR_TEARDDOWN`:

- generate Dead Form Audit
- generate buyer-profile mockup
- generate Loom script
- generate LinkedIn/email opener

### 3. Reply received trigger

When Ryan logs a reply:

- classify reply type
- draft response
- update status
- log objection
- suggest next action

### 4. Weekly GTM learning cron

Every Friday:

- summarize sent messages
- response patterns
- best-performing angles
- dead segments
- next-week experiment

### 5. Beta install checklist skill

When a prospect says yes:

- ask for form URL, CRM, fields, access
- create install checklist
- define test lead path
- create review criteria

## What not to overbuild yet

- Full mission control dashboard
- Huge agent pantheon
- complex client portal
- automated sending without review
- too many Slack/Notion integrations before real usage

First create the manual workflow and state labels. Automate only after the states are real.

## Suggested Dealthreads state labels

```text
TARGET_FOUND
READY_FOR_TEARDDOWN
TEARDOWN_CREATED
LOOM_NEEDED
LOOM_SENT
MESSAGE_SENT
REPLIED_INTERESTED
REPLIED_NOT_NOW
CALL_BOOKED
BETA_INSTALL
CLOSED_LOST
CLIENT_ACTIVE
```

## Content idea for Ryan

> Most people use AI like a chat app.
> 
> The unlock is making it react to workflow state.
> 
> If a prospect moves to “ready for teardown,” AI should create the audit.
> If a reply comes in, AI should classify the objection.
> If Friday hits, AI should summarize what worked.
> 
> The goal is not more prompts.
> The goal is fewer dead zones where work waits for you to remember it exists.

## One-line lesson

Hermes becomes a 24/7 assistant when it is connected to state changes, scheduled checks, reusable skills, visible tasks, and specialist agents.
