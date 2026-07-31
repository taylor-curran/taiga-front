import { test, expect } from '@playwright/test';
import * as common from '../utils/common';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('discover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await common.waitLoader(page);
  });

  test.describe('most liked', () => {
    test('has projects', async ({ page }) => {
      const projects = page.locator('tg-most-liked .highlighted-project');
      const count = await projects.count();
      expect(count).toBeGreaterThan(0);
    });

    test('rearrange', async ({ page }) => {
      const liked = page.locator('tg-most-liked');
      await liked.locator('.current-filter').click();
      await liked.locator('.filter-list li').nth(3).click();
      const filterText = await liked.locator('.current-filter').textContent();
      expect(filterText?.trim()).toBe('All time');
    });
  });

  test.describe('most active', () => {
    test('has projects', async ({ page }) => {
      const projects = page.locator('tg-most-active .highlighted-project');
      const count = await projects.count();
      expect(count).toBeGreaterThan(0);
    });

    test('rearrange', async ({ page }) => {
      const active = page.locator('tg-most-active');
      await active.locator('.current-filter').click();
      await active.locator('.filter-list li').nth(3).click();
      const filterText = await active.locator('.current-filter').textContent();
      expect(filterText?.trim()).toBe('All time');
    });
  });

  test('featured projects', async ({ page }) => {
    const projects = page.locator('tg-featured-projects .featured-project');
    const count = await projects.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('discover search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover/search');
    await common.waitLoader(page);
  });

  test.describe('top bar', () => {
    test('filters', async ({ page }) => {
      await page.locator('.searchbox-filters label').nth(3).click();
      await page.waitForTimeout(1000);
      const url = page.url();
      const projects = page.locator('.project-list li');
      const count = await projects.count();
      expect(count).toBeGreaterThan(0);
      expect(url).toContain('filter=people');
    });

    test('search by text', async ({ page }) => {
      const projects = page.locator('.project-list li');
      const firstTitle = await projects.first().locator('h2 a').textContent();
      await page.locator('.searchbox input').fill(firstTitle || '');
      await page.locator('.search-button').click();
      await page.waitForTimeout(2000);
      const newProjects = page.locator('.project-list li');
      const count = await newProjects.count();
      expect(count).toBe(1);
    });
  });

  test.describe('most liked', () => {
    test('default', async ({ page }) => {
      await page.locator('.discover-search-filter').nth(0).click();
      const url = page.url();
      expect(url).toContain('order_by=-total_fans_last_week');
    });

    test('filter', async ({ page }) => {
      await page.locator('.discover-search-filter').nth(0).click();
      await page.locator('.filter-list a').nth(3).click();
      const url = page.url();
      expect(url).toContain('order_by=-total_fans');
    });
  });

  test.describe('most active', () => {
    test('default', async ({ page }) => {
      await page.locator('.discover-search-filter').nth(1).click();
      const url = page.url();
      expect(url).toContain('order_by=-total_activity_last_week');
    });

    test('filter', async ({ page }) => {
      await page.locator('.discover-search-filter').nth(1).click();
      await page.locator('.filter-list a').nth(3).click();
      const url = page.url();
      expect(url).toContain('order_by=-total_activity');
    });
  });
});
