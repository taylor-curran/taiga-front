import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SearchResultItem {
  id: number;
  ref: number;
  subject: string;
  status?: number;
  status_extra_info?: { name?: string; color?: string; is_closed?: boolean };
  assigned_to?: number | null;
  assigned_to_extra_info?: {
    full_name_display?: string;
    photo?: string | null;
    username?: string;
  };
  total_points?: number | null;
  milestone_name?: string | null;
  milestone_slug?: string | null;
}

export interface SearchWikiItem {
  id: number;
  slug: string;
}

export interface SearchResponse {
  count: number;
  userstories: SearchResultItem[];
  tasks: SearchResultItem[];
  issues: SearchResultItem[];
  epics: SearchResultItem[];
  wikipages: SearchWikiItem[];
}

export async function fetchSearch(
  projectId: number,
  text: string,
): Promise<SearchResponse> {
  const res = await api.get<SearchResponse>('search', {
    params: { project: projectId, text, get_all: false },
  });
  return res.data;
}

export function useSearch(projectId: number | undefined, text: string) {
  return useQuery({
    queryKey: ['project-search', projectId, text],
    queryFn: () => fetchSearch(projectId as number, text),
    enabled: !!projectId && text.length > 0,
  });
}
