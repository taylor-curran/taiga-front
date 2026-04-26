import { en, permissionCategoryOrder } from '@/i18n/en';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getProjectBySlug, listRoles } from '@/api/adminProject';
import type { TaigaProjectSlight, TaigaRole } from '@/api/types';
import { LoadingScreen } from '@/components/LoadingScreen';
import './listing.css';

const publicPerms = new Set(['view_epics', 'view_milestones', 'view_us', 'view_tasks', 'view_issues', 'view_wiki_pages', 'view_wiki_links']);

function makeExternalUserRole(project: TaigaProjectSlight): TaigaRole {
  return {
    name: en.admin.roles.externalUser,
    permissions: [...(project.public_permissions ?? [])],
    external_user: true,
  } as TaigaRole;
}

export default function AdminRolesPage() {
  const { pslug } = useParams();
  const key = `roles-${pslug}`;

  const load = useCallback(async () => {
    if (!pslug) {
      throw new Error('Missing project slug');
    }
    const project = await getProjectBySlug(pslug);
    if (!project.i_am_admin) {
      throw new Error('You do not have permission to see this project.');
    }
    const fromApi = await listRoles(project.id);
    const ext = makeExternalUserRole(project);
    if (!project.is_private) {
      publicPerms.forEach((p) => {
        if (!ext.permissions.includes(p)) {
          (ext as TaigaRole).permissions.push(p);
        }
      });
    }
    return { project, fromApi, allRoles: [...fromApi.map((r) => ({ ...r, external_user: false } as TaigaRole)), ext] };
  }, [pslug]);

  const { data, error, loading } = useAsyncResource(key, load, [pslug]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [pslug, data?.project.id]);

  const anyComputable = useMemo(() => (data?.fromApi ?? []).some((r) => r.computable), [data?.fromApi]);

  if (loading) {
    return <LoadingScreen />;
  }
  if (error || !data) {
    return (
      <div className="tg-admin-section">
        <p className="tg-listing-error" data-testid="roles-error">
          {error}
        </p>
      </div>
    );
  }

  const role = data.allRoles[Math.min(idx, data.allRoles.length - 1)]!;
  const isExt = Boolean(role.external_user);

  return (
    <div className="tg-roles" data-testid="admin-roles">
      <aside className="tg-roles-tertiary" aria-label="Roles">
        <nav>
          <ul>
            {data.fromApi.map((r, i) => (
              <li key={r.id} className={i === idx ? 'is-active' : ''}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIdx(i);
                  }}
                >
                  {r.name}
                </a>
              </li>
            ))}
            <li className={idx === data.fromApi.length ? 'is-active' : ''}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIdx(data.fromApi.length);
                }}
              >
                {en.admin.roles.externalUser}
              </a>
            </li>
          </ul>
        </nav>
        <div className="tg-roles-tertiary__new">
          <span className="btn-small tg-btn-menu" title="Read-only port">
            {en.admin.submenuRoles.actionNewRole}
          </span>
        </div>
      </aside>
      <div className="tg-roles-main">
        <h1 data-testid="roles-page-title">{en.admin.menu.permissions}</h1>
        <p className="tg-role-name-display">{role.name}</p>

        {!anyComputable ? (
          <div
            className="tg-roles-banners--warn"
            data-testid="roles-warn"
            // eslint-disable-next-line @typescript-eslint/naming-convention
            dangerouslySetInnerHTML={{ __html: en.admin.roles.warningNoRole }}
          />
        ) : null}

        {isExt ? (
          <div
            className="tg-roles-banners--note"
            data-testid="external-note"
            // eslint-disable-next-line @typescript-eslint/naming-convention
            dangerouslySetInnerHTML={{ __html: en.admin.roles.noteExternal }}
          />
        ) : (
          <div className="tg-roles-banners">
            <p>{en.admin.roles.helpEstimation}</p>
            <div className="tg-roles-banners--est" data-testid="role-computable">
              <span>Estimation</span>
              <label className="tg-toggle-ghost" title="Read-only port">
                <input type="checkbox" checked={Boolean(role.computable)} readOnly tabIndex={-1} />
                <span>Yes / No</span>
              </label>
            </div>
          </div>
        )}

        <div data-testid="role-perm-matrix" className="tg-perm-matrix">
          {permissionCategoryOrder.map((cat) => {
            const activeCount = cat.keys.filter((k) => (role.permissions ?? []).includes(k)).length;
            return (
              <details key={cat.id} className="tg-cat" open>
                <summary className="tg-cat__head">
                  {cat.label}
                  <span className="tg-cat__count">
                    {activeCount}/{cat.keys.length}
                  </span>
                </summary>
                <div className="tg-cat__items">
                  {cat.keys.map((permKey) => {
                    const active = (role.permissions ?? []).includes(permKey);
                    const isPublicView = Boolean(isExt && !data.project.is_private && publicPerms.has(permKey) && permKey.startsWith('view_'));
                    return (
                      <div key={permKey} className="tg-cat__item" data-perm={permKey}>
                        <span>{en.permissionLabels[permKey] ?? permKey}</span>
                        <label
                          className="tg-cat__check"
                          title={isPublicView ? 'Not editable (public project external user)' : 'Read-only port'}
                        >
                          <input type="checkbox" checked={active} readOnly tabIndex={-1} disabled={isPublicView} />
                          {active ? 'Yes' : 'No'}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
