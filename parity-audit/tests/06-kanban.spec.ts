import { expect, test } from '@playwright/test';
import { gotoAuthed, snap, PROJECT_SLUG } from './_helpers';

test.describe('Kanban page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, `/project/${PROJECT_SLUG}/kanban`);
    await page.waitForTimeout(2000);
    await snap(page, 'kanban');
  });

  test('column headers are uppercase status names ("NEW", "READY", "IN PROGRESS", "READY FOR TEST")', async ({ page }) => {
    // Angular: <span> "NEW", "READY", ... rendered with `text-transform: uppercase`.
    // React: column headers render as title-case literals ("New", "Ready", ...).
    const headers = page.locator('.kanban-column-name, .task-column-header, h2, header span');
    const visibleText = await page.locator('body').evaluate((b) => (b as HTMLElement).innerText);
    expect(visibleText).toMatch(/\bNEW\b/);
    expect(visibleText).toMatch(/\bREADY\b/);
    expect(visibleText).toMatch(/\bIN PROGRESS\b/);
    expect(visibleText).toMatch(/\bREADY FOR TEST\b/);
    void headers; // keep selector around for debugging
  });

  test('toolbar has a Filters button + reference search + ZOOM control', async ({ page }) => {
    // Angular kanban toolbar: .btn-filter "Filters" + tg-input-search +
    // .zoom-control (slider with "Default" text). React: none of these.
    await expect(page.locator('button.btn-filter, #show-filters-button')).toBeVisible();
    await expect(page.locator('tg-input-search input, input[placeholder*="reference" i]')).toBeVisible();
    await expect(page.locator('body')).toContainText(/zoom/i);
  });

  test('groups stories into swimlanes (one per epic / folder)', async ({ page }) => {
    // Angular splits the board into swimlanes: each epic gets its own row of
    // columns (visible as collapsible group headers with the epic name).
    // The React port renders a single row of columns with no swimlanes.
    const swimlanes = page.locator('.kanban-swimlane, .kanban-folder, .kanban-row, tg-kanban-swimlane');
    if (await swimlanes.count() > 0) return; // Angular hits this branch.

    // Heuristic fallback: count distinct group-row headers spanning multiple
    // columns. If there is genuinely no swimlane structure, fail.
    const groupRows = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('h3, h4, .swimlane-name, .epic-row-title'));
      return all.filter((e) => (e as HTMLElement).innerText.trim().length > 0).length;
    });
    expect(groupRows).toBeGreaterThan(2);
  });

  test('cards display assignee badge ("Not assigned" or avatar)', async ({ page }) => {
    // Angular cards: .kanban-task-assigned-to area with avatar or
    // "Not assigned" placeholder. React cards omit the assignee.
    await expect(page.locator('body')).toContainText(/not assigned/i);
  });
});
