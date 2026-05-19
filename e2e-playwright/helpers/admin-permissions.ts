import { Page } from '@playwright/test';

export function getPermissions(page: Page) {
  return page.locator('.permissions');
}
