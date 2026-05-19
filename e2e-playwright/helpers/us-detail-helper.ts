import { Page } from '@playwright/test';

export function points(page: Page) {
  return page.locator('.us-detail-points');
}
