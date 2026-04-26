import { useCallback, useEffect, useState } from 'react';
import { apiGetJson } from '../api/fetchJson';
import { buildWorkInProgress, type WorkInProgress } from '../domain/workInProgress';
import { useSessionStore } from '../stores/sessionStore';
import type { ProjectRow } from './useProjectsList';

export function useDashboard(): {
  wip: WorkInProgress | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const userId = useSessionStore((s) => s.user?.id);
  const [wip, setWip] = useState<WorkInProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setWip({ assignedTo: [], watching: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const projects = await apiGetJson<ProjectRow[]>('/projects', {
        member: userId,
        order_by: 'user_order',
        slight: true,
      });
      const uid = userId;
      const noPag = { 'x-disable-pagination': '1' };

      const [
        ae,
        we,
        aus,
        wus,
        at,
        wt,
        ai,
        wi,
      ] = await Promise.all([
        apiGetJson<Record<string, unknown>[]>('/epics', { status__is_closed: false, assigned_to: uid }, noPag),
        apiGetJson<Record<string, unknown>[]>('/epics', { status__is_closed: false, watchers: uid }, noPag),
        apiGetJson<Record<string, unknown>[]>('/userstories', {
          is_closed: false,
          assigned_users: uid,
          dashboard: true,
        }),
        apiGetJson<Record<string, unknown>[]>('/userstories', {
          is_closed: false,
          watchers: uid,
          dashboard: true,
        }),
        apiGetJson<Record<string, unknown>[]>('/tasks', { status__is_closed: false, assigned_to: uid }),
        apiGetJson<Record<string, unknown>[]>('/tasks', { status__is_closed: false, watchers: uid }),
        apiGetJson<Record<string, unknown>[]>('/issues', { status__is_closed: false, assigned_to: uid }),
        apiGetJson<Record<string, unknown>[]>('/issues', { status__is_closed: false, watchers: uid }),
      ]);

      const projMeta = projects.map((p) => ({ id: p.id, slug: p.slug, name: p.name }));
      const assigned = {
        epics: ae,
        userStories: aus,
        tasks: at,
        issues: ai,
      };
      const watching = {
        epics: we,
        userStories: wus,
        tasks: wt,
        issues: wi,
      };
      setWip(buildWorkInProgress(projMeta, assigned, watching));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      setWip(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { wip, loading, error, reload: load };
}
