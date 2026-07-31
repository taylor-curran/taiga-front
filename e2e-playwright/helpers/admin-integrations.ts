import { Page } from '@playwright/test';

export function getIntegrations(page: Page) {
  return page.locator('.integrations');
}
