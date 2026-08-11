#!/usr/bin/env python3
"""Wait for the three AI Ark lane files, then run partner scoring once."""

import json
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "outputs" / "partnerships" / "scale-3000-2026-07-17"
LANES = ["partner-agencies", "partner-event-agencies", "partner-people-advisors"]
TARGET = 1000

for attempt in range(720):
    counts = {}
    for lane in LANES:
        path = BASE / lane / "raw-ai-ark-emails.json"
        try:
            counts[lane] = len(json.loads(path.read_text()))
        except (FileNotFoundError, json.JSONDecodeError):
            counts[lane] = 0
    print(f"waiting for partner email files: {counts}", flush=True)
    if all(counts[lane] >= TARGET for lane in LANES):
        result = subprocess.run(
            ["python", str(ROOT / "scripts" / "ca_partner_enrich_score.py"), "--lane", "all", "--first-launch", "100"],
            cwd=ROOT,
            check=False,
        )
        raise SystemExit(result.returncode)
    time.sleep(10)
raise SystemExit("Timed out waiting for all three 1,000-contact lane files")
