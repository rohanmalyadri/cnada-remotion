import sys, soundfile as sf
from faster_whisper import WhisperModel
m = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8', cpu_threads=2)
audio, sr = sf.read('.cache/narration16k.wav', dtype='float32')
for rng in sys.argv[1:]:
    a, b = map(float, rng.split('-'))
    t = a
    while t < b:
        seg = audio[int(t*sr):int(min(b, t+8)*sr)]
        segs, _ = m.transcribe(seg, language='te', beam_size=3, condition_on_previous_text=False, vad_filter=False)
        print(f'{t:7.1f}', ' '.join(s.text.strip() for s in segs), flush=True)
        t += 8
