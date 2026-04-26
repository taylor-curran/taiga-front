/**
 * Admin comment slice demo: set PLAYWRIGHT_DO_COMMENT_DEMO_VIDEO=1 to record WebM in playwright-output.
 */
import { test, expect } from '@playwright/test';

if (process.env.PLAYWRIGHT_DO_COMMENT_DEMO_VIDEO === '1') {
  test.use({ video: 'on' as const });
}

test.describe('admin comment post demo (video when env on)', () => {
  test('demo: type and submit comment (mocked PATCH)', async ({ page }) => {
    test.skip(process.env.PLAYWRIGHT_DO_COMMENT_DEMO_VIDEO !== '1', 'Set PLAYWRIGHT_DO_COMMENT_DEMO_VIDEO=1');

    let patchCalled = false;
    await page.route('**/api/v1/history/userstory/1*', async (route) => {
      const u = new URL(route.request().url());
      if (u.searchParams.get('type') === 'comment') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        return;
      }
      if (u.searchParams.get('type') === 'activity') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'x-pagination-next': 'false' },
          body: '[]',
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/v1/userstories/1', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, version: 1 }),
        });
        return;
      }
      if (route.request().method() === 'PATCH') {
        patchCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, version: 2 }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/project/scrum/admin/sample-us-history?us=1', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('e2e-new-comment').fill('E2E demo post');
    await page.getByTestId('e2e-post-comment').click();
    await expect.poll(() => patchCalled, { timeout: 5000 }).toBe(true);
  });
});
