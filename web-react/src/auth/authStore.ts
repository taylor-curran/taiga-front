import { create } from 'zustand';

export type User = {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  auth_token: string;
  refresh?: string;
  is_superuser?: boolean;
  [k: string]: unknown;
};

type AuthState = {
  user: User | null;
  token: string | null;
  refresh: string | null;
  hydrated: boolean;
  setSession: (user: User) => void;
  clearSession: () => void;
  hydrateFromStorage: () => void;
};

const LS_TOKEN = 'token';
const LS_REFRESH = 'refresh';
const LS_USER = 'userInfo';

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refresh: null,
  hydrated: false,

  setSession: (user) => {
    try {
      localStorage.setItem(LS_TOKEN, JSON.stringify(user.auth_token));
      if (user.refresh != null) {
        localStorage.setItem(LS_REFRESH, JSON.stringify(user.refresh));
      }
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } catch {
      /* ignore */
    }
    set({ user, token: user.auth_token, refresh: (user.refresh as string) ?? null });
  },

  clearSession: () => {
    try {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_REFRESH);
      localStorage.removeItem(LS_USER);
    } catch {
      /* ignore */
    }
    set({ user: null, token: null, refresh: null });
  },

  hydrateFromStorage: () => {
    const token = readJson<string>(LS_TOKEN);
    const refresh = readJson<string>(LS_REFRESH);
    const user = readJson<User>(LS_USER);
    set({
      token,
      refresh,
      user: user && token ? { ...user, auth_token: token } : null,
      hydrated: true,
    });
  },
}));

export function getStoredToken(): string | null {
  return readJson<string>(LS_TOKEN);
}

export function getStoredRefresh(): string | null {
  return readJson<string>(LS_REFRESH);
}
