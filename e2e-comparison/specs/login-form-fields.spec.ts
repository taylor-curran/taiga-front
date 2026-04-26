import { expect, test } from '@playwright/test';

test('login form uses placeholder copy on username/password fields', async ({ page }, testInfo) => {
  await page.goto('/login');
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/login-placeholders-angular.png'
      : 'screenshots/login-placeholders-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  const user = page.locator('input[name="username"]');
  const pass = page.locator('input[name="password"]');
  await expect(user).toHaveAttribute('placeholder', 'Username or email (case sensitive)');
  await expect(pass).toHaveAttribute('placeholder', 'Password (case sensitive)');
});
