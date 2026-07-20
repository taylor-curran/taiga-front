import type { TaigaConfig, TaigaUser } from './types';
import { taigaFetch } from './client';
import { storageRemove, storageSet } from '../lib/storage';

export type LoginPayload = { username: string; password: string; type?: string };

export async function login(config: TaigaConfig, payload: LoginPayload): Promise<TaigaUser> {
  storageRemove('token');
  storageRemove('refresh');
  storageRemove('userInfo');
  const res = await taigaFetch(config, 'auth', {
    method: 'POST',
    body: JSON.stringify({ ...payload, type: payload.type ?? 'normal' }),
    skipAuth: true,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `login failed: ${res.status}`);
  }
  const user = (await res.json()) as TaigaUser;
  if (user.auth_token) storageSet('token', user.auth_token);
  if (user.refresh) storageSet('refresh', user.refresh);
  storageSet('userInfo', user);
  return user;
}

export async function fetchCurrentUser(config: TaigaConfig): Promise<TaigaUser> {
  const res = await taigaFetch(config, 'users/me');
  if (!res.ok) throw new Error(`users/me: ${res.status}`);
  return (await res.json()) as TaigaUser;
}
