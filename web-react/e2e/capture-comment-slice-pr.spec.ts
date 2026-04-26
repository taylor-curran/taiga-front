/**
 * PR artifacts: set RUN_COMMENT_SLICE_ARTIFACTS=1 to write PNGs to e2e-artifacts/pr/
 * (mocked API — no live Taiga required).
 */
import { test } from '@playwright/test';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'e2e-artifacts', 'pr');

const mockComment = {
  id: 10,
  user: { pk: 1, name: 'Admin', photo: null },
  comment: '<p>Sample <strong>comment</strong> body</p>',
  created_at: '2024-01-10T10:00:00',
};

const mockActivity = {
  id: 20,
  user: { pk: 1, name: 'Admin', photo: null },
  created_at: '2024-01-10T11:00:00',
  values_diff: { status: { from: 'New', to: 'In progress' } },
};

test.describe('PR screenshot hooks', () => {
  test('write comment + activity view PNGs (env-gated)', async ({ page, browserName }) => {
    test.skip(process.env.RUN_COMMENT_SLICE_ARTIFACTS !== '1', 'Set RUN_COMMENT_SLICE_ARTIFACTS=1');

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
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'x-pagination-next': 'false', 'x-pagination-count': '1' },
          body: JSON.stringify([mockActivity]),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/v1/timeline/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/api/v1/projects/by_slug*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, slug: 'scrum' }) });
    });

    await mkdir(outDir, { recursive: true });
    await page.goto('/project/scrum/admin/sample-us-history?us=1', { waitUntil: 'networkidle' });
    await page.getByTestId('history-section').waitFor({ state: 'visible' });
    const commentsPng = path.join(outDir, `react-admin-comments-${browserName}.png`);
    await page.screenshot({ path: commentsPng, fullPage: true });

    await page.getByTestId('e2e-activity-tab').click();
    await page.getByTestId('activity-list').locator('text=status').waitFor();
    const activityPng = path.join(outDir, `react-admin-activity-${browserName}.png`);
    await page.screenshot({ path: activityPng, fullPage: true });

    await copyFile(commentsPng, path.join(outDir, 'react-comment-view.png'));
    await copyFile(activityPng, path.join(outDir, 'react-activity-view.png'));
  });
});
