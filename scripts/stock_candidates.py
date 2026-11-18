"""Search Pixabay for every stock slot, score candidates, build contact sheets.

Scoring: tag overlap with the query words (relevance) + popularity (quality proxy)
+ duration headroom. A global usage counter keeps each source to <= 2 uses and
strongly prefers unused clips. Humans (me) then review contact sheets and may
override picks in metadata/stock_overrides.json.
"""
import json, math, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(__file__))
import pixabay  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

ROOT = pixabay.ROOT
TL = json.load(open(f'{ROOT}/metadata/timeline_draft.json'))
OVR_F = f'{ROOT}/metadata/stock_overrides.json'
OVR = json.load(open(OVR_F)) if os.path.exists(OVR_F) else {}
THUMBS = f'{ROOT}/.cache/thumbs'
os.makedirs(THUMBS, exist_ok=True)
STOP = {'a', 'the', 'of', 'in', 'and', 'with', 'at', 'on', 'to'}


def words(s):
    return {w for w in re.findall(r'[a-z]+', s.lower()) if w not in STOP}


def score(hit, q, need):
    tags = words(hit['tags'])
    qw = words(q)
    rel = len(qw & tags) / max(1, len(qw))
    pop = math.log10(1 + hit['downloads']) / 6
    head = min(1.0, (hit['duration'] - need) / 10)
    return 3.0 * rel + 1.0 * pop + 0.3 * head


def all_hits():
    import glob
    out = {}
    for fn in glob.glob(os.path.join(pixabay.CACHE, '*.json')):
        if os.path.basename(fn).startswith('img_'):
            continue
        d = json.load(open(fn))
        q = d.get('_query', '')
        if not q:
            continue
        for h in pixabay.search(q):
            out[h['id']] = h
    return out


ALL = {}


def main():
    ALL.update(all_hits())
    shots = [s for s in TL if s['kind'] == 'stock']
    usage = {}
    result = {}
    for s in shots:
        need = s['dur'] + 1.0
        cands = {}
        for qi, q in enumerate(s['q']):
            for h in pixabay.search(q):
                if h['duration'] < need + 0.5:
                    continue
                sc = score(h, q, need) - 0.25 * qi
                if h['id'] not in cands or cands[h['id']]['score'] < sc:
                    cands[h['id']] = dict(h, score=round(sc, 3))
        ranked = sorted(cands.values(), key=lambda c: -c['score'])
        key = s['id']
        pick = None
        if key in OVR:
            o = OVR[key]
            pick = next((c for c in ranked if c['id'] == o), None)
            if pick is None:  # override id found through a manual probe query
                pick = ALL.get(o)
                if pick:
                    pick = dict(pick, score=0)
        if pick is None:
            for c in ranked:
                if usage.get(c['id'], 0) == 0:
                    pick = c
                    break
        if pick is None:
            for c in ranked:
                if usage.get(c['id'], 0) < 2:
                    pick = c
                    break
        if pick:
            usage[pick['id']] = usage.get(pick['id'], 0) + 1
        alts = [c for c in ranked if not pick or c['id'] != pick['id']][:5]
        result[key] = dict(shot=key, start=s['start'], dur=s['dur'], q=s['q'], en=s['en'], pick=pick, alts=alts)
        print(key, f"{s['start']:7.1f}", pick['id'] if pick else None, (pick or {}).get('tags', '')[:60], len(ranked), flush=True)
    json.dump(result, open(f'{ROOT}/metadata/stock_candidates.json', 'w'), indent=1)
    reused = {k: v for k, v in usage.items() if v > 1}
    print('unique clips', len(usage), 'reused twice', len(reused), 'missing', [k for k, v in result.items() if not v['pick']])


def fetch_thumb(c):
    fn = f"{THUMBS}/{c['id']}.jpg"
    if not os.path.exists(fn) and c.get('thumb'):
        req = urllib.request.Request(c['thumb'], headers={'User-Agent': 'Mozilla/5.0 documentary-stock-search/1.0'})
        try:
            open(fn, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
        except Exception:
            return None
    return fn


def sheets(per=8):
    res = json.load(open(f'{ROOT}/metadata/stock_candidates.json'))
    items = list(res.values())
    allc = [c for it in items for c in ([it['pick']] if it['pick'] else []) + it['alts'][:3]]
    with ThreadPoolExecutor(8) as ex:
        list(ex.map(fetch_thumb, allc))
    font = ImageFont.truetype(f'{ROOT}/.cache/DejaVuSans.ttf', 15) if os.path.exists(f'{ROOT}/.cache/DejaVuSans.ttf') else ImageFont.load_default()
    tw, th = 300, 169
    os.makedirs(f'{ROOT}/.cache/sheets', exist_ok=True)
    for si in range(0, len(items), per):
        chunk = items[si:si + per]
        img = Image.new('RGB', (420 + 4 * (tw + 6), len(chunk) * (th + 8)), (20, 20, 24))
        d = ImageDraw.Draw(img)
        for r, it in enumerate(chunk):
            y = r * (th + 8)
            d.text((6, y + 4), f"{it['shot']} @{it['start']:.0f}s {it['dur']:.1f}s", fill=(255, 220, 120), font=font)
            txt = it['en']
            lines = [txt[i:i + 46] for i in range(0, min(len(txt), 46 * 6), 46)]
            for li, l in enumerate(lines):
                d.text((6, y + 26 + li * 18), l, fill=(230, 230, 230), font=font)
            d.text((6, y + th - 20), it['q'][0][:46], fill=(140, 180, 255), font=font)
            cs = ([it['pick']] if it['pick'] else []) + it['alts'][:3]
            for ci, c in enumerate(cs):
                fn = f"{THUMBS}/{c['id']}.jpg"
                x = 420 + ci * (tw + 6)
                if os.path.exists(fn):
                    try:
                        im = Image.open(fn).convert('RGB').resize((tw, th))
                        img.paste(im, (x, y))
                    except Exception:
                        pass
                lab = f"{'*' if ci == 0 else chr(65 + ci)} {c['id']}"
                d.rectangle([x, y, x + 120, y + 20], fill=(0, 0, 0))
                d.text((x + 4, y + 2), lab, fill=(255, 255, 0) if ci == 0 else (255, 255, 255), font=font)
        img.save(f'{ROOT}/.cache/sheets/sheet_{si // per:02d}.jpg', quality=82)
    print('sheets', (len(items) + per - 1) // per)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'sheets':
        sheets()
    else:
        main()
