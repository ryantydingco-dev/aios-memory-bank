# LinkedIn Current-Connections Workflow

This workflow finds likely Creative Alternatives buyers inside Ryan's existing LinkedIn connections. It ranks candidates only. It does not research profiles, draft from job titles, send messages, or treat a connection as a warm relationship.

## Why this exists

An existing LinkedIn connection can make an introduction less cold, but it does not create permission to pitch. The first message must use real relationship or profile context and should feel like Ryan is talking to someone he already crossed paths with.

## Priority lanes

1. Camps.
2. Schools, athletics, clubs, squash, racquet, and youth sports.
3. Events and development.
4. Office operations, HR, people, and marketing buyers with a visible merchandise moment.
5. Professional firms and owners only when there is a specific event, onboarding, gifting, store, or brand need.

Title fit alone is not a buying signal. Camps and squash are strongest because CA has real proof there. Broad corporate roles require a current reason to care.

## One-time input

Download LinkedIn's official Connections export and place it at:

`inbound/Connections.csv`

The local input and output folders are gitignored because they may contain personal data.

## Run

From this directory:

```bash
python3 score_connections.py --queue 10
```

Outputs:

- `outbound/ranked.csv`: the full title-based fit scan.
- `outbound/queue-YYYY-MM-DD.md`: the next candidates requiring human review.

Generating a queue does not mark anyone contacted. After Ryan manually sends a reviewed message:

```bash
python3 score_connections.py --mark-sent 'LINKEDIN_PROFILE_URL'
```

## Required review before drafting

For each candidate:

1. Confirm the person still has the listed role and company.
2. Check QuickBooks and CA records. A current or former customer belongs in a customer-aware motion, not prospect outreach.
3. Record how Ryan actually knows them. If he does not remember, say so.
4. Find one current, real signal from their profile, company, or recent post.
5. Decide whether they likely own, influence, or merely sit near merchandise purchasing.
6. Bring the evidence to the LinkedIn assistant for a light-edit message.

## First-message rule

No product pitch, mockup offer, calendar link, automation mention, or fake catch-up language.

The assistant may organize Ryan's real thought into a message, but it cannot invent shared history, a compliment, or a reason for reaching out.

Useful inputs from Ryan:

- "I worked with her at X but we have not talked in three years."
- "He posted about their annual conference yesterday."
- "I know him from the gym and he now runs a school."
- "I do not remember how we connected."

When there is no real context, the honest opener can simply acknowledge that Ryan realized they had never actually talked. It still should not turn into a pitch.

## Daily operating limit

Review five candidates. Start no more than five genuine conversations. Stop the rest of the workflow when someone replies and answer the actual conversation first.

Track the final send and any response in `Personal Brand/linkedin-conversation-log.md`.

## 30-day sprint

Use `LINKEDIN-SPRINT-RUNBOOK.md` for the daily Grokbot commands, evidence gate, and tracker rules. The sprint workbook is created in `outputs/linkedin-acquisition-sprint-2026-08-24/LinkedIn-Acquisition-Sprint.xlsx`.
