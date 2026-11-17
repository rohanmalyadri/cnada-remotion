#!/bin/bash
# usage: stills.sh OUTNAME "S007:30" "S007:90" ...   (shot:frame) -> .cache/stills/OUTNAME.jpg contact sheet
set -e
OUT=$1; shift
mkdir -p .cache/stills/tmp
rm -f .cache/stills/tmp/*.png
i=0
for spec in "$@"; do
  id=${spec%%:*}; fr=${spec##*:}
  npx remotion still Shot .cache/stills/tmp/$(printf %02d $i)_${id}_${fr}.png --props="{\"id\":\"$id\"}" --frame=$fr --gl=swangle --log=error >/dev/null 2>&1 || echo "FAIL $spec"
  i=$((i+1))
done
python3 - "$OUT" <<'PY'
import sys,glob
from PIL import Image, ImageDraw, ImageFont
fs=sorted(glob.glob('.cache/stills/tmp/*.png'))
font=ImageFont.truetype('.cache/DejaVuSans.ttf',22)
tw,th=960,540; cols=2; rows=(len(fs)+1)//2
out=Image.new('RGB',(cols*tw,rows*th),'black'); d=ImageDraw.Draw(out)
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((tw,th)); x=(i%cols)*tw; y=(i//cols)*th
    out.paste(im,(x,y)); d.rectangle([x,y,x+260,y+30],fill='black'); d.text((x+6,y+4),f.split('/')[-1][3:-4],fill='yellow',font=font)
out.save(f'.cache/stills/{sys.argv[1]}.jpg',quality=85)
PY
echo ".cache/stills/$OUT.jpg"
