import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Issue } from '@/types/api';

export async function fetchIssues(filters: {
  project: number;
  status?: number;
  priority?: number;
  severity?: number;
  type?: number;
  assigned_to?: number;
  q?: string;
}): Promise<Issue[]> {
  const res = await api.get<Issue[]>('issues', { params: filters });
  return res.data;
}

export async function fetchIssueByRef(projectId: number, ref: number): Promise<Issue> {
  const res = await api.get<Issue>('issues/by_ref', {
    params: { project: projectId, ref },
  });
  return res.data;
}

export function useIssues(filters: { project: number; q?: string } | undefined) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => fetchIssues(filters as { project: number }),
    enabled: !!filters,
  });
}

export function useIssueByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['issue', 'by_ref', projectId, ref],
    queryFn: () => fetchIssueByRef(projectId as number, ref as number),
    enabled: !!projectId && !!ref,
  });
}
