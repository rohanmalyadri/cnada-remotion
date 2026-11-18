#!/bin/bash
# Chunked render of the full documentary (resumable). Video only; audio is muxed afterwards.
cd "$(dirname "$0")/.."
TOTAL=34935; STEP=3000
mkdir -p output/chunks
for ((s=0; s<TOTAL; s+=STEP)); do
  e=$((s+STEP-1)); [ $e -ge $TOTAL ] && e=$((TOTAL-1))
  out=$(printf "output/chunks/c_%05d_%05d.mp4" $s $e)
  [ -f "$out" ] && continue
  echo "$(date +%T) rendering $s-$e"
  npx remotion render Documentary "$out.tmp.mp4" --frames=$s-$e --gl=swangle --concurrency=4 --muted \
     --codec=h264 --crf=17 --x264-preset=medium --pixel-format=yuv420p --log=error && mv "$out.tmp.mp4" "$out" || { echo "FAILED $s-$e"; exit 1; }
done
echo "$(date +%T) ALL CHUNKS DONE"
