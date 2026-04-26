import { taigaGet } from './taigaClient';
import type { TaigaUser } from './types';

export async function getCurrentUser() {
  return taigaGet<TaigaUser>('/api/v1/users/me');
}
