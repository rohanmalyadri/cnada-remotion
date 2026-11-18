import json, time, urllib.request, urllib.parse, urllib.error
UA={'User-Agent':'DocumentaryResearchBot/1.0 (non-commercial research script)'}
def get(url, binary=False, tries=8):
    for k in range(tries):
        try:
            r=urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=120)
            return r.read() if binary else json.load(r)
        except urllib.error.HTTPError as e:
            if e.code==429:
                wait=int(e.headers.get('Retry-After') or 0) or 20*(k+1)
                time.sleep(min(wait,120)); continue
            raise
    raise RuntimeError('rate limited')
def api(**params):
    params.update(format='json')
    return get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params))
