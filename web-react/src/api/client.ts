/**
 * HTTP client for the Taiga REST API.
 *
 * Wraps axios and provides:
 *  - Bearer-token auth header injection
 *  - Token refresh on 401 (mirrors `authHttpIntercept` in app/coffee/app.coffee)
 *  - Optional X-Disable-Pagination / X-Lazy-Pagination header helpers
 *
 * Storage of tokens lives in `tokenStorage` to keep the auth context
 * decoupled from the HTTP layer.
 */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "./token-storage";

declare global {
  interface Window {
    taigaConfig?: {
      api?: string;
      eventsUrl?: string;
      defaultLanguage?: string;
      [key: string]: unknown;
    };
  }
}

const DEFAULT_API_BASE = "https://api.taiga.io/api/v1";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const fromConfig = window.taigaConfig?.api;
    if (typeof fromConfig === "string" && fromConfig.length > 0) {
      return fromConfig.replace(/\/$/, "");
    }
  }
  const envBase = (import.meta as ImportMeta & { env?: Record<string, string> })
    .env?.VITE_API_URL;
  if (envBase) {
    return envBase.replace(/\/$/, "");
  }
  return DEFAULT_API_BASE;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(client: AxiosInstance): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  if (!refreshInFlight) {
    refreshInFlight = client
      .post<{ auth_token: string; refresh: string }>("/auth/refresh", {
        refresh: refreshToken,
      })
      .then((response) => {
        tokenStorage.setToken(response.data.auth_token);
        tokenStorage.setRefreshToken(response.data.refresh);
        return response.data.auth_token;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getApiBase(),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig | undefined;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refresh") &&
        !originalRequest.url?.includes("/auth")
      ) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshAccessToken(client);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          tokenStorage.clear();
          if (typeof window !== "undefined") {
            const next = encodeURIComponent(
              window.location.pathname + window.location.search,
            );
            window.location.href = `/login?unauthorized=true&next=${next}`;
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createApiClient();

/** Helper to perform a GET that disables pagination via the header taiga-back understands. */
export function withoutPagination(
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      "x-disable-pagination": "1",
    },
  };
}

/** Helper to enable lazy (header-based) pagination metadata. */
export function withLazyPagination(
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      "x-lazy-pagination": "1",
    },
  };
}

/** Convenience typed request wrappers. */
export async function getJson<T>(
  url: string,
  params?: Record<string, unknown>,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.get(url, {
    ...config,
    params,
  });
  return response.data;
}

export async function postJson<T, TBody = unknown>(
  url: string,
  body?: TBody,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.post(url, body, config);
  return response.data;
}

export async function patchJson<T, TBody = unknown>(
  url: string,
  body?: TBody,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.patch(url, body, config);
  return response.data;
}

export async function putJson<T, TBody = unknown>(
  url: string,
  body?: TBody,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.put(url, body, config);
  return response.data;
}

export async function deleteJson<T = void>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.delete(url, config);
  return response.data;
}
