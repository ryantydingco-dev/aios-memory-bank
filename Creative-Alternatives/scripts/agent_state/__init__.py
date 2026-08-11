"""On-disk state for folder-scan subagents.

Three small, stdlib-only helpers the generated agent imports at runtime:

  fs_scan       - mtime-based folder delta (new/changed/removed files)
  write_cursor  - atomic deep-merge writer for the agent's JSON cursor
  run_log       - append-only JSONL run log

No external services, no database. The agent's entire memory is one JSON file
inside the watched folder at `.agent-state/last-check.json`.
"""
