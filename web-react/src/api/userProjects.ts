import type { TaigaConfig } from './types';
import { taigaFetch } from './client';
import type { ProjectSummary } from './types';

export async function fetchUserProjectsOrdered(config: TaigaConfig, userId: number): Promise<ProjectSummary[]> {
  const sp = new URLSearchParams({
    member: String(userId),
    order_by: 'user_order',
    slight: 'true',
  });
  const res = await taigaFetch(config, `projects?${sp.toString()}`, {
    headers: { 'x-disable-pagination': '1' },
  });
  if (!res.ok) throw new Error(`projects member: ${res.status}`);
  const data = (await res.json()) as ProjectSummary[];
  return Array.isArray(data) ? data : [];
}
