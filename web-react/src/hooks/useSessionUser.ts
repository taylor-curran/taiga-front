import { useEffect, useState } from 'react';
import type { TaigaUser } from '../api/types';
import { storageGet } from '../lib/storage';

export function useSessionUser(): TaigaUser | null {
  const [user, setUser] = useState<TaigaUser | null>(() => storageGet<TaigaUser>('userInfo'));

  useEffect(() => {
    const onStorage = () => setUser(storageGet<TaigaUser>('userInfo'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return user;
}
