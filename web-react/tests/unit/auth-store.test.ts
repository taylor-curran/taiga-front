import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/auth/store';
import { storage } from '@/api/storage';
import * as client from '@/api/client';

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ user: null, hydrated: false });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates from storage', () => {
    storage.set('userInfo', { id: 1, username: 'u' });
    storage.set('token', 'tok');
    useAuth.getState().hydrate();
    expect(useAuth.getState().hydrated).toBe(true);
    expect(useAuth.getState().user?.username).toBe('u');
  });

  it('persists user, token, and refresh on setUser', () => {
    useAuth
      .getState()
      .setUser({
        id: 1,
        username: 'u',
        auth_token: 'tok',
        refresh: 'ref',
      } as never);
    expect(storage.get('token')).toBe('tok');
    expect(storage.get('refresh')).toBe('ref');
    expect(storage.get<{ username: string }>('userInfo')?.username).toBe('u');
  });

  it('clears storage on logout', () => {
    useAuth.getState().setUser({ id: 1, username: 'u', auth_token: 't', refresh: 'r' } as never);
    useAuth.getState().logout();
    expect(storage.get('token')).toBeNull();
    expect(storage.get('userInfo')).toBeNull();
  });

  it('login posts to auth then stores user', async () => {
    const fake = { id: 1, username: 'u', auth_token: 'tok', refresh: 'r' };
    const post = vi
      .spyOn(client.api, 'post')
      .mockResolvedValueOnce(fake as unknown as never);

    const u = await useAuth.getState().login({ username: 'u', password: 'p' });

    expect(post).toHaveBeenCalledWith('auth', { type: 'normal', username: 'u', password: 'p' });
    expect(u.username).toBe('u');
    expect(storage.get('token')).toBe('tok');
  });
});
