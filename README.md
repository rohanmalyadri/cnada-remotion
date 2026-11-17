# CANADA — The Settled Bro Illusion

Narration-synchronised documentary (Telugu voice-over, English-only screen text), built with
**Remotion 4 + React** for the edit and motion graphics and **Three.js** (via `@remotion/three`) for
true 3D sequences. The original narration (`input/canada.mp3`, 19:24.48) is the master timeline.

## Pipeline

| Step | Script | Output |
|---|---|---|
| Forced alignment of the romanised script (MMS multilingual CTC aligner) | `scripts/align.py` | `metadata/words.json`, `metadata/words_aligned.csv` |
| Independent check of the narration (Whisper large-v3-turbo, Telugu) | `scripts/whisper_check.py`, `scripts/whisper_windows.py` | `metadata/whisper_te_segments.json` |
| Narration-to-visual plan (≈200 beats anchored to spoken phrases) | `scripts/plan.py` → `scripts/build_timeline.py` | `metadata/timeline_draft.json` |
| Pixabay search, scoring, contact sheets, manual curation | `scripts/pixabay.py`, `scripts/stock_candidates.py`, `scripts/probe.py` | `metadata/stock_candidates.json`, `metadata/stock_overrides.json` |
| Download, validate, choose in-points, cut ≤9 s plates | `scripts/fetch_stock.py` | `public/stock/*.mp4` (git-ignored), `metadata/stock_usage.json` |
| Wikimedia Commons photographs with licences | `scripts/commons_download.py` | `assets/web_images`, `assets/historical`, `metadata/commons_assets.json` |
| Genuine source documents + highlight boxes | `scripts/doc_boxes.js` (Playwright) | `public/docs/*.png`, `src/data/docs.json` |
| Compile render timeline + transitions | `scripts/compile_timeline.py` | `src/data/timeline.json` |
| Original sound design + mix | `scripts/sfx.py` | `assets/sound_effects/*.wav`, `metadata/sfx_cues.csv` |
| Chunked render | `scripts/render_full.sh` | `output/chunks/*.mp4` |
| Metadata deliverables | `scripts/reports.py` | `metadata/scene_plan.csv`, `asset_manifest.csv`, `source_references.csv`, `narration_timestamps.srt` |
| QC | `scripts/qc.py` | `output/quality_report.txt` |

## Re-rendering

```bash
npm install
echo "PIXABAY_API_KEY=..." > .env          # only needed to re-download stock (file is git-ignored)
python3 scripts/fetch_stock.py              # re-creates public/stock from the curated picks
python3 scripts/compile_timeline.py
./scripts/render_full.sh
```

Preview any single shot in the studio with the `Shot` composition (`npx remotion studio`).

## Design system
* Colours: `src/theme.ts` (white/blue primary; pale yellow for research notes; red only for warnings/cuts).
* Type: Inter Tight (display), Instrument Serif + Source Serif 4 (editorial), IBM Plex Mono (technical) — all SIL OFL.
* Motion: graph-editor style cubic-bezier curves and weighted springs in `src/lib/anim.ts`.

See `output/fact_check_report.txt` for verified figures, corrections shown on screen, and open questions.
