// Axios client + auth interceptor + token refresh.
// Mirrors `app/coffee/modules/base/http.coffee` and `tgAuth`.

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { getConfig } from './config';
import { SESSION_KEYS, storage } from './storage';

let _refreshing: Promise<string | null> | null = null;

function getAccessToken(): string | null {
  return storage.get<string>(SESSION_KEYS.token);
}

function getRefreshToken(): string | null {
  return storage.get<string>(SESSION_KEYS.refresh);
}

function setTokens(access: string | null, refresh?: string | null): void {
  if (access) {
    storage.set(SESSION_KEYS.token, access);
  } else {
    storage.remove(SESSION_KEYS.token);
  }
  if (refresh !== undefined) {
    if (refresh) {
      storage.set(SESSION_KEYS.refresh, refresh);
    } else {
      storage.remove(SESSION_KEYS.refresh);
    }
  }
}

function clearSession(): void {
  storage.remove(SESSION_KEYS.token);
  storage.remove(SESSION_KEYS.refresh);
  storage.remove(SESSION_KEYS.user);
}

function joinUrl(base: string, path: string): string {
  if (/^https?:/i.test(path)) return path;
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const cfg = getConfig();
  try {
    const res = await axios.post(joinUrl(cfg.api, 'auth/refresh'), { refresh });
    const next = res.data?.auth_token ?? res.data?.token ?? null;
    if (next) {
      setTokens(next);
      return next;
    }
  } catch {
    // refresh failed; caller will clear session
  }
  return null;
}

export const api: AxiosInstance = axios.create({
  // We point axios at the runtime config's `api` URL. We rebuild baseURL on
  // each request so the value picked up after `loadConfig()` is honored even
  // if the instance was created earlier.
  baseURL: '/api/v1/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-disable-pagination': '1',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getConfig().api;
  const token = getAccessToken();
  if (token) {
    config.headers.set?.('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as
      | (AxiosRequestConfig & { _retried?: boolean })
      | undefined;

    if (status === 401 && original && !original._retried && getRefreshToken()) {
      original._retried = true;
      _refreshing = _refreshing ?? refreshAccessToken();
      const next = await _refreshing;
      _refreshing = null;
      if (next) {
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${next}`,
        };
        return api.request(original);
      }
      clearSession();
      // Notify the rest of the app the session ended.
      window.dispatchEvent(new CustomEvent('taiga:logout'));
    }

    return Promise.reject(error);
  },
);

export const auth = {
  setTokens,
  clearSession,
  getAccessToken,
  getRefreshToken,
};
