import { ReactNode } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useProjectBySlug } from '../api/resources';
import { Loader } from '../components/Loader';

export function ProjectShell({ children }: { children?: ReactNode }) {
  const { pslug } = useParams();
  const { data: project, isLoading } = useProjectBySlug(pslug);

  if (isLoading) return <Loader />;
  if (!project) {
    return (
      <div className="p-8 text-center text-slate-500">
        Project not found.
      </div>
    );
  }

  const sections: { to: string; label: string; show?: boolean }[] = [
    { to: `/project/${pslug}/timeline`, label: 'Timeline' },
    { to: `/project/${pslug}/epics`, label: 'Epics', show: !!project.is_epics_activated },
    { to: `/project/${pslug}/backlog`, label: 'Backlog', show: !!project.is_backlog_activated },
    { to: `/project/${pslug}/kanban`, label: 'Kanban', show: !!project.is_kanban_activated },
    { to: `/project/${pslug}/issues`, label: 'Issues', show: !!project.is_issues_activated },
    { to: `/project/${pslug}/wiki/home`, label: 'Wiki', show: !!project.is_wiki_activated },
    { to: `/project/${pslug}/team`, label: 'Team' },
    { to: `/project/${pslug}/search`, label: 'Search' },
    { to: `/project/${pslug}/admin/project-profile/details`, label: 'Admin', show: !!project.i_am_admin },
  ].filter((s) => s.show !== false);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]" data-testid="project-shell">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:block">
        <div className="border-b border-slate-200 px-4 py-3">
          <NavLink to={`/project/${pslug}/`} className="block text-base font-semibold text-taiga-800 hover:underline">
            {project.name}
          </NavLink>
          <div className="mt-1 text-xs text-slate-500">
            {project.is_private ? 'Private' : 'Public'} project
          </div>
        </div>
        <nav className="flex flex-col p-2 text-sm">
          {sections.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `rounded px-3 py-2 ${isActive ? 'bg-taiga-100 text-taiga-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`
              }
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6" data-testid="project-main">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
