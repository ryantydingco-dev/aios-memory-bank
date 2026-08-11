# Backend Session Intake

Creates a dated working copy of the reusable backend answer intake template.

## Why this exists

Do not fill the template directly during a live session. The template should stay reusable. The working answer file belongs in the dated evidence folder:

`context/import/backend-audit/YYYY-MM-DD/backend-answer-intake.csv`

## Run

```bash
python3 pillars/1-operations/automations/backend_session_intake/create_backend_session_intake.py \
  --date 2026-07-05
```

## Output

For the current session:

`context/import/backend-audit/2026-07-05/backend-answer-intake.csv`

## Behavior

- Replaces `SESSION_DATE` placeholders with the selected date.
- Preserves existing answers, statuses, owners, evidence paths, and source systems if rerun.
- Adds any new template questions that do not exist in the session file yet.

## Next Step

List the open questions:

```bash
python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py \
  --date 2026-07-05 \
  --list-open
```

Record one answer:

```bash
python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py \
  --date 2026-07-05 \
  --question Q001 \
  --answer "QuickBooks Online" \
  --source-system "QuickBooks Online"
```

Import an async markdown response:

```bash
python3 pillars/1-operations/automations/backend_session_intake/import_async_response.py \
  --date 2026-07-05
```

By default, the importer reads:

`context/import/backend-audit/2026-07-05/async-response.md`

Use the response template here:

`context/import/backend-audit/2026-07-05/async-response-template.md`

After filling or recording answers, compile the session intake:

```bash
python3 pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py \
  --input context/import/backend-audit/2026-07-05/backend-answer-intake.csv \
  --output-dir outputs/operations/backend-answer-summary-2026-07-05
```
