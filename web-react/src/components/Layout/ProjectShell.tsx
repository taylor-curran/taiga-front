import { NavLink, Outlet, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useProjectBySlug } from '@/services/projects';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { ProjectContext } from '@/hooks/useCurrentProject';

interface NavItem {
  label: string;
  to: string;
  enabled?: boolean;
  end?: boolean;
}

export function ProjectShell() {
  const { pslug } = useParams();
  const { data: project, isLoading, error } = useProjectBySlug(pslug);

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!project) return <ErrorBox message="Project not found" />;

  const nav: NavItem[] = [
    { label: 'Timeline', to: `/project/${pslug}/timeline`, enabled: true },
    { label: 'Epics', to: `/project/${pslug}/epics`, enabled: project.is_epics_activated ?? true },
    { label: 'Backlog', to: `/project/${pslug}/backlog`, enabled: project.is_backlog_activated ?? true },
    { label: 'Kanban', to: `/project/${pslug}/kanban`, enabled: project.is_kanban_activated ?? true },
    { label: 'Issues', to: `/project/${pslug}/issues`, enabled: project.is_issues_activated ?? true },
    { label: 'Wiki', to: `/project/${pslug}/wiki`, enabled: project.is_wiki_activated ?? true },
    { label: 'Team', to: `/project/${pslug}/team`, enabled: true },
    { label: 'Search', to: `/project/${pslug}/search`, enabled: true },
    { label: 'Admin', to: `/project/${pslug}/admin/project-profile/details`, enabled: !!(project.i_am_admin || project.is_admin) },
  ];

  return (
    <ProjectContext.Provider value={project}>
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="card p-4 sticky top-4">
            <div className="mb-4">
              <NavLink
                to={`/project/${pslug}/`}
                end
                className="block text-lg font-bold text-taiga-text hover:no-underline"
              >
                {project.name}
              </NavLink>
              {project.description && (
                <p className="text-xs text-taiga-grey-light mt-1 line-clamp-3">
                  {project.description}
                </p>
              )}
            </div>
            <nav className="space-y-1">
              {nav
                .filter((n) => n.enabled !== false)
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      clsx('nav-link', isActive && 'nav-link-active')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
            </nav>
          </div>
        </aside>
        <section className="col-span-12 md:col-span-9 lg:col-span-10">
          <Outlet />
        </section>
      </div>
    </ProjectContext.Provider>
  );
}
