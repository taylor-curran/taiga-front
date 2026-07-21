/**
 * Persistent token storage backed by `localStorage`.
 *
 * Mirrors the keys used by the AngularJS `$tgStorage` service so a transitional
 * deployment can share login state with the legacy SPA.
 */

const TOKEN_KEY = "token";
const REFRESH_KEY = "refresh";
const USER_INFO_KEY = "userInfo";

function safeStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export const tokenStorage = {
  getToken(): string | null {
    const storage = safeStorage();
    if (!storage) return null;
    const raw = storage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as string;
    } catch {
      return raw;
    }
  },

  setToken(token: string): void {
    const storage = safeStorage();
    if (!storage) return;
    storage.setItem(TOKEN_KEY, JSON.stringify(token));
  },

  getRefreshToken(): string | null {
    const storage = safeStorage();
    if (!storage) return null;
    const raw = storage.getItem(REFRESH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as string;
    } catch {
      return raw;
    }
  },

  setRefreshToken(token: string): void {
    const storage = safeStorage();
    if (!storage) return;
    storage.setItem(REFRESH_KEY, JSON.stringify(token));
  },

  getUserInfo<T = unknown>(): T | null {
    const storage = safeStorage();
    if (!storage) return null;
    const raw = storage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUserInfo(value: unknown): void {
    const storage = safeStorage();
    if (!storage) return;
    storage.setItem(USER_INFO_KEY, JSON.stringify(value));
  },

  removeUserInfo(): void {
    const storage = safeStorage();
    if (!storage) return;
    storage.removeItem(USER_INFO_KEY);
  },

  clear(): void {
    const storage = safeStorage();
    if (!storage) return;
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(REFRESH_KEY);
    storage.removeItem(USER_INFO_KEY);
  },
};
