import { getConfigSync } from './config';
import { storage } from './storage';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  raw?: boolean;
  signal?: AbortSignal;
}

type AuthHandler = {
  onUnauthorized: (() => void) | null;
};

const handlers: AuthHandler = { onUnauthorized: null };

export function setUnauthorizedHandler(fn: () => void) {
  handlers.onUnauthorized = fn;
}

export function getApiBase(): string {
  const cfg = getConfigSync();
  return cfg.api.replace(/\/$/, '');
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = getApiBase();
  const isAbs = /^https?:/.test(path);
  let url = isAbs ? path : `${base}/${path.replace(/^\//, '')}`;
  if (query) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      usp.append(k, String(v));
    }
    const qs = usp.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  return url;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...opts.headers,
  };
  const token = storage.get<string>('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body;
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      body = JSON.stringify(opts.body);
    }
  }
  const url = buildUrl(path, opts.query);
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body,
    signal: opts.signal,
    credentials: 'omit',
  });
  if (res.status === 204) return undefined as T;
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    if (res.status === 401 && handlers.onUnauthorized) {
      handlers.onUnauthorized();
    }
    const message =
      (data && typeof data === 'object' && '_error_message' in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>)._error_message)
        : '') || `HTTP ${res.status}`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(p: string, o: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(p, { ...o, method: 'GET' }),
  post: <T = unknown>(p: string, body?: unknown, o: Omit<RequestOptions, 'method'> = {}) =>
    apiFetch<T>(p, { ...o, method: 'POST', body }),
  patch: <T = unknown>(p: string, body?: unknown, o: Omit<RequestOptions, 'method'> = {}) =>
    apiFetch<T>(p, { ...o, method: 'PATCH', body }),
  put: <T = unknown>(p: string, body?: unknown, o: Omit<RequestOptions, 'method'> = {}) =>
    apiFetch<T>(p, { ...o, method: 'PUT', body }),
  delete: <T = unknown>(p: string, o: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiFetch<T>(p, { ...o, method: 'DELETE' }),
};
