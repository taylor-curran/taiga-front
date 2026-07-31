import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as notifications from '../utils/notifications';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('admin - project', () => {
  test('project detail page loads', async ({ page }) => {
    await page.goto('/project/project-0/admin/project-profile/details');
    await common.waitLoader(page);
    const projectName = page.locator('.project-details input[name="name"]');
    const value = await projectName.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('modules page loads', async ({ page }) => {
    await page.goto('/project/project-0/admin/project-profile/modules');
    await common.waitLoader(page);
    const modules = page.locator('.module');
    const count = await modules.count();
    expect(count).toBeGreaterThan(0);
  });
});
