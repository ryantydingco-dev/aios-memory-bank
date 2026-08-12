#!/usr/bin/env python3
"""Real type -> SVG outlines, fitted to an exact footprint.

The QC rule is never ship traced AI lettering. Re-setting it means placing real
type into the exact box the traced lettering occupied, so the rebuilt art still
matches what the customer approved. This pulls glyph outlines straight out of a
TTF via fontTools, so the result is outlines in the SVG — no font dependency,
and `pdffonts` stays at zero downstream.

Used as a module by job scripts:

    ts = TypeSetter("reference/fonts/Anton-Regular.ttf")
    svg = ts.run("LIFEGUARDS ONLY", cap_px=65, x=65, baseline_y=1063,
                 fit_width=795, fill="#0D2849")
"""
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont


class TypeSetter:
    def __init__(self, font_path):
        self.font = TTFont(font_path)
        self.glyphs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.upem = self.font["head"].unitsPerEm
        cap = getattr(self.font.get("OS/2"), "sCapHeight", 0) or 0
        if not cap:  # not every face declares it — measure the H
            name = self.cmap.get(ord("H"))
            cap = self.font["glyf"][name].yMax if name else int(self.upem * 0.7)
        self.cap_height = cap

    def _glyph(self, ch):
        name = self.cmap.get(ord(ch))
        if name is None:
            raise KeyError(f"{ch!r} missing from font")
        pen = SVGPathPen(self.glyphs)
        self.glyphs[name].draw(pen)
        return pen.getCommands(), self.font["hmtx"][name][0]

    def natural_width(self, text, tracking_em=0.0):
        """Run width in font units at the given tracking."""
        w = 0
        for i, ch in enumerate(text):
            adv = self.upem * 0.28 if ch == " " else self._glyph(ch)[1]
            w += adv
            if i < len(text) - 1:
                w += tracking_em * self.upem
        return w

    def run(self, text, cap_px, x, baseline_y, fill, fit_width=None,
            tracking_em=0.0, rotate=0.0, letter_fills=None):
        """Return an SVG <g> of outlined glyphs.

        cap_px      cap height in output units
        x           left edge of the run
        baseline_y  baseline in output units (y-down)
        fit_width   if given, tracking is solved so the run spans exactly this
                    width — that's what keeps the rebuilt block on the same
                    footprint as the lettering it replaces
        rotate      degrees, clockwise, about the run's left baseline point
        """
        s = cap_px / self.cap_height
        if fit_width is not None and len(text) > 1:
            base = self.natural_width(text, 0.0)
            gaps = len(text) - 1
            tracking_em = ((fit_width / s) - base) / gaps / self.upem

        parts, pen_x = [], 0.0
        for i, ch in enumerate(text):
            if ch == " ":
                pen_x += self.upem * 0.28 + tracking_em * self.upem
                continue
            d, adv = self._glyph(ch)
            if d.strip():
                f = (letter_fills or {}).get(i, fill)
                parts.append(f'<path transform="translate({pen_x:.2f},0)" '
                             f'fill="{f}" d="{d}"/>')
            pen_x += adv + (tracking_em * self.upem if i < len(text) - 1 else 0)

        rot = f" rotate({rotate})" if rotate else ""
        return (f'<g transform="translate({x:.2f},{baseline_y:.2f}){rot} '
                f'scale({s:.6f},{-s:.6f})" fill="{fill}" stroke="none">\n'
                + "\n".join(parts) + "\n</g>")

    def measure(self, text, cap_px, tracking_em=0.0):
        s = cap_px / self.cap_height
        return self.natural_width(text, tracking_em) * s
