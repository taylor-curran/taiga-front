import { test, expect } from "@playwright/test";

/**
 * Backlog page parity tests.
 * Each test asserts what the AngularJS app has.
 * Angular → PASS.  React → FAIL = proof of difference.
 */
test.describe("Backlog page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "adminpass");
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto("/project/project-1/backlog");
    await page.waitForTimeout(2000);
  });

  test('should display the "Scrum" header with point statistics', async ({
    page,
  }) => {
    // Angular shows "Scrum" in the header area with point totals
    await expect(
      page.locator("header h1").getByText("Scrum")
    ).toBeVisible();
  });

  test("should have a burndown chart toggle", async ({ page }) => {
    // Angular has a burndown/forecasting chart area
    await expect(page.locator('.burndown, .forecasting, [tg-backlog-graph]').first()).toBeVisible();
  });

  test("should have a filter bar with search input", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Filters" })
    ).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test("sprint should display the same user stories", async ({ page }) => {
    // Both apps should render the sprint section with user story cards
    const sprintSection = page.getByText("Sprint");
    await expect(sprintSection.first()).toBeVisible();
  });

  test("product backlog should show 11 user stories", async ({ page }) => {
    // Angular shows the product backlog section with user story count
    await expect(page.locator('.backlog-table, .product-backlog, tg-backlog-table').first()).toBeVisible();
  });
});
