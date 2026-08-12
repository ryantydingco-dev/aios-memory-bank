#!/usr/bin/env python3
"""Erase traced lettering from raster art and re-set it as real type.

The QC rule is never ship traced AI lettering — a vectorizer gives you
letter-shaped blobs, not letterforms, and the defects (malformed bowls, wobbling
baselines, inconsistent counters) can't be cleaned, only replaced. This lifts
each traced block out of the raster by colour-within-a-region, separates what's
left with screen_seps, and drops real outlined type back onto the same footprint
so the rebuilt art still matches what the customer approved.

    python scripts/retype_art.py <spec.json>

Spec:
{
  "source": "art-nobg.png",          # paths are relative to the spec file
  "palette": "palette.json",
  "out_prefix": "art-screenprint",
  "scale": 3, "turd": 120, "despeckle": 5,
  "blocks": [{
     "text": "LIFEGUARDS ONLY",
     "font": "../../../reference/fonts/Anton-Regular.ttf",
     "erase": {"rect": [55, 988, 875, 1070], "colors": ["navy", "ltblue"]},
     "place": {"x": 65, "baseline_y": 1063, "cap_px": 65,
               "fit_width": 795, "rotate": 0},
     "fill": "navy"
  }],
  "rules": [{"rect": [65,1086,195,1092], "fill":"navy"}]   # optional flat bars
}

Coordinates are in SOURCE-raster pixels; the script scales them to the output
viewBox itself.
"""
import json
import sys
from pathlib import Path

from screen_seps import TRANSPARENT, build_planes, quantize, wrap_svg
from set_type import TypeSetter


def main():
    spec_path = Path(sys.argv[1])
    spec = json.loads(spec_path.read_text())
    base = spec_path.parent
    rel = lambda p: (base / p).resolve()

    colors = json.loads(rel(spec["palette"]).read_text())["colors"]
    by_name = {c["name"]: c for c in colors}
    scale = spec.get("scale", 3)

    idx, size = quantize(rel(spec["source"]), colors, scale, spec.get("despeckle", 3))
    print(f"source {size[0]}x{size[1]} (scale {scale}x)")

    # 1. Lift each traced block out — only the listed colours, only inside the
    #    block's rect, so overlapping art (a swash, the sand) survives intact.
    for b in spec["blocks"]:
        x0, y0, x1, y1 = (v * scale for v in b["erase"]["rect"])
        sub = idx[y0:y1, x0:x1]
        for cname in b["erase"]["colors"]:
            n = next(i for i, c in enumerate(colors) if c["name"] == cname)
            removed = int((sub == n).sum())
            sub[sub == n] = TRANSPARENT
            print(f"  erased {removed:>8,} px of {cname:<8} from {b['text']!r}")

    groups, viewbox = build_planes(idx, colors, spec.get("turd", 8),
                                   sep_prefix=str(rel(spec["out_prefix"])))

    # 2. Re-set each block as real type, on the footprint just vacated.
    type_groups = []
    for b in spec["blocks"]:
        ts = TypeSetter(rel(b["font"]))
        p = b["place"]
        fill = by_name[b["fill"]]["hex"]
        type_groups.append(
            f'<!-- {b["text"]} — re-set as type, {Path(b["font"]).name} -->\n'
            + ts.run(b["text"], cap_px=p["cap_px"] * scale, x=p["x"] * scale,
                     baseline_y=p["baseline_y"] * scale, fill=fill,
                     fit_width=p.get("fit_width", 0) * scale or None,
                     rotate=p.get("rotate", 0)))
        print(f"  set {b['text']!r} in {Path(b['font']).name}")

    for r in spec.get("rules", []):
        x0, y0, x1, y1 = (v * scale for v in r["rect"])
        type_groups.append(
            f'<g fill="{by_name[r["fill"]]["hex"]}" stroke="none"><path d="'
            f"M{x0},{y0} L{x1},{y0} L{x1},{y1} L{x0},{y1} Z\"/></g>")

    out = rel(spec["out_prefix"] + "-flat.svg")
    out.write_text(wrap_svg(groups + type_groups, viewbox,
                            f"{len(colors)} colors; "
                            f"{len(spec['blocks'])} type blocks re-set as outlines."))
    print(f"\nwrote {out}  ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
