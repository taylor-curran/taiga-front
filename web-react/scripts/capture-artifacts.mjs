// Capture before/after screenshots + a single demo video for the PR. Drives
// both the AngularJS gateway (`http://localhost:9000`) and the React port
// (`http://localhost:5173`) against the seeded data.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../artifacts');
const ANGULAR = process.env.ANGULAR_BASE || 'http://localhost:9000';
const REACT = process.env.REACT_BASE || 'http://localhost:5173';
const ADMIN = { user: process.env.TAIGA_ADMIN_USER || 'admin', pass: process.env.TAIGA_ADMIN_PASS || 'adminpass' };

await mkdir(OUT, { recursive: true });
await mkdir(path.join(OUT, 'screenshots'), { recursive: true });

const ROUTES = [
  { name: 'login', path: '/login', auth: false },
  { name: 'home', path: '/', auth: true },
  { name: 'discover', path: '/discover', auth: false },
  { name: 'projects-listing', path: '/projects/', auth: true },
  { name: 'project-backlog', path: '/project/project-1/backlog', auth: true },
  { name: 'project-kanban', path: '/project/project-1/kanban', auth: true },
  { name: 'project-issues', path: '/project/project-1/issues', auth: true },
  { name: 'project-team', path: '/project/project-1/team', auth: true },
  { name: 'project-wiki', path: '/project/project-1/wiki/home', auth: true },
  { name: 'project-epics', path: '/project/project-1/epics', auth: true },
  { name: 'project-timeline', path: '/project/project-1/timeline', auth: true },
  { name: 'admin', path: '/project/project-1/admin/project-profile/details', auth: true },
  { name: 'user-settings', path: '/user-settings/user-profile', auth: true },
  { name: 'profile', path: '/profile/admin', auth: true },
  { name: 'notifications', path: '/notifications', auth: true },
];

async function loginCookies(context, base, isAngular) {
  const apiResp = await context.request.post(`${base}/api/v1/auth`, {
    data: { type: 'normal', username: ADMIN.user, password: ADMIN.pass },
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await apiResp.json();
  const page = await context.newPage();
  await page.goto(base + '/');
  await page.evaluate(
    ({ token, refresh, info }) => {
      // both apps read these same keys from localStorage
      localStorage.setItem('token', JSON.stringify(token));
      if (refresh) localStorage.setItem('refresh', JSON.stringify(refresh));
      localStorage.setItem('userInfo', JSON.stringify(info));
    },
    { token: data.auth_token, refresh: data.refresh, info: data }
  );
  await page.close();
}

async function shoot(base, prefix, _label, options = {}) {
  const browser = await chromium.launch();
  // Anonymous capture for routes flagged auth=false (e.g. /login, /discover).
  const anonContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const anonPage = await anonContext.newPage();
  for (const r of ROUTES.filter((r) => !r.auth)) {
    try {
      await anonPage.goto(base + r.path, { waitUntil: 'networkidle', timeout: 12000 });
      await anonPage.waitForTimeout(900);
      const file = path.join(OUT, 'screenshots', `${prefix}_${r.name}.png`);
      await anonPage.screenshot({ path: file, fullPage: true });
      process.stdout.write(`  • ${prefix}/${r.name} (anon) → ${path.relative(process.cwd(), file)}\n`);
    } catch (e) {
      process.stderr.write(`  ! ${prefix}/${r.name}: ${e.message}\n`);
    }
  }
  await anonContext.close();

  if (options.auth) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
    await loginCookies(context, base);
    const page = await context.newPage();
    for (const r of ROUTES.filter((r) => r.auth)) {
      try {
        await page.goto(base + r.path, { waitUntil: 'networkidle', timeout: 12000 });
        await page.waitForTimeout(900);
        const file = path.join(OUT, 'screenshots', `${prefix}_${r.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        process.stdout.write(`  • ${prefix}/${r.name} → ${path.relative(process.cwd(), file)}\n`);
      } catch (e) {
        process.stderr.write(`  ! ${prefix}/${r.name}: ${e.message}\n`);
      }
    }
    await context.close();
  }
  await browser.close();
}

async function recordDemo() {
  const file = path.join(OUT, 'demo.webm');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: path.join(OUT, 'video-tmp'), size: { width: 1440, height: 900 } },
  });
  await loginCookies(context, REACT);
  const page = await context.newPage();

  await page.goto(REACT + '/');
  await page.waitForTimeout(1500);
  await page.goto(REACT + '/projects/');
  await page.waitForTimeout(1500);
  await page.goto(REACT + '/project/project-1/backlog');
  await page.waitForTimeout(1500);
  await page.goto(REACT + '/project/project-1/kanban');
  await page.waitForTimeout(2000);
  await page.goto(REACT + '/project/project-1/issues');
  await page.waitForTimeout(1500);
  await page.goto(REACT + '/project/project-1/wiki/home');
  await page.waitForTimeout(1500);
  await page.goto(REACT + '/project/project-1/team');
  await page.waitForTimeout(1500);
  await page.goto(REACT + '/project/project-1/admin/project-profile/details');
  await page.waitForTimeout(1500);
  await page.goto(REACT + '/profile/admin');
  await page.waitForTimeout(1500);

  const video = page.video();
  await context.close();
  await browser.close();
  if (video) {
    const tmp = await video.path();
    await mkdir(path.dirname(file), { recursive: true });
    await import('node:fs/promises').then((fs) => fs.rename(tmp, file));
    process.stdout.write(`  • demo video → ${path.relative(process.cwd(), file)}\n`);
  }
}

console.log('Capturing AngularJS reference screenshots…');
await shoot(ANGULAR, 'angular', 'angular', { auth: true });
console.log('Capturing React port screenshots…');
await shoot(REACT, 'react', 'react', { auth: true });
console.log('Recording React demo video…');
await recordDemo();
console.log('Done →', OUT);
