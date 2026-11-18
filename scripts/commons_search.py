import sys, time
sys.path.insert(0,'scripts')
from commons_lib import api
for q in sys.argv[1:]:
    time.sleep(3)
    d=api(action='query',generator='search',gsrsearch=q,gsrnamespace=6,gsrlimit=8,prop='imageinfo',iiprop='url|size|extmetadata')
    print('==',q, flush=True)
    for p in sorted(d.get('query',{}).get('pages',{}).values(),key=lambda p:p.get('index',0)):
        ii=p['imageinfo'][0]; m=ii.get('extmetadata',{})
        print(f"  {p['title'][:90]} | {ii['width']}x{ii['height']} | {m.get('LicenseShortName',{}).get('value')} | {m.get('DateTimeOriginal',{}).get('value','')[:20]}", flush=True)
