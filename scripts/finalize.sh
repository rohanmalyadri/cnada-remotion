#!/bin/bash
# Concatenate rendered chunks (stream copy), loudness-normalise the narration+SFX mix, mux.
set -e
cd "$(dirname "$0")/.."
ls output/chunks/c_*.mp4 | sort | sed "s/^/file '..\//; s/$/'/" > output/chunks/list.txt
sed -i "s#file '../output/chunks/#file '#" output/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i output/chunks/list.txt -c copy output/video_only.mp4
# two-pass EBU R128 normalisation to -14 LUFS / -1 dBTP (YouTube reference)
M=$(ffmpeg -hide_banner -i output/mix.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'])")
mtp=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_tp'])")
mlra=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_lra'])")
mth=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_thresh'])")
ffmpeg -v error -y -i output/video_only.mp4 -i output/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy \
  -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:linear=true" \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -t 1164.48 output/final_video.mp4
rm -f output/video_only.mp4
ffprobe -v error -show_entries format=duration,size -of default=nw=1 output/final_video.mp4
