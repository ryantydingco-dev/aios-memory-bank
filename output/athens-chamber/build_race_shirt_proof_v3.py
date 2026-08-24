from pathlib import Path

from math import cos, pi, sin

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-97bbfc6e-1618-4f96-94b9-932de5585954.png"
)
NAVY_ART = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-867a276e-ab92-439b-9345-3f103c29a52e.png"
)
ORANGE_ART = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-f2be7e2c-4175-4c66-8830-ff986ffc75c0.png"
)
SOURCE_LOGO = ROOT / "2026-bep-5k-logo.png"
CHAMBER_LOGO = ROOT / "greater-athens-chamber-logo.png"
OUTPUT = ROOT / "athens-5k-shirt-production-proof-v5.png"
NAVY_EXPORT = ROOT / "athens-5k-front-art-navy-concept.png"
ORANGE_EXPORT = ROOT / "athens-5k-front-art-orange-concept.png"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    choices = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for choice in choices:
        try:
            return ImageFont.truetype(choice, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def remove_flat_family(source: Image.Image, family: str) -> Image.Image:
    """Knock out the generated preview background while retaining printable inks."""
    rgba = source.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            if family == "navy":
                # Dark blue is the shirt/background and acts as a knockout in the art.
                score = max(0, 105 - max(r, g, b))
                is_bg = b > r * 1.6 and b > g * 1.08 and max(r, g, b) < 118
                alpha = 0 if is_bg and score > 0 else 255
            else:
                # Safety orange is the shirt/background and acts as a knockout.
                is_bg = r > 190 and g < 125 and b < 90 and r > g * 2.0
                alpha = 0 if is_bg else 255
            px[x, y] = (r, g, b, alpha)
    return rgba.filter(ImageFilter.GaussianBlur(0.18))


def sponsor_mark(source: Image.Image) -> Image.Image:
    # Clean one-color redraw of the supplied presenter lockup for proof legibility.
    mark = Image.new("RGBA", (420, 132), (0, 0, 0, 0))
    draw = ImageDraw.Draw(mark)
    white = (255, 255, 255, 255)
    shield = [(20, 13), (100, 13), (94, 70), (60, 111), (26, 70), (20, 13)]
    draw.line(shield, fill=white, width=5, joint="curve")
    points = []
    for index in range(10):
        radius = 23 if index % 2 == 0 else 9
        angle = -pi / 2 + index * pi / 5
        points.append((60 + radius * cos(angle), 53 + radius * sin(angle)))
    draw.polygon(points, fill=white)
    try:
        brand = ImageFont.truetype("/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf", 58)
        place = ImageFont.truetype("/System/Library/Fonts/Supplemental/Times New Roman.ttf", 30)
    except OSError:
        brand = font(58, True)
        place = font(30)
    draw.text((119, 21), "UTHealth", font=brand, fill=white)
    draw.text((121, 78), "Athens", font=place, fill=white)
    return mark


def chamber_mark(source: Image.Image) -> Image.Image:
    """Convert the supplied Chamber seal into a crisp one-color shirt mark."""
    rgba = source.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            darkness = 255 - ((r + g + b) / 3)
            alpha = max(0, min(255, int((darkness - 8) * 4.2)))
            px[x, y] = (255, 255, 255, alpha)
    bbox = rgba.getchannel("A").getbbox()
    return rgba.crop(bbox) if bbox else rgba


def fit_art(art: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / art.width, max_height / art.height)
    size = (round(art.width * scale), round(art.height * scale))
    mark = art.resize(size, Image.Resampling.LANCZOS)
    alpha = ImageEnhance.Contrast(mark.getchannel("A")).enhance(1.04)
    mark.putalpha(alpha.point(lambda value: int(value * 0.94)))
    return mark


def center_place(canvas: Image.Image, mark: Image.Image, center: tuple[int, int]) -> None:
    x = center[0] - mark.width // 2
    y = center[1] - mark.height // 2
    # Let garment highlights and folds subtly influence the ink so the print sits
    # in the fabric instead of floating over it.
    under = canvas.crop((x, y, x + mark.width, y + mark.height)).convert("RGB")
    shaded = mark.copy()
    under_px = under.load()
    mark_px = shaded.load()
    for py in range(shaded.height):
        for px in range(shaded.width):
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
    canvas.alpha_composite(shaded, (x, y))


base = Image.open(BASE).convert("RGBA")
navy_source = Image.open(NAVY_ART).convert("RGBA")
orange_source = Image.open(ORANGE_ART).convert("RGBA")
logo_source = Image.open(SOURCE_LOGO).convert("RGBA")
chamber_source = Image.open(CHAMBER_LOGO).convert("RGBA")

navy_art = remove_flat_family(navy_source, "navy")
orange_art = remove_flat_family(orange_source, "orange")
navy_art.save(NAVY_EXPORT)
orange_art.save(ORANGE_EXPORT)

canvas = Image.new("RGBA", (1536, 1350), (250, 249, 247, 255))
canvas.alpha_composite(base, (0, 165))

# Front: standard full-front event art, safely inside seams and above the hem.
# A slight vertical compression keeps the long illustration within a realistic
# 9.5 x 12.5 inch production footprint.
navy_front = fit_art(navy_art, 225, 322).resize((225, 300), Image.Resampling.LANCZOS)
orange_front = fit_art(orange_art, 225, 322).resize((225, 300), Image.Resampling.LANCZOS)
center_place(canvas, navy_front, (430, 430))
center_place(canvas, orange_front, (430, 915))

sponsor = sponsor_mark(logo_source)
sponsor.save(ROOT / "ut-health-athens-one-color.png")
sponsor_preview = Image.new("RGBA", sponsor.size, (10, 24, 52, 255))
sponsor_preview.alpha_composite(sponsor)
sponsor_preview.convert("RGB").save(ROOT / "ut-health-athens-one-color-preview.png")
chamber = chamber_mark(chamber_source)
chamber.save(ROOT / "greater-athens-chamber-one-color.png")
center_place(canvas, fit_art(chamber, 72, 72), (1030, 363))
center_place(canvas, fit_art(sponsor, 112, 56), (1122, 363))
center_place(canvas, fit_art(chamber, 72, 72), (1030, 848))
center_place(canvas, fit_art(sponsor, 112, 56), (1122, 848))

draw = ImageDraw.Draw(canvas)
ink = (24, 30, 40, 255)
muted = (92, 99, 109, 255)
orange = (239, 86, 27, 255)

draw.text((72, 32), "BLACK-EYED PEA 2026 FUN RUN & 5K", font=font(41, True), fill=ink)
draw.text(
    (72, 84),
    "REIMAGINED PARTICIPANT SHIRT  •  OCTOBER 17, 2026  •  ATHENS, TEXAS",
    font=font(19, True),
    fill=orange,
)

draw.text((72, 137), "COLORWAY 01 — MIDNIGHT NAVY", font=font(19, True), fill=ink)
draw.text((380, 170), "FRONT", font=font(15, True), fill=muted)
draw.text((1040, 170), "BACK", font=font(15, True), fill=muted)
draw.text((998, 309), "HOSTED BY", font=font(10, True), fill=(236, 238, 241, 255))
draw.text((1084, 309), "PRESENTED BY", font=font(10, True), fill=(236, 238, 241, 255))

draw.text((72, 650), "COLORWAY 02 — SAFETY ORANGE", font=font(19, True), fill=ink)
draw.text((380, 683), "FRONT", font=font(15, True), fill=muted)
draw.text((1040, 683), "BACK", font=font(15, True), fill=muted)
draw.text((998, 794), "HOSTED BY", font=font(10, True), fill=(245, 245, 244, 255))
draw.text((1084, 794), "PRESENTED BY", font=font(10, True), fill=(245, 245, 244, 255))

draw.rounded_rectangle((62, 1195, 1474, 1308), radius=16, fill=(237, 237, 234, 255))
draw.text((88, 1216), "PRODUCTION DIRECTION", font=font(17, True), fill=ink)
draw.text(
    (88, 1248),
    "3-color front print (approx. 9.5 x 12.5 in) • 1-color upper-back partner lockup (approx. 7.5 in wide) • Performance tee",
    font=font(17),
    fill=muted,
)
draw.text(
    (88, 1277),
    "Concept artwork will receive final vector cleanup, separations and garment-specific sizing before press approval.",
    font=font(15),
    fill=muted,
)

canvas.convert("RGB").save(OUTPUT, quality=96)
print(OUTPUT)
