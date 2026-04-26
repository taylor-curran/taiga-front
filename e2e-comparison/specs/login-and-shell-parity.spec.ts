import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, '..', 'screenshots');

async function capture(page: import('@playwright/test').Page, filename: string) {
  await fs.mkdir(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, filename), fullPage: true });
}

/** Angular needs a moment for `$translate` + `$routeChangeSuccess` meta; React parent shell never matches. */
const titleTimeout = 30_000;

test.describe('Angular reference vs React shell', () => {
  test('login: top-level document title matches translated LOGIN.PAGE_TITLE', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const suffix = testInfo.project.name === 'angular' ? 'angular' : 'react';
    await capture(page, `login-document-title-${suffix}.png`);
    await expect(page).toHaveTitle('Login - Taiga', { timeout: titleTimeout });
  });

  test('login: top-level meta description matches translated LOGIN.PAGE_DESCRIPTION', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const suffix = testInfo.project.name === 'angular' ? 'angular' : 'react';
    await capture(page, `login-meta-description-${suffix}.png`);
    const meta = page.locator('head meta[name="description"]');
    await expect(meta).toHaveCount(1, { timeout: titleTimeout });
    await expect(meta).toHaveAttribute(
      'content',
      /Logging in to Taiga, a project management platform/,
      { timeout: titleTimeout },
    );
  });

  test('login: top-level og:title meta matches page title', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const suffix = testInfo.project.name === 'angular' ? 'angular' : 'react';
    await capture(page, `login-og-title-${suffix}.png`);
    const og = page.locator('head meta[property="og:title"]');
    await expect(og).toHaveCount(1, { timeout: titleTimeout });
    await expect(og).toHaveAttribute('content', 'Login - Taiga', { timeout: titleTimeout });
  });

  test('login: no full-viewport legacy iframe wrapper at top level', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const suffix = testInfo.project.name === 'angular' ? 'angular' : 'react';
    await capture(page, `login-top-layout-${suffix}.png`);
    await expect(page.locator('iframe.legacy-frame')).toHaveCount(0, { timeout: titleTimeout });
  });

  test('login: tg-legacy host element present in top-level document', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const suffix = testInfo.project.name === 'angular' ? 'angular' : 'react';
    await capture(page, `login-tg-legacy-host-${suffix}.png`);
    await expect(page.locator('body tg-legacy')).toHaveCount(1, { timeout: titleTimeout });
  });

  test('forgot-password: top-level document title matches translated FORGOT_PASSWORD.PAGE_TITLE', async ({
    page,
  }, testInfo) => {
    await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });
    const suffix = testInfo.project.name === 'angular' ? 'angular' : 'react';
    await capture(page, `forgot-password-title-${suffix}.png`);
    await expect(page).toHaveTitle('Forgot password - Taiga', { timeout: titleTimeout });
  });

  test('discover: top-level document title matches translated DISCOVER.PAGE_TITLE', async ({ page }, testInfo) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    const suffix = testInfo.project.name === 'angular' ? 'angular' : 'react';
    await capture(page, `discover-title-${suffix}.png`);
    await expect(page).toHaveTitle('Discover projects - Taiga', { timeout: titleTimeout });
  });
});
