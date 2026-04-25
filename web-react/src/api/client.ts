import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth';
import type { TaigaConfig } from '../types';

let _config: TaigaConfig | null = null;

export async function loadConfig(): Promise<TaigaConfig> {
  if (_config) return _config;
  const res = await axios.get<TaigaConfig>('/conf.json');
  _config = res.data;
  return _config;
}

export function getConfig(): TaigaConfig | null {
  return _config;
}

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

let _sessionId: string | null = null;
function sessionId() {
  if (!_sessionId) {
    _sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  return _sessionId;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Session-Id'] = sessionId();
  const lang = _config?.defaultLanguage || 'en';
  config.headers['Accept-Language'] = lang;
  if (!config.baseURL && _config?.api) {
    config.baseURL = _config.api;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = useAuthStore.getState().refresh;
      if (refresh) {
        try {
          const res = await axios.post((_config?.api || '/api/v1/') + 'auth/refresh', {
            refresh,
          });
          const newToken = res.data.auth_token;
          const newRefresh = res.data.refresh;
          useAuthStore.getState().setTokens(newToken, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
