#!/usr/bin/env python3
"""Generate Google Play / Expo assets for Slushi Party.

This version uses the user-provided app-icon style image as the primary art
source, crops out the neighboring-icon sliver, and corrects visible branding
from the sample's "SLUSHY" spelling to the official "SLUSHI Party" name.
"""
from __future__ import annotations

from pathlib import Path
from typing import Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
STORE = ROOT / "assets" / "store"
SOURCE = STORE / "source" / "slushi-party-user-icon.jpg"
SCREENSHOTS = STORE / "screenshots"
STORE.mkdir(parents=True, exist_ok=True)
(SOURCE.parent).mkdir(parents=True, exist_ok=True)
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_COND_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"

NAVY = (4, 20, 54)
BLUE = (0, 166, 255)
CYAN = (77, 230, 255)
PINK = (255, 45, 151)
WHITE = (255, 255, 255)
CREAM = (255, 250, 232)
MUTED = (207, 230, 255)


def font(size: int, bold: bool = False, condensed: bool = False):
    path = FONT_COND_BOLD if condensed else (FONT_BOLD if bold else FONT_REG)
    return ImageFont.truetype(path, size)


def gradient(size: Tuple[int, int], top=(8, 101, 201), bottom=(5, 18, 58)) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for x in range(w):
            glow = max(0, 1 - (((x - w * .5) / w) ** 2 + ((y - h * .28) / h) ** 2) * 5)
            c = tuple(int(top[i] * (1 - t) + bottom[i] * t + 70 * glow * (1 if i > 0 else .25)) for i in range(3))
            px[x, y] = tuple(min(255, max(0, v)) for v in c)
    return img.convert("RGBA")


def text_center(draw: ImageDraw.ImageDraw, xy: Tuple[int, int], text: str, fnt, fill, stroke_width=0, stroke_fill=None):
    bbox = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    draw.text((xy[0] - (bbox[2] - bbox[0]) / 2, xy[1] - (bbox[3] - bbox[1]) / 2), text, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def rounded_mask(size: Tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def load_user_icon(size=1024, correct_brand=True) -> Image.Image:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing source image: {SOURCE}")
    src = Image.open(SOURCE).convert("RGB")
    # The Telegram/image-cache file includes a right-edge sliver from a neighboring icon.
    # Crop variant validated visually: x=0,y=0,w=330,h=330.
    crop = src.crop((0, 0, 330, 330))
    icon = crop.resize((size, size), Image.Resampling.LANCZOS).convert("RGBA")
    # Preserve the user's blue icy top/slush/straw style, but discard the lower raster text layer
    # so no source "SLUSHY" spelling can remain underneath the official branding.
    clean = gradient((size, size), (0, 173, 242), (0, 89, 200))
    top_h = int(size * 0.38)
    clean.alpha_composite(icon.crop((0, 0, size, top_h)), (0, 0))
    icon = clean
    if correct_brand:
        d = ImageDraw.Draw(icon)
        scale = size / 1024
        # Patch the sample's "SLUSHY" word with official "SLUSHI" branding.
        # Use a glossy label so the correction looks intentional instead of a raster edit.
        box = tuple(int(v * scale) for v in (42, 340, 982, 1024))
        patch = Image.new("RGBA", (box[2]-box[0], box[3]-box[1]), (0, 0, 0, 0))
        pd = ImageDraw.Draw(patch)
        pd.rounded_rectangle((0, 0, patch.width-1, patch.height-1), radius=int(62*scale), fill=(0, 105, 207, 255), outline=(255,255,255,230), width=max(2,int(6*scale)))
        pd.rounded_rectangle((12, 12, patch.width-13, int(90*scale)), radius=int(44*scale), fill=(255,255,255,42))
        pd.rounded_rectangle((12, int(180*scale), patch.width-13, patch.height-13), radius=int(44*scale), fill=(255,54,160,226))
        icon.alpha_composite(patch, (box[0], box[1]))
        d = ImageDraw.Draw(icon)
        text_center(d, (size//2, int(548*scale)), "SLUSHI", font(int(122*scale), True, True), WHITE, stroke_width=max(2,int(8*scale)), stroke_fill=NAVY)
        text_center(d, (size//2, int(695*scale)), "PARTY", font(int(118*scale), True, True), WHITE, stroke_width=max(2,int(8*scale)), stroke_fill=NAVY)
        # Dark drop shadow on PARTY, drawn after the white stroke by offsetting a translucent copy behind it would be ideal;
        # the white stroke keeps the word readable without reintroducing the source's SLUSHY spelling.
    return icon


def paste_cover(canvas: Image.Image, img: Image.Image, box: Tuple[int, int, int, int], radius=0, opacity=1.0):
    x0, y0, x1, y1 = box
    fitted = ImageOps.fit(img.convert("RGBA"), (x1-x0, y1-y0), method=Image.Resampling.LANCZOS)
    if opacity < 1:
        fitted.putalpha(fitted.getchannel("A").point(lambda a: int(a * opacity)))
    if radius:
        fitted.putalpha(Image.composite(fitted.getchannel("A"), Image.new("L", fitted.size, 0), rounded_mask(fitted.size, radius)))
    canvas.alpha_composite(fitted, (x0, y0))


def save_icon_assets():
    icon = load_user_icon(1024, correct_brand=True)
    icon.save(STORE / "icon.png")
    icon.resize((512,512), Image.Resampling.LANCZOS).save(STORE / "play-icon-512.png")

    fg = Image.new("RGBA", (1024,1024), (0,0,0,0))
    # Keep the icon art inside the adaptive icon safe zone.
    safe = icon.resize((760,760), Image.Resampling.LANCZOS)
    safe.putalpha(Image.composite(safe.getchannel("A"), Image.new("L", safe.size, 0), rounded_mask(safe.size, 170)))
    fg.alpha_composite(safe, (132, 118))
    d = ImageDraw.Draw(fg)
    text_center(d, (512, 925), "SLUSHI PARTY", font(64, True, True), WHITE, stroke_width=5, stroke_fill=NAVY)
    fg.save(STORE / "adaptive-icon-foreground.png")


def save_splash():
    img = gradient((1242,2436), (0, 155, 231), (4, 19, 62))
    d = ImageDraw.Draw(img)
    for x,y,r,c in [(130,430,95,CYAN),(1090,545,135,PINK),(220,1990,140,(120,235,255)),(1000,1850,115,(255,76,172))]:
        d.ellipse((x-r,y-r,x+r,y+r), fill=(*c,42))
    icon = load_user_icon(900, correct_brand=True)
    icon.putalpha(Image.composite(icon.getchannel("A"), Image.new("L", icon.size, 0), rounded_mask(icon.size, 170)))
    img.alpha_composite(icon, (171, 530))
    text_center(d, (621, 1520), "Slushi Party", font(112, True, True), WHITE, stroke_width=5, stroke_fill=NAVY)
    text_center(d, (621, 1640), "Recettes glacées pour Ninja Slushi", font(43, True), MUTED)
    text_center(d, (621, 1712), "et Ninja Slushi Max", font(43, True), MUTED)
    img.save(STORE / "splash.png")


def save_feature_graphic():
    img = gradient((1024,500), (0, 145, 228), (4, 18, 58))
    d = ImageDraw.Draw(img)
    icon = load_user_icon(440, correct_brand=True)
    icon.putalpha(Image.composite(icon.getchannel("A"), Image.new("L", icon.size, 0), rounded_mask(icon.size, 82)))
    shadow = Image.new("RGBA", img.size, (0,0,0,0)); sd=ImageDraw.Draw(shadow)
    sd.rounded_rectangle((594,48,990,444), radius=82, fill=(0,0,0,115)); shadow=shadow.filter(ImageFilter.GaussianBlur(24)); img.alpha_composite(shadow)
    img.alpha_composite(icon, (560,30))
    d.rounded_rectangle((42,54,585,438), radius=48, fill=(4,20,54,158), outline=(255,255,255,70), width=3)
    d.text((82,88), "SLUSHI PARTY", font=font(70, True, True), fill=WHITE)
    d.text((84,180), "Recettes glacées", font=font(45, True), fill=CYAN)
    d.text((84,242), "pour Ninja Slushi", font=font(40, True), fill=CREAM)
    d.text((84,296), "et Ninja Slushi Max", font=font(40, True), fill=CREAM)
    d.rounded_rectangle((84,364,434,416), radius=26, fill=(*PINK, 235))
    text_center(d, (259,390), "FR • EN • Local-first", font(25, True), WHITE)
    img.save(STORE / "feature-graphic.png")


def phone_frame(base: Image.Image, title: str, subtitle: str, accent, body_cb):
    d = ImageDraw.Draw(base)
    text_center(d, (540, 78), title, font(67, True, True), WHITE, stroke_width=4, stroke_fill=NAVY)
    text_center(d, (540, 154), subtitle, font(34, True), accent)
    x,y,w,h = 96, 215, 888, 1480
    shadow = Image.new("RGBA", base.size, (0,0,0,0)); sd=ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x+20,y+26,x+w+20,y+h+26), radius=78, fill=(0,0,0,120)); shadow=shadow.filter(ImageFilter.GaussianBlur(24)); base.alpha_composite(shadow)
    d.rounded_rectangle((x,y,x+w,y+h), radius=76, fill=(8,25,61), outline=(255,255,255,100), width=4)
    d.rounded_rectangle((x+34,y+34,x+w-34,y+h-34), radius=54, fill=(247,251,255))
    d.rounded_rectangle((x+34,y+34,x+w-34,y+155), radius=54, fill=(0,122,213))
    d.text((x+78,y+78), "Slushi Party", font=font(38, True), fill=WHITE)
    d.text((x+w-255,y+85), "Ninja Max", font=font(24, True), fill=CREAM)
    body_cb(d, base, (x+72, y+205, x+w-72, y+h-90))


def screenshot_home():
    img = gradient((1080,1920), (0, 165, 238), (3, 18, 58))
    icon = load_user_icon(900, True)
    def body(d, base, box):
        x0,y0,x1,y1=box
        paste_cover(base, icon, (x0,y0,x1,y0+410), radius=36, opacity=.96)
        d.rounded_rectangle((x0+35,y0+292,x1-35,y0+372), radius=24, fill=(255,255,255,238))
        d.text((x0+62,y0+314), "Choisis ta machine", font=font(33, True), fill=NAVY)
        for i,(title,sub) in enumerate([("Ninja Slushi","Modèle Standard"),("Ninja Slushi Max","Grande capacité")]):
            y=y0+470+i*300
            d.rounded_rectangle((x0,y,x1,y+245), radius=36, fill=WHITE, outline=(204,229,247), width=3)
            d.ellipse((x0+35,y+48,x0+155,y+168), fill=(0,174,255,230) if i==0 else (255,58,161,230))
            d.text((x0+190,y+55), title, font=font(36, True), fill=NAVY)
            d.text((x0+190,y+112), sub, font=font(27), fill=(70,90,118))
            d.rounded_rectangle((x0+190,y+170,x0+420,y+214), radius=22, fill=CYAN)
            d.text((x0+222,y+180), "Sélectionner", font=font(22, True), fill=NAVY)
    phone_frame(img, "Accueil premium", "Choix Ninja Slushi / Max", CYAN, body)
    img.save(SCREENSHOTS / "phone-01-home.png")


def screenshot_explore():
    img = gradient((1080,1920), (33, 70, 180), (6, 14, 50))
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Explorer", font=font(50, True), fill=NAVY)
        d.text((x0,y0+64), "Volumes adaptés : 3310 ml", font=font(30, True), fill=(0,104,179))
        recipes=[("Margarita Frozen", "Frozen Cocktail • 3310 ml", PINK), ("Piña Colada", "Creami • 3310 ml", CYAN), ("Virgin Mojito", "Slush • 3310 ml", (63,215,150))]
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
    img = gradient((1080,1920), (0, 142, 190), (5, 18, 58))
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Mes Recettes", font=font(50, True), fill=NAVY)
        d.text((x0,y0+64), "Sauvegarde locale, sans compte", font=font(29), fill=(65,88,116))
        d.rounded_rectangle((x0,y0+138,x1,y0+235), radius=30, fill=(0,128,232))
        text_center(d, ((x0+x1)//2,y0+186), "Créer une recette", font(32, True), WHITE)
        for i,(title,sub,color) in enumerate([("Granité mangue maison","Ninja Slushi Max • 3310 ml",(255,154,54)),("Fraise citron vert","Ninja Slushi • 1890 ml",PINK),("Cola givré","Favori local",CYAN)]):
            y=y0+300+i*220
            d.rounded_rectangle((x0,y,x1,y+180), radius=30, fill=WHITE, outline=(222,230,243), width=3)
            d.ellipse((x0+32,y+42,x0+128,y+138), fill=(*color,220))
            d.text((x0+160,y+42), title, font=font(31, True), fill=NAVY)
            d.text((x0+160,y+94), sub, font=font(24), fill=(78,96,122))
    phone_frame(img, "Recettes perso", "Stockées uniquement sur ton téléphone", CYAN, body)
    img.save(SCREENSHOTS / "phone-03-my-recipes.png")


def screenshot_settings():
    img = gradient((1080,1920), (75, 71, 197), (5, 16, 55))
    def body(d, base, box):
        x0,y0,x1,y1=box
        d.text((x0,y0), "Paramètres", font=font(50, True), fill=NAVY)
        sections=[("Machine","Ninja Slushi Max",CYAN),("Thème","Clair / sombre",PINK),("Langue","Français / English",(81,229,176)),("Feedback","Haptics au toucher",(255,160,65))]
        for i,(title,val,color) in enumerate(sections):
            y=y0+105+i*215
            d.rounded_rectangle((x0,y,x1,y+175), radius=30, fill=WHITE, outline=(222,230,243), width=3)
            d.rounded_rectangle((x0+34,y+42,x0+118,y+126), radius=26, fill=(*color,215))
            d.text((x0+150,y+42), title, font=font(33, True), fill=NAVY)
            d.text((x0+150,y+94), val, font=font(25), fill=(74,93,119))
    phone_frame(img, "Simple à régler", "Machine, langue, thème et haptics", PINK, body)
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
