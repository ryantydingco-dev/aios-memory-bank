# Deal Threads Outbound Automation SOP

Last updated: 2026-06-02  
Purpose: make daily outbound mostly queue-based, copy-pasteable, and measurable without fully automating trust-sensitive sending.

## Automation Stack

### Core Files

- Target CSV: `Lead Engine/DealThreads_Targets_Template.csv`
- Daily send board script: `Operations/scripts/deal_threads_build_send_board.py`
- Outcome logger: `Operations/scripts/deal_threads_log_outcome.py`
- Outcome tracker: `Lead Engine/Outputs/DealThreads_Outcome_Tracker.csv`
- Workbook: `outputs/deal_threads_outbound_machine/Deal Threads Outbound Machine Workbook.xlsx`

### Daily Command

```bash
python3 'Operations/scripts/deal_threads_build_send_board.py' \
  --targets 'Lead Engine/DealThreads_Targets_Template.csv' \
  --limit 10
```

Output:

- `Lead Engine/Outputs/Deal Threads Send Board - YYYY-MM-DD.md`
- `Lead Engine/Outputs/DealThreads_Daily_Outbound_Queue_YYYY-MM-DD.csv`
- seeded rows in `Lead Engine/Outputs/DealThreads_Outcome_Tracker.csv`

## Daily Workflow

1. Add targets to the CSV or workbook.
2. Run the send board script.
3. Send the generated LinkedIn/email copy manually.
4. Run the generated log command after each send.
5. Run the logger again when someone replies, objects, books, or receives a teardown.

## Outcome Logging

### Sent

```bash
python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --sent --channel LinkedIn --date 2026-06-02
```

### Replied

```bash
python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --replied --sentiment positive --note 'asked for teardown'
```

### Teardown Requested

```bash
python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --teardown-requested
```

### Teardown Sent

```bash
python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --teardown-sent --note 'sent Loom'
```

### Install Call Booked

```bash
python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --install-call
```

## Automation Rules

Automate:

- queue generation.
- copy drafting from fields.
- follow-up due dates.
- status and outcome logging.
- daily scoreboard.

Keep manual:

- final review of account fit.
- sending LinkedIn messages.
- sending email until deliverability is proven.
- teardown judgment.
- reply handling.
- install call ask.

## Weekly Automation Review

Every Friday:

1. Export tracker metrics.
2. Count reply rate by segment and opener.
3. Count teardown yes rate.
4. Count install-call conversion.
5. Update target filters.
6. Retire any opener below 3% reply after 50 sends.
7. Double down on any segment above 10% reply or 25% teardown yes.
