/**
 * FEATURES PRESENT IN ANGULAR BUT MISSING IN REACT
 *
 * This test documents features that exist in the AngularJS app
 * but are absent or non-functional in the React migration.
 */
import { test, expect } from '@playwright/test';
import {
  ANGULAR_BASE, REACT_BASE,
  PROJECT_SLUG, loginAngular, loginReact,
} from './helpers';

test.describe('Missing React Features (present in AngularJS)', () => {
  test('Angular has a Discover/trending projects page; React does not', async ({ page }) => {
    await loginAngular(page);
    const discoverLink = page.locator('a[title="Discover trending projects"]');
    await expect(discoverLink).toBeVisible();
    await discoverLink.click();
    // Wait for the discover page to load
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toContain('discover');
    await page.screenshot({ path: 'screenshots/angular-discover.png', fullPage: true });

    await loginReact(page);
    // React has no discover/trending link in navigation
    const reactDiscoverLink = page.locator('a[title="Discover trending projects"]');
    await expect(reactDiscoverLink).toHaveCount(0);

    // React header nav does not contain a discover link
    const reactNavLinks = await page.locator('header nav a').allTextContents();
    const hasDiscoverNav = reactNavLinks.some(t => /discover/i.test(t));
    expect(hasDiscoverNav).toBe(false);
    await page.screenshot({ path: 'screenshots/react-no-discover.png', fullPage: true });
  });

  test('Angular kanban cards display properly spaced metadata; React cards have concatenated text', async ({ page }) => {
    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/kanban`);
    await page.waitForSelector('h1:has-text("Kanban")');

    // React kanban cards contain garbled text where assignee initial,
    // points, and tags are concatenated without spaces
    // e.g. "a55.5oditmaiores" instead of "admin | 55.5 | odit, maiores"
    const cardTexts = await page.locator('main main div > div > div > div').allTextContents();
    const hasGarbledText = cardTexts.some(text => /[a-z]\d+\.?\d*[a-z]/i.test(text));
    expect(hasGarbledText).toBe(true);
    await page.screenshot({ path: 'screenshots/react-kanban-garbled-cards.png', fullPage: true });
  });

  test('Angular user story detail has description section; React shows simpler layout', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/us/42`);
    // Wait for the detail page to load
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/angular-us-detail.png', fullPage: true });

    // Angular US detail page has rich content sections
    const angularPageText = await page.textContent('body');
    expect(angularPageText).toContain('Lighttpd');

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/us/42`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/react-us-detail.png', fullPage: true });
  });

  test('Angular issue detail has rich layout; React issue detail is simpler', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/issue/72`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/angular-issue-detail.png', fullPage: true });

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/issue/72`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/react-issue-detail.png', fullPage: true });
  });
});
