import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useProjectBySlug } from '../../api/resources';
import { Loader } from '../../components/Loader';

const SECTIONS = [
  { group: 'Project profile', items: [
    { to: 'project-profile/details', label: 'Details' },
    { to: 'project-profile/default-values', label: 'Default values' },
    { to: 'project-profile/modules', label: 'Modules' },
    { to: 'project-profile/export', label: 'Export' },
    { to: 'project-profile/reports', label: 'Reports' },
  ]},
  { group: 'Project values', items: [
    { to: 'project-values/status', label: 'Statuses' },
    { to: 'project-values/points', label: 'Points' },
    { to: 'project-values/priorities', label: 'Priorities' },
    { to: 'project-values/severities', label: 'Severities' },
    { to: 'project-values/types', label: 'Types' },
    { to: 'project-values/custom-fields', label: 'Custom fields' },
    { to: 'project-values/tags', label: 'Tags' },
    { to: 'project-values/due-dates', label: 'Due dates' },
    { to: 'project-values/kanban-power-ups', label: 'Kanban power-ups' },
  ]},
  { group: 'Members', items: [
    { to: 'memberships', label: 'Memberships' },
    { to: 'roles', label: 'Roles & permissions' },
  ]},
  { group: 'Integrations', items: [
    { to: 'third-parties/webhooks', label: 'Webhooks' },
    { to: 'third-parties/github', label: 'GitHub' },
    { to: 'third-parties/gitlab', label: 'GitLab' },
    { to: 'third-parties/bitbucket', label: 'Bitbucket' },
    { to: 'third-parties/gogs', label: 'Gogs' },
  ]},
];

export default function AdminLayout() {
  const { pslug } = useParams();
  const { data: project, isLoading } = useProjectBySlug(pslug);
  if (isLoading) return <Loader />;
  if (!project) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]" data-testid="admin">
      <aside className="card p-3">
        {SECTIONS.map((g) => (
          <div key={g.group} className="mb-3">
            <h4 className="px-2 text-xs font-semibold uppercase text-slate-400">{g.group}</h4>
            <nav className="mt-1 flex flex-col">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={`/project/${pslug}/admin/${it.to}`}
                  className={({ isActive }) =>
                    `rounded px-3 py-2 text-sm ${isActive ? 'bg-taiga-100 text-taiga-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`
                  }
                >
                  {it.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </aside>
      <section><Outlet /></section>
    </div>
  );
}
