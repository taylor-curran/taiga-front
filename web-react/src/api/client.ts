import { getConfig } from "../config";

const sessionId = generateSessionId();

function generateSessionId(): string {
  const date = Date.now();
  const random = Math.floor(Math.random() * 0x9000000);
  return btoa(`${date}:${random}`).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Session-Id": sessionId,
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = getConfig();
  const userInfoRaw = localStorage.getItem("userInfo");
  let lang = config.defaultLanguage || "en";
  if (userInfoRaw) {
    try {
      const user = JSON.parse(userInfoRaw);
      if (user.lang) lang = user.lang;
    } catch { /* ignore */ }
  }
  headers["Accept-Language"] = lang;

  return headers;
}

let refreshInProgress: Promise<Response> | null = null;

async function handleRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh");
  if (!refreshToken) return false;

  if (refreshInProgress) {
    try {
      const res = await refreshInProgress;
      return res.ok;
    } catch {
      return false;
    }
  }

  const promise = fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  refreshInProgress = promise;

  try {
    const res = await promise;
    refreshInProgress = null;

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.auth_token);
      localStorage.setItem("refresh", data.refresh);
      return true;
    }
    return false;
  } catch {
    refreshInProgress = null;
    return false;
  }
}

function clearAuthAndRedirect(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("userInfo");
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?unauthorized=true&next=${next}`;
}

function handleBlockedResponse(): void {
  const pslug = window.location.pathname.match(/\/project\/([^/]+)/)?.[1] || "unknown";
  window.location.href = `/blocked-project/${pslug}/`;
}

async function request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let fullUrl = url;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
  }

  const mergedHeaders = { ...buildHeaders(), ...(fetchOptions.headers as Record<string, string> || {}) };
  fetchOptions.headers = mergedHeaders;

  const res = await fetch(fullUrl, fetchOptions);

  // Blocked interceptor
  if (res.status === 451) {
    handleBlockedResponse();
    throw new Error("Project blocked (451)");
  }

  // 401 interceptor
  if (res.status === 401 && !window.location.pathname.startsWith("/login")) {
    const refreshed = await handleRefresh();
    if (refreshed) {
      // Retry original request with new token
      const newToken = localStorage.getItem("token");
      if (newToken) {
        (fetchOptions.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      }
      const retryRes = await fetch(fullUrl, fetchOptions);
      if (retryRes.status === 451) {
        handleBlockedResponse();
        throw new Error("Project blocked (451)");
      }
      if (!retryRes.ok) {
        throw new ApiError(retryRes.status, await retryRes.text());
      }
      const retryData = await retryRes.json().catch(() => null);
      if (retryData && typeof retryData === "object" && "blocked_code" in retryData && retryData.blocked_code) {
        handleBlockedResponse();
        throw new Error("Project blocked");
      }
      return retryData as T;
    }
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  const data = await res.json().catch(() => null);

  // Check for blocked_code in successful responses
  if (data && typeof data === "object" && "blocked_code" in data && (data as Record<string, unknown>).blocked_code) {
    handleBlockedResponse();
    throw new Error("Project blocked");
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

export const apiClient = {
  get<T = unknown>(url: string, params?: Record<string, string>): Promise<T> {
    return request<T>(url, { method: "GET", params });
  },

  post<T = unknown>(url: string, data?: unknown, params?: Record<string, string>): Promise<T> {
    return request<T>(url, {
      method: "POST",
      body: data != null ? JSON.stringify(data) : undefined,
      params,
    });
  },

  put<T = unknown>(url: string, data?: unknown, params?: Record<string, string>): Promise<T> {
    return request<T>(url, {
      method: "PUT",
      body: data != null ? JSON.stringify(data) : undefined,
      params,
    });
  },

  patch<T = unknown>(url: string, data?: unknown, params?: Record<string, string>): Promise<T> {
    return request<T>(url, {
      method: "PATCH",
      body: data != null ? JSON.stringify(data) : undefined,
      params,
    });
  },

  delete<T = unknown>(url: string, params?: Record<string, string>): Promise<T> {
    return request<T>(url, { method: "DELETE", params });
  },
};
