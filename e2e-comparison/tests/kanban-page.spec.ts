import { test, expect } from "@playwright/test";

/**
 * Kanban board parity tests.
 * Each test asserts what the AngularJS app has.
 * Angular → PASS.  React → FAIL = proof of difference.
 */
test.describe("Kanban board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "adminpass");
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto("/project/project-1/kanban");
    await page.waitForTimeout(2000);
  });

  test("should render the correct status columns", async ({ page }) => {
    for (const col of ["New", "Ready", "In progress", "Ready for test"]) {
      await expect(
        page.locator("h2, h3").getByText(col, { exact: true }).first()
      ).toBeVisible();
    }
  });

  test("should render swimlane rows", async ({ page }) => {
    // Angular groups tasks into horizontal swimlane rows
    await expect(page.getByText("totam").first()).toBeVisible();
  });

  test("should have zoom controls", async ({ page }) => {
    await expect(page.getByText("Zoom:")).toBeVisible();
  });

  test("should have fold/unfold column actions", async ({ page }) => {
    const foldBtns = page.locator('button[title="Fold column"]');
    const count = await foldBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have a filter bar on the kanban", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Filters" })
    ).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test("should show user stories in columns", async ({ page }) => {
    // Both apps should render task cards in the columns
    const cards = page.locator(".card, [class*=card], .kanban-task");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
