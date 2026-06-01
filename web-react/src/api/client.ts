// Typed HTTP client with auth header injection and token refresh.
// Mirrors $tgHttp from base/http.coffee + the 401-interceptor from app.coffee.

import { useAuthStore } from '../auth/store';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    public headers: Headers,
  ) {
    super(`API Error ${status}`);
    this.name = 'ApiError';
  }
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] => entry[1] !== undefined,
  );
  if (entries.length === 0) return '';
  const qs = new URLSearchParams();
  for (const [k, v] of entries) qs.append(k, String(v));
  return `?${qs.toString()}`;
}

let refreshPromise: Promise<void> | null = null;

async function refreshToken(): Promise<void> {
  const store = useAuthStore.getState();
  const refreshTok = store.refreshToken;
  if (!refreshTok) {
    store.logout();
    throw new ApiError(401, { detail: 'No refresh token' }, new Headers());
  }
  const resp = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshTok }),
  });
  if (!resp.ok) {
    store.logout();
    throw new ApiError(resp.status, await resp.json().catch(() => null), resp.headers);
  }
  const data = await resp.json();
  store.setToken(data.auth_token);
  if (data.refresh) store.setRefreshToken(data.refresh);
}

async function request<T>(method: HttpMethod, url: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, body, headers: extraHeaders, ...rest } = opts;

  const fullUrl = params ? `${url}${buildQueryString(params)}` : url;

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {
      'Accept-Language': localStorage.getItem('taiga-lang') || 'en',
      'X-Session-Id': sessionStorage.getItem('taiga-session-id') || '',
    };
    if (body !== undefined && !(body instanceof FormData)) {
      h['Content-Type'] = 'application/json';
    }
    const token = useAuthStore.getState().token;
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (extraHeaders) {
      const eh = extraHeaders instanceof Headers
        ? Object.fromEntries(extraHeaders.entries())
        : (extraHeaders as Record<string, string>);
      Object.assign(h, eh);
    }
    return h;
  };

  const doFetch = async (): Promise<Response> => {
    const fetchBody = body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined;
    return fetch(fullUrl, {
      method,
      headers: buildHeaders(),
      body: fetchBody,
      ...rest,
    });
  };

  let resp = await doFetch();

  // 401 → attempt token refresh once, then retry
  if (resp.status === 401 && useAuthStore.getState().token) {
    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
    resp = await doFetch();
  }

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => null);
    throw new ApiError(resp.status, errorData, resp.headers);
  }

  // 204 No Content
  if (resp.status === 204) {
    return { data: undefined as T, status: resp.status, headers: resp.headers };
  }

  const contentType = resp.headers.get('content-type') || '';
  const data: T = contentType.includes('application/json')
    ? await resp.json()
    : (await resp.text()) as T;

  return { data, status: resp.status, headers: resp.headers };
}

export const apiClient = {
  get: <T = unknown>(url: string, opts?: RequestOptions) => request<T>('GET', url, opts),
  post: <T = unknown>(url: string, opts?: RequestOptions) => request<T>('POST', url, opts),
  put: <T = unknown>(url: string, opts?: RequestOptions) => request<T>('PUT', url, opts),
  patch: <T = unknown>(url: string, opts?: RequestOptions) => request<T>('PATCH', url, opts),
  delete: <T = unknown>(url: string, opts?: RequestOptions) => request<T>('DELETE', url, opts),
};
