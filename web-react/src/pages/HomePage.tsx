import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useProjectsList } from '../hooks/useProjectsList';
import type { DutyLike } from '../domain/workInProgress';

function DutyRow({ duty }: { duty: DutyLike }) {
  return (
    <div className="duty-single">
      <a href={duty.url ?? '#'} className={duty.is_blocked ? 'blocked' : ''}>
        <div className="list-itemtype-ticket-data">
          <div className="list-itemtype-data-meta">
            <span className="ticket-project">{duty.project_extra?.name}</span>
            <span className="ticket-type">{duty._name}</span>
          </div>
          <div className="list-itemtype-data-title">
            <span className="ticket-id">#{duty.ref}</span>
            <span className="ticket-title">{duty.subject}</span>
          </div>
        </div>
      </a>
    </div>
  );
}

function DutySection({ title, duties }: { title: string; duties: DutyLike[] }) {
  return (
    <section className="working-on-container">
      <header>
        <h1 className="title-bar">{title}</h1>
      </header>
      {duties.length > 0 ? (
        <div className="working-on">
          <div className="visible-duties">
            {duties.map((d) => (
              <DutyRow key={`${d._name}-${d.id}`} duty={d} />
            ))}
          </div>
        </div>
      ) : (
        <div className="working-on-empty">
          <p>Nothing to show here.</p>
          <div>
            <div className="empty-ticket">
              <div className="avatar" />
              <div className="data">
                <div className="line" />
                <div className="line" />
              </div>
            </div>
            <div className="empty-ticket">
              <div className="avatar" />
              <div className="data">
                <div className="line" />
                <div className="line" />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function HomePage() {
  const { wip, loading, error } = useDashboard();
  const { projects: recents } = useProjectsList('recents');

  if (loading) return <p className="centered">Loading…</p>;
  if (error) return <p className="centered">{error}</p>;

  return (
    <div className="home-wrapper centered">
      <div className="duty-summary">
        <h1>Dashboard</h1>
        <div className="dashboard-container">
          <DutySection title="Working on" duties={wip?.assignedTo ?? []} />
          <DutySection title="Watching" duties={wip?.watching ?? []} />
        </div>
      </div>

      <aside className="project-list">
        {recents.length > 0 ? (
          <section className="home-project-list">
            {recents.map((p) => (
              <div key={p.id} className={`home-project${p.blocked_code ? ' blocked-project' : ''}`}>
                <div className="project-card-inner">
                  <div className="project-card-header">
                    <h3 className="project-card-name">
                      <a className="project-title" href={`/project/${p.slug}/${p.my_homepage ?? 'timeline'}`}>
                        {p.name}
                      </a>
                      {p.is_private && <span className="badge">Private</span>}
                      {p.i_am_owner && <span className="badge">Owner</span>}
                    </h3>
                  </div>
                  <p className="project-card-description">{(p.description ?? '').slice(0, 100)}{(p.description?.length ?? 0) > 100 ? '…' : ''}</p>
                </div>
              </div>
            ))}
            <Link className="btn-small variant-primary see-more-projects-btn" to="/projects">
              Manage projects
            </Link>
          </section>
        ) : (
          <section className="projects-empty">
            <p>You have no projects yet.</p>
          </section>
        )}
      </aside>
    </div>
  );
}
