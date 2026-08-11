"""
AIOS — Daily Brief pipeline runner: collect fresh data, generate, deliver.

Called by launchd (com.aios.daily-brief) at 7:00 AM; safe to run manually:
    .venv/bin/python scripts/daily_brief.py
"""

import subprocess
import sys
import tempfile
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
VENV_PY = WORKSPACE / ".venv" / "bin" / "python"
PY = str(VENV_PY if VENV_PY.exists() else Path(sys.executable))


def run(args, **kw):
    return subprocess.run([PY] + args, cwd=str(WORKSPACE), **kw)


def main():
    run(["scripts/collect.py"])  # refresh data (failures already logged per-collector)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        payload_path = f.name
    gen = run(["scripts/generate_brief.py"], stdout=open(payload_path, "w"))
    if gen.returncode != 0:
        print("generate_brief failed", file=sys.stderr)
        sys.exit(1)

    post = run(["scripts/post_brief.py", payload_path])
    Path(payload_path).unlink(missing_ok=True)
    sys.exit(post.returncode)


if __name__ == "__main__":
    main()
