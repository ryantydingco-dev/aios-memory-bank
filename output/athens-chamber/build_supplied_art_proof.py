from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-97bbfc6e-1618-4f96-94b9-932de5585954.png"
)
SOURCE = ROOT / "2026-bep-5k-logo.png"
OUTPUT = ROOT / "athens-5k-supplied-art-production-proof-v1.png"
FRONT_WHITE = ROOT / "supplied-fun-run-front-one-color-white.png"
FRONT_COLOR = ROOT / "supplied-fun-run-front-two-color.png"
UT_WHITE = ROOT / "supplied-ut-health-athens-one-color-white.png"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    choices = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
    ]
    for choice in choices:
        try:
            return ImageFont.truetype(choice, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def remove_orange_background(
    crop: Image.Image,
    bg: tuple[int, int, int],
    white_only: bool,
    source_white_only: bool = False,
) -> Image.Image:
    rgba = crop.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            distance = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            alpha = max(0, min(255, int((distance - 6) * 7.5)))
            if source_white_only and (r + g + b) / 3 < 190:
                alpha = 0
            if white_only:
                px[x, y] = (255, 255, 255, alpha)
            else:
                px[x, y] = (r, g, b, alpha)
    alpha = rgba.getchannel("A").filter(ImageFilter.GaussianBlur(0.18))
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    return rgba.crop(bbox) if bbox else rgba


def fit(mark: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / mark.width, max_height / mark.height)
    size = (round(mark.width * scale), round(mark.height * scale))
    mark = mark.resize(size, Image.Resampling.LANCZOS)
    alpha = ImageEnhance.Contrast(mark.getchannel("A")).enhance(1.03)
    mark.putalpha(alpha.point(lambda value: int(value * 0.94)))
    return mark


def fabric_place(canvas: Image.Image, mark: Image.Image, center: tuple[int, int]) -> None:
    x = center[0] - mark.width // 2
    y = center[1] - mark.height // 2
    under = canvas.crop((x, y, x + mark.width, y + mark.height)).convert("RGB")
    under_px = under.load()
    mark_px = mark.load()
    for py in range(mark.height):
        for px in range(mark.width):
            r, g, b, a = mark_px[px, py]
            if a == 0:
                continue
            ur, ug, ub = under_px[px, py]
            luminance = (ur * 0.2126 + ug * 0.7152 + ub * 0.0722) / 255
            factor = 0.86 + luminance * 0.18
            mark_px[px, py] = (
                min(255, int(r * factor)),
                min(255, int(g * factor)),
                min(255, int(b * factor)),
                a,
            )
    canvas.alpha_composite(mark, (x, y))


source = Image.open(SOURCE).convert("RGBA")
bg = source.getpixel((0, 0))[:3]

# Keep only the supplied event lockup on the front; sponsor is moved to the back.
event_crop = source.crop((48, 18, 452, 294))
front_white = remove_orange_background(event_crop, bg, white_only=True)
front_color = remove_orange_background(event_crop, bg, white_only=False)

# Exact UT Health Athens lockup from the supplied file.
ut_crop = source.crop((103, 292, 400, 433))
ut_white = remove_orange_background(ut_crop, bg, white_only=True, source_white_only=True)

front_white.save(FRONT_WHITE)
front_color.save(FRONT_COLOR)
ut_white.save(UT_WHITE)

base = Image.open(BASE).convert("RGBA")
canvas = Image.new("RGBA", (1536, 1350), (250, 249, 247, 255))
canvas.alpha_composite(base, (0, 165))

# Standard adult placement: roughly 9.5 inches wide, three inches below collar.
fabric_place(canvas, fit(front_white, 225, 190), (430, 402))
fabric_place(canvas, fit(front_color, 225, 190), (430, 887))

# Small, centered upper-back sponsor print: roughly 4.5 inches wide.
fabric_place(canvas, fit(ut_white, 118, 60), (1087, 350))
fabric_place(canvas, fit(ut_white.copy(), 118, 60), (1087, 835))

draw = ImageDraw.Draw(canvas)
ink = (24, 30, 40, 255)
muted = (92, 99, 109, 255)
orange = (239, 86, 27, 255)

draw.text((72, 32), "BLACK-EYED PEA 2026 FUN RUN & 5K", font=font(41, True), fill=ink)
draw.text(
    (72, 84),
    "SUPPLIED ARTWORK PLACEMENT  •  OCTOBER 17, 2026  •  ATHENS, TEXAS",
    font=font(19, True),
    fill=orange,
)
draw.text((72, 137), "COLORWAY 01 — MIDNIGHT NAVY / 1-COLOR FRONT", font=font(19, True), fill=ink)
draw.text((380, 170), "FRONT", font=font(15, True), fill=muted)
draw.text((1040, 170), "BACK", font=font(15, True), fill=muted)
draw.text((72, 650), "COLORWAY 02 — SAFETY ORANGE / SUPPLIED 2-COLOR FRONT", font=font(19, True), fill=ink)
draw.text((380, 683), "FRONT", font=font(15, True), fill=muted)
draw.text((1040, 683), "BACK", font=font(15, True), fill=muted)

draw.rounded_rectangle((62, 1195, 1474, 1308), radius=16, fill=(237, 237, 234, 255))
draw.text((88, 1216), "PRODUCTION DIRECTION", font=font(17, True), fill=ink)
draw.text(
    (88, 1248),
    "Supplied Fun Run art: approx. 9.5 in wide front • Supplied UT Health Athens: approx. 4.5 in wide upper back • Performance tee",
    font=font(16),
    fill=muted,
)
draw.text(
    (88, 1277),
    "Artwork content is unchanged. Cleanup is limited to background removal, edge refinement, separation and placement.",
    font=font(15),
    fill=muted,
)

canvas.convert("RGB").save(OUTPUT, quality=96)
print(OUTPUT)
