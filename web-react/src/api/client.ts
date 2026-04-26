import type { TaigaConfig } from './types';
import { getTaigaSessionId } from '../lib/taigaSession';
import { storageGet } from '../lib/storage';

export function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  if (!b) return `/${p}`;
  return `${b}/${p}`;
}

export function buildApiUrl(config: TaigaConfig, resourcePath: string): string {
  const root = config.api || '/api/v1/';
  const rel = resourcePath.replace(/^\/+/, '');
  if (/^https?:\/\//i.test(root)) {
    return joinUrl(root, rel);
  }
  return joinUrl(root, rel);
}

export type TaigaFetchInit = RequestInit & { skipAuth?: boolean };

export async function taigaFetch(
  config: TaigaConfig,
  resourcePath: string,
  init: TaigaFetchInit = {},
): Promise<Response> {
  const url = buildApiUrl(config, resourcePath);
  const headers = new Headers(init.headers);
  const lang = config.defaultLanguage || 'en';
  if (!headers.has('Accept-Language')) {
    headers.set('Accept-Language', lang);
  }
  if (!headers.has('X-Session-Id')) {
    headers.set('X-Session-Id', getTaigaSessionId());
  }
  if (!init.skipAuth) {
    const token = storageGet<string>('token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers });
}
