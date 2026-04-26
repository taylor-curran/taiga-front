import { expect, test } from '@playwright/test';
import { loginViaApi, trackedRequests } from './helpers';

test.describe('react app parity', () => {
  test('signs in via the login form and lands on the home page', async ({ page, request }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    const { calls } = await trackedRequests(page, /\/api\/v1\/auth$/, async () => {
      await page.getByLabel(/username/i).fill('admin');
      await page.getByLabel(/password/i).fill('adminpass');
      await page.getByTestId('login-submit').click();
      await page.waitForURL((u) => !u.pathname.endsWith('/login'));
    });
    expect(calls.length).toBeGreaterThan(0);
    const auth = calls.find((c) => c.method === 'POST');
    expect(auth, 'POST /api/v1/auth was issued').toBeTruthy();
    expect(auth!.postData).toBe(
      JSON.stringify({ type: 'normal', username: 'admin', password: 'adminpass' }),
    );
  });

  test('lists my projects with the correct API call', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);

    const { calls } = await trackedRequests(page, /\/api\/v1\/projects(?:\?|$)/, async () => {
      await page.goto('/projects/');
      await page.getByTestId('projects-listing').waitFor();
    });
    expect(calls.find((c) => c.url.includes('member='))).toBeTruthy();
    expect(calls.find((c) => c.url.includes('order_by=user_order'))).toBeTruthy();
    expect(calls.find((c) => c.url.includes('slight=true'))).toBeTruthy();

    const items = page.getByTestId('projects-list').locator('li');
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);
  });

  test('opens a project shell with the expected sidebar entries', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/project/project-1/timeline');
    await expect(page.getByTestId('project-sidebar')).toBeVisible();
    for (const label of ['Timeline', 'Backlog', 'Kanban', 'Issues', 'Team', 'Admin']) {
      await expect(page.getByTestId('project-sidebar').getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('renders the kanban board with the project statuses', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/project/project-1/kanban');
    await expect(page.getByTestId('kanban')).toBeVisible();
    const cols = page.locator('[data-testid^="kanban-col-"]');
    expect(await cols.count()).toBeGreaterThan(0);
  });

  test('renders backlog stories from the API', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/project/project-1/backlog');
    await expect(page.getByTestId('backlog')).toBeVisible();
  });

  test('renders the issues table with status pills', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/project/project-1/issues');
    await expect(page.getByTestId('issues')).toBeVisible();
    const rows = page.locator('[data-testid^="issue-row-"]');
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('opens a user story detail page', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/project/project-1/us/1');
    await expect(page.getByTestId('item-detail-userstory')).toBeVisible();
  });

  test('admin sub-section navigation works', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/project/project-1/admin/project-profile/details');
    await expect(page.getByTestId('admin-details')).toBeVisible();
    await page.goto('/project/project-1/admin/project-values/status');
    await expect(page.getByTestId('admin-status')).toBeVisible();
    await page.goto('/project/project-1/admin/memberships');
    await expect(page.getByTestId('admin-memberships')).toBeVisible();
  });

  test('shows team members for the current project', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/project/project-1/team');
    await expect(page.getByTestId('team-table')).toBeVisible();
  });

  test('signs out returns to the login screen', async ({ page, request }) => {
    await loginViaApi(page, 'react', request);
    await page.goto('/');
    await page.getByTestId('logout-button').click();
    await page.waitForURL(/\/login$/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});
