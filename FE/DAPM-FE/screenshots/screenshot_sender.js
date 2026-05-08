// Run: node screenshot_sender.js
const { execSync, spawn } = require('child_process');
const path = require('path');

// We'll use Chrome DevTools Protocol via fetch
// Simple approach: use chrome --print-to-pdf with JS injection

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT    = 'd:\\Hoc\\FE\\DAPM-FE\\screenshots';

const PAGES = [
  { name: 'sender_dashboard', url: 'http://localhost:5173/gui-tre/dashboard'   },
  { name: 'sender_create',    url: 'http://localhost:5173/gui-tre/tao-yeu-cau' },
  { name: 'sender_status',    url: 'http://localhost:5173/gui-tre/trang-thai'  },
  { name: 'sender_profile',   url: 'http://localhost:5173/gui-tre/ho-so'       },
];

// First set localStorage via the inject page, then navigate
const mockUser = JSON.stringify({
  id: 1, email: 'sender@test.com', fullName: 'Nguyễn Thị Lan',
  role: 'sender', token: 'mock-token'
});

// Use Chrome's --remote-debugging-port approach is complex.
// Instead, write a userscript-style data URL that sets LS then redirects.
const { spawnSync } = require('child_process');

for (const page of PAGES) {
  // Create data URL that sets localStorage and redirects
  const html = `<html><body><script>
    localStorage.setItem('mock_user', '${mockUser.replace(/'/g, "\\'")}');
    localStorage.setItem('token', 'mock-token');
    setTimeout(() => { window.location = '${page.url}'; }, 100);
  <\/script></body></html>`;

  const dataUrl = 'data:text/html,' + encodeURIComponent(html);

  console.log(`Screenshotting: ${page.name}`);
  const result = spawnSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,3000',
    `--screenshot=${OUT}\\${page.name}.png`,
    dataUrl,
  ], { timeout: 15000 });

  if (result.status === 0) {
    console.log(`  ✓ ${page.name}.png`);
  } else {
    console.log(`  ✗ Failed: ${result.stderr?.toString()}`);
  }
}

console.log('Done!');
