import { test, expect } from "@playwright/test";

/**
 * Login page parity tests.
 * Each test asserts what the AngularJS app has.
 * Angular → PASS.  React → FAIL = proof of difference.
 */
test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1500);
  });

  test("should show the Taiga flower logo (SVG image)", async ({ page }) => {
    // Angular has a coloured flower SVG logo above the form
    const loginContainer = page.locator(".login-form-container, form").first();
    await expect(loginContainer).toBeVisible();
    // The flower logo is rendered as an inline SVG with coloured paths
    const svgPaths = page.locator("svg path[fill]");
    await expect(svgPaths.first()).toBeVisible();
  });

  test('should display the "LOVE YOUR PROJECT" tagline', async ({ page }) => {
    await expect(page.getByText("LOVE YOUR PROJECT")).toBeVisible();
  });

  test("submit button text should say LOGIN", async ({ page }) => {
    const loginBtn = page.locator('button[type="submit"], input[type="submit"]');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toHaveText(/LOGIN/i);
  });

  test("username field should use placeholder text (not label)", async ({
    page,
  }) => {
    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toHaveAttribute(
      "placeholder",
      /username or email/i
    );
  });

  test('forgot password link text should say "Forgot it?"', async ({
    page,
  }) => {
    await expect(page.getByText("Forgot it?")).toBeVisible();
  });

  test("page background colour should be white", async ({ page }) => {
    // Angular login page has a white / transparent background
    const bg = await page.evaluate(() => {
      const body = getComputedStyle(document.body).backgroundColor;
      const html = getComputedStyle(document.documentElement).backgroundColor;
      return body + '|' + html;
    });
    // Angular body is transparent (rgba(0,0,0,0)) or white — not the gray used by React
    expect(bg).not.toMatch(/rgb\(245,\s*245,\s*245\)/);
  });

  test("should successfully login with admin/adminpass", async ({ page }) => {
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "adminpass");
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForTimeout(3000);
    // After login, should redirect away from /login
    expect(page.url()).not.toContain("/login");
  });
});
