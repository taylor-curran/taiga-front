import { Page } from '@playwright/test';

export function getCustomFields(page: Page) {
  return page.locator('.custom-fields');
}
