# Reply Watcher — Campaign Inbox (standing briefing)

This folder is the brain for CA's outbound reply pipeline. A fetch script
(`scripts/fetch_smartlead_replies.py`, run from the project root) drops each new
SmartLead reply in `replies/` as one markdown file. The `reply-watcher` agent
processes them: triages, updates `tasks.md`, drafts responses into `drafts/`,
and logs dispositions in `decisions/`.

## The business context (what a good reply is worth)

Creative Alternatives sells custom branded merchandise (27 years, founder Kenny).
Two offers appear in these campaigns:

1. **Branded web stores** (camps/clubs/schools): free store, CA handles
   design/fulfillment/shipping, org earns ~10–12% of sales. Zero inventory risk.
   Proof points: Farm & Forge Club; camp stores like Palisades, Lessans, Red Barn Ranch.
2. **Core custom merch** (Swag Handled corporate + squash campaigns): anything
   with a logo, digital proof in 24–48h, pay-after-delivery for most orders.

## Classification (per reply, exactly one label)

positive_interested · positive_soft · positive_referral · neutral_question ·
negative_notnow · negative_notfit · negative_hostile · unsubscribe · ooo · other

Special flags on top of the label:
- **EXISTING CUSTOMER** — reply reveals they already buy from Kenny/CA. Do NOT
  draft sales copy; flag for the retention motion and note it in decisions/.
- **DEPARTED STAFF** — auto-reply naming a replacement contact. Harvest the new
  name/email into tasks.md as a re-target entry.
- **HOT** — buying signal with size/timeline (order quantity, meeting ask,
  "send pricing"). These go to the top of tasks.md with an explicit next action.

## Drafting rules (hard rules, no exceptions)

- **Draft only. Never send.** Drafts are files in `drafts/`, named
  `YYYY-MM-DD-<lead-email>.md`, each with a one-line "why this angle" note at top.
  A human (Ryan/Maclaine) copies them into SmartLead/email after approval.
- Voice: **Maclaine** (warm, personal, founder's-daughter) for camps/clubs/schools;
  **Ryan** (professional, consultative) for corporate/Swag campaigns. Match
  whichever sender the thread already uses.
- Positive replies get a draft within the same run they're triaged.
- negative_notnow gets a polite door-open close (no repitch); unsubscribe gets
  flagged for suppression, never a reply draft.
- No invented facts, prices, or customer names. Pricing questions → draft
  acknowledges + tees up Kenny/Maclaine with what to quote (mark `[NEEDS PRICE]`).
- No AI-sounding copy: short sentences, no "I hope this finds you well",
  no em dashes, plain human tone. Run mentally against the spam-word-checker rules.

## tasks.md conventions

- `## Hot` — buying-signal threads, newest first, each with next action + owner.
- `## Waiting` — drafted/sent, awaiting their response (date-stamped).
- `## Re-target` — departed-staff replacement contacts to add to a future list.
- `## Suppress` — unsubscribes + existing customers (feed the suppression list).
- `## Done` — closed threads.

## Source of truth

Newest reply file wins over tasks.md. The scored history of the two completed
campaigns (pre-2026-07-03) lives in `data/outbound/reply-scoring/` — already
triaged; the 8 open threads from it are seeded in tasks.md. Do not re-triage them.
