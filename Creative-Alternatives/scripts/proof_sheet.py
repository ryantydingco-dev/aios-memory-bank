#!/usr/bin/env python3
"""Proof Sheet Generator — replicates the artist's PDF proof format.

Takes a manifest (JSON) + a composited product image and renders the standard
Creative Alternatives proof sheet: red CA header, date/PO block, centered
title, product shot, imprint spec block, Pantone chip(s), and the
size-variance disclaimer bar. Output: letter-landscape PDF (via headless
Chrome) + the intermediate HTML.

Manifest format (proof.json):
{
  "title": "BACH CLUB - LONG LAKE - HAT MOCKUP",
  "date": "7/18/26",              // optional, defaults to today
  "po": "",                        // optional
  "product_img": "hat.png",        // relative to manifest
  "imprint_size": "Approx. 5\"w",
  "print_location": "Front",
  "print_colors": "PMS 1817 C (to match brim, or close to)",
  "pantones": [{"code": "1817 C", "hex": "#653336"}]
}

Usage:
    python scripts/proof_sheet.py mockups/proof-sheets/<job>/proof.json
    → writes <job>/proof-sheet.html and <job>/proof-sheet.pdf

Pairs with proof_page.py (interactive approval page): generate the sheet PDF
for the file-of-record, and feed the same product image to the proof page for
one-click customer approval.
"""
import base64
import json
import mimetypes
import subprocess
import sys
from datetime import date
from pathlib import Path
from string import Template

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PAGE = Template("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @page { size: letter landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 11in; height: 8.5in; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    padding: 0.35in 0.45in 0.25in;
    display: flex; flex-direction: column;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .topbar { display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0; }
  .brand { color: #e8112d; font-size: 22pt; font-weight: bold; letter-spacing: 0.5px; }
  .meta { color: #e8112d; font-size: 12pt; font-weight: bold; text-align: left; line-height: 1.5; }
  h1.title { color: #e8112d; font-size: 18pt; text-align: center; margin-top: 0.15in; letter-spacing: 1px; flex-shrink: 0; }
  .stage { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; min-height: 0; overflow: hidden; }
  .stage img.product { max-height: 100%; max-width: 7.2in; object-fit: contain; }
  .bottomrow { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 0.3in 0.15in; flex-shrink: 0; }
  .specs { color: #e8112d; font-size: 12.5pt; font-weight: bold; line-height: 1.7; }
  .chips { display: flex; gap: 0.25in; }
  .chip { width: 1.35in; }
  .chip .swatch { width: 1.35in; height: 1.35in; }
  .chip .label { background: #fff; padding: 3px 0 0; }
  .chip .label b { font-size: 10.5pt; letter-spacing: 0.5px; }
  .chip .label span { display: block; font-size: 8.5pt; color: #333; }
  .disclaimer {
    border: 2.5px solid #000; text-align: center; font-weight: bold;
    font-size: 10pt; padding: 4px 6px; line-height: 1.35;
  }
  .disclaimer .hot { color: #ff2fa0; }
</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">CREATIVE ALTERNATIVES</div>
    <div class="meta">DATE: $date<br>PO#: $po</div>
  </div>
  <h1 class="title">$title</h1>
  <div class="stage"><img class="product" src="$product_src" alt="product mockup"></div>
  <div class="bottomrow">
    <div class="specs">
      IMPRINT SIZE OF ART: $imprint_size<br>
      PRINT LOCATION: $print_location<br>
      PRINT COLOR(S): $print_colors
    </div>
    <div class="chips">$chips</div>
  </div>
  <div class="disclaimer">
    DUE TO THE VARIANCE IN GARMENT SIZES, THE VISUAL PROPORTIONS OF DESIGN TO GARMENT ARE APPROXIMATIONS ONLY.<br>
    <span class="hot">*** PRINTED ARTWORK LOOKS LARGER ON A SMALL GARMENT AND SMALLER ON A LARGE GARMENT ***</span><br>
    PLEASE NOTE ACTUAL SIZE DIMENSIONS OF ARTWORK AS STATED ABOVE NEXT TO &ldquo;IMPRINT SIZE OF ART&rdquo;.
  </div>
</body>
</html>""")

CHIP = Template("""<div class="chip">
  <div class="swatch" style="background:$hex;"></div>
  <div class="label"><b>PANTONE&reg;</b><span>$code</span></div>
</div>""")


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(str(path))[0] or "image/png"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    manifest_path = Path(sys.argv[1]).resolve()
    m = json.loads(manifest_path.read_text())
    root = manifest_path.parent

    chips = "".join(
        CHIP.substitute(hex=p["hex"], code=p["code"]) for p in m.get("pantones", [])
    )
    html = PAGE.substitute(
        date=m.get("date") or f"{date.today():%-m/%-d/%y}",
        po=m.get("po", ""),
        title=m["title"],
        product_src=data_uri(root / m["product_img"]),
        imprint_size=m["imprint_size"],
        print_location=m["print_location"],
        print_colors=m["print_colors"],
        chips=chips,
    )
    html_out = root / "proof-sheet.html"
    pdf_out = root / "proof-sheet.pdf"
    html_out.write_text(html)

    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={pdf_out}", str(html_out)],
        check=True, capture_output=True, timeout=60,
    )
    print(f"wrote {html_out}\nwrote {pdf_out}")


if __name__ == "__main__":
    main()
