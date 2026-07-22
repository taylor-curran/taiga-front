import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { ProjectListItem, CurrentUser } from '@/api/types';
import { useAuth } from './store';

export function useMyProjects() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['projects', 'mine', userId],
    enabled: Boolean(userId),
    queryFn: () =>
      api.get<ProjectListItem[]>('projects', {
        query: { member: userId!, order_by: 'user_order', slight: true },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useDiscoverProjects(opts: { discover_mode?: boolean; order_by?: string } = {}) {
  return useQuery({
    queryKey: ['projects', 'discover', opts],
    queryFn: () =>
      api.get<ProjectListItem[]>('projects', {
        query: {
          discover_mode: 'true',
          order_by: opts.order_by ?? 'total_fans_last_week',
        },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => api.get<CurrentUser>('users/me'),
    staleTime: 60_000,
  });
}
