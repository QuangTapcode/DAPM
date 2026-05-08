const puppeteer = require('puppeteer');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE   = 'http://localhost:5174';
const OUT    = 'D:/Hoc/FE/DAPM-FE/screenshots';

const PAGES = [
  { name: 'homepage',         path: '/',                    auth: false },
  { name: 'sender_dashboard', path: '/gui-tre/dashboard',   auth: true  },
  { name: 'sender_create',    path: '/gui-tre/tao-yeu-cau', auth: true  },
  { name: 'sender_status',    path: '/gui-tre/trang-thai',  auth: true  },
  { name: 'sender_profile',   path: '/gui-tre/ho-so',       auth: true  },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  });

  for (const page of PAGES) {
    console.log(`Capturing: ${page.name}...`);
    const tab = await browser.newPage();

    const url = page.auth
      ? `${BASE}/dev-login.html?role=sender&to=${encodeURIComponent(page.path)}`
      : `${BASE}${page.path}`;

    await tab.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
    await tab.waitForSelector('#root > div', { timeout: 10000 });
    // Let fonts + styles paint
    await new Promise(r => setTimeout(r, 3000));

    const outPath = path.join(OUT, `${page.name}.png`);
    await tab.screenshot({ path: outPath, fullPage: false });

    const fs = require('fs');
    const size = fs.statSync(outPath).size;
    console.log(`  ${size > 50000 ? '✓' : '?'} ${page.name}.png (${(size / 1024).toFixed(0)}KB)`);
    await tab.close();
  }

  await browser.close();
  console.log('Done!');
})();
