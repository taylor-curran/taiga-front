import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  refresh: string | null;
  user: User | null;
  setTokens: (token: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refresh: null,
      user: null,
      setTokens: (token: string, refresh: string) => set({ token, refresh }),
      setUser: (user: User) =>
        set({ user, token: user.auth_token, refresh: user.refresh }),
      logout: () => set({ token: null, refresh: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'taiga-auth',
    }
  )
);
