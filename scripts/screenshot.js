// Capture genuine source pages for on-screen evidence (news reporting / criticism, with attribution).
// usage: node screenshot.js URL OUT [findText] [width] [height]
const {chromium} = require('playwright');
(async () => {
  const [url, out, find = '', w = '1440', h = '1300'] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({viewport: {width: +w, height: +h}, deviceScaleFactor: 1.5});
  await pg.goto(url, {waitUntil: 'domcontentloaded', timeout: 90000});
  await pg.waitForTimeout(2500);
  // remove cookie banners / sticky overlays where present
  await pg.evaluate(() => document.querySelectorAll('[id*="cookie"],[class*="cookie"],[class*="consent"],[id*="consent"]').forEach((e) => e.remove()));
  if (find) {
    const loc = pg.getByText(find, {exact: false}).first();
    await loc.scrollIntoViewIfNeeded({timeout: 15000});
    await pg.evaluate(() => window.scrollBy(0, -260));
    await pg.waitForTimeout(600);
  }
  await pg.screenshot({path: out});
  await b.close();
  console.log('ok', out);
})().catch((e) => { console.error('ERR', e.message.slice(0, 200)); process.exit(1); });
