import type { APIRequestContext, Page } from '@playwright/test';

const DEFAULT_API = process.env.TAIGA_API_URL ?? 'http://127.0.0.1:9000/api/v1';

type AuthBody = Record<string, unknown> & { auth_token?: string; refresh?: string };

/**
 * Writes Taiga Angular client storage (`$tgStorage`) after a same-origin navigation so the
 * reference app picks up the session (init scripts alone were not reliable with the app-loader).
 */
export async function seedAngularAuthFromApi(
  page: Page,
  request: APIRequestContext,
  creds: { username: string; password: string } = { username: 'admin', password: 'adminpass' },
): Promise<boolean> {
  const res = await request.post(`${DEFAULT_API.replace(/\/$/, '')}/auth`, {
    data: { type: 'normal', username: creds.username, password: creds.password },
    headers: { 'Content-Type': 'application/json' },
    failOnStatusCode: false,
  });
  if (!res.ok()) {
    return false;
  }
  const body = (await res.json()) as AuthBody;
  const token = body.auth_token;
  if (!token || typeof token !== 'string') {
    return false;
  }
  const refresh = typeof body.refresh === 'string' ? body.refresh : '';
  const userInfo = { ...body };
  delete userInfo.auth_token;
  delete userInfo.refresh;

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ token: t, refresh: rf, userInfo: u }) => {
      // Mirror `$tgStorage.set`: values are always JSON.stringify'd (strings included).
      localStorage.setItem('token', JSON.stringify(t));
      if (rf) localStorage.setItem('refresh', JSON.stringify(rf));
      localStorage.setItem('userInfo', JSON.stringify(u));
    },
    { token, refresh, userInfo },
  );
  // First paint may have bootstrapped without a session; reload so Angular reads storage.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  return true;
}
