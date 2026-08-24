from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-0b1f4dd5-d56f-45d4-8169-016acbdf65dc.png"
)
FRONT_ART = ROOT / "athens-5k-front-art-navy-concept.png"
CHAMBER = ROOT / "greater-athens-chamber-one-color.png"
SPONSOR = ROOT / "ut-health-athens-one-color.png"
OUTPUT = ROOT / "athens-5k-race-day-visualization-v5.png"


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


def fit(mark: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(width / mark.width, height / mark.height)
    size = (round(mark.width * scale), round(mark.height * scale))
    return mark.resize(size, Image.Resampling.LANCZOS)


def fabric_place(canvas: Image.Image, mark: Image.Image, center: tuple[int, int], opacity: float = 0.92) -> None:
    mark = mark.convert("RGBA").filter(ImageFilter.GaussianBlur(0.18))
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
            factor = 0.82 + luminance * 0.23
            mark_px[px, py] = (
                min(255, int(r * factor)),
                min(255, int(g * factor)),
                min(255, int(b * factor)),
                int(a * opacity),
            )
    canvas.alpha_composite(mark, (x, y))


def build_partner_lockup(chamber: Image.Image, sponsor: Image.Image) -> Image.Image:
    lockup = Image.new("RGBA", (620, 210), (0, 0, 0, 0))
    draw = ImageDraw.Draw(lockup)
    white = (255, 255, 255, 255)
    draw.text((86, 6), "HOSTED BY", font=font(24, True), fill=white, anchor="ma")
    draw.text((435, 6), "PRESENTED BY", font=font(24, True), fill=white, anchor="ma")
    chamber_mark = fit(chamber, 170, 150)
    sponsor_mark = fit(sponsor, 285, 125)
    lockup.alpha_composite(chamber_mark, (86 - chamber_mark.width // 2, 48))
    lockup.alpha_composite(sponsor_mark, (435 - sponsor_mark.width // 2, 67))
    return lockup


canvas = Image.open(BASE).convert("RGBA")
front = Image.open(FRONT_ART).convert("RGBA")
chamber = Image.open(CHAMBER).convert("RGBA")
sponsor = Image.open(SPONSOR).convert("RGBA")

# Realistic adult-medium scale: about 9.5 x 12.5 inches, starting below collar.
front = fit(front, 218, 294).resize((218, 286), Image.Resampling.LANCZOS)
fabric_place(canvas, front, (500, 609), opacity=0.90)

# One centered upper-back print, about 7.5 inches wide.
partners = build_partner_lockup(chamber, sponsor)
partners = fit(partners, 205, 75)
fabric_place(canvas, partners, (1062, 421), opacity=0.91)

canvas.convert("RGB").save(OUTPUT, quality=96)
print(OUTPUT)
