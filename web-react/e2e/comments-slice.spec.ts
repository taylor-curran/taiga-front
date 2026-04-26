import { test, expect } from '@playwright/test';

const mockComment = {
  id: 10,
  user: { pk: 1, name: 'Admin', photo: null },
  comment: '<p>Hello</p>',
  created_at: '2024-01-10T10:00:00',
};

const mockActivity = {
  id: 20,
  user: { pk: 1, name: 'Admin', photo: null },
  created_at: '2024-01-10T11:00:00',
  values_diff: { subject: { from: 'A', to: 'B' } },
};

test.describe('admin comments + activity slice (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/projects/by_slug*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, name: 'Scrum', slug: 'scrum' }),
      });
    });
    await page.route('**/api/v1/timeline/project/1*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
  });

  test('sample US history: tabs, comments, activity', async ({ page }) => {
    await page.route('**/api/v1/history/userstory/1*', async (route) => {
      const u = new URL(route.request().url());
      const type = u.searchParams.get('type');
      if (type === 'comment') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([mockComment]),
        });
        return;
      }
      if (type === 'activity') {
        const h: Record<string, string> = {
          'x-pagination-next': 'false',
          'x-pagination-count': '1',
        };
        // Always return one row (React StrictMode may double-fetch on mount)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: h,
          body: JSON.stringify([mockActivity]),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/project/scrum/admin/sample-us-history?us=1', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('history-section')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('comment-list')).toBeVisible();
    await expect(page.getByTestId('comment-list')).toContainText('Hello');
    await page.getByTestId('e2e-activity-tab').click();
    await expect(page.getByTestId('activity-list')).toBeVisible();
    await expect(page.getByTestId('activity-list')).toContainText('subject');
  });
});
