"""Forced-align the romanised Telugu script against the original narration.

Uses torchaudio's MMS_FA (multilingual wav2vec2 CTC aligner trained on uroman
romanised text in 1,100+ languages). The script is already romanised Telugu with
English terms, so it maps directly onto the aligner's a-z vocabulary.

Output: metadata/words.json  [{i, word, norm, start, end, score, para}]
"""
import json, re, subprocess, sys
import numpy as np
import torch, torchaudio
from num2words import num2words

ROOT = '/home/user/cnada-remotion'
AUDIO = f'{ROOT}/input/canada.mp3'
TXT = f'{ROOT}/metadata/script_spoken.txt'


def year_words(n):
    if 2000 <= n <= 2009:
        return 'two thousand ' + num2words(n - 2000) if n > 2000 else 'two thousand'
    if 1900 <= n <= 2099:
        return num2words(n // 100) + ' ' + num2words(n % 100)
    return num2words(n)


def num_to_words(tok):
    tok = tok.replace(',', '')
    if re.fullmatch(r'\d+\.\d+', tok):
        a, b = tok.split('.')
        return num2words(int(a)) + ' point ' + ' '.join(num2words(int(c)) for c in b)
    if re.fullmatch(r'\d+', tok):
        n = int(tok)
        if 1900 <= n <= 2099:
            return year_words(n)
        return num2words(n)
    return tok


def normalise(word):
    w = word.lower()
    w = w.replace('h-1b', 'h one b').replace('b.tech', 'b tech')
    w = re.sub(r'(\d+(?:[.,]\d+)*)', lambda m: ' ' + num_to_words(m.group(1)) + ' ', w)
    w = w.replace('%', ' percent ')
    w = re.sub(r"[^a-z' ]", ' ', w)
    w = re.sub(r'-', ' ', w)
    return ' '.join(w.split())


def main():
    raw = open(TXT).read()
    # paragraphs = blank-line-free; treat chapter headings as their own paragraph
    words = []
    para = 0
    for line in raw.split('\n'):
        if re.match(r'^\d\. ', line):
            para += 1
        for w in line.split():
            words.append({'word': w, 'para': para})
    for w in words:
        w['norm'] = normalise(w['word'])
    # Build token sequence: each script word -> one or more aligner words
    al_words, owner = [], []
    for i, w in enumerate(words):
        for p in w['norm'].split():
            p = p.replace("'", '')
            if p:
                al_words.append(p)
                owner.append(i)

    wav = f'{ROOT}/.cache/narration16k.wav'
    subprocess.run(['mkdir', '-p', f'{ROOT}/.cache'])
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', AUDIO, '-ac', '1', '-ar', '16000', wav], check=True)
    import soundfile  # noqa
    data, sr = soundfile.read(wav, dtype='float32')
    waveform = torch.from_numpy(data)[None]

    bundle = torchaudio.pipelines.MMS_FA
    model = bundle.get_model(with_star=False)
    model.eval()
    torch.set_num_threads(4)
    # chunked emissions (30 s windows, 2 s context each side)
    chunk = sr * 30
    ctx = sr * 2
    ems = []
    with torch.inference_mode():
        total = waveform.shape[1]
        pos = 0
        while pos < total:
            s = max(0, pos - ctx)
            e = min(total, pos + chunk + ctx)
            em, _ = model(waveform[:, s:e])
            em = torch.log_softmax(em, dim=-1)
            fps = em.shape[1] / (e - s)
            a = int(round((pos - s) * fps))
            b = a + int(round((min(total, pos + chunk) - pos) * fps))
            ems.append(em[:, a:b])
            pos += chunk
            print(f'emission {pos/sr:.0f}s', file=sys.stderr, flush=True)
    emission = torch.cat(ems, dim=1)
    frame_sec = total / sr / emission.shape[1]
    labels = bundle.get_labels(star=None)
    dic = {c: i for i, c in enumerate(labels)}
    tokens = [dic[c] for w in al_words for c in w if c in dic]
    print('frames', emission.shape[1], 'tokens', len(tokens), file=sys.stderr)
    targets = torch.tensor([tokens], dtype=torch.int32)
    ali, scores = torchaudio.functional.forced_align(emission, targets, blank=0)
    ali, scores = ali[0], scores[0].exp()
    spans = torchaudio.functional.merge_tokens(ali, scores)
    # group spans by aligner word
    out_al = []
    k = 0
    for w in al_words:
        n = len([c for c in w if c in dic])
        ws = spans[k:k + n]
        k += n
        out_al.append((ws[0].start * frame_sec, ws[-1].end * frame_sec,
                       float(np.mean([s.score for s in ws]))))
    for i, w in enumerate(words):
        idx = [j for j, o in enumerate(owner) if o == i]
        w['i'] = i
        if idx:
            w['start'] = round(out_al[idx[0]][0], 3)
            w['end'] = round(out_al[idx[-1]][1], 3)
            w['score'] = round(float(np.mean([out_al[j][2] for j in idx])), 3)
    # fill punctuation-only words
    for i, w in enumerate(words):
        if 'start' not in w:
            prev = words[i - 1] if i else {'end': 0}
            w['start'] = w['end'] = prev.get('end', 0)
            w['score'] = 0
    json.dump(words, open(f'{ROOT}/metadata/words.json', 'w'), indent=0)
    print('done', len(words), 'last end', words[-1]['end'], 'audio', total / sr)


if __name__ == '__main__':
    main()
