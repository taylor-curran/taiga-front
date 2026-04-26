import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loginViaApi } from '../e2e/helpers';

const _here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(_here, '../../docs/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const REACT = process.env.REACT_BASE_URL ?? 'http://localhost:5173';
const ANGULAR = process.env.ANGULAR_BASE_URL ?? 'http://localhost:9000';

const ROUTES: Array<{ name: string; path: string; auth: boolean }> = [
  { name: '01-login', path: '/login', auth: false },
  { name: '02-home', path: '/', auth: true },
  { name: '03-discover', path: '/discover', auth: true },
  { name: '04-projects-listing', path: '/projects/', auth: true },
  { name: '05-project-timeline', path: '/project/project-1/timeline', auth: true },
  { name: '06-backlog', path: '/project/project-1/backlog', auth: true },
  { name: '07-kanban', path: '/project/project-1/kanban', auth: true },
  { name: '08-issues', path: '/project/project-1/issues', auth: true },
  { name: '09-team', path: '/project/project-1/team', auth: true },
  { name: '10-us-detail', path: '/project/project-1/us/1', auth: true },
  { name: '11-admin-details', path: '/project/project-1/admin/project-profile/details', auth: true },
  { name: '12-profile', path: '/profile', auth: true },
  { name: '13-notifications', path: '/notifications', auth: true },
  { name: '14-user-settings', path: '/user-settings/user-profile', auth: true },
  { name: '15-not-found', path: '/this-route-does-not-exist', auth: false },
];

for (const route of ROUTES) {
  test(`screenshot ${route.name}`, async ({ browser, request }) => {
    for (const { app, baseURL } of [
      { app: 'react' as const, baseURL: REACT },
      { app: 'angular' as const, baseURL: ANGULAR },
    ]) {
      const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      try {
        if (route.auth) await loginViaApi(page, app, request);
        await page.goto(route.path, { waitUntil: 'networkidle' });
        // Best-effort settle
        await page.waitForTimeout(1500);
        const file = path.join(OUT, `${route.name}.${app}.png`);
        await page.screenshot({ path: file, fullPage: true });
        expect(fs.existsSync(file)).toBe(true);
      } finally {
        await ctx.close();
      }
    }
  });
}
