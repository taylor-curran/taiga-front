import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TimelineEntry } from '@/types/api';

export async function fetchProjectTimeline(projectId: number): Promise<TimelineEntry[]> {
  const res = await api.get<TimelineEntry[]>(`timeline/project/${projectId}`);
  return res.data;
}

export async function fetchUserTimeline(userId: number): Promise<TimelineEntry[]> {
  const res = await api.get<TimelineEntry[]>(`timeline/user/${userId}`);
  return res.data;
}

export function useProjectTimeline(projectId: number | undefined) {
  return useQuery({
    queryKey: ['timeline', 'project', projectId],
    queryFn: () => fetchProjectTimeline(projectId as number),
    enabled: !!projectId,
  });
}
