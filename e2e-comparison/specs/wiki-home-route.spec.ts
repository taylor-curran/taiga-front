import { expect, test } from '@playwright/test';
import { loginReact, seedAngularSession } from './helpers';

const slug = process.env.AUDIT_PROJECT_SLUG ?? 'project-1';

test('wiki home deep link loads wiki editor shell', async ({ page, baseURL }, testInfo) => {
  if (testInfo.project.name === 'angular-baseline') {
    await seedAngularSession(page, baseURL!);
  } else {
    await loginReact(page, baseURL!);
  }
  await page.goto(`${baseURL}/project/${slug}/wiki`);
  await page.waitForURL(`**/project/${slug}/wiki/home`, { timeout: testInfo.project.name === 'angular-baseline' ? 30000 : 15000 });
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/wiki-home-angular.png'
      : 'screenshots/wiki-home-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  await expect(page.locator('section.main.wiki')).toBeVisible();
  await expect(page.locator('.tg-placeholder')).toHaveCount(0);
});
