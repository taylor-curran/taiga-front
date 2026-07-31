import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';
import * as notifications from '../utils/notifications';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('admin - roles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-0/admin/roles');
    await common.waitLoader(page);
  });

  test('new role', async ({ page }) => {
    const oldRolesCount = await page.locator('.role-permission').count();

    await page.locator('.add-role input').fill('test' + Date.now());
    await page.locator('.add-role input').press('Enter');
    await page.waitForTimeout(1000);

    const newRolesCount = await page.locator('.role-permission').count();
    expect(newRolesCount).toBe(oldRolesCount + 1);
  });

  test('delete role', async ({ page }) => {
    // First create a role to delete
    await page.locator('.add-role input').fill('delete-test-' + Date.now());
    await page.locator('.add-role input').press('Enter');
    await page.waitForTimeout(1000);

    const oldRolesCount = await page.locator('.role-permission').count();

    await page.locator('.delete-role').last().click();
    const lb = page.locator('.lightbox-ask-choice');
    await lightbox.open(page, lb);
    await lb.locator('.button-green').click();
    await page.waitForTimeout(1000);

    const newRolesCount = await page.locator('.role-permission').count();
    expect(newRolesCount).toBe(oldRolesCount - 1);
  });
});
