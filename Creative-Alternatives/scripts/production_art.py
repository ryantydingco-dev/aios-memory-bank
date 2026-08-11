#!/usr/bin/env python3
"""Production Art Generator — printer-ready VECTOR art for text lockups.

The other half of the artist's job (proof_sheet.py makes the proof; this makes
the art file the printer runs). Builds a true vector lockup — arched headline
+ script subline — as SVG, then renders a vector PDF at the EXACT imprint size
via headless Chrome (fonts embedded). No raster, no AI: this is real
production art for screen print / transfer / promo imprints.

Spec format (art.json):
{
  "headline": "BACH CLUB",
  "subline": "Long Lake, WA",
  "color_hex": "#653336",
  "pms": "1817 C",
  "width_in": 5.0,               // exact imprint width
  "height_in": 3.0,
  "headline_font": "Bodoni 72",  // tall Didone serif (artist-style)
  "subline_font": "Snell Roundhand",
  "arch": 0.35                   // 0 = straight, 1 = strong arch
}

Usage:
    python scripts/production_art.py mockups/proof-sheets/<job>/art.json
    → writes <job>/art.svg and <job>/art-production.pdf (vector, exact size)

Scope: text lockups + recolors/resizes — the routine 80% of art jobs.
Customer-supplied logos: use their vector file directly; raster logos need
vectorization (flag for the artist if complex).
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path
from string import Template

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

SVG = Template("""<svg xmlns="http://www.w3.org/2000/svg"
     width="${w}in" height="${h}in" viewBox="0 0 ${W} ${H}">
  <!-- PRODUCTION ART — imprint ${w}in x ${h}in — PMS ${pms} (${color}) -->
  <defs>
    <path id="arch" d="M ${arch_x0},${arch_y} Q ${arch_mx},${arch_top} ${arch_x1},${arch_y}" fill="none"/>
  </defs>
  <g transform="scale(1,${stretch})" transform-origin="${mx} ${headline_oy}">
    <text font-family="'${headline_font}'" font-size="${headline_px}"
          font-weight="bold" fill="${color}" letter-spacing="${lsp}">
      <textPath href="#arch" startOffset="50%" text-anchor="middle">${headline}</textPath>
    </text>
  </g>
  <text x="${mx}" y="${subline_y}" font-family="'${subline_font}'"
        font-size="${subline_px}" fill="${color}" text-anchor="middle">${subline}</text>
</svg>""")

HTML = Template("""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: ${w}in ${h}in; margin: 0; }
  * { margin: 0; padding: 0; }
</style></head><body>$svg</body></html>""")


def build(spec: dict) -> str:
    w, h = float(spec["width_in"]), float(spec.get("height_in", spec["width_in"] * 0.6))
    W, H = w * 100, h * 100  # viewBox units: 100/inch
    arch = float(spec.get("arch", 0.35))
    headline_px = min(H * 0.34, (W * 0.92) / (len(spec["headline"]) * 0.66))
    arch_y = H * 0.52
    return SVG.substitute(
        w=w, h=h, W=W, H=H,
        mx=W / 2,
        color=spec["color_hex"], pms=spec.get("pms", "?"),
        headline=spec["headline"], subline=spec.get("subline", ""),
        headline_font=spec.get("headline_font", "Bodoni 72"),
        subline_font=spec.get("subline_font", "Snell Roundhand"),
        headline_px=headline_px,
        subline_px=H * 0.17,
        lsp=headline_px * 0.04,
        stretch=1.35,
        headline_oy=arch_y - headline_px * 0.4,
        arch_y=arch_y, arch_x0=W * 0.02, arch_x1=W * 0.98,
        arch_mx=W / 2, arch_top=arch_y - H * arch * 0.45,
        subline_y=H * 0.82,
    )


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    spec_path = Path(sys.argv[1]).resolve()
    spec = json.loads(spec_path.read_text())
    root = spec_path.parent

    svg = build(spec)
    (root / "art.svg").write_text(svg)
    html = root / "_art.html"
    html.write_text(HTML.substitute(svg=svg, w=spec["width_in"],
                                    h=spec.get("height_in", spec["width_in"] * 0.6)))
    pdf = root / "art-production.pdf"
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={pdf}", str(html)],
        check=True, capture_output=True, timeout=60,
    )
    html.unlink()
    print(f"wrote {root/'art.svg'}\nwrote {pdf}  (vector, {spec['width_in']}in wide, PMS {spec.get('pms')})")

    # Printer-final: convert embedded-font text to pure vector outlines.
    # pdffonts on the result should list ZERO fonts.
    gs = shutil.which("gs") or "/opt/homebrew/bin/gs"
    if Path(gs).exists():
        outlined = root / "art-outlined.pdf"
        subprocess.run(
            [gs, "-q", "-o", str(outlined), "-sDEVICE=pdfwrite",
             "-dNoOutputFonts", str(pdf)],
            check=True, capture_output=True, timeout=60,
        )
        print(f"wrote {outlined}  (text converted to outlines — send THIS to the printer)")
    else:
        print("ghostscript not found — skipped outline conversion (brew install ghostscript)")


if __name__ == "__main__":
    main()
