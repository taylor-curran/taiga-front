import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UserStory, Swimlane } from '@/types/api';

export interface KanbanFilters {
  project: number;
  status__is_archived?: boolean;
  tags?: string;
  assigned_users?: string;
  epic?: string;
  owner?: string;
  role?: string;
  exclude_tags?: string;
  exclude_assigned_users?: string;
  exclude_epic?: string;
  exclude_owner?: string;
  exclude_role?: string;
  include_tasks?: boolean;
}

export async function fetchKanbanStories(
  filters: KanbanFilters,
): Promise<UserStory[]> {
  const res = await api.get<UserStory[]>('userstories', {
    params: { ...filters, status__is_archived: false, include_tasks: true },
  });
  return res.data;
}

export async function fetchSwimlanes(projectId: number): Promise<Swimlane[]> {
  const res = await api.get<Swimlane[]>('swimlanes', {
    params: { project: projectId },
  });
  return res.data;
}

export async function patchUserStory(
  id: number,
  data: Partial<UserStory>,
): Promise<UserStory> {
  const res = await api.patch<UserStory>(`userstories/${id}`, data);
  return res.data;
}

export async function bulkUpdateKanbanOrder(
  projectId: number,
  statusId: number,
  stories: { us_id: number; order: number; swimlane?: number | null }[],
): Promise<void> {
  await api.post('userstories/bulk_update_kanban_order', {
    project_id: projectId,
    status_id: statusId,
    bulk_userstories: stories,
  });
}

export function useKanbanStories(filters: KanbanFilters | undefined) {
  return useQuery({
    queryKey: ['kanban-stories', filters],
    queryFn: () => fetchKanbanStories(filters as KanbanFilters),
    enabled: !!filters,
  });
}

export function useSwimlanes(projectId: number | undefined) {
  return useQuery({
    queryKey: ['swimlanes', projectId],
    queryFn: () => fetchSwimlanes(projectId as number),
    enabled: !!projectId,
  });
}

export function usePatchUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserStory> }) =>
      patchUserStory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kanban-stories'] });
    },
  });
}

export function useBulkUpdateKanbanOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      projectId: number;
      statusId: number;
      stories: { us_id: number; order: number; swimlane?: number | null }[];
    }) => bulkUpdateKanbanOrder(args.projectId, args.statusId, args.stories),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['kanban-stories'] });
    },
  });
}
