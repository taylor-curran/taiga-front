import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAuth } from '../auth';
import { storage } from '../storage';
import * as configMod from '../config';

vi.mock('../client', async () => {
  const actual: Record<string, unknown> = await vi.importActual('../client');
  const post = vi.fn();
  return {
    ...actual,
    api: () => ({
      post,
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    }),
    __post: post,
  };
});

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ user: null, error: null, loading: false, initialized: false });
    vi.spyOn(configMod, 'getConfig').mockReturnValue({ defaultLanguage: 'en' } as ReturnType<typeof configMod.getConfig>);
  });

  it('logs in and stores the auth token', async () => {
    const mod = await import('../client');
    // @ts-expect-error attached for tests
    mod.__post.mockResolvedValueOnce({
      data: { id: 5, username: 'admin', full_name_display: 'admin', auth_token: 'TOK', refresh: 'REF' },
    });
    await useAuth.getState().login({ username: 'admin', password: 'adminpass' });
    expect(useAuth.getState().user?.username).toBe('admin');
    expect(storage.get('token')).toBe('TOK');
    expect(storage.get('refresh')).toBe('REF');
  });

  it('logout clears storage', () => {
    storage.set('token', 'X');
    storage.set('userInfo', { id: 1, username: 'x', full_name_display: 'x', auth_token: 'X' });
    useAuth.setState({ user: { id: 1, username: 'x', full_name_display: 'x', full_name: 'x', auth_token: 'X' } });
    useAuth.getState().logout();
    expect(useAuth.getState().user).toBeNull();
    expect(storage.get('token')).toBeNull();
  });

  it('hydrate restores user from storage', () => {
    storage.set('token', 'T');
    storage.set('userInfo', { id: 1, username: 'u', full_name_display: 'u', auth_token: 'T', full_name: 'u' });
    useAuth.getState().hydrate();
    expect(useAuth.getState().user?.username).toBe('u');
    expect(useAuth.getState().initialized).toBe(true);
  });
});
