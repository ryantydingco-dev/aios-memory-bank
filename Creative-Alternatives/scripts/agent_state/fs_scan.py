"""Filesystem-scan delta for folder-scan subagents.

Scans a set of glob patterns under a folder and reports which files are new or
modified since the last scan, using mtime as the watermark. State lives in the
cursor's `trip_fs` extension block (see `schema.py`):

    "trip_fs": {
      "last_scan_utc": "<iso>",
      "files": {"<rel-path>": "<mtime-iso>", ...}
    }

The agent's startup step imports `scan()`, then writes the returned `patch`
back via `write_cursor.write(...)`.

Usage (standalone smoke test, from your project root):
    python -m scripts.agent_state.fs_scan --root "folders/my-project"
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import sys
from pathlib import Path

# Globs scanned relative to the folder root. Sensible defaults for a folder that
# accumulates notes, messages, and docs over time. Override per-agent in the
# spec's `sources.fs_scan.watch_globs`. Underscore-prefixed archive dirs (e.g.
# notes/_done/) are excluded below.
WATCH_GLOBS = (
    "*.md",
    "messages/*.md",
    "emails/*.md",
    "meetings/*.md",
    "notes/*.md",
    "drafts/*.md",
    "docs/*.md",
)


def _now_iso() -> str:
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _mtime_iso(p: Path) -> str:
    return (
        _dt.datetime.fromtimestamp(p.stat().st_mtime, _dt.timezone.utc)
        .strftime("%Y-%m-%dT%H:%M:%SZ")
    )


def _current_files(root: Path, globs: tuple[str, ...]) -> dict[str, str]:
    out: dict[str, str] = {}
    for pattern in globs:
        for p in root.glob(pattern):
            if not p.is_file():
                continue
            rel = p.relative_to(root).as_posix()
            # skip underscore-prefixed archive segments (e.g. notes/_done/...)
            if any(seg.startswith("_") for seg in rel.split("/")):
                continue
            out[rel] = _mtime_iso(p)
    return out


def scan(root: Path, prev_files: dict[str, str], globs: tuple[str, ...] = WATCH_GLOBS) -> dict:
    """Return the delta vs. the previous file->mtime map.

    Returns a dict with:
      added, modified, removed: sorted lists of relative paths
      files:  full current file->mtime map (the new watermark)
      patch:  {"trip_fs": {...}} ready for write_cursor.write
    """
    current = _current_files(root, globs)
    added = sorted(k for k in current if k not in prev_files)
    modified = sorted(
        k for k in current if k in prev_files and current[k] != prev_files[k]
    )
    removed = sorted(k for k in prev_files if k not in current)
    patch = {"trip_fs": {"last_scan_utc": _now_iso(), "files": current}}
    return {
        "added": added,
        "modified": modified,
        "removed": removed,
        "files": current,
        "patch": patch,
    }


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Filesystem-scan delta for a folder")
    p.add_argument("--root", required=True, help="folder root to scan")
    p.add_argument(
        "--prev",
        default="{}",
        help="JSON object of prev {rel_path: mtime_iso} (default: empty -> all files new)",
    )
    args = p.parse_args(argv)
    prev = json.loads(args.prev)
    result = scan(Path(args.root), prev)
    summary = {k: result[k] for k in ("added", "modified", "removed")}
    summary["total_tracked"] = len(result["files"])
    json.dump(summary, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
