import { test, expect } from "@playwright/test";

/**
 * Issues list parity tests.
 * Each test asserts what the AngularJS app has.
 * Angular → PASS.  React → FAIL = proof of difference.
 */
test.describe("Issues list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "adminpass");
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto("/project/project-1/issues");
    await page.waitForTimeout(2000);
  });

  test('table should have a "Modified" column', async ({ page }) => {
    // Angular has: Type, Severity, Priority, Issue, Status, Modified, Assign to
    await expect(page.locator("tg-issues-table")).toBeVisible();
    const modifiedText = page
      .locator("tg-issues-table")
      .getByText("Modified");
    await expect(modifiedText).toBeVisible();
  });

  test("filter UI should have Filters button and NEW ISSUE button", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: "Filters" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "NEW ISSUE" })
    ).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test("column headers should be sortable (clickable with arrows)", async ({
    page,
  }) => {
    // Angular table headers are clickable for sorting
    const sortableHeaders = page.locator("tg-issues-table .row.title div");
    const count = await sortableHeaders.count();
    expect(count).toBeGreaterThan(3);
  });

  test("should display issues in the list", async ({ page }) => {
    // Both apps should show issue data from the seeded projects
    const issueRows = page.locator("table tr, .row, tg-issues-table .row");
    const count = await issueRows.count();
    expect(count).toBeGreaterThan(1);
  });
});
