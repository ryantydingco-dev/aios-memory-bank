"""Render a folder-scan subagent `.md` from a per-folder agent-spec.yaml.

Pipeline (prompt chaining with gates):

    load_spec ──► validate ──► enrich ──► render_template
                                            │
                                ┌───────────┴───────────┐
                                ▼                       ▼
                          write_agent_md          scaffold_state

Idempotency: re-running on an unchanged spec rewrites the .md byte-identical.
On hash divergence (you hand-edited the generated .md), the build aborts unless
`--force`. Runtime cursor state is NEVER overwritten.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator

from . import FOLDER_TEMPLATE_REL_PATH, GENERATOR_VERSION
from scripts.agent_state.fs_scan import WATCH_GLOBS as FS_SCAN_DEFAULT_GLOBS

# Project root = the folder three levels up from this file:
#   <project>/scripts/agent_builder/build.py
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent

SPEC_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": [
        "agent_slug", "human_label", "description_summary",
        "model", "tools", "permission_mode", "max_turns", "scope", "sources",
    ],
    "properties": {
        "spec_version": {"enum": [1]},
        "agent_slug": {"type": "string", "pattern": r"^[a-z0-9][a-z0-9-]*$"},
        "human_label": {"type": "string", "minLength": 1},
        "description_summary": {"type": "string", "minLength": 10},
        "model": {"enum": ["sonnet", "opus", "haiku"]},
        "tools": {"type": "string", "minLength": 1},
        "permission_mode": {"enum": ["acceptEdits", "default", "bypassPermissions"]},
        "max_turns": {"type": "integer", "minimum": 1, "maximum": 200},
        "scope": {
            "type": "object",
            "required": ["root"],
            "properties": {
                "root": {"type": "string", "minLength": 1},
                "readonly_exceptions": {"type": "array", "items": {"type": "string"}},
            },
        },
        "sources": {
            "type": "object",
            "properties": {
                "fs_scan": {
                    "type": "object",
                    "properties": {
                        "enabled": {"type": "boolean"},
                        "watch_globs": {"type": "array", "items": {"type": "string"}},
                    },
                },
            },
        },
        "modes": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["name", "description", "triggers"],
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "triggers": {"type": "array", "items": {"type": "string"}},
                    "procedure_ref": {"type": ["string", "null"]},
                },
            },
        },
    },
}

PLACEHOLDER_RE = re.compile(r"REPLACE_ME|<paste from|\{slug\}|\{FOLDER\}", re.I)

# ─── load + validate ─────────────────────────────────────────────────────────


@dataclass
class BuildResult:
    agent_md: Path
    state_files: list[Path]
    dry_run: bool


def load_spec(path: Path) -> dict[str, Any]:
    raw = yaml.safe_load(path.read_text())
    if not isinstance(raw, dict):
        raise ValueError(f"spec at {path} did not parse to a mapping")
    if raw.get("spec_version", 1) != 1:
        raise ValueError(
            f"unknown spec_version: {raw.get('spec_version')!r} (this generator knows v1)"
        )
    validator = Draft202012Validator(SPEC_SCHEMA)
    errors = sorted(validator.iter_errors(raw), key=lambda e: list(e.path))
    if errors:
        msgs = [f"  - {'/'.join(map(str, e.path)) or '<root>'}: {e.message}" for e in errors]
        raise ValueError("spec failed schema validation:\n" + "\n".join(msgs))
    # placeholder check on key fields - catch a half-filled template
    for k in ("agent_slug", "human_label", "description_summary"):
        if PLACEHOLDER_RE.search(str(raw.get(k, ""))):
            raise ValueError(f"spec field {k!r} still contains a placeholder - fill it in")
    # fs_scan must be enabled for a folder-scan agent
    if not raw.get("sources", {}).get("fs_scan", {}).get("enabled"):
        raise ValueError("sources.fs_scan.enabled must be true for a folder-scan agent")
    return raw


def enrich_spec(spec: dict[str, Any]) -> dict[str, Any]:
    """Add derived fields the template references but the YAML doesn't carry."""
    out = json.loads(json.dumps(spec))  # deep copy
    out.setdefault("modes", [])
    out.setdefault("scope", {}).setdefault("readonly_exceptions", [])
    out.setdefault("sources", {}).setdefault("fs_scan", {"enabled": True})

    # default watch_globs when enabled and not set
    fs = out["sources"]["fs_scan"]
    if not fs.get("watch_globs"):
        fs["watch_globs"] = list(FS_SCAN_DEFAULT_GLOBS)

    # enrich modes: pre-join trigger phrases for the template
    for m in out["modes"]:
        m.setdefault("triggers", [])
        m["triggers_joined"] = ", ".join(f'"{t}"' for t in m["triggers"])
        m.setdefault("procedure_ref", None)

    return out


# ─── template renderer ───────────────────────────────────────────────────────
#
# A tiny, dependency-free template engine. Three constructs, all expressed as
# HTML comments so the raw template still renders as readable markdown:
#
#   <!-- IF: <expr> -->  ... <!-- ELSE --> ... <!-- ENDIF -->
#   <!-- FOR: <var> in <list_expr> -->  ... <!-- ENDFOR -->
#   {{ dotted.path }}   and   {{ dotted.path | filter }}
#
# <expr> supports `A`, `A OR B`, `A AND B` (not mixed). Truthiness: None/False/
# empty-collection are falsey.

_IF_RE = re.compile(r"<!--\s*IF:\s*(.+?)\s*-->")
_ELSE_RE = re.compile(r"<!--\s*ELSE\s*-->")
_ENDIF_RE = re.compile(r"<!--\s*ENDIF\s*-->")
_FOR_RE = re.compile(r"<!--\s*FOR:\s*(\w+)\s+in\s+(.+?)\s*-->")
_ENDFOR_RE = re.compile(r"<!--\s*ENDFOR\s*-->")
_SUBST_RE = re.compile(r"\{\{\s*([^}]+?)\s*\}\}")


def resolve(path: str, ctx: dict[str, Any]) -> Any:
    """Resolve a dotted path against ctx. Returns None on miss."""
    cur: Any = ctx
    for part in path.split("."):
        if isinstance(cur, dict):
            cur = cur.get(part)
        else:
            cur = getattr(cur, part, None)
        if cur is None:
            return None
    return cur


def _truthy(v: Any) -> bool:
    if v is None or v is False:
        return False
    if isinstance(v, (list, dict, str)) and len(v) == 0:
        return False
    return True


def eval_expr(expr: str, ctx: dict[str, Any]) -> bool:
    """Tiny boolean evaluator: `A`, `A OR B`, `A AND B` (mixed not supported)."""
    expr = expr.strip()
    if " OR " in expr:
        return any(eval_expr(p, ctx) for p in expr.split(" OR "))
    if " AND " in expr:
        return all(eval_expr(p, ctx) for p in expr.split(" AND "))
    return _truthy(resolve(expr, ctx))


def apply_filter(value: Any, filt: str) -> str:
    if filt == "indent2":
        return "\n".join("  " + line for line in str(value).splitlines())
    raise ValueError(f"unknown filter: {filt!r}")


def substitute(text: str, ctx: dict[str, Any]) -> str:
    def repl(match: re.Match) -> str:
        body = match.group(1).strip()
        if "|" in body:
            path, filt = (x.strip() for x in body.split("|", 1))
            v = resolve(path, ctx)
            return apply_filter(v if v is not None else "", filt)
        v = resolve(body, ctx)
        if v is None:
            return ""
        if isinstance(v, bool):
            return "true" if v else "false"
        return str(v)

    return _SUBST_RE.sub(repl, text)


def _find_matching(text: str, open_re: re.Pattern, close_re: re.Pattern, start: int) -> int:
    """Return index AFTER the close marker that matches the open at `start`."""
    depth = 1
    pos = start
    while depth > 0:
        next_open = open_re.search(text, pos)
        next_close = close_re.search(text, pos)
        if not next_close:
            raise ValueError("unmatched template block")
        if next_open and next_open.start() < next_close.start():
            depth += 1
            pos = next_open.end()
        else:
            depth -= 1
            pos = next_close.end()
            if depth == 0:
                return pos
    return pos


def render(text: str, ctx: dict[str, Any]) -> str:
    """Render FOR/ENDFOR, IF/ELSE/ENDIF, and {{ }} substitutions, recursively."""
    # FOR loops first (they may contain IF blocks)
    while True:
        m = _FOR_RE.search(text)
        if not m:
            break
        var_name, list_expr = m.group(1), m.group(2)
        end = _find_matching(text, _FOR_RE, _ENDFOR_RE, m.end())
        endfor_start = text.rfind("<!--", m.end(), end)
        body = text[m.end():endfor_start]
        items = resolve(list_expr, ctx) or []
        rendered_chunks = []
        for item in items:
            inner_ctx = dict(ctx)
            inner_ctx[var_name] = item
            inner_ctx["var"] = item  # back-compat alias
            rendered_chunks.append(render(body, inner_ctx))
        text = text[:m.start()] + "".join(rendered_chunks) + text[end:]

    # IF / ELSE / ENDIF
    while True:
        m = _IF_RE.search(text)
        if not m:
            break
        end = _find_matching(text, _IF_RE, _ENDIF_RE, m.end())
        endif_start = text.rfind("<!--", m.end(), end)
        body = text[m.end():endif_start]
        else_pos = _find_top_level_else(body)
        if else_pos is not None:
            true_body = body[:else_pos]
            else_match_end = _ELSE_RE.search(body, else_pos).end()
            false_body = body[else_match_end:]
        else:
            true_body, false_body = body, ""
        chosen = true_body if eval_expr(m.group(1), ctx) else false_body
        text = text[:m.start()] + render(chosen, ctx) + text[end:]

    # substitutions
    return substitute(text, ctx)


def _find_top_level_else(body: str) -> int | None:
    """Return index of an ELSE marker not nested in a sub-IF, or None."""
    depth = 0
    pos = 0
    while pos < len(body):
        next_if = _IF_RE.search(body, pos)
        next_else = _ELSE_RE.search(body, pos)
        next_endif = _ENDIF_RE.search(body, pos)
        candidates = [(m.start(), kind) for m, kind in
                      [(next_if, "if"), (next_else, "else"), (next_endif, "endif")] if m]
        if not candidates:
            return None
        candidates.sort()
        start, kind = candidates[0]
        if kind == "if":
            depth += 1
            pos = next_if.end()
        elif kind == "endif":
            depth -= 1
            pos = next_endif.end()
        elif kind == "else":
            if depth == 0:
                return start
            pos = next_else.end()
    return None


# ─── orchestration ───────────────────────────────────────────────────────────


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]


def render_template(spec: dict[str, Any], template_path: Path, spec_path: Path) -> tuple[str, dict[str, str]]:
    template_text = template_path.read_text()
    spec_text = spec_path.read_text() if spec_path.exists() else yaml.safe_dump(spec)
    meta = {
        "spec_path": _rel_or_str(spec_path),
        "template_version": _sha256(template_text),
        "generator_version": GENERATOR_VERSION,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "spec_hash": _sha256(spec_text),
        "template_hash": _sha256(template_text),
    }
    ctx = dict(spec)
    ctx["spec"] = spec
    ctx["meta"] = meta
    template_text = _strip_leading_html_comment(template_text)
    return render(template_text, ctx), meta


def _rel_or_str(p: Path) -> str:
    try:
        return str(p.resolve().relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(p)


def _strip_leading_html_comment(text: str) -> str:
    """Remove a leading <!-- ... --> doc-comment so the YAML frontmatter `---`
    is the first line - Claude Code's agent loader requires that. The doc-comment
    can itself contain literal `<!-- IF -->` strings as documentation, so we strip
    everything up to the first standalone `---` line.
    """
    if not text.lstrip().startswith("<!--"):
        return text
    m = re.search(r"(?m)^---\s*$", text)
    return text[m.start():] if m else text


def write_agent_md(rendered: str, agent_slug: str, dest_dir: Path, *, force: bool, dry_run: bool) -> tuple[Path, str]:
    """Returns (path, action) in {'created','unchanged','overwrote','aborted','would-*'}."""
    rendered = _strip_leading_html_comment(rendered)
    dest = dest_dir / f"{agent_slug}.md"
    if dest.exists():
        existing = dest.read_text()
        if existing == rendered:
            return dest, "unchanged"
        # divergence - if the file carries a provenance stamp it was generated;
        # a difference means someone hand-edited it. Refuse unless --force.
        if "template_hash:" in existing and not force:
            return dest, "aborted"
        if dry_run:
            return dest, "would-overwrite"
        dest.write_text(rendered)
        return dest, "overwrote"
    if dry_run:
        return dest, "would-create"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(rendered)
    return dest, "created"


def scaffold_state_folder(spec: dict[str, Any], folder_root: Path, *, dry_run: bool) -> list[tuple[Path, str]]:
    """Create <folder>/.agent-state/ with a .gitkeep and an example cursor.

    The runtime cursor (last-check.json) is NEVER written or clobbered here -
    it is created on the agent's first scan and is gitignored.
    """
    folder = folder_root / ".agent-state"
    actions: list[tuple[Path, str]] = []
    gitkeep = folder / ".gitkeep"
    example = folder / "last-check.json.example"
    runtime = folder / "last-check.json"
    if not folder.exists() and not dry_run:
        folder.mkdir(parents=True, exist_ok=True)
    if not gitkeep.exists():
        if not dry_run:
            gitkeep.write_text("")
        actions.append((gitkeep, "created"))
    else:
        actions.append((gitkeep, "exists"))
    if not example.exists():
        sample = {
            "schema_version": 1,
            "_meta": {
                "agent": spec["agent_slug"],
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z",
            },
            "trip_fs": {"last_scan_utc": "2026-01-01T00:00:00Z", "files": {}},
        }
        if not dry_run:
            example.write_text(json.dumps(sample, indent=2) + "\n")
        actions.append((example, "created"))
    else:
        actions.append((example, "exists"))
    if runtime.exists():
        actions.append((runtime, "runtime-preserved"))
    return actions


def build_all(spec_path: Path, *, dry_run: bool = False, force: bool = False,
              no_state: bool = False) -> BuildResult:
    spec = enrich_spec(load_spec(spec_path))
    template_path = WORKSPACE_ROOT / FOLDER_TEMPLATE_REL_PATH
    if not template_path.exists():
        raise FileNotFoundError(
            f"agent template missing at {template_path} - did setup copy "
            ".claude/agents/_templates/folder-agent-base.md into place?"
        )
    rendered, _meta = render_template(spec, template_path, spec_path)

    agent_dir = WORKSPACE_ROOT / ".claude" / "agents"
    agent_md, agent_action = write_agent_md(
        rendered, spec["agent_slug"], agent_dir, force=force, dry_run=dry_run
    )
    if agent_action == "aborted":
        raise RuntimeError(
            f"refusing to overwrite hand-edited {agent_md}; pass --force to overwrite"
        )

    folder_root = WORKSPACE_ROOT / spec["scope"]["root"]
    state_actions = [] if no_state else scaffold_state_folder(spec, folder_root, dry_run=dry_run)

    return BuildResult(
        agent_md=agent_md,
        state_files=[p for p, _ in state_actions],
        dry_run=dry_run,
    )
