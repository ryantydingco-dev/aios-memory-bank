"""CLI entrypoint: `python -m scripts.agent_builder {build|validate|render} <spec>`."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from . import GENERATOR_VERSION, FOLDER_TEMPLATE_REL_PATH
from .build import (
    WORKSPACE_ROOT,
    build_all,
    enrich_spec,
    load_spec,
    render_template,
)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="python -m scripts.agent_builder")
    p.add_argument("--version", action="version", version=f"agent_builder {GENERATOR_VERSION}")
    sub = p.add_subparsers(dest="cmd", required=True)

    sp_b = sub.add_parser("build", help="Render the agent .md and scaffold .agent-state/")
    sp_b.add_argument("spec", type=Path)
    sp_b.add_argument("--dry-run", action="store_true")
    sp_b.add_argument("--force", action="store_true", help="Overwrite a hand-edited agent .md")
    sp_b.add_argument("--no-state", action="store_true", help="Skip the .agent-state/ scaffold")

    sp_v = sub.add_parser("validate", help="Schema-check the spec, no writes")
    sp_v.add_argument("spec", type=Path)

    sp_r = sub.add_parser("render", help="Render the agent .md to stdout, no writes")
    sp_r.add_argument("spec", type=Path)

    args = p.parse_args(argv)
    try:
        if args.cmd == "validate":
            load_spec(args.spec)
            print(f"OK  {args.spec}")
            return 0

        if args.cmd == "render":
            spec = enrich_spec(load_spec(args.spec))
            template_path = WORKSPACE_ROOT / FOLDER_TEMPLATE_REL_PATH
            rendered, _ = render_template(spec, template_path, args.spec)
            sys.stdout.write(rendered)
            return 0

        if args.cmd == "build":
            res = build_all(
                args.spec,
                dry_run=args.dry_run,
                force=args.force,
                no_state=args.no_state,
            )
            tag = "DRY-RUN  " if res.dry_run else ""
            print(f"{tag}agent .md   -> {res.agent_md.relative_to(WORKSPACE_ROOT)}")
            for f in res.state_files:
                print(f"{tag}state file  -> {f.relative_to(WORKSPACE_ROOT)}")
            return 0
    except (ValueError, RuntimeError, FileNotFoundError) as e:
        print(f"ERROR  {e}", file=sys.stderr)
        return 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
