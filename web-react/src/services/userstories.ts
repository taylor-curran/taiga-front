import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UserStory, UserStoryDetail, BulkUpdateOrder } from '@/types/api';

export interface UserStoryFilters {
  project: number;
  milestone?: number | 'null';
  status?: number;
  assigned_to?: number;
  tags?: string;
  q?: string;
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
): Promise<UserStoryDetail> {
  const res = await api.get<UserStoryDetail>('userstories/by_ref', {
    params: { project: projectId, ref },
  });
  return res.data;
}

export async function fetchUserStoryById(id: number): Promise<UserStoryDetail> {
  const res = await api.get<UserStoryDetail>(`userstories/${id}`);
  return res.data;
}

export async function createUserStory(data: {
  project: number;
  subject: string;
  status?: number;
  milestone?: number | null;
  description?: string;
  tags?: string[];
  assigned_to?: number | null;
}): Promise<UserStoryDetail> {
  const res = await api.post<UserStoryDetail>('userstories', data);
  return res.data;
}

export async function patchUserStory(
  id: number,
  data: Partial<UserStoryDetail>,
  version?: number,
): Promise<UserStoryDetail> {
  const payload = version !== undefined ? { ...data, version } : data;
  const res = await api.patch<UserStoryDetail>(`userstories/${id}`, payload);
  return res.data;
}

export async function deleteUserStory(id: number): Promise<void> {
  await api.delete(`userstories/${id}`);
}

export async function bulkUpdateBacklogOrder(
  data: BulkUpdateOrder,
): Promise<void> {
  await api.post('userstories/bulk_update_backlog_order', data);
}

export async function bulkUpdateSprintOrder(data: {
  project_id: number;
  milestone_id: number;
  bulk_userstories: Array<[number, number]>;
}): Promise<void> {
  await api.post('userstories/bulk_update_sprint_order', data);
}

export async function bulkCreateUserStories(data: {
  project_id: number;
  bulk_stories: string;
  status_id?: number;
}): Promise<UserStory[]> {
  const res = await api.post<UserStory[]>('userstories/bulk_create', data);
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

export function useCreateUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUserStory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userstories'] });
      qc.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

export function usePatchUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, version }: { id: number; data: Partial<UserStoryDetail>; version?: number }) =>
      patchUserStory(id, data, version),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userstories'] });
      qc.invalidateQueries({ queryKey: ['userstory'] });
      qc.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

export function useDeleteUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUserStory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userstories'] });
      qc.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

export function useBulkUpdateBacklogOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkUpdateBacklogOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userstories'] });
    },
  });
}

export function useBulkUpdateSprintOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkUpdateSprintOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userstories'] });
      qc.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}
