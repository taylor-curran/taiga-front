import { test, expect } from '@playwright/test';
import * as common from '../utils/common';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('admin - integrations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-0/admin/third-parties/webhooks');
    await common.waitLoader(page);
  });

  test('screenshot', async ({ page }) => {
    await common.takeScreenshot(page, 'admin-integrations', 'webhooks');
  });

  test('navigate to github', async ({ page }) => {
    await page.locator('a[href*="third-parties/github"]').click();
    await common.waitLoader(page);
    expect(page.url()).toContain('third-parties/github');
  });
});
