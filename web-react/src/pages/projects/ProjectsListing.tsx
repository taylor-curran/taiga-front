import { Link } from 'react-router-dom';
import { useMyProjects } from '@/auth/queries';

export default function ProjectsListing() {
  const { data: projects, isPending, error } = useMyProjects();

  return (
    <main className="page" data-testid="projects-listing">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ flex: 1 }}>My projects</h1>
        <Link to="/project/new" className="btn">
          + Create project
        </Link>
      </div>

      {isPending && <p className="muted">Loading…</p>}
      {error && <div className="banner banner-error">Could not load projects.</div>}

      {projects && projects.length === 0 && (
        <div className="empty">You don't have any projects yet.</div>
      )}

      {projects && projects.length > 0 && (
        <ul className="list card" data-testid="projects-list">
          {projects.map((p) => (
            <li key={p.id} data-testid={`project-row-${p.slug}`} data-blocked={Boolean(p.blocked_code)}>
              <div style={{ flex: 1 }}>
                <Link to={`/project/${p.slug}/timeline`} className="subject-link" data-testid={`project-link-${p.slug}`}>
                  {p.name}
                </Link>
                {p.is_private && (
                  <span className="tag" style={{ marginLeft: '0.4rem' }} title="Private">
                    Private
                  </span>
                )}
                {p.i_am_owner && (
                  <span className="tag" style={{ marginLeft: '0.3rem' }} title="Owner">
                    Owner
                  </span>
                )}
                {p.blocked_code && (
                  <span className="tag" style={{ marginLeft: '0.3rem', background: '#fde7e7', color: '#a01e1e' }}>
                    Blocked
                  </span>
                )}
                {p.description && (
                  <div className="muted" style={{ marginTop: 4 }}>
                    {p.description.slice(0, 300)}
                    {p.description.length > 300 ? '…' : ''}
                  </div>
                )}
              </div>
              <div className="muted">{p.total_milestones} sprints</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
