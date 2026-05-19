import { Page } from '@playwright/test';

export function getTasks(page: Page) {
  return page.locator('tg-card');
}

export function getColumns(page: Page) {
  return page.locator('.taskboard-column');
}
