import type { APIRequestContext, Page } from '@playwright/test';

const proxyInstalled = new WeakSet<Page>();

const API = process.env.TAIGA_API_URL ?? 'http://127.0.0.1:9000/api/v1';

export type AuthCreds = { username: string; password: string };

export type AuthTokens = { auth_token: string; refresh: string };

export async function fetchAuthTokens(request: APIRequestContext, creds: AuthCreds = { username: 'admin', password: 'adminpass' }): Promise<AuthTokens> {
  const res = await request.post(`${API}/auth`, {
    data: { type: 'normal', username: creds.username, password: creds.password },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });
  if (!res.ok()) {
    throw new Error(`Auth failed: ${res.status()} ${await res.text()}`);
  }
  const body = (await res.json()) as { auth_token?: string; refresh?: string };
  if (!body.auth_token || !body.refresh) {
    throw new Error('No auth_token or refresh in auth response');
  }
  return { auth_token: body.auth_token, refresh: body.refresh };
}

/** Angular `$tgStorage` JSON-stringifies values; `localStorage.token` must parse as a JSON string. */
export async function primeAngularAuth(page: Page, tokens: AuthTokens) {
  await page.addInitScript((pair) => {
    window.localStorage.setItem('token', JSON.stringify(pair.auth_token));
    window.localStorage.setItem('refresh', JSON.stringify(pair.refresh));
  }, tokens);
}

export async function primeAngularUserInfo(page: Page, tokens: AuthTokens) {
  const res = await page.context().request.get(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${tokens.auth_token}`, Accept: 'application/json' },
  });
  if (!res.ok()) {
    throw new Error(`users/me failed: ${res.status()}`);
  }
  const user = (await res.json()) as Record<string, unknown>;
  // `tgAuth.setUser` stores `user.getAttrs()` which includes `auth_token` on the model after login.
  const withToken = { ...user, auth_token: tokens.auth_token };
  await page.addInitScript(
    ([pair, u]) => {
      window.localStorage.setItem('token', JSON.stringify(pair.auth_token));
      window.localStorage.setItem('refresh', JSON.stringify(pair.refresh));
      window.localStorage.setItem('userInfo', JSON.stringify(u));
    },
    [tokens, withToken] as const,
  );
}

/**
 * Rewrite `/api/...` calls from the React dev origin to the real Taiga API so Vite's default proxy (:3000) is not required.
 */
export async function installApiProxyToTaiga(page: Page, reactOrigin: string, apiOrigin: string) {
  if (proxyInstalled.has(page)) {
    return;
  }
  proxyInstalled.add(page);
  const from = new URL(reactOrigin).origin;
  const to = new URL(apiOrigin).origin;
  // Must not match Vite source URLs like `/src/api/foo.ts` (glob `**/api/**` would).
  await page.route(
    (url) => {
      try {
        const u = new URL(url);
        return u.origin === from && u.pathname.startsWith('/api/');
      } catch {
        return false;
      }
    },
    async (route) => {
      const req = route.request();
      const u = new URL(req.url());
      const target = `${to}${u.pathname}${u.search}`;
      try {
        const upstream = await route.fetch({ url: target });
        const pathname = u.pathname;
        const isMembershipsList =
          req.method() === 'GET' && (pathname === '/api/v1/memberships' || pathname.endsWith('/api/v1/memberships'));

        if (isMembershipsList) {
          const ct = (upstream.headers()['content-type'] || '').toLowerCase();
          if (ct.includes('json')) {
            try {
              const parsed = JSON.parse((await upstream.body()).toString()) as unknown;
              if (Array.isArray(parsed)) {
                const pageNum = Math.max(1, parseInt(u.searchParams.get('page') || '1', 10) || 1);
                const wrapped = JSON.stringify({
                  models: parsed,
                  count: parsed.length,
                  current: pageNum,
                  paginatedBy: parsed.length,
                });
                await route.fulfill({
                  status: upstream.status(),
                  headers: { ...upstream.headers(), 'content-type': 'application/json' },
                  body: wrapped,
                });
                return;
              }
            } catch {
              // fall through
            }
          }
        }

        await route.fulfill({ response: upstream });
      } catch {
        try {
          await route.abort('failed');
        } catch {
          /* ignore */
        }
      }
    },
  );
}
