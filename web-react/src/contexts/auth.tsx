/**
 * Authentication context.
 *
 * Ports the AuthService (`app/coffee/modules/auth.coffee`) to React. Manages
 * the current user, login/register/logout flows and password recovery, and
 * keeps tokens in `localStorage` so the legacy SPA can pick them up during
 * a phased migration.
 */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authResource } from "../api/auth-resource";
import { tokenStorage } from "../api/token-storage";
import {
  AuthenticatedUser,
  ChangePasswordFromRecoveryPayload,
  LoginPayload,
  PasswordRecoveryPayload,
  RegisterPayload,
  User,
} from "../api/types";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthenticatedUser>;
  register: (
    payload: RegisterPayload,
    type?: "public" | "private",
  ) => Promise<AuthenticatedUser>;
  logout: () => void;
  refresh: () => Promise<User>;
  forgotPassword: (payload: PasswordRecoveryPayload) => Promise<void>;
  changePasswordFromRecovery: (
    payload: ChangePasswordFromRecoveryPayload,
  ) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(() =>
    tokenStorage.getUserInfo<User>(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(tokenStorage.getToken()) && tokenStorage.getUserInfo() === null;
  });

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    if (next) {
      tokenStorage.setUserInfo(next);
    } else {
      tokenStorage.removeUserInfo();
    }
  }, []);

  // On mount, if we have a token but no cached user, hydrate from the API.
  useEffect(() => {
    let cancelled = false;
    const token = tokenStorage.getToken();
    const cached = tokenStorage.getUserInfo<User>();
    if (token && !cached) {
      setIsLoading(true);
      authResource
        .getMe()
        .then((fresh) => {
          if (!cancelled) setUser(fresh);
        })
        .catch(() => {
          if (!cancelled) {
            tokenStorage.clear();
            setUser(null);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const login = useCallback<AuthContextValue["login"]>(
    async (payload) => {
      tokenStorage.clear();
      const authenticated = await authResource.login(payload);
      tokenStorage.setToken(authenticated.auth_token);
      tokenStorage.setRefreshToken(authenticated.refresh);
      setUser(authenticated);
      return authenticated;
    },
    [setUser],
  );

  const register = useCallback<AuthContextValue["register"]>(
    async (payload, type = "public") => {
      tokenStorage.clear();
      const authenticated = await authResource.register(payload, type);
      tokenStorage.setToken(authenticated.auth_token);
      if (authenticated.refresh) {
        tokenStorage.setRefreshToken(authenticated.refresh);
      }
      setUser(authenticated);
      return authenticated;
    },
    [setUser],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, [setUser]);

  const refresh = useCallback(async () => {
    const fresh = await authResource.getMe();
    setUser(fresh);
    return fresh;
  }, [setUser]);

  const forgotPassword = useCallback<AuthContextValue["forgotPassword"]>(
    (payload) => authResource.forgotPassword(payload),
    [],
  );

  const changePasswordFromRecovery = useCallback<
    AuthContextValue["changePasswordFromRecovery"]
  >((payload) => authResource.changePasswordFromRecovery(payload), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refresh,
      forgotPassword,
      changePasswordFromRecovery,
      setUser,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      refresh,
      forgotPassword,
      changePasswordFromRecovery,
      setUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
