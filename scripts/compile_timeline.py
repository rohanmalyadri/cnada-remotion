"""Compile the render timeline: shots + curated assets + transitions -> src/data/timeline.json"""
import json, os, re
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(f'{ROOT}/metadata/timeline_draft.json'))
USAGE = json.load(open(f'{ROOT}/metadata/stock_usage.json')) if os.path.exists(f'{ROOT}/metadata/stock_usage.json') else {}
CAND = json.load(open(f'{ROOT}/metadata/stock_candidates.json'))
COMMONS = json.load(open(f'{ROOT}/metadata/commons_assets.json'))

TIN = {'cut': 0, 'flash': 6, 'whip': 9, 'mask': 12, 'push': 12, 'zoom': 10, 'dip': 12, 'lightbar': 14, 'burn': 14}


def short_author(a):
    a = re.sub(r'\s+', ' ', a or '').strip()
    return a[:40]


def credit(slug):
    c = COMMONS.get(slug)
    if not c:
        return None
    lic = c.get('license') or ''
    auth = short_author(c.get('author'))
    if lic.lower().startswith('public domain') or lic.lower().startswith('no restrictions'):
        return f'PHOTO: {auth or "PUBLIC DOMAIN"} · WIKIMEDIA COMMONS · {lic.upper()}'
    return f'PHOTO: {auth} · WIKIMEDIA COMMONS · {lic.upper()}'


def main():
    out = []
    prev = None
    last_fx = None
    for i, s in enumerate(TL):
        s = dict(s)
        s['seed'] = i * 7 + 3
        if s['kind'] == 'stock':
            c = CAND.get(s['id'])
            assert c and abs(c['start'] - s['start']) < 0.02, f"candidate mismatch for {s['id']} — rerun stock_candidates"
            s['clip'] = f"stock/{s['id']}.mp4"
            s['pixabay_id'] = c['pick']['id']
        if s['kind'] == 'photo' and not s.get('comp'):
            c = COMMONS[s['img']]
            fn = os.path.basename(c['file'])
            s['imgFile'] = f'images/{fn}'
            w, h = Image.open(f"{ROOT}/public/images/{fn}").size
            s['imgAspect'] = round(w / h, 3)
            s['credit'] = credit(s['img'])
        # ---- transition into this shot ----
        t = 'cut'
        if prev is not None:
            same_beat = prev.get('idx') == s.get('idx')
            chap = s.get('ov') and isinstance(s['ov'], dict) and s['ov'].get('t') == 'chapter'
            if chap:
                t = 'burn' if last_fx != 'burn' else 'lightbar'
            elif same_beat and s['kind'] == 'stock' and prev['kind'] == 'stock':
                t = 'cut'
            elif s['kind'] in ('mg', '3d', 'doc') and prev['kind'] in ('stock', 'photo'):
                t = ['mask', 'push', 'zoom', 'whip'][i % 4]
            elif s['kind'] == 'stock' and prev['kind'] in ('mg', '3d', 'doc'):
                t = ['lightbar', 'whip', 'cut', 'dip', 'cut'][i % 5]
            elif s['kind'] == 'photo':
                t = ['zoom', 'dip', 'flash'][i % 3]
            elif s['kind'] in ('mg', '3d', 'doc') and prev['kind'] in ('mg', '3d', 'doc'):
                t = ['push', 'whip', 'mask'][i % 3]
            else:
                t = 'cut' if i % 6 else 'flash'
            if t == last_fx and t != 'cut':
                t = {'mask': 'zoom', 'zoom': 'push', 'push': 'whip', 'whip': 'mask', 'lightbar': 'dip', 'dip': 'flash', 'flash': 'cut', 'burn': 'lightbar'}[t]
        s['trans'] = t
        s['tin'] = TIN[t]
        if t != 'cut':
            last_fx = t
        # keep keys the renderer needs
        keep = {k: s.get(k) for k in ('id', 'kind', 'comp', 'props', 'ov', 'from', 'to', 'start', 'end', 'dur', 'clip', 'imgFile', 'imgAspect',
                                      'credit', 'mode', 'look', 'seed', 'trans', 'tin', 'en', 'idx', 'pixabay_id', 'anchor')}
        out.append(keep)
        prev = s
    json.dump(out, open(f'{ROOT}/src/data/timeline.json', 'w'), indent=0, ensure_ascii=False)
    from collections import Counter
    print(len(out), 'shots', Counter(x['trans'] for x in out))


if __name__ == '__main__':
    main()
