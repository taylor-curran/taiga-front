import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(here, '../../docs/video');
fs.mkdirSync(OUT_DIR, { recursive: true });

const REACT = process.env.REACT_BASE_URL ?? 'http://localhost:5173';

test.describe('demo recording', () => {
  test('walk the React port end-to-end', async ({ browser }) => {
    const ctx = await browser.newContext({
      baseURL: REACT,
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
    });
    const page = await ctx.newPage();

    await page.goto('/login');
    await page.waitForTimeout(1200);

    await page.getByLabel(/username/i).fill('admin');
    await page.waitForTimeout(400);
    await page.getByLabel(/password/i).fill('adminpass');
    await page.waitForTimeout(400);
    await page.getByTestId('login-submit').click();
    await page.waitForURL((u) => !u.pathname.endsWith('/login'));
    await page.waitForTimeout(1500);

    await page.goto('/projects/');
    await page.waitForTimeout(1500);

    await page.goto('/discover');
    await page.waitForTimeout(1200);

    await page.goto('/project/project-1/timeline');
    await page.waitForTimeout(1500);

    await page.goto('/project/project-1/backlog');
    await page.waitForTimeout(1800);

    await page.goto('/project/project-1/kanban');
    await page.waitForTimeout(1800);

    await page.goto('/project/project-1/issues');
    await page.waitForTimeout(1500);

    await page.goto('/project/project-1/team');
    await page.waitForTimeout(1500);

    await page.goto('/project/project-1/us/1');
    await page.waitForTimeout(2000);

    await page.goto('/project/project-1/admin/project-profile/details');
    await page.waitForTimeout(1500);

    await page.goto('/notifications');
    await page.waitForTimeout(1200);

    await page.goto('/profile');
    await page.waitForTimeout(1500);

    await ctx.close();

    const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.webm'));
    if (files.length > 0) {
      const latest = files
        .map((f) => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t)[0].f;
      const target = path.join(OUT_DIR, 'demo.webm');
      if (latest !== 'demo.webm') {
        try {
          fs.unlinkSync(target);
        } catch {
          /* ignore */
        }
        fs.renameSync(path.join(OUT_DIR, latest), target);
      }
    }
  });
});
