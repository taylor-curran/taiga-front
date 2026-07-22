import { expect, test } from '@playwright/test';
import { loginViaApi, trackedRequests } from './helpers';

test.describe('angular reference parity', () => {
  test('signs in via the login form and lands on the home page', async ({ page }) => {
    await page.goto('/login');
    const { calls } = await trackedRequests(page, /\/api\/v1\/auth$/, async () => {
      await page.locator('form.login-form input[name=username]').fill('admin');
      await page.locator('form.login-form input[name=password]').fill('adminpass');
      await page.locator('form.login-form button[type=submit]').click();
      await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 30_000 });
    });
    const auth = calls.find((c) => c.method === 'POST');
    expect(auth, 'POST /api/v1/auth was issued').toBeTruthy();
    const body = JSON.parse(auth!.postData ?? '{}');
    expect(body.type).toBe('normal');
    expect(body.username).toBe('admin');
    expect(body.password).toBe('adminpass');
  });

  test('lists my projects with the correct API call', async ({ page, request }) => {
    await loginViaApi(page, 'angular', request);
    const { calls } = await trackedRequests(page, /\/api\/v1\/projects(?:\?|$)/, async () => {
      await page.goto('/projects/');
      await page.waitForLoadState('networkidle');
    });
    expect(calls.find((c) => c.url.includes('member='))).toBeTruthy();
    expect(calls.find((c) => c.url.includes('order_by=user_order'))).toBeTruthy();
    expect(calls.find((c) => c.url.includes('slight=true'))).toBeTruthy();
    await expect(page.locator('.list-itemtype-project').first()).toBeVisible();
  });

  test('opens a project shell with the expected sidebar entries', async ({ page, request }) => {
    await loginViaApi(page, 'angular', request);
    await page.goto('/project/project-1/timeline');
    await page.waitForLoadState('networkidle');
    // Angular reference renders project menu via a Lit element <tg-project-navigation>
    await expect(page.locator('tg-project-navigation, .sticky-project-menu').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('renders the kanban board page', async ({ page, request }) => {
    await loginViaApi(page, 'angular', request);
    await page.goto('/project/project-1/kanban');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.kanban-table, [class*=kanban]').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('renders the backlog page', async ({ page, request }) => {
    await loginViaApi(page, 'angular', request);
    await page.goto('/project/project-1/backlog');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.backlog, [class*=backlog]').first()).toBeVisible({ timeout: 20_000 });
  });

  test('renders the issues page', async ({ page, request }) => {
    await loginViaApi(page, 'angular', request);
    await page.goto('/project/project-1/issues');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.issues, [class*=issue]').first()).toBeVisible({ timeout: 20_000 });
  });
});
