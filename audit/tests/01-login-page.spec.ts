/**
 * LOGIN PAGE DIFFERENCES
 *
 * AngularJS (:9000)                          React (:5173)
 * ┌───────────────────────┐                  ┌───────────────────────┐
 * │      🌸 (flower SVG)  │                  │    [T] (blue square)  │
 * │        Taiga           │                  │       Taiga           │
 * │  LOVE YOUR PROJECT     │                  │      Sign in          │
 * │                        │                  │                       │
 * │ [Username or email...] │                  │  Username or email    │
 * │ [Password...] Forgot?  │                  │  [____________]       │
 * │ [====== LOGIN ======]  │                  │  Password             │
 * │        (teal)          │                  │  [____________]       │
 * │                        │                  │  [==== Sign in ====]  │
 * │  white background      │                  │       (slate blue)    │
 * └───────────────────────┘                  │  Forgot your password?│
 *                                             │  gray bg + card       │
 *                                             └───────────────────────┘
 */
import { test, expect } from '@playwright/test';
import { ANGULAR_BASE, REACT_BASE } from './helpers';

test.describe('Login Page Differences', () => {
  test('Angular has "LOVE YOUR PROJECT" tagline; React does not', async ({ browser }) => {
    // Use fresh contexts to avoid login session interference
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`${ANGULAR_BASE}/login`);
    await page.waitForSelector('input[name="username"]');
    // Angular login page contains "LOVE YOUR PROJECT" somewhere in the page
    await expect(page.locator('text=LOVE YOUR PROJECT')).toHaveCount(1);

    await page.goto(`${REACT_BASE}/login`);
    await page.waitForSelector('input[type="text"]');
    // React login page says "Sign in" instead
    await expect(page.locator('h2', { hasText: 'Sign in' })).toBeVisible();
    await expect(page.locator('text=LOVE YOUR PROJECT')).toHaveCount(0);

    await ctx.close();
  });

  test('Angular button says "Login"; React button says "Sign in"', async ({ page }) => {
    await page.goto(`${ANGULAR_BASE}/login`);
    const angularBtn = page.locator('button[type="submit"]');
    await expect(angularBtn).toHaveText(/login/i);

    await page.goto(`${REACT_BASE}/login`);
    const reactBtn = page.locator('button[type="submit"]');
    await expect(reactBtn).toHaveText('Sign in');
  });

  test('Angular uses placeholder text inside inputs; React uses labels above inputs', async ({ page }) => {
    await page.goto(`${ANGULAR_BASE}/login`);
    const angularUsernameInput = page.locator('input[name="username"]');
    await expect(angularUsernameInput).toHaveAttribute('placeholder', /Username or email/);
    // Angular has no <label> elements
    await expect(page.locator('form label')).toHaveCount(0);

    await page.goto(`${REACT_BASE}/login`);
    // React uses <label> elements
    const labels = page.locator('form label');
    await expect(labels).toHaveCount(2);
    await expect(labels.nth(0)).toHaveText('Username or email');
    await expect(labels.nth(1)).toHaveText('Password');
  });

  test('Angular input placeholders include "(case sensitive)"; React does not', async ({ page }) => {
    await page.goto(`${ANGULAR_BASE}/login`);
    await expect(page.locator('input[name="username"]')).toHaveAttribute(
      'placeholder', /case sensitive/
    );

    await page.goto(`${REACT_BASE}/login`);
    const reactInput = page.locator('input[type="text"]');
    const placeholder = await reactInput.getAttribute('placeholder');
    expect(placeholder ?? '').not.toContain('case sensitive');
  });

  test('Forgot password: Angular says "Forgot it?" inline; React says "Forgot your password?" below form', async ({ page }) => {
    await page.goto(`${ANGULAR_BASE}/login`);
    const angularForgot = page.locator('a', { hasText: 'Forgot' });
    await expect(angularForgot).toHaveText('Forgot it?');
    await expect(angularForgot).toHaveAttribute('href', '#');

    await page.goto(`${REACT_BASE}/login`);
    const reactForgot = page.locator('a', { hasText: 'Forgot' });
    await expect(reactForgot).toHaveText('Forgot your password?');
    await expect(reactForgot).toHaveAttribute('href', '/forgot-password');
  });

  test('Angular login page has white background; React has gray background with card', async ({ page }) => {
    await page.goto(`${ANGULAR_BASE}/login`);
    await page.screenshot({ path: 'screenshots/angular-login.png', fullPage: true });

    await page.goto(`${REACT_BASE}/login`);
    await page.screenshot({ path: 'screenshots/react-login.png', fullPage: true });

    // React wraps the form in a card container (box-shadow or border-radius)
    const card = page.locator('form').locator('..');
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // React body background is not white (#f5f5f5 or similar gray)
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });
});
