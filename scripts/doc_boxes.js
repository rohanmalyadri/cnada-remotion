// For a page capture, scroll to an anchor text and record bounding boxes of highlight phrases.
// usage: node doc_boxes.js URL OUT anchorText "phrase1|phrase2" [w] [h]
const {chromium} = require('playwright');
(async () => {
  const [url, out, anchor, phrases, w = '1440', h = '1300'] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({viewport: {width: +w, height: +h}, deviceScaleFactor: 1.5});
  await pg.goto(url, {waitUntil: 'domcontentloaded', timeout: 90000});
  await pg.waitForTimeout(2500);
  if (anchor) {
    await pg.getByText(anchor, {exact: false}).first().scrollIntoViewIfNeeded({timeout: 15000});
    await pg.evaluate(() => window.scrollBy(0, -200));
    await pg.waitForTimeout(500);
  }
  const boxes = await pg.evaluate((ps) => {
    const res = [];
    for (const ph of ps) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const i = n.textContent.indexOf(ph);
        if (i >= 0) {
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, i + ph.length);
          const rects = Array.from(r.getClientRects()).map((q) => [q.x, q.y, q.width, q.height]);
          res.push({ph, rects});
          break;
        }
      }
    }
    return res;
  }, phrases.split('|'));
  await pg.screenshot({path: out});
  console.log(JSON.stringify({out, scale: 1.5, w: +w, h: +h, boxes}));
  await b.close();
})().catch((e) => { console.error('ERR', e.message.slice(0, 200)); process.exit(1); });
