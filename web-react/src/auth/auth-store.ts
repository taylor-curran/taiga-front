import { create } from "zustand";

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  photo: string;
  lang: string;
  theme: string;
  auth_token?: string;
  refresh?: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setTokens: (token: string, refresh: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
  logout: () => void;
}

function hydrateToken(): string | null {
  return localStorage.getItem("token");
}

function hydrateRefresh(): string | null {
  return localStorage.getItem("refresh");
}

function hydrateUser(): User | null {
  const raw = localStorage.getItem("userInfo");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const token = hydrateToken();
  const refreshToken = hydrateRefresh();
  const user = hydrateUser();

  return {
    token,
    refreshToken,
    user,
    isAuthenticated: !!(token && user),

    setTokens: (token: string, refresh: string) => {
      localStorage.setItem("token", token);
      localStorage.setItem("refresh", refresh);
      set((state) => ({
        token,
        refreshToken: refresh,
        isAuthenticated: !!(token && state.user),
      }));
    },

    setUser: (user: User) => {
      localStorage.setItem("userInfo", JSON.stringify(user));
      set((state) => ({
        user,
        isAuthenticated: !!(state.token && user),
      }));
    },

    clear: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("userInfo");
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("userInfo");
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    },
  };
});
