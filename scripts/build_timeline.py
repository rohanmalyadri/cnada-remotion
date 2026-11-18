"""Resolve plan anchors against the aligned narration and emit the shot timeline.

Outputs
  metadata/timeline_draft.json   all beats with start/end seconds (+ stock slot splits)
"""
import json, math, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from plan import BEATS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
AUDIO_DUR = 1164.48
MAX_STOCK = 9.0   # hard rule is < 9.5 s; keep a safety margin


def norm(tok):
    return re.sub(r'[^a-z0-9]', '', tok.lower())


def main():
    words = json.load(open(f'{ROOT}/metadata/words.json'))
    toks = [(i, norm(part)) for i, w in enumerate(words) for part in re.split(r'[\u2014\u2013]', w['word'])]
    toks = [(i, t) for i, t in toks if t]
    seq = [t for _, t in toks]
    pos = 0
    out = []
    for bi, b in enumerate(BEATS):
        a = [norm(x) for x in b['anchor'].split()]
        a = [x for x in a if x]
        found = None
        for k in range(pos, len(seq) - len(a) + 1):
            if seq[k:k + len(a)] == a:
                found = k
                break
        if found is None:
            raise SystemExit(f'anchor not found after token {pos}: {b["anchor"]!r}')
        pos = found + 1
        wi = toks[found][0]
        start = max(0.0, words[wi]['start'] + b.get('off', 0.0))
        if bi == 0:
            start = 0.0
        out.append(dict(b, idx=bi, word_index=wi, start=round(start, 3)))
    for k, b in enumerate(out):
        b['end'] = out[k + 1]['start'] if k + 1 < len(out) else AUDIO_DUR
        b['dur'] = round(b['end'] - b['start'], 3)
        if b['dur'] <= 0.4:
            raise SystemExit(f'beat {k} too short: {b["anchor"]} {b["dur"]}')
    # graphics beats with a footage tail: graphics first, then real footage
    expanded = []
    for b in out:
        t = b.get('tail')
        if t and b['dur'] - t[0] >= 1.6:
            g = dict(b, end=round(b['start'] + t[0], 3))
            g['dur'] = round(g['end'] - g['start'], 3)
            st = dict(kind='stock', anchor=b['anchor'] + ' [tail]', q=t[1], ov=t[2], en=b['en'], idx=b['idx'],
                      start=g['end'], end=b['end'], look=None, tail_of=b['comp'])
            st['dur'] = round(st['end'] - st['start'], 3)
            expanded += [g, st]
        else:
            expanded.append(b)
    out = expanded
    # split long stock beats into slots
    shots = []
    for b in out:
        if b['kind'] == 'stock' and b['dur'] > MAX_STOCK:
            n = math.ceil(b['dur'] / MAX_STOCK)
            step = b['dur'] / n
            for j in range(n):
                s = dict(b, part=j, parts=n, start=round(b['start'] + j * step, 3))
                s['end'] = round(b['start'] + (j + 1) * step, 3)
                s['dur'] = round(s['end'] - s['start'], 3)
                if j > 0:
                    s['ov'] = None  # overlay only on the first slot
                shots.append(s)
        else:
            shots.append(dict(b, part=0, parts=1))
    for k, s in enumerate(shots):
        s['id'] = f'S{k:03d}'
        s['from'] = round(s['start'] * FPS)
        s['to'] = round(s['end'] * FPS)
    json.dump(shots, open(f'{ROOT}/metadata/timeline_draft.json', 'w'), indent=1, ensure_ascii=False)
    tot = {}
    for s in shots:
        tot[s['kind']] = tot.get(s['kind'], 0) + s['dur']
    print(len(shots), 'shots', {k: round(v, 1) for k, v in tot.items()},
          {k: f'{100 * v / AUDIO_DUR:.1f}%' for k, v in tot.items()})
    for s in shots:
        flag = ' <<' if s['dur'] < 1.8 else ''
        print(f"{s['id']} {s['start']:7.2f} {s['dur']:5.2f} {s['kind']:5s} {s.get('comp', '') or ','.join(s.get('q', [])[:1]) or s.get('img', '')}{flag}")


if __name__ == '__main__':
    main()
