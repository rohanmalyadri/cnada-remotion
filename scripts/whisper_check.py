"""Independent Whisper transcription (Telugu) used to verify forced-alignment timing."""
import json, sys
from faster_whisper import WhisperModel
m = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8', cpu_threads=4)
import soundfile as sf
audio, _ = sf.read('.cache/narration16k.wav', dtype='float32')
segs, info = m.transcribe(audio, language='te', beam_size=1, vad_filter=False,
                          condition_on_previous_text=False)
out = []
for s in segs:
    out.append(dict(start=round(s.start, 2), end=round(s.end, 2), text=s.text))
    print(f'{s.start:7.1f} {s.end:7.1f} {s.text}', flush=True)
json.dump(out, open('metadata/whisper_te_segments.json', 'w'), ensure_ascii=False, indent=0)
