import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type {
  DiscoverProject,
  Milestone,
  ProjectDetail,
  ProjectSummary,
} from '@/types/api';

// Taiga's `/projects` endpoint requires a numeric user id for the `member`
// filter — `member=me` returns HTTP 400. The legacy AngularJS app passes the
// authenticated user's `id` (see app/coffee/modules/resources/projects.coffee
// `service.listByMember`).
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

export async function fetchDiscover(
  kind: 'most-liked' | 'most-active' | 'featured' | 'discover-mode' = 'discover-mode',
  page = 1,
): Promise<DiscoverProject[]> {
  const res = await api.get<DiscoverProject[]>('projects', {
    params: { discover_mode: 'true', order_by: '-total_fans', page },
    headers: { 'x-disable-pagination': '0' },
  });
  void kind;
  return res.data;
}

export async function searchProjects(q: string): Promise<DiscoverProject[]> {
  const res = await api.get<DiscoverProject[]>('projects', {
    params: { discover_mode: 'true', q },
  });
  return res.data;
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

export function useDiscover() {
  return useQuery({ queryKey: ['discover'], queryFn: () => fetchDiscover() });
}

export function useMilestones(projectId: number | undefined) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => fetchMilestones(projectId as number),
    enabled: !!projectId,
  });
}
