import { loadFixtureDb } from './mockDb';
import { tryMockResponse } from './mockResponses';

let installed = false;

export function installFixtureApiInterceptor(): void {
  if (installed) return;
  installed = true;
  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (!import.meta.env.VITE_USE_DB_JSON || !url.includes('/api/v1')) {
      return orig(input as RequestInfo, init);
    }
    try {
      const db = await loadFixtureDb();
      const u = new URL(url, window.location.origin);
      const mock = await tryMockResponse(`${u.pathname}${u.search}`, db);
      if (mock) return mock;
    } catch {
      /* fall through */
    }
    return orig(input as RequestInfo, init);
  };
}
