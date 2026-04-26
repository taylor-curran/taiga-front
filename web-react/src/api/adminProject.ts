import { taigaGet } from './taigaClient';
import type { Paginated, TaigaMembership, TaigaProjectSlight, TaigaRole } from './types';

export async function getProjectBySlug(slug: string) {
  return taigaGet<TaigaProjectSlight>('/api/v1/projects/by_slug', { slug });
}

export async function listMembers(projectId: number, page = 1) {
  return taigaGet<Paginated<TaigaMembership>>('/api/v1/memberships', {
    project: projectId,
    page,
  });
}

export async function listRoles(projectId: number) {
  return taigaGet<TaigaRole[]>('/api/v1/roles', { project: projectId });
}
