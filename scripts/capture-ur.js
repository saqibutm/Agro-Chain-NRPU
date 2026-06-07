// Capture Urdu (اردو) screenshots into store/screenshots/ur/ by toggling the
// in-app language before navigating. Requires the dev server running + puppeteer-core.
//   node scripts/capture-ur.js
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:8082';
const OUT = path.resolve(__dirname, '../store/screenshots/ur');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForApp(page) {
  for (let i = 0; i < 60; i++) {
    const ok = await page.evaluate(() => { const r = document.getElementById('root'); return !!(r && r.childElementCount > 0 && (document.body.innerText || '').length > 0); });
    if (ok) return true; await sleep(500);
  }
  return false;
}
const clickByText = (t) => `(() => { const e=[...document.querySelectorAll('div,span,a')].reverse().find(x=>x.textContent.trim()===${JSON.stringify(t)}); if(e){let n=e; while(n&&!(n.getAttribute&&(n.getAttribute('role')==='button'||n.onclick)))n=n.parentElement; (n||e).click(); return true;} return false; })()`;
const clickTab = (i) => `(() => { const t=[...document.querySelectorAll('[role="tab"], a[href]')]; if(t[${i}]){t[${i}].click();return true;} return false; })()`;

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'], defaultViewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true } });
  const page = await browser.newPage();
  const shoot = async (n) => { await page.screenshot({ path: path.join(OUT, n) }); console.log('saved', n); };

  await page.goto(URL, { waitUntil: 'networkidle2' });
  await waitForApp(page);
  await sleep(1200);

  // Switch to Urdu via Settings → اردو
  await page.evaluate(clickTab(3)); await sleep(1000);
  await page.evaluate(clickByText('اردو')); await sleep(1000);
  await shoot('04-settings-language.png');

  // Home (Urdu KPI labels)
  await page.evaluate(clickTab(0)); await sleep(1200);
  await shoot('01-home-dashboard.png');

  // Product Journey (Urdu section titles) via tracking
  await page.evaluate(clickTab(2)); await sleep(1200);
  await page.evaluate(() => { const node=[...document.querySelectorAll('div,span')].find(x=>/WHT-FSD-2025-0001/.test(x.textContent)&&x.textContent.length<160); let el=node; while(el&&!(el.getAttribute&&(el.getAttribute('role')==='button'||el.onclick)))el=el.parentElement; (el||node)&&(el||node).click(); });
  await sleep(1500);
  await shoot('07-product-journey.png');

  // GPS Map route
  await page.evaluate(() => { const el=[...document.querySelectorAll('div,span,a')].reverse().find(x=>/View Route on Map|نقشے پر/.test(x.textContent)&&x.textContent.length<60); let t=el; while(t&&!(t.getAttribute&&(t.getAttribute('role')==='button'||t.onclick)))t=t.parentElement; (t||el)&&(t||el).click(); });
  await sleep(1800);
  await shoot('08-gps-map-route.png');

  // About (Urdu acknowledgment titles)
  await page.evaluate(clickTab(3)); await sleep(800);
  await page.evaluate(clickByText('تعارف')); await sleep(1200);
  await shoot('05-about.png');

  await browser.close();
  console.log('done →', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
