import { test, expect } from '@playwright/test';
import { login, PROJECT_SLUG } from './helpers';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`/project/${PROJECT_SLUG}/kanban`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should display kanban columns with status names as headers', async ({ page }) => {
    // Angular: kanban shows columns named by statuses: New, Ready, In progress, etc.
    // Check for at least 2 visible status column headers.
    const statusNames = ['New', 'Ready', 'In progress', 'Ready for test', 'Done'];
    let visibleCount = 0;
    for (const name of statusNames) {
      const col = page.getByText(name, { exact: true }).first();
      if (await col.isVisible().catch(() => false)) visibleCount++;
    }
    expect(visibleCount).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-kanban-columns.png`, fullPage: true });
  });

  test('should show user story cards with reference numbers', async ({ page }) => {
    // Angular: kanban cards display "#N" reference numbers.
    const cardRef = page.locator('text=/#\\d+/').first();
    await expect(cardRef).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-kanban-cards.png` });
  });

  test('should display card assignee avatars', async ({ page }) => {
    // Angular: kanban cards show small user avatar images.
    const avatar = page.locator('[class*="avatar"], img[title]:not([title=""])').first();
    await expect(avatar).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-kanban-avatars.png` });
  });

  test('should have a zoom/density control for the board', async ({ page }) => {
    // Angular: kanban has zoom-level controls (4 density settings).
    const zoomControl = page.locator('[class*="zoom"], [class*="level"], [class*="density"]').first();
    await expect(zoomControl).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-kanban-zoom.png` });
  });

  test('should show column fold/collapse controls', async ({ page }) => {
    // Angular: columns can be folded/collapsed via toggle controls.
    const foldControl = page.locator('[class*="fold"], [class*="collapse"]').first();
    await expect(foldControl).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-kanban-fold.png` });
  });

  test('should show column item count or WIP indicators', async ({ page }) => {
    // Angular: column headers display item counts.
    const countIndicator = page.locator('[class*="count"], [class*="wip"], [class*="num"]').first();
    await expect(countIndicator).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-kanban-column-counts.png` });
  });
});
