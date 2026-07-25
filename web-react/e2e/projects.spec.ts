import { expect, test } from '@playwright/test';
import { authHeaders, authedRequest, loginViaApi } from './helpers';

test.describe('projects landing', () => {
  test('lists seeded sample projects', async ({ page, request }) => {
    const token = await authedRequest(request);
    const me = await request.get('/api/v1/users/me', { headers: authHeaders(token) });
    const meBody = await me.json();
    const seed = await request.get(`/api/v1/projects?member=${meBody.id}`, { headers: authHeaders(token) });
    expect(seed.status()).toBe(200);
    const data = await seed.json();
    expect(Array.isArray(data)).toBe(true);

    await loginViaApi(page);
    await page.goto('/projects/');
    await expect(page.getByTestId('projects-listing')).toBeVisible();
    const items = page.locator('[data-testid="projects-list"] li');
    await expect(items).toHaveCount(data.length);
  });

  test('opens a project from the list and routes to a working section', async ({ page }) => {
    await loginViaApi(page);
    await page.goto('/projects/');
    const first = page.locator('[data-testid="projects-list"] a').first();
    await first.click();
    await page.waitForURL(/\/project\/[^/]+\/(timeline|backlog|kanban|issues|wiki|epics)/);
    await expect(page.getByTestId('project-shell')).toBeVisible();
  });
});

test.describe('project navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page);
  });

  test('backlog page renders sprints + stories', async ({ page }) => {
    await page.goto('/project/project-1/backlog');
    await expect(page.getByTestId('backlog')).toBeVisible();
    await expect(page.getByText(/Sprints/i).first()).toBeVisible();
  });

  test('kanban page renders columns based on us_statuses', async ({ page }) => {
    await page.goto('/project/project-1/kanban');
    await expect(page.getByTestId('kanban')).toBeVisible();
    await expect(page.locator('[data-testid^="kanban-col-"]').first()).toBeVisible();
  });

  test('issues page lists rows', async ({ page }) => {
    await page.goto('/project/project-1/issues');
    await expect(page.getByTestId('issues')).toBeVisible();
    await expect(page.getByTestId('issues-table')).toBeVisible();
  });

  test('team page lists memberships', async ({ page }) => {
    await page.goto('/project/project-1/team');
    await expect(page.getByTestId('team')).toBeVisible();
  });

  test('wiki home page is reachable', async ({ page }) => {
    await page.goto('/project/project-1/wiki/home');
    await expect(page.getByTestId('wiki')).toBeVisible();
  });

  test('admin layout is reachable', async ({ page }) => {
    await page.goto('/project/project-1/admin/project-profile/details');
    await expect(page.getByTestId('admin')).toBeVisible();
  });
});
