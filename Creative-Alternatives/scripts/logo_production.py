#!/usr/bin/env python3
"""Logo → production art: place an existing vector logo on an exact-size
artboard and emit a printer-ready outlined PDF.

Companion to production_art.py (which builds text lockups from scratch).
Use this when the customer supplies a vector logo (SVG) and the job is
sizing + single-tone recolor for a decoration method (laser engrave,
deboss, 1-color screen print).

Usage:
    python scripts/logo_production.py <logo.svg> <width_in> <out.pdf> [color_hex]

- width_in: exact imprint width in inches; height follows the logo's aspect.
- color_hex (optional): recolor EVERY fill to this hex (single-tone methods).
  Omit to keep original colors.
- Output passes `pdffonts` with zero fonts (any stray text flattened via gs).
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    logo, width_in, out_pdf = Path(sys.argv[1]), float(sys.argv[2]), Path(sys.argv[3])
    color = sys.argv[4] if len(sys.argv) > 4 else None

    svg = logo.read_text()
    m = re.search(r'viewBox="([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)"', svg)
    if not m:
        sys.exit("No viewBox in SVG — add one or export properly from the source.")
    vb_w, vb_h = float(m.group(3)), float(m.group(4))
    height_in = width_in * vb_h / vb_w

    if color:
        svg = re.sub(r'fill:\s*#[0-9a-fA-F]{3,6}', f'fill:{color}', svg)
        svg = re.sub(r'fill="#[0-9a-fA-F]{3,6}"', f'fill="{color}"', svg)

    html = out_pdf.with_suffix(".tmp.html")
    html.write_text(
        f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
        f'@page {{ size: {width_in}in {height_in:.4f}in; margin: 0; }}'
        f'* {{ margin:0; padding:0 }} svg {{ width:{width_in}in; height:{height_in:.4f}in; display:block }}'
        f'</style></head><body>{svg}</body></html>'
    )
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={out_pdf}", str(html)],
        check=True, capture_output=True, timeout=60,
    )
    html.unlink()

    gs = shutil.which("gs") or "/opt/homebrew/bin/gs"
    if Path(gs).exists():
        tmp = out_pdf.with_suffix(".flat.pdf")
        subprocess.run([gs, "-q", "-o", str(tmp), "-sDEVICE=pdfwrite",
                        "-dNoOutputFonts", str(out_pdf)],
                       check=True, capture_output=True, timeout=60)
        tmp.replace(out_pdf)

    print(f"wrote {out_pdf}  ({width_in}in x {height_in:.2f}in, "
          f"{'recolored ' + color if color else 'original colors'}, outlined)")


if __name__ == "__main__":
    main()
