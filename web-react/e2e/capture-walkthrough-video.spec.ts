import { test } from '@playwright/test';

const routes = [
  '/project/scrum/admin/project-profile/details',
  '/project/scrum/admin/roles',
  '/user-settings/mail-notifications',
  '/profile',
  '/login',
];

test.use({
  video: process.env.PLAYWRIGHT_DO_VIDEO === '1' ? 'on' : 'off',
});

test('walkthrough: navigate placeholder routes (PLAYWRIGHT_DO_VIDEO=1 to record WebM)', async ({ page }) => {
  test.skip(process.env.PLAYWRIGHT_DO_VIDEO !== '1', 'Set PLAYWRIGHT_DO_VIDEO=1 to record WebM in test-results/.');

  for (const r of routes) {
    const res = await page.goto(r, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    test.info().annotations.push({ type: 'http', description: `${r} status ${res?.status()}` });
    await page.waitForTimeout(500);
  }
});
