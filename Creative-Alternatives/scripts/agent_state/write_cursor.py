#!/usr/bin/env python3
"""Atomic --patch writer for an agent cursor file.

Usage:
  python -m scripts.agent_state.write_cursor \
      --path "<folder>/.agent-state/last-check.json" \
      --agent my-folder-agent \
      --patch '{"trip_fs": {"last_scan_utc": "2026-01-01T00:00:00Z", "files": {}}}'

Semantics:
- Deep-merge `--patch` into the existing cursor (field-level per block).
- Validate the result against the schema_version=1 contract.
- Atomic write: tempfile.mkstemp + os.fsync + os.replace (stdlib only). A crash
  before os.replace leaves the previous file intact.
- If the file does not exist, seed with `empty_cursor(agent)` first.
- Version policy: file lower -> exit 2; file higher -> warn and continue.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import sys
import tempfile
from pathlib import Path

from . import schema as _schema


def _now_iso() -> str:
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _read(path: Path) -> dict | None:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _atomic_write(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".last-check.", suffix=".tmp", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, sort_keys=True)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except FileNotFoundError:
            pass
        raise


def apply_patch(cursor: dict, patch: dict) -> dict:
    """Deep-merge per block (field-level update within each).

    Merges any source blocks and extension blocks (e.g. trip_fs). Any other
    top-level key in the patch is ignored.
    """
    out = json.loads(json.dumps(cursor))  # cheap deep copy
    for key in (*_schema.SOURCE_KEYS, *_schema.EXTENSION_KEYS):
        if key not in patch:
            continue
        block = patch[key]
        if not isinstance(block, dict):
            raise _schema.SchemaError(f"patch.{key} must be an object")
        merged = dict(out.get(key) or {})
        merged.update(block)
        out[key] = merged
    out["_meta"]["updated_at"] = _now_iso()
    return out


def write(path: Path, agent: str, patch: dict) -> dict:
    existing = _read(path)
    if existing is None:
        cursor = _schema.empty_cursor(agent, _now_iso())
    else:
        ver = existing.get("schema_version")
        if not isinstance(ver, int):
            raise _schema.SchemaError("existing file missing/invalid schema_version")
        status = _schema.check_version(ver)
        if status == "fail":
            sys.stderr.write(
                f"FATAL: cursor schema_version={ver} < expected {_schema.SCHEMA_VERSION}.\n"
            )
            sys.exit(2)
        if status == "warn":
            sys.stderr.write(
                f"WARN: cursor schema_version={ver} > expected {_schema.SCHEMA_VERSION}. "
                "Running with the known subset.\n"
            )
        cursor = existing
    new_cursor = apply_patch(cursor, patch)
    _schema.validate(new_cursor)
    _atomic_write(path, new_cursor)
    return new_cursor


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Atomic --patch writer for an agent cursor file")
    p.add_argument("--path", required=True, help="cursor file path")
    p.add_argument("--agent", required=True, help="agent name, recorded in _meta on first write")
    p.add_argument("--patch", required=True, help="JSON patch, e.g. '{\"trip_fs\": {...}}'")
    args = p.parse_args(argv)
    patch = json.loads(args.patch)
    if not isinstance(patch, dict):
        sys.stderr.write("--patch must decode to an object\n")
        return 2
    result = write(Path(args.path), args.agent, patch)
    json.dump(result, sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
