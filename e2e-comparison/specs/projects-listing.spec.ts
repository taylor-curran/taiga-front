import { expect, test } from '@playwright/test';
import { loginReact, seedAngularSession } from './helpers';

test('my projects listing page layout', async ({ page, baseURL }, testInfo) => {
  if (testInfo.project.name === 'angular-baseline') {
    await seedAngularSession(page, baseURL!);
    await page.goto(`${baseURL}/projects/`);
  } else {
    await loginReact(page, baseURL!);
    await page.goto(`${baseURL}/projects`);
  }
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/projects-listing-angular.png'
      : 'screenshots/projects-listing-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  await expect(page.locator('.project-list-wrapper')).toBeVisible();
  await expect(page.locator('.project-list-title h1')).toContainText(/My projects/i);
});
