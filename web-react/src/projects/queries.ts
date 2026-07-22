import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type {
  Epic,
  HistoryEntry,
  Issue,
  Membership,
  Milestone,
  ProjectDetail,
  ProjectListItem,
  Task,
  UserStory,
} from '@/api/types';

export function useProjectBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['project', 'by_slug', slug],
    enabled: Boolean(slug),
    queryFn: () => api.get<ProjectDetail>('projects/by_slug', { query: { slug: slug! } }),
  });
}

export function useProjectStats(projectId: number | undefined) {
  return useQuery({
    queryKey: ['project', 'stats', projectId],
    enabled: Boolean(projectId),
    queryFn: () => api.get<unknown>(`projects/${projectId}/stats`),
  });
}

export function useUserStories(projectId: number | undefined, params: Record<string, string | number | boolean | undefined | null> = {}) {
  return useQuery({
    queryKey: ['userstories', 'list', projectId, params],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<UserStory[]>('userstories', {
        query: { project: projectId!, ...params },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useTasks(projectId: number | undefined, params: Record<string, string | number | boolean | undefined | null> = {}) {
  return useQuery({
    queryKey: ['tasks', 'list', projectId, params],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<Task[]>('tasks', {
        query: { project: projectId!, ...params },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useIssues(projectId: number | undefined, params: Record<string, string | number | boolean | undefined | null> = {}) {
  return useQuery({
    queryKey: ['issues', 'list', projectId, params],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<Issue[]>('issues', {
        query: { project: projectId!, ...params },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useEpics(projectId: number | undefined) {
  return useQuery({
    queryKey: ['epics', 'list', projectId],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<Epic[]>('epics', {
        query: { project: projectId! },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useMilestones(projectId: number | undefined) {
  return useQuery({
    queryKey: ['milestones', 'list', projectId],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<Milestone[]>('milestones', {
        query: { project: projectId! },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useMemberships(projectId: number | undefined) {
  return useQuery({
    queryKey: ['memberships', 'list', projectId],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<Membership[]>('memberships', {
        query: { project: projectId! },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

export function useTimeline(projectId: number | undefined) {
  return useQuery({
    queryKey: ['timeline', 'project', projectId],
    enabled: Boolean(projectId),
    queryFn: () => api.get<unknown[]>(`timeline/project/${projectId}`),
  });
}

export interface ItemDetail {
  id: number;
  ref: number;
  subject: string;
  description: string;
  description_html?: string;
  status: number;
  status_extra_info: { name: string; color: string; is_closed: boolean };
  assigned_to: number | null;
  assigned_to_extra_info?: { full_name_display: string; photo: string | null; gravatar_id: string } | null;
  is_closed: boolean;
  total_comments: number;
  total_voters: number;
  total_watchers: number;
  is_voter: boolean;
  is_watcher: boolean;
  tags: Array<[string, string | null]> | null;
  project: number;
  project_extra_info: { name: string; slug: string; id: number };
  created_date: string;
  modified_date: string;
  version: number;
  owner: number;
  owner_extra_info?: { full_name_display: string; photo: string | null; gravatar_id: string } | null;
  watchers: number[];
}

const TYPE_PATH: Record<string, string> = {
  userstory: 'userstories',
  task: 'tasks',
  issue: 'issues',
  epic: 'epics',
};

const RESOLVE_PATH: Record<string, string> = {
  userstory: 'resolver?us=',
  task: 'resolver?task=',
  issue: 'resolver?issue=',
  epic: 'resolver?epic=',
};

export type ItemType = 'userstory' | 'task' | 'issue' | 'epic';

export function useItemDetail(type: ItemType, projectSlug: string | undefined, ref: string | undefined) {
  const enabled = Boolean(projectSlug && ref);
  return useQuery({
    queryKey: ['item', type, projectSlug, ref],
    enabled,
    queryFn: async () => {
      const refKey = type === 'userstory' ? 'us' : type;
      const resolved = await api.get<Record<string, number>>('resolver', {
        query: { project: projectSlug!, [refKey]: Number(ref) } as Record<string, string | number>,
      });
      const id = (resolved as Record<string, number>)[type] ?? (resolved as Record<string, number>)[refKey];
      if (!id) throw new Error('Item not found');
      const item = await api.get<ItemDetail>(`${TYPE_PATH[type]}/${id}`);
      return item;
    },
  });
}

export function useHistory(type: ItemType, itemId: number | undefined) {
  const path = type === 'userstory' ? 'userstory' : type;
  return useQuery({
    queryKey: ['history', type, itemId],
    enabled: Boolean(itemId),
    queryFn: () => api.get<HistoryEntry[]>(`history/${path}/${itemId}`),
  });
}

export function usePostComment(type: ItemType, itemId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { comment: string; version: number }) => {
      const res = await api.patch<ItemDetail>(`${TYPE_PATH[type]}/${itemId}`, {
        comment: vars.comment,
        version: vars.version,
      });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['history', type, itemId] });
      qc.invalidateQueries({ queryKey: ['item', type] });
    },
  });
}

export function useUpdateItem(type: ItemType, itemId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { patch: Record<string, unknown>; version: number }) => {
      const res = await api.patch<ItemDetail>(`${TYPE_PATH[type]}/${itemId}`, {
        ...vars.patch,
        version: vars.version,
      });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['item', type] });
      qc.invalidateQueries({ queryKey: ['history', type, itemId] });
    },
  });
}

export function useDiscoverFeatured() {
  return useQuery<ProjectListItem[]>({
    queryKey: ['projects', 'discover-featured'],
    queryFn: () =>
      api.get<ProjectListItem[]>('projects', {
        query: { is_featured: true, discover_mode: true },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

// Re-export for convenience
export const _UNUSED = RESOLVE_PATH;
