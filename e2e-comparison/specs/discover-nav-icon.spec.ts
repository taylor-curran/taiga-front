import { expect, test } from '@playwright/test';
import { loginReact, seedAngularSession } from './helpers';

test('authenticated discover nav uses compass SVG', async ({ page, baseURL }, testInfo) => {
  if (testInfo.project.name === 'angular-baseline') {
    await seedAngularSession(page, baseURL!);
  } else {
    await loginReact(page, baseURL!);
  }
  await page.goto(`${baseURL}/`);
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/discover-nav-angular.png'
      : 'screenshots/discover-nav-react.png';
  await page.screenshot({ path: shot, fullPage: false });
  const discover = page.locator('nav.navbar .nav-right a').filter({ has: page.locator('tg-svg[svg-icon="icon-compass"]') });
  await expect(discover).toBeVisible();
});
