// Auth store backed by zustand. Mirrors `tgCurrentUserService` and `tgAuth`.

import { create } from 'zustand';
import { api, auth as apiAuth } from './api';
import { SESSION_KEYS, storage } from './storage';

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  full_name_display?: string;
  bio?: string;
  is_active?: boolean;
  is_admin?: boolean;
  photo?: string | null;
  big_photo?: string | null;
  gravatar_id?: string;
  color?: string;
  lang?: string;
  theme?: string;
  total_private_projects?: number;
  total_public_projects?: number;
  uuid?: string;
  verified_email?: boolean;
  max_private_projects?: number | null;
  max_public_projects?: number | null;
  max_memberships_private_projects?: number | null;
  max_memberships_public_projects?: number | null;
}

interface AuthState {
  user: CurrentUser | null;
  initialized: boolean;
  setUser(user: CurrentUser | null): void;
  hydrate(): void;
  login(username: string, password: string): Promise<CurrentUser>;
  loginWith(opts: { type: 'normal' | 'github' | 'gitlab'; code?: string; token?: string; invitation_token?: string }): Promise<CurrentUser>;
  logout(): void;
  refreshMe(): Promise<CurrentUser | null>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: storage.get<CurrentUser>(SESSION_KEYS.user),
  initialized: false,

  setUser(user) {
    if (user) {
      storage.set(SESSION_KEYS.user, user);
    } else {
      storage.remove(SESSION_KEYS.user);
    }
    set({ user });
  },

  hydrate() {
    const user = storage.get<CurrentUser>(SESSION_KEYS.user);
    set({ user, initialized: true });
  },

  async login(username, password) {
    const res = await api.post<{ auth_token: string; refresh: string } & CurrentUser>(
      'auth',
      { type: 'normal', username, password },
    );
    const { auth_token, refresh, ...user } = res.data;
    apiAuth.setTokens(auth_token, refresh);
    get().setUser(user as CurrentUser);
    return user as CurrentUser;
  },

  async loginWith(opts) {
    const res = await api.post<{ auth_token: string; refresh: string } & CurrentUser>(
      'auth',
      opts,
    );
    const { auth_token, refresh, ...user } = res.data;
    apiAuth.setTokens(auth_token, refresh);
    get().setUser(user as CurrentUser);
    return user as CurrentUser;
  },

  logout() {
    apiAuth.clearSession();
    set({ user: null });
  },

  async refreshMe() {
    if (!apiAuth.getAccessToken()) return null;
    try {
      const res = await api.get<CurrentUser>('users/me');
      get().setUser(res.data);
      return res.data;
    } catch {
      return null;
    }
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('taiga:logout', () => {
    useAuth.getState().logout();
  });
}
