import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CurrentUser } from '@/lib/auth';
import type { Notification } from '@/types/api';

export async function fetchUserBySlug(slug: string): Promise<CurrentUser | null> {
  try {
    const res = await api.get<CurrentUser>(`users/by_username`, { params: { username: slug } });
    return res.data;
  } catch {
    try {
      const res = await api.get<CurrentUser>(`users/${slug}`);
      return res.data;
    } catch {
      return null;
    }
  }
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await api.get<Notification[]>('notifications');
  return res.data;
}

export function useUserBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['user', 'by_slug', slug],
    queryFn: () => fetchUserBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });
}
