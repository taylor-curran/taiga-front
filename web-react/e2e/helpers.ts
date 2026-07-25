import type { APIRequestContext, Page } from '@playwright/test';

export const ADMIN_USER = process.env.TAIGA_ADMIN_USER || 'admin';
export const ADMIN_PASS = process.env.TAIGA_ADMIN_PASS || 'adminpass';
export const GATEWAY = process.env.TAIGA_GATEWAY || 'http://localhost:9000';
export const REACT_BASE = process.env.BASE_URL || 'http://localhost:5173';

export async function loginViaUi(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/username or email/i).fill(ADMIN_USER);
  await page.getByLabel(/password/i).fill(ADMIN_PASS);
  await page.getByTestId('login-submit').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

export async function loginViaApi(page: Page) {
  // Hits the API directly through the page so cookies/localStorage are set on
  // the right origin, then loads the React app in a logged-in state.
  await page.goto('/login');
  const tokenData = await page.evaluate(
    async ({ user, pass }) => {
      const r = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'normal', username: user, password: pass }),
      });
      return r.json();
    },
    { user: ADMIN_USER, pass: ADMIN_PASS }
  );
  await page.evaluate(
    ({ token, refresh, info }) => {
      localStorage.setItem('token', JSON.stringify(token));
      if (refresh) localStorage.setItem('refresh', JSON.stringify(refresh));
      localStorage.setItem('userInfo', JSON.stringify(info));
    },
    { token: tokenData.auth_token, refresh: tokenData.refresh, info: tokenData }
  );
  await page.goto('/');
}

export async function authedRequest(req: APIRequestContext, base = REACT_BASE) {
  const tok = await req.post(`${base}/api/v1/auth`, {
    data: { type: 'normal', username: ADMIN_USER, password: ADMIN_PASS },
  });
  const data = await tok.json();
  return data.auth_token as string;
}

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Session-Id': 'pw-session',
  };
}
