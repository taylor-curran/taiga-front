import { expect, test } from '@playwright/test';
import { snap, expectText } from './_helpers';

// Each test in this file asserts a feature/marker that the AngularJS Taiga
// login page (taiga-front, app/partials/auth/login.jade +
// app/partials/includes/modules/login-form.jade) ships out of the box.
// The React port (web-react/src/routes/auth/Login.tsx) is expected to fail
// most of these — the failures document the parity gaps.

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await snap(page, 'login');
  });

  test('shows the localized tagline "LOVE YOUR PROJECT"', async ({ page }) => {
    // Angular: <h2 class="tagline" translate="COMMON.TAG_LINE_2"> "LOVE YOUR PROJECT"
    // React:   <p>A simple project management platform</p>
    await expectText(page, /love your project/i);
  });

  test('renders the Taiga star/leaf logo SVG (not a generic placeholder)', async ({ page }) => {
    // Angular's login.jade includes ../../svg/logo-color.svg which produces a
    // multi-`path` star/leaf SVG. The React port draws a single `path` cube.
    const logoPaths = await page
      .locator('div.logo-svg svg path, .logo-svg svg path')
      .count();
    expect(logoPaths).toBeGreaterThanOrEqual(5);
  });

  test('uses placeholders "Username or email (case sensitive)" and "Password (case sensitive)"', async ({ page }) => {
    // Angular: inputs use translated placeholders. React: floats the label
    // *above* the field and leaves the placeholder empty.
    const userPh = await page.locator('input[name="username"]').first().getAttribute('placeholder');
    const passPh = await page.locator('input[name="password"]').first().getAttribute('placeholder');
    expect(userPh || '').toMatch(/case sensitive/i);
    expect(passPh || '').toMatch(/case sensitive/i);
  });

  test('the submit button is labelled "LOGIN" (uppercase)', async ({ page }) => {
    // Angular renders <button class="btn-small full"> with the translated text
    // "LOGIN_COMMON.ACTION_SIGN_IN" → "Login", styled uppercase. The React port
    // ships a sentence-case "Sign in" button.
    const submit = page.locator('form.login-form button[type="submit"], form button[type="submit"]').first();
    await expect(submit).toHaveText(/login/i);
  });

  test('"Forgot it?" link sits inline next to the password field', async ({ page }) => {
    // Angular: <a class="forgot-pass">Forgot it?</a> inside the same fieldset
    // as the password input. React: a separate "Forgot your password?" link.
    const link = page.locator('a.forgot-pass');
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/forgot it\??/i);
  });

  test('the document title is "Login - Taiga"', async ({ page }) => {
    await expect(page).toHaveTitle(/login\s*-\s*taiga/i);
  });
});
