/**
 * BACKLOG PAGE DIFFERENCES
 *
 * AngularJS (:9000)                          React (:5173)
 * ┌───────────────────────────────┐          ┌───────────────────────────────┐
 * │ Scrum                         │          │ Backlog          [+ Add US]   │
 * │ 0% | 357 proj | 715 def |    │          │                              │
 * │ 0 closed | 0 pts/sprint      │          │ ▼ Sprint 2026-3-16           │
 * │ [burndown chart toggle]      │          │   #22 Exception...  RfT  13  │
 * │                               │          │   #26 Feature...    RfT  23  │
 * │ Backlog  10 user stories      │          │   ...                        │
 * │ [+ US] [+ bulk] [Filters]    │          │                              │
 * │ [search___________]           │          │ Product Backlog (10)         │
 * │ tags: ...                     │          │ REF SUBJECT STATUS PTS ASGN  │
 * │                               │          │ #42  Lighttpd   Ready 20.5   │
 * │ US  Status  Pts  Doomline     │          │ ...                          │
 * │ #42 Ready   20.5  ━━━        │          └───────────────────────────────┘
 * │ #43 In prog 83               │          (simple table, no burndown,
 * │ ...                           │           no filters, no search,
 * │ (burndown stats, doomline,    │           no doomline, no drag-drop)
 * │  filters, search, drag-drop)  │
 * └───────────────────────────────┘
 */
import { test, expect } from '@playwright/test';
import {
  ANGULAR_BASE, REACT_BASE,
  PROJECT_SLUG, loginAngular, loginReact,
} from './helpers';

test.describe('Backlog Page Differences', () => {
  test('Angular shows burndown stats (project points, defined, closed, per sprint); React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('text=projectpoints', { timeout: 15_000 });

    await expect(page.locator('text=projectpoints')).toBeVisible();
    await expect(page.locator('text=definedpoints')).toBeVisible();
    await expect(page.locator('text=closedpoints')).toBeVisible();
    await page.screenshot({ path: 'screenshots/angular-backlog.png', fullPage: true });

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('h1:has-text("Backlog")');

    await expect(page.locator('text=projectpoints')).toHaveCount(0);
    await expect(page.locator('text=definedpoints')).toHaveCount(0);
    await expect(page.locator('text=closedpoints')).toHaveCount(0);
    await page.screenshot({ path: 'screenshots/react-backlog.png', fullPage: true });
  });

  test('Angular heading says "Scrum"; React heading says "Backlog"', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('main h1');

    const angularH1 = page.locator('main header h1').first();
    await expect(angularH1).toHaveText('Scrum');

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('h1:has-text("Backlog")');

    await expect(page.locator('h1', { hasText: 'Backlog' })).toBeVisible();
  });

  test('Angular has filter button and search input; React has neither', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('text=Filters');

    await expect(page.locator('button', { hasText: 'Filters' })).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('h1:has-text("Backlog")');

    await expect(page.locator('button', { hasText: 'Filters' })).toHaveCount(0);
    await expect(page.locator('input[type="search"]')).toHaveCount(0);
  });

  test('Angular shows tags on user stories; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('text=Filters');

    // Angular displays tag labels on the backlog
    await expect(page.locator('label:has-text("tags")')).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('h1:has-text("Backlog")');

    // React does not show tags label or tag badges
    await expect(page.locator('text="tags"')).toHaveCount(0);
  });

  test('Angular has burndown chart toggle; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('[title="Show/Hide burndown graph"]', { timeout: 15_000 });

    await expect(page.locator('[title="Show/Hide burndown graph"]')).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('h1:has-text("Backlog")');

    await expect(page.locator('[title*="burndown"]')).toHaveCount(0);
  });

  test('Angular has doomline indicator; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('text=Doomline', { timeout: 15_000 });

    await expect(page.locator('text=Doomline')).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('h1:has-text("Backlog")');

    await expect(page.locator('text=Doomline')).toHaveCount(0);
  });
});
