"""
CA Signal Weekly — the Monday autopilot for buying signals.

Chains: signal-scan (ATS + news) -> score -> SmartLead segment DRY-RUN -> Telegram the hot list.
Detection runs itself; the actual send stays Ryan's decision (nothing is written to SmartLead).

Week-over-week state lives in data/ca_signal_weekly_state.json so the Telegram brief leads with
"NEWLY HOT this week" (firms that crossed into priority/act-48h since the last run).

Usage:
    python scripts/ca_signal_weekly.py                 # newest outputs/ca-outbound/*/leads.json
    python scripts