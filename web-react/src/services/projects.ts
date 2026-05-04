import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type {
  DiscoverProject,
  Milestone,
  ProjectDetail,
  ProjectStats,
  ProjectSummary,
} from '@/types/api';

export async function fetchProjectsByMember(memberId: number): Promise<ProjectSummary[]> {
  const res = await api.get<ProjectSummary[]>('projects', {
    params: { member: memberId, order_by: 'memberships__user_order' },
  });
  return res.data;
}

export async function fetchProjectBySlug(slug: string): Promise<ProjectDetail> {
  const res = await api.get<ProjectDetail>(`projects/by_slug`, { params: { slug } });
  return res.data;
}

export async function fetchProject(id: number): Promise<ProjectDetail> {
  const res = await api.get<ProjectDetail>(`projects/${id}`);
  return res.data;
}

export async function fetchProjectStats(projectId: number): Promise<ProjectStats> {
  const res = await api.get<ProjectStats>(`projects/${projectId}/stats`);
  return res.data;
}

export type DiscoverOrderBy =
  | '-total_fans'
  | '-total_fans_last_week'
  | '-total_fans_last_month'
  | '-total_fans_last_year'
  | '-total_activity'
  | '-total_activity_last_week'
  | '-total_activity_last_month'
  | '-total_activity_last_year';

export interface DiscoverParams {
  order_by?: DiscoverOrderBy | string;
  page?: number;
  is_featured?: boolean;
  q?: string;
  is_looking_for_people?: boolean;
  is_backlog_activated?: boolean;
  is_kanban_activated?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  hasNext: boolean;
  total?: number;
}

export async function fetchDiscoverProjects(
  params: DiscoverParams = {},
): Promise<PaginatedResult<DiscoverProject>> {
  const res = await api.get<DiscoverProject[]>('projects', {
    params: { discover_mode: 'true', ...params },
    headers: { 'x-disable-pagination': '0' },
  });
  const hasNext = !!res.headers['x-pagination-next'];
  const total = res.headers['x-pagination-count']
    ? Number(res.headers['x-pagination-count'])
    : undefined;
  return { data: res.data, hasNext, total };
}

export async function searchProjects(
  q: string,
  params: Omit<DiscoverParams, 'q'> = {},
): Promise<PaginatedResult<DiscoverProject>> {
  return fetchDiscoverProjects({ ...params, q });
}

export async function fetchMilestones(projectId: number): Promise<Milestone[]> {
  const res = await api.get<Milestone[]>('milestones', { params: { project: projectId } });
  return res.data;
}

export async function fetchMilestoneBySlug(
  projectId: number,
  slug: string,
): Promise<Milestone | null> {
  const res = await api.get<Milestone[]>('milestones', {
    params: { project: projectId, slug },
  });
  return res.data?.[0] ?? null;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  creation_template?: number;
  is_private?: boolean;
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectDetail> {
  const res = await api.post<ProjectDetail>('projects', payload);
  return res.data;
}

export async function duplicateProject(
  projectId: number,
  payload: { name: string; description: string; is_private?: boolean },
): Promise<ProjectDetail> {
  const res = await api.post<ProjectDetail>(`projects/${projectId}/duplicate`, payload);
  return res.data;
}

export async function likeProject(projectId: number): Promise<void> {
  await api.post(`projects/${projectId}/fan`);
}

export async function unlikeProject(projectId: number): Promise<void> {
  await api.post(`projects/${projectId}/unfan`);
}

export async function watchProject(projectId: number): Promise<void> {
  await api.post(`projects/${projectId}/watch`);
}

export async function unwatchProject(projectId: number): Promise<void> {
  await api.post(`projects/${projectId}/unwatch`);
}

// --- React Query hooks ---

export function useMyProjects() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['projects', 'mine', userId],
    queryFn: () => fetchProjectsByMember(userId as number),
    enabled: !!userId,
  });
}

export function useProjectBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['project', 'by_slug', slug],
    queryFn: () => fetchProjectBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useProjectStats(projectId: number | undefined) {
  return useQuery({
    queryKey: ['project', 'stats', projectId],
    queryFn: () => fetchProjectStats(projectId as number),
    enabled: !!projectId,
  });
}

export function useDiscover(params?: DiscoverParams) {
  return useQuery({
    queryKey: ['discover', params],
    queryFn: () => fetchDiscoverProjects(params),
  });
}

export function useDiscoverSearch(q: string, params?: Omit<DiscoverParams, 'q'>) {
  return useQuery({
    queryKey: ['discover', 'search', q, params],
    queryFn: () => searchProjects(q, params),
    enabled: !!q,
  });
}

export function useMilestones(projectId: number | undefined) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => fetchMilestones(projectId as number),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, isLiked }: { projectId: number; isLiked: boolean }) =>
      isLiked ? unlikeProject(projectId) : likeProject(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discover'] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useToggleWatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, isWatched }: { projectId: number; isWatched: boolean }) =>
      isWatched ? unwatchProject(projectId) : watchProject(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discover'] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
}
