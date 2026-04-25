/**
 * KANBAN BOARD DIFFERENCES
 *
 * AngularJS (:9000)                          React (:5173)
 * ┌──────────────────────────────────┐       ┌──────────────────────────────────┐
 * │ Kanban  [Filters] [search] Zoom │       │ Kanban                           │
 * │                                  │       │                                  │
 * │ New [+][b][f] Ready [+][b][f]   │       │ New 4        Ready 6             │
 * │ ┌────────┐    ┌────────┐        │       │ ┌────────┐   ┌────────┐          │
 * │ │ #15    │    │ #12    │        │       │ │ #15    │   │ #12    │          │
 * │ │ Impl   │    │ Create │        │       │ │ Impl   │   │ Create │          │
 * │ │ 🧑admin │    │ 🧑E.C.  │        │       │ │a55.5  │   │E24nihi│          │
 * │ └────────┘    └────────┘        │       │ └────────┘   └────────┘          │
 * │  (avatars, action menus,         │       │  (no avatars, no menus,          │
 * │   zoom control, filters,         │       │   no zoom, no filters,           │
 * │   +add/bulk/fold per column)     │       │   no column actions,             │
 * └──────────────────────────────────┘       │   garbled text on cards)         │
 *                                            └──────────────────────────────────┘
 */
import { test, expect } from '@playwright/test';
import {
  ANGULAR_BASE, REACT_BASE,
  PROJECT_SLUG, loginAngular, loginReact,
} from './helpers';

test.describe('Kanban Board Differences', () => {
  test('Angular has zoom control; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('text=Zoom:', { timeout: 15_000 });

    await expect(page.locator('text=Zoom:')).toBeVisible();
    await page.screenshot({ path: 'screenshots/angular-kanban.png', fullPage: true });

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('h1:has-text("Kanban")');

    await expect(page.locator('text=Zoom:')).toHaveCount(0);
    await page.screenshot({ path: 'screenshots/react-kanban.png', fullPage: true });
  });

  test('Angular kanban has filter button and search; React has neither', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('text=Filters');

    await expect(page.locator('button', { hasText: 'Filters' })).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('h1:has-text("Kanban")');

    await expect(page.locator('button', { hasText: 'Filters' })).toHaveCount(0);
    await expect(page.locator('input[type="search"]')).toHaveCount(0);
  });

  test('Angular columns have +add, bulk-add, and fold buttons; React has none', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('button[title="Add new user story"]', { timeout: 15_000 });

    const addButtons = page.locator('button[title="Add new user story"]');
    expect(await addButtons.count()).toBeGreaterThan(0);

    const bulkButtons = page.locator('button[title="Add new bulk"]');
    expect(await bulkButtons.count()).toBeGreaterThan(0);

    const foldButtons = page.locator('button[title="Fold column"]');
    expect(await foldButtons.count()).toBeGreaterThan(0);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('h1:has-text("Kanban")');

    await expect(page.locator('button[title="Add new user story"]')).toHaveCount(0);
    await expect(page.locator('button[title="Add new bulk"]')).toHaveCount(0);
    await expect(page.locator('button[title="Fold column"]')).toHaveCount(0);
  });

  test('Angular kanban cards show user avatars; React cards do not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('tg-card', { timeout: 15_000 });

    // Angular cards have assigned-to avatar images
    const avatars = page.locator('tg-card-assigned-to img');
    expect(await avatars.count()).toBeGreaterThan(0);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('h1:has-text("Kanban")');

    // React kanban has no avatar images in cards
    // (it has concatenated text like "a55.5oditmaiores" instead of proper card layout)
    const reactCardAvatars = page.locator('main main img');
    expect(await reactCardAvatars.count()).toBe(0);
  });

  test('Angular kanban cards have action menu buttons; React cards do not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('tg-card', { timeout: 15_000 });

    const actionButtons = page.locator('tg-card-actions button');
    expect(await actionButtons.count()).toBeGreaterThan(0);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('h1:has-text("Kanban")');

    // No card action buttons in React
    await expect(page.locator('main main button')).toHaveCount(0);
  });
});
