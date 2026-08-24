# Personal Brand

This folder is the source of truth for Ryan's LinkedIn growth and relationship system. The assistant drafts and organizes. Ryan approves and sends from his existing LinkedIn Chrome profile.

Rule zero: no AI slop. Ryan provides the thoughts. The assistant defaults to a light edit for grammar, clarity, pacing, and flow while preserving Ryan's actual language and personality. No em dashes.

## Load order

1. `OPERATOR-BRIEF.md`
2. `VOICE-GUIDE.md`
3. `MEDIA-PLAYBOOK.md` for video, picture, and tutorial posts
4. `DM-PLAYBOOK.md` for conversations or `GROKBOT-LINKEDIN.md` for a full block
5. Today's file in `daily-prep/`, when one exists

## Daily

1. Build the list with `finder/build_daily_list.py` or fill the daily pack manually.
2. Open `daily-prep/YYYY-MM-DD.md`.
3. Say `block time` and give the assistant the daily pack.
4. Ryan reviews the drafts and sends them from the Chrome profile named **LinkedIn**.

The assistant may inspect the existing signed-in LinkedIn profile when Ryan asks. It must never send a DM, connection request, comment, reaction, or post without Ryan's confirmation at action time.

## Live files

| File | What it is |
|---|---|
| `finder/build_daily_list.py` | Builds today's list from the CA LinkedIn queue |
| `daily-prep/YYYY-MM-DD.md` | The list you work |
| `linkedin-conversation-log.md` | What you actually sent |
| `OPERATOR-BRIEF.md` | Positioning, audiences, goals, and operating rules |
| `VOICE-GUIDE.md` | How Ryan sounds and how to edit drafts |
| `MEDIA-PLAYBOOK.md` | Talking-head, tutorial, picture, and proof-asset system |
| `DM-PLAYBOOK.md` | Cold, warm, inbound, and follow-up conversation rules |
| `weekly-review.md` | Weekly learning loop and scorecard |

`archive/` is old planning. Ignore it.

## Commands Ryan can use in chat

- `draft post: [idea or raw notes]`
- `media post: [idea or raw notes]`
- `tutorial: [workflow to demonstrate]`
- `reply desk: [paste comments or DMs]`
- `dm assist: [person + profile/post/context]`
- `follow-up: [conversation so far]`
- `block time`
- `weekly review`
