/**
 * ISSUES PAGE DIFFERENCES
 *
 * AngularJS (:9000)                          React (:5173)
 * ┌─────────────────────────────────┐        ┌─────────────────────────────────┐
 * │ Issues  [Filters] [search]     │        │ Issues  [status▼] [type▼]      │
 * │         [NEW ISSUE] [export]   │        │                                │
 * │                                 │        │ REF SUBJECT STATUS TYPE PRI    │
 * │ Type Sev Pri Issue Status Mod  │        │     SEV ASSIGNED               │
 * │ 🔧  ⬆  ⬆  #72 Feat Closed 25A│        │ #72 Feat  Closed Quest Norm    │
 * │ 🐛  ⚠  ⬆  #71 Add  Closed 25A│        │     Norm  Catalina             │
 * │ ...                             │        │ #71 Add   Closed Bug   High    │
 * │                                 │        │     Crit  Unassigned           │
 * │  (icons for type/sev/pri,       │        │ ...                            │
 * │   inline status change,         │        │  (filter dropdowns,            │
 * │   column sorting, avatars,      │        │   no search, no NEW ISSUE btn, │
 * │   "NEW ISSUE" button,           │        │   no sort, no avatars,         │
 * │   tag display)                  │        │   no inline status change)     │
 * └─────────────────────────────────┘        └─────────────────────────────────┘
 */
import { test, expect } from '@playwright/test';
import {
  ANGULAR_BASE, REACT_BASE,
  PROJECT_SLUG, loginAngular, loginReact,
} from './helpers';

test.describe('Issues Page Differences', () => {
  test('Angular has "NEW ISSUE" button; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('tg-issues-table', { timeout: 15_000 });

    // Angular has a NEW ISSUE button in the issues header
    const newIssueBtn = page.getByRole('button', { name: 'NEW ISSUE' });
    await expect(newIssueBtn).toBeVisible();
    await page.screenshot({ path: 'screenshots/angular-issues.png', fullPage: true });

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('h1:has-text("Issues")');

    // React does not have a NEW ISSUE button
    await expect(page.getByRole('button', { name: /new issue/i })).toHaveCount(0);
    await page.screenshot({ path: 'screenshots/react-issues.png', fullPage: true });
  });

  test('Angular issues table has search input; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('input[type="search"]', { timeout: 15_000 });

    await expect(page.locator('input[type="search"]')).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('h1:has-text("Issues")');

    await expect(page.locator('input[type="search"]')).toHaveCount(0);
  });

  test('Angular issues has filter button; React has filter dropdowns', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('text=Filters');

    await expect(page.locator('button', { hasText: 'Filters' })).toBeVisible();
    // Angular does not have native <select> dropdowns
    await expect(page.locator('main select')).toHaveCount(0);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('h1:has-text("Issues")');

    // React uses native <select> dropdowns for filtering
    const selects = page.locator('select');
    expect(await selects.count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('button', { hasText: 'Filters' })).toHaveCount(0);
  });

  test('Angular issues table columns have sort headers; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('tg-issues-table', { timeout: 15_000 });

    // Angular column headers are clickable divs with sort arrows (svg)
    const sortHeaders = page.locator('tg-issues-table section > div:has(svg)');
    expect(await sortHeaders.count()).toBeGreaterThan(3);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('h1:has-text("Issues")');

    // React table headers don't have sort indicators
    const reactSortHeaders = page.locator('main main svg');
    expect(await reactSortHeaders.count()).toBe(0);
  });

  test('Angular shows assigned-to user avatars; React shows text names only', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('tg-issues-table', { timeout: 15_000 });

    // Angular issues show avatar images for assignees
    const avatars = page.locator('tg-issues-table figure img');
    expect(await avatars.count()).toBeGreaterThan(0);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('h1:has-text("Issues")');

    // React issues page has no avatar images
    const reactAvatars = page.locator('main main img');
    expect(await reactAvatars.count()).toBe(0);
  });

  test('Angular issues show "Modified" date column; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('tg-issues-table', { timeout: 15_000 });

    // Angular issues table shows "Modified" dates (e.g. "25 Apr 2026")
    const angularPageText = await page.locator('tg-issues-table').textContent();
    expect(angularPageText).toContain('Apr 2026');

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/issues`);
    await page.waitForSelector('h1:has-text("Issues")');

    // React issues table does not show modification dates
    const reactTableText = await page.locator('main main').textContent();
    expect(reactTableText).not.toContain('Apr 2026');
  });
});
