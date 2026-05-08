const { spawnSync } = require('child_process');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT    = 'd:\\Hoc\\FE\\DAPM-FE\\screenshots';
const BASE   = 'http://localhost:5174';

const PAGES = [
  { name: 'homepage',         path: '/'                    },
  { name: 'sender_dashboard', path: '/gui-tre/dashboard'   },
  { name: 'sender_create',    path: '/gui-tre/tao-yeu-cau' },
  { name: 'sender_status',    path: '/gui-tre/trang-thai'  },
  { name: 'sender_profile',   path: '/gui-tre/ho-so'       },
];

// Step 1: inject auth via dev-login.html (same origin = localStorage works)
// Step 2: Chrome has the LS set, then redirect to target page
// We use --virtual-time-budget to wait for JS redirect

for (const page of PAGES) {
  const injectUrl = `${BASE}/dev-login.html?role=sender&to=${encodeURIComponent(page.path)}`;

  console.log(`Capturing: ${page.name}`);
  const r = spawnSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=5000',
    '--window-size=1280,900',
    `--screenshot=${OUT}\\${page.name}.png`,
    injectUrl,
  ], { timeout: 20000 });

  const size = require('fs').existsSync(`${OUT}\\${page.name}.png`)
    ? require('fs').statSync(`${OUT}\\${page.name}.png`).size
    : 0;
  console.log(`  ${size > 50000 ? '✓' : '?'} ${page.name}.png (${(size/1024).toFixed(0)}KB)`);
}
console.log('Done');
