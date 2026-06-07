// Dev utility: capture English app screenshots from the running Expo web server
// (http://localhost:8082) into store/screenshots/en/ using the system Chrome.
// Requires: dev server running, DEV_SCREENSHOT_BYPASS enabled, puppeteer-core.
//   node scripts/capture-screenshots.js
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:8082';
const OUT = path.resolve(__dirname, '../store/screenshots/en');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForApp(page) {
  for (let i = 0; i < 60; i++) {
    const ok = await page.evaluate(() => {
      const r = document.getElementById('root');
      return !!(r && r.childElementCount > 0 && (document.body.innerText || '').length > 0);
    });
    if (ok) return true;
    await sleep(500);
  }
  return false;
}

const clickByText = (text) =>
  `(() => { const e=[...document.querySelectorAll('div,span,a')].reverse().find(x=>x.textContent.trim()===${JSON.stringify(text)}); if(e){e.click();return true;} return false; })()`;

const clickTab = (i) =>
  `(() => { const t=[...document.querySelectorAll('[role="tab"], a[href]')]; if(t[${i}]){t[${i}].click();return true;} return false; })()`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
  });
  const page = await browser.newPage();

  const shoot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name) });
    console.log('saved', name);
  };
  const goHome = async () => { await page.goto(URL, { waitUntil: 'networkidle2' }); await waitForApp(page); await sleep(1200); };

  // 1. Home dashboard
  await goHome();
  await shoot('01-home-dashboard.png');

  // 2. Add Crop
  await page.evaluate(clickByText('New Batch')); await sleep(1200);
  await shoot('02-add-crop.png');

  // 3. Supply Chain Tracking (tab index 2)
  await goHome();
  await page.evaluate(clickTab(2)); await sleep(1200);
  await shoot('03-supply-chain-tracking.png');

  // 4. Settings (tab index 3)
  await page.evaluate(clickTab(3)); await sleep(1000);
  await shoot('04-settings-language.png');

  // 5. About (from Settings)
  await page.evaluate(clickByText('About')); await sleep(1200);
  await shoot('05-about.png');

  // 6. Fraud Alerts
  await goHome();
  await page.evaluate(clickByText('Fraud Alerts')); await sleep(1200);
  await shoot('06-fraud-alerts.png');

  // 7. Product Journey (open a demo product from Supply Chain Tracking)
  await goHome();
  await page.evaluate(clickTab(2)); await sleep(1200);
  await page.evaluate(() => {
    const node=[...document.querySelectorAll('div,span')].find(x=>/WHT-FSD-2025-0001/.test(x.textContent) && x.textContent.length<160);
    let el=node; while(el && !(el.getAttribute && (el.getAttribute('role')==='button' || el.onclick))) el=el.parentElement;
    (el||node) && (el||node).click();
  });
  await sleep(1500);
  await shoot('07-product-journey.png');

  // 8. GPS Map route (open "View Route on Map" from the product journey)
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('div,span,a')].reverse().find(x => /View Route on Map/.test(x.textContent) && x.textContent.length < 60);
    let t = el; while (t && !(t.getAttribute && (t.getAttribute('role') === 'button' || t.onclick))) t = t.parentElement;
    (t || el) && (t || el).click();
  });
  await sleep(1800);
  await shoot('08-gps-map-route.png');

  await browser.close();
  console.log('done →', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
