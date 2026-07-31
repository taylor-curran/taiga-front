import { test, expect } from "@playwright/test";

/**
 * Home dashboard parity tests.
 * Each test asserts what the AngularJS app has.
 * Angular → PASS.  React → FAIL = proof of difference.
 */
test.describe("Home dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "adminpass");
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForTimeout(3000);
  });

  test('dashboard heading should say "Projects Dashboard"', async ({
    page,
  }) => {
    await expect(page.getByText("Projects Dashboard")).toBeVisible();
  });

  test("should have a Discover link in the top navigation", async ({
    page,
  }) => {
    await expect(
      page.locator('a[title="Discover trending projects"]')
    ).toBeVisible();
  });

  test("should have a Help link in the top navigation", async ({ page }) => {
    await expect(page.locator('a[title="Help"]')).toBeVisible();
  });

  test("should have a notifications/Events bell in the top navigation", async ({
    page,
  }) => {
    await expect(page.locator('a[title="Events"]')).toBeVisible();
  });

  test('"Working on" items should be rich clickable cards with project info', async ({
    page,
  }) => {
    // Angular renders working-on items inside <tg-working-on> as clickable
    // cards with project logos, item types, statuses, and titles
    const workingOnSection = page.locator("tg-working-on");
    await expect(workingOnSection).toBeVisible();

    const workingOnItems = workingOnSection.locator("a");
    await expect(workingOnItems.first()).toBeVisible({ timeout: 10_000 });
    const count = await workingOnItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display seeded projects on the dashboard", async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.getByText("Projects Dashboard")).toBeVisible();
    for (const name of ["Project Example 1", "Project Example 2"]) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
  });
});
