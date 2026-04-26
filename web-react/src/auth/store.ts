import { create } from 'zustand';
import { storage } from '@/api/storage';
import { api } from '@/api/client';
import type { CurrentUser } from '@/api/types';

interface AuthState {
  user: CurrentUser | null;
  hydrated: boolean;
  hydrate: () => void;
  setUser: (u: CurrentUser | null) => void;
  login: (creds: { username: string; password: string }) => Promise<CurrentUser>;
  logout: () => void;
  refreshSelf: () => Promise<CurrentUser | null>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  hydrate: () => {
    const u = storage.get<CurrentUser>('userInfo');
    set({ user: u, hydrated: true });
  },
  setUser: (u) => {
    if (u) {
      storage.set('userInfo', u);
      if (u.auth_token) storage.set('token', u.auth_token);
      if (u.refresh) storage.set('refresh', u.refresh);
    } else {
      storage.remove('userInfo');
      storage.remove('token');
      storage.remove('refresh');
    }
    set({ user: u });
  },
  login: async ({ username, password }) => {
    storage.remove('token');
    storage.remove('refresh');
    const user = await api.post<CurrentUser>('auth', {
      type: 'normal',
      username,
      password,
    });
    get().setUser(user);
    return user;
  },
  logout: () => {
    get().setUser(null);
  },
  refreshSelf: async () => {
    if (!storage.get('token')) return null;
    try {
      const me = await api.get<CurrentUser>('users/me');
      const merged: CurrentUser = {
        ...(get().user ?? ({} as CurrentUser)),
        ...me,
      };
      get().setUser(merged);
      return merged;
    } catch {
      return null;
    }
  },
}));

export function isAuthenticated(): boolean {
  return Boolean(storage.get('token') && storage.get('userInfo'));
}
