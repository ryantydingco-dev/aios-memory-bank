"""Materialize Claude Code subagents from a per-folder YAML spec.

CLI: `python -m scripts.agent_builder {build|validate|render} <spec_path>`

This is the folder-scan archetype builder: it generates a subagent that watches
a folder for new/changed files (mtime watermark, no database, no API keys) and
maintains that folder's `tasks.md`.

See `INSTALL.md` for setup and the bundled `create-agent` skill for the guided
authoring flow.
"""

GENERATOR_VERSION = "1.0.0"

# Where the agent-body template lives, relative to the project root (the folder
# three levels up from this file: <project>/scripts/agent_builder/__init__.py).
FOLDER_TEMPLATE_REL_PATH = ".claude/agents/_templates/folder-agent-base.md"

__all__ = [
    "GENERATOR_VERSION",
    "FOLDER_TEMPLATE_REL_PATH",
]
