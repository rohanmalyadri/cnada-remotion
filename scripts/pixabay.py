"""Pixabay video API helper.

* API key is read from the PIXABAY_API_KEY environment variable (or the
  git-ignored .env file). It is never printed or written to any output file.
* Responses are cached on disk for 24 h, as required by the Pixabay API terms.
* Requests are throttled well below the 100 requests / 60 s limit.
"""
import hashlib, json, os, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.cache', 'pixabay')
os.makedirs(CACHE, exist_ok=True)
_last = [0.0]


def _key():
    k = os.environ.get('PIXABAY_API_KEY')
    if not k and os.path.exists(os.path.join(ROOT, '.env')):
        for line in open(os.path.join(ROOT, '.env')):
            if line.startswith('PIXABAY_API_KEY='):
                k = line.split('=', 1)[1].strip()
    if not k:
        raise SystemExit('PIXABAY_API_KEY is not set')
    return k


def search(q, per_page=40, min_width=1920, page=1):
    params = dict(q=q, per_page=per_page, page=page, video_type='film', safesearch='true', order='popular')
    h = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()[:16]
    cf = os.path.join(CACHE, h + '.json')
    if os.path.exists(cf) and time.time() - os.path.getmtime(cf) < 86400:
        data = json.load(open(cf))
    else:
        wait = 0.8 - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        url = 'https://pixabay.com/api/videos/?' + urllib.parse.urlencode(dict(params, key=_key()))
        for attempt in range(5):
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) documentary-stock-search/1.0'})
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = json.load(r)
                break
            except Exception as e:  # noqa: BLE001  (never echo the URL: it carries the key)
                if attempt == 4:
                    raise RuntimeError(f'pixabay search failed for {q!r}: {type(e).__name__}')
                time.sleep(5 * (attempt + 1))
        _last[0] = time.time()
        data['_query'] = q
        json.dump(data, open(cf, 'w'))
    hits = []
    for h_ in data.get('hits', []):
        # pick the 1920x1080-ish rendition (avoid decoding 4K for a 1080p master)
        best = None
        for name in ('small', 'medium', 'large'):
            v = h_['videos'].get(name) or {}
            if v.get('url') and v.get('width', 0) >= min_width:
                best = (name, v)
                break
        if not best:
            continue
        if h_['videos'][best[0]]['width'] < h_['videos'][best[0]]['height']:
            continue  # portrait
        hits.append(dict(id=h_['id'], tags=h_['tags'], duration=h_['duration'], user=h_['user'],
                         page=h_['pageURL'], rendition=best[0], url=best[1]['url'], width=best[1]['width'],
                         height=best[1]['height'], size=best[1]['size'], thumb=best[1].get('thumbnail'),
                         downloads=h_.get('downloads', 0), likes=h_.get('likes', 0), query=q))
    return hits


def search_images(q, per_page=30, min_width=2400):
    params = dict(q=q, per_page=per_page, image_type='photo', orientation='horizontal', safesearch='true', order='popular')
    h = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()[:16]
    cf = os.path.join(CACHE, 'img_' + h + '.json')
    if os.path.exists(cf) and time.time() - os.path.getmtime(cf) < 86400:
        data = json.load(open(cf))
    else:
        time.sleep(0.8)
        url = 'https://pixabay.com/api/?' + urllib.parse.urlencode(dict(params, key=_key()))
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) documentary-stock-search/1.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.load(r)
        json.dump(data, open(cf, 'w'))
    return [dict(id=x['id'], tags=x['tags'], w=x['imageWidth'], h=x['imageHeight'], url=x['largeImageURL'],
                 preview=x['webformatURL'], page=x['pageURL'], user=x['user'], downloads=x['downloads'])
            for x in data.get('hits', []) if x['imageWidth'] >= min_width]
