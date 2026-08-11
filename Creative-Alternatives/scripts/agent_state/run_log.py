"""Append-only JSONL run log for agent scans.

Each call to `append(...)` writes exactly one line:
    {"ts": "<iso>", "agent": "<name>", "source": "trip_fs",
     "status": "ok|empty|error", "delta_count": N, "stale": bool, "note": "..."}

This is the agent's efficiency-observability trail: one row per invocation so you
can see when it ran and how much changed.
"""
from __future__ import annotations

import datetime as _dt
import json
from pathlib import Path


def append(
    log_path: Path,
    *,
    agent: str,
    source: str,
    status: str,
    delta_count: int = 0,
    stale: bool = False,
    note: str = "",
) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    row = {
        "ts": _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "agent": agent,
        "source": source,
        "status": status,
        "delta_count": delta_count,
        "stale": stale,
        "note": note,
    }
    with log_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, sort_keys=True) + "\n")
