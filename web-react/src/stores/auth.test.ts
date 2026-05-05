import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth';

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, refresh: null, user: null });
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setTokens updates token and refresh', () => {
    useAuthStore.getState().setTokens('tok123', 'ref456');
    expect(useAuthStore.getState().token).toBe('tok123');
    expect(useAuthStore.getState().refresh).toBe('ref456');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('setUser stores user and extracts tokens', () => {
    const user = {
      id: 1,
      username: 'admin',
      full_name: 'Admin User',
      full_name_display: 'Admin User',
      color: '#f00',
      bio: '',
      lang: 'en',
      theme: 'taiga',
      timezone: 'UTC',
      is_active: true,
      photo: null,
      big_photo: null,
      gravatar_id: 'abc',
      roles: ['admin'],
      total_private_projects: 0,
      total_public_projects: 0,
      email: 'admin@example.com',
      uuid: 'uuid-1',
      date_joined: '2024-01-01',
      read_new_terms: true,
      accepted_terms: true,
      max_private_projects: null,
      max_public_projects: null,
      max_memberships_private_projects: null,
      max_memberships_public_projects: null,
      auth_token: 'user-token',
      refresh: 'user-refresh',
    };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user?.username).toBe('admin');
    expect(useAuthStore.getState().token).toBe('user-token');
    expect(useAuthStore.getState().refresh).toBe('user-refresh');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('logout clears all state', () => {
    useAuthStore.getState().setTokens('tok', 'ref');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().refresh).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });
});
