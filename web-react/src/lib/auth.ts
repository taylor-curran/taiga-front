import { create } from 'zustand';
import { api, auth as apiAuth } from './api';
import { SESSION_KEYS, storage } from './storage';

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  full_name_display?: string;
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
  roles?: string[];
  max_private_projects?: number | null;
  max_public_projects?: number | null;
  max_memberships_private_projects?: number | null;
  max_memberships_public_projects?: number | null;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
  full_name: string;
  accepted_terms: boolean;
}

interface OAuthParams {
  type: 'github' | 'gitlab';
  code: string;
  invitation_token?: string;
}

interface AuthState {
  user: CurrentUser | null;
  initialized: boolean;
  setUser(user: CurrentUser | null): void;
  hydrate(): void;
  login(username: string, password: string): Promise<CurrentUser>;
  loginWith(opts: { type: 'normal' | 'github' | 'gitlab'; code?: string; token?: string; invitation_token?: string }): Promise<CurrentUser>;
  loginOAuth(params: OAuthParams): Promise<CurrentUser>;
  register(params: RegisterParams): Promise<CurrentUser>;
  logout(): void;
  refreshMe(): Promise<CurrentUser | null>;
  updateProfile(data: Partial<CurrentUser>): Promise<CurrentUser>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  requestPasswordRecovery(username: string): Promise<void>;
  changePasswordFromRecovery(token: string, password: string): Promise<void>;
}

function extractUser(data: Record<string, unknown>): CurrentUser {
  const { auth_token: _at, refresh: _r, ...user } = data;
  return user as unknown as CurrentUser;
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
    const res = await api.post<{ auth_token: string; refresh: string } & Record<string, unknown>>(
      'auth',
      { type: 'normal', username, password },
    );
    const { auth_token, refresh } = res.data;
    apiAuth.setTokens(auth_token, refresh);
    const user = extractUser(res.data);
    get().setUser(user);
    return user;
  },

  async loginWith(opts) {
    const res = await api.post<{ auth_token: string; refresh: string } & Record<string, unknown>>(
      'auth',
      opts,
    );
    const { auth_token, refresh } = res.data;
    apiAuth.setTokens(auth_token, refresh);
    const user = extractUser(res.data);
    get().setUser(user);
    return user;
  },

  async loginOAuth(params) {
    return get().loginWith({ type: params.type, code: params.code, invitation_token: params.invitation_token });
  },

  async register(params) {
    const res = await api.post<{ auth_token: string; refresh: string } & Record<string, unknown>>(
      'auth/register',
      { type: 'public', ...params },
    );
    const { auth_token, refresh } = res.data;
    apiAuth.setTokens(auth_token, refresh);
    const user = extractUser(res.data);
    get().setUser(user);
    return user;
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

  async updateProfile(data) {
    const user = get().user;
    if (!user) throw new Error('Not authenticated');
    const res = await api.patch<CurrentUser>(`users/${user.id}`, data);
    get().setUser(res.data);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    await api.post('users/change_password', {
      current_password: currentPassword,
      password: newPassword,
    });
  },

  async requestPasswordRecovery(username) {
    await api.post('users/password_recovery', { username });
  },

  async changePasswordFromRecovery(token, password) {
    await api.post('users/change_password_from_recovery', { token, password });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('taiga:logout', () => {
    useAuth.getState().logout();
  });
}
