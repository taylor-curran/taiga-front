import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Epic, UserStory } from '@/types/api';

export async function fetchEpics(projectId: number): Promise<Epic[]> {
  const res = await api.get<Epic[]>('epics', { params: { project: projectId } });
  return res.data;
}

export async function fetchEpicByRef(projectId: number, ref: number): Promise<Epic> {
  const res = await api.get<Epic>('epics/by_ref', {
    params: { project: projectId, ref },
  });
  return res.data;
}

export async function fetchEpicUserStories(epicId: number): Promise<UserStory[]> {
  const res = await api.get<UserStory[]>(`epics/${epicId}/related_userstories`);
  return res.data;
}

export function useEpics(projectId: number | undefined) {
  return useQuery({
    queryKey: ['epics', projectId],
    queryFn: () => fetchEpics(projectId as number),
    enabled: !!projectId,
  });
}

export function useEpicByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['epic', 'by_ref', projectId, ref],
    queryFn: () => fetchEpicByRef(projectId as number, ref as number),
    enabled: !!projectId && !!ref,
  });
}
