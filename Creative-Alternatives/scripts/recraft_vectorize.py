#!/usr/bin/env python3
"""Raster art → Recraft vector SVG, with a transparent-background guard.

The Recraft route in docs/production-art.md, made runnable. Companion to
logo_production.py (SVG → exact-size outlined PDF).

Usage:
    python scripts/recraft_vectorize.py <in.png> <out.svg> [--strip-bg] [--keep-bg]

- Reads RECRAFT_API_KEY from .env (workspace root) or the environment.
- POSTs multipart file= to https://external.api.recraft.ai/v1/images/vectorize.
- Background guard: vectorizers routinely emit a full-canvas opaque rect even
  when the source PNG has an alpha channel. This checks for one and, with
  --strip-bg, removes it so the SVG stays transparent (Kenny's ask on the
  Driftwood job). Without a flag it warns and exits non-zero rather than
  silently shipping a white box behind the art.

Note on type: vectorize TRACES. It does not set type. Any lettering comes back
as traced outlines, not real glyphs — per the QC gate in docs/production-art.md
that is proof/mockup grade. Re-set the text as real type (production_art.py
style) before anything goes to a printer.
"""
import re
import sys
from pathlib import Path

import requests

API = "https://external.api.recraft.ai/v1/images/vectorize"
ROOT = Path(__file__).resolve().parent.parent


def load_key() -> str:
    import os

    if key := os.environ.get("RECRAFT_API_KEY"):
        return key.strip()
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            line = line.strip()
            if line.startswith("RECRAFT_API_KEY"):
                return line.split("=", 1)[1].strip().strip("'\"")
    sys.exit("RECRAFT_API_KEY not found in environment or .env")


def vectorize(png: Path, key: str) -> str:
    with png.open("rb") as fh:
        r = requests.post(
            API,
            headers={"Authorization": f"Bearer {key}"},
            files={"file": (png.name, fh, "image/png")},
            timeout=180,
        )
    if r.status_code == 401:
        sys.exit("401 from Recraft — key is invalid or revoked (rotated?).")
    r.raise_for_status()
    payload = r.json()
    item = payload.get("image") or (payload.get("data") or [{}])[0]
    if url := item.get("url"):
        got = requests.get(url, timeout=180)
        got.raise_for_status()
        return got.text
    sys.exit(f"No SVG url in Recraft response: {payload}")


def find_bg_rect(svg: str) -> str | None:
    """Return the leading full-canvas opaque rect, if the SVG opens with one."""
    m = re.search(r"<svg\b[^>]*>", svg)
    if not m:
        return None
    body = svg[m.end():]
    first = re.match(r"\s*(<rect\b[^>]*/?>)", body)
    if not first:
        return None
    rect = first.group(1)
    if re.search(r'fill\s*[:=]\s*["\']?\s*none', rect):
        return None
    return rect if re.search(r'fill\s*[:=]', rect) else None


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if len(args) != 2:
        sys.exit(__doc__)
    png, out = Path(args[0]), Path(args[1])
    if not png.exists():
        sys.exit(f"missing input: {png}")

    svg = vectorize(png, load_key())

    if rect := find_bg_rect(svg):
        if "--strip-bg" in flags:
            svg = svg.replace(rect, "", 1)
            print(f"stripped background rect: {rect[:90]}...")
        elif "--keep-bg" not in flags:
            sys.exit(
                f"Opaque background rect detected:\n  {rect[:120]}\n"
                "Re-run with --strip-bg to remove it (transparent art) "
                "or --keep-bg to accept it."
            )
    else:
        print("no opaque background rect found — art is transparent")

    out.write_text(svg)
    print(f"wrote {out}  ({len(svg):,} bytes)")


if __name__ == "__main__":
    main()
