#!/usr/bin/env python3
"""
Social-Media-Bild-Generator fuer Faktenfackel.
Design: "Torchlight Veritas" — zwei Welten, getrennt durch eine Flamme.

Usage:
  python3 scripts/social/generate-social-image.py --type faktencheck --verdict false --title "Titel" --output bild.png
  python3 scripts/social/generate-social-image.py --type faktencheck --verdict false --title "Titel" --photo foto.jpg --output bild.png
  python3 scripts/social/generate-social-image.py --type lagerfeuer --title "Titel" --output bild.png
  python3 scripts/social/generate-social-image.py --type generisch --title "5 neue Quellenlinks" --output bild.png

Requires: pip3 install Pillow
"""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ── Design Tokens ──
FLAME = (249, 140, 53)       # #F98C35
SMOKE = (26, 22, 18)         # #1A1612
PAPER = (245, 240, 232)      # #F5F0E8
INK = (28, 25, 23)           # #1C1917
MUTED = (120, 113, 108)      # #78716C

VERDICT_COLORS = {
    "false": (200, 30, 30),
    "misleading": (220, 80, 10),
    "complex": (190, 130, 4),
    "true": (20, 148, 68),
}
VERDICT_LABELS = {
    "false": "FALSCH",
    "misleading": "IRREFUEHREND",
    "complex": "KOMPLEX",
    "true": "KORREKT",
}

WIDTH = 1200
HEIGHT = 630

# Golden ratio split for the boundary
BOUNDARY_X = int(WIDTH * 0.618)  # ~741px

# Font paths
FONT_DIR = Path("/tmp")
PLAYFAIR_BOLD = str(FONT_DIR / "PlayfairDisplay-Bold.ttf")
UBUNTU_MONO_BOLD = str(FONT_DIR / "UbuntuMono-Bold.ttf")
UBUNTU_MONO = str(FONT_DIR / "UbuntuMono-Regular.ttf")

# Logo
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent
LOGO_LIGHT = PROJECT_ROOT / "design" / "Logo quadratisch transparent no txt.png"
LOGO_DARK = PROJECT_ROOT / "design" / "Logo quadratisch ink no txt.png"

MARGIN = 56


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        print(f"Font nicht gefunden: {path}")
        print("Fonts herunterladen:")
        print('  curl -s "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" -H "User-Agent: Mozilla/5.0" | grep -o \'https://[^)]*\\.ttf\' | head -1 | xargs -I{} curl -sL {} -o /tmp/PlayfairDisplay-Bold.ttf')
        print('  curl -s "https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@700&display=swap" -H "User-Agent: Mozilla/5.0" | grep -o \'https://[^)]*\\.ttf\' | head -1 | xargs -I{} curl -sL {} -o /tmp/UbuntuMono-Bold.ttf')
        print('  curl -s "https://fonts.googleapis.com/css2?family=Ubuntu+Mono&display=swap" -H "User-Agent: Mozilla/5.0" | grep -o \'https://[^)]*\\.ttf\' | head -1 | xargs -I{} curl -sL {} -o /tmp/UbuntuMono-Regular.ttf')
        raise SystemExit(1)


def wrap_title(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_right_panel_flame(img):
    """Dark panel with flame logo — the torch in the dark."""
    draw = ImageDraw.Draw(img)

    # Clean cut: dark field from boundary to edge
    draw.rectangle([(BOUNDARY_X, 0), (WIDTH, HEIGHT)], fill=SMOKE)

    # Single matchstick-width flame line at the boundary
    draw.rectangle([(BOUNDARY_X - 2, 0), (BOUNDARY_X, HEIGHT)], fill=FLAME)

    # Load flame logo
    logo_path = LOGO_LIGHT
    if not logo_path.exists():
        return img

    logo = Image.open(logo_path).convert("RGBA")

    # Scale: flame tip nearly touches top stripe, base in lower third
    logo_height = HEIGHT - 60
    ratio = logo_height / logo.height
    logo = logo.resize((int(logo.width * ratio), logo_height), Image.LANCZOS)

    # Center in dark panel
    dark_width = WIDTH - BOUNDARY_X
    logo_x = BOUNDARY_X + (dark_width - logo.width) // 2
    logo_y = 30  # Just below the top stripe

    img_rgba = img.convert("RGBA")
    img_rgba.paste(logo, (logo_x, logo_y), logo)
    return img_rgba.convert("RGB")


def draw_right_panel_photo(img, photo_path):
    """Photo panel with gradient overlay from paper."""
    photo = Image.open(photo_path).convert("RGB")

    photo_start = BOUNDARY_X - 160  # Start before boundary for gradient
    photo_width = WIDTH - photo_start
    photo_height = HEIGHT

    # Cover-crop
    ratio = max(photo_width / photo.width, photo_height / photo.height)
    new_w = int(photo.width * ratio)
    new_h = int(photo.height * ratio)
    photo = photo.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - photo_width) // 2
    top = (new_h - photo_height) // 2
    photo = photo.crop((left, top, left + photo_width, top + photo_height))

    img.paste(photo, (photo_start, 0))

    # Gradient overlay from PAPER
    gradient = Image.new("RGBA", (photo_width, photo_height), (0, 0, 0, 0))
    draw_grad = ImageDraw.Draw(gradient)
    fade_width = 220
    for x in range(fade_width):
        alpha = 255 - int(255 * (x / fade_width) ** 1.8)
        draw_grad.line([(x, 0), (x, photo_height)], fill=(*PAPER, alpha))

    img_rgba = img.convert("RGBA")
    gradient_full = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gradient_full.paste(gradient, (photo_start, 0))
    return Image.alpha_composite(img_rgba, gradient_full).convert("RGB")


def generate(type_, title, verdict=None, photo=None, credit=None, output="social-image.png"):
    img = Image.new("RGB", (WIDTH, HEIGHT), PAPER)

    # ── Right panel: flame or photo ──
    if photo:
        img = draw_right_panel_photo(img, photo)
    else:
        img = draw_right_panel_flame(img)

    draw = ImageDraw.Draw(img)

    # ── Top stripe: full width, 6px, flame orange ──
    draw.rectangle([(0, 0), (WIDTH, 6)], fill=FLAME)

    # ── Fonts ──
    text_max = BOUNDARY_X - MARGIN * 2 - 20
    title_size = 46 if len(title) > 60 else 56
    font_title = load_font(PLAYFAIR_BOLD, title_size)
    font_label = load_font(UBUNTU_MONO_BOLD, 15)
    font_url = load_font(UBUNTU_MONO, 14)
    font_badge = load_font(UBUNTU_MONO_BOLD, 18)
    font_credit = load_font(UBUNTU_MONO, 10)

    # ── Category label (upper left) ──
    label_map = {
        "faktencheck": "FAKTENCHECK",
        "lagerfeuer": "LAGERFEUER",
        "glossar": "GLOSSAR",
        "generisch": "FAKTENFACKEL",
    }
    label = label_map.get(type_, "FAKTENFACKEL")
    label_y = 28
    draw.text((MARGIN, label_y), label, fill=FLAME, font=font_label)
    label_bbox = draw.textbbox((MARGIN, label_y), label, font=font_label)
    # Wire-thin underline
    draw.line(
        [(MARGIN, label_bbox[3] + 3), (label_bbox[2], label_bbox[3] + 3)],
        fill=FLAME, width=1,
    )

    # ── Verdict badge (upper left quadrant, right-aligned within text area) ──
    if type_ == "faktencheck" and verdict in VERDICT_COLORS:
        badge_color = VERDICT_COLORS[verdict]
        badge_text = VERDICT_LABELS[verdict]
        badge_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
        badge_w = badge_bbox[2] - badge_bbox[0] + 32
        badge_h = badge_bbox[3] - badge_bbox[1] + 14
        badge_x = BOUNDARY_X - MARGIN - badge_w
        badge_y = label_y - 2

        draw.rounded_rectangle(
            [(badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h)],
            radius=4, fill=badge_color,
        )
        # Center text in badge using anchor="mm" (middle-middle)
        center_x = badge_x + badge_w // 2
        center_y = badge_y + badge_h // 2
        draw.text((center_x, center_y), badge_text, fill=(255, 255, 255),
                  font=font_badge, anchor="mm")

    # ── Title (upper-left quadrant) ──
    title_lines = wrap_title(draw, title, font_title, text_max)
    y = 72
    for line in title_lines[:4]:
        draw.text((MARGIN, y), line, fill=INK, font=font_title)
        line_bbox = draw.textbbox((MARGIN, y), line, font=font_title)
        y = line_bbox[3] + 4

    # ── Bottom plinth: horizontal rule + URL + wordmark ──
    plinth_y = HEIGHT - 56
    rule_right = BOUNDARY_X - MARGIN if not photo else BOUNDARY_X - MARGIN
    draw.line([(MARGIN, plinth_y), (rule_right, plinth_y)], fill=MUTED, width=1)

    # URL
    draw.text((MARGIN, plinth_y + 12), "faktenfackel.de", fill=MUTED, font=font_url)

    # Wordmark: FAKTEN in ink, FACKEL in flame
    font_wordmark = load_font(UBUNTU_MONO_BOLD, 15)
    wm_fakten = "FAKTEN"
    wm_fackel = "FACKEL"
    wm_f_bbox = draw.textbbox((0, 0), wm_fakten, font=font_wordmark)
    wm_c_bbox = draw.textbbox((0, 0), wm_fackel, font=font_wordmark)
    wm_total = (wm_f_bbox[2] - wm_f_bbox[0]) + (wm_c_bbox[2] - wm_c_bbox[0])
    wm_x = rule_right - wm_total
    wm_y = plinth_y + 12
    draw.text((wm_x, wm_y), wm_fakten, fill=INK, font=font_wordmark)
    draw.text((wm_x + wm_f_bbox[2] - wm_f_bbox[0], wm_y), wm_fackel, fill=FLAME, font=font_wordmark)

    # ── Photo credit (small, bottom right, over photo) ──
    if credit and photo:
        credit_text = f"Foto: {credit}"
        credit_bbox = draw.textbbox((0, 0), credit_text, font=font_credit)
        credit_w = credit_bbox[2] - credit_bbox[0]
        cx = WIDTH - credit_w - 10
        cy = HEIGHT - 18
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.rounded_rectangle(
            [(cx - 5, cy - 2), (cx + credit_w + 5, cy + 13)],
            radius=3, fill=(0, 0, 0, 90),
        )
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)
        draw.text((cx, cy), credit_text, fill=(220, 220, 220), font=font_credit)

    img.save(output, "PNG")
    print(f"Bild erstellt: {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Social-Media-Bild-Generator")
    parser.add_argument("--type", required=True, choices=["faktencheck", "lagerfeuer", "glossar", "generisch"])
    parser.add_argument("--title", required=True)
    parser.add_argument("--verdict", choices=["false", "misleading", "complex", "true"])
    parser.add_argument("--photo", help="Pfad zu einem Foto (rechte Seite)")
    parser.add_argument("--credit", help="Bildquelle/Credit")
    parser.add_argument("--output", default="social-image.png")
    args = parser.parse_args()

    if args.type == "faktencheck" and not args.verdict:
        parser.error("--verdict ist Pflicht fuer Faktenchecks")

    generate(args.type, args.title, args.verdict, args.photo, args.credit, args.output)
