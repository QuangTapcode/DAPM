const puppeteer = require('puppeteer');

const BASE = 'http://localhost:5174';
const OUT  = 'd:\\Hoc\\FE\\DAPM-FE\\screenshots';

const PAGES = [
  { name: 'homepage',         path: '/',                    auth: false },
  { name: 'sender_dashboard', path: '/gui-tre/dashboard',   auth: true  },
  { name: 'sender_create',    path: '/gui-tre/tao-yeu-cau', auth: true  },
  { name: 'sender_status',    path: '/gui-tre/trang-thai',  auth: true  },
  { name: 'sender_profile',   path: '/gui-tre/ho-so',       auth: true  },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  for (const page of PAGES) {
    console.log(`Capturing: ${page.name}...`);
    const tab = await browser.newPage();

    if (page.auth) {
      await tab.goto(`${BASE}/dev-login.html?role=sender&to=${encodeURIComponent(page.path)}`, {
        waitUntil: 'networkidle0',
        timeout: 20000,
      });
    } else {
      await tab.goto(`${BASE}${page.path}`, {
        waitUntil: 'networkidle0',
        timeout: 20000,
      });
    }

    // Wait for React to mount and render
    await tab.waitForSelector('#root > *', { timeout: 10000 });
    // Wait for fonts and styles to apply
    await new Promise(r => setTimeout(r, 2500));

    await tab.screenshot({
      path: `${OUT}\\${page.name}.png`,
      fullPage: false,
    });

    const fs = require('fs');
    const size = fs.statSync(`${OUT}\\${page.name}.png`).size;
    console.log(`  ✓ ${page.name}.png (${(size / 1024).toFixed(0)}KB)`);
    await tab.close();
  }

  await browser.close();
  console.log('Done!');
})();
