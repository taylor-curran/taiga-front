import { Page } from '@playwright/test';

export function getProjects(page: Page) {
  return page.locator('.discover-search-results .list-itemtype-project');
}
