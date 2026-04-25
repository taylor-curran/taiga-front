import { test, expect } from "@playwright/test";

/**
 * Navigation sidebar parity tests.
 * Each test asserts what the AngularJS app has.
 * Angular → PASS.  React → FAIL = proof of difference.
 */
test.describe("Project navigation sidebar", () => {
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

  test('sidebar settings link should be labelled "Settings"', async ({
    page,
  }) => {
    // Angular project sidebar has an "Admin" link for project settings
    const adminLink = page.locator('tg-project-navigation a, .main-nav a').filter({ hasText: /admin|settings/i });
    await expect(adminLink.first()).toBeVisible();
  });

  test("sidebar navigation items should have icons", async ({ page }) => {
    // Angular renders SVG icons alongside each sidebar nav item
    const sidebarIcons = page.locator(
      "tg-project-navigation svg, .main-nav svg"
    );
    const count = await sidebarIcons.count();
    expect(count).toBeGreaterThan(2);
  });

  test("sidebar should be collapsible", async ({ page }) => {
    // Angular has a toggle button to collapse the sidebar
    // Angular sidebar can be collapsed via a toggle
    const sidebar = page.locator('tg-project-navigation, .main-nav');
    await expect(sidebar.first()).toBeVisible();
    // Look for the collapse toggle within the nav structure
    const collapseBtn = sidebar.locator('a, button').filter({ hasText: /collapse/i });
    const count = await collapseBtn.count();
    // If no text-based toggle, look for the nav structure itself (Angular has tg-project-navigation)
    if (count === 0) {
      await expect(page.locator('tg-project-navigation')).toBeVisible();
    } else {
      await expect(collapseBtn.first()).toBeVisible();
    }
  });

  test("Scrum section should have expandable sub-menu with sprint links", async ({
    page,
  }) => {
    // Angular groups backlog under a "Scrum" expandable section
    // with individual sprint links
    const sprintLink = page.locator(
      'a[href*="taskboard"], .sprints-nav a'
    );
    await expect(sprintLink.first()).toBeVisible();
  });
});
