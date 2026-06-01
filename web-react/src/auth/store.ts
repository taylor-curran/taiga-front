// Zustand auth store — replaces AuthService from auth.coffee
// Token/user persistence via localStorage

import { create } from 'zustand';
import type { User } from '../types/models';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;

  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('taiga-token'),
  refreshToken: localStorage.getItem('taiga-refresh'),
  user: (() => {
    try {
      const raw = localStorage.getItem('taiga-user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),

  setToken: (token: string) => {
    localStorage.setItem('taiga-token', token);
    set({ token });
  },

  setRefreshToken: (token: string) => {
    localStorage.setItem('taiga-refresh', token);
    set({ refreshToken: token });
  },

  setUser: (user: User) => {
    localStorage.setItem('taiga-user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('taiga-token');
    localStorage.removeItem('taiga-refresh');
    localStorage.removeItem('taiga-user');
    set({ token: null, refreshToken: null, user: null });
  },

  isAuthenticated: () => get().user !== null && get().token !== null,
}));
