import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UserStory } from '@/types/api';

export interface UserStoryFilters {
  project: number;
  milestone?: number | 'null';
  status?: number;
  assigned_to?: number;
  include_attachments?: boolean;
  include_tasks?: boolean;
}

export async function fetchUserStories(
  filters: UserStoryFilters,
): Promise<UserStory[]> {
  const res = await api.get<UserStory[]>('userstories', { params: filters });
  return res.data;
}

export async function fetchUserStoryByRef(
  projectId: number,
  ref: number,
): Promise<UserStory> {
  const res = await api.get<UserStory>('userstories/by_ref', {
    params: { project: projectId, ref },
  });
  return res.data;
}

export function useUserStories(filters: UserStoryFilters | undefined) {
  return useQuery({
    queryKey: ['userstories', filters],
    queryFn: () => fetchUserStories(filters as UserStoryFilters),
    enabled: !!filters,
  });
}

export function useUserStoryByRef(
  projectId: number | undefined,
  ref: number | undefined,
) {
  return useQuery({
    queryKey: ['userstory', 'by_ref', projectId, ref],
    queryFn: () => fetchUserStoryByRef(projectId as number, ref as number),
    enabled: !!projectId && !!ref,
  });
}
