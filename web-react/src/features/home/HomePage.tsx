import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useProjects } from '../../api/hooks';
import { Loader } from '../../components/Loader';
import './home.scss';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects({ member: user?.id, order_by: 'user_order' });

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>{t('HOME.PAGE_TITLE')}</h1>
        <p className="home-welcome">{t('HOME.WELCOME', { name: user?.full_name_display || user?.username })}</p>
      </div>

      <section className="home-section">
        <h2>{t('HOME.MY_PROJECTS')}</h2>
        {isLoading ? (
          <Loader />
        ) : projects && projects.length > 0 ? (
          <div className="home-projects-grid">
            {projects.map(p => (
              <Link key={p.id} to={`/project/${p.slug}/`} className="project-card">
                {p.logo_small_url && <img src={p.logo_small_url} alt="" className="project-card-logo" />}
                <div className="project-card-info">
                  <h3 className="project-card-name">{p.name}</h3>
                  <p className="project-card-desc">{p.description}</p>
                </div>
                <div className="project-card-meta">
                  {p.is_backlog_activated && <span className="project-card-tag">Scrum</span>}
                  {p.is_kanban_activated && <span className="project-card-tag">Kanban</span>}
                  {p.is_private && <span className="project-card-tag project-card-private">Private</span>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="home-empty">
            <p>{t('HOME.NO_PROJECTS')}</p>
            <Link to="/project/new" className="btn btn-primary">{t('HOME.CREATE_PROJECT')}</Link>
          </div>
        )}
      </section>
    </div>
  );
}
