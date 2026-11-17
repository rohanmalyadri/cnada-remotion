"""Download chosen Wikimedia Commons files with licence metadata (slow, rate-limit aware).
usage: python3 commons_download.py specs.txt   (lines: outdir|search|title prefix|slug)
"""
import sys, json, os, time, re, html, urllib.request, urllib.error, urllib.parse
sys.path.insert(0,'scripts')
from commons_lib import api
UA={'User-Agent':'Mozilla/5.0 (compatible; research-downloader/1.0)'}
manifest='metadata/commons_assets.json'
db=json.load(open(manifest)) if os.path.exists(manifest) else {}
def strip(s): return html.unescape(re.sub('<[^>]+>','',s or '')).strip()
todo=[l.strip().split('|') for l in open(sys.argv[1]) if l.strip() and not l.startswith('#')]
# resolve metadata first (API host is not throttled the same way)
for out,q,prefix,slug in todo:
    if slug in db and os.path.exists(db[slug]['file']) and os.path.getsize(db[slug]['file'])>0: continue
    if slug in db and 'download_url' in db[slug]: continue
    time.sleep(2)
    d=api(action='query',generator='search',gsrsearch=q,gsrnamespace=6,gsrlimit=25,prop='imageinfo',iiprop='url|size|extmetadata',iiurlwidth=1920)
    pages=sorted(d.get('query',{}).get('pages',{}).values(),key=lambda p:p.get('index',0))
    pick=[p for p in pages if p['title'].startswith('File:'+prefix)]
    if not pick: print('NOT FOUND',slug,flush=True); continue
    p=pick[0]; ii=p['imageinfo'][0]; m=ii.get('extmetadata',{})
    url=ii['url'] if ii['width']<=2600 else (ii.get('thumburl') or ii['url'])
    ext=os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    db[slug]=dict(file=f'{out}/{slug}{ext}',title=p['title'],source_url=ii['descriptionurl'],download_url=url,
        author=strip(m.get('Artist',{}).get('value'))[:200],credit=strip(m.get('Credit',{}).get('value'))[:200],
        license=m.get('LicenseShortName',{}).get('value'),license_url=m.get('LicenseUrl',{}).get('value'),
        date=strip(m.get('DateTimeOriginal',{}).get('value'))[:40],size=f"{ii['width']}x{ii['height']}",
        description=strip(m.get('ImageDescription',{}).get('value'))[:300])
    json.dump(db,open(manifest,'w'),indent=1)
    print('META',slug,p['title'][:70],db[slug]['license'],flush=True)
for out,q,prefix,slug in todo:
    if slug not in db: continue
    e=db[slug]; os.makedirs(out,exist_ok=True)
    if os.path.exists(e['file']) and os.path.getsize(e['file'])>0: continue
    while True:
        try:
            data=urllib.request.urlopen(urllib.request.Request(e['download_url'],headers=UA),timeout=120).read()
            open(e['file'],'wb').write(data); print('GOT',slug,len(data),flush=True); time.sleep(8); break
        except urllib.error.HTTPError as err:
            if err.code==429:
                w=int(err.headers.get('Retry-After') or 300); print('429 wait',w,flush=True); time.sleep(min(w,620)); continue
            print('ERR',slug,err.code,flush=True); break
print('ALL DONE',flush=True)
