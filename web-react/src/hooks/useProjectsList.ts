import { useCallback, useEffect, useState } from 'react';
import { apiGetJson } from '../api/fetchJson';
import { useSessionStore } from '../stores/sessionStore';

export type ProjectRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_private?: boolean;
  i_am_owner?: boolean;
  blocked_code?: string | null;
  archived_code?: string | null;
  is_looking_for_people?: boolean;
  looking_for_people_note?: string | null;
  total_fans?: number;
  total_watchers?: number;
  members?: unknown[];
  my_homepage?: string;
  logo_small_url?: string | null;
};

export function useProjectsList(mode: 'all' | 'recents'): { projects: ProjectRow[]; loading: boolean; error: string | null; reload: () => void } {
  const userId = useSessionStore((s) => s.user?.id);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await apiGetJson<ProjectRow[]>('/projects', {
        member: userId,
        order_by: 'user_order',
        slight: true,
      });
      const list = mode === 'recents' ? rows.slice(0, 4) : rows;
      setProjects(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [userId, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  return { projects, loading, error, reload: load };
}
