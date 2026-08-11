#!/usr/bin/env python3
"""
Composite a customer's EXACT logo onto a real product photo (virtual sample).
The logo is overlaid at full fidelity — never AI-redrawn — so letterforms stay pixel-exact.

Usage:
    python3 mockup_logo.py PRODUCT.jpg LOGO.png OUT.png [--color 23,42,74] [--scale 0.34] [--y 0.32]

- PRODUCT: real product photo (supplier image from SanMar/S&S/alphabroder is ideal; CA's real catalog).
- LOGO:    transparent PNG of the customer's logo (auto-pulled from their website — see fetch_logo notes).
- --color: recolor the logo to this RGB (for contrast on the garment). Omit to keep original colors.
- --scale: logo width as fraction of product width (chest print ~0.30-0.36).
- --y:     vertical placement of logo top as fraction of product height.

Logo source: most customer sites expose the logo as an <img>/og:image. For Wix sites,
strip the /v1/fill/... transform to get the original PNG. logo.dev / Clearbit by domain are fallbacks.
"""
import sys
from PIL import Image

def composite(product_path, logo_path, out_path, color=None, scale=0.34, ytop=0.32):
    prod = Image.open(product_path).convert('RGB')
    W, H = prod.size
    logo = Image.open(logo_path).convert('RGBA')
    alpha = logo.split()[3]
    if color:
        flat = Image.new('RGBA', logo.size, (*color, 255))
        flat.putalpha(alpha)
        logo = flat
    logo = logo.crop(alpha.getbbox())
    tw = int(W * scale)
    logo = logo.resize((tw, int(logo.height * tw / logo.width)), Image.LANCZOS)
    a = logo.split()[3].point(lambda p: int(p * 0.93))   # reads as print, not sticker
    logo.putalpha(a)
    prod.paste(logo, (W // 2 - logo.width // 2, int(H * ytop)), logo)
    prod.save(out_path)
    return out_path

if __name__ == '__main__':
    args = sys.argv[1:]
    color = None; scale = 0.34; ytop = 0.32
    pos = [a for a in args if not a.startswith('--')]
    if '--color' in args: color = tuple(int(x) for x in args[args.index('--color')+1].split(','))
    if '--scale' in args: scale = float(args[args.index('--scale')+1])
    if '--y' in args: ytop = float(args[args.index('--y')+1])
    print(composite(pos[0], pos[1], pos[2], color, scale, ytop))
