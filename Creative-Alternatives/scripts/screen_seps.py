#!/usr/bin/env python3
"""Raster art → flat spot-color vector, one clean path set per PMS color.

Fills the multicolor gap in the production-art pipeline. A vectorizer (Recraft,
vtracer) reproduces every antialiased shade as its own shape — hundreds of
near-duplicate colors and gradients that no screen printer can use. This snaps
the art to a locked PMS palette FIRST, then traces one plane per color, so the
output is what a decorator actually wants: flat spot colors, clean edges,
no gradients.

Usage:
    python scripts/screen_seps.py <source.png> <palette.json> <out_prefix>
        [--scale 3] [--turd 8] [--despeckle 3]

  source.png   transparent-background art (the higher-res the better)
  palette.json {"colors": [{"name","hex","pms","order"?}, ...]}
  out_prefix   e.g. mockups/proof-sheets/<job>/driftwood-lifeguard

Outputs <prefix>-flat.svg (the deliverable), <prefix>-sep-<n>-<name>.png
(per-color QC planes), and an area report on stdout.

  --scale      upsample before quantizing; LANCZOS + snap-to-palette gives
               potrace a finer grid, so curves come out smoother (default 3)
  --turd       potrace speckle suppression, in px at the upsampled scale
  --despeckle  mode-filter window that cleans quantization confetti; 0 = off
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def srgb_to_lab(rgb):
    """rgb: float array (..., 3) in 0..255 -> CIE Lab (D65)."""
    c = rgb / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124, 0.3576, 0.1805],
                  [0.2126, 0.7152, 0.0722],
                  [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T
    white = np.array([0.95047, 1.0, 1.08883])
    t = xyz / white
    d = 6.0 / 29.0
    f = np.where(t > d ** 3, np.cbrt(np.clip(t, 1e-12, None)), t / (3 * d * d) + 4.0 / 29.0)
    return np.stack([116 * f[..., 1] - 16,
                     500 * (f[..., 0] - f[..., 1]),
                     200 * (f[..., 1] - f[..., 2])], axis=-1)


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def trace_plane(mask, turd, workdir, idx):
    """Boolean mask -> (list of path 'd' strings, svg header bits) via potrace."""
    pbm = workdir / f"plane{idx}.pbm"
    out = workdir / f"plane{idx}.svg"
    Image.fromarray(np.where(mask, 0, 255).astype(np.uint8), "L").convert("1").save(pbm)
    subprocess.run(["potrace", "-s", "-t", str(turd), "-o", str(out), str(pbm)],
                   check=True, capture_output=True, timeout=300)
    svg = out.read_text()
    view = re.search(r'viewBox="([^"]+)"', svg)
    trans = re.search(r'<g transform="([^"]+)"', svg)
    paths = re.findall(r'<path d="([^"]+)"', svg)
    return paths, (view.group(1) if view else None), (trans.group(1) if trans else None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source"); ap.add_argument("palette"); ap.add_argument("prefix")
    ap.add_argument("--scale", type=int, default=3)
    ap.add_argument("--turd", type=int, default=8)
    ap.add_argument("--despeckle", type=int, default=3)
    a = ap.parse_args()

    prefix = Path(a.prefix)
    pal = json.loads(Path(a.palette).read_text())
    colors = pal["colors"]
    pal_rgb = np.array([hex_to_rgb(c["hex"]) for c in colors], dtype=float)
    pal_lab = srgb_to_lab(pal_rgb)

    im = Image.open(a.source).convert("RGBA")
    if a.scale > 1:
        im = im.resize((im.width * a.scale, im.height * a.scale), Image.LANCZOS)
    arr = np.asarray(im).astype(float)
    rgb, alpha = arr[..., :3], arr[..., 3]
    opaque = alpha > 128

    # Snap every opaque pixel to its nearest palette entry in Lab.
    lab = srgb_to_lab(rgb)
    d = ((lab[:, :, None, :] - pal_lab[None, None, :, :]) ** 2).sum(-1)
    idx = np.argmin(d, axis=-1).astype(np.uint8)
    idx[~opaque] = 255  # sentinel for transparent

    if a.despeckle:
        # Mode filter on the index map kills quantization confetti along edges
        # without rounding off real corners the way a blur would.
        sm = Image.fromarray(idx, "L").filter(ImageFilter.ModeFilter(a.despeckle))
        idx = np.asarray(sm).copy()
        idx[~opaque] = 255

    inked = int((idx != 255).sum())
    order = sorted(range(len(colors)),
                   key=lambda i: colors[i].get("order", -int((idx == i).sum())))

    print(f"source {im.width}x{im.height} (scale {a.scale}x), inked {inked:,} px\n")
    print(f"{'#':>2}  {'name':<12} {'hex':<9} {'PMS':<10} {'area':>7}")

    body, viewbox, transform = [], None, None
    with tempfile.TemporaryDirectory() as td:
        workdir = Path(td)
        for n, i in enumerate(order):
            c = colors[i]
            mask = idx == i
            area = mask.sum()
            pct = area * 100.0 / max(inked, 1)
            print(f"{n + 1:>2}  {c['name']:<12} {c['hex']:<9} {c.get('pms', '—'):<10} {pct:6.2f}%")
            if area == 0:
                continue
            paths, vb, tr = trace_plane(mask, a.turd, workdir, i)
            viewbox = viewbox or vb
            transform = transform or tr
            sep = prefix.with_name(f"{prefix.name}-sep-{n + 1}-{c['name']}.png")
            Image.fromarray(np.where(mask, 0, 255).astype(np.uint8), "L").save(sep)
            body.append(
                f'<g transform="{tr}" fill="{c["hex"]}" stroke="none" '
                f'data-color="{c["name"]}" data-pms="{c.get("pms", "")}">\n'
                + "\n".join(f'<path d="{p}"/>' for p in paths)
                + "\n</g>"
            )

    out = prefix.with_name(f"{prefix.name}-flat.svg")
    out.write_text(
        f'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{viewbox}" preserveAspectRatio="xMidYMid meet">\n'
        f"<!-- flat spot-color art, {len(order)} colors, no gradients. "
        f"PMS callouts govern color, not these hex values. -->\n"
        + "\n".join(body) + "\n</svg>\n"
    )
    print(f"\nwrote {out}  ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
