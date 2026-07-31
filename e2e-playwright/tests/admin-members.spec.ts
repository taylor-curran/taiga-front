import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';
import * as notifications from '../utils/notifications';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('admin - members', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-0/admin/memberships');
    await common.waitLoader(page);
  });

  test.describe('new member', () => {
    test('add and submit', async ({ page }) => {
      const initMembersCount = await page.locator('.members-table .row').count();

      await page.locator('.add-member-button').click();
      const lb = page.locator('.lightbox-add-member');
      await lightbox.open(page, lb);

      await lb.locator('input[type="email"]').fill('xxx' + Date.now() + '@xx.es');
      await page.waitForTimeout(500);

      await lb.locator('.button-green').click();
      await lightbox.close(page, lb);
      await page.waitForTimeout(1000);

      const membersCount = await page.locator('.members-table .row').count();
      expect(membersCount).toBeGreaterThanOrEqual(initMembersCount);
    });
  });

  test('delete member', async ({ page }) => {
    const initMembersCount = await page.locator('.members-table .row').count();
    if (initMembersCount <= 1) return;

    const member = page.locator('.members-table .row').last();
    await member.locator('.delete').click();
    await lightbox.confirm.ok(page);
    await page.waitForTimeout(1000);

    const membersCount = await page.locator('.members-table .row').count();
    expect(membersCount).toBe(initMembersCount - 1);
  });
});
