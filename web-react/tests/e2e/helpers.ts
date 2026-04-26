import { type APIRequestContext, type Page, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9000';

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

export async function loginViaUI(page: Page, username = 'admin', password = 'adminpass') {
  await page.goto('/login');
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(?!login).*/);
}

export async function trackedRequests<T>(
  page: Page,
  pattern: RegExp,
  fn: () => Promise<T>,
): Promise<{ result: T; calls: Array<{ url: string; method: string; postData: string | null }> }> {
  const calls: Array<{ url: string; method: string; postData: string | null }> = [];
  const handler = (req: import('@playwright/test').Request) => {
    if (pattern.test(req.url())) {
      calls.push({ url: req.url(), method: req.method(), postData: req.postData() });
    }
  };
  page.on('request', handler);
  try {
    const result = await fn();
    return { result, calls };
  } finally {
    page.off('request', handler);
  }
}

export async function loginViaApi(
  page: Page,
  app: 'react' | 'angular',
  request: APIRequestContext,
) {
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
