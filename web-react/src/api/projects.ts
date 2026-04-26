import type { TaigaConfig } from './types';
import { taigaFetch } from './client';
import type { ProjectSummary } from './types';

export type ListProjectsParams = Record<string, string | number | boolean | undefined>;

export async function listProjects(
  config: TaigaConfig,
  params: ListProjectsParams,
): Promise<{ projects: ProjectSummary[]; nextPage: boolean }> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  const path = qs ? `projects?${qs}` : 'projects';
  const res = await taigaFetch(config, path);
  if (!res.ok) throw new Error(`projects: ${res.status}`);
  const nextPage = !!res.headers.get('X-Pagination-Next');
  const data = (await res.json()) as ProjectSummary[];
  return { projects: Array.isArray(data) ? data : [], nextPage };
}

export async function fetchDiscoverStats(config: TaigaConfig): Promise<number> {
  const res = await taigaFetch(config, 'stats/discover');
  if (!res.ok) throw new Error(`stats/discover: ${res.status}`);
  const body = (await res.json()) as { projects?: { total?: number } };
  return body.projects?.total ?? 0;
}
