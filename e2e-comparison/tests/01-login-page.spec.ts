import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies/storage to ensure we're logged out
    await page.context().clearCookies();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display the Taiga logo as an SVG with multiple colored paths', async ({ page }) => {
    // Angular renders the official Taiga flower/star logo as an inline SVG
    // with many <path> elements forming the colorful petals.
    // React replaces this with a simple colored square "T" icon.
    const logoArea = page.locator('form').locator('..').locator('svg').first();
    // Fallback: look for any visible SVG on the page
    const anySvg = page.locator('svg:visible').first();
    const svg = await logoArea.isVisible().catch(() => false) ? logoArea : anySvg;
    const pathCount = await svg.locator('path').count();
    // The Angular flower logo has many paths (8+ for petals); React "T" icon has very few
    expect(pathCount).toBeGreaterThan(5);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-login-logo.png` });
  });

  test('should show "LOVE YOUR PROJECT" tagline below the logo', async ({ page }) => {
    // Angular displays "LOVE YOUR PROJECT" as a visible heading.
    // React shows "Sign in" instead and has no tagline.
    const tagline = page.getByText('LOVE YOUR PROJECT');
    await expect(tagline).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-login-tagline.png` });
  });

  test('should use inline placeholder text in inputs (not labels above)', async ({ page }) => {
    // Angular: inputs have placeholder="Username or email (case sensitive)"
    // React: uses <label>Username or email</label> above the input, no placeholder
    const usernameInput = page.locator('input[placeholder*="case sensitive"]').first();
    await expect(usernameInput).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-login-placeholders.png` });
  });

  test('should have a button labeled "LOGIN" (uppercase)', async ({ page }) => {
    // Angular: button text is "LOGIN" (uppercase).
    // React: button text is "Sign in" (title case).
    const submitBtn = page.locator('button[type="submit"]');
    const btnText = await submitBtn.innerText();
    expect(btnText.trim()).toMatch(/^LOGIN$/i);
    expect(btnText.trim()).toBe(btnText.trim().toUpperCase());
    await page.screenshot({ path: `screenshots/${test.info().project.name}-login-button.png` });
  });

  test('should show "Forgot it?" link next to the password field', async ({ page }) => {
    // Angular: "Forgot it?" link sits inline with the password field.
    // React: "Forgot your password?" is below the form.
    const forgotLink = page.getByText('Forgot it?');
    await expect(forgotLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-login-forgot-link.png` });
  });

  test('should have a white/transparent page background (no card container)', async ({ page }) => {
    // Angular: login form floats on a white page background.
    // React: wraps the form in a gray-background card container.
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    // Angular body bg is white or transparent
    const isWhiteish = bgColor.includes('255, 255, 255') || bgColor === 'rgba(0, 0, 0, 0)';
    expect(isWhiteish).toBeTruthy();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-login-background.png`, fullPage: true });
  });
});
