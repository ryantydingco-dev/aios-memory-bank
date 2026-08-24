from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-0b1f4dd5-d56f-45d4-8169-016acbdf65dc.png"
)
LOGO = ROOT / "supplied-complete-logo-one-color-white.png"
OUTPUT = ROOT / "athens-5k-final-race-day-visualization.png"
QA_OUTPUT = ROOT / "athens-5k-final-race-day-alignment-qa.png"


def fit(mark: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(width / mark.width, height / mark.height)
    size = (round(mark.width * scale), round(mark.height * scale))
    return mark.resize(size, Image.Resampling.LANCZOS)


def fabric_place(canvas: Image.Image, mark: Image.Image, center: tuple[int, int], opacity: float = 0.90):
    mark = mark.convert("RGBA").filter(ImageFilter.GaussianBlur(0.14))
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
            factor = 0.84 + luminance * 0.18
            mark_px[px, py] = (
                min(255, int(r * factor)),
                min(255, int(g * factor)),
                min(255, int(b * factor)),
                int(a * opacity),
            )
    canvas.alpha_composite(mark, (x, y))
    return x, y, x + mark.width, y + mark.height


canvas = Image.open(BASE).convert("RGBA")
logo = Image.open(LOGO).convert("RGBA")

# Adult-medium model body width is approx. 490 px at the print line.
# 9.5 / 20.5 of that width = 227 px. Collar/body centerline = x 500.
mark = fit(logo, 227, 252)
bounds = fabric_place(canvas, mark, (500, 605), opacity=0.90)
canvas.convert("RGB").save(OUTPUT, quality=96)

qa = canvas.copy()
from PIL import ImageDraw
draw = ImageDraw.Draw(qa)
guide = (0, 220, 255, 220)
for y in range(365, 960, 14):
    draw.line((500, y, 500, min(y + 7, 960)), fill=guide, width=2)
draw.rectangle(bounds, outline=guide, width=2)
qa.convert("RGB").save(QA_OUTPUT, quality=96)

print(OUTPUT)
print(QA_OUTPUT)
