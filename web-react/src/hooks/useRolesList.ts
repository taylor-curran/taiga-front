import { useCallback, useEffect, useState } from 'react';
import { apiGetJson } from '../api/fetchJson';

export type RoleRow = {
  id?: number;
  name: string;
  slug?: string;
  project?: number;
  permissions: string[];
  computable?: boolean;
  external_user?: boolean;
  order?: number;
};

export function useRolesList(project: { id: number; public_permissions?: string[]; is_private?: boolean } | null): {
  roles: RoleRow[];
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!project?.id) {
      setRoles([]);
      setLoading(false);
      return;
    }
    const projectId = project.id;
    const projectPublicPerms = project.public_permissions ?? [];
    const isPrivate = !!project.is_private;

    setLoading(true);
    setError(null);
    try {
      const apiRoles = await apiGetJson<RoleRow[]>('/roles', { project: projectId });
      const normalized = apiRoles.map((r) => ({ ...r, external_user: false }));
      const publicRole: RoleRow = {
        name: 'External user',
        permissions: [...projectPublicPerms],
        external_user: true,
      };
      const withPublic = [...normalized, publicRole];
      if (!isPrivate) {
        const viewPerms = ['view_epics', 'view_milestones', 'view_us', 'view_tasks', 'view_issues', 'view_wiki_pages', 'view_wiki_links'];
        const ext = withPublic.find((r) => r.external_user);
        if (ext) {
          for (const k of viewPerms) {
            if (!ext.permissions.includes(k)) ext.permissions.push(k);
          }
        }
      }
      setRoles(withPublic);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    void load();
  }, [load]);

  return { roles, loading, error, reload: load };
}
