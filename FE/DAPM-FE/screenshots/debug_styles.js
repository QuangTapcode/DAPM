const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  });
  const tab = await browser.newPage();
  await tab.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));

  const info = await tab.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    const header = document.querySelector('header');
    const computed = header ? window.getComputedStyle(header) : null;
    return {
      sheetCount: sheets.length,
      sheetsHref: sheets.map(s => s.href || 'inline').slice(0, 5),
      headerBg: computed ? computed.backgroundColor : 'no header',
      headerClass: header ? header.className.slice(0, 100) : 'no header',
      styleTagCount: document.querySelectorAll('style').length,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
