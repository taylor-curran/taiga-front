import { expect, test } from '@playwright/test';

test('forgot-password shows Angular-style recovery form', async ({ page }, testInfo) => {
  await page.goto('/forgot-password');
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/forgot-password-angular.png'
      : 'screenshots/forgot-password-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  await expect(page.locator('div.auth-container')).toBeVisible();
  await expect(page.locator('form', { has: page.locator('input[name="username"]') })).toBeVisible();
});
