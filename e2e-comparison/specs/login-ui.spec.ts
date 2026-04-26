import { expect, test } from '@playwright/test';

test('login page shows Taiga auth chrome and inline forgot-password link', async ({ page }, testInfo) => {
  await page.goto('/login');
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/login-layout-angular.png'
      : 'screenshots/login-layout-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  await expect(page.locator('.auth-container .logo-svg')).toBeVisible();
  await expect(page.locator('.auth-container h1.logo')).toHaveText(/Taiga/i);
  await expect(page.locator('.auth-container h2.tagline')).toBeVisible();
  await expect(page.locator('.auth-container a.forgot-pass')).toBeVisible();
  await expect(page.locator('.auth-container a.forgot-pass')).toHaveText('Forgot it?');
});
