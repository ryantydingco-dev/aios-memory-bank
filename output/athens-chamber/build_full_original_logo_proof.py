from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-97bbfc6e-1618-4f96-94b9-932de5585954.png"
)
SOURCE = ROOT / "2026-bep-5k-logo.png"
OUTPUT = ROOT / "athens-5k-final-production-proof.png"
QA_OUTPUT = ROOT / "athens-5k-final-alignment-qa.png"
FULL_WHITE = ROOT / "supplied-complete-logo-one-color-white.png"
FULL_COLOR = ROOT / "supplied-complete-logo-two-color.png"


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


def clean_logo(crop: Image.Image, bg: tuple[int, int, int], one_color: bool) -> Image.Image:
    rgba = crop.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            distance = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            alpha = max(0, min(255, int((distance - 5) * 8.0)))
            px[x, y] = (255, 255, 255, alpha) if one_color else (r, g, b, alpha)
    alpha = rgba.getchannel("A").filter(ImageFilter.GaussianBlur(0.16))
    alpha = ImageEnhance.Contrast(alpha).enhance(1.05)
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    return rgba.crop(bbox) if bbox else rgba


def fit(mark: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / mark.width, max_height / mark.height)
    size = (round(mark.width * scale), round(mark.height * scale))
    return mark.resize(size, Image.Resampling.LANCZOS)


def fabric_place(canvas: Image.Image, mark: Image.Image, center: tuple[int, int]) -> tuple[int, int, int, int]:
    x = round(center[0] - mark.width / 2)
    y = round(center[1] - mark.height / 2)
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
            factor = 0.87 + luminance * 0.15
            mark_px[px, py] = (
                min(255, int(r * factor)),
                min(255, int(g * factor)),
                min(255, int(b * factor)),
                int(a * 0.93),
            )
    canvas.alpha_composite(mark, (x, y))
    return (x, y, x + mark.width, y + mark.height)


source = Image.open(SOURCE).convert("RGBA")
bg = source.getpixel((0, 0))[:3]
complete_crop = source.crop((45, 20, 455, 438))
logo_white = clean_logo(complete_crop, bg, one_color=True)
logo_color = clean_logo(complete_crop, bg, one_color=False)
logo_white.save(FULL_WHITE)
logo_color.save(FULL_COLOR)

base = Image.open(BASE).convert("RGBA")
canvas = Image.new("RGBA", (1536, 1350), (250, 249, 247, 255))
canvas.alpha_composite(base, (0, 165))

# Shirt centerlines measured from collar and body geometry in the supplied blank.
FRONT_X = 430
BACK_X = 1087
TOP_FRONT_CENTER_Y = 388
BOTTOM_FRONT_CENTER_Y = 873

# Approx. 9.5-inch imprint on an adult-medium 20.5-inch body width.
# At this rendered scale that is 170 px, not the previous 225+ px.
navy_mark = fit(logo_white, 170, 188)
orange_mark = fit(logo_color, 170, 188)
navy_bounds = fabric_place(canvas, navy_mark, (FRONT_X, TOP_FRONT_CENTER_Y))
orange_bounds = fabric_place(canvas, orange_mark, (FRONT_X, BOTTOM_FRONT_CENTER_Y))

draw = ImageDraw.Draw(canvas)
ink = (24, 30, 40, 255)
muted = (92, 99, 109, 255)
orange = (239, 86, 27, 255)

draw.text((72, 32), "BLACK-EYED PEA 2026 FUN RUN & 5K", font=font(41, True), fill=ink)
draw.text(
    (72, 84),
    "FINAL SUPPLIED-ARTWORK PLACEMENT  •  OCTOBER 17, 2026  •  ATHENS, TEXAS",
    font=font(19, True),
    fill=orange,
)
draw.text((72, 137), "COLORWAY 01 — MIDNIGHT NAVY / 1-COLOR WHITE", font=font(19, True), fill=ink)
draw.text((380, 170), "FRONT", font=font(15, True), fill=muted)
draw.text((1040, 170), "BACK — BLANK", font=font(15, True), fill=muted)
draw.text((72, 650), "COLORWAY 02 — SAFETY ORANGE / SUPPLIED 2-COLOR ART", font=font(19, True), fill=ink)
draw.text((380, 683), "FRONT", font=font(15, True), fill=muted)
draw.text((1040, 683), "BACK — BLANK", font=font(15, True), fill=muted)

draw.rounded_rectangle((62, 1195, 1474, 1308), radius=16, fill=(237, 237, 234, 255))
draw.text((88, 1216), "PRODUCTION DIRECTION", font=font(17, True), fill=ink)
draw.text(
    (88, 1248),
    "Complete supplied logo, including UT Health Athens • Approx. 9.5 in wide • Centered 3 in below collar • Back blank",
    font=font(16),
    fill=muted,
)
draw.text(
    (88, 1277),
    "Artwork content is unchanged. Cleanup is limited to background removal, edge refinement, color separation and measured placement.",
    font=font(15),
    fill=muted,
)

canvas.convert("RGB").save(OUTPUT, quality=96)

# Separate internal QA proof with centerlines and equal-distance checks.
qa = canvas.copy()
qa_draw = ImageDraw.Draw(qa)
guide = (0, 160, 220, 210)
for center_x, y1, y2 in [(FRONT_X, 205, 647), (FRONT_X, 690, 1132), (BACK_X, 205, 647), (BACK_X, 690, 1132)]:
    for y in range(y1, y2, 12):
        qa_draw.line((center_x, y, center_x, min(y + 6, y2)), fill=guide, width=2)
for bounds in [navy_bounds, orange_bounds]:
    qa_draw.rectangle(bounds, outline=guide, width=2)
    cx = round((bounds[0] + bounds[2]) / 2)
    qa_draw.line((cx - 8, (bounds[1] + bounds[3]) // 2, cx + 8, (bounds[1] + bounds[3]) // 2), fill=guide, width=2)
qa_draw.text((1250, 1158), "QA GUIDES — NOT CUSTOMER FACING", font=font(12, True), fill=guide, anchor="ra")
qa.convert("RGB").save(QA_OUTPUT, quality=96)

print(OUTPUT)
print(QA_OUTPUT)
