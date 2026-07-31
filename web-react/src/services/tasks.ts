import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Task } from '@/types/api';

export async function fetchTasks(filters: {
  project: number;
  milestone?: number;
  user_story?: number;
  status?: number;
}): Promise<Task[]> {
  const res = await api.get<Task[]>('tasks', { params: filters });
  return res.data;
}

export async function fetchTaskByRef(projectId: number, ref: number): Promise<Task> {
  const res = await api.get<Task>('tasks/by_ref', {
    params: { project: projectId, ref },
  });
  return res.data;
}

export function useTasks(
  filters:
    | { project: number; milestone?: number; user_story?: number; status?: number }
    | undefined,
) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters as { project: number }),
    enabled: !!filters,
  });
}

export function useTaskByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['task', 'by_ref', projectId, ref],
    queryFn: () => fetchTaskByRef(projectId as number, ref as number),
    enabled: !!projectId && !!ref,
  });
}
