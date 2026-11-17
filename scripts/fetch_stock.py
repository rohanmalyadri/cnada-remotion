"""Download curated Pixabay clips, validate decode, choose in-points, cut per-shot plates.

Outputs
  assets/stock/<pixabay_id>.mp4          original 1080p rendition (git-ignored)
  public/stock/<shot>.mp4                 trimmed, 1920x1080, 30 fps, muted plate (git-ignored)
  metadata/stock_usage.json               per-shot source id, in/out points, usage counter
"""
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAND = json.load(open(f'{ROOT}/metadata/stock_candidates.json'))
SRC = f'{ROOT}/assets/stock'
OUT = f'{ROOT}/public/stock'
os.makedirs(SRC, exist_ok=True)
os.makedirs(OUT, exist_ok=True)


def dl(pick):
    fn = f"{SRC}/{pick['id']}.mp4"
    if os.path.exists(fn) and os.path.getsize(fn) > 100000:
        return fn
    req = urllib.request.Request(pick['url'], headers={'User-Agent': 'Mozilla/5.0 documentary-stock-search/1.0'})
    for a in range(4):
        try:
            data = urllib.request.urlopen(req, timeout=300).read()
            open(fn, 'wb').write(data)
            return fn
        except Exception as e:  # noqa: BLE001
            err = e
    raise RuntimeError(f"download failed {pick['id']}: {err}")


def probe(fn):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
                        '-of', 'json', fn], capture_output=True, text=True)
    d = json.loads(r.stdout)
    return float(d['format']['duration']), d['streams'][0]['width'], d['streams'][0]['height']


def luma(fn, t):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', fn, '-frames:v', '1', '-vf', 'scale=64:36,format=gray', '-f', 'rawvideo', '-'],
                       capture_output=True)
    b = r.stdout
    return sum(b) / max(1, len(b))


def main():
    picks = {v['pick']['id']: v['pick'] for v in CAND.values()}
    with ThreadPoolExecutor(6) as ex:
        list(ex.map(dl, picks.values()))
    usage = {}
    uses = {}
    jobs = []
    for sid, v in sorted(CAND.items()):
        p = v['pick']
        fn = f"{SRC}/{p['id']}.mp4"
        D, w, h = probe(fn)
        need = v['dur'] + 0.7
        k = uses.get(p['id'], 0)
        # in-point: skip the first 0.6 s (often static/slates); second use of a clip takes a different section
        slack = max(0.0, D - need - 0.6)
        tin = 0.6 + slack * (0.3 if k == 0 else 0.85)
        if luma(fn, tin) < 12:  # avoid starting on a black frame
            tin = 0.6 + slack * 0.5
        INP = json.load(open(f'{ROOT}/metadata/inpoint_overrides.json')) if os.path.exists(f'{ROOT}/metadata/inpoint_overrides.json') else {}
        if sid in INP:
            tin = INP[sid]
        uses[p['id']] = k + 1
        usage[sid] = dict(shot=sid, pixabay_id=p['id'], page=p['page'], user=p['user'], tags=p['tags'], src_duration=round(D, 2),
                          src_res=f'{w}x{h}', in_point=round(tin, 2), out_point=round(tin + v['dur'], 2), used_seconds=v['dur'],
                          file=f'stock/{sid}.mp4', use_index=k + 1)
        out = f'{OUT}/{sid}.mp4'
        if not os.path.exists(out):
            jobs.append(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tin:.3f}', '-t', f'{need:.3f}', '-i', fn, '-vf',
                         'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p', '-an',
                         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-g', '15', out])
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(lambda c: subprocess.run(c, check=True), jobs))
    for sid, u in usage.items():
        d, w, h = probe(f"{OUT}/{sid}.mp4")
        u['plate_duration'] = round(d, 2)
        assert d >= u['used_seconds'], (sid, d)
    for pid, n in uses.items():
        assert n <= 2, pid
    json.dump(usage, open(f'{ROOT}/metadata/stock_usage.json', 'w'), indent=1)
    print('plates', len(usage), 'sources', len(uses), 'max use', max(uses.values()))


if __name__ == '__main__':
    main()
