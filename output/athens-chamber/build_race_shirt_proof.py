from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
BASE = Path(
    "/Users/ryantydingco/.codex/generated_images/"
    "01a0308f-0cd2-72d2-9f07-62a8b6c2530f/"
    "exec-97bbfc6e-1618-4f96-94b9-932de5585954.png"
)
ART = ROOT / "2026-bep-5k-logo.png"
OUTPUT = ROOT / "athens-5k-shirt-production-proof-v2.png"


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


def transparent_art(source: Image.Image, one_color_white: bool) -> Image.Image:
    rgba = source.convert("RGBA")
    pixels = rgba.load()
    bg = pixels[0, 0][:3]
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            distance = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            alpha = max(0, min(255, int((distance - 9) * 6.0)))
            if one_color_white:
                pixels[x, y] = (255, 255, 255, alpha)
            else:
                pixels[x, y] = (r, g, b, alpha)
    return rgba.filter(ImageFilter.GaussianBlur(0.25))


def place_print(canvas: Image.Image, artwork: Image.Image, center: tuple[int, int], size: int) -> None:
    mark = artwork.resize((size, size), Image.Resampling.LANCZOS)
    alpha = mark.getchannel("A")
    alpha = ImageEnhance.Contrast(alpha).enhance(1.08)
    mark.putalpha(alpha.point(lambda value: int(value * 0.92)))
    x = center[0] - size // 2
    y = center[1] - size // 2
    canvas.alpha_composite(mark, (x, y))


base = Image.open(BASE).convert("RGBA")
source = Image.open(ART).convert("RGBA")

canvas = Image.new("RGBA", (1536, 1350), (250, 249, 247, 255))
canvas.alpha_composite(base, (0, 165))

white_art = transparent_art(source, one_color_white=True)
two_color_art = transparent_art(source, one_color_white=False)

# Exact supplied artwork on the two front views. Backs intentionally remain blank.
place_print(canvas, white_art, (430, 438), 275)
place_print(canvas, two_color_art, (430, 923), 295)

draw = ImageDraw.Draw(canvas)
ink = (28, 31, 36, 255)
muted = (96, 101, 110, 255)
orange = (240, 91, 26, 255)

draw.text((80, 38), "BLACK-EYED PEA 2026 FUN RUN & 5K", font=font(42, True), fill=ink)
draw.text(
    (80, 91),
    "CUSTOM PARTICIPANT SHIRT CONCEPTS  •  OCTOBER 17, 2026  •  ATHENS, TEXAS",
    font=font(20, True),
    fill=orange,
)

draw.text((80, 142), "OPTION A — NAVY PERFORMANCE TEE / 1-COLOR WHITE PRINT", font=font(20, True), fill=ink)
draw.text((372, 176), "FRONT", font=font(16, True), fill=muted)
draw.text((1052, 176), "BACK", font=font(16, True), fill=muted)

draw.text((80, 660), "OPTION B — SAFETY ORANGE PERFORMANCE TEE / 2-COLOR PRINT", font=font(20, True), fill=ink)
draw.text((372, 694), "FRONT", font=font(16, True), fill=muted)
draw.text((1052, 694), "BACK", font=font(16, True), fill=muted)

draw.rounded_rectangle((70, 1200, 1466, 1305), radius=16, fill=(239, 238, 235, 255))
draw.text((96, 1222), "PRINT DIRECTION", font=font(18, True), fill=ink)
draw.text(
    (96, 1254),
    "Large centered front imprint, approximately 10.5 in wide. Back shown blank pending sponsor placement. Final garment, ink and sizing subject to production proof.",
    font=font(17),
    fill=muted,
)

canvas.convert("RGB").save(OUTPUT, quality=96)
print(OUTPUT)
