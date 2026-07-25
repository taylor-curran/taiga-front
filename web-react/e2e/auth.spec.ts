import { expect, test } from '@playwright/test';
import { ADMIN_PASS, ADMIN_USER } from './helpers';

test.describe('auth', () => {
  test('login form works against the seeded admin user', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    await page.getByLabel(/username or email/i).fill(ADMIN_USER);
    await page.getByLabel(/password/i).fill(ADMIN_PASS);

    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/v1/auth') && r.request().method() === 'POST'),
      page.getByTestId('login-submit').click(),
    ]);

    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.username).toBe(ADMIN_USER);
    await page.waitForURL((url) => !url.pathname.startsWith('/login'));
    await expect(page.getByTestId('home')).toBeVisible();
  });

  test('shows an error for bad credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username or email/i).fill(ADMIN_USER);
    await page.getByLabel(/password/i).fill('wrong-password');
    await page.getByTestId('login-submit').click();
    await expect(page.locator('.text-red-700').first()).toBeVisible();
  });
});
