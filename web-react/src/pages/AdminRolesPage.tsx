import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { categoriesWithState } from '../domain/rolePermissionsOverview';
import type { AdminProject } from '../hooks/useProjectBySlug';
import { useRolesList, type RoleRow } from '../hooks/useRolesList';

const PUBLIC_VIEW_PERMISSIONS = [
  'view_epics',
  'view_milestones',
  'view_us',
  'view_tasks',
  'view_issues',
  'view_wiki_pages',
  'view_wiki_links',
];

function displayPermissions(role: RoleRow, project: AdminProject): string[] {
  const base = [...(role.permissions ?? [])];
  // Matches RolesController.loadRoles: for public projects, ensure view_* keys exist on the active role snapshot.
  if (!project.is_private && role.external_user) {
    for (const p of PUBLIC_VIEW_PERMISSIONS) {
      if (!base.includes(p)) base.push(p);
    }
  }
  return base;
}

function RolePermissionsReadOnly({ role, project }: { role: RoleRow; project: AdminProject }) {
  const perms = useMemo(() => displayPermissions(role, project), [role, project]);
  const cats = useMemo(
    () => categoriesWithState(perms, !!project.is_private, !!role.external_user),
    [perms, project.is_private, role.external_user],
  );

  return (
    <div className="category-config-list">
      {cats.map((cat) => (
        <div key={cat.name} className="category-config">
          <div className="resume">
            <div className="resume-title">{cat.name}</div>
            <div className="count">
              {cat.activeCount}/{cat.total}
            </div>
            <div className="summary-role">
              {cat.items.map((p) => (
                <div key={p.key} className={`role-summary-single${p.active ? ' active' : ''}`} title={p.label} />
              ))}
            </div>
          </div>
          <div className="category-items">
            <div className="items-container">
              {cat.items.map((p) => (
                <div key={p.key} className="category-item">
                  <span>{p.label}</span>
                  <div className="check-ro">
                    <input type="checkbox" checked={p.active} disabled={p.disabled} readOnly />
                    <span>{p.active ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminRolesPage() {
  const { project } = useOutletContext<{ project: AdminProject }>();
  const { roles, loading, error } = useRolesList(project);
  const [idx, setIdx] = useState(0);
  const role = roles[idx];
  const anyComputable = roles.some((r) => !r.external_user && r.computable);

  if (loading) return <p className="centered">Loading…</p>;
  if (error) return <p className="centered">{error}</p>;

  return (
    <section className="main admin-roles admin-common">
      <header className="header-with-actions">
        <h1>Permissions</h1>
        <p className="admin-subtitle">{project.name}</p>
      </header>

      <div className="admin-submenu" style={{ marginBottom: '1rem' }}>
        <label htmlFor="role-select" className="admin-subtitle">
          Role:{' '}
        </label>
        <select id="role-select" value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
          {roles.map((r, i) => (
            <option key={r.external_user ? 'ext' : r.id ?? i} value={i}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {role && (
        <>
          <div className="total">
            <span className="role-name">{role.name}</span>
            {!role.external_user && role.computable !== undefined && (
              <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--tg-gray)' }}>
                Computable: {role.computable ? 'Yes' : 'No'}
              </span>
            )}
          </div>

          {!anyComputable && <div className="any-computable-role">No role is marked as computable for story points.</div>}

          {role.external_user && (
            <div className="general-category external-user">External users inherit the permissions listed below for public projects.</div>
          )}

          {!role.external_user && <div className="general-category">Permissions for this role (read-only).</div>}

          {role && <RolePermissionsReadOnly role={role} project={project} />}
        </>
      )}
    </section>
  );
}
