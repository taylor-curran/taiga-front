import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { mockTaigaApi } from './helpers';

const ARTIFACT_DIR = process.env.PR_ARTIFACT_DIR || '';

function artifact(name: string, testInfo: { outputPath: (s: string) => string }) {
  if (ARTIFACT_DIR && fs.existsSync(ARTIFACT_DIR)) {
    return path.join(ARTIFACT_DIR, name);
  }
  return testInfo.outputPath(name);
}

test.describe('PR media', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await mockTaigaApi(page, baseURL!);
  });

  test('login before and after screenshots', async ({ page, baseURL }, testInfo) => {
    await page.goto('/login');
    await page.screenshot({ path: artifact('login-before.png', testInfo), fullPage: true });

    await page.getByPlaceholder(/Username or email/i).fill('admin');
    await page.getByPlaceholder(/^Password/i).fill('adminpass');
    await page.getByRole('button', { name: /^Login$/ }).click();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/?$`));
    await page.screenshot({ path: artifact('login-after-home.png', testInfo), fullPage: true });
  });

  test('permission denied screenshot', async ({ page }, testInfo) => {
    await page.goto('/permission-denied');
    await page.screenshot({ path: artifact('permission-denied.png', testInfo), fullPage: true });
  });
});
