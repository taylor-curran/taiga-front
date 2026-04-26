import { expect, test } from '@playwright/test';
import { loginReact, seedAngularSession } from './helpers';

const slug = process.env.AUDIT_PROJECT_SLUG ?? 'project-1';

test('project root loads timeline shell with project-data', async ({ page, baseURL }, testInfo) => {
  if (testInfo.project.name === 'angular-baseline') {
    await seedAngularSession(page, baseURL!);
    await page.goto(`${baseURL}/project/${slug}/`);
    await page.waitForURL(`**/project/${slug}/timeline`, { timeout: 30000 });
  } else {
    await loginReact(page, baseURL!);
    await page.goto(`${baseURL}/project/${slug}`);
    await page.waitForURL(`**/project/${slug}/timeline`, { timeout: 15000 });
  }
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/timeline-angular.png'
      : 'screenshots/timeline-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  await expect(page.locator('.project-data')).toBeVisible();
  await expect(page.locator('.tg-placeholder')).toHaveCount(0);
});
