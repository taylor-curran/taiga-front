import { test as setup } from '@playwright/test';
import * as common from '../utils/common';
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_PASSWORD_ALT } from '../utils/config';

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    (window.localStorage as any).e2e = 'true';
  });

  await page.goto('/login');
  await page.locator('input[name="username"]').fill(ADMIN_USERNAME);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to home — fall back to alt password if primary fails
  await page.waitForURL('**/', { timeout: 15000 }).catch(async () => {
    await page.goto('/login');
    await page.locator('input[name="username"]').fill(ADMIN_USERNAME);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD_ALT);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/', { timeout: 15000 });
  });

  await common.closeCookies(page);
  await common.closeJoyride(page);

  await page.goto('/');
  await common.waitLoader(page);

  // Save auth state
  await page.context().storageState({ path: 'e2e-playwright/.auth/state.json' });
});
