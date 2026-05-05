import { NavLink, Outlet, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useCurrentProject } from '@/hooks/useCurrentProject';

interface AdminNavSection {
  title: string;
  items: { label: string; to: string }[];
}

export function AdminLayout() {
  const { pslug } = useParams();
  const project = useCurrentProject();
  const base = `/project/${pslug}/admin`;

  const sections: AdminNavSection[] = [
    {
      title: 'Project Profile',
      items: [
        { label: 'Details', to: `${base}/project-profile/details` },
        { label: 'Default Values', to: `${base}/project-profile/default-values` },
        { label: 'Modules', to: `${base}/project-profile/modules` },
        { label: 'Export', to: `${base}/project-profile/export` },
        { label: 'Reports', to: `${base}/project-profile/reports` },
      ],
    },
    {
      title: 'Project Values',
      items: [
        { label: 'Status', to: `${base}/project-values/status` },
        { label: 'Points', to: `${base}/project-values/points` },
        { label: 'Priorities', to: `${base}/project-values/priorities` },
        { label: 'Severities', to: `${base}/project-values/severities` },
        { label: 'Types', to: `${base}/project-values/types` },
        { label: 'Custom Fields', to: `${base}/project-values/custom-fields` },
        { label: 'Tags', to: `${base}/project-values/tags` },
        { label: 'Due Dates', to: `${base}/project-values/due-dates` },
        { label: 'Kanban Power-Ups', to: `${base}/project-values/kanban-power-ups` },
      ],
    },
    {
      title: 'Members',
      items: [
        { label: 'Memberships', to: `${base}/memberships` },
        { label: 'Roles & Permissions', to: `${base}/roles` },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { label: 'Webhooks', to: `${base}/third-parties/webhooks` },
        { label: 'GitHub', to: `${base}/third-parties/github` },
        { label: 'GitLab', to: `${base}/third-parties/gitlab` },
        { label: 'Bitbucket', to: `${base}/third-parties/bitbucket` },
        { label: 'Gogs', to: `${base}/third-parties/gogs` },
      ],
    },
  ];

  if (!project.i_am_admin && !project.is_admin) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Permission Denied</h2>
        <p className="text-taiga-grey-light">You need admin access to manage this project.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-12 lg:col-span-3">
        <div className="card p-3 sticky top-4 space-y-4 text-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 className="font-bold text-base px-2">Settings</h2>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="px-2 text-xs uppercase tracking-wider text-taiga-grey-light font-semibold mb-1">
                {section.title}
              </h3>
              <nav className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        'block px-2 py-1 rounded text-sm transition-colors',
                        isActive
                          ? 'bg-taiga-green-dark/10 text-taiga-green-dark font-semibold'
                          : 'text-taiga-text hover:bg-taiga-bg',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      <section className="col-span-12 lg:col-span-9">
        <Outlet />
      </section>
    </div>
  );
}
