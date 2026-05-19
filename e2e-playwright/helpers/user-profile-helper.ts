import { Page } from '@playwright/test';

export function getProfile(page: Page) {
  return page.locator('.profile');
}
