import { expect, test } from '@playwright/test';

test('register route serves registration form when public registration is enabled', async ({ page }, testInfo) => {
  await page.goto('/register');
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/register-form-angular.png'
      : 'screenshots/register-placeholder-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  await expect(page.locator('form.register-form input[name="username"]')).toBeVisible();
});
