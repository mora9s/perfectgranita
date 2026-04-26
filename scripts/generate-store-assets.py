#!/usr/bin/env python3
"""Generate Google Play / Expo visual assets for Slushi Party.

Outputs:
- assets/store/icon.png (1024x1024)
- assets/store/play-icon-512.png (512x512)
- assets/store/adaptive-icon-foreground.png (1024x1024 transparent)
- assets/store/splash.png (1242x2436)
- assets/store/feature-graphic.png (1024x500)
- assets/store/screenshots/phone-0*.png (1080x1920)
"""
from __future__ import annotations

import math
from pathlib import Path
from typing import Iterable, Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
STORE = ROOT / "assets" / "store"
IMAGES = ROOT / "assets" / "images"
SCREENSHOTS = STORE / "screenshots"
STORE.mkdir(parents=True, exist_ok=True)
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_COND_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"

COLORS = {
    "navy": (12, 24, 44),
    "deep": (7, 15, 30),
    "blue": (21, 112, 255),
    "cyan": (64, 218, 255),
    "mint": (84, 238, 190),
    "pink": (255, 89, 161),
    "orange": (255, 154, 73),
    "cream": (250, 247, 238),
    "white": (255, 255, 255),
    "muted": (196, 213, 236),
}


def font(size: int, bold: bool = False, condensed: bool = False):
    path = FONT_COND_BOLD if condensed else (FONT_BOLD if bold else FONT_REG)
    return ImageFont.truetype(path, size)


def gradient(size: Tuple[int, int], top: Tuple[int, int, int], bottom: Tuple[int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size, top)
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for x in range(w):
            # subtle radial blue/cyan light source from top-right
            r = math.hypot((x - w * 0.82) / w, (y - h * 0.05) / h)
            glow = max(0, 1 - r * 2.3) * 0.28
            c = tuple(int(top[i] * (1 - t) + bottom[i] * t + 255 * glow * (0.35 if i == 0 else 0.75 if i == 1 else 1.0)) for i in range(3))
            px[x, y] = tuple(min(255, v) for v in c)
    return img


def rounded_mask(size: Tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def paste_cover(canvas: Image.Image, img_path: Path, box: Tuple[int, int, int, int], radius: int = 0, opacity: float = 1.0):
    img = Image.open(img_path).convert("RGBA")
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    img = ImageOps.fit(img, (bw, bh), method=Image.Resampling.LANCZOS)
    if opacity < 1:
        img.putalpha(img.getchannel("A").point(lambda a: int(a * opacity)))
    if radius:
        mask = rounded_mask((bw, bh), radius)
        img.putalpha(Image.composite(img.getchannel("A"), Image.new("L", (bw, bh), 0), mask))
    canvas.alpha_composite(img, (x0, y0))


def text_center(draw: ImageDraw.ImageDraw, xy: Tuple[int, int], text: str, fnt, fill, stroke_width=0, stroke_fill=None):
    bbox = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    draw.text((xy[0] - (bbox[2] - bbox[0]) / 2, xy[1] - (bbox[3] - bbox[1]) / 2), text, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def multiline_center(draw: ImageDraw.ImageDraw, center_x: int, y: int, lines: Iterable[str], fnt, fill, spacing: int = 8):
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=fnt)
        draw.text((center_x - (bbox[2] - bbox[0]) / 2, y), line, font=fnt, fill=fill)
        y += (bbox[3] - bbox[1]) + spacing
    return y


def draw_slush_cup(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float = 1.0, alpha: int = 255):
    def rgba(c, a=alpha): return (*c, a)
    w, h = int(250 * scale), int(360 * scale)
    # straw
    draw.rounded_rectangle((cx + int(45*scale), cy - int(230*scale), cx + int(75*scale), cy - int(65*scale)), radius=int(12*scale), fill=rgba(COLORS["mint"], 230))
    draw.line((cx + int(60*scale), cy - int(210*scale), cx + int(120*scale), cy - int(270*scale)), fill=rgba(COLORS["mint"], 230), width=int(22*scale))
    # cup glass
    cup = [(cx - w//2, cy - h//2), (cx + w//2, cy - h//2), (cx + int(w*.34), cy + h//2), (cx - int(w*.34), cy + h//2)]
    draw.polygon(cup, fill=(255,255,255,42), outline=(255,255,255,190))
    # drink layers
    draw.polygon([(cx-w//2+15, cy-55), (cx+w//2-15, cy-55), (cx+int(w*.26), cy+h//2-25), (cx-int(w*.26), cy+h//2-25)], fill=rgba(COLORS["cyan"], 210))
    draw.polygon([(cx-w//2+25, cy+20), (cx+w//2-25, cy+20), (cx+int(w*.22), cy+h//2-25), (cx-int(w*.22), cy+h//2-25)], fill=rgba(COLORS["pink"], 225))
    # ice/snow cap
    for dx, dy, r, color in [(-70,-85,42,"cream"),(-20,-110,55,"white"),(45,-92,45,"cream"),(85,-66,30,"white")]:
        draw.ellipse((cx+int((dx-r)*scale), cy+int((dy-r)*scale), cx+int((dx+r)*scale), cy+int((dy+r)*scale)), fill=rgba(COLORS[color], 245))
    # highlight
    draw.line((cx-int(80*scale), cy-int(110*scale), cx-int(45*scale), cy+int(115*scale)), fill=(255,255,255,120), width=max(3,int(8*scale)))


def make_adaptive_foreground():
    img = Image.new("RGBA", (1024, 1024), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # logo mark inside safe zone
    d.ellipse((212, 172, 812, 772), fill=(255,255,255,24), outline=(255,255,255,100), width=8)
    draw_slush_cup(d, 512, 500, 1.35)
    text_center(d, (512, 820), "SLUSHI", font(108, True, True), COLORS["white"], stroke_width=4, stroke_fill=COLORS["deep"])
    text_center(d, (512, 915), "PARTY", font(96, True, True), COLORS["cyan"], stroke_width=4, stroke_fill=COLORS["deep"])
    img.save(STORE / "adaptive-icon-foreground.png")
    return img


def make_icon():
    bg = gradient((1024, 1024), (16, 43, 83), (6, 13, 29)).convert("RGBA")
    overlay = Image.new("RGBA", (1024,1024), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    # decorative bubbles
    for x,y,r,c in [(120,190,38,"cyan"),(870,175,58,"pink"),(830,780,46,"mint"),(180,825,62,"orange"),(720,92,22,"cream")]:
        d.ellipse((x-r,y-r,x+r,y+r), fill=(*COLORS[c], 48))
    draw_slush_cup(d, 512, 455, 1.25)
    text_center(d, (512, 760), "Slushi", font(120, True, True), COLORS["white"], stroke_width=5, stroke_fill=COLORS["deep"])
    text_center(d, (512, 875), "Party", font(116, True, True), COLORS["cyan"], stroke_width=5, stroke_fill=COLORS["deep"])
    bg.alpha_composite(overlay)
    # app icon corners handled by platform, but preview as full square
    bg.save(STORE / "icon.png")
    bg.resize((512,512), Image.Resampling.LANCZOS).save(STORE / "play-icon-512.png")


def make_splash():
    img = gradient((1242,2436), (17, 45, 88), (6, 11, 25)).convert("RGBA")
    d = ImageDraw.Draw(img)
    for x,y,r,c in [(170,390,90,"cyan"),(1040,460,130,"pink"),(230,1960,160,"mint"),(1020,1840,95,"orange")]:
        d.ellipse((x-r,y-r,x+r,y+r), fill=(*COLORS[c], 38))
    draw_slush_cup(d, 621, 960, 1.65)
    text_center(d, (621, 1360), "Slushi Party", font(112, True, True), COLORS["white"], stroke_width=5, stroke_fill=COLORS["deep"])
    text_center(d, (621, 1480), "Recettes glacées pour Ninja Slushi", font(42), COLORS["muted"])
    text_center(d, (621, 1550), "et Ninja Slushi Max", font(42), COLORS["muted"])
    img.save(STORE / "splash.png")


def make_feature_graphic():
    img = gradient((1024,500), (17, 50, 98), (7, 14, 30)).convert("RGBA")
    d = ImageDraw.Draw(img)
    paste_cover(img, IMAGES / "hero-dark.jpg", (650, -70, 1080, 560), radius=0, opacity=.42)
    paste_cover(img, IMAGES / "ninja-slushi-max-fs605eubr-dark.jpg", (620, 95, 945, 420), radius=44, opacity=.97)
    d.rounded_rectangle((50,60,615,438), radius=44, fill=(7,15,30,144), outline=(255,255,255,42), width=2)
    d.text((86,92), "SLUSHI PARTY", font=font(70, True, True), fill=COLORS["white"])
    d.text((90,178), "Recettes glacées", font=font(44, True), fill=COLORS["cyan"])
    d.text((90,238), "pour Ninja Slushi", font=font(40), fill=COLORS["cream"])
    d.text((90,292), "et Ninja Slushi Max", font=font(40), fill=COLORS["cream"])
    d.rounded_rectangle((90,360,420,410), radius=25, fill=(*COLORS["pink"], 230))
    text_center(d, (255,385), "FR • EN • Local-first", font(24, True), COLORS["white"])
    img.save(STORE / "feature-graphic.png")


def phone_frame(base: Image.Image, title: str, subtitle: str, accent: Tuple[int,int,int], body_cb):
    d = ImageDraw.Draw(base)
    # phone
    x,y,w,h = 96, 190, 888, 1510
    shadow = Image.new("RGBA", base.size, (0,0,0,0)); sd=ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x+18,y+28,x+w+18,y+h+28), radius=78, fill=(0,0,0,105))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22)); base.alpha_composite(shadow)
    d.rounded_rectangle((x,y,x+w,y+h), radius=76, fill=(15,26,47), outline=(255,255,255,90), width=4)
    d.rounded_rectangle((x+34,y+34,x+w-34,y+h-34), radius=54, fill=(248,250,255))
    # status / app header
    d.rounded_rectangle((x+34,y+34,x+w-34,y+162), radius=54, fill=(13,38,77))
    d.text((x+78,y+82), "Slushi Party", font=font(38, True), fill=COLORS["white"])
    d.text((x+w-255,y+90), "Ninja Max", font=font(24, True), fill=COLORS["cyan"])
    body_box = (x+70, y+205, x+w-70, y+h-90)
    body_cb(d, base, body_box)
    # caption
    text_center(d, (540, 78), title, font(68, True, True), COLORS["white"], stroke_width=3, stroke_fill=COLORS["deep"])
    text_center(d, (540, 152), subtitle, font(35, True), accent)


def screenshot_home():
    img = gradient((1080,1920), (17, 55, 105), (6, 12, 28)).convert("RGBA")
    def body(d, base, box):
        x0,y0,x1,y1=box
        paste_cover(base, IMAGES / "hero-light.jpg", (x0,y0,x1,y0+360), radius=34)
        d.rounded_rectangle((x0+34,y0+245,x1-34,y0+330), radius=22, fill=(255,255,255,235))
        d.text((x0+62,y0+263), "Choisis ta machine", font=font(34, True), fill=COLORS["navy"])
        cards=[("Ninja Slushi", "Modèle Standard", IMAGES/"ninja-slushi-fs301eu.jpg"), ("Ninja Slushi Max", "Grande capacité", IMAGES/"ninja-slushi-max-fs605eubr.jpg")]
        y=y0+420
        for title,sub,path in cards:
            d.rounded_rectangle((x0,y,x1,y+280), radius=38, fill=(255,255,255), outline=(220,229,242), width=3)
            paste_cover(base,path,(x0+30,y+28,x0+250,y+248),radius=28)
            d.text((x0+290,y+66), title, font=font(36, True), fill=COLORS["navy"])
            d.text((x0+290,y+124), sub, font=font(27), fill=(72,91,118))
            d.rounded_rectangle((x0+290,y+188,x0+520,y+232), radius=22, fill=(*COLORS["cyan"], 255))
            d.text((x0+322,y+198), "Sélectionner", font=font(22, True), fill=COLORS["navy"])
            y+=325
    phone_frame(img, "Accueil premium", "Choix Ninja Slushi / Max", COLORS["cyan"], body)
    img.save(SCREENSHOTS / "phone-01-home.png")


def screenshot_explore():
    img = gradient((1080,1920), (38, 31, 94), (8, 13, 31)).convert("RGBA")
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Explorer", font=font(50, True), fill=COLORS["navy"])
        d.text((x0,y0+64), "Volumes adaptés : 3310 ml", font=font(30, True), fill=(33,107,178))
        chips=["Cocktail", "Sans alcool", "Crémeux"]
        cx=x0; cy=y0+130
        for chip in chips:
            tw=d.textbbox((0,0),chip,font=font(22,True))[2]+50
            d.rounded_rectangle((cx,cy,cx+tw,cy+52), radius=26, fill=(224,242,255), outline=(157,214,255), width=2)
            d.text((cx+25,cy+13), chip, font=font(22, True), fill=(19,74,124)); cx+=tw+18
        recipes=[("Margarita Frozen", "Frozen Cocktail • 3310 ml", "margarita-frozen.jpg"), ("Piña Colada", "Creami • 3310 ml", "pina-colada-classic.jpg"), ("Virgin Mojito", "Slush • 3310 ml", "virgin-mojito-slush.jpg")]
        y=y0+230
        for title,sub,img_name in recipes:
            d.rounded_rectangle((x0,y,x1,y+230), radius=34, fill=(255,255,255), outline=(225,232,244), width=3)
            paste_cover(base, IMAGES/img_name, (x0+22,y+22,x0+202,y+208), radius=28)
            d.text((x0+235,y+48), title, font=font(32, True), fill=COLORS["navy"])
            d.text((x0+235,y+99), sub, font=font(24), fill=(78,96,122))
            d.rounded_rectangle((x0+235,y+152,x0+395,y+194), radius=20, fill=(*COLORS["pink"], 238))
            d.text((x0+260,y+161), "Voir", font=font(22, True), fill=COLORS["white"])
            y+=265
    phone_frame(img, "Recettes prêtes", "Dosages ajustés automatiquement", COLORS["pink"], body)
    img.save(SCREENSHOTS / "phone-02-explore.png")


def screenshot_custom():
    img = gradient((1080,1920), (14, 80, 91), (6, 15, 31)).convert("RGBA")
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Mes Recettes", font=font(50, True), fill=COLORS["navy"])
        d.text((x0,y0+64), "Sauvegarde locale, sans compte", font=font(29), fill=(65,88,116))
        d.rounded_rectangle((x0,y0+138,x1,y0+235), radius=30, fill=(*COLORS["blue"],255))
        text_center(d, ((x0+x1)//2,y0+186), "Créer une recette", font(32, True), COLORS["white"])
        y=y0+300
        for title, sub, color in [("Granité mangue maison", "Ninja Slushi Max • 3310 ml", COLORS["orange"]), ("Fraise citron vert", "Ninja Slushi • 1890 ml", COLORS["pink"]), ("Cola givré", "Favori local", COLORS["cyan"] )]:
            d.rounded_rectangle((x0,y,x1,y+180), radius=30, fill=(255,255,255), outline=(222,230,243), width=3)
            d.ellipse((x0+32,y+42,x0+128,y+138), fill=(*color,220))
            d.text((x0+160,y+42), title, font=font(31, True), fill=COLORS["navy"])
            d.text((x0+160,y+94), sub, font=font(24), fill=(78,96,122))
            y+=220
    phone_frame(img, "Recettes perso", "Stockées uniquement sur ton téléphone", COLORS["mint"], body)
    img.save(SCREENSHOTS / "phone-03-my-recipes.png")


def screenshot_settings():
    img = gradient((1080,1920), (63, 36, 95), (6, 12, 28)).convert("RGBA")
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Paramètres", font=font(50, True), fill=COLORS["navy"])
        sections=[("Machine", "Ninja Slushi Max", COLORS["cyan"]), ("Thème", "Clair / sombre", COLORS["pink"]), ("Langue", "Français / English", COLORS["mint"]), ("Feedback", "Haptics au toucher", COLORS["orange"])]
        y=y0+105
        for title, val, color in sections:
            d.rounded_rectangle((x0,y,x1,y+175), radius=30, fill=(255,255,255), outline=(222,230,243), width=3)
            d.rounded_rectangle((x0+34,y+42,x0+118,y+126), radius=26, fill=(*color,215))
            d.text((x0+150,y+42), title, font=font(33, True), fill=COLORS["navy"])
            d.text((x0+150,y+94), val, font=font(25), fill=(74,93,119))
            y+=215
    phone_frame(img, "Simple à régler", "Machine, langue, thème et haptics", COLORS["orange"], body)
    img.save(SCREENSHOTS / "phone-04-settings.png")


def main():
    make_adaptive_foreground()
    make_icon()
    make_splash()
    make_feature_graphic()
    screenshot_home(); screenshot_explore(); screenshot_custom(); screenshot_settings()
    # lightweight manifest for humans/tools
    files = [
        STORE / "icon.png", STORE / "play-icon-512.png", STORE / "adaptive-icon-foreground.png", STORE / "splash.png", STORE / "feature-graphic.png",
        *sorted(SCREENSHOTS.glob("phone-*.png")),
    ]
    for p in files:
        im = Image.open(p)
        print(f"{p.relative_to(ROOT)} {im.size[0]}x{im.size[1]} {im.mode}")

if __name__ == "__main__":
    main()
