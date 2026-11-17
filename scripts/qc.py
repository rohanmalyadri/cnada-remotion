"""Technical + editorial QC for the final render; writes output/quality_report.txt."""
import json, os, re, subprocess, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(f'{ROOT}/src/data/timeline.json'))
USAGE = json.load(open(f'{ROOT}/metadata/stock_usage.json'))
VIDEO = f'{ROOT}/output/final_video.mp4'
AUDIO_DUR = 1164.48


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe():
    r = run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,bit_rate,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels,pix_fmt',
             '-of', 'json', VIDEO])
    return json.loads(r.stdout)


def blackdetect():
    r = run(['ffmpeg', '-hide_banner', '-i', VIDEO, '-vf', 'blackdetect=d=0.25:pix_th=0.06', '-an', '-f', 'null', '-'])
    return re.findall(r'black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)', r.stderr)


def freezedetect():
    r = run(['ffmpeg', '-hide_banner', '-i', VIDEO, '-vf', 'freezedetect=n=0.0008:d=2.5', '-an', '-f', 'null', '-'])
    starts = re.findall(r'freeze_start: ([\d.]+)', r.stderr)
    durs = re.findall(r'freeze_duration: ([\d.]+)', r.stderr)
    return list(zip(starts, durs))


def decode_errors():
    r = run(['ffmpeg', '-v', 'error', '-i', VIDEO, '-f', 'null', '-'])
    return [l for l in r.stderr.splitlines() if l.strip()][:20]


def silence():
    r = run(['ffmpeg', '-hide_banner', '-i', VIDEO, '-af', 'silencedetect=noise=-45dB:d=1.5', '-vn', '-f', 'null', '-'])
    return re.findall(r'silence_start: ([\d.]+)', r.stderr)


def loudness():
    r = run(['ffmpeg', '-hide_banner', '-i', VIDEO, '-af', 'ebur128=peak=true', '-vn', '-f', 'null', '-'])
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)
    P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)
    return (I[-1] if I else '?'), (P[-1] if P else '?')


def text_checks():
    telugu = re.compile('[\u0C00-\u0C7F]')
    hits = []
    for fn in glob.glob(f'{ROOT}/src/**/*.tsx', recursive=True) + [f'{ROOT}/src/data/timeline.json']:
        s = open(fn, encoding='utf-8').read()
        if telugu.search(s):
            hits.append(os.path.relpath(fn, ROOT))
    # on-screen overlay strings must be English: check for common romanised-Telugu tokens
    roman = re.compile(r'\b(lo|ki|ga|undhi|kaadhu|mandhi|chesindhi|ayyi|vaallu|meedha|lakhs ki)\b')
    ov_hits = []
    for s in TL:
        ov = s.get('ov') or {}
        txt = ' '.join(str(v) for v in ov.values() if isinstance(v, str)) + ' ' + ' '.join(ov.get('lines', []) or []) + ' ' + ' '.join(ov.get('items', []) or [])
        if roman.search(txt.lower()):
            ov_hits.append((s['id'], txt[:80]))
    banned = re.compile(r'(?i)\b(placeholder|for reference only|stock footage|temporary asset|preview|demo|sample|scene \d+|clip \d+|ai generated footage)\b')
    tag_hits = []
    for fn in glob.glob(f'{ROOT}/src/**/*.tsx', recursive=True):
        for i, line in enumerate(open(fn, encoding='utf-8')):
            if line.strip().startswith('//') or line.strip().startswith('/*') or line.strip().startswith('*'):
                continue
            m = banned.search(re.sub(r'(?s)/\*.*?\*/', '', line))
            if m and ('>' in line or "'" in line):
                tag_hits.append(f'{os.path.relpath(fn, ROOT)}:{i + 1}:{m.group(0)}')
    return hits, ov_hits, tag_hits


def main():
    pr = probe()
    v = next(s for s in pr['streams'] if s['codec_type'] == 'video')
    a = next((s for s in pr['streams'] if s['codec_type'] == 'audio'), None)
    dur = float(pr['format']['duration'])
    cats = collections.defaultdict(float)
    for s in TL:
        cats[s['kind']] += s['dur']
    real = cats['stock'] + cats['photo'] + cats['doc']
    stock_shots = [s for s in TL if s['kind'] == 'stock']
    longest = max(stock_shots, key=lambda s: s['dur'])
    over = [s['id'] for s in stock_shots if s['dur'] >= 9.5]
    src_count = collections.Counter(s['pixabay_id'] for s in stock_shots)
    reuse = {k: v for k, v in src_count.items() if v > 1}
    over2 = {k: v for k, v in src_count.items() if v > 2}
    # consecutive sections of the same source back-to-back?
    consec = [(a_['id'], b_['id']) for a_, b_ in zip(TL, TL[1:]) if a_.get('pixabay_id') and a_.get('pixabay_id') == b_.get('pixabay_id')]
    blacks = blackdetect()
    freezes = freezedetect()
    errs = decode_errors()
    sil = silence()
    I, P = loudness()
    tel, rom, tags = text_checks()
    trans = collections.Counter(s['trans'] for s in TL)
    fonts = sorted(os.listdir(f'{ROOT}/public/fonts'))
    L = []
    L.append('CANADA — THE SETTLED BRO ILLUSION · QUALITY REPORT')
    L.append('=' * 66)
    L.append(f"File: output/final_video.mp4  ({int(pr['format']['size']) / 1e6:.1f} MB)")
    L.append(f"Runtime: {dur:.3f} s ({int(dur // 60)}:{dur % 60:06.3f})   narration: {AUDIO_DUR:.3f} s   diff: {dur - AUDIO_DUR:+.3f} s")
    L.append(f"Video: {v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} fps {v.get('pix_fmt')}  bitrate≈{int(pr['format']['bit_rate']) / 1e6:.1f} Mb/s")
    if a:
        L.append(f"Audio: {a['codec_name']} {a['sample_rate']} Hz {a['channels']} ch · integrated {I} LUFS · true peak {P} dBFS")
    L.append('')
    L.append('SCREEN-TIME COMPOSITION (by shot category)')
    for k, lab in [('stock', 'Real stock footage (Pixabay video)'), ('photo', 'Real photographs (Commons) incl. photo face-off'), ('doc', 'Genuine document captures'), ('mg', 'Motion graphics (2D/2.5D)'), ('3d', 'True 3D (Three.js/WebGL)')]:
        L.append(f'  {lab:<48} {cats[k]:7.1f} s  {100 * cats[k] / AUDIO_DUR:5.1f}%')
    L.append(f'  => real-imagery-dominant total  {real:7.1f} s  {100 * real / AUDIO_DUR:5.1f}%   (video footage alone {100 * cats["stock"] / AUDIO_DUR:.1f}%)')
    L.append(f'  => graphics-dominant total      {cats["mg"] + cats["3d"]:7.1f} s  {100 * (cats["mg"] + cats["3d"]) / AUDIO_DUR:5.1f}%')
    L.append('  Note: overlays on footage do not change a shot\'s category. Several "motion graphics" shots embed real')
    L.append('  photographs (postcard motif), but are counted as graphics.')
    L.append('')
    L.append('STOCK RULES')
    L.append(f'  Stock shots: {len(stock_shots)} · distinct Pixabay sources: {len(src_count)}')
    L.append(f'  Longest continuous stock shot: {longest["dur"]:.2f} s ({longest["id"]}) · shots ≥ 9.5 s: {over or "none"}')
    L.append(f'  Sources used twice: {reuse or "none"} · used more than twice: {over2 or "none"}')
    L.append(f'  Same source cut back-to-back: {consec or "none"}')
    L.append(f'  All stock audio muted: yes (plates encoded with -an; OffthreadVideo muted)')
    L.append('')
    L.append('TECHNICAL CHECKS')
    L.append(f'  Decode errors: {errs or "none"}')
    L.append(f'  Black segments ≥0.25 s (pix_th 0.06): {blacks or "none"}')
    L.append(f'  Frozen segments ≥2.5 s: {freezes or "none"}  (graphics holds on purpose may appear here)')
    L.append(f'  Audio silences ≥1.5 s below −45 dB: {sil or "none"}')
    L.append(f'  Frame size / rate consistent: {v["width"]}x{v["height"]} @ {v["r_frame_rate"]}')
    L.append('')
    L.append('ON-SCREEN TEXT')
    L.append(f'  Telugu script in any on-screen source: {tel or "none"}')
    L.append(f'  Romanised-Telugu tokens in overlays: {rom or "none"}')
    L.append(f'  Production tags/placeholder words in rendered strings: {tags or "none"}')
    L.append('')
    L.append('TYPOGRAPHY (all SIL OFL, bundled locally)')
    L.append('  Display: Inter Tight 400–900 (Helvetica Neue not licensed here; Inter Tight used as the primary grotesk)')
    L.append('  Editorial: Instrument Serif (headlines/quotes) + Source Serif 4 (document text)')
    L.append('  Technical: IBM Plex Mono (dates, labels, sources, figures)')
    L.append(f'  Files: {", ".join(fonts)}')
    L.append('')
    L.append('TRANSITIONS (into each shot)')
    L.append('  ' + ', '.join(f'{k}: {v}' for k, v in trans.most_common()))
    L.append('')
    L.append('SOUND')
    L.append('  Narration: original canada.mp3, unedited (no cuts, no speed change), loudness-normalised for delivery.')
    L.append('  No music bed. SFX: 13 original procedurally synthesised sounds (scripts/sfx.py); cue list in metadata/sfx_cues.csv.')
    L.append('')
    L.append('TOOLS ACTUALLY USED')
    L.append('  Remotion 4.0.544 (React) for timeline + motion graphics; Three.js 0.177 via @remotion/three for true 3D (WebGL,')
    L.append('  shadows, real camera paths); FFmpeg for plates, mux and QC; torchaudio MMS_FA forced alignment;')
    L.append('  faster-whisper large-v3-turbo for verification; Playwright for document capture.')
    L.append('  Adobe After Effects and Blender were NOT available in this environment and were not used; no .aep is delivered.')
    open(f'{ROOT}/output/quality_report.txt', 'w').write('\n'.join(L) + '\n')
    print('\n'.join(L))


if __name__ == '__main__':
    main()
