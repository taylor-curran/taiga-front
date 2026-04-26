import { Outlet, NavLink, useParams, Link } from 'react-router-dom';
import { useProjectBySlug } from '@/projects/queries';

export function ProjectShell() {
  const { pslug } = useParams();
  const { data: project, isPending, error } = useProjectBySlug(pslug);

  if (isPending) {
    return (
      <main className="page" data-testid="project-loading">
        Loading project…
      </main>
    );
  }
  if (error || !project) {
    return (
      <main className="page">
        <div className="banner banner-error" data-testid="project-error">
          Could not load project.
        </div>
      </main>
    );
  }

  return (
    <main className="page project-shell" data-testid="project-shell">
      <aside className="project-sidebar" data-testid="project-sidebar">
        <header>
          <strong>
            <Link to={`/project/${project.slug}/timeline`}>{project.name}</Link>
          </strong>
          <span className="muted">{project.is_private ? 'Private' : 'Public'}</span>
        </header>
        <nav>
          <NavLink to={`/project/${project.slug}/timeline`} end>
            Timeline
          </NavLink>
          {project.is_epics_activated && (
            <NavLink to={`/project/${project.slug}/epics`}>Epics</NavLink>
          )}
          {project.is_backlog_activated && (
            <NavLink to={`/project/${project.slug}/backlog`}>Backlog</NavLink>
          )}
          {project.is_kanban_activated && (
            <NavLink to={`/project/${project.slug}/kanban`}>Kanban</NavLink>
          )}
          {project.is_issues_activated && (
            <NavLink to={`/project/${project.slug}/issues`}>Issues</NavLink>
          )}
          {project.is_wiki_activated && (
            <NavLink to={`/project/${project.slug}/wiki/home`}>Wiki</NavLink>
          )}
          <NavLink to={`/project/${project.slug}/team`}>Team</NavLink>
          <NavLink to={`/project/${project.slug}/admin/project-profile/details`}>Admin</NavLink>
        </nav>
      </aside>
      <section className="project-main" data-testid="project-main">
        <Outlet context={{ project }} />
      </section>
    </main>
  );
}
