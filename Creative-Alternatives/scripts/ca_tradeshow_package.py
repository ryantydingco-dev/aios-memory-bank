#!/usr/bin/env python3
"""
CA tradeshow package builder — the missing last mile.

Every discovery engine dumps leads.json; nothing turns them into an outreach-ready
wedge. This does: from a scored tradeshow run it renders house-style SVG booth-swag
mockups per target (tumbler / multi-tool / cap), writes a per-company proof.json, and
(via proof_page.py) an offline HTML proof page the reply-stage motion can send.

It does NOT write email copy or send anything — the drafted emails live in the run's
outbound.json (authored by Claude in-session, human-reviewed) and staging is /ca-outbound.

Usage:
  python scripts/ca_tradeshow_package.py build --run tradeshow-cedia-2026 \
      --targets "Blackwire Designs,AiSPIRE/WAC,Acoustic Innovations,Airzone"

SVG mockups are placeholder wedges (house-standard, like proofs/_sample/*.svg). The
photorealistic trio (Higgsfield nano_banana_2 -> Gamma lookbook, see
pillars/2-customer-acquisition/mockup-lead-magnet-sop.md) is the human render step and
needs an interactive session with higgsfield auth. These SVGs make the structure real
and are usable as the LinkedIn/proof-page tease until the photoreal render is done.
"""
import argparse
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "outputs", "ca-outbound")

# House palette (matches proofs/_sample + brand)
CREAM = "#f4f1ea"
INK = "#1a2a4a"
ACCENT = "#c0392b"
STEEL = "#5b6b7a"


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _wrap(name, limit=18):
    """Split a long company name onto <=2 lines for the print area."""
    if len(name) <= limit:
        return [name]
    words = name.split()
    line1, line2 = [], []
    for w in words:
        if len(" ".join(line1 + [w])) <= limit or not line1:
            line1.append(w)
        else:
            line2.append(w)
    return [" ".join(line1)] + ([" ".join(line2)] if line2 else [])


def _logo_block(cx, cy, name, size=22, fill=None):
    fill = fill or ACCENT
    lines = _wrap(name)
    dy0 = -(len(lines) - 1) * (size * 0.62)
    out = []
    for i, ln in enumerate(lines):
        y = cy + dy0 + i * (size * 1.24)
        out.append(
            f'<text x="{cx}" y="{y:.0f}" fill="{fill}" font-family="Helvetica,Arial,sans-serif" '
            f'font-size="{size}" font-weight="700" text-anchor="middle" '
            f'letter-spacing="0.5">{ln}</text>'
        )
    return "\n  ".join(out)


def svg_tumbler(name, theme_word="CEDIA EXPO 2026"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="{CREAM}"/>
  <!-- tumbler body -->
  <path d="M235 70 h130 l-10 250 a55 20 0 0 1 -110 0 z" fill="#20303f" stroke="#0d1720" stroke-width="2"/>
  <ellipse cx="300" cy="70" rx="65" ry="18" fill="#2b3f52" stroke="#0d1720" stroke-width="2"/>
  <ellipse cx="300" cy="70" rx="52" ry="12" fill="#16222e"/>
  <!-- lid -->
  <rect x="245" y="44" width="110" height="20" rx="8" fill="#0f1a24"/>
  <!-- print area -->
  {_logo_block(300, 190, name, size=22, fill="#ffffff")}
  <text x="300" y="235" fill="{STEEL}" font-family="Helvetica,Arial,sans-serif" font-size="11" text-anchor="middle" letter-spacing="2">{theme_word}</text>
  <!-- caption -->
  <text x="300" y="372" fill="{INK}" font-family="Helvetica,Arial,sans-serif" font-size="16" font-weight="700" text-anchor="middle">20oz Insulated Tumbler — Booth Giveaway</text>
</svg>'''


def svg_multitool(name, theme_word="CEDIA EXPO 2026"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="{CREAM}"/>
  <!-- pouch -->
  <rect x="180" y="90" width="240" height="180" rx="16" fill="#1f2b38" stroke="#0d1720" stroke-width="2"/>
  <rect x="180" y="90" width="240" height="42" rx="16" fill="#2a3a4a"/>
  <line x1="180" y1="132" x2="420" y2="132" stroke="#0d1720" stroke-width="2"/>
  <!-- zipper -->
  <line x1="196" y1="111" x2="404" y2="111" stroke="#8a97a3" stroke-width="3" stroke-dasharray="4 4"/>
  <!-- print area -->
  {_logo_block(300, 190, name, size=24, fill="#ffffff")}
  <text x="300" y="228" fill="{STEEL}" font-family="Helvetica,Arial,sans-serif" font-size="11" text-anchor="middle" letter-spacing="2">{theme_word}</text>
  <text x="300" y="372" fill="{INK}" font-family="Helvetica,Arial,sans-serif" font-size="16" font-weight="700" text-anchor="middle">Cable / Tool Pouch — Installer's Grab-Bag</text>
</svg>'''


def svg_cap(name, theme_word="CEDIA EXPO 2026"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="{CREAM}"/>
  <!-- cap crown -->
  <path d="M170 210 a130 120 0 0 1 260 0 z" fill="#20303f" stroke="#0d1720" stroke-width="2"/>
  <!-- brim -->
  <path d="M300 210 q150 12 168 44 q-10 20 -60 20 l-108 -22 z" fill="#16222e" stroke="#0d1720" stroke-width="2"/>
  <!-- button -->
  <circle cx="300" cy="96" r="7" fill="#2b3f52"/>
  <!-- front panel print -->
  {_logo_block(300, 170, name, size=20, fill="#ffffff")}
  <text x="300" y="200" fill="{STEEL}" font-family="Helvetica,Arial,sans-serif" font-size="10" text-anchor="middle" letter-spacing="2">{theme_word}</text>
  <text x="300" y="372" fill="{INK}" font-family="Helvetica,Arial,sans-serif" font-size="16" font-weight="700" text-anchor="middle">Embroidered Cap — Staff + Giveaway</text>
</svg>'''


ITEMS = [
    ("tumbler", "20oz Insulated Tumbler — Cream/Steel", "Full-wrap print, matte finish", svg_tumbler),
    ("multitool", "Cable / Tool Pouch — Charcoal", "1-color logo, front panel", svg_multitool),
    ("cap", "Embroidered Cap — Navy", "Left-front embroidery, white thread", svg_cap),
]


def build(run, target_names):
    run_dir = os.path.join(OUT, run)
    leads = json.load(open(os.path.join(run_dir, "leads.json")))
    by_name = {l.get("company_name"): l for l in leads}
    made = []
    for name in target_names:
        lead = by_name.get(name)
        if not lead:
            print(f"  ! {name}: not found in leads.json, skipping")
            continue
        s = slug(name)
        mdir = os.path.join(run_dir, "mockups", s)
        os.makedirs(mdir, exist_ok=True)
        show = lead.get("show", "the show")
        theme_word = re.sub(r"\s+", " ", show).upper()
        items_manifest = []
        for iid, title, note, fn in ITEMS:
            svg = fn(name, theme_word=theme_word)
            path = os.path.join(mdir, f"{iid}.svg")
            with open(path, "w") as f:
                f.write(svg)
            items_manifest.append({"id": iid, "title": title, "img": f"{iid}.svg", "note": note})
        # proof.json for proof_page.py
        proof = {
            "client": name,
            "contact_name": (lead.get("first_name") or "there"),
            "project": f"{show} Booth Program",
            "round": 1,
            "reply_to": "maclaine@creativealternatives.com",
            "items": items_manifest,
        }
        with open(os.path.join(mdir, "proof.json"), "w") as f:
            json.dump(proof, f, indent=2)
        # render the offline proof page
        try:
            subprocess.run(
                [sys.executable, os.path.join(HERE, "scripts", "proof_page.py"),
                 os.path.join(mdir, "proof.json")],
                check=True, capture_output=True, text=True,
            )
            page = os.path.join(mdir, "proof-round-1.html")
        except subprocess.CalledProcessError as e:
            page = f"(proof_page.py failed: {e.stderr.strip()[:120]})"
        made.append({"company": name, "slug": s, "mockups_dir": mdir, "proof_page": page})
        print(f"  ✓ {name}: 3 SVG mockups + proof page")
    # index
    idx = os.path.join(run_dir, "mockups", "index.json")
    with open(idx, "w") as f:
        json.dump(made, f, indent=2)
    print(f"\nWrote {len(made)} mockup packages → {os.path.join(run_dir, 'mockups')}")
    return made


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build")
    b.add_argument("--run", required=True)
    b.add_argument("--targets", required=True, help="comma-separated company_name values from leads.json")
    a = ap.parse_args()
    if a.cmd == "build":
        names = [t.strip() for t in a.targets.split(",") if t.strip()]
        build(a.run, names)


if __name__ == "__main__":
    main()
