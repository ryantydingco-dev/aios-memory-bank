"""Cursor file schema + validators (schema_version 1).

The cursor is the agent's external memory: a single JSON file at
`<folder>/.agent-state/last-check.json`. For a folder-scan agent it holds one
extension block, `trip_fs`, which is the filesystem watermark.

Asymmetric version-mismatch policy:
- file schema_version < expected -> hard fail (exit 2 in the writer)
- file schema_version > expected -> warn, run with the known subset
"""
from __future__ import annotations

SCHEMA_VERSION = 1

# Delta sources (DB-backed watermarks). None in the folder-scan build - the
# loop in write_cursor.apply_patch tolerates an empty tuple cleanly.
SOURCE_KEYS: tuple[str, ...] = ()

# Extension blocks: agent-managed top-level objects merged field-level by
# write_cursor.apply_patch but not strictly field-validated (shapes vary).
#   trip_fs - filesystem-scan watermark:
#     {"last_scan_utc": "<iso>", "files": {"<rel-path>": "<mtime-iso>", ...}}
EXTENSION_KEYS = ("trip_fs",)

META_REQUIRED = {"agent", "created_at", "updated_at"}


class SchemaError(ValueError):
    pass


def empty_cursor(agent: str, now_iso: str) -> dict:
    return {
        "schema_version": SCHEMA_VERSION,
        "_meta": {"agent": agent, "created_at": now_iso, "updated_at": now_iso},
    }


def validate(cursor: dict) -> None:
    """Raise SchemaError if structurally invalid. Caller handles version policy."""
    if not isinstance(cursor, dict):
        raise SchemaError("cursor must be a JSON object")
    if "schema_version" not in cursor:
        raise SchemaError("missing schema_version")
    if not isinstance(cursor["schema_version"], int):
        raise SchemaError("schema_version must be int")
    meta = cursor.get("_meta")
    if not isinstance(meta, dict):
        raise SchemaError("_meta must be an object")
    for k in META_REQUIRED:
        if k not in meta or not isinstance(meta[k], str):
            raise SchemaError(f"_meta.{k} must be a string")


def check_version(file_version: int) -> str:
    """Return 'ok' | 'warn' | 'fail' based on the asymmetric policy."""
    if file_version == SCHEMA_VERSION:
        return "ok"
    if file_version < SCHEMA_VERSION:
        return "fail"
    return "warn"
