import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('search page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-0/');
    await common.waitLoader(page);
  });

  test('lightbox', async ({ page }) => {
    await page.locator('#nav-search a').click();
    const searchLb = page.locator('div[tg-search-box]');
    await lightbox.open(page, searchLb);

    await page.locator('#search-text').fill('create');
    await searchLb.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    expect(currentUrl).toContain('search?text=create');
  });

  test.describe('tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/project/project-0/search?text=create');
      await common.waitLoader(page);
    });

    test('issues tab', async ({ page }) => {
      const option = page.locator('.search-filter li').nth(1).locator('a');
      await option.click();
      const active = await common.hasClass(option, 'active');
      expect(active).toBe(true);
    });

    test('tasks tab', async ({ page }) => {
      const option = page.locator('.search-filter li').nth(2).locator('a');
      await option.click();
      const active = await common.hasClass(option, 'active');
      expect(active).toBe(true);
    });

    test('wiki tab', async ({ page }) => {
      const option = page.locator('.search-filter li').nth(3).locator('a');
      await option.click();
      const active = await common.hasClass(option, 'active');
      expect(active).toBe(true);
    });

    test('userstories tab', async ({ page }) => {
      const option = page.locator('.search-filter li').nth(0).locator('a');
      await option.click();
      const active = await common.hasClass(option, 'active');
      expect(active).toBe(true);
    });
  });

  test.describe('new search', () => {
    test('change current tab content on typing', async ({ page }) => {
      await page.goto('/project/project-0/search?text=create');
      await common.waitLoader(page);

      const searchTerm = page.locator('[ng-model="searchTerm"]');
      await searchTerm.fill('');

      const text = await page.locator('.table-main').first().locator('a').first().textContent();
      const htmlChanges = await common.outerHtmlChanges(page, '.search-result-table-body');

      const initialCount = await page.locator('.table-main').count();
      await searchTerm.fill(text || '');
      await htmlChanges();

      const count = await page.locator('.table-main').count();
      expect(count).toBeLessThan(initialCount);
      expect(count).toBeGreaterThan(0);
    });
  });
});
