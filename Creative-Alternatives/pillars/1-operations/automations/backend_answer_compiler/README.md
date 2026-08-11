# Backend Answer Compiler

Turns the backend intake answers into a source-of-truth map, open-question list, gap register starter, and first-automation readiness readout.

## Input

Reusable template:

`pillars/1-operations/templates/backend-answer-intake-template.csv`

Working session file:

`context/import/backend-audit/YYYY-MM-DD/backend-answer-intake.csv`

Create the working file with:

```bash
python3 pillars/1-operations/automations/backend_session_intake/create_backend_session_intake.py \
  --date 2026-07-05
```

Fill these columns during the Ryan/Maclaine/Kenny backend session:

- `answer`
- `status`
- `owner`
- `evidence_path`
- `source_system`

You can also save one answer at a time with:

```bash
python3 pillars/1-operations/automations/backend_session_intake/record_backend_answer.py \
  --date 2026-07-05 \
  --question Q001 \
  --answer "QuickBooks Online" \
  --source-system "QuickBooks Online"
```

Recommended statuses:

- `Answered`
- `Needs evidence`
- `Unknown`
- `Blocked`

## Run

```bash
python3 pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py
```

Or compile a specific session intake file:

```bash
python3 pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py \
  --input context/import/backend-audit/2026-07-05/backend-answer-intake.csv
```

## Outputs

Writes a dated folder under:

`outputs/operations/backend-answer-summary-YYYY-MM-DD/`

Files:

- `backend-answer-summary.md`
- `unanswered-backend-questions.csv`
- `system-source-map-from-answers.csv`
- `gap-register-from-answers.csv`
- `first-automation-readiness.csv`

## Purpose

Use this immediately after an intake session. It converts messy answers into the operating artifacts we need:

- What is still unknown
- Which system owns each workflow step
- Which gaps should enter the gap register
- Which first automation has enough answers/evidence to scope

## Guardrails

- Do not automate from answers alone; validate against live order evidence.
- Customer/vendor/money-facing actions remain human-approved.
- If the generated recommendation conflicts with Kenny's relationship judgment, update the evidence and let Kenny win.
