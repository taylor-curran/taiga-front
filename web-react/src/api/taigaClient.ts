import { getAuthHeader } from './authStorage';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

export type TaigaGetOptions = {
  /** e.g. `x-disable-pagination` for full project / epic lists (matches Angular) */
  headers?: Record<string, string>;
};

/**
 * `fetch` to same-origin `/api/v1/...` (Vite → json-server or Taiga on :3000).
 */
export async function taigaGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>, options?: TaigaGetOptions): Promise<T> {
  const u = new URL(path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined) continue;
      u.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(u.toString(), {
    method: 'GET',
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeader(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${u.pathname}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
