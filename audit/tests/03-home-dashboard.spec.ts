/**
 * HOME / DASHBOARD DIFFERENCES
 *
 * AngularJS (:9000)                        React (:5173)
 * ┌──────────────────────────┐             ┌──────────────────────────┐
 * │  Projects Dashboard      │             │  My Projects             │
 * │                          │             │                          │
 * │  Working on              │             │  [P] Project 7   7f 15w  │
 * │  ┌──────────────────┐   │             │  [P] Project 6   9f 11w  │
 * │  │ 🖼 Proj7 Epic     │   │             │  ...                     │
 * │  │  Ready for test   │   │             │                          │
 * │  │  #40 Create user  │   │             │  Working on              │
 * │  └──────────────────┘   │             │  wiki change 3 min ago   │
 * │  (linked work items      │             │  issue create 3 min ago  │
 * │   with project logo,     │             │  (raw timeline events    │
 * │   type badge, status)    │             │   without item links)    │
 * └──────────────────────────┘             └──────────────────────────┘
 */
import { test, expect } from '@playwright/test';
import { loginAngular, loginReact } from './helpers';

test.describe('Home / Dashboard Differences', () => {
  test('Angular heading is "Projects Dashboard"; React heading is "My Projects"', async ({ page }) => {
    await loginAngular(page);
    await expect(page.locator('h1', { hasText: 'Projects Dashboard' })).toBeVisible();
    await page.screenshot({ path: 'screenshots/angular-home.png', fullPage: true });

    await loginReact(page);
    await expect(page.locator('h2', { hasText: 'My Projects' })).toBeVisible();
    await expect(page.locator('text=Projects Dashboard')).toHaveCount(0);
    await page.screenshot({ path: 'screenshots/react-home.png', fullPage: true });
  });

  test('Angular "Working on" shows linked work items with project logos; React shows raw timeline events', async ({ page }) => {
    await loginAngular(page);
    // Wait for the working-on section to load
    await page.waitForSelector('tg-working-on', { timeout: 15_000 });

    // Angular working-on items contain links to specific work items
    const angularWorkItems = page.locator('tg-working-on div[type="working-on"] a');
    const angularCount = await angularWorkItems.count();
    expect(angularCount).toBeGreaterThan(0);

    // Angular work items include project logo images
    const angularLogos = page.locator('tg-working-on img[src*="project-logo"]');
    const logoCount = await angularLogos.count();
    expect(logoCount).toBeGreaterThan(0);

    // Angular items show type badges (Epic, User story, Task, Issue)
    const workingOnText = await page.locator('tg-working-on').textContent();
    expect(workingOnText).toMatch(/Epic|User story|Task|Issue/);

    await loginReact(page);
    // React "Working on" section shows timeline events as plain text
    const reactWorkingOn = page.locator('h3:has-text("Working on")');
    await expect(reactWorkingOn).toBeVisible();

    // React uses a simple <ul>/<li> list
    const reactItems = page.locator('h3:has-text("Working on") + ul li');
    const reactCount = await reactItems.count();
    expect(reactCount).toBeGreaterThan(0);

    // React items show event types not item types (e.g. "wiki wikipage change")
    const firstItemText = await reactItems.first().textContent();
    expect(firstItemText).toMatch(/wiki|issues|userstories|tasks/);
  });

  test('Angular project cards on home use logo images; React uses letter avatars', async ({ page }) => {
    await loginAngular(page);
    await page.waitForSelector('tg-working-on', { timeout: 15_000 });

    // Angular home shows actual project logo images inside working-on items
    const angularLogos = page.locator('tg-working-on img[src*="project-logo"]');
    const angularLogoCount = await angularLogos.count();
    expect(angularLogoCount).toBeGreaterThan(0);

    await loginReact(page);
    // React project cards don't use project logo images
    const reactLogos = page.locator('main img[src*="project-logo"]');
    const reactLogoCount = await reactLogos.count();
    expect(reactLogoCount).toBe(0);
  });
});
