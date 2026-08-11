# Backend Session Script

Generates a live facilitation script from the current open backend questions and next actions.

## Run

```bash
python3 pillars/1-operations/automations/backend_session_script/generate_backend_session_script.py \
  --date 2026-07-05
```

## Outputs

`outputs/operations/backend-session-script-YYYY-MM-DD/`

Files:

- `backend-live-session-script.md`
- `backend-answer-capture-commands.md`
- `backend-question-capture-sheet.csv`

## Purpose

Use this when sitting with Ryan, Maclaine, and/or Kenny. It gives you:

- the opening script
- the priority questions grouped by workflow area
- why each answer matters
- exact `record_backend_answer.py` commands
- the closing refresh command

## Guardrails

- The generated script is for discovery, not customer/vendor/money-facing action.
- If an answer is uncertain, mark it `Needs evidence`.
- Validate answers against real order packets before choosing the first build.
