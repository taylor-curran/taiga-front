import { getOrCreateSessionId } from '../lib/session';
import { getConf } from '../lib/conf';
import type { User } from './authStore';
import { getStoredRefresh, getStoredToken, useAuthStore } from './authStore';

type RequestOptions = RequestInit & { skipAuth?: boolean; _retry?: boolean };

function apiRoot(): string {
  const c = getConf();
  if (!c?.api) throw new Error('conf not loaded');
  return c.api.replace(/\/+$/, '');
}

function defaultLang(): string {
  return getConf()?.defaultLanguage || 'en';
}

async function refreshTokens(): Promise<{ auth_token: string; refresh: string }> {
  const refresh = getStoredRefresh();
  if (!refresh) throw new Error('no refresh');
  const url = `${apiRoot()}/auth/refresh`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': defaultLang(),
      'X-Session-Id': getOrCreateSessionId(),
    },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) throw new Error('refresh failed');
  return (await res.json()) as { auth_token: string; refresh: string };
}

/** Fetch against Taiga API (proxied as /api/v1/... in dev). */
export async function apiFetch(path: string, opts: RequestOptions = {}): Promise<Response> {
  const root = apiRoot();
  const url = path.startsWith('http') ? path : `${root}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(opts.headers);
  if (!opts.skipAuth) {
    const t = useAuthStore.getState().token ?? getStoredToken();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }
  if (!headers.has('Content-Type') && opts.body && !(opts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept-Language')) headers.set('Accept-Language', defaultLang());
  headers.set('X-Session-Id', getOrCreateSessionId());

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401 && !opts.skipAuth && !opts._retry && !url.includes('/auth/refresh')) {
    try {
      const tokens = await refreshTokens();
      try {
        localStorage.setItem('token', JSON.stringify(tokens.auth_token));
        localStorage.setItem('refresh', JSON.stringify(tokens.refresh));
      } catch {
        /* ignore */
      }
      useAuthStore.setState((s) => ({
        ...s,
        token: tokens.auth_token,
        refresh: tokens.refresh,
        user: s.user ? { ...s.user, auth_token: tokens.auth_token, refresh: tokens.refresh } : s.user,
      }));
      return apiFetch(path, { ...opts, _retry: true });
    } catch {
      useAuthStore.getState().clearSession();
      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      window.location.assign(`/login?unauthorized=true&next=${next}`);
      return res;
    }
  }

  return res;
}

export async function loginRequest(username: string, password: string): Promise<User> {
  const loginType = getConf()?.loginFormType || 'normal';
  const res = await apiFetch('/auth', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password, type: loginType }),
  });
  const data = (await res.json().catch(() => ({}))) as User & { detail?: string };
  if (!res.ok) throw new Error('auth_failed');
  return data as User;
}

export type Project = {
  id: number;
  slug: string;
  name: string;
  i_am_admin: boolean;
  my_permissions: string[];
  [k: string]: unknown;
};

export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const res = await apiFetch(`/projects/by_slug?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`project_${res.status}`);
  return (await res.json()) as Project;
}
