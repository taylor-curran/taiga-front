import { create } from 'zustand';

const LS_USER = 'userInfo';
const LS_TOKEN = 'token';

type UserInfo = { id: number; username?: string; auth_token?: string; [k: string]: unknown };

type SessionState = {
  user: UserInfo | null;
  token: string | null;
  hydrateFromStorage: () => void;
  setSession: (user: UserInfo, token: string) => void;
  clear: () => void;
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  hydrateFromStorage: () => {
    const token = readJson<string>(LS_TOKEN) ?? localStorage.getItem(LS_TOKEN)?.replace(/^"|"$/g, '') ?? null;
    const user = readJson<UserInfo>(LS_USER);
    const resolvedToken = token ?? user?.auth_token ?? null;
    set({ user, token: resolvedToken });
  },
  setSession: (user, token) => {
    localStorage.setItem(LS_TOKEN, JSON.stringify(token));
    localStorage.setItem(LS_USER, JSON.stringify({ ...user, auth_token: token }));
    set({ user: { ...user, auth_token: token }, token });
  },
  clear: () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    set({ user: null, token: null });
  },
}));
