import { test, expect } from '@playwright/test';

test.describe('Admin history comments slice', () => {
  test('shows comments tab and thread from mocked API', async ({ page }) => {
    await page.route('**/api/v1/history/userstory/99?type=comment**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            comment: '<p>Mocked</p>',
            created_at: '2024-01-15T10:00:00Z',
            user: { pk: 1, name: 'Test User', photo: null },
          },
        ]),
      });
    });
    await page.route('**/api/v1/history/userstory/99?type=activity**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-pagination-count': '0' },
        body: JSON.stringify([]),
      });
    });
    await page.route('**/api/v1/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1 }),
      });
    });

    await page.goto('/admin/history/us/99?token=fake&perms=comment_us,modify_project');

    await expect(page.locator('.e2e-comments-tab')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('Mocked')).toBeVisible();
  });

  test('screenshot: comments layout', async ({ page }) => {
    await page.route('**/api/v1/history/userstory/7?type=comment**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            comment: '<p>First line</p><p>Second line</p>',
            created_at: '2024-03-01T14:30:00Z',
            edit_comment_date: '2024-03-02T09:00:00Z',
            user: { pk: 2, name: 'Reviewer', photo: null },
          },
        ]),
      });
    });
    await page.route('**/api/v1/history/userstory/7?type=activity**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-pagination-count': '0' },
        body: JSON.stringify([]),
      });
    });
    await page.route('**/api/v1/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 2 }),
      });
    });

    await page.goto('/admin/history/us/7?token=x&perms=comment_us,modify_project');
    await page.waitForSelector('.comment-wrapper');
    await expect(page).toHaveScreenshot('comments-view.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('posting a comment sends PATCH then reloads GET', async ({ page }) => {
    let patchSeen = false;
    await page.route('**/api/v1/history/userstory/50?type=comment**', async (route) => {
      const body =
        patchSeen ?
          [
            {
              id: 2,
              comment: '<p>Posted text</p>',
              created_at: '2024-06-10T12:00:00Z',
              user: { pk: 1, name: 'Poster', photo: null },
            },
          ]
        : [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    await page.route('**/api/v1/history/userstory/50?type=activity**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-pagination-count': '0' },
        body: JSON.stringify([]),
      });
    });
    await page.route('**/api/v1/userstories/50', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchSeen = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 50, comment: '' }),
        });
        return;
      }
      await route.fulfill({ status: 404, body: 'noop' });
    });
    await page.route('**/api/v1/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1 }),
      });
    });

    await page.goto('/admin/history/us/50?token=tok&perms=comment_us,modify_project');
    await page.getByPlaceholder('Type a new comment…').fill('Posted text');
    await page.locator('.e2e-post-comment').click();
    await expect(page.getByText('Poster')).toBeVisible();
    await expect(page.getByText('Posted text')).toBeVisible();
    expect(patchSeen).toBe(true);
  });
});
