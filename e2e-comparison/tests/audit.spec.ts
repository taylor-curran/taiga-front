import { expect, test } from '@playwright/test';

type AppKind = 'angular' | 'react';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9000';

async function loginViaApi(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext, app: AppKind) {
  const response = await request.post(`${API_BASE}/api/v1/auth`, {
    data: { type: 'normal', username: 'admin', password: 'adminpass' },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const user = await response.json();

  if (app === 'react') {
    await page.goto('/login');
    await page.evaluate(
      ([u, t, r]) => {
        localStorage.setItem('taiga.userInfo', JSON.stringify(u));
        localStorage.setItem('taiga.token', JSON.stringify(t));
        localStorage.setItem('taiga.refresh', JSON.stringify(r));
      },
      [user, user.auth_token, user.refresh],
    );
  } else {
    await page.goto('/');
    await page.evaluate(
      ([u, t, r]) => {
        localStorage.setItem('userInfo', JSON.stringify(u));
        localStorage.setItem('token', JSON.stringify(t));
        localStorage.setItem('refresh', JSON.stringify(r));
      },
      [user, user.auth_token, user.refresh],
    );
  }
}

async function openProjectAdmin(page: import('@playwright/test').Page) {
  await page.goto('/project/project-1/admin/third-parties/webhooks');
  await page.waitForLoadState('networkidle');
}

test.describe('migration audit: angular behavior assertions', () => {
  test('admin webhooks page offers a way to add a webhook', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await openProjectAdmin(page);
    await page.screenshot({ path: `artifacts/${app}-webhooks-page.png`, fullPage: true });
    const addButton = page.locator('button.add-webhook');
    await expect(addButton).toHaveCount(1);
    await expect(addButton).toContainText(/add .* webhook/i);
  });

  test('admin github integration page includes editable secret key form', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await page.goto('/project/project-1/admin/third-parties/github');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `artifacts/${app}-github-admin-page.png`, fullPage: true });
    const secretInput = page.locator('input#secret-key');
    await expect(secretInput).toHaveCount(1);
    await expect(secretInput).toBeEditable();
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  });
});
