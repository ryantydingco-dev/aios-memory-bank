#!/usr/bin/env python3
"""Assemble the ANYTHING ON EVERYTHING 30s spot.

5 shots (takes/shotN.mp4) -> per-shot text overlay -> xfade chain -> end card.
Clean export (no music; trending sound added in-app per platform).
"""
import os, subprocess, sys, json
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
XFADE = 0.45
FONT = "/System/Library/Fonts/Supplemental/Futura.ttc"
NAVY = (10, 26, 63)

SHOTS = [  # (file, overlay text)
    ("takes/shot1.mp4", "your logo"),
    ("takes/shot2.mp4", "on anything"),
    ("takes/shot3.mp4", "like, anything"),
    ("takes/shot4.mp4", "anything."),
    ("takes/shot5.mp4", "ANYTHING."),
]
ENDCARD_SECONDS = 4.5

def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(" ".join(str(c) for c in cmd[:8]) + "\n" + r.stderr[-2000:] + "\n")
        raise SystemExit(1)

def probe(f):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                                   "format=duration", "-of", "json", f])
    return float(json.loads(out)["format"]["duration"])

def build_endcard(path):
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    logo = Image.open(os.path.join(HERE, "..", "..", "..", "2-customer-acquisition",
                                   "mockups", "creative-alternatives-demo", "ca-logo-card.png"))
    lw = 880
    logo = logo.resize((lw, int(logo.size[1] * lw / logo.size[0])))
    img.paste(logo, ((W - lw) // 2, H // 2 - logo.size[1] // 2 - 160))
    f1 = ImageFont.truetype(FONT, 64)
    f2 = ImageFont.truetype(FONT, 44)
    for text, font, dy in [("Anything on everything.", f1, 120),
                           ("Since 1999. Just call Kenny.", f2, 240)]:
        bb = d.textbbox((0, 0), text, font=font)
        d.text(((W - bb[2] + bb[0]) // 2, H // 2 + dy), text, font=font, fill=NAVY)
    img.save(path)

def text_png(text, path):
    """Transparent full-width strip with centered white text + soft shadow (no drawtext in this ffmpeg)."""
    img = Image.new("RGBA", (W, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, 96)
    bb = d.textbbox((0, 0), text, font=font)
    x = (W - (bb[2] - bb[0])) // 2 - bb[0]
    y = (220 - (bb[3] - bb[1])) // 2 - bb[1]
    d.text((x, y + 6), text, font=font, fill=(0, 0, 0, 90))   # shadow
    d.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    img.save(path)

def main():
    os.chdir(HERE)
    tmp = "_tmp"; os.makedirs(tmp, exist_ok=True)
    # 1) normalize + per-shot overlay (PIL text PNG, alpha fade in/out via fade filter)
    labeled = []
    for i, (clip, text) in enumerate(SHOTS, 1):
        if not os.path.exists(clip):
            raise SystemExit(f"missing {clip}")
        dur = probe(clip)
        t_out = dur - 0.55
        png = f"{tmp}/txt{i}.png"; text_png(text, png)
        out = f"{tmp}/lab{i}.mp4"
        fc = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
              f"crop={W}:{H},fps={FPS}[base];"
              f"[1:v]format=rgba,fade=t=in:st=0.5:d=0.4:alpha=1,"
              f"fade=t=out:st={t_out:.2f}:d=0.4:alpha=1[txt];"
              f"[base][txt]overlay=0:200:shortest=1[v]")
        sh(["ffmpeg", "-y", "-i", clip, "-loop", "1", "-i", png,
            "-filter_complex", fc, "-map", "[v]", "-an",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", out])
        labeled.append(out)
    # 2) end card
    ec_png = f"{tmp}/endcard.png"; build_endcard(ec_png)
    ec = f"{tmp}/endcard.mp4"
    sh(["ffmpeg", "-y", "-loop", "1", "-i", ec_png, "-t", str(ENDCARD_SECONDS),
        "-vf", f"fps={FPS},fade=t=in:st=0:d=0.5", "-c:v", "libx264",
        "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", ec])
    labeled.append(ec)
    # 3) xfade chain
    durs = [probe(f) for f in labeled]
    inputs = []; [inputs.extend(["-i", f]) for f in labeled]
    fc, prev, offset = [], "[0:v]", 0.0
    for i in range(1, len(labeled)):
        offset += durs[i - 1] - XFADE
        nxt = f"[x{i}]" if i < len(labeled) - 1 else "[v]"
        fc.append(f"{prev}[{i}:v]xfade=transition=fade:duration={XFADE}:offset={offset:.3f}{nxt}")
        prev = f"[x{i}]"
    sh(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[v]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "anything-on-everything-v1.mp4"])
    print("DONE:", os.path.join(HERE, "anything-on-everything-v1.mp4"),
          f"({probe('anything-on-everything-v1.mp4'):.1f}s)")

if __name__ == "__main__":
    main()
