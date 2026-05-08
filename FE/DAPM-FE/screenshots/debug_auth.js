const puppeteer = require('puppeteer');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE   = 'http://localhost:5182';

const MOCK_USER = {
  id: 1, email: 'sender@test.com', role: 'sender', fullName: 'Nguyễn Thị Lan',
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME,
    args: ['--no-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const tab = await browser.newPage();
  tab.on('console', m => console.log('PAGE:', m.text().slice(0, 120)));
  tab.on('pageerror', e => console.log('ERR:', e.message));

  await tab.setRequestInterception(true);
  tab.on('request', (req) => {
    const url = req.url();
    if (url.includes('auth/me') || url.includes('auth%2Fme')) {
      console.log('Intercepted /auth/me:', url);
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USER),
      });
    } else if (url.includes('localhost:8080')) {
      console.log('Intercepted API:', url);
      req.respond({ status: 200, contentType: 'application/json', body: '[]' });
    } else {
      req.continue();
    }
  });

  // Set token
  await tab.goto(BASE, { waitUntil: 'domcontentloaded' });
  await tab.evaluate(() => localStorage.setItem('token', 'mock-dev-token'));

  // Navigate to dashboard
  await tab.goto(`${BASE}/gui-tre/dashboard`, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));

  const url = tab.url();
  const title = await tab.title();
  const hasUser = await tab.evaluate(() => !!localStorage.getItem('token'));
  console.log('Current URL:', url);
  console.log('Title:', title);
  console.log('Has token:', hasUser);

  await tab.screenshot({ path: 'D:/Hoc/FE/DAPM-FE/screenshots/debug_dash.png' });
  await browser.close();
  console.log('Done');
})();
