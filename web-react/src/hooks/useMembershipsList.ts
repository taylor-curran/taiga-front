import { useCallback, useEffect, useState } from 'react';
import { apiGetJsonPaginated } from '../api/fetchJson';

export type MembershipRow = {
  id: number;
  project: number;
  user: number | null;
  user_email: string | null;
  username?: string | null;
  full_name_display?: string | null;
  photo?: string | null;
  role_name: string;
  is_owner: boolean;
  is_admin: boolean;
  is_user_active?: boolean;
};

export function useMembershipsList(projectId: number | undefined, page: number): {
  rows: MembershipRow[];
  pagination: { count: number; current: number; paginatedBy: number } | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [rows, setRows] = useState<MembershipRow[]>([]);
  const [pagination, setPagination] = useState<{ count: number; current: number; paginatedBy: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setRows([]);
      setPagination(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, pagination: p } = await apiGetJsonPaginated<MembershipRow[]>('/memberships', {
        project: projectId,
        page: page || 1,
      });
      const filtered = data.filter((m) => m.user == null || m.is_user_active !== false);
      setRows(filtered);
      setPagination(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load memberships');
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, pagination, loading, error, reload: load };
}
