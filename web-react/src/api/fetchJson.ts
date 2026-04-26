import { getApiBase } from './config';
import { useSessionStore } from '../stores/sessionStore';

export type PaginatedHeaders = {
  count: number;
  current: number;
  paginatedBy: number;
};

function readPaginationHeaders(h: Headers): PaginatedHeaders {
  return {
    count: parseInt(h.get('x-pagination-count') ?? '0', 10) || 0,
    current: parseInt(h.get('x-pagination-current') ?? '1', 10) || 1,
    paginatedBy: parseInt(h.get('x-paginated-by') ?? '0', 10) || 0,
  };
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBase().replace(/\/$/, '');
  const pathPart = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const url =
    path.startsWith('http') ? pathPart : new URL(pathPart, window.location.origin).toString();
  const token = useSessionStore.getState().token;
  const headers = new Headers(init?.headers ?? undefined);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...init, headers, credentials: init?.credentials ?? 'include' });
}

function buildPathWithQuery(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!params || Object.keys(params).length === 0) return p;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${p}?${qs}` : p;
}

export async function apiGetJson<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const pathWithQuery = buildPathWithQuery(path, params);
  const headers = extraHeaders ? new Headers(extraHeaders) : undefined;
  const r = await apiFetch(pathWithQuery, headers ? { headers } : undefined);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

export async function apiGetJsonPaginated<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<{ data: T; pagination: PaginatedHeaders }> {
  const pathWithQuery = buildPathWithQuery(path, params);
  const r = await apiFetch(pathWithQuery);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  const data = (await r.json()) as T;
  return { data, pagination: readPaginationHeaders(r.headers) };
}
