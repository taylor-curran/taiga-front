import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { apiBase, getConfig } from './config';
import { sessionId } from './sessionId';
import { storage } from './storage';

let client: AxiosInstance | null = null;
let refreshing: Promise<string | null> | null = null;

export interface AuthTokens {
  auth_token: string;
  refresh: string;
}

function makeClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: apiBase(),
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': getConfig()?.defaultLanguage || 'en',
      'X-Session-Id': sessionId,
    },
    // Important: AngularJS sets credentials only via the Authorization header.
    withCredentials: false,
  });

  instance.interceptors.request.use((config) => {
    const token = storage.get<string>('token');
    if (token) {
      config.headers.set?.('Authorization', `Bearer ${token}`);
      // Ensure typed-set works in axios v1
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    config.headers['X-Session-Id'] = sessionId;
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    async (err: AxiosError) => {
      const cfg = err.config as AxiosRequestConfig & { _retry?: boolean };
      if (!err.response) return Promise.reject(err);
      const status = err.response.status;
      const url = (cfg?.url || '') as string;
      if (url.includes('/auth/refresh')) return Promise.reject(err);
      if (status === 401 && !cfg._retry && !window.location.pathname.includes('/login')) {
        cfg._retry = true;
        const refreshToken = storage.get<string>('refresh');
        if (!refreshToken) {
          storage.remove('token');
          storage.remove('userInfo');
          // Bounce to login, preserving next URL.
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?unauthorized=true&next=${next}`;
          return Promise.reject(err);
        }
        try {
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            cfg.headers = cfg.headers || {};
            (cfg.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            return instance.request(cfg);
          }
        } catch {
          storage.remove('token');
          storage.remove('refresh');
          storage.remove('userInfo');
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?unauthorized=true&next=${next}`;
          return Promise.reject(err);
        }
      }
      return Promise.reject(err);
    }
  );

  return instance;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await axios.post<AuthTokens>(`${apiBase()}auth/refresh`, {
        refresh: refreshToken,
      });
      storage.set('token', res.data.auth_token);
      storage.set('refresh', res.data.refresh);
      return res.data.auth_token;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export function api(): AxiosInstance {
  if (!client) client = makeClient();
  return client;
}

export function resetApi(): void {
  client = null;
}

export interface ApiError {
  status: number;
  data?: { _error_message?: string; _error_type?: string; [k: string]: unknown };
}

export function apiError(err: unknown): ApiError {
  const ax = err as AxiosError<{ _error_message?: string; _error_type?: string }>;
  return {
    status: ax?.response?.status ?? 0,
    data: ax?.response?.data ?? undefined,
  };
}
