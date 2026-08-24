from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-0b1f4dd5-d56f-45d4-8169-016acbdf65dc.png"
)
FRONT = ROOT / "supplied-fun-run-front-one-color-white.png"
UT_HEALTH = ROOT / "supplied-ut-health-athens-one-color-white.png"
OUTPUT = ROOT / "athens-5k-supplied-art-race-day-visualization-v1.png"


def fit(mark: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(width / mark.width, height / mark.height)
    size = (round(mark.width * scale), round(mark.height * scale))
    return mark.resize(size, Image.Resampling.LANCZOS)


def fabric_place(canvas: Image.Image, mark: Image.Image, center: tuple[int, int], opacity: float = 0.91) -> None:
    mark = mark.convert("RGBA").filter(ImageFilter.GaussianBlur(0.15))
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
            factor = 0.83 + luminance * 0.20
            mark_px[px, py] = (
                min(255, int(r * factor)),
                min(255, int(g * factor)),
                min(255, int(b * factor)),
                int(a * opacity),
            )
    canvas.alpha_composite(mark, (x, y))


canvas = Image.open(BASE).convert("RGBA")
front = Image.open(FRONT).convert("RGBA")
ut = Image.open(UT_HEALTH).convert("RGBA")

# Match the production proof: 9.5-inch front art and 4.5-inch upper-back mark.
fabric_place(canvas, fit(front, 230, 175), (500, 585), opacity=0.90)
fabric_place(canvas, fit(ut, 112, 52), (1062, 408), opacity=0.91)

canvas.convert("RGB").save(OUTPUT, quality=96)
print(OUTPUT)
