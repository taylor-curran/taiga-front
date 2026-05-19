import { Page } from '@playwright/test';
import * as common from '../utils/common';

export function getFilter(page: Page) {
  return page.locator('tg-filter');
}

export async function open(page: Page) {
  const isPresent = await page.locator('.e2e-open-filter').isVisible().catch(() => false);
  if (isPresent) {
    await page.locator('.e2e-open-filter').click();
    await page.waitForTimeout(500);
  }
}

export async function byText(page: Page, text: string) {
  await page.locator('.e2e-filter-q').fill(text);
}

export async function clearByTextInput(page: Page) {
  await page.locator('.e2e-filter-q').fill('');
}

export async function clearFilters(page: Page) {
  const filters = page.locator('.e2e-remove-filter');
  const filtersSize = await filters.count();
  for (let i = 0; i < filtersSize; i++) {
    await filters.nth(i).click();
  }
  await clearByTextInput(page);
  const isPresent = await page.locator('.e2e-category.selected').isVisible().catch(() => false);
  if (isPresent) {
    await page.locator('.e2e-category.selected').click();
  }
}

export function getFiltersCounters(page: Page) {
  return page.locator('.e2e-filter-count');
}

export function getCustomFilters(page: Page) {
  return page.locator('.e2e-custom-filter');
}

export async function firterByLastCustomFilter(page: Page) {
  await openCustomFiltersCategory(page);
  await getCustomFilters(page).last().click();
}

export function openCustomFiltersCategory(page: Page) {
  return page.locator('.e2e-custom-filters').click();
}

export function removeLastCustomFilter(page: Page) {
  return page.locator('.e2e-remove-custom-filter').last().click();
}

export async function firterByCategoryWithContent(page: Page) {
  await page.locator('.e2e-category').first().click();
  await page.waitForTimeout(500);
  const filterCount = getFiltersCounters(page).first();
  const parentEl = page.locator('.e2e-filter-count').first().locator('..');
  await parentEl.click();
  await page.waitForTimeout(500);
}

export async function saveFilter(page: Page, name: string) {
  await page.locator('.e2e-open-custom-filter-form').click();
  await page.locator('.e2e-filter-name-input').fill(name);
  await page.locator('.e2e-filter-name-input').press('Enter');
}
