/**
 * Run manually to capture a short login demo video for PR artifacts:
 *   npx playwright test e2e/record-login-demo.spec.ts
 */
import { expect, test } from '@playwright/test';
import { mockTaigaApi } from './helpers';

test.use({ video: 'on' });

test('record login demo', async ({ page, baseURL }) => {
  await mockTaigaApi(page, baseURL!);
  await page.goto('/login');
  await page.getByPlaceholder(/Username or email/i).fill('admin');
  await page.getByPlaceholder(/^Password/i).fill('adminpass');
  await page.getByRole('button', { name: /^Login$/ }).click();
  await expect(page).toHaveURL(new RegExp(`${baseURL}/?$`));
});
