#!/usr/bin/env node
// Headless click-through smoke test for the Angular Taiga app served by
// taiga-docker. Logs in as the seeded admin (created by taiga-seed.mjs),
// then visits a handful of routes for the seeded sample projects, taking
// screenshots and recording video along the way.
//
// Prereqs:
//   1) `npm run taiga-up && npm run taiga-seed`     # stack up + sample_data
//   2) `npm i playwright && npx playwright install chromium --with-deps`
//      (run from any directory; Playwright caches the browser in $HOME)
//
// Usage:
//   node scripts/taiga-clickthrough.mjs
//
// Env knobs (all optional):
//   TAIGA_URL   default http://localhost:9000
//   TAIGA_USER  default admin
//   TAIGA_PASS  default adminpass
//   OUT_DIR     default /opt/cursor/artifacts (cloud-agent artifact root);
//               falls back to ./artifacts if that's not writable.
//
// Output:
//   $OUT_DIR/screenshots/NN-<step>.png
//   $OUT_DIR/videos/clickthrough-*.webm  (raw playwright recording)

import { chromium } from 'playwright';
import { mkdirSync, readdirSync, renameSync, accessSync, constants } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = process.env.TAIGA_URL || 'http://localhost:9000';
const USER = process.env.TAIGA_USER || 'admin';
const PASS = process.env.TAIGA_PASS || 'adminpass';

function pickOutDir() {
  const requested = process.env.OUT_DIR || '/opt/cursor/artifacts';
  try {
    mkdirSync(requested, { recursive: true });
    accessSync(requested, constants.W_OK);
    return requested;
  } catch {
    const fallback = `${process.cwd()}/artifacts`;
    mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}
const OUT = pickOutDir();
mkdirSync(`${OUT}/screenshots`, { recursive: true });
mkdirSync(`${OUT}/videos`, { recursive: true });
console.log(`[clickthrough] artifacts -> ${OUT}`);

let stepIdx = 0;
async function shot(page, name) {
  stepIdx += 1;
  const idx = String(stepIdx).padStart(2, '0');
  const p = `${OUT}/screenshots/${idx}-${name}.png`;
  await page.screenshot({ path: p, fullPage: false });
  console.log(`step ${idx}: ${name} (${page.url()})`);
}

async function visitProjectSection(page, slug, section, name) {
  const url = section ? `${BASE}/project/${slug}/${section}` : `${BASE}/project/${slug}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => null);
  await wait(2500);
  await shot(page, name);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: `${OUT}/videos`, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();

page.on('console', (m) => {
  if (m.type() === 'error') console.log('[browser-error]', m.text().slice(0, 200));
});

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 60000 });
  await wait(1500);
  await shot(page, 'login');

  await page.fill('input[name="username"]', USER);
  await page.fill('input[name="password"]', PASS);
  await shot(page, 'login-filled');

  await Promise.all([
    page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 60000 }).catch(() => null),
    page.click('button[type="submit"], button:has-text("Login"), button:has-text("Log in")'),
  ]);
  await wait(3000);
  await shot(page, 'dashboard');

  await visitProjectSection(page, 'project-1', '', 'project-1-home');
  await visitProjectSection(page, 'project-1', 'backlog', 'project-1-backlog');
  await visitProjectSection(page, 'project-1', 'kanban', 'project-1-kanban');
  await visitProjectSection(page, 'project-1', 'issues', 'project-1-issues');
  await visitProjectSection(page, 'project-1', 'wiki/home', 'project-1-wiki');
  await visitProjectSection(page, 'project-1', 'team', 'project-1-team');

  await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => null);
  await wait(2500);
  await shot(page, 'discover');

  await visitProjectSection(page, 'project-2', 'kanban', 'project-2-kanban');
  await visitProjectSection(page, 'project-3', 'backlog', 'project-3-backlog');

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => null);
  await wait(2000);
  await shot(page, 'final-dashboard');
} catch (e) {
  console.log('FATAL:', e.message);
  await shot(page, 'error').catch(() => null);
} finally {
  await context.close();
  await browser.close();
  const vids = readdirSync(`${OUT}/videos`).filter((f) => f.endsWith('.webm'));
  for (const v of vids) {
    if (!v.startsWith('clickthrough-')) {
      renameSync(`${OUT}/videos/${v}`, `${OUT}/videos/clickthrough-${v}`);
    }
  }
  console.log('videos:', readdirSync(`${OUT}/videos`));
  console.log('screenshots:', readdirSync(`${OUT}/screenshots`).length);
}
