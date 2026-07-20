import { useCallback, useEffect, useState } from 'react';
import { apiGetJson } from '../api/fetchJson';

export type AdminProject = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  i_am_admin?: boolean;
  archived_code?: string | null;
  public_permissions?: string[];
  is_private?: boolean;
  max_memberships?: number | null;
  total_memberships?: number;
};

export function useProjectBySlug(slug: string | undefined): {
  project: AdminProject | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [project, setProject] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) {
      setProject(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const p = await apiGetJson<AdminProject>('/projects/by_slug', { slug });
      if (!p.i_am_admin) {
        setError('permission-denied');
        setProject(null);
        return;
      }
      setProject(p);
    } catch {
      setError('not-found');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  return { project, loading, error, reload: load };
}
