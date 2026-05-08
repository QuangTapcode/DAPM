const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE   = 'http://localhost:5182';
const OUT    = 'D:/Hoc/FE/DAPM-FE/screenshots';

const MOCK_USER = {
  id: 1,
  email: 'sender@test.com',
  role: 'sender',
  fullName: 'Nguyễn Thị Lan',
};

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

    if (page.auth) {
      // Intercept API calls to mock authentication
      await tab.setRequestInterception(true);
      const CORS_HEADERS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json',
      };
      tab.on('request', (req) => {
        const url = req.url();
        if (url.includes('localhost:8080')) {
          if (url.includes('auth/me')) {
            req.respond({ status: 200, headers: CORS_HEADERS, body: JSON.stringify(MOCK_USER) });
          } else {
            req.respond({ status: 200, headers: CORS_HEADERS, body: '[]' });
          }
        } else {
          req.continue();
        }
      });

      // Set token in localStorage then navigate
      await tab.goto(BASE, { waitUntil: 'domcontentloaded' });
      await tab.evaluate(() => {
        localStorage.setItem('token', 'mock-dev-token');
      });
      await tab.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle0', timeout: 20000 });
    } else {
      await tab.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle0', timeout: 20000 });
    }

    // Wait for content to render
    await tab.waitForSelector('#root > *', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));

    const outPath = path.join(OUT, `${page.name}.png`);
    await tab.screenshot({ path: outPath, fullPage: false });

    const size = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
    console.log(`  ${size > 80000 ? '✓' : '?'} ${page.name}.png (${(size / 1024).toFixed(0)}KB)`);
    await tab.close();
  }

  await browser.close();
  console.log('Done!');
})();
