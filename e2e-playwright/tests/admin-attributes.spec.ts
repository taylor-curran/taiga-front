import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as notifications from '../utils/notifications';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('admin - attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-0/admin/project-values/status');
    await common.waitLoader(page);
  });

  test('screenshot', async ({ page }) => {
    await common.takeScreenshot(page, 'admin-attributes', 'status');
  });

  test('navigate to points', async ({ page }) => {
    await page.locator('a[href*="project-values/points"]').click();
    await common.waitLoader(page);
    expect(page.url()).toContain('project-values/points');
  });
});
