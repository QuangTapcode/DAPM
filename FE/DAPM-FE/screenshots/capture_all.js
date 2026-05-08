const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE   = 'http://localhost:5192';
const OUT    = 'D:/Hoc/FE/DAPM-FE/screenshots';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function makeUser(role, fullName, email) {
  return JSON.stringify({ email, role, fullName });
}

const PAGES = [
  // Guest
  { name: '01_homepage',         path: '/',                         auth: null },
  { name: '02_login',            path: '/dang-nhap',                auth: null },
  // Sender
  { name: '03_sender_dashboard', path: '/gui-tre/dashboard',        auth: makeUser('sender', 'Nguyễn Thị Lan', 'sender@test.com') },
  { name: '04_sender_create',    path: '/gui-tre/tao-yeu-cau',      auth: makeUser('sender', 'Nguyễn Thị Lan', 'sender@test.com') },
  { name: '05_sender_status',    path: '/gui-tre/trang-thai',       auth: makeUser('sender', 'Nguyễn Thị Lan', 'sender@test.com') },
  { name: '06_sender_profile',   path: '/gui-tre/ho-so',            auth: makeUser('sender', 'Nguyễn Thị Lan', 'sender@test.com') },
  // Adopter
  { name: '07_adopter_status',   path: '/nhan-nuoi/trang-thai',     auth: makeUser('adopter', 'Trần Văn Hùng', 'adopter@test.com') },
  { name: '08_adopter_profile',  path: '/nhan-nuoi/ho-so',          auth: makeUser('adopter', 'Trần Văn Hùng', 'adopter@test.com') },
  { name: '09_adopter_create',   path: '/nhan-nuoi/tao-don',        auth: makeUser('adopter', 'Trần Văn Hùng', 'adopter@test.com') },
  // Staff Reception
  { name: '10_reception_dashboard', path: '/can-bo-tiep-nhan/dashboard',       auth: makeUser('staff_reception', 'Lê Thị Hoa', 'reception@test.com') },
  { name: '11_reception_requests',  path: '/can-bo-tiep-nhan/yeu-cau',         auth: makeUser('staff_reception', 'Lê Thị Hoa', 'reception@test.com') },
  { name: '12_reception_children',  path: '/can-bo-tiep-nhan/tre',             auth: makeUser('staff_reception', 'Lê Thị Hoa', 'reception@test.com') },
  { name: '13_reception_chitiet',   path: '/can-bo-tiep-nhan/chi-tiet?id=1',   auth: makeUser('staff_reception', 'Lê Thị Hoa', 'reception@test.com') },
  { name: '14_reception_tiepnhan',  path: '/can-bo-tiep-nhan/tiep-nhan?requestId=1', auth: makeUser('staff_reception', 'Lê Thị Hoa', 'reception@test.com') },
  { name: '15_reception_suchoe',    path: '/can-bo-tiep-nhan/suc-khoe?childId=1',    auth: makeUser('staff_reception', 'Lê Thị Hoa', 'reception@test.com') },
  // Staff Adoption
  { name: '16_adoption_dashboard',  path: '/can-bo-nhan-nuoi/dashboard',              auth: makeUser('staff_adoption', 'Phạm Văn Dũng', 'adoption@test.com') },
  { name: '17_adoption_list',       path: '/can-bo-nhan-nuoi/danh-sach',              auth: makeUser('staff_adoption', 'Phạm Văn Dũng', 'adoption@test.com') },
  { name: '18_adoption_children',   path: '/can-bo-nhan-nuoi/tre',                   auth: makeUser('staff_adoption', 'Phạm Văn Dũng', 'adoption@test.com') },
  // Admin
  { name: '19_admin_dashboard',    path: '/admin/dashboard',   auth: makeUser('admin', 'Admin Alpha', 'admin@test.com') },
  { name: '20_admin_accounts',     path: '/admin/accounts',    auth: makeUser('admin', 'Admin Alpha', 'admin@test.com') },
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
      // Set mock_user in localStorage then navigate
      await tab.goto(BASE, { waitUntil: 'domcontentloaded' });
      await tab.evaluate((mockUser) => {
        localStorage.setItem('mock_user', mockUser);
      }, page.auth);
      await tab.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle0', timeout: 20000 });
    } else {
      await tab.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle0', timeout: 20000 });
    }

    await tab.waitForSelector('#root > *', { timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    const outPath = path.join(OUT, `${page.name}.png`);
    await tab.screenshot({ path: outPath, fullPage: false });

    const size = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
    console.log(`  ${size > 60000 ? '✓' : '?'} ${page.name}.png (${(size / 1024).toFixed(0)}KB)`);
    await tab.close();
  }

  await browser.close();
  console.log('Done!');
})();
