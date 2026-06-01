// AuthProvider context and useAuth hook
// Wraps zustand store in React context for route guards and components

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useAuthStore } from './store';
import { apiClient, ApiError } from '../api/client';
import { API_URLS } from '../api/urls';
import type { User } from '../types/models';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  changePasswordFromRecovery: (token: string, password: string) => Promise<void>;
  changeEmail: (emailToken: string) => Promise<void>;
  cancelAccount: (cancelToken: string) => Promise<void>;
  refreshUser: () => Promise<User>;
}

interface RegisterData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  type?: string;
  existing?: boolean;
  token?: string;
  accepted_terms?: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, setToken, setRefreshToken, setUser, logout: storeLogout } = useAuthStore();

  const login = useCallback(async (username: string, password: string): Promise<User> => {
    storeLogout(); // clear any stale tokens
    const { data } = await apiClient.post<User>(API_URLS.auth, {
      body: { username, password, type: 'normal' },
    });
    setToken(data.auth_token);
    if (data.refresh) setRefreshToken(data.refresh);
    setUser(data);
    return data;
  }, [setToken, setRefreshToken, setUser, storeLogout]);

  const register = useCallback(async (regData: RegisterData): Promise<User> => {
    storeLogout();
    const { data } = await apiClient.post<User>(API_URLS.authRegister, {
      body: { ...regData, type: regData.type || 'public' },
    });
    setToken(data.auth_token);
    if (data.refresh) setRefreshToken(data.refresh);
    setUser(data);
    return data;
  }, [setToken, setRefreshToken, setUser, storeLogout]);

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  const forgotPassword = useCallback(async (email: string) => {
    await apiClient.post(API_URLS.usersPasswordRecovery, { body: { email } });
  }, []);

  const changePasswordFromRecovery = useCallback(async (recoveryToken: string, password: string) => {
    await apiClient.post(API_URLS.usersChangePasswordFromRecovery, {
      body: { token: recoveryToken, password },
    });
  }, []);

  const changeEmail = useCallback(async (emailToken: string) => {
    await apiClient.post(API_URLS.usersChangeEmail, {
      body: { email_token: emailToken },
    });
  }, []);

  const cancelAccount = useCallback(async (cancelToken: string) => {
    await apiClient.post(API_URLS.usersCancelAccount, {
      body: { cancel_token: cancelToken },
    });
  }, []);

  const refreshUser = useCallback(async (): Promise<User> => {
    const { data } = await apiClient.get<User>(API_URLS.userMe);
    const currentToken = useAuthStore.getState().token;
    if (currentToken) data.auth_token = currentToken;
    setUser(data);
    return data;
  }, [setUser]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: user !== null && token !== null,
    login,
    register,
    logout,
    forgotPassword,
    changePasswordFromRecovery,
    changeEmail,
    cancelAccount,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export { ApiError };
