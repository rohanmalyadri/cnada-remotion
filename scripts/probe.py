"""Visual probe: one row of 7 thumbnails per query -> .cache/probe.jpg"""
import sys, os, urllib.request
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(__file__))
import pixabay
from PIL import Image, ImageDraw, ImageFont
from stock_candidates import fetch_thumb
qs = sys.argv[1:]
font = ImageFont.truetype('.cache/DejaVuSans.ttf', 15)
tw, th = 260, 146
rows = []
for q in qs:
    hits = [h for h in pixabay.search(q) if h['duration'] >= 6][:7]
    rows.append((q, hits))
with ThreadPoolExecutor(8) as ex:
    list(ex.map(fetch_thumb, [h for _, hs in rows for h in hs]))
img = Image.new('RGB', (180 + 7 * (tw + 4), len(rows) * (th + 4)), (18, 18, 22))
d = ImageDraw.Draw(img)
for r, (q, hs) in enumerate(rows):
    y = r * (th + 4)
    for i in range(0, len(q), 18):
        d.text((4, y + 4 + (i // 18) * 18), q[i:i + 18], fill=(140, 190, 255), font=font)
    for c, h in enumerate(hs):
        fn = f".cache/thumbs/{h['id']}.jpg"
        x = 180 + c * (tw + 4)
        if os.path.exists(fn):
            try:
                img.paste(Image.open(fn).convert('RGB').resize((tw, th)), (x, y))
            except Exception:
                pass
        d.rectangle([x, y, x + 110, y + 18], fill=(0, 0, 0))
        d.text((x + 3, y + 1), f"{h['id']} {h['duration']}s", fill=(255, 255, 0), font=font)
out = os.environ.get('OUT', '.cache/probe.jpg')
img.save(out, quality=80)
print(out)
