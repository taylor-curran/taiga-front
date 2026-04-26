import { expect, test } from '@playwright/test';
import { mockProjectBySlug, mockTaigaApi } from './helpers';

test.describe('auth slice', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await mockTaigaApi(page, baseURL!);
  });

  test('login success navigates home', async ({ page, baseURL }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/Username or email/i).fill('admin');
    await page.getByPlaceholder(/^Password/i).fill('adminpass');
    await page.getByRole('button', { name: /^Login$/ }).click();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/?$`));
  });

  test('login failure shows Taiga error copy', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/Username or email/i).fill('bad');
    await page.getByPlaceholder(/^Password/i).fill('x');
    await page.getByRole('button', { name: /^Login$/ }).click();
    await expect(page.getByText(/According to the Taiga/i)).toBeVisible();
  });

  test('unauthenticated admin route redirects to login with next', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/project/demo/admin/project-profile/details`);
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test('non-admin project shows permission denied', async ({ page, baseURL }) => {
    await mockProjectBySlug(page, 'demo', { i_am_admin: false, name: 'Demo' });
    await page.goto('/login');
    await page.getByPlaceholder(/Username or email/i).fill('admin');
    await page.getByPlaceholder(/^Password/i).fill('adminpass');
    await page.getByRole('button', { name: /^Login$/ }).click();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/?$`));

    await page.goto(`${baseURL}/project/demo/admin/project-profile/details`);
    await expect(page).toHaveURL(new RegExp(`${baseURL}/permission-denied`));
  });

  test('visual: login page', async ({ page }, testInfo) => {
    await page.goto('/login');
    await expect(page.locator('.tg-auth')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('login-before.png'),
      fullPage: true,
    });
  });
});
