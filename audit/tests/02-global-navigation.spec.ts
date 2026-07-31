/**
 * GLOBAL NAVIGATION DIFFERENCES
 *
 * AngularJS (:9000)                   React (:5173)
 * ┌──────┬──────────────┐             ┌────────────────────────────────┐
 * │ LOGO │              │             │ [T] Projects           [avatar]│
 * │──────│              │             └────────────────────────────────┘
 * │ Proj │              │             (simple horizontal header bar)
 * │ Disc │   content    │
 * │ Help │              │
 * │ Evts │              │
 * │ User │              │
 * │ Srch │              │
 * └──────┴──────────────┘
 * (rich left sidebar with icons)
 */
import { test, expect } from '@playwright/test';
import { ANGULAR_BASE, REACT_BASE, loginAngular, loginReact } from './helpers';

test.describe('Global Navigation Differences', () => {
  test('Angular has left sidebar nav with 6+ items; React has horizontal header with ~2 items', async ({ page }) => {
    await loginAngular(page);
    // Angular nav is a vertical sidebar with multiple links
    const angularNav = page.locator('nav').first();
    const angularLinks = angularNav.locator('a');
    const angularLinkCount = await angularLinks.count();
    expect(angularLinkCount).toBeGreaterThanOrEqual(5);

    // Verify Angular has Discover link
    await expect(page.locator('a[title="Discover trending projects"]')).toBeVisible();
    // Verify Angular has Help link
    await expect(page.locator('a[title="Help"]')).toBeVisible();
    // Verify Angular has Events link
    await expect(page.locator('a[title="Events"]')).toBeVisible();

    await loginReact(page);
    // React header has only logo and Projects link
    const reactHeader = page.locator('header');
    const reactNavLinks = reactHeader.locator('nav a');
    const reactNavCount = await reactNavLinks.count();
    expect(reactNavCount).toBeLessThanOrEqual(2);
  });

  test('Angular nav has Discover link; React does not', async ({ page }) => {
    await loginAngular(page);
    await expect(page.locator('a[title="Discover trending projects"]')).toBeVisible();

    await loginReact(page);
    await expect(page.locator('a', { hasText: /discover/i })).toHaveCount(0);
  });

  test('Angular nav has Help link to community.taiga.io; React does not', async ({ page }) => {
    await loginAngular(page);
    const helpLink = page.locator('a[title="Help"]');
    await expect(helpLink).toBeVisible();
    await expect(helpLink).toHaveAttribute('href', 'https://community.taiga.io/');

    await loginReact(page);
    await expect(page.locator('a[href*="community.taiga.io"]')).toHaveCount(0);
  });

  test('Angular nav has Events/Notifications icon; React does not', async ({ page }) => {
    await loginAngular(page);
    await expect(page.locator('a[title="Events"]')).toBeVisible();

    await loginReact(page);
    await expect(page.locator('a[title="Events"]')).toHaveCount(0);
  });

  test('Angular nav has search toggle button; React does not', async ({ page }) => {
    await loginAngular(page);
    const searchBtn = page.locator('nav button').last();
    await expect(searchBtn).toBeVisible();

    await loginReact(page);
    // React header has no search button
    const reactSearchBtn = page.locator('header button:not(:last-child)');
    // Only the avatar button exists
    const buttons = page.locator('header button');
    const count = await buttons.count();
    expect(count).toBeLessThanOrEqual(1);
  });
});
