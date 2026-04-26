import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const isAngular = () => process.env.TARGET === 'angular';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const confJsonBody = readFileSync(
  path.join(__dirname, '..', 'fixtures', 'conf.json'),
  'utf8'
);

test.beforeEach(async ({ page }) => {
  // Static `serve` of `dist/` may not ship `conf.json`; the real gateway does.
  await page.route('**/conf.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: confJsonBody,
    });
  });

  // Discover home loads stats + project lists; without a backend the global error view hides the shell.
  await page.route('**/api/v1/stats/discover**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ projects: { total: 0 } }),
    });
  });
  await page.route('**/api/v1/projects**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });
});

test.describe('Static UI parity (no API)', () => {
  test('login: sign-in control label is “Login” (legacy LOGIN_COMMON.ACTION_SIGN_IN)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(2500);
    else await page.waitForLoadState('networkidle').catch(() => {});

    const submit = page.locator('form').first().locator('button[type="submit"]');
    await expect(submit).toHaveText('Login');
  });

  test('login: username field placeholder mentions case sensitivity (username field only, legacy copy)', async ({
    page,
  }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(2500);
    else await page.waitForLoadState('networkidle').catch(() => {});

    const userField = page.locator('input[name="username"]').first();
    await expect(userField).toHaveAttribute('placeholder', /case sensitive/i);
  });

  test('login: document title is “Login - Taiga” (appMeta / route title)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(3000);
    else await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveTitle('Login - Taiga');
  });

  test('forgot password: primary action is “Reset Password” (FORGOT_PASSWORD_FORM)', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(2500);
    else await page.waitForLoadState('networkidle').catch(() => {});

    await expect(
      page.locator('.forgot-form-container button').filter({ hasText: /reset password/i }).first()
    ).toBeVisible();
  });

  test('discover: search field placeholder is “Type something...” (DISCOVER.SEARCH.INPUT_PLACEHOLDER)', async ({
    page,
  }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(3500);
    else await page.waitForLoadState('networkidle').catch(() => {});

    const q = page.locator('form').first().locator('input[type="text"]').first();
    await expect(q).toHaveAttribute('placeholder', 'Type something...');
  });

  test('discover: document title is “Discover projects - Taiga”', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(3500);
    else await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveTitle('Discover projects - Taiga');
  });

  test('not-found: CTA link text is “Take me home” (COMMON.GO_HOME)', async ({ page }) => {
    await page.goto('/not-found', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(2500);
    else await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.getByRole('link', { name: /^Take me home$/i })).toBeVisible();
  });

  test('not-found: body copy includes full legacy 404 paragraph', async ({ page }) => {
    await page.goto('/not-found', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(2500);
    else await page.waitForLoadState('networkidle').catch(() => {});

    await expect(
      page.getByText(/Error 404\. The page you are looking for no longer exists/i)
    ).toBeVisible();
  });

  test('register: /register shows the legacy registration form when public registration is enabled', async ({
    page,
  }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    if (isAngular()) await page.waitForTimeout(3000);
    else await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.locator('input[placeholder="Pick a username"]')).toBeVisible();
  });
});
