import { Page } from '@playwright/test';

export function taskDetail(page: Page) {
  return page.locator('.task-detail');
}
