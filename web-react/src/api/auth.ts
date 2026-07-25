import { create } from 'zustand';
import { api, apiError } from './client';
import { storage } from './storage';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  hydrate: () => void;
  login: (creds: { username: string; password: string; type?: 'normal' | 'public' }) => Promise<AuthUser>;
  logout: () => void;
  register: (data: {
    username: string;
    password: string;
    email: string;
    full_name: string;
    type?: 'public';
  }) => Promise<AuthUser>;
  forgotPassword: (data: { username: string }) => Promise<void>;
  changePasswordFromRecovery: (data: { token: string; password: string }) => Promise<void>;
  setUser: (u: AuthUser | null) => void;
  refreshUser: () => Promise<AuthUser | null>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  setUser: (u) => set({ user: u }),
  hydrate: () => {
    const token = storage.get<string>('token');
    const userInfo = storage.get<AuthUser>('userInfo');
    set({ user: token && userInfo ? userInfo : null, initialized: true });
  },
  login: async ({ username, password, type = 'normal' }) => {
    set({ loading: true, error: null });
    try {
      const res = await api().post<AuthUser>('auth', { username, password, type });
      storage.set('token', res.data.auth_token);
      if (res.data.refresh) storage.set('refresh', res.data.refresh);
      storage.set('userInfo', res.data);
      set({ user: res.data, loading: false });
      return res.data;
    } catch (err) {
      const e = apiError(err);
      set({ loading: false, error: e.data?._error_message || 'Login failed' });
      throw err;
    }
  },
  logout: () => {
    storage.remove('token');
    storage.remove('refresh');
    storage.remove('userInfo');
    set({ user: null });
  },
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const payload = { type: 'public', ...data };
      const res = await api().post<AuthUser>('auth/register', payload);
      storage.set('token', res.data.auth_token);
      if (res.data.refresh) storage.set('refresh', res.data.refresh);
      storage.set('userInfo', res.data);
      set({ user: res.data, loading: false });
      return res.data;
    } catch (err) {
      const e = apiError(err);
      set({ loading: false, error: e.data?._error_message || 'Register failed' });
      throw err;
    }
  },
  forgotPassword: async ({ username }) => {
    set({ loading: true, error: null });
    try {
      await api().post('users/password_recovery', { username });
      set({ loading: false });
    } catch (err) {
      const e = apiError(err);
      set({ loading: false, error: e.data?._error_message || 'Recovery failed' });
      throw err;
    }
  },
  changePasswordFromRecovery: async ({ token, password }) => {
    set({ loading: true, error: null });
    try {
      await api().post('users/change_password_from_recovery', { token, password });
      set({ loading: false });
    } catch (err) {
      const e = apiError(err);
      set({ loading: false, error: e.data?._error_message || 'Change password failed' });
      throw err;
    }
  },
  refreshUser: async () => {
    const cur = get().user;
    if (!cur) return null;
    try {
      const res = await api().get<AuthUser>('users/me');
      const merged = { ...cur, ...res.data };
      storage.set('userInfo', merged);
      set({ user: merged });
      return merged;
    } catch {
      return cur;
    }
  },
}));
