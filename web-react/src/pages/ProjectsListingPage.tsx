import { useProjectsList } from '../hooks/useProjectsList';

export function ProjectsListingPage() {
  const { projects, loading, error } = useProjectsList('all');

  if (loading) return <p className="centered">Loading…</p>;
  if (error) return <p className="centered">{error}</p>;

  return (
    <div className="project-list-wrapper centered">
      <div className="project-list-title">
        <h1>My projects</h1>
      </div>
      <section className="project-list-section">
        <div className="project-list">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {projects.map((project) => (
              <li
                key={project.id}
                className={`list-itemtype-project${project.blocked_code ? ' blocked-project' : ''}${project.archived_code ? ' archived-project' : ''}`}
              >
                <div className="list-itemtype-project-left">
                  <div className="list-itemtype-project-data-wrapper">
                    <div className="list-itemtype-project-data">
                      <div className="list-itemtype-data-title">
                        <a
                          className="project-title"
                          href={`/project/${project.slug}/${project.my_homepage ?? 'timeline'}`}
                          title={project.name}
                        >
                          {project.name}
                        </a>
                        {project.is_private && <span className="badge">Private</span>}
                        {project.i_am_owner && <span className="badge">Owner</span>}
                        {(project.blocked_code || project.archived_code) && <span className="badge">Blocked</span>}
                      </div>
                      <div className="list-itemtype-data-meta project-description">
                        {(project.description ?? '').slice(0, 300)}
                        {(project.description?.length ?? 0) > 300 ? '…' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <aside className="help-area">
          <p>Projects you belong to appear here. Drag order is not available in this read-only port.</p>
        </aside>
      </section>
    </div>
  );
}
