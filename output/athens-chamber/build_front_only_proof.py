from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-97bbfc6e-1618-4f96-94b9-932de5585954.png"
)
WHITE_LOGO = ROOT / "supplied-complete-logo-one-color-white.png"
COLOR_LOGO = ROOT / "supplied-complete-logo-two-color.png"
OUTPUT = ROOT / "athens-5k-final-front-only-proof.png"
QA_OUTPUT = ROOT / "athens-5k-final-front-only-alignment-qa.png"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def fit(mark: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(width / mark.width, height / mark.height)
    return mark.resize((round(mark.width * scale), round(mark.height * scale)), Image.Resampling.LANCZOS)


def fabric_place(canvas: Image.Image, mark: Image.Image, center: tuple[int, int]):
    mark = mark.convert("RGBA").filter(ImageFilter.GaussianBlur(0.12))
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
    return x, y, x + mark.width, y + mark.height


base = Image.open(BASE).convert("RGBA")
white_logo = fit(Image.open(WHITE_LOGO).convert("RGBA"), 170, 188)
color_logo = fit(Image.open(COLOR_LOGO).convert("RGBA"), 170, 188)

# Measured front centers in the source garment render.
navy_bounds = fabric_place(base, white_logo, (430, 223))
orange_bounds = fabric_place(base, color_logo, (430, 708))

# Independent front-shirt crops. No backs and no vertically stacked garments.
NAVY_CROP = (95, 0, 765, 500)
ORANGE_CROP = (95, 512, 765, 1012)
navy = base.crop(NAVY_CROP)
orange = base.crop(ORANGE_CROP)

canvas = Image.new("RGBA", (1500, 880), (250, 249, 247, 255))
canvas.alpha_composite(navy, (40, 190))
canvas.alpha_composite(orange, (790, 190))

draw = ImageDraw.Draw(canvas)
ink = (24, 30, 40, 255)
muted = (92, 99, 109, 255)
accent = (239, 86, 27, 255)

draw.text((60, 38), "BLACK-EYED PEA 2026 FUN RUN & 5K", font=font(40, True), fill=ink)
draw.text((60, 88), "FINAL FRONT-ONLY SHIRT PROOF  •  OCTOBER 17, 2026  •  ATHENS, TEXAS", font=font(18, True), fill=accent)

draw.text((375, 150), "MIDNIGHT NAVY", font=font(18, True), fill=ink, anchor="mm")
draw.text((1125, 150), "SAFETY ORANGE", font=font(18, True), fill=ink, anchor="mm")
draw.text((375, 174), "1-color white", font=font(14), fill=muted, anchor="mm")
draw.text((1125, 174), "supplied 2-color art", font=font(14), fill=muted, anchor="mm")

draw.rounded_rectangle((55, 724, 1445, 835), radius=16, fill=(237, 237, 234, 255))
draw.text((82, 746), "PRODUCTION PLACEMENT", font=font(17, True), fill=ink)
draw.text((82, 779), "Complete supplied logo, including UT Health Athens • Approx. 9.5 in wide • Centered on collar/body axis", font=font(16), fill=muted)
draw.text((82, 808), "Approx. 3 in below collar • Equal left/right margins • No back print", font=font(15), fill=muted)

canvas.convert("RGB").save(OUTPUT, quality=96)

# Internal alignment proof: independent centerlines and transformed print bounds.
qa = canvas.copy()
qa_draw = ImageDraw.Draw(qa)
guide = (0, 170, 225, 220)
for x in (375, 1125):
    for y in range(205, 680, 13):
        qa_draw.line((x, y, x, min(y + 7, 680)), fill=guide, width=2)

navy_box = (
    navy_bounds[0] - NAVY_CROP[0] + 40,
    navy_bounds[1] - NAVY_CROP[1] + 190,
    navy_bounds[2] - NAVY_CROP[0] + 40,
    navy_bounds[3] - NAVY_CROP[1] + 190,
)
orange_box = (
    orange_bounds[0] - ORANGE_CROP[0] + 790,
    orange_bounds[1] - ORANGE_CROP[1] + 190,
    orange_bounds[2] - ORANGE_CROP[0] + 790,
    orange_bounds[3] - ORANGE_CROP[1] + 190,
)
qa_draw.rectangle(navy_box, outline=guide, width=2)
qa_draw.rectangle(orange_box, outline=guide, width=2)
qa_draw.text((1430, 700), "QA GUIDES — NOT CUSTOMER FACING", font=font(11, True), fill=guide, anchor="ra")
qa.convert("RGB").save(QA_OUTPUT, quality=96)

print(OUTPUT)
print(QA_OUTPUT)
