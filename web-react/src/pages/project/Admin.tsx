import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import type { ProjectDetail } from '@/api/types';
import { StatusPill } from '@/components/StatusPill';
import { useMemberships } from '@/projects/queries';

const SECTIONS: Array<{ to: string; label: string }> = [
  { to: 'project-profile/details', label: 'Project details' },
  { to: 'project-profile/default-values', label: 'Default values' },
  { to: 'project-profile/modules', label: 'Modules' },
  { to: 'project-profile/export', label: 'Export' },
  { to: 'project-profile/reports', label: 'Reports' },
  { to: 'project-values/status', label: 'US statuses' },
  { to: 'project-values/points', label: 'Points' },
  { to: 'project-values/priorities', label: 'Priorities' },
  { to: 'project-values/severities', label: 'Severities' },
  { to: 'project-values/types', label: 'Types' },
  { to: 'project-values/custom-fields', label: 'Custom fields' },
  { to: 'project-values/tags', label: 'Tags' },
  { to: 'project-values/due-dates', label: 'Due dates' },
  { to: 'project-values/kanban-power-ups', label: 'Kanban power-ups' },
  { to: 'memberships', label: 'Memberships' },
  { to: 'roles', label: 'Roles' },
  { to: 'third-parties/webhooks', label: 'Webhooks' },
  { to: 'third-parties/github', label: 'GitHub' },
  { to: 'third-parties/gitlab', label: 'GitLab' },
  { to: 'third-parties/bitbucket', label: 'Bitbucket' },
  { to: 'third-parties/gogs', label: 'Gogs' },
];

export function AdminShell() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();

  return (
    <div data-testid="admin-shell">
      <h1>Admin</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
        <aside className="card" style={{ padding: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            {SECTIONS.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                end
                style={({ isActive }) => ({
                  padding: '0.5rem 0.9rem',
                  background: isActive ? 'var(--bg)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-strong)' : '3px solid transparent',
                  color: 'var(--fg)',
                })}
              >
                {s.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section>
          <Outlet context={{ project }} />
        </section>
      </div>
    </div>
  );
}

export function AdminProjectDetails() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (
    <div data-testid="admin-details">
      <h2>Project details</h2>
      <table className="tg-table">
        <tbody>
          <tr><th>Name</th><td>{project.name}</td></tr>
          <tr><th>Slug</th><td>{project.slug}</td></tr>
          <tr><th>Description</th><td>{project.description}</td></tr>
          <tr><th>Private</th><td>{project.is_private ? 'Yes' : 'No'}</td></tr>
          <tr><th>Owner</th><td>{project.owner?.full_name_display}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function AdminDefaultValues() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (
    <div data-testid="admin-default-values">
      <h2>Default values</h2>
      <table className="tg-table">
        <tbody>
          <tr><th>Default US status</th><td>{project.us_statuses?.find((s) => s.id === project.default_us_status)?.name ?? '—'}</td></tr>
          <tr><th>Default task status</th><td>{project.task_statuses?.find((s) => s.id === project.default_task_status)?.name ?? '—'}</td></tr>
          <tr><th>Default issue status</th><td>{project.issue_statuses?.find((s) => s.id === project.default_issue_status)?.name ?? '—'}</td></tr>
          <tr><th>Default priority</th><td>{project.priorities?.find((s) => s.id === project.default_priority)?.name ?? '—'}</td></tr>
          <tr><th>Default severity</th><td>{project.severities?.find((s) => s.id === project.default_severity)?.name ?? '—'}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function AdminModules() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const flags = [
    { key: 'is_epics_activated', label: 'Epics' },
    { key: 'is_backlog_activated', label: 'Backlog' },
    { key: 'is_kanban_activated', label: 'Kanban' },
    { key: 'is_issues_activated', label: 'Issues' },
    { key: 'is_wiki_activated', label: 'Wiki' },
    { key: 'is_contact_activated', label: 'Contact' },
  ] as const;
  return (
    <div data-testid="admin-modules">
      <h2>Modules</h2>
      <table className="tg-table">
        <tbody>
          {flags.map((f) => (
            <tr key={f.key}>
              <th>{f.label}</th>
              <td>{(project as unknown as Record<string, boolean>)[f.key] ? 'Enabled' : 'Disabled'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusList({ statuses }: { statuses: ProjectDetail['us_statuses'] }) {
  if (!statuses?.length) return <div className="empty">No statuses.</div>;
  return (
    <table className="tg-table">
      <thead><tr><th>Order</th><th>Name</th><th>Color</th><th>Closed</th></tr></thead>
      <tbody>
        {statuses.map((s) => (
          <tr key={s.id}>
            <td>{s.order}</td>
            <td>{s.name}</td>
            <td><StatusPill name={s.name} color={s.color} /></td>
            <td>{s.is_closed ? 'Yes' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AdminUsStatus() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (<div data-testid="admin-status"><h2>User story statuses</h2><StatusList statuses={project.us_statuses} /></div>);
}
export function AdminPoints() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (
    <div data-testid="admin-points">
      <h2>Points</h2>
      <table className="tg-table">
        <thead><tr><th>Order</th><th>Name</th><th>Value</th></tr></thead>
        <tbody>{(project.points ?? []).map((p) => (
          <tr key={p.id}><td>{p.order}</td><td>{p.name}</td><td>{p.value ?? '?'}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
export function AdminPriorities() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (<div data-testid="admin-priorities"><h2>Priorities</h2><StatusList statuses={project.priorities} /></div>);
}
export function AdminSeverities() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (<div data-testid="admin-severities"><h2>Severities</h2><StatusList statuses={project.severities} /></div>);
}
export function AdminTypes() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (<div data-testid="admin-types"><h2>Issue types</h2><StatusList statuses={project.issue_types} /></div>);
}
export function AdminTags() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (
    <div data-testid="admin-tags">
      <h2>Tags</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {(project.tags_colors ?? []).map(([n, c]) => (
          <span key={n} className="tag" style={c ? { background: c, color: '#fff', borderColor: c } : undefined}>{n}</span>
        ))}
        {(!project.tags_colors || project.tags_colors.length === 0) && <p className="muted">No tags.</p>}
      </div>
    </div>
  );
}
export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div data-testid={`admin-placeholder-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h2>{title}</h2>
      <p className="muted">Read-only view of the project setting.</p>
    </div>
  );
}

export function AdminMemberships() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { data: ms } = useMemberships(project.id);
  return (
    <div data-testid="admin-memberships">
      <h2>Memberships</h2>
      <table className="tg-table">
        <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Admin</th></tr></thead>
        <tbody>{(ms ?? []).map((m) => (
          <tr key={m.id}>
            <td>{m.full_name}</td>
            <td>{m.user_email ?? ''}</td>
            <td>{m.role_name}</td>
            <td>{m.is_admin ? 'Yes' : 'No'}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function AdminRoles() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  return (
    <div data-testid="admin-roles">
      <h2>Roles</h2>
      <table className="tg-table">
        <thead><tr><th>Order</th><th>Name</th><th>Slug</th><th>Computable</th></tr></thead>
        <tbody>{(project.roles ?? []).map((r) => (
          <tr key={r.id}><td>{r.order}</td><td>{r.name}</td><td>{r.slug}</td><td>{r.computable ? 'Yes' : 'No'}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
