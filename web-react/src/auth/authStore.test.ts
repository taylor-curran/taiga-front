import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    useAuthStore.setState({ hydrated: false });
  });

  it('hydrates user and token from localStorage', () => {
    const user = {
      id: 1,
      username: 'u',
      auth_token: 'tok',
      refresh: 'ref',
    };
    localStorage.setItem('token', JSON.stringify('tok'));
    localStorage.setItem('refresh', JSON.stringify('ref'));
    localStorage.setItem('userInfo', JSON.stringify(user));

    useAuthStore.getState().hydrateFromStorage();

    const s = useAuthStore.getState();
    expect(s.hydrated).toBe(true);
    expect(s.token).toBe('tok');
    expect(s.user?.username).toBe('u');
  });

  it('setSession persists like Angular $tgStorage', () => {
    useAuthStore.getState().setSession({
      id: 2,
      username: 'admin',
      auth_token: 'abc',
      refresh: 'r',
    });
    expect(JSON.parse(localStorage.getItem('token')!)).toBe('abc');
    expect(JSON.parse(localStorage.getItem('userInfo')!)).toMatchObject({ username: 'admin' });
  });
});
