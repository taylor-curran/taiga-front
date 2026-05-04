import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  DiscoverProject,
  Milestone,
  ProjectDetail,
  ProjectSummary,
} from '@/types/api';

export async function fetchMyProjects(): Promise<ProjectSummary[]> {
  const res = await api.get<ProjectSummary[]>('projects', {
    params: { member: 'me', order_by: 'memberships__user_order' },
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
  return useQuery({ queryKey: ['projects', 'mine'], queryFn: fetchMyProjects });
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
