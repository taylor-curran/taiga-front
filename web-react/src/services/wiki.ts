import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WikiPage } from '@/types/api';

export async function fetchWikiPages(projectId: number): Promise<WikiPage[]> {
  const res = await api.get<WikiPage[]>('wiki', { params: { project: projectId } });
  return res.data;
}

export async function fetchWikiPageBySlug(
  projectId: number,
  slug: string,
): Promise<WikiPage | null> {
  try {
    const res = await api.get<WikiPage>('wiki/by_slug', {
      params: { project: projectId, slug },
    });
    return res.data;
  } catch {
    return null;
  }
}

export function useWikiPages(projectId: number | undefined) {
  return useQuery({
    queryKey: ['wiki', 'pages', projectId],
    queryFn: () => fetchWikiPages(projectId as number),
    enabled: !!projectId,
  });
}

export function useWikiPageBySlug(
  projectId: number | undefined,
  slug: string | undefined,
) {
  return useQuery({
    queryKey: ['wiki', 'by_slug', projectId, slug],
    queryFn: () => fetchWikiPageBySlug(projectId as number, slug as string),
    enabled: !!projectId && !!slug,
  });
}
