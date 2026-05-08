const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173", { waitUntil: "networkidle2", timeout: 15000 });
  await page.screenshot({ path: "d:/Hoc/FE/DAPM-FE/screenshots/homepage.png", fullPage: true });
  await browser.close();
  console.log("Screenshot saved");
})();
