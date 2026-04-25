import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard (Home Page)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should display "Projects Dashboard" heading', async ({ page }) => {
    // Angular: h1 says "Projects Dashboard".
    // React: may use different heading text or structure.
    const heading = page.getByRole('heading', { name: 'Projects Dashboard' });
    await expect(heading).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-dashboard-heading.png` });
  });

  test('should show a "Working on" section with assigned items', async ({ page }) => {
    // Angular: dedicated "Working on" section listing items assigned to the user.
    const workingOnHeader = page.getByRole('heading', { name: 'Working on' });
    await expect(workingOnHeader).toBeVisible();
    // There should be at least one work item link
    const workItems = page.locator('[type="working-on"] a, tg-working-on a');
    const count = await workItems.count();
    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-dashboard-working-on.png` });
  });

  test('should show a "Watching" section for tracked items', async ({ page }) => {
    // Angular: "Watching" section is separate from "Working on".
    const watchingHeader = page.getByRole('heading', { name: 'Watching' });
    await expect(watchingHeader).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-dashboard-watching.png` });
  });

  test('should show navigation bar with Taiga logo link', async ({ page }) => {
    // Angular: nav contains a link with title="Homepage" for the Taiga logo.
    const homepageLink = page.locator('a[title="Homepage"]');
    await expect(homepageLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-dashboard-nav-logo.png` });
  });

  test('should show "Projects" link in navigation bar', async ({ page }) => {
    // Angular: nav contains a link with title="Projects".
    const projectsLink = page.locator('a[title="Projects"]');
    await expect(projectsLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-dashboard-nav-projects.png` });
  });

  test('should show user avatar in navigation bar', async ({ page }) => {
    // Angular: nav has an avatar image with title="admin" for the logged-in user.
    const avatar = page.locator('nav img[title="admin"]').first();
    await expect(avatar).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-dashboard-user-avatar.png` });
  });

  test('should show working-on items with item type badges (Epic, Task, Issue, User story)', async ({ page }) => {
    // Angular: each working-on item shows the item type text inline.
    await page.waitForTimeout(1000);
    const pageContent = await page.content();
    // Check that multiple item types are present in the dashboard content
    const hasEpic = pageContent.includes('Epic');
    const hasTask = pageContent.includes('Task');
    const hasIssue = pageContent.includes('Issue');
    const hasUS = pageContent.includes('User story');
    const typeCount = [hasEpic, hasTask, hasIssue, hasUS].filter(Boolean).length;
    expect(typeCount).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-dashboard-item-types.png`, fullPage: true });
  });
});
