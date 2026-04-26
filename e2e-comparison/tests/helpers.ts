import { type APIRequestContext, type Page, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://127.0.0.1:9000';

export async function apiToken(
  request: APIRequestContext,
  username = 'admin',
  password = 'adminpass',
): Promise<string> {
  const res = await request.post(`${API_BASE}/api/v1/auth`, {
    data: { type: 'normal', username, password },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) throw new Error(`auth failed: ${res.status()}`);
  const body = await res.json();
  return body.auth_token as string;
}

/** Seed a logged-in session the same way the reference web-react e2e helpers do. */
export async function loginAsAdmin(page: Page, app: 'angular' | 'react', request: APIRequestContext) {
  const res = await request.post(`${API_BASE}/api/v1/auth`, {
    data: { type: 'normal', username: 'admin', password: 'adminpass' },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.ok(), 'auth must succeed').toBeTruthy();
  const user = await res.json();
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

export async function gotoAngularReady(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);
  await expect(page.locator('body')).toBeVisible();
}
