#!/usr/bin/env python3
"""Generate Google Play / Expo assets for Slushi Party from the approved neon logo artwork."""
from __future__ import annotations

from pathlib import Path
from typing import Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
STORE = ROOT / "assets" / "store"
SOURCE = STORE / "source" / "slushi-party-neon-logo.jpg"
SCREENSHOTS = STORE / "screenshots"
STORE.mkdir(parents=True, exist_ok=True)
SOURCE.parent.mkdir(parents=True, exist_ok=True)
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_COND_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
NAVY = (6, 14, 48)
BLUE = (20, 163, 255)
CYAN = (92, 235, 255)
PINK = (235, 63, 218)
PURPLE = (126, 70, 255)
WHITE = (255, 255, 255)
MUTED = (211, 232, 255)


def font(size: int, bold: bool = False, condensed: bool = False):
    return ImageFont.truetype(FONT_COND_BOLD if condensed else (FONT_BOLD if bold else FONT_REG), size)


def gradient(size: Tuple[int, int], top=(15, 174, 246), bottom=(15, 8, 58)) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for x in range(w):
            glow = max(0, 1 - (((x - w * .72) / w) ** 2 + ((y - h * .18) / h) ** 2) * 4.2)
            mag = max(0, 1 - (((x - w * .35) / w) ** 2 + ((y - h * .85) / h) ** 2) * 5.0)
            c = []
            for i in range(3):
                v = top[i] * (1 - t) + bottom[i] * t
                v += (90, 120, 160)[i] * glow
                v += (120, 20, 120)[i] * mag
                c.append(int(max(0, min(255, v))))
            px[x, y] = tuple(c)
    return img.convert("RGBA")


def text_center(draw: ImageDraw.ImageDraw, xy: Tuple[int, int], text: str, fnt, fill, stroke_width=0, stroke_fill=None):
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    draw.text((xy[0] - (box[2]-box[0]) / 2, xy[1] - (box[3]-box[1]) / 2), text, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def rounded_mask(size: Tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0]-1, size[1]-1), radius=radius, fill=255)
    return mask


def logo(size: int, pad: int = 0) -> Image.Image:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing source image: {SOURCE}")
    src = Image.open(SOURCE).convert("RGBA")
    if pad <= 0:
        return ImageOps.fit(src, (size, size), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    inner = size - 2 * pad
    mark = ImageOps.contain(src, (inner, inner), method=Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.alpha_composite(mark, ((size - mark.width)//2, (size - mark.height)//2))
    return out


def paste_cover(canvas: Image.Image, img: Image.Image, box: Tuple[int, int, int, int], radius=0, opacity=1.0):
    x0, y0, x1, y1 = box
    fitted = ImageOps.fit(img.convert("RGBA"), (x1-x0, y1-y0), method=Image.Resampling.LANCZOS)
    if opacity < 1:
        fitted.putalpha(fitted.getchannel("A").point(lambda a: int(a * opacity)))
    if radius:
        fitted.putalpha(Image.composite(fitted.getchannel("A"), Image.new("L", fitted.size, 0), rounded_mask(fitted.size, radius)))
    canvas.alpha_composite(fitted, (x0, y0))


def save_icon_assets():
    # Use the approved logo directly for app/store icon: correct spelling, no edge artifacts.
    icon = logo(1024, pad=18)
    icon.save(STORE / "icon.png")
    icon.resize((512, 512), Image.Resampling.LANCZOS).save(STORE / "play-icon-512.png")

    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    mark = logo(820, pad=0)
    mark.putalpha(Image.composite(mark.getchannel("A"), Image.new("L", mark.size, 0), rounded_mask(mark.size, 170)))
    fg.alpha_composite(mark, (102, 90))
    fg.save(STORE / "adaptive-icon-foreground.png")


def save_splash():
    src = logo(1400)
    img = gradient((1242, 2436), (20, 168, 245), (9, 5, 48))
    blurred = ImageOps.fit(src, img.size, method=Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(42))
    blurred.putalpha(blurred.getchannel("A").point(lambda a: int(a * 0.46)))
    img.alpha_composite(blurred)
    d = ImageDraw.Draw(img)
    for x,y,r,c in [(160,390,110,CYAN),(1080,520,140,PINK),(230,2020,150,PURPLE),(1010,1880,110,CYAN)]:
        d.ellipse((x-r,y-r,x+r,y+r), fill=(*c, 42))
    mark = logo(940, pad=10)
    mark.putalpha(Image.composite(mark.getchannel("A"), Image.new("L", mark.size, 0), rounded_mask(mark.size, 150)))
    img.alpha_composite(mark, (151, 485))
    text_center(d, (621, 1540), "Slushi Party", font(112, True, True), WHITE, stroke_width=5, stroke_fill=NAVY)
    text_center(d, (621, 1660), "Recettes glacées pour Ninja Slushi", font(43, True), MUTED)
    text_center(d, (621, 1732), "et Ninja Slushi Max", font(43, True), MUTED)
    img.save(STORE / "splash.png")


def save_feature_graphic():
    img = gradient((1024, 500), (14, 165, 243), (12, 7, 55))
    src = logo(620)
    paste_cover(img, src, (545, -50, 1065, 470), radius=56, opacity=.96)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((42, 54, 585, 438), radius=48, fill=(4, 12, 42, 176), outline=(255,255,255,74), width=3)
    d.text((82, 88), "SLUSHI PARTY", font=font(70, True, True), fill=WHITE)
    d.text((84, 180), "Recettes glacées", font=font(45, True), fill=CYAN)
    d.text((84, 242), "pour Ninja Slushi", font=font(40, True), fill=(255, 249, 234))
    d.text((84, 296), "et Ninja Slushi Max", font=font(40, True), fill=(255, 249, 234))
    d.rounded_rectangle((84, 364, 434, 416), radius=26, fill=(*PINK, 235))
    text_center(d, (259, 390), "FR • EN • Local-first", font(25, True), WHITE)
    img.save(STORE / "feature-graphic.png")


def phone_frame(base: Image.Image, title: str, subtitle: str, accent, body_cb):
    d = ImageDraw.Draw(base)
    text_center(d, (540, 78), title, font(67, True, True), WHITE, stroke_width=4, stroke_fill=NAVY)
    text_center(d, (540, 154), subtitle, font(34, True), accent)
    x,y,w,h = 96, 215, 888, 1480
    shadow = Image.new("RGBA", base.size, (0,0,0,0)); sd=ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x+20,y+26,x+w+20,y+h+26), radius=78, fill=(0,0,0,125))
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(24)))
    d.rounded_rectangle((x,y,x+w,y+h), radius=76, fill=(8,18,58), outline=(255,255,255,100), width=4)
    d.rounded_rectangle((x+34,y+34,x+w-34,y+h-34), radius=54, fill=(247,251,255))
    d.rounded_rectangle((x+34,y+34,x+w-34,y+155), radius=54, fill=(13,38,92))
    d.text((x+78,y+78), "Slushi Party", font=font(38, True), fill=WHITE)
    d.text((x+w-255,y+85), "Ninja Max", font=font(24, True), fill=CYAN)
    body_cb(d, base, (x+72, y+205, x+w-72, y+h-90))


def screenshot_home():
    img = gradient((1080,1920), (20, 166, 244), (11, 6, 55))
    mark = logo(760)
    def body(d, base, box):
        x0,y0,x1,y1=box
        paste_cover(base, mark, (x0, y0, x1, y0+415), radius=36)
        d.rounded_rectangle((x0+35,y0+292,x1-35,y0+372), radius=24, fill=(255,255,255,238))
        d.text((x0+62,y0+314), "Choisis ta machine", font=font(33, True), fill=NAVY)
        for i,(title,sub) in enumerate([("Ninja Slushi","Modèle Standard"),("Ninja Slushi Max","Grande capacité")]):
            y=y0+470+i*300
            d.rounded_rectangle((x0,y,x1,y+245), radius=36, fill=WHITE, outline=(204,229,247), width=3)
            d.ellipse((x0+35,y+48,x0+155,y+168), fill=(*([CYAN, PINK][i]),230))
            d.text((x0+190,y+55), title, font=font(36, True), fill=NAVY)
            d.text((x0+190,y+112), sub, font=font(27), fill=(70,90,118))
            d.rounded_rectangle((x0+190,y+170,x0+420,y+214), radius=22, fill=CYAN)
            d.text((x0+222,y+180), "Sélectionner", font=font(22, True), fill=NAVY)
    phone_frame(img, "Accueil premium", "Choix Ninja Slushi / Max", CYAN, body)
    img.save(SCREENSHOTS / "phone-01-home.png")


def screenshot_explore():
    img = gradient((1080,1920), (83, 69, 214), (7, 10, 48))
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Explorer", font=font(50, True), fill=NAVY)
        d.text((x0,y0+64), "Volumes adaptés : 3310 ml", font=font(30, True), fill=(0,104,179))
        recipes=[("Margarita Frozen", "Frozen Cocktail • 3310 ml", PINK), ("Piña Colada", "Creami • 3310 ml", CYAN), ("Virgin Mojito", "Slush • 3310 ml", (112,230,150))]
        y=y0+155
        for title,sub,color in recipes:
            d.rounded_rectangle((x0,y,x1,y+230), radius=34, fill=WHITE, outline=(220,232,246), width=3)
            d.ellipse((x0+28,y+35,x0+178,y+185), fill=(*color,230))
            d.text((x0+215,y+47), title, font=font(32, True), fill=NAVY)
            d.text((x0+215,y+99), sub, font=font(24), fill=(78,96,122))
            d.rounded_rectangle((x0+215,y+154,x0+375,y+196), radius=20, fill=(*PINK, 238))
            d.text((x0+240,y+163), "Voir", font=font(22, True), fill=WHITE)
            y+=270
    phone_frame(img, "Recettes prêtes", "Dosages ajustés automatiquement", PINK, body)
    img.save(SCREENSHOTS / "phone-02-explore.png")


def screenshot_custom():
    img = gradient((1080,1920), (18, 157, 220), (8, 8, 51))
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Mes Recettes", font=font(50, True), fill=NAVY)
        d.text((x0,y0+64), "Sauvegarde locale, sans compte", font=font(29), fill=(65,88,116))
        d.rounded_rectangle((x0,y0+138,x1,y0+235), radius=30, fill=(42,118,235))
        text_center(d, ((x0+x1)//2,y0+186), "Créer une recette", font(32, True), WHITE)
        for i,(title,sub,color) in enumerate([("Granité mangue maison","Ninja Slushi Max • 3310 ml",(255,160,54)),("Fraise citron vert","Ninja Slushi • 1890 ml",PINK),("Cola givré","Favori local",CYAN)]):
            y=y0+300+i*220
            d.rounded_rectangle((x0,y,x1,y+180), radius=30, fill=WHITE, outline=(222,230,243), width=3)
            d.ellipse((x0+32,y+42,x0+128,y+138), fill=(*color,220))
            d.text((x0+160,y+42), title, font=font(31, True), fill=NAVY)
            d.text((x0+160,y+94), sub, font=font(24), fill=(78,96,122))
    phone_frame(img, "Recettes perso", "Stockées uniquement sur ton téléphone", CYAN, body)
    img.save(SCREENSHOTS / "phone-03-my-recipes.png")


def screenshot_settings():
    img = gradient((1080,1920), (91, 65, 220), (7, 8, 50))
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Paramètres", font=font(50, True), fill=NAVY)
        sections=[("Machine","Ninja Slushi Max",CYAN),("Thème","Clair / sombre",PINK),("Langue","Français / English",(112,230,150)),("Feedback","Haptics au toucher",PURPLE)]
        for i,(title,val,color) in enumerate(sections):
            y=y0+105+i*215
            d.rounded_rectangle((x0,y,x1,y+175), radius=30, fill=WHITE, outline=(222,230,243), width=3)
            d.rounded_rectangle((x0+34,y+42,x0+118,y+126), radius=26, fill=(*color,215))
            d.text((x0+150,y+42), title, font=font(33, True), fill=NAVY)
            d.text((x0+150,y+94), val, font=font(25), fill=(74,93,119))
    phone_frame(img, "Simple à régler", "Machine, thème et retours haptiques", PINK, body)
    img.save(SCREENSHOTS / "phone-04-settings.png")


def main():
    save_icon_assets(); save_splash(); save_feature_graphic()
    screenshot_home(); screenshot_explore(); screenshot_custom(); screenshot_settings()
    files = [STORE / "icon.png", STORE / "play-icon-512.png", STORE / "adaptive-icon-foreground.png", STORE / "splash.png", STORE / "feature-graphic.png", *sorted(SCREENSHOTS.glob("phone-*.png"))]
    for p in files:
        im = Image.open(p)
        print(f"{p.relative_to(ROOT)} {im.size[0]}x{im.size[1]} {im.mode}")

if __name__ == "__main__":
    main()
