import { Page } from '@playwright/test';

export function getStatusList(page: Page) {
  return page.locator('.status-list');
}
