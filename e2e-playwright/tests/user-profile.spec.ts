import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as notifications from '../utils/notifications';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('user profile', () => {
  test('edit user profile', async ({ page }) => {
    await page.goto('/user-settings/user-profile');
    await common.waitLoader(page);

    const bio = page.locator('textarea[name="bio"]');
    await bio.fill('Updated bio ' + Date.now());
    await page.locator('button[type="submit"]').click();

    const open = await notifications.success.open(page);
    expect(open).toBe(true);
    await notifications.success.close(page);
  });

  test('user profile activity', async ({ page }) => {
    await page.goto('/profile');
    await common.waitLoader(page);

    const timeline = page.locator('div[tg-user-timeline-item]');
    const count = await timeline.count();
    expect(count).toBeGreaterThan(0);
  });
});
