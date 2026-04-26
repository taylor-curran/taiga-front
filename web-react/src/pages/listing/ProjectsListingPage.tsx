import { en } from '@/i18n/en';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getCurrentUser } from '@/api/user';
import { getProjectsSlightByMember, projectLogoUrl } from '@/api/homeDashboard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Link } from 'react-router';
import './listing.css';

export default function ProjectsListingPage() {
  const { data, error, loading } = useAsyncResource('projects-list', async () => {
    const user = await getCurrentUser();
    const projects = await getProjectsSlightByMember(user.id);
    return { user, projects };
  });

  if (loading) {
    return <LoadingScreen />;
  }
  if (error || !data) {
    return (
      <div className="tg-center">
        <p className="tg-listing-error" data-testid="projects-list-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="tg-center" data-testid="projects-listing">
      <header className="tg-page-title">
        <h1>{en.projects.myProjects}</h1>
        <span className="tg-btn-primary tg-btn-primary--disabled" aria-disabled title="Port pending — no write">
          {en.projects.actionCreate}
        </span>
      </header>
      <ul className="tg-project-list" data-testid="projects-list-ul">
        {data.projects.map((p) => (
          <li key={p.id} className="tg-list-item--project" data-testid="project-row">
            <div className="tg-proj-left">
              <img className="tg-proj-logo" src={projectLogoUrl(p)} alt="" />
              <div>
                <p className="tg-proj-title">
                  <Link to={`/project/${p.slug}/timeline`}>{p.name}</Link>
                  {p.is_private ? (
                    <svg className="tg-badge" viewBox="0 0 24 24" aria-label="private">
                      <path d="M12 2L3 6v5c0 5 4 8 9 11 5-3 9-6 9-11V6l-9-4z" fill="currentColor" />
                    </svg>
                  ) : null}
                  {p.i_am_owner ? (
                    <svg className="tg-badge" viewBox="0 0 24 24" aria-label="owner">
                      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.5L5.7 21l2.3-7-6-4.6h7.6L12 2z" fill="currentColor" />
                    </svg>
                  ) : null}
                </p>
                {p.description ? (
                  <p className="tg-proj-desc">
                    {p.description.length > 300 ? `${p.description.slice(0, 300)}…` : p.description}
                  </p>
                ) : null}
              </div>
            </div>
            <span className="tg-proj-aside" aria-hidden>
              ⠿
            </span>
          </li>
        ))}
      </ul>
      <aside className="tg-help-aside" data-testid="projects-help">
        {en.projects.help}
      </aside>
    </div>
  );
}
