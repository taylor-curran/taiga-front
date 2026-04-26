import { expect, type APIRequestContext, type Page } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9000';

export async function loginWithUi(page: Page, app: 'angular' | 'react') {
  await page.goto('/login');

  if (app === 'angular') {
    await page.locator('form.login-form input[name="username"]').fill('admin');
    await page.locator('form.login-form input[name="password"]').fill('adminpass');
    await page.locator('form.login-form button[type="submit"]').click();
  } else {
    await page.getByLabel(/username/i).first().fill('admin');
    await page.getByLabel(/password/i).first().fill('adminpass');
    await page.getByRole('button', { name: /sign in/i }).first().click();
  }

  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 30_000 });
}

export async function authToken(request: APIRequestContext) {
  const response = await request.post(`${API_BASE}/api/v1/auth`, {
    data: { type: 'normal', username: 'admin', password: 'adminpass' },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body.auth_token as string;
}

export async function seedBrowserSession(page: Page, app: 'angular' | 'react', request: APIRequestContext) {
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
