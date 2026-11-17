"""Original procedural sound effects (no third-party audio) + narration-safe mix.

Three families, as briefed:
  WHOOSH  (movement)      quiet; peak placed on the fastest frame of the move
  TEXTURE (interaction)   paper, click, pop, tear, stamp-thud, tick
  RISER / HIT (anticip.)  sparing; chapter turns and major reveals

usage: python3 scripts/sfx.py   -> assets/sound_effects/*.wav, output/mix.wav, metadata/sfx_cues.csv
"""
import json, os, csv, subprocess
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(11)
OUTD = f'{ROOT}/assets/sound_effects'
os.makedirs(OUTD, exist_ok=True)


def env(n, a, d, shape=2.0):
    t = np.linspace(0, 1, n)
    e = np.minimum(t / max(a, 1e-4), 1.0) * np.clip((1 - t) / max(d, 1e-4), 0, 1)
    return e ** shape


def bandnoise(n, lo, hi, sweep=None):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    m = ((f > lo) & (f < hi)).astype(float)
    m = np.convolve(m, np.ones(64) / 64, mode='same')
    y = np.fft.irfft(X * m, n)
    return y / (np.abs(y).max() + 1e-9)


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def sweep_lp(x, f0, f1):
    # time-varying one-pole lowpass (filter sweep gives the "air moving" quality)
    n = len(x)
    fc = np.geomspace(f0, f1, n)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(n):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y / (np.abs(y).max() + 1e-9)


def stereo(x, pan=0.0, width=0.0):
    l = x * np.sqrt(0.5 * (1 - pan))
    r = x * np.sqrt(0.5 * (1 + pan))
    if width:
        d = int(width * SR / 1000)
        r = np.concatenate([np.zeros(d), r[:-d]]) if d else r
    return np.stack([l, r], 1)


def whoosh(dur=0.7, peak=0.55, lo=300, hi=6000, pan_move=0.6):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    up = sweep_lp(x[: int(n * peak)], lo, hi)
    dn = sweep_lp(x[int(n * peak):], hi, lo * 0.7)
    y = np.concatenate([up, dn]) * np.concatenate([np.linspace(0, 1, int(n * peak)) ** 2.2, np.linspace(1, 0, n - int(n * peak)) ** 1.6])
    l = y * np.linspace(1 - pan_move, 1, n)
    r = y * np.linspace(1, 1 - pan_move, n)
    return np.stack([l, r], 1) * 0.9


def paper(dur=0.35):
    n = int(dur * SR)
    y = np.zeros(n)
    for _ in range(14):
        p = rng.integers(0, n - 2000)
        L = rng.integers(300, 1800)
        y[p:p + L] += bandnoise(L, 1800, 9000) * env(L, 0.05, 0.9, 1.5) * rng.uniform(0.3, 1)
    y *= env(n, 0.08, 0.6, 1.2)
    return stereo(y / (np.abs(y).max() + 1e-9) * 0.8, 0.0, 6)


def tear(dur=0.6):
    n = int(dur * SR)
    y = bandnoise(n, 900, 7000) * (rng.random(n) > 0.55) * env(n, 0.03, 0.7, 1.3)
    y = onepole_lp(y, 6000)
    return stereo(y / (np.abs(y).max() + 1e-9) * 0.9, 0.1, 4)


def click(freq=2200, dur=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * freq * t) * np.exp(-t * 90) + bandnoise(n, 3000, 9000) * np.exp(-t * 300) * 0.4
    return stereo(y * 0.6)


def pop(dur=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 18) + 220
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 32)
    return stereo(y * 0.7)


def thud(dur=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * (70 * np.exp(-t * 6) + 42) * t) * np.exp(-t * 9) + bandnoise(n, 200, 2500) * np.exp(-t * 60) * 0.5
    return stereo(y / np.abs(y).max() * 0.9)


def riser(dur=1.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(180, 720, n)) / SR) * 0.35
    air = sweep_lp(rng.standard_normal(n), 400, 9000) * 0.65
    y = (tone + air) * (np.linspace(0, 1, n) ** 2.6)
    y[-int(0.04 * SR):] *= np.linspace(1, 0, int(0.04 * SR))
    return stereo(y / np.abs(y).max() * 0.85, 0, 8)


def hit(dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * (55 * np.exp(-t * 2.5) + 36) * t) * np.exp(-t * 3.2)
    body = bandnoise(n, 120, 3000) * np.exp(-t * 14) * 0.5
    tail = sweep_lp(rng.standard_normal(n), 3000, 200) * np.exp(-t * 2.2) * 0.25
    y = sub + body + tail
    return stereo(y / np.abs(y).max() * 0.95, 0, 12)


def shutter():
    a = click(3200, 0.03)
    b = click(1800, 0.05)
    out = np.zeros((int(0.12 * SR), 2))
    out[: len(a)] += a
    out[int(0.05 * SR): int(0.05 * SR) + len(b)] += b * 0.8
    return out


LIB = {}


def build_library():
    LIB['whoosh_a'] = whoosh(0.7, 0.6)
    LIB['whoosh_b'] = whoosh(0.9, 0.55, 200, 4500, -0.6)
    LIB['whoosh_c'] = whoosh(0.5, 0.65, 500, 8000, 0.3)
    LIB['whoosh_soft'] = whoosh(1.2, 0.6, 150, 2500, 0.2)
    LIB['paper_a'] = paper(0.35)
    LIB['paper_b'] = paper(0.5)
    LIB['tear'] = tear()
    LIB['click'] = click()
    LIB['pop'] = pop()
    LIB['thud'] = thud()
    LIB['riser'] = riser()
    LIB['hit'] = hit()
    LIB['shutter'] = shutter()
    for k, v in LIB.items():
        sf.write(f'{OUTD}/{k}.wav', v.astype(np.float32), SR)


# family levels (dBFS relative): narration stays dominant
LEVEL = {'whoosh': -27, 'paper': -24, 'tear': -21, 'click': -27, 'pop': -27, 'thud': -20, 'riser': -23, 'hit': -19, 'shutter': -26}


def cues(tl):
    out = []
    W = ['whoosh_a', 'whoosh_b', 'whoosh_c']
    for i, s in enumerate(tl):
        t0 = s['from'] / 30.0
        tr = s.get('trans', 'cut')
        comp = s.get('comp') or ''
        # transitions: whoosh peak lands on the fastest frame (the cut)
        if tr in ('whip', 'push', 'mask', 'zoom', 'lightbar'):
            name = W[i % 3] if tr != 'lightbar' else 'whoosh_soft'
            pk = 0.6 if name != 'whoosh_soft' else 0.6 * 1.2
            out.append((t0 - pk, name, 'whoosh', f'{tr} into {s["id"]}'))
        if tr == 'burn':  # chapter turn: riser into a single hit
            out.append((t0 - 1.8, 'riser', 'riser', f'chapter turn {s["id"]}'))
            out.append((t0, 'hit', 'hit', f'chapter {s["id"]}'))
        if tr == 'flash':
            out.append((t0 - 0.02, 'click', 'click', 'exposure flash'))
        if s['kind'] == 'photo' and not comp:
            out.append((t0 + 0.05, 'shutter', 'shutter', 'photograph lands'))
        if s['kind'] == 'doc':
            out.append((t0 + 0.15, 'paper_b', 'paper', 'document slides in'))
        # diegetic / object sounds inside graphics
        if comp == 'PostcardTear':
            out += [(t0 + 0.7, 'paper_a', 'paper', 'documents land'), (t0 + 70 / 30, 'tear', 'tear', 'postcard tears')]
        if comp == 'PhotoStack':
            out += [(t0 + k * 6 / 30 + 0.25, 'paper_a', 'paper', 'photo drops') for k in range(5)]
        if comp == 'FormulaTear':
            out.append((t0 + 40 / 30, 'tear', 'tear', 'formula torn'))
        if comp in ('LoanStack',):
            out += [(t0 + (8 + k * 12) / 30 + 0.3, 'thud', 'thud', 'loan block lands') for k in range(3)]
        if comp == 'FraudLetter':
            out.append((t0 + 30 / 30, 'thud', 'thud', 'stamp'))
        if comp == 'NotAutomatic':
            out.append((t0 + 46 / 30, 'thud', 'thud', 'stamp NOT AUTOMATIC'))
        if comp == 'ViralClaim':
            out.append((t0 + 18 / 30, 'thud', 'thud', 'stamp UNVERIFIED'))
        if comp == 'PostcardCrack':
            out.append((t0 + 70 / 30, 'tear', 'tear', 'glass crack'))
        if comp in ('PostcardReturn',):
            out += [(t0 + (50 + k * 8) / 30, 'pop', 'pop', 'note pops') for k in range(5)]
        if comp in ('GovAnnouncement',):
            out.append((t0 - 1.8, 'riser', 'riser', 'Nov 5 announcement'))
            out.append((t0, 'hit', 'hit', 'Nov 5 announcement'))
        if comp == 'Cohorts3D':
            out.append((t0 + 0.1, 'whoosh_soft', 'whoosh', 'door opens'))
            out.append((t0 + 90 / 30, 'hit', 'hit', '200,000 split reveal'))
        if comp == 'Door3D' and (s.get('props') or {}).get('state') == 'closing':
            out.append((t0 + (s['to'] - s['from'] - 30) / 30, 'thud', 'thud', 'door shuts'))
    return out


def mix():
    tl = json.load(open(f'{ROOT}/src/data/timeline.json'))
    nar, sr = sf.read(f'{ROOT}/input/canada.mp3', dtype='float32') if False else (None, None)
    wav = f'{ROOT}/.cache/narration48k.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{ROOT}/input/canada.mp3', '-ar', str(SR), '-ac', '2', wav], check=True)
    nar, _ = sf.read(wav, dtype='float32')
    bus = np.zeros_like(nar)
    cl = cues(tl)
    # one dominant impact per scene: drop textures within 0.25 s of a hit
    hits = [c[0] for c in cl if c[2] == 'hit']
    rows = []
    for t, name, fam, why in sorted(cl):
        if fam not in ('hit', 'riser') and any(abs(t - h) < 0.25 for h in hits):
            continue
        x = LIB[name] * (10 ** (LEVEL[fam] / 20))
        i = int(max(0, t) * SR)
        j = min(len(bus), i + len(x))
        if j > i:
            bus[i:j] += x[: j - i]
            rows.append([f'{t:.3f}', name, fam, LEVEL[fam], why])
    # gentle ducking of sfx under dense speech is unnecessary at these levels; keep a safety limiter
    out = nar + bus
    peak = np.abs(out).max()
    if peak > 0.98:
        out = out / peak * 0.98
    sf.write(f'{ROOT}/output/mix.wav', out, SR, subtype='PCM_24')
    with open(f'{ROOT}/metadata/sfx_cues.csv', 'w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(['time_s', 'asset', 'family', 'level_dbfs', 'reason'])
        w.writerows(rows)
    print('cues', len(rows), 'peak', round(float(peak), 3))


if __name__ == '__main__':
    os.makedirs(f'{ROOT}/output', exist_ok=True)
    build_library()
    mix()
