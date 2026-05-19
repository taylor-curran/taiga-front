import { test, expect, Page } from '@playwright/test';
import * as filterHelper from '../helpers/filters-helper';
import * as common from '../utils/common';

export function filtersShared(name: string, counter: (page: Page) => Promise<number>) {
  test.beforeAll(async ({ browser }) => {
    // No-op: filters open in each test
  });

  test(`${name} - filter by ref`, async ({ page }) => {
    await filterHelper.open(page);
    await page.waitForTimeout(4000);
    await filterHelper.byText(page, 'xxxxyy123123123');
    await page.waitForTimeout(1000);
    const len = await counter(page);
    await filterHelper.clearFilters(page);
    expect(len).toBe(0);
  });

  test(`${name} - filter by category`, async ({ page }) => {
    await filterHelper.open(page);
    await page.waitForTimeout(4000);
    const len = await counter(page);
    await filterHelper.firterByCategoryWithContent(page);
    await page.waitForTimeout(1000);
    const newLength = await counter(page);
    expect(len).toBeGreaterThan(newLength);
    await filterHelper.clearFilters(page);
    await page.waitForTimeout(500);
    const restoredLength = await counter(page);
    expect(len).toBe(restoredLength);
  });

  test(`${name} - save custom filters`, async ({ page }) => {
    await filterHelper.open(page);
    await page.waitForTimeout(4000);
    const customFiltersSize = await filterHelper.getCustomFilters(page).count();
    await filterHelper.firterByCategoryWithContent(page);
    await filterHelper.saveFilter(page, 'custom-filter');
    await filterHelper.clearFilters(page);
    const newCustomFiltersSize = await filterHelper.getCustomFilters(page).count();
    expect(newCustomFiltersSize).toBe(customFiltersSize + 1);
  });

  test(`${name} - remove custom filters`, async ({ page }) => {
    await filterHelper.open(page);
    await page.waitForTimeout(4000);
    await filterHelper.openCustomFiltersCategory(page);
    const customFiltersSize = await filterHelper.getCustomFilters(page).count();
    await filterHelper.removeLastCustomFilter(page);
    const newCustomFiltersSize = await filterHelper.getCustomFilters(page).count();
    expect(newCustomFiltersSize).toBe(customFiltersSize - 1);
    await filterHelper.clearFilters(page);
  });
}
