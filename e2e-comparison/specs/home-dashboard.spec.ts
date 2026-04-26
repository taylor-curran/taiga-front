import { expect, test } from '@playwright/test';
import { loginReact, seedAngularSession } from './helpers';

test('authenticated navbar home logo includes SVG mark', async ({ page, baseURL }, testInfo) => {
  if (testInfo.project.name === 'angular-baseline') {
    await seedAngularSession(page, baseURL!);
  } else {
    await loginReact(page, baseURL!);
  }
  await page.goto(`${baseURL}/`);
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/navbar-logo-angular.png'
      : 'screenshots/navbar-logo-react.png';
  await page.screenshot({ path: shot, fullPage: false });
  await expect(page.locator('nav.navbar a.logo svg')).toBeVisible();
});
